'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pin, Lock, Bell, BellOff, Paperclip } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import { toggleThreadSubscription } from '@/lib/actions/forum-posts'
import ForumPostComposer from '@/components/crew/forums/ForumPostComposer'
import type { ThreadViewData } from '@/types/forums'

export default function ThreadViewClient({ data }: { data: ThreadViewData }) {
  const { thread, forum, posts } = data
  const [isSubscribed, setIsSubscribed] = useState(data.isSubscribed)
  const [isTogglingSubscription, setIsTogglingSubscription] = useState(false)
  const [subscribeError, setSubscribeError] = useState<string | null>(null)

  async function handleToggleSubscription() {
    setSubscribeError(null)
    setIsTogglingSubscription(true)
    const result = await toggleThreadSubscription(thread.id)
    setIsTogglingSubscription(false)
    if ('error' in result) {
      setSubscribeError(result.error)
    } else {
      setIsSubscribed(result.subscribed)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <nav className="text-sm text-mid-gray dark:text-dark-muted flex items-center gap-1.5 flex-wrap">
        <Link href="/crew/forums" className="hover:text-brand-primary">
          Forums
        </Link>
        <span>›</span>
        <Link href={`/crew/forums/${thread.forum_id}`} className="hover:text-brand-primary">
          {forum.name}
        </Link>
        <span>›</span>
        <span className="text-dark dark:text-dark-text">{thread.title}</span>
      </nav>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {thread.prefix_label && (
              <span className="text-xs font-semibold rounded px-1.5 py-0.5 bg-brand-primary-light text-brand-primary dark:bg-dark-border dark:text-dark-text">
                [{thread.prefix_label}]
              </span>
            )}
            <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{thread.title}</h1>
            {thread.is_pinned && (
              <span className="flex items-center gap-1 text-xs font-semibold text-brand-primary">
                <Pin size={14} /> Pinned
              </span>
            )}
            {thread.is_locked && (
              <span className="flex items-center gap-1 text-xs font-semibold text-mid-gray">
                <Lock size={14} /> Locked
              </span>
            )}
          </div>
          <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
            {`Posted by ${thread.created_by_name} on ${formatCT(thread.created_at, 'MMM d, yyyy h:mm a')}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleToggleSubscription}
            disabled={isTogglingSubscription}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-md border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer disabled:opacity-50"
          >
            {isSubscribed ? <BellOff size={14} /> : <Bell size={14} />}
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </button>
          {subscribeError && <p className="text-xs text-brand-accent">{subscribeError}</p>}
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No posts in this thread yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4 flex flex-col sm:flex-row gap-4"
            >
              <div className="sm:w-40 shrink-0">
                <p className="text-dark dark:text-dark-text font-bold text-sm">{post.author_name}</p>
                <p className="text-xs text-mid-gray dark:text-dark-muted mt-0.5">
                  {formatCT(post.created_at, 'MMM d, yyyy h:mm a')}
                </p>
                {post.edited_at && <p className="text-xs text-mid-gray dark:text-dark-muted italic">(edited)</p>}
              </div>
              <div className="flex-1 min-w-0">
                {post.is_deleted ? (
                  <p className="text-mid-gray dark:text-dark-muted italic text-sm">[Post deleted]</p>
                ) : (
                  <>
                    <div
                      dangerouslySetInnerHTML={{ __html: post.body_html }}
                      className="prose prose-sm max-w-none dark:prose-invert"
                    />
                    {post.attachments.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-divider dark:border-dark-border pt-2">
                        {post.attachments.map((a) => (
                          <div key={a.id} className="flex items-center gap-1.5 text-sm">
                            <Paperclip size={13} className="text-mid-gray dark:text-dark-muted" />
                            {a.signed_url ? (
                              <a
                                href={a.signed_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-primary dark:text-brand-primary-mid hover:underline"
                              >
                                {a.filename}
                              </a>
                            ) : (
                              <span className="text-dark dark:text-dark-text">{a.filename}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {thread.is_locked ? (
        <p className="text-center text-sm text-mid-gray dark:text-dark-muted py-4">
          This thread is locked. No new replies can be added.
        </p>
      ) : (
        <ForumPostComposer threadId={thread.id} forumId={thread.forum_id} />
      )}
    </div>
  )
}
