'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createNotification } from '@/lib/utils/notifications'
import { sendDirectMessageEmail } from '@/lib/email'
import type { AdminUserBasic } from '@/types/messages'

export async function createThread(
  recipientId: string,
  subject: string,
  body: string
): Promise<{ threadId: string } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { data: recipient, error: recipientError } = await supabase
    .from('admin_users')
    .select('id, name, email')
    .eq('id', recipientId)
    .eq('is_active', true)
    .single()
  if (recipientError || !recipient) return { error: 'Recipient not found' }

  const { data: thread, error: threadError } = await supabase
    .from('message_threads')
    .insert({ creator_id: admin.id, recipient_id: recipientId, subject })
    .select('id')
    .single()
  if (threadError || !thread) return { error: threadError?.message ?? 'Failed to create thread' }

  const { data: reply, error: replyError } = await supabase
    .from('thread_replies')
    .insert({ thread_id: thread.id, sender_id: admin.id, body })
    .select('id')
    .single()
  if (replyError || !reply) return { error: replyError?.message ?? 'Failed to create message' }

  // Mark thread as read for the creator — prevents the creator's own thread
  // from appearing in their unread count. Upserted AFTER the reply insert so
  // last_read_at >= last_reply_at is guaranteed.
  await supabase
    .from('thread_reads')
    .upsert(
      { thread_id: thread.id, user_id: admin.id, last_read_at: new Date().toISOString() },
      { onConflict: 'thread_id,user_id' }
    )

  // Non-blocking notification + email — errors must never block thread creation.
  void (async () => {
    try {
      const adminSupabase = getAdminClient()
      await createNotification(
        recipientId,
        'direct_message',
        `New message from ${admin.name}`,
        `/crew/messages/${thread.id}`,
        subject,
        adminSupabase
      )
      await sendDirectMessageEmail({
        to: recipient.email,
        senderName: admin.name,
        subject,
        threadId: thread.id,
        senderId: admin.id,
        isReply: false,
      })
    } catch {
      // Swallow — notification/email failure must never block thread creation.
    }
  })()

  revalidatePath('/crew', 'layout')
  return { threadId: thread.id }
}

export async function createReply(
  threadId: string,
  body: string
): Promise<{ replyId: string } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { data: thread, error: threadError } = await supabase
    .from('message_threads')
    .select('creator_id, recipient_id, subject')
    .eq('id', threadId)
    .single()
  if (threadError || !thread) return { error: 'Thread not found' }

  const otherParticipantId = thread.creator_id === admin.id ? thread.recipient_id : thread.creator_id

  const { data: otherUser } = await supabase
    .from('admin_users')
    .select('id, name, email')
    .eq('id', otherParticipantId)
    .single()

  const { data: reply, error: replyError } = await supabase
    .from('thread_replies')
    .insert({ thread_id: threadId, sender_id: admin.id, body })
    .select('id')
    .single()
  if (replyError || !reply) return { error: replyError?.message ?? 'Failed to send reply' }

  // Update thread: bump last_reply_at, and clear the OTHER participant's
  // archived_at — resurfaces the thread in their inbox if they had archived it.
  const otherArchiveField = thread.creator_id === admin.id ? 'recipient_archived_at' : 'creator_archived_at'
  await supabase
    .from('message_threads')
    .update({
      last_reply_at: new Date().toISOString(),
      [otherArchiveField]: null,
    })
    .eq('id', threadId)

  // Mark thread as read for the sender — prevents the sender's own reply
  // from appearing in their unread count. Upserted AFTER the reply insert.
  await supabase
    .from('thread_reads')
    .upsert(
      { thread_id: threadId, user_id: admin.id, last_read_at: new Date().toISOString() },
      { onConflict: 'thread_id,user_id' }
    )

  // Non-blocking notification + email — errors must never block reply creation.
  void (async () => {
    try {
      if (!otherUser) return
      const adminSupabase = getAdminClient()
      await createNotification(
        otherParticipantId,
        'direct_message',
        `Re: ${thread.subject} — reply from ${admin.name}`,
        `/crew/messages/${threadId}`,
        null,
        adminSupabase
      )
      await sendDirectMessageEmail({
        to: otherUser.email,
        senderName: admin.name,
        subject: thread.subject,
        threadId,
        senderId: admin.id,
        isReply: true,
      })
    } catch {
      // Swallow — notification/email failure must never block reply creation.
    }
  })()

  revalidatePath(`/crew/messages/${threadId}`)
  revalidatePath('/crew', 'layout')
  return { replyId: reply.id }
}

export async function markThreadRead(threadId: string): Promise<void> {
  const admin = await getAdminUser()
  if (!admin) return

  const supabase = await getServerClient()

  await supabase
    .from('thread_reads')
    .upsert(
      { thread_id: threadId, user_id: admin.id, last_read_at: new Date().toISOString() },
      { onConflict: 'thread_id,user_id' }
    )

  revalidatePath('/crew', 'layout')
}

export async function archiveThread(threadId: string): Promise<{ error?: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { data: thread, error } = await supabase
    .from('message_threads')
    .select('creator_id, recipient_id')
    .eq('id', threadId)
    .single()
  if (error || !thread) return { error: 'Thread not found' }

  const archiveField = thread.creator_id === admin.id ? 'creator_archived_at' : 'recipient_archived_at'
  const { error: updateError } = await supabase
    .from('message_threads')
    .update({ [archiveField]: new Date().toISOString() })
    .eq('id', threadId)
  if (updateError) return { error: updateError.message }

  revalidatePath('/crew/messages')
  revalidatePath('/crew', 'layout')
  return {}
}

export async function searchUsers(query: string): Promise<AdminUserBasic[]> {
  const admin = await getAdminUser()
  if (!admin) return []

  if (!query.trim()) return []

  const supabase = await getServerClient()

  const { data } = await supabase
    .from('admin_users')
    .select('id, name')
    .ilike('name', `%${query.trim()}%`)
    .neq('id', admin.id)
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(8)

  return data ?? []
}
