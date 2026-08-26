'use client'

import { useState, useRef } from 'react'
import {
  lookupVolunteerForClaim,
  submitClaim,
  submitClaimWithLookup,
  type SubmitClaimResult,
} from '@/lib/actions/claims'

const inputClasses =
  'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark mb-1'
const primaryButtonClasses =
  'w-full sm:w-auto bg-brand-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50'
const errorBannerClasses = 'rounded-lg bg-brand-accent-light border border-brand-accent p-3 text-sm text-dark'
const slotSummaryCardClasses = 'rounded-lg bg-neutral-surface border border-neutral-border p-4 space-y-1'
const linkButtonClasses = 'block text-sm text-mid-gray underline hover:text-brand-primary transition-colors'

type FlowState = 'lookup' | 'found' | 'new'

type ResultState =
  | { kind: 'idle' }
  | { kind: 'claimed'; email: string; isNewSignup: boolean }
  | { kind: 'waitlisted'; position: number }
  | { kind: 'duplicate_same' }

export default function ClaimForm({
  roleId,
  showDateId,
  roleName,
  showName,
  isWaitlist,
  showDate = '',
  showTime = null,
}: {
  roleId: string
  showDateId: string
  roleName: string
  showName: string
  isWaitlist: boolean
  showDate?: string
  showTime?: string | null
}) {
  // ADMIN.62 — lookup-first gate state.
  const [flowState, setFlowState] = useState<FlowState>('lookup')
  const [lookupEmail, setLookupEmail] = useState('')
  const [lookupPhone, setLookupPhone] = useState('')
  const [foundName, setFoundName] = useState('')
  const [foundVolunteerId, setFoundVolunteerId] = useState('')
  const [newName, setNewName] = useState('')
  const [isLooking, setIsLooking] = useState(false)
  const [lookupError, setLookupError] = useState('')

  // Terminal/result state — unchanged shape from the pre-ADMIN.62 form.
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicateShowDates, setDuplicateShowDates] = useState<string[] | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ResultState>({ kind: 'idle' })
  const honeypotRef = useRef<HTMLInputElement>(null)

  async function handleLookup() {
    if (!lookupEmail.trim() && !lookupPhone.trim()) return
    setIsLooking(true)
    setLookupError('')
    try {
      const lookupResult = await lookupVolunteerForClaim(lookupEmail.trim(), lookupPhone.trim())
      if (lookupResult.found) {
        setFoundName(lookupResult.volunteerName)
        setFoundVolunteerId(lookupResult.volunteerId)
        setFlowState('found')
      } else {
        setFlowState('new')
      }
    } catch {
      setLookupError('Something went wrong. Please try again.')
    } finally {
      setIsLooking(false)
    }
  }

  // Shared response handling for both submitClaim() call sites
  // (handleFoundClaim and handleConfirmDuplicate) — submitClaim()'s full
  // SubmitClaimResult union (including duplicate_show) applies to both.
  function applyClaimResponse(response: SubmitClaimResult) {
    if (response.status === 'duplicate_show') {
      setDuplicateShowDates(response.existingDates)
      return
    }

    setDuplicateShowDates(null)

    if (response.status === 'claimed') {
      setResult({ kind: 'claimed', email: lookupEmail.trim(), isNewSignup: false })
    } else if (response.status === 'waitlisted') {
      setResult({ kind: 'waitlisted', position: response.position })
    } else if (response.status === 'duplicate_same') {
      setResult({ kind: 'duplicate_same' })
    } else {
      setSubmitError(response.message)
    }
  }

  async function handleFoundClaim() {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const response = await submitClaim({
        roleId,
        showDateId,
        volunteerName: foundName,
        volunteerEmail: lookupEmail.trim(),
        volunteerPhone: lookupPhone.trim(),
        isWaitlist,
        force: false,
        honeypot: honeypotRef.current?.value ?? '',
        knownVolunteerId: foundVolunteerId,
      })
      applyClaimResponse(response)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmDuplicate() {
    setIsConfirming(true)
    try {
      const response = await submitClaim({
        roleId,
        showDateId,
        volunteerName: foundName,
        volunteerEmail: lookupEmail.trim(),
        volunteerPhone: lookupPhone.trim(),
        isWaitlist,
        force: true,
        honeypot: honeypotRef.current?.value ?? '',
        knownVolunteerId: foundVolunteerId,
      })
      applyClaimResponse(response)
    } finally {
      setIsConfirming(false)
    }
  }

  function handleDismissDuplicate() {
    setDuplicateShowDates(null)
  }

  async function handleNewClaim() {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const response = await submitClaimWithLookup({
        roleId,
        showDateId,
        volunteerName: newName.trim(),
        volunteerEmail: lookupEmail.trim(),
        volunteerPhone: lookupPhone.trim(),
        isWaitlist,
        honeypot: honeypotRef.current?.value ?? '',
      })

      if (response.status === 'claimed') {
        setResult({ kind: 'claimed', email: lookupEmail.trim(), isNewSignup: true })
      } else if (response.status === 'waitlisted') {
        setResult({ kind: 'waitlisted', position: response.position })
      } else {
        setSubmitError(response.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result.kind === 'claimed') {
    return (
      <div className="rounded-lg bg-brand-primary-light p-4 text-brand-primary text-sm leading-relaxed">
        You&apos;re all set! A confirmation email is on its way to {result.email}. See you at the show!
        {result.isNewSignup && ' We’ve also sent you an email to complete your volunteer profile.'}
      </div>
    )
  }

  if (result.kind === 'waitlisted') {
    return (
      <div className="rounded-lg bg-brand-accent-light p-4 text-dark text-sm leading-relaxed">
        You&apos;re on the waitlist at position {result.position}. We&apos;ll email you immediately if a spot opens up.
      </div>
    )
  }

  if (result.kind === 'duplicate_same') {
    return (
      <div className="rounded-lg bg-brand-primary-light p-4 text-brand-primary text-sm leading-relaxed">
        Good news — you&apos;re already signed up for this role! Check your email for your original confirmation.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Honeypot — hidden from real users, bots tend to fill every input */}
      <input
        type="text"
        name="website"
        ref={honeypotRef}
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px' }}
      />

      {duplicateShowDates && (
        <div className="rounded-lg bg-brand-accent-light border border-brand-accent p-4 text-sm text-dark space-y-3">
          <p>
            Heads up — you&apos;re already signed up to volunteer for this show on {duplicateShowDates.join(', ')}.
            Did you mean to sign up for another date too?
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              disabled={isConfirming}
              onClick={handleConfirmDuplicate}
              className="bg-brand-accent text-white font-semibold text-sm rounded-lg px-4 py-2.5 hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {isConfirming ? 'Submitting…' : 'Yes, sign me up'}
            </button>
            <button
              type="button"
              disabled={isConfirming}
              onClick={handleDismissDuplicate}
              className="bg-white border border-divider text-dark font-semibold text-sm rounded-lg px-4 py-2.5 hover:bg-footer-gray transition-colors disabled:opacity-50"
            >
              No thanks
            </button>
          </div>
        </div>
      )}

      {flowState === 'lookup' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-brand-primary font-bold text-lg">Claim Your Spot</h2>
            <p className="text-mid-gray text-sm">Enter your email or phone number to get started.</p>
          </div>

          <div>
            <label className={labelClasses}>Email Address</label>
            <input
              type="email"
              className={inputClasses}
              placeholder="your@email.com"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClasses}>Phone Number</label>
            <input
              type="tel"
              className={inputClasses}
              placeholder="(555) 555-5555"
              value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
            />
          </div>

          <p className="text-mid-gray text-sm">Enter at least one to continue.</p>

          {lookupError && <div className={errorBannerClasses}>{lookupError}</div>}

          <button
            type="button"
            disabled={isLooking || (!lookupEmail.trim() && !lookupPhone.trim())}
            onClick={handleLookup}
            className={primaryButtonClasses}
          >
            {isLooking ? 'Searching…' : 'Find My Account'}
          </button>
        </div>
      )}

      {flowState === 'found' && !isConfirming && (
        <div className="space-y-4">
          <div className="rounded-lg bg-brand-primary-light p-4 text-brand-primary text-sm leading-relaxed">
            <p className="font-semibold">Welcome back, {foundName}!</p>
            <p>You&apos;re all set to claim this slot.</p>
          </div>

          <div className={slotSummaryCardClasses}>
            <p className="text-dark font-semibold">{roleName}</p>
            <p className="text-mid-gray text-sm">{showName}</p>
            {showDate && (
              <p className="text-sm text-mid-gray">
                {showDate}
                {showTime ? ` · ${showTime}` : ''}
              </p>
            )}
          </div>

          {submitError && <div className={errorBannerClasses}>{submitError}</div>}

          <button type="button" disabled={isSubmitting} onClick={handleFoundClaim} className={primaryButtonClasses}>
            {isSubmitting ? 'Claiming…' : 'Claim My Spot'}
          </button>

          <button
            type="button"
            onClick={() => {
              setFlowState('lookup')
              setFoundName('')
              setFoundVolunteerId('')
            }}
            className={linkButtonClasses}
          >
            Not you?
          </button>
        </div>
      )}

      {flowState === 'new' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-brand-primary font-bold text-lg">We Don&apos;t Have You in Our System Yet</h2>
            <p className="text-mid-gray text-sm">
              Complete the fields below to join our volunteer roster and claim this slot.
            </p>
          </div>

          <div>
            <label className={labelClasses}>Full Name</label>
            <input
              type="text"
              className={inputClasses}
              placeholder="Your full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClasses}>Email Address</label>
            <input
              type="email"
              className={inputClasses}
              placeholder="your@email.com"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClasses}>Phone Number</label>
            <input
              type="tel"
              className={inputClasses}
              placeholder="(555) 555-5555"
              value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
            />
          </div>

          <p className="text-mid-gray text-sm">
            After claiming, we&apos;ll send you an email to complete your volunteer profile.
          </p>

          {submitError && <div className={errorBannerClasses}>{submitError}</div>}

          <button
            type="button"
            disabled={isSubmitting || !newName.trim() || !lookupEmail.trim() || !lookupPhone.trim()}
            onClick={handleNewClaim}
            className={primaryButtonClasses}
          >
            {isSubmitting ? 'Submitting…' : 'Join & Claim My Spot'}
          </button>

          <button type="button" onClick={() => setFlowState('lookup')} className={linkButtonClasses}>
            Go back
          </button>
        </div>
      )}
    </div>
  )
}
