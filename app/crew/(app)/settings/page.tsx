import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'

function LinkedCard({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="block bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 hover:border-navy transition-colors"
    >
      <h3 className="text-dark dark:text-dark-text font-bold mb-1">{title}</h3>
      <p className="text-mid-gray dark:text-dark-muted text-sm">{description}</p>
    </Link>
  )
}

function LockedCard({
  title,
  description,
  badgeLabel = 'Super Admin only',
}: {
  title: string
  description: string
  badgeLabel?: string
}) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 opacity-60">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-dark dark:text-dark-text font-bold">{title}</h3>
        <span className="text-xs font-semibold rounded px-2 py-0.5 bg-mid-gray/20 text-mid-gray whitespace-nowrap">
          {badgeLabel}
        </span>
      </div>
      <p className="text-mid-gray dark:text-dark-muted text-sm">{description}</p>
    </div>
  )
}

function MutedCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 opacity-60">
      <h3 className="text-dark dark:text-dark-text font-bold mb-1">{title}</h3>
      <p className="text-mid-gray dark:text-dark-muted text-sm">{description}</p>
    </div>
  )
}

export default async function SettingsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const isSuperAdmin = admin.role === 'super_admin'
  const canViewAuditLog = admin.role !== 'viewer'

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-1">Settings</h1>
      <p className="text-mid-gray text-sm mb-8">Manage your platform configuration.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isSuperAdmin ? (
          <LinkedCard
            href="/crew/settings/categories"
            title="Category Management"
            description="Add, rename, reorder, and toggle visibility of volunteer categories."
          />
        ) : (
          <LockedCard
            title="Category Management"
            description="Add, rename, reorder, and toggle visibility of volunteer categories."
          />
        )}

        {isSuperAdmin ? (
          <LinkedCard
            href="/crew/settings/users"
            title="User Management"
            description="Create and manage Production Crew admin accounts."
          />
        ) : (
          <LockedCard
            title="User Management"
            description="Create and manage Production Crew admin accounts."
          />
        )}

        {canViewAuditLog ? (
          <LinkedCard
            href="/crew/settings/audit-log"
            title="Audit Log"
            description="Read-only record of all admin actions."
          />
        ) : (
          <LockedCard
            title="Audit Log"
            description="Read-only record of all admin actions."
            badgeLabel="Editor & Super Admin only"
          />
        )}

        <MutedCard
          title="More settings coming"
          description="Announcement banner, hearing options, signup form configuration, and more — coming in Phase 11."
        />
      </div>
    </div>
  )
}
