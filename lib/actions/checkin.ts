'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { formatCT } from '@/lib/utils/date'
import { getOrgTimezone } from '@/lib/utils/org-timezone'
import { normalizePhone } from '@/lib/utils/phone'
import { getLocationHoursBucket } from '@/lib/utils/showDisplay'
import { logAction } from '@/lib/audit'
import { checkFirstCall, checkMilestones } from '@/lib/milestones'
import { sendVolunteerConfirmationEmail } from '@/lib/email'
import { createCheckInSignupSchema, type CheckInSignupInput } from '@/lib/validations/checkin'
import type { CheckInTokenResolution, CheckInResult, CheckInNewResult } from '@/types/checkin'

// This file serves the public /checkin/[token] route — no Supabase Auth
// session exists in this context. getAdminClient() only; never
// getServerClient() (matches the Call Board / public-form pattern).

type ShowDateRow = { id: string; show_date: string; show_time: string; end_time: string | null }
type ShowRow = { id: string; name: string; default_hours: number | null; location_id: string }
type AdminClient = ReturnType<typeof getAdminClient>

export async function resolveCheckInToken(token: string): Promise<CheckInTokenResolution> {
  const supabase = getAdminClient()

  const flags = await getFeatureFlags(supabase)
  if (!flags.checkin) {
    return { type: 'invalid' }
  }

  const { data: dateMatch } = await supabase
    .from('show_dates')
    .select(
      `
      id, show_date, show_time, end_time,
      show:shows ( id, name, default_hours, location_id )
      `
    )
    .eq('check_in_token', token)
    .maybeSingle()

  if (dateMatch) {
    const show = dateMatch.show as unknown as ShowRow
    return {
      type: 'date',
      showDate: {
        id: dateMatch.id,
        show_date: dateMatch.show_date,
        show_time: dateMatch.show_time,
        end_time: dateMatch.end_time,
      },
      show,
    }
  }

  const { data: showMatch } = await supabase
    .from('shows')
    .select('id, name, default_hours, location_id')
    .eq('check_in_token', token)
    .maybeSingle()

  if (showMatch) {
    const tz = await getOrgTimezone(supabase)
    const todayCT = formatCT(new Date(), 'yyyy-MM-dd', tz)
    const { data: dates } = await supabase
      .from('show_dates')
      .select('id, show_date, show_time, end_time')
      .eq('show_id', showMatch.id)
      .gte('show_date', todayCT)
      .order('show_date', { ascending: true })

    if (!dates || dates.length === 0) {
      // Show is fully in the past — nothing upcoming to check in for.
      return { type: 'invalid' }
    }

    return {
      type: 'show',
      show: showMatch,
      dates,
      selectedDate: dates[0],
    }
  }

  return { type: 'invalid' }
}

