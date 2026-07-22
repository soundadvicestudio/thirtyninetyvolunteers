'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  buildVolunteersUrl,
  isNonDefaultFilter,
  type VolunteersUrlState,
} from '@/lib/volunteers/url'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

type Category = { id: string; name: string }

const AGE_RANGE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'under_18', label: 'Under 18' },
  { value: '18_25', label: '18–25' },
  { value: '26_35', label: '26–35' },
  { value: '36_50', label: '36–50' },
  { value: '51_plus', label: '51+' },
  { value: 'prefer_not', label: 'Prefer not to say' },
]

const MILESTONE_TIER_OPTIONS: { value: VolunteersUrlState['milestoneTier']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'any', label: 'Any milestone earned' },
  { value: 'first_call', label: 'First Call' },
  { value: '10', label: '10+ Hours' },
  { value: '20', label: '20+ Hours' },
  { value: '50', label: '50+ Hours' },
  { value: '100', label: '100+ Hours' },
]

export default function FilterPanel({
  categories,
  state,
}: {
  categories: Category[]
  state: VolunteersUrlState
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(true)
  const [searchInput, setSearchInput] = useState(state.q)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  function navigate(next: Partial<VolunteersUrlState>) {
    router.replace(buildVolunteersUrl(pathname, { ...state, ...next, page: 1 }), {
      scroll: false,
    })
  }

  // Debounce search input before pushing to the URL.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      navigate({ q: searchInput })
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  function toggleCategory(id: string) {
    const next = state.categoryIds.includes(id)
      ? state.categoryIds.filter((c) => c !== id)
      : [...state.categoryIds, id]
    navigate({ categoryIds: next })
  }

  function clearAll() {
    setSearchInput('')
    router.replace(pathname, { scroll: false })
  }

  const filtered = isNonDefaultFilter(state)

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg mb-4">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="md:hidden w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-navy"
      >
        Filters
        <span>{collapsed ? '+' : '−'}</span>
      </button>

      <div
        className={`${collapsed ? 'hidden md:flex' : 'flex'} flex-col md:flex-row md:flex-wrap items-start gap-4 p-4`}
      >
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">Search</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, email, or phone"
            className="w-full rounded border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">Status</label>
          <select
            value={state.status}
            onChange={(e) => navigate({ status: e.target.value as VolunteersUrlState['status'] })}
            className="rounded border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">Age Range</label>
          <select
            value={state.ageRange}
            onChange={(e) => navigate({ ageRange: e.target.value })}
            className="rounded border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-navy"
          >
            {AGE_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">School</label>
          <select
            value={state.school}
            onChange={(e) => navigate({ school: e.target.value as VolunteersUrlState['school'] })}
            className="rounded border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="all">All</option>
            <option value="yes">Has school</option>
            <option value="no">No school on file</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">Is Minor</label>
          <select
            value={state.isMinor}
            onChange={(e) =>
              navigate({ isMinor: e.target.value as VolunteersUrlState['isMinor'] })
            }
            className="rounded border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">Service Hours</label>
          <select
            value={state.serviceHours}
            onChange={(e) =>
              navigate({ serviceHours: e.target.value as VolunteersUrlState['serviceHours'] })
            }
            className="rounded border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="all">All</option>
            <option value="yes">Required</option>
            <option value="no">Not Required</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">
            Milestone Tier
            <HelpTooltip anchor="milestones" label="Milestone Tier Filter" />
          </label>
          <select
            value={state.milestoneTier}
            onChange={(e) => navigate({ milestoneTier: e.target.value as VolunteersUrlState['milestoneTier'] })}
            className="rounded border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-navy"
          >
            {MILESTONE_TIER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <span className="block text-xs font-semibold text-mid-gray dark:text-dark-muted mb-1">Categories</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-1.5 text-sm text-dark dark:text-dark-text">
                <input
                  type="checkbox"
                  checked={state.categoryIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="rounded border-divider dark:border-dark-border text-navy focus:ring-navy"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {filtered && (
          <div className="w-full">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-orange font-semibold hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
