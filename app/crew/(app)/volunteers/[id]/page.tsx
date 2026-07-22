import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { formatCT, formatWallClockCT } from '@/lib/utils/date'
import VolunteerProfileForm from '@/components/crew/volunteers/VolunteerProfileForm'
import CallHistoryTable from '@/components/crew/volunteers/CallHistoryTable'
import EditorNotes from '@/components/crew/volunteers/EditorNotes'
import StatusToggle from '@/components/crew/volunteers/StatusToggle'
import ManualHoursForm from '@/components/crew/volunteers/ManualHoursForm'
import CommunicationHistory from '@/components/crew/volunteers/CommunicationHistory'
import { HelpTooltip } from '@/components/crew/HelpTooltip'
import type { VolunteerProfile, CommunicationHistoryEntry } from '@/types/volunteer'

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

type RawSeasonAttendanceRow = {
  hours_logged: number
  show_date: {
    show: {
      season_id: string | null
      season: { id: string; name: string } | null
    } | null
  } | null
}

type RawManualHoursRow = { hours: number; source_type: string }

type RawHoursLogRow = {
  id: string
  hours: number
  source_type: 'attendance' | 'manual'
  note: string | null
  logged_date: string | null
  created_at: string
  added_by: { name: string } | null
}

type RawMilestoneRow = {
  id: string
  milestone_hours: number
  milestone_label: string
  triggered_at: string
  email_sent: boolean
}

type RawCommEmailLogRow = {
  id: string
  sent_at: string
  subject: string
  body_preview: string | null
  recipient_type: string
  recipient_filter: string | null
  recipient_count: number
  reply_to: string | null
  sent_by: string | null
  admin_users: { name: string } | null
}

