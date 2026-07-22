'use client'

import { formatCT } from '@/lib/utils/date'
import type { CalendarEvent } from '@/types/calendar'

export default function CalendarEventChip({
  event,
  compact,
  onClick,
}: {
  event: CalendarEvent
  compact: boolean
  onClick?: () => void
}) {
  // Non-super-admin fetches only ever return status = 'approved' events
  // (Task C's role-aware filter) — a pending event reaching this component
  // implies the viewer is already a Super Admin, so no adminRole check
  // is needed here.
  const isPending = event.status === 'pending'
  const color = event.location?.color ?? '#555555'

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={event.title}
        className={`w-full text-left text-xs font-semibold text-white rounded-full px-2 py-0.5 truncate cursor-pointer ${
          isPending ? 'border border-dashed border-amber-400' : ''
        }`}
        style={{ backgroundColor: color }}
      >
        {event.title}
        {isPending && <span className="ml-1 opacity-90">(Pending)</span>}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border-l-4 bg-white dark:bg-dark-surface px-3 py-2 hover:bg-light-navy/30 dark:hover:bg-dark-bg/40 transition-colors cursor-pointer ${
        isPending ? 'border-t border-r border-b border-dashed border-t-amber-400 border-r-amber-400 border-b-amber-400' : ''
      }`}
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium text-dark dark:text-dark-text">{event.title}</span>
        {isPending && (
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded px-1.5 py-0.5">
            Pending
          </span>
        )}
      </div>
      <p className="text-sm text-mid-gray dark:text-dark-muted">
        {formatCT(event.start_time, 'h:mm a')} – {formatCT(event.end_time, 'h:mm a')}
      </p>
      {event.location && (
        <span
          className="inline-block mt-1 text-xs font-semibold rounded-full px-2 py-0.5 text-white"
          style={{ backgroundColor: event.location.color }}
        >
          {event.location.name}
        </span>
      )}
    </button>
  )
}
