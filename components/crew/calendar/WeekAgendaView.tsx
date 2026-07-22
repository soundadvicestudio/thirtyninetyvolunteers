'use client'

import { formatInTimeZone } from 'date-fns-tz'
import CalendarEventChip from './CalendarEventChip'
import type { CalendarEvent } from '@/types/calendar'

const CT = 'America/Chicago'

export default function WeekAgendaView({
  events,
  days,
  onEventClick,
}: {
  events: CalendarEvent[]
  days: string[]
  onEventClick?: (dateStr: string) => void
}) {
  const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')

  const eventsByDay = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const dayStr = formatInTimeZone(new Date(event.start_time), CT, 'yyyy-MM-dd')
    if (!days.includes(dayStr)) continue
    const list = eventsByDay.get(dayStr) ?? []
    list.push(event)
    eventsByDay.set(dayStr, list)
  }
  for (const list of eventsByDay.values()) {
    list.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }

  const daysWithEvents = days.filter((d) => (eventsByDay.get(d) ?? []).length > 0)

  return (
    <div>
      {daysWithEvents.length === 0 ? (
        <p className="text-center py-12 text-sm text-mid-gray dark:text-dark-muted">No events this week.</p>
      ) : (
        <div className="space-y-6">
          {daysWithEvents.map((dayStr) => {
            const dayEvents = eventsByDay.get(dayStr) ?? []
            const isToday = dayStr === todayCT
            const [y, m, d] = dayStr.split('-').map(Number)
            const dateObj = new Date(Date.UTC(y, m - 1, d))
            const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
            const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })

            return (
              <div key={dayStr}>
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-divider dark:border-dark-border">
                  <h2 className="text-base font-semibold text-dark dark:text-dark-text">
                    {weekday}, {monthName} {d}
                  </h2>
                  {isToday && (
                    <span className="text-xs font-semibold bg-navy text-white rounded-full px-2 py-0.5">Today</span>
                  )}
                </div>
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <CalendarEventChip
                      key={event.id}
                      event={event}
                      compact={false}
                      onClick={() => onEventClick?.(dayStr)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <p className="text-xs text-mid-gray dark:text-dark-muted text-center mt-4">
        For the full weekly grid view, use a larger screen.
      </p>
    </div>
  )
}
