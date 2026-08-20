'use server'

import { revalidatePath } from 'next/cache'
import sanitizeHtml from 'sanitize-html'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { logAction } from '@/lib/audit'
import { sendForumNotificationEmail } from '@/lib/email'
import { canAccessForum, isForumModerator } from '@/lib/data/forums'
import { createNotification } from '@/lib/utils/notifications'
import type { ForumPostAttachment, ForumPostWithDetails, ThreadViewData } from '@/types/forums'
import { FORUM_POST_SANITIZE_OPTIONS } from './forum-post-sanitize'

export type AttachmentInfo = {
  path: string
  originalFilename: string
  mimeType: string
  fileSizeBytes: number
}

export async function getThreadWithPosts(threadId: string): Promise<ThreadViewData | null> {
  const admin = await getAdminUser()
  if (!admin) return null

  const supabase = await getServerClient()
  const adminClient = getAdminClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return null

  const { data: threadRaw } = await supabase
    .from('forum_threads')
    .select(
      '*, forum_thread_prefixes!forum_threads_prefix_id_fkey(label), admin_users!forum_threads_created_by_fkey(name)'
    )
    .eq('id', threadId)
    .maybeSingle()

  if (!threadRaw || threadRaw.is_deleted) return null

  const prefix = Array.isArray(threadRaw.forum_thread_prefixes)
    ? threadRaw.forum_thread_prefixes[0]
    : threadRaw.forum_thread_prefixes
  const creator = Array.isArray(threadRaw.admin_users) ? threadRaw.admin_users[0] : threadRaw.admin_users

  const { data: forumRaw } = await supabase
    .from('forums')
    .select('*, forum_categories!forums_category_id_fkey(name)')
    .eq('id', threadRaw.forum_id)
    .maybeSingle()

  if (!forumRaw) return null

  const category = Array.isArray(forumRaw.forum_categories) ? forumRaw.forum_categories[0] : forumRaw.forum_categories

  const access = await canAccessForum(threadRaw.forum_id, admin, supabase)
  if (!access) return null

  const [{ data: postsRaw }, { data: subscription }, isModerator] = await Promise.all([
    supabase
      .from('forum_posts')
      .select('*, admin_users!forum_posts_author_id_fkey(name)')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true }),
    supabase
      .from('forum_thread_subscriptions')
      .select('id')
      .eq('thread_id', threadId)
      .eq('admin_user_id', admin.id)
      .maybeSingle(),
    isForumModerator(threadRaw.forum_id, admin.id, supabase),
  ])

  const rawPosts = postsRaw ?? []
  const postIds = rawPosts.map((p) => p.id)

  let attachmentsRaw: Array<{
    id: string
    post_id: string
    storage_path: string
    filename: string
    mime_type: string | null
    file_size_bytes: number | null
    uploaded_by: string | null
    created_at: string
  }> = []
  if (postIds.length > 0) {
    const { data } = await supabase.from('forum_post_attachments').select('*').in('post_id', postIds)
    attachmentsRaw = data ?? []
  }

  // adminClient created once, reused for every signed-URL call below —
  // never construct a Supabase client inside a loop.
  const attachmentsWithUrls: ForumPostAttachment[] = await Promise.all(
    attachmentsRaw.map(async (a) => {
      try {
        const { data: signed, error } = await adminClient.storage.from('media').createSignedUrl(a.storage_path, 3600)
        return { ...a, signed_url: error ? null : (signed?.signedUrl ?? null) }
      } catch (err) {
        console.error('Failed to generate signed URL for forum attachment:', a.id, err)
        return { ...a, signed_url: null }
      }
    })
  )

  const attachmentsByPost = new Map<string, ForumPostAttachment[]>()
  for (const a of attachmentsWithUrls) {
    const list = attachmentsByPost.get(a.post_id) ?? []
    list.push(a)
    attachmentsByPost.set(a.post_id, list)
  }

  const posts: ForumPostWithDetails[] = rawPosts.map((p) => {
    const author = Array.isArray(p.admin_users) ? p.admin_users[0] : p.admin_users
    return {
      id: p.id,
      thread_id: p.thread_id,
      author_id: p.author_id,
      author_name: author?.name ?? '',
      body_html: p.body_html,
      is_deleted: p.is_deleted,
      edited_at: p.edited_at,
      created_at: p.created_at,
      updated_at: p.updated_at,
      attachments: attachmentsByPost.get(p.id) ?? [],
    }
  })

  return {
    thread: {
      id: threadRaw.id,
      forum_id: threadRaw.forum_id,
      prefix_id: threadRaw.prefix_id,
      prefix_label: prefix?.label ?? null,
      title: threadRaw.title,
      created_by: threadRaw.created_by,
      created_by_name: creator?.name ?? '',
      is_pinned: threadRaw.is_pinned,
      is_locked: threadRaw.is_locked,
      is_deleted: threadRaw.is_deleted,
      created_at: threadRaw.created_at,
      updated_at: threadRaw.updated_at,
    },
    forum: {
      id: forumRaw.id,
      name: forumRaw.name,
      category_name: category?.name ?? '',
    },
    posts,
    isSubscribed: subscription !== null,
    isModerator,
    adminId: admin.id,
    adminRole: admin.role,
  }
}

