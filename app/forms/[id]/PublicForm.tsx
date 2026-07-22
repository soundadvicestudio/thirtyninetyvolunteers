'use client'

import { useMemo, useRef, useState } from 'react'
import { useForm, Controller, type Resolver, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitFormResponse } from '@/lib/actions/forms'
import type { FullForm, FormFieldData } from '@/types/form'

type PublicFormValues = Record<string, string | string[]>

const inputClasses =
  'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark mb-1'
const errorClasses = 'mt-1 text-sm text-red-600'

function buildSchema(fields: FormFieldData[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const field of fields) {
    const fieldId = field.id!
    if (field.field_type === 'checkbox') {
      // checkbox = string[] (multiple selections)
      let s = z.array(z.string())
      if (field.is_required) {
        s = s.min(1, 'Please select at least one option.')
      }
      shape[fieldId] = s
    } else {
      let s: z.ZodTypeAny = z.string()
      if (field.is_required) {
        s = (s as z.ZodString).min(1, 'This field is required.')
      } else {
        s = (s as z.ZodString).optional().default('')
      }
      shape[fieldId] = s
    }
  }
  return z.object(shape)
}

function buildDefaultValues(fields: FormFieldData[]): PublicFormValues {
  const values: PublicFormValues = {}
  for (const field of fields) {
    values[field.id!] = field.field_type === 'checkbox' ? [] : ''
  }
  return values
}

function FieldInput({
  field,
  control,
  register,
}: {
  field: FormFieldData
  control: Control<PublicFormValues>
  register: ReturnType<typeof useForm<PublicFormValues>>['register']
}) {
  const fieldId = field.id!
  const options = field.options ?? []

  switch (field.field_type) {
    case 'text':
      return (
        <input type="text" placeholder={field.placeholder ?? undefined} className={inputClasses} {...register(fieldId)} />
      )
    case 'textarea':
      return (
        <textarea
          rows={4}
          placeholder={field.placeholder ?? undefined}
          className={inputClasses}
          {...register(fieldId)}
        />
      )
    case 'number':
      return (
        <input
          type="number"
          placeholder={field.placeholder ?? undefined}
          className={inputClasses}
          {...register(fieldId)}
        />
      )
    case 'date':
      return <input type="date" className={inputClasses} {...register(fieldId)} />
    case 'dropdown':
      return (
        <select className={inputClasses} {...register(fieldId)}>
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
    case 'radio':
      return (
        <div className="space-y-2">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-dark">
              <input type="radio" value={opt} {...register(fieldId)} />
              {opt}
            </label>
          ))}
        </div>
      )
    case 'checkbox':
      return (
        <Controller
          control={control}
          name={fieldId}
          render={({ field: controllerField }) => {
            const current = Array.isArray(controllerField.value) ? controllerField.value : []
            return (
              <div className="space-y-2">
                {options.map((opt) => {
                  const checked = current.includes(opt)
                  return (
                    <label key={opt} className="flex items-center gap-2 text-dark">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            controllerField.onChange([...current, opt])
                          } else {
                            controllerField.onChange(current.filter((v) => v !== opt))
                          }
                        }}
                      />
                      {opt}
                    </label>
                  )
                })}
              </div>
            )
          }}
        />
      )
    case 'rating':
      return (
        <Controller
          control={control}
          name={fieldId}
          render={({ field: controllerField }) => (
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((n) => {
                const selected = controllerField.value === String(n)
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => controllerField.onChange(String(n))}
                    className={`w-11 h-11 rounded-full border font-semibold transition-colors ${
                      selected ? 'bg-navy text-white border-navy' : 'border-divider text-dark hover:border-steel'
                    }`}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          )}
        />
      )
    default:
      return null
  }
}

export default function PublicForm({ form }: { form: FullForm }) {
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)

  const schema = useMemo(() => buildSchema(form.fields), [form.fields])
  const defaultValues = useMemo(() => buildDefaultValues(form.fields), [form.fields])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PublicFormValues>({
    resolver: zodResolver(schema) as Resolver<PublicFormValues>,
    defaultValues,
  })

  async function onSubmit(values: PublicFormValues) {
    setFormError(null)
    const result = await submitFormResponse(form.id, values, honeypotRef.current?.value)

    if ('error' in result) {
      setFormError(result.error)
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-light-navy border border-divider p-8 text-center max-w-xl">
        <div className="w-12 h-12 rounded-full bg-orange mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-xl font-bold">✓</span>
        </div>
        <h2 className="text-navy font-bold text-xl mb-2">Thank you! Your response has been recorded.</h2>
        <p className="text-mid-gray text-sm leading-relaxed">{form.title}</p>
      </div>
    )
  }

  return (
    // honeypotRef.current is only read inside onSubmit, which handleSubmit()
    // only invokes on an actual submit event — not during this render call.
    // eslint-disable-next-line react-hooks/refs
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      {/* Honeypot — hidden from real users, bots tend to fill every input */}
      <input
        type="text"
        name="website"
        ref={honeypotRef}
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        style={{ position: 'absolute', left: '-9999px' }}
      />

      {form.fields.map((field) => {
        const fieldId = field.id!
        const error = errors[fieldId]
        return (
          <div key={fieldId}>
            <label className={labelClasses}>
              {field.label}
              {field.is_required && <span className="text-orange ml-0.5">*</span>}
            </label>
            <FieldInput field={field} control={control} register={register} />
            {error && <p className={errorClasses}>{error.message as string}</p>}
          </div>
        )
      })}

      {formError && (
        <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark">{formError}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto bg-orange hover:bg-orange/90 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
