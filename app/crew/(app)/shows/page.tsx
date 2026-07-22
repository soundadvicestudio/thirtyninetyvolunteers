import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import ShowList from '@/components/crew/shows/ShowList'
import type { Season, ShowWithStaffing, Location, ShowStatus } from '@/types/show'

type RawShowRow = {
  id: string
  name: string
  location_id: string
  location: Location | null
  status: ShowStatus
  season_id: string | null
  created_at: string
  updated_at: string
}

type RawDateRow = {
  show_id: string
  show_date: string
  volunteer_roles: { id: string; slots_available: number; slot_claims: { status: string }[] | null }[] | null
}

export default async function ShowsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()

  const [{ data: seasonRows }, { data: showRows }, { data: dateRows }, { data: locationRows }] = await Promise.all([
    supabase
      .from('seasons')
      .select('id, name, start_date, end_date, is_current')
      .order('created_at', { ascending: false }),
    supabase
      .from('shows')
      .select('id, name, location_id, location:locations(id, name, color), status, season_id, created_at, updated_at')
      .order('created_at', { ascending: false }),
    supabase.from('show_dates').select(
      `
      show_id, show_date,
      volunteer_roles ( id, slots_available, slot_claims ( status ) )
    `
    ),
    supabase.from('locations').select('id, name, color').eq('is_active', true).order('sort_order', { ascending: true }),
  ])

  const dateRangeByShow = new Map<string, { earliest: string; latest: string }>()
  const staffingByShow = new Map<string, { total: number; filled: number }>()

  for (const d of (dateRows ?? []) as unknown as RawDateRow[]) {
    const existingRange = dateRangeByShow.get(d.show_id)
    if (!existingRange) {
      dateRangeByShow.set(d.show_id, { earliest: d.show_date, latest: d.show_date })
    } else {
      if (d.show_date < existingRange.earliest) existingRange.earliest = d.show_date
      if (d.show_date > existingRange.latest) existingRange.latest = d.show_date
    }

    const roles = d.volunteer_roles ?? []
    const dateTotal = roles.reduce((sum, r) => sum + r.slots_available, 0)
    const dateFilled = roles.reduce(
      (sum, r) => sum + (r.slot_claims ?? []).filter((c) => c.status === 'claimed').length,
      0
    )
    const existingStaffing = staffingByShow.get(d.show_id) ?? { total: 0, filled: 0 }
    existingStaffing.total += dateTotal
    existingStaffing.filled += dateFilled
    staffingByShow.set(d.show_id, existingStaffing)
  }

  const shows: ShowWithStaffing[] = ((showRows ?? []) as unknown as RawShowRow[]).map((row) => {
    const staffing = staffingByShow.get(row.id) ?? { total: 0, filled: 0 }
    const range = dateRangeByShow.get(row.id)
    return {
      id: row.id,
      name: row.name,
      location_id: row.location_id,
      location: row.location,
      status: row.status,
      season_id: row.season_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      total_slots: staffing.total,
      filled_slots: staffing.filled,
      earliest_date: range?.earliest ?? null,
      latest_date: range?.latest ?? null,
    }
  })

  return (
    <ShowList
      seasons={(seasonRows ?? []) as Season[]}
      shows={shows}
      locations={locationRows ?? []}
      adminRole={admin.role}
    />
  )
}
