'use client'

import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

const MAINSTAGE_COLOR = '#1D4ED8'
const STUDIO_X_COLOR = '#7C3AED'
const REHEARSAL_COLOR = '#B45309'

function EventChip({
  label,
  color,
  recurring = false,
}: {
  label: string
  color: string
  recurring?: boolean
}) {
  return (
    <div
      className="w-full rounded text-white text-xs px-1.5 py-0.5 mb-0.5 truncate leading-tight"
      style={{ backgroundColor: color }}
    >
      {recurring ? `↻ ${label}` : label}
    </div>
  )
}

function DayNumber({ day, today = false }: { day: number; today?: boolean }) {
  if (today) {
    return (
      <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-medium flex items-center justify-center mb-1">
        {day}
      </div>
    )
  }
  return <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{day}</div>
}

export function CalendarMockup() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Calendar — Option A Mockup (Month View)
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Calendar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage events, rehearsals, and venue bookings.
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="bg-neutral-surface border border-neutral-border rounded-lg p-1 flex gap-1">
          <span className="bg-brand-primary text-white rounded-md px-3 py-1.5 text-sm font-medium">
            Month
          </span>
          <span className="text-gray-600 dark:text-gray-400 hover:text-gray-900 rounded-md px-3 py-1.5 text-sm cursor-pointer">
            Week
          </span>
          <span className="text-gray-600 dark:text-gray-400 hover:text-gray-900 rounded-md px-3 py-1.5 text-sm cursor-pointer">
            Agenda
          </span>
        </div>

        <div className="flex gap-2">
          <span className="text-xs text-brand-primary border border-brand-primary rounded-full px-3 py-1 flex items-center gap-1.5">
            Pending Requests
            <span className="bg-brand-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
              3
            </span>
          </span>
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-md border border-neutral-border bg-neutral-surface text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-nav"
          >
            Export
          </button>
          <button
            type="button"
            className="text-sm px-4 py-1.5 rounded-md bg-brand-primary text-white hover:bg-brand-primary-dark font-medium flex items-center gap-1.5"
          >
            Add Event
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          Location: All
          <ChevronDown className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          Event Type: All
          <ChevronDown className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          Season: 2024–2025
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center py-2 border-b border-neutral-border">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: MAINSTAGE_COLOR }} />
          Mainstage
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: STUDIO_X_COLOR }} />
          Studio X
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: REHEARSAL_COLOR }} />
          Rehearsal Hall
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="hover:bg-gray-100 dark:hover:bg-dark-nav rounded-md p-1 cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">October 2025</span>
              <span className="hover:bg-gray-100 dark:hover:bg-dark-nav rounded-md p-1 cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </span>
            </div>
            <button
              type="button"
              className="text-sm px-3 py-1 border border-neutral-border rounded-md bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">Mon</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">Tue</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">Wed</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">Thu</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">Fri</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">Sat</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">Sun</div>
          </div>

          <div className="grid grid-cols-7 border-l border-t border-neutral-border">
            {/* Week 1: Sep 29 – Oct 5 */}
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-neutral-surface dark:bg-dark-nav">
              <DayNumber day={29} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-neutral-surface dark:bg-dark-nav">
              <DayNumber day={30} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={1} />
              <EventChip label="Into the Woods Rehearsal" color={REHEARSAL_COLOR} recurring />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={2} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={3} />
              <EventChip label="Into the Woods Rehearsal" color={REHEARSAL_COLOR} recurring />
              <EventChip label="Board Meeting" color={STUDIO_X_COLOR} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={4} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={5} />
            </div>

            {/* Week 2: Oct 6 – Oct 12 */}
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={6} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={7} />
              <EventChip label="Into the Woods Rehearsal" color={REHEARSAL_COLOR} recurring />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={8} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={9} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={10} />
              <EventChip label="Into the Woods Rehearsal" color={REHEARSAL_COLOR} recurring />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={11} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={12} />
              <EventChip label="Into the Woods — Opening Night" color={MAINSTAGE_COLOR} />
            </div>

            {/* Week 3: Oct 13 – Oct 19 */}
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={13} />
              <EventChip label="Into the Woods — Performance" color={MAINSTAGE_COLOR} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={14} today />
              <EventChip label="Into the Woods — Performance" color={MAINSTAGE_COLOR} />
              <EventChip label="A Christmas Carol Rehearsal" color={REHEARSAL_COLOR} recurring />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 cursor-pointer">+1 more</div>
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={15} />
              <EventChip label="A Christmas Carol Rehearsal" color={REHEARSAL_COLOR} recurring />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={16} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={17} />
              <EventChip label="A Christmas Carol Rehearsal" color={REHEARSAL_COLOR} recurring />
              <EventChip label="Studio Rental — Jazz Ensemble" color={STUDIO_X_COLOR} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={18} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={19} />
              <EventChip label="Volunteer Appreciation Night" color={MAINSTAGE_COLOR} />
            </div>

            {/* Week 4: Oct 20 – Oct 26 */}
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={20} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={21} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={22} />
              <EventChip label="A Christmas Carol Rehearsal" color={REHEARSAL_COLOR} recurring />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={23} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={24} />
              <EventChip label="A Christmas Carol Rehearsal" color={REHEARSAL_COLOR} recurring />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={25} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={26} />
              <EventChip label="Board Meeting" color={STUDIO_X_COLOR} />
            </div>

            {/* Week 5: Oct 27 – Nov 2 */}
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={27} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={28} />
              <EventChip label="A Christmas Carol Rehearsal" color={REHEARSAL_COLOR} recurring />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={29} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={30} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-white dark:bg-dark-surface">
              <DayNumber day={31} />
              <EventChip label="Halloween Social" color={STUDIO_X_COLOR} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-neutral-surface dark:bg-dark-nav">
              <DayNumber day={1} />
            </div>
            <div className="border-r border-b border-neutral-border min-h-[90px] p-1.5 relative bg-neutral-surface dark:bg-dark-nav">
              <DayNumber day={2} />
            </div>
          </div>
        </div>

        <div className="w-72 flex-shrink-0">
          <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
            <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Tuesday, October 14</span>
              <span className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg">×</span>
            </div>

            <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Booked
            </div>

            <div className="px-4 py-3 border-b border-neutral-border">
              <div className="border-l-4 pl-3" style={{ borderLeftColor: MAINSTAGE_COLOR }}>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Into the Woods — Performance
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  7:30 PM – 10:00 PM · Mainstage
                </div>
                <div className="flex gap-3 mt-1.5">
                  <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
                    Edit
                  </span>
                  <span className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Cancel</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-neutral-border">
              <div className="border-l-4 pl-3" style={{ borderLeftColor: REHEARSAL_COLOR }}>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  A Christmas Carol Rehearsal
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  ↻ 6:00 PM – 9:00 PM · Rehearsal Hall
                </div>
                <div className="flex gap-3 mt-1.5">
                  <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
                    Edit
                  </span>
                  <span className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Cancel</span>
                </div>
              </div>
            </div>

            <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Available Windows
            </div>

            <div className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between border-b border-neutral-border last:border-b-0">
              <span>8:00 AM – 6:00 PM</span>
              <span className="text-gray-400">Studio X</span>
            </div>
            <div className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-between border-b border-neutral-border last:border-b-0">
              <span>8:00 AM – 10:00 PM</span>
              <span className="text-gray-400">Rehearsal Hall</span>
            </div>
            <div className="px-4 py-2 flex items-center border-b border-neutral-border last:border-b-0">
              <span className="text-xs text-gray-300 dark:text-gray-600 italic">
                No availability · Mainstage
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
