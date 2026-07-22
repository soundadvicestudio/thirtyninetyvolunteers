import Image from 'next/image'
import Link from 'next/link'
import { getCallboardSession } from '@/lib/callboard/session'
import { getAdminClient } from '@/lib/supabase/admin'
import { getPublicShows } from '@/lib/data/shows'
import { formatWallClockCT } from '@/lib/utils/date'
import { SHOW_TYPE_LABEL, SHOW_TYPE_BADGE } from '@/lib/utils/showDisplay'
import CallboardLookupForm from '@/components/callboard/CallboardLookupForm'
import VolunteerCard from '@/components/callboard/VolunteerCard'
import type { PublicShow } from '@/types/show-public'
import type {
  CallboardMilestone,
  CallboardCallHistoryRow,
  CallboardActiveClaim,
  CallboardManualHoursEntry,
} from '@/types/callboard'

type StandingOpportunityRow = {
  id: string
  title: string
  description: string | null
  claim_type: 'eoi' | 'slot_claim'
  slot_cap_enabled: boolean
  slot_cap: number | null
}

const CLAIM_TYPE_LABEL: Record<'eoi' | 'slot_claim', string> = {
  eoi: 'Expression of Interest',
  slot_claim: 'Slot Claim',
}

async function getActiveOpportunities(): Promise<StandingOpportunityRow[]> {
  const client = getAdminClient()
  const { data } = await client
    .from('standing_opportunities')
    .select('id, title, description, claim_type, slot_cap_enabled, slot_cap, status')
    .eq('status', 'active')
    .order('created_at', { ascending: true })
  return (data ?? []) as StandingOpportunityRow[]
}

type RawActiveClaimRow = {
  id: string
  volunteer_role_id: string
  show_date_id: string
  volunteer_role: {
    role_name: string
    show_date: { show_date: string; show_id: string } | null
  } | null
}

// Two parameterized queries (volunteer_id, email) merged in JS rather than a
// raw .or() filter string — same convention as lib/actions/claims.ts.
async function getActiveClaims(volunteerId: string, email: string): Promise<CallboardActiveClaim[]> {
  const client = getAdminClient()
  const selectCols = `
    id, volunteer_role_id, show_date_id,
    volunteer_role:volunteer_roles(
      role_name,
      show_date:show_dates(show_date, show_id)
    )
  `

  const [{ data: byId }, { data: byEmail }] = await Promise.all([
    client.from('slot_claims').select(selectCols).eq('volunteer_id', volunteerId).eq('status', 'claimed'),
    client.from('slot_claims').select(selectCols).ilike('volunteer_email', email).eq('status', 'claimed'),
  ])

  const rows = [...(byId ?? []), ...(byEmail ?? [])] as unknown as RawActiveClaimRow[]
  const seen = new Set<string>()
  const claims: CallboardActiveClaim[] = []
  for (const row of rows) {
    if (seen.has(row.id) || !row.volunteer_role?.show_date) continue
    seen.add(row.id)
    claims.push({
      id: row.id,
      volunteer_role_id: row.volunteer_role_id,
      show_date_id: row.show_date_id,
      role_name: row.volunteer_role.role_name,
      show_date: row.volunteer_role.show_date.show_date,
      show_id: row.volunteer_role.show_date.show_id,
    })
  }
  return claims
}

type RawCallHistoryRow = {
  id: string
  claimed_at: string
  status: 'claimed' | 'cancelled'
  volunteer_role: {
    role_name: string
    show_date: {
      show_date: string
      show: { id: string; name: string } | null
    } | null
  } | null
  attendance: { status: 'showed' | 'no_show' | 'excused'; hours_logged: number }[] | null
}

