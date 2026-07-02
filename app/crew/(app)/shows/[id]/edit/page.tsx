import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import ShowForm from '@/components/crew/shows/ShowForm'
import type { Show, ShowDate, ShowRole } from '@/types/show'

export default async function EditShowPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ blockedDates?: string; blockedRoles?: string }>
}) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role === 'viewer') {
    redirect('/crew/dashboard')
  }

  const { id } = await params
  const { blockedDates, blockedRoles } = await searchParams

  const supabase = await getServerClient()

  const [{ data: seasons }, { data: adminUsers }, { data: categories }, { data: settingsRows }] =
    await Promise.all([
      supabase.from('seasons').select('id, name').order('created_at', { ascending: false }),
      supabase
        .from('admin_users')
        .select('id, name, email, role')
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase
        .from('volunteer_categories')
        .select('id, name')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['default_hours_mainstage', 'default_hours_studio_x', 'default_hours_one_off']),
    ])

  const settingsMap = new Map((settingsRows ?? []).map((r) => [r.key, r.value]))
  const defaultHours = {
    mainstage: Number(settingsMap.get('default_hours_mainstage') ?? 3),
    studio_x: Number(settingsMap.get('default_hours_studio_x') ?? 2),
    one_off: Number(settingsMap.get('default_hours_one_off') ?? 2),
  }

  const [{ data: showRow }, { data: dateRows }, { data: roleRows }, { data: editorRows }] =
    await Promise.all([
      supabase
        .from('shows')
        .select(
          'id, season_id, name, show_type, description, status, volunteer_instructions, default_hours, created_at, updated_at'
        )
        .eq('id', id)
        .maybeSingle(),
      supabase
        .from('show_dates')
        .select('id, show_id, show_date, show_time')
        .eq('show_id', id)
        .order('show_date', { ascending: true })
        .order('show_time', { ascending: true }),
      supabase
        .from('volunteer_roles')
        .select('id, show_id, category_id, role_name, slots_available')
        .eq('show_id', id)
        .order('created_at', { ascending: true }),
      supabase.from('show_editors').select('admin_id').eq('show_id', id),
    ])

  if (!showRow) {
    redirect('/crew/shows')
  }

  const show = {
    ...(showRow as Show),
    dates: (dateRows ?? []) as ShowDate[],
    roles: (roleRows ?? []) as ShowRole[],
    editorIds: (editorRows ?? []).map((e) => e.admin_id as string),
  }

  return (
    <div>
      <Link
        href="/crew/shows"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Back to Shows
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Edit Show</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">{show.name}</p>

      <ShowForm
        seasons={seasons ?? []}
        adminUsers={adminUsers ?? []}
        categories={categories ?? []}
        defaultHours={defaultHours}
        show={show}
        blockedDateIds={blockedDates ? blockedDates.split(',') : []}
        blockedRoleIds={blockedRoles ? blockedRoles.split(',') : []}
      />
    </div>
  )
}
