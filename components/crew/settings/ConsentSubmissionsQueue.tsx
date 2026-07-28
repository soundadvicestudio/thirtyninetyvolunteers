'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCT } from '@/lib/utils/date'
import { approveConsentSubmission, rejectConsentSubmission } from '@/lib/actions/documents'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

export type ConsentSubmissionRow = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string | null
  submittedFilePath: string | null
  notes: string | null
  createdAt: string
  volunteer: { id: string; full_name: string; email: string } | null
  documentTypeName: string
}

type Tab = 'pending' | 'approved' | 'rejected'

const TAB_LABELS: Record<Tab, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

const EMPTY_MESSAGE: Record<Tab, string> = {
  pending: 'No pending consent form submissions.',
  approved: 'No approved submissions yet.',
  rejected: 'No rejected submissions.',
}

function SubmissionRow({ submission }: { submission: ConsentSubmissionRow }) {
  const router = useRouter()
  const [rejecting, setRejecting] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setError(null)
    setIsSubmitting(true)
    const result = await approveConsentSubmission(submission.id)
    setIsSubmitting(false)
    if ('success' in result) {
      router.refresh()
      return
    }
    setError(result.error)
  }

  async function handleReject() {
    setError(null)
    setIsSubmitting(true)
    const result = await rejectConsentSubmission(submission.id, notes || undefined)
    setIsSubmitting(false)
    if ('success' in result) {
      setRejecting(false)
      router.refresh()
      return
    }
    setError(result.error)
  }

  return (
    <tr className="border-b border-divider dark:border-dark-border last:border-b-0">
      <td className="px-4 py-2 align-top">
        {submission.volunteer ? (
          <Link
            href={`/crew/volunteers/${submission.volunteer.id}`}
            className="text-brand-primary dark:text-brand-primary-mid hover:underline font-medium"
          >
            {submission.volunteer.full_name}
          </Link>
        ) : (
          <span className="text-mid-gray dark:text-dark-muted">Unknown volunteer</span>
        )}
      </td>
      <td className="px-4 py-2 align-top text-dark dark:text-dark-text">{submission.documentTypeName}</td>
      <td className="px-4 py-2 align-top text-dark dark:text-dark-text">
        {submission.submittedAt ? formatCT(submission.submittedAt, 'MMM d, yyyy h:mm a') : '—'}
      </td>
      <td className="px-4 py-2 align-top">
        {submission.submittedFilePath ? (
          <a
            href={submission.submittedFilePath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary dark:text-brand-primary-mid hover:underline font-semibold"
          >
            View
          </a>
        ) : (
          <span className="text-mid-gray dark:text-dark-muted">—</span>
        )}
      </td>
      <td className="px-4 py-2 align-top">
        {submission.status === 'pending' && (
          <>
            {!rejecting ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Approving…' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  disabled={isSubmitting}
                  className="border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-w-xs">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason (optional)"
                  className="rounded border border-divider dark:border-dark-border px-2 py-1 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="bg-brand-accent text-white hover:bg-opacity-90 transition-colors text-sm px-3 py-1 rounded-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Rejecting…' : 'Confirm Reject'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejecting(false)
                      setNotes('')
                    }}
                    disabled={isSubmitting}
                    className="text-sm font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {submission.status !== 'pending' && (
          <span className="text-mid-gray dark:text-dark-muted text-sm">
            {submission.status === 'approved' ? 'Approved' : 'Rejected'}
            {submission.notes && ` — ${submission.notes}`}
          </span>
        )}
        {error && <p className="text-xs text-brand-accent mt-1">{error}</p>}
      </td>
    </tr>
  )
}

export function ConsentSubmissionsQueue({ submissions }: { submissions: ConsentSubmissionRow[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('pending')

  if (submissions.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3 flex items-center gap-1.5">
          Consent Form Submissions
          <HelpTooltip anchor="consent-forms" label="Consent Form Submissions" />
        </h2>
        <p className="text-sm text-mid-gray dark:text-dark-muted">
          No consent form submissions have been received yet. Submissions appear here when volunteers under 18
          complete the signup form.
        </p>
      </div>
    )
  }

  const counts: Record<Tab, number> = {
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  }

  const filtered = submissions.filter((s) => s.status === activeTab)

  return (
    <div>
      <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3 flex items-center gap-1.5">
        Consent Form Submissions
        <HelpTooltip anchor="consent-forms" label="Consent Form Submissions" />
      </h2>

      <div className="flex flex-wrap gap-1 border-b border-divider dark:border-dark-border mb-4">
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-brand-primary dark:border-brand-primary-mid text-brand-primary dark:text-brand-primary-mid'
                : 'border-transparent text-mid-gray dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary-mid'
            }`}
          >
            {TAB_LABELS[tab]}
            {tab === 'pending' && counts.pending > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-brand-accent text-white text-xs font-semibold px-1">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">{EMPTY_MESSAGE[activeTab]}</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted bg-brand-primary-light dark:bg-dark-nav">
                <th className="px-4 py-2 font-semibold">Volunteer</th>
                <th className="px-4 py-2 font-semibold">Form Type</th>
                <th className="px-4 py-2 font-semibold">Submitted</th>
                <th className="px-4 py-2 font-semibold">File</th>
                <th className="px-4 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
