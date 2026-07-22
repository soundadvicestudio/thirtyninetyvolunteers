'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Loader2, AlertTriangle, Check } from 'lucide-react'
import { approveCalendarEvent, approveBatch, cancelCalendarEvent, checkEventConflict } from '@/lib/actions/calendar'
import { formatCT } from '@/lib/utils/date'
import { formatInTimeZone } from 'date-fns-tz'
import type { PendingEvent, PendingBatch } from '@/app/crew/(app)/calendar/pending/page'
import type { Location } from '@/types/show'
import type { AdminRole } from '@/types/admin'

const CT = 'America/Chicago'

const TYPE_LABELS: Record<string, string> = {
  performance: 'Performance',
  rehearsal: 'Rehearsal',
  teaching: 'Teaching',
  meeting: 'Meeting',
  event: 'Event',
  rental: 'Rental',
  other: 'Other',
}

const selectClasses =
  'rounded-lg border border-divider dark:border-dark-border px-2 py-1.5 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'

function eventDateLabel(startTime: string): string {
  return formatInTimeZone(new Date(startTime), CT, 'EEE, MMM d, yyyy')
}

function eventTimeLabel(event: { start_time: string; end_time: string }): string {
  return `${formatCT(event.start_time, 'h:mm a')} – ${formatCT(event.end_time, 'h:mm a')}`
}

