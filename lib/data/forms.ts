import 'server-only'
import { getAdminClient } from '@/lib/supabase/admin'
import { getServerClient } from '@/lib/supabase/server'
import type { FieldType, FormFieldData, FormStatus, FullForm } from '@/types/form'

const OPTION_FIELD_TYPES: FieldType[] = ['dropdown', 'radio', 'checkbox']

function parseOptions(raw: unknown): string[] | null {
  if (raw == null) return null
  if (Array.isArray(raw)) return raw.length > 0 ? (raw as string[]) : null
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

// Public page read — no session exists for anonymous visitors, so this
// uses getAdminClient() (server-only, never exposed to client). Returns
// the form regardless of status; the page component handles status-based
// routing (draft/closed/live).
export async function getPublicForm(id: string): Promise<FullForm | null> {
  try {
    const client = getAdminClient()

    const { data: form, error } = await client
      .from('forms')
      .select('id, title, description, status, created_by, created_at, updated_at, qr_token')
      .eq('id', id)
      .maybeSingle()

    if (error || !form) return null

    const { data: fieldRows } = await client
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
  } catch (err) {
    console.error('getPublicForm error:', err)
    return null
  }
}

export type FormDetail = {
  id: string
  title: string
  description: string | null
  status: FormStatus
  created_at: string
  updated_at: string
  qr_token: string
  response_count: number
}

// Admin detail page read — called from an authenticated session, so this
// uses getServerClient() (RLS applies, admin_users role already verified
// upstream by the page).
export async function getFormDetail(id: string): Promise<FormDetail | null> {
  const supabase = await getServerClient()

  const { data: form, error } = await supabase
    .from('forms')
    .select('id, title, description, status, created_at, updated_at, qr_token')
    .eq('id', id)
    .maybeSingle()

  if (error || !form) return null

  const { count } = await supabase
    .from('form_responses')
    .select('id', { count: 'exact', head: true })
    .eq('form_id', id)

  return { ...form, response_count: count ?? 0 }
}

export type ResponseRow = {
  id: string
  submitted_at: string
  volunteer_id: string | null
  volunteer_name: string | null
  volunteer_email: string | null
  values: Record<string, string>
}

export type FormResponsesData = {
  form: { id: string; title: string; status: FormStatus }
  fields: FormFieldData[]
  responses: ResponseRow[]
}

// Response viewer read. Fixed set of queries regardless of response
// count (no N+1): form, fields, responses, then a batched volunteers
// lookup and a batched form_response_values lookup.
export async function getFormResponses(id: string): Promise<FormResponsesData | null> {
  const supabase = await getServerClient()

  const { data: form, error } = await supabase.from('forms').select('id, title, status').eq('id', id).maybeSingle()

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

  const { data: responseRows } = await supabase
    .from('form_responses')
    .select('id, submitted_at, volunteer_id')
    .eq('form_id', id)
    .order('submitted_at', { ascending: false })

  const responseList = responseRows ?? []

  const volunteerIds = [
    ...new Set(responseList.map((r) => r.volunteer_id).filter((v): v is string => v != null)),
  ]

  const volunteerMap = new Map<string, { full_name: string; email: string }>()
  if (volunteerIds.length > 0) {
    const { data: volunteerRows } = await supabase
      .from('volunteers')
      .select('id, full_name, email')
      .in('id', volunteerIds)
    for (const v of volunteerRows ?? []) {
      volunteerMap.set(v.id, { full_name: v.full_name, email: v.email })
    }
  }

  const responseIds = responseList.map((r) => r.id)
  const valuesMap = new Map<string, Record<string, string>>()
  if (responseIds.length > 0) {
    const { data: valueRows } = await supabase
      .from('form_response_values')
      .select('response_id, field_id, value')
      .in('response_id', responseIds)
    for (const v of valueRows ?? []) {
      const bucket = valuesMap.get(v.response_id) ?? {}
      bucket[v.field_id] = v.value ?? ''
      valuesMap.set(v.response_id, bucket)
    }
  }

  const responses: ResponseRow[] = responseList.map((r) => {
    const volunteer = r.volunteer_id ? volunteerMap.get(r.volunteer_id) : undefined
    return {
      id: r.id,
      submitted_at: r.submitted_at,
      volunteer_id: r.volunteer_id,
      volunteer_name: volunteer?.full_name ?? null,
      volunteer_email: volunteer?.email ?? null,
      values: valuesMap.get(r.id) ?? {},
    }
  })

  return {
    form: { id: form.id, title: form.title, status: form.status as FormStatus },
    fields,
    responses,
  }
}
