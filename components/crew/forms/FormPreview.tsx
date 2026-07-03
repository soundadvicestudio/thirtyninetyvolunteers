'use client'

import type { FormFieldData } from '@/types/form'

const baseInputClasses =
  'w-full rounded-lg border border-divider px-3 py-2 text-sm text-dark bg-white focus:outline-none'

function renderField(field: FormFieldData, index: number) {
  const options = field.options ?? []
  const groupName = `preview-${field.id ?? index}`

  switch (field.field_type) {
    case 'text':
      return <input type="text" placeholder={field.placeholder ?? ''} disabled className={baseInputClasses} />
    case 'textarea':
      return (
        <textarea rows={3} placeholder={field.placeholder ?? ''} disabled className={baseInputClasses} />
      )
    case 'number':
      return <input type="number" placeholder={field.placeholder ?? ''} disabled className={baseInputClasses} />
    case 'date':
      return <input type="date" disabled className={baseInputClasses} />
    case 'dropdown':
      return (
        <select disabled className={baseInputClasses}>
          {options.length === 0 ? (
            <option>No options configured</option>
          ) : (
            options.map((opt, i) => <option key={i}>{opt}</option>)
          )}
        </select>
      )
    case 'checkbox':
      return (
        <div className="space-y-1.5">
          {options.length === 0 && <p className="text-sm text-mid-gray">No options configured</p>}
          {options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-dark">
              <input type="checkbox" disabled />
              {opt}
            </label>
          ))}
        </div>
      )
    case 'radio':
      return (
        <div className="space-y-1.5">
          {options.length === 0 && <p className="text-sm text-mid-gray">No options configured</p>}
          {options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-dark">
              <input type="radio" name={groupName} disabled />
              {opt}
            </label>
          ))}
        </div>
      )
    case 'rating':
      return (
        <div className="flex items-center gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="flex flex-col items-center gap-1 text-sm text-dark">
              <input type="radio" name={groupName} disabled />
              {n}
            </label>
          ))}
        </div>
      )
    default:
      return null
  }
}

// Light mode only — this mirrors how the public form will actually look,
// independent of the admin UI's current dark/light preference.
export default function FormPreview({
  title,
  description,
  fields,
}: {
  title: string
  description: string | null
  fields: FormFieldData[]
}) {
  return (
    <div className="bg-white border border-divider rounded-lg p-6 max-w-xl">
      <h2 className="text-xl font-bold text-dark mb-1">{title || 'Untitled Form'}</h2>
      {description && <p className="text-mid-gray text-sm mb-6">{description}</p>}

      {fields.length === 0 ? (
        <p className="text-mid-gray text-sm py-8 text-center">Add fields to see a preview.</p>
      ) : (
        <div className="space-y-5">
          {fields.map((field, i) => (
            <div key={field.id ?? i}>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                {field.label || 'Untitled field'}
                {field.is_required && <span className="text-orange ml-0.5">*</span>}
              </label>
              {renderField(field, i)}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-divider text-center text-sm text-mid-gray font-medium">
        Preview only
      </div>
    </div>
  )
}
