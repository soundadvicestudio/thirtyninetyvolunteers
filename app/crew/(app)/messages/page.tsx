import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Archive } from 'lucide-react'
import { getYear } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getInboxThreads, getSentThreads, getArchivedThreads } from '@/lib/data/messages'
import { archiveThread } from '@/lib/actions/messages'
import { formatCT } from '@/lib/utils/date'
import { getOrgTimezone } from '@/lib/utils/org-timezone'
import type { InboxThreadRow } from '@/types/messages'

const TABS = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'sent', label: 'Sent' },
  { key: 'archived', label: 'Archived' },
] as const

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>
}) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.messages) {
    redirect('/crew/dashboard')
  }

  const tz = await getOrgTimezone(supabase)
  const currentYear = getYear(toZonedTime(new Date(), tz))

  const params = await searchParams
  const rawTab = params?.tab
  const tab = typeof rawTab === 'string' ? rawTab : 'inbox'
  const activeTab = ['inbox', 'sent', 'archived'].includes(tab) ? tab : 'inbox'

  let threads: InboxThreadRow[] = []
  if (activeTab === 'sent') {
    threads = await getSentThreads(supabase, admin.id)
  } else if (activeTab === 'archived') {
    threads = await getArchivedThreads(supabase, admin.id)
  } else {
    threads = await getInboxThreads(supabase, admin.id)
  }

  return (
    <div className="p-6">
      <div className="pb-4 border-b border-neutral-border mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Messages</h1>
          <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
            Private messages with crew members.
          </p>
        </div>
        <Link
          href="/crew/messages/compose"
          className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark flex items-center gap-2 flex-shrink-0"
        >
          <Plus size={15} />
          New Message
        </Link>
      </div>

      <div className="flex border-b border-neutral-border dark:border-dark-border mb-6">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.key
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {threads.length === 0 && (
        <div className="text-center py-16 text-sm text-mid-gray dark:text-dark-muted">
          {activeTab === 'inbox' && 'No messages yet.'}
          {activeTab === 'sent' && 'No sent messages.'}
          {activeTab === 'archived' && 'No archived messages.'}
        </div>
      )}

      {threads.length > 0 && (
        <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
          <ul className="divide-y divide-neutral-border dark:divide-dark-border">
            {threads.map((thread) => {
              const archiveWithId = archiveThread.bind(null, thread.id) as unknown as (
                formData: FormData
              ) => Promise<void>

              return (
                <li
                  key={thread.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors"
                >
                  {/* Unread dot — always rendered for stable layout */}
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      thread.is_unread ? 'bg-brand-primary' : 'bg-transparent'
                    }`}
                  />

                  {/* Thread link — flex-1 to take remaining space */}
                  <Link href={`/crew/messages/${thread.id}`} className="flex-1 min-w-0 block">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={`text-sm truncate ${
                          thread.is_unread
                            ? 'font-semibold text-dark dark:text-dark-text'
                            : 'font-medium text-dark dark:text-dark-text'
                        }`}
                      >
                        {thread.subject}
                      </p>
                      <span className="text-xs text-mid-gray dark:text-dark-muted flex-shrink-0">
                        {formatCT(
                          thread.last_reply_at,
                          getYear(toZonedTime(new Date(thread.last_reply_at), tz)) === currentYear
                            ? 'MMM d'
                            : 'MMM d, yyyy',
                          tz
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-mid-gray dark:text-dark-muted truncate mt-0.5">
                      {thread.other_person_name}
                      {thread.last_reply_snippet ? ` · ${thread.last_reply_snippet}` : ''}
                    </p>
                  </Link>

                  {/* Archive button — only on inbox and sent tabs */}
                  {activeTab !== 'archived' && (
                    <form action={archiveWithId}>
                      <button
                        type="submit"
                        title="Archive thread"
                        className="p-1.5 rounded text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text transition-colors flex-shrink-0"
                      >
                        <Archive size={15} />
                      </button>
                    </form>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
