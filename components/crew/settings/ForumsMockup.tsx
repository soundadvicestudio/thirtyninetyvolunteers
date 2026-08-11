'use client'

import { Pin, Lock } from 'lucide-react'

export function AnnouncementBadge() {
  return (
    <span className="text-xs font-medium rounded px-1.5 py-0.5 bg-brand-primary text-white">
      ANNOUNCEMENT
    </span>
  )
}

export function DiscussionBadge() {
  return (
    <span className="text-xs font-medium rounded px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      DISCUSSION
    </span>
  )
}

export function QuestionBadge() {
  return (
    <span className="text-xs font-medium rounded px-1.5 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-700">
      QUESTION
    </span>
  )
}

function ForumRowInner({
  name,
  description,
  threads,
  lastPost,
  unread,
}: {
  name: string
  description: string
  threads: string
  lastPost: string
  unread: boolean
}) {
  return (
    <>
      <div className="flex items-start gap-3">
        <span
          className={
            unread
              ? 'w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-1.5'
              : 'w-2 h-2 flex-shrink-0 mt-1.5'
          }
        />
        <div>
          <div
            className={
              unread
                ? 'text-sm font-semibold text-gray-900 dark:text-white'
                : 'text-sm font-medium text-gray-700 dark:text-gray-300'
            }
          >
            {name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs text-gray-500 dark:text-gray-400">{threads}</div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{lastPost}</div>
      </div>
    </>
  )
}

function ThreadRow({
  icon,
  badge,
  title,
  unread,
  meta,
  replies,
  lastActivity,
}: {
  icon: React.ReactNode
  badge: React.ReactNode
  title: string
  unread: boolean
  meta: string
  replies: string
  lastActivity: string
}) {
  return (
    <div className="border-b border-neutral-border last:border-b-0 px-4 py-3.5 flex items-start justify-between gap-4 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors cursor-pointer">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-5 flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {badge}
            <span
              className={
                unread
                  ? 'text-sm font-semibold text-gray-900 dark:text-white truncate'
                  : 'text-sm font-medium text-gray-600 dark:text-gray-300 truncate'
              }
            >
              {title}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{meta}</div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs text-gray-500 dark:text-gray-400">{replies}</div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{lastActivity}</div>
      </div>
    </div>
  )
}

export function ForumsMockup() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Forums — Option A Mockup (Index + Thread List)
      </p>

      <div>
        <div className="pb-4 border-b border-neutral-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forums</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Internal discussion for the production crew.
              </p>
            </div>
            <button
              type="button"
              className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark"
            >
              Manage Forums
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden mt-6">
          <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-4 py-2.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              General
            </span>
          </div>

          <div
            className="border-b border-neutral-border last:border-b-0 px-4 py-4 flex items-start justify-between gap-4 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors border-l-4"
            style={{ borderLeftColor: 'var(--brand-primary)' }}
          >
            <ForumRowInner
              name="Announcements"
              description="Official announcements from leadership."
              threads="12 threads"
              lastPost="Last post by Jonathan S. · 2 hours ago"
              unread
            />
          </div>
          <div
            className="border-b border-neutral-border last:border-b-0 px-4 py-4 flex items-start justify-between gap-4 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors border-l-4"
            style={{ borderLeftColor: 'var(--brand-primary)' }}
          >
            <ForumRowInner
              name="General Discussion"
              description="Open discussion for all production crew."
              threads="47 threads"
              lastPost="Last post by Sarah M. · Yesterday"
              unread={false}
            />
          </div>
          <div
            className="border-b border-neutral-border last:border-b-0 px-4 py-4 flex items-start justify-between gap-4 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors border-l-4"
            style={{ borderLeftColor: 'var(--brand-primary)' }}
          >
            <ForumRowInner
              name="Volunteer Resources"
              description="Guides, templates, and helpful links."
              threads="8 threads"
              lastPost="Last post by Marcus D. · 3 days ago"
              unread
            />
          </div>

          <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-4 py-2.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Into the Woods — 2025
            </span>
          </div>

          <div
            className="border-b border-neutral-border last:border-b-0 px-4 py-4 flex items-start justify-between gap-4 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors border-l-4"
            style={{ borderLeftColor: 'var(--brand-primary)' }}
          >
            <ForumRowInner
              name="Rehearsal Notes"
              description="Notes and updates from each rehearsal."
              threads="23 threads"
              lastPost="Last post by Jonathan S. · 1 hour ago"
              unread
            />
          </div>
          <div
            className="border-b border-neutral-border last:border-b-0 px-4 py-4 flex items-start justify-between gap-4 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors border-l-4"
            style={{ borderLeftColor: 'var(--brand-primary)' }}
          >
            <ForumRowInner
              name="Production Team"
              description="Coordinator-only forum. Access restricted."
              threads="6 threads"
              lastPost="Last post by Celeste F. · 2 days ago"
              unread={false}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-border pt-6 mt-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
          {'Thread List View — inside "Rehearsal Notes"'}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">Forums / Into the Woods — 2025 /</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">Rehearsal Notes</h2>
          </div>
          <button
            type="button"
            className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark"
          >
            New Thread
          </button>
        </div>

        <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
          <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Threads
            </span>
            <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
              Mark all as read
            </span>
          </div>

          <ThreadRow
            icon={<Pin className="w-4 h-4 text-brand-primary" />}
            badge={<AnnouncementBadge />}
            title="Rehearsal Schedule — Full Run"
            unread
            meta="Started by Jonathan S. · Oct 1"
            replies="0 replies"
            lastActivity="Oct 1"
          />
          <ThreadRow
            icon={<span className="w-2 h-2 rounded-full bg-brand-primary mt-1 mx-auto block" />}
            badge={<DiscussionBadge />}
            title="Notes from Oct 14 Rehearsal — Act 2"
            unread
            meta="Started by Sarah M. · Oct 14"
            replies="7 replies"
            lastActivity="2 hours ago"
          />
          <ThreadRow
            icon={null}
            badge={<DiscussionBadge />}
            title="Notes from Oct 10 Rehearsal — Full Run"
            unread={false}
            meta="Started by Sarah M. · Oct 10"
            replies="4 replies"
            lastActivity="Oct 10"
          />
          <ThreadRow
            icon={null}
            badge={<QuestionBadge />}
            title="Blocking change in Scene 3 — confirmed?"
            unread={false}
            meta="Started by Marcus D. · Oct 8"
            replies="3 replies"
            lastActivity="Oct 9"
          />
          <ThreadRow
            icon={<Lock className="w-4 h-4 text-gray-400" />}
            badge={null}
            title="Pre-Production Q&A"
            unread={false}
            meta="Started by Jonathan S. · Sep 15"
            replies="22 replies"
            lastActivity="Oct 1"
          />
          <ThreadRow
            icon={null}
            badge={<DiscussionBadge />}
            title="Notes from Sep 30 Rehearsal"
            unread={false}
            meta="Started by Sarah M. · Sep 30"
            replies="5 replies"
            lastActivity="Sep 30"
          />
        </div>
      </div>
    </div>
  )
}
