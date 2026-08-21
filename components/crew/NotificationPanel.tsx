'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import {
  Bell,
  AlertCircle,
  MessageSquare,
  UserPlus,
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Mail,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions/notifications'
import type { NotificationCounts, NotificationRow, NotificationType } from '@/types/notifications'

interface NotificationPanelProps {
  notificationCounts: NotificationCounts
  initialNotifications: NotificationRow[]
}

function timeAgo(isoString: string): string {
  const then = new Date(isoString).getTime()
  const now = new Date().getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay} days ago`
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTypeIcon(type: NotificationType): LucideIcon {
  switch (type) {
    case 'forum_reply':
      return MessageSquare
    case 'audition_signup':
      return UserPlus
    case 'audition_material':
      return FileText
    case 'calendar_approved':
      return CheckCircle
    case 'calendar_cancelled':
      return XCircle
    case 'calendar_changed':
      return Edit
    case 'direct_message':
      return Mail
  }
}

export default function NotificationPanel({ notificationCounts, initialNotifications }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationRow[]>(initialNotifications)
  const [isPending, startTransition] = useTransition()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // direct_message notifications have their own TopBar badge (MessagesIcon,
  // driven by notificationCounts.messageUnread) — excluded here so they
  // don't double-count in the bell panel or its badge.
  const visibleNotifications = notifications.filter((n) => n.type !== 'direct_message')
  const unreadPersistent = visibleNotifications.filter((n) => !n.read_at).length

  const { ephemeral } = notificationCounts
  const totalEphemeral =
    ephemeral.pendingRegistrations + ephemeral.pendingCalendarEvents + ephemeral.pendingConsentForms
  const totalBadge = totalEphemeral + unreadPersistent

  const handleNotificationClick = (n: NotificationRow) => {
    if (!n.read_at) {
      setNotifications((prev) => prev.filter((item) => item.id !== n.id))
    }
    setIsOpen(false)
    startTransition(async () => {
      await markNotificationRead(n.id)
    })
  }

  const handleMarkAllRead = () => {
    startTransition(async () => {
      setNotifications([])
      await markAllNotificationsRead()
    })
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative p-1 rounded text-dark hover:bg-gray-100 cursor-pointer dark:text-dark-text dark:hover:bg-dark-surface/50"
      >
        <Bell size={20} />
        {totalBadge > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-brand-primary text-white text-xs font-semibold">
            {totalBadge > 99 ? '99+' : String(totalBadge)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 max-h-[480px] overflow-y-auto bg-white dark:bg-dark-surface border border-neutral-border dark:border-dark-border rounded-lg shadow-lg z-50">
          {totalEphemeral > 0 && (
            <>
              <div className="text-xs font-semibold text-mid-gray uppercase tracking-wide px-4 pt-3 pb-1">
                Needs Action
              </div>

              {ephemeral.pendingRegistrations > 0 && (
                <Link
                  href="/crew/settings/users"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors"
                >
                  <AlertCircle size={16} className="text-orange-500 shrink-0" />
                  <span className="text-sm text-dark dark:text-dark-text">
                    {`${ephemeral.pendingRegistrations} pending registration${
                      ephemeral.pendingRegistrations === 1 ? '' : 's'
                    }`}
                  </span>
                </Link>
              )}

              {ephemeral.pendingCalendarEvents > 0 && (
                <Link
                  href="/crew/calendar/pending"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors"
                >
                  <AlertCircle size={16} className="text-orange-500 shrink-0" />
                  <span className="text-sm text-dark dark:text-dark-text">
                    {`${ephemeral.pendingCalendarEvents} event${
                      ephemeral.pendingCalendarEvents === 1 ? '' : 's'
                    } awaiting approval`}
                  </span>
                </Link>
              )}

              {ephemeral.pendingConsentForms > 0 && (
                <Link
                  href="/crew/settings/documents"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors"
                >
                  <AlertCircle size={16} className="text-orange-500 shrink-0" />
                  <span className="text-sm text-dark dark:text-dark-text">
                    {`${ephemeral.pendingConsentForms} consent form${
                      ephemeral.pendingConsentForms === 1 ? '' : 's'
                    } to review`}
                  </span>
                </Link>
              )}

              <div className="border-t border-neutral-border dark:border-dark-border mx-4" />
            </>
          )}

          <div className="flex justify-between items-center px-4 pt-3 pb-1">
            <span className="text-xs font-semibold text-mid-gray uppercase tracking-wide">Notifications</span>
            {unreadPersistent > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-xs text-mid-gray hover:text-dark disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Mark all read
              </button>
            )}
          </div>

          {visibleNotifications.length === 0 ? (
            <p className="text-sm text-mid-gray dark:text-dark-muted text-center py-4">
              No new notifications
            </p>
          ) : (
            visibleNotifications.map((n) => {
              const Icon = getTypeIcon(n.type)
              const isUnread = n.read_at === null
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                    isUnread ? 'bg-neutral-surface dark:bg-dark-nav' : 'hover:bg-neutral-surface dark:hover:bg-dark-nav'
                  }`}
                >
                  {isUnread && <span className="w-2 h-2 rounded-full bg-brand-primary mt-1 shrink-0" />}
                  <Icon size={16} className="text-mid-gray dark:text-dark-muted shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-dark dark:text-dark-text truncate">{n.title}</div>
                    <div className="text-xs text-mid-gray dark:text-dark-muted mt-0.5">{timeAgo(n.created_at)}</div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
