'use client'

import { useEffect, useRef, useState } from 'react'
import {
  useForm,
  useFieldArray,
  useWatch,
  type Resolver,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createShow, updateShow, sendShowNotifications } from '@/lib/actions/shows'
import {
  showFormSchema,
  NO_SEASON,
  NEW_SEASON,
  NO_CATEGORY,
  type ShowFormValues,
} from '@/lib/validations/show'
import type { ShowSubmitPayload } from '@/lib/validations/show'
import type { Show, ShowDateWithRoles, ShowStatus } from '@/types/show'

const DATE_BLOCKED_MESSAGE =
  'This show date has active claims and cannot be removed. Cancel existing claims first.'
const ROLE_BLOCKED_MESSAGE =
  'This role has active claims and cannot be removed. Cancel existing claims first.'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'
const errorClasses = 'mt-1 text-sm text-orange'

const BLANK_ROLE = { dbId: null, role_name: '', category_id: NO_CATEGORY, slots_available: '1' }

function buildPayload(data: ShowFormValues, status: 'draft' | 'live'): ShowSubmitPayload {
  const isNewSeason = data.seasonId === NEW_SEASON
  return {
    name: data.name.trim(),
    show_type: data.show_type,
    seasonId: isNewSeason || data.seasonId === NO_SEASON ? null : data.seasonId,
    newSeasonName: isNewSeason ? data.newSeasonName?.trim() || null : null,
    newSeasonStartDate: isNewSeason ? data.newSeasonStartDate || null : null,
    newSeasonEndDate: isNewSeason ? data.newSeasonEndDate || null : null,
    description: data.description?.trim() || null,
    volunteer_instructions: data.volunteer_instructions?.trim() || null,
    default_hours: data.default_hours?.trim() ? Number(data.default_hours) : null,
    status,
    dates: data.dates.map((d) => ({
      dbId: d.dbId,
      show_date: d.show_date,
      show_time: d.show_time,
      roles: d.roles.map((r) => ({
        dbId: r.dbId,
        role_name: r.role_name.trim(),
        category_id: r.category_id || null,
        slots_available: r.slots_available.trim() === '' ? 0 : Number(r.slots_available),
      })),
    })),
    editorIds: data.editorIds,
  }
}

function hasZeroSlotRole(data: ShowFormValues): boolean {
  return data.dates.some((d) =>
    d.roles.some((r) => r.slots_available.trim() === '' || Number(r.slots_available) === 0)
  )
}

