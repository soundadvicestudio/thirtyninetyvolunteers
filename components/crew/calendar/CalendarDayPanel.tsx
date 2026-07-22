'use client'

import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { X } from 'lucide-react'
import { getAvailableWindows } from '@/lib/utils/calendar-availability'
import { formatCT } from '@/lib/utils/date'
import type { CalendarEvent } from '@/types/calendar'
import type { Location } from '@/types/show'
import type { AdminRole } from '@/types/admin'

const CT = 'America/Chicago'

export default function CalendarDayPanel({
  date,
  events,
  locations,
  adminRole,
  onClose,
  onEditEvent,
}: {
  date: string
  events: CalendarEvent[]
  locations: Location[]
  adminRole: AdminRole
  onClose: () => void
  onEditEvent: (event: CalendarEvent) => void
}) {
  const headerDate = formatInTimeZone(fromZonedTime(`${date} 07:00:00`, CT), CT, 'EEEE, MMMM d, yyyy')

  const sortedEvents = events
    .slice()
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed z-50 bg-white dark:bg-dark-surface shadow-xl flex flex-col left-0 right-0 bottom-0 h-[60vh] md:left-auto md:right-0 md:top-0 md:bottom-auto md:h-full md:w-[380px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-divider dark:border-dark-border shrink-0">
          <h2 className="text-base font-bold text-dark dark:text-dark-text">{headerDate}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-mid-gray dark:text-dark-muted mb-2">
              Booked
            </h3>
            {sortedEvents.length === 0 ? (
              <p className="text-sm text-mid-gray dark:text-dark-muted">Nothing booked for this day.</p>
            ) : (
              <ul className="space-y-3">
                {sortedEvents.map((event) => (
                  <li key={event.id} className="flex items-start gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: event.location?.color ?? '#555555' }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-mid-gray dark:text-dark-muted">
                        {formatCT(event.start_time, 'h:mm a')} – {formatCT(event.end_time, 'h:mm a')}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-dark dark:text-dark-text">{event.title}</p>
                        {event.status === 'pending' && adminRole === 'super_admin' && (
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded px-1.5 py-0.5">
                            Pending
                          </span>
                        )}
                      </div>
                      {event.location && (
                        <p className="text-sm text-mid-gray dark:text-dark-muted">{event.location.name}</p>
                      )}
                    </div>
                    {adminRole === 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => onEditEvent(event)}
                        className="text-xs text-navy hover:underline dark:text-steel ml-auto shrink-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-mid-gray dark:text-dark-muted mb-2">
              Available Windows
            </h3>
            <ul className="space-y-2">
              {locations.map((location) => {
                const windows = getAvailableWindows(events, location.id, date)
                const hasAnyApprovedEvent = events.some(
                  (e) => e.location_id === location.id && e.status === 'approved'
                )

                let windowsLabel: string
                if (windows.length === 0) {
                  windowsLabel = 'No availability'
                } else if (!hasAnyApprovedEvent) {
                  windowsLabel = '7:00 AM – 10:00 PM (open all day)'
                } else {
                  windowsLabel = windows
                    .map(
                      (w) =>
                        `${formatInTimeZone(w.start, CT, 'h:mm a')} – ${formatInTimeZone(w.end, CT, 'h:mm a')}`
                    )
                    .join(', ')
                }

                return (
                  <li key={location.id} className="text-sm text-dark dark:text-dark-text">
                    <span className="font-medium">{location.name}:</span>{' '}
                    <span className="text-mid-gray dark:text-dark-muted">{windowsLabel}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
