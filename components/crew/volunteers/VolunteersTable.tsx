'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Users, SearchX } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import { buildVolunteersCsv, csvExportFilename, downloadCsv } from '@/lib/utils/csv'
import { buildVolunteersUrl, isNonDefaultFilter, type VolunteersUrlState } from '@/lib/volunteers/url'
import type { VolunteerListRow } from '@/types/volunteer'
import type { AdminUser } from '@/lib/auth'

type SortableColumn = 'name' | 'hours' | 'calls' | 'joined'

const COLUMN_LABELS: Record<SortableColumn, string> = {
  name: 'Name',
  hours: 'Total Hours',
  calls: 'Calls',
  joined: 'Joined',
}

function getPageNumbers(current: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages = new Set([1, totalPages, current, current - 1, current - 2, current + 1, current + 2])
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis')
    result.push(p)
    prev = p
  }
  return result
}

export default function VolunteersTable({
  volunteers,
  total,
  page,
  pageSize,
  role,
  state,
}: {
  volunteers: VolunteerListRow[]
  total: number
  page: number
  pageSize: number
  role: AdminUser['role']
  state: VolunteersUrlState
}) {
  const router = useRouter()
  const pathname = usePathname()
  const canManage = role === 'super_admin' || role === 'editor'

  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSelected(new Set())
  }, [page, state])

  function goTo(next: Partial<VolunteersUrlState>) {
    router.replace(buildVolunteersUrl(pathname, { ...state, ...next }), { scroll: false })
  }

  function toggleSort(column: SortableColumn) {
    const nextDir = state.sort === column && state.dir === 'asc' ? 'desc' : 'asc'
    goTo({ sort: column, dir: nextDir, page: 1 })
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const allSelected = volunteers.every((v) => prev.has(v.id))
      if (allSelected) return new Set()
      return new Set(volunteers.map((v) => v.id))
    })
  }

  function exportCsv(scope: 'selected' | 'page') {
    const rows =
      scope === 'selected' ? volunteers.filter((v) => selected.has(v.id)) : volunteers
    downloadCsv(csvExportFilename(), buildVolunteersCsv(rows))
  }

  if (total === 0) {
    const filtered = isNonDefaultFilter(state)
    return (
      <div className="bg-white border border-divider rounded-lg py-16 px-6 flex flex-col items-center text-center">
        {filtered ? (
          <>
            <SearchX size={40} className="text-mid-gray mb-3" />
            <h3 className="text-dark font-semibold text-lg">No volunteers match your filters.</h3>
            <p className="text-mid-gray text-sm mt-1 mb-4">
              Try adjusting your search or clearing your filters.
            </p>
            <button
              type="button"
              onClick={() => router.replace(pathname, { scroll: false })}
              className="bg-white border border-navy text-navy font-semibold px-4 py-2 rounded hover:bg-light-navy transition-colors"
            >
              Clear Filters
            </button>
          </>
        ) : (
          <>
            <Users size={40} className="text-mid-gray mb-3" />
            <h3 className="text-dark font-semibold text-lg">No volunteers yet.</h3>
            <p className="text-mid-gray text-sm mt-1">
              Share your signup link to get started.
            </p>
          </>
        )}
      </div>
    )
  }

  const allOnPageSelected = volunteers.length > 0 && volunteers.every((v) => selected.has(v.id))
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div>
      {canManage && selected.size > 0 && (
        <div className="flex items-center gap-4 bg-light-navy border border-divider rounded-lg px-4 py-2 mb-3 text-sm">
          <span className="text-dark font-medium">{selected.size} volunteer(s) selected</span>
          <button
            type="button"
            onClick={() => exportCsv('selected')}
            className="text-navy font-semibold hover:underline"
          >
            Export Selected (CSV)
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-mid-gray hover:underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {canManage && selected.size === 0 && (
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => exportCsv('page')}
            className="flex items-center gap-1.5 text-sm bg-white border border-navy text-navy font-semibold px-3 py-1.5 rounded hover:bg-light-navy transition-colors"
          >
            <Download size={14} />
            Export All (CSV)
          </button>
        </div>
      )}

      <div className="bg-white border border-divider rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider text-left">
              {canManage && (
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAllOnPage}
                    aria-label="Select all on page"
                    className="rounded border-divider text-navy focus:ring-navy"
                  />
                </th>
              )}
              <SortableTh
                label={COLUMN_LABELS.name}
                active={state.sort === 'name'}
                dir={state.dir}
                onClick={() => toggleSort('name')}
              />
              <th className="px-4 py-3 font-semibold text-dark">Email</th>
              <th className="px-4 py-3 font-semibold text-dark">Phone</th>
              <th className="px-4 py-3 font-semibold text-dark">Categories</th>
              <SortableTh
                label={COLUMN_LABELS.hours}
                active={state.sort === 'hours'}
                dir={state.dir}
                onClick={() => toggleSort('hours')}
                align="right"
              />
              <SortableTh
                label={COLUMN_LABELS.calls}
                active={state.sort === 'calls'}
                dir={state.dir}
                onClick={() => toggleSort('calls')}
                align="right"
              />
              <th className="px-4 py-3 font-semibold text-dark">Status</th>
              <SortableTh
                label={COLUMN_LABELS.joined}
                active={state.sort === 'joined'}
                dir={state.dir}
                onClick={() => toggleSort('joined')}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {volunteers.map((v) => (
              <tr key={v.id} className="hover:bg-light-navy/50">
                {canManage && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(v.id)}
                      onChange={() => toggleRow(v.id)}
                      aria-label={`Select ${v.full_name}`}
                      className="rounded border-divider text-navy focus:ring-navy"
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  <Link
                    href={`/crew/volunteers/${v.id}`}
                    className="text-navy font-medium hover:underline"
                  >
                    {v.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-dark">{v.email}</td>
                <td className="px-4 py-3 text-dark">{v.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {v.categories.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className="bg-light-navy text-navy text-xs rounded-full px-2 py-0.5"
                      >
                        {c.name}
                      </span>
                    ))}
                    {v.categories.length > 3 && (
                      <span className="text-xs text-mid-gray">
                        +{v.categories.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-dark">{v.total_hours}</td>
                <td className="px-4 py-3 text-right text-dark">{v.calls}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-semibold rounded px-2 py-0.5 ${
                      v.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-mid-gray text-white'
                    }`}
                  >
                    {v.status === 'active' ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="px-4 py-3 text-dark">{formatCT(v.created_at, 'MMM d, yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm text-mid-gray">
        <span>
          Showing {rangeStart}–{rangeEnd} of {total} volunteers
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goTo({ page: page - 1 })}
              className="px-2 py-1 rounded border border-divider text-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-light-navy"
            >
              Previous
            </button>
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`e${i}`} className="px-2 text-mid-gray">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goTo({ page: p })}
                  className={`px-2.5 py-1 rounded border ${
                    p === page
                      ? 'bg-navy text-white border-navy'
                      : 'border-divider text-dark hover:bg-light-navy'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goTo({ page: page + 1 })}
              className="px-2 py-1 rounded border border-divider text-dark disabled:opacity-40 disabled:cursor-not-allowed hover:bg-light-navy"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
  align = 'left',
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onClick: () => void
  align?: 'left' | 'right'
}) {
  return (
    <th className={`px-4 py-3 font-semibold text-dark ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-navy transition-colors ${
          align === 'right' ? 'flex-row-reverse' : ''
        }`}
      >
        {label}
        {active ? (
          dir === 'asc' ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )
        ) : (
          <ChevronsUpDown size={14} className="text-mid-gray" />
        )}
      </button>
    </th>
  )
}
