import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { formatCT } from '@/lib/utils/date'
import CopyUrlButton from '@/components/crew/opportunities/CopyUrlButton'
import type { StandingOpportunity, ClaimType, OpportunityStatus } from '@/types/opportunity'

const CLAIM_TYPE_LABEL: Record<ClaimType, string> = { eoi: 'EOI', slot_claim: 'Slot Claim' }
const CLAIM_TYPE_BADGE: Record<ClaimType, string> = {
  eoi: 'bg-steel text-white',
  slot_claim: 'bg-navy text-white',
}
const OPP_STATUS_LABEL: Record<OpportunityStatus, string> = { active: 'Active', archived: 'Archived' }
const OPP_STATUS_BADGE: Record<OpportunityStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-mid-gray/20 text-mid-gray dark:bg-dark-border dark:text-dark-muted',
}
const SUBMISSION_STATUS_LABEL: Record<'submitted' | 'cancelled', string> = {
  submitted: 'Submitted',
  cancelled: 'Cancelled',
}
const SUBMISSION_STATUS_BADGE: Record<'submitted' | 'cancelled', string> = {
  submitted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-mid-gray/20 text-mid-gray dark:bg-dark-border dark:text-dark-muted',
}

type SubmissionRow = {
  id: string
  volunteer_name: string
  volunteer_email: string
  volunteer_phone: string | null
  volunteer_id: string | null
  status: 'submitted' | 'cancelled'
  submitted_at: string
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const { id } = await params
  const supabase = await getServerClient()

  const { data: opportunity } = await supabase
    .from('standing_opportunities')
    .select(
      'id, title, description, claim_type, slot_cap_enabled, slot_cap, status, created_by, created_at, updated_at'
    )
    .eq('id', id)
    .maybeSingle()

  if (!opportunity) {
    notFound()
  }

  const { data: submissionRows } = await supabase
    .from('opportunity_submissions')
    .select('id, volunteer_name, volunteer_email, volunteer_phone, volunteer_id, status, submitted_at')
    .eq('opportunity_id', id)
    .order('submitted_at', { ascending: true })

  const submissions = (submissionRows ?? []) as SubmissionRow[]
  const opp = opportunity as StandingOpportunity
  const canEdit = admin.role === 'super_admin' || admin.role === 'editor'
  const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/opportunities/${opp.id}`

  return (
    <div>
      <Link
        href="/crew/shows/opportunities"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Standing Opportunities
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{opp.title}</h1>
        <span className={`text-xs font-semibold rounded px-2 py-0.5 ${CLAIM_TYPE_BADGE[opp.claim_type]}`}>
          {CLAIM_TYPE_LABEL[opp.claim_type]}
        </span>
        <span className={`text-xs font-semibold rounded px-2 py-0.5 ${OPP_STATUS_BADGE[opp.status]}`}>
          {OPP_STATUS_LABEL[opp.status]}
        </span>
      </div>

      {opp.description && <p className="text-dark dark:text-dark-text mb-4 max-w-2xl">{opp.description}</p>}

      <p className="text-sm text-mid-gray dark:text-dark-muted mb-6">
        {opp.slot_cap_enabled && opp.slot_cap != null ? `Cap: ${opp.slot_cap}` : 'Open-ended'}
      </p>

      {canEdit && opp.status === 'active' && (
        <Link
          href={`/crew/shows/opportunities/${opp.id}/edit`}
          className="inline-block bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium mb-6"
        >
          Edit
        </Link>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-10">
        <span className="text-sm text-dark dark:text-dark-text font-mono bg-light-navy dark:bg-dark-surface px-3 py-1.5 rounded break-all">
          {publicUrl}
        </span>
        <CopyUrlButton url={publicUrl} />
        <a
          href={`/opportunities/${opp.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-navy dark:text-steel hover:underline"
        >
          View
        </a>
      </div>

      <section>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">
          Submissions ({submissions.length})
        </h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-mid-gray dark:text-dark-muted">No submissions yet.</p>
        ) : (
          <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted bg-light-navy dark:bg-dark-nav">
                  <th className="px-4 py-2 font-semibold">Name</th>
                  <th className="px-4 py-2 font-semibold">Email</th>
                  <th className="px-4 py-2 font-semibold">Phone</th>
                  <th className="px-4 py-2 font-semibold">Linked Volunteer</th>
                  <th className="px-4 py-2 font-semibold">Submitted</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface">
                {submissions.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`${i % 2 === 1 ? 'bg-gray-50 dark:bg-dark-bg' : ''} border-b border-divider dark:border-dark-border last:border-b-0`}
                  >
                    <td className="px-4 py-2 text-dark dark:text-dark-text">{s.volunteer_name}</td>
                    <td className="px-4 py-2 text-dark dark:text-dark-text">{s.volunteer_email}</td>
                    <td className="px-4 py-2 text-dark dark:text-dark-text">{s.volunteer_phone ?? '—'}</td>
                    <td className="px-4 py-2">
                      {s.volunteer_id ? (
                        <Link
                          href={`/crew/volunteers/${s.volunteer_id}`}
                          className="text-navy dark:text-steel hover:underline"
                        >
                          {s.volunteer_name}
                        </Link>
                      ) : (
                        <span className="text-mid-gray dark:text-dark-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-dark dark:text-dark-text">
                      {formatCT(s.submitted_at, 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs font-semibold rounded px-2 py-0.5 ${SUBMISSION_STATUS_BADGE[s.status]}`}
                      >
                        {SUBMISSION_STATUS_LABEL[s.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
