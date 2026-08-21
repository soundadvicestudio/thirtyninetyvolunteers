import { Mail, Bell, LogOut } from 'lucide-react'

export function TopNavMockup() {
  return (
    <div className="h-16 bg-white dark:bg-dark-surface border-b border-neutral-border flex items-center justify-between px-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 flex flex-col justify-center gap-1">
          <div className="w-5 h-0.5 bg-mid-gray rounded" />
          <div className="w-5 h-0.5 bg-mid-gray rounded" />
          <div className="w-4 h-0.5 bg-mid-gray rounded" />
        </div>
        <h1 className="text-lg font-semibold text-dark dark:text-dark-text">Production Crew</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Mail size={20} className="text-mid-gray dark:text-dark-muted" />
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-brand-primary text-white text-[10px] font-semibold">
            2
          </span>
        </div>

        <div className="relative">
          <Bell size={20} className="text-mid-gray dark:text-dark-muted" />
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-brand-primary text-white text-[10px] font-semibold">
            5
          </span>
        </div>

        <span className="text-sm text-dark dark:text-dark-text">Jonathan S.</span>

        <span className="text-xs font-semibold px-2 py-1 rounded bg-brand-primary text-white">
          Super Admin
        </span>

        <div className="flex items-center gap-1.5 text-sm text-mid-gray dark:text-dark-muted border border-neutral-border rounded px-2 py-1">
          <LogOut size={14} />
          <span>Sign Out</span>
        </div>
      </div>
    </div>
  )
}
