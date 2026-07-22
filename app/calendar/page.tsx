import Image from 'next/image'
import Link from 'next/link'
import { formatInTimeZone } from 'date-fns-tz'
import { getAdminClient } from '@/lib/supabase/admin'
import { getMonthGridDays } from '@/lib/utils/calendar-availability'
import PublicCalendarGrid from '@/components/calendar/PublicCalendarGrid'

const CT = 'America/Chicago'

type RawEventRow = {
  id: string
  title: string
  start_time: string
  end_time: string
  source_show_date_id: string | null
  location: { name: string; color: string } | null
}

function addMonthsToMonthStr(monthStr: string, months: number): string {
  const [y, m] = monthStr.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + months, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export default async function PublicCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const todayMonthCT = formatInTimeZone(new Date(), CT, 'yyyy-MM')
  const monthStr = params.month && /^\d{4}-\d{2}$/.test(params.month) ? params.month : todayMonthCT
  const [year, month] = monthStr.split('-').map(Number)

  const gridDays = getMonthGridDays(`${monthStr}-01`)
  const rangeStartStr = gridDays[0]
  const rangeEndStr = gridDays[gridDays.length - 1]

  const supabase = getAdminClient()

  const { data: eventRows } = await supabase
    .from('calendar_events')
    .select(
      `
      id, title, start_time, end_time, source_show_date_id,
      location:locations ( name, color )
      `
    )
    .eq('event_type', 'performance')
    .eq('status', 'approved')
    .gte('start_time', `${rangeStartStr}T00:00:00Z`)
    .lte('start_time', `${rangeEndStr}T23:59:59Z`)
    .order('start_time', { ascending: true })

  const events = (eventRows ?? []) as unknown as RawEventRow[]
  const showDateIds = events.map((e) => e.source_show_date_id).filter((id): id is string => !!id)

  // Resolve show_id per show_date_id (needed for the /shows/[id] link) via a
  // separate lookup rather than a PostgREST embed, keeping the FK path
  // explicit and avoiding embed-alias ambiguity.
  const showIdByShowDateId = new Map<string, string>()
  if (showDateIds.length > 0) {
    const { data: showDateRows } = await supabase
      .from('show_dates')
      .select('id, show_id')
      .in('id', showDateIds)
    for (const row of showDateRows ?? []) {
      showIdByShowDateId.set(row.id as string, row.show_id as string)
    }
  }

  // Needs-volunteers: any role on the show date with slots_available >
  // claimed count (status = 'claimed').
  const needsVolunteersShowDateIds = new Set<string>()
  if (showDateIds.length > 0) {
    const { data: roles } = await supabase
      .from('volunteer_roles')
      .select('id, show_date_id, slots_available, slot_claims!inner ( id, status )')
      .in('show_date_id', showDateIds)

    type RoleRow = {
      show_date_id: string
      slots_available: number
      slot_claims: { id: string; status: string }[]
    }
    for (const role of (roles ?? []) as unknown as RoleRow[]) {
      const claimedCount = role.slot_claims.filter((c) => c.status === 'claimed').length
      if (role.slots_available > claimedCount) {
        needsVolunteersShowDateIds.add(role.show_date_id)
      }
    }
  }

  const gridEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start_time: e.start_time,
    end_time: e.end_time,
    show_id: e.source_show_date_id ? (showIdByShowDateId.get(e.source_show_date_id) ?? null) : null,
    needsVolunteers: e.source_show_date_id ? needsVolunteersShowDateIds.has(e.source_show_date_id) : false,
    location: e.location,
  }))

  const prevMonthUrl = `/calendar?month=${addMonthsToMonthStr(monthStr, -1)}`
  const nextMonthUrl = `/calendar?month=${addMonthsToMonthStr(monthStr, 1)}`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-white border-b border-divider">
        <div className="max-w-3xl mx-auto py-6 px-6 text-center">
          <Image src="/logo.png" alt="30 By Ninety Theatre" width={112} height={64} className="mx-auto" />
          <span className="block w-16 h-0.5 bg-orange mx-auto mt-2" />
          <h1 className="text-navy font-bold text-2xl md:text-3xl mt-4">Events Calendar</h1>
        </div>
      </header>

      <main className="flex-1 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <PublicCalendarGrid
            events={gridEvents.filter(
              (e): e is typeof e & { show_id: string } => e.show_id !== null
            )}
            focusedMonth={{ year, month }}
            prevMonthUrl={prevMonthUrl}
            nextMonthUrl={nextMonthUrl}
          />
        </div>
      </main>

      <footer className="w-full bg-footer-gray border-t border-divider py-6 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-mid-gray text-xs">© 30 By Ninety Theatre</p>
          <Link href="/crew/login" className="text-mid-gray text-xs hover:text-navy transition-colors">
            Production Crew
          </Link>
        </div>
      </footer>
    </div>
  )
}
