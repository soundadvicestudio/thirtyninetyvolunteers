import { fromZonedTime } from 'date-fns-tz'
import type { CalendarEvent } from '@/types/calendar'

const CT = 'America/Chicago'
const DAY_START_HOUR = 7 // 7:00 AM CT
const DAY_END_HOUR = 22 // 10:00 PM CT

export type AvailableWindow = {
  start: Date
  end: Date
}

export function getAvailableWindows(
  events: CalendarEvent[],
  locationId: string,
  dateStr: string
): AvailableWindow[] {
  const dayStart = fromZonedTime(`${dateStr} ${String(DAY_START_HOUR).padStart(2, '0')}:00:00`, CT)
  const dayEnd = fromZonedTime(`${dateStr} ${String(DAY_END_HOUR).padStart(2, '0')}:00:00`, CT)

  const sortedEvents = events
    .filter((e) => e.location_id === locationId && e.status === 'approved')
    .slice()
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  let cursor = dayStart
  const windows: AvailableWindow[] = []

  for (const event of sortedEvents) {
    const evStart = new Date(event.start_time)
    const evEnd = new Date(event.end_time)
    if (evStart > cursor) {
      windows.push({ start: cursor, end: evStart })
    }
    if (evEnd > cursor) {
      cursor = evEnd
    }
  }
  if (cursor < dayEnd) {
    windows.push({ start: cursor, end: dayEnd })
  }
  return windows
}

// UTC-anchored calendar grid helpers, shared by the calendar page (fetch
// range) and the Month/Week view components (render grid). Deliberately
// avoid date-fns's startOfMonth/startOfWeek here — those read local Date
// getters, which silently depend on the server/browser runtime's timezone.
// Working entirely in UTC getters/setters keeps grid math identical on
// Vercel (UTC), local dev (any timezone), and the browser.
function startOfWeekUTC(d: Date, weekStartsOn: number): Date {
  const day = d.getUTCDay()
  const diff = (day - weekStartsOn + 7) % 7
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff))
}

function endOfWeekUTC(d: Date, weekStartsOn: number): Date {
  const start = startOfWeekUTC(d, weekStartsOn)
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6))
}

function enumerateDays(start: Date, end: Date): string[] {
  const days: string[] = []
  const cursor = new Date(start)
  while (cursor.getTime() <= end.getTime()) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

// The 35 or 42 (5- or 6-week) grid day strings for the month containing
// dateStr, starting Sunday.
export function getMonthGridDays(dateStr: string): string[] {
  const [y, m] = dateStr.split('-').map(Number)
  const monthStart = new Date(Date.UTC(y, m - 1, 1))
  const monthEnd = new Date(Date.UTC(y, m, 0))
  const gridStart = startOfWeekUTC(monthStart, 0)
  const gridEnd = endOfWeekUTC(monthEnd, 0)
  return enumerateDays(gridStart, gridEnd)
}

// The 7 grid day strings (Mon–Sun) for the week containing dateStr.
export function getWeekGridDays(dateStr: string): string[] {
  const [y, m, d] = dateStr.split('-').map(Number)
  const anchor = new Date(Date.UTC(y, m - 1, d))
  const gridStart = startOfWeekUTC(anchor, 1)
  const gridEnd = endOfWeekUTC(anchor, 1)
  return enumerateDays(gridStart, gridEnd)
}
