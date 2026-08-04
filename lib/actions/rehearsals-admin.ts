'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { resolveEffectiveRoster, computeEffectiveRosterIds } from '@/lib/utils/rehearsal-roster'
import type {
  RehearsalScheduleRow,
  RehearsalScheduleDetail,
  RehearsalEventRow,
  RehearsalScheduleAssignee,
  RehearsalActionResult,
  RehearsalAttendanceEntry,
} from '@/types/rehearsal'
import type { EffectiveRosterMember } from '@/lib/utils/rehearsal-roster'

const EDITOR_TIER_ROLES = ['super_admin', 'owner_admin', 'editor']

export type GetRehearsalSchedulesResult =
  | { success: true; schedules: RehearsalScheduleRow[] }
  | { success: false; error: string }

export async function getRehearsalSchedules(): Promise<GetRehearsalSchedulesResult> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) return { success: false, error: 'Feature not enabled' }

  let batchQuery = supabase
    .from('rehearsal_batches')
    .select('id, title, submitted_by, created_at')
    .order('created_at', { ascending: false })

  if (admin.role === 'production') {
    const { data: assignedRows } = await supabase
      .from('rehearsal_schedule_assignments')
      .select('rehearsal_batch_id')
      .eq('admin_user_id', admin.id)

    const ids = Array.from(new Set((assignedRows ?? []).map((r) => r.rehearsal_batch_id)))
    if (ids.length === 0) return { success: true, schedules: [] }
    batchQuery = batchQuery.in('id', ids)
  }

  const { data: batches, error: batchesError } = await batchQuery
  if (batchesError) return { success: false, error: batchesError.message }
  if (!batches || batches.length === 0) return { success: true, schedules: [] }

  const batchIds = batches.map((b) => b.id)

  const [{ data: events }, { data: assignments }] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('id, rehearsal_batch_id, start_time, status')
      .in('rehearsal_batch_id', batchIds),
    supabase
      .from('rehearsal_schedule_assignments')
      .select('rehearsal_batch_id, admin_user_id')
      .in('rehearsal_batch_id', batchIds),
  ])

  const todayIso = new Date().toISOString()

  const schedules: RehearsalScheduleRow[] = batches.map((batch) => {
    const batchEvents = (events ?? []).filter((e) => e.rehearsal_batch_id === batch.id)
    const batchAssigneeIds = new Set(
      (assignments ?? []).filter((a) => a.rehearsal_batch_id === batch.id).map((a) => a.admin_user_id)
    )

    const sortedTimes = batchEvents.map((e) => e.start_time).sort()
    const statuses = new Set(batchEvents.map((e) => e.status))
    let status: 'pending' | 'approved' | 'cancelled' | 'partial' = 'cancelled'
    if (statuses.size === 1) {
      status = [...statuses][0] as 'pending' | 'approved' | 'cancelled'
    } else if (statuses.size > 1) {
      status = 'partial'
    }

    const futureTimes = sortedTimes.filter((t) => t >= todayIso)

    return {
      id: batch.id,
      title: batch.title,
      submittedBy: batch.submitted_by,
      createdAt: batch.created_at,
      eventCount: batchEvents.length,
      assigneeCount: batchAssigneeIds.size,
      dateRangeStart: sortedTimes[0] ?? null,
      dateRangeEnd: sortedTimes[sortedTimes.length - 1] ?? null,
      nextDate: futureTimes[0] ?? null,
      status,
    }
  })

  return { success: true, schedules }
}

export type GetRehearsalScheduleDetailResult =
  | { success: true; detail: RehearsalScheduleDetail }
  | { success: false; error: string }

