'use client'

import { Controller, useFieldArray, type Control } from 'react-hook-form'
import type { FormBuilderValues } from '@/lib/validations/form'

const inputClasses =
  'flex-1 rounded-lg border border-divider dark:border-dark-border px-3 py-1.5 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const iconButtonClasses =
  'text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel transition-colors p-1.5 disabled:opacity-30 disabled:cursor-not-allowed'

// R24 — this nested field array (options within a field) must live in its
// own named sub-component; useFieldArray cannot be called inside a render
// loop over the parent `fields` array in FormBuilder/FieldRow.
export default function FieldOptionsEditor({
  control,
  fieldIndex,
}: {
  control: Control<FormBuilderValues>
  fieldIndex: number
}) {
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: `fields.${fieldIndex}.options`,
  })

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-dark dark:text-dark-text">Options</label>
      <div className="space-y-2">
        {fields.map((optionField, optionIndex) => (
          <div key={optionField.id} className="flex items-center gap-2">
            <Controller
              control={control}
              name={`fields.${fieldIndex}.options.${optionIndex}.value`}
              render={({ field }) => (
                <input
                  type="text"
                  className={inputClasses}
                  placeholder={`Option ${optionIndex + 1}`}
                  {...field}
                />
              )}
            />
            <button
              type="button"
              onClick={() => swap(optionIndex, optionIndex - 1)}
              disabled={optionIndex === 0}
              aria-label="Move option up"
              className={iconButtonClasses}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => swap(optionIndex, optionIndex + 1)}
              disabled={optionIndex === fields.length - 1}
              aria-label="Move option down"
              className={iconButtonClasses}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(optionIndex)}
              disabled={fields.length === 1}
              aria-label="Delete option"
              className={`${iconButtonClasses} hover:text-orange`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => append({ value: '' })}
        className="text-sm font-semibold text-navy dark:text-steel hover:underline cursor-pointer"
      >
        + Add option
      </button>
    </div>
  )
}
