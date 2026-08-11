import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import StyleSandbox from '@/components/crew/settings/StyleSandbox'

export default async function StyleSandboxPage() {
  const adminUser = await getAdminUser()
  if (!adminUser) {
    redirect('/crew/login')
  }
  // proxy.ts already hard-blocks any non-Super-Admin on this route.
  // Server-side check here is defense in depth.
  if (adminUser.role !== 'super_admin') {
    redirect('/crew/dashboard')
  }

  return (
    <div>
      <Link
        href="/crew/settings"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary-mid flex items-center gap-1 mb-6"
      >
        ← Back to Settings
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Style Sandbox</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Design and preview UI aesthetic changes before platform-wide rollout.
      </p>

      <StyleSandbox />
    </div>
  )
}
