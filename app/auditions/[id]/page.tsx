import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAuditionPublicData } from '@/lib/actions/auditions'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'
import AuditionSignupClient from '@/components/audition/AuditionSignupClient'
import PublicHeader from '@/components/public/PublicHeader'

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

export default async function AuditionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [data, org] = await Promise.all([getAuditionPublicData(id), resolveOrgIdentity()])

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <div className="max-w-2xl mx-auto px-4 pt-3 pb-1">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to Main Page
        </Link>
      </div>

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
