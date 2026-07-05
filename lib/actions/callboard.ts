'use server'

import { cookies } from 'next/headers'
import { getAdminClient } from '@/lib/supabase/admin'

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
    const digitsOnly = trimmed.replace(/\D/g, '')
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
