'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatWallClockCT } from '@/lib/utils/date'
import { signOutCallboard } from '@/lib/actions/callboard'
import { getNextMilestone } from '@/lib/milestones-shared'
import type {
  CallboardVolunteer,
  CallboardMilestone,
  CallboardCallHistoryRow,
  CallboardManualHoursEntry,
} from '@/types/callboard'

function formatHoursValue(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

const STATUS_LABEL: Record<string, string> = {
  showed: 'Showed',
  no_show: 'No Show',
  excused: 'Excused',
  claimed: 'Claimed',
  cancelled: 'Cancelled',
}

const STATUS_COLOR: Record<string, string> = {
  showed: 'text-green-700',
  no_show: 'text-red-600',
  excused: 'text-amber-600',
  claimed: 'text-mid-gray',
  cancelled: 'text-mid-gray',
}

type ShowGroup = {
  showId: string
  showName: string
  calls: CallboardCallHistoryRow[]
  showedHours: number
  mostRecentDate: string
}

function CallHistoryBreakdown({
  showGroups,
  manualHoursEntries,
}: {
  showGroups: ShowGroup[]
  manualHoursEntries: CallboardManualHoursEntry[]
}) {
  if (showGroups.length === 0 && manualHoursEntries.length === 0) {
    return <p className="text-mid-gray text-sm py-4">No calls on record yet.</p>
  }

  return (
    <div className="mt-3 space-y-4">
      {showGroups.map((group, i) => (
        <div key={group.showId} className={i > 0 ? 'border-t border-divider pt-4' : ''}>
          <p className="font-semibold text-dark text-sm mb-2">{group.showName}</p>
          <div className="space-y-1.5">
            {group.calls.map((call) => {
              const statusKey = call.attendance_status ?? call.status
              return (
                <div
                  key={call.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-sm"
                >
                  <span className="text-mid-gray">
                    {formatWallClockCT(call.show_date, null, 'MMM d, yyyy')} — {call.role_name}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={STATUS_COLOR[statusKey] ?? 'text-mid-gray'}>
                      {STATUS_LABEL[statusKey] ?? '—'}
                    </span>
                    {call.attendance_status === 'showed' && call.hours_logged !== null && (
                      <span className="text-mid-gray">{formatHoursValue(call.hours_logged)} hrs</span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
          {group.showedHours > 0 && (
            <p className="text-right text-xs text-mid-gray mt-1.5">
              {formatHoursValue(group.showedHours)} hrs total
            </p>
          )}
        </div>
      ))}

      {manualHoursEntries.length > 0 && (
        <div className={showGroups.length > 0 ? 'border-t border-divider pt-4' : ''}>
          <p className="font-semibold text-dark text-sm mb-2">Other Hours</p>
          <div className="space-y-1.5">
            {manualHoursEntries.map((entry, i) => (
              <div
                key={`${entry.logged_date}-${i}`}
                className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-sm text-mid-gray"
              >
                <span>{entry.note ?? '—'}</span>
                <span>
                  {formatWallClockCT(entry.logged_date, null, 'MMM d, yyyy')} — {formatHoursValue(entry.hours)} hrs
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function VolunteerCard({
  volunteer,
  categories,
  milestones,
  callHistory,
  manualHoursEntries,
}: {
  volunteer: CallboardVolunteer
  categories: string[]
  milestones: CallboardMilestone[]
  callHistory: CallboardCallHistoryRow[]
  manualHoursEntries: CallboardManualHoursEntry[]
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const nextMilestone = getNextMilestone(
    volunteer.total_hours,
    milestones.map((m) => m.milestone_hours)
  )
  const hoursRemaining = nextMilestone ? nextMilestone.hours - volunteer.total_hours : 0

  const distinctShowCount = new Set(
    callHistory.filter((c) => c.attendance_status === 'showed').map((c) => c.show_id ?? c.show_name)
  ).size

  const showGroups: ShowGroup[] = Object.values(
    callHistory.reduce(
      (acc, call) => {
        const key = call.show_id ?? call.show_name
        if (!acc[key]) {
          acc[key] = {
            showId: key,
            showName: call.show_name,
            calls: [],
            showedHours: 0,
            mostRecentDate: call.show_date,
          }
        }
        acc[key].calls.push(call)
        if (call.attendance_status === 'showed') {
          acc[key].showedHours += Number(call.hours_logged ?? 0)
        }
        if (call.show_date > acc[key].mostRecentDate) {
          acc[key].mostRecentDate = call.show_date
        }
        return acc
      },
      {} as Record<string, ShowGroup>
    )
  ).sort((a, b) => b.mostRecentDate.localeCompare(a.mostRecentDate))

  async function handleSignOut() {
    setIsSigningOut(true)
    await signOutCallboard()
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-divider bg-white p-6 shadow-sm">
      <h2 className="text-navy font-bold text-xl mb-1">{volunteer.full_name}</h2>
      <p className="text-mid-gray text-sm mb-4">
        {categories.length > 0 ? categories.join(', ') : 'No categories yet'}
      </p>

      <div className="mb-4">
        <p className="text-dark text-sm">
          <span className="font-bold text-2xl text-navy">{formatHoursValue(volunteer.total_hours)}</span> total hours
        </p>
        <p className="text-mid-gray text-sm mt-1">
          {distinctShowCount > 0
            ? `${formatHoursValue(volunteer.total_hours)} hours across ${distinctShowCount} show${distinctShowCount !== 1 ? 's' : ''}`
            : `${formatHoursValue(volunteer.total_hours)} total hours`}
        </p>
        {nextMilestone ? (
          <p className="text-mid-gray text-sm mt-1">
            {formatHoursValue(hoursRemaining)} hours until your {nextMilestone.hours}-hour milestone.
          </p>
        ) : (
          <p className="text-mid-gray text-sm mt-1">You&apos;ve reached all current milestones — keep going!</p>
        )}
      </div>

      {milestones.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {milestones.map((m) => (
            <span key={m.id} className="inline-block text-xs font-semibold rounded-full px-3 py-1 bg-light-navy text-navy">
              {m.milestone_label}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="text-navy text-sm font-semibold underline mb-2"
      >
        Call History ({callHistory.length} calls) {expanded ? '▲' : '▼'}
      </button>

      {expanded && <CallHistoryBreakdown showGroups={showGroups} manualHoursEntries={manualHoursEntries} />}

      <div className="border-t border-divider mt-6 pt-4 flex items-center justify-between">
        <a href={`/update?token=${volunteer.update_token}`} className="text-navy text-sm font-semibold underline">
          Edit my info
        </a>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-mid-gray text-sm font-semibold hover:text-navy transition-colors disabled:opacity-50"
        >
          {isSigningOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
