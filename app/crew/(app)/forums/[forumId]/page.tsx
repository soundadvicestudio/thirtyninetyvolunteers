import { redirect, notFound } from 'next/navigation'
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
    <ThreadListClient
      forum={result.forum}
      threads={result.threads}
      isModerator={result.isModerator}
      admin={{ id: admin.id, role: admin.role, name: admin.name }}
    />
  )
}
