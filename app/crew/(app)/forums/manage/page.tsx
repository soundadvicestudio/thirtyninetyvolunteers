import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getServerClient } from '@/lib/supabase/server'
import { getForumManageData } from '@/lib/actions/forum-admin'
import ForumManageClient from '@/components/crew/forums/ForumManageClient'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

export default async function ForumManagePage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  if (!['super_admin', 'owner_admin'].includes(admin.role)) {
    redirect('/crew/dashboard')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) {
    redirect('/crew/dashboard')
  }

  const { categories, groups, adminUsers } = await getForumManageData()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/crew/forums"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-brand-primary flex items-center gap-1"
      >
        ← Back to Forums
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text flex items-center gap-1.5">
          Forum Management
          <HelpTooltip anchor="forums" label="Forum Management" />
        </h1>
        <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
          Manage categories, forums, access, moderators, and thread prefixes.
        </p>
      </div>

      <ForumManageClient categories={categories} groups={groups} adminUsers={adminUsers} />
    </div>
  )
}
