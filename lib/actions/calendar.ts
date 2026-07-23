'use server'

import { revalidatePath } from 'next/cache'
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { hasConflict } from '@/lib/utils/calendar-conflict'
import { normalizePhone } from '@/lib/utils/phone'
import { logAction } from '@/lib/audit'
import { generateOccurrenceDates } from '@/lib/utils/calendar-recurrence'
import {
  calendarEventSubmitSchema,
  rehearsalBatchSchema,
  recurringEventSchema,
  type CalendarEventFormData,
  type RehearsalBatchFormData,
  type RecurringEventFormData,
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
  slots?: LocationAvailability[]
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

  const slots: LocationAvailability[] = []
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

    slots.push({
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

  return { success: true, slots }
}

export async function rotateCalendarToken(): Promise<{
  success: boolean
  newToken?: string
  error?: string
}> {
  const admin = await getAdminUser()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  const newToken = crypto.randomUUID()
  const supabase = await getServerClient()

  const { error } = await supabase
    .from('admin_users')
    .update({ calendar_subscription_token: newToken })
    .eq('id', admin.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, newToken }
}

export type CreateRecurringEventResult = {
  success: boolean
  error?: string
  groupId?: string
  occurrenceCount?: number
}

export async function createRecurringEvent(formData: RecurringEventFormData): Promise<CreateRecurringEventResult> {
  const admin = await getAdminUser()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  const parsed = recurringEventSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' }
  }
  const data = parsed.data

  const canDirectCreate = admin.role === 'super_admin' || admin.calendar_editor === true
  const status = canDirectCreate ? 'approved' : 'pending'
  const approvedBy = canDirectCreate ? admin.id : null

  if (canDirectCreate && !data.location_id) {
    return { success: false, error: 'Location is required' }
  }

  const dates = generateOccurrenceDates(data.series_start_date, data.frequency, data.series_end_date || null)
  if (dates.length === 0) {
    return { success: false, error: 'No occurrences could be generated for the selected dates.' }
  }

  const supabase = await getServerClient()

  const { data: group, error: groupError } = await supabase
    .from('recurrence_groups')
    .insert({
      title: data.title,
      event_type: data.event_type,
      custom_type_label: data.custom_type_label || null,
      location_id: data.location_id || null,
      start_time: data.start_time,
      end_time: data.end_time,
      description: data.description || null,
      requirements: data.requirements || null,
      frequency: data.frequency,
      series_start_date: data.series_start_date,
      series_end_date: data.series_end_date || null,
      submitted_by: admin.id,
    })
    .select('id')
    .single()

  if (groupError || !group) {
    console.error('createRecurringEvent group insert error:', groupError)
    return { success: false, error: groupError?.message ?? 'Something went wrong creating the series.' }
  }

  const eventRows = dates.map((date) => {
    const { startUTC, endUTC } = buildEventTimes(date, data.start_time, data.end_time)
    return {
      title: data.title,
      event_type: data.event_type,
      custom_type_label: data.custom_type_label || null,
      location_id: data.location_id || null,
      start_time: startUTC.toISOString(),
      end_time: endUTC.toISOString(),
      description: data.description || null,
      requirements: data.requirements || null,
      status,
      source: 'manual' as const,
      submitted_by: admin.id,
      approved_by: approvedBy,
      recurrence_group_id: group.id,
    }
  })

  const { data: inserted, error: eventsError } = await supabase.from('calendar_events').insert(eventRows).select('id')

  if (eventsError) {
    console.error('createRecurringEvent events insert error:', eventsError)
    return { success: false, error: eventsError.message }
  }
  const insertedIds = (inserted ?? []).map((r) => r.id)

  const normalizedContacts = (data.contacts ?? []).map((c, i) => ({
    ...c,
    phone: normalizePhone(c.phone),
    sort_order: i,
  }))

  if (normalizedContacts.length > 0 && insertedIds.length > 0) {
    const contactRows = insertedIds.flatMap((eventId) =>
      normalizedContacts.map((c) => ({
        calendar_event_id: eventId,
        name: c.name,
        phone: c.phone,
        sort_order: c.sort_order,
      }))
    )
    await supabase.from('calendar_event_contacts').insert(contactRows)
  }

  await logAction(admin.id, 'recurring_event.create', 'recurrence_group', group.id, undefined, {
    title: data.title,
    frequency: data.frequency,
    occurrence_count: insertedIds.length,
    status,
  })

  revalidatePath('/crew/calendar')
  revalidatePath('/crew/calendar/pending')

  return { success: true, groupId: group.id, occurrenceCount: insertedIds.length }
}

export type EditRecurringOccurrenceResult = { success: boolean; error?: string }

export async function editRecurringOccurrence(
  eventId: string,
  scope: 'this' | 'future' | 'all',
  formData: Partial<RecurringEventFormData>
): Promise<EditRecurringOccurrenceResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: targetEvent, error: fetchError } = await supabase
    .from('calendar_events')
    .select('id, start_time, end_time, recurrence_group_id')
    .eq('id', eventId)
    .single()

  if (fetchError || !targetEvent) {
    return { success: false, error: 'Event not found' }
  }

  // No parent series: any requested scope collapses to 'this'.
  const effectiveScope: 'this' | 'future' | 'all' = targetEvent.recurrence_group_id ? scope : 'this'

  const scalarUpdate: Record<string, unknown> = {}
  if (formData.title !== undefined) scalarUpdate.title = formData.title
  if (formData.event_type !== undefined) scalarUpdate.event_type = formData.event_type
  if (formData.custom_type_label !== undefined) scalarUpdate.custom_type_label = formData.custom_type_label || null
  if (formData.location_id !== undefined) scalarUpdate.location_id = formData.location_id || null
  if (formData.description !== undefined) scalarUpdate.description = formData.description || null
  if (formData.requirements !== undefined) scalarUpdate.requirements = formData.requirements || null

  const hasTimeChange = formData.start_time !== undefined || formData.end_time !== undefined

  if (effectiveScope === 'this') {
    const thisUpdate: Record<string, unknown> = { ...scalarUpdate }
    if (hasTimeChange) {
      const eventDate = formatInTimeZone(new Date(targetEvent.start_time), CT, 'yyyy-MM-dd')
      const startTime = formData.start_time ?? formatInTimeZone(new Date(targetEvent.start_time), CT, 'HH:mm')
      const endTime = formData.end_time ?? formatInTimeZone(new Date(targetEvent.end_time), CT, 'HH:mm')
      const { startUTC, endUTC } = buildEventTimes(eventDate, startTime, endTime)
      thisUpdate.start_time = startUTC.toISOString()
      thisUpdate.end_time = endUTC.toISOString()
    }
    // Editing a single occurrence detaches it from the series.
    thisUpdate.recurrence_group_id = null

    const { error: updateError } = await supabase.from('calendar_events').update(thisUpdate).eq('id', eventId)
    if (updateError) {
      return { success: false, error: updateError.message }
    }
  } else {
    let query = supabase
      .from('calendar_events')
      .select('id, start_time, end_time')
      .eq('recurrence_group_id', targetEvent.recurrence_group_id)

    if (effectiveScope === 'future') {
      query = query.gte('start_time', targetEvent.start_time)
    }

    const { data: affectedEvents } = await query

    await Promise.all(
      (affectedEvents ?? []).map((ev) => {
        const evUpdate: Record<string, unknown> = { ...scalarUpdate }
        if (hasTimeChange) {
          const evDate = formatInTimeZone(new Date(ev.start_time), CT, 'yyyy-MM-dd')
          const startTime = formData.start_time ?? formatInTimeZone(new Date(ev.start_time), CT, 'HH:mm')
          const endTime = formData.end_time ?? formatInTimeZone(new Date(ev.end_time), CT, 'HH:mm')
          const { startUTC, endUTC } = buildEventTimes(evDate, startTime, endTime)
          evUpdate.start_time = startUTC.toISOString()
          evUpdate.end_time = endUTC.toISOString()
        }
        return supabase.from('calendar_events').update(evUpdate).eq('id', ev.id)
      })
    )

    const groupUpdate: Record<string, unknown> = {}
    if (formData.title !== undefined) groupUpdate.title = formData.title
    if (formData.location_id !== undefined) groupUpdate.location_id = formData.location_id || null
    if (formData.description !== undefined) groupUpdate.description = formData.description || null
    if (formData.requirements !== undefined) groupUpdate.requirements = formData.requirements || null

    if (Object.keys(groupUpdate).length > 0) {
      await supabase.from('recurrence_groups').update(groupUpdate).eq('id', targetEvent.recurrence_group_id)
    }
  }

  await logAction(
    admin.id,
    'recurring_event.edit',
    'recurrence_group',
    targetEvent.recurrence_group_id ?? eventId,
    undefined,
    { scope: effectiveScope, fields: Object.keys(formData) }
  )

  revalidatePath('/crew/calendar')
  revalidatePath('/crew/calendar/pending')

  return { success: true }
}

