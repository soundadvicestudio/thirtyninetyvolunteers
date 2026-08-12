import { SupabaseClient } from '@supabase/supabase-js'
import { NotificationType } from '@/types/notifications'

export async function createNotification(
  adminUserId: string,
  type: NotificationType,
  title: string,
  href: string,
  body: string | null,
  supabase: SupabaseClient
): Promise<void> {
  try {
    await supabase.from('notifications').insert({
      admin_user_id: adminUserId,
      type,
      title,
      href,
      body,
    })
  } catch (err) {
    console.error('[createNotification] failed:', err)
    // Never throw — notification failure must never
    // block the calling action
  }
}
