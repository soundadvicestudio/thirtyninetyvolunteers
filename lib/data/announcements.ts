import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdminUser } from '@/types/admin'

export interface DashboardAnnouncement {
  body: string
  updatedAt: string
  roles: string[]
}

export async function getActiveAnnouncements(
  supabase: SupabaseClient,
  admin: AdminUser
): Promise<DashboardAnnouncement[]> {
  const { data: rows } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', [
      'dashboard_announcement_body',
      'dashboard_announcement_updated_at',
      'dashboard_announcement_roles',
    ])

  if (!rows || rows.length === 0) return []

  const settingsMap = new Map(
    rows.map((r) => [r.key, r.value])
  )

  const body =
    settingsMap.get('dashboard_announcement_body') ?? ''
  const updatedAt =
    settingsMap.get('dashboard_announcement_updated_at') ?? ''
  const rolesRaw =
    settingsMap.get('dashboard_announcement_roles') ?? '[]'

  // No announcement published yet
  if (!body.trim() || !updatedAt) return []

  // Parse roles
  let roles: string[]
  try {
    roles = JSON.parse(rolesRaw)
    if (!Array.isArray(roles)) return []
  } catch {
    return []
  }

  // No roles targeted — nothing to show
  if (roles.length === 0) return []

  // Check if this user's role is targeted
  if (!roles.includes(admin.role)) return []

  // Check dismissal: if dismissed_at is set and is
  // >= updated_at, the user has already dismissed
  // this announcement
  if (admin.announcement_dismissed_at) {
    const dismissedAt = new Date(
      admin.announcement_dismissed_at
    )
    const announcementAt = new Date(updatedAt)
    if (dismissedAt >= announcementAt) return []
  }

  return [{ body, updatedAt, roles }]
}
