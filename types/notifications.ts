export type NotificationType =
  | 'audition_signup'
  | 'audition_material'
  | 'calendar_approved'
  | 'calendar_changed'
  | 'calendar_cancelled'
  | 'forum_reply'

export interface NotificationRow {
  id: string
  admin_user_id: string
  type: NotificationType
  title: string
  body: string | null
  href: string
  read_at: string | null
  created_at: string
}

export interface EphemeralCounts {
  pendingRegistrations: number
  pendingCalendarEvents: number
  pendingConsentForms: number
}

export interface NotificationCounts {
  ephemeral: EphemeralCounts
  unreadPersistent: number
  forumUnread: number
}
