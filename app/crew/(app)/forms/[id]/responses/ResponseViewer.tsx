'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { formatCT } from '@/lib/utils/date'
import { escapeCsvField, downloadCsv } from '@/lib/utils/csv'
import type { ResponseRow } from '@/lib/data/forms'
import type { FormFieldData } from '@/types/form'

type MatchFilter = 'all' | 'matched' | 'unmatched'

const inputClasses =
  'rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-xs font-semibold text-mid-gray dark:text-dark-muted uppercase tracking-wide mb-1'

function displayValue(field: FormFieldData, raw: string | undefined): string {
  if (!raw) return ''
  if (field.field_type === 'checkbox') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.join(', ')
      return raw
    } catch {
      return raw
    }
  }
  return raw
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function ResponseViewer({
  form,
  fields,
  responses,
}: {
  form: { id: string; title: string }
  fields: FormFieldData[]
  responses: ResponseRow[]
}) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all')

  const filtered = useMemo(() => {
    return responses.filter((r) => {
      const submitted = new Date(r.submitted_at)
      if (fromDate) {
        const from = new Date(`${fromDate}T00:00:00`)
        if (submitted < from) return false
      }
      if (toDate) {
        const to = new Date(`${toDate}T23:59:59.999`)
        if (submitted > to) return false
      }
      if (matchFilter === 'matched' && !r.volunteer_id) return false
      if (matchFilter === 'unmatched' && r.volunteer_id) return false
      return true
    })
  }, [responses, fromDate, toDate, matchFilter])

  function handleExportCsv() {
    const headers = ['Submitted At', 'Volunteer Name', 'Volunteer Email', ...fields.map((f) => f.label)]
    const lines = [headers.map(escapeCsvField).join(',')]

    for (const r of filtered) {
      const row = [
        formatCT(r.submitted_at, 'MMM d, yyyy h:mm a'),
        r.volunteer_name ?? '',
        r.volunteer_email ?? '',
        ...fields.map((f) => displayValue(f, r.values[f.id!])),
      ]
      lines.push(row.map((v) => escapeCsvField(String(v))).join(','))
    }

    downloadCsv(`${sanitizeFilename(form.title)}-responses.csv`, lines.join('\r\n'))
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className={labelClasses}>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Volunteer Match</label>
            <select
              value={matchFilter}
              onChange={(e) => setMatchFilter(e.target.value as MatchFilter)}
              className={inputClasses}
            >
              <option value="all">All responses</option>
              <option value="matched">Matched volunteers only</option>
              <option value="unmatched">Unmatched only</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
          className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-mid-gray dark:text-dark-muted text-center py-16">
          {responses.length === 0 ? 'No responses yet.' : 'No responses match the current filters.'}
        </p>
      ) : (
        <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted bg-light-navy dark:bg-dark-nav">
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">Submitted At</th>
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">Volunteer</th>
                  {fields.map((field) => (
                    <th key={field.id} className="px-4 py-2 font-semibold whitespace-nowrap">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface">
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`${i % 2 === 1 ? 'bg-gray-50 dark:bg-dark-bg' : ''} border-b border-divider dark:border-dark-border last:border-b-0`}
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-dark dark:text-dark-text">
                      {formatCT(r.submitted_at, 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {r.volunteer_id ? (
                        <Link
                          href={`/crew/volunteers/${r.volunteer_id}`}
                          className="text-navy dark:text-steel font-semibold hover:underline"
                        >
                          {r.volunteer_name}
                        </Link>
                      ) : (
                        <span className="text-mid-gray dark:text-dark-muted">—</span>
                      )}
                    </td>
                    {fields.map((field) => (
                      <td key={field.id} className="px-4 py-2 text-dark dark:text-dark-text">
                        {displayValue(field, r.values[field.id!]) || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
