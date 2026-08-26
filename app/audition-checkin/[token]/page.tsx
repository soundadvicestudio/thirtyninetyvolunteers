import type { Metadata } from 'next'
import Link from 'next/link'
import { getAuditionCheckInData } from '@/lib/actions/auditions'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'
import AuditionCheckInClient from '@/components/audition-checkin/AuditionCheckInClient'
import PublicHeader from '@/components/public/PublicHeader'

export async function generateMetadata(): Promise<Metadata> {
  const org = await resolveOrgIdentity()
  return {
    title: `Audition Check-In — ${org.org_name}`,
    robots: { index: false, follow: false },
  }
}

function BackLink() {
  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-1">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
        ← Back to Main Page
      </Link>
    </div>
  )
}

export default async function AuditionCheckInPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const data = await getAuditionCheckInData(token)

  // Invalid token — rendered server-side, never passed to the client.
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <BackLink />
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
      <PublicHeader />
      <BackLink />
      <main className="flex-1 bg-white py-8 px-6">
        <div className="max-w-md mx-auto">
          <AuditionCheckInClient data={data} checkInToken={token} />
        </div>
      </main>
    </div>
  )
}
