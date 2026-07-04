import 'server-only'
import { getAdminClient } from '@/lib/supabase/admin'
import type { FieldType, FormFieldData, FullForm } from '@/types/form'

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
