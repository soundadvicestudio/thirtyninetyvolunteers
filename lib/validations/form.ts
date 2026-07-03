import { z } from 'zod'

export const FIELD_TYPES = [
  'text',
  'textarea',
  'dropdown',
  'checkbox',
  'radio',
  'date',
  'rating',
  'number',
] as const

// react-hook-form's useFieldArray requires array elements to be objects, so
// each option string is wrapped as { value: string } for the nested field
// array (R24 — FieldOptionsEditor). Unwrapped back to string[] at the
// FormData payload boundary in FormBuilder's buildPayload().
const formFieldSchema = z.object({
  id: z.string().optional(),
  field_type: z.enum(FIELD_TYPES),
  label: z.string().min(1, 'Label is required'),
  placeholder: z.string(),
  is_required: z.boolean(),
  sort_order: z.number(),
  options: z.array(z.object({ value: z.string() })),
})

// Client-side form schema — raw field-array state managed by react-hook-form.
export const formBuilderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  status: z.enum(['draft', 'live', 'closed']),
  fields: z.array(formFieldSchema),
})

export type FormBuilderValues = z.infer<typeof formBuilderSchema>
