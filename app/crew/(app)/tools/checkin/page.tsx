import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getCheckInDashboardData } from '@/lib/data/checkin'
import { CheckInDashboard } from '@/components/crew/tools/CheckInDashboard'

export default async function CheckInPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const data = await getCheckInDashboardData(supabase)

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Check-In Dashboard</h1>
      <p className="text-sm text-mid-gray dark:text-dark-muted mb-6">
        Live roster and check-in status for the next upcoming show. Refreshes automatically every 10 seconds.
      </p>
      <CheckInDashboard
        initialData={data}
        topShowId={data.noUpcomingShows ? null : data.topShow.showId}
      />
    </div>
  )
}
