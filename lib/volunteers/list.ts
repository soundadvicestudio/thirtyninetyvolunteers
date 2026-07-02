import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { VolunteerListRow } from '@/types/volunteer'
import type { VolunteersUrlState } from './url'

export const PAGE_SIZE = 25

const DB_SORTABLE: Partial<Record<VolunteersUrlState['sort'], string>> = {
  name: 'full_name',
  joined: 'created_at',
  hours: 'total_hours',
}

const LIST_SELECT = `
  id, full_name, email, phone, pronouns, age_range, school, is_minor,
  guardian_name, guardian_phone, referral_source, status, total_hours, created_at,
  volunteer_category_assignments ( volunteer_categories ( id, name ) )
`

type RawVolunteerRow = {
  id: string
  full_name: string
  email: string
  phone: string
  pronouns: string | null
  age_range: string | null
  school: string | null
  is_minor: boolean
  guardian_name: string | null
  guardian_phone: string | null
  referral_source: string | null
  status: string
  total_hours: number
  created_at: string
  volunteer_category_assignments:
    | { volunteer_categories: { id: string; name: string } | null }[]
    | null
}

function mapCategories(row: RawVolunteerRow) {
  return (row.volunteer_category_assignments ?? [])
    .map((a) => a.volunteer_categories)
    .filter((c): c is { id: string; name: string } => !!c)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyBaseFilters(query: any, filters: VolunteersUrlState) {
  let q = query
  if (filters.q) {
    const term = filters.q.replace(/[%,()]/g, ' ').trim()
    if (term) {
      q = q.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
    }
  }
  if (filters.status !== 'all') {
    q = q.eq('status', filters.status)
  }
  if (filters.ageRange) {
    q = q.eq('age_range', filters.ageRange)
  }
  if (filters.school === 'yes') {
    q = q.not('school', 'is', null)
  } else if (filters.school === 'no') {
    q = q.is('school', null)
  }
  if (filters.isMinor === 'yes') {
    q = q.eq('is_minor', true)
  } else if (filters.isMinor === 'no') {
    q = q.eq('is_minor', false)
  }
  return q
}

async function resolveCategoryVolunteerIds(
  supabase: SupabaseClient,
  categoryIds: string[]
): Promise<string[] | null> {
  if (categoryIds.length === 0) return null
  const { data } = await supabase
    .from('volunteer_category_assignments')
    .select('volunteer_id')
    .in('category_id', categoryIds)
  return Array.from(new Set((data ?? []).map((r) => r.volunteer_id as string)))
}

async function attachCallsAndLastCall(
  supabase: SupabaseClient,
  volunteerIds: string[]
): Promise<Map<string, { calls: number; lastCall: string | null }>> {
  const result = new Map<string, { calls: number; lastCall: string | null }>()
  if (volunteerIds.length === 0) return result

  const { data } = await supabase
    .from('slot_claims')
    .select('volunteer_id, show_dates ( show_date )')
    .eq('status', 'claimed')
    .in('volunteer_id', volunteerIds)

  for (const row of (data ?? []) as unknown as {
    volunteer_id: string | null
    show_dates: { show_date: string } | null
  }[]) {
    const vid = row.volunteer_id
    if (!vid) continue
    const showDate = row.show_dates?.show_date ?? null
    const existing = result.get(vid) ?? { calls: 0, lastCall: null }
    existing.calls += 1
    if (showDate && (!existing.lastCall || showDate > existing.lastCall)) {
      existing.lastCall = showDate
    }
    result.set(vid, existing)
  }

  return result
}

function toListRow(
  row: RawVolunteerRow,
  extra: Map<string, { calls: number; lastCall: string | null }>
): VolunteerListRow {
  const e = extra.get(row.id)
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    pronouns: row.pronouns,
    age_range: row.age_range,
    school: row.school,
    is_minor: row.is_minor,
    guardian_name: row.guardian_name,
    guardian_phone: row.guardian_phone,
    referral_source: row.referral_source,
    status: row.status as 'active' | 'archived',
    total_hours: Number(row.total_hours),
    created_at: row.created_at,
    categories: mapCategories(row),
    calls: e?.calls ?? 0,
    last_call: e?.lastCall ?? null,
  }
}

export async function getVolunteersList(
  supabase: SupabaseClient,
  filters: VolunteersUrlState,
  opts: { fetchAll?: boolean } = {}
): Promise<{ volunteers: VolunteerListRow[]; total: number }> {
  const fetchAll = opts.fetchAll ?? false
  const categoryVolunteerIds = await resolveCategoryVolunteerIds(supabase, filters.categoryIds)

  if (categoryVolunteerIds !== null && categoryVolunteerIds.length === 0) {
    return { volunteers: [], total: 0 }
  }

  let countQuery = applyBaseFilters(
    supabase.from('volunteers').select('id', { count: 'exact', head: true }),
    filters
  )
  if (categoryVolunteerIds) countQuery = countQuery.in('id', categoryVolunteerIds)
  const { count } = await countQuery
  const total = count ?? 0

  const dbSortColumn = DB_SORTABLE[filters.sort]

  if (dbSortColumn) {
    let dataQuery = applyBaseFilters(supabase.from('volunteers').select(LIST_SELECT), filters)
    if (categoryVolunteerIds) dataQuery = dataQuery.in('id', categoryVolunteerIds)

    dataQuery = dataQuery.order(dbSortColumn, { ascending: filters.dir === 'asc' })
    if (!fetchAll) {
      const offset = (filters.page - 1) * PAGE_SIZE
      dataQuery = dataQuery.range(offset, offset + PAGE_SIZE - 1)
    }

    const { data } = await dataQuery
    const rows = (data ?? []) as unknown as RawVolunteerRow[]
    const extra = await attachCallsAndLastCall(
      supabase,
      rows.map((r) => r.id)
    )

    return { volunteers: rows.map((r) => toListRow(r, extra)), total }
  }

  // sort === 'last_call' | 'calls' — not a DB column, so fetch all matches,
  // compute in JS, sort, then slice the requested page.
  let allQuery = applyBaseFilters(supabase.from('volunteers').select(LIST_SELECT), filters)
  if (categoryVolunteerIds) allQuery = allQuery.in('id', categoryVolunteerIds)

  const { data: allData } = await allQuery
  const allRows = (allData ?? []) as unknown as RawVolunteerRow[]
  const extra = await attachCallsAndLastCall(
    supabase,
    allRows.map((r) => r.id)
  )

  const volunteers = allRows.map((r) => toListRow(r, extra))
  const dir = filters.dir === 'asc' ? 1 : -1

  volunteers.sort((a, b) => {
    if (filters.sort === 'calls') return (a.calls - b.calls) * dir
    const av = a.last_call ?? ''
    const bv = b.last_call ?? ''
    return av.localeCompare(bv) * dir
  })

  if (fetchAll) return { volunteers, total }

  const offset = (filters.page - 1) * PAGE_SIZE
  return { volunteers: volunteers.slice(offset, offset + PAGE_SIZE), total }
}

export async function getActiveVolunteerCount(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from('volunteers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
  return count ?? 0
}

export async function getAllActiveVolunteersForExport(
  supabase: SupabaseClient
): Promise<VolunteerListRow[]> {
  const { data } = await supabase
    .from('volunteers')
    .select(LIST_SELECT)
    .eq('status', 'active')
    .order('full_name', { ascending: true })

  const rows = (data ?? []) as unknown as RawVolunteerRow[]
  const extra = await attachCallsAndLastCall(
    supabase,
    rows.map((r) => r.id)
  )

  return rows.map((r) => toListRow(r, extra))
}
