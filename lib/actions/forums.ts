'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getForumIndexData, getThreadListData, canAccessForum } from '@/lib/data/forums'
import type { CategoryWithForumSummary, ForumDetail, ThreadSummary } from '@/types/forums'

export async function getForumIndex(): Promise<CategoryWithForumSummary[]> {
  const admin = await getAdminUser()
  if (!admin) return []

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return []

  return getForumIndexData(admin, supabase)
}

export async function getThreadList(forumId: string): Promise<{
  forum: ForumDetail
  threads: ThreadSummary[]
  isModerator: boolean
} | null> {
  const admin = await getAdminUser()
  if (!admin) return null

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return null

  return getThreadListData(forumId, admin, supabase)
}

export async function markThreadRead(threadId: string): Promise<{ success: boolean }> {
  const admin = await getAdminUser()
  if (!admin) return { success: false }

  const supabase = await getServerClient()

  const { data: thread } = await supabase.from('forum_threads').select('forum_id').eq('id', threadId).maybeSingle()
  if (!thread) return { success: false }

  const { data: posts } = await supabase
    .from('forum_posts')
    .select('id')
    .eq('thread_id', threadId)
    .eq('is_deleted', false)

  if (!posts || posts.length === 0) return { success: true }

  await supabase.from('forum_post_reads').upsert(
    posts.map((p) => ({ post_id: p.id, admin_user_id: admin.id, read_at: new Date().toISOString() })),
    { onConflict: 'post_id,admin_user_id', ignoreDuplicates: true }
  )

  revalidatePath('/crew/forums')
  revalidatePath(`/crew/forums/${thread.forum_id}`)

  return { success: true }
}

export async function markAllForumRead(forumId: string): Promise<{ success: boolean }> {
  const admin = await getAdminUser()
  if (!admin) return { success: false }

  const supabase = await getServerClient()

  const access = await canAccessForum(forumId, admin, supabase)
  if (!access) return { success: false }

  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id')
    .eq('forum_id', forumId)
    .eq('is_deleted', false)

  if (!threads || threads.length === 0) return { success: true }

  const threadIds = threads.map((t) => t.id)
  const { data: posts } = await supabase
    .from('forum_posts')
    .select('id')
    .in('thread_id', threadIds)
    .eq('is_deleted', false)

  if (!posts || posts.length === 0) return { success: true }

  await supabase.from('forum_post_reads').upsert(
    posts.map((p) => ({ post_id: p.id, admin_user_id: admin.id, read_at: new Date().toISOString() })),
    { onConflict: 'post_id,admin_user_id', ignoreDuplicates: true }
  )

  revalidatePath('/crew/forums')
  revalidatePath(`/crew/forums/${forumId}`)

  return { success: true }
}
