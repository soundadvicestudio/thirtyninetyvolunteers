'use client'

import { formatInTimeZone } from 'date-fns-tz'
import { getWeekGridDays } from '@/lib/utils/calendar-availability'
import UnifiedWeekGrid from './UnifiedWeekGrid'
import WeekAgendaView from './WeekAgendaView'
import type { CalendarEvent, ShowDateBuffer } from '@/types/calendar'
import type { AdminRole } from '@/types/admin'

const CT = 'America/Chicago'
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarWeekView({
  events,
  bufferData,
  focusedDate,
  onDayClick,
}: {
  events: CalendarEvent[]
  bufferData: ShowDateBuffer[]
  focusedDate: string
  onDayClick: (dateStr: string) => void
  adminRole: AdminRole
}) {
  const days = getWeekGridDays(focusedDate)
  const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')

  return (
    <div>
      {/* Day column headers — labels the UnifiedWeekGrid's 7 columns on
          desktop. Omitted on mobile since WeekAgendaView already labels
          each day inline (a duplicate compact header above the agenda
          list would just repeat the same information). */}
      <div className="hidden md:block border border-divider dark:border-dark-border rounded-lg overflow-hidden mb-2">
        <div className="flex bg-light-navy dark:bg-dark-nav">
          <div className="shrink-0" style={{ width: 50 }} />
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
      </div>

      <div className="hidden md:block">
        <UnifiedWeekGrid events={events} bufferData={bufferData} days={days} onEventClick={onDayClick} />
      </div>

      <div className="md:hidden">
        <WeekAgendaView events={events} days={days} onEventClick={onDayClick} />
      </div>
    </div>
  )
}
