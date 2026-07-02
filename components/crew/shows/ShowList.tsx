'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import { createSeason, toggleShowStatus } from '@/lib/actions/shows'
import {
  SHOW_TYPE_LABEL as TYPE_LABEL,
  SHOW_TYPE_BADGE as TYPE_BADGE,
  SHOW_STATUS_LABEL as STATUS_LABEL,
  SHOW_STATUS_BADGE as STATUS_BADGE,
} from '@/lib/utils/showDisplay'
import type { AdminUser } from '@/lib/auth'
import type { Season, ShowWithStaffing, ShowType, ShowStatus } from '@/types/show'

const UNSEASONED_KEY = '__unseasoned__'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const selectClasses =
  'rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'

function formatDateRange(earliest: string | null, latest: string | null): string | null {
  if (!earliest || !latest) return null
  if (earliest === latest) {
    return formatCT(earliest, 'MMM d, yyyy')
  }
  const earliestYear = formatCT(earliest, 'yyyy')
  const latestYear = formatCT(latest, 'yyyy')
  if (earliestYear === latestYear) {
    return `${formatCT(earliest, 'MMM d')} – ${formatCT(latest, 'MMM d, yyyy')}`
  }
  return `${formatCT(earliest, 'MMM d, yyyy')} – ${formatCT(latest, 'MMM d, yyyy')}`
}

