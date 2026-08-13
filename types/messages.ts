// Base DB row types

export type MessageThread = {
  id: string
  creator_id: string
  recipient_id: string
  subject: string
  created_at: string
  last_reply_at: string
  creator_archived_at: string | null
  recipient_archived_at: string | null
}

export type ThreadReply = {
  id: string
  thread_id: string
  sender_id: string
  body: string
  created_at: string
}

export type ThreadReplyAttachment = {
  id: string
  reply_id: string
  file_path: string
  file_name: string
  file_size: number
  content_type: string
  created_at: string
}

export type ThreadRead = {
  thread_id: string
  user_id: string
  last_read_at: string
}

// Enriched types for UI consumption

// Used in inbox/sent/archived thread list
export type InboxThreadRow = {
  id: string
  subject: string
  created_at: string
  last_reply_at: string
  creator_archived_at: string | null
  recipient_archived_at: string | null
  other_person_id: string
  other_person_name: string
  is_unread: boolean
  last_reply_snippet: string
}

// Reply with joined sender name, used in thread view
export type ThreadReplyWithDetails = {
  id: string
  thread_id: string
  sender_id: string
  sender_name: string
  body: string
  created_at: string
}

// Full thread detail for thread view page
export type ThreadDetail = {
  thread: MessageThread & {
    other_person_id: string
    other_person_name: string
  }
  replies: ThreadReplyWithDetails[]
  my_last_read_at: string | null
  other_last_read_at: string | null
}

// Lightweight user record for compose recipient search and directory
export type AdminUserBasic = {
  id: string
  name: string
}
