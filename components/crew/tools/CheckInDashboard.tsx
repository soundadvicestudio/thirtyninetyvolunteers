'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ScanLine, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { formatCT, formatWallClockCT } from '@/lib/utils/date'
import { getCheckInRosterForDate } from '@/lib/actions/checkin-admin'
import type { CheckInDashboardData, CheckInRoster, CheckInRosterEntry } from '@/types/checkin'

type Props = {
  initialData: CheckInDashboardData
  topShowId: string | null
}

const REFRESH_INTERVAL_MS = 10000

const selectClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors'

function StatusBadge({
  status,
  source,
}: {
  status: 'showed' | 'no_show' | 'excused' | null
  source?: 'manual' | 'checkin'
}) {
  if (status === 'showed') {
    return (
      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        {source === 'checkin' ? '✓ Checked In (QR)' : '✓ Checked In (Admin)'}
      </span>
    )
  }
  if (status === 'no_show') {
    return (
      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        ✗ No-Show
      </span>
    )
  }
  if (status === 'excused') {
    return (
      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        Excused
      </span>
    )
  }
  return <span className="text-xs text-mid-gray dark:text-dark-muted">— Awaiting</span>
}

function RosterTable({ roster, showDateLabel }: { roster: CheckInRoster; showDateLabel: string }) {
  if (roster.claims.length === 0 && roster.walkIns.length === 0) {
    return <p className="text-sm text-mid-gray dark:text-dark-muted">No volunteers rostered for this date.</p>
  }

  const grouped = new Map<string, CheckInRosterEntry[]>()
  const sortedClaims = [...roster.claims].sort(
    (a, b) => a.roleName.localeCompare(b.roleName) || a.volunteerName.localeCompare(b.volunteerName)
  )
  for (const claim of sortedClaims) {
    if (!grouped.has(claim.roleName)) grouped.set(claim.roleName, [])
    grouped.get(claim.roleName)!.push(claim)
  }

  return (
    <div>
      {showDateLabel && (
        <p className="text-xs font-semibold text-mid-gray dark:text-dark-muted uppercase tracking-wide mb-1">
          {showDateLabel}
        </p>
      )}
      <p className="text-sm font-semibold text-dark dark:text-dark-text mb-3">
        {roster.checkedInCount} of {roster.totalRostered} rostered volunteers checked in
        {roster.walkIns.length > 0 &&
          ` + ${roster.walkIns.length} walk-in${roster.walkIns.length === 1 ? '' : 's'}`}
      </p>

      {roster.claims.length > 0 && (
        <div className="overflow-x-auto border border-divider dark:border-dark-border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted bg-brand-primary-light dark:bg-dark-nav">
                <th className="px-4 py-2 font-semibold">Volunteer Name</th>
                <th className="px-4 py-2 font-semibold">Role</th>
                <th className="px-4 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface">
              {Array.from(grouped.entries()).map(([roleName, entries]) => (
                <Fragment key={roleName}>
                  <tr className="bg-brand-primary-light/50 dark:bg-dark-nav/50">
                    <td
                      colSpan={3}
                      className="px-4 py-1.5 text-xs font-semibold text-mid-gray dark:text-dark-muted uppercase tracking-wide"
                    >
                      {roleName}
                    </td>
                  </tr>
                  {entries.map((entry) => (
                    <tr
                      key={entry.claimId}
                      className="border-b border-divider dark:border-dark-border last:border-b-0"
                    >
                      <td className="px-4 py-2 text-dark dark:text-dark-text align-top">{entry.volunteerName}</td>
                      <td className="px-4 py-2 text-dark dark:text-dark-text align-top">{entry.roleName}</td>
                      <td className="px-4 py-2 align-top">
                        <StatusBadge status={entry.attendance?.status ?? null} source={entry.attendance?.source} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {roster.walkIns.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-bold text-dark dark:text-dark-text mb-2">
            Walk-In Check-Ins ({roster.walkIns.length})
          </h4>
          <ul className="space-y-1 max-w-sm">
            {roster.walkIns.map((walkIn, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm text-dark dark:text-dark-text"
              >
                <span>{walkIn.volunteerName}</span>
                <span className="text-mid-gray dark:text-dark-muted">{formatCT(walkIn.markedAt, 'h:mm a')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function CheckInDashboard({ initialData }: Props) {
  const router = useRouter()

  const [selectedDateId, setSelectedDateId] = useState<string>(
    !initialData.noUpcomingShows ? initialData.topShow.selectedDateId : ''
  )
  const [currentRoster, setCurrentRoster] = useState<CheckInRoster | null>(
    !initialData.noUpcomingShows ? initialData.topShow.roster : null
  )
  const [expandedShowId, setExpandedShowId] = useState<string | null>(null)
  const [expandedRoster, setExpandedRoster] = useState<CheckInRoster | null>(null)
  const [expandedLoading, setExpandedLoading] = useState(false)
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      router.refresh()
    }, REFRESH_INTERVAL_MS)

    const tickInterval = setInterval(() => {
      setSecondsSinceUpdate((s) => s + 1)
    }, 1000)

    return () => {
      clearInterval(refreshInterval)
      clearInterval(tickInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // New props arrive after router.refresh(). If the user hasn't changed the
  // date, accept the server's fresh roster directly — this is "adjusting
  // state when a prop changes" (react.dev's own pattern for this exact case),
  // done during render rather than in an effect, so it doesn't trigger
  // react-hooks/set-state-in-effect. Re-fetching a *different* date the user
  // has navigated to is a genuine async side effect and stays in the effect
  // below.
  const [prevInitialData, setPrevInitialData] = useState(initialData)
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    if (!initialData.noUpcomingShows && selectedDateId === initialData.topShow.selectedDateId) {
      setCurrentRoster(initialData.topShow.roster)
    }
    setSecondsSinceUpdate(0)
    setIsRefreshing(false)
  }

  useEffect(() => {
    if (initialData.noUpcomingShows) return
    const serverDate = initialData.topShow.selectedDateId
    if (selectedDateId !== serverDate) {
      getCheckInRosterForDate(selectedDateId).then((roster) => {
        setCurrentRoster(roster)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData])

  function handleManualRefresh() {
    setIsRefreshing(true)
    router.refresh()
  }

  async function handleDateChange(newId: string) {
    setSelectedDateId(newId)
    const roster = await getCheckInRosterForDate(newId)
    setCurrentRoster(roster)
  }

  async function handleExpand(showId: string, dateId: string) {
    if (expandedShowId === showId) {
      setExpandedShowId(null)
      setExpandedRoster(null)
      return
    }
    setExpandedShowId(showId)
    setExpandedRoster(null)
    setExpandedLoading(true)
    const roster = await getCheckInRosterForDate(dateId)
    setExpandedRoster(roster)
    setExpandedLoading(false)
  }

  if (initialData.noUpcomingShows) {
    return (
      <div className="flex flex-col items-center text-center py-16">
        <ScanLine size={48} className="text-brand-primary-tint dark:text-dark-muted mb-6" />
        <h2 className="text-xl font-bold text-dark dark:text-dark-text mb-2">No Upcoming Shows</h2>
        <p className="text-sm text-mid-gray dark:text-dark-muted mb-4">
          Check back when the next show is scheduled.
        </p>
        <Link href="/crew/shows" className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline">
          Go to Shows →
        </Link>
      </div>
    )
  }

  const { topShow, otherShows } = initialData
  const selectedDate = topShow.upcomingDates.find((d) => d.id === selectedDateId) ?? topShow.upcomingDates[0]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-dark dark:text-dark-text">{topShow.showName}</h2>
          <p className="text-sm text-mid-gray dark:text-dark-muted">{topShow.locationName}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-mid-gray dark:text-dark-muted">Last updated {secondsSinceUpdate}s ago</span>
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {topShow.upcomingDates.length > 1 && (
        <div className="mb-4 max-w-sm">
          <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Show Date</label>
          <select value={selectedDateId} onChange={(e) => handleDateChange(e.target.value)} className={selectClasses}>
            {topShow.upcomingDates.map((d) => (
              <option key={d.id} value={d.id}>
                {formatWallClockCT(d.show_date, d.show_time, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </option>
            ))}
          </select>
        </div>
      )}

      <RosterTable
        roster={currentRoster ?? topShow.roster}
        showDateLabel={
          selectedDate ? formatWallClockCT(selectedDate.show_date, selectedDate.show_time, 'MMM d, yyyy — h:mm a') : ''
        }
      />

      {otherShows.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Other Upcoming Shows</h3>
          <div className="space-y-2">
            {otherShows.map((show) => {
              const isExpanded = expandedShowId === show.showId
              return (
                <div
                  key={show.showId}
                  className="border border-divider dark:border-dark-border rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => handleExpand(show.showId, show.nearestDateId)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-brand-primary-light dark:bg-dark-nav text-left cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-dark dark:text-dark-text">{show.showName}</p>
                      <p className="text-xs text-mid-gray dark:text-dark-muted">
                        {formatWallClockCT(show.nearestDate, show.nearestTime, 'EEE MMM d')} ·{' '}
                        {formatWallClockCT(show.nearestDate, show.nearestTime, 'h:mm a')} · {show.checkedInCount} /{' '}
                        {show.totalRostered} checked in
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-mid-gray dark:text-dark-muted shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-mid-gray dark:text-dark-muted shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-4 bg-white dark:bg-dark-surface">
                      {expandedLoading ? (
                        <p className="text-sm text-mid-gray dark:text-dark-muted">Loading…</p>
                      ) : expandedRoster ? (
                        <RosterTable roster={expandedRoster} showDateLabel="" />
                      ) : null}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
