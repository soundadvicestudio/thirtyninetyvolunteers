import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

export default async function ForumsPage() {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) {
    redirect('/crew/dashboard')
  }
  if (!admin) {
    redirect('/crew/login')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text flex items-center gap-1.5">
          Forums
          <HelpTooltip anchor="forums" label="Forums" />
        </h1>
        <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
          Internal discussion forums, organized by category.
        </p>
      </div>
      <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6">
        <p className="text-mid-gray dark:text-dark-muted text-sm">
          This feature is being set up. Check back soon.
        </p>
      </div>
    </div>
  )
}
