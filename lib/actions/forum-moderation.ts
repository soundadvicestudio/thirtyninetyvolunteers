'use server'

import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import sanitizeHtml from 'sanitize-html'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { logAction } from '@/lib/audit'
import { canAccessForum, isForumModerator } from '@/lib/data/forums'
import { FORUM_POST_SANITIZE_OPTIONS, type AttachmentInfo } from '@/lib/actions/forum-posts'

async function isModeratableBy(
  forumId: string,
  admin: { id: string; role: string },
  supabase: SupabaseClient
): Promise<boolean> {
  if (['super_admin', 'owner_admin'].includes(admin.role)) return true
  return isForumModerator(forumId, admin.id, supabase)
}

export async function createThread(
  forumId: string,
  prefixId: string | null,
  title: string,
  bodyHtml: string,
  tempFilePaths: AttachmentInfo[]
): Promise<{ success: true; threadId: string; postId: string } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return { error: 'Forums are not enabled.' }

  const trimmedTitle = title.trim()
  if (!trimmedTitle) return { error: 'Thread title is required.' }

  const access = await canAccessForum(forumId, admin, supabase)
  if (!access) return { error: 'Access denied.' }

  const { data: forum } = await supabase.from('forums').select('is_archived').eq('id', forumId).maybeSingle()
  if (!forum) return { error: 'Forum not found.' }
  if (forum.is_archived) return { error: 'This forum is archived. New threads cannot be created.' }

  const sanitized = sanitizeHtml(bodyHtml, FORUM_POST_SANITIZE_OPTIONS)
  if (sanitized.trim().length === 0) {
    return { error: 'Post body cannot be empty.' }
  }

  const { data: thread, error: threadError } = await supabase
    .from('forum_threads')
    .insert({ forum_id: forumId, prefix_id: prefixId, title: trimmedTitle, created_by: admin.id })
    .select('id')
    .single()

  if (threadError || !thread) {
    return { error: threadError?.message ?? 'Something went wrong creating the thread.' }
  }

  const threadId = thread.id

  const { data: post, error: postError } = await supabase
    .from('forum_posts')
    .insert({ thread_id: threadId, author_id: admin.id, body_html: sanitized })
    .select('id')
    .single()

  if (postError || !post) {
    return { error: postError?.message ?? 'Something went wrong creating the opening post.' }
  }

  const postId = post.id

  if (tempFilePaths.length > 0) {
    // Storage moves require service role — getServerClient() cannot call
    // storage.* methods. Same dual-client pattern as createForumPost().
    const adminClient = getAdminClient()
    for (const file of tempFilePaths) {
      const filename = file.path.split('/').pop()
      if (!filename) continue
      const finalPath = `forums/${postId}/${filename}`

      const { error: moveError } = await adminClient.storage.from('media').move(file.path, finalPath)
      if (moveError) continue

      const { data: attachment, error: attachmentError } = await supabase
        .from('forum_post_attachments')
        .insert({
          post_id: postId,
          storage_path: finalPath,
          filename: file.originalFilename,
          mime_type: file.mimeType,
          file_size_bytes: file.fileSizeBytes,
          uploaded_by: admin.id,
        })
        .select('id')
        .single()

      if (attachmentError || !attachment) continue

      await logAction(admin.id, 'forum_post_attachment.upload', 'forum_post_attachment', attachment.id, undefined, {
        postId,
        filename: file.originalFilename,
      })
    }
  }

  await logAction(admin.id, 'forum_thread.create', 'forum_thread', threadId, undefined, {
    title: trimmedTitle,
    forumId,
  })

  revalidatePath('/crew/forums')
  revalidatePath(`/crew/forums/${forumId}`)

  return { success: true, threadId, postId }
}

export async function lockThread(threadId: string): Promise<{ success: true } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return { error: 'Forums are not enabled.' }

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('forum_id, is_locked, is_deleted')
    .eq('id', threadId)
    .maybeSingle()

  if (!thread || thread.is_deleted) return { error: 'Thread not found.' }

  const canModerate = await isModeratableBy(thread.forum_id, admin, supabase)
  if (!canModerate) return { error: 'Unauthorized' }

  const { error } = await supabase.from('forum_threads').update({ is_locked: true }).eq('id', threadId)
  if (error) return { error: error.message }

  await logAction(admin.id, 'forum_thread.lock', 'forum_thread', threadId, { is_locked: false }, { is_locked: true })

  revalidatePath(`/crew/forums/${thread.forum_id}/${threadId}`)

  return { success: true }
}

export async function unlockThread(threadId: string): Promise<{ success: true } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return { error: 'Forums are not enabled.' }

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('forum_id, is_locked, is_deleted')
    .eq('id', threadId)
    .maybeSingle()

  if (!thread || thread.is_deleted) return { error: 'Thread not found.' }

  const canModerate = await isModeratableBy(thread.forum_id, admin, supabase)
  if (!canModerate) return { error: 'Unauthorized' }

  const { error } = await supabase.from('forum_threads').update({ is_locked: false }).eq('id', threadId)
  if (error) return { error: error.message }

  await logAction(admin.id, 'forum_thread.unlock', 'forum_thread', threadId, { is_locked: true }, { is_locked: false })

  revalidatePath(`/crew/forums/${thread.forum_id}/${threadId}`)

  return { success: true }
}

