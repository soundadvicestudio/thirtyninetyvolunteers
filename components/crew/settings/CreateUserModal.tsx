'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createUser } from '@/lib/actions/users'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  role: z.enum(['editor', 'viewer']),
  sendWelcome: z.boolean(),
})

type FormValues = z.infer<typeof schema>

function reloadWithNotice(notice?: string) {
  window.location.href = notice
    ? `${window.location.pathname}?notice=${notice}`
    : window.location.pathname
}

export default function CreateUserModal() {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: '',
      email: '',
      role: 'editor',
      sendWelcome: true,
    },
  })

  async function onSubmit(data: FormValues) {
    setFormError(null)
    const result = await createUser(data.name, data.email, data.role, data.sendWelcome)

    if ('success' in result) {
      setOpen(false)
      reset()
      reloadWithNotice(result.emailFailed ? 'email_failed' : undefined)
      return
    }

    if (result.error === 'email_exists') {
      setError('email', { message: 'An account with this email already exists.' })
      return
    }

    setFormError(result.error)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
        >
          ＋ Add User
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Production Crew Member</DialogTitle>
          <DialogDescription>
            A welcome email with login credentials will be sent to the new user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Full Name<span className="text-orange ml-0.5">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-sm text-orange">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">
              Email Address<span className="text-orange ml-0.5">*</span>
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-sm text-orange">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark dark:text-dark-text mb-1">Role</label>
            <select
              className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
              {...register('role')}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-divider dark:border-dark-border text-navy focus:ring-navy"
              {...register('sendWelcome')}
            />
            <span className="text-sm text-dark dark:text-dark-text">Send welcome email</span>
          </label>

          {formError && (
            <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full border border-divider text-dark hover:bg-light-navy transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-surface/50"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
