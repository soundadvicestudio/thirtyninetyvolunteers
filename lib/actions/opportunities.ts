'use server'

import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'
import { logAction } from '@/lib/audit'
import { opportunitySubmitSchema, type OpportunitySubmitPayload } from '@/lib/validations/opportunity'

export type CreateOpportunityResult = { success: true; opportunityId: string } | { error: string }

export async function createOpportunity(
  payload: OpportunitySubmitPayload
): Promise<CreateOpportunityResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const parsed = opportunitySubmitSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: 'Invalid input. Please check the form and try again.' }
  }
  const value = parsed.data

  const supabase = await getServerClient()

  const { data: inserted, error } = await supabase
    .from('standing_opportunities')
    .insert({
      title: value.title.trim(),
      description: value.description?.trim() || null,
      claim_type: value.claim_type,
      slot_cap_enabled: value.slot_cap_enabled,
      slot_cap: value.slot_cap_enabled ? value.slot_cap : null,
      status: 'active',
      created_by: admin.id,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    console.error('createOpportunity error:', error)
    return { error: 'Something went wrong creating the opportunity. Please try again.' }
  }

  await logAction(admin.id, 'opportunity.create', 'opportunity', inserted.id, undefined, {
    title: value.title.trim(),
    claim_type: value.claim_type,
    slot_cap_enabled: value.slot_cap_enabled,
    slot_cap: value.slot_cap_enabled ? value.slot_cap : null,
  })

  return { success: true, opportunityId: inserted.id }
}

export type OpportunityActionResult = { success: true } | { error: string }

export async function updateOpportunity(
  opportunityId: string,
  payload: OpportunitySubmitPayload
): Promise<OpportunityActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const parsed = opportunitySubmitSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: 'Invalid input. Please check the form and try again.' }
  }
  const value = parsed.data

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('standing_opportunities')
    .select('title, description, claim_type, slot_cap_enabled, slot_cap')
    .eq('id', opportunityId)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this opportunity.' }
  }

  const afterValue = {
    title: value.title.trim(),
    description: value.description?.trim() || null,
    claim_type: value.claim_type,
    slot_cap_enabled: value.slot_cap_enabled,
    slot_cap: value.slot_cap_enabled ? value.slot_cap : null,
  }

  const { error: updateError } = await supabase
    .from('standing_opportunities')
    .update({ ...afterValue, updated_at: new Date().toISOString() })
    .eq('id', opportunityId)

  if (updateError) {
    console.error('updateOpportunity error:', updateError)
    return { error: 'Something went wrong saving the opportunity. Please try again.' }
  }

  await logAction(admin.id, 'opportunity.update', 'opportunity', opportunityId, current, afterValue)

  return { success: true }
}

export async function archiveOpportunity(opportunityId: string): Promise<OpportunityActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('standing_opportunities')
    .select('status')
    .eq('id', opportunityId)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this opportunity.' }
  }

  const { error: updateError } = await supabase
    .from('standing_opportunities')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', opportunityId)

  if (updateError) {
    console.error('archiveOpportunity error:', updateError)
    return { error: 'Something went wrong archiving the opportunity. Please try again.' }
  }

  await logAction(
    admin.id,
    'opportunity.archive',
    'opportunity',
    opportunityId,
    { status: current.status },
    { status: 'archived' }
  )

  return { success: true }
}