function staffingDisplay(show: ShowWithStaffing): { label: string; className: string } {
  if (show.total_slots === 0) {
    return {
      label: 'No roles yet',
      className: 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted',
    }
  }
  const label = `${show.filled_slots} / ${show.total_slots} slots filled`
  if (show.filled_slots === 0) {
    return { label, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  }
  if (show.filled_slots >= show.total_slots) {
    return { label, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
  }
  return { label, className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' }
}

function ShowCard({
  show,
  canEdit,
  isToggling,
  toggleError,
  isCopied,
  onToggleStatus,
  onCopyUrl,
}: {
  show: ShowWithStaffing
  canEdit: boolean
  isToggling: boolean
  toggleError?: string
  isCopied: boolean
  onToggleStatus: () => void
  onCopyUrl: () => void
}) {
  const staffing = staffingDisplay(show)

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Link
            href={`/crew/shows/${show.id}`}
            className="font-bold text-dark dark:text-dark-text hover:text-navy dark:hover:text-steel transition-colors"
          >
            {show.name}
          </Link>
          <span className={`text-xs font-semibold rounded px-2 py-0.5 ${TYPE_BADGE[show.show_type]}`}>
            {TYPE_LABEL[show.show_type]}
          </span>
        </div>
        <p className="text-sm text-mid-gray dark:text-dark-muted mb-2">
          {formatDateRange(show.earliest_date, show.latest_date) ?? 'No dates scheduled'}
        </p>
        <span
          className={`text-xs font-semibold rounded-full px-2.5 py-1 inline-block ${staffing.className}`}
        >
          {staffing.label}
        </span>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold rounded px-2 py-0.5 ${STATUS_BADGE[show.status]}`}>
            {STATUS_LABEL[show.status]}
          </span>
          {canEdit && (show.status === 'draft' || show.status === 'live') && (
            <button
              type="button"
              onClick={onToggleStatus}
              disabled={isToggling}
              className="text-xs font-semibold border border-navy dark:border-steel text-navy dark:text-steel px-2.5 py-1 rounded hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isToggling ? 'Saving…' : show.status === 'draft' ? 'Set Live' : 'Set Draft'}
            </button>
          )}
        </div>
        {toggleError && <p className="text-xs text-orange">{toggleError}</p>}
        <div className="flex items-center gap-3">
          {canEdit && (
            <Link
              href={`/crew/shows/${show.id}/edit`}
              className="text-xs font-semibold text-navy dark:text-steel hover:underline"
            >
              Edit
            </Link>
          )}
          <button
            type="button"
            onClick={() => window.open(`/shows/${show.id}`, '_blank', 'noopener,noreferrer')}
            className="text-xs font-semibold text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel transition-colors cursor-pointer"
          >
            View
          </button>
          <button
            type="button"
            onClick={onCopyUrl}
            className="text-xs font-semibold text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel transition-colors cursor-pointer"
          >
            {isCopied ? 'Copied!' : 'Copy URL'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ShowList({
  seasons,
  shows,
  adminRole,
}: {
  seasons: Season[]
  shows: ShowWithStaffing[]
  adminRole: AdminUser['role']
}) {
  const router = useRouter()
  const canEdit = adminRole === 'super_admin' || adminRole === 'editor'

  const [typeFilter, setTypeFilter] = useState<'all' | ShowType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | ShowStatus>('all')

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const current = seasons.find((s) => s.is_current)
    const key = current?.id ?? seasons[0]?.id
    return key ? new Set([key]) : new Set()
  })

  const [seasonPanelOpen, setSeasonPanelOpen] = useState(false)
  const [newSeasonName, setNewSeasonName] = useState('')
  const [newSeasonStart, setNewSeasonStart] = useState('')
  const [newSeasonEnd, setNewSeasonEnd] = useState('')
  const [seasonError, setSeasonError] = useState<string | null>(null)
  const [seasonSubmitting, setSeasonSubmitting] = useState(false)

  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({})

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    }
  }, [])

  function toggleExpand(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function clearFilters() {
    setTypeFilter('all')
    setStatusFilter('all')
  }

  function resetSeasonPanel() {
    setSeasonPanelOpen(false)
    setNewSeasonName('')
    setNewSeasonStart('')
    setNewSeasonEnd('')
    setSeasonError(null)
  }

  async function handleCreateSeason() {
    if (!newSeasonName.trim()) {
      setSeasonError('Season name is required.')
      return
    }
    setSeasonSubmitting(true)
    setSeasonError(null)
    const result = await createSeason({
      name: newSeasonName,
      startDate: newSeasonStart || null,
      endDate: newSeasonEnd || null,
    })
    setSeasonSubmitting(false)
    if ('error' in result) {
      setSeasonError(result.error)
      return
    }
    resetSeasonPanel()
    router.refresh()
  }

  async function handleToggleStatus(show: ShowWithStaffing) {
    const newStatus = show.status === 'draft' ? 'live' : 'draft'
    setTogglingId(show.id)
    setToggleErrors((prev) => {
      const next = { ...prev }
      delete next[show.id]
      return next
    })
    const result = await toggleShowStatus(show.id, newStatus)
    setTogglingId(null)
    if ('error' in result) {
      setToggleErrors((prev) => ({ ...prev, [show.id]: result.error }))
      return
    }
    router.refresh()
  }

  function handleCopyUrl(showId: string) {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/shows/${showId}`
    navigator.clipboard.writeText(url).then(() => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
      setCopiedId(showId)
      copiedTimeoutRef.current = setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const filteredShows = shows.filter(
    (s) =>
      (typeFilter === 'all' || s.show_type === typeFilter) &&
      (statusFilter === 'all' || s.status === statusFilter)
  )
  const hasActiveFilter = typeFilter !== 'all' || statusFilter !== 'all'

  const showsBySeasonAll = new Map<string, ShowWithStaffing[]>()
  for (const show of shows) {
    const key = show.season_id ?? UNSEASONED_KEY
    if (!showsBySeasonAll.has(key)) showsBySeasonAll.set(key, [])
    showsBySeasonAll.get(key)!.push(show)
  }
  const showsBySeasonFiltered = new Map<string, ShowWithStaffing[]>()
  for (const show of filteredShows) {
    const key = show.season_id ?? UNSEASONED_KEY
    if (!showsBySeasonFiltered.has(key)) showsBySeasonFiltered.set(key, [])
    showsBySeasonFiltered.get(key)!.push(show)
  }

  type Group = { key: string; season: Season | null; shows: ShowWithStaffing[] }
  const groups: Group[] = []

  for (const season of seasons) {
    const filteredForSeason = showsBySeasonFiltered.get(season.id) ?? []
    if (hasActiveFilter && filteredForSeason.length === 0) continue
    groups.push({ key: season.id, season, shows: filteredForSeason })
  }

  const unseasonedAll = showsBySeasonAll.get(UNSEASONED_KEY) ?? []
  if (unseasonedAll.length > 0) {
    const filteredUnseasoned = showsBySeasonFiltered.get(UNSEASONED_KEY) ?? []
    if (!(hasActiveFilter && filteredUnseasoned.length === 0)) {
      groups.push({ key: UNSEASONED_KEY, season: null, shows: filteredUnseasoned })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Shows</h1>
        {canEdit && (
          <Link
            href="/crew/shows/new"
            className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium"
          >
            ＋ New Show
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          aria-label="Filter by show type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | ShowType)}
          className={selectClasses}
        >
          <option value="all">All Types</option>
          <option value="mainstage">Mainstage</option>
          <option value="studio_x">Studio X</option>
          <option value="one_off">One-Off</option>
        </select>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | ShowStatus)}
          className={selectClasses}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="live">Live</option>
          <option value="past">Past</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {canEdit && (
        <div className="mb-6">
          {!seasonPanelOpen ? (
            <button
              type="button"
              onClick={() => setSeasonPanelOpen(true)}
              className="border border-navy dark:border-steel text-navy dark:text-steel text-sm font-semibold px-4 py-2 rounded-md hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors cursor-pointer"
            >
              ＋ New Season
            </button>
          ) : (
            <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className={labelClasses}>
                    Season Name<span className="text-orange ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputClasses}
                    value={newSeasonName}
                    onChange={(e) => setNewSeasonName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Start Date</label>
                  <input
                    type="date"
                    className={inputClasses}
                    value={newSeasonStart}
                    onChange={(e) => setNewSeasonStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClasses}>End Date</label>
                  <input
                    type="date"
                    className={inputClasses}
                    value={newSeasonEnd}
                    onChange={(e) => setNewSeasonEnd(e.target.value)}
                  />
                </div>
              </div>
              {seasonError && <p className="text-sm text-orange">{seasonError}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCreateSeason}
                  disabled={seasonSubmitting}
                  className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
                >
                  {seasonSubmitting ? 'Creating…' : 'Create Season'}
                </button>
                <button
                  type="button"
                  onClick={resetSeasonPanel}
                  className="border border-divider dark:border-dark-border text-dark dark:text-dark-text px-4 py-2 rounded-md text-sm font-medium hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {shows.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-mid-gray dark:text-dark-muted mb-4">
            No shows yet. Create your first show to get started.
          </p>
          {canEdit && (
            <Link
              href="/crew/shows/new"
              className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium"
            >
              ＋ New Show
            </Link>
          )}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-mid-gray dark:text-dark-muted mb-3">No shows match the current filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-navy dark:text-steel hover:underline text-sm font-semibold cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const isExpanded = expandedKeys.has(group.key)
            const title = group.season ? group.season.name : 'Unseasoned Shows'
            const dateRangeLabel = group.season
              ? formatDateRange(group.season.start_date, group.season.end_date)
              : null

            return (
              <div
                key={group.key}
                className="border border-divider dark:border-dark-border rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(group.key)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-light-navy dark:bg-dark-nav text-left hover:bg-light-navy/70 dark:hover:bg-dark-nav/70 transition-colors cursor-pointer"
                >
                  <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <span className="font-bold text-dark dark:text-dark-text">{title}</span>
                    {dateRangeLabel && (
                      <span className="text-sm text-mid-gray dark:text-dark-muted">{dateRangeLabel}</span>
                    )}
                    <span className="text-sm text-mid-gray dark:text-dark-muted">
                      {group.shows.length} {group.shows.length === 1 ? 'show' : 'shows'}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-mid-gray dark:text-dark-muted transition-transform shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="p-3 space-y-3 bg-white dark:bg-dark-surface">
                    {group.shows.length === 0 ? (
                      <p className="text-sm text-mid-gray dark:text-dark-muted px-1 py-2">
                        No shows in this season yet.
                      </p>
                    ) : (
                      group.shows.map((show) => (
                        <ShowCard
                          key={show.id}
                          show={show}
                          canEdit={canEdit}
                          isToggling={togglingId === show.id}
                          toggleError={toggleErrors[show.id]}
                          isCopied={copiedId === show.id}
                          onToggleStatus={() => handleToggleStatus(show)}
                          onCopyUrl={() => handleCopyUrl(show.id)}
                        />
                      ))
                    )}
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
