import Link from 'next/link'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'

export default async function PublicHeader() {
  const org = await resolveOrgIdentity()

  return (
    <header className="w-full bg-white border-b border-divider">
      <div className="max-w-2xl mx-auto py-6 px-6 text-center">
        <Link href="/" className="inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element -- org_logo_url
              can be any external URL (Setup Panel URL-paste mode); next/image
              would require every possible hostname in next.config.ts
              remotePatterns, which is not viable across OpenCall OS client
              deployments (ADMIN.65-FIX). */}
          <img
            src={org.org_logo_url || '/logo.png'}
            alt={org.org_name}
            width={134}
            height={77}
            className="mx-auto"
          />
        </Link>
      </div>
    </header>
  )
}
