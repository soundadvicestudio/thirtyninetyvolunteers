import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import ShowList from '@/components/crew/shows/ShowList'
import type { Season, ShowWithStaffing, ShowType, ShowStatus } from '@/types/show'

type RawShowRow = {
  id: string
  name: string
  show_type: ShowType
  status: ShowStatus
  season_id: string | null
  created_at: string
  updated_at: string
  volunteer_roles:
    | { id: string; slots_available: number; slot_claims: { status: string }[] | null }[]
    | null
}

export default async function ShowsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()

  const [{ data: seasonRows }, { data: showRows }, { data: dateRows }] = await Promise.all([
    supabase
      .from('seasons')
      .select('id, name, start_date, end_date, is_current')
      .order('created_at', { ascending: false }),
    supabase
      .from('shows')
      .select(
        `
        id, name, show_type, status, season_id, created_at, updated_at,
        volunteer_roles (
          id,
          slots_available,
          slot_claims ( status )
        )
      `
      )
      .order('created_at', { ascending: false }),
    supabase.from('show_dates').select('show_id, show_date'),
  ])

  const dateRangeByShow = new Map<string, { earliest: string; latest: string }>()
  for (const d of dateRows ?? []) {
    const existing = dateRangeByShow.get(d.show_id)
    if (!existing) {
      dateRangeByShow.set(d.show_id, { earliest: d.show_date, latest: d.show_date })
    } else {
      if (d.show_date < existing.earliest) existing.earliest = d.show_date
      if (d.show_date > existing.latest) existing.latest = d.show_date
    }
  }

  const shows: ShowWithStaffing[] = ((showRows ?? []) as unknown as RawShowRow[]).map((row) => {
    const roles = row.volunteer_roles ?? []
    const total_slots = roles.reduce((sum, r) => sum + r.slots_available, 0)
    const filled_slots = roles.reduce(
      (sum, r) => sum + (r.slot_claims ?? []).filter((c) => c.status === 'claimed').length,
      0
    )
    const range = dateRangeByShow.get(row.id)
    return {
      id: row.id,
      name: row.name,
      show_type: row.show_type,
      status: row.status,
      season_id: row.season_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      total_slots,
      filled_slots,
      earliest_date: range?.earliest ?? null,
      latest_date: range?.latest ?? null,
    }
  })

  return <ShowList seasons={(seasonRows ?? []) as Season[]} shows={shows} adminRole={admin.role} />
}
