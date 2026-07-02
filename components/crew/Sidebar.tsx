'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Theater,
  FileText,
  QrCode,
  Mail,
  Settings,
  UserCog,
} from 'lucide-react'
import type { AdminUser } from '@/lib/auth'
import { ThemeToggle } from './ThemeToggle'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/crew/dashboard', icon: LayoutDashboard },
  { label: 'Volunteers', href: '/crew/volunteers', icon: Users },
  { label: 'Shows', href: '/crew/shows', icon: Theater },
  { label: 'Forms', href: '/crew/forms', icon: FileText },
  { label: 'QR Generator', href: '/crew/tools/qr-generator', icon: QrCode },
  { label: 'Communication', href: '/crew/communication', icon: Mail },
  { label: 'Settings', href: '/crew/settings', icon: Settings },
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Sidebar({ admin }: { admin: AdminUser }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen shrink-0 bg-white dark:bg-dark-surface border-r border-divider dark:border-dark-border flex flex-col">
      <Link href="/crew/dashboard" className="flex items-center justify-center py-6">
        <Image src="/logo.png" alt="30 By Ninety Theatre" width={120} height={80} priority />
      </Link>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActivePath(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-navy text-white'
                  : 'text-dark hover:bg-light-navy dark:text-dark-text dark:hover:bg-dark-surface/50'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}

        {admin.role === 'super_admin' && (
          <Link
            href="/crew/settings/users"
            className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
              isActivePath(pathname, '/crew/settings/users')
                ? 'bg-navy text-white'
                : 'text-dark hover:bg-light-navy dark:text-dark-text dark:hover:bg-dark-surface/50'
            }`}
          >
            <UserCog size={18} />
            Users
          </Link>
        )}
      </nav>

      <div className="px-3 py-3 border-t border-divider dark:border-dark-border shrink-0">
        <ThemeToggle />
      </div>
    </aside>
  )
}
