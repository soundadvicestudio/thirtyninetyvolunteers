import { z } from 'zod'

const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Contact name is required'),
  phone: z.string().min(1, 'Contact phone is required'),
})

export const calendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  event_type: z.enum(['rehearsal', 'teaching', 'meeting', 'event', 'rental', 'other']),
  custom_type_label: z.string().max(100).optional().nullable(),
  // .or(z.literal('')) is required — the form submits '' (not undefined) for
  // "no location selected", and plain .uuid().optional() rejects '' outright.
  location_id: z.string().uuid().or(z.literal('')).optional().nullable(),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  description: z.string().max(2000).optional().nullable(),
  requirements: z.string().max(2000).optional().nullable(),
  contacts: z.array(contactSchema).max(5),
})

// 'performance' is intentionally excluded from event_type — performance
// events are auto-generated from shows via syncShowDateToCalendar() and
// must never be created manually (30BN-CAL.5a).
export const calendarEventSubmitSchema = calendarEventSchema.superRefine((data, ctx) => {
  if (data.end_time <= data.start_time) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End time must be after start time',
      path: ['end_time'],
    })
  }
})

export type CalendarEventFormData = z.infer<typeof calendarEventSchema>

const rehearsalDateSchema = z
  .object({
    date: z.string().min(1, 'Date is required'),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
  })
  .superRefine((data, ctx) => {
    if (data.end_time <= data.start_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['end_time'],
      })
    }
  })

export const rehearsalBatchSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
  location_id: z.string().uuid().or(z.literal('')).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  requirements: z.string().max(2000).optional().nullable(),
  dates: z.array(rehearsalDateSchema).min(1, 'At least one rehearsal date is required'),
  contacts: z.array(contactSchema).max(5),
})

export type RehearsalBatchFormData = z.infer<typeof rehearsalBatchSchema>

export const recurringEventSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
    event_type: z.enum(['rehearsal', 'teaching', 'meeting', 'event', 'rental', 'other']),
    custom_type_label: z.string().max(100).optional().nullable(),
    location_id: z.string().uuid().or(z.literal('')).optional().nullable(),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
    frequency: z.enum(['weekly', 'biweekly', 'monthly']),
    series_start_date: z.string().min(1, 'Start date is required'),
    series_end_date: z.string().optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    requirements: z.string().max(2000).optional().nullable(),
    contacts: z.array(contactSchema).max(5),
  })
  .superRefine((data, ctx) => {
    if (data.end_time <= data.start_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['end_time'],
      })
    }
    if (data.series_end_date && data.series_end_date < data.series_start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['series_end_date'],
      })
    }
  })

export type RecurringEventFormData = z.infer<typeof recurringEventSchema>
