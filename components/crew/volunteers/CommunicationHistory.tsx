'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import type { CommunicationHistoryEntry } from '@/types/volunteer'

function getEmailTypeLabel(recipientType: string, recipientFilter: string | null): string {
  if (recipientType === 'transactional') return 'Transactional'
  if (recipientType === 'individual') return 'Direct'
  if (recipientType === 'all') return 'All Volunteers'
  if (recipientType === 'category') {
    if (recipientFilter?.startsWith('show:')) return 'Show Message'
    return 'Category Email'
  }
  return recipientType
}

function truncatePreview(preview: string | null): string {
  if (!preview) return '—'
  return preview.length > 80 ? `${preview.slice(0, 80)}…` : preview
}

export default function CommunicationHistory({ history }: { history: CommunicationHistoryEntry[] }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="mt-10">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center gap-2 w-full text-left cursor-pointer"
      >
        <h2 className="text-lg font-semibold text-dark dark:text-dark-text">Communication History</h2>
        <span className="text-sm text-mid-gray dark:text-dark-muted">
          {history.length > 0 ? `(${history.length})` : '(None)'}
        </span>
        {isExpanded ? (
          <ChevronUp size={18} className="text-mid-gray dark:text-dark-muted ml-auto" />
        ) : (
          <ChevronDown size={18} className="text-mid-gray dark:text-dark-muted ml-auto" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4">
          {history.length === 0 ? (
            <div>
              <p className="text-mid-gray dark:text-dark-muted text-sm">No emails on record for this volunteer.</p>
              <p className="text-mid-gray dark:text-dark-muted text-xs mt-1">
                Only emails sent and logged through this platform appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider dark:border-dark-border text-left">
                    <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Date
                    </th>
                    <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Type
                    </th>
                    <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Sent By
                    </th>
                    <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                      Preview
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, i) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-divider dark:border-dark-border ${i % 2 === 0 ? 'bg-light-navy/30 dark:bg-dark-surface/30' : ''}`}
                    >
                      <td className="px-4 py-3 text-dark dark:text-dark-text whitespace-nowrap">
                        {formatCT(entry.sentAt, 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-4 py-3 text-dark dark:text-dark-text">{entry.subject}</td>
                      <td className="px-4 py-3 text-dark dark:text-dark-text">
                        {getEmailTypeLabel(entry.recipientType, entry.recipientFilter)}
                      </td>
                      <td className="px-4 py-3 text-dark dark:text-dark-text">{entry.sentByName ?? 'System'}</td>
                      <td className="px-4 py-3 text-mid-gray dark:text-dark-muted">
                        {truncatePreview(entry.bodyPreview)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
