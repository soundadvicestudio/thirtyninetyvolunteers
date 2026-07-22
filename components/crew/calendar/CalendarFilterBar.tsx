'use client'

import { useEffect, useRef, useState } from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import type { Location } from '@/types/show'
import type { CalendarEventType } from '@/types/calendar'

const EVENT_TYPE_OPTIONS: { value: CalendarEventType; label: string }[] = [
  { value: 'performance', label: 'Performance' },
  { value: 'rehearsal', label: 'Rehearsal' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'event', label: 'Event' },
  { value: 'rental', label: 'Rental' },
  { value: 'other', label: 'Other' },
]

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: { value: string; label: string; color?: string }[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // selected.length === 0 is the canonical "everything shown" state — no
  // explicit array of every option value is ever stored for that case.
  const isAllSelected = selected.length === 0

  function toggleAll() {
    onChange([])
  }

  function toggleOne(value: string) {
    const effective = isAllSelected ? options.map((o) => o.value) : selected
    const next = effective.includes(value)
      ? effective.filter((v) => v !== value)
      : [...effective, value]
    onChange(next.length === options.length ? [] : next)
  }

  const triggerLabel = isAllSelected ? `All ${label}` : `${selected.length} ${label}`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-divider dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-dark dark:text-dark-text hover:border-steel transition-colors cursor-pointer"
      >
        {triggerLabel}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-56 bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg shadow-lg p-2 max-h-72 overflow-y-auto">
          <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer text-sm font-semibold text-dark dark:text-dark-text">
            <input type="checkbox" checked={isAllSelected} onChange={toggleAll} />
            All {label}
          </label>
          <div className="border-t border-divider dark:border-dark-border my-1" />
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer text-sm text-dark dark:text-dark-text"
            >
              <input
                type="checkbox"
                checked={isAllSelected || selected.includes(opt.value)}
                onChange={() => toggleOne(opt.value)}
              />
              {opt.color && (
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
              )}
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CalendarFilterBar({
  locations,
  seasons,
  currentLocationFilter,
  currentTypeFilter,
  currentSeasonFilter,
  onLocationFilterChange,
  onTypeFilterChange,
  onSeasonFilterChange,
  onClearFilters,
  hasActiveFilters,
}: {
  locations: Location[]
  seasons: { id: string; name: string }[]
  currentLocationFilter: string[]
  currentTypeFilter: string[]
  currentSeasonFilter: string | null
  onLocationFilterChange: (ids: string[]) => void
  onTypeFilterChange: (types: string[]) => void
  onSeasonFilterChange: (id: string | null) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}) {
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const activeFilterCount =
    (currentLocationFilter.length > 0 ? 1 : 0) +
    (currentTypeFilter.length > 0 ? 1 : 0) +
    (currentSeasonFilter ? 1 : 0)

  return (
    <div>
      <div className="md:hidden mb-2">
        <button
          type="button"
          onClick={() => setMobileExpanded((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-divider dark:border-dark-border bg-white dark:bg-dark-surface text-sm font-semibold text-dark dark:text-dark-text cursor-pointer"
        >
          <Filter size={16} />
          Filters
          {hasActiveFilters && (
            <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-orange text-white text-xs font-semibold px-1">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className={`flex-wrap items-center gap-3 ${mobileExpanded ? 'flex' : 'hidden'} md:flex`}>
        <MultiSelectDropdown
          label="Locations"
          options={locations.map((l) => ({ value: l.id, label: l.name, color: l.color }))}
          selected={currentLocationFilter}
          onChange={onLocationFilterChange}
        />
        <MultiSelectDropdown
          label="Types"
          options={EVENT_TYPE_OPTIONS}
          selected={currentTypeFilter}
          onChange={onTypeFilterChange}
        />

        <select
          aria-label="Filter by season"
          value={currentSeasonFilter ?? ''}
          onChange={(e) => onSeasonFilterChange(e.target.value || null)}
          className="px-3 py-2 rounded-lg border border-divider dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-dark dark:text-dark-text hover:border-steel transition-colors cursor-pointer"
        >
          <option value="">All Seasons</option>
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
