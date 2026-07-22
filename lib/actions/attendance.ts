'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'
import { logAction } from '@/lib/audit'
import { checkFirstCall, checkMilestones } from '@/lib/milestones'
import { formatCT } from '@/lib/utils/date'
import { getLocationHoursBucket } from '@/lib/utils/showDisplay'

export type MarkAttendanceParams = {
  slotClaimId: string
  showDateId: string
  showId: string
  newStatus: 'showed' | 'no_show' | 'excused'
}

export type MarkAttendanceResult =
  | { success: true; attendanceId: string; warning?: string }
  | { error: string }

export async function markAttendance(params: MarkAttendanceParams): Promise<MarkAttendanceResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const { slotClaimId, showDateId, showId, newStatus } = params
  const supabase = await getServerClient()

  const { data: showDate, error: showDateError } = await supabase
    .from('show_dates')
    .select('show_date')
    .eq('id', showDateId)
    .single()

  if (showDateError || !showDate) {
    return { error: 'Could not find this show date.' }
  }

  const todayCT = formatCT(new Date(), 'yyyy-MM-dd')
  if (showDate.show_date >= todayCT) {
    return { error: 'Attendance can only be marked for past dates.' }
  }

  const { data: claim, error: claimError } = await supabase
    .from('slot_claims')
    .select('volunteer_id, volunteer_name, volunteer_role_id')
    .eq('id', slotClaimId)
    .single()

  if (claimError || !claim) {
    return { error: 'Could not find this slot claim.' }
  }

  let hours = 0
  let showName = ''
  let roleName = ''

  if (newStatus === 'showed') {
    const [{ data: show, error: showError }, { data: role }] = await Promise.all([
      supabase
        .from('shows')
        .select('name, default_hours, location:locations(name)')
        .eq('id', showId)
        .single(),
      supabase.from('volunteer_roles').select('role_name').eq('id', claim.volunteer_role_id).single(),
    ])

    if (showError || !show) {
      return { error: 'Could not find this show.' }
    }

    showName = show.name
    roleName = role?.role_name ?? 'Role'

    if (show.default_hours != null) {
      hours = Number(show.default_hours)
    } else {
      const showLocation = (show as unknown as { location: { name: string } | null }).location
      const bucket = getLocationHoursBucket(showLocation?.name)
      const { data: setting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', `default_hours_${bucket}`)
        .maybeSingle()
      hours = setting?.value ? Number(setting.value) : 0
    }
  }

  const note = `${showName} — ${roleName}`

  const { data: previousRecord } = await supabase
    .from('attendance')
    .select('id, status, hours_logged')
    .eq('slot_claim_id', slotClaimId)
    .maybeSingle()

  async function insertHoursLog(volunteerId: string, hoursDelta: number, attId: string, noteText: string) {
    await supabase.from('volunteer_hours_log').insert({
      volunteer_id: volunteerId,
      hours: hoursDelta,
      source_type: 'attendance',
      source_id: attId,
      note: noteText,
      added_by: admin!.id,
    })
  }

  async function adjustVolunteerHours(volunteerId: string, delta: number) {
    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('total_hours')
      .eq('id', volunteerId)
      .single()
    if (volunteer) {
      await supabase
        .from('volunteers')
        .update({ total_hours: Number(volunteer.total_hours) + delta })
        .eq('id', volunteerId)
    }
  }

  let attendanceId: string

  if (!previousRecord) {
    const { data: inserted, error: insertError } = await supabase
      .from('attendance')
      .insert({
        slot_claim_id: slotClaimId,
        volunteer_id: claim.volunteer_id || null,
        show_id: showId,
        show_date_id: showDateId,
        status: newStatus,
        hours_logged: newStatus === 'showed' ? hours : 0,
        hours_confirmed: false,
        source: 'manual',
        marked_by: admin.id,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error('markAttendance insert error:', insertError)
      return { error: 'Something went wrong marking attendance. Please try again.' }
    }
    attendanceId = inserted.id

    if (newStatus === 'showed' && claim.volunteer_id) {
      await adjustVolunteerHours(claim.volunteer_id, hours)
      await insertHoursLog(claim.volunteer_id, hours, attendanceId, note)
    }
  } else {
    attendanceId = previousRecord.id
    let delta = 0
    if (previousRecord.status === 'showed' && newStatus !== 'showed') {
      delta = -Number(previousRecord.hours_logged)
    } else if (previousRecord.status !== 'showed' && newStatus === 'showed') {
      delta = hours
    }

    const { error: updateError } = await supabase
      .from('attendance')
      .update({
        status: newStatus,
        hours_logged: newStatus === 'showed' ? hours : 0,
        hours_confirmed: false,
        marked_by: admin.id,
        marked_at: new Date().toISOString(),
      })
      .eq('id', previousRecord.id)

    if (updateError) {
      console.error('markAttendance update error:', updateError)
      return { error: 'Something went wrong marking attendance. Please try again.' }
    }

    if (delta !== 0 && claim.volunteer_id) {
      await adjustVolunteerHours(claim.volunteer_id, delta)
      if (delta > 0) {
        await insertHoursLog(claim.volunteer_id, delta, attendanceId, note)
      } else {
        await insertHoursLog(
          claim.volunteer_id,
          delta,
          attendanceId,
          'Attendance status changed from Showed'
        )
      }
    }
  }

  if (!claim.volunteer_id) {
    await logAction(
      admin.id,
      'attendance.mark',
      'attendance',
      attendanceId,
      { status: previousRecord?.status ?? null },
      { status: newStatus, volunteer_id: null, show_id: showId, show_date_id: showDateId }
    )
    revalidatePath('/crew/dashboard')
    revalidatePath(`/crew/shows/${showId}`)
    return { success: true, attendanceId, warning: 'No linked volunteer — hours not tallied.' }
  }

  if (newStatus === 'showed') {
    const { count } = await supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('volunteer_id', claim.volunteer_id)
      .eq('status', 'showed')
    if (count === 1) {
      await checkFirstCall(claim.volunteer_id)
    }
    await checkMilestones(claim.volunteer_id)
  }

  await logAction(
    admin.id,
    'attendance.mark',
    'attendance',
    attendanceId,
    { status: previousRecord?.status ?? null },
    {
      status: newStatus,
      volunteer_id: claim.volunteer_id,
      show_id: showId,
      show_date_id: showDateId,
    }
  )

  revalidatePath('/crew/dashboard')
  revalidatePath(`/crew/shows/${showId}`)
  revalidatePath(`/crew/volunteers/${claim.volunteer_id}`)

  return { success: true, attendanceId }
}

export type BulkMarkAttendanceParams = {
  slotClaimIds: string[]
  showDateId: string
  showId: string
  status: 'showed' | 'no_show' | 'excused'
}

export type BulkMarkAttendanceResult = {
  success: boolean
  results: Array<{ slotClaimId: string; success: boolean; error?: string }>
}

export async function bulkMarkAttendance(
  params: BulkMarkAttendanceParams
): Promise<BulkMarkAttendanceResult> {
  const results: Array<{ slotClaimId: string; success: boolean; error?: string }> = []

  for (const slotClaimId of params.slotClaimIds) {
    const result = await markAttendance({
      slotClaimId,
      showDateId: params.showDateId,
      showId: params.showId,
      newStatus: params.status,
    })
    if ('error' in result) {
      results.push({ slotClaimId, success: false, error: result.error })
    } else {
      results.push({ slotClaimId, success: true })
    }
  }

  return { success: results.every((r) => r.success), results }
}

export type ConfirmHoursResult =
  | { success: true; newHours: number; delta: number }
  | { error: string }

// Option A hours review: hours already logged on Showed (see markAttendance),
// this confirms or adjusts the recorded value and clears hours_confirmed.
export async function confirmHours(
  attendanceId: string,
  newHours: number
): Promise<ConfirmHoursResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  if (typeof newHours !== 'number' || !Number.isFinite(newHours) || newHours < 0) {
    return { error: 'Hours must be 0 or greater.' }
  }
  if (newHours > 24) {
    return { error: 'Hours cannot exceed 24.' }
  }

  const supabase = await getServerClient()

  const { data: attendance, error: fetchError } = await supabase
    .from('attendance')
    .select('id, volunteer_id, hours_logged, hours_confirmed, show_id, show_date_id')
    .eq('id', attendanceId)
    .eq('status', 'showed')
    .single()

  if (fetchError || !attendance) {
    return { error: 'Could not find this attendance record.' }
  }

  if (attendance.hours_confirmed) {
    return { error: 'already_confirmed' }
  }

  const previousHours = Number(attendance.hours_logged)
  const delta = Math.round((newHours - previousHours) * 100) / 100

  if (delta !== 0 && attendance.volunteer_id) {
    const { data: volunteer } = await supabase
      .from('volunteers')
      .select('total_hours')
      .eq('id', attendance.volunteer_id)
      .single()

    const currentTotal = volunteer ? Number(volunteer.total_hours) : 0
    let appliedDelta = delta
    let newTotal = currentTotal + delta
    if (newTotal < 0) {
      appliedDelta = -currentTotal
      newTotal = 0
    }

    await supabase.from('volunteers').update({ total_hours: newTotal }).eq('id', attendance.volunteer_id)
    await supabase.from('attendance').update({ hours_logged: newHours }).eq('id', attendanceId)
    await supabase.from('volunteer_hours_log').insert({
      volunteer_id: attendance.volunteer_id,
      hours: appliedDelta,
      source_type: 'attendance',
      source_id: attendanceId,
      note: 'Hours adjusted during review',
      added_by: admin.id,
      logged_date: null,
    })

    await checkMilestones(attendance.volunteer_id)
    await checkFirstCall(attendance.volunteer_id)
  }
  // delta === 0, or volunteer_id is null (unregistered volunteer — hours were
  // never tallied for them, same existing behavior as markAttendance): no
  // hours_logged/total update needed, but the record still clears from the
  // review queue below.

  await supabase.from('attendance').update({ hours_confirmed: true }).eq('id', attendanceId)

  await logAction(
    admin.id,
    'attendance.hours_confirm',
    'attendance',
    attendanceId,
    { hours_logged: previousHours, hours_confirmed: false },
    { hours_logged: newHours, hours_confirmed: true, delta }
  )

  revalidatePath('/crew/dashboard')
  if (attendance.volunteer_id) {
    revalidatePath(`/crew/volunteers/${attendance.volunteer_id}`)
  }

  return { success: true, newHours, delta }
}
