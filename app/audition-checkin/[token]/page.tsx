import type { Metadata } from 'next'
import Image from 'next/image'
import { getAuditionCheckInData } from '@/lib/actions/auditions'
import { resolveOrgIdentity, type OrgIdentity } from '@/lib/utils/org-identity'
import AuditionCheckInClient from '@/components/audition-checkin/AuditionCheckInClient'

export async function generateMetadata(): Promise<Metadata> {
  const org = await resolveOrgIdentity()
  return {
    title: `Audition Check-In — ${org.org_name}`,
    robots: { index: false, follow: false },
  }
}

// Matches the established public-page header pattern (app/rehearsal-checkin,
// app/auditions/[id], app/checkin/[token]) — white header, centered logo,
// orange accent underline.
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

export default async function AuditionCheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [data, org] = await Promise.all([getAuditionCheckInData(token), resolveOrgIdentity()])

  // Invalid token — rendered server-side, never passed to the client.
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader org={org} />
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md text-center">
            <p className="text-mid-gray text-sm leading-relaxed">
              {'Invalid or expired check-in link. Contact your director or stage manager.'}
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader org={org} />
      <main className="flex-1 bg-white py-8 px-6">
        <div className="max-w-md mx-auto">
          <AuditionCheckInClient data={data} checkInToken={token} />
        </div>
      </main>
    </div>
  )
}
