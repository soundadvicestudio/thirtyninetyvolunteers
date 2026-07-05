'use client'

import { useState } from 'react'
import { useForm, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FieldRow from './FieldRow'
import FormPreview from './FormPreview'
import { createForm, updateForm } from '@/lib/actions/forms'
import { formBuilderSchema, type FormBuilderValues } from '@/lib/validations/form'
import type { FieldType, FormData, FullForm } from '@/types/form'

const OPTION_TYPES: FieldType[] = ['dropdown', 'radio', 'checkbox']

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'
const errorClasses = 'mt-1 text-sm text-orange'

function defaultFieldValues(sortOrder: number) {
  return {
    field_type: 'text' as FieldType,
    label: '',
    placeholder: '',
    is_required: false,
    sort_order: sortOrder,
    options: [{ value: '' }],
  }
}

function buildPayload(data: FormBuilderValues, targetStatus: 'draft' | 'live' | 'closed'): FormData {
  return {
    title: data.title.trim(),
    description: data.description?.trim() || null,
    status: targetStatus,
    fields: data.fields.map((f, i) => ({
      id: f.id,
      field_type: f.field_type,
      label: f.label.trim(),
      placeholder: f.placeholder?.trim() || null,
      options: OPTION_TYPES.includes(f.field_type)
        ? f.options.map((o) => o.value).filter((v) => v.trim() !== '')
        : null,
      is_required: f.is_required,
      sort_order: i,
    })),
  }
}

export default function FormBuilder({
  initialData,
  formId,
}: {
  initialData?: FullForm
  formId?: string
}) {
  const isEdit = !!formId

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormBuilderValues>({
    resolver: zodResolver(formBuilderSchema) as Resolver<FormBuilderValues>,
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? 'draft',
      fields: initialData?.fields?.length
        ? initialData.fields.map((f) => ({
            id: f.id,
            field_type: f.field_type,
            label: f.label,
            placeholder: f.placeholder ?? '',
            is_required: f.is_required,
            sort_order: f.sort_order,
            options: OPTION_TYPES.includes(f.field_type)
              ? f.options && f.options.length > 0
                ? f.options.map((value) => ({ value }))
                : [{ value: '' }]
              : [],
          }))
        : [],
    },
  })

  const { fields, append, remove, swap } = useFieldArray({ control, name: 'fields' })

  const [tab, setTab] = useState<'build' | 'preview'>('build')
  const [formError, setFormError] = useState<string | null>(null)
  const [submittingStatus, setSubmittingStatus] = useState<'draft' | 'live' | 'closed' | null>(null)
  const [newFieldIndex, setNewFieldIndex] = useState<number | null>(null)

  // react-hook-form's watch() is required (Brief §3); switching to useWatch() per
  // field would be a broader refactor across this form's field-array/preview logic,
  // not a surgical fix.
  // eslint-disable-next-line react-hooks/incompatible-library
  const status = watch('status')
  const watchedTitle = watch('title')
  const watchedDescription = watch('description')
  const watchedFields = watch('fields')

  function handleAddField() {
    const idx = fields.length
    append(defaultFieldValues(idx))
    setNewFieldIndex(idx)
  }

  async function submitForm(data: FormBuilderValues, targetStatus: 'draft' | 'live' | 'closed') {
    setFormError(null)
    setSubmittingStatus(targetStatus)

    const payload = buildPayload(data, targetStatus)
    const result = isEdit ? await updateForm(formId!, payload) : await createForm(payload)

    if ('error' in result) {
      setFormError(result.error)
      setSubmittingStatus(null)
      return
    }

    window.location.href = '/crew/forms'
  }

  function onSaveDraft() {
    handleSubmit((data) => submitForm(data, 'draft'))()
  }
  function onPublish() {
    handleSubmit((data) => submitForm(data, 'live'))()
  }
  function onClose() {
    handleSubmit((data) => submitForm(data, 'closed'))()
  }

  const busy = submittingStatus !== null

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 border-b border-divider dark:border-dark-border">
        <button
          type="button"
          onClick={() => setTab('build')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            tab === 'build'
              ? 'border-navy text-navy dark:border-steel dark:text-steel'
              : 'border-transparent text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel'
          }`}
        >
          Build
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            tab === 'preview'
              ? 'border-navy text-navy dark:border-steel dark:text-steel'
              : 'border-transparent text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel'
          }`}
        >
          Preview
        </button>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className={tab === 'build' ? 'space-y-8 max-w-2xl' : 'hidden'}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelClasses}>
              Title<span className="text-orange ml-0.5">*</span>
            </label>
            <input type="text" className={inputClasses} {...register('title')} />
            {errors.title && <p className={errorClasses}>{errors.title.message}</p>}
          </div>
          <div>
            <label className={labelClasses}>Description</label>
            <textarea rows={3} className={inputClasses} {...register('description')} />
          </div>
          <div>
            <label className={labelClasses}>Status</label>
            <p className="text-sm text-dark dark:text-dark-text capitalize">{status}</p>
            <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
              Use the buttons below to change status.
            </p>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Fields</h2>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <FieldRow
                key={field.id}
                control={control}
                index={index}
                totalFields={fields.length}
                onMoveUp={() => swap(index, index - 1)}
                onMoveDown={() => swap(index, index + 1)}
                onRemove={() => remove(index)}
                defaultExpanded={index === newFieldIndex}
              />
            ))}
          </div>
          {fields.length === 0 && (
            <p className="text-sm text-mid-gray dark:text-dark-muted">No fields yet.</p>
          )}
          <button
            type="button"
            onClick={handleAddField}
            className="mt-3 text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
          >
            ＋ Add Field
          </button>
        </section>

        {formError && (
          <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark dark:text-dark-text">
            {formError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={busy}
            className="bg-white dark:bg-dark-surface border border-navy text-navy dark:text-steel font-semibold px-5 py-2.5 rounded-lg hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submittingStatus === 'draft' ? 'Saving…' : 'Save as Draft'}
          </button>
          {status !== 'live' && status !== 'closed' && (
            <button
              type="button"
              onClick={onPublish}
              disabled={busy}
              className="bg-orange text-white font-bold px-5 py-2.5 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submittingStatus === 'live' ? 'Saving…' : 'Publish'}
            </button>
          )}
          {status === 'live' && (
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="bg-white dark:bg-dark-surface border border-orange text-orange font-semibold px-5 py-2.5 rounded-lg hover:bg-pale-orange dark:hover:bg-dark-surface/50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submittingStatus === 'closed' ? 'Saving…' : 'Close Form'}
            </button>
          )}
        </div>
      </form>

      {tab === 'preview' && (
        <FormPreview
          title={watchedTitle}
          description={watchedDescription?.trim() || null}
          fields={(watchedFields ?? []).map((f) => ({
            ...f,
            options: f.options?.map((o) => o.value) ?? null,
          }))}
        />
      )}
    </div>
  )
}
