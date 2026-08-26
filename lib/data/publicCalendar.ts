import type { SupabaseClient } from '@supabase/supabase-js'
import { getMonthGridDays } from '@/lib/utils/calendar-availability'

export type PublicCalendarEvent = {
  id: string
  title: string
  start_time: string
  end_time: string
  show_id: string
  needsVolunteers: boolean
  location: { name: string; color: string } | null
}

type RawEventRow = {
  id: string
  title: string
  start_time: string
  end_time: string
  source_show_date_id: string | null
  location: { name: string; color: string } | null
}

export async function getPublicCalendarEvents(
  supabase: SupabaseClient,
  year: number,
  month: number,
  timezone: string
): Promise<PublicCalendarEvent[]> {
  // timezone is accepted for signature consistency with other lib/data/
  // functions that resolve org timezone (e.g. getUpcomingClaimsForVolunteer)
  // — this function's own date-range math is UTC-anchored and
  // timezone-agnostic via getMonthGridDays(), same as the original
  // app/calendar/page.tsx implementation this was extracted from.
  void timezone

  const monthStr = `${year}-${String(month).padStart(2, '0')}`
  const gridDays = getMonthGridDays(`${monthStr}-01`)
  const rangeStartStr = gridDays[0]
  const rangeEndStr = gridDays[gridDays.length - 1]

  const { data: eventRows } = await supabase
    .from('calendar_events')
    .select(
      `
      id, title, start_time, end_time, source_show_date_id,
      location:locations ( name, color )
      `
    )
    .eq('event_type', 'performance')
    .eq('status', 'approved')
    .gte('start_time', `${rangeStartStr}T00:00:00Z`)
    .lte('start_time', `${rangeEndStr}T23:59:59Z`)
    .order('start_time', { ascending: true })

  const events = (eventRows ?? []) as unknown as RawEventRow[]
  const showDateIds = events.map((e) => e.source_show_date_id).filter((id): id is string => !!id)

  // Resolve show_id per show_date_id (needed for the /shows/[id] link) via a
  // separate lookup rather than a PostgREST embed, keeping the FK path
  // explicit and avoiding embed-alias ambiguity.
  const showIdByShowDateId = new Map<string, string>()
  if (showDateIds.length > 0) {
    const { data: showDateRows } = await supabase
      .from('show_dates')
      .select('id, show_id')
      .in('id', showDateIds)
    for (const row of showDateRows ?? []) {
      showIdByShowDateId.set(row.id as string, row.show_id as string)
    }
  }

  // Needs-volunteers: any role on the show date with slots_available >
  // claimed count (status = 'claimed').
  const needsVolunteersShowDateIds = new Set<string>()
  if (showDateIds.length > 0) {
    const { data: roles } = await supabase
      .from('volunteer_roles')
      .select('id, show_date_id, slots_available, slot_claims!inner ( id, status )')
      .in('show_date_id', showDateIds)

    type RoleRow = {
      show_date_id: string
      slots_available: number
      slot_claims: { id: string; status: string }[]
    }
    for (const role of (roles ?? []) as unknown as RoleRow[]) {
      const claimedCount = role.slot_claims.filter((c) => c.status === 'claimed').length
      if (role.slots_available > claimedCount) {
        needsVolunteersShowDateIds.add(role.show_date_id)
      }
    }
  }

  const gridEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start_time: e.start_time,
    end_time: e.end_time,
    show_id: e.source_show_date_id ? (showIdByShowDateId.get(e.source_show_date_id) ?? null) : null,
    needsVolunteers: e.source_show_date_id ? needsVolunteersShowDateIds.has(e.source_show_date_id) : false,
    location: e.location,
  }))

  return gridEvents.filter((e): e is typeof e & { show_id: string } => e.show_id !== null)
}
