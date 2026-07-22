import 'server-only'
import { getAdminClient } from '@/lib/supabase/admin'
import type { PublicShow, PublicShowDate, PublicShowRole } from '@/types/show-public'
import type { Location, ShowStatus } from '@/types/show'

type RawShowRow = {
  id: string
  name: string
  location_id: string
  location: Location | null
  status: ShowStatus
  description: string | null
  volunteer_instructions: string | null
}

type RawDateRow = {
  id: string
  show_id: string
  show_date: string
  show_time: string
  volunteer_roles:
    | {
        id: string
        category_id: string | null
        role_name: string
        slots_available: number
      }[]
    | null
}

type RawClaimRow = {
  volunteer_role_id: string
  status: string
}

// Shared by getPublicShows() and getPublicShow() — fetches dates/roles/claims
// as separate queries (not one deep nested PostgREST select) so date
// ordering and claimed-slot counting stay reliable. Same pattern used by
// the admin show detail page (30BN-4.3).
async function attachDatesAndRoles(showRows: RawShowRow[]): Promise<PublicShow[]> {
  if (showRows.length === 0) return []

  const client = getAdminClient()
  const showIds = showRows.map((s) => s.id)

  const { data: dateRows } = await client
    .from('show_dates')
    .select(
      `
      id, show_id, show_date, show_time,
      volunteer_roles ( id, category_id, role_name, slots_available )
      `
    )
    .in('show_id', showIds)
    .order('show_date', { ascending: true })
    .order('show_time', { ascending: true })

  const dates = (dateRows ?? []) as unknown as RawDateRow[]
  const roleIds = dates.flatMap((d) => (d.volunteer_roles ?? []).map((r) => r.id))

  const { data: claimRows } =
    roleIds.length > 0
      ? await client.from('slot_claims').select('volunteer_role_id, status').in('volunteer_role_id', roleIds)
      : { data: [] as RawClaimRow[] }

  // CRITICAL: only status = 'claimed' occupies a slot. Waitlisted and
  // cancelled claims never count toward claimed_count.
  const claimedCountByRole = new Map<string, number>()
  for (const claim of (claimRows ?? []) as RawClaimRow[]) {
    if (claim.status === 'claimed') {
      claimedCountByRole.set(claim.volunteer_role_id, (claimedCountByRole.get(claim.volunteer_role_id) ?? 0) + 1)
    }
  }

  const datesByShow = new Map<string, PublicShowDate[]>()
  for (const d of dates) {
    const roles: PublicShowRole[] = (d.volunteer_roles ?? []).map((r) => {
      const claimedCount = claimedCountByRole.get(r.id) ?? 0
      return {
        id: r.id,
        category_id: r.category_id,
        role_name: r.role_name,
        slots_available: r.slots_available,
        claimed_count: claimedCount,
        is_full: claimedCount >= r.slots_available,
      }
    })

    const publicDate: PublicShowDate = {
      id: d.id,
      show_id: d.show_id,
      show_date: d.show_date,
      show_time: d.show_time,
      roles,
    }

    const list = datesByShow.get(d.show_id) ?? []
    list.push(publicDate)
    datesByShow.set(d.show_id, list)
  }

  return showRows.map((s) => ({
    id: s.id,
    name: s.name,
    location_id: s.location_id,
    location: s.location,
    status: s.status,
    description: s.description,
    volunteer_instructions: s.volunteer_instructions,
    dates: datesByShow.get(s.id) ?? [],
  }))
}

function hasOpenSlot(show: PublicShow): boolean {
  return show.dates.some((d) => d.roles.some((r) => !r.is_full))
}

const SHOW_COLUMNS = 'id, name, location_id, location:locations(id, name, color), status, description, volunteer_instructions'

export async function getPublicShows(): Promise<PublicShow[]> {
  const client = getAdminClient()

  const { data: showRows } = await client
    .from('shows')
    .select(SHOW_COLUMNS)
    .eq('status', 'live')
    .order('created_at', { ascending: true })

  const shows = await attachDatesAndRoles((showRows ?? []) as unknown as RawShowRow[])

  // Shows where every role across every date is full are excluded entirely.
  return shows.filter(hasOpenSlot)
}

export async function getPublicShow(id: string): Promise<PublicShow | null> {
  const client = getAdminClient()

  const { data: showRow } = await client.from('shows').select(SHOW_COLUMNS).eq('id', id).maybeSingle()

  if (!showRow || (showRow as unknown as RawShowRow).status !== 'live') {
    return null
  }

  const shows = await attachDatesAndRoles([showRow as unknown as RawShowRow])
  return shows[0] ?? null
}
