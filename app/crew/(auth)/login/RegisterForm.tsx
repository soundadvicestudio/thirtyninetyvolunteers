'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registerAdminRequest } from '@/lib/actions/admin-registration'
import { signInWithGoogle } from './googleSignIn'

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
      <div className="bg-brand-primary-light border border-divider text-dark text-sm rounded px-3 py-3">
        Your request has been submitted. A Super Admin will review it shortly. You&apos;ll receive
        an email once a decision is made.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formError && (
        <div className="bg-brand-accent-light border border-brand-accent text-dark text-sm rounded px-3 py-2">
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
          className="w-full rounded border border-divider px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
          {...register('name')}
        />
        {errors.name && <p className="text-brand-accent text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-semibold text-dark mb-1">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          className="w-full rounded border border-divider px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
          {...register('email')}
        />
        {errors.email && <p className="text-brand-accent text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="reg-password" className="block text-sm font-semibold text-dark mb-1">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          className="w-full rounded border border-divider px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
          {...register('password')}
        />
        {errors.password && <p className="text-brand-accent text-xs mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="reg-confirm-password" className="block text-sm font-semibold text-dark mb-1">
          Confirm Password
        </label>
        <input
          id="reg-confirm-password"
          type="password"
          className="w-full rounded border border-divider px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-brand-accent text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand-primary text-white font-semibold py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Request Access'}
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-divider" />
        <span className="text-sm text-mid-gray">or</span>
        <div className="flex-1 h-px bg-divider" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-2 bg-white border border-divider text-dark font-semibold py-2 rounded hover:bg-brand-primary-light transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.8 2.73v2.27h2.92c1.71-1.57 2.68-3.88 2.68-6.64z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.97H.96C.35 6.2 0 7.56 0 9s.35 2.8.96 4.03l3.01-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.97l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
          />
        </svg>
        Continue with Google
      </button>
    </form>
  )
}
