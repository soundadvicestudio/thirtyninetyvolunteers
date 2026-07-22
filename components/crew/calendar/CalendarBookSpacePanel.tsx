'use client'

import { useState } from 'react'
import { X, Loader2, CalendarCheck } from 'lucide-react'
import { findAvailableSlots, type LocationAvailability } from '@/lib/actions/calendar'
import { formatCT } from '@/lib/utils/date'
import type { CalendarBookingPrefill } from './CalendarEventForm'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'

export default function CalendarBookSpacePanel({
  locations,
  onClose,
  onBook,
}: {
  locations: Array<{ id: string; name: string; color: string }>
  onClose: () => void
  onBook: (booking: CalendarBookingPrefill) => void
}) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [locationId, setLocationId] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [slots, setSlots] = useState<LocationAvailability[] | null>(null)

  const canSearch = !!date && !!startTime && !!endTime

  async function handleSearch() {
    if (!canSearch) return
    if (endTime <= startTime) {
      setSearchError('End time must be after start time')
      setSlots(null)
      return
    }
    setSearching(true)
    setSearchError(null)
    const res = await findAvailableSlots(date, startTime, endTime, locationId || undefined)
    setSearching(false)
    if (!res.success) {
      setSearchError(res.error ?? 'Something went wrong. Please try again.')
      return
    }
    setSlots(res.slots ?? [])
  }

  function handleBook(loc: LocationAvailability) {
    onBook({ date, start_time: startTime, end_time: endTime, location_id: loc.locationId })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed z-50 bg-white dark:bg-dark-surface shadow-xl flex flex-col left-0 right-0 bottom-0 h-[70vh] md:right-auto md:top-0 md:bottom-auto md:h-full md:w-[380px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-divider dark:border-dark-border shrink-0">
          <h2 className="text-base font-bold text-dark dark:text-dark-text flex items-center gap-2">
            <CalendarCheck size={18} />
            Book Space
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div>
            <label className={labelClasses}>Date</label>
            <input type="date" className={inputClasses} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClasses}>Start Time</label>
              <input
                type="time"
                className={inputClasses}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClasses}>End Time</label>
              <input
                type="time"
                className={inputClasses}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelClasses}>Location (optional)</label>
            <select className={inputClasses} value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!canSearch || searching}
            className="w-full flex items-center justify-center gap-2 bg-navy text-white font-semibold px-4 py-2 rounded-md text-sm hover:bg-steel transition-colors disabled:opacity-50 cursor-pointer"
          >
            {searching && <Loader2 size={14} className="animate-spin" />}
            {searching ? 'Searching…' : 'Search Availability'}
          </button>

          {searchError && <p className="text-sm text-orange">{searchError}</p>}

          {slots && (
            <div className="space-y-2 pt-2">
              {slots.length === 0 && (
                <p className="text-sm text-mid-gray dark:text-dark-muted">No locations found.</p>
              )}
              {slots.map((r) => (
                <div
                  key={r.locationId}
                  className="rounded-lg border border-divider dark:border-dark-border p-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="font-semibold text-dark dark:text-dark-text">{r.locationName}</span>
                    </div>
                    {r.available ? (
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">Available</p>
                    ) : (
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                        Conflicts with &ldquo;{r.conflictingEvent?.title}&rdquo;
                        {r.conflictingEvent && (
                          <>
                            {' '}
                            ({formatCT(r.conflictingEvent.start_time, 'h:mm a')} –{' '}
                            {formatCT(r.conflictingEvent.end_time, 'h:mm a')})
                          </>
                        )}
                      </p>
                    )}
                  </div>
                  {r.available && (
                    <button
                      type="button"
                      onClick={() => handleBook(r)}
                      className="shrink-0 bg-navy text-white font-semibold px-3 py-1.5 rounded-md text-xs hover:bg-steel transition-colors cursor-pointer"
                    >
                      Book This Slot
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
