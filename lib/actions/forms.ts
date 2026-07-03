'use server'

import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'
import { logAction } from '@/lib/audit'
import type { FieldType, FormData, FormFieldData, FormListItem, FullForm } from '@/types/form'

const OPTION_FIELD_TYPES: FieldType[] = ['dropdown', 'radio', 'checkbox']

function fieldsToRows(formId: string, fields: FormFieldData[]) {
  return fields.map((field) => ({
    form_id: formId,
    field_type: field.field_type,
    label: field.label,
    placeholder: field.placeholder || null,
    options: field.options?.length ? JSON.stringify(field.options) : null,
    is_required: field.is_required,
    sort_order: field.sort_order,
  }))
}

function parseOptions(raw: unknown): string[] | null {
  if (raw == null) return null
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

export async function createForm(data: FormData): Promise<{ id: string } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: inserted, error } = await supabase
    .from('forms')
    .insert({
      title: data.title,
      description: data.description || null,
      status: data.status,
      created_by: admin.id,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    console.error('createForm error:', error)
    return { error: 'Something went wrong creating the form. Please try again.' }
  }

  if (data.fields.length > 0) {
    const { error: fieldsError } = await supabase
      .from('form_fields')
      .insert(fieldsToRows(inserted.id, data.fields))

    if (fieldsError) {
      console.error('createForm fields error:', fieldsError)
      return { error: 'Form created, but its fields failed to save. Please edit the form and try again.' }
    }
  }

  await logAction(admin.id, 'form.create', 'form', inserted.id, undefined, {
    title: data.title,
    status: data.status,
  })

  return { id: inserted.id }
}

export type UpdateFormResult = { success: true; warning?: string } | { error: string }

export async function updateForm(id: string, data: FormData): Promise<UpdateFormResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role === 'viewer') {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('forms')
    .select('title, status')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this form.' }
  }

  const { error: updateError } = await supabase
    .from('forms')
    .update({
      title: data.title,
      description: data.description || null,
      status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    console.error('updateForm error:', updateError)
    return { error: 'Something went wrong saving the form. Please try again.' }
  }

  // Full field replace strategy: fetch existing field ids, delete each
  // individually so a field blocked by an FK constraint (existing
  // form_response_values) can be skipped without failing the others.
  const { data: existingFields } = await supabase.from('form_fields').select('id').eq('form_id', id)

  const skippedFieldIds: string[] = []
  for (const field of existingFields ?? []) {
    const { error: deleteError } = await supabase.from('form_fields').delete().eq('id', field.id)
    if (deleteError) {
      skippedFieldIds.push(field.id)
    }
  }

  if (data.fields.length > 0) {
    const { error: insertError } = await supabase.from('form_fields').insert(fieldsToRows(id, data.fields))

    if (insertError) {
      console.error('updateForm insert fields error:', insertError)
      return { error: 'Form saved, but its fields failed to update. Please try again.' }
    }
  }

  await logAction(
    admin.id,
    'form.update',
    'form',
    id,
    { title: current.title },
    { title: data.title, status: data.status }
  )

  if (skippedFieldIds.length > 0) {
    return {
      success: true,
      warning: `${skippedFieldIds.length} field(s) could not be removed because they already have responses.`,
    }
  }

  return { success: true }
}

export async function getForms(): Promise<FormListItem[]> {
  const supabase = await getServerClient()

  const [{ data: formRows }, { data: responseRows }] = await Promise.all([
    supabase.from('forms').select('id, title, status, created_at').order('created_at', { ascending: false }),
    supabase.from('form_responses').select('form_id'),
  ])

  const countByForm = new Map<string, number>()
  for (const row of responseRows ?? []) {
    countByForm.set(row.form_id, (countByForm.get(row.form_id) ?? 0) + 1)
  }

  return ((formRows ?? []) as Omit<FormListItem, 'response_count'>[]).map((f) => ({
    ...f,
    response_count: countByForm.get(f.id) ?? 0,
  }))
}

export async function getForm(id: string): Promise<FullForm | null> {
  const supabase = await getServerClient()

  const { data: form, error } = await supabase
    .from('forms')
    .select('id, title, description, status, created_by, created_at, updated_at, qr_token')
    .eq('id', id)
    .maybeSingle()

  if (error || !form) return null

  const { data: fieldRows } = await supabase
    .from('form_fields')
    .select('id, field_type, label, placeholder, options, is_required, sort_order')
    .eq('form_id', id)
    .order('sort_order', { ascending: true })

  const fields: FormFieldData[] = (fieldRows ?? []).map((f) => ({
    id: f.id,
    field_type: f.field_type as FieldType,
    label: f.label,
    placeholder: f.placeholder,
    options: OPTION_FIELD_TYPES.includes(f.field_type as FieldType) ? parseOptions(f.options) : null,
    is_required: f.is_required,
    sort_order: f.sort_order,
  }))

  return { ...form, fields }
}
