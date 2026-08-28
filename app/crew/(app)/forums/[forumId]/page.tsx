import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getThreadList } from '@/lib/actions/forums'
import ThreadListClient from '@/components/crew/forums/ThreadListClient'

export default async function ForumThreadListPage({ params }: { params: Promise<{ forumId: string }> }) {
  const { forumId } = await params

  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) {
    redirect('/crew/dashboard')
  }

  const result = await getThreadList(forumId)
  if (!result) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/crew/forums"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-brand-primary flex items-center gap-1"
      >
        ← Forums
      </Link>

      <div className="pb-4 border-b border-neutral-border dark:border-dark-border mb-6 mt-4">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{result.forum.name}</h1>
        {result.forum.description && (
          <p className="text-mid-gray dark:text-dark-muted mt-1">{result.forum.description}</p>
        )}
      </div>

      <ThreadListClient
        forum={result.forum}
        threads={result.threads}
        isModerator={result.isModerator}
        admin={{ id: admin.id, role: admin.role, name: admin.name }}
      />
    </div>
  )
}
