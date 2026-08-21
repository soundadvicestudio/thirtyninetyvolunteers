import { getServerClient } from '@/lib/supabase/server'
import { getActiveAnnouncements } from '@/lib/data/announcements'
import AnnouncementWidgetClient from '@/components/crew/dashboard/AnnouncementWidgetClient'
import type { AdminUser } from '@/types/admin'

export default async function AnnouncementWidget({ admin }: { admin: AdminUser }) {
  const supabase = await getServerClient()
  const announcements = await getActiveAnnouncements(supabase, admin)

  if (announcements.length === 0) return null

  return <AnnouncementWidgetClient announcements={announcements} />
}
