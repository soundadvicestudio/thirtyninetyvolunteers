import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { signOut } from '@/app/crew/actions'

export default async function DashboardPage() {
  const admin = await getAdminUser()

  if (!admin) {
    redirect('/crew/login?error=not_authorized')
  }

  return (
    <div className="min-h-screen bg-light-navy flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-navy mb-2">
          Production Crew
        </h1>
        <p className="text-mid-gray mb-1">
          Welcome, {admin.name}
        </p>
        <p className="text-sm text-mid-gray mb-6 capitalize">
          {admin.role.replace('_', ' ')}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="bg-navy text-white px-6 py-2 rounded font-semibold hover:bg-opacity-90 transition-colors w-full"
          >
            Sign Out
          </button>
        </form>
        <p className="text-xs text-mid-gray mt-6">
          Full dashboard coming in Phase 3.
        </p>
      </div>
    </div>
  )
}
