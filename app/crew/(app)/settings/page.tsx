import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'

function LinkedCard({
  href,
  title,
  description,
  badgeLabel,
}: {
  href: string
  title: string
  description: string
  badgeLabel?: string
}) {
  return (
    <Link
      href={href}
      className="block bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 hover:border-navy transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="text-dark dark:text-dark-text font-bold">{title}</h3>
        {badgeLabel && (
          <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-steel text-white whitespace-nowrap">
            {badgeLabel}
          </span>
        )}
      </div>
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

export default async function SettingsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const isSuperAdmin = admin.role === 'super_admin'
  const isEditorOrAbove = admin.role !== 'viewer'

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Settings</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Manage your platform configuration.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isEditorOrAbove ? (
          <LinkedCard
            href="/crew/settings/announcement"
            title="Announcement Banner"
            description="Control the banner that appears at the top of the public volunteer signup page."
          />
        ) : (
          <LockedCard
            title="Announcement Banner"
            description="Control the banner that appears at the top of the public volunteer signup page."
            badgeLabel="Editor & Super Admin only"
          />
        )}

        {isEditorOrAbove ? (
          <LinkedCard
            href="/crew/settings/hearing-options"
            title="Hearing Options"
            description="Manage the 'How did you hear about us?' dropdown options on the volunteer signup form."
          />
        ) : (
          <LockedCard
            title="Hearing Options"
            description="Manage the 'How did you hear about us?' dropdown options on the volunteer signup form."
            badgeLabel="Editor & Super Admin only"
          />
        )}

        {isEditorOrAbove ? (
          <LinkedCard
            href="/crew/settings/signup-form"
            title="Signup Form"
            description="Control which optional fields appear on the public volunteer signup form."
          />
        ) : (
          <LockedCard
            title="Signup Form"
            description="Control which optional fields appear on the public volunteer signup form."
            badgeLabel="Editor & Super Admin only"
          />
        )}

        {isEditorOrAbove ? (
          <LinkedCard
            href="/crew/settings/general"
            title="General Defaults"
            description="Set default volunteer hours per show type and the default reply-to address for outgoing emails."
          />
        ) : (
          <LockedCard
            title="General Defaults"
            description="Set default volunteer hours per show type and the default reply-to address for outgoing emails."
            badgeLabel="Editor & Super Admin only"
          />
        )}

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
            description="Create and manage Production Crew admin accounts and approve registration requests."
          />
        ) : (
          <LockedCard
            title="User Management"
            description="Create and manage Production Crew admin accounts and approve registration requests."
          />
        )}

        {isEditorOrAbove ? (
          <LinkedCard
            href="/crew/settings/audit-log"
            title="Audit Log"
            description="View a complete record of all admin actions taken on the platform."
          />
        ) : (
          <LockedCard
            title="Audit Log"
            description="View a complete record of all admin actions taken on the platform."
            badgeLabel="Editor & Super Admin only"
          />
        )}

        {isEditorOrAbove ? (
          <LinkedCard
            href="/crew/settings/documents"
            title="Document Management"
            description="Upload and manage the volunteer consent form PDF linked on the public signup page."
            badgeLabel="Beta"
          />
        ) : (
          <LockedCard
            title="Document Management"
            description="Upload and manage the volunteer consent form PDF linked on the public signup page."
            badgeLabel="Editor & Super Admin only"
          />
        )}
      </div>
    </div>
  )
}
