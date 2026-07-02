'use client'

import { LogOut } from 'lucide-react'
import { signOut } from '@/app/crew/actions'
import { Button } from '@/components/ui/button'
import type { AdminUser } from '@/lib/auth'

const ROLE_LABELS: Record<AdminUser['role'], string> = {
  super_admin: 'Super Admin',
  editor: 'Editor',
  viewer: 'Viewer',
}

const ROLE_BADGE_CLASSES: Record<AdminUser['role'], string> = {
  super_admin: 'bg-navy text-white',
  editor: 'bg-steel text-white',
  viewer: 'bg-mid-gray text-white',
}

export default function TopBar({
  admin,
  title = 'Production Crew',
}: {
  admin: AdminUser
  title?: string
}) {
  return (
    <header className="h-16 shrink-0 bg-white border-b border-divider flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-dark">{title}</h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-dark">{admin.name}</span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${ROLE_BADGE_CLASSES[admin.role]}`}
        >
          {ROLE_LABELS[admin.role]}
        </span>
        <form action={signOut}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="border-steel text-dark hover:bg-steel hover:text-white transition-colors"
          >
            <LogOut />
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  )
}