export async function getPostAttachmentUploadUrl(
  tempKey: string,
  filename: string,
  mimeType: string
): Promise<{ signedUrl: string; path: string } | null> {
  const admin = await getAdminUser()
  if (!admin) return null

  if (!mimeType.trim()) return null

  const adminClient = getAdminClient()

  const ext = filename.split('.').pop() || 'bin'
  const storageName = `${crypto.randomUUID()}.${ext}`
  const path = `forums/temp/${tempKey}/${storageName}`

  const { data, error } = await adminClient.storage.from('media').createSignedUploadUrl(path)
  if (error || !data) return null

  return { signedUrl: data.signedUrl, path }
}

export async function createForumPost(
  threadId: string,
  bodyHtml: string,
  tempFilePaths: AttachmentInfo[]
): Promise<{ success: true; postId: string } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()
  const adminClient = getAdminClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return { error: 'Forums are not enabled.' }

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('id, forum_id, title, is_locked, is_deleted')
    .eq('id', threadId)
    .maybeSingle()

  if (!thread || thread.is_deleted) return { error: 'Thread not found.' }
  if (thread.is_locked) return { error: 'This thread is locked.' }

  const access = await canAccessForum(thread.forum_id, admin, supabase)
  if (!access) return { error: 'Access denied.' }

  const sanitized = sanitizeHtml(bodyHtml, FORUM_POST_SANITIZE_OPTIONS)
  if (sanitized.trim().length === 0) {
    return { error: 'Post body cannot be empty.' }
  }

  const { data: post, error: insertError } = await supabase
    .from('forum_posts')
    .insert({ thread_id: threadId, author_id: admin.id, body_html: sanitized })
    .select('id')
    .single()

  if (insertError || !post) {
    return { error: insertError?.message ?? 'Something went wrong creating the post.' }
  }

  const postId = post.id

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

  await supabase.from('forum_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId)

  await logAction(admin.id, 'forum_post.create', 'forum_post', postId, undefined, {
    threadId,
    forum_id: thread.forum_id,
  })

  revalidatePath(`/crew/forums/${thread.forum_id}`)
  revalidatePath(`/crew/forums/${thread.forum_id}/${threadId}`)

  // Non-blocking subscription notifications — errors must never block post creation
  void (async () => {
    try {
      const { notifiedUserIds } = await sendForumNotificationEmail(threadId, postId)
      for (const userId of notifiedUserIds) {
        await createNotification(
          userId,
          'forum_reply',
          `New reply in: ${thread.title}`,
          `/crew/forums/${thread.forum_id}/${threadId}`,
          null,
          supabase
        )
      }
    } catch {
      // Swallow — notification failure never blocks post creation
    }
  })()

  return { success: true, postId }
}

export async function toggleThreadSubscription(
  threadId: string
): Promise<{ subscribed: boolean } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.forums) return { error: 'Forums are not enabled.' }

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('forum_id, is_deleted')
    .eq('id', threadId)
    .maybeSingle()

  if (!thread || thread.is_deleted) return { error: 'Thread not found.' }

  const access = await canAccessForum(thread.forum_id, admin, supabase)
  if (!access) return { error: 'Access denied.' }

  const { data: existing } = await supabase
    .from('forum_thread_subscriptions')
    .select('id')
    .eq('thread_id', threadId)
    .eq('admin_user_id', admin.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('forum_thread_subscriptions').delete().eq('id', existing.id)
    return { subscribed: false }
  }

  await supabase.from('forum_thread_subscriptions').insert({ thread_id: threadId, admin_user_id: admin.id })
  return { subscribed: true }
}
