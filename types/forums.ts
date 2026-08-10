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
