import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import ActivityFeed from '@/components/crew/dashboard/ActivityFeed'
import type { ActivityEvent } from '@/lib/actions/dashboard'

export default async function DashboardPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const { data: events } = await supabase.rpc('get_activity_feed', { p_limit: 10, p_offset: 0 })

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-2">Welcome to Production Crew</h1>
      <p className="text-mid-gray dark:text-dark-muted mb-8">Dashboard coming in a future phase.</p>

      <ActivityFeed
        initialEvents={(events ?? []) as ActivityEvent[]}
        activityClearedAt={admin.activity_cleared_at}
      />
    </div>
  )
}
