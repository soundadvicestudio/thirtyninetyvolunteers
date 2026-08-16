import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

/**
 * Format any date/time value in the org's configured timezone.
 * Handles DST automatically via the IANA zone. Use this function for ALL
 * date/time display throughout the app.
 *
 * @param date     — Date object, ISO string, or timestamp
 * @param fmt      — date-fns format string (e.g. 'MMM d, yyyy h:mm a')
 * @param timezone — IANA timezone string; defaults to 'America/Chicago'
 * @returns        — formatted string in the given timezone, e.g. "Jul 4, 2026 7:00 PM"
 */
export function formatCT(
  date: Date | string | number,
  fmt: string,
  timezone: string = 'America/Chicago'
): string {
  return formatInTimeZone(new Date(date), timezone, fmt)
}

/**
 * Format a `date` and/or `time` column pair (e.g. show_dates.show_date /
 * show_time) that is already a wall-clock value with no timezone attached.
 * Plain `new Date('YYYY-MM-DD')` or `new Date('YYYY-MM-DDTHH:mm')` is parsed
 * as UTC/local depending on the runtime's timezone — on Vercel (UTC) that
 * shifts the displayed date/time by several hours. fromZonedTime() anchors
 * the wall-clock value to the org timezone first (DST-aware) so the round
 * trip through formatInTimeZone is correct regardless of server timezone.
 *
 * @param dateStr  — 'YYYY-MM-DD' (from a `date` column)
 * @param timeStr  — 'HH:mm[:ss]' (from a `time` column), or null for date-only
 * @param fmt      — date-fns format string
 * @param timezone — IANA timezone string; defaults to 'America/Chicago'
 */
export function formatWallClockCT(
  dateStr: string,
  timeStr: string | null,
  fmt: string,
  timezone: string = 'America/Chicago'
): string {
  const wallClock = `${dateStr} ${timeStr ?? '00:00:00'}`
  return formatInTimeZone(fromZonedTime(wallClock, timezone), timezone, fmt)
}
