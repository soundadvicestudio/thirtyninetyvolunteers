import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import ChangePasswordForm from '@/components/crew/settings/ChangePasswordForm'

export default async function ChangePasswordPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Back to Settings
      </Link>

      <div className="max-w-sm mx-auto">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text text-center mb-1">
          Change Password
        </h1>
        <p className="text-mid-gray dark:text-dark-muted text-center text-sm mb-6">
          Choose a new password for your account.
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  )
}
