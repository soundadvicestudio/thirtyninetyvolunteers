export type ForumUserGroup = {
  id: string
  name: string
  description: string | null
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
  member_count?: number // computed in queries
}

export type ForumGroupMember = {
  id: string
  group_id: string
  admin_user_id: string
  created_at: string
  // joined from admin_users:
  name: string
  email: string
  role: string
}

export type ForumCategory = {
  id: string
  name: string
  sort_order: number
  created_by: string | null
  created_at: string
}

export type Forum = {
  id: string
  category_id: string
  name: string
  description: string | null
  sort_order: number
  is_archived: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ForumAccessGrant = {
  id: string
  forum_id: string
  grant_type: 'role' | 'group' | 'individual'
  role: string | null
  group_id: string | null
  group_name: string | null // joined from forum_user_groups
  admin_user_id: string | null
  admin_user_name: string | null // joined from admin_users
  admin_user_email: string | null
  created_by: string | null
  created_at: string
}

export type ForumModerator = {
  id: string
  forum_id: string
  admin_user_id: string
  name: string // joined from admin_users
  email: string
  role: string
  assigned_by: string | null
  created_at: string
}

export type ForumThreadPrefix = {
  id: string
  forum_id: string
  label: string
  sort_order: number
  created_at: string
}

// Fully enriched forum (for manage page)
export type ForumWithDetails = Forum & {
  grants: ForumAccessGrant[]
  moderators: ForumModerator[]
  prefixes: ForumThreadPrefix[]
}

// Category with nested forums (for manage page)
export type CategoryWithForums = ForumCategory & {
  forums: ForumWithDetails[]
}

// Slim admin user type for pickers (grant/moderator search)
export type ForumAdminUserOption = {
  id: string
  name: string
  email: string
  role: string
}

// For the forum index — enriched forum card data
export type ForumSummary = Forum & {
  unread_count: number
  last_post_at: string | null
  last_post_author: string | null
  thread_count: number
}

// For the forum index — category with enriched forums
export type CategoryWithForumSummary = ForumCategory & {
  forums: ForumSummary[]
}

// For the thread list — per-thread row data
export type ThreadSummary = {
  id: string
  forum_id: string
  prefix_id: string | null
  prefix_label: string | null // joined from forum_thread_prefixes
  title: string
  created_by: string
  created_by_name: string // joined from admin_users
  is_pinned: boolean
  is_locked: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  reply_count: number // count of non-deleted posts
  has_unread: boolean // true if any post lacks a read row
  last_post_at: string | null
  last_post_author: string | null
}

// For the thread list header — forum with category name
export type ForumDetail = Forum & {
  category_name: string
  prefixes: ForumThreadPrefix[]
}
