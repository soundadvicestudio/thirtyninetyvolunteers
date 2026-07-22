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
  location_id: z.string().uuid().optional().nullable(),
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
