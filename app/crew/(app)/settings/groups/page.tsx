import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getServerClient } from '@/lib/supabase/server'
import { getForumGroups } from '@/lib/actions/forum-groups'
import ForumGroupsClient from '@/components/crew/settings/ForumGroupsClient'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

export default async function ForumGroupsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) {
    redirect('/crew/dashboard')
  }

  if (!['super_admin', 'owner_admin'].includes(admin.role)) {
    redirect('/crew/settings')
  }

  const groups = await getForumGroups()

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-brand-primary flex items-center gap-1 mb-6"
      >
        ← Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">
        User Groups <HelpTooltip anchor="forums" label="User Groups" />
      </h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Named groups of admin users. Groups feed into forum access grants — use them to give a
        whole team access to a forum at once.
      </p>

      <ForumGroupsClient groups={groups} />
    </div>
  )
}
