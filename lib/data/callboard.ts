import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { formatCT, formatWallClockCT } from '@/lib/utils/date'

export type UpcomingClaim = {
  claimToken: string
  status: 'claimed' | 'waitlisted'
  waitlistPosition: number | null
  roleName: string
  showName: string
  showDate: string
  showTime: string | null
  locationName: string | null
}

type RawUpcomingClaimRow = {
  id: string
  claim_token: string
  status: 'claimed' | 'waitlisted'
  waitlist_position: number | null
  volunteer_role: {
    role_name: string
    show_date: {
      show_date: string
      show_time: string
      show: {
        name: string
        location: { name: string } | null
      } | null
    } | null
  } | null
}

type ResolvedRow = {
  claimToken: string
  status: 'claimed' | 'waitlisted'
  waitlistPosition: number | null
  roleName: string
  showName: string
  showDate: string
  showTime: string
  locationName: string | null
}

const UPCOMING_CLAIM_COLUMNS = `
  id, claim_token, status, waitlist_position,
  volunteer_role:volunteer_roles(
    role_name,
    show_date:show_dates(
      show_date, show_time,
      show:shows(name, location:locations(name))
    )
  )
`

// Follows the getCheckInDashboardData() pattern (lib/data/checkin.ts) —
// receives the Supabase client and resolved org timezone as parameters
// rather than constructing/fetching either internally. Volunteer identity
// match uses two parallel queries (volunteer_id, volunteer_email) merged
// and deduped in JS — same convention as getActiveClaims()/getCallHistory()
// in app/callboard/page.tsx, avoiding a raw .or() filter on user input.
export async function getUpcomingClaimsForVolunteer(
  supabase: SupabaseClient,
  volunteerId: string | null,
  volunteerEmail: string,
  timezone: string
): Promise<UpcomingClaim[]> {
  const todayCT = formatCT(new Date(), 'yyyy-MM-dd', timezone)

  const [{ data: byId }, { data: byEmail }] = await Promise.all([
    volunteerId
      ? supabase
          .from('slot_claims')
          .select(UPCOMING_CLAIM_COLUMNS)
          .eq('volunteer_id', volunteerId)
          .in('status', ['claimed', 'waitlisted'])
      : Promise.resolve({ data: [] as unknown[] }),
    supabase
      .from('slot_claims')
      .select(UPCOMING_CLAIM_COLUMNS)
      .ilike('volunteer_email', volunteerEmail)
      .in('status', ['claimed', 'waitlisted']),
  ])

  const rows = [...(byId ?? []), ...(byEmail ?? [])] as unknown as RawUpcomingClaimRow[]

  const seen = new Set<string>()
  const resolved: ResolvedRow[] = []

  for (const row of rows) {
    const showDateRow = row.volunteer_role?.show_date
    if (seen.has(row.id) || !row.volunteer_role || !showDateRow) continue
    // Bare date-string comparison — same semantics as the .gte('show_date', todayCT)
    // pattern established in lib/data/checkin.ts / QuickStats.tsx.
    if (showDateRow.show_date < todayCT) continue
    seen.add(row.id)

    resolved.push({
      claimToken: row.claim_token,
      status: row.status,
      waitlistPosition: row.waitlist_position,
      roleName: row.volunteer_role.role_name,
      showName: showDateRow.show?.name ?? 'Unknown Show',
      showDate: showDateRow.show_date,
      showTime: showDateRow.show_time,
      locationName: showDateRow.show?.location?.name ?? null,
    })
  }

  resolved.sort((a, b) =>
    a.showDate === b.showDate ? a.showTime.localeCompare(b.showTime) : a.showDate.localeCompare(b.showDate)
  )

  return resolved.map((r) => ({
    claimToken: r.claimToken,
    status: r.status,
    waitlistPosition: r.waitlistPosition,
    roleName: r.roleName,
    showName: r.showName,
    showDate: formatWallClockCT(r.showDate, r.showTime, 'MMM d, yyyy', timezone),
    showTime: formatWallClockCT(r.showDate, r.showTime, 'h:mm a', timezone),
    locationName: r.locationName,
  }))
}
