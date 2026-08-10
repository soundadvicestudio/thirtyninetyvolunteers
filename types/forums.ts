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

// Stub types for future prompts (avoid tsc errors if imported from stubs)
export type ForumCategory = { id: string; name: string }
export type Forum = { id: string; name: string; category_id: string }
