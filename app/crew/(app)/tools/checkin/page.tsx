import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getCheckInDashboardData } from '@/lib/data/checkin'
import { getOrgTimezone } from '@/lib/utils/org-timezone'
import { CheckInDashboard } from '@/components/crew/tools/CheckInDashboard'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

export default async function CheckInPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.checkin) redirect('/crew/dashboard')

  const tz = await getOrgTimezone(supabase)
  const data = await getCheckInDashboardData(supabase, tz)

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1 flex items-center gap-1.5">
        Check-In Dashboard
        <HelpTooltip anchor="check-in-dashboard" label="Live Check-In Dashboard" />
      </h1>
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
