'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { lookupVolunteer } from '@/lib/actions/volunteers'
import { submitClaim } from '@/lib/actions/claims'

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

  async function onSubmit(data: FormValues) {
    setSubmitError(null)

    const result = await submitClaim({
      roleId,
      showDateId,
      volunteerName: data.name,
      volunteerEmail: data.email,
      volunteerPhone: data.phone,
      isWaitlist,
    })

    if (!result.success) {
      setSubmitError(result.error ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-mid-gray text-sm">
        {roleName} — {showName}
      </p>

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
        disabled={isSubmitting}
        className="w-full sm:w-auto bg-orange text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting…' : isWaitlist ? 'Join the Waitlist' : 'Claim My Spot'}
      </button>
    </form>
  )
}
