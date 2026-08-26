import Link from 'next/link'
import { redirect } from 'next/navigation'
import { formatInTimeZone } from 'date-fns-tz'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'
import { getOrgTimezone } from '@/lib/utils/org-timezone'
import { getPublicCalendarEvents } from '@/lib/data/publicCalendar'
import PublicCalendarGrid from '@/components/calendar/PublicCalendarGrid'
import PublicHeader from '@/components/public/PublicHeader'

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
  const supabase = getAdminClient()
  const tz = await getOrgTimezone(supabase)

  const todayMonthCT = formatInTimeZone(new Date(), tz, 'yyyy-MM')
  const monthStr = params.month && /^\d{4}-\d{2}$/.test(params.month) ? params.month : todayMonthCT
  const [year, month] = monthStr.split('-').map(Number)

  const flags = await getFeatureFlags(supabase)
  if (!flags.calendar) redirect('/')

  const org = await resolveOrgIdentity()

  const gridEvents = await getPublicCalendarEvents(supabase, year, month, tz)

  const prevMonthUrl = `/calendar?month=${addMonthsToMonthStr(monthStr, -1)}`
  const nextMonthUrl = `/calendar?month=${addMonthsToMonthStr(monthStr, 1)}`

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <div className="w-full bg-white border-b border-divider">
        <div className="max-w-3xl mx-auto pb-6 px-6 text-center">
          <h1 className="text-brand-primary font-bold text-2xl md:text-3xl">Events Calendar</h1>
        </div>
      </div>

      <main className="flex-1 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <PublicCalendarGrid
            events={gridEvents}
            focusedMonth={{ year, month }}
            prevMonthUrl={prevMonthUrl}
            nextMonthUrl={nextMonthUrl}
          />
        </div>
      </main>

      <footer className="w-full bg-footer-gray border-t border-divider py-6 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-mid-gray text-xs">© {org.org_name}</p>
          <Link href="/crew/login" className="text-mid-gray text-xs hover:text-brand-primary transition-colors">
            Production Crew
          </Link>
        </div>
      </footer>
    </div>
  )
}