// Mirrors markAttendance()'s 3-tier default-hours fallback (30BN-ADMIN.25):
// show.default_hours -> location.default_hours -> app_settings bucket map.
// Kept in sync with lib/actions/attendance.ts — do not simplify to
// show.default_hours ?? 0, that would silently under-log hours for any
// show relying on its location's default.
async function resolveHoursLogged(supabase: AdminClient, show: ShowRow): Promise<number> {
  if (show.default_hours != null) {
    return Number(show.default_hours)
  }

  const { data: location } = await supabase
    .from('locations')
    .select('default_hours, name')
    .eq('id', show.location_id)
    .maybeSingle()

  if (location?.default_hours != null) {
    return Number(location.default_hours)
  }

  const bucket = getLocationHoursBucket(location?.name)
  const { data: setting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', `default_hours_${bucket}`)
    .maybeSingle()

  return setting?.value ? Number(setting.value) : 0
}

// Mirrors markAttendance()'s adjustVolunteerHours() + insertHoursLog() pair —
// without this, volunteers.total_hours would never reflect a check-in mark,
// and checkMilestones() (called right after) would read a stale total.
async function applyHoursForCheckin(
  supabase: AdminClient,
  volunteerId: string,
  hours: number,
  attendanceId: string,
  note: string
): Promise<void> {
  const { data: volunteer } = await supabase
    .from('volunteers')
    .select('total_hours')
    .eq('id', volunteerId)
    .single()

  if (volunteer) {
    await supabase
      .from('volunteers')
      .update({ total_hours: Number(volunteer.total_hours) + hours })
      .eq('id', volunteerId)
  }

  await supabase.from('volunteer_hours_log').insert({
    volunteer_id: volunteerId,
    hours,
    source_type: 'attendance',
    source_id: attendanceId,
    note,
    added_by: null,
  })
}

function resolveTargetDate(
  resolution: Extract<CheckInTokenResolution, { type: 'date' | 'show' }>,
  selectedDateId?: string
): { targetDate: ShowDateRow; show: ShowRow } | { error: 'invalid_token' } {
  if (resolution.type === 'date') {
    return { targetDate: resolution.showDate, show: resolution.show }
  }

  if (selectedDateId) {
    const found = resolution.dates.find((d) => d.id === selectedDateId)
    if (!found) {
      return { error: 'invalid_token' }
    }
    return { targetDate: found, show: resolution.show }
  }

  return { targetDate: resolution.selectedDate, show: resolution.show }
}

export async function checkInVolunteer(
  token: string,
  input: string,
  selectedDateId?: string
): Promise<CheckInResult> {
  try {
    const resolution = await resolveCheckInToken(token)
    if (resolution.type === 'invalid') {
      return { error: 'invalid_token' }
    }

    const targetResolved = resolveTargetDate(resolution, selectedDateId)
    if ('error' in targetResolved) {
      return targetResolved
    }
    const { targetDate, show } = targetResolved

    const supabase = getAdminClient()
    const tz = await getOrgTimezone(supabase)
    const todayCT = formatCT(new Date(), 'yyyy-MM-dd', tz)
    if (targetDate.show_date < todayCT) {
      return { error: 'date_passed' }
    }

    const flags = await getFeatureFlags(supabase)
    if (!flags.checkin) {
      return { error: 'invalid_token' }
    }

    const isEmail = input.includes('@')
    const normalized = isEmail ? input.toLowerCase().trim() : normalizePhone(input)

    const claimQuery = supabase
      .from('slot_claims')
      .select('id, volunteer_id, volunteer_name')
      .eq('show_date_id', targetDate.id)
      .eq('status', 'claimed')

    const { data: claim } = isEmail
      ? await claimQuery.eq('volunteer_email', normalized).maybeSingle()
      : await claimQuery.eq('volunteer_phone', normalized).maybeSingle()

    if (!claim) {
      return {
        notFound: true,
        showName: show.name,
        showDate: targetDate.show_date,
        showTime: targetDate.show_time,
        showId: show.id,
      }
    }

    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('slot_claim_id', claim.id)
      .maybeSingle()

    if (existing) {
      return { alreadyCheckedIn: true, volunteerName: claim.volunteer_name }
    }

    const hoursLogged = await resolveHoursLogged(supabase, show)

    const { data: inserted, error: insertError } = await supabase
      .from('attendance')
      .insert({
        slot_claim_id: claim.id,
        volunteer_id: claim.volunteer_id ?? null,
        show_id: show.id,
        show_date_id: targetDate.id,
        status: 'showed',
        hours_logged: hoursLogged,
        hours_confirmed: false,
        source: 'checkin',
        marked_by: null,
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error('checkInVolunteer attendance insert error:', insertError)
      return { error: 'unknown' }
    }

    if (claim.volunteer_id) {
      await applyHoursForCheckin(
        supabase,
        claim.volunteer_id,
        hoursLogged,
        inserted.id,
        `${show.name} — Check-In`
      )

      try {
        const { count } = await supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('volunteer_id', claim.volunteer_id)
          .eq('status', 'showed')
        if (count === 1) {
          await checkFirstCall(claim.volunteer_id)
        }
        await checkMilestones(claim.volunteer_id)
      } catch (err) {
        console.error('checkInVolunteer milestone check error:', err)
      }
    }

    revalidatePath('/crew/dashboard')
    revalidatePath(`/crew/shows/${show.id}`)
    if (claim.volunteer_id) {
      revalidatePath(`/crew/volunteers/${claim.volunteer_id}`)
    }
    revalidatePath('/crew/tools/checkin')

    await logAction(null, 'attendance.checkin', 'show_date', targetDate.id)

    return { success: true, volunteerName: claim.volunteer_name }
  } catch (err) {
    console.error('checkInVolunteer unexpected error:', err)
    return { error: 'unknown' }
  }
}

export async function checkInNewVolunteer(
  token: string,
  selectedDateId: string | undefined,
  formData: CheckInSignupInput,
  showAgeRange: boolean
): Promise<CheckInNewResult> {
  try {
    const parsed = createCheckInSignupSchema(showAgeRange).safeParse(formData)
    if (!parsed.success) {
      return { error: 'unknown' }
    }
    const value = parsed.data

    const resolution = await resolveCheckInToken(token)
    if (resolution.type === 'invalid') {
      return { error: 'invalid_token' }
    }

    const targetResolved = resolveTargetDate(resolution, selectedDateId)
    if ('error' in targetResolved) {
      return targetResolved
    }
    const { targetDate, show } = targetResolved

    const supabase = getAdminClient()
    const tz = await getOrgTimezone(supabase)
    const todayCT = formatCT(new Date(), 'yyyy-MM-dd', tz)
    if (targetDate.show_date < todayCT) {
      return { error: 'date_passed' }
    }

    const flags = await getFeatureFlags(supabase)
    if (!flags.checkin) {
      return { error: 'invalid_token' }
    }

    // Duplicate detection — sequential, matching submitVolunteerForm()
    // (app/actions/volunteer.ts): email first, then phone.
    const normalizedEmail = value.email.toLowerCase().trim()
    const normalizedPhone = normalizePhone(value.phone)

    const { data: emailMatch } = await supabase
      .from('volunteers')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (emailMatch) {
      const result = await checkInVolunteer(token, value.email, selectedDateId)
      return { error: 'duplicate_handled', result }
    }

    const { data: phoneMatch } = await supabase
      .from('volunteers')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle()

    if (phoneMatch) {
      const result = await checkInVolunteer(token, value.phone, selectedDateId)
      return { error: 'duplicate_handled', result }
    }

    // Genuinely new volunteer — insert (R18: || null on optional strings).
    const { data: newVolunteer, error: insertError } = await supabase
      .from('volunteers')
      .insert({
        full_name: value.full_name,
        email: normalizedEmail,
        phone: normalizedPhone,
        pronouns: value.pronouns || null,
        school: value.school || null,
        age_range: value.age_range || null,
        is_minor: value.is_minor,
        guardian_name: value.guardian_name || null,
        guardian_phone: value.guardian_phone || null,
        requires_service_hours: value.school ? value.requires_service_hours : false,
        referral_source: value.referral_source || null,
        referral_name: value.referral_name || null,
      })
      .select('id, update_token')
      .single()

    if (insertError || !newVolunteer) {
      console.error('checkInNewVolunteer volunteer insert error:', insertError)
      return { error: 'unknown' }
    }

    if (value.category_ids.length > 0) {
      await supabase.from('volunteer_category_assignments').insert(
        value.category_ids.map((categoryId) => ({
          volunteer_id: newVolunteer.id,
          category_id: categoryId,
        }))
      )
    }

    // Confirmation email — non-blocking, never blocks check-in success.
    try {
      let categoryNames: string[] = []
      if (value.category_ids.length > 0) {
        const { data: cats } = await supabase
          .from('volunteer_categories')
          .select('name')
          .in('id', value.category_ids)
          .order('sort_order')
        categoryNames = cats?.map((c) => c.name) ?? []
      }

      await sendVolunteerConfirmationEmail({
        to: normalizedEmail,
        name: value.full_name,
        updateToken: newVolunteer.update_token,
        categoryNames,
        volunteerId: newVolunteer.id,
      })
    } catch (err) {
      console.error('checkInNewVolunteer confirmation email error:', err)
    }

    const hoursLogged = await resolveHoursLogged(supabase, show)

    const { data: insertedAttendance, error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        slot_claim_id: null,
        volunteer_id: newVolunteer.id,
        show_id: show.id,
        show_date_id: targetDate.id,
        status: 'showed',
        hours_logged: hoursLogged,
        hours_confirmed: false,
        source: 'checkin',
        marked_by: null,
      })
      .select('id')
      .single()

    if (attendanceError || !insertedAttendance) {
      console.error('checkInNewVolunteer attendance insert error:', attendanceError)
      return { error: 'unknown' }
    }

    await applyHoursForCheckin(
      supabase,
      newVolunteer.id,
      hoursLogged,
      insertedAttendance.id,
      `${show.name} — Check-In (new volunteer)`
    )

    // This is definitionally their first call. checkMilestones() is also
    // called (not just checkFirstCall()) because applyHoursForCheckin()
    // above already set total_hours to this show's hours — in the unusual
    // case of a high-default-hours show, a single check-in could cross a
    // threshold on the first call.
    try {
      await checkFirstCall(newVolunteer.id)
      await checkMilestones(newVolunteer.id)
    } catch (err) {
      console.error('checkInNewVolunteer milestone check error:', err)
    }

    revalidatePath('/crew/dashboard')
    revalidatePath(`/crew/shows/${show.id}`)
    revalidatePath(`/crew/volunteers/${newVolunteer.id}`)
    revalidatePath('/crew/tools/checkin')

    await logAction(null, 'volunteer.checkin_signup', 'volunteer', newVolunteer.id)

    return { success: true, volunteerName: value.full_name, isNew: true }
  } catch (err) {
    console.error('checkInNewVolunteer unexpected error:', err)
    return { error: 'unknown' }
  }
}
