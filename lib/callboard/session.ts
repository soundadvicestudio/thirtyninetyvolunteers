import 'server-only'
import { cookies } from 'next/headers'
import { getAdminClient } from '@/lib/supabase/admin'
import type { CallboardVolunteer } from '@/types/callboard'

const SESSION_COOKIE = 'callboard_session'

const VOLUNTEER_COLUMNS =
  'id, full_name, email, phone, pronouns, school, age_range, is_minor, guardian_name, guardian_phone, referral_source, referral_name, total_hours, update_token, status, requires_service_hours, created_at'

export async function getCallboardSession(): Promise<CallboardVolunteer | null> {
  const cookieStore = await cookies()
  const volunteerId = cookieStore.get(SESSION_COOKIE)?.value

  if (!volunteerId) return null

  const client = getAdminClient()
  const { data: volunteer } = await client
    .from('volunteers')
    .select(VOLUNTEER_COLUMNS)
    .eq('id', volunteerId)
    .eq('status', 'active')
    .maybeSingle()

  if (!volunteer) return null

  return volunteer as CallboardVolunteer
}
