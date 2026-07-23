'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { sendUpdateLinkEmail, sendInfoUpdatedEmail } from '@/lib/email'
import { normalizePhone } from '@/lib/utils/phone'
import type { UpdateFormData } from '@/types/volunteer'

export type SendLinkResult =
  | { status: 'success' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }

export type UpdateResult =
  | { status: 'success' }
  | { status: 'phone_conflict' }
  | { status: 'error'; message: string }

// ── sendUpdateLink ───────────────────────────────────────────────
// Looks up a volunteer by email OR phone (sequential, not OR query)
// and sends them a magic update link email.

export async function sendUpdateLink(
  input: string
): Promise<SendLinkResult> {
  try {
    const supabase = getAdminClient()
    const trimmed = input.trim()

    // Check email first
    const { data: emailMatch } = await supabase
      .from('volunteers')
      .select('id, full_name, email, update_token')
      .eq('email', trimmed)
      .maybeSingle()

    const volunteer = emailMatch ?? null

    // If no email match, check phone
    if (!volunteer) {
      const { data: phoneMatch } = await supabase
        .from('volunteers')
        .select('id, full_name, email, update_token')
        .eq('phone', normalizePhone(trimmed))
        .maybeSingle()

      if (!phoneMatch) {
        return { status: 'not_found' }
      }

      await sendUpdateLinkEmail({
        to: phoneMatch.email,
        name: phoneMatch.full_name,
        updateToken: phoneMatch.update_token,
      })
      return { status: 'success' }
    }

    await sendUpdateLinkEmail({
      to: volunteer.email,
      name: volunteer.full_name,
      updateToken: volunteer.update_token,
    })
    return { status: 'success' }

  } catch (err) {
    console.error('sendUpdateLink error:', err)
    return {
      status: 'error',
      message: 'Something went wrong. Please try again.',
    }
  }
}

// ── updateVolunteerInfo ──────────────────────────────────────────
// Updates the volunteer record, regenerates update_token,
// replaces category assignments, sends confirmation email.

export async function updateVolunteerInfo(
  volunteerId: string,
  data: UpdateFormData
): Promise<UpdateResult> {
  try {
    const supabase = getAdminClient()
    const normalizedPhone = normalizePhone(data.phone)

    // Fetch current record to get original phone
    const { data: current, error: fetchError } = await supabase
      .from('volunteers')
      .select('phone, email, full_name')
      .eq('id', volunteerId)
      .single()

    if (fetchError || !current) {
      return {
        status: 'error',
        message: 'Could not find your record. Please try again.',
      }
    }

    // Phone conflict check (only if phone changed)
    if (normalizedPhone !== current.phone) {
      const { data: conflict } = await supabase
        .from('volunteers')
        .select('id')
        .eq('phone', normalizedPhone)
        .neq('id', volunteerId)
        .maybeSingle()

      if (conflict) {
        return { status: 'phone_conflict' }
      }
    }

    // Collapse Other sub-fields
    const pronounsValue =
      data.pronouns === 'Other'
        ? (data.pronouns_other ?? null)
        : (data.pronouns || null)

    const referralSourceValue =
      data.referral_source_label === 'Other'
        ? (data.referral_source_other ?? null)
        : (data.referral_source_label || null)

    // Generate new token to invalidate old links
    const newToken = crypto.randomUUID()

    const { error: updateError } = await supabase
      .from('volunteers')
      .update({
        full_name:       data.full_name,
        phone:           normalizedPhone,
        pronouns:        pronounsValue,
        school:          data.school || null,
        age_range:       data.age_range || null,
        is_minor:        data.age_range === 'under_18',
        guardian_name:   data.guardian_name || null,
        guardian_phone:  data.guardian_phone || null,
        requires_service_hours: (data.school || null)
          ? (data.requires_service_hours ?? false)
          : false,
        referral_source: referralSourceValue,
        referral_name:   data.referral_name || null,
        update_token:    newToken,
      })
      .eq('id', volunteerId)

    if (updateError) {
      console.error('Volunteer update error:', updateError)
      return {
        status: 'error',
        message: 'Something went wrong saving your changes. Please try again.',
      }
    }

    // Replace category assignments
    await supabase
      .from('volunteer_category_assignments')
      .delete()
      .eq('volunteer_id', volunteerId)

    if (data.category_ids && data.category_ids.length > 0) {
      await supabase
        .from('volunteer_category_assignments')
        .insert(
          data.category_ids.map(categoryId => ({
            volunteer_id: volunteerId,
            category_id:  categoryId,
          }))
        )
    }

    // Send confirmation email with new token
    try {
      await sendInfoUpdatedEmail({
        to:          current.email,
        name:        data.full_name,
        updateToken: newToken,
        volunteerId,
      })
    } catch (emailErr) {
      console.error('Info updated email failed:', emailErr)
      // Email failure does not block success
    }

    return { status: 'success' }

  } catch (err) {
    console.error('updateVolunteerInfo error:', err)
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}
