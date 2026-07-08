'use client'

import { useState } from 'react'
import { saveSignupFormToggles } from '@/lib/actions/settings'

export default function SignupFormSettings({
  initialShowSchool,
  initialShowAgeRange,
}: {
  initialShowSchool: boolean
  initialShowAgeRange: boolean
}) {
  const [showSchool, setShowSchool] = useState(initialShowSchool)
  const [showAgeRange, setShowAgeRange] = useState(initialShowAgeRange)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  async function handleSave() {
    setIsSubmitting(true)
    setFeedback(null)
    const result = await saveSignupFormToggles(showSchool, showAgeRange)
    setIsSubmitting(false)
    if ('success' in result) {
      setFeedback({ type: 'success', message: 'Saved.' })
      return
    }
    setFeedback({ type: 'error', message: result.error })
  }

  return (
    <div className="max-w-xl">
      <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 space-y-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showSchool}
            onChange={(e) => setShowSchool(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-navy cursor-pointer"
          />
          <span>
            <span className="block text-sm font-semibold text-dark dark:text-dark-text">
              Show School field
            </span>
            <span className="block text-sm text-mid-gray dark:text-dark-muted">
              Collects the volunteer&rsquo;s school or organization name on the signup form.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showAgeRange}
            onChange={(e) => setShowAgeRange(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-navy cursor-pointer"
          />
          <span>
            <span className="block text-sm font-semibold text-dark dark:text-dark-text">
              Show Age Range field
            </span>
            <span className="block text-sm text-mid-gray dark:text-dark-muted">
              Collects the volunteer&rsquo;s age range on the signup form.
            </span>
          </span>
        </label>
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
