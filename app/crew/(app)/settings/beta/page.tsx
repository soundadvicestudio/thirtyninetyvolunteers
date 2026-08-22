import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getOrgTimezone } from '@/lib/utils/org-timezone'
import { formatCT } from '@/lib/utils/date'
import { completeBetaFeedback, type BetaFeedbackType } from '@/lib/actions/beta'
import BetaFeedbackForm from '@/components/crew/settings/BetaFeedbackForm'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  owner_admin: 'Owner Admin',
  editor: 'Editor',
  viewer: 'Viewer',
  production: 'Production',
}

const ROLE_BADGE_CLASSES: Record<string, string> = {
  super_admin: 'bg-[#293994] text-white',
  owner_admin: 'bg-indigo-600 text-white',
  editor: 'bg-[#729ABF] text-white',
  viewer: 'bg-mid-gray text-white',
  production: 'bg-[#F26522] text-white',
}

const TYPE_LABELS: Record<BetaFeedbackType, string> = {
  feature_request: 'Feature Request',
  bug_report: 'Bug Report',
  other: 'Other',
}

type QueueItem = {
  id: string
  role_snapshot: string
  type: BetaFeedbackType
  message: string
  submitted_at: string
  submitter_name: string
}

export default async function BetaFeedbackPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.beta) {
    redirect('/crew/dashboard')
  }

  if (admin.role !== 'super_admin') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Beta Testing</h1>
          <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
            Help improve the platform. Submit feature requests, bug reports, or general feedback.
            All submissions go directly to the platform administrator.
          </p>
        </div>
        <BetaFeedbackForm />
      </div>
    )
  }

  const tz = await getOrgTimezone(supabase)

  const { data: queueRaw } = await supabase
    .from('beta_feedback')
    .select('id, role_snapshot, type, message, submitted_at, admin_users(name)')
    .is('completed_at', null)
    .order('submitted_at', { ascending: true })

  const queue: QueueItem[] = (queueRaw ?? []).map((row) => {
    const submitter = Array.isArray(row.admin_users) ? row.admin_users[0] : row.admin_users
    return {
      id: row.id,
      role_snapshot: row.role_snapshot,
      type: row.type as BetaFeedbackType,
      message: row.message,
      submitted_at: row.submitted_at,
      submitter_name: submitter?.name ?? 'Unknown',
    }
  })

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Beta Testing Queue</h1>
        <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
          Submitted items appear here oldest-first. Mark complete to remove from queue (items are
          archived, not deleted).
        </p>
      </div>

      {queue.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No pending feedback — all clear.</p>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => {
            const completeWithId = completeBetaFeedback.bind(null, item.id)
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      ROLE_BADGE_CLASSES[item.role_snapshot] ?? 'bg-mid-gray text-white'
                    }`}
                  >
                    {ROLE_LABELS[item.role_snapshot] ?? item.role_snapshot}
                  </span>
                  <span className="text-sm font-medium text-dark dark:text-dark-text">
                    {item.submitter_name}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-surface text-mid-gray dark:bg-dark-border dark:text-dark-muted">
                    {TYPE_LABELS[item.type]}
                  </span>
                  <span className="text-xs text-mid-gray dark:text-dark-muted ml-auto">
                    {formatCT(item.submitted_at, 'MMM d, yyyy h:mm a', tz)}
                  </span>
                </div>
                <p className="text-sm text-dark dark:text-dark-text whitespace-pre-wrap">{item.message}</p>
                <form action={completeWithId as unknown as (formData: FormData) => Promise<void>}>
                  <button
                    type="submit"
                    className="text-sm font-semibold text-brand-primary hover:underline cursor-pointer"
                  >
                    Mark Complete
                  </button>
                </form>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