export async function pinThread(threadId: string): Promise<{ success: true } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return { error: 'Forums are not enabled.' }

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('forum_id, is_pinned, is_deleted')
    .eq('id', threadId)
    .maybeSingle()

  if (!thread || thread.is_deleted) return { error: 'Thread not found.' }

  const canModerate = await isModeratableBy(thread.forum_id, admin, supabase)
  if (!canModerate) return { error: 'Unauthorized' }

  const { error } = await supabase.from('forum_threads').update({ is_pinned: true }).eq('id', threadId)
  if (error) return { error: error.message }

  await logAction(admin.id, 'forum_thread.pin', 'forum_thread', threadId, { is_pinned: false }, { is_pinned: true })

  revalidatePath(`/crew/forums/${thread.forum_id}`)
  revalidatePath(`/crew/forums/${thread.forum_id}/${threadId}`)

  return { success: true }
}

export async function unpinThread(threadId: string): Promise<{ success: true } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return { error: 'Forums are not enabled.' }

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('forum_id, is_pinned, is_deleted')
    .eq('id', threadId)
    .maybeSingle()

  if (!thread || thread.is_deleted) return { error: 'Thread not found.' }

  const canModerate = await isModeratableBy(thread.forum_id, admin, supabase)
  if (!canModerate) return { error: 'Unauthorized' }

  const { error } = await supabase.from('forum_threads').update({ is_pinned: false }).eq('id', threadId)
  if (error) return { error: error.message }

  await logAction(admin.id, 'forum_thread.unpin', 'forum_thread', threadId, { is_pinned: true }, { is_pinned: false })

  revalidatePath(`/crew/forums/${thread.forum_id}`)
  revalidatePath(`/crew/forums/${thread.forum_id}/${threadId}`)

  return { success: true }
}

export async function moveThread(
  threadId: string,
  newForumId: string
): Promise<{ success: true; newForumId: string } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return { error: 'Forums are not enabled.' }

  if (!['super_admin', 'owner_admin'].includes(admin.role)) {
    return { error: 'Only Super Admins and Owner Admins can move threads.' }
  }

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('forum_id, is_deleted')
    .eq('id', threadId)
    .maybeSingle()

  if (!thread || thread.is_deleted) return { error: 'Thread not found.' }
  if (thread.forum_id === newForumId) return { error: 'Thread is already in this forum.' }

  const { data: targetForum } = await supabase
    .from('forums')
    .select('id, is_archived')
    .eq('id', newForumId)
    .maybeSingle()

  if (!targetForum) return { error: 'Target forum not found.' }
  if (targetForum.is_archived) return { error: 'Cannot move to an archived forum.' }

  const oldForumId = thread.forum_id

  const { error } = await supabase.from('forum_threads').update({ forum_id: newForumId }).eq('id', threadId)
  if (error) return { error: error.message }

  await logAction(
    admin.id,
    'forum_thread.move',
    'forum_thread',
    threadId,
    { forum_id: oldForumId },
    { forum_id: newForumId }
  )

  revalidatePath(`/crew/forums/${oldForumId}`)
  revalidatePath(`/crew/forums/${newForumId}`)
  revalidatePath(`/crew/forums/${newForumId}/${threadId}`)

  return { success: true, newForumId }
}

export async function editPost(postId: string, bodyHtml: string): Promise<{ success: true } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return { error: 'Forums are not enabled.' }

  const { data: post } = await supabase
    .from('forum_posts')
    .select('thread_id, author_id, is_deleted')
    .eq('id', postId)
    .maybeSingle()

  if (!post) return { error: 'Post not found.' }
  if (post.is_deleted) return { error: 'Cannot edit a deleted post.' }

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('forum_id, is_deleted')
    .eq('id', post.thread_id)
    .maybeSingle()

  if (!thread || thread.is_deleted) return { error: 'Thread not found.' }

  const canModerate = await isModeratableBy(thread.forum_id, admin, supabase)
  if (post.author_id !== admin.id && !canModerate) return { error: 'Unauthorized' }

  const sanitized = sanitizeHtml(bodyHtml, FORUM_POST_SANITIZE_OPTIONS)
  if (sanitized.trim().length === 0) {
    return { error: 'Post body cannot be empty.' }
  }

  const editedAt = new Date().toISOString()
  const { error } = await supabase
    .from('forum_posts')
    .update({ body_html: sanitized, edited_at: editedAt })
    .eq('id', postId)
  if (error) return { error: error.message }

  await logAction(
    admin.id,
    'forum_post.edit',
    'forum_post',
    postId,
    { body_html: '[redacted for audit]' },
    { edited_at: editedAt }
  )

  revalidatePath(`/crew/forums/${thread.forum_id}/${post.thread_id}`)

  return { success: true }
}

export async function deletePost(postId: string): Promise<{ success: true } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return { error: 'Forums are not enabled.' }

  const { data: post } = await supabase
    .from('forum_posts')
    .select('thread_id, author_id, is_deleted')
    .eq('id', postId)
    .maybeSingle()

  if (!post) return { error: 'Post not found.' }
  if (post.is_deleted) return { success: true }

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('forum_id, is_deleted')
    .eq('id', post.thread_id)
    .maybeSingle()

  if (!thread || thread.is_deleted) return { error: 'Thread not found.' }

  const canModerate = await isModeratableBy(thread.forum_id, admin, supabase)
  if (post.author_id !== admin.id && !canModerate) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('forum_posts')
    .update({ is_deleted: true, body_html: '[Post deleted]' })
    .eq('id', postId)
  if (error) return { error: error.message }

  await logAction(admin.id, 'forum_post.delete', 'forum_post', postId, { is_deleted: false }, { is_deleted: true })

  revalidatePath(`/crew/forums/${thread.forum_id}/${post.thread_id}`)

  return { success: true }
}
