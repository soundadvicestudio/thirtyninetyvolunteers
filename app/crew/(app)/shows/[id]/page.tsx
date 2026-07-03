import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { generateQR } from '@/lib/qr'
import ShowDetail from '@/components/crew/shows/ShowDetail'
import type {
  Show,
  ShowDateWithRoles,
  SlotClaim,
  AttendanceRecord,
  ShowEditor,
  AdminUserSummary,
} from '@/types/show'

type RawShowEditorRow = {
  admin_id: string
  admin_users: { id: string; name: string; email: string; role: 'super_admin' | 'editor' | 'viewer' } | null
}

type RawDateRow = {
  id: string
  show_id: string
  show_date: string
  show_time: string
  volunteer_roles: { id: string; category_id: string | null; role_name: string; slots_available: number }[] | null
}

export default async function ShowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const { id } = await params
  const supabase = await getServerClient()

  const { data: showRow } = await supabase
    .from('shows')
    .select(
      'id, season_id, name, show_type, description, status, volunteer_instructions, default_hours, notifications_sent_at, created_at, updated_at, seasons ( id, name )'
    )
    .eq('id', id)
    .maybeSingle()

  if (!showRow) {
    redirect('/crew/shows')
  }

  const [{ data: dateRows }, { data: editorRows }, { data: adminUserRows }, { data: settingsRows }] =
    await Promise.all([
      supabase
        .from('show_dates')
        .select(
          `
          id, show_id, show_date, show_time,
          volunteer_roles ( id, category_id, role_name, slots_available )
        `
        )
        .eq('show_id', id)
        .order('show_date', { ascending: true })
        .order('show_time', { ascending: true }),
      supabase
        .from('show_editors')
        .select('admin_id, admin_users ( id, name, email, role )')
        .eq('show_id', id),
      supabase
        .from('admin_users')
        .select('id, name, email, role')
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['default_hours_mainstage', 'default_hours_studio_x', 'default_hours_one_off']),
    ])

  const showDates: ShowDateWithRoles[] = ((dateRows ?? []) as unknown as RawDateRow[]).map((d) => ({
    id: d.id,
    show_id: d.show_id,
    show_date: d.show_date,
    show_time: d.show_time,
    roles: (d.volunteer_roles ?? []).map((r) => ({ ...r, show_date_id: d.id })),
  }))

  const roleIds = showDates.flatMap((d) => d.roles.map((r) => r.id))

  const [{ data: claimRows }, qr] = await Promise.all([
    roleIds.length > 0
      ? supabase
          .from('slot_claims')
          .select(
            'id, volunteer_role_id, show_date_id, volunteer_id, volunteer_name, volunteer_email, status, waitlist_position, claimed_at'
          )
          .in('volunteer_role_id', roleIds)
      : Promise.resolve({ data: [] as SlotClaim[] }),
    generateQR(`${process.env.NEXT_PUBLIC_SITE_URL}/shows/${id}`),
  ])

  const claimIds = (claimRows ?? []).map((c) => c.id)
  const { data: attendanceRows } =
    claimIds.length > 0
      ? await supabase
          .from('attendance')
          .select('id, slot_claim_id, status, hours_logged')
          .in('slot_claim_id', claimIds)
      : { data: [] as AttendanceRecord[] }

  const attendanceByClaim: Record<string, AttendanceRecord> = {}
  for (const a of (attendanceRows ?? []) as AttendanceRecord[]) {
    attendanceByClaim[a.slot_claim_id] = a
  }

  const settingsMap = new Map((settingsRows ?? []).map((r) => [r.key, r.value]))
  const defaultHours = {
    mainstage: Number(settingsMap.get('default_hours_mainstage') ?? 3),
    studio_x: Number(settingsMap.get('default_hours_studio_x') ?? 2),
    one_off: Number(settingsMap.get('default_hours_one_off') ?? 2),
  }

  const showEditors: ShowEditor[] = ((editorRows ?? []) as unknown as RawShowEditorRow[])
    .filter((e) => e.admin_users)
    .map((e) => ({
      admin_id: e.admin_id,
      name: e.admin_users!.name,
      email: e.admin_users!.email,
      role: e.admin_users!.role,
    }))

  const rawShow = showRow as unknown as Show & { seasons: { id: string; name: string } | null }
  const { seasons: seasonRow, ...show } = rawShow

  return (
    <ShowDetail
      show={show}
      season={seasonRow}
      showDates={showDates}
      slotClaims={(claimRows ?? []) as SlotClaim[]}
      attendance={attendanceByClaim}
      showEditors={showEditors}
      allAdminUsers={(adminUserRows ?? []) as AdminUserSummary[]}
      defaultHours={defaultHours}
      qr={qr}
      adminRole={admin.role}
      adminId={admin.id}
    />
  )
}
