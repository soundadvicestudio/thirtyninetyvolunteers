import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CategoryWithForumSummary,
  ForumSummary,
  ForumThreadPrefix,
  ForumDetail,
  ThreadSummary,
} from '@/types/forums'

type ForumPostRow = { id: string; thread_id: string; author_id: string; created_at: string }

// Access filtering happens here in TypeScript, not in the Supabase query —
// the three-way OR (role grant / group grant + membership join / individual
// grant) cannot be expressed in a single .select() call. Same pattern as the
// §7 Supabase aliased dual self-join workaround, applied to access control.
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

export async function canAccessForum(
  forumId: string,
  admin: { id: string; role: string },
  supabase: SupabaseClient
): Promise<boolean> {
  if (admin.role === 'super_admin' || admin.role === 'owner_admin') return true

  const [{ data: grants }, { data: memberships }] = await Promise.all([
    supabase
      .from('forum_access_grants')
      .select('grant_type, role, group_id, admin_user_id')
      .eq('forum_id', forumId),
    supabase.from('forum_user_group_members').select('group_id').eq('admin_user_id', admin.id),
  ])

  const userGroupIds = new Set((memberships ?? []).map((m) => m.group_id))

  return (grants ?? []).some(
    (g) =>
      (g.grant_type === 'role' && g.role === admin.role) ||
      (g.grant_type === 'group' && g.group_id !== null && userGroupIds.has(g.group_id)) ||
      (g.grant_type === 'individual' && g.admin_user_id === admin.id)
  )
}

export async function isForumModerator(
  forumId: string,
  adminId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data } = await supabase
    .from('forum_moderators')
    .select('id')
    .eq('forum_id', forumId)
    .eq('admin_user_id', adminId)
    .maybeSingle()
  return data !== null
}

export async function getForumIndexData(
  admin: { id: string; role: string },
  supabase: SupabaseClient
): Promise<CategoryWithForumSummary[]> {
  const [{ data: forumsRaw }, { data: categoriesRaw }] = await Promise.all([
    supabase
      .from('forums')
      .select('*, forum_categories!forums_category_id_fkey(name)')
      .eq('is_archived', false)
      .order('category_id', { ascending: true })
      .order('sort_order', { ascending: true }),
    supabase
      .from('forum_categories')
      .select('id, name, sort_order, created_by, created_at')
      .order('sort_order', { ascending: true }),
  ])

  const allForums = forumsRaw ?? []
  const categories = categoriesRaw ?? []

  const accessibleForumIds = await getAccessibleForumIds(admin, supabase)
  const accessibleForums =
    accessibleForumIds === null
      ? allForums
      : allForums.filter((f) => new Set(accessibleForumIds).has(f.id))

  if (accessibleForums.length === 0) return []

  const forumIds = accessibleForums.map((f) => f.id)

  const { data: threadsRaw } = await supabase
    .from('forum_threads')
    .select('id, forum_id')
    .in('forum_id', forumIds)
    .eq('is_deleted', false)

  const threads = threadsRaw ?? []
  const threadIds = threads.map((t) => t.id)
  const threadToForumId = new Map(threads.map((t) => [t.id, t.forum_id]))

  const threadCountByForum = new Map<string, number>()
  for (const t of threads) {
    threadCountByForum.set(t.forum_id, (threadCountByForum.get(t.forum_id) ?? 0) + 1)
  }

  let allPosts: ForumPostRow[] = []
  if (threadIds.length > 0) {
    const { data: postsRaw } = await supabase
      .from('forum_posts')
      .select('id, thread_id, author_id, created_at')
      .in('thread_id', threadIds)
      .eq('is_deleted', false)
    allPosts = postsRaw ?? []
  }

  const postIds = allPosts.map((p) => p.id)
  let readPostIds = new Set<string>()
  if (postIds.length > 0) {
    const { data: readsRaw } = await supabase
      .from('forum_post_reads')
      .select('post_id')
      .eq('admin_user_id', admin.id)
      .in('post_id', postIds)
    readPostIds = new Set((readsRaw ?? []).map((r) => r.post_id))
  }

  const unreadByForum = new Map<string, number>()
  const latestPostByForum = new Map<string, ForumPostRow>()
  for (const p of allPosts) {
    const forumId = threadToForumId.get(p.thread_id)
    if (!forumId) continue
    if (!readPostIds.has(p.id)) {
      unreadByForum.set(forumId, (unreadByForum.get(forumId) ?? 0) + 1)
    }
    const current = latestPostByForum.get(forumId)
    if (!current || p.created_at > current.created_at) {
      latestPostByForum.set(forumId, p)
    }
  }

  const latestAuthorIds = Array.from(new Set(Array.from(latestPostByForum.values()).map((p) => p.author_id)))
  let authorMap = new Map<string, string>()
  if (latestAuthorIds.length > 0) {
    const { data: authorsRaw } = await supabase.from('admin_users').select('id, name').in('id', latestAuthorIds)
    authorMap = new Map((authorsRaw ?? []).map((a) => [a.id, a.name]))
  }

  const forumSummaries: ForumSummary[] = accessibleForums.map((f) => {
    const latest = latestPostByForum.get(f.id)
    return {
      id: f.id,
      category_id: f.category_id,
      name: f.name,
      description: f.description,
      sort_order: f.sort_order,
      is_archived: f.is_archived,
      created_by: f.created_by,
      created_at: f.created_at,
      updated_at: f.updated_at,
      unread_count: unreadByForum.get(f.id) ?? 0,
      last_post_at: latest?.created_at ?? null,
      last_post_author: latest ? (authorMap.get(latest.author_id) ?? null) : null,
      thread_count: threadCountByForum.get(f.id) ?? 0,
    }
  })

  return categories
    .map((c) => ({
      ...c,
      forums: forumSummaries.filter((f) => f.category_id === c.id).sort((a, b) => a.sort_order - b.sort_order),
    }))
    .filter((c) => c.forums.length > 0)
}

