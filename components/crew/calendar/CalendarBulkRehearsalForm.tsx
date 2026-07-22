'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Plus, Trash2 } from 'lucide-react'
import { rehearsalBatchSchema, type RehearsalBatchFormData } from '@/lib/validations/calendar'
import { createRehearsalBatch } from '@/lib/actions/calendar'
import type { AdminRole } from '@/types/admin'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'
const errorClasses = 'mt-1 text-sm text-orange'

export default function CalendarBulkRehearsalForm({
  adminRole,
  calendarEditor,
  locations,
  initialDate,
  onClose,
  onSuccess,
}: {
  adminRole: AdminRole
  calendarEditor: boolean
  locations: Array<{ id: string; name: string; color: string }>
  initialDate?: string
  onClose: () => void
  onSuccess: () => void
}) {
  const canDirectCreate = adminRole === 'super_admin' || calendarEditor

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RehearsalBatchFormData>({
    resolver: zodResolver(rehearsalBatchSchema),
    defaultValues: {
      title: '',
      location_id: '',
      description: '',
      requirements: '',
      dates: [],
      contacts: [],
    },
  })

  const {
    fields: dateFields,
    append: appendDate,
    remove: removeDate,
    replace: replaceDates,
  } = useFieldArray({ control, name: 'dates' })

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({ control, name: 'contacts' })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [result, setResult] = useState<{ createdCount: number; failedDates?: { date: string; error: string }[] } | null>(
    null
  )
  const [defaultStartTime, setDefaultStartTime] = useState('')
  const [defaultEndTime, setDefaultEndTime] = useState('')
  const [applyToAllError, setApplyToAllError] = useState<string | null>(null)

  // Mount-only: seed exactly one date row so the form never opens fully
  // empty — pre-filled with initialDate when the form was launched from a
  // specific day (e.g. a day panel click).
  useEffect(() => {
    if (getValues('dates').length === 0) {
      appendDate({ date: initialDate ?? '', start_time: defaultStartTime, end_time: defaultEndTime })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function sortDatesByDate(dates: RehearsalBatchFormData['dates']) {
    return dates.slice().sort((a, b) => a.date.localeCompare(b.date))
  }

  function handleAddDate() {
    const next = [...getValues('dates'), { date: '', start_time: defaultStartTime, end_time: defaultEndTime }]
    replaceDates(sortDatesByDate(next))
  }

  function handleApplyTimeToAll() {
    if (!defaultStartTime || !defaultEndTime) {
      setApplyToAllError('Set default start and end times above before applying.')
      return
    }
    setApplyToAllError(null)
    const current = getValues('dates')
    replaceDates(current.map((d) => ({ ...d, start_time: defaultStartTime, end_time: defaultEndTime })))
  }

  async function onSubmit(data: RehearsalBatchFormData) {
    setIsSubmitting(true)
    setServerError(null)
    setResult(null)
    const res = await createRehearsalBatch(data)
    setIsSubmitting(false)
    if (res.success) {
      setResult({ createdCount: res.createdCount ?? 0, failedDates: res.failedDates })
    } else if (res.createdCount !== undefined) {
      // Fully failed batch — still report which dates errored.
      setResult({ createdCount: res.createdCount, failedDates: res.failedDates })
      setServerError(res.error ?? 'No rehearsal dates could be created.')
    } else {
      setServerError(res.error ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-[61] flex items-end md:items-center justify-center md:p-4 pointer-events-none">
        <div className="bg-white dark:bg-dark-surface rounded-t-2xl md:rounded-lg shadow-xl w-full md:max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-divider dark:border-dark-border shrink-0">
            <h2 className="text-lg font-bold text-dark dark:text-dark-text">Rehearsal Schedule</h2>
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
              Your rehearsal request will be reviewed by an admin who will assign a location and add each date to
              the calendar.
            </p>
          )}

          {result ? (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="rounded-lg bg-light-navy dark:bg-dark-bg p-4">
                <p className="font-semibold text-dark dark:text-dark-text">
                  {result.createdCount} of {result.createdCount + (result.failedDates?.length ?? 0)} rehearsal date
                  {result.createdCount + (result.failedDates?.length ?? 0) === 1 ? '' : 's'} created.
                </p>
              </div>
              {result.failedDates && result.failedDates.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-dark dark:text-dark-text mb-2">Dates that could not be added</h3>
                  <ul className="space-y-1">
                    {result.failedDates.map((f, i) => (
                      <li key={i} className="text-sm text-orange">
                        {f.date}: {f.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
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
                <h3 className="text-sm font-bold text-dark dark:text-dark-text mb-2">
                  Rehearsal Dates<span className="text-orange ml-0.5">*</span>
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-3">
                  <div className="flex-1">
                    <label className={labelClasses}>Default Start Time</label>
                    <input
                      type="time"
                      className={inputClasses}
                      value={defaultStartTime}
                      onChange={(e) => setDefaultStartTime(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelClasses}>Default End Time</label>
                    <input
                      type="time"
                      className={inputClasses}
                      value={defaultEndTime}
                      onChange={(e) => setDefaultEndTime(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyTimeToAll}
                    className="text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer whitespace-nowrap pb-2.5"
                  >
                    Apply to all dates
                  </button>
                </div>
                {applyToAllError && <p className={errorClasses}>{applyToAllError}</p>}
                <div className="space-y-3">
                  {dateFields.map((field, index) => (
                    <div key={field.id} className="flex flex-col sm:flex-row gap-2 sm:items-end">
                      <div className="flex-1">
                        <label className={labelClasses}>Date</label>
                        <input type="date" className={inputClasses} {...register(`dates.${index}.date`)} />
                        {errors.dates?.[index]?.date && (
                          <p className={errorClasses}>{errors.dates[index]?.date?.message}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className={labelClasses}>Start</label>
                        <input type="time" className={inputClasses} {...register(`dates.${index}.start_time`)} />
                        {errors.dates?.[index]?.start_time && (
                          <p className={errorClasses}>{errors.dates[index]?.start_time?.message}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className={labelClasses}>End</label>
                        <input type="time" className={inputClasses} {...register(`dates.${index}.end_time`)} />
                        {errors.dates?.[index]?.end_time && (
                          <p className={errorClasses}>{errors.dates[index]?.end_time?.message}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDate(index)}
                        disabled={dateFields.length === 1}
                        aria-label="Remove date"
                        className="text-mid-gray dark:text-dark-muted hover:text-orange transition-colors p-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.dates?.root && <p className={errorClasses}>{errors.dates.root.message}</p>}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleAddDate}
                    className="flex items-center gap-1 text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Date
                  </button>
                </div>
              </div>

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
          )}

          <div className="sticky bottom-0 bg-white dark:bg-dark-surface px-5 pt-3 pb-4 border-t border-divider dark:border-dark-border shrink-0 space-y-3">
            {serverError && (
              <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark dark:text-dark-text">
                {serverError}
              </div>
            )}
            <div className="flex items-center gap-3">
              {result ? (
                <button
                  type="button"
                  onClick={onSuccess}
                  className="bg-navy text-white font-bold px-5 py-2.5 rounded-lg hover:bg-steel transition-colors cursor-pointer"
                >
                  Done
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="bg-navy text-white font-bold px-5 py-2.5 rounded-lg hover:bg-steel transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving…' : canDirectCreate ? 'Add to Calendar' : 'Submit for Approval'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="bg-white dark:bg-dark-surface border border-navy text-navy dark:text-steel font-semibold px-5 py-2.5 rounded-lg hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
