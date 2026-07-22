import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import ShowForm from '@/components/crew/shows/ShowForm'
import type { Show, ShowDateWithRoles } from '@/types/show'

type RawDateRow = {
  id: string
  show_id: string
  show_date: string
  show_time: string
  end_time: string | null
  volunteer_roles: { id: string; category_id: string | null; role_name: string; slots_available: number }[] | null
}

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

  const [{ data: seasons }, { data: adminUsers }, { data: categories }, { data: settingsRows }, { data: locations }] =
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
      supabase
        .from('locations')
        .select('id, name, color, default_hours')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ])

  const settingsMap = new Map((settingsRows ?? []).map((r) => [r.key, r.value]))
  const defaultHours = {
    mainstage: Number(settingsMap.get('default_hours_mainstage') ?? 3),
    studio_x: Number(settingsMap.get('default_hours_studio_x') ?? 2),
    one_off: Number(settingsMap.get('default_hours_one_off') ?? 2),
  }

  const [{ data: showRow }, { data: dateRows }, { data: editorRows }] = await Promise.all([
    supabase
      .from('shows')
      .select(
        'id, season_id, name, location_id, description, status, volunteer_instructions, default_hours, notifications_sent_at, created_at, updated_at'
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('show_dates')
      .select(
        `
        id, show_id, show_date, show_time, end_time,
        volunteer_roles ( id, category_id, role_name, slots_available )
      `
      )
      .eq('show_id', id)
      .order('show_date', { ascending: true })
      .order('show_time', { ascending: true }),
    supabase.from('show_editors').select('admin_id').eq('show_id', id),
  ])

  if (!showRow) {
    redirect('/crew/shows')
  }

  const dateIds = ((dateRows ?? []) as unknown as RawDateRow[]).map((d) => d.id)
  const { data: bufferRows } =
    dateIds.length > 0
      ? await supabase
          .from('show_date_buffer')
          .select('show_date_id, buffer_before_minutes, buffer_after_minutes')
          .in('show_date_id', dateIds)
      : { data: [] as { show_date_id: string; buffer_before_minutes: number; buffer_after_minutes: number }[] }

  const bufferByDateId = new Map(
    (bufferRows ?? []).map((b) => [b.show_date_id, b])
  )

  const dates: ShowDateWithRoles[] = ((dateRows ?? []) as unknown as RawDateRow[]).map((d) => ({
    id: d.id,
    show_id: d.show_id,
    show_date: d.show_date,
    show_time: d.show_time,
    end_time: d.end_time,
    buffer_before_minutes: bufferByDateId.get(d.id)?.buffer_before_minutes ?? 0,
    buffer_after_minutes: bufferByDateId.get(d.id)?.buffer_after_minutes ?? 0,
    roles: (d.volunteer_roles ?? []).map((r) => ({ ...r, show_date_id: d.id })),
  }))

  const show = {
    ...(showRow as Show),
    dates,
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
        locations={locations ?? []}
        defaultHours={defaultHours}
        show={show}
        blockedDateIds={blockedDates ? blockedDates.split(',') : []}
        blockedRoleIds={blockedRoles ? blockedRoles.split(',') : []}
      />
    </div>
  )
}
