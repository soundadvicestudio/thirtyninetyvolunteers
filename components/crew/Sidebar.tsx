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
  MessageSquarePlus,
  Inbox,
  Users,
  UserSearch,
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
import { useMobileSidebar } from './MobileSidebarContext'
import type { SidebarNavOrder, GroupKey } from '@/types/sidebar'
import { DEFAULT_GROUP_ORDER, GROUP_LABELS } from '@/types/sidebar'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/crew/dashboard', icon: LayoutDashboard },
  { label: 'Calendar', href: '/crew/calendar', icon: CalendarDays },
  { label: 'Rehearsals', href: '/crew/rehearsals', icon: ClipboardList },
  { label: 'Auditions', href: '/crew/auditions', icon: Mic2 },
  { label: 'Inventory', href: '/crew/inventory', icon: Package },
  { label: 'Forums', href: '/crew/forums', icon: MessageSquare },
  { label: 'Messages', href: '/crew/messages', icon: Inbox },
  { label: 'Volunteers', href: '/crew/volunteers', icon: Users },
  { label: 'Crew Directory', href: '/crew/users', icon: UserSearch },
  { label: 'Shows', href: '/crew/shows', icon: Theater },
  { label: 'Opportunities', href: '/crew/shows/opportunities', icon: Briefcase },
  { label: 'Forms', href: '/crew/forms', icon: FileText },
  { label: 'QR Generator', href: '/crew/tools/qr-generator', icon: QrCode },
  { label: 'Check-In', href: '/crew/tools/checkin', icon: ScanLine },
  { label: 'Communication', href: '/crew/communication', icon: Mail },
  { label: 'Media', href: '/crew/media', icon: FolderOpen },
  { label: 'Beta Feedback', href: '/crew/settings/beta', icon: MessageSquarePlus },
  { label: 'Settings', href: '/crew/settings', icon: Settings },
  { label: 'Help', href: '/crew/help', icon: HelpCircle },
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

const DASHBOARD_HREF = '/crew/dashboard'

const EVENTS_HREFS = ['/crew/calendar', '/crew/shows', '/crew/rehearsals', '/crew/auditions'] as const

const PEOPLE_HREFS = [
  '/crew/volunteers',
  '/crew/forums',
  '/crew/messages',
  '/crew/users',
  '/crew/shows/opportunities',
] as const

const UTILITIES_HREFS = [
  '/crew/inventory',
  '/crew/forms',
  '/crew/tools/qr-generator',
  '/crew/tools/checkin',
  '/crew/communication',
  '/crew/media',
] as const

const SETTINGS_HREFS = [
  '/crew/settings/beta',
  '/crew/settings',
  '/crew/help',
] as const

const GROUP_HREF_DEFAULTS: Record<GroupKey, readonly string[]> = {
  events: EVENTS_HREFS,
  people: PEOPLE_HREFS,
  utilities: UTILITIES_HREFS,
  settings: SETTINGS_HREFS,
}

export default function Sidebar({
  admin,
  flags,
  org,
  forumUnreadCount = 0,
  messagesUnreadCount = 0,
  navOrder,
}: {
  admin: AdminUser
  flags: FeatureFlags
  org: OrgIdentity
  forumUnreadCount?: number
  messagesUnreadCount?: number
  navOrder?: SidebarNavOrder
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
    '/crew/messages': flags.messages,
    '/crew/users': flags.messages,
    '/crew/settings/beta': flags.beta,
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
          item.href === '/crew/forums' ||
          item.href === '/crew/messages' ||
          item.href === '/crew/users'
      )
    : flagFilteredNavItems

  useEffect(() => {
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Derive grouped items from visibleNavItems, preserving group order and flag/role filtering
  const getGroupItems = (hrefs: readonly string[]) =>
    hrefs
      .map((href) => visibleNavItems.find((item) => item.href === href))
      .filter((item): item is (typeof NAV_ITEMS)[number] => item !== undefined)

  const dashboardItem = visibleNavItems.find((item) => item.href === DASHBOARD_HREF)

  const resolvedGroupOrder = navOrder?.groupOrder ?? DEFAULT_GROUP_ORDER

  const groupItems = Object.fromEntries(
    resolvedGroupOrder.map((groupKey) => [
      groupKey,
      getGroupItems(navOrder?.linkOrder[groupKey] ?? GROUP_HREF_DEFAULTS[groupKey]),
    ])
  ) as Record<GroupKey, (typeof NAV_ITEMS)[number][]>

  // Local render function for a single nav link. Handles active state, badge
  // rendering, and mobile close on click.
  const renderLink = (item: (typeof NAV_ITEMS)[number]) => {
    const isShows = item.href === '/crew/shows'
    const isSettings = item.href === '/crew/settings'
    const active = isShows
      ? pathname === '/crew/shows' ||
        (pathname.startsWith('/crew/shows/') && !pathname.startsWith('/crew/shows/opportunities'))
      : isSettings
      ? isActivePath(pathname, item.href) && !pathname.startsWith('/crew/settings/beta')
      : isActivePath(pathname, item.href)

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={close}
        className={
          active
            ? 'flex items-center gap-3 rounded-r ' +
              'border-l-4 px-3 py-2 text-sm ' +
              'font-medium bg-brand-primary-light ' +
              'text-brand-primary'
            : 'flex items-center gap-3 rounded ' +
              'px-3 py-2 text-sm font-medium ' +
              'text-dark dark:text-dark-text ' +
              'hover:bg-gray-100 ' +
              'dark:hover:bg-white/10'
        }
        style={
          active
            ? {
                borderLeftColor: 'var(--brand-primary)',
              }
            : undefined
        }
      >
        <item.icon size={18} />
        {item.label}
        {item.href === '/crew/forums' && forumUnreadCount > 0 && (
          <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white text-xs font-semibold ring-1 ring-white dark:ring-dark-surface">
            {forumUnreadCount > 99 ? '99+' : forumUnreadCount}
          </span>
        )}
        {item.href === '/crew/messages' && messagesUnreadCount > 0 && (
          <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white text-xs font-semibold ring-1 ring-white dark:ring-dark-surface">
            {messagesUnreadCount > 99 ? '99+' : messagesUnreadCount}
          </span>
        )}
      </Link>
    )
  }

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
          className="md:hidden absolute top-4 right-4 p-1 rounded text-dark hover:bg-gray-100 cursor-pointer dark:text-dark-text dark:hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <Link href="/crew/dashboard" className="flex items-center justify-center py-3">
          <Image src={org.org_logo_url || '/logo.png'} alt={org.org_name} width={120} height={80} priority />
        </Link>

        <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
          {/* Dashboard — ungrouped, always first */}
          {dashboardItem && renderLink(dashboardItem)}

          {/* Groups — dynamic order and per-group link order via navOrder */}
          {resolvedGroupOrder.map((groupKey) => {
            const items = groupItems[groupKey]
            if (!items || items.length === 0) return null
            return (
              <div key={groupKey}>
                <p className="text-xs font-semibold uppercase tracking-wider text-mid-gray dark:text-dark-muted px-3 pt-4 pb-1">
                  {GROUP_LABELS[groupKey]}
                </p>
                {items.map(renderLink)}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
