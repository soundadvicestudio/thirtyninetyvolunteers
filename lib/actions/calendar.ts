'use server'

import { revalidatePath } from 'next/cache'
import { fromZonedTime } from 'date-fns-tz'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { hasConflict } from '@/lib/utils/calendar-conflict'
import { normalizePhone } from '@/lib/utils/phone'
import { calendarEventSubmitSchema, type CalendarEventFormData } from '@/lib/validations/calendar'

const CT = 'America/Chicago'

function buildEventTimes(date: string, startTime: string, endTime: string): { startUTC: Date; endUTC: Date } {
  const startUTC = fromZonedTime(`${date} ${startTime}:00`, CT)
  const endUTC = fromZonedTime(`${date} ${endTime}:00`, CT)
  return { startUTC, endUTC }
}

export async function checkEventConflict(
  locationId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeEventId?: string
): Promise<{ conflict: boolean; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return { conflict: false, error: 'Unauthorized' }
    }

    const { startUTC, endUTC } = buildEventTimes(date, startTime, endTime)
    const supabase = await getServerClient()

    const conflict = await hasConflict(locationId, startUTC, endUTC, supabase, excludeEventId)
    return { conflict }
  } catch (err) {
    return { conflict: false, error: err instanceof Error ? err.message : 'Something went wrong.' }
  }
}

export type CreateCalendarEventResult = { success: boolean; error?: string; eventId?: string }

export async function createCalendarEvent(formData: CalendarEventFormData): Promise<CreateCalendarEventResult> {
  const admin = await getAdminUser()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = calendarEventSubmitSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }
  const value = parsed.data

  const isSuperAdmin = admin.role === 'super_admin'
  const status = isSuperAdmin ? 'approved' : 'pending'
  const approvedBy = isSuperAdmin ? admin.id : null

  if (isSuperAdmin && !value.location_id) {
    return { success: false, error: 'Location is required' }
  }

  const { startUTC, endUTC } = buildEventTimes(value.date, value.start_time, value.end_time)

  const contacts = (value.contacts ?? []).map((c) => ({ ...c, phone: normalizePhone(c.phone) }))

  const supabase = await getServerClient()

  const { data: event, error: eventError } = await supabase
    .from('calendar_events')
    .insert({
      title: value.title,
      event_type: value.event_type,
      custom_type_label: value.custom_type_label || null,
      location_id: value.location_id || null,
      start_time: startUTC.toISOString(),
      end_time: endUTC.toISOString(),
      description: value.description || null,
      requirements: value.requirements || null,
      status,
      source: 'manual',
      submitted_by: admin.id,
      approved_by: approvedBy,
    })
    .select('id')
    .single()

  if (eventError || !event) {
    console.error('createCalendarEvent insert error:', eventError)
    return { success: false, error: eventError?.message ?? 'Something went wrong creating the event.' }
  }

  if (contacts.length > 0) {
    await supabase.from('calendar_event_contacts').insert(
      contacts.map((c, i) => ({
        calendar_event_id: event.id,
        name: c.name,
        phone: c.phone,
        sort_order: i,
      }))
    )
  }

  revalidatePath('/crew/calendar')
  revalidatePath('/crew/calendar/pending')

  return { success: true, eventId: event.id }
}

export type UpdateCalendarEventResult = { success: boolean; error?: string }

export async function updateCalendarEvent(
  eventId: string,
  formData: CalendarEventFormData
): Promise<UpdateCalendarEventResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = calendarEventSubmitSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }
  const value = parsed.data

  if (!value.location_id) {
    return { success: false, error: 'Location is required' }
  }

  const { startUTC, endUTC } = buildEventTimes(value.date, value.start_time, value.end_time)

  const contacts = (value.contacts ?? []).map((c) => ({ ...c, phone: normalizePhone(c.phone) }))

  const supabase = await getServerClient()

  const { error: updateError } = await supabase
    .from('calendar_events')
    .update({
      title: value.title,
      event_type: value.event_type,
      custom_type_label: value.custom_type_label || null,
      location_id: value.location_id || null,
      start_time: startUTC.toISOString(),
      end_time: endUTC.toISOString(),
      description: value.description || null,
      requirements: value.requirements || null,
    })
    .eq('id', eventId)

  if (updateError) {
    console.error('updateCalendarEvent update error:', updateError)
    return { success: false, error: updateError.message }
  }

  await supabase.from('calendar_event_contacts').delete().eq('calendar_event_id', eventId)

  if (contacts.length > 0) {
    await supabase.from('calendar_event_contacts').insert(
      contacts.map((c, i) => ({
        calendar_event_id: eventId,
        name: c.name,
        phone: c.phone,
        sort_order: i,
      }))
    )
  }

  revalidatePath('/crew/calendar')
  revalidatePath('/crew/calendar/pending')

  return { success: true }
}
