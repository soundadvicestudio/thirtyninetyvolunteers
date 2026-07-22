import { z } from 'zod'

export const NO_SEASON = ''
export const NEW_SEASON = '__new__'
export const NO_CATEGORY = ''

const roleFormSchema = z.object({
  dbId: z.string().nullable(),
  role_name: z.string().min(1, 'Role name is required'),
  category_id: z.string(),
  slots_available: z
    .string()
    .refine((v) => v.trim() === '' || (/^\d+$/.test(v.trim()) && Number(v) >= 0), {
      message: 'Must be a whole number, 0 or more',
    }),
})

// Client-side form schema — raw string inputs, dynamic row arrays.
// Roles are nested per-date: each show date owns its own roles array.
export const showFormSchema = z
  .object({
    name: z.string().min(1, 'Show name is required'),
    location_id: z.string().uuid('Location is required'),
    seasonId: z.string(),
    newSeasonName: z.string().optional(),
    newSeasonStartDate: z.string().optional(),
    newSeasonEndDate: z.string().optional(),
    description: z.string().optional(),
    volunteer_instructions: z.string().optional(),
    default_hours: z
      .string()
      .optional()
      .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
        message: 'Must be a positive number',
      }),
    dates: z
      .array(
        z.object({
          dbId: z.string().nullable(),
          show_date: z.string().min(1, 'Date is required'),
          show_time: z.string().min(1, 'Time is required'),
          roles: z.array(roleFormSchema).min(1, 'At least one role is required for this date'),
        })
      )
      .min(1, 'At least one show date is required'),
    editorIds: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.seasonId === NEW_SEASON && !data.newSeasonName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newSeasonName'],
        message: 'Season name is required',
      })
    }
  })

export type ShowFormValues = z.infer<typeof showFormSchema>

const roleSubmitSchema = z.object({
  dbId: z.string().uuid().nullable(),
  role_name: z.string().min(1),
  category_id: z.string().uuid().nullable(),
  slots_available: z.number().int().min(0),
})

// Server-side payload schema — validated inside the server action, independent of client trust.
export const showSubmitSchema = z.object({
  name: z.string().min(1),
  location_id: z.string().uuid(),
  seasonId: z.string().uuid().nullable(),
  newSeasonName: z.string().nullable(),
  newSeasonStartDate: z.string().nullable(),
  newSeasonEndDate: z.string().nullable(),
  description: z.string().nullable(),
  volunteer_instructions: z.string().nullable(),
  default_hours: z.number().nullable(),
  status: z.enum(['draft', 'live']),
  dates: z
    .array(
      z.object({
        dbId: z.string().uuid().nullable(),
        show_date: z.string().min(1),
        show_time: z.string().min(1),
        roles: z.array(roleSubmitSchema).min(1),
      })
    )
    .min(1),
  editorIds: z.array(z.string().uuid()),
})

export type ShowSubmitPayload = z.infer<typeof showSubmitSchema>
