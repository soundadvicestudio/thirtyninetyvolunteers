'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit'
import type {
  CategoryWithForums,
  ForumUserGroup,
  ForumAdminUserOption,
  ForumAccessGrant,
  ForumModerator,
  ForumThreadPrefix,
  ForumWithDetails,
} from '@/types/forums'

export type ActionResult = { success: true } | { error: string }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isSaOa(role: string): boolean {
  return ['super_admin', 'owner_admin'].includes(role)
}

// ─── Main data fetch ───────────────────────────────────────────

export async function getForumManageData(): Promise<{
  categories: CategoryWithForums[]
  groups: ForumUserGroup[]
  adminUsers: ForumAdminUserOption[]
}> {
  const supabase = await getServerClient()

  const [
    { data: categoriesData },
    { data: forumsData },
    { data: grantsData },
    { data: moderatorsData },
    { data: prefixesData },
    { data: groupsData },
    { data: adminUsersData },
  ] = await Promise.all([
    supabase
      .from('forum_categories')
      .select('id, name, sort_order, created_by, created_at')
      .order('sort_order', { ascending: true }),
    supabase
      .from('forums')
      .select('*')
      .order('category_id', { ascending: true })
      .order('sort_order', { ascending: true }),
    // FK hint required — forum_access_grants has two FKs to admin_users
    // (admin_user_id and created_by). created_by is not displayed here,
    // so only admin_user_id is joined.
    supabase
      .from('forum_access_grants')
      .select('*, forum_user_groups(name), admin_users!forum_access_grants_admin_user_id_fkey(name, email)'),
    supabase
      .from('forum_moderators')
      .select('*, admin_users!forum_moderators_admin_user_id_fkey(name, email, role)'),
    supabase
      .from('forum_thread_prefixes')
      .select('id, forum_id, label, sort_order, created_at')
      .order('forum_id', { ascending: true })
      .order('sort_order', { ascending: true }),
    supabase
      .from('forum_user_groups')
      .select('id, name, description, sort_order, created_by, created_at, updated_at')
      .order('sort_order', { ascending: true }),
    supabase
      .from('admin_users')
      .select('id, name, email, role')
      .eq('is_active', true)
      .order('name', { ascending: true }),
  ])

  const categories = categoriesData ?? []
  const forumsRaw = forumsData ?? []
  const grantsRaw = grantsData ?? []
  const moderatorsRaw = moderatorsData ?? []
  const prefixesRaw = prefixesData ?? []
  const groups = groupsData ?? []
  const adminUsers = adminUsersData ?? []

  const grants: ForumAccessGrant[] = grantsRaw.map((g) => {
    const group = Array.isArray(g.forum_user_groups) ? g.forum_user_groups[0] : g.forum_user_groups
    const adminUser = Array.isArray(g.admin_users) ? g.admin_users[0] : g.admin_users
    return {
      id: g.id,
      forum_id: g.forum_id,
      grant_type: g.grant_type,
      role: g.role,
      group_id: g.group_id,
      group_name: group?.name ?? null,
      admin_user_id: g.admin_user_id,
      admin_user_name: adminUser?.name ?? null,
      admin_user_email: adminUser?.email ?? null,
      created_by: g.created_by,
      created_at: g.created_at,
    }
  })

  const moderators: ForumModerator[] = moderatorsRaw.map((m) => {
    const adminUser = Array.isArray(m.admin_users) ? m.admin_users[0] : m.admin_users
    return {
      id: m.id,
      forum_id: m.forum_id,
      admin_user_id: m.admin_user_id,
      name: adminUser?.name ?? '',
      email: adminUser?.email ?? '',
      role: adminUser?.role ?? '',
      assigned_by: m.assigned_by,
      created_at: m.created_at,
    }
  })

  const prefixes: ForumThreadPrefix[] = prefixesRaw

  const forums: ForumWithDetails[] = forumsRaw.map((f) => ({
    ...f,
    grants: grants.filter((g) => g.forum_id === f.id),
    moderators: moderators.filter((m) => m.forum_id === f.id),
    prefixes: prefixes.filter((p) => p.forum_id === f.id),
  }))

  const categoriesWithForums: CategoryWithForums[] = categories.map((c) => ({
    ...c,
    forums: forums.filter((f) => f.category_id === c.id),
  }))

  return { categories: categoriesWithForums, groups, adminUsers }
}

// ─── Category CRUD ──────────────────────────────────────────────

