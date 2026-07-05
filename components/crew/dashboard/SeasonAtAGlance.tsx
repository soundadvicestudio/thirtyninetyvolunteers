import type { ReactNode } from 'react'
import { formatWallClockCT } from '@/lib/utils/date'
import { getServerClient } from '@/lib/supabase/server'
import { SHOW_TYPE_LABEL, SHOW_TYPE_BADGE } from '@/lib/utils/showDisplay'
import type { ShowType } from '@/types/show'

type RoleRow = {
  id: string
  role_name: string
  slots_available: number
  slot_claims: { status: string }[] | null
}

type DateRow = {
  id: string
  show_date: string
  show_time: string
  volunteer_roles: RoleRow[] | null
}

type ShowRow = {
  id: string
  name: string
  show_type: ShowType
  status: string
  show_dates: DateRow[] | null
}

function indicatorColor(claimed: number, total: number): string {
  if (claimed === 0) return 'bg-red-500'
  if (claimed < total) return 'bg-yellow-500'
  return 'bg-green-500'
}

export default async function SeasonAtAGlance({
  seasonId,
  seasonName,
  selectorSlot,
}: {
  seasonId: string | null
  seasonName: string | null
  selectorSlot?: ReactNode
}) {
  const supabase = await getServerClient()

  let query = supabase.from('shows').select(
    `
    id, name, show_type, status,
    show_dates (
      id, show_date, show_time,
      volunteer_roles ( id, role_name, slots_available, slot_claims ( status ) )
    )
    `
  )

  // Pinned season: show every show in that season regardless of status, so
  // an admin can see draft shows they haven't published yet. Fallback mode
  // (no season pinned): live shows only, across all seasons.
  query = seasonId ? query.eq('season_id', seasonId) : query.eq('status', 'live')

  const { data } = await query.order('name')
  const shows = (data ?? []) as unknown as ShowRow[]

  const headerLabel = seasonId ? seasonName ?? 'Season' : 'All Live Shows'
  const emptyMessage = seasonId ? 'No shows in this season yet.' : 'No live shows.'

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-dark dark:text-dark-text">
          Season at a Glance — <span className="text-navy dark:text-steel">{headerLabel}</span>
        </h2>
        {selectorSlot}
      </div>

      {shows.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shows.map((show) => {
            const sortedDates = [...(show.show_dates ?? [])].sort((a, b) =>
              a.show_date.localeCompare(b.show_date)
            )
            const dateRangeLabel =
              sortedDates.length === 0
                ? 'No dates'
                : sortedDates.length === 1
                  ? formatWallClockCT(sortedDates[0].show_date, null, 'MMM d, yyyy')
                  : `${formatWallClockCT(sortedDates[0].show_date, null, 'MMM d')} – ${formatWallClockCT(
                      sortedDates[sortedDates.length - 1].show_date,
                      null,
                      'MMM d, yyyy'
                    )}`

            return (
              <div
                key={show.id}
                className="border border-divider dark:border-dark-border rounded-md p-4"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-dark dark:text-dark-text truncate">
                    {show.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${SHOW_TYPE_BADGE[show.show_type]}`}
                  >
                    {SHOW_TYPE_LABEL[show.show_type]}
                  </span>
                </div>
                <p className="text-xs text-mid-gray dark:text-dark-muted mb-3">{dateRangeLabel}</p>

                {sortedDates.length === 0 ? (
                  <p className="text-xs text-mid-gray dark:text-dark-muted">No dates configured</p>
                ) : (
                  <div className="space-y-3">
                    {sortedDates.map((date) => {
                      const roles = date.volunteer_roles ?? []
                      return (
                        <div key={date.id}>
                          {sortedDates.length > 1 && (
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted mb-1">
                              {formatWallClockCT(date.show_date, date.show_time, 'MMM d')}
                            </p>
                          )}
                          {roles.length === 0 ? (
                            <p className="text-xs text-mid-gray dark:text-dark-muted">
                              No roles configured
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {roles.map((role) => {
                                const claimed = (role.slot_claims ?? []).filter(
                                  (c) => c.status === 'claimed'
                                ).length
                                return (
                                  <div
                                    key={role.id}
                                    className="flex items-center justify-between gap-2 text-sm"
                                  >
                                    <span className="flex items-center gap-2 min-w-0">
                                      <span
                                        className={`inline-block w-2 h-2 rounded-full shrink-0 ${indicatorColor(claimed, role.slots_available)}`}
                                        aria-hidden="true"
                                      />
                                      <span className="text-dark dark:text-dark-text truncate">
                                        {role.role_name}
                                      </span>
                                    </span>
                                    <span className="text-mid-gray dark:text-dark-muted shrink-0">
                                      {claimed} / {role.slots_available}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
