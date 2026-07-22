'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Theater,
  Briefcase,
  FileText,
  QrCode,
  ScanLine,
  Mail,
  Settings,
  UserCog,
  X,
} from 'lucide-react'
import type { AdminUser } from '@/lib/auth'
import { ThemeToggle } from './ThemeToggle'
import { useMobileSidebar } from './MobileSidebarContext'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/crew/dashboard', icon: LayoutDashboard },
  { label: 'Volunteers', href: '/crew/volunteers', icon: Users },
  { label: 'Shows', href: '/crew/shows', icon: Theater },
  { label: 'Opportunities', href: '/crew/shows/opportunities', icon: Briefcase },
  { label: 'Forms', href: '/crew/forms', icon: FileText },
  { label: 'QR Generator', href: '/crew/tools/qr-generator', icon: QrCode },
  { label: 'Check-In', href: '/crew/tools/checkin', icon: ScanLine },
  { label: 'Communication', href: '/crew/communication', icon: Mail },
  { label: 'Settings', href: '/crew/settings', icon: Settings },
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Sidebar({
  admin,
  pendingRegistrationCount = 0,
}: {
  admin: AdminUser
  pendingRegistrationCount?: number
}) {
  const pathname = usePathname()
  const { isOpen, close } = useMobileSidebar()

  useEffect(() => {
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      {isOpen && (
        <div
          onClick={close}
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}
      <aside
        className={`w-64 h-screen shrink-0 bg-white dark:bg-dark-surface border-r border-divider dark:border-dark-border flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close menu"
          className="md:hidden absolute top-4 right-4 p-1 rounded text-dark hover:bg-light-navy cursor-pointer dark:text-dark-text dark:hover:bg-dark-surface/50"
        >
          <X size={20} />
        </button>

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
            {pendingRegistrationCount > 0 && (
              <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-navy text-white text-xs font-semibold ring-1 ring-white dark:ring-dark-surface">
                {pendingRegistrationCount}
              </span>
            )}
          </Link>
        )}
      </nav>

        <div className="px-3 py-3 border-t border-divider dark:border-dark-border shrink-0">
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}
