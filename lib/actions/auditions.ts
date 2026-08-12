'use server'

// PUBLIC ROUTE — getAdminClient() only, never getServerClient()
// Serves app/auditions/[id]/page.tsx, app/auditions/upload/[token]/page.tsx,
// app/audition-checkin/[token]/page.tsx
// No Supabase Auth session available on these routes.

import { z } from 'zod'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { getAdminClient } from '@/lib/supabase/admin'
import { normalizePhone } from '@/lib/utils/phone'
import { formatWallClockCT } from '@/lib/utils/date'
import { createNotification } from '@/lib/utils/notifications'
import {
  sendAuditionSignupConfirmation,
  sendAuditionConsentFormRequestEmail,
  sendAuditionCancellationEmail,
} from '@/lib/email'
import type {
  AuditionPublicData,
  AuditionUploadData,
  AuditionCheckInData,
  AuditionCheckInResult,
  AuditionMaterialType,
  AuditionType,
} from '@/types/audition'

// time_start/time_end are `time without time zone` columns — raw strings
// like "19:00:00". Local formatter, matching the identical helper in
// AuditionSignupClient.tsx / AuditionCheckInClient.tsx (sanctioned small-
// pure-helper duplication — Process §14 DRY exception precedent).
function formatAuditionTime(t: string | null): string | null {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

// ─── B1: getAuditionPublicData ─────────────────────────────────

export async function getAuditionPublicData(id: string): Promise<AuditionPublicData | null> {
  try {
    const supabase = getAdminClient()

    const { data: audition } = await supabase
      .from('auditions')
      .select(
        'id, title, description, type, status, date_start, date_end, time_start, time_end, slot_cap, slots_total, role_selection_enabled, material_headshot, material_resume, material_sheet_music, material_mp3, material_video, check_in_token, location_id'
      )
      .eq('id', id)
      .eq('status', 'published')
      .maybeSingle()

    if (!audition) return null

    const [{ data: locationRow }, { data: roles }, { data: slots }] = await Promise.all([
      audition.location_id
        ? supabase.from('locations').select('id, name').eq('id', audition.location_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from('audition_roles')
        .select('id, audition_id, name, sort_order, created_at')
        .eq('audition_id', id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('audition_slots')
        .select('id, audition_id, start_time, cap, created_at')
        .eq('audition_id', id)
        .order('start_time', { ascending: true }),
    ])

    const slotIds = (slots ?? []).map((s) => s.id)
    const signupCounts: Record<string, number> = {}
    if (slotIds.length > 0) {
      const { data: signupRows } = await supabase
        .from('audition_signups')
        .select('slot_id')
        .in('slot_id', slotIds)
        .neq('status', 'withdrawn')

      for (const row of signupRows ?? []) {
        if (row.slot_id) signupCounts[row.slot_id] = (signupCounts[row.slot_id] ?? 0) + 1
      }
    }

    return {
      audition: {
        id: audition.id,
        title: audition.title,
        description: audition.description,
        type: audition.type,
        status: audition.status,
        date_start: audition.date_start,
        date_end: audition.date_end,
        time_start: audition.time_start,
        time_end: audition.time_end,
        slot_cap: audition.slot_cap,
        slots_total: audition.slots_total,
        role_selection_enabled: audition.role_selection_enabled,
        material_headshot: audition.material_headshot,
        material_resume: audition.material_resume,
        material_sheet_music: audition.material_sheet_music,
        material_mp3: audition.material_mp3,
        material_video: audition.material_video,
        check_in_token: audition.check_in_token,
      },
      roles: roles ?? [],
      slots: (slots ?? []).map((s) => ({ ...s, signupCount: signupCounts[s.id] ?? 0 })),
      location: locationRow ? { id: locationRow.id, name: locationRow.name } : null,
    }
  } catch (err) {
    console.error('getAuditionPublicData error:', err)
    return null
  }
}

// ─── B2: submitAuditionSignup ──────────────────────────────────

const submitAuditionSignupSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    auditionId: z.string().uuid(),
    slotId: z.string().uuid().nullable(),
    auditionRoleId: z.string().uuid().nullable().optional(),
    isMinor: z.boolean(),
    guardianName: z.string().nullable().optional(),
    guardianPhone: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isMinor) {
      if (!data.guardianName || !data.guardianName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardianName'],
          message: 'Guardian name is required for auditioners under 18',
        })
      }
      if (!data.guardianPhone || !data.guardianPhone.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardianPhone'],
          message: 'Guardian phone is required for auditioners under 18',
        })
      }
    }
  })

