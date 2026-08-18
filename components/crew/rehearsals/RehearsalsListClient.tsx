'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import CalendarBulkRehearsalForm from '@/components/crew/calendar/CalendarBulkRehearsalForm'
import type { RehearsalScheduleRow } from '@/types/rehearsal'
import type { AdminRole } from '@/types/admin'
import type { Location } from '@/types/show'

const cardClasses = 'bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg'

function statusBadge(status: RehearsalScheduleRow['status']) {
  switch (status) {
    case 'pending':
      return { label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' }
    case 'approved':
      return { label: 'Approved', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
    case 'partial':
      return { label: 'Partial', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' }
    case 'cancelled':
    default:
      return { label: 'Cancelled', className: 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted' }
  }
}

function dateRangeLabel(row: RehearsalScheduleRow, timezone: string): string {
  if (!row.dateRangeStart || !row.dateRangeEnd) return '—'
  const start = formatCT(row.dateRangeStart, 'MMM d', timezone)
  const end = formatCT(row.dateRangeEnd, 'MMM d, yyyy', timezone)
  if (row.dateRangeStart === row.dateRangeEnd) return formatCT(row.dateRangeStart, 'MMM d, yyyy', timezone)
  return `${start} – ${end}`
}

export default function RehearsalsListClient({
  schedules,
  adminRole,
  calendarEditor,
  locations,
}: {
  schedules: RehearsalScheduleRow[]
  adminRole: AdminRole
  calendarEditor: boolean
  locations: Location[]
}) {
  const tz = typeof document !== 'undefined' ? (document.body.dataset.timezone || 'America/Chicago') : 'America/Chicago'
  const router = useRouter()
  const [filter, setFilter] = useState<'active' | 'all'>('active')
  const [formOpen, setFormOpen] = useState(false)

  const canCreate = adminRole !== 'viewer'
  const visibleSchedules = filter === 'active' ? schedules.filter((s) => s.nextDate !== null) : schedules

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border border-divider dark:border-dark-border overflow-hidden">
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              filter === 'active'
                ? 'bg-brand-primary text-white'
                : 'bg-white dark:bg-dark-surface text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-brand-primary text-white'
                : 'bg-white dark:bg-dark-surface text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50'
            }`}
          >
            All
          </button>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1.5 bg-brand-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-brand-primary-mid transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New Schedule
          </button>
        )}
      </div>

      {visibleSchedules.length === 0 ? (
        <div className={`${cardClasses} p-8 text-center`}>
          <p className="text-mid-gray dark:text-dark-muted mb-4">
            {filter === 'active' ? 'No active rehearsal schedules.' : 'No rehearsal schedules yet.'}
          </p>
          {canCreate && (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-1.5 bg-brand-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-brand-primary-mid transition-colors cursor-pointer"
            >
              <Plus size={16} />
              New Schedule
            </button>
          )}
        </div>
      ) : (
        <div className={`${cardClasses} overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider dark:border-dark-border">
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Date Range
                </th>
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Assigned
                </th>
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Next Rehearsal
                </th>
                <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {visibleSchedules.map((row) => {
                const badge = statusBadge(row.status)
                return (
                  <tr key={row.id} className="border-b border-divider dark:border-dark-border last:border-0">
                    <td className="px-4 py-3 text-dark dark:text-dark-text font-medium">{row.title}</td>
                    <td className="px-4 py-3 text-dark dark:text-dark-text">{dateRangeLabel(row, tz)}</td>
                    <td className="px-4 py-3 text-dark dark:text-dark-text">{row.assigneeCount}</td>
                    <td className="px-4 py-3 text-dark dark:text-dark-text">
                      {row.nextDate ? formatCT(row.nextDate, 'MMM d, yyyy', tz) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/crew/rehearsals/${row.id}`}
                        className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <CalendarBulkRehearsalForm
          adminRole={adminRole}
          calendarEditor={calendarEditor}
          locations={locations}
          onClose={() => setFormOpen(false)}
          onSuccess={() => {
            setFormOpen(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
