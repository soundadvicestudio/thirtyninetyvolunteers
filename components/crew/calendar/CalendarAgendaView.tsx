'use client'

import { formatInTimeZone } from 'date-fns-tz'
import CalendarEventChip from './CalendarEventChip'
import type { CalendarEvent, CalendarEventType } from '@/types/calendar'
import type { AdminRole } from '@/types/admin'

const CT = 'America/Chicago'

const TYPE_BADGE_COLORS: Record<CalendarEventType, string> = {
  performance: '#293994',
  rehearsal: '#729ABF',
  teaching: '#0D9488',
  meeting: '#555555',
  event: '#F26522',
  rental: '#7C3AED',
  other: '#97ACBF',
}

const TYPE_LABELS: Record<CalendarEventType, string> = {
  performance: 'Performance',
  rehearsal: 'Rehearsal',
  teaching: 'Teaching',
  meeting: 'Meeting',
  event: 'Event',
  rental: 'Rental',
  other: 'Other',
}

export default function CalendarAgendaView({
  events,
  onDayClick,
}: {
  events: CalendarEvent[]
  focusedDate: string
  onDayClick: (dateStr: string) => void
  adminRole: AdminRole
}) {
  const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')

  const eventsByDay = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const dayStr = formatInTimeZone(new Date(event.start_time), CT, 'yyyy-MM-dd')
    const list = eventsByDay.get(dayStr) ?? []
    list.push(event)
    eventsByDay.set(dayStr, list)
  }
  for (const list of eventsByDay.values()) {
    list.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }

  const sortedDays = [...eventsByDay.keys()].sort()

  if (sortedDays.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-dark dark:text-dark-text text-lg font-semibold mb-1">
          No events in the next 90 days
        </p>
        <p className="text-sm text-mid-gray dark:text-dark-muted">
          Events will appear here once they are added to the calendar.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sortedDays.map((dayStr) => {
        const dayEvents = eventsByDay.get(dayStr) ?? []
        const isToday = dayStr === todayCT
        const [y, m, d] = dayStr.split('-').map(Number)
        const dateObj = new Date(Date.UTC(y, m - 1, d))
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
        const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })

        return (
          <div key={dayStr}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-divider dark:border-dark-border">
              <h2 className="text-lg font-semibold text-dark dark:text-dark-text">
                {weekday}, {monthName} {d}, {y}
              </h2>
              {isToday && (
                <span className="text-xs font-semibold bg-navy text-white rounded-full px-2 py-0.5">
                  Today
                </span>
              )}
            </div>
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <CalendarEventChip event={event} compact={false} onClick={() => onDayClick(dayStr)} />
                  </div>
                  <span
                    className="shrink-0 mt-2 text-xs font-semibold text-white rounded-full px-2 py-0.5"
                    style={{ backgroundColor: TYPE_BADGE_COLORS[event.event_type] }}
                  >
                    {TYPE_LABELS[event.event_type]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
