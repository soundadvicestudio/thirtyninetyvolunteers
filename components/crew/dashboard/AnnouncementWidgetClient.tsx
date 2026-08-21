'use client'

import { useState } from 'react'
import { dismissAnnouncement } from '@/lib/actions/announcements'
import type { DashboardAnnouncement } from '@/lib/data/announcements'

export default function AnnouncementWidgetClient({
  announcements,
}: {
  announcements: DashboardAnnouncement[]
}) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  function handleDismiss() {
    setDismissed(true)
    void dismissAnnouncement()
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-dark dark:text-dark-text">📢 Announcement</span>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="text-mid-gray hover:text-dark dark:text-dark-muted dark:hover:text-dark-text text-lg leading-none cursor-pointer"
        >
          ×
        </button>
      </div>
      {announcements.map((a, i) => (
        <div key={a.updatedAt}>
          {i > 0 && <hr className="my-3 border-divider dark:border-dark-border" />}
          <div
            className="text-sm text-dark dark:text-dark-text leading-relaxed
              [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2
              [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2 [&_li]:mb-0.5
              [&_strong]:font-semibold [&_em]:italic
              [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-border
              [&_blockquote]:pl-3 [&_blockquote]:text-mid-gray
              [&_a]:text-brand-primary [&_a]:underline [&_hr]:my-3"
            dangerouslySetInnerHTML={{ __html: a.body }}
          />
        </div>
      ))}
    </div>
  )
}