function DateRow({
  control,
  register,
  errors,
  dateIndex,
  dateField,
  onRemoveDate,
  canRemoveDate,
  categories,
  blockedDateIds,
  blockedRoleIds,
}: {
  control: Control<ShowFormValues>
  register: UseFormRegister<ShowFormValues>
  errors: FieldErrors<ShowFormValues>
  dateIndex: number
  dateField: { id: string; dbId: string | null }
  onRemoveDate: () => void
  canRemoveDate: boolean
  categories: { id: string; name: string }[]
  blockedDateIds: string[]
  blockedRoleIds: string[]
}) {
  const { fields: roleFields, append: appendRole, remove: removeRole } = useFieldArray({
    control,
    name: `dates.${dateIndex}.roles`,
  })

  // Always call the hook at a stable path; the copy affordance is gated
  // on dateIndex > 0 separately, so watching our own roles when
  // dateIndex === 0 is harmless (its value is simply never used).
  const previousDateRoles = useWatch({
    control,
    name: `dates.${Math.max(dateIndex - 1, 0)}.roles`,
  })
  const canCopyFromPrevious = dateIndex > 0 && Array.isArray(previousDateRoles) && previousDateRoles.length > 0

  function handleCopyFromPrevious() {
    if (!Array.isArray(previousDateRoles)) return
    for (const r of previousDateRoles) {
      appendRole({
        dbId: null,
        role_name: r.role_name,
        category_id: r.category_id,
        slots_available: r.slots_available,
      })
    }
  }

  const dateWarning =
    dateField.dbId && blockedDateIds.includes(dateField.dbId) ? DATE_BLOCKED_MESSAGE : null
  const dateErrors = errors.dates?.[dateIndex]
  const rolesArrayError = dateErrors?.roles?.message

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className={labelClasses}>
            Date<span className="text-orange ml-0.5">*</span>
          </label>
          <input type="date" className={inputClasses} {...register(`dates.${dateIndex}.show_date`)} />
          {dateErrors?.show_date && <p className={errorClasses}>{dateErrors.show_date.message}</p>}
        </div>
        <div className="flex-1">
          <label className={labelClasses}>
            Time<span className="text-orange ml-0.5">*</span>
          </label>
          <input type="time" className={inputClasses} {...register(`dates.${dateIndex}.show_time`)} />
          {dateErrors?.show_time && <p className={errorClasses}>{dateErrors.show_time.message}</p>}
        </div>
        <button
          type="button"
          onClick={onRemoveDate}
          disabled={!canRemoveDate}
          aria-label="Remove date"
          className="text-mid-gray dark:text-dark-muted hover:text-orange transition-colors p-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 size={18} />
        </button>
      </div>
      {dateWarning && <p className="text-sm text-orange">{dateWarning}</p>}

      <div className="border-t border-divider dark:border-dark-border pt-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h4 className="text-sm font-bold text-dark dark:text-dark-text">Roles for this date</h4>
          {canCopyFromPrevious && (
            <button
              type="button"
              onClick={handleCopyFromPrevious}
              className="text-xs font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
            >
              Copy roles from previous date
            </button>
          )}
        </div>

        <div className="space-y-3">
          {roleFields.map((roleField, roleIndex) => {
            const roleWarning =
              roleField.dbId && blockedRoleIds.includes(roleField.dbId) ? ROLE_BLOCKED_MESSAGE : null
            const roleErrors = dateErrors?.roles?.[roleIndex]
            return (
              <div key={roleField.id} className="bg-light-navy/30 dark:bg-dark-bg/40 rounded-lg p-3">
                <div className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_auto] gap-3 sm:items-end">
                  <div>
                    <label className={labelClasses}>
                      Role Name<span className="text-orange ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      className={inputClasses}
                      {...register(`dates.${dateIndex}.roles.${roleIndex}.role_name`)}
                    />
                    {roleErrors?.role_name && (
                      <p className={errorClasses}>{roleErrors.role_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClasses}>Category</label>
                    <select
                      className={inputClasses}
                      {...register(`dates.${dateIndex}.roles.${roleIndex}.category_id`)}
                    >
                      <option value={NO_CATEGORY}>No category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>
                      Slots<span className="text-orange ml-0.5">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className={inputClasses}
                      {...register(`dates.${dateIndex}.roles.${roleIndex}.slots_available`)}
                    />
                    {roleErrors?.slots_available && (
                      <p className={errorClasses}>{roleErrors.slots_available.message}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRole(roleIndex)}
                    disabled={roleFields.length === 1}
                    aria-label="Remove role"
                    className="text-mid-gray dark:text-dark-muted hover:text-orange transition-colors p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {roleWarning && <p className="text-sm text-orange mt-2">{roleWarning}</p>}
              </div>
            )
          })}
        </div>
        {typeof rolesArrayError === 'string' && <p className={errorClasses}>{rolesArrayError}</p>}
        <button
          type="button"
          onClick={() => appendRole({ ...BLANK_ROLE })}
          className="mt-3 text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
        >
          ＋ Add Role for This Date
        </button>
      </div>
    </div>
  )
}

export default function ShowForm({
  seasons,
  adminUsers,
  categories,
  defaultHours,
  show,
  blockedDateIds = [],
  blockedRoleIds = [],
}: {
  seasons: { id: string; name: string }[]
  adminUsers: { id: string; name: string; email: string }[]
  categories: { id: string; name: string }[]
  defaultHours: { mainstage: number; studio_x: number; one_off: number }
  show?: Show & { dates: ShowDateWithRoles[]; editorIds: string[] }
  blockedDateIds?: string[]
  blockedRoleIds?: string[]
}) {
  const isEdit = !!show

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ShowFormValues>({
    resolver: zodResolver(showFormSchema) as Resolver<ShowFormValues>,
    defaultValues: {
      name: show?.name ?? '',
      show_type: show?.show_type ?? 'mainstage',
      seasonId: show?.season_id ?? NO_SEASON,
      newSeasonName: '',
      newSeasonStartDate: '',
      newSeasonEndDate: '',
      description: show?.description ?? '',
      volunteer_instructions: show?.volunteer_instructions ?? '',
      default_hours: show?.default_hours != null ? String(show.default_hours) : '',
      dates: show?.dates?.length
        ? show.dates.map((d) => ({
            dbId: d.id,
            show_date: d.show_date,
            show_time: d.show_time.slice(0, 5),
            roles: d.roles.length
              ? d.roles.map((r) => ({
                  dbId: r.id,
                  role_name: r.role_name,
                  category_id: r.category_id ?? NO_CATEGORY,
                  slots_available: String(r.slots_available),
                }))
              : [],
          }))
        : [{ dbId: null, show_date: '', show_time: '', roles: [{ ...BLANK_ROLE }] }],
      editorIds: show?.editorIds ?? [],
    },
  })

  const { fields: dateFields, append: appendDate, remove: removeDate } = useFieldArray({
    control,
    name: 'dates',
  })

  const [status, setStatus] = useState<ShowStatus>(show?.status ?? 'draft')
  const [formError, setFormError] = useState<string | null>(null)
  const [submittingStatus, setSubmittingStatus] = useState<'draft' | 'live' | null>(null)
  const [pendingPublish, setPendingPublish] = useState<ShowFormValues | null>(null)
  const [showPublishWarning, setShowPublishWarning] = useState(false)
  const [defaultHoursDirty, setDefaultHoursDirty] = useState(show?.default_hours != null)
  const [notify, setNotify] = useState(!show?.notifications_sent_at)
  const [notifyResult, setNotifyResult] = useState<string | null>(null)

  // react-hook-form's watch() is required (Brief §3); switching to useWatch() per
  // field would be a broader refactor across this form's nested date/role field
  // arrays (R24), not a surgical fix.
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedShowType = watch('show_type')
  const watchedSeasonId = watch('seasonId')
  const watchedEditorIds = watch('editorIds') ?? []
  const didMountRef = useRef(false)

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (!defaultHoursDirty) {
      const map = {
        mainstage: defaultHours.mainstage,
        studio_x: defaultHours.studio_x,
        one_off: defaultHours.one_off,
      }
      setValue('default_hours', String(map[watchedShowType]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedShowType])

  function toggleEditor(id: string) {
    const current = getValues('editorIds') ?? []
    if (current.includes(id)) {
      setValue(
        'editorIds',
        current.filter((e) => e !== id),
        { shouldValidate: true }
      )
    } else {
      setValue('editorIds', [...current, id], { shouldValidate: true })
    }
  }

  async function submitForm(data: ShowFormValues, targetStatus: 'draft' | 'live') {
    setFormError(null)
    setNotifyResult(null)
    setSubmittingStatus(targetStatus)

    const payload = buildPayload(data, targetStatus)
    const result = isEdit ? await updateShow(show!.id, payload) : await createShow(payload)

    if ('error' in result) {
      setFormError(result.error)
      setSubmittingStatus(null)
      return
    }

    if (
      result.warnings &&
      (result.warnings.blockedDates.length > 0 || result.warnings.blockedRoles.length > 0)
    ) {
      const params = new URLSearchParams()
      if (result.warnings.blockedDates.length) {
        params.set('blockedDates', result.warnings.blockedDates.join(','))
      }
      if (result.warnings.blockedRoles.length) {
        params.set('blockedRoles', result.warnings.blockedRoles.join(','))
      }
      window.location.href = `/crew/shows/${result.showId}/edit?${params.toString()}`
      return
    }

    if (targetStatus === 'live' && notify) {
      const notifyRes = await sendShowNotifications(result.showId)
      if (notifyRes.error) {
        setNotifyResult('Show published — notification send failed. You can retry from the show detail page.')
      } else if (notifyRes.sent === 0) {
        setNotifyResult("No volunteers matched this show's roles.")
      } else {
        setNotifyResult(`Notifications sent to ${notifyRes.sent} matching volunteer(s).`)
      }
      setTimeout(() => {
        window.location.href = '/crew/shows'
      }, 1800)
      return
    }

    window.location.href = '/crew/shows'
  }

  function onClickSaveDraft() {
    handleSubmit((data) => submitForm(data, 'draft'))()
  }

  function onClickSavePublish() {
    handleSubmit((data) => {
      if (hasZeroSlotRole(data)) {
        setPendingPublish(data)
        setShowPublishWarning(true)
        return
      }
      submitForm(data, 'live')
    })()
  }

  function confirmPublish() {
    setShowPublishWarning(false)
    if (pendingPublish) {
      const data = pendingPublish
      setPendingPublish(null)
      submitForm(data, 'live')
    }
  }

  const busy = isSubmitting || submittingStatus !== null

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8 max-w-3xl">
      {(blockedDateIds.length > 0 || blockedRoleIds.length > 0) && (
        <div className="rounded-lg bg-pale-orange border border-orange p-4 text-sm text-dark dark:text-dark-text">
          Show saved. {blockedDateIds.length + blockedRoleIds.length} item(s) could not be
          removed because they have active claims — see highlighted rows below.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <label className={labelClasses}>
            Show Name<span className="text-orange ml-0.5">*</span>
          </label>
          <input type="text" className={inputClasses} {...register('name')} />
          {errors.name && <p className={errorClasses}>{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelClasses}>
            Show Type<span className="text-orange ml-0.5">*</span>
          </label>
          <select className={inputClasses} {...register('show_type')}>
            <option value="mainstage">Mainstage</option>
            <option value="studio_x">Studio X</option>
            <option value="one_off">One-Off</option>
          </select>
        </div>

        <div>
          <label className={labelClasses}>Status</label>
          <select
            className={inputClasses}
            value={status}
            onChange={(e) => setStatus(e.target.value as ShowStatus)}
          >
            <option value="draft">Draft</option>
            <option value="live">Live</option>
            <option value="past">Past</option>
            <option value="archived">Archived</option>
          </select>
          <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
            Use the buttons below to save as Draft or publish Live.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClasses}>Season</label>
          <select className={inputClasses} {...register('seasonId')}>
            <option value={NO_SEASON}>No season</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
            <option value={NEW_SEASON}>＋ Create new season…</option>
          </select>
        </div>

        {watchedSeasonId === NEW_SEASON && (
          <fieldset className="sm:col-span-2 border border-divider dark:border-dark-border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className={labelClasses}>
                Season Name<span className="text-orange ml-0.5">*</span>
              </label>
              <input type="text" className={inputClasses} {...register('newSeasonName')} />
              {errors.newSeasonName && (
                <p className={errorClasses}>{errors.newSeasonName.message}</p>
              )}
            </div>
            <div>
              <label className={labelClasses}>Start Date</label>
              <input type="date" className={inputClasses} {...register('newSeasonStartDate')} />
            </div>
            <div>
              <label className={labelClasses}>End Date</label>
              <input type="date" className={inputClasses} {...register('newSeasonEndDate')} />
            </div>
          </fieldset>
        )}

        <div className="sm:col-span-2">
          <label className={labelClasses}>Description</label>
          <textarea rows={4} className={inputClasses} {...register('description')} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClasses}>Volunteer Instructions</label>
          <textarea rows={4} className={inputClasses} {...register('volunteer_instructions')} />
          <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
            Included verbatim in slot claim confirmation emails.
          </p>
        </div>

        <div>
          <label className={labelClasses}>Default Hours per Call</label>
          <input
            type="number"
            step={0.5}
            min={0}
            className={inputClasses}
            {...register('default_hours', { onChange: () => setDefaultHoursDirty(true) })}
          />
          {errors.default_hours && <p className={errorClasses}>{errors.default_hours.message}</p>}
          <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
            Leave blank to use the show-type default. Enter a value to override for this show.
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Show Dates &amp; Roles</h2>
        <div className="space-y-4">
          {dateFields.map((field, index) => (
            <DateRow
              key={field.id}
              control={control}
              register={register}
              errors={errors}
              dateIndex={index}
              dateField={field}
              onRemoveDate={() => removeDate(index)}
              canRemoveDate={dateFields.length > 1}
              categories={categories}
              blockedDateIds={blockedDateIds}
              blockedRoleIds={blockedRoleIds}
            />
          ))}
        </div>
        {typeof errors.dates?.message === 'string' && (
          <p className={errorClasses}>{errors.dates.message}</p>
        )}
        <button
          type="button"
          onClick={() =>
            appendDate({ dbId: null, show_date: '', show_time: '', roles: [{ ...BLANK_ROLE }] })
          }
          className="mt-3 text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
        >
          ＋ Add Date
        </button>
      </section>

      <section>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Assigned Editors</h2>
        <div className="flex flex-wrap gap-2">
          {adminUsers.map((u) => {
            const active = watchedEditorIds.includes(u.id)
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleEditor(u.id)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  active
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white dark:bg-dark-surface text-dark dark:text-dark-text border-divider dark:border-dark-border hover:border-steel'
                }`}
              >
                {u.name}
              </button>
            )
          })}
        </div>
        {adminUsers.length === 0 && (
          <p className="text-sm text-mid-gray dark:text-dark-muted">
            No active Production Crew members found.
          </p>
        )}
      </section>

      {formError && (
        <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark dark:text-dark-text">
          {formError}
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-start gap-2 text-sm text-dark dark:text-dark-text">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="mt-0.5"
          />
          Notify matching volunteers about this show
        </label>
        {notify && show?.notifications_sent_at && (
          <p className="text-sm text-orange">
            Notifications were previously sent for this show. Checking this will send again to all matching
            volunteers.
          </p>
        )}
        {notifyResult && <p className="text-sm text-navy dark:text-steel">{notifyResult}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onClickSavePublish}
          disabled={busy}
          className="bg-orange text-white font-bold px-5 py-2.5 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submittingStatus === 'live' ? 'Publishing…' : 'Save & Publish'}
        </button>
        <button
          type="button"
          onClick={onClickSaveDraft}
          disabled={busy}
          className="bg-white dark:bg-dark-surface border border-navy text-navy dark:text-steel font-semibold px-5 py-2.5 rounded-lg hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submittingStatus === 'draft' ? 'Saving…' : 'Save as Draft'}
        </button>
      </div>

      <AlertDialog open={showPublishWarning} onOpenChange={setShowPublishWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish with empty roles?</AlertDialogTitle>
            <AlertDialogDescription>
              One or more roles have 0 slots. Volunteers won&apos;t be able to claim those roles.
              Publish anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogPrimitive.Cancel className="border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
              Cancel
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action
              onClick={confirmPublish}
              className="bg-orange text-white hover:bg-orange/90 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
            >
              Publish Anyway
            </AlertDialogPrimitive.Action>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
