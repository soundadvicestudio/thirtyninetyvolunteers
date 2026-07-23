'use client'

import { useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Plus, Trash2 } from 'lucide-react'
import { recurringEventSchema, type RecurringEventFormData } from '@/lib/validations/calendar'
import { createRecurringEvent } from '@/lib/actions/calendar'
import { describeRecurrence } from '@/lib/utils/calendar-recurrence'
import type { AdminRole } from '@/types/admin'

const TYPE_LABELS: Record<string, string> = {
  rehearsal: 'Rehearsal',
  teaching: 'Teaching',
  meeting: 'Meeting',
  event: 'Event',
  rental: 'Rental',
  other: 'Other',
}

const FREQUENCY_LABELS: Record<'weekly' | 'biweekly' | 'monthly', string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-Weekly',
  monthly: 'Monthly',
}

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'
const errorClasses = 'mt-1 text-sm text-orange'

export default function CalendarRecurringEventForm({
  adminRole,
  calendarEditor,
  locations,
  onClose,
  onSuccess,
}: {
  adminRole: AdminRole
  calendarEditor: boolean
  locations: Array<{ id: string; name: string; color: string }>
  onClose: () => void
  onSuccess: () => void
}) {
  const isSuperAdmin = adminRole === 'super_admin'
  const canDirectCreate = isSuperAdmin || calendarEditor

  const AVAILABLE_TYPES = isSuperAdmin
    ? (['rehearsal', 'teaching', 'meeting', 'event', 'rental', 'other'] as const)
    : (['rehearsal', 'teaching', 'meeting', 'event', 'other'] as const)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecurringEventFormData>({
    resolver: zodResolver(recurringEventSchema),
    defaultValues: {
      title: '',
      event_type: 'rehearsal',
      custom_type_label: '',
      location_id: '',
      start_time: '',
      end_time: '',
      frequency: 'weekly',
      series_start_date: '',
      series_end_date: '',
      description: '',
      requirements: '',
      contacts: [],
    },
  })

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({ control, name: 'contacts' })

  // react-hook-form's watch() is required (matches the established pattern
  // in ShowForm.tsx / CalendarEventForm.tsx) — it returns a function the
  // React Compiler cannot safely memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedEventType = watch('event_type')
  const watchedFrequency = watch('frequency')
  const watchedStartDate = watch('series_start_date')
  const watchedEndDate = watch('series_end_date')

  const previewText = useMemo(() => {
    if (!watchedFrequency || !watchedStartDate) return null
    try {
      return describeRecurrence(watchedFrequency, watchedStartDate, watchedEndDate || null)
    } catch {
      return null
    }
  }, [watchedFrequency, watchedStartDate, watchedEndDate])

  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function onSubmit(data: RecurringEventFormData) {
    setServerError(null)
    const result = await createRecurringEvent(data)
    if (result.success) {
      setSuccessMessage(`Created ${result.occurrenceCount} recurring event${result.occurrenceCount === 1 ? '' : 's'}.`)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } else {
      setServerError(result.error ?? 'An error occurred')
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[61] flex items-end md:items-center justify-center md:p-4 pointer-events-none">
        <div className="bg-white dark:bg-dark-surface rounded-t-2xl md:rounded-lg shadow-xl w-full md:max-w-lg max-h-[90vh] flex flex-col pointer-events-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0">
            <div className="flex items-center justify-between p-4 border-b border-divider dark:border-dark-border shrink-0">
              <h2 className="text-lg font-semibold text-dark dark:text-dark-text">
                {canDirectCreate ? 'Add Recurring Event' : 'Submit Recurring Event'}
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
              <div className="px-4 pt-3 pb-3 text-sm text-mid-gray dark:text-dark-muted bg-light-navy dark:bg-dark-bg border-b border-divider dark:border-dark-border">
                Your recurring event series will be reviewed. An admin will assign a location and approve occurrences
                to the calendar.
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-dark-surface border border-green-200 dark:border-dark-border rounded-md text-sm text-green-800 dark:text-dark-text">
                  ✓ {successMessage}
                </div>
              )}

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

              <div>
                <label className={labelClasses}>Repeat</label>
                <div className="flex gap-3">
                  {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => (
                    <label
                      key={freq}
                      className="flex items-center gap-2 cursor-pointer text-sm text-dark dark:text-dark-text"
                    >
                      <input type="radio" value={freq} {...register('frequency')} className="accent-navy" />
                      {FREQUENCY_LABELS[freq]}
                    </label>
                  ))}
                </div>
                {errors.frequency && <p className={errorClasses}>{errors.frequency.message}</p>}
              </div>

              <div>
                <label className={labelClasses}>
                  First Occurrence<span className="text-orange ml-0.5">*</span>
                </label>
                <input type="date" className={inputClasses} {...register('series_start_date')} />
                {errors.series_start_date && <p className={errorClasses}>{errors.series_start_date.message}</p>}
              </div>

              <div>
                <label className={labelClasses}>Last Occurrence (optional)</label>
                <input type="date" className={inputClasses} {...register('series_end_date')} />
                <p className="mt-1 text-xs text-mid-gray dark:text-dark-muted">
                  Leave blank to generate up to 12 months of events.
                </p>
                {errors.series_end_date && <p className={errorClasses}>{errors.series_end_date.message}</p>}
              </div>

              {previewText && (
                <div className="rounded-md bg-light-navy dark:bg-dark-surface border border-divider dark:border-dark-border px-4 py-3 text-sm text-navy dark:text-dark-text flex items-start gap-2">
                  <span aria-hidden="true">📅</span>
                  <span>{previewText}</span>
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-dark dark:text-dark-text">Theater Contacts</h3>
                  {contactFields.length < 5 && (
                    <button
                      type="button"
                      onClick={() => appendContact({ name: '', phone: '' })}
                      className="flex items-center gap-1 text-sm text-navy dark:text-steel hover:underline cursor-pointer"
                    >
                      <Plus size={14} />
                      Add Contact
                    </button>
                  )}
                </div>
                {contactFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        placeholder="Name"
                        className={inputClasses}
                        {...register(`contacts.${index}.name`)}
                      />
                      {errors.contacts?.[index]?.name && (
                        <p className={errorClasses}>{errors.contacts[index]?.name?.message}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        placeholder="Phone"
                        className={inputClasses}
                        {...register(`contacts.${index}.phone`)}
                      />
                      {errors.contacts?.[index]?.phone && (
                        <p className={errorClasses}>{errors.contacts[index]?.phone?.message}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      aria-label="Remove contact"
                      className="text-orange hover:text-orange/80 text-sm shrink-0 p-2 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-dark-surface border-t border-divider dark:border-dark-border p-4 flex justify-end gap-3 shrink-0">
              {serverError && (
                <p className="mr-auto self-center text-sm text-orange dark:text-orange">{serverError}</p>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-white dark:bg-dark-surface border border-navy text-navy dark:text-steel font-semibold px-5 py-2.5 rounded-lg hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-navy text-white font-bold px-5 py-2.5 rounded-lg hover:bg-steel transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : canDirectCreate ? 'Add to Calendar' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
