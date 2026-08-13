import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { InboxThreadRow, ThreadDetail, AdminUserBasic } from '@/types/messages'

function stripHtmlForPreview(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

export async function getInboxThreads(
  supabase: SupabaseClient,
  userId: string
): Promise<InboxThreadRow[]> {
  try {
    const { data: threads } = await supabase
      .from('message_threads')
      .select('id, subject, created_at, last_reply_at, creator_id, creator_archived_at, recipient_archived_at')
      .eq('recipient_id', userId)
      .is('recipient_archived_at', null)
      .order('last_reply_at', { ascending: false })

    if (!threads || threads.length === 0) return []

    const creatorIds = [...new Set(threads.map((t) => t.creator_id))]

    const { data: users } = await supabase.from('admin_users').select('id, name').in('id', creatorIds)
    const userMap = new Map((users ?? []).map((u) => [u.id, u.name]))

    const threadIds = threads.map((t) => t.id)

    const { data: reads } = await supabase
      .from('thread_reads')
      .select('thread_id, last_read_at')
      .eq('user_id', userId)
      .in('thread_id', threadIds)
    const readMap = new Map((reads ?? []).map((r) => [r.thread_id, r.last_read_at]))

    const { data: replies } = await supabase
      .from('thread_replies')
      .select('thread_id, body')
      .in('thread_id', threadIds)
      .order('created_at', { ascending: false })

    const snippetMap = new Map<string, string>()
    for (const reply of replies ?? []) {
      if (!snippetMap.has(reply.thread_id)) {
        snippetMap.set(reply.thread_id, reply.body)
      }
    }

    return threads.map((t) => ({
      id: t.id,
      subject: t.subject,
      created_at: t.created_at,
      last_reply_at: t.last_reply_at,
      creator_archived_at: t.creator_archived_at,
      recipient_archived_at: t.recipient_archived_at,
      other_person_id: t.creator_id,
      other_person_name: userMap.get(t.creator_id) ?? 'Unknown',
      is_unread: (() => {
        const lastRead = readMap.get(t.id)
        return !lastRead || t.last_reply_at > lastRead
      })(),
      last_reply_snippet: stripHtmlForPreview(snippetMap.get(t.id) ?? ''),
    }))
  } catch (err) {
    console.error('[getInboxThreads] failed:', err)
    return []
  }
}

export async function getSentThreads(
  supabase: SupabaseClient,
  userId: string
): Promise<InboxThreadRow[]> {
  try {
    const { data: threads } = await supabase
      .from('message_threads')
      .select('id, subject, created_at, last_reply_at, recipient_id, creator_archived_at, recipient_archived_at')
      .eq('creator_id', userId)
      .is('creator_archived_at', null)
      .order('last_reply_at', { ascending: false })

    if (!threads || threads.length === 0) return []

    const recipientIds = [...new Set(threads.map((t) => t.recipient_id))]

    const { data: users } = await supabase.from('admin_users').select('id, name').in('id', recipientIds)
    const recipientMap = new Map((users ?? []).map((u) => [u.id, u.name]))

    const threadIds = threads.map((t) => t.id)

    const { data: reads } = await supabase
      .from('thread_reads')
      .select('thread_id, last_read_at')
      .eq('user_id', userId)
      .in('thread_id', threadIds)
    const readMap = new Map((reads ?? []).map((r) => [r.thread_id, r.last_read_at]))

    const { data: replies } = await supabase
      .from('thread_replies')
      .select('thread_id, body')
      .in('thread_id', threadIds)
      .order('created_at', { ascending: false })

    const snippetMap = new Map<string, string>()
    for (const reply of replies ?? []) {
      if (!snippetMap.has(reply.thread_id)) {
        snippetMap.set(reply.thread_id, reply.body)
      }
    }

    return threads.map((t) => ({
      id: t.id,
      subject: t.subject,
      created_at: t.created_at,
      last_reply_at: t.last_reply_at,
      creator_archived_at: t.creator_archived_at,
      recipient_archived_at: t.recipient_archived_at,
      other_person_id: t.recipient_id,
      other_person_name: recipientMap.get(t.recipient_id) ?? 'Unknown',
      is_unread: (() => {
        const lastRead = readMap.get(t.id)
        return !lastRead || t.last_reply_at > lastRead
      })(),
      last_reply_snippet: stripHtmlForPreview(snippetMap.get(t.id) ?? ''),
    }))
  } catch (err) {
    console.error('[getSentThreads] failed:', err)
    return []
  }
}

export async function getArchivedThreads(
  supabase: SupabaseClient,
  userId: string
): Promise<InboxThreadRow[]> {
  try {
    const { data: threads } = await supabase
      .from('message_threads')
      .select(
        'id, subject, created_at, last_reply_at, creator_id, recipient_id, creator_archived_at, recipient_archived_at'
      )
      .or(`creator_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('last_reply_at', { ascending: false })

    const archived = (threads ?? []).filter((t) => {
      if (t.creator_id === userId) return t.creator_archived_at !== null
      return t.recipient_archived_at !== null
    })

    if (archived.length === 0) return []

    const otherIds = [
      ...new Set(archived.map((t) => (t.creator_id === userId ? t.recipient_id : t.creator_id))),
    ]

    const { data: users } = await supabase.from('admin_users').select('id, name').in('id', otherIds)
    const userMap = new Map((users ?? []).map((u) => [u.id, u.name]))

    return archived.map((t) => {
      const otherPersonId = t.creator_id === userId ? t.recipient_id : t.creator_id
      return {
        id: t.id,
        subject: t.subject,
        created_at: t.created_at,
        last_reply_at: t.last_reply_at,
        creator_archived_at: t.creator_archived_at,
        recipient_archived_at: t.recipient_archived_at,
        other_person_id: otherPersonId,
        other_person_name: userMap.get(otherPersonId) ?? 'Unknown',
        is_unread: false,
        last_reply_snippet: '',
      }
    })
  } catch (err) {
    console.error('[getArchivedThreads] failed:', err)
    return []
  }
}

export async function getThreadData(
  supabase: SupabaseClient,
  threadId: string
): Promise<ThreadDetail | null> {
  try {
    const { data: thread, error: threadError } = await supabase
      .from('message_threads')
      .select('*')
      .eq('id', threadId)
      .single()

    if (threadError || !thread) return null

    const participantIds = [thread.creator_id, thread.recipient_id]
    const { data: participants } = await supabase.from('admin_users').select('id, name').in('id', participantIds)
    const userMap = new Map((participants ?? []).map((u) => [u.id, u.name]))

    const { data: replies } = await supabase
      .from('thread_replies')
      .select('id, thread_id, sender_id, body, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    const senderIds = [...new Set((replies ?? []).map((r) => r.sender_id))]
    const { data: senders } = await supabase.from('admin_users').select('id, name').in('id', senderIds)
    const senderMap = new Map((senders ?? []).map((u) => [u.id, u.name]))

    // NOTE: thread_reads SELECT policy allows BOTH participants to see all
    // read records for their shared thread — this is intentional for read
    // receipts (037_private_messaging.sql, thread_reads_select_participant).
    const { data: threadReads } = await supabase
      .from('thread_reads')
      .select('user_id, last_read_at')
      .eq('thread_id', threadId)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    const currentUserId = user?.id ?? ''

    const myReadRecord = (threadReads ?? []).find((r) => r.user_id === currentUserId)
    const otherReadRecord = (threadReads ?? []).find((r) => r.user_id !== currentUserId)

    const otherPersonId = thread.creator_id === currentUserId ? thread.recipient_id : thread.creator_id
    const otherPersonName = userMap.get(otherPersonId) ?? 'Unknown'

    return {
      thread: {
        ...thread,
        other_person_id: otherPersonId,
        other_person_name: otherPersonName,
      },
      replies: (replies ?? []).map((r) => ({
        ...r,
        sender_name: senderMap.get(r.sender_id) ?? 'Unknown',
      })),
      my_last_read_at: myReadRecord?.last_read_at ?? null,
      other_last_read_at: otherReadRecord?.last_read_at ?? null,
    }
  } catch (err) {
    console.error('[getThreadData] failed:', err)
    return null
  }
}

export async function getUnreadMessageCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    const { data: threads } = await supabase
      .from('message_threads')
      .select('id, creator_id, last_reply_at, creator_archived_at, recipient_archived_at')
      .or(`creator_id.eq.${userId},recipient_id.eq.${userId}`)

    if (!threads || threads.length === 0) return 0

    const active = threads.filter((t) => {
      if (t.creator_id === userId) return t.creator_archived_at === null
      return t.recipient_archived_at === null
    })

    if (active.length === 0) return 0

    const threadIds = active.map((t) => t.id)

    const { data: reads } = await supabase
      .from('thread_reads')
      .select('thread_id, last_read_at')
      .eq('user_id', userId)
      .in('thread_id', threadIds)
    const readMap = new Map((reads ?? []).map((r) => [r.thread_id, r.last_read_at]))

    let count = 0
    for (const thread of active) {
      const lastRead = readMap.get(thread.id)
      if (!lastRead || thread.last_reply_at > lastRead) count++
    }
    return count
  } catch (err) {
    console.error('[getUnreadMessageCount] failed:', err)
    return 0
  }
}

export async function getUsersForDirectory(supabase: SupabaseClient): Promise<AdminUserBasic[]> {
  try {
    const { data } = await supabase
      .from('admin_users')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true })

    return data ?? []
  } catch (err) {
    console.error('[getUsersForDirectory] failed:', err)
    return []
  }
}
