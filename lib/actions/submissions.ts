'use server'

import { z } from 'zod'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendOpportunityEOIEmail, sendOpportunitySlotClaimEmail } from '@/lib/email'
import { logAction } from '@/lib/audit'

const submitOpportunitySchema = z.object({
  opportunityId: z.string().uuid(),
  volunteerName: z.string().min(1, 'Name is required'),
  volunteerEmail: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  volunteerPhone: z.string().optional(),
})

export type SubmitOpportunityResult =
  | { success: true; claimType: 'eoi' | 'slot_claim' }
  | { error: string }

export async function submitOpportunity(formData: {
  opportunityId: string
  volunteerName: string
  volunteerEmail: string
  volunteerPhone?: string
}): Promise<SubmitOpportunityResult> {
  const parsed = submitOpportunitySchema.safeParse(formData)
  if (!parsed.success) {
    return { error: 'Please check your name and email and try again.' }
  }
  const { opportunityId, volunteerName, volunteerEmail, volunteerPhone } = parsed.data

  const client = getAdminClient()

  const { data: opportunity, error: oppError } = await client
    .from('standing_opportunities')
    .select('id, title, claim_type, slot_cap_enabled, slot_cap, status')
    .eq('id', opportunityId)
    .maybeSingle()

  if (oppError || !opportunity || opportunity.status !== 'active') {
    return { error: 'This opportunity is no longer available.' }
  }

  if (opportunity.claim_type === 'slot_claim' && opportunity.slot_cap_enabled && opportunity.slot_cap != null) {
    const { count } = await client
      .from('opportunity_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('opportunity_id', opportunityId)
      .eq('status', 'submitted')

    if ((count ?? 0) >= opportunity.slot_cap) {
      return {
        error: 'This opportunity is full. No more submissions are being accepted at this time.',
      }
    }
  }

  const { data: existing } = await client
    .from('opportunity_submissions')
    .select('id')
    .eq('opportunity_id', opportunityId)
    .eq('volunteer_email', volunteerEmail)
    .eq('status', 'submitted')
    .maybeSingle()

  if (existing) {
    return {
      error: "You've already submitted interest in this opportunity. We'll be in touch!",
    }
  }

  // Match to an existing volunteer record — sequential email-then-phone
  // queries (not OR) to avoid maybeSingle() conflicts when email and
  // phone match different records. Pattern established in 30BN-2.3/2.4.
  let volunteerId: string | null = null
  const { data: byEmail } = await client
    .from('volunteers')
    .select('id')
    .eq('email', volunteerEmail)
    .maybeSingle()
  if (byEmail) {
    volunteerId = byEmail.id
  } else if (volunteerPhone) {
    const { data: byPhone } = await client
      .from('volunteers')
      .select('id')
      .eq('phone', volunteerPhone)
      .maybeSingle()
    if (byPhone) {
      volunteerId = byPhone.id
    }
  }

  const { data: submission, error: insertError } = await client
    .from('opportunity_submissions')
    .insert({
      opportunity_id: opportunityId,
      volunteer_id: volunteerId,
      volunteer_name: volunteerName.trim(),
      volunteer_email: volunteerEmail.trim(),
      volunteer_phone: volunteerPhone?.trim() || null,
      status: 'submitted',
    })
    .select('id')
    .single()

  if (insertError || !submission) {
    console.error('submitOpportunity insert error:', insertError)
    return { error: 'Something went wrong submitting your interest. Please try again.' }
  }

  const claimType = opportunity.claim_type as 'eoi' | 'slot_claim'

  await logAction(null, 'opportunity.submission', 'opportunity_submission', submission.id, undefined, {
    opportunity_id: opportunityId,
    volunteer_email: volunteerEmail,
    claim_type: claimType,
    volunteer_id: volunteerId,
  })

  try {
    const emailResult =
      claimType === 'eoi'
        ? await sendOpportunityEOIEmail({
            to: volunteerEmail,
            name: volunteerName,
            opportunityTitle: opportunity.title,
          })
        : await sendOpportunitySlotClaimEmail({
            to: volunteerEmail,
            name: volunteerName,
            opportunityTitle: opportunity.title,
          })

    const { data: logRow } = await client
      .from('email_log')
      .insert({
        sent_by: null,
        subject: emailResult.subject,
        body_preview: emailResult.preview,
        recipient_type: 'transactional',
        recipient_count: 1,
      })
      .select('id')
      .single()

    if (logRow) {
      await client.from('email_log_recipients').insert({
        email_log_id: logRow.id,
        volunteer_id: volunteerId,
        email_address: volunteerEmail,
      })
    }
  } catch (err) {
    console.error('[email] opportunity submission confirmation failed:', err)
    // Non-blocking — the submission itself already succeeded.
  }

  return { success: true, claimType }
}
