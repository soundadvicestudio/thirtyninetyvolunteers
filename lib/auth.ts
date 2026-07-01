import 'server-only'
import { getServerClient } from '@/lib/supabase/server'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'editor' | 'viewer'
  is_active: boolean
  last_login: string | null
}

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await getServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, is_active, last_login')
      .eq('id', user.id)
      .eq('is_active', true)
      .single()

    if (error || !adminUser) return null
    return adminUser as AdminUser
  } catch {
    return null
  }
}
