'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import {
  getNotificationCounts as getNotificationCountsData,
  getUserNotifications as getUserNotificationsData,
} from '@/lib/data/notifications'
import type { NotificationCounts, NotificationRow } from '@/types/notifications'

const EMPTY_COUNTS: NotificationCounts = {
  ephemeral: { pendingRegistrations: 0, pendingCalendarEvents: 0, pendingConsentForms: 0 },
  unreadPersistent: 0,
  forumUnread: 0,
  messageUnread: 0,
}

export async function getNotificationCounts(): Promise<NotificationCounts> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return EMPTY_COUNTS

  const flags = await getFeatureFlags(supabase)
  return getNotificationCountsData(admin, flags, supabase)
}

export async function getUserNotifications(limit?: number): Promise<NotificationRow[]> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return []

  return getUserNotificationsData(admin.id, supabase, limit)
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return

  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('admin_user_id', admin.id)

  revalidatePath('/crew', 'layout')
}

export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return

  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('admin_user_id', admin.id)
    .is('read_at', null)

  revalidatePath('/crew', 'layout')
}