export async function createForumCategory(name: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'Category name is required.' }

  const supabase = await getServerClient()

  const { data: maxRow } = await supabase
    .from('forum_categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = maxRow ? maxRow.sort_order + 1 : 0

  const { data: inserted, error } = await supabase
    .from('forum_categories')
    .insert({ name: trimmedName, sort_order: sortOrder, created_by: admin.id })
    .select('id')
    .single()

  if (error || !inserted) {
    return { error: error?.message ?? 'Something went wrong creating the category.' }
  }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_category.create', 'forum_category', inserted.id, undefined, {
    name: trimmedName,
  })

  return { success: true }
}

export async function updateForumCategory(id: string, name: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'Category name is required.' }

  const supabase = await getServerClient()

  const { data: previous } = await supabase
    .from('forum_categories')
    .select('name')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('forum_categories').update({ name: trimmedName }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')

  await logAction(
    admin.id,
    'forum_category.update',
    'forum_category',
    id,
    { name: previous?.name ?? '' },
    { name: trimmedName }
  )

  return { success: true }
}

export async function reorderForumCategory(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { data: categories, error: fetchError } = await supabase
    .from('forum_categories')
    .select('id, sort_order')
    .order('sort_order', { ascending: true })

  if (fetchError || !categories) return { error: 'Could not load categories.' }

  const index = categories.findIndex((c) => c.id === id)
  if (index === -1) return { error: 'Could not find this category.' }

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= categories.length) {
    return { success: true }
  }

  const current = categories[index]
  const swapTarget = categories[swapIndex]

  const { error: updateCurrentError } = await supabase
    .from('forum_categories')
    .update({ sort_order: swapTarget.sort_order })
    .eq('id', current.id)
  if (updateCurrentError) {
    return { error: 'Something went wrong reordering categories. Please try again.' }
  }

  const { error: updateSwapError } = await supabase
    .from('forum_categories')
    .update({ sort_order: current.sort_order })
    .eq('id', swapTarget.id)
  if (updateSwapError) {
    return { error: 'Something went wrong reordering categories. Please try again.' }
  }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_category.reorder', 'forum_category', id, undefined, { direction })

  return { success: true }
}

export async function deleteForumCategory(id: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { data: existingForum } = await supabase
    .from('forums')
    .select('id')
    .eq('category_id', id)
    .limit(1)
    .maybeSingle()

  if (existingForum) {
    return { error: 'Remove or move all forums in this category before deleting it.' }
  }

  const { error } = await supabase.from('forum_categories').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_category.delete', 'forum_category', id, { id }, undefined)

  return { success: true }
}

// ─── Forum CRUD ──────────────────────────────────────────────────

export async function createForum(
  categoryId: string,
  name: string,
  description: string | null
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'Forum name is required.' }

  const supabase = await getServerClient()

  const { data: maxRow } = await supabase
    .from('forums')
    .select('sort_order')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = maxRow ? maxRow.sort_order + 1 : 0

  const { data: inserted, error } = await supabase
    .from('forums')
    .insert({
      category_id: categoryId,
      name: trimmedName,
      description: description?.trim() || null,
      sort_order: sortOrder,
      is_archived: false,
      created_by: admin.id,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    return { error: error?.message ?? 'Something went wrong creating the forum.' }
  }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_forum.create', 'forum', inserted.id, undefined, {
    name: trimmedName,
    categoryId,
  })

  return { success: true }
}

