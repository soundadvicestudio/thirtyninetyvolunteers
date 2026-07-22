'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { getWeekGridDays } from '@/lib/utils/calendar-availability'
import CalendarFilterBar from './CalendarFilterBar'
import CalendarMonthView from './CalendarMonthView'
import CalendarWeekView from './CalendarWeekView'
import CalendarAgendaView from './CalendarAgendaView'
import CalendarDayPanel from './CalendarDayPanel'
import type { CalendarEvent, ShowDateBuffer } from '@/types/calendar'
import type { Location } from '@/types/show'
import type { AdminRole } from '@/types/admin'

const CT = 'America/Chicago'
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type CalendarView = 'month' | 'week' | 'agenda'

function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

function addMonthsToDateStr(dateStr: string, months: number): string {
  const [y, m] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1 + months, 1)).toISOString().slice(0, 10)
}

function getPeriodLabel(view: CalendarView, focusedDate: string): string {
  if (view === 'agenda') return 'Next 90 Days'

  if (view === 'month') {
    const [y, m] = focusedDate.split('-').map(Number)
    return `${MONTH_NAMES[m - 1]} ${y}`
  }

  const gridDays = getWeekGridDays(focusedDate)
  const start = gridDays[0]
  const end = gridDays[gridDays.length - 1]
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const startLabel = `${MONTH_NAMES[sm - 1].slice(0, 3)} ${sd}`
  if (sy === ey && sm === em) {
    return `${startLabel} – ${ed}, ${ey}`
  }
  return `${startLabel} – ${MONTH_NAMES[em - 1].slice(0, 3)} ${ed}, ${ey}`
}