export async function getThreadListData(
  forumId: string,
  admin: { id: string; role: string },
  supabase: SupabaseClient
): Promise<{ forum: ForumDetail; threads: ThreadSummary[]; isModerator: boolean } | null> {
  const [canAccess, { data: forumRaw }, isModerator, { data: prefixesRaw }] = await Promise.all([
    canAccessForum(forumId, admin, supabase),
    supabase
      .from('forums')
      .select('*, forum_categories!forums_category_id_fkey(name)')
      .eq('id', forumId)
      .maybeSingle(),
    isForumModerator(forumId, admin.id, supabase),
    supabase.from('forum_thread_prefixes').select('*').eq('forum_id', forumId).order('sort_order', { ascending: true }),
  ])

  if (!canAccess || !forumRaw) return null

  const category = Array.isArray(forumRaw.forum_categories) ? forumRaw.forum_categories[0] : forumRaw.forum_categories
  const prefixes: ForumThreadPrefix[] = prefixesRaw ?? []
  const prefixLabelMap = new Map(prefixes.map((p) => [p.id, p.label]))

  const { data: threadsRaw } = await supabase
    .from('forum_threads')
    .select('*, admin_users!forum_threads_created_by_fkey(name)')
    .eq('forum_id', forumId)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  const rawThreads = threadsRaw ?? []
  const threadIds = rawThreads.map((t) => t.id)

  let allPosts: ForumPostRow[] = []
  if (threadIds.length > 0) {
    const { data: postsRaw } = await supabase
      .from('forum_posts')
      .select('id, thread_id, author_id, created_at')
      .in('thread_id', threadIds)
      .eq('is_deleted', false)
    allPosts = postsRaw ?? []
  }

  const postsByThread = new Map<string, ForumPostRow[]>()
  const latestPostByThread = new Map<string, ForumPostRow>()
  for (const p of allPosts) {
    const list = postsByThread.get(p.thread_id) ?? []
    list.push(p)
    postsByThread.set(p.thread_id, list)

    const current = latestPostByThread.get(p.thread_id)
    if (!current || p.created_at > current.created_at) {
      latestPostByThread.set(p.thread_id, p)
    }
  }

  const latestAuthorIds = Array.from(new Set(Array.from(latestPostByThread.values()).map((p) => p.author_id)))
  let authorMap = new Map<string, string>()
  if (latestAuthorIds.length > 0) {
    const { data: authorsRaw } = await supabase.from('admin_users').select('id, name').in('id', latestAuthorIds)
    authorMap = new Map((authorsRaw ?? []).map((a) => [a.id, a.name]))
  }

  const postIds = allPosts.map((p) => p.id)
  let readPostIds = new Set<string>()
  if (postIds.length > 0) {
    const { data: readsRaw } = await supabase
      .from('forum_post_reads')
      .select('post_id')
      .eq('admin_user_id', admin.id)
      .in('post_id', postIds)
    readPostIds = new Set((readsRaw ?? []).map((r) => r.post_id))
  }

  const threads: ThreadSummary[] = rawThreads.map((t) => {
    const creator = Array.isArray(t.admin_users) ? t.admin_users[0] : t.admin_users
    const threadPosts = postsByThread.get(t.id) ?? []
    const latest = latestPostByThread.get(t.id)
    return {
      id: t.id,
      forum_id: t.forum_id,
      prefix_id: t.prefix_id,
      prefix_label: t.prefix_id ? (prefixLabelMap.get(t.prefix_id) ?? null) : null,
      title: t.title,
      created_by: t.created_by,
      created_by_name: creator?.name ?? '',
      is_pinned: t.is_pinned,
      is_locked: t.is_locked,
      is_deleted: t.is_deleted,
      created_at: t.created_at,
      updated_at: t.updated_at,
      reply_count: threadPosts.length,
      has_unread: threadPosts.some((p) => !readPostIds.has(p.id)),
      last_post_at: latest?.created_at ?? null,
      last_post_author: latest ? (authorMap.get(latest.author_id) ?? null) : null,
    }
  })

  const forum: ForumDetail = {
    id: forumRaw.id,
    category_id: forumRaw.category_id,
    name: forumRaw.name,
    description: forumRaw.description,
    sort_order: forumRaw.sort_order,
    is_archived: forumRaw.is_archived,
    created_by: forumRaw.created_by,
    created_at: forumRaw.created_at,
    updated_at: forumRaw.updated_at,
    category_name: category?.name ?? '',
    prefixes,
  }

  return { forum, threads, isModerator }
}
