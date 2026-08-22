export type GroupKey =
  | 'events'
  | 'people'
  | 'utilities'
  | 'settings'

export type SidebarNavOrder = {
  groupOrder: GroupKey[]
  linkOrder: Record<GroupKey, string[]>
}

// Human-readable display labels for nav hrefs.
// Used in NavOrderSection reorder UI.
// 'Crew Directory' matches the SIDEBAR.2 label change.
export const HREF_LABELS: Record<string, string> = {
  '/crew/calendar': 'Calendar',
  '/crew/shows': 'Shows',
  '/crew/rehearsals': 'Rehearsals',
  '/crew/auditions': 'Auditions',
  '/crew/volunteers': 'Volunteers',
  '/crew/forums': 'Forums',
  '/crew/messages': 'Messages',
  '/crew/users': 'Crew Directory',
  '/crew/shows/opportunities': 'Opportunities',
  '/crew/inventory': 'Inventory',
  '/crew/forms': 'Forms',
  '/crew/tools/qr-generator': 'QR Generator',
  '/crew/tools/checkin': 'Check-In',
  '/crew/communication': 'Communication',
  '/crew/media': 'Media',
  '/crew/settings/beta': 'Beta Testing',
  '/crew/settings/inventory': 'Inventory Management',
  '/crew/settings': 'Settings',
  '/crew/help': 'Help',
}

// Default group render order — used as fallback
// when no sidebar_nav_order is saved in app_settings.
export const DEFAULT_GROUP_ORDER: GroupKey[] = [
  'events',
  'people',
  'utilities',
  'settings',
]

// Default per-group link order — must exactly match
// the *_HREFS constants in Sidebar.tsx confirmed in
// Task A. Used as fallback and as Reset target.
export const DEFAULT_LINK_ORDER: Record<GroupKey, string[]> = {
  events: ['/crew/calendar', '/crew/shows', '/crew/rehearsals', '/crew/auditions'],
  people: [
    '/crew/volunteers',
    '/crew/forums',
    '/crew/messages',
    '/crew/users',
    '/crew/shows/opportunities',
  ],
  utilities: [
    '/crew/inventory',
    '/crew/forms',
    '/crew/tools/qr-generator',
    '/crew/tools/checkin',
    '/crew/communication',
    '/crew/media',
  ],
  settings: ['/crew/settings/beta', '/crew/settings', '/crew/help'],
}

// Display labels for each group — used in the
// sidebar render loop and the NavOrderSection UI.
export const GROUP_LABELS: Record<GroupKey, string> = {
  events: 'Events',
  people: 'People',
  utilities: 'Utilities',
  settings: 'Settings',
}
