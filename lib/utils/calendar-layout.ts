import { toZonedTime } from 'date-fns-tz'
import type { CalendarEvent } from '@/types/calendar'

const CT = 'America/Chicago'

export type EventWithLayout = CalendarEvent & {
  columnIndex: number
  columnCount: number
}

// Standard interval-scheduling column assignment: sort by start time, then
// greedily place each event in the first column whose last event has
// already ended. columnCount per event is the number of events whose time
// range overlaps it at all (a simple, correct proxy for "how many columns
// are needed at this point in time" — sufficient for a day's worth of
// events, which is never large enough to need the full max-clique
// computation).
export function computeColumnLayout(events: CalendarEvent[]): EventWithLayout[] {
  if (events.length === 0) return []

  const sorted = events.slice().sort((a, b) => {
    const startDiff = new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    if (startDiff !== 0) return startDiff
    return new Date(b.end_time).getTime() - new Date(a.end_time).getTime()
  })

  const columns: CalendarEvent[][] = []
  const columnIndexById = new Map<string, number>()

  for (const event of sorted) {
    const eventStart = new Date(event.start_time).getTime()
    let placed = false
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]
      const lastEvent = column[column.length - 1]
      if (new Date(lastEvent.end_time).getTime() <= eventStart) {
        column.push(event)
        columnIndexById.set(event.id, i)
        placed = true
        break
      }
    }
    if (!placed) {
      columns.push([event])
      columnIndexById.set(event.id, columns.length - 1)
    }
  }

  return sorted.map((event) => {
    const eventStart = new Date(event.start_time).getTime()
    const eventEnd = new Date(event.end_time).getTime()
    const overlapping = sorted.filter((other) => {
      const otherStart = new Date(other.start_time).getTime()
      const otherEnd = new Date(other.end_time).getTime()
      return otherStart < eventEnd && otherEnd > eventStart
    })
    return {
      ...event,
      columnIndex: columnIndexById.get(event.id) ?? 0,
      columnCount: Math.max(overlapping.length, 1),
    }
  })
}

export function computeEventPosition(
  startTime: Date,
  endTime: Date,
  hourHeight: number,
  dayStartHour: number
): { topPx: number; heightPx: number } {
  const startCT = toZonedTime(startTime, CT)
  const endCT = toZonedTime(endTime, CT)
  const startMinutes = startCT.getHours() * 60 + startCT.getMinutes()
  const endMinutes = endCT.getHours() * 60 + endCT.getMinutes()
  const topPx = ((startMinutes - dayStartHour * 60) / 60) * hourHeight
  const heightPx = Math.max(32, ((endMinutes - startMinutes) / 60) * hourHeight)
  return { topPx, heightPx }
}
