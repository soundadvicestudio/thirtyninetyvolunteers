'use client'

import { formatInTimeZone } from 'date-fns-tz'
import { getWeekGridDays } from '@/lib/utils/calendar-availability'
import CalendarWeekGrid from './CalendarWeekGrid'
import type { CalendarEvent, ShowDateBuffer } from '@/types/calendar'
import type { Location } from '@/types/show'
import type { AdminRole } from '@/types/admin'

const CT = 'America/Chicago'
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TIME_LABEL_WIDTH = 52

export default function CalendarWeekView({
  events,
  bufferData,
  locations,
  focusedDate,
  showAllLocations,
  onDayClick,
}: {
  events: CalendarEvent[]
  bufferData: ShowDateBuffer[]
  locations: Location[]
  focusedDate: string
  showAllLocations: boolean
  onDayClick: (dateStr: string) => void
  adminRole: AdminRole
}) {
  const days = getWeekGridDays(focusedDate)
  const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')

  const eventsByLocation = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    if (!event.location_id) continue
    const list = eventsByLocation.get(event.location_id) ?? []
    list.push(event)
    eventsByLocation.set(event.location_id, list)
  }

  const visibleLocations = showAllLocations
    ? locations
    : locations.filter((loc) => (eventsByLocation.get(loc.id) ?? []).length > 0)

  return (
    <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="flex bg-light-navy dark:bg-dark-nav border-b border-divider dark:border-dark-border">
          <div className="shrink-0" style={{ width: TIME_LABEL_WIDTH + 128 }} />
          <div className="flex-1 grid grid-cols-7">
            {days.map((dayStr) => {
              const [, , d] = dayStr.split('-').map(Number)
              const isToday = dayStr === todayCT
              const weekday = WEEKDAY_SHORT[new Date(`${dayStr}T00:00:00Z`).getUTCDay()]
              return (
                <div
                  key={dayStr}
                  className={`px-2 py-2 text-xs font-semibold text-center ${
                    isToday ? 'bg-navy text-white' : 'text-dark dark:text-dark-text'
                  }`}
                >
                  {weekday} {d}
                </div>
              )
            })}
          </div>
        </div>

        {visibleLocations.length === 0 ? (
          <p className="p-6 text-sm text-mid-gray dark:text-dark-muted text-center">
            No locations have bookings this week.
          </p>
        ) : (
          visibleLocations.map((location) => (
            <div
              key={location.id}
              className="flex border-b border-divider dark:border-dark-border last:border-b-0"
            >
              <div className="w-32 shrink-0 flex items-center gap-2 px-2 py-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: location.color }}
                />
                <span className="text-sm font-semibold text-dark dark:text-dark-text truncate">
                  {location.name}
                </span>
              </div>
              <div className="flex-1 py-2">
                <CalendarWeekGrid
                  location={location}
                  events={eventsByLocation.get(location.id) ?? []}
                  bufferData={bufferData}
                  days={days}
                  onDayClick={onDayClick}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
