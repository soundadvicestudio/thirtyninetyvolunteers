'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Trash2, Mail } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import { HelpTooltip } from '@/components/crew/HelpTooltip'
import {
  assignUserToSchedule,
  removeUserFromSchedule,
  addDateOverride,
  removeDateOverride,
  getEffectiveRoster,
  getRehearsalAttendanceForEvent,
  markRehearsalAttendance,
  markAllRehearsalAttended,
} from '@/lib/actions/rehearsals-admin'
import type {
  RehearsalScheduleDetail,
  RehearsalEventRow,
  RehearsalScheduleAssignee,
  RehearsalAttendanceEntry,
} from '@/types/rehearsal'
import type { EffectiveRosterMember } from '@/lib/utils/rehearsal-roster'
import type { AdminRole } from '@/types/admin'

type ProductionUser = { id: string; name: string; email: string }

const EDITOR_TIER_ROLES: AdminRole[] = ['super_admin', 'owner_admin', 'editor']

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  super_admin: { label: 'Super Admin', className: 'bg-[#293994] text-white' },
  owner_admin: { label: 'Owner Admin', className: 'bg-indigo-600 text-white' },
  editor: { label: 'Editor', className: 'bg-[#729ABF] text-white' },
  viewer: { label: 'Viewer', className: 'bg-mid-gray text-white' },
  production: { label: 'Production', className: 'bg-[#F26522] text-white' },
}

function roleBadge(role: string) {
  return ROLE_BADGE[role] ?? { label: role, className: 'bg-mid-gray text-white' }
}

