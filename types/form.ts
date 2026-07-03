export type FieldType =
  | 'text'
  | 'textarea'
  | 'dropdown'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'rating'
  | 'number'

export type FormStatus = 'draft' | 'live' | 'closed'

export type FormFieldData = {
  id?: string // present on existing fields
  field_type: FieldType
  label: string
  placeholder?: string | null
  options?: string[] | null // only for dropdown/radio/checkbox
  is_required: boolean
  sort_order: number
}

export type FormData = {
  title: string
  description?: string | null
  status: FormStatus
  fields: FormFieldData[]
}

export type FormListItem = {
  id: string
  title: string
  status: FormStatus
  created_at: string
  response_count: number
}

export type FullForm = {
  id: string
  title: string
  description: string | null
  status: FormStatus
  created_by: string | null
  created_at: string
  updated_at: string
  qr_token: string
  fields: FormFieldData[]
}
