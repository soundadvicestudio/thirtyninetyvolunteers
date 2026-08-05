import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cancelAuditionSignup } from '@/lib/actions/auditions'
import { resolveOrgIdentity, type OrgIdentity } from '@/lib/utils/org-identity'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

// Matches the established public-page header pattern (app/auditions/[id],
// app/auditions/upload/[token], app/audition-checkin/[token]) — white
// header, centered logo, orange accent underline.
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

export default async function AuditionCancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [result, org] = await Promise.all([cancelAuditionSignup(token), resolveOrgIdentity()])

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader org={org} />

      <main className="flex-1 bg-white py-10 px-6">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          {result.success ? (
            <div>
              <h1 className="text-xl font-semibold text-dark mb-3">Signup Cancelled</h1>
              <p className="text-mid-gray">
                {'Your audition signup has been cancelled. If this was a mistake, please sign up again.'}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-semibold text-dark mb-3">Link Not Valid</h1>
              <p className="text-mid-gray">
                {'This cancellation link is not valid or has already been used.'}
              </p>
            </div>
          )}
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
