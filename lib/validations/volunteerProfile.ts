import { z } from 'zod'

export const volunteerProfileSchema = z
  .object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    pronouns: z.string().optional(),
    school: z.string().optional(),
    age_range: z.string().optional(),
    is_minor: z.boolean().optional().default(false),
    guardian_name: z.string().optional(),
    guardian_phone: z.string().optional(),
    category_ids: z.array(z.string()).optional().default([]),
    referral_source: z.string().optional(),
    referral_name: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_minor) {
      if (!data.guardian_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardian_name'],
          message: 'Guardian name is required',
        })
      }
      if (!data.guardian_phone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardian_phone'],
          message: 'Guardian phone is required',
        })
      }
    }
  })

export type VolunteerProfileFormValues = z.infer<typeof volunteerProfileSchema>
