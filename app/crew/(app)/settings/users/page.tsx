import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import CreateUserModal from '@/components/crew/settings/CreateUserModal'
import UsersTable from '@/components/crew/settings/UsersTable'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role !== 'super_admin') {
    redirect('/crew/dashboard')
  }

  const { notice } = await searchParams
  const emailFailed = notice === 'email_failed'

  const supabase = await getServerClient()
  const { data: users } = await supabase
    .from('admin_users')
    .select('id, name, email, role, is_active, last_login, created_at')
    .order('created_at', { ascending: true })

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Back to Settings
      </Link>

      {emailFailed && (
        <div className="bg-pale-orange border border-orange rounded-lg p-4 text-sm text-dark mb-6">
          Account created successfully, but the welcome email failed to send. Check your Resend
          dashboard.
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">User Management</h1>
        <CreateUserModal />
      </div>

      <UsersTable users={users ?? []} currentAdminId={admin.id} />
    </div>
  )
}
