import Link from 'next/link'
import { addDays } from 'date-fns'
import { formatCT, formatWallClockCT } from '@/lib/utils/date'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { HelpTooltip } from '@/components/crew/HelpTooltip'
import type { Location } from '@/types/show'

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
  location_id: string
  location: Location | null
  status: string
  show_dates: DateRow[] | null
}

type AuditionRow = {
  id: string
  title: string
  show_id: string | null
  date_start: string
  shows: { name: string } | { name: string }[] | null
}

type ShowItem = {
  kind: 'show'
  sortKey: string
  show: ShowRow
  sortedDates: DateRow[]
}

type AuditionItem = {
  kind: 'audition'
  sortKey: string
  id: string
  title: string
  showName: string | null
}

type CombinedItem = ShowItem | AuditionItem

function indicatorColor(claimed: number, total: number): string {
  if (claimed === 0) return 'bg-red-500'
  if (claimed < total) return 'bg-yellow-500'
  return 'bg-green-500'
}

function ShowCardBlock({
  show,
  sortedDates,
  timezone,
}: {
  show: ShowRow
  sortedDates: DateRow[]
  timezone: string
}) {
  const dateRangeLabel =
    sortedDates.length === 0
      ? 'No dates'
      : sortedDates.length === 1
        ? formatWallClockCT(sortedDates[0].show_date, null, 'MMM d, yyyy', timezone)
        : `${formatWallClockCT(sortedDates[0].show_date, null, 'MMM d', timezone)} – ${formatWallClockCT(
            sortedDates[sortedDates.length - 1].show_date,
            null,
            'MMM d, yyyy',
            timezone
          )}`

  return (
    <div className="border border-divider dark:border-dark-border rounded-md p-4">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="font-semibold text-dark dark:text-dark-text truncate">{show.name}</h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full shrink-0 text-white"
          style={{ backgroundColor: show.location?.color ?? '#555555' }}
        >
          {show.location?.name ?? 'Unknown Location'}
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
                    {formatWallClockCT(date.show_date, date.show_time, 'MMM d', timezone)}
                  </p>
                )}
                {roles.length === 0 ? (
                  <p className="text-xs text-mid-gray dark:text-dark-muted">No roles configured</p>
                ) : (
                  <div className="space-y-1.5">
                    {roles.map((role) => {
                      const claimed = (role.slot_claims ?? []).filter((c) => c.status === 'claimed').length
                      return (
                        <div key={role.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className={`inline-block w-2 h-2 rounded-full shrink-0 ${indicatorColor(claimed, role.slots_available)}`}
                              aria-hidden="true"
                            />
                            <span className="text-dark dark:text-dark-text truncate">{role.role_name}</span>
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
}

function AuditionCardBlock({ item, timezone }: { item: AuditionItem; timezone: string }) {
  return (
    <div className="border border-divider dark:border-dark-border rounded-md p-4">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="font-semibold text-dark dark:text-dark-text truncate">{item.title}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full shrink-0 bg-brand-primary text-white">Audition</span>
      </div>
      <p className="text-xs text-mid-gray dark:text-dark-muted mb-3">
        {formatWallClockCT(item.sortKey, null, 'MMM d, yyyy', timezone)}
      </p>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-dark dark:text-dark-text truncate">
          {item.showName ?? 'Standalone Audition'}
        </span>
        <Link
          href={`/crew/auditions/${item.id}`}
          className="text-brand-primary dark:text-brand-primary-mid hover:underline shrink-0 text-xs font-semibold"
        >
          View →
        </Link>
      </div>
    </div>
  )
}

export default async function SeasonAtAGlance({ timezone }: { timezone: string }) {
  const supabase = await getServerClient()

  const { data } = await supabase
    .from('shows')
    .select(
      `
      id, name, location_id, location:locations(id, name, color), status,
      show_dates (
        id, show_date, show_time,
        volunteer_roles ( id, role_name, slots_available, slot_claims ( status ) )
      )
      `
    )
    .eq('status', 'live')

  const shows = (data ?? []) as unknown as ShowRow[]
  const totalShowCount = shows.length

  // 31-day rolling window — a show is included if it has at least one
  // show_date between today and the cutoff, inclusive. String comparison
  // on 'yyyy-MM-dd' values is safe and avoids raw-Date-object timezone
  // pitfalls of bare date columns (R23).
  const today = formatCT(new Date(), 'yyyy-MM-dd', timezone)
  const cutoff = formatCT(addDays(new Date(), 31), 'yyyy-MM-dd', timezone)

  const showItems: ShowItem[] = shows
    .map((show) => {
      const sortedDates = [...(show.show_dates ?? [])].sort((a, b) => a.show_date.localeCompare(b.show_date))
      const minDate = sortedDates.find((d) => d.show_date >= today)?.show_date ?? null
      return { show, sortedDates, minDate }
    })
    .filter((s): s is typeof s & { minDate: string } => s.minDate !== null && s.minDate <= cutoff)
    .map((s) => ({ kind: 'show' as const, sortKey: s.minDate, show: s.show, sortedDates: s.sortedDates }))

  const flags = await getFeatureFlags(supabase)
  let auditionItems: AuditionItem[] = []

  if (flags.auditions) {
    const { data: auditionRows } = await supabase
      .from('auditions')
      .select('id, title, show_id, date_start, shows!auditions_show_id_fkey ( name )')
      .eq('status', 'published')
      .gte('date_start', today)
      .lte('date_start', cutoff)
      .order('date_start', { ascending: true })

    auditionItems = ((auditionRows ?? []) as unknown as AuditionRow[]).map((a) => {
      const show = Array.isArray(a.shows) ? a.shows[0] : a.shows
      return {
        kind: 'audition' as const,
        sortKey: a.date_start,
        id: a.id,
        title: a.title,
        showName: show?.name ?? null,
      }
    })
  }

  const combinedItems: CombinedItem[] = [...showItems, ...auditionItems].sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey)
  )

  const displayedShowCount = showItems.length

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-dark dark:text-dark-text">
          Upcoming (Next 31 Days)
          <HelpTooltip anchor="dashboard-season" label="Season at a Glance" />
        </h2>
        <Link href="/crew/shows" className="text-sm text-brand-primary hover:underline">
          View all shows →
        </Link>
      </div>

      {combinedItems.length === 0 ? (
        <div>
          <p className="text-sm text-mid-gray dark:text-dark-muted mb-2">
            Nothing scheduled in the next 31 days.
          </p>
          {totalShowCount > 0 && (
            <Link href="/crew/shows" className="text-sm text-brand-primary hover:underline">
              View all shows →
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {combinedItems.map((item) =>
              item.kind === 'show' ? (
                <ShowCardBlock
                  key={`show-${item.show.id}`}
                  show={item.show}
                  sortedDates={item.sortedDates}
                  timezone={timezone}
                />
              ) : (
                <AuditionCardBlock key={`audition-${item.id}`} item={item} timezone={timezone} />
              )
            )}
          </div>
          {totalShowCount > displayedShowCount && (
            <p className="text-xs text-mid-gray dark:text-dark-muted mt-4">
              Showing {displayedShowCount} of {totalShowCount} shows —{' '}
              <Link href="/crew/shows" className="text-brand-primary hover:underline">
                View all →
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  )
}