async function getCallHistory(volunteerId: string, email: string): Promise<CallboardCallHistoryRow[]> {
  const client = getAdminClient()
  const selectCols = `
    id, claimed_at, status,
    volunteer_role:volunteer_roles(
      role_name,
      show_date:show_dates(
        show_date,
        show:shows(id, name)
      )
    ),
    attendance(status, hours_logged)
  `

  const [{ data: byId }, { data: byEmail }] = await Promise.all([
    client
      .from('slot_claims')
      .select(selectCols)
      .eq('volunteer_id', volunteerId)
      .in('status', ['claimed', 'cancelled'])
      .order('claimed_at', { ascending: false })
      .limit(50),
    client
      .from('slot_claims')
      .select(selectCols)
      .ilike('volunteer_email', email)
      .in('status', ['claimed', 'cancelled'])
      .order('claimed_at', { ascending: false })
      .limit(50),
  ])

  const rows = [...(byId ?? []), ...(byEmail ?? [])] as unknown as RawCallHistoryRow[]
  const seen = new Set<string>()
  const history: CallboardCallHistoryRow[] = []
  for (const row of rows) {
    if (seen.has(row.id) || !row.volunteer_role?.show_date) continue
    seen.add(row.id)
    const attendance = row.attendance?.[0] ?? null
    history.push({
      id: row.id,
      claimed_at: row.claimed_at,
      status: row.status,
      role_name: row.volunteer_role.role_name,
      show_id: row.volunteer_role.show_date.show?.id ?? null,
      show_name: row.volunteer_role.show_date.show?.name ?? 'Unknown Show',
      show_date: row.volunteer_role.show_date.show_date,
      attendance_status: attendance?.status ?? null,
      hours_logged: attendance?.status === 'showed' ? attendance.hours_logged : null,
    })
  }

  history.sort((a, b) => (a.show_date < b.show_date ? 1 : -1))
  return history.slice(0, 50)
}

type SignedUpEntry = { role_name: string; show_date: string }

function ShowCard({ show, signedUpMap }: { show: PublicShow; signedUpMap: Map<string, SignedUpEntry[]> }) {
  const signedUp = signedUpMap.get(show.id) ?? []

  return (
    <div className="rounded-xl border border-divider bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <h3 className="text-navy font-bold text-lg">{show.name}</h3>
        <span
          className={`inline-block text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 ${SHOW_TYPE_BADGE[show.show_type]}`}
        >
          {SHOW_TYPE_LABEL[show.show_type]}
        </span>
      </div>

      {show.description && <p className="text-mid-gray text-sm mb-3">{show.description}</p>}

      {signedUp.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {signedUp.map((s, i) => (
            <span key={i} className="inline-block text-xs font-semibold text-navy bg-light-navy rounded-full px-3 py-1">
              You&apos;re signed up for {s.role_name} on {formatWallClockCT(s.show_date, null, 'MMM d')}
            </span>
          ))}
        </div>
      )}

      <ul className="space-y-1 mb-4">
        {show.dates.map((date) => {
          const openRoles = date.roles.filter((r) => !r.is_full)
          const allFull = date.roles.length > 0 && openRoles.length === 0
          return (
            <li key={date.id} className="text-sm">
              <span className="font-semibold text-dark">
                {formatWallClockCT(date.show_date, date.show_time, 'MMM d, yyyy · h:mm a')}
              </span>
              {allFull ? (
                <span className="ml-2 text-mid-gray">Full</span>
              ) : (
                openRoles.length > 0 && (
                  <span className="ml-2 text-dark">
                    {openRoles.map((r) => `${r.role_name} (${r.slots_available - r.claimed_count} open)`).join(', ')}
                  </span>
                )
              )}
            </li>
          )
        })}
      </ul>

      <Link
        href={`/shows/${show.id}`}
        className="inline-block w-full sm:w-auto text-center bg-orange text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Volunteer
      </Link>
    </div>
  )
}

function OpportunityCard({ opportunity }: { opportunity: StandingOpportunityRow }) {
  const truncated =
    opportunity.description && opportunity.description.length > 160
      ? opportunity.description.slice(0, 160).trimEnd() + '…'
      : opportunity.description

  return (
    <div className="rounded-xl border border-divider bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <h3 className="text-navy font-bold text-lg">{opportunity.title}</h3>
        <span className="inline-block text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 bg-light-navy text-navy">
          {CLAIM_TYPE_LABEL[opportunity.claim_type]}
        </span>
      </div>

      {truncated && <p className="text-mid-gray text-sm mb-4">{truncated}</p>}

      <Link
        href={`/opportunities/${opportunity.id}`}
        className="inline-block w-full sm:w-auto text-center bg-navy text-white font-semibold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Learn More
      </Link>
    </div>
  )
}