export async function getRehearsalScheduleDetail(batchId: string): Promise<GetRehearsalScheduleDetailResult> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) return { success: false, error: 'Feature not enabled' }

  const { data: batch, error: batchError } = await supabase
    .from('rehearsal_batches')
    .select('id, title, submitted_by, created_at')
    .eq('id', batchId)
    .single()

  if (batchError || !batch) return { success: false, error: 'Schedule not found.' }

  const { data: events } = await supabase
    .from('calendar_events')
    .select(
      'id, title, start_time, end_time, location_id, rehearsal_batch_id, status, check_in_token, location:locations(name)'
    )
    .eq('rehearsal_batch_id', batchId)
    .order('start_time', { ascending: true })

  const { data: assignments } = await supabase
    .from('rehearsal_schedule_assignments')
    .select('admin_user_id, admin_users(id, name, email, role)')
    .eq('rehearsal_batch_id', batchId)

  const scheduleAssigneeIds = (assignments ?? []).map((a: { admin_user_id: string }) => a.admin_user_id)

  const eventIds = (events ?? []).map((e) => e.id)

  const [{ data: overrideRows }, { data: attendanceRows }] = await Promise.all([
    eventIds.length > 0
      ? supabase
          .from('rehearsal_date_assignments')
          .select('calendar_event_id, admin_user_id, override_type')
          .in('calendar_event_id', eventIds)
      : Promise.resolve({ data: [] as { calendar_event_id: string; admin_user_id: string; override_type: string }[] }),
    eventIds.length > 0
      ? supabase.from('rehearsal_attendance').select('calendar_event_id').in('calendar_event_id', eventIds)
      : Promise.resolve({ data: [] as { calendar_event_id: string }[] }),
  ])

  const eventRows: RehearsalEventRow[] = (events ?? []).map((e) => {
    const eventOverrides = (overrideRows ?? []).filter((o) => o.calendar_event_id === e.id)
    const excludeIds = eventOverrides.filter((o) => o.override_type === 'exclude').map((o) => o.admin_user_id)
    const includeIds = eventOverrides.filter((o) => o.override_type === 'include').map((o) => o.admin_user_id)
    const rosterCount = computeEffectiveRosterIds(scheduleAssigneeIds, excludeIds, includeIds).length

    return {
      id: e.id,
      title: e.title,
      start_time: e.start_time,
      end_time: e.end_time,
      location_id: e.location_id,
      rehearsal_batch_id: e.rehearsal_batch_id,
      status: e.status,
      check_in_token: e.check_in_token,
      location_name: Array.isArray(e.location) ? (e.location[0]?.name ?? null) : null,
      rosterCount,
      overrideCount: eventOverrides.length,
      attendanceCount: (attendanceRows ?? []).filter((a) => a.calendar_event_id === e.id).length,
    }
  })

  const scheduleAssignees: RehearsalScheduleAssignee[] = (assignments ?? []).map(
    (a: { admin_user_id: string; admin_users: { id: string; name: string; email: string; role: string }[] }) => {
      const user = a.admin_users?.[0]
      return {
        adminUserId: a.admin_user_id,
        name: user?.name ?? '',
        email: user?.email ?? '',
        role: user?.role ?? '',
        overrideCount: (overrideRows ?? []).filter((o) => o.admin_user_id === a.admin_user_id).length,
      }
    }
  )

  return {
    success: true,
    detail: {
      batch: { id: batch.id, title: batch.title, submittedBy: batch.submitted_by, createdAt: batch.created_at },
      events: eventRows,
      scheduleAssignees,
    },
  }
}

export type GetEffectiveRosterResult =
  | { success: true; roster: EffectiveRosterMember[] }
  | { success: false; error: string }

export async function getEffectiveRoster(calendarEventId: string): Promise<GetEffectiveRosterResult> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) return { success: false, error: 'Feature not enabled' }

  const { data: event, error: eventError } = await supabase
    .from('calendar_events')
    .select('id, rehearsal_batch_id')
    .eq('id', calendarEventId)
    .single()

  if (eventError || !event) return { success: false, error: 'Event not found.' }

  const roster = await resolveEffectiveRoster(supabase, event.id, event.rehearsal_batch_id)
  return { success: true, roster }
}