export type CancelRecurringOccurrenceResult = { success: boolean; error?: string }

export async function cancelRecurringOccurrence(
  eventId: string,
  scope: 'this' | 'future' | 'all'
): Promise<CancelRecurringOccurrenceResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: targetEvent, error: fetchError } = await supabase
    .from('calendar_events')
    .select('id, start_time, recurrence_group_id')
    .eq('id', eventId)
    .single()

  if (fetchError || !targetEvent) {
    return { success: false, error: 'Event not found' }
  }

  // No parent series: any requested scope collapses to 'this' — guards
  // against an .eq('recurrence_group_id', null) matching unintended rows.
  const effectiveScope: 'this' | 'future' | 'all' = targetEvent.recurrence_group_id ? scope : 'this'

  if (effectiveScope === 'this') {
    const { error: updateError } = await supabase.from('calendar_events').update({ status: 'cancelled' }).eq('id', eventId)
    if (updateError) {
      return { success: false, error: updateError.message }
    }
  } else if (effectiveScope === 'future') {
    const { error: updateError } = await supabase
      .from('calendar_events')
      .update({ status: 'cancelled' })
      .eq('recurrence_group_id', targetEvent.recurrence_group_id)
      .gte('start_time', targetEvent.start_time)
    if (updateError) {
      return { success: false, error: updateError.message }
    }
  } else {
    const { error: updateError } = await supabase
      .from('calendar_events')
      .update({ status: 'cancelled' })
      .eq('recurrence_group_id', targetEvent.recurrence_group_id)
    if (updateError) {
      return { success: false, error: updateError.message }
    }
    await supabase.from('recurrence_groups').update({ status: 'cancelled' }).eq('id', targetEvent.recurrence_group_id)
  }

  await logAction(
    admin.id,
    'recurring_event.cancel',
    'recurrence_group',
    targetEvent.recurrence_group_id ?? eventId,
    undefined,
    { scope: effectiveScope }
  )

  revalidatePath('/crew/calendar')
  revalidatePath('/crew/calendar/pending')

  return { success: true }
}
