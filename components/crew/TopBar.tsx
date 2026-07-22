'use client'

import Link from 'next/link'
import { LogOut, Menu } from 'lucide-react'
import { signOut } from '@/app/crew/actions'
import type { AdminUser } from '@/lib/auth'
import { useMobileSidebar } from './MobileSidebarContext'

const ROLE_LABELS: Record<AdminUser['role'], string> = {
  super_admin: 'Super Admin',
  editor: 'Editor',
  viewer: 'Viewer',
  production: 'Production',
}

const ROLE_BADGE_CLASSES: Record<AdminUser['role'], string> = {
  super_admin: 'bg-navy text-white',
  editor: 'bg-steel text-white',
  viewer: 'bg-mid-gray text-white',
  production: 'bg-orange text-white',
}

export default function TopBar({
  admin,
  title = 'Production Crew',
}: {
  admin: AdminUser
  title?: string
}) {
  const { toggle } = useMobileSidebar()

  return (
    <header className="h-16 shrink-0 bg-white dark:bg-dark-surface border-b border-divider dark:border-dark-border flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label="Open menu"
          className="md:hidden p-1 rounded text-dark hover:bg-light-navy cursor-pointer dark:text-dark-text dark:hover:bg-dark-surface/50"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-dark dark:text-dark-text">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden sm:inline text-sm text-dark dark:text-dark-text">{admin.name}</span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${ROLE_BADGE_CLASSES[admin.role]}`}
        >
          {ROLE_LABELS[admin.role]}
        </span>
        <Link
          href="/crew/settings/password"
          className="hidden sm:inline text-sm text-mid-gray hover:text-navy dark:text-dark-muted transition-colors"
        >
          Change Password
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sign Out"
            className="
              flex items-center gap-2
              px-3 py-1.5 rounded-md text-sm font-medium
              border border-steel text-dark bg-white
              hover:bg-steel hover:text-white
              dark:text-dark-text dark:bg-dark-surface
              transition-colors duration-150
              cursor-pointer
            "
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </form>
      </div>
    </header>
  )
}
