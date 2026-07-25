'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit'

export type ActionResult = { success: true } | { error: string }

const SLUG_PATTERN = /^[a-z0-9_-]+$/

function isSuperAdminOrOwnerAdmin(role: string): boolean {
  return role === 'super_admin' || role === 'owner_admin'
}

// ─── Document Type Actions ─────────────────────────────────

export async function createDocumentType({
  name,
  slug,
  description,
}: {
  name: string
  slug: string
  description?: string
}): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSuperAdminOrOwnerAdmin(admin.role)) {
    return { error: 'unauthorized' }
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return { error: 'Name is required.' }
  }

  const trimmedSlug = slug.trim().toLowerCase()
  if (!SLUG_PATTERN.test(trimmedSlug)) {
    return { error: 'Slug must be lowercase letters, numbers, hyphens, or underscores only.' }
  }

  const supabase = await getServerClient()

  const { data: existing } = await supabase
    .from('document_types')
    .select('id')
    .eq('slug', trimmedSlug)
    .maybeSingle()

  if (existing) {
    return { error: 'slug_taken' }
  }

  const { data: maxRow } = await supabase
    .from('document_types')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (maxRow?.sort_order ?? 0) + 1
  const descriptionValue = description?.trim() || null

  const { data: inserted, error } = await supabase
    .from('document_types')
    .insert({
      name: trimmedName,
      slug: trimmedSlug,
      description: descriptionValue,
      sort_order: sortOrder,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    console.error('createDocumentType error:', error)
    return { error: 'Something went wrong adding the document type. Please try again.' }
  }

  await logAction(admin.id, 'document_type.create', 'document_type', inserted.id, undefined, {
    name: trimmedName,
    slug: trimmedSlug,
    description: descriptionValue,
  })

  revalidatePath('/crew/settings/documents')

  return { success: true }
}

export async function updateDocumentType(
  id: string,
  data: { name?: string; description?: string; is_active?: boolean }
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSuperAdminOrOwnerAdmin(admin.role)) {
    return { error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('document_types')
    .select('name, description, is_active')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this document type.' }
  }

  if (data.is_active === false && current.is_active !== false) {
    const { count } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('document_type_id', id)
      .eq('is_type_active', true)

    if ((count ?? 0) > 0) {
      return { error: 'has_active_documents' }
    }
  }

  const updatePayload: Record<string, unknown> = {}
  if (data.name !== undefined) updatePayload.name = data.name.trim()
  if (data.description !== undefined) updatePayload.description = data.description.trim() || null
  if (data.is_active !== undefined) updatePayload.is_active = data.is_active

  const { error: updateError } = await supabase.from('document_types').update(updatePayload).eq('id', id)

  if (updateError) {
    console.error('updateDocumentType error:', updateError)
    return { error: 'Something went wrong updating this document type. Please try again.' }
  }

  await logAction(
    admin.id,
    'document_type.update',
    'document_type',
    id,
    {
      name: current.name,
      description: current.description,
      is_active: current.is_active,
    },
    updatePayload
  )

  revalidatePath('/crew/settings/documents')

  return { success: true }
}

export async function deleteDocumentType(id: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSuperAdminOrOwnerAdmin(admin.role)) {
    return { error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('document_types')
    .select('name, is_system')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this document type.' }
  }

  if (current.is_system) {
    return { error: 'system_type' }
  }

  const { count } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('document_type_id', id)
    .eq('is_active', true)

  if ((count ?? 0) > 0) {
    return { error: 'has_documents' }
  }

  const { error: deleteError } = await supabase.from('document_types').delete().eq('id', id)

  if (deleteError) {
    console.error('deleteDocumentType error:', deleteError)
    return { error: 'Something went wrong deleting this document type. Please try again.' }
  }

  await logAction(admin.id, 'document_type.delete', 'document_type', id, { name: current.name }, undefined)

  revalidatePath('/crew/settings/documents')

  return { success: true }
}

