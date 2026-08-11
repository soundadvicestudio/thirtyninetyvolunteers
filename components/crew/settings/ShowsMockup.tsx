'use client'

import { Plus, ChevronDown, ChevronRight } from 'lucide-react'

export function ShowLocationBadge({ location }: { location: 'Mainstage' | 'Studio X' | 'One-Off' }) {
  if (location === 'Mainstage') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        Mainstage
      </span>
    )
  }
  if (location === 'Studio X') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
        Studio X
      </span>
    )
  }
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      One-Off
    </span>
  )
}

export function ShowStatusBadge({ status }: { status: 'draft' | 'live' | 'past' | 'archived' }) {
  if (status === 'draft') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-700">
        Draft
      </span>
    )
  }
  if (status === 'live') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Live
      </span>
    )
  }
  if (status === 'past') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        Past
      </span>
    )
  }
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Archived
    </span>
  )
}

function ShowCard({
  name,
  location,
  status,
  dateRange,
  slotsText,
  fillClassName,
  lastAction,
}: {
  name: string
  location: 'Mainstage' | 'Studio X' | 'One-Off'
  status: 'draft' | 'live' | 'past' | 'archived'
  dateRange: string
  slotsText: string
  fillClassName: string
  lastAction: string
}) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg p-4 hover:shadow-sm dark:hover:shadow-none transition-shadow ml-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{name}</span>
          <ShowLocationBadge location={location} />
          <ShowStatusBadge status={status} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer">
            Edit
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer">
            View Public
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer">
            Copy URL
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
            {lastAction}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{dateRange}</p>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1 h-1.5 bg-neutral-border rounded-full overflow-hidden">
          <div className={fillClassName} />
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">{slotsText}</span>
      </div>
    </div>
  )
}

export function ShowsMockup() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Shows — Option A Mockup (Season Accordion)
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shows</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage productions and volunteer rosters.
            </p>
          </div>
          <button
            type="button"
            className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Show
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          Location: All
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </span>
        <span className="flex items-center gap-1.5 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          Status: All
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </span>
        <span className="text-sm text-brand-primary hover:text-brand-primary-dark cursor-pointer ml-auto">
          + New Season
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div
            className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg border-l-4 px-4 py-3.5 flex items-center justify-between cursor-pointer"
            style={{ borderLeftColor: 'var(--brand-primary)' }}
          >
            <div className="flex items-center">
              <ChevronDown className="w-5 h-5 text-brand-primary flex-shrink-0 rotate-0" />
              <span className="text-base font-semibold text-gray-900 dark:text-white ml-3">
                2024–2025 Season
              </span>
              <span className="bg-brand-primary-light text-brand-primary text-xs rounded-full px-2 py-0.5 ml-2">
                Current
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">3 shows</span>
          </div>

          <div className="space-y-3 mt-3 pb-1">
            <ShowCard
              name="Into the Woods"
              location="Mainstage"
              status="live"
              dateRange="Oct 12 – Nov 3, 2025"
              slotsText="28 / 32 slots filled"
              fillClassName="h-full rounded-full bg-green-500 w-[87.5%]"
              lastAction="Set Draft"
            />
            <ShowCard
              name="A Christmas Carol"
              location="Mainstage"
              status="live"
              dateRange="Nov 22 – Dec 14, 2025"
              slotsText="14 / 24 slots filled"
              fillClassName="h-full rounded-full bg-yellow-400 w-[58.3%]"
              lastAction="Set Draft"
            />
            <ShowCard
              name="The Wizard of Oz"
              location="Studio X"
              status="draft"
              dateRange="Mar 6 – Mar 22, 2026"
              slotsText="0 / 20 slots filled"
              fillClassName="h-full rounded-full bg-red-500 w-0"
              lastAction="Set Live"
            />
          </div>
        </div>

        <div>
          <div
            className="bg-neutral-surface dark:bg-dark-nav border border-neutral-border rounded-lg border-l-4 px-4 py-3.5 flex items-center justify-between cursor-pointer"
            style={{ borderLeftColor: 'var(--color-neutral-border)' }}
          >
            <div className="flex items-center">
              <ChevronRight className="w-5 h-5 text-gray-400 ml-0" />
              <span className="text-base font-semibold text-gray-600 dark:text-gray-400 ml-3">
                2023–2024 Season
              </span>
            </div>
            <span className="text-sm text-gray-400 dark:text-gray-500">4 shows</span>
          </div>
        </div>

        <div>
          <div
            className="bg-neutral-surface dark:bg-dark-nav border border-neutral-border rounded-lg border-l-4 px-4 py-3.5 flex items-center justify-between cursor-pointer"
            style={{ borderLeftColor: 'var(--color-neutral-border)' }}
          >
            <div className="flex items-center">
              <ChevronRight className="w-5 h-5 text-gray-400 ml-0" />
              <span className="text-base font-semibold text-gray-600 dark:text-gray-400 ml-3">
                2022–2023 Season
              </span>
            </div>
            <span className="text-sm text-gray-400 dark:text-gray-500">5 shows</span>
          </div>
        </div>
      </div>
    </div>
  )
}
