'use server'

import { revalidatePath } from 'next/cache'
import { fromZonedTime } from 'date-fns-tz'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { hasConflict } from '@/lib/utils/calendar-conflict'
import { normalizePhone } from '@/lib/utils/phone'
import {
  calendarEventSubmitSchema,
  rehearsalBatchSchema,
  type CalendarEventFormData,
  type RehearsalBatchFormData,
} from '@/lib/validations/calendar'

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

  const canDirectCreate = admin.role === 'super_admin' || admin.calendar_editor === true
  const status = canDirectCreate ? 'approved' : 'pending'
  const approvedBy = canDirectCreate ? admin.id : null

  if (canDirectCreate && !value.location_id) {
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

export type CreateRehearsalBatchResult = {
  success: boolean
  error?: string
  batchId?: string
  createdCount?: number
  failedDates?: { date: string; error: string }[]
}

export async function createRehearsalBatch(formData: RehearsalBatchFormData): Promise<CreateRehearsalBatchResult> {
  const admin = await getAdminUser()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = rehearsalBatchSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }
  const value = parsed.data

  const canDirectCreate = admin.role === 'super_admin' || admin.calendar_editor === true
  if (canDirectCreate && !value.location_id) {
    return { success: false, error: 'Location is required' }
  }

  const supabase = await getServerClient()

  const { data: batch, error: batchError } = await supabase
    .from('rehearsal_batches')
    .insert({ title: value.title, submitted_by: admin.id })
    .select('id')
    .single()

  if (batchError || !batch) {
    console.error('createRehearsalBatch insert error:', batchError)
    return { success: false, error: batchError?.message ?? 'Something went wrong creating the batch.' }
  }

  const status = canDirectCreate ? 'approved' : 'pending'
  const approvedBy = canDirectCreate ? admin.id : null
  const contacts = (value.contacts ?? []).map((c) => ({ ...c, phone: normalizePhone(c.phone) }))

  let createdCount = 0
  const failedDates: { date: string; error: string }[] = []

  for (const rehearsalDate of value.dates) {
    const { startUTC, endUTC } = buildEventTimes(rehearsalDate.date, rehearsalDate.start_time, rehearsalDate.end_time)

    if (canDirectCreate && value.location_id) {
      const conflict = await hasConflict(value.location_id, startUTC, endUTC, supabase)
      if (conflict) {
        failedDates.push({ date: rehearsalDate.date, error: 'Time slot conflicts with an existing booking.' })
        continue
      }
    }

    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        title: value.title,
        event_type: 'rehearsal',
        location_id: value.location_id || null,
        start_time: startUTC.toISOString(),
        end_time: endUTC.toISOString(),
        description: value.description || null,
        requirements: value.requirements || null,
        status,
        source: 'manual',
        rehearsal_batch_id: batch.id,
        submitted_by: admin.id,
        approved_by: approvedBy,
      })
      .select('id')
      .single()

    if (eventError || !event) {
      console.error('createRehearsalBatch event insert error:', eventError)
      failedDates.push({ date: rehearsalDate.date, error: eventError?.message ?? 'Failed to create event.' })
      continue
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

    createdCount++
  }

  revalidatePath('/crew/calendar')
  revalidatePath('/crew/calendar/pending')

  if (createdCount === 0) {
    return {
      success: false,
      error: 'No rehearsal dates could be created.',
      batchId: batch.id,
      createdCount,
      failedDates,
    }
  }

  return {
    success: true,
    batchId: batch.id,
    createdCount,
    failedDates: failedDates.length > 0 ? failedDates : undefined,
  }
}

export type ApproveCalendarEventResult = { success: boolean; error?: string }

export async function approveCalendarEvent(eventId: string, locationId: string): Promise<ApproveCalendarEventResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: event, error: fetchError } = await supabase
    .from('calendar_events')
    .select('id, start_time, end_time')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) {
    return { success: false, error: 'Event not found.' }
  }

  const conflict = await hasConflict(
    locationId,
    new Date(event.start_time),
    new Date(event.end_time),
    supabase,
    eventId
  )
  if (conflict) {
    return { success: false, error: 'This time slot conflicts with an existing approved booking.' }
  }

  const { error: updateError } = await supabase
    .from('calendar_events')
    .update({ status: 'approved', location_id: locationId, approved_by: admin.id })
    .eq('id', eventId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/crew/calendar')
  revalidatePath('/crew/calendar/pending')

  return { success: true }
}