function eventStatusBadge(status: RehearsalEventRow['status']) {
  switch (status) {
    case 'pending':
      return { label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' }
    case 'approved':
      return { label: 'Approved', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
    case 'cancelled':
    default:
      return {
        label: 'Cancelled',
        className: 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted',
      }
  }
}

function attendanceStatusBadge(status: RehearsalAttendanceEntry['status']) {
  switch (status) {
    case 'showed':
      return { label: 'Showed', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
    case 'no-show':
      return { label: 'No-Show', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    case 'excused':
      return { label: 'Excused', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' }
    default:
      return null
  }
}

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors'

function RosterTab({
  batchId,
  scheduleAssignees,
  productionUsers,
  adminRole,
  adminId,
  messagesEnabled,
}: {
  batchId: string
  scheduleAssignees: RehearsalScheduleAssignee[]
  productionUsers: ProductionUser[]
  adminRole: AdminRole
  adminId: string
  messagesEnabled?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const canEdit = EDITOR_TIER_ROLES.includes(adminRole)
  const assignedIds = new Set(scheduleAssignees.map((a) => a.adminUserId))
  const query = searchQuery.trim().toLowerCase()
  const searchResults = query
    ? productionUsers.filter(
        (u) => !assignedIds.has(u.id) && (u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
      )
    : []

  function handleAssign(userId: string) {
    setActionError(null)
    startTransition(async () => {
      const result = await assignUserToSchedule(batchId, userId)
      if (!result.success) {
        setActionError(result.error ?? 'Something went wrong.')
        return
      }
      setSearchQuery('')
      router.refresh()
    })
  }

  function handleRemove(userId: string) {
    if (!confirm('Remove this user from the schedule?')) return
    setActionError(null)
    startTransition(async () => {
      const result = await removeUserFromSchedule(batchId, userId)
      if (!result.success) {
        setActionError(result.error ?? 'Something went wrong.')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-lg bg-brand-accent-light border border-brand-accent p-3 text-sm text-dark dark:text-dark-text">
          {actionError}
        </div>
      )}

      {scheduleAssignees.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No users assigned to this schedule.</p>
      ) : (
        <ul className="space-y-2">
          {scheduleAssignees.map((a) => {
            const badge = roleBadge(a.role)
            return (
              <li
                key={a.adminUserId}
                className="flex items-center justify-between gap-3 border border-divider dark:border-dark-border rounded-lg px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-dark dark:text-dark-text">{a.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
                  </div>
                  <p className="text-sm text-mid-gray dark:text-dark-muted">{a.email}</p>
                  {a.overrideCount > 0 && (
                    <p className="text-xs text-mid-gray dark:text-dark-muted mt-0.5">
                      Per-date overrides: {a.overrideCount}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {messagesEnabled && a.adminUserId !== adminId && (
                    <Link
                      href={`/crew/messages/compose?to=${a.adminUserId}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline"
                    >
                      <Mail size={12} />
                      Message
                    </Link>
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleRemove(a.adminUserId)}
                      disabled={isPending}
                      aria-label="Remove"
                      className="text-mid-gray dark:text-dark-muted hover:text-brand-accent transition-colors p-2 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {canEdit && (
        <div className="pt-2 border-t border-divider dark:border-dark-border">
          <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Add User</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray dark:text-dark-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email"
              className={`${inputClasses} pl-9`}
            />
          </div>
          {searchResults.length > 0 && (
            <ul className="mt-2 border border-divider dark:border-dark-border rounded-lg divide-y divide-divider dark:divide-dark-border overflow-hidden">
              {searchResults.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => handleAssign(u.id)}
                    disabled={isPending}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="font-medium text-dark dark:text-dark-text">{u.name}</span>
                    <span className="text-mid-gray dark:text-dark-muted ml-2">{u.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function DateRow({
  event,
  isExpanded,
  onToggle,
  roster,
  isLoading,
  canEdit,
  scheduleAssigneeIds,
  productionUsers,
  qr,
  onExclude,
  onRemoveInclude,
  onAddToDate,
  error,
}: {
  event: RehearsalEventRow
  isExpanded: boolean
  onToggle: () => void
  roster: EffectiveRosterMember[]
  isLoading: boolean
  canEdit: boolean
  scheduleAssigneeIds: Set<string>
  productionUsers: ProductionUser[]
  qr: { svg: string; pngBase64: string } | undefined
  onExclude: (userId: string) => void
  onRemoveInclude: (userId: string) => void
  onAddToDate: (userId: string) => void
  error?: string
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const badge = eventStatusBadge(event.status)
  const rosterIds = new Set(roster.map((r) => r.id))
  const query = searchQuery.trim().toLowerCase()
  const searchResults = query
    ? productionUsers.filter(
        (u) => !rosterIds.has(u.id) && (u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
      )
    : []

  return (
    <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors cursor-pointer"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span
            className={`font-medium text-dark dark:text-dark-text ${event.status === 'cancelled' ? 'line-through' : ''}`}
          >
            {formatCT(event.start_time, 'EEE, MMM d')} · {formatCT(event.start_time, 'h:mm a')}–
            {formatCT(event.end_time, 'h:mm a')}
          </span>
          <span className="text-mid-gray dark:text-dark-muted">{event.location_name ?? 'TBD'}</span>
          <span className="text-mid-gray dark:text-dark-muted">Roster: {event.rosterCount}</span>
          <span className="text-mid-gray dark:text-dark-muted">
            Attendance: {event.attendanceCount} / {event.rosterCount}
          </span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${badge.className}`}>{badge.label}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-divider dark:border-dark-border p-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-brand-accent-light border border-brand-accent p-3 text-sm text-dark dark:text-dark-text">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-mid-gray dark:text-dark-muted">Loading roster…</p>
          ) : roster.length === 0 ? (
            <p className="text-sm text-mid-gray dark:text-dark-muted">No one on the roster for this date.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider dark:border-dark-border">
                    <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Name
                    </th>
                    <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Role
                    </th>
                    <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Attendance
                    </th>
                    {canEdit && <th className="px-2 py-2" />}
                  </tr>
                </thead>
                <tbody>
                  {roster.map((member) => {
                    const badgeInfo = roleBadge(member.role)
                    const isScheduleAssignee = scheduleAssigneeIds.has(member.id)
                    return (
                      <tr key={member.id} className="border-b border-divider dark:border-dark-border last:border-0">
                        <td className="px-2 py-2 text-dark dark:text-dark-text">{member.full_name}</td>
                        <td className="px-2 py-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeInfo.className}`}>
                            {badgeInfo.label}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-mid-gray dark:text-dark-muted">—</td>
                        {canEdit && (
                          <td className="px-2 py-2 text-right">
                            {isScheduleAssignee ? (
                              <button
                                type="button"
                                onClick={() => onExclude(member.id)}
                                className="text-xs font-semibold text-brand-accent hover:underline cursor-pointer whitespace-nowrap"
                              >
                                Exclude from this date
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onRemoveInclude(member.id)}
                                className="text-xs font-semibold text-brand-accent hover:underline cursor-pointer whitespace-nowrap"
                              >
                                Remove from this date
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {canEdit && (
            <div>
              <label className="block text-xs font-semibold text-dark dark:text-dark-text mb-1">Add user to this date</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray dark:text-dark-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email"
                  className={`${inputClasses} pl-8 text-sm`}
                />
              </div>
              {searchResults.length > 0 && (
                <ul className="mt-2 border border-divider dark:border-dark-border rounded-lg divide-y divide-divider dark:divide-dark-border overflow-hidden">
                  {searchResults.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onAddToDate(u.id)
                          setSearchQuery('')
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors cursor-pointer"
                      >
                        <span className="font-medium text-dark dark:text-dark-text">{u.name}</span>
                        <span className="text-mid-gray dark:text-dark-muted ml-2">{u.email}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {event.check_in_token && qr && (
            <div>
              <label className="block text-xs font-semibold text-dark dark:text-dark-text mb-1">Check-In QR</label>
              <div className="inline-flex flex-col items-center gap-2">
                <div
                  className="w-[120px] h-[120px] [&>svg]:w-full [&>svg]:h-full bg-white p-1.5 rounded-lg border border-divider"
                  dangerouslySetInnerHTML={{ __html: qr.svg }}
                />
                <a
                  href={`data:image/png;base64,${qr.pngBase64}`}
                  download="rehearsal-checkin.png"
                  className="text-xs font-semibold text-brand-primary hover:underline"
                >
                  Download PNG
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DatesTab({
  events,
  qrData,
  adminRole,
  productionUsers,
  scheduleAssignees,
}: {
  events: RehearsalEventRow[]
  qrData: Map<string, { svg: string; pngBase64: string }>
  adminRole: AdminRole
  productionUsers: ProductionUser[]
  scheduleAssignees: RehearsalScheduleAssignee[]
}) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [rosterCache, setRosterCache] = useState<Map<string, EffectiveRosterMember[]>>(new Map())
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [errorByEvent, setErrorByEvent] = useState<Record<string, string>>({})

  const canEdit = EDITOR_TIER_ROLES.includes(adminRole)
  const scheduleAssigneeIds = new Set(scheduleAssignees.map((a) => a.adminUserId))

  function fetchRoster(eventId: string) {
    setLoadingEventId(eventId)
    startTransition(async () => {
      const result = await getEffectiveRoster(eventId)
      setLoadingEventId(null)
      if (result.success) {
        setRosterCache((prev) => new Map(prev).set(eventId, result.roster))
      }
    })
  }

  function toggleExpand(eventId: string) {
    if (expandedEventId === eventId) {
      setExpandedEventId(null)
      return
    }
    setExpandedEventId(eventId)
    if (!rosterCache.has(eventId)) {
      fetchRoster(eventId)
    }
  }

  function withRefresh(eventId: string, action: () => Promise<{ success: boolean; error?: string }>) {
    setErrorByEvent((prev) => ({ ...prev, [eventId]: '' }))
    startTransition(async () => {
      const result = await action()
      if (!result.success) {
        setErrorByEvent((prev) => ({ ...prev, [eventId]: result.error ?? 'Something went wrong.' }))
        return
      }
      fetchRoster(eventId)
    })
  }

  return (
    <div className="space-y-3">
      {events.length === 0 && <p className="text-sm text-mid-gray dark:text-dark-muted">No dates on this schedule.</p>}
      {events.map((event) => (
        <DateRow
          key={event.id}
          event={event}
          isExpanded={expandedEventId === event.id}
          onToggle={() => toggleExpand(event.id)}
          roster={rosterCache.get(event.id) ?? []}
          isLoading={loadingEventId === event.id}
          canEdit={canEdit}
          scheduleAssigneeIds={scheduleAssigneeIds}
          productionUsers={productionUsers}
          qr={qrData.get(event.id)}
          onExclude={(userId) => withRefresh(event.id, () => addDateOverride(event.id, userId, 'exclude'))}
          onRemoveInclude={(userId) => withRefresh(event.id, () => removeDateOverride(event.id, userId))}
          onAddToDate={(userId) => withRefresh(event.id, () => addDateOverride(event.id, userId, 'include'))}
          error={errorByEvent[event.id]}
        />
      ))}
    </div>
  )
}

function AttendanceSection({
  event,
  isExpanded,
  onToggle,
  entries,
  hasLoaded,
  isLoading,
  canMarkAny,
  canMarkOwn,
  adminId,
  onMark,
  onMarkAll,
  isPending,
  error,
  markAllSuccess,
}: {
  event: RehearsalEventRow
  isExpanded: boolean
  onToggle: () => void
  entries: RehearsalAttendanceEntry[]
  hasLoaded: boolean
  isLoading: boolean
  canMarkAny: boolean
  canMarkOwn: boolean
  adminId: string
  onMark: (userId: string, status: 'showed' | 'no-show' | 'excused') => void
  onMarkAll: () => void
  isPending: boolean
  error?: string
  markAllSuccess?: number
}) {
  const [confirmingMarkAll, setConfirmingMarkAll] = useState(false)
  const [changingUserId, setChangingUserId] = useState<string | null>(null)

  const attendedCount = hasLoaded ? entries.filter((e) => e.status === 'showed').length : event.attendanceCount
  const totalCount = hasLoaded ? entries.length : event.rosterCount

  return (
    <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors cursor-pointer"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-medium text-dark dark:text-dark-text">
            {formatCT(event.start_time, 'EEE, MMM d')} · {formatCT(event.start_time, 'h:mm a')}–
            {formatCT(event.end_time, 'h:mm a')}
          </span>
          <span className="text-mid-gray dark:text-dark-muted">{event.location_name ?? 'TBD'}</span>
        </div>
        <span className="text-xs font-semibold text-mid-gray dark:text-dark-muted shrink-0">
          {attendedCount} of {totalCount} attended
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-divider dark:border-dark-border p-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-brand-accent-light border border-brand-accent p-3 text-sm text-dark dark:text-dark-text">
              {error}
            </div>
          )}

          {markAllSuccess !== undefined && (
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 p-3 text-sm text-green-800 dark:text-green-400">
              {`Marked ${markAllSuccess} ${markAllSuccess === 1 ? 'person' : 'people'} as showed.`}
            </div>
          )}

          {canMarkAny && totalCount > 0 && (
            <div>
              {confirmingMarkAll ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-dark dark:text-dark-text">
                    {`Confirm — mark all ${totalCount} people as showed?`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onMarkAll()
                      setConfirmingMarkAll(false)
                    }}
                    disabled={isPending}
                    className="text-sm font-semibold text-white bg-brand-primary px-3 py-1.5 rounded-lg hover:bg-brand-primary-mid transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingMarkAll(false)}
                    className="text-sm font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingMarkAll(true)}
                  className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer"
                >
                  Mark All Present
                </button>
              )}
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-mid-gray dark:text-dark-muted">Loading attendance…</p>
          ) : hasLoaded && entries.length === 0 ? (
            <p className="text-sm text-mid-gray dark:text-dark-muted">No one on the roster for this date.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider dark:border-dark-border">
                    <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Name
                    </th>
                    <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Role
                    </th>
                    <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Status
                    </th>
                    <th className="px-2 py-2 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Checked In
                    </th>
                    {(canMarkAny || canMarkOwn) && <th className="px-2 py-2" />}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const badgeInfo = roleBadge(entry.role)
                    const statusBadgeInfo = attendanceStatusBadge(entry.status)
                    const canMarkThis = canMarkAny || (canMarkOwn && entry.adminUserId === adminId)
                    const showButtons = canMarkThis && (entry.status === null || changingUserId === entry.adminUserId)

                    return (
                      <tr key={entry.adminUserId} className="border-b border-divider dark:border-dark-border last:border-0">
                        <td className="px-2 py-2 text-dark dark:text-dark-text">{entry.name}</td>
                        <td className="px-2 py-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeInfo.className}`}>
                            {badgeInfo.label}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {statusBadgeInfo && (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusBadgeInfo.className}`}>
                                {statusBadgeInfo.label}
                              </span>
                            )}
                            {entry.source === 'checkin' && (
                              <span className="block w-fit text-xs px-1.5 py-0.5 rounded bg-brand-primary-light text-brand-primary dark:text-brand-primary-mid border border-brand-primary/20 dark:border-brand-primary-mid/30">
                                Self Check-In
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-mid-gray dark:text-dark-muted">
                          {entry.checkedInAt ? formatCT(entry.checkedInAt, 'h:mm a') : '—'}
                        </td>
                        {(canMarkAny || canMarkOwn) && (
                          <td className="px-2 py-2 text-right">
                            {canMarkThis ? (
                              showButtons ? (
                                <div className="flex items-center gap-2 justify-end flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onMark(entry.adminUserId, 'showed')
                                      setChangingUserId(null)
                                    }}
                                    disabled={isPending}
                                    className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50"
                                  >
                                    Showed
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onMark(entry.adminUserId, 'no-show')
                                      setChangingUserId(null)
                                    }}
                                    disabled={isPending}
                                    className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50"
                                  >
                                    No-Show
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onMark(entry.adminUserId, 'excused')
                                      setChangingUserId(null)
                                    }}
                                    disabled={isPending}
                                    className="text-xs font-semibold px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50"
                                  >
                                    Excused
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setChangingUserId(entry.adminUserId)}
                                  className="text-xs font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer"
                                >
                                  Change
                                </button>
                              )
                            ) : null}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AttendanceTab({
  events,
  adminRole,
  adminId,
}: {
  events: RehearsalEventRow[]
  adminRole: AdminRole
  adminId: string
}) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [attendanceCache, setAttendanceCache] = useState<Map<string, RehearsalAttendanceEntry[]>>(new Map())
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errorByEvent, setErrorByEvent] = useState<Record<string, string>>({})
  const [markAllSuccessByEvent, setMarkAllSuccessByEvent] = useState<Record<string, number>>({})

  const canMarkAny = EDITOR_TIER_ROLES.includes(adminRole)
  const canMarkOwn = adminRole === 'production'

  function fetchAttendance(eventId: string) {
    setLoadingEventId(eventId)
    startTransition(async () => {
      const result = await getRehearsalAttendanceForEvent(eventId)
      setLoadingEventId(null)
      if (result.success) {
        setAttendanceCache((prev) => new Map(prev).set(eventId, result.attendance))
      }
    })
  }

  function toggleExpand(eventId: string) {
    if (expandedEventId === eventId) {
      setExpandedEventId(null)
      return
    }
    setExpandedEventId(eventId)
    if (!attendanceCache.has(eventId)) {
      fetchAttendance(eventId)
    }
  }

  function handleMark(eventId: string, userId: string, status: 'showed' | 'no-show' | 'excused') {
    setErrorByEvent((prev) => ({ ...prev, [eventId]: '' }))
    startTransition(async () => {
      const result = await markRehearsalAttendance(eventId, userId, status)
      if (!result.success) {
        setErrorByEvent((prev) => ({ ...prev, [eventId]: result.error ?? 'Something went wrong.' }))
        return
      }
      fetchAttendance(eventId)
    })
  }

  function handleMarkAll(eventId: string) {
    setErrorByEvent((prev) => ({ ...prev, [eventId]: '' }))
    startTransition(async () => {
      const result = await markAllRehearsalAttended(eventId)
      if (!result.success) {
        setErrorByEvent((prev) => ({ ...prev, [eventId]: result.error ?? 'Something went wrong.' }))
        return
      }
      setMarkAllSuccessByEvent((prev) => ({ ...prev, [eventId]: result.markedCount }))
      fetchAttendance(eventId)
      setTimeout(() => {
        setMarkAllSuccessByEvent((prev) => {
          const next = { ...prev }
          delete next[eventId]
          return next
        })
      }, 3000)
    })
  }

  return (
    <div className="space-y-3">
      {events.length === 0 && <p className="text-sm text-mid-gray dark:text-dark-muted">No dates on this schedule.</p>}
      {events.map((event) => (
        <AttendanceSection
          key={event.id}
          event={event}
          isExpanded={expandedEventId === event.id}
          onToggle={() => toggleExpand(event.id)}
          entries={attendanceCache.get(event.id) ?? []}
          hasLoaded={attendanceCache.has(event.id)}
          isLoading={loadingEventId === event.id}
          canMarkAny={canMarkAny}
          canMarkOwn={canMarkOwn}
          adminId={adminId}
          onMark={(userId, status) => handleMark(event.id, userId, status)}
          onMarkAll={() => handleMarkAll(event.id)}
          isPending={isPending}
          error={errorByEvent[event.id]}
          markAllSuccess={markAllSuccessByEvent[event.id]}
        />
      ))}
    </div>
  )
}

export default function RehearsalDetailTabs({
  detail,
  adminRole,
  adminId,
  productionUsers,
  qrData,
  messagesEnabled,
}: {
  detail: RehearsalScheduleDetail
  adminRole: AdminRole
  adminId: string
  productionUsers: ProductionUser[]
  qrData: Map<string, { svg: string; pngBase64: string }>
  messagesEnabled?: boolean
}) {
  const [activeTab, setActiveTab] = useState<'roster' | 'dates' | 'attendance'>('roster')

  const tabClasses = (tab: typeof activeTab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
      activeTab === tab
        ? 'border-brand-primary text-brand-primary dark:text-brand-primary-mid'
        : 'border-transparent text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text'
    }`

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg">
      <div className="flex border-b border-divider dark:border-dark-border px-2">
        <button type="button" onClick={() => setActiveTab('roster')} className={tabClasses('roster')}>
          <span className="inline-flex items-center gap-1.5">
            Roster
            <HelpTooltip anchor="rehearsals-assignments" label="Roster" />
          </span>
        </button>
        <button type="button" onClick={() => setActiveTab('dates')} className={tabClasses('dates')}>
          <span className="inline-flex items-center gap-1.5">
            Dates
            <HelpTooltip anchor="rehearsals-assignments" label="Dates" />
          </span>
        </button>
        <button type="button" onClick={() => setActiveTab('attendance')} className={tabClasses('attendance')}>
          <span className="inline-flex items-center gap-1.5">
            Attendance
            <HelpTooltip anchor="rehearsals-attendance" label="Attendance" />
          </span>
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'roster' && (
          <RosterTab
            batchId={detail.batch.id}
            scheduleAssignees={detail.scheduleAssignees}
            productionUsers={productionUsers}
            adminRole={adminRole}
            adminId={adminId}
            messagesEnabled={messagesEnabled}
          />
        )}
        {activeTab === 'dates' && (
          <DatesTab
            events={detail.events}
            qrData={qrData}
            adminRole={adminRole}
            productionUsers={productionUsers}
            scheduleAssignees={detail.scheduleAssignees}
          />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab events={detail.events} adminRole={adminRole} adminId={adminId} />
        )}
      </div>
    </div>
  )
}