export async function assignUserToSchedule(batchId: string, adminUserId: string): Promise<RehearsalActionResult> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) return { success: false, error: 'Feature not enabled' }
  if (!EDITOR_TIER_ROLES.includes(admin.role)) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('rehearsal_schedule_assignments')
    .upsert(
      { rehearsal_batch_id: batchId, admin_user_id: adminUserId, assigned_by: admin.id },
      { onConflict: 'rehearsal_batch_id,admin_user_id', ignoreDuplicates: true }
    )

  if (error) return { success: false, error: error.message }

  revalidatePath(`/crew/rehearsals/${batchId}`)
  return { success: true }
}

export async function removeUserFromSchedule(batchId: string, adminUserId: string): Promise<RehearsalActionResult> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) return { success: false, error: 'Feature not enabled' }
  if (!EDITOR_TIER_ROLES.includes(admin.role)) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('rehearsal_schedule_assignments')
    .delete()
    .eq('rehearsal_batch_id', batchId)
    .eq('admin_user_id', adminUserId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/crew/rehearsals/${batchId}`)
  return { success: true }
}

export async function addDateOverride(
  calendarEventId: string,
  adminUserId: string,
  overrideType: 'include' | 'exclude'
): Promise<RehearsalActionResult> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) return { success: false, error: 'Feature not enabled' }
  if (!EDITOR_TIER_ROLES.includes(admin.role)) return { success: false, error: 'Unauthorized' }

  const { data: event, error: eventError } = await supabase
    .from('calendar_events')
    .select('rehearsal_batch_id')
    .eq('id', calendarEventId)
    .single()

  if (eventError || !event) return { success: false, error: 'Event not found.' }

  const { error } = await supabase.from('rehearsal_date_assignments').upsert(
    {
      calendar_event_id: calendarEventId,
      admin_user_id: adminUserId,
      override_type: overrideType,
      created_by: admin.id,
    },
    { onConflict: 'calendar_event_id,admin_user_id' }
  )

  if (error) return { success: false, error: error.message }

  revalidatePath(`/crew/rehearsals/${event.rehearsal_batch_id}`)
  return { success: true }
}

export async function removeDateOverride(calendarEventId: string, adminUserId: string): Promise<RehearsalActionResult> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) return { success: false, error: 'Feature not enabled' }
  if (!EDITOR_TIER_ROLES.includes(admin.role)) return { success: false, error: 'Unauthorized' }

  const { data: event, error: eventError } = await supabase
    .from('calendar_events')
    .select('rehearsal_batch_id')
    .eq('id', calendarEventId)
    .single()

  if (eventError || !event) return { success: false, error: 'Event not found.' }

  const { error } = await supabase
    .from('rehearsal_date_assignments')
    .delete()
    .eq('calendar_event_id', calendarEventId)
    .eq('admin_user_id', adminUserId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/crew/rehearsals/${event.rehearsal_batch_id}`)
  return { success: true }
}

export async function markRehearsalAttendance(
  calendarEventId: string,
  adminUserId: string,
  status: 'showed' | 'no-show' | 'excused'
): Promise<RehearsalActionResult> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) return { success: false, error: 'Feature not enabled' }

  const isEditorTier = EDITOR_TIER_ROLES.includes(admin.role)

  if (!isEditorTier) {
    if (admin.role !== 'production') return { success: false, error: 'Unauthorized' }
    if (adminUserId !== admin.id) return { success: false, error: 'You can only mark your own attendance.' }
  }

  const { data: event, error: eventError } = await supabase
    .from('calendar_events')
    .select('id, rehearsal_batch_id')
    .eq('id', calendarEventId)
    .single()

  if (eventError || !event) return { success: false, error: 'Event not found.' }

  if (!isEditorTier) {
    const roster = await resolveEffectiveRoster(supabase, event.id, event.rehearsal_batch_id)
    const onRoster = roster.some((r) => r.id === admin.id)
    if (!onRoster) return { success: false, error: 'Not on roster' }
  }

  const { error } = await supabase.from('rehearsal_attendance').upsert(
    {
      calendar_event_id: calendarEventId,
      admin_user_id: adminUserId,
      status,
      source: 'manual',
      marked_by: admin.id,
    },
    { onConflict: 'calendar_event_id,admin_user_id' }
  )

  if (error) return { success: false, error: error.message }

  revalidatePath(`/crew/rehearsals/${event.rehearsal_batch_id}`)
  return { success: true }
}

