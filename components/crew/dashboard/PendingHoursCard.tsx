'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatWallClockCT } from '@/lib/utils/date'
import { confirmHours } from '@/lib/actions/attendance'

export type PendingHoursRow = {
  id: string
  hoursLogged: number
  volunteerId: string | null
  volunteerName: string
  roleName: string
  showId: string
  showName: string
  showDate: string
}

function HoursReviewRow({ row }: { row: PendingHoursRow }) {
  const router = useRouter()
  const [hoursInput, setHoursInput] = useState(String(row.hoursLogged))
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    const parsed = Number(hoursInput)
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 24) {
      setError('Enter a valid number of hours (0–24).')
      return
    }
    setError(null)
    setIsPending(true)

    const result = await confirmHours(row.id, parsed)

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
          <span className="text-dark dark:text-dark-text font-medium">
            {row.volunteerName}{' '}
            <span className="text-mid-gray dark:text-dark-muted text-xs">(unregistered)</span>
          </span>
        )}
        <p className="text-xs text-mid-gray dark:text-dark-muted">{row.roleName}</p>
      </div>

      <input
        type="number"
        step="0.5"
        min="0"
        max="24"
        value={hoursInput}
        onChange={(e) => setHoursInput(e.target.value)}
        disabled={isPending}
        className="w-20 rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors disabled:opacity-50"
      />

      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="bg-navy text-white hover:bg-steel transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Confirming…' : 'Confirm'}
      </button>

      {error && <p className="text-orange text-xs w-full">{error}</p>}
    </div>
  )
}

export default function PendingHoursCard({ rows }: { rows: PendingHoursRow[] }) {
  if (rows.length === 0) return null

  const groups = new Map<string, { showName: string; showDate: string; rows: PendingHoursRow[] }>()
  for (const row of rows) {
    const key = `${row.showId}__${row.showDate}`
    const existing = groups.get(key)
    if (existing) {
      existing.rows.push(row)
    } else {
      groups.set(key, { showName: row.showName, showDate: row.showDate, rows: [row] })
    }
  }

  const groupList = [...groups.values()].sort((a, b) => (a.showDate < b.showDate ? 1 : -1))

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-8">
      <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-4">
        Hours Review <span className="text-mid-gray dark:text-dark-muted font-normal">({rows.length})</span>
      </h2>

      <div className="space-y-6">
        {groupList.map((group) => (
          <div key={`${group.showName}-${group.showDate}`}>
            <h3 className="text-sm font-semibold text-navy dark:text-steel mb-2">
              {group.showName} — {formatWallClockCT(group.showDate, null, 'MMM d, yyyy')}
            </h3>
            <div>
              {group.rows.map((row) => (
                <HoursReviewRow key={row.id} row={row} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
