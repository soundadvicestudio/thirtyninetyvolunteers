'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ChevronDown, CalendarSearch, Download, MoreHorizontal } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { getWeekGridDays } from '@/lib/utils/calendar-availability'
import CalendarFilterBar from './CalendarFilterBar'
import CalendarLegend from './CalendarLegend'
import CalendarMonthView from './CalendarMonthView'
import CalendarWeekView from './CalendarWeekView'
import CalendarAgendaView from './CalendarAgendaView'
import CalendarDayPanel from './CalendarDayPanel'
import CalendarEventForm, { type CalendarBookingPrefill } from './CalendarEventForm'
import CalendarBulkRehearsalForm from './CalendarBulkRehearsalForm'
import CalendarBookSpacePanel from './CalendarBookSpacePanel'
import CalendarExportModal from './CalendarExportModal'
import CalendarRecurringEventForm from './CalendarRecurringEventForm'
import RecurrenceScopePicker from './RecurrenceScopePicker'
import { cancelCalendarEvent, cancelRecurringOccurrence } from '@/lib/actions/calendar'
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
  seasons,
  bufferData,
  adminRole,
  calendarEditor,
  subscriptionToken,
  pendingCount,
  initialView,
  initialDate,
  initialLocationFilter,
  initialTypeFilter,
  initialSeason,
}: {
  events: CalendarEvent[]
  locations: Location[]
  seasons: { id: string; name: string }[]
  bufferData: ShowDateBuffer[]
  adminRole: AdminRole
  calendarEditor: boolean
  subscriptionToken: string
  pendingCount: number
  initialView: string
  initialDate: string
  initialLocationFilter: string[]
  initialTypeFilter: string[]
  initialSeason: string | null
}) {
  const router = useRouter()
  const [view, setView] = useState<CalendarView>(
    initialView === 'week' || initialView === 'agenda' ? initialView : 'month'
  )
  const [focusedDate, setFocusedDate] = useState(initialDate)
  const [locationFilter, setLocationFilter] = useState<string[]>(initialLocationFilter)
  const [typeFilter, setTypeFilter] = useState<string[]>(initialTypeFilter)
  const [seasonFilter, setSeasonFilter] = useState<string | null>(initialSeason)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(false)
  const [bulkFormOpen, setBulkFormOpen] = useState(false)
  const [bookSpaceOpen, setBookSpaceOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [prefilledBooking, setPrefilledBooking] = useState<CalendarBookingPrefill | null>(null)
  const [recurringFormOpen, setRecurringFormOpen] = useState(false)
  const [scopePickerEvent, setScopePickerEvent] = useState<CalendarEvent | null>(null)
  const [scopePickerMode, setScopePickerMode] = useState<'edit' | 'cancel' | null>(null)
  const [editScope, setEditScope] = useState<'this' | 'future' | 'all'>('this')
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  const canDirectCreate = adminRole === 'super_admin' || calendarEditor

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuOpen(false)
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')

  function buildUrl(nextView: CalendarView, nextDate: string, locs: string[], types: string[], season: string | null) {
    const params = new URLSearchParams()
    params.set('view', nextView)
    params.set('date', nextDate)
    if (locs.length) params.set('locations', locs.join(','))
    if (types.length) params.set('types', types.join(','))
    if (season) params.set('season', season)
    return `/crew/calendar?${params.toString()}`
  }

  // View/date/season changes need a real server re-fetch — season requires
  // a DB join through shows (resolved server-side in page.tsx), unlike
  // location/type which are pure client-side filters — so these use
  // router.push(). Location/type filter changes below intentionally do not.
  function navigate(nextView: CalendarView, nextDate: string, nextSeason: string | null) {
    setView(nextView)
    setFocusedDate(nextDate)
    setSeasonFilter(nextSeason)
    router.push(buildUrl(nextView, nextDate, locationFilter, typeFilter, nextSeason))
  }

  // Location/type changes are applied client-side only — the already-fetched
  // events array is filtered in place. The URL is still updated (for
  // shareable links) via direct history manipulation, bypassing the
  // Next.js router so no server re-fetch is triggered.
  function syncFilterUrl(locs: string[], types: string[]) {
    const url = buildUrl(view, focusedDate, locs, types, seasonFilter)
    window.history.replaceState(null, '', url)
  }

  function handleViewChange(nextView: CalendarView) {
    navigate(nextView, focusedDate, seasonFilter)
  }

  function handlePrev() {
    const nextDate = view === 'week' ? addDaysToDateStr(focusedDate, -7) : addMonthsToDateStr(focusedDate, -1)
    navigate(view, nextDate, seasonFilter)
  }

  function handleNext() {
    const nextDate = view === 'week' ? addDaysToDateStr(focusedDate, 7) : addMonthsToDateStr(focusedDate, 1)
    navigate(view, nextDate, seasonFilter)
  }

  function handleToday() {
    navigate(view, todayCT, seasonFilter)
  }

  function handleLocationFilterChange(ids: string[]) {
    setLocationFilter(ids)
    syncFilterUrl(ids, typeFilter)
  }

  function handleTypeFilterChange(types: string[]) {
    setTypeFilter(types)
    syncFilterUrl(locationFilter, types)
  }

  function handleSeasonFilterChange(id: string | null) {
    navigate(view, focusedDate, id)
  }

  function handleClearFilters() {
    setLocationFilter([])
    setTypeFilter([])
    if (seasonFilter) {
      // Season requires a server re-fetch to actually clear.
      navigate(view, focusedDate, null)
    } else {
      syncFilterUrl([], [])
    }
  }

  function handleEditEvent(event: CalendarEvent) {
    setEditingEvent(event)
    setFormOpen(true)
  }

  function handleEditRecurringEvent(event: CalendarEvent) {
    setScopePickerEvent(event)
    setScopePickerMode('edit')
  }

  function handleCancelRecurringEvent(event: CalendarEvent) {
    setScopePickerEvent(event)
    setScopePickerMode('cancel')
  }

  async function handleScopeSelected(scope: 'this' | 'future' | 'all') {
    if (!scopePickerEvent || !scopePickerMode) return
    if (scopePickerMode === 'edit') {
      setEditScope(scope)
      setEditingEvent(scopePickerEvent)
      setFormOpen(true)
    } else {
      const result = await cancelRecurringOccurrence(scopePickerEvent.id, scope)
      if (result.success) router.refresh()
    }
    setScopePickerEvent(null)
    setScopePickerMode(null)
  }

  async function handleCancelEvent(event: CalendarEvent) {
    const result = await cancelCalendarEvent(event.id)
    if (result.success) router.refresh()
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
  const hasActiveFilters = locationFilter.length > 0 || typeFilter.length > 0 || seasonFilter !== null

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

          <div className="ml-auto flex items-center gap-2">
            {/* Mobile: Pending Requests, Export, and Book Space collapse into a
                "More" menu — the main action button below always stays visible. */}
            <div className="md:hidden relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((o) => !o)}
                aria-label="More calendar actions"
                className="p-2 rounded-md border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors cursor-pointer"
              >
                <MoreHorizontal size={18} />
              </button>
              {moreMenuOpen && (
                <div className="absolute right-0 z-20 mt-1 w-52 bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg shadow-lg py-1">
                  {adminRole === 'super_admin' && (
                    <Link
                      href="/crew/calendar/pending"
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-bg"
                    >
                      Pending Requests
                      {pendingCount > 0 && (
                        <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-orange text-white text-xs font-semibold px-1">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false)
                      setExportModalOpen(true)
                    }}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer"
                  >
                    <Download size={14} />
                    Export
                  </button>
                  {canDirectCreate && (
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false)
                        setBookSpaceOpen(true)
                      }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer"
                    >
                      <CalendarSearch size={14} />
                      Book Space
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Desktop: full button row */}
            <div className="hidden md:flex items-center gap-2">
              {adminRole === 'super_admin' && (
                <Link
                  href="/crew/calendar/pending"
                  className="flex items-center gap-1.5 text-sm font-semibold text-navy dark:text-steel hover:underline"
                >
                  Pending Requests
                  {pendingCount > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-orange text-white text-xs font-semibold px-1">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )}

              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-1.5 border border-divider dark:border-dark-border text-dark dark:text-dark-text font-semibold px-3 py-2 rounded-md text-sm hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors cursor-pointer"
              >
                <Download size={16} />
                Export
              </button>

              {canDirectCreate && (
                <button
                  type="button"
                  onClick={() => setBookSpaceOpen(true)}
                  className="flex items-center gap-1.5 bg-white dark:bg-dark-surface border border-navy dark:border-steel text-navy dark:text-steel font-semibold px-3 py-2 rounded-md text-sm hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors cursor-pointer"
                >
                  <CalendarSearch size={16} />
                  Book Space
                </button>
              )}
            </div>

            <div className="relative" ref={actionMenuRef}>
              <button
                type="button"
                onClick={() => setActionMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 bg-navy text-white font-semibold px-4 py-2 rounded-md text-sm hover:bg-steel transition-colors cursor-pointer"
              >
                {adminRole === 'super_admin' ? 'Add Event' : 'Submit Request'}
                <ChevronDown size={14} />
              </button>
              {actionMenuOpen && (
                <div className="absolute right-0 z-20 mt-1 w-48 bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg shadow-lg py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActionMenuOpen(false)
                      setFormOpen(true)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer"
                  >
                    Single Event
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionMenuOpen(false)
                      setBulkFormOpen(true)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer"
                  >
                    Rehearsal Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionMenuOpen(false)
                      setRecurringFormOpen(true)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer"
                  >
                    Recurring Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CalendarFilterBar
        locations={locations}
        seasons={seasons}
        currentLocationFilter={locationFilter}
        currentTypeFilter={typeFilter}
        currentSeasonFilter={seasonFilter}
        onLocationFilterChange={handleLocationFilterChange}
        onTypeFilterChange={handleTypeFilterChange}
        onSeasonFilterChange={handleSeasonFilterChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <CalendarLegend locations={locations} />

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
            focusedDate={focusedDate}
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
          onEditEvent={handleEditEvent}
          onEditRecurringEvent={handleEditRecurringEvent}
          onCancelRecurringEvent={handleCancelRecurringEvent}
          onCancelEvent={handleCancelEvent}
        />
      )}

      {formOpen && (
        <CalendarEventForm
          adminRole={adminRole}
          calendarEditor={calendarEditor}
          locations={locations}
          initialData={editingEvent}
          initialDate={selectedDate ?? undefined}
          initialBooking={prefilledBooking}
          editScope={editScope}
          onClose={() => {
            setFormOpen(false)
            setEditingEvent(null)
            setPrefilledBooking(null)
            setEditScope('this')
          }}
          onSuccess={() => {
            setFormOpen(false)
            setEditingEvent(null)
            setPrefilledBooking(null)
            setEditScope('this')
            router.refresh()
          }}
        />
      )}

      {bulkFormOpen && (
        <CalendarBulkRehearsalForm
          adminRole={adminRole}
          calendarEditor={calendarEditor}
          locations={locations}
          initialDate={selectedDate ?? undefined}
          onClose={() => setBulkFormOpen(false)}
          onSuccess={() => {
            setBulkFormOpen(false)
            router.refresh()
          }}
        />
      )}

      {bookSpaceOpen && (
        <CalendarBookSpacePanel
          locations={locations}
          onClose={() => setBookSpaceOpen(false)}
          onBook={(booking) => {
            setPrefilledBooking(booking)
            setBookSpaceOpen(false)
            setFormOpen(true)
          }}
        />
      )}

      {exportModalOpen && (
        <CalendarExportModal
          subscriptionToken={subscriptionToken}
          onClose={() => setExportModalOpen(false)}
        />
      )}

      {recurringFormOpen && (
        <CalendarRecurringEventForm
          adminRole={adminRole}
          calendarEditor={calendarEditor}
          locations={locations}
          onClose={() => setRecurringFormOpen(false)}
          onSuccess={() => {
            setRecurringFormOpen(false)
            router.refresh()
          }}
        />
      )}

      {scopePickerEvent && scopePickerMode && (
        <RecurrenceScopePicker
          mode={scopePickerMode}
          onSelect={handleScopeSelected}
          onClose={() => {
            setScopePickerEvent(null)
            setScopePickerMode(null)
          }}
        />
      )}
    </div>
  )
}
