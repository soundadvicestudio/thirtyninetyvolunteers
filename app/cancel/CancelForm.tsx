'use client'

import { useState } from 'react'
import { cancelClaim } from '@/lib/actions/claims'

const inputClasses =
  'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark mb-1'

const SUBMIT_LABEL: Record<'claimed' | 'waitlisted', string> = {
  claimed: 'Cancel My Spot',
  waitlisted: 'Remove Me from the Waitlist',
}

const ERROR_MESSAGE: Record<string, string> = {
  email_mismatch: "That email doesn't match our records. Please check and try again.",
  not_found: 'This cancel link is not valid.',
  already_cancelled: 'This spot has already been cancelled.',
}

export default function CancelForm({
  claimToken,
  claimStatus,
  maskedEmail,
}: {
  claimToken: string
  claimStatus: 'claimed' | 'waitlisted'
  maskedEmail: string
}) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await cancelClaim(claimToken, email)
      if (result.success) {
        setCancelled(true)
      } else {
        setError(ERROR_MESSAGE[result.error ?? ''] ?? 'Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cancelled) {
    return (
      <div className="rounded-lg bg-light-navy p-4 text-navy text-sm leading-relaxed">
        {claimStatus === 'claimed'
          ? "Your spot has been cancelled. If someone was waiting for this role, they've been notified. We hope to see you at a future show!"
          : "You've been removed from the waitlist. Thanks for letting us know — we hope to see you another time!"}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClasses}>
          Confirm your email address to cancel<span className="text-orange ml-0.5">*</span>
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={maskedEmail}
          className={inputClasses}
        />
      </div>

      {error && <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark">{error}</div>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto bg-orange text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting…' : SUBMIT_LABEL[claimStatus]}
      </button>
    </form>
  )
}
