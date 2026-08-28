'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatInTimeZone } from 'date-fns-tz'
import { getMonthGridDays } from '@/lib/utils/calendar-availability'
import { getHomeCalendarEvents } from '@/lib/actions/home-calendar'
import type { PublicCalendarEvent } from '@/lib/data/publicCalendar'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface HomeCalendarWidgetProps {
  initialYear: number
  initialMonth: number
  initialEvents: PublicCalendarEvent[]
}

export function HomeCalendarWidget({
  initialYear,
  initialMonth,
  initialEvents,
}: HomeCalendarWidgetProps) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [events, setEvents] = useState<PublicCalendarEvent[]>(initialEvents)
  const [isLoading, setIsLoading] = useState(false)

  const tz = typeof document !== 'undefined'
    ? (document.body.dataset.timezone || 'America/Chicago')
    : 'America/Chicago'

  async function goToMonth(newYear: number, newMonth: number) {
    setIsLoading(true)
    try {
      const newEvents = await getHomeCalendarEvents(newYear, newMonth)
      setEvents(newEvents)
      setYear(newYear)
      setMonth(newMonth)
    } finally {
      setIsLoading(false)
    }
  }

  function handlePrev() {
    if (month === 1) goToMonth(year - 1, 12)
    else goToMonth(year, month - 1)
  }

  function handleNext() {
    if (month === 12) goToMonth(year + 1, 1)
    else goToMonth(year, month + 1)
  }

  const monthDateStr = `${year}-${String(month).padStart(2, '0')}-01`
  const gridDays = getMonthGridDays(monthDateStr)
  const todayCT = formatInTimeZone(new Date(), tz, 'yyyy-MM-dd')

  const eventsByDay = new Map<string, PublicCalendarEvent[]>()
  for (const event of events) {
    const dayKey = formatInTimeZone(new Date(event.start_time), tz, 'yyyy-MM-dd')
    const list = eventsByDay.get(dayKey) ?? []
    list.push(event)
    eventsByDay.set(dayKey, list)
  }
  for (const list of eventsByDay.values()) {
    list.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-neutral-surface border-b border-neutral-border px-5 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isLoading}
          aria-label="Previous month"
          className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 text-gray-500"
        >
          ‹
        </button>
        <span className="font-semibold text-sm text-gray-700">{monthLabel}</span>
        <button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
          aria-label="Next month"
          className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 text-gray-500"
        >
          ›
        </button>
      </div>

      <div
        className={`bg-white px-3 py-3 transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((label) => (
            <div key={label} className="text-xs text-gray-400 text-center py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded overflow-hidden">
          {gridDays.map((dayStr) => {
            const [, m, d] = dayStr.split('-').map(Number)
            const isToday = dayStr === todayCT
            const isCurrentMonth = m === month
            const dayEvents = eventsByDay.get(dayStr) ?? []

            return (
              <div
                key={dayStr}
                className={`bg-white p-1 sm:p-1.5 min-h-[70px] sm:min-h-[80px] ${!isCurrentMonth ? 'opacity-40' : ''}`}
              >
                <p className={`text-xs font-semibold mb-1 ${isToday ? 'inline-block bg-brand-primary text-white rounded-full w-5 h-5 text-center leading-5' : 'text-dark'}`}>
                  {d}
                </p>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/shows/${event.show_id}`}
                      className="block rounded px-1.5 py-1 text-white text-[11px] leading-tight line-clamp-2 hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: event.location?.color ?? '#555555' }}
                      title={event.title}
                    >
                      {event.needsVolunteers && <span className="mr-1">●</span>}
                      {event.title}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