export type GetRehearsalAttendanceForEventResult =
  | { success: true; attendance: RehearsalAttendanceEntry[] }
  | { success: false; error: string }

// Returns the full effective roster for the event, LEFT-JOINed against
// rehearsal_attendance — every roster member appears even if they have no
// attendance record yet (status/source/checkedInAt = null in that case).
// Querying rehearsal_attendance alone would silently omit unmarked members.
export async function getRehearsalAttendanceForEvent(
  calendarEventId: string
): Promise<GetRehearsalAttendanceForEventResult> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { success: false, error: 'Unauthorized' }
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) return { success: false, error: 'Feature not enabled' }

  const { data: event, error: eventError } = await supabase
    .from('calendar_events')
    .select('id, rehearsal_batch_id')
    .eq('id', calendarEventId)
    .single()

  if (eventError || !event) return { success: false, error: 'Event not found.' }

  const roster = await resolveEffectiveRoster(supabase, event.id, event.rehearsal_batch_id)
  if (roster.length === 0) return { success: true, attendance: [] }

  const rosterIds = roster.map((r) => r.id)

  const { data: attendanceRows } = await supabase
    .from('rehearsal_attendance')
    .select('admin_user_id, status, source, checked_in_at')
    .eq('calendar_event_id', calendarEventId)
    .in('admin_user_id', rosterIds)

  const attendanceMap = new Map((attendanceRows ?? []).map((row) => [row.admin_user_id, row]))

  const attendance: RehearsalAttendanceEntry[] = roster.map((member) => {
    const row = attendanceMap.get(member.id)
    return {
      adminUserId: member.id,
      name: member.full_name,
      role: member.role,
      status: row?.status ?? null,
      source: row?.source ?? null,
      checkedInAt: row?.checked_in_at ?? null,
    }
  })

  return { success: true, attendance }
}

export type MarkAllRehearsalAttendedResult = { success: boolean; markedCount: number; error?: string }

export async function markAllRehearsalAttended(calendarEventId: string): Promise<MarkAllRehearsalAttendedResult> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { success: false, markedCount: 0, error: 'Unauthorized' }
  const flags = await getFeatureFlags(supabase)
  if (!flags.rehearsals) return { success: false, markedCount: 0, error: 'Feature not enabled' }
  if (!EDITOR_TIER_ROLES.includes(admin.role)) return { success: false, markedCount: 0, error: 'Unauthorized' }

  const { data: event, error: eventError } = await supabase
    .from('calendar_events')
    .select('id, rehearsal_batch_id')
    .eq('id', calendarEventId)
    .single()

  if (eventError || !event) return { success: false, markedCount: 0, error: 'Event not found.' }

  const roster = await resolveEffectiveRoster(supabase, event.id, event.rehearsal_batch_id)
  if (roster.length === 0) return { success: true, markedCount: 0 }

  const { error } = await supabase.from('rehearsal_attendance').upsert(
    roster.map((member) => ({
      calendar_event_id: calendarEventId,
      admin_user_id: member.id,
      status: 'showed' as const,
      source: 'manual' as const,
      marked_by: admin.id,
    })),
    { onConflict: 'calendar_event_id,admin_user_id' }
  )

  if (error) return { success: false, markedCount: 0, error: error.message }

  revalidatePath(`/crew/rehearsals/${event.rehearsal_batch_id}`)
  return { success: true, markedCount: roster.length }
}
