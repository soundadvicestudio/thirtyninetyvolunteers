'use client'

import { toZonedTime } from 'date-fns-tz'
import type { CalendarEvent, ShowDateBuffer } from '@/types/calendar'
import type { Location } from '@/types/show'

const CT = 'America/Chicago'
const HOUR_HEIGHT = 64 // px per hour row
const DAY_START = 7 // 7 AM
const DAY_END = 22 // 10 PM
const TOTAL_HOURS = DAY_END - DAY_START // 15
const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT // 960px
const TIME_LABEL_WIDTH = 52

function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour} ${period}`
}

// toZonedTime() shifts the Date's underlying instant so that its LOCAL
// getters (getHours, getDate, etc — not the UTC variants) read as CT
// wall-clock values, regardless of the runtime's own timezone. Only the
// local getters are meaningful on the result; toISOString() would still
// print the real UTC instant.
function localDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function minutesOfDayCT(isoString: string): number {
  const zoned = toZonedTime(new Date(isoString), CT)
  return zoned.getHours() * 60 + zoned.getMinutes()
}

function clampToGrid(px: number): number {
  return Math.min(Math.max(px, 0), GRID_HEIGHT)
}

export default function CalendarWeekGrid({
  location,
  events,
  bufferData,
  days,
  onDayClick,
}: {
  location: Location
  events: CalendarEvent[]
  bufferData: ShowDateBuffer[]
  days: string[]
  onDayClick: (dateStr: string) => void
}) {
  const bufferByShowDateId = new Map(bufferData.map((b) => [b.show_date_id, b]))

  const nowCT = toZonedTime(new Date(), CT)
  const nowMinutes = nowCT.getHours() * 60 + nowCT.getMinutes()
  const todayStr = localDateStr(nowCT)
  const showNowLine = nowMinutes >= DAY_START * 60 && nowMinutes < DAY_END * 60 && days.includes(todayStr)
  const nowTopPx = ((nowMinutes - DAY_START * 60) / 60) * HOUR_HEIGHT

  const eventsByDay = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const dayStr = localDateStr(toZonedTime(new Date(event.start_time), CT))
    const list = eventsByDay.get(dayStr) ?? []
    list.push(event)
    eventsByDay.set(dayStr, list)
  }

  const hourMarks = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START + i)

  return (
    <div className="flex">
      <div className="shrink-0 relative" style={{ width: TIME_LABEL_WIDTH, height: GRID_HEIGHT }}>
        {hourMarks.map((hour) => (
          <div
            key={hour}
            className="absolute right-1 text-[10px] text-mid-gray dark:text-dark-muted -translate-y-1/2"
            style={{ top: (hour - DAY_START) * HOUR_HEIGHT }}
          >
            {formatHourLabel(hour)}
          </div>
        ))}
      </div>

      <div className="flex-1 relative" style={{ height: GRID_HEIGHT }}>
        {hourMarks.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-divider dark:border-dark-border pointer-events-none"
            style={{ top: (hour - DAY_START) * HOUR_HEIGHT }}
          />
        ))}

        {showNowLine && (
          <div
            className="absolute left-0 right-0 border-t-2 border-red-500 pointer-events-none"
            style={{ top: nowTopPx, zIndex: 20 }}
          />
        )}

        <div className="grid grid-cols-7 h-full relative">
          {days.map((dayStr) => {
            const dayEvents = eventsByDay.get(dayStr) ?? []
            return (
              <div
                key={dayStr}
                className="relative border-l border-divider dark:border-dark-border first:border-l-0"
              >
                {dayEvents.map((event) => {
                  const startMinutes = minutesOfDayCT(event.start_time)
                  const endMinutes = minutesOfDayCT(event.end_time)
                  const topPx = ((startMinutes - DAY_START * 60) / 60) * HOUR_HEIGHT
                  const heightPx = Math.max(32, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT)
                  const color = location.color

                  const buffer =
                    event.source === 'show' && event.source_show_date_id
                      ? bufferByShowDateId.get(event.source_show_date_id)
                      : undefined

                  const clampedTop = clampToGrid(topPx)
                  const clampedBottom = clampToGrid(topPx + heightPx)

                  return (
                    <div key={event.id}>
                      {buffer && buffer.buffer_before_minutes > 0 && (
                        <div
                          className="absolute rounded-sm pointer-events-none"
                          style={{
                            top: clampToGrid(topPx - (buffer.buffer_before_minutes / 60) * HOUR_HEIGHT),
                            height: Math.max(0, clampedTop - clampToGrid(topPx - (buffer.buffer_before_minutes / 60) * HOUR_HEIGHT)),
                            width: 'calc(100% - 4px)',
                            left: 2,
                            backgroundColor: `${color}4D`,
                            zIndex: 5,
                          }}
                        />
                      )}
                      {buffer && buffer.buffer_after_minutes > 0 && (
                        <div
                          className="absolute rounded-sm pointer-events-none"
                          style={{
                            top: clampedBottom,
                            height: Math.max(
                              0,
                              clampToGrid(topPx + heightPx + (buffer.buffer_after_minutes / 60) * HOUR_HEIGHT) -
                                clampedBottom
                            ),
                            width: 'calc(100% - 4px)',
                            left: 2,
                            backgroundColor: `${color}4D`,
                            zIndex: 5,
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => onDayClick(dayStr)}
                        title={event.title}
                        className="absolute text-white text-xs overflow-hidden rounded-sm cursor-pointer text-left px-1 py-0.5"
                        style={{
                          top: clampedTop,
                          height: Math.max(0, clampedBottom - clampedTop),
                          width: 'calc(100% - 4px)',
                          left: 2,
                          backgroundColor: color,
                          zIndex: 10,
                        }}
                      >
                        {event.title}
                      </button>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
