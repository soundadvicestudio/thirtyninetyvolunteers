'use client'

import { useEffect, useState } from 'react'
import { formatInTimeZone } from 'date-fns-tz'
import { computeColumnLayout, computeEventPosition } from '@/lib/utils/calendar-layout'
import type { CalendarEvent, ShowDateBuffer } from '@/types/calendar'

const CT = 'America/Chicago'
const HOUR_HEIGHT = 64
const DAY_START = 7
const DAY_END = 22
const TOTAL_HOURS = DAY_END - DAY_START // 15
const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT // 960px
const TIME_LABEL_WIDTH = 50

function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour} ${period}`
}

function clampToGrid(px: number): number {
  return Math.min(Math.max(px, 0), GRID_HEIGHT)
}

function useNowPosition(days: string[]) {
  const [nowMinutes, setNowMinutes] = useState<number | null>(null)

  useEffect(() => {
    function update() {
      const todayStr = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')
      if (!days.includes(todayStr)) {
        setNowMinutes(null)
        return
      }
      const nowHour = Number(formatInTimeZone(new Date(), CT, 'H'))
      const nowMin = Number(formatInTimeZone(new Date(), CT, 'm'))
      setNowMinutes(nowHour * 60 + nowMin)
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
    // days is a derived array (new reference each render) — re-running the
    // effect on every render would be harmless but wasteful; the interval
    // itself keeps the indicator fresh regardless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (nowMinutes === null) return null
  if (nowMinutes < DAY_START * 60 || nowMinutes >= DAY_END * 60) return null
  return ((nowMinutes - DAY_START * 60) / 60) * HOUR_HEIGHT
}

export default function UnifiedWeekGrid({
  events,
  bufferData,
  days,
  onEventClick,
}: {
  events: CalendarEvent[]
  bufferData: ShowDateBuffer[]
  days: string[]
  onEventClick?: (dateStr: string) => void
}) {
  const bufferByShowDateId = new Map(bufferData.map((b) => [b.show_date_id, b]))
  const nowTopPx = useNowPosition(days)
  const hourMarks = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => DAY_START + i)

  const eventsByDay = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const dayStr = formatInTimeZone(new Date(event.start_time), CT, 'yyyy-MM-dd')
    const list = eventsByDay.get(dayStr) ?? []
    list.push(event)
    eventsByDay.set(dayStr, list)
  }

  return (
    <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
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

          {nowTopPx !== null && (
            <div
              className="absolute left-0 right-0 border-t-2 border-red-500 pointer-events-none"
              style={{ top: nowTopPx, zIndex: 20 }}
            />
          )}

          <div className="grid grid-cols-7 h-full relative">
            {days.map((dayStr, dayIndex) => {
              const dayEvents = eventsByDay.get(dayStr) ?? []
              const laidOut = computeColumnLayout(dayEvents)

              return (
                <div
                  key={dayStr}
                  className={`relative border-divider dark:border-dark-border ${
                    dayIndex > 0 ? 'border-l' : ''
                  }`}
                >
                  {laidOut.map((event) => {
                    const { topPx, heightPx } = computeEventPosition(
                      new Date(event.start_time),
                      new Date(event.end_time),
                      HOUR_HEIGHT,
                      DAY_START
                    )
                    const colWidth = 100 / event.columnCount
                    const leftPercent = event.columnIndex * colWidth
                    const color = event.location?.color ?? '#555555'

                    const clampedTop = clampToGrid(topPx)
                    const clampedBottom = clampToGrid(topPx + heightPx)

                    const buffer =
                      event.source === 'show' && event.source_show_date_id
                        ? bufferByShowDateId.get(event.source_show_date_id)
                        : undefined

                    return (
                      <div key={event.id}>
                        {buffer && buffer.buffer_before_minutes > 0 && (
                          <div
                            className="absolute rounded-sm pointer-events-none"
                            style={{
                              top: clampToGrid(topPx - (buffer.buffer_before_minutes / 60) * HOUR_HEIGHT),
                              height: Math.max(
                                0,
                                clampedTop - clampToGrid(topPx - (buffer.buffer_before_minutes / 60) * HOUR_HEIGHT)
                              ),
                              left: `${leftPercent}%`,
                              width: `${colWidth}%`,
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
                              left: `${leftPercent}%`,
                              width: `${colWidth}%`,
                              backgroundColor: `${color}4D`,
                              zIndex: 5,
                            }}
                          />
                        )}
                        <div
                          onClick={() => onEventClick?.(dayStr)}
                          title={event.title}
                          className={`absolute overflow-hidden rounded-sm px-1 py-0.5 ${
                            onEventClick ? 'cursor-pointer' : ''
                          } ${event.status === 'pending' ? 'opacity-90 ring-2 ring-inset ring-white/50' : ''}`}
                          style={{
                            top: clampedTop,
                            height: Math.max(0, clampedBottom - clampedTop),
                            left: `${leftPercent}%`,
                            width: `${colWidth}%`,
                            backgroundColor: color,
                            zIndex: 10,
                            ...(event.status === 'pending' ? { borderStyle: 'dashed' } : {}),
                          }}
                        >
                          {heightPx >= 32 && (
                            <p className="text-xs font-medium text-white truncate leading-tight">{event.title}</p>
                          )}
                          {heightPx >= 48 && event.location?.name && (
                            <p className="text-xs text-white/80 truncate leading-tight">{event.location.name}</p>
                          )}
                          {heightPx >= 64 && (
                            <p className="text-xs text-white/70 truncate leading-tight">
                              {formatInTimeZone(new Date(event.start_time), CT, 'h:mm a')} –{' '}
                              {formatInTimeZone(new Date(event.end_time), CT, 'h:mm a')}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
