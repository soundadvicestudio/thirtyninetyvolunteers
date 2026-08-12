import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdminUser } from '@/lib/auth'
import type { FeatureFlags } from '@/lib/feature-flags'
import type { NotificationCounts, NotificationRow } from '@/types/notifications'

// Mirrors the three-way OR access-control pattern in lib/data/forums.ts
// (role grant / group grant + membership join / individual grant) —
// getAccessibleForumIds is not exported from that module, so the same
// TypeScript-join logic is reproduced here rather than imported.
async function getAccessibleForumIds(
  admin: { id: string; role: string },
  supabase: SupabaseClient
): Promise<string[] | null> {
  if (admin.role === 'super_admin' || admin.role === 'owner_admin') return null

  const [{ data: grants }, { data: memberships }] = await Promise.all([
    supabase.from('forum_access_grants').select('forum_id, grant_type, role, group_id, admin_user_id'),
    supabase.from('forum_user_group_members').select('group_id').eq('admin_user_id', admin.id),
  ])

  const userGroupIds = new Set((memberships ?? []).map((m) => m.group_id))

  const accessible = new Set<string>()
  for (const g of grants ?? []) {
    const matches =
      (g.grant_type === 'role' && g.role === admin.role) ||
      (g.grant_type === 'group' && g.group_id !== null && userGroupIds.has(g.group_id)) ||
      (g.grant_type === 'individual' && g.admin_user_id === admin.id)
    if (matches) accessible.add(g.forum_id)
  }

  return Array.from(accessible)
}

export async function getForumUnreadCount(admin: AdminUser, supabase: SupabaseClient): Promise<number> {
  try {
    const accessibleForumIds = await getAccessibleForumIds(admin, supabase)

    if (accessibleForumIds !== null && accessibleForumIds.length === 0) {
      return 0
    }

    // forum_posts has no forum_id column (only thread_id) — scope through
    // forum_threads first, same join order as getForumIndexData().
    let postIds: string[]

    if (accessibleForumIds === null) {
      const { data: postsRaw } = await supabase.from('forum_posts').select('id').eq('is_deleted', false)
      postIds = (postsRaw ?? []).map((p) => p.id)
    } else {
      const { data: threadsRaw } = await supabase
        .from('forum_threads')
        .select('id')
        .in('forum_id', accessibleForumIds)
        .eq('is_deleted', false)
      const threadIds = (threadsRaw ?? []).map((t) => t.id)

      if (threadIds.length === 0) return 0

      const { data: postsRaw } = await supabase
        .from('forum_posts')
        .select('id')
        .in('thread_id', threadIds)
        .eq('is_deleted', false)
      postIds = (postsRaw ?? []).map((p) => p.id)
    }

    if (postIds.length === 0) return 0

    const { data: readsRaw } = await supabase
      .from('forum_post_reads')
      .select('post_id')
      .eq('admin_user_id', admin.id)
      .in('post_id', postIds)

    const readPostIds = new Set((readsRaw ?? []).map((r) => r.post_id))
    return postIds.filter((id) => !readPostIds.has(id)).length
  } catch (err) {
    console.error('[getForumUnreadCount] failed:', err)
    return 0
  }
}

async function countPendingRegistrations(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from('pending_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
  return count ?? 0
}

async function countPendingCalendarEvents(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from('calendar_events')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
  return count ?? 0
}

async function countPendingConsentForms(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from('consent_form_submissions')
    .select('id', { count: 'exact', head: true })
    .not('submitted_file_path', 'is', null)
    .is('reviewed_at', null)
  return count ?? 0
}

async function countUnreadPersistent(adminId: string, supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('admin_user_id', adminId)
    .is('read_at', null)
  return count ?? 0
}

export async function getNotificationCounts(
  admin: AdminUser,
  flags: FeatureFlags,
  supabase: SupabaseClient
): Promise<NotificationCounts> {
  const zero: NotificationCounts = {
    ephemeral: { pendingRegistrations: 0, pendingCalendarEvents: 0, pendingConsentForms: 0 },
    unreadPersistent: 0,
    forumUnread: 0,
  }

  try {
    const canSeePendingRegistrations = admin.role === 'super_admin' || admin.role === 'owner_admin'
    const canSeePendingCalendarEvents = admin.role === 'super_admin'
    const canSeePendingConsentForms =
      admin.role === 'super_admin' || admin.role === 'owner_admin' || admin.role === 'editor'
    const canSeeForumUnread = flags.forums

    const [pendingRegistrations, pendingCalendarEvents, pendingConsentForms, unreadPersistent, forumUnread] =
      await Promise.all([
        canSeePendingRegistrations ? countPendingRegistrations(supabase) : Promise.resolve(0),
        canSeePendingCalendarEvents ? countPendingCalendarEvents(supabase) : Promise.resolve(0),
        canSeePendingConsentForms ? countPendingConsentForms(supabase) : Promise.resolve(0),
        countUnreadPersistent(admin.id, supabase),
        canSeeForumUnread ? getForumUnreadCount(admin, supabase) : Promise.resolve(0),
      ])

    return {
      ephemeral: { pendingRegistrations, pendingCalendarEvents, pendingConsentForms },
      unreadPersistent,
      forumUnread,
    }
  } catch (err) {
    console.error('[getNotificationCounts] failed:', err)
    return zero
  }
}

export async function getUserNotifications(
  adminUserId: string,
  supabase: SupabaseClient,
  limit = 20
): Promise<NotificationRow[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('admin_user_id', adminUserId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data as NotificationRow[]
  } catch (err) {
    console.error('[getUserNotifications] failed:', err)
    return []
  }
}
