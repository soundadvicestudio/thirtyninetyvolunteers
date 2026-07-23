export type CalendarEventStatus = 'pending' | 'approved' | 'cancelled'
export type CalendarEventSource = 'show' | 'manual'
export type CalendarEventType =
  | 'performance'
  | 'rehearsal'
  | 'teaching'
  | 'meeting'
  | 'event'
  | 'rental'
  | 'other'

export type CalendarEvent = {
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
  status: CalendarEventStatus
  source: CalendarEventSource
  source_show_date_id: string | null
  rehearsal_batch_id: string | null
  recurrence_group_id: string | null
  submitted_by: string | null
  submitted_by_admin: { id: string; name: string } | null
  approved_by: string | null
  created_at: string
  updated_at: string
  contacts: CalendarEventContact[]
}

export type RecurrenceGroupFrequency = 'weekly' | 'biweekly' | 'monthly'

export type RecurrenceGroupStatus = 'active' | 'cancelled'

export type RecurrenceGroup = {
  id: string
  title: string
  event_type: string
  custom_type_label: string | null
  location_id: string | null
  start_time: string
  end_time: string
  description: string | null
  requirements: string | null
  frequency: RecurrenceGroupFrequency
  series_start_date: string
  series_end_date: string | null
  status: RecurrenceGroupStatus
  submitted_by: string
  created_at: string
  events?: CalendarEvent[]
}

export type CalendarEventContact = {
  id: string
  calendar_event_id: string
  name: string
  phone: string
  sort_order: number
  created_at: string
}

export type RehearsalBatch = {
  id: string
  title: string
  submitted_by: string
  submitted_by_admin: { id: string; name: string } | null
  created_at: string
  events?: CalendarEvent[]
}

export type ShowDateBuffer = {
  id: string
  show_date_id: string
  buffer_before_minutes: number
  buffer_after_minutes: number
  created_at: string
}
