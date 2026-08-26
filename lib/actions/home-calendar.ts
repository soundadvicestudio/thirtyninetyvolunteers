'use server'

// PUBLIC ROUTE — getAdminClient() only, never getServerClient()

import { getAdminClient } from '@/lib/supabase/admin'
import { getOrgTimezone } from '@/lib/utils/org-timezone'
import { getPublicCalendarEvents, type PublicCalendarEvent } from '@/lib/data/publicCalendar'

export async function getHomeCalendarEvents(
  year: number,
  month: number
): Promise<PublicCalendarEvent[]> {
  const supabase = getAdminClient()
  const timezone = await getOrgTimezone(supabase)
  return getPublicCalendarEvents(supabase, year, month, timezone)
}
