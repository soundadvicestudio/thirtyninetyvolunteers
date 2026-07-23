'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { sendVolunteerConfirmationEmail } from '@/lib/email'
import { normalizePhone } from '@/lib/utils/phone'
import { VolunteerFormData } from '@/types/volunteer'

export type SubmitResult =
  | { status: 'success' }
  | { status: 'duplicate'; existingId: string; existingName: string }
  | { status: 'error'; message: string }

export async function submitVolunteerForm(
  data: VolunteerFormData,
  honeypot?: string
): Promise<SubmitResult> {
  try {
    // Honeypot: bots fill hidden fields humans never see. Silent fake success.
    if (honeypot) {
      return { status: 'success' }
    }

    const supabase = getAdminClient()
    const normalizedPhone = normalizePhone(data.phone)

    // DUPLICATE DETECTION: check email first, then phone.
    // Two sequential queries — not an OR query — to avoid
    // maybeSingle() throwing when email and phone match
    // different records.
    const { data: emailMatch } = await supabase
      .from('volunteers')
      .select('id, full_name')
      .eq('email', data.email)
      .maybeSingle()

    if (emailMatch) {
      return {
        status: 'duplicate',
        existingId: emailMatch.id,
        existingName: emailMatch.full_name,
      }
    }

    const { data: phoneMatch } = await supabase
      .from('volunteers')
      .select('id, full_name')
      .eq('phone', normalizedPhone)
      .maybeSingle()

    if (phoneMatch) {
      return {
        status: 'duplicate',
        existingId: phoneMatch.id,
        existingName: phoneMatch.full_name,
      }
    }

    // FIELD MAPPING: collapse Other sub-fields
    const pronounsValue =
      data.pronouns === 'Other'
        ? (data.pronouns_other || null)
        : (data.pronouns || null)

    const referralSourceValue =
      data.referral_source_label === 'Other'
        ? (data.referral_source_other || null)
        : (data.referral_source_label || null)

    // INSERT VOLUNTEER
    const { data: newVolunteer, error: insertError } = await supabase
      .from('volunteers')
      .insert({
        full_name:      data.full_name,
        email:          data.email,
        phone:          normalizedPhone,
        pronouns:       pronounsValue,
        school:         data.school || null,
        age_range:      data.age_range || null,
        is_minor:       data.age_range === 'under_18',
        guardian_name:  data.guardian_name || null,
        guardian_phone: data.guardian_phone || null,
        requires_service_hours: (data.school || null)
          ? (data.requires_service_hours ?? false)
          : false,
        referral_source: referralSourceValue,
        referral_name:  data.referral_name || null,
      })
      .select('id, update_token')
      .single()

    if (insertError || !newVolunteer) {
      console.error('Volunteer insert error:', insertError)
      return {
        status: 'error',
        message:
          'Something went wrong saving your information. ' +
          'Please try again.',
      }
    }

    // INSERT CATEGORY ASSIGNMENTS
    if (data.category_ids && data.category_ids.length > 0) {
      await supabase
        .from('volunteer_category_assignments')
        .insert(
          data.category_ids.map(categoryId => ({
            volunteer_id: newVolunteer.id,
            category_id:  categoryId,
          }))
        )
    }

    // FETCH CATEGORY NAMES FOR EMAIL
    let categoryNames: string[] = []
    if (data.category_ids && data.category_ids.length > 0) {
      const { data: cats } = await supabase
        .from('volunteer_categories')
        .select('name')
        .in('id', data.category_ids)
        .order('sort_order')
      categoryNames = cats?.map(c => c.name) ?? []
    }

    // SEND CONFIRMATION EMAIL
    try {
      await sendVolunteerConfirmationEmail({
        to:           data.email,
        name:         data.full_name,
        updateToken:  newVolunteer.update_token,
        categoryNames,
        volunteerId:  newVolunteer.id,
      })
    } catch (emailError) {
      // Email failure should not block signup success.
      // Log and continue.
      console.error('Confirmation email failed:', emailError)
    }

    return { status: 'success' }

  } catch (err) {
    console.error('submitVolunteerForm unexpected error:', err)
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}

export async function mergeVolunteer(
  existingId: string,
  data: VolunteerFormData
): Promise<{ status: 'success' } | { status: 'error'; message: string }> {
  try {
    const supabase = getAdminClient()

    const pronounsValue =
      data.pronouns === 'Other'
        ? (data.pronouns_other || null)
        : (data.pronouns || null)

    const referralSourceValue =
      data.referral_source_label === 'Other'
        ? (data.referral_source_other || null)
        : (data.referral_source_label || null)

    const { error: updateError } = await supabase
      .from('volunteers')
      .update({
        full_name:      data.full_name,
        phone:          normalizePhone(data.phone),
        pronouns:       pronounsValue,
        school:         data.school || null,
        age_range:      data.age_range || null,
        is_minor:       data.age_range === 'under_18',
        guardian_name:  data.guardian_name || null,
        guardian_phone: data.guardian_phone || null,
        requires_service_hours: (data.school || null)
          ? (data.requires_service_hours ?? false)
          : false,
        referral_source: referralSourceValue,
        referral_name:  data.referral_name || null,
      })
      .eq('id', existingId)

    if (updateError) {
      console.error('Volunteer merge error:', updateError)
      return {
        status: 'error',
        message: 'Something went wrong updating your record. Please try again.',
      }
    }

    // REPLACE CATEGORY ASSIGNMENTS
    await supabase
      .from('volunteer_category_assignments')
      .delete()
      .eq('volunteer_id', existingId)

    if (data.category_ids && data.category_ids.length > 0) {
      await supabase
        .from('volunteer_category_assignments')
        .insert(
          data.category_ids.map(categoryId => ({
            volunteer_id: existingId,
            category_id:  categoryId,
          }))
        )
    }

    // FETCH update_token AND CATEGORY NAMES FOR EMAIL
    const [{ data: volunteer }, { data: cats }] = await Promise.all([
      supabase
        .from('volunteers')
        .select('update_token')
        .eq('id', existingId)
        .single(),
      data.category_ids?.length
        ? supabase
            .from('volunteer_categories')
            .select('name')
            .in('id', data.category_ids)
            .order('sort_order')
        : Promise.resolve({ data: [] }),
    ])

    if (volunteer) {
      try {
        await sendVolunteerConfirmationEmail({
          to:           data.email,
          name:         data.full_name,
          updateToken:  volunteer.update_token,
          categoryNames: cats?.map(c => c.name) ?? [],
          volunteerId:  existingId,
        })
      } catch (emailError) {
        console.error('Merge confirmation email failed:', emailError)
      }
    }

    return { status: 'success' }

  } catch (err) {
    console.error('mergeVolunteer unexpected error:', err)
    return {
      status: 'error',
      message: 'An unexpected error occurred. Please try again.',
    }
  }
}
