import { z } from 'zod'

// Client-side form schema — raw string inputs.
export const opportunityFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    claim_type: z.enum(['eoi', 'slot_claim']),
    slot_cap_enabled: z.boolean(),
    slot_cap: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.slot_cap_enabled) {
      const n = Number(data.slot_cap)
      if (!data.slot_cap?.trim() || !Number.isInteger(n) || n < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['slot_cap'],
          message: 'Enter a whole number of 1 or more',
        })
      }
    }
  })

export type OpportunityFormValues = z.infer<typeof opportunityFormSchema>

// Server-side payload schema — validated inside the server action, independent of client trust.
export const opportunitySubmitSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().nullable(),
    claim_type: z.enum(['eoi', 'slot_claim']),
    slot_cap_enabled: z.boolean(),
    slot_cap: z.number().int().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.slot_cap_enabled && (data.slot_cap == null || data.slot_cap < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['slot_cap'],
        message: 'Slot cap must be an integer of 1 or more when enabled',
      })
    }
  })

export type OpportunitySubmitPayload = z.infer<typeof opportunitySubmitSchema>
