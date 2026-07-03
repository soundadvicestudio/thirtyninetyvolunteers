'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { lookupVolunteer } from '@/lib/actions/volunteers'
import { submitClaim, type SubmitClaimResult } from '@/lib/actions/claims'

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().min(1, 'Phone is required'),
})

type FormValues = z.infer<typeof schema>

const inputClasses =
  'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark mb-1'
const errorClasses = 'mt-1 text-sm text-orange'

type ResultState =
  | { kind: 'idle' }
  | { kind: 'claimed'; email: string }
  | { kind: 'waitlisted'; position: number }
  | { kind: 'duplicate_same' }

export default function ClaimForm({
  roleId,
  showDateId,
  roleName,
  showName,
  isWaitlist,
}: {
  roleId: string
  showDateId: string
  roleName: string
  showName: string
  isWaitlist: boolean
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicateShowDates, setDuplicateShowDates] = useState<string[] | null>(null)
  const [force, setForce] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [result, setResult] = useState<ResultState>({ kind: 'idle' })

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: '', email: '', phone: '' },
  })

  // Silent pre-fill: only fills fields the volunteer hasn't already typed
  // into. Never overwrites a value the user entered themselves.
  async function handleLookup(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return

    const match = await lookupVolunteer(trimmed)
    if (!match) return

    if (!getValues('name')) setValue('name', match.full_name)
    if (!getValues('email')) setValue('email', match.email)
    if (!getValues('phone')) setValue('phone', match.phone)
  }

  async function runSubmit(values: FormValues, forceFlag: boolean) {
    setSubmitError(null)

    const response: SubmitClaimResult = await submitClaim({
      roleId,
      showDateId,
      volunteerName: values.name,
      volunteerEmail: values.email,
      volunteerPhone: values.phone,
      isWaitlist,
      force: forceFlag,
    })

    if (response.status === 'duplicate_show') {
      setDuplicateShowDates(response.existingDates)
      return
    }

    setDuplicateShowDates(null)

    if (response.status === 'claimed') {
      setResult({ kind: 'claimed', email: values.email })
    } else if (response.status === 'waitlisted') {
      setResult({ kind: 'waitlisted', position: response.position })
    } else if (response.status === 'duplicate_same') {
      setResult({ kind: 'duplicate_same' })
    } else {
      setSubmitError(response.message)
    }
  }

  async function onSubmit(values: FormValues) {
    await runSubmit(values, force)
  }

  async function handleConfirmDuplicate() {
    setForce(true)
    setIsConfirming(true)
    try {
      await runSubmit(getValues(), true)
    } finally {
      setIsConfirming(false)
    }
  }

  function handleDismissDuplicate() {
    setDuplicateShowDates(null)
  }

  if (result.kind === 'claimed') {
    return (
      <div className="rounded-lg bg-light-navy p-4 text-navy text-sm leading-relaxed">
        You&apos;re all set! A confirmation email is on its way to {result.email}. See you at the show!
      </div>
    )
  }

  if (result.kind === 'waitlisted') {
    return (
      <div className="rounded-lg bg-pale-orange p-4 text-dark text-sm leading-relaxed">
        You&apos;re on the waitlist at position {result.position}. We&apos;ll email you immediately if a spot opens up.
      </div>
    )
  }

  if (result.kind === 'duplicate_same') {
    return (
      <div className="rounded-lg bg-light-navy p-4 text-navy text-sm leading-relaxed">
        Good news — you&apos;re already signed up for this role! Check your email for your original confirmation.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-mid-gray text-sm">
        {roleName} — {showName}
      </p>

      {duplicateShowDates && (
        <div className="rounded-lg bg-pale-orange border border-orange p-4 text-sm text-dark space-y-3">
          <p>
            Heads up — you&apos;re already signed up to volunteer for this show on {duplicateShowDates.join(', ')}.
            Did you mean to sign up for another date too?
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              disabled={isConfirming}
              onClick={handleConfirmDuplicate}
              className="bg-orange text-white font-semibold text-sm rounded-lg px-4 py-2.5 hover:bg-opacity-90 transition-colors disabled:opacity-50"
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

      <div>
        <label className={labelClasses}>
          Full Name<span className="text-orange ml-0.5">*</span>
        </label>
        <input type="text" className={inputClasses} {...register('name')} />
        {errors.name && <p className={errorClasses}>{errors.name.message}</p>}
      </div>

      <div>
        <label className={labelClasses}>
          Email<span className="text-orange ml-0.5">*</span>
        </label>
        <input
          type="email"
          className={inputClasses}
          {...register('email', { onBlur: (e) => handleLookup(e.target.value) })}
        />
        {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
      </div>

      <div>
        <label className={labelClasses}>
          Phone<span className="text-orange ml-0.5">*</span>
        </label>
        <input
          type="tel"
          className={inputClasses}
          {...register('phone', { onBlur: (e) => handleLookup(e.target.value) })}
        />
        {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
      </div>

      {submitError && (
        <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark">{submitError}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isConfirming}
        className="w-full sm:w-auto bg-orange text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting…' : isWaitlist ? 'Join the Waitlist' : 'Claim My Spot'}
      </button>
    </form>
  )
}
