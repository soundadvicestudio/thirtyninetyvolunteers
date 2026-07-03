'use client'

import { useState } from 'react'
import { Controller, useWatch, type Control } from 'react-hook-form'
import FieldOptionsEditor from './FieldOptionsEditor'
import type { FormBuilderValues } from '@/lib/validations/form'
import type { FieldType } from '@/types/form'

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
  { value: 'date', label: 'Date' },
  { value: 'rating', label: 'Rating (1–5)' },
  { value: 'number', label: 'Number' },
]

const OPTION_TYPES: FieldType[] = ['dropdown', 'radio', 'checkbox']
const NO_PLACEHOLDER_TYPES: FieldType[] = ['checkbox', 'radio']

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'
const iconButtonClasses =
  'text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel transition-colors p-1.5 disabled:opacity-30 disabled:cursor-not-allowed'

export default function FieldRow({
  control,
  index,
  totalFields,
  onMoveUp,
  onMoveDown,
  onRemove,
  defaultExpanded = false,
}: {
  control: Control<FormBuilderValues>
  index: number
  totalFields: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const fieldType = useWatch({ control, name: `fields.${index}.field_type` })
  const label = useWatch({ control, name: `fields.${index}.label` })
  const showOptions = OPTION_TYPES.includes(fieldType)
  const showPlaceholder = !NO_PLACEHOLDER_TYPES.includes(fieldType)

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase text-mid-gray dark:text-dark-muted bg-light-navy dark:bg-dark-nav rounded px-2 py-1 shrink-0">
          {FIELD_TYPE_OPTIONS.find((t) => t.value === fieldType)?.label ?? fieldType}
        </span>
        <span className="flex-1 text-sm font-medium text-dark dark:text-dark-text truncate">
          {label || 'Untitled field'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move field up"
            className={iconButtonClasses}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalFields - 1}
            aria-label="Move field down"
            className={iconButtonClasses}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-semibold text-navy dark:text-steel hover:underline px-2 cursor-pointer"
          >
            ✎ Edit
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove field"
            className="text-mid-gray dark:text-dark-muted hover:text-orange transition-colors p-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-divider dark:border-dark-border pt-4 space-y-4">
          <div>
            <label className={labelClasses}>Field Type</label>
            <Controller
              control={control}
              name={`fields.${index}.field_type`}
              render={({ field }) => (
                <select className={inputClasses} {...field}>
                  {FIELD_TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          <div>
            <label className={labelClasses}>
              Label<span className="text-orange ml-0.5">*</span>
            </label>
            <Controller
              control={control}
              name={`fields.${index}.label`}
              render={({ field }) => <input type="text" className={inputClasses} {...field} />}
            />
          </div>

          {showPlaceholder && (
            <div>
              <label className={labelClasses}>Placeholder</label>
              <Controller
                control={control}
                name={`fields.${index}.placeholder`}
                render={({ field }) => <input type="text" className={inputClasses} {...field} />}
              />
            </div>
          )}

          <Controller
            control={control}
            name={`fields.${index}.is_required`}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-dark dark:text-dark-text">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                Required
              </label>
            )}
          />

          {showOptions && <FieldOptionsEditor control={control} fieldIndex={index} />}
        </div>
      )}
    </div>
  )
}
