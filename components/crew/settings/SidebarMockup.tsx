import {
  LayoutDashboard,
  Theater,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Mic2,
  Users,
  MessageSquare,
  Inbox,
  UserSearch,
  Package,
  FileText,
  QrCode,
  ScanLine,
  Mail,
  FolderOpen,
  Settings,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react'

export function SidebarMockup() {
  return (
    <div className="w-64 bg-white dark:bg-dark-surface border-r border-neutral-border flex flex-col h-[800px] rounded-lg overflow-hidden shadow-sm">
      <div className="px-4 py-4 border-b border-neutral-border shrink-0 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-brand-primary shrink-0" />
        <span className="text-sm font-semibold text-dark dark:text-dark-text truncate">
          30 By Ninety Theatre
        </span>
      </div>

      <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
        <a
          className="flex items-center gap-3 rounded-r border-l-4 px-3 py-2 text-sm font-medium bg-brand-primary-light text-brand-primary"
          style={{ borderLeftColor: 'var(--brand-primary)' }}
          href="#"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </a>

        <p className="text-xs font-semibold uppercase tracking-wider text-mid-gray dark:text-dark-muted px-3 pt-4 pb-1">
          EVENTS
        </p>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <Theater size={18} />
          Shows
        </a>
        <a
          className="flex items-center gap-3 rounded pl-8 pr-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <Briefcase size={18} />
          Opportunities
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <CalendarDays size={18} />
          Calendar
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <ClipboardList size={18} />
          Rehearsals
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <Mic2 size={18} />
          Auditions
        </a>

        <p className="text-xs font-semibold uppercase tracking-wider text-mid-gray dark:text-dark-muted px-3 pt-4 pb-1">
          PEOPLE
        </p>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <Users size={18} />
          Volunteers
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <MessageSquare size={18} />
          Forums
          <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white text-xs font-semibold ring-1 ring-white dark:ring-dark-surface">
            3
          </span>
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <Inbox size={18} />
          Messages
          <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white text-xs font-semibold ring-1 ring-white dark:ring-dark-surface">
            2
          </span>
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <UserSearch size={18} />
          Directory
        </a>

        <p className="text-xs font-semibold uppercase tracking-wider text-mid-gray dark:text-dark-muted px-3 pt-4 pb-1">
          UTILITIES
        </p>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <Package size={18} />
          Inventory
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <FileText size={18} />
          Forms
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <QrCode size={18} />
          QR Generator
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <ScanLine size={18} />
          Check-In
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <Mail size={18} />
          Communication
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <FolderOpen size={18} />
          Media
        </a>

        <p className="text-xs font-semibold uppercase tracking-wider text-mid-gray dark:text-dark-muted px-3 pt-4 pb-1">
          SETTINGS
        </p>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <Settings size={18} />
          Settings
        </a>
      </nav>

      <div className="px-2 py-2 border-t border-neutral-border shrink-0 space-y-0.5">
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <HelpCircle size={18} />
          Help
        </a>
        <a
          className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface/50"
          href="#"
        >
          <SlidersHorizontal size={18} />
          Platform Setup
        </a>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-5 bg-brand-primary rounded-full shrink-0" />
          <span className="text-xs text-mid-gray dark:text-dark-muted">Theme</span>
        </div>
      </div>
    </div>
  )
}
