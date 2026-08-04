'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Trash2 } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import { HelpTooltip } from '@/components/crew/HelpTooltip'
import {
  assignUserToSchedule,
  removeUserFromSchedule,
  addDateOverride,
  removeDateOverride,
  getEffectiveRoster,
} from '@/lib/actions/rehearsals-admin'
import type { RehearsalScheduleDetail, RehearsalEventRow, RehearsalScheduleAssignee } from '@/types/rehearsal'
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

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors'

function RosterTab({
  batchId,
  scheduleAssignees,
  productionUsers,
  adminRole,
}: {
  batchId: string
  scheduleAssignees: RehearsalScheduleAssignee[]
  productionUsers: ProductionUser[]
  adminRole: AdminRole
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

export default function RehearsalDetailTabs({
  detail,
  adminRole,
  productionUsers,
  qrData,
}: {
  detail: RehearsalScheduleDetail
  adminRole: AdminRole
  adminId: string
  productionUsers: ProductionUser[]
  qrData: Map<string, { svg: string; pngBase64: string }>
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
          <div className="py-10 text-center text-sm text-mid-gray dark:text-dark-muted">
            Attendance tracking will be available here.
          </div>
        )}
      </div>
    </div>
  )
}
