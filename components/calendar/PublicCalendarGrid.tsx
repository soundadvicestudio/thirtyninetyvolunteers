'use client'

import Link from 'next/link'
import { formatInTimeZone } from 'date-fns-tz'
import { getMonthGridDays } from '@/lib/utils/calendar-availability'

const CT = 'America/Chicago'
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type PublicCalendarEvent = {
  id: string
  title: string
  start_time: string
  end_time: string
  show_id: string
  needsVolunteers: boolean
  location: { name: string; color: string } | null
}

export default function PublicCalendarGrid({
  events,
  focusedMonth,
  prevMonthUrl,
  nextMonthUrl,
}: {
  events: PublicCalendarEvent[]
  focusedMonth: { year: number; month: number }
  prevMonthUrl: string
  nextMonthUrl: string
}) {
  const monthDateStr = `${focusedMonth.year}-${String(focusedMonth.month).padStart(2, '0')}-01`
  const gridDays = getMonthGridDays(monthDateStr)
  const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')

  const eventsByDay = new Map<string, PublicCalendarEvent[]>()
  for (const event of events) {
    const dayKey = formatInTimeZone(new Date(event.start_time), CT, 'yyyy-MM-dd')
    const list = eventsByDay.get(dayKey) ?? []
    list.push(event)
    eventsByDay.set(dayKey, list)
  }
  for (const list of eventsByDay.values()) {
    list.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          href={prevMonthUrl}
          aria-label="Previous month"
          className="p-2 rounded hover:bg-light-navy text-navy"
        >
          ←
        </Link>
        <h2 className="text-navy font-bold text-lg sm:text-xl">
          {MONTH_NAMES[focusedMonth.month - 1]} {focusedMonth.year}
        </h2>
        <Link
          href={nextMonthUrl}
          aria-label="Next month"
          className="p-2 rounded hover:bg-light-navy text-navy"
        >
          →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-px bg-divider border border-divider rounded-t-lg overflow-hidden">
        {DAY_LABELS.map((label, i) => (
          <div key={label} className="bg-light-navy text-navy text-xs font-semibold uppercase text-center py-2">
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{DAY_LABELS_SHORT[i]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-divider border border-t-0 border-divider rounded-b-lg overflow-hidden">
        {gridDays.map((dayStr) => {
          const [, m, d] = dayStr.split('-').map(Number)
          const isToday = dayStr === todayCT
          const isCurrentMonth = m === focusedMonth.month
          const dayEvents = eventsByDay.get(dayStr) ?? []

          return (
            <div
              key={dayStr}
              className={`bg-white p-1 sm:p-2 min-h-[80px] sm:min-h-[100px] ${!isCurrentMonth ? 'opacity-40' : ''}`}
            >
              <p className={`text-xs font-semibold mb-1 ${isToday ? 'inline-block bg-navy text-white rounded-full w-5 h-5 text-center leading-5' : 'text-dark'}`}>
                {d}
              </p>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/shows/${event.show_id}`}
                    className="block rounded px-1.5 py-1 text-white text-xs leading-tight truncate hover:opacity-90 transition-opacity text-center sm:text-left"
                    style={{ backgroundColor: event.location?.color ?? '#555555' }}
                    title={event.title}
                  >
                    <span className="hidden sm:inline">
                      {event.needsVolunteers && <span className="mr-1">●</span>}
                      {event.title}
                    </span>
                    <span className="sm:hidden">{event.needsVolunteers ? '●' : '•'}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