export async function updateForum(
  id: string,
  name: string,
  description: string | null
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const trimmedName = name.trim()
  if (!trimmedName) return { error: 'Forum name is required.' }

  const supabase = await getServerClient()

  const { data: previous } = await supabase.from('forums').select('name').eq('id', id).maybeSingle()

  const { error } = await supabase
    .from('forums')
    .update({ name: trimmedName, description: description?.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')

  await logAction(
    admin.id,
    'forum_forum.update',
    'forum',
    id,
    { name: previous?.name ?? '' },
    { name: trimmedName, description }
  )

  return { success: true }
}

export async function reorderForum(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { data: target } = await supabase.from('forums').select('category_id').eq('id', id).maybeSingle()
  if (!target) return { error: 'Could not find this forum.' }

  const { data: forums, error: fetchError } = await supabase
    .from('forums')
    .select('id, sort_order')
    .eq('category_id', target.category_id)
    .order('sort_order', { ascending: true })

  if (fetchError || !forums) return { error: 'Could not load forums.' }

  const index = forums.findIndex((f) => f.id === id)
  if (index === -1) return { error: 'Could not find this forum.' }

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= forums.length) {
    return { success: true }
  }

  const current = forums[index]
  const swapTarget = forums[swapIndex]

  const { error: updateCurrentError } = await supabase
    .from('forums')
    .update({ sort_order: swapTarget.sort_order })
    .eq('id', current.id)
  if (updateCurrentError) {
    return { error: 'Something went wrong reordering forums. Please try again.' }
  }

  const { error: updateSwapError } = await supabase
    .from('forums')
    .update({ sort_order: current.sort_order })
    .eq('id', swapTarget.id)
  if (updateSwapError) {
    return { error: 'Something went wrong reordering forums. Please try again.' }
  }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_forum.reorder', 'forum', id, undefined, { direction })

  return { success: true }
}

export async function archiveForum(id: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { error } = await supabase
    .from('forums')
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')
  revalidatePath('/crew/forums')

  await logAction(admin.id, 'forum_forum.archive', 'forum', id, { is_archived: false }, { is_archived: true })

  return { success: true }
}

export async function unarchiveForum(id: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { error } = await supabase
    .from('forums')
    .update({ is_archived: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')
  revalidatePath('/crew/forums')

  await logAction(admin.id, 'forum_forum.unarchive', 'forum', id, { is_archived: true }, { is_archived: false })

  return { success: true }
}

export async function deleteForum(id: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { data: existingThread } = await supabase
    .from('forum_threads')
    .select('id')
    .eq('forum_id', id)
    .limit(1)
    .maybeSingle()

  if (existingThread) {
    return { error: 'This forum contains threads. Archive it instead of deleting.' }
  }

  const { error } = await supabase.from('forums').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')
  revalidatePath('/crew/forums')

  await logAction(admin.id, 'forum_forum.delete', 'forum', id, { id }, undefined)

  return { success: true }
}

export async function moveForum(id: string, newCategoryId: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { data: previous } = await supabase.from('forums').select('category_id').eq('id', id).maybeSingle()

  const { data: maxRow } = await supabase
    .from('forums')
    .select('sort_order')
    .eq('category_id', newCategoryId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = maxRow ? maxRow.sort_order + 1 : 0

  const { error } = await supabase
    .from('forums')
    .update({ category_id: newCategoryId, sort_order: sortOrder, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')

  await logAction(
    admin.id,
    'forum_forum.move',
    'forum',
    id,
    { categoryId: previous?.category_id ?? null },
    { categoryId: newCategoryId }
  )

  return { success: true }
}

// ─── Access grant management ────────────────────────────────────

export async function addForumAccessGrant(
  forumId: string,
  grantType: 'role' | 'group' | 'individual',
  value: string
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const column = grantType === 'role' ? 'role' : grantType === 'group' ? 'group_id' : 'admin_user_id'

  const { data: existing } = await supabase
    .from('forum_access_grants')
    .select('id')
    .eq('forum_id', forumId)
    .eq('grant_type', grantType)
    .eq(column, value)
    .limit(1)
    .maybeSingle()

  if (existing) return { error: 'This grant already exists.' }

  const insertRow: Record<string, string> = { forum_id: forumId, grant_type: grantType, created_by: admin.id }
  insertRow[column] = value

  const { data: inserted, error } = await supabase
    .from('forum_access_grants')
    .insert(insertRow)
    .select('id')
    .single()

  if (error || !inserted) {
    return { error: error?.message ?? 'Something went wrong adding the access grant.' }
  }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_access_grant.add', 'forum_access_grant', inserted.id, undefined, {
    forumId,
    grantType,
    value,
  })

  return { success: true }
}

export async function removeForumAccessGrant(grantId: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { error } = await supabase.from('forum_access_grants').delete().eq('id', grantId)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_access_grant.remove', 'forum_access_grant', grantId, { id: grantId }, undefined)

  return { success: true }
}

// ─── Moderator management ───────────────────────────────────────

export async function addForumModerator(forumId: string, adminUserId: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { error } = await supabase.from('forum_moderators').upsert(
    { forum_id: forumId, admin_user_id: adminUserId, assigned_by: admin.id },
    { onConflict: 'forum_id,admin_user_id', ignoreDuplicates: true }
  )
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_moderator.add', 'forum_moderator', `${forumId}:${adminUserId}`, undefined, {
    forumId,
    adminUserId,
  })

  return { success: true }
}

export async function removeForumModerator(moderatorId: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { error } = await supabase.from('forum_moderators').delete().eq('id', moderatorId)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_moderator.remove', 'forum_moderator', moderatorId, { id: moderatorId }, undefined)

  return { success: true }
}

// ─── Admin user search (grant + moderator pickers) ──────────────

export async function searchForumAdminUsers(
  query: string,
  excludeIds: string[]
): Promise<ForumAdminUserOption[]> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return []

  const term = query.trim()
  if (term.length < 2) return []

  const supabase = await getServerClient()
  let queryBuilder = supabase
    .from('admin_users')
    .select('id, name, email, role')
    .eq('is_active', true)
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

// ─── Thread prefix management ───────────────────────────────────

export async function createForumPrefix(forumId: string, label: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const trimmedLabel = label.trim()
  if (!trimmedLabel) return { error: 'Prefix label is required.' }

  const supabase = await getServerClient()

  const { data: maxRow } = await supabase
    .from('forum_thread_prefixes')
    .select('sort_order')
    .eq('forum_id', forumId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = maxRow ? maxRow.sort_order + 1 : 0

  const { data: inserted, error } = await supabase
    .from('forum_thread_prefixes')
    .insert({ forum_id: forumId, label: trimmedLabel, sort_order: sortOrder })
    .select('id')
    .single()

  if (error || !inserted) {
    return { error: error?.message ?? 'Something went wrong creating the prefix.' }
  }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_prefix.create', 'forum_thread_prefix', inserted.id, undefined, {
    label: trimmedLabel,
  })

  return { success: true }
}

export async function updateForumPrefix(id: string, label: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const trimmedLabel = label.trim()
  if (!trimmedLabel) return { error: 'Prefix label is required.' }

  const supabase = await getServerClient()

  const { data: previous } = await supabase
    .from('forum_thread_prefixes')
    .select('label')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('forum_thread_prefixes').update({ label: trimmedLabel }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')

  await logAction(
    admin.id,
    'forum_prefix.update',
    'forum_thread_prefix',
    id,
    { label: previous?.label ?? '' },
    { label: trimmedLabel }
  )

  return { success: true }
}

export async function reorderForumPrefix(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { data: target } = await supabase
    .from('forum_thread_prefixes')
    .select('forum_id')
    .eq('id', id)
    .maybeSingle()
  if (!target) return { error: 'Could not find this prefix.' }

  const { data: prefixes, error: fetchError } = await supabase
    .from('forum_thread_prefixes')
    .select('id, sort_order')
    .eq('forum_id', target.forum_id)
    .order('sort_order', { ascending: true })

  if (fetchError || !prefixes) return { error: 'Could not load prefixes.' }

  const index = prefixes.findIndex((p) => p.id === id)
  if (index === -1) return { error: 'Could not find this prefix.' }

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= prefixes.length) {
    return { success: true }
  }

  const current = prefixes[index]
  const swapTarget = prefixes[swapIndex]

  const { error: updateCurrentError } = await supabase
    .from('forum_thread_prefixes')
    .update({ sort_order: swapTarget.sort_order })
    .eq('id', current.id)
  if (updateCurrentError) {
    return { error: 'Something went wrong reordering prefixes. Please try again.' }
  }

  const { error: updateSwapError } = await supabase
    .from('forum_thread_prefixes')
    .update({ sort_order: current.sort_order })
    .eq('id', swapTarget.id)
  if (updateSwapError) {
    return { error: 'Something went wrong reordering prefixes. Please try again.' }
  }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_prefix.reorder', 'forum_thread_prefix', id, undefined, { direction })

  return { success: true }
}

export async function deleteForumPrefix(id: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return { error: 'Unauthorized' }

  const supabase = await getServerClient()

  const { error } = await supabase.from('forum_thread_prefixes').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/crew/forums/manage')

  await logAction(admin.id, 'forum_prefix.delete', 'forum_thread_prefix', id, { id }, undefined)

  return { success: true }
}

// ─── Forum picker for Move Thread (ThreadViewClient) ────────────

export async function getForumsForMove(
  excludeForumId: string
): Promise<Array<{ id: string; name: string; category_name: string }>> {
  const admin = await getAdminUser()
  if (!admin || !isSaOa(admin.role)) return []

  const supabase = await getServerClient()

  const { data } = await supabase
    .from('forums')
    .select('id, name, forum_categories!forums_category_id_fkey(name)')
    .eq('is_archived', false)
    .neq('id', excludeForumId)
    .order('category_id', { ascending: true })
    .order('sort_order', { ascending: true })

  return (data ?? []).map((f) => {
    const category = Array.isArray(f.forum_categories) ? f.forum_categories[0] : f.forum_categories
    return { id: f.id, name: f.name, category_name: category?.name ?? '' }
  })
}
