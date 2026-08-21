'use client'

import { useState } from 'react'
import { submitBetaFeedback, type BetaFeedbackType } from '@/lib/actions/beta'

const TYPE_OPTIONS: { value: BetaFeedbackType; label: string }[] = [
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'other', label: 'Other' },
]

const MAX_MESSAGE_LENGTH = 2000

export default function BetaFeedbackForm() {
  const [type, setType] = useState<BetaFeedbackType>('feature_request')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit() {
    setIsSubmitting(true)
    const result = await submitBetaFeedback(type, message)
    if ('success' in result) {
      setSuccessMessage('Submitted — thank you!')
      setType('feature_request')
      setMessage('')
      setErrorMessage(null)
    } else {
      setErrorMessage(result.error)
      setSuccessMessage(null)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-2">Type</label>
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                type === option.value
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 dark:bg-dark-border text-dark dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-surface/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Message</label>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Describe your feedback..."
          className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />
        <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
          {message.length} / {MAX_MESSAGE_LENGTH}
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || message.trim().length === 0}
          className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
        {successMessage && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">{successMessage}</p>
        )}
        {errorMessage && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}
