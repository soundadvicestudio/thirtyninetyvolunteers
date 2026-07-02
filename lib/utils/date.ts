import { formatInTimeZone } from 'date-fns-tz'

const CT = 'America/Chicago'

/**
 * Format any date/time value in Central Time (CT).
 * Handles DST automatically via the America/Chicago IANA zone.
 * Use this function for ALL date/time display throughout the app.
 *
 * @param date  — Date object, ISO string, or timestamp
 * @param fmt   — date-fns format string (e.g. 'MMM d, yyyy h:mm a')
 * @returns     — formatted string in CT, e.g. "Jul 4, 2026 7:00 PM"
 */
export function formatCT(date: Date | string | number, fmt: string): string {
  return formatInTimeZone(new Date(date), CT, fmt)
}
