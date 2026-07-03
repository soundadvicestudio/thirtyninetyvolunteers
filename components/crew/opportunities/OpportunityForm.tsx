'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createOpportunity, updateOpportunity } from '@/lib/actions/opportunities'
import {
  opportunityFormSchema,
  type OpportunityFormValues,
  type OpportunitySubmitPayload,
} from '@/lib/validations/opportunity'
import type { StandingOpportunity } from '@/types/opportunity'

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'
const errorClasses = 'mt-1 text-sm text-orange'

function buildPayload(data: OpportunityFormValues): OpportunitySubmitPayload {
  return {
    title: data.title.trim(),
    description: data.description?.trim() || null,
    claim_type: data.claim_type,
    slot_cap_enabled: data.slot_cap_enabled,
    slot_cap: data.slot_cap_enabled && data.slot_cap?.trim() ? Number(data.slot_cap) : null,
  }
}

export default function OpportunityForm({ opportunity }: { opportunity?: StandingOpportunity }) {
  const isEdit = !!opportunity
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunityFormSchema) as Resolver<OpportunityFormValues>,
    defaultValues: {
      title: opportunity?.title ?? '',
      description: opportunity?.description ?? '',
      claim_type: opportunity?.claim_type ?? 'eoi',
      slot_cap_enabled: opportunity?.slot_cap_enabled ?? false,
      slot_cap: opportunity?.slot_cap != null ? String(opportunity.slot_cap) : '',
    },
  })

  const claimType = watch('claim_type')
  const slotCapEnabled = watch('slot_cap_enabled')

  async function onSubmit(data: OpportunityFormValues) {
    setFormError(null)
    const payload = buildPayload(data)
    const result = isEdit
      ? await updateOpportunity(opportunity!.id, payload)
      : await createOpportunity(payload)

    if ('error' in result) {
      setFormError(result.error)
      return
    }

    window.location.href = '/crew/shows/opportunities'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div>
        <label className={labelClasses}>
          Opportunity Title<span className="text-orange ml-0.5">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Stage Management Intern, Front of House Coordinator"
          className={inputClasses}
          {...register('title')}
        />
        {errors.title && <p className={errorClasses}>{errors.title.message}</p>}
      </div>

      <div>
        <label className={labelClasses}>Description</label>
        <textarea rows={4} className={inputClasses} {...register('description')} />
        <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
          Shown to volunteers on the public page.
        </p>
      </div>

      <fieldset>
        <legend className={labelClasses}>
          Claim Type<span className="text-orange ml-0.5">*</span>
        </legend>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-divider dark:border-dark-border cursor-pointer has-[:checked]:border-navy has-[:checked]:bg-light-navy dark:has-[:checked]:bg-dark-surface/50 transition-colors">
            <input
              type="radio"
              value="eoi"
              className="mt-1 text-navy focus:ring-navy"
              {...register('claim_type')}
            />
            <span>
              <span className="block text-sm font-semibold text-dark dark:text-dark-text">
                Expression of Interest (EOI)
              </span>
              <span className="block text-xs text-mid-gray dark:text-dark-muted mt-0.5">
                Volunteers submit interest and an Editor follows up manually. No slot limit by default.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-lg border border-divider dark:border-dark-border cursor-pointer has-[:checked]:border-navy has-[:checked]:bg-light-navy dark:has-[:checked]:bg-dark-surface/50 transition-colors">
            <input
              type="radio"
              value="slot_claim"
              className="mt-1 text-navy focus:ring-navy"
              {...register('claim_type')}
            />
            <span>
              <span className="block text-sm font-semibold text-dark dark:text-dark-text">Slot Claim</span>
              <span className="block text-xs text-mid-gray dark:text-dark-muted mt-0.5">
                Volunteers claim a specific slot. Same flow as show slot claiming.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-divider dark:border-dark-border text-navy focus:ring-navy"
            {...register('slot_cap_enabled')}
          />
          <span className="text-sm font-semibold text-dark dark:text-dark-text">Limit submissions?</span>
        </label>

        {slotCapEnabled && (
          <div className="mt-3">
            <label className={labelClasses}>
              Slot Cap<span className="text-orange ml-0.5">*</span>
            </label>
            <input
              type="number"
              min={1}
              step={1}
              className={`${inputClasses} max-w-[160px]`}
              {...register('slot_cap')}
            />
            {errors.slot_cap && <p className={errorClasses}>{errors.slot_cap.message}</p>}
            <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
              {claimType === 'eoi'
                ? 'Even with a cap, EOI submissions require manual follow-up.'
                : 'Submissions beyond this cap will not be accepted.'}
            </p>
          </div>
        )}
      </div>

      {formError && (
        <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark dark:text-dark-text">
          {formError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-navy text-white hover:bg-steel transition-colors px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Opportunity'}
      </button>
    </form>
  )
}