function LocationSelect({
  locations,
  value,
  onChange,
}: {
  locations: Location[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <select className={selectClasses} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select location…</option>
      {locations.map((loc) => (
        <option key={loc.id} value={loc.id}>
          {loc.name}
        </option>
      ))}
    </select>
  )
}

function ConflictIndicator({ conflict, locationSelected }: { conflict: boolean | undefined; locationSelected: boolean }) {
  if (conflict === true) {
    return (
      <span className="text-xs font-medium text-orange dark:text-orange flex items-center gap-1">
        <AlertTriangle size={12} />
        Conflict
      </span>
    )
  }
  if (conflict === false && locationSelected) {
    return (
      <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
        <Check size={12} />
        Available
      </span>
    )
  }
  return <span className="text-xs text-mid-gray dark:text-dark-muted">—</span>
}

function EventDetails({ event }: { event: PendingEvent }) {
  return (
    <div className="text-sm text-mid-gray dark:text-dark-muted space-y-1">
      {event.custom_type_label && <p>Type: {event.custom_type_label}</p>}
      {event.description && <p>{event.description}</p>}
      {event.requirements && <p>Requirements: {event.requirements}</p>}
      {event.contacts.length > 0 && (
        <p>
          Contacts:{' '}
          {event.contacts.map((c) => `${c.name} (${c.phone})`).join(', ')}
        </p>
      )}
    </div>
  )
}

export default function PendingQueueClient({
  batches,
  individualEvents,
  locations,
  initialConflicts,
  // Accepted for interface consistency with sibling calendar components
  // (CalendarShell, CalendarDayPanel, etc., all of which take adminRole) and
  // for any future role-gated UI here. Not consumed today — this page is
  // already super_admin-only via the redirect guard in pending/page.tsx, and
  // every mutating action (approveCalendarEvent/approveBatch/cancelCalendarEvent)
  // independently re-verifies the role server-side.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  adminRole,
}: {
  batches: PendingBatch[]
  individualEvents: PendingEvent[]
  locations: Location[]
  initialConflicts: Record<string, boolean>
  adminRole: AdminRole
}) {
  const router = useRouter()
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set())
  const [locationSelections, setLocationSelections] = useState<Record<string, string>>({})
  const [batchDefaultLocation, setBatchDefaultLocation] = useState<Record<string, string>>({})
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [conflictStatus, setConflictStatus] = useState<Record<string, boolean>>(initialConflicts)
  const [batchConflictChecking, setBatchConflictChecking] = useState(false)

  const isEmpty = batches.length === 0 && individualEvents.length === 0

  function toggleBatch(id: string) {
    setExpandedBatches((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function setBusy(id: string, busy: boolean) {
    setBusyIds((prev) => {
      const next = new Set(prev)
      if (busy) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function setError(id: string, message: string | null) {
    setErrors((prev) => {
      const next = { ...prev }
      if (message) next[id] = message
      else delete next[id]
      return next
    })
  }

  async function handleApproveSingle(eventId: string, fallbackLocationId: string | null) {
    const locationId = locationSelections[eventId] ?? fallbackLocationId ?? ''
    if (!locationId) {
      setError(eventId, 'Select a location first')
      return
    }
    setBusy(eventId, true)
    setError(eventId, null)
    const result = await approveCalendarEvent(eventId, locationId)
    setBusy(eventId, false)
    if (!result.success) {
      setError(eventId, result.error ?? 'Something went wrong.')
      return
    }
    router.refresh()
  }

  async function handleReject(eventId: string) {
    setBusy(eventId, true)
    setError(eventId, null)
    const result = await cancelCalendarEvent(eventId)
    setBusy(eventId, false)
    if (!result.success) {
      setError(eventId, result.error ?? 'Something went wrong.')
      return
    }
    router.refresh()
  }

  async function handleLocationChange(eventId: string, locationId: string, startTime: string, endTime: string) {
    setLocationSelections((prev) => ({ ...prev, [eventId]: locationId }))
    if (!locationId) {
      setConflictStatus((prev) => ({ ...prev, [eventId]: false }))
      return
    }
    const date = formatInTimeZone(new Date(startTime), CT, 'yyyy-MM-dd')
    const startCT = formatInTimeZone(new Date(startTime), CT, 'HH:mm')
    const endCT = formatInTimeZone(new Date(endTime), CT, 'HH:mm')
    const result = await checkEventConflict(locationId, date, startCT, endCT, eventId)
    setConflictStatus((prev) => ({ ...prev, [eventId]: result.conflict }))
  }

  async function handleApplyDefaultLocation(batch: PendingBatch) {
    const defaultLoc = batchDefaultLocation[batch.id]
    if (!defaultLoc) return
    setLocationSelections((prev) => {
      const next = { ...prev }
      for (const event of batch.events) {
        next[event.id] = defaultLoc
      }
      return next
    })

    setBatchConflictChecking(true)
    for (const event of batch.events) {
      const date = formatInTimeZone(new Date(event.start_time), CT, 'yyyy-MM-dd')
      const startCT = formatInTimeZone(new Date(event.start_time), CT, 'HH:mm')
      const endCT = formatInTimeZone(new Date(event.end_time), CT, 'HH:mm')
      const result = await checkEventConflict(defaultLoc, date, startCT, endCT, event.id)
      setConflictStatus((prev) => ({ ...prev, [event.id]: result.conflict }))
    }
    setBatchConflictChecking(false)
  }

  async function handleApproveAllAvailable(batch: PendingBatch) {
    const approvals = batch.events
      .filter((e) => !!(locationSelections[e.id] ?? e.location_id))
      .map((e) => ({ eventId: e.id, locationId: (locationSelections[e.id] ?? e.location_id) as string }))

    if (approvals.length === 0) {
      setError(batch.id, 'Select a location for at least one date first')
      return
    }

    setBusy(batch.id, true)
    setError(batch.id, null)
    const result = await approveBatch(batch.id, approvals)
    setBusy(batch.id, false)

    if (!result.success) {
      setError(batch.id, result.error ?? 'Something went wrong.')
      return
    }

    if (result.skipped && result.skipped.length > 0) {
      setError(
        batch.id,
        `${result.approvedCount ?? 0} approved. ${result.skipped.length} skipped due to conflicts or errors.`
      )
    }
    router.refresh()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-4">Pending Calendar Requests</h1>

      {isEmpty && (
        <p className="text-sm text-mid-gray dark:text-dark-muted">Nothing waiting for approval right now.</p>
      )}

      {batches.length > 0 && (
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-mid-gray dark:text-dark-muted">
            Rehearsal Batches
          </h2>
          {batches.map((batch) => {
            const expanded = expandedBatches.has(batch.id)
            const isBusy = busyIds.has(batch.id)
            return (
              <div key={batch.id} className="rounded-lg border border-divider dark:border-dark-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleBatch(batch.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-light-navy/40 dark:bg-dark-bg hover:bg-light-navy dark:hover:bg-dark-bg/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <div>
                      <p className="font-semibold text-dark dark:text-dark-text">{batch.title}</p>
                      <p className="text-xs text-mid-gray dark:text-dark-muted">
                        {batch.events.length} date{batch.events.length === 1 ? '' : 's'} · submitted by{' '}
                        {batch.submitted_by_admin?.name ?? 'Unknown'}
                      </p>
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="p-4 space-y-3 border-t border-divider dark:border-dark-border">
                    <div className="flex items-center gap-2 flex-wrap">
                      <LocationSelect
                        locations={locations}
                        value={batchDefaultLocation[batch.id] ?? ''}
                        onChange={(id) => setBatchDefaultLocation((prev) => ({ ...prev, [batch.id]: id }))}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyDefaultLocation(batch)}
                        disabled={batchConflictChecking}
                        className="text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply to all dates
                      </button>
                      {batchConflictChecking && (
                        <span className="flex items-center gap-1.5 text-xs text-mid-gray dark:text-dark-muted">
                          <Loader2 size={12} className="animate-spin" />
                          Checking availability…
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleApproveAllAvailable(batch)}
                        disabled={isBusy || batchConflictChecking}
                        className="ml-auto flex items-center gap-2 bg-navy text-white font-semibold px-3 py-1.5 rounded-md text-sm hover:bg-steel transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isBusy && <Loader2 size={14} className="animate-spin" />}
                        Approve All Available
                      </button>
                    </div>
                    {errors[batch.id] && <p className="text-sm text-orange">{errors[batch.id]}</p>}

                    <div className="space-y-2">
                      {batch.events.map((event) => (
                        <div
                          key={event.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-divider dark:border-dark-border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-dark dark:text-dark-text">{eventDateLabel(event.start_time)}</p>
                            <p className="text-sm text-mid-gray dark:text-dark-muted">{eventTimeLabel(event)}</p>
                          </div>
                          <LocationSelect
                            locations={locations}
                            value={locationSelections[event.id] ?? ''}
                            onChange={(id) => handleLocationChange(event.id, id, event.start_time, event.end_time)}
                          />
                          <ConflictIndicator
                            conflict={conflictStatus[event.id]}
                            locationSelected={!!locationSelections[event.id]}
                          />
                          <button
                            type="button"
                            onClick={() => handleApproveSingle(event.id, event.location_id)}
                            disabled={
                              !(locationSelections[event.id] ?? event.location_id) ||
                              conflictStatus[event.id] === true ||
                              busyIds.has(event.id)
                            }
                            className="bg-navy text-white font-semibold px-3 py-1.5 rounded-md text-sm hover:bg-steel transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(event.id)}
                            disabled={busyIds.has(event.id)}
                            className="text-sm font-semibold text-orange hover:underline cursor-pointer disabled:opacity-50"
                          >
                            Skip
                          </button>
                          {errors[event.id] && <p className="text-sm text-orange w-full">{errors[event.id]}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {individualEvents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-mid-gray dark:text-dark-muted">
            Individual Requests
          </h2>
          {individualEvents.map((event) => (
            <div key={event.id} className="rounded-lg border border-divider dark:border-dark-border p-4 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-dark dark:text-dark-text">{event.title}</p>
                  <p className="text-sm text-mid-gray dark:text-dark-muted">
                    {TYPE_LABELS[event.event_type] ?? event.event_type} · {eventDateLabel(event.start_time)} ·{' '}
                    {eventTimeLabel(event)}
                  </p>
                  <p className="text-xs text-mid-gray dark:text-dark-muted">
                    Submitted by {event.submitted_by_admin?.name ?? 'Unknown'}
                  </p>
                </div>
              </div>
              <EventDetails event={event} />
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <LocationSelect
                  locations={locations}
                  value={locationSelections[event.id] ?? event.location_id ?? ''}
                  onChange={(id) => handleLocationChange(event.id, id, event.start_time, event.end_time)}
                />
                <ConflictIndicator
                  conflict={conflictStatus[event.id]}
                  locationSelected={!!(locationSelections[event.id] ?? event.location_id)}
                />
                <button
                  type="button"
                  onClick={() => handleApproveSingle(event.id, event.location_id)}
                  disabled={
                    !(locationSelections[event.id] ?? event.location_id) ||
                    conflictStatus[event.id] === true ||
                    busyIds.has(event.id)
                  }
                  className="bg-navy text-white font-semibold px-3 py-1.5 rounded-md text-sm hover:bg-steel transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(event.id)}
                  disabled={busyIds.has(event.id)}
                  className="text-sm font-semibold text-orange hover:underline cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>
                {errors[event.id] && <p className="text-sm text-orange w-full">{errors[event.id]}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
