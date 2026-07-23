import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { formatCT } from '@/lib/utils/date'
import AboutSystemEmails from '@/components/crew/settings/AboutSystemEmails'

const PAGE_SIZE = 25

type Tab = 'all' | 'system' | 'about'

type EmailLogRow = {
  id: string
  sent_at: string
  subject: string
  recipient_type: string
  recipient_filter: string | null
  recipient_count: number
  sent_by: string | null
  admin: { id: string; name: string } | null
}

function getEmailTypeLabel(recipientType: string, recipientFilter: string | null, sentBy: string | null): string {
  if (recipientType === 'transactional') return sentBy ? 'Transactional' : 'System'
  if (recipientType === 'individual') return 'Direct'
  if (recipientType === 'all') return 'All Volunteers'
  if (recipientType === 'category') {
    if (recipientFilter?.startsWith('show:')) return 'Show Message'
    return 'Category Email'
  }
  return recipientType
}

function buildEmailActivityHref(tab: Tab, page: number): string {
  const usp = new URLSearchParams()
  if (tab !== 'all') usp.set('tab', tab)
  if (page !== 1) usp.set('page', String(page))
  const qs = usp.toString()
  return qs ? `/crew/settings/email-activity?${qs}` : '/crew/settings/email-activity'
}

function TabLink({ tab, activeTab, label }: { tab: Tab; activeTab: Tab; label: string }) {
  const isActive = tab === activeTab
  return (
    <Link
      href={buildEmailActivityHref(tab, 1)}
      className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
        isActive
          ? 'border-navy dark:border-steel text-navy dark:text-steel'
          : 'border-transparent text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel'
      }`}
    >
      {label}
    </Link>
  )
}

export default async function EmailActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role !== 'super_admin') {
    redirect('/crew/settings')
  }

  const params = await searchParams
  const tab: Tab = params.tab === 'system' ? 'system' : params.tab === 'about' ? 'about' : 'all'
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  let entries: EmailLogRow[] = []
  let totalCount = 0

  if (tab !== 'about') {
    const supabase = await getServerClient()
    let query = supabase
      .from('email_log')
      .select(
        `
        id, sent_at, subject, recipient_type, recipient_filter, recipient_count, sent_by,
        admin:admin_users(id, name)
        `,
        { count: 'exact' }
      )
      .order('sent_at', { ascending: false })
      .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1)

    if (tab === 'system') {
      query = query.is('sent_by', null)
    }

    const { data, count } = await query
    entries = (data as unknown as EmailLogRow[]) ?? []
    totalCount = count ?? 0
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel flex items-center gap-1 mb-6"
      >
        ← Back to Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Email Activity</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-6">
        A log of all emails sent by the platform.
      </p>

      <div className="flex gap-1 border-b border-divider dark:border-dark-border mb-6">
        <TabLink tab="all" activeTab={tab} label="All Emails" />
        <TabLink tab="system" activeTab={tab} label="System Only" />
        <TabLink tab="about" activeTab={tab} label="About System Emails" />
      </div>

      {tab === 'about' ? (
        <AboutSystemEmails />
      ) : entries.length === 0 ? (
        <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg py-16 px-6 text-center">
          <p className="text-mid-gray dark:text-dark-muted mb-1">No emails on record yet.</p>
          <p className="text-mid-gray dark:text-dark-muted text-xs">
            Emails will appear here as the platform sends them.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider dark:border-dark-border text-left">
                  <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs whitespace-nowrap">
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
                    Recipients
                  </th>
                  <th className="px-4 py-3 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">
                    Trigger / Filter
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-divider dark:border-dark-border ${
                      i % 2 === 0 ? 'bg-light-navy/30 dark:bg-dark-surface/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-dark dark:text-dark-text whitespace-nowrap">
                      {formatCT(entry.sent_at, 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-4 py-3 text-dark dark:text-dark-text">{entry.subject}</td>
                    <td className="px-4 py-3 text-dark dark:text-dark-text whitespace-nowrap">
                      {getEmailTypeLabel(entry.recipient_type, entry.recipient_filter, entry.sent_by)}
                    </td>
                    <td className="px-4 py-3 text-dark dark:text-dark-text whitespace-nowrap">
                      {entry.admin?.name ?? 'System'}
                    </td>
                    <td className="px-4 py-3 text-dark dark:text-dark-text">{entry.recipient_count}</td>
                    <td className="px-4 py-3">
                      {entry.recipient_filter ? (
                        <span className="font-mono text-xs text-mid-gray dark:text-dark-muted bg-light-navy/50 dark:bg-dark-bg px-1.5 py-0.5 rounded">
                          {entry.recipient_filter}
                        </span>
                      ) : (
                        <span className="text-mid-gray dark:text-dark-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <Link
                href={buildEmailActivityHref(tab, Math.max(1, currentPage - 1))}
                className={`px-3 py-1.5 rounded border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors ${
                  currentPage <= 1 ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                Previous
              </Link>
              <span className="text-mid-gray dark:text-dark-muted">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={buildEmailActivityHref(tab, Math.min(totalPages, currentPage + 1))}
                className={`px-3 py-1.5 rounded border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors ${
                  currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
