import Image from 'next/image'
import Link from 'next/link'
import { getPublicShow } from '@/lib/data/shows'
import ShowDatePicker from './ShowDatePicker'

function PublicHeader() {
  return (
    <header className="w-full bg-white border-b border-divider">
      <div className="max-w-2xl mx-auto py-6 px-6 text-center">
        <Image src="/logo.png" alt="30 By Ninety Theatre" width={112} height={64} className="mx-auto" />
        <span className="block w-16 h-0.5 bg-orange mx-auto mt-2" />
      </div>
    </header>
  )
}

function Unavailable() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-navy font-bold text-xl mb-3">This show is no longer accepting volunteers</h1>
          <p className="text-mid-gray text-sm leading-relaxed mb-6">
            It may have closed or is no longer live. Check out our other volunteer opportunities.
          </p>
          <Link
            href="/shows"
            className="inline-block bg-navy text-white font-semibold py-3 px-6 rounded hover:bg-opacity-90 transition-colors"
          >
            View Opportunities
          </Link>
        </div>
      </main>
    </div>
  )
}

export default async function ShowClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const show = await getPublicShow(id)

  if (!show) {
    return <Unavailable />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 bg-white py-10 px-6">
        <div className="max-w-2xl mx-auto">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 mb-3 text-white"
            style={{ backgroundColor: show.location?.color ?? '#555555' }}
          >
            {show.location?.name ?? 'Unknown Location'}
          </span>
          <h1 className="text-navy font-bold text-2xl md:text-3xl mb-4">{show.name}</h1>

          {show.description && (
            <p className="text-dark text-base leading-relaxed mb-6 whitespace-pre-wrap">{show.description}</p>
          )}

          {show.volunteer_instructions && (
            <div className="rounded-xl bg-light-navy border border-divider p-4 mb-8">
              <p className="text-dark text-sm leading-relaxed whitespace-pre-wrap">{show.volunteer_instructions}</p>
            </div>
          )}

          <ShowDatePicker dates={show.dates} showName={show.name} />
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
