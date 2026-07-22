import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { formatCT } from '@/lib/utils/date'
import ActivityFeed from '@/components/crew/dashboard/ActivityFeed'
import AddToHomeScreenCard from '@/components/crew/AddToHomeScreenCard'
import QuickStats from '@/components/crew/dashboard/QuickStats'
import SeasonAtAGlance from '@/components/crew/dashboard/SeasonAtAGlance'
import SeasonSelector from '@/components/crew/dashboard/SeasonSelector'
import PendingHoursCard, { type PendingHoursRow } from '@/components/crew/dashboard/PendingHoursCard'
import PendingMilestonesCard, {
  type PendingMilestoneRow,
} from '@/components/crew/dashboard/PendingMilestonesCard'
import type { ActivityEvent } from '@/lib/actions/dashboard'

type RawPendingHoursRow = {
  id: string
  hours_logged: number
  volunteer_id: string | null
  show_id: string
  show_date_id: string
  volunteer: { id: string; full_name: string } | null
  show_date: {
    show_date: string
    show_id: string
    show: { id: string; name: string; default_hours: number | null } | null
  } | null
  slot_claim: { volunteer_role: { role_name: string } | null } | null
}

type RawPendingMilestoneRow = {
  id: string
  milestone_hours: number
  milestone_label: string
  triggered_at: string
  volunteer: { id: string; full_name: string } | null
}

export default async function DashboardPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()

  // All five queries below are mutually independent — none depends on
  // another's result (the two role-gated ones only need admin.role, already
  // available) — so they run in a single Promise.all instead of up to four
  // sequential await stages.
  const [
    { data: events },
    { data: pinnedSetting },
    { data: seasons },
    { data: pendingMilestones },
    { data: pendingRows },
  ] = await Promise.all([
    supabase.rpc('get_activity_feed', { p_limit: 10, p_offset: 0 }),
    supabase.from('app_settings').select('value').eq('key', 'dashboard_season_id').maybeSingle(),
    supabase
      .from('seasons')
      .select('id, name')
      .order('start_date', { ascending: false, nullsFirst: false }),
    admin.role !== 'viewer'
      ? supabase
          .from('milestone_log')
          .select(
            `
            id, milestone_hours, milestone_label, triggered_at,
            volunteer:volunteers(id, full_name)
            `
          )
          .eq('editor_acknowledged', false)
          .order('triggered_at', { ascending: false })
      : Promise.resolve({ data: [] as RawPendingMilestoneRow[] }),
    admin.role !== 'viewer'
      ? supabase
          .from('attendance')
          .select(
            `
            id, hours_logged, volunteer_id, show_id, show_date_id,
            volunteer:volunteers(id, full_name),
            show_date:show_dates(show_date, show_id, show:shows(id, name, default_hours)),
            slot_claim:slot_claims(volunteer_role:volunteer_roles(role_name))
            `
          )
          .eq('status', 'showed')
          .eq('hours_confirmed', false)
          .order('show_date_id', { ascending: false })
      : Promise.resolve({ data: [] as RawPendingHoursRow[] }),
  ])

  const pinnedSeasonId = pinnedSetting?.value ? pinnedSetting.value : null
  const seasonList = seasons ?? []
  const pinnedSeasonName = pinnedSeasonId
    ? (seasonList.find((s) => s.id === pinnedSeasonId)?.name ?? null)
    : null

  const pendingMilestoneRows: PendingMilestoneRow[] = (
    (pendingMilestones ?? []) as unknown as RawPendingMilestoneRow[]
  ).map((row) => ({
    id: row.id,
    milestoneLabel: row.milestone_label,
    triggeredAt: row.triggered_at,
    volunteerId: row.volunteer?.id ?? null,
    volunteerName: row.volunteer?.full_name ?? 'Unknown Volunteer',
  }))

  const todayCT = formatCT(new Date(), 'yyyy-MM-dd')
  const pendingHoursRows: PendingHoursRow[] = (
    (pendingRows ?? []) as unknown as RawPendingHoursRow[]
  )
    .filter((row) => row.show_date && row.show_date.show_date < todayCT)
    .map((row) => ({
      id: row.id,
      hoursLogged: Number(row.hours_logged),
      volunteerId: row.volunteer_id,
      volunteerName: row.volunteer?.full_name ?? 'Unknown Volunteer',
      roleName: row.slot_claim?.volunteer_role?.role_name ?? 'Role',
      showId: row.show_date?.show_id ?? row.show_id,
      showName: row.show_date?.show?.name ?? 'Unknown Show',
      showDate: row.show_date?.show_date ?? '',
    }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Welcome to Production Crew</h1>

      <QuickStats />

      <SeasonAtAGlance
        seasonId={pinnedSeasonId}
        seasonName={pinnedSeasonName}
        selectorSlot={
          <SeasonSelector
            seasons={seasonList}
            currentSeasonId={pinnedSeasonId}
            adminRole={admin.role}
          />
        }
      />

      <PendingMilestonesCard rows={pendingMilestoneRows} />

      <PendingHoursCard rows={pendingHoursRows} />

      <AddToHomeScreenCard />

      <ActivityFeed
        initialEvents={(events ?? []) as ActivityEvent[]}
        activityClearedAt={admin.activity_cleared_at}
      />
    </div>
  )
}
