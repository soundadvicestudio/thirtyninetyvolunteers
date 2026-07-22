import { Users, CalendarDays, ClipboardList, UserPlus } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { getServerClient } from '@/lib/supabase/server'
import { getActiveVolunteerCount } from '@/lib/volunteers/list'
import { HelpTooltip } from '@/components/crew/HelpTooltip'

const CT = 'America/Chicago'

type RoleStaffing = {
  slots_available: number
  slot_claims: { status: string }[] | null
}

async function getUpcomingShowsThisMonth(
  supabase: Awaited<ReturnType<typeof getServerClient>>
): Promise<number> {
  // "This month" is anchored to CT, not server UTC — a naive `new Date()`
  // month boundary would be wrong near a month rollover for part of the
  // day (R23 / 10.1 DST-aware pattern). show_date is a bare date column
  // with no time zone of its own, so once we know the correct CT calendar
  // month, plain 'YYYY-MM-DD' string bounds are sufficient — no UTC
  // instant conversion needed (unlike timestamptz columns).
  const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')
  const [year, month] = todayCT.split('-').map(Number)
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data } = await supabase
    .from('show_dates')
    .select('show_id, shows!inner(status)')
    .eq('shows.status', 'live')
    .gte('show_date', monthStart)
    .lte('show_date', monthEnd)

  const distinctShowIds = new Set((data ?? []).map((row) => row.show_id as string))
  return distinctShowIds.size
}

async function getVolunteersNeeded(
  supabase: Awaited<ReturnType<typeof getServerClient>>
): Promise<number> {
  const { data } = await supabase
    .from('shows')
    .select(
      `
      id,
      show_dates (
        id,
        volunteer_roles ( slots_available, slot_claims ( status ) )
      )
      `
    )
    .eq('status', 'live')

  type RawShow = {
    show_dates: { volunteer_roles: RoleStaffing[] | null }[] | null
  }

  let openSlots = 0
  for (const show of (data ?? []) as unknown as RawShow[]) {
    for (const date of show.show_dates ?? []) {
      for (const role of date.volunteer_roles ?? []) {
        const claimed = (role.slot_claims ?? []).filter((c) => c.status === 'claimed').length
        openSlots += Math.max(0, role.slots_available - claimed)
      }
    }
  }

  return openSlots
}

async function getRecentSignups(
  supabase: Awaited<ReturnType<typeof getServerClient>>
): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('volunteers')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)
  return count ?? 0
}

function StatTile({
  icon: Icon,
  value,
  label,
  helpAnchor,
}: {
  icon: typeof Users
  value: number
  label: string
  helpAnchor?: string
}) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-5 flex items-center gap-4">
      <div className="shrink-0 rounded-full bg-light-navy dark:bg-dark-nav p-2.5">
        <Icon className="w-5 h-5 text-navy dark:text-steel" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-dark dark:text-dark-text leading-tight">{value}</p>
        <p className="text-xs text-mid-gray dark:text-dark-muted flex items-center gap-1.5">
          {label}
          {helpAnchor && <HelpTooltip anchor={helpAnchor} label={label} />}
        </p>
      </div>
    </div>
  )
}

export default async function QuickStats() {
  const supabase = await getServerClient()

  const [activeVolunteers, upcomingShows, volunteersNeeded, recentSignups] = await Promise.all([
    getActiveVolunteerCount(supabase),
    getUpcomingShowsThisMonth(supabase),
    getVolunteersNeeded(supabase),
    getRecentSignups(supabase),
  ])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatTile icon={Users} value={activeVolunteers} label="Total Active Volunteers" />
      <StatTile icon={CalendarDays} value={upcomingShows} label="Upcoming Shows This Month" />
      <StatTile
        icon={ClipboardList}
        value={volunteersNeeded}
        label="Volunteers Needed"
        helpAnchor="show-volunteers"
      />
      <StatTile icon={UserPlus} value={recentSignups} label="New Volunteers (7 Days)" />
    </div>
  )
}
