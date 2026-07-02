import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import VolunteerProfileForm from '@/components/crew/volunteers/VolunteerProfileForm'
import CallHistoryTable from '@/components/crew/volunteers/CallHistoryTable'
import EditorNotes from '@/components/crew/volunteers/EditorNotes'
import StatusToggle from '@/components/crew/volunteers/StatusToggle'
import type { VolunteerProfile } from '@/types/volunteer'

type RawCallRow = {
  id: string
  volunteer_roles: { role_name: string } | null
  show_dates: { show_date: string; shows: { name: string } | null } | null
  attendance: { status: 'showed' | 'no_show' | 'excused'; hours_logged: number }[] | null
}

type RawNoteRow = {
  id: string
  body: string
  created_at: string
  admin_users: { name: string } | null
}

export default async function VolunteerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const { id } = await params
  const supabase = await getServerClient()

  const { data: volunteer } = await supabase
    .from('volunteers')
    .select('*')
    .eq('id', id)
    .single()

  if (!volunteer) {
    notFound()
  }

  const [{ data: assignmentRows }, { data: allCategories }, { data: callRows }] =
    await Promise.all([
      supabase
        .from('volunteer_category_assignments')
        .select('volunteer_categories(id, name)')
        .eq('volunteer_id', id),
      supabase
        .from('volunteer_categories')
        .select('id, name')
        .eq('is_visible', true)
        .order('sort_order'),
      supabase
        .from('slot_claims')
        .select(
          `
          id,
          volunteer_roles ( role_name ),
          show_dates (
            show_date,
            shows ( name )
          ),
          attendance ( status, hours_logged )
        `
        )
        .eq('volunteer_id', id)
        .eq('status', 'claimed')
        .order('claimed_at', { ascending: false }),
    ])

  const categories = (assignmentRows ?? [])
    .map((a) => a.volunteer_categories as unknown as { id: string; name: string } | null)
    .filter((c): c is { id: string; name: string } => !!c)

  const calls = ((callRows ?? []) as unknown as RawCallRow[]).map((claim) => ({
    id: claim.id,
    show_name: claim.show_dates?.shows?.name ?? '—',
    show_date: claim.show_dates?.show_date ?? '',
    role_name: claim.volunteer_roles?.role_name ?? '—',
    attendance_status: claim.attendance?.[0]?.status ?? null,
    hours_logged: claim.attendance?.[0]?.hours_logged ?? null,
  }))

  let notes: RawNoteRow[] = []
  if (admin.role !== 'viewer') {
    const { data: noteRows } = await supabase
      .from('volunteer_notes')
      .select('id, body, created_at, admin_users(name)')
      .eq('volunteer_id', id)
      .order('created_at', { ascending: false })
    notes = (noteRows ?? []) as unknown as RawNoteRow[]
  }

  return (
    <div>
      <Link
        href="/crew/volunteers"
        className="text-sm text-mid-gray hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Back to Volunteers
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-dark">{volunteer.full_name}</h1>
          <span
            className={`text-xs font-semibold rounded px-2 py-0.5 ${
              volunteer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-mid-gray text-white'
            }`}
          >
            {volunteer.status === 'active' ? 'Active' : 'Archived'}
          </span>
        </div>
        {admin.role !== 'viewer' && (
          <StatusToggle
            volunteerId={volunteer.id}
            currentStatus={volunteer.status}
            volunteerName={volunteer.full_name}
          />
        )}
      </div>

      <VolunteerProfileForm
        volunteer={volunteer as VolunteerProfile}
        categories={categories}
        allCategories={allCategories ?? []}
        role={admin.role}
      />

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-dark mb-4">Call History</h2>
        <CallHistoryTable calls={calls} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-dark mb-4">Hours</h2>
        <p className="text-2xl font-bold text-navy">
          {volunteer.total_hours}
          <span className="text-base font-normal text-mid-gray ml-1">hours</span>
        </p>
        <p className="text-sm text-mid-gray mt-2">
          Per-season breakdown and milestone history coming in a future phase.
        </p>
      </section>

      {admin.role !== 'viewer' && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-dark mb-4">Editor Notes</h2>
          <EditorNotes volunteerId={volunteer.id} notes={notes} />
        </section>
      )}
    </div>
  )
}
