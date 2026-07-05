'use server'

import { revalidatePath } from 'next/cache'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
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

  revalidatePath('/crew/forms')

  return { id: inserted.id }
}

export type UpdateFormResult = { success: true } | { error: string }

function fieldColumns(field: FormFieldData, sortOrder: number) {
  return {
    field_type: field.field_type,
    label: field.label,
    placeholder: field.placeholder || null,
    options: field.options?.length ? JSON.stringify(field.options) : null,
    is_required: field.is_required,
    sort_order: sortOrder,
  }
}

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

  // Diff-based field sync (30BN-ADMIN.17-FIX): existing fields are updated
  // in place, preserving their id, so form_response_values for that field is
  // never touched. Only fields the admin actually removed are deleted —
  // CASCADE on form_response_values.field_id (Migration 012) fires only
  // there, which is correct (response values for a removed field are
  // meaningless without it).
  const { data: existingFields } = await supabase.from('form_fields').select('id').eq('form_id', id)
  const existingIds = new Set((existingFields ?? []).map((f) => f.id))

  const fields = data.fields
  const toUpdate = fields.filter(
    (f): f is FormFieldData & { id: string } => !!f.id && existingIds.has(f.id)
  )
  const toInsert = fields.filter((f) => !f.id || !existingIds.has(f.id))
  const toDeleteIds = [...existingIds].filter((fieldId) => !fields.some((f) => f.id === fieldId))

  if (toDeleteIds.length > 0) {
    const { error: deleteError } = await supabase.from('form_fields').delete().in('id', toDeleteIds)
    if (deleteError) {
      console.error('updateForm delete fields error:', deleteError)
      return { error: 'Form saved, but removing deleted fields failed. Please try again.' }
    }
  }

  for (const field of toUpdate) {
    const { error: fieldUpdateError } = await supabase
      .from('form_fields')
      .update(fieldColumns(field, fields.indexOf(field)))
      .eq('id', field.id)

    if (fieldUpdateError) {
      console.error('updateForm field update error:', fieldUpdateError)
      return { error: 'Form saved, but its fields failed to update. Please try again.' }
    }
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('form_fields')
      .insert(toInsert.map((field) => ({ form_id: id, ...fieldColumns(field, fields.indexOf(field)) })))

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

  revalidatePath('/crew/forms')
  revalidatePath(`/crew/forms/${id}`)
  revalidatePath(`/forms/${id}`)

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

// Public, unauthenticated submission — uses getAdminClient() for the
// volunteer lookup (bypasses RLS) and the form/fields fetch. The anon
// INSERT RLS policies on form_responses/form_response_values already
// cover the actual inserts.
export async function submitFormResponse(
  formId: string,
  values: Record<string, string | string[]>
): Promise<{ success: true } | { error: string }> {
  try {
    const client = getAdminClient()

    // A. Verify form is live
    const { data: form, error: formError } = await client
      .from('forms')
      .select('id, status')
      .eq('id', formId)
      .maybeSingle()

    if (formError || !form || form.status !== 'live') {
      return { error: 'This form is not available.' }
    }

    // B. Fetch fields for validation + insertion
    const { data: fieldRows, error: fieldsError } = await client
      .from('form_fields')
      .select('id, is_required, sort_order')
      .eq('form_id', formId)
      .order('sort_order', { ascending: true })

    if (fieldsError || !fieldRows) {
      return { error: 'Submission failed. Please try again.' }
    }

    // C. Server-side required field validation + per-value length cap
    const MAX_VALUE_LENGTH = 2000
    for (const field of fieldRows) {
      const value = values[field.id]
      if (field.is_required) {
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return { error: 'Please complete all required fields.' }
          }
        } else if (!value || value.trim().length === 0) {
          return { error: 'Please complete all required fields.' }
        }
      }
      if (typeof value === 'string' && value.length > MAX_VALUE_LENGTH) {
        return { error: 'One or more responses is too long. Please shorten your answer and try again.' }
      }
    }

    // D. Volunteer profile linking — scan all submitted values for an
    // email and a loose digits-only phone pattern.
    let emailValue: string | null = null
    let phoneValue: string | null = null

    for (const value of Object.values(values)) {
      if (typeof value === 'string') {
        if (value.includes('@')) {
          emailValue = value.trim().toLowerCase()
        }
        if (/^\d{7,15}$/.test(value.trim())) {
          phoneValue = value.trim()
        }
      }
    }

    // Sequential email-then-phone lookup (pattern from 30BN-2.4) — avoids
    // maybeSingle() conflicts when email and phone match different records.
    let volunteerId: string | null = null
    if (emailValue) {
      const { data: byEmail } = await client
        .from('volunteers')
        .select('id')
        .ilike('email', emailValue)
        .maybeSingle()
      if (byEmail) volunteerId = byEmail.id
    }
    if (!volunteerId && phoneValue) {
      const { data: byPhone } = await client
        .from('volunteers')
        .select('id')
        .eq('phone', phoneValue)
        .maybeSingle()
      if (byPhone) volunteerId = byPhone.id
    }

    // E. Insert form_responses
    const { data: response, error: responseError } = await client
      .from('form_responses')
      .insert({ form_id: formId, volunteer_id: volunteerId })
      .select('id')
      .single()

    if (responseError || !response) {
      console.error('submitFormResponse insert response error:', responseError)
      return { error: 'Submission failed. Please try again.' }
    }

    // F. Insert form_response_values
    const valueRows = fieldRows.map((field) => {
      const rawValue = values[field.id]
      let serialized: string | null

      if (Array.isArray(rawValue)) {
        serialized = JSON.stringify(rawValue)
      } else if (typeof rawValue === 'string') {
        serialized = rawValue.trim() || null
      } else {
        serialized = null
      }

      return {
        response_id: response.id,
        field_id: field.id,
        value: serialized,
      }
    })

    const { error: valuesError } = await client.from('form_response_values').insert(valueRows)

    if (valuesError) {
      console.error('submitFormResponse insert values error:', valuesError)
      return { error: 'Submission failed. Please try again.' }
    }

    return { success: true }
  } catch (err) {
    console.error('submitFormResponse error:', err)
    return { error: 'Submission failed. Please try again.' }
  }
}
