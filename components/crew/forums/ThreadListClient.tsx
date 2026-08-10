'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pin, Lock, MessageSquare } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import { markAllForumRead } from '@/lib/actions/forums'
import type { ForumDetail, ThreadSummary } from '@/types/forums'

function ThreadRow({ forumId, thread }: { forumId: string; thread: ThreadSummary }) {
  return (
    <Link
      href={`/crew/forums/${forumId}/${thread.id}`}
      className="flex items-start justify-between gap-4 px-4 py-3 border-b border-divider dark:border-dark-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {thread.prefix_label && (
            <span className="text-xs font-semibold rounded px-1.5 py-0.5 bg-brand-primary-light text-brand-primary dark:bg-dark-border dark:text-dark-text">
              [{thread.prefix_label}]
            </span>
          )}
          <span className={`text-dark dark:text-dark-text ${thread.has_unread ? 'font-bold' : 'font-medium'}`}>
            {thread.title}
          </span>
          {thread.is_pinned && <Pin size={13} className="text-brand-primary" aria-label="Pinned" />}
          {thread.is_locked && <Lock size={13} className="text-mid-gray" aria-label="Locked" />}
        </div>
        <p className="text-xs text-mid-gray dark:text-dark-muted mt-0.5">
          {`Created by ${thread.created_by_name} on ${formatCT(thread.created_at, 'MMM d, yyyy h:mm a')}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 text-right">
        <div className="flex items-center gap-2">
          {thread.has_unread && <span className="w-2 h-2 rounded-full bg-brand-primary" aria-label="Unread" />}
          <span className="flex items-center gap-1 text-xs text-mid-gray dark:text-dark-muted">
            <MessageSquare size={12} />
            {thread.reply_count}
          </span>
        </div>
        <p className="text-xs text-mid-gray dark:text-dark-muted">
          {thread.last_post_at
            ? `${formatCT(thread.last_post_at, 'MMM d, yyyy h:mm a')} by ${thread.last_post_author ?? 'Unknown'}`
            : 'No replies yet'}
        </p>
      </div>
    </Link>
  )
}

export default function ThreadListClient({
  forum,
  threads,
  isModerator,
  admin,
}: {
  forum: ForumDetail
  threads: ThreadSummary[]
  isModerator: boolean
  admin: { id: string; role: string; name: string }
}) {
  const router = useRouter()
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)
  const [markAllError, setMarkAllError] = useState<string | null>(null)

  const isSaOa = admin.role === 'super_admin' || admin.role === 'owner_admin'
  const pinnedThreads = threads.filter((t) => t.is_pinned)
  const otherThreads = threads.filter((t) => !t.is_pinned)

  async function handleMarkAllRead() {
    setMarkAllError(null)
    setIsMarkingAllRead(true)
    const result = await markAllForumRead(forum.id)
    setIsMarkingAllRead(false)
    if (result.success) {
      router.refresh()
    } else {
      setMarkAllError('Something went wrong marking threads as read.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/crew/forums"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-brand-primary flex items-center gap-1"
      >
        ← Forums
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{forum.name}</h1>
          {forum.description && (
            <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">{forum.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {threads.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={isMarkingAllRead}
              className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline cursor-pointer disabled:opacity-50"
            >
              {isMarkingAllRead ? 'Marking…' : 'Mark all as read'}
            </button>
          )}
          {(isSaOa || isModerator) && (
            <Link
              href="/crew/forums/manage"
              className="text-sm text-brand-primary dark:text-brand-primary-mid hover:underline"
            >
              Manage Forums
            </Link>
          )}
        </div>
      </div>
      {markAllError && <p className="text-sm text-brand-accent">{markAllError}</p>}

      {forum.is_archived && (
        <div className="border border-brand-accent bg-brand-accent-light rounded-lg p-3">
          <p className="text-sm text-dark font-semibold">Archived — no new threads or replies</p>
        </div>
      )}

      {threads.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No threads yet in this forum.</p>
      ) : (
        <div className="space-y-4">
          {pinnedThreads.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-mid-gray dark:text-dark-muted mb-2">
                Pinned
              </p>
              <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
                {pinnedThreads.map((thread) => (
                  <ThreadRow key={thread.id} forumId={forum.id} thread={thread} />
                ))}
              </div>
            </div>
          )}
          {otherThreads.length > 0 && (
            <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
              {otherThreads.map((thread) => (
                <ThreadRow key={thread.id} forumId={forum.id} thread={thread} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
