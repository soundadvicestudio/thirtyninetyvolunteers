'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { formatCT } from '@/lib/utils/date'
import { clearActivityFeed, loadMoreActivity, type ActivityEvent } from '@/lib/actions/dashboard'

const EVENT_BORDER_COLOR: Record<ActivityEvent['event_type'], string> = {
  signup: 'border-navy',
  claim: 'border-green-600',
  cancellation: 'border-orange',
  opportunity_submission: 'border-steel',
}

function formatEventTime(occurredAt: string): string {
  const date = new Date(occurredAt)
  const daysAgo = differenceInDays(new Date(), date)
  if (daysAgo >= 7) {
    return formatCT(occurredAt, 'MMM d, yyyy')
  }
  return formatDistanceToNow(date, { addSuffix: true })
}

function isAfter(occurredAt: string, clearedAt: string | null): boolean {
  if (!clearedAt) return true
  return new Date(occurredAt).getTime() > new Date(clearedAt).getTime()
}

function VolunteerLink({ event }: { event: ActivityEvent }) {
  if (event.volunteer_id) {
    return (
      <Link
        href={`/crew/volunteers/${event.volunteer_id}`}
        className="font-semibold text-navy dark:text-steel hover:underline"
      >
        {event.volunteer_name}
      </Link>
    )
  }
  return <span className="font-semibold text-dark dark:text-dark-text">{event.volunteer_name}</span>
}

function DetailLink({ event, href }: { event: ActivityEvent; href: string }) {
  if (event.detail_id) {
    return (
      <Link href={href} className="font-semibold text-navy dark:text-steel hover:underline">
        {event.detail}
      </Link>
    )
  }
  return <span className="font-semibold text-dark dark:text-dark-text">{event.detail}</span>
}

function EventText({ event }: { event: ActivityEvent }) {
  switch (event.event_type) {
    case 'signup':
      return (
        <span className="text-dark dark:text-dark-text">
          <VolunteerLink event={event} /> signed up as a volunteer
        </span>
      )
    case 'claim':
      return (
        <span className="text-dark dark:text-dark-text">
          <VolunteerLink event={event} /> claimed a spot in{' '}
          <DetailLink event={event} href={`/crew/shows/${event.detail_id}`} />
        </span>
      )
    case 'cancellation':
      return (
        <span className="text-dark dark:text-dark-text">
          <VolunteerLink event={event} /> cancelled their spot in{' '}
          <DetailLink event={event} href={`/crew/shows/${event.detail_id}`} />
        </span>
      )
    case 'opportunity_submission':
      return (
        <span className="text-dark dark:text-dark-text">
          <VolunteerLink event={event} /> submitted interest in{' '}
          <DetailLink event={event} href={`/crew/shows/opportunities/${event.detail_id}`} />
        </span>
      )
  }
}

export default function ActivityFeed({
  initialEvents,
  activityClearedAt,
}: {
  initialEvents: ActivityEvent[]
  activityClearedAt: string | null
}) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents)
  const [offset, setOffset] = useState(10)
  const [hasMore, setHasMore] = useState(initialEvents.length === 10)
  const [loading, setLoading] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [localClearedAt, setLocalClearedAt] = useState<string | null>(null)

  const effectiveClearedAt = localClearedAt ?? activityClearedAt
  const hasUnread = events.some((e) => isAfter(e.occurred_at, effectiveClearedAt))

  async function handleClear() {
    setClearing(true)
    try {
      const result = await clearActivityFeed()
      if ('success' in result) {
        setLocalClearedAt(new Date().toISOString())
      }
    } catch (err) {
      console.error('clearActivityFeed failed:', err)
    } finally {
      setClearing(false)
    }
  }

  async function handleLoadMore() {
    setLoading(true)
    try {
      const result = await loadMoreActivity(offset)
      setEvents((prev) => [...prev, ...result.events])
      setOffset((prev) => prev + 10)
      if (result.events.length < 10) {
        setHasMore(false)
      }
    } catch (err) {
      console.error('loadMoreActivity failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-dark dark:text-dark-text">Recent Activity</h2>
        {hasUnread && (
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="text-sm font-semibold text-navy dark:text-steel hover:underline disabled:opacity-50 cursor-pointer"
          >
            {clearing ? 'Marking…' : 'Mark all as read'}
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-mid-gray dark:text-dark-muted">No activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => {
            const isNew = isAfter(event.occurred_at, effectiveClearedAt)
            return (
              <li
                key={`${event.event_type}-${event.event_id}`}
                className={`flex items-start justify-between gap-3 border-l-4 pl-3 py-1 ${EVENT_BORDER_COLOR[event.event_type]}`}
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <EventText event={event} />
                  {isNew && (
                    <span className="bg-orange text-white text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 shrink-0">
                      New
                    </span>
                  )}
                </div>
                <span className="text-xs text-mid-gray dark:text-dark-muted whitespace-nowrap shrink-0">
                  {formatEventTime(event.occurred_at)}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loading}
          className="mt-4 text-sm font-semibold text-navy dark:text-steel hover:underline disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}
