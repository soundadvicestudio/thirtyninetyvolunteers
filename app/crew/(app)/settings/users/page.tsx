import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import CreateUserModal from '@/components/crew/settings/CreateUserModal'
import UsersTable from '@/components/crew/settings/UsersTable'
import PendingRegistrations from '@/components/crew/settings/PendingRegistrations'

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
  const registrationApproved = notice === 'registration_approved'
  const registrationDeclined = notice === 'registration_declined'

  const supabase = await getServerClient()
  const { data: users } = await supabase
    .from('admin_users')
    .select('id, name, email, role, is_active, last_login, created_at')
    .order('created_at', { ascending: true })

  const { data: pendingRegistrations } = await supabase
    .from('pending_registrations')
    .select('id, name, email, requested_at')
    .eq('status', 'pending')
    .order('requested_at', { ascending: true })

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

      {registrationApproved && (
        <div className="bg-light-navy border border-divider rounded-lg p-4 text-sm text-dark mb-6">
          Registration approved. The new account is now active.
        </div>
      )}

      {registrationDeclined && (
        <div className="bg-light-navy border border-divider rounded-lg p-4 text-sm text-dark mb-6">
          Registration declined.
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">User Management</h1>
        <CreateUserModal />
      </div>

      <PendingRegistrations registrations={pendingRegistrations ?? []} />

      <UsersTable users={users ?? []} currentAdminId={admin.id} />
    </div>
  )
}
