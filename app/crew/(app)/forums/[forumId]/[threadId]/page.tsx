import { redirect, notFound } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getThreadWithPosts } from '@/lib/actions/forum-posts'
import ThreadViewClient from '@/components/crew/forums/ThreadViewClient'

export default async function ThreadViewPage({
  params,
}: {
  params: Promise<{ forumId: string; threadId: string }>
}) {
  const { forumId, threadId } = await params

  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) {
    redirect('/crew/dashboard')
  }

  const data = await getThreadWithPosts(threadId)
  if (!data) notFound()
  if (data.thread.forum_id !== forumId) notFound()

  return <ThreadViewClient data={data} messagesEnabled={flags.messages} />
}
