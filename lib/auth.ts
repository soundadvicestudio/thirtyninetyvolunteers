import 'server-only'
import { getServerClient } from '@/lib/supabase/server'
import type { AdminRole, AdminUser } from '@/types/admin'

export type { AdminRole, AdminUser }

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await getServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, is_active, calendar_editor, last_login, activity_cleared_at')
      .eq('id', user.id)
      .eq('is_active', true)
      .single()

    if (error || !adminUser) return null
    return adminUser as AdminUser
  } catch {
    return null
  }
}
