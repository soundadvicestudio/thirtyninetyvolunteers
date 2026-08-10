import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getForumIndex } from '@/lib/actions/forums'
import ForumIndexClient from '@/components/crew/forums/ForumIndexClient'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

export default async function ForumsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) {
    redirect('/crew/dashboard')
  }

  const categories = await getForumIndex()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-dark-text flex items-center gap-1.5">
            Forums
            <HelpTooltip anchor="forums" label="Forums" />
          </h1>
          <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
            Internal discussion forums, organized by category.
          </p>
        </div>
        {(admin.role === 'super_admin' || admin.role === 'owner_admin') && (
          <Link
            href="/crew/forums/manage"
            className="text-sm text-brand-primary dark:text-brand-primary-mid hover:underline"
          >
            Manage Forums
          </Link>
        )}
      </div>

      <ForumIndexClient categories={categories} admin={{ id: admin.id, role: admin.role, name: admin.name }} />
    </div>
  )
}