export type SubmitAuditionSignupInput = z.input<typeof submitAuditionSignupSchema>

export type SubmitAuditionSignupResult = {
  success: boolean
  signupId?: string
  uploadToken?: string
  error?: string
}

export async function submitAuditionSignup(
  input: SubmitAuditionSignupInput
): Promise<SubmitAuditionSignupResult> {
  try {
    const parsed = submitAuditionSignupSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
    }
    const data = parsed.data

    const supabase = getAdminClient()

    const { data: audition } = await supabase
      .from('auditions')
      .select(
        'id, title, type, status, date_start, time_start, material_headshot, material_resume, material_sheet_music, material_mp3, material_video, locations!auditions_location_id_fkey ( name )'
      )
      .eq('id', data.auditionId)
      .eq('status', 'published')
      .maybeSingle()

    if (!audition) {
      return { success: false, error: 'This audition is not available for signups.' }
    }

    // Supabase normalizes to-one FK joins as either an object or a
    // single-element array depending on relation inference — same
    // normalization pattern used throughout this file (getAuditionUploadData,
    // confirmAuditionMaterialUpload, getAuditionMaterialUploadUrl).
    const location = Array.isArray(audition.locations) ? audition.locations[0] : audition.locations

    if (audition.type === 'timed_slots' && !data.slotId) {
      return { success: false, error: 'Please select a time slot.' }
    }

    // Duplicate check — same audition, same email, not already withdrawn.
    const { data: existingSignup } = await supabase
      .from('audition_signups')
      .select('id')
      .eq('audition_id', data.auditionId)
      .eq('email', data.email)
      .neq('status', 'withdrawn')
      .maybeSingle()

    if (existingSignup) {
      return { success: false, error: 'You have already signed up for this audition.' }
    }

    if (data.slotId) {
      const { data: slot } = await supabase
        .from('audition_slots')
        .select('cap')
        .eq('id', data.slotId)
        .maybeSingle()

      if (!slot) {
        return { success: false, error: 'The selected time slot could not be found.' }
      }

      const { count } = await supabase
        .from('audition_signups')
        .select('id', { count: 'exact', head: true })
        .eq('slot_id', data.slotId)
        .neq('status', 'withdrawn')

      if ((count ?? 0) >= slot.cap) {
        return { success: false, error: 'That time slot is now full. Please choose another.' }
      }
    }

    const { data: signup, error: insertError } = await supabase
      .from('audition_signups')
      .insert({
        audition_id: data.auditionId,
        slot_id: data.slotId || null,
        audition_role_id: data.auditionRoleId || null,
        name: data.name,
        email: data.email,
        phone: normalizePhone(data.phone),
        is_minor: data.isMinor,
        guardian_name: data.isMinor ? data.guardianName || null : null,
        guardian_phone: data.isMinor && data.guardianPhone ? normalizePhone(data.guardianPhone) : null,
      })
      .select('id, cancel_token, upload_token')
      .single()

    if (insertError || !signup) {
      console.error('submitAuditionSignup insert error:', insertError)
      return { success: false, error: 'Something went wrong saving your signup. Please try again.' }
    }

    // Non-blocking consent trigger — under-18 auditioners only. Mirrors the
    // Phase 15.2 volunteer consent pattern, but writes audition_signup_id
    // instead of volunteer_id (auditioners are not volunteers).
    if (data.isMinor) {
      try {
        const { data: docType } = await supabase
          .from('document_types')
          .select('id, name')
          .eq('slug', 'cast_consent_form')
          .eq('is_active', true)
          .maybeSingle()

        if (docType) {
          const { data: submission, error: submissionError } = await supabase
            .from('consent_form_submissions')
            .insert({
              audition_signup_id: signup.id,
              document_type_id: docType.id,
              volunteer_id: null,
            })
            .select('upload_token')
            .single()

          if (submissionError || !submission) {
            console.error('Audition consent submission insert error:', submissionError)
          } else {
            const { data: activeDoc } = await supabase
              .from('documents')
              .select('access_token')
              .eq('document_type_id', docType.id)
              .eq('is_type_active', true)
              .maybeSingle()

            const activeFormUrl = activeDoc
              ? `${process.env.NEXT_PUBLIC_SITE_URL}/documents/${activeDoc.access_token}`
              : null

            // Non-blocking consent email — never throws.
            sendAuditionConsentFormRequestEmail({
              to: data.email,
              name: data.name,
              auditionTitle: audition.title,
              uploadToken: submission.upload_token,
              activeFormUrl,
              documentTypeName: docType.name,
              auditionSignupId: signup.id,
            }).catch((err) => console.error('Consent email error:', err))
          }
        }
      } catch (consentError) {
        console.error('Audition consent form trigger failed:', consentError)
      }
    }

    // Non-blocking — never throws.
    sendAuditionSignupConfirmation({
      to: data.email,
      name: data.name,
      auditionTitle: audition.title,
      auditionDate: formatWallClockCT(audition.date_start, null, 'MMMM d, yyyy'),
      auditionTime: formatAuditionTime(audition.time_start),
      locationName: location?.name ?? null,
      cancelToken: signup.cancel_token,
      uploadToken: signup.upload_token,
      hasMaterials: [
        audition.material_headshot,
        audition.material_resume,
        audition.material_sheet_music,
        audition.material_mp3,
        audition.material_video,
      ].some(Boolean),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? '',
      auditionId: audition.id,
    }).catch((err) => console.error('Confirmation email error:', err))

    // Non-blocking in-app notification — never blocks the signup response.
    void (async () => {
      try {
        const [{ data: assignments }, { data: auditionRow }] = await Promise.all([
          supabase.from('audition_assignments').select('admin_user_id').eq('audition_id', data.auditionId),
          supabase.from('auditions').select('show_id').eq('id', data.auditionId).maybeSingle(),
        ])

        const recipientIds = new Set<string>()
        for (const a of assignments ?? []) recipientIds.add(a.admin_user_id)

        if (auditionRow?.show_id) {
          const { data: editors } = await supabase
            .from('show_editors')
            .select('admin_id')
            .eq('show_id', auditionRow.show_id)
          for (const e of editors ?? []) recipientIds.add(e.admin_id)
        }

        for (const userId of recipientIds) {
          await createNotification(
            userId,
            'audition_signup',
            `New audition signup: ${data.name}`,
            `/crew/auditions/${data.auditionId}`,
            null,
            supabase
          )
        }
      } catch {
        // Swallow — notification failure must never block signup
      }
    })()

    return { success: true, signupId: signup.id, uploadToken: signup.upload_token }
  } catch (err) {
    console.error('submitAuditionSignup unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

// ─── B3: cancelAuditionSignup ──────────────────────────────────

export async function cancelAuditionSignup(
  cancelToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminClient()

    const { data: signup } = await supabase
      .from('audition_signups')
      .select('id, status, name, email, audition_id')
      .eq('cancel_token', cancelToken)
      .maybeSingle()

    if (!signup) {
      return { success: false, error: 'Invalid or expired cancellation link.' }
    }

    if (signup.status === 'withdrawn') {
      return { success: true }
    }

    const { error: updateError } = await supabase
      .from('audition_signups')
      .update({ status: 'withdrawn' })
      .eq('id', signup.id)

    if (updateError) {
      console.error('cancelAuditionSignup update error:', updateError)
      return { success: false, error: 'Something went wrong. Please try again.' }
    }

    // Non-blocking cancellation confirmation — fetch audition title for the email.
    const { data: cancelAudition } = await supabase
      .from('auditions')
      .select('title')
      .eq('id', signup.audition_id)
      .single()

    if (cancelAudition) {
      sendAuditionCancellationEmail({
        to: signup.email,
        name: signup.name,
        auditionTitle: cancelAudition.title,
      }).catch((err) => console.error('Cancellation email error:', err))
    }

    return { success: true }
  } catch (err) {
    console.error('cancelAuditionSignup unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

// ─── B4: getAuditionUploadData ─────────────────────────────────

export async function getAuditionUploadData(uploadToken: string): Promise<AuditionUploadData | null> {
  try {
    const supabase = getAdminClient()

    const { data: signup } = await supabase
      .from('audition_signups')
      .select(
        'id, name, audition:auditions(title, material_headshot, material_resume, material_sheet_music, material_mp3, material_video)'
      )
      .eq('upload_token', uploadToken)
      .maybeSingle()

    if (!signup) return null

    const audition = Array.isArray(signup.audition) ? signup.audition[0] : signup.audition
    if (!audition) return null

    const { data: materials } = await supabase
      .from('audition_materials')
      .select('material_type, original_filename, uploaded_at')
      .eq('signup_id', signup.id)

    const enabledMaterialTypes: AuditionMaterialType[] = []
    if (audition.material_headshot) enabledMaterialTypes.push('headshot')
    if (audition.material_resume) enabledMaterialTypes.push('resume')
    if (audition.material_sheet_music) enabledMaterialTypes.push('sheet_music')
    if (audition.material_mp3) enabledMaterialTypes.push('mp3')
    if (audition.material_video) enabledMaterialTypes.push('video')

    return {
      signupId: signup.id,
      auditionTitle: audition.title,
      auditionerName: signup.name,
      enabledMaterialTypes,
      existingMaterials: materials ?? [],
    }
  } catch (err) {
    console.error('getAuditionUploadData error:', err)
    return null
  }
}

// ─── B5: confirmAuditionMaterialUpload ─────────────────────────

export async function confirmAuditionMaterialUpload(params: {
  uploadToken: string
  storagePath: string
  materialType: AuditionMaterialType
  originalFilename: string | null
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminClient()

    const { data: signup } = await supabase
      .from('audition_signups')
      .select(
        'id, audition_id, audition:auditions(material_headshot, material_resume, material_sheet_music, material_mp3, material_video)'
      )
      .eq('upload_token', params.uploadToken)
      .maybeSingle()

    if (!signup) {
      return { success: false, error: 'Invalid upload link.' }
    }

    const audition = Array.isArray(signup.audition) ? signup.audition[0] : signup.audition
    if (!audition) {
      return { success: false, error: 'Invalid upload link.' }
    }

    const enabledMap: Record<AuditionMaterialType, boolean> = {
      headshot: audition.material_headshot,
      resume: audition.material_resume,
      sheet_music: audition.material_sheet_music,
      mp3: audition.material_mp3,
      video: audition.material_video,
    }

    if (!enabledMap[params.materialType]) {
      return { success: false, error: 'This material type is not accepted for this audition.' }
    }

    const { error: insertError } = await supabase.from('audition_materials').insert({
      signup_id: signup.id,
      material_type: params.materialType,
      storage_path: params.storagePath,
      original_filename: params.originalFilename || null,
    })

    if (insertError) {
      console.error('confirmAuditionMaterialUpload insert error:', insertError)
      return { success: false, error: 'Failed to save your upload. Please try again.' }
    }

    // Non-blocking in-app notification — never blocks the upload response.
    void (async () => {
      try {
        const [{ data: assignments }, { data: auditionRow }] = await Promise.all([
          supabase.from('audition_assignments').select('admin_user_id').eq('audition_id', signup.audition_id),
          supabase.from('auditions').select('show_id').eq('id', signup.audition_id).maybeSingle(),
        ])

        const recipientIds = new Set<string>()
        for (const a of assignments ?? []) recipientIds.add(a.admin_user_id)

        if (auditionRow?.show_id) {
          const { data: editors } = await supabase
            .from('show_editors')
            .select('admin_id')
            .eq('show_id', auditionRow.show_id)
          for (const e of editors ?? []) recipientIds.add(e.admin_id)
        }

        for (const userId of recipientIds) {
          await createNotification(
            userId,
            'audition_material',
            `Material uploaded: ${params.materialType}`,
            `/crew/auditions/${signup.audition_id}`,
            null,
            supabase
          )
        }
      } catch {
        // Swallow — notification failure must never block upload
      }
    })()

    return { success: true }
  } catch (err) {
    console.error('confirmAuditionMaterialUpload unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred. Please try again.' }
  }
}

// ─── B6: getAuditionCheckInData ────────────────────────────────

export async function getAuditionCheckInData(checkInToken: string): Promise<AuditionCheckInData | null> {
  try {
    const supabase = getAdminClient()

    const { data: audition } = await supabase
      .from('auditions')
      .select('id, title, date_start, time_start, check_in_token, location:locations(name)')
      .eq('check_in_token', checkInToken)
      .maybeSingle()

    if (!audition) return null

    const locationRow = Array.isArray(audition.location) ? (audition.location[0] ?? null) : audition.location

    const { data: signups } = await supabase
      .from('audition_signups')
      .select('id, name')
      .eq('audition_id', audition.id)
      .neq('status', 'withdrawn')
      .order('name', { ascending: true })

    return {
      audition: {
        id: audition.id,
        title: audition.title,
        date_start: audition.date_start,
        time_start: audition.time_start,
        check_in_token: audition.check_in_token,
      },
      location: locationRow ? { name: locationRow.name } : null,
      roster: (signups ?? []).map((s) => ({ id: s.id, name: s.name })),
    }
  } catch (err) {
    console.error('getAuditionCheckInData error:', err)
    return null
  }
}

// ─── B7: checkInToAudition ─────────────────────────────────────
//
// IMPORTANT: signupId (audition_signups.id) — NOT adminUserId. Auditioners
// have no Supabase Auth identity; the dropdown selection on the public
// check-in page IS the identity assertion. (AUDITIONS.A Audit F5)

export async function checkInToAudition(
  checkInToken: string,
  signupId: string
): Promise<AuditionCheckInResult> {
  try {
    const data = await getAuditionCheckInData(checkInToken)
    if (!data) {
      return { result: 'invalid-token' }
    }

    const onRoster = data.roster.some((r) => r.id === signupId)
    if (!onRoster) {
      return { result: 'not-on-roster' }
    }

    const supabase = getAdminClient()

    const { data: existingSignup } = await supabase
      .from('audition_signups')
      .select('checked_in_at')
      .eq('id', signupId)
      .maybeSingle()

    if (existingSignup?.checked_in_at) {
      return { result: 'already-checked-in', checkedInAt: existingSignup.checked_in_at }
    }

    const nowIso = new Date().toISOString()
    const { data: updated, error: updateError } = await supabase
      .from('audition_signups')
      .update({ checked_in_at: nowIso, check_in_source: 'checkin' })
      .eq('id', signupId)
      .select('checked_in_at')
      .single()

    if (updateError || !updated) {
      console.error('checkInToAudition update error:', updateError)
      return { result: 'error' }
    }

    return { result: 'success', checkedInAt: updated.checked_in_at as string }
  } catch (err) {
    console.error('checkInToAudition unexpected error:', err)
    return { result: 'error' }
  }
}

// ─── B8: getAuditionMaterialUploadUrl ──────────────────────────

function getExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1] : 'bin'
}

export async function getAuditionMaterialUploadUrl(
  uploadToken: string,
  materialType: AuditionMaterialType,
  filename: string
): Promise<{
  signedUrl: string | null
  path: string | null
  error?: string
}> {
  try {
    const supabase = getAdminClient()

    const { data: signup } = await supabase
      .from('audition_signups')
      .select(
        'id, audition:auditions(material_headshot, material_resume, material_sheet_music, material_mp3, material_video)'
      )
      .eq('upload_token', uploadToken)
      .maybeSingle()

    if (!signup) {
      return { signedUrl: null, path: null, error: 'Invalid upload link.' }
    }

    const audition = Array.isArray(signup.audition) ? signup.audition[0] : signup.audition
    if (!audition) {
      return { signedUrl: null, path: null, error: 'Invalid upload link.' }
    }

    const enabledMap: Record<AuditionMaterialType, boolean> = {
      headshot: audition.material_headshot,
      resume: audition.material_resume,
      sheet_music: audition.material_sheet_music,
      mp3: audition.material_mp3,
      video: audition.material_video,
    }

    if (!enabledMap[materialType]) {
      return { signedUrl: null, path: null, error: 'This material type is not enabled for this audition.' }
    }

    // crypto.randomUUID() is a Node.js global — no import needed.
    const path = `audition-materials/${signup.id}/${materialType}-${crypto.randomUUID()}.${getExtension(filename)}`

    const { data: signed, error: signError } = await supabase.storage.from('media').createSignedUploadUrl(path)

    if (signError || !signed) {
      console.error('getAuditionMaterialUploadUrl storage error:', signError)
      return { signedUrl: null, path: null, error: 'Failed to prepare upload. Please try again.' }
    }

    return { signedUrl: signed.signedUrl, path }
  } catch (err) {
    console.error('getAuditionMaterialUploadUrl unexpected error:', err)
    return { signedUrl: null, path: null, error: 'An unexpected error occurred.' }
  }
}

// ─── B9: getUpcomingAuditions ──────────────────────────────────
//
// Powers the auditions card on / and /shows. Reads feature_auditions via a
// direct single-key app_settings query rather than calling
// getFeatureFlags(getAdminClient()) — a lightweight alternative for public
// routes that need only one flag (getFeatureFlags() fetches all six keys
// in one query, which is unnecessary overhead here). This is an efficiency
// choice, not a necessity — getFeatureFlags() is client-agnostic and works
// fine from this public-route context (see R32 / Process §7).

export type UpcomingAudition = {
  id: string
  title: string
  date_start: string
  date_end: string | null
  type: AuditionType
  show_title: string | null
}

export async function getUpcomingAuditions(): Promise<UpcomingAudition[]> {
  try {
    const supabase = getAdminClient()

    const { data: flagRow } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'feature_auditions')
      .single()
    const flagEnabled = flagRow?.value !== 'false'
    if (!flagEnabled) return []

    const todayCT = format(toZonedTime(new Date(), 'America/Chicago'), 'yyyy-MM-dd')

    const { data: auditions, error } = await supabase
      .from('auditions')
      .select('id, title, date_start, date_end, type, shows!auditions_show_id_fkey ( name )')
      .eq('status', 'published')
      .gte('date_start', todayCT)
      .order('date_start', { ascending: true })

    if (error || !auditions) return []

    return auditions.map((a) => {
      const show = Array.isArray(a.shows) ? a.shows[0] : a.shows
      return {
        id: a.id,
        title: a.title,
        date_start: a.date_start,
        date_end: a.date_end,
        type: a.type,
        show_title: show?.name ?? null,
      }
    })
  } catch (err) {
    console.error('getUpcomingAuditions error:', err)
    return []
  }
}
