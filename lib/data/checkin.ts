import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { formatCT } from '@/lib/utils/date'
import { getCheckInRosterForDate } from '@/lib/actions/checkin-admin'
import type { CheckInDashboardData, CheckInShowSummary } from '@/types/checkin'

type RawTopDateRow = {
  id: string
  show_id: string
  show_date: string
  show_time: string
  end_time: string | null
  shows: { id: string; name: string; location_id: string; location: { name: string } | null } | null
}

type RawUpcomingDateRow = {
  id: string
  show_date: string
  show_time: string
  end_time: string | null
}

type RawOtherDateRow = {
  id: string
  show_id: string
  show_date: string
  show_time: string
  shows: { id: string; name: string; location: { name: string } | null } | null
}

// Follows the getPostShowReportData() pattern (lib/data/showReport.ts) —
// receives the Supabase client as a parameter rather than constructing its
// own; the caller (app/crew/(app)/tools/checkin/page.tsx) already has an
// authenticated-session client from getServerClient(). timezone is resolved
// once by the caller via getOrgTimezone() and passed in here.
export async function getCheckInDashboardData(
  supabase: SupabaseClient,
  timezone: string
): Promise<CheckInDashboardData> {
  const todayCT = formatCT(new Date(), 'yyyy-MM-dd', timezone)

  const { data: nearestDateRow } = await supabase
    .from('show_dates')
    .select(
      `
      id, show_id, show_date, show_time, end_time,
      shows ( id, name, location_id, location:locations ( name ) )
      `
    )
    .gte('show_date', todayCT)
    .order('show_date', { ascending: true })
    .order('show_time', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!nearestDateRow) {
    return { noUpcomingShows: true }
  }

  const topRow = nearestDateRow as unknown as RawTopDateRow
  const topShowId = topRow.show_id

  const { data: upcomingDateRows } = await supabase
    .from('show_dates')
    .select('id, show_date, show_time, end_time')
    .eq('show_id', topShowId)
    .gte('show_date', todayCT)
    .order('show_date', { ascending: true })
    .order('show_time', { ascending: true })

  const upcomingDates = ((upcomingDateRows ?? []) as unknown as RawUpcomingDateRow[]).map((d) => ({
    id: d.id,
    show_date: d.show_date,
    show_time: d.show_time,
    end_time: d.end_time,
  }))
  const selectedDateId = upcomingDates[0]?.id ?? topRow.id

  const roster = await getCheckInRosterForDate(selectedDateId)

  const { data: otherDateRows } = await supabase
    .from('show_dates')
    .select(
      `
      id, show_id, show_date, show_time,
      shows ( id, name, location:locations ( name ) )
      `
    )
    .gte('show_date', todayCT)
    .neq('show_id', topShowId)
    .order('show_date', { ascending: true })
    .order('show_time', { ascending: true })

  // Group by show_id in JS, keeping only the earliest date per show (rows
  // arrive pre-sorted by show_date/show_time) — avoids a GROUP BY query.
  const nearestByShow = new Map<
    string,
    { dateId: string; showDate: string; showTime: string; showName: string; locationName: string }
  >()
  for (const row of (otherDateRows ?? []) as unknown as RawOtherDateRow[]) {
    if (!nearestByShow.has(row.show_id)) {
      nearestByShow.set(row.show_id, {
        dateId: row.id,
        showDate: row.show_date,
        showTime: row.show_time,
        showName: row.shows?.name ?? 'Untitled Show',
        locationName: row.shows?.location?.name ?? 'Unknown Location',
      })
    }
  }

  // Typical theater show volumes (5-10 upcoming) — individual count queries
  // per show, parallelized, are acceptable rather than a batched aggregate.
  const otherShows: CheckInShowSummary[] = await Promise.all(
    Array.from(nearestByShow.entries()).map(async ([showId, info]) => {
      const [{ count: claimedCount }, { count: showedCount }] = await Promise.all([
        supabase
          .from('slot_claims')
          .select('id', { count: 'exact', head: true })
          .eq('show_date_id', info.dateId)
          .eq('status', 'claimed'),
        // A single status='showed' count on attendance already covers both
        // claimed-and-checked-in and walk-in rows (walk-ins are attendance
        // rows with slot_claim_id = null) — matches getCheckInRosterForDate()'s
        // checkedInCount semantics without a second query.
        supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('show_date_id', info.dateId)
          .eq('status', 'showed'),
      ])

      return {
        showId,
        showName: info.showName,
        locationName: info.locationName,
        nearestDateId: info.dateId,
        nearestDate: info.showDate,
        nearestTime: info.showTime,
        checkedInCount: showedCount ?? 0,
        totalRostered: claimedCount ?? 0,
      }
    })
  )

  return {
    noUpcomingShows: false,
    topShow: {
      showId: topShowId,
      showName: topRow.shows?.name ?? 'Untitled Show',
      locationName: topRow.shows?.location?.name ?? 'Unknown Location',
      upcomingDates,
      selectedDateId,
      roster,
    },
    otherShows,
  }
}
