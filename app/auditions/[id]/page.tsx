import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAuditionPublicData } from '@/lib/actions/auditions'
import { resolveOrgIdentity, type OrgIdentity } from '@/lib/utils/org-identity'
import AuditionSignupClient from '@/components/audition/AuditionSignupClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const [data, org] = await Promise.all([getAuditionPublicData(id), resolveOrgIdentity()])
  return {
    title: data ? `Audition — ${data.audition.title} | ${org.org_name}` : `Audition | ${org.org_name}`,
    robots: { index: false, follow: false },
  }
}

// Matches the established public-page header pattern (app/shows/[id],
// app/opportunities/[id], app/checkin/[token], app/consent/[token]) —
// white header, centered logo, orange accent underline. Not a navy header —
// every other public-facing page in this project uses this exact pattern,
// and next/image (not a raw <img>) for the logo.
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

export default async function AuditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [data, org] = await Promise.all([getAuditionPublicData(id), resolveOrgIdentity()])

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader org={org} />

      <main className="flex-1 bg-white py-10 px-6">
        <div className="max-w-2xl mx-auto">
          <AuditionSignupClient data={data} orgName={org.org_name} />
        </div>
      </main>

      <footer className="w-full bg-footer-gray border-t border-divider py-6 px-6">
        <div className="max-w-2xl mx-auto text-center text-sm text-mid-gray">
          {org.org_contact_email && (
            <a href={`mailto:${org.org_contact_email}`} className="hover:underline">
              {org.org_contact_email}
            </a>
          )}
          {org.org_contact_email && org.org_website_url && <span className="mx-2">·</span>}
          {org.org_website_url && (
            <a href={org.org_website_url} className="hover:underline" target="_blank" rel="noopener noreferrer">
              {org.org_website_url}
            </a>
          )}
          <div className="mt-2">
            {`© ${org.org_name}`}
            <span className="mx-2">·</span>
            <Link href="/crew/login" className="hover:text-brand-primary transition-colors">
              Production Crew
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
