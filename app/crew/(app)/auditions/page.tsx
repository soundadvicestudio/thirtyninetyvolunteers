import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getAuditionList } from '@/lib/actions/auditions-admin'
import AuditionsListClient from '@/components/crew/auditions/AuditionsListClient'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

export default async function AuditionsPage() {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  const flags = await getFeatureFlags(supabase)
  if (!flags.auditions) {
    redirect('/crew/dashboard')
  }
  if (!admin) {
    redirect('/crew/login')
  }

  const auditions = await getAuditionList()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text flex items-center gap-1.5">
          Auditions
          <HelpTooltip anchor="auditions" label="Auditions" />
        </h1>
        <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
          Audition signups, scheduling, and casting.
        </p>
      </div>
      <AuditionsListClient auditions={auditions} adminRole={admin.role} />
    </div>
  )
}
