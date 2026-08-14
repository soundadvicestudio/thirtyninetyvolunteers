'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function MessagesIcon({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/crew/messages"
      className="relative flex items-center justify-center w-9 h-9 rounded-lg text-mid-gray dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-nav transition-colors"
      aria-label={
        unreadCount > 0
          ? `Messages — ${unreadCount > 99 ? '99+' : unreadCount} unread`
          : 'Messages'
      }
    >
      <Mail size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand-primary text-white text-[10px] font-semibold ring-1 ring-white dark:ring-dark-surface">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
