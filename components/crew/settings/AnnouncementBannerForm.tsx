'use client'

import { useState } from 'react'
import { saveAnnouncementBanner } from '@/lib/actions/settings'

const MAX_LENGTH = 280

export default function AnnouncementBannerForm({
  initialText,
  initialActive,
}: {
  initialText: string
  initialActive: boolean
}) {
  const [text, setText] = useState(initialText)
  const [active, setActive] = useState(initialActive)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  async function handleSave() {
    setIsSubmitting(true)
    setFeedback(null)
    const result = await saveAnnouncementBanner(text, active)
    setIsSubmitting(false)
    if ('success' in result) {
      setFeedback({ type: 'success', message: 'Saved.' })
      return
    }
    setFeedback({ type: 'error', message: result.error })
  }

  const showPreview = active && text.trim().length > 0

  return (
    <div className="max-w-xl">
      <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 accent-navy cursor-pointer"
          />
          <span className="text-sm font-semibold text-dark dark:text-dark-text">Banner active</span>
        </label>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-dark dark:text-dark-text">
              Banner message
            </label>
            <span className="text-xs text-mid-gray dark:text-dark-muted">
              {text.length} / {MAX_LENGTH}
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
            maxLength={MAX_LENGTH}
            rows={3}
            placeholder="e.g. Tickets for our Spring show are on sale now!"
            className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy resize-y"
          />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold text-dark dark:text-dark-text mb-2">Preview</h2>
        {showPreview ? (
          <div className="w-full bg-orange py-3 px-4 rounded-lg">
            <p className="text-white font-semibold text-center">{text}</p>
          </div>
        ) : (
          <div className="w-full border border-dashed border-divider dark:border-dark-border rounded-lg py-3 px-4">
            <p className="text-mid-gray dark:text-dark-muted text-sm text-center">
              Banner preview will appear here.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
        {feedback && (
          <p
            className={`text-sm ${
              feedback.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-orange'
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </div>
  )
}
