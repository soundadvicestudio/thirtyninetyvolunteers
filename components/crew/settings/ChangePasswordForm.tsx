'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { changePassword } from '@/lib/actions/auth'

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function ChangePasswordForm() {
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(data: FormValues) {
    setFormError(null)
    setSuccess(false)
    const result = await changePassword(data.newPassword)

    if ('success' in result) {
      setSuccess(true)
      reset()
      return
    }

    setFormError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {success && (
        <div className="bg-light-navy border border-divider text-dark text-sm rounded px-3 py-2">
          Your password has been updated.
        </div>
      )}
      {formError && (
        <div className="bg-pale-orange border border-orange text-dark text-sm rounded px-3 py-2">
          {formError}
        </div>
      )}
      <div>
        <label
          htmlFor="new-password"
          className="block text-sm font-semibold text-dark dark:text-dark-text mb-1"
        >
          New Password
        </label>
        <input
          id="new-password"
          type="password"
          className="w-full rounded border border-divider dark:border-dark-border px-3 py-2 text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-navy"
          {...register('newPassword')}
        />
        {errors.newPassword && <p className="text-orange text-xs mt-1">{errors.newPassword.message}</p>}
      </div>
      <div>
        <label
          htmlFor="confirm-new-password"
          className="block text-sm font-semibold text-dark dark:text-dark-text mb-1"
        >
          Confirm New Password
        </label>
        <input
          id="confirm-new-password"
          type="password"
          className="w-full rounded border border-divider dark:border-dark-border px-3 py-2 text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-navy"
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
        {isSubmitting ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}
