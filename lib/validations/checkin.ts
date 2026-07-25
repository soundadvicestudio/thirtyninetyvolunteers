import { z } from 'zod'

// Mirrors the public volunteer signup schema pattern (components/VolunteerForm.tsx
// createSchema()) — same field names, same optional/required shape, same
// superRefine cross-field pattern for guardian fields. age_range kept as a plain
// optional string (not z.enum()) to match that reference implementation, which
// relies on the <select> dropdown + DB CHECK constraint rather than a zod enum.
export const checkInSignupSchema = z
  .object({
    full_name: z.string().min(1, 'Full name is required').max(150),
    email: z.string().email('Please enter a valid email address').max(150),
    phone: z.string().min(10, 'Phone number is required').max(30),
    pronouns: z.string().max(100).optional(),
    school: z.string().max(200).optional(),
    age_range: z.string().optional(),
    is_minor: z.boolean().default(false),
    guardian_name: z.string().max(150).optional(),
    guardian_phone: z.string().max(30).optional(),
    requires_service_hours: z.boolean().default(false),
    referral_source: z.string().optional(),
    referral_name: z.string().max(200).optional(),
    category_ids: z.array(z.string().uuid()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.is_minor) {
      if (!data.guardian_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardian_name'],
          message: 'Guardian name is required for volunteers under 18',
        })
      }
      if (!data.guardian_phone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardian_phone'],
          message: 'Guardian phone is required for volunteers under 18',
        })
      }
    }
  })

export type CheckInSignupInput = z.infer<typeof checkInSignupSchema>
