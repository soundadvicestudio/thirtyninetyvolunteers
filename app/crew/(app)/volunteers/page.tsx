import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { FileDown } from 'lucide-react'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import {
  getVolunteersList,
  getActiveVolunteerCount,
  PAGE_SIZE,
} from '@/lib/volunteers/list'
import {
  parseVolunteersUrlState,
  buildVolunteersQueryString,
  type VolunteersUrlState,
  type RawSearchParams,
} from '@/lib/volunteers/url'
import FilterPanel from '@/components/crew/volunteers/FilterPanel'
import VolunteersTable from '@/components/crew/volunteers/VolunteersTable'
import VolunteersSkeleton from '@/components/crew/volunteers/VolunteersSkeleton'
import ExportAllButton from '@/components/crew/volunteers/ExportAllButton'
import type { AdminUser } from '@/lib/auth'

async function VolunteersResults({
  state,
  role,
}: {
  state: VolunteersUrlState
  role: AdminUser['role']
}) {
  const supabase = await getServerClient()
  const { volunteers, total } = await getVolunteersList(supabase, state)

  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (state.page > totalPages && totalPages > 0) {
    redirect(
      `/crew/volunteers?${buildVolunteersQueryString({ ...state, page: totalPages }, { includePage: true })}`
    )
  }

  return (
    <VolunteersTable
      key={JSON.stringify(state)}
      volunteers={volunteers}
      total={total}
      page={state.page}
      pageSize={PAGE_SIZE}
      role={role}
      state={state}
    />
  )
}

export default async function VolunteersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const params = await searchParams
  const state = parseVolunteersUrlState(params)
  const canManage = admin.role === 'super_admin' || admin.role === 'editor'

  const supabase = await getServerClient()

  const [{ data: categories }, activeCount, exportRows] = await Promise.all([
    supabase
      .from('volunteer_categories')
      .select('id, name')
      .eq('is_visible', true)
      .order('sort_order'),
    getActiveVolunteerCount(supabase),
    canManage
      ? getVolunteersList(supabase, state, { fetchAll: true }).then((r) => r.volunteers)
      : Promise.resolve([]),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-navy">Volunteers</h1>
          <span className="bg-light-navy text-navy text-sm font-semibold rounded-full px-3 py-1">
            {activeCount} active
          </span>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <ExportAllButton volunteers={exportRows} />
            <a
              href={`/crew/volunteers/export?${buildVolunteersQueryString(state)}`}
              download
              className="flex items-center gap-1.5 text-sm bg-white border border-navy text-navy font-semibold px-3 py-1.5 rounded hover:bg-light-navy transition-colors"
            >
              <FileDown size={14} />
              Export PDF
            </a>
          </div>
        )}
      </div>

      <FilterPanel categories={categories ?? []} state={state} />

      <Suspense fallback={<VolunteersSkeleton />}>
        <VolunteersResults state={state} role={admin.role} />
      </Suspense>
    </div>
  )
}
