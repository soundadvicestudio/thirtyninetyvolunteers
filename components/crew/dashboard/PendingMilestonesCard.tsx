'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCT } from '@/lib/utils/date'
import { acknowledgeMilestone } from '@/lib/actions/milestones'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

export type PendingMilestoneRow = {
  id: string
  milestoneLabel: string
  triggeredAt: string
  volunteerId: string | null
  volunteerName: string
}

function MilestoneRow({ row }: { row: PendingMilestoneRow }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAcknowledge() {
    setError(null)
    setIsPending(true)

    const result = await acknowledgeMilestone(row.id)

    if ('success' in result) {
      router.refresh()
      return
    }

    setIsPending(false)
    setError(result.error)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 border-b border-divider dark:border-dark-border last:border-0">
      <div className="flex-1 min-w-[160px]">
        {row.volunteerId ? (
          <Link
            href={`/crew/volunteers/${row.volunteerId}`}
            className="text-dark dark:text-dark-text font-medium hover:text-navy dark:hover:text-steel transition-colors"
          >
            {row.volunteerName}
          </Link>
        ) : (
          <span className="text-dark dark:text-dark-text font-medium">{row.volunteerName}</span>
        )}
        <p className="text-xs text-mid-gray dark:text-dark-muted">
          {row.milestoneLabel} — {formatCT(row.triggeredAt, 'MMM d, yyyy')}
        </p>
      </div>

      <button
        type="button"
        onClick={handleAcknowledge}
        disabled={isPending}
        className="bg-navy text-white hover:bg-steel transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Saving…' : 'Mark Acknowledged'}
      </button>

      {error && <p className="text-orange text-xs w-full">{error}</p>}
    </div>
  )
}

export default function PendingMilestonesCard({ rows }: { rows: PendingMilestoneRow[] }) {
  if (rows.length === 0) return null

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-8">
      <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-1 flex items-center gap-1.5">
        Milestone Acknowledgments{' '}
        <span className="text-mid-gray dark:text-dark-muted font-normal">({rows.length})</span>
        <HelpTooltip anchor="milestones" label="Milestone Acknowledgments" />
      </h2>
      <p className="text-sm text-mid-gray dark:text-dark-muted mb-4">
        These volunteers recently hit a milestone — a personal thank-you goes a long way.
      </p>

      <div>
        {rows.map((row) => (
          <MilestoneRow key={row.id} row={row} />
        ))}
      </div>
    </div>
  )
}
