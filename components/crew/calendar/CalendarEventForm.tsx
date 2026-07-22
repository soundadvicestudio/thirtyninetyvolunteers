'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Plus, Trash2, Loader2 } from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { calendarEventSchema, type CalendarEventFormData } from '@/lib/validations/calendar'
import { createCalendarEvent, updateCalendarEvent, checkEventConflict } from '@/lib/actions/calendar'
import type { CalendarEvent } from '@/types/calendar'
import type { AdminRole } from '@/types/admin'

const CT = 'America/Chicago'

const TYPE_LABELS: Record<string, string> = {
  rehearsal: 'Rehearsal',
  teaching: 'Teaching',
  meeting: 'Meeting',
  event: 'Event',
  rental: 'Rental',
  other: 'Other',
}

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'
const errorClasses = 'mt-1 text-sm text-orange'

export type CalendarBookingPrefill = {
  date: string
  start_time: string
  end_time: string
  location_id: string
}

export default function CalendarEventForm({
  adminRole,
  calendarEditor,
  locations,
  initialData,
  initialDate,
  initialBooking,
  onClose,
  onSuccess,
}: {
  adminRole: AdminRole
  calendarEditor: boolean
  locations: Array<{ id: string; name: string; color: string }>
  initialData?: CalendarEvent | null
  initialDate?: string
  initialBooking?: CalendarBookingPrefill | null
  onClose: () => void
  onSuccess: () => void
}) {
  const isEdit = !!initialData
  const isSuperAdmin = adminRole === 'super_admin'
  const canDirectCreate = isSuperAdmin || calendarEditor

  const AVAILABLE_TYPES = canDirectCreate
    ? (['rehearsal', 'teaching', 'meeting', 'event', 'rental', 'other'] as const)
    : (['rehearsal', 'teaching', 'meeting', 'event', 'other'] as const)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CalendarEventFormData>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      event_type: (initialData?.event_type as CalendarEventFormData['event_type']) ?? 'rehearsal',
      custom_type_label: initialData?.custom_type_label ?? '',
      location_id: initialData?.location_id ?? initialBooking?.location_id ?? '',
      date: initialData
        ? formatInTimeZone(new Date(initialData.start_time), CT, 'yyyy-MM-dd')
        : (initialBooking?.date ?? initialDate ?? ''),
      start_time: initialData
        ? formatInTimeZone(new Date(initialData.start_time), CT, 'HH:mm')
        : (initialBooking?.start_time ?? ''),
      end_time: initialData
        ? formatInTimeZone(new Date(initialData.end_time), CT, 'HH:mm')
        : (initialBooking?.end_time ?? ''),
      description: initialData?.description ?? '',
      requirements: initialData?.requirements ?? '',
      contacts:
        initialData?.contacts?.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
        })) ?? [],
    },
  })

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: 'contacts',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [conflictChecked, setConflictChecked] = useState(false)
  const [hasConflictResult, setHasConflictResult] = useState(false)
  const [conflictChecking, setConflictChecking] = useState(false)
  const [conflictError, setConflictError] = useState<string | null>(null)

  // react-hook-form's watch() is required (matches the established pattern
  // in ShowForm.tsx) — it returns a function the React Compiler cannot
  // safely memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedEventType = watch('event_type')
  const watchedLocationId = watch('location_id')
  const watchedDate = watch('date')
  const watchedStartTime = watch('start_time')
  const watchedEndTime = watch('end_time')

  // Any change to the availability-relevant fields invalidates a previous
  // conflict check result — the user must re-check before saving again.
  useEffect(() => {
    setConflictChecked(false)
    setHasConflictResult(false)
    setConflictError(null)
  }, [watchedLocationId, watchedDate, watchedStartTime, watchedEndTime])

  const canCheckAvailability =
    canDirectCreate && !!watchedLocationId && !!watchedDate && !!watchedStartTime && !!watchedEndTime

  async function handleCheckAvailability() {
    if (!watchedLocationId) return
    setConflictChecking(true)
    setConflictError(null)
    const result = await checkEventConflict(
      watchedLocationId,
      watchedDate,
      watchedStartTime,
      watchedEndTime,
      initialData?.id
    )
    setConflictChecking(false)
    setConflictChecked(true)
    if (result.error) {
      setConflictError(result.error)
      return
    }
    setHasConflictResult(result.conflict)
  }

  async function onSubmit(data: CalendarEventFormData) {
    setIsSubmitting(true)
    setServerError(null)
    const result = isEdit ? await updateCalendarEvent(initialData!.id, data) : await createCalendarEvent(data)
    setIsSubmitting(false)
    if (result.success) {
      onSuccess()
    } else {
      setServerError(result.error ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col pointer-events-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-divider dark:border-dark-border shrink-0">
            <h2 className="text-lg font-bold text-dark dark:text-dark-text">
              {isEdit ? 'Edit Event' : canDirectCreate ? 'Add to Calendar' : 'Submit for Approval'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1 rounded text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-bg cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {!canDirectCreate && (
            <p className="px-5 pt-4 text-sm text-mid-gray dark:text-dark-muted">
              Your request will be reviewed by an admin who will assign a location and add it to the calendar.
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <label className={labelClasses}>
                Title<span className="text-orange ml-0.5">*</span>
              </label>
              <input type="text" className={inputClasses} {...register('title')} />
              {errors.title && <p className={errorClasses}>{errors.title.message}</p>}
            </div>

            <div>
              <label className={labelClasses}>
                Event Type<span className="text-orange ml-0.5">*</span>
              </label>
              <select className={inputClasses} {...register('event_type')}>
                {AVAILABLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              {errors.event_type && <p className={errorClasses}>{errors.event_type.message}</p>}
            </div>

            {watchedEventType === 'other' && (
              <div>
                <label className={labelClasses}>Custom Type Label</label>
                <input type="text" className={inputClasses} {...register('custom_type_label')} />
                {errors.custom_type_label && <p className={errorClasses}>{errors.custom_type_label.message}</p>}
              </div>
            )}

            <div>
              <label className={labelClasses}>
                {canDirectCreate ? (
                  <>
                    Location<span className="text-orange ml-0.5">*</span>
                  </>
                ) : (
                  'Preferred Location (optional)'
                )}
              </label>
              <select className={inputClasses} {...register('location_id')}>
                <option value="">{canDirectCreate ? 'Select a location' : 'No preference'}</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              {errors.location_id && <p className={errorClasses}>{errors.location_id.message}</p>}
            </div>

            <div>
              <label className={labelClasses}>
                Date<span className="text-orange ml-0.5">*</span>
              </label>
              <input type="date" className={inputClasses} {...register('date')} />
              {errors.date && <p className={errorClasses}>{errors.date.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClasses}>
                  Start Time<span className="text-orange ml-0.5">*</span>
                </label>
                <input type="time" className={inputClasses} {...register('start_time')} />
                {errors.start_time && <p className={errorClasses}>{errors.start_time.message}</p>}
              </div>
              <div>
                <label className={labelClasses}>
                  End Time<span className="text-orange ml-0.5">*</span>
                </label>
                <input type="time" className={inputClasses} {...register('end_time')} />
                {errors.end_time && <p className={errorClasses}>{errors.end_time.message}</p>}
              </div>
            </div>

            {canCheckAvailability && (
              <div>
                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={conflictChecking}
                  className="flex items-center gap-2 text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer disabled:opacity-50"
                >
                  {conflictChecking && <Loader2 size={14} className="animate-spin" />}
                  {conflictChecking ? 'Checking…' : 'Check Availability'}
                </button>
                {conflictError && <p className={errorClasses}>{conflictError}</p>}
                {conflictChecked &&
                  !conflictError &&
                  (hasConflictResult ? (
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                      Conflict detected — this time slot overlaps an existing booking. You may still save.
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-green-700 dark:text-green-400">Time slot is available</p>
                  ))}
              </div>
            )}

            <div>
              <label className={labelClasses}>Description</label>
              <textarea rows={3} className={inputClasses} {...register('description')} />
              {errors.description && <p className={errorClasses}>{errors.description.message}</p>}
            </div>

            <div>
              <label className={labelClasses}>Requirements</label>
              <textarea rows={3} className={inputClasses} {...register('requirements')} />
              {errors.requirements && <p className={errorClasses}>{errors.requirements.message}</p>}
            </div>

            <div>
              <h3 className="text-sm font-bold text-dark dark:text-dark-text mb-2">Theater Contacts</h3>
              <div className="space-y-3">
                {contactFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className={labelClasses}>
                        Name<span className="text-orange ml-0.5">*</span>
                      </label>
                      <input type="text" className={inputClasses} {...register(`contacts.${index}.name`)} />
                      {errors.contacts?.[index]?.name && (
                        <p className={errorClasses}>{errors.contacts[index]?.name?.message}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className={labelClasses}>
                        Phone<span className="text-orange ml-0.5">*</span>
                      </label>
                      <input type="text" className={inputClasses} {...register(`contacts.${index}.phone`)} />
                      {errors.contacts?.[index]?.phone && (
                        <p className={errorClasses}>{errors.contacts[index]?.phone?.message}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      aria-label="Remove contact"
                      className="text-mid-gray dark:text-dark-muted hover:text-orange transition-colors p-2 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {contactFields.length < 5 && (
                <button
                  type="button"
                  onClick={() => appendContact({ name: '', phone: '' })}
                  className="mt-3 flex items-center gap-1 text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
                >
                  <Plus size={14} />
                  Add Contact
                </button>
              )}
            </div>
          </form>

          <div className="px-5 py-4 border-t border-divider dark:border-dark-border shrink-0 space-y-3">
            {serverError && (
              <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark dark:text-dark-text">
                {serverError}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-navy text-white font-bold px-5 py-2.5 rounded-lg hover:bg-steel transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? 'Saving…'
                  : isEdit
                    ? 'Save Changes'
                    : canDirectCreate
                      ? 'Add to Calendar'
                      : 'Submit for Approval'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-white dark:bg-dark-surface border border-navy text-navy dark:text-steel font-semibold px-5 py-2.5 rounded-lg hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
