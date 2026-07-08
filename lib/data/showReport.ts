import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PostShowReportData, PostShowDateStats } from '@/types/show'

type RawAttendanceRow = {
  id: string
  status: 'showed' | 'no_show' | 'excused'
  hours_logged: number
  hours_confirmed: boolean
}

type RawClaimRow = {
  id: string
  volunteer_id: string | null
  volunteer_name: string
  status: 'claimed' | 'cancelled' | 'waitlisted'
  attendance: RawAttendanceRow[] | null
}

type RawRoleRow = {
  id: string
  role_name: string
  slots_available: number
  slot_claims: RawClaimRow[] | null
}

type RawDateRow = {
  id: string
  show_date: string
  show_time: string
  volunteer_roles: RawRoleRow[] | null
}

// Aggregates post-show reporting stats for a single show. CRITICAL: slot_claims
// status is NOT filtered in the PostgREST nested select below — deeply nested
// relation filters can silently misbehave. All claims are fetched and the
// 'claimed' filter is applied here in JS instead.
export async function getPostShowReportData(
  showId: string,
  supabase: SupabaseClient
): Promise<PostShowReportData> {
  const { data: dateRows } = await supabase
    .from('show_dates')
    .select(
      `
      id, show_date, show_time,
      volunteer_roles (
        id, role_name, slots_available,
        slot_claims (
          id, volunteer_id, volunteer_name, status,
          attendance ( id, status, hours_logged, hours_confirmed )
        )
      )
      `
    )
    .eq('show_id', showId)
    .order('show_date', { ascending: true })
    .order('show_time', { ascending: true })

  return aggregateReport((dateRows ?? []) as unknown as RawDateRow[])
}

function aggregateReport(dateRows: RawDateRow[]): PostShowReportData {
  const perDate: PostShowDateStats[] = []
  const uniqueVolunteerIds = new Set<string>()

  for (const date of dateRows) {
    const allClaims: RawClaimRow[] = (date.volunteer_roles ?? []).flatMap((r) => r.slot_claims ?? [])
    const claimedClaims = allClaims.filter((c) => c.status === 'claimed')

    for (const c of claimedClaims) {
      if (c.volunteer_id) uniqueVolunteerIds.add(c.volunteer_id)
    }

    const allAttendance: RawAttendanceRow[] = allClaims.flatMap((c) => c.attendance ?? [])

    const showedCount = allAttendance.filter((a) => a.status === 'showed').length
    const noShowCount = allAttendance.filter((a) => a.status === 'no_show').length
    const excusedCount = allAttendance.filter((a) => a.status === 'excused').length

    const claimsWithAttendance = claimedClaims.filter((c) => (c.attendance ?? []).length > 0).length
    const unmarkedCount = claimedClaims.length - claimsWithAttendance

    const totalHours = allAttendance
      .filter((a) => a.status === 'showed')
      .reduce((sum, a) => sum + Number(a.hours_logged), 0)

    const pendingHours = allAttendance.filter((a) => a.status === 'showed' && !a.hours_confirmed).length

    perDate.push({
      dateId: date.id,
      showDate: date.show_date,
      showTime: date.show_time,
      totalClaimed: claimedClaims.length,
      showedCount,
      noShowCount,
      excusedCount,
      unmarkedCount,
      totalHours: Math.round(totalHours * 100) / 100,
      pendingHours,
    })
  }

  const totalClaimedAppearances = perDate.reduce((sum, d) => sum + d.totalClaimed, 0)
  const totalShowedCount = perDate.reduce((sum, d) => sum + d.showedCount, 0)
  const totalNoShowCount = perDate.reduce((sum, d) => sum + d.noShowCount, 0)
  const totalExcusedCount = perDate.reduce((sum, d) => sum + d.excusedCount, 0)
  const totalUnmarkedCount = perDate.reduce((sum, d) => sum + d.unmarkedCount, 0)
  const totalHours = Math.round(perDate.reduce((sum, d) => sum + d.totalHours, 0) * 100) / 100
  const totalPendingHoursCount = perDate.reduce((sum, d) => sum + d.pendingHours, 0)

  const markedTotal = totalShowedCount + totalNoShowCount + totalExcusedCount
  const attendanceRate = markedTotal > 0 ? Math.round((totalShowedCount / markedTotal) * 1000) / 10 : null

  return {
    perDate,
    totalClaimedAppearances,
    uniqueVolunteerCount: uniqueVolunteerIds.size,
    totalShowedCount,
    totalNoShowCount,
    totalExcusedCount,
    totalUnmarkedCount,
    totalHours,
    totalPendingHoursCount,
    attendanceRate,
  }
}
