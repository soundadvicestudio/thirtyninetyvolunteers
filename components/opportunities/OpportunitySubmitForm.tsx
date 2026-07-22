'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitOpportunity } from '@/lib/actions/submissions'

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const inputClasses =
  'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark mb-1'
const errorClasses = 'mt-1 text-sm text-orange'

const SUBMIT_LABEL: Record<'eoi' | 'slot_claim', string> = {
  eoi: 'Express Interest',
  slot_claim: 'Claim This Position',
}

export default function OpportunitySubmitForm({
  opportunityId,
  claimType,
}: {
  opportunityId: string
  claimType: 'eoi' | 'slot_claim'
}) {
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: '', email: '', phone: '' },
  })

  async function onSubmit(data: FormValues) {
    setFormError(null)
    const result = await submitOpportunity({
      opportunityId,
      volunteerName: data.name,
      volunteerEmail: data.email,
      volunteerPhone: data.phone || undefined,
      honeypot: honeypotRef.current?.value,
    })

    if ('error' in result) {
      setFormError(result.error)
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-light-navy border border-divider p-8 text-center max-w-xl">
        <div className="w-12 h-12 rounded-full bg-orange mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-xl font-bold">✓</span>
        </div>
        <h2 className="text-navy font-bold text-xl mb-2">
          {claimType === 'eoi' ? 'Thanks for your interest!' : "You're signed up!"}
        </h2>
        <p className="text-mid-gray text-sm leading-relaxed mb-4">
          {claimType === 'eoi'
            ? 'A member of our team will be in touch soon.'
            : 'Check your email for confirmation.'}
        </p>
        <Link href="/shows" className="text-navy font-semibold underline">
          Browse upcoming shows →
        </Link>
      </div>
    )
  }

  return (
    // honeypotRef.current is only read inside onSubmit, which handleSubmit()
    // only invokes on an actual submit event — not during this render call.
    // eslint-disable-next-line react-hooks/refs
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
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
        <input type="email" className={inputClasses} {...register('email')} />
        {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
      </div>

      <div>
        <label className={labelClasses}>Phone</label>
        <input type="tel" className={inputClasses} {...register('phone')} />
      </div>

      {formError && (
        <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark">{formError}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto bg-orange text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting…' : SUBMIT_LABEL[claimType]}
      </button>
    </form>
  )
}