type RawCommHistoryRow = {
  id: string
  email_address: string
  email_log: RawCommEmailLogRow | null
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
        .eq('status', 'claimed'),
    ])

  const categories = (assignmentRows ?? [])
    .map((a) => a.volunteer_categories as unknown as { id: string; name: string } | null)
    .filter((c): c is { id: string; name: string } => !!c)

  const calls = ((callRows ?? []) as unknown as RawCallRow[])
    .map((claim) => ({
      id: claim.id,
      show_name: claim.show_dates?.shows?.name ?? '—',
      show_date: claim.show_dates?.show_date ?? '',
      role_name: claim.volunteer_roles?.role_name ?? '—',
      attendance_status: claim.attendance?.[0]?.status ?? null,
      hours_logged: claim.attendance?.[0]?.hours_logged ?? null,
    }))
    .sort((a, b) => b.show_date.localeCompare(a.show_date))

  let notes: RawNoteRow[] = []
  if (admin.role !== 'viewer') {
    const { data: noteRows } = await supabase
      .from('volunteer_notes')
      .select('id, body, created_at, admin_users(name)')
      .eq('volunteer_id', id)
      .order('created_at', { ascending: false })
    notes = (noteRows ?? []) as unknown as RawNoteRow[]
  }

  const [
    { data: seasonAttendanceRows },
    { data: manualHoursRows },
    { data: hoursLogRows },
    { data: milestoneRows },
    { data: commHistoryRaw },
  ] = await Promise.all([
    supabase
      .from('attendance')
      .select(
        `
        hours_logged,
        show_date:show_dates(
          show:shows(
            season_id,
            season:seasons(id, name)
          )
        )
        `
      )
      .eq('volunteer_id', id)
      .eq('status', 'showed'),
    supabase.from('volunteer_hours_log').select('hours, source_type').eq('volunteer_id', id).eq('source_type', 'manual'),
    supabase
      .from('volunteer_hours_log')
      .select('id, hours, source_type, note, logged_date, created_at, added_by:admin_users(name)')
      .eq('volunteer_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('milestone_log')
      .select('id, milestone_hours, milestone_label, triggered_at, email_sent')
      .eq('volunteer_id', id)
      .order('triggered_at', { ascending: true }),
    supabase
      .from('email_log_recipients')
      .select(
        `
        id,
        email_address,
        email_log (
          id,
          sent_at,
          subject,
          body_preview,
          recipient_type,
          recipient_filter,
          recipient_count,
          reply_to,
          sent_by,
          admin_users ( name )
        )
        `
      )
      .eq('volunteer_id', id),
  ])

  const seasonTotals = new Map<string, number>()
  for (const row of (seasonAttendanceRows ?? []) as unknown as RawSeasonAttendanceRow[]) {
    const seasonName = row.show_date?.show?.season?.name ?? 'Unseasoned'
    seasonTotals.set(seasonName, (seasonTotals.get(seasonName) ?? 0) + Number(row.hours_logged))
  }
  const seasonBreakdown = [...seasonTotals.entries()]
    .map(([label, hours]) => ({ label, hours: Math.round(hours * 100) / 100 }))
    .sort((a, b) => a.label.localeCompare(b.label))

  const manualTotal = Math.round(
    ((manualHoursRows ?? []) as unknown as RawManualHoursRow[]).reduce((sum, r) => sum + Number(r.hours), 0) * 100
  ) / 100

  const breakdownTotal =
    Math.round((seasonBreakdown.reduce((sum, r) => sum + r.hours, 0) + manualTotal) * 100) / 100

  const hoursLog = (hoursLogRows ?? []) as unknown as RawHoursLogRow[]
  const milestones = (milestoneRows ?? []) as unknown as RawMilestoneRow[]

  const communicationHistory: CommunicationHistoryEntry[] = (
    (commHistoryRaw ?? []) as unknown as RawCommHistoryRow[]
  )
    .filter((row) => row.email_log !== null)
    .map((row) => ({
      id: row.email_log!.id,
      sentAt: row.email_log!.sent_at,
      subject: row.email_log!.subject,
      bodyPreview: row.email_log!.body_preview || null,
      recipientType: row.email_log!.recipient_type,
      recipientFilter: row.email_log!.recipient_filter || null,
      recipientCount: row.email_log!.recipient_count,
      replyTo: row.email_log!.reply_to || null,
      sentByName: row.email_log!.admin_users?.name || null,
    }))
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

  return (
    <div>
      <Link
        href="/crew/volunteers"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel flex items-center gap-1 mb-6"
      >
        ← Back to Volunteers
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{volunteer.full_name}</h1>
          <span
            className={`text-xs font-semibold rounded px-2 py-0.5 ${
              volunteer.status === 'active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-mid-gray text-white dark:bg-dark-border dark:text-dark-text'
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
        <h2 className="text-lg font-semibold text-dark dark:text-dark-text mb-1 flex items-center gap-1.5">
          Hours
          <HelpTooltip anchor="hours" label="Total Hours" />
        </h2>
        <p className="text-2xl font-bold text-navy dark:text-steel mb-4">
          {volunteer.total_hours}
          <span className="text-base font-normal text-mid-gray dark:text-dark-muted ml-1">hours total</span>
        </p>

        {admin.role !== 'viewer' && <ManualHoursForm volunteerId={volunteer.id} />}

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-mid-gray dark:text-dark-muted uppercase tracking-wide mb-2">
            Season Breakdown
          </h3>
          {seasonBreakdown.length === 0 && manualTotal === 0 ? (
            <p className="text-mid-gray dark:text-dark-muted text-sm">No hours logged yet.</p>
          ) : (
            <div className="text-sm text-dark dark:text-dark-text divide-y divide-divider dark:divide-dark-border border border-divider dark:border-dark-border rounded-lg overflow-hidden bg-white dark:bg-dark-surface">
              {seasonBreakdown.map((row) => (
                <div key={row.label} className="flex justify-between px-4 py-2">
                  <span>{row.label}</span>
                  <span>{row.hours.toFixed(1)} hrs</span>
                </div>
              ))}
              {manualTotal > 0 && (
                <div className="flex justify-between px-4 py-2">
                  <span>Manual Entries</span>
                  <span>{manualTotal.toFixed(1)} hrs</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-2 font-semibold bg-light-navy dark:bg-dark-border/40">
                <span>Total</span>
                <span>{breakdownTotal.toFixed(1)} hrs</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-mid-gray dark:text-dark-muted uppercase tracking-wide mb-2">
            Hours Log
          </h3>
          {hoursLog.length === 0 ? (
            <p className="text-mid-gray dark:text-dark-muted text-sm">No hours logged yet.</p>
          ) : (
            <div className="border border-divider dark:border-dark-border rounded-lg overflow-x-auto bg-white dark:bg-dark-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-divider dark:border-dark-border text-left">
                    <th className="px-4 py-2 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Date</th>
                    <th className="px-4 py-2 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Hours</th>
                    <th className="px-4 py-2 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Type</th>
                    <th className="px-4 py-2 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Note</th>
                    <th className="px-4 py-2 text-mid-gray dark:text-dark-muted font-semibold uppercase text-xs">Added By</th>
                  </tr>
                </thead>
                <tbody>
                  {hoursLog.map((entry) => {
                    const dateLabel =
                      entry.source_type === 'manual' && entry.logged_date
                        ? formatWallClockCT(entry.logged_date, null, 'MMM d, yyyy')
                        : formatCT(entry.created_at, 'MMM d, yyyy')
                    const hoursValue = Number(entry.hours)
                    return (
                      <tr key={entry.id} className="border-b border-divider dark:border-dark-border last:border-0">
                        <td className="px-4 py-2 text-dark dark:text-dark-text">{dateLabel}</td>
                        <td
                          className={`px-4 py-2 ${
                            hoursValue < 0 ? 'text-mid-gray dark:text-dark-muted' : 'text-dark dark:text-dark-text'
                          }`}
                        >
                          {hoursValue >= 0 ? '+' : '−'}
                          {Math.abs(hoursValue).toFixed(1)}
                        </td>
                        <td className="px-4 py-2 text-dark dark:text-dark-text">
                          {entry.source_type === 'manual' ? 'Manual' : 'Show'}
                        </td>
                        <td className="px-4 py-2 text-dark dark:text-dark-text">{entry.note ?? '—'}</td>
                        <td className="px-4 py-2 text-dark dark:text-dark-text">{entry.added_by?.name ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-dark dark:text-dark-text mb-4 flex items-center gap-1.5">
          Milestone History
          <HelpTooltip anchor="milestones" label="Milestone History" />
        </h2>
        {milestones.length === 0 ? (
          <p className="text-mid-gray dark:text-dark-muted text-sm">No milestones yet.</p>
        ) : (
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li
                key={m.id}
                className="flex justify-between text-sm border-b border-divider dark:border-dark-border pb-2"
              >
                <span className="text-dark dark:text-dark-text font-medium">{m.milestone_label}</span>
                <span className="text-mid-gray dark:text-dark-muted">{formatCT(m.triggered_at, 'MMM d, yyyy')}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CommunicationHistory history={communicationHistory} />

      {admin.role !== 'viewer' && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-dark mb-4 flex items-center gap-1.5">
            Editor Notes
            <HelpTooltip anchor="volunteer-profile" label="Editor Notes" />
          </h2>
          <EditorNotes
            volunteerId={volunteer.id}
            notes={notes}
            isSuperAdmin={admin.role === 'super_admin'}
          />
        </section>
      )}
    </div>
  )
}
