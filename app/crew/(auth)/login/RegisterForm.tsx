'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerAdminRequest } from '@/lib/actions/admin-registration'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

const ERROR_MESSAGES: Record<string, string> = {
  already_registered: 'An account with this email already exists. Try signing in instead.',
  already_pending: 'A request for this email is already pending review.',
  auth_failed: 'Something went wrong creating your account. Please try again.',
  registration_failed: 'Something went wrong submitting your request. Please try again.',
}

export default function RegisterForm() {
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(data: FormValues) {
    setFormError(null)
    const result = await registerAdminRequest(data.name, data.email, data.password)

    if ('success' in result) {
      setSubmitted(true)
      return
    }

    setFormError(ERROR_MESSAGES[result.error] ?? 'Something went wrong. Please try again.')
  }

  if (submitted) {
    return (
      <div className="bg-light-navy border border-divider text-dark text-sm rounded px-3 py-3">
        Your request has been submitted. A Super Admin will review it shortly. You&apos;ll receive
        an email once a decision is made.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formError && (
        <div className="bg-pale-orange border border-orange text-dark text-sm rounded px-3 py-2">
          {formError}
        </div>
      )}
      <div>
        <label htmlFor="reg-name" className="block text-sm font-semibold text-dark mb-1">
          Full Name
        </label>
        <input
          id="reg-name"
          type="text"
          className="w-full rounded border border-divider px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-navy"
          {...register('name')}
        />
        {errors.name && <p className="text-orange text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-semibold text-dark mb-1">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          className="w-full rounded border border-divider px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-navy"
          {...register('email')}
        />
        {errors.email && <p className="text-orange text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="reg-password" className="block text-sm font-semibold text-dark mb-1">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          className="w-full rounded border border-divider px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-navy"
          {...register('password')}
        />
        {errors.password && <p className="text-orange text-xs mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="reg-confirm-password" className="block text-sm font-semibold text-dark mb-1">
          Confirm Password
        </label>
        <input
          id="reg-confirm-password"
          type="password"
          className="w-full rounded border border-divider px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-navy"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-orange text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-navy text-white font-semibold py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Request Access'}
      </button>
    </form>
  )
}
