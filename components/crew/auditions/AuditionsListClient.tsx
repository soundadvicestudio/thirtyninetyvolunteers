'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatWallClockCT } from '@/lib/utils/date'
import { createAudition } from '@/lib/actions/auditions-admin'
import type { AuditionListItem, AuditionType, AuditionStatus } from '@/types/audition'
import type { AdminRole } from '@/types/admin'

const cardClasses = 'bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg'

function typeLabel(type: AuditionType): string {
  return type === 'timed_slots' ? 'Timed Slots' : 'Open Call'
}

function statusBadge(status: AuditionStatus) {
  switch (status) {
    case 'draft':
      return { label: 'Draft', className: 'bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-dark-muted' }
    case 'published':
      return {
        label: 'Published',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      }
    case 'closed':
      return {
        label: 'Closed',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      }
    case 'archived':
    default:
      return { label: 'Archived', className: 'bg-gray-100 text-gray-500 dark:bg-dark-border dark:text-dark-muted' }
  }
}

function dateLabel(dateStart: string, dateEnd: string | null): string {
  const start = formatWallClockCT(dateStart, null, 'MMM d, yyyy')
  if (!dateEnd || dateEnd === dateStart) return start
  const end = formatWallClockCT(dateEnd, null, 'MMM d, yyyy')
  return `${start} – ${end}`
}

export default function AuditionsListClient({
  auditions,
  adminRole,
}: {
  auditions: AuditionListItem[]
  adminRole: AdminRole
}) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<AuditionType>('open_call')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const canCreate = adminRole !== 'viewer'

  const visibleAuditions = showAll
    ? auditions
    : auditions.filter((a) => a.status === 'draft' || a.status === 'published' || a.status === 'closed')

  function resetForm() {
    setTitle('')
    setType('open_call')
    setDateStart('')
    setDateEnd('')
    setCreateError(null)
  }

  function closeModal() {
    setShowCreateModal(false)
    resetForm()
  }

  async function handleCreate() {
    if (!title.trim()) {
      setCreateError('Title is required.')
      return
    }
    if (!dateStart) {
      setCreateError('Start date is required.')
      return
    }
    setCreating(true)
    setCreateError(null)
    const result = await createAudition({
      title: title.trim(),
      type,
      dateStart,
      dateEnd: dateEnd || null,
    })
    setCreating(false)
    if (!result.success || !result.auditionId) {
      setCreateError(result.error ?? 'Something went wrong creating the audition.')
      return
    }
    router.push(`/crew/auditions/${result.auditionId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border border-divider dark:border-dark-border overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              !showAll
                ? 'bg-brand-primary text-white'
                : 'bg-white dark:bg-dark-surface text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              showAll
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-brand-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-brand-primary-mid transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New Audition
          </button>
        )}
      </div>

      {visibleAuditions.length === 0 ? (
        <div className={`${cardClasses} p-8 text-center`}>
          <p className="text-mid-gray dark:text-dark-muted">
            No auditions yet. Create your first audition to get started.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile card layout — visible below sm breakpoint */}
          <div className="sm:hidden space-y-3">
            {visibleAuditions.map((a) => {
              const badge = statusBadge(a.status)
              return (
                <div
                  key={a.id}
                  onClick={() => router.push(`/crew/auditions/${a.id}`)}
                  className={`${cardClasses} p-4 space-y-2 cursor-pointer`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-dark dark:text-dark-text">{a.title}</p>
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-mid-gray dark:text-dark-muted">
                    {a.show_title ?? 'Standalone'} · {typeLabel(a.type)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-mid-gray dark:text-dark-muted">
                    <span>{dateLabel(a.date_start, a.date_end)}</span>
                    <span>
                      {a.signup_count} signup{a.signup_count === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop table — hidden below sm breakpoint */}
          <div className={`hidden sm:block ${cardClasses} overflow-x-auto`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider dark:border-dark-border">
                  <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                    Show
                  </th>
                  <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                    Signups
                  </th>
                  <th className="px-4 py-3 text-left text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleAuditions.map((a) => {
                  const badge = statusBadge(a.status)
                  return (
                    <tr
                      key={a.id}
                      onClick={() => router.push(`/crew/auditions/${a.id}`)}
                      className="border-b border-divider dark:border-dark-border last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface/50"
                    >
                      <td className="px-4 py-3 text-dark dark:text-dark-text font-medium">{a.title}</td>
                      <td className="px-4 py-3 text-dark dark:text-dark-text">{a.show_title ?? 'Standalone'}</td>
                      <td className="px-4 py-3 text-dark dark:text-dark-text">{typeLabel(a.type)}</td>
                      <td className="px-4 py-3 text-dark dark:text-dark-text">{dateLabel(a.date_start, a.date_end)}</td>
                      <td className="px-4 py-3 text-dark dark:text-dark-text">{a.signup_count}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog
        open={showCreateModal}
        onOpenChange={(open) => {
          if (!open) closeModal()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Audition</DialogTitle>
            <DialogDescription>
              Create a new audition. Roles, slots, and materials can be configured after creating it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
                Title<span className="text-brand-accent ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AuditionType)}
                className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              >
                <option value="open_call">Open Call</option>
                <option value="timed_slots">Timed Slots</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
                  Date Start<span className="text-brand-accent ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Date End</label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            {createError && (
              <div className="rounded-lg bg-brand-accent-light border border-brand-accent p-3 text-sm text-dark">
                {createError}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="w-full bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Audition'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="w-full border border-divider text-dark hover:bg-gray-100 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface/50"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
