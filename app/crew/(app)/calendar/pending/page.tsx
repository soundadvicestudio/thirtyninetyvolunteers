import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { hasConflict } from '@/lib/utils/calendar-conflict'
import PendingQueueClient from '@/components/crew/calendar/PendingQueueClient'
import type { CalendarEventType } from '@/types/calendar'
import type { Location } from '@/types/show'

export type PendingEvent = {
  id: string
  title: string
  event_type: CalendarEventType
  custom_type_label: string | null
  location_id: string | null
  location: { id: string; name: string; color: string } | null
  start_time: string
  end_time: string
  description: string | null
  requirements: string | null
  rehearsal_batch_id: string | null
  recurrence_group_id: string | null
  submitted_by_admin: { id: string; name: string } | null
  created_at: string
  contacts: { id: string; name: string; phone: string; sort_order: number }[]
}

export type PendingBatch = {
  id: string
  title: string
  submitted_by_admin: { id: string; name: string } | null
  created_at: string
  events: PendingEvent[]
}

type RawPendingEventRow = Omit<PendingEvent, 'contacts'> & {
  contacts: { id: string; name: string; phone: string; sort_order: number }[] | null
}

export default async function PendingQueuePage() {
  const adminUser = await getAdminUser()
  if (!adminUser) {
    redirect('/crew/login')
  }
  if (adminUser.role !== 'super_admin') {
    redirect('/crew/calendar')
  }

  const supabase = await getServerClient()

  const [{ data: eventRows }, { data: locationRows }] = await Promise.all([
    supabase
      .from('calendar_events')
      .select(
        `
        id, title, event_type, custom_type_label,
        location_id, start_time, end_time,
        description, requirements, rehearsal_batch_id, recurrence_group_id, created_at,
        location:locations ( id, name, color ),
        submitted_by_admin:admin_users!calendar_events_submitted_by_fkey ( id, name ),
        contacts:calendar_event_contacts ( id, name, phone, sort_order )
        `
      )
      .eq('status', 'pending')
      .order('start_time', { ascending: true }),
    supabase.from('locations').select('id, name, color, sort_order').eq('is_active', true).order('sort_order'),
  ])

  const events: PendingEvent[] = ((eventRows ?? []) as unknown as RawPendingEventRow[]).map((e) => ({
    ...e,
    contacts: (e.contacts ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
  }))

  const batchIds = Array.from(new Set(events.filter((e) => e.rehearsal_batch_id).map((e) => e.rehearsal_batch_id as string)))

  let batches: PendingBatch[] = []
  if (batchIds.length > 0) {
    const { data: batchRows } = await supabase
      .from('rehearsal_batches')
      .select('id, title, created_at, submitted_by_admin:admin_users!rehearsal_batches_submitted_by_fkey ( id, name )')
      .in('id', batchIds)

    batches = ((batchRows ?? []) as unknown as Omit<PendingBatch, 'events'>[]).map((b) => ({
      ...b,
      events: events.filter((e) => e.rehearsal_batch_id === b.id),
    }))
  }

  const individualEvents = events.filter((e) => !e.rehearsal_batch_id)
  const locations = (locationRows ?? []) as unknown as Location[]

  // O(N pending events with preferred locations) — acceptable for expected queue size.
  const initialConflicts: Record<string, boolean> = {}
  for (const event of events) {
    if (event.location_id) {
      const startTime = new Date(event.start_time)
      const endTime = new Date(event.end_time)
      const conflict = await hasConflict(event.location_id, startTime, endTime, supabase, event.id)
      initialConflicts[event.id] = conflict
    }
  }

  return (
    <PendingQueueClient
      batches={batches}
      individualEvents={individualEvents}
      locations={locations}
      initialConflicts={initialConflicts}
      adminRole={adminUser.role}
    />
  )
}