export async function reorderDocumentType(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSuperAdminOrOwnerAdmin(admin.role)) {
    return { error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  // Unlike reorderLocation() (lib/actions/settings.ts), this is NOT filtered
  // to is_active = true — inactive document types remain reorderable in the
  // manager, they're just shown with an inactive indicator.
  const { data: types, error: fetchError } = await supabase
    .from('document_types')
    .select('id, sort_order')
    .order('sort_order', { ascending: true })

  if (fetchError || !types) {
    return { error: 'Could not load document types.' }
  }

  const index = types.findIndex((t) => t.id === id)
  if (index === -1) {
    return { error: 'Could not find this document type.' }
  }

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= types.length) {
    return { success: true }
  }

  const current = types[index]
  const swapTarget = types[swapIndex]

  const { error: updateCurrentError } = await supabase
    .from('document_types')
    .update({ sort_order: swapTarget.sort_order })
    .eq('id', current.id)

  if (updateCurrentError) {
    return { error: 'Something went wrong reordering document types. Please try again.' }
  }

  const { error: updateSwapError } = await supabase
    .from('document_types')
    .update({ sort_order: current.sort_order })
    .eq('id', swapTarget.id)

  if (updateSwapError) {
    return { error: 'Something went wrong reordering document types. Please try again.' }
  }

  await logAction(admin.id, 'document_type.reorder', 'document_type', id, undefined, { direction })

  revalidatePath('/crew/settings/documents')

  return { success: true }
}

export async function setTypeActiveDocument(typeId: string, documentId: string | null): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !isSuperAdminOrOwnerAdmin(admin.role)) {
    return { error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  if (documentId) {
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('id, document_type_id')
      .eq('id', documentId)
      .single()

    if (fetchError || !doc || doc.document_type_id !== typeId) {
      return { error: 'Could not find this document for the selected type.' }
    }
  }

  // Two sequential UPDATEs — the Supabase client has no transaction API.
  // A brief window where all documents for this type are false is
  // preferable to a window where two are simultaneously true.
  const { error: clearError } = await supabase
    .from('documents')
    .update({ is_type_active: false })
    .eq('document_type_id', typeId)

  if (clearError) {
    console.error('setTypeActiveDocument clear error:', clearError)
    return { error: 'Something went wrong updating the active document. Please try again.' }
  }

  if (documentId) {
    const { error: setError } = await supabase
      .from('documents')
      .update({ is_type_active: true })
      .eq('id', documentId)

    if (setError) {
      console.error('setTypeActiveDocument set error:', setError)
      return { error: 'Something went wrong updating the active document. Please try again.' }
    }
  }

  revalidatePath('/crew/settings/documents')

  return { success: true }
}

// ─── Consent Submission Actions ────────────────────────────

export async function approveConsentSubmission(submissionId: string, notes?: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !['editor', 'super_admin', 'owner_admin'].includes(admin.role)) {
    return { error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: submission, error: fetchError } = await supabase
    .from('consent_form_submissions')
    .select('status')
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) {
    return { error: 'Could not find this submission.' }
  }
  if (submission.status !== 'pending') {
    return { error: 'This submission has already been reviewed.' }
  }

  const { error: updateError } = await supabase
    .from('consent_form_submissions')
    .update({
      status: 'approved',
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      notes: notes || null,
    })
    .eq('id', submissionId)

  if (updateError) {
    console.error('approveConsentSubmission error:', updateError)
    return { error: 'Something went wrong approving this submission. Please try again.' }
  }

  await logAction(
    admin.id,
    'consent_submission.approve',
    'consent_form_submission',
    submissionId,
    { status: 'pending' },
    { status: 'approved' }
  )

  revalidatePath('/crew/settings/documents')

  return { success: true }
}

export async function rejectConsentSubmission(submissionId: string, notes?: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || !['editor', 'super_admin', 'owner_admin'].includes(admin.role)) {
    return { error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: submission, error: fetchError } = await supabase
    .from('consent_form_submissions')
    .select('status')
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) {
    return { error: 'Could not find this submission.' }
  }
  if (submission.status !== 'pending') {
    return { error: 'This submission has already been reviewed.' }
  }

  const { error: updateError } = await supabase
    .from('consent_form_submissions')
    .update({
      status: 'rejected',
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      notes: notes || null,
    })
    .eq('id', submissionId)

  if (updateError) {
    console.error('rejectConsentSubmission error:', updateError)
    return { error: 'Something went wrong rejecting this submission. Please try again.' }
  }

  await logAction(
    admin.id,
    'consent_submission.reject',
    'consent_form_submission',
    submissionId,
    { status: 'pending' },
    { status: 'rejected' }
  )

  revalidatePath('/crew/settings/documents')

  return { success: true }
}
