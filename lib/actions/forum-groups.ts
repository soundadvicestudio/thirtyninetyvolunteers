'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit'
import type { ForumUserGroup, ForumGroupMember } from '@/types/forums'

export type ActionResult = { success: true } | { error: string }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getForumGroups(): Promise<ForumUserGroup[]> {
  const supabase = await getServerClient()
  const { data: groups } = await supabase
    .from('forum_user_groups')
    .select('id, name, description, sort_order, created_by, created_at, updated_at')
    .order('sort_order', { ascending: true })

  if (!groups) return []

  const counts = await Promise.all(
    groups.map((g) =>
      supabase
        .from('forum_user_group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', g.id)
    )
  )

  return groups.map((g, i) => ({ ...g, member_count: counts[i].count ?? 0 }))
}

export async function createForumGroup(
  name: string,
  description: string | null
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !['super_admin', 'owner_admin'].includes(admin.role)) {
    return { error: 'Unauthorized' }
  }

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'Group name is required.' }

  const supabase = await getServerClient()
  const { error } = await supabase.from('forum_user_groups').insert({
    name: trimmedName,
    description: description?.trim() || null,
    created_by: admin.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/crew/settings/groups')

  await logAction(admin.id, 'forum_group.create', 'forum_user_groups', trimmedName, undefined, {
    name: trimmedName,
  })

  return { success: true }
}

export async function updateForumGroup(
  id: string,
  name: string,
  description: string | null
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !['super_admin', 'owner_admin'].includes(admin.role)) {
    return { error: 'Unauthorized' }
  }

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'Group name is required.' }

  const supabase = await getServerClient()

  const { data: previous } = await supabase
    .from('forum_user_groups')
    .select('name')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase
    .from('forum_user_groups')
    .update({ name: trimmedName, description: description?.trim() || null })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/crew/settings/groups')

  await logAction(
    admin.id,
    'forum_group.update',
    'forum_user_groups',
    id,
    { name: previous?.name ?? '' },
    { name: trimmedName }
  )

  return { success: true }
}

export async function deleteForumGroup(id: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !['super_admin', 'owner_admin'].includes(admin.role)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: previous } = await supabase
    .from('forum_user_groups')
    .select('name')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('forum_user_groups').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/crew/settings/groups')

  await logAction(admin.id, 'forum_group.delete', 'forum_user_groups', id, {
    name: previous?.name ?? '',
  })

  return { success: true }
}

export async function getForumGroupMembers(groupId: string): Promise<ForumGroupMember[]> {
  const supabase = await getServerClient()
  const { data } = await supabase
    .from('forum_user_group_members')
    .select('id, group_id, admin_user_id, created_at, admin_users(name, email, role)')
    .eq('group_id', groupId)

  if (!data) return []

  return data.map((row) => {
    const adminUser = Array.isArray(row.admin_users) ? row.admin_users[0] : row.admin_users
    return {
      id: row.id,
      group_id: row.group_id,
      admin_user_id: row.admin_user_id,
      created_at: row.created_at,
      name: adminUser?.name ?? '',
      email: adminUser?.email ?? '',
      role: adminUser?.role ?? '',
    }
  })
}

export async function addForumGroupMember(
  groupId: string,
  adminUserId: string
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !['super_admin', 'owner_admin'].includes(admin.role)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()
  const { error } = await supabase
    .from('forum_user_group_members')
    .upsert(
      { group_id: groupId, admin_user_id: adminUserId },
      { onConflict: 'group_id,admin_user_id', ignoreDuplicates: true }
    )

  if (error) return { error: error.message }

  revalidatePath('/crew/settings/groups')

  await logAction(admin.id, 'forum_group_member.add', 'forum_user_group_members', groupId, undefined, {
    group_id: groupId,
    admin_user_id: adminUserId,
  })

  return { success: true }
}

export async function removeForumGroupMember(
  groupId: string,
  adminUserId: string
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !['super_admin', 'owner_admin'].includes(admin.role)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()
  const { error } = await supabase
    .from('forum_user_group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('admin_user_id', adminUserId)

  if (error) return { error: error.message }

  revalidatePath('/crew/settings/groups')

  await logAction(admin.id, 'forum_group_member.remove', 'forum_user_group_members', groupId, {
    group_id: groupId,
    admin_user_id: adminUserId,
  })

  return { success: true }
}

export async function searchAdminUsersForGroup(
  query: string,
  excludeIds: string[]
): Promise<Array<{ id: string; name: string; email: string; role: string }>> {
  const admin = await getAdminUser()
  if (!admin || !['super_admin', 'owner_admin'].includes(admin.role)) {
    return []
  }

  const term = query.trim()
  if (term.length < 2) return []

  const supabase = await getServerClient()
  let queryBuilder = supabase
    .from('admin_users')
    .select('id, name, email, role')
    .or(`name.ilike.%${term}%,email.ilike.%${term}%`)
    .order('name')
    .limit(10)

  const safeExcludeIds = excludeIds.filter((id) => UUID_RE.test(id))
  if (safeExcludeIds.length > 0) {
    queryBuilder = queryBuilder.not('id', 'in', `(${safeExcludeIds.join(',')})`)
  }

  const { data, error } = await queryBuilder
  if (error || !data) return []
  return data
}