export default async function CallboardPage() {
  const volunteer = await getCallboardSession()

  const [shows, opportunities] = await Promise.all([getPublicShows(), getActiveOpportunities()])

  let categories: string[] = []
  let milestones: CallboardMilestone[] = []
  let callHistory: CallboardCallHistoryRow[] = []
  let manualHoursEntries: CallboardManualHoursEntry[] = []
  const signedUpMap = new Map<string, SignedUpEntry[]>()

  if (volunteer) {
    const client = getAdminClient()
    const [{ data: categoryRows }, { data: milestoneRows }, { data: manualHoursRows }, activeClaims, history] =
      await Promise.all([
        client.from('volunteer_category_assignments').select('volunteer_categories(id, name)').eq('volunteer_id', volunteer.id),
        client
          .from('milestone_log')
          .select('id, milestone_hours, milestone_label, triggered_at')
          .eq('volunteer_id', volunteer.id)
          .order('triggered_at', { ascending: true }),
        client
          .from('volunteer_hours_log')
          .select('hours, note, logged_date')
          .eq('volunteer_id', volunteer.id)
          .eq('source_type', 'manual')
          .order('logged_date', { ascending: false }),
        getActiveClaims(volunteer.id, volunteer.email),
        getCallHistory(volunteer.id, volunteer.email),
      ])

    categories = ((categoryRows ?? []) as unknown as { volunteer_categories: { id: string; name: string } | null }[])
      .map((r) => r.volunteer_categories?.name)
      .filter((n): n is string => !!n)

    milestones = (milestoneRows ?? []) as CallboardMilestone[]
    callHistory = history
    manualHoursEntries = manualHoursRows ?? []

    for (const claim of activeClaims) {
      const list = signedUpMap.get(claim.show_id) ?? []
      list.push({ role_name: claim.role_name, show_date: claim.show_date })
      signedUpMap.set(claim.show_id, list)
    }
  }

  const hasOpportunities = shows.length > 0 || opportunities.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-white border-b border-divider">
        <div className="max-w-5xl mx-auto py-6 px-6 text-center">
          <Image src="/logo.png" alt="30 By Ninety Theatre" width={112} height={64} className="mx-auto" />
          <span className="block w-16 h-0.5 bg-orange mx-auto mt-2" />
          <h1 className="text-navy font-bold text-2xl md:text-3xl mt-4">Volunteer Call Board</h1>
        </div>
      </header>

      <main className="flex-1 bg-light-navy py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col-reverse gap-8 md:flex-row md:items-start">
          <section className="flex-1 space-y-8 min-w-0">
            {!hasOpportunities && (
              <div className="rounded-xl border border-divider bg-white p-8 text-center">
                <p className="text-dark text-lg font-semibold">No upcoming opportunities right now — check back soon.</p>
              </div>
            )}

            {shows.length > 0 && (
              <div>
                <h2 className="text-navy font-bold text-xl mb-4">Upcoming Shows</h2>
                <div className="space-y-4">
                  {shows.map((show) => (
                    <ShowCard key={show.id} show={show} signedUpMap={signedUpMap} />
                  ))}
                </div>
              </div>
            )}

            {opportunities.length > 0 && (
              <div>
                <h2 className="text-navy font-bold text-xl mb-4">Volunteer Opportunities</h2>
                <div className="space-y-4">
                  {opportunities.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                  ))}
                </div>
              </div>
            )}
          </section>

          <aside className="w-full md:w-96 shrink-0">
            {volunteer ? (
              <VolunteerCard
                volunteer={volunteer}
                categories={categories}
                milestones={milestones}
                callHistory={callHistory}
                manualHoursEntries={manualHoursEntries}
              />
            ) : (
              <CallboardLookupForm />
            )}
          </aside>
        </div>
      </main>

      <footer className="w-full bg-footer-gray border-t border-divider py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-mid-gray text-xs">© 30 By Ninety Theatre</p>
          <Link href="/crew/login" className="text-mid-gray text-xs hover:text-navy transition-colors">
            Production Crew
          </Link>
        </div>
      </footer>
    </div>
  )
}