export default function CalendarShell({
  events,
  locations,
  bufferData,
  adminRole,
  initialView,
  initialDate,
  initialLocationFilter,
  initialTypeFilter,
  initialShowLocations,
}: {
  events: CalendarEvent[]
  locations: Location[]
  seasons: { id: string; name: string }[]
  bufferData: ShowDateBuffer[]
  adminRole: AdminRole
  calendarEditor: boolean
  initialView: string
  initialDate: string
  initialLocationFilter: string[]
  initialTypeFilter: string[]
  initialSeason: string | null
  initialShowLocations: string
}) {
  const router = useRouter()
  const [view, setView] = useState<CalendarView>(
    initialView === 'week' || initialView === 'agenda' ? initialView : 'month'
  )
  const [focusedDate, setFocusedDate] = useState(initialDate)
  const [locationFilter, setLocationFilter] = useState<string[]>(initialLocationFilter)
  const [typeFilter, setTypeFilter] = useState<string[]>(initialTypeFilter)
  const [showLocations, setShowLocations] = useState(initialShowLocations)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')

  function buildUrl(nextView: CalendarView, nextDate: string, locs: string[], types: string[], showLocs: string) {
    const params = new URLSearchParams()
    params.set('view', nextView)
    params.set('date', nextDate)
    if (locs.length) params.set('locations', locs.join(','))
    if (types.length) params.set('types', types.join(','))
    if (showLocs !== 'all') params.set('show_locations', showLocs)
    return `/crew/calendar?${params.toString()}`
  }

  // View/date changes need a real server re-fetch (the date range changes),
  // so these use router.push(). Filter changes below intentionally do not.
  function navigate(nextView: CalendarView, nextDate: string) {
    setView(nextView)
    setFocusedDate(nextDate)
    router.push(buildUrl(nextView, nextDate, locationFilter, typeFilter, showLocations))
  }

  // Filter changes are applied client-side only — the already-fetched
  // events array is filtered in place. The URL is still updated (for
  // shareable links) via direct history manipulation, bypassing the
  // Next.js router so no server re-fetch is triggered.
  function syncFilterUrl(locs: string[], types: string[], showLocs: string) {
    const url = buildUrl(view, focusedDate, locs, types, showLocs)
    window.history.replaceState(null, '', url)
  }

  function handleViewChange(nextView: CalendarView) {
    navigate(nextView, focusedDate)
  }

  function handlePrev() {
    const nextDate = view === 'week' ? addDaysToDateStr(focusedDate, -7) : addMonthsToDateStr(focusedDate, -1)
    navigate(view, nextDate)
  }

  function handleNext() {
    const nextDate = view === 'week' ? addDaysToDateStr(focusedDate, 7) : addMonthsToDateStr(focusedDate, 1)
    navigate(view, nextDate)
  }

  function handleToday() {
    navigate(view, todayCT)
  }

  function handleLocationFilterChange(ids: string[]) {
    setLocationFilter(ids)
    syncFilterUrl(ids, typeFilter, showLocations)
  }

  function handleTypeFilterChange(types: string[]) {
    setTypeFilter(types)
    syncFilterUrl(locationFilter, types, showLocations)
  }

  function handleShowLocationsChange(val: string) {
    setShowLocations(val)
    syncFilterUrl(locationFilter, typeFilter, val)
  }

  function handleClearFilters() {
    setLocationFilter([])
    setTypeFilter([])
    syncFilterUrl([], [], showLocations)
  }

  const filteredEvents = events.filter((e) => {
    if (locationFilter.length > 0 && (!e.location_id || !locationFilter.includes(e.location_id))) return false
    if (typeFilter.length > 0 && !typeFilter.includes(e.event_type)) return false
    return true
  })

  // Day panel always shows real availability regardless of active filters,
  // so it reads from the unfiltered events array.
  const dayPanelEvents = selectedDate
    ? events.filter((e) => formatInTimeZone(new Date(e.start_time), CT, 'yyyy-MM-dd') === selectedDate)
    : []

  const periodLabel = getPeriodLabel(view, focusedDate)
  const hasActiveFilters = locationFilter.length > 0 || typeFilter.length > 0

  return (
    <div>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Master Calendar</h1>
          <div className="flex items-center gap-1 bg-light-navy dark:bg-dark-nav rounded-lg p-1">
            {(['month', 'week', 'agenda'] as CalendarView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleViewChange(v)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors cursor-pointer ${
                  view === v
                    ? 'bg-navy text-white'
                    : 'text-dark dark:text-dark-text hover:bg-white/50 dark:hover:bg-dark-surface/50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {view !== 'agenda' && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous"
                className="p-2 rounded hover:bg-light-navy dark:hover:bg-dark-surface/50 text-dark dark:text-dark-text cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next"
                className="p-2 rounded hover:bg-light-navy dark:hover:bg-dark-surface/50 text-dark dark:text-dark-text cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleToday}
            className="text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
          >
            Today
          </button>
          <span className="text-sm font-semibold text-dark dark:text-dark-text ml-2">{periodLabel}</span>
        </div>
      </div>

      <CalendarFilterBar
        locations={locations}
        currentLocationFilter={locationFilter}
        currentTypeFilter={typeFilter}
        showLocations={showLocations}
        activeView={view}
        onLocationFilterChange={handleLocationFilterChange}
        onTypeFilterChange={handleTypeFilterChange}
        onShowLocationsChange={handleShowLocationsChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="mt-4">
        {view === 'month' && (
          <CalendarMonthView
            events={filteredEvents}
            focusedDate={focusedDate}
            onDayClick={setSelectedDate}
            adminRole={adminRole}
          />
        )}
        {view === 'week' && (
          <CalendarWeekView
            events={filteredEvents}
            bufferData={bufferData}
            locations={locations}
            focusedDate={focusedDate}
            showAllLocations={showLocations === 'all'}
            onDayClick={setSelectedDate}
            adminRole={adminRole}
          />
        )}
        {view === 'agenda' && (
          <CalendarAgendaView
            events={filteredEvents}
            focusedDate={focusedDate}
            onDayClick={setSelectedDate}
            adminRole={adminRole}
          />
        )}
      </div>

      {selectedDate && (
        <CalendarDayPanel
          date={selectedDate}
          events={dayPanelEvents}
          locations={locations}
          adminRole={adminRole}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
