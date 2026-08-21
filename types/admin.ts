export type AdminRole = 'super_admin' | 'owner_admin' | 'editor' | 'viewer' | 'production'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
  is_active: boolean
  calendar_editor: boolean
  inventory_manager: boolean
  calendar_subscription_token: string
  last_login: string | null
  activity_cleared_at: string | null
  announcement_dismissed_at: string | null
}
