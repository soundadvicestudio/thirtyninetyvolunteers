'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatWallClockCT } from '@/lib/utils/date'
import { signOutCallboard } from '@/lib/actions/callboard'
import { getNextMilestone } from '@/lib/milestones-shared'
import type { CallboardVolunteer, CallboardMilestone, CallboardCallHistoryRow } from '@/types/callboard'

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

function CallHistoryTable({ calls }: { calls: CallboardCallHistoryRow[] }) {
  if (calls.length === 0) {
    return <p className="text-mid-gray text-sm py-4">No calls yet.</p>
  }

  return (
    <div className="overflow-x-auto border border-divider rounded-lg mt-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-divider text-left">
            <th className="px-3 py-2 text-mid-gray font-semibold uppercase text-xs">Show</th>
            <th className="px-3 py-2 text-mid-gray font-semibold uppercase text-xs">Date</th>
            <th className="px-3 py-2 text-mid-gray font-semibold uppercase text-xs">Role</th>
            <th className="px-3 py-2 text-mid-gray font-semibold uppercase text-xs">Status</th>
            <th className="px-3 py-2 text-mid-gray font-semibold uppercase text-xs">Hours</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <tr key={call.id} className="border-b border-divider last:border-0">
              <td className="px-3 py-2 text-dark">{call.show_name}</td>
              <td className="px-3 py-2 text-dark">{formatWallClockCT(call.show_date, null, 'MMM d, yyyy')}</td>
              <td className="px-3 py-2 text-dark">{call.role_name}</td>
              <td className="px-3 py-2 text-dark">{STATUS_LABEL[call.attendance_status ?? call.status] ?? '—'}</td>
              <td className="px-3 py-2 text-dark">{call.hours_logged !== null ? call.hours_logged : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function VolunteerCard({
  volunteer,
  categories,
  milestones,
  callHistory,
  manualHoursTotal,
}: {
  volunteer: CallboardVolunteer
  categories: string[]
  milestones: CallboardMilestone[]
  callHistory: CallboardCallHistoryRow[]
  manualHoursTotal: number
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const nextMilestone = getNextMilestone(
    volunteer.total_hours,
    milestones.map((m) => m.milestone_hours)
  )
  const hoursRemaining = nextMilestone ? nextMilestone.hours - volunteer.total_hours : 0
  const showsCount = callHistory.filter((c) => c.attendance_status === 'showed').length

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
          {formatHoursValue(volunteer.total_hours)} hours from {showsCount} {showsCount === 1 ? 'show' : 'shows'}
          {manualHoursTotal > 0 && ` • ${formatHoursValue(manualHoursTotal)} manual hours`}
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

      {expanded && <CallHistoryTable calls={callHistory} />}

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
