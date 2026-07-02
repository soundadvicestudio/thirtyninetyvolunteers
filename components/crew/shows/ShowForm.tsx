'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
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
import { createShow, updateShow } from '@/lib/actions/shows'
import {
  showFormSchema,
  NO_SEASON,
  NEW_SEASON,
  NO_CATEGORY,
  type ShowFormValues,
} from '@/lib/validations/show'
import type { ShowSubmitPayload } from '@/lib/validations/show'
import type { Show, ShowDate, ShowRole, ShowStatus } from '@/types/show'

const DATE_BLOCKED_MESSAGE =
  'This show date has active claims and cannot be removed. Cancel existing claims first.'
const ROLE_BLOCKED_MESSAGE =
  'This role has active claims and cannot be removed. Cancel existing claims first.'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'
const errorClasses = 'mt-1 text-sm text-orange'

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
    })),
    roles: data.roles.map((r) => ({
      dbId: r.dbId,
      role_name: r.role_name.trim(),
      category_id: r.category_id || null,
      slots_available: r.slots_available.trim() === '' ? 0 : Number(r.slots_available),
    })),
    editorIds: data.editorIds,
  }
}

function hasZeroSlotRole(data: ShowFormValues): boolean {
  return data.roles.some(
    (r) => r.slots_available.trim() === '' || Number(r.slots_available) === 0
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
  show?: Show & { dates: ShowDate[]; roles: ShowRole[]; editorIds: string[] }
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
          }))
        : [{ dbId: null, show_date: '', show_time: '' }],
      roles: show?.roles?.length
        ? show.roles.map((r) => ({
            dbId: r.id,
            role_name: r.role_name,
            category_id: r.category_id ?? NO_CATEGORY,
            slots_available: String(r.slots_available),
          }))
        : [{ dbId: null, role_name: '', category_id: NO_CATEGORY, slots_available: '1' }],
      editorIds: show?.editorIds ?? [],
    },
  })

  const { fields: dateFields, append: appendDate, remove: removeDate } = useFieldArray({
    control,
    name: 'dates',
  })
  const { fields: roleFields, append: appendRole, remove: removeRole } = useFieldArray({
    control,
    name: 'roles',
  })

  const [status, setStatus] = useState<ShowStatus>(show?.status ?? 'draft')
  const [formError, setFormError] = useState<string | null>(null)
  const [submittingStatus, setSubmittingStatus] = useState<'draft' | 'live' | null>(null)
  const [pendingPublish, setPendingPublish] = useState<ShowFormValues | null>(null)
  const [showPublishWarning, setShowPublishWarning] = useState(false)
  const [defaultHoursDirty, setDefaultHoursDirty] = useState(show?.default_hours != null)

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
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Show Dates</h2>
        <div className="space-y-3">
          {dateFields.map((field, index) => {
            const warning = field.dbId && blockedDateIds.includes(field.dbId) ? DATE_BLOCKED_MESSAGE : null
            return (
              <div
                key={field.id}
                className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-3"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1">
                    <label className={labelClasses}>
                      Date<span className="text-orange ml-0.5">*</span>
                    </label>
                    <input
                      type="date"
                      className={inputClasses}
                      {...register(`dates.${index}.show_date`)}
                    />
                    {errors.dates?.[index]?.show_date && (
                      <p className={errorClasses}>{errors.dates[index]?.show_date?.message}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={labelClasses}>
                      Time<span className="text-orange ml-0.5">*</span>
                    </label>
                    <input
                      type="time"
                      className={inputClasses}
                      {...register(`dates.${index}.show_time`)}
                    />
                    {errors.dates?.[index]?.show_time && (
                      <p className={errorClasses}>{errors.dates[index]?.show_time?.message}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDate(index)}
                    disabled={dateFields.length === 1}
                    aria-label="Remove date"
                    className="text-mid-gray dark:text-dark-muted hover:text-orange transition-colors p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {warning && <p className="text-sm text-orange mt-2">{warning}</p>}
              </div>
            )
          })}
        </div>
        {typeof errors.dates?.message === 'string' && (
          <p className={errorClasses}>{errors.dates.message}</p>
        )}
        <button
          type="button"
          onClick={() => appendDate({ dbId: null, show_date: '', show_time: '' })}
          className="mt-3 text-sm font-semibold text-navy dark:text-steel hover:underline"
        >
          ＋ Add Date
        </button>
      </section>

      <section>
        <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Volunteer Roles</h2>
        <div className="space-y-3">
          {roleFields.map((field, index) => {
            const warning = field.dbId && blockedRoleIds.includes(field.dbId) ? ROLE_BLOCKED_MESSAGE : null
            return (
              <div
                key={field.id}
                className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_auto] gap-3 sm:items-end">
                  <div>
                    <label className={labelClasses}>
                      Role Name<span className="text-orange ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      className={inputClasses}
                      {...register(`roles.${index}.role_name`)}
                    />
                    {errors.roles?.[index]?.role_name && (
                      <p className={errorClasses}>{errors.roles[index]?.role_name?.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClasses}>Category</label>
                    <select
                      className={inputClasses}
                      {...register(`roles.${index}.category_id`)}
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
                      {...register(`roles.${index}.slots_available`)}
                    />
                    {errors.roles?.[index]?.slots_available && (
                      <p className={errorClasses}>
                        {errors.roles[index]?.slots_available?.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRole(index)}
                    disabled={roleFields.length === 1}
                    aria-label="Remove role"
                    className="text-mid-gray dark:text-dark-muted hover:text-orange transition-colors p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {warning && <p className="text-sm text-orange mt-2">{warning}</p>}
              </div>
            )
          })}
        </div>
        {typeof errors.roles?.message === 'string' && (
          <p className={errorClasses}>{errors.roles.message}</p>
        )}
        <button
          type="button"
          onClick={() =>
            appendRole({ dbId: null, role_name: '', category_id: NO_CATEGORY, slots_available: '1' })
          }
          className="mt-3 text-sm font-semibold text-navy dark:text-steel hover:underline"
        >
          ＋ Add Role
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
