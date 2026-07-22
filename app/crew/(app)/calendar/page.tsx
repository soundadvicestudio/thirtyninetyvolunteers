import { redirect } from 'next/navigation'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getMonthGridDays, getWeekGridDays } from '@/lib/utils/calendar-availability'
import CalendarShell from '@/components/crew/calendar/CalendarShell'
import type {
  CalendarEvent,
  CalendarEventType,
  CalendarEventStatus,
  CalendarEventSource,
  ShowDateBuffer,
} from '@/types/calendar'
import type { Location } from '@/types/show'

const CT = 'America/Chicago'

type RawCalendarEventRow = {
  id: string
  title: string
  event_type: CalendarEventType
  custom_type_label: string | null
  location_id: string | null
  start_time: string
  end_time: string
  description: string | null
  requirements: string | null
  status: CalendarEventStatus
  source: CalendarEventSource
  source_show_date_id: string | null
  rehearsal_batch_id: string | null
  submitted_by: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
  location: { id: string; name: string; color: string } | null
  contacts:
    | { id: string; calendar_event_id: string; name: string; phone: string; sort_order: number; created_at: string }[]
    | null
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string
    date?: string
    locations?: string
    types?: string
    season?: string
  }>
}) {
  const adminUser = await getAdminUser()
  if (!adminUser) {
    redirect('/crew/login')
  }

  const params = await searchParams
  const view = params.view ?? 'month'
  const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')
  const date = params.date ?? todayCT
  const locationsFilter = params.locations ? params.locations.split(',').filter(Boolean) : []
  const typesFilter = params.types ? params.types.split(',').filter(Boolean) : []
  const season = params.season ?? null

  // Fetch date range in UTC, computed per view. Filters (location/type)
  // are applied client-side in CalendarShell — the server fetch always
  // pulls every event in range regardless of active filters.
  let rangeStartStr: string
  let rangeEndStr: string
  if (view === 'week') {
    const gridDays = getWeekGridDays(date)
    rangeStartStr = gridDays[0]
    rangeEndStr = gridDays[gridDays.length - 1]
  } else if (view === 'agenda') {
    rangeStartStr = date
    const [y, m, d] = date.split('-').map(Number)
    rangeEndStr = new Date(Date.UTC(y, m - 1, d + 90)).toISOString().slice(0, 10)
  } else {
    const gridDays = getMonthGridDays(date)
    rangeStartStr = gridDays[0]
    rangeEndStr = gridDays[gridDays.length - 1]
  }

  const rangeStart = fromZonedTime(`${rangeStartStr} 00:00:00`, CT)
  const rangeEnd = fromZonedTime(`${rangeEndStr} 23:59:59`, CT)

  const supabase = await getServerClient()

  // Season filter requires a join through shows (calendar_events carries no
  // season_id directly) — resolved before the main event query so the
  // literal show_date_id list can be inlined into an .or() filter. Manual
  // events always show regardless of season (Item 4, 30BN-ADMIN.25).
  let seasonShowDateIds: string[] | null = null
  if (season) {
    const { data: seasonShows } = await supabase.from('shows').select('id').eq('season_id', season)
    const seasonShowIds = (seasonShows ?? []).map((s) => s.id as string)

    if (seasonShowIds.length > 0) {
      const { data: seasonShowDates } = await supabase
        .from('show_dates')
        .select('id')
        .in('show_id', seasonShowIds)
      seasonShowDateIds = (seasonShowDates ?? []).map((d) => d.id as string)
    } else {
      seasonShowDateIds = []
    }
  }

  let eventsQuery = supabase
    .from('calendar_events')
    .select(
      `
      id, title, event_type, custom_type_label,
      location_id, start_time, end_time,
      description, requirements, status, source,
      source_show_date_id, rehearsal_batch_id,
      submitted_by, approved_by, created_at,
      updated_at,
      location:locations ( id, name, color ),
      contacts:calendar_event_contacts ( id, calendar_event_id, name, phone, sort_order, created_at )
      `
    )
    .gte('start_time', rangeStart.toISOString())
    .lte('start_time', rangeEnd.toISOString())
    .order('start_time', { ascending: true })

  eventsQuery =
    adminUser.role !== 'super_admin'
      ? eventsQuery.eq('status', 'approved')
      : eventsQuery.in('status', ['approved', 'pending'])

  if (season) {
    eventsQuery =
      seasonShowDateIds && seasonShowDateIds.length > 0
        ? eventsQuery.or(
            `source.eq.manual,and(source.eq.show,source_show_date_id.in.(${seasonShowDateIds.join(',')}))`
          )
        : eventsQuery.eq('source', 'manual')
  }

  const [{ data: eventRows }, { data: locationRows }, { data: seasonRows }] = await Promise.all([
    eventsQuery,
    supabase
      .from('locations')
      .select('id, name, color, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase.from('seasons').select('id, name').order('created_at', { ascending: false }),
  ])

  const events: CalendarEvent[] = ((eventRows ?? []) as unknown as RawCalendarEventRow[]).map((e) => ({
    id: e.id,
    title: e.title,
    event_type: e.event_type,
    custom_type_label: e.custom_type_label,
    location_id: e.location_id,
    location: e.location,
    start_time: e.start_time,
    end_time: e.end_time,
    description: e.description,
    requirements: e.requirements,
    status: e.status,
    source: e.source,
    source_show_date_id: e.source_show_date_id,
    rehearsal_batch_id: e.rehearsal_batch_id,
    submitted_by: e.submitted_by,
    submitted_by_admin: null,
    approved_by: e.approved_by,
    created_at: e.created_at,
    updated_at: e.updated_at,
    contacts: (e.contacts ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
  }))

  // Buffer rows are only needed for the week view's room-booking grid —
  // skipped for month/agenda to keep those fetches lean.
  let bufferData: ShowDateBuffer[] = []
  if (view === 'week') {
    const showSourceIds = events
      .filter((e) => e.source === 'show' && e.source_show_date_id)
      .map((e) => e.source_show_date_id as string)
    if (showSourceIds.length > 0) {
      const { data: buffers } = await supabase
        .from('show_date_buffer')
        .select('*')
        .in('show_date_id', showSourceIds)
      bufferData = (buffers ?? []) as ShowDateBuffer[]
    }
  }

  const locations = (locationRows ?? []) as unknown as Location[]

  // Pending count is only meaningful (and only visible) to Super Admins,
  // who are the sole role that can see/act on the approval queue.
  let pendingCount = 0
  if (adminUser.role === 'super_admin') {
    const { count } = await supabase
      .from('calendar_events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    pendingCount = count ?? 0
  }

  return (
    <CalendarShell
      events={events}
      locations={locations}
      seasons={seasonRows ?? []}
      bufferData={bufferData}
      adminRole={adminUser.role}
      calendarEditor={adminUser.calendar_editor}
      subscriptionToken={adminUser.calendar_subscription_token}
      pendingCount={pendingCount}
      initialView={view}
      initialDate={date}
      initialLocationFilter={locationsFilter}
      initialTypeFilter={typesFilter}
      initialSeason={season}
    />
  )
}
