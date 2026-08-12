'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Mic2,
  Package,
  MessageSquare,
  Users,
  Theater,
  Briefcase,
  FileText,
  QrCode,
  ScanLine,
  Mail,
  FolderOpen,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react'
import type { AdminUser } from '@/lib/auth'
import type { FeatureFlags } from '@/lib/feature-flags'
import type { OrgIdentity } from '@/lib/utils/org-identity'
import { ThemeToggle } from './ThemeToggle'
import { useMobileSidebar } from './MobileSidebarContext'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/crew/dashboard', icon: LayoutDashboard },
  { label: 'Calendar', href: '/crew/calendar', icon: CalendarDays },
  { label: 'Rehearsals', href: '/crew/rehearsals', icon: ClipboardList },
  { label: 'Auditions', href: '/crew/auditions', icon: Mic2 },
  { label: 'Inventory', href: '/crew/inventory', icon: Package },
  { label: 'Forums', href: '/crew/forums', icon: MessageSquare },
  { label: 'Volunteers', href: '/crew/volunteers', icon: Users },
  { label: 'Shows', href: '/crew/shows', icon: Theater },
  { label: 'Opportunities', href: '/crew/shows/opportunities', icon: Briefcase },
  { label: 'Forms', href: '/crew/forms', icon: FileText },
  { label: 'QR Generator', href: '/crew/tools/qr-generator', icon: QrCode },
  { label: 'Check-In', href: '/crew/tools/checkin', icon: ScanLine },
  { label: 'Communication', href: '/crew/communication', icon: Mail },
  { label: 'Media', href: '/crew/media', icon: FolderOpen },
  { label: 'Settings', href: '/crew/settings', icon: Settings },
  { label: 'Help', href: '/crew/help', icon: HelpCircle },
]

// Anchor keys for flag-gated nav items. The per-link tooltip render branch
// that consumed this map was removed from the nav loop below in NOTIFY.1;
// retained per NOTIFY.1 task scope (not removed).
const TOOLTIP_ANCHOR_MAP: Record<string, string> = {
  '/crew/rehearsals': 'rehearsals',
  '/crew/auditions': 'auditions',
  '/crew/inventory': 'inventory',
  '/crew/forums': 'forums',
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Sidebar({
  admin,
  flags,
  org,
}: {
  admin: AdminUser
  flags: FeatureFlags
  org: OrgIdentity
}) {
  const pathname = usePathname()
  const { isOpen, close } = useMobileSidebar()
  const isProduction = admin.role === 'production'

  // Flag check and role check are independent — both must be true for a
  // gated link to render. NAV_ITEMS is a flat data-driven array (not
  // discrete per-link JSX), so gating is a filter keyed by href.
  const FLAG_GATED_HREFS: Record<string, boolean> = {
    '/crew/calendar': flags.calendar,
    '/crew/tools/checkin': flags.checkin,
    '/crew/communication': flags.blast,
    '/crew/rehearsals': flags.rehearsals,
    '/crew/auditions': flags.auditions,
    '/crew/inventory': flags.inventory,
    '/crew/forums': flags.forums,
  }
  const flagFilteredNavItems = NAV_ITEMS.filter((item) => FLAG_GATED_HREFS[item.href] !== false)

  const visibleNavItems = isProduction
    ? flagFilteredNavItems.filter(
        (item) =>
          item.href === '/crew/calendar' ||
          item.href === '/crew/help' ||
          item.href === '/crew/media' ||
          item.href === '/crew/rehearsals' ||
          item.href === '/crew/auditions' ||
          item.href === '/crew/forums'
      )
    : flagFilteredNavItems

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
          className="md:hidden absolute top-4 right-4 p-1 rounded text-dark hover:bg-gray-100 cursor-pointer dark:text-dark-text dark:hover:bg-dark-surface/50"
        >
          <X size={20} />
        </button>

        <Link href="/crew/dashboard" className="flex items-center justify-center py-6">
          <Image src={org.org_logo_url || '/logo.png'} alt={org.org_name} width={120} height={80} priority />
        </Link>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === '/crew/shows'
              ? isActivePath(pathname, href) && !isActivePath(pathname, '/crew/shows/opportunities')
              : isActivePath(pathname, href)
          const linkClasses = `flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors ${
            active
              ? 'bg-brand-primary text-white'
              : 'text-dark hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-surface/50'
          }`

          return (
            <Link key={href} href={href} className={linkClasses}>
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

        <div className="px-3 py-3 border-t border-divider dark:border-dark-border shrink-0">
          {admin.role === 'super_admin' && (
            <Link
              href="/crew/settings/setup"
              className="flex items-center gap-2 px-2 py-2 rounded text-sm text-mid-gray dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-nav transition-colors mb-2"
            >
              <Settings size={16} />
              Platform Setup
            </Link>
          )}
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}
