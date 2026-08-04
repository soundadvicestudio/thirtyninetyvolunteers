// PUBLIC ROUTE — getAdminClient() only, never getServerClient()

import type { Metadata } from 'next'
import Image from 'next/image'
import { getRehearsalCheckInData } from '@/lib/actions/rehearsals'
import { resolveOrgIdentity, type OrgIdentity } from '@/lib/utils/org-identity'
import RehearsalCheckInClient from '@/components/rehearsal-checkin/RehearsalCheckInClient'

export async function generateMetadata(): Promise<Metadata> {
  const org = await resolveOrgIdentity()
  return {
    title: `Rehearsal Check-In — ${org.org_name}`,
    robots: { index: false, follow: false },
  }
}

// Matches the established public-page header pattern (app/checkin/[token]/page.tsx,
// app/shows/[id]/page.tsx) — white header, centered logo, orange accent.
function PublicHeader({ org }: { org: OrgIdentity }) {
  return (
    <header className="w-full bg-white border-b border-divider">
      <div className="max-w-2xl mx-auto py-6 px-6 text-center">
        <Image src={org.org_logo_url || '/logo.png'} alt={org.org_name} width={112} height={64} className="mx-auto" />
        <span className="block w-16 h-0.5 bg-brand-accent mx-auto mt-2" />
      </div>
    </header>
  )
}

export default async function RehearsalCheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const org = await resolveOrgIdentity()
  const data = await getRehearsalCheckInData(token)

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader org={org} />
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md text-center">
            <h1 className="text-brand-primary font-bold text-xl mb-3">{`Invalid or expired check-in link.`}</h1>
            <p className="text-mid-gray text-sm leading-relaxed">{`Contact your stage manager.`}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader org={org} />
      <main className="flex-1 bg-white py-10">
        <RehearsalCheckInClient token={token} data={data} />
      </main>
    </div>
  )
}
