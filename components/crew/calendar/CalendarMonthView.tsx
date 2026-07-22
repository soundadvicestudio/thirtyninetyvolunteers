'use client'

import { formatInTimeZone } from 'date-fns-tz'
import { getMonthGridDays } from '@/lib/utils/calendar-availability'
import CalendarEventChip from './CalendarEventChip'
import type { CalendarEvent } from '@/types/calendar'
import type { AdminRole } from '@/types/admin'

const CT = 'America/Chicago'
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_VISIBLE_CHIPS = 3

export default function CalendarMonthView({
  events,
  focusedDate,
  onDayClick,
}: {
  events: CalendarEvent[]
  focusedDate: string
  onDayClick: (dateStr: string) => void
  adminRole: AdminRole
}) {
  const gridDays = getMonthGridDays(focusedDate)
  const [focusYear, focusMonth] = focusedDate.split('-').map(Number)
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

  return (
    <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 bg-light-navy dark:bg-dark-nav">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-xs font-semibold text-dark dark:text-dark-text text-center"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {gridDays.map((dayStr) => {
          const [y, m, d] = dayStr.split('-').map(Number)
          const isCurrentMonth = y === focusYear && m === focusMonth
          const isToday = dayStr === todayCT
          const dayEvents = eventsByDay.get(dayStr) ?? []
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_CHIPS)
          const overflowCount = dayEvents.length - visibleEvents.length

          return (
            <div
              key={dayStr}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(dayStr)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onDayClick(dayStr)
                }
              }}
              className={`flex flex-col items-stretch text-left p-1.5 border-t border-l border-divider dark:border-dark-border min-h-[120px] cursor-pointer hover:bg-light-navy/30 dark:hover:bg-dark-bg/40 transition-colors ${
                isCurrentMonth ? '' : 'bg-gray-50 dark:bg-dark-bg/20'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mb-1 ${
                  isToday
                    ? 'bg-navy text-white'
                    : isCurrentMonth
                      ? 'text-dark dark:text-dark-text'
                      : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {d}
              </span>
              <div className="space-y-1">
                {visibleEvents.map((event) => (
                  <CalendarEventChip key={event.id} event={event} compact />
                ))}
                {overflowCount > 0 && (
                  <span className="block text-xs font-semibold text-navy dark:text-steel px-1">
                    +{overflowCount} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