export type ApproveBatchResult = {
  success: boolean
  error?: string
  approvedCount?: number
  skipped?: { eventId: string; error: string }[]
}

export async function approveBatch(
  batchId: string,
  approvals: { eventId: string; locationId: string }[]
): Promise<ApproveBatchResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await getServerClient()
  let approvedCount = 0
  const skipped: { eventId: string; error: string }[] = []

  for (const approval of approvals) {
    const { data: event, error: fetchError } = await supabase
      .from('calendar_events')
      .select('id, start_time, end_time')
      .eq('id', approval.eventId)
      .eq('rehearsal_batch_id', batchId)
      .single()

    if (fetchError || !event) {
      skipped.push({ eventId: approval.eventId, error: 'Event not found in this batch.' })
      continue
    }

    const conflict = await hasConflict(
      approval.locationId,
      new Date(event.start_time),
      new Date(event.end_time),
      supabase,
      approval.eventId
    )
    if (conflict) {
      skipped.push({ eventId: approval.eventId, error: 'Time slot conflicts with an existing booking.' })
      continue
    }

    const { error: updateError } = await supabase
      .from('calendar_events')
      .update({ status: 'approved', location_id: approval.locationId, approved_by: admin.id })
      .eq('id', approval.eventId)

    if (updateError) {
      skipped.push({ eventId: approval.eventId, error: updateError.message })
      continue
    }

    approvedCount++
  }

  revalidatePath('/crew/calendar')
  revalidatePath('/crew/calendar/pending')

  return { success: true, approvedCount, skipped: skipped.length > 0 ? skipped : undefined }
}

export type CancelCalendarEventResult = { success: boolean; error?: string }

export async function cancelCalendarEvent(eventId: string): Promise<CancelCalendarEventResult> {
  const admin = await getAdminUser()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: event, error: fetchError } = await supabase
    .from('calendar_events')
    .select('id, submitted_by')
    .eq('id', eventId)
    .single()

  if (fetchError || !event) {
    return { success: false, error: 'Event not found.' }
  }

  const canCancel = admin.role === 'super_admin' || event.submitted_by === admin.id
  if (!canCancel) {
    return { success: false, error: 'You do not have permission to cancel this event.' }
  }

  const { error: updateError } = await supabase
    .from('calendar_events')
    .update({ status: 'cancelled' })
    .eq('id', eventId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath('/crew/calendar')
  revalidatePath('/crew/calendar/pending')

  return { success: true }
}

export type LocationAvailability = {
  locationId: string
  locationName: string
  color: string
  available: boolean
  conflictingEvent?: { title: string; start_time: string; end_time: string }
}

export type FindAvailableSlotsResult = {
  success: boolean
  error?: string
  results?: LocationAvailability[]
}

export async function findAvailableSlots(
  date: string,
  startTime: string,
  endTime: string,
  locationId?: string
): Promise<FindAvailableSlotsResult> {
  const admin = await getAdminUser()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  if (endTime <= startTime) {
    return { success: false, error: 'End time must be after start time.' }
  }

  const supabase = await getServerClient()

  const { data: locationRows, error: locError } = await supabase
    .from('locations')
    .select('id, name, color')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (locError) {
    return { success: false, error: locError.message }
  }

  const targetLocations = locationId ? (locationRows ?? []).filter((l) => l.id === locationId) : (locationRows ?? [])

  const { startUTC, endUTC } = buildEventTimes(date, startTime, endTime)

  const results: LocationAvailability[] = []
  for (const loc of targetLocations) {
    const { data: conflicts } = await supabase
      .from('calendar_events')
      .select('title, start_time, end_time')
      .eq('location_id', loc.id)
      .eq('status', 'approved')
      .lt('start_time', endUTC.toISOString())
      .gt('end_time', startUTC.toISOString())
      .limit(1)

    const conflictingEvent = (conflicts ?? [])[0]

    results.push({
      locationId: loc.id,
      locationName: loc.name,
      color: loc.color,
      available: !conflictingEvent,
      conflictingEvent: conflictingEvent
        ? {
            title: conflictingEvent.title,
            start_time: conflictingEvent.start_time,
            end_time: conflictingEvent.end_time,
          }
        : undefined,
    })
  }

  return { success: true, results }
}
