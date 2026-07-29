'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'
import { normalizePhone } from '@/lib/utils/phone'
import { getCallboardSession } from '@/lib/callboard/session'

const SESSION_COOKIE = 'callboard_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type LookupVolunteerResult = { success: true; volunteerId: string } | { notFound: true }

// Sequential email-then-phone maybeSingle() lookup — matches the pattern
// established in 30BN-2.4/5.2 (avoids a raw .or() filter string on
// freshly-submitted, unvalidated user input).
export async function lookupVolunteer(input: string): Promise<LookupVolunteerResult> {
  const trimmed = input.trim()
  if (!trimmed) return { notFound: true }

  const client = getAdminClient()

  let volunteer: { id: string } | null = null

  if (trimmed.includes('@')) {
    const normalizedEmail = trimmed.toLowerCase()
    const { data } = await client
      .from('volunteers')
      .select('id')
      .ilike('email', normalizedEmail)
      .eq('status', 'active')
      .maybeSingle()
    volunteer = data
  }

  if (!volunteer) {
    const digitsOnly = normalizePhone(trimmed)
    if (digitsOnly) {
      const { data } = await client
        .from('volunteers')
        .select('id')
        .ilike('phone', `%${digitsOnly}%`)
        .eq('status', 'active')
        .maybeSingle()
      volunteer = data
    }
  }

  if (!volunteer) {
    return { notFound: true }
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, volunteer.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return { success: true, volunteerId: volunteer.id }
}

export async function signOutCallboard(): Promise<{ success: true }> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return { success: true }
}

export async function updateCallboardPreference(
  preference: 'email' | 'phone' | 'either' | null
): Promise<{ error?: string }> {
  // Identity comes from the validated callboard_session cookie, never from
  // a client-supplied volunteer ID — same rule as lookupVolunteer() above.
  const session = await getCallboardSession()
  if (!session) return { error: 'Not logged in' }

  const client = getAdminClient()

  const { error } = await client
    .from('volunteers')
    .update({
      communication_preference: preference || null,
    })
    .eq('id', session.id)

  if (error) return { error: error.message }

  revalidatePath('/callboard')
  return {}
}
