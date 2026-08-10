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
          <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">{category.name}</h2>
          <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden">
            {category.forums.map((forum) => (
              <Link
                key={forum.id}
                href={`/crew/forums/${forum.id}`}
                className="flex items-start justify-between gap-4 px-4 py-3 border-b border-divider dark:border-dark-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-dark dark:text-dark-text ${forum.unread_count > 0 ? 'font-bold' : 'font-medium'}`}
                    >
                      {forum.name}
                    </span>
                    {forum.is_archived && (
                      <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-mid-gray/20 text-mid-gray">
                        Archived
                      </span>
                    )}
                  </div>
                  {forum.description && (
                    <p className="text-sm text-mid-gray dark:text-dark-muted line-clamp-2 mt-0.5">
                      {forum.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                  <div className="flex items-center gap-2">
                    {forum.unread_count > 0 && (
                      <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-brand-primary text-white">
                        {forum.unread_count} unread
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-mid-gray dark:text-dark-muted">
                      <MessageSquare size={12} />
                      {forum.thread_count}
                    </span>
                  </div>
                  <p className="text-xs text-mid-gray dark:text-dark-muted">
                    {forum.last_post_at
                      ? `Last post ${formatCT(forum.last_post_at, 'MMM d, yyyy h:mm a')} by ${forum.last_post_author ?? 'Unknown'}`
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
