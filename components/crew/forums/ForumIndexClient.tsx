'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import type { CategoryWithForumSummary } from '@/types/forums'

export default function ForumIndexClient({
  categories,
  admin,
}: {
  categories: CategoryWithForumSummary[]
  admin: { id: string; role: string; name: string }
}) {
  const tz = typeof document !== 'undefined' ? (document.body.dataset.timezone || 'America/Chicago') : 'America/Chicago'
  const isSaOa = admin.role === 'super_admin' || admin.role === 'owner_admin'

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-mid-gray dark:text-dark-muted">No forums available.</p>
        {isSaOa && (
          <p className="text-sm text-mid-gray dark:text-dark-muted mt-2">
            Create categories and forums from{' '}
            <Link href="/crew/forums/manage" className="text-brand-primary dark:text-brand-primary-mid hover:underline">
              Forum Management
            </Link>
            .
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category.id}>
          <div className="bg-neutral-surface dark:bg-dark-nav border-y border-neutral-border dark:border-dark-border px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mid-gray dark:text-dark-muted">
              {category.name}
            </span>
          </div>
          <div className="bg-white dark:bg-dark-surface border border-neutral-border dark:border-dark-border rounded-lg overflow-hidden mb-6">
            {category.forums.map((forum) => (
              <Link
                key={forum.id}
                href={`/crew/forums/${forum.id}`}
                className="flex items-start gap-4 px-4 py-3.5 border-b border-neutral-border dark:border-dark-border last:border-b-0 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors border-l-4"
                style={{ borderLeftColor: 'var(--brand-primary)' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-dark dark:text-dark-text">
                      {forum.name}
                      {forum.unread_count > 0 && (
                        <span
                          className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: 'var(--brand-primary)' }}
                        >
                          {forum.unread_count}
                        </span>
                      )}
                    </span>
                    {forum.is_archived && (
                      <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-mid-gray/20 text-mid-gray">
                        Archived
                      </span>
                    )}
                  </div>
                  {forum.description && (
                    <p className="text-xs text-mid-gray dark:text-dark-muted mt-0.5">
                      {forum.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                  <span className="flex items-center gap-1 text-xs text-mid-gray dark:text-dark-muted">
                    <MessageSquare size={12} />
                    {forum.thread_count}
                  </span>
                  <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
                    {forum.last_post_at
                      ? `Last post ${formatCT(forum.last_post_at, 'MMM d, yyyy h:mm a', tz)} by ${forum.last_post_author ?? 'Unknown'}`
                      : 'No posts yet'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
