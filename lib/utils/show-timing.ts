// Pure, client-safe. NO 'use server', NO 'server-only'.
// Single definition of "has this show date started?" shared by
// the claim server action and the /shows/[id] page (ADMIN.80).
import { fromZonedTime } from 'date-fns-tz'

export function getShowStartInstant(
  showDate: string | null | undefined,
  showTime: string | null | undefined,
  timezone: string
): Date | null {
  if (!showDate) return null
  const hhmm = (showTime ?? '').slice(0, 5)
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return null
  const start = fromZonedTime(`${showDate} ${hhmm}:00`, timezone)
  return Number.isNaN(start.getTime()) ? null : start
}

// True from the exact start instant onward (now >= start).
// Fails OPEN (returns false) when the start cannot be parsed, so
// bad data can never block legitimate sign-ups.
export function hasShowStarted(
  showDate: string | null | undefined,
  showTime: string | null | undefined,
  timezone: string,
  now: Date = new Date()
): boolean {
  const start = getShowStartInstant(showDate, showTime, timezone)
  if (!start) return false
  return now.getTime() >= start.getTime()
}
