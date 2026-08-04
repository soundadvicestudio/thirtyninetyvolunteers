import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getRehearsalSchedules } from '@/lib/actions/rehearsals-admin'
import RehearsalsListClient from '@/components/crew/rehearsals/RehearsalsListClient'
import { HelpTooltip } from '@/components/crew/HelpTooltip'
import type { Location } from '@/types/show'

export default async function RehearsalsPage() {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) {
    redirect('/crew/dashboard')
  }
  if (!admin) {
    redirect('/crew/login')
  }

  const [schedulesResult, { data: locationRows }] = await Promise.all([
    getRehearsalSchedules(),
    supabase.from('locations').select('id, name, color').eq('is_active', true).order('sort_order', { ascending: true }),
  ])

  const schedules = schedulesResult.success ? schedulesResult.schedules : []
  const locations = (locationRows ?? []) as Location[]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text flex items-center gap-1.5">
          Rehearsals
          <HelpTooltip anchor="rehearsals" label="Rehearsals" />
        </h1>
        <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
          Rehearsal schedules, assignments, and check-in.
        </p>
      </div>
      <RehearsalsListClient
        schedules={schedules}
        adminRole={admin.role}
        calendarEditor={admin.calendar_editor}
        locations={locations}
      />
    </div>
  )
}
