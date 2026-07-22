import Image from 'next/image'
import Link from 'next/link'
import { getPublicShows } from '@/lib/data/shows'
import { formatWallClockCT } from '@/lib/utils/date'
import type { PublicShow } from '@/types/show-public'

function dateRangeLabel(show: PublicShow): string | null {
  if (show.dates.length === 0) return null
  const first = show.dates[0]
  const last = show.dates[show.dates.length - 1]
  const firstLabel = formatWallClockCT(first.show_date, first.show_time, 'MMM d, yyyy')
  if (show.dates.length === 1) return firstLabel
  const lastLabel = formatWallClockCT(last.show_date, last.show_time, 'MMM d, yyyy')
  return `${firstLabel} – ${lastLabel}`
}

function openRolesSummary(show: PublicShow): { role_name: string; open: number }[] {
  const openByRole = new Map<string, number>()
  for (const date of show.dates) {
    for (const role of date.roles) {
      const remaining = role.slots_available - role.claimed_count
      if (remaining > 0) {
        openByRole.set(role.role_name, (openByRole.get(role.role_name) ?? 0) + remaining)
      }
    }
  }
  return [...openByRole.entries()].map(([role_name, open]) => ({ role_name, open }))
}

function ShowCard({ show }: { show: PublicShow }) {
  const dateRange = dateRangeLabel(show)
  const openRoles = openRolesSummary(show)

  return (
    <div className="rounded-xl border border-divider bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <h2 className="text-navy font-bold text-xl">{show.name}</h2>
        <span
          className="inline-block text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 text-white"
          style={{ backgroundColor: show.location?.color ?? '#555555' }}
        >
          {show.location?.name ?? 'Unknown Location'}
        </span>
      </div>

      {dateRange && <p className="text-mid-gray text-sm mb-4">{dateRange}</p>}

      {openRoles.length > 0 && (
        <ul className="space-y-1 mb-6">
          {openRoles.map((role) => (
            <li key={role.role_name} className="text-dark text-sm">
              <span className="font-semibold">{role.role_name}</span> — {role.open} open
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/shows/${show.id}`}
        className="inline-block w-full sm:w-auto text-center bg-orange text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Volunteer for This Show
      </Link>
    </div>
  )
}

export default async function ShowsListingPage() {
  const shows = await getPublicShows()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-white border-b border-divider">
        <div className="max-w-2xl mx-auto py-6 px-6 text-center">
          <Image src="/logo.png" alt="30 By Ninety Theatre" width={112} height={64} className="mx-auto" />
          <span className="block w-16 h-0.5 bg-orange mx-auto mt-2" />
        </div>
      </header>

      <section className="w-full bg-light-navy py-10 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-navy font-bold text-2xl md:text-3xl">Volunteer Opportunities</h1>
          <p className="text-dark text-base leading-relaxed max-w-xl mx-auto mt-4">
            Pick a show below and claim your spot — every role helps make the production happen.
          </p>
        </div>
      </section>

      <main className="flex-1 bg-white py-10 px-6">
        <div className="max-w-2xl mx-auto">
          {shows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-dark text-lg font-semibold mb-2">
                No volunteer opportunities are currently open — check back soon!
              </p>
              <Link href="/" className="text-navy font-semibold underline">
                ← Back to Home
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="w-full bg-footer-gray border-t border-divider py-6 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-mid-gray text-xs">© 30 By Ninety Theatre</p>
          <Link href="/crew/login" className="text-mid-gray text-xs hover:text-navy transition-colors">
            Production Crew
          </Link>
        </div>
      </footer>
    </div>
  )
}
