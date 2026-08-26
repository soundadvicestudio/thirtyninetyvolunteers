import type { Metadata } from 'next'
import Link from 'next/link'
import { cancelAuditionSignup } from '@/lib/actions/auditions'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'
import PublicHeader from '@/components/public/PublicHeader'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AuditionCancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [result, org] = await Promise.all([cancelAuditionSignup(token), resolveOrgIdentity()])

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <div className="max-w-md mx-auto px-4 pt-3 pb-1">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to Main Page
        </Link>
      </div>

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
