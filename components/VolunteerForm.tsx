'use client'

import { useState, useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { VolunteerFormData } from '@/types/volunteer'
import { submitVolunteerForm, mergeVolunteer } from '@/app/actions/volunteer'

type Props = {
  categories: Array<{ id: string; name: string }>
  hearingOptions: Array<{ id: string; label: string }>
  showSchool: boolean
  showAgeRange: boolean
}

function createSchema(showAgeRange: boolean) {
  return z.object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    pronouns: z.string().optional(),
    pronouns_other: z.string().optional(),
    school: z.string().optional(),
    age_range: showAgeRange
      ? z.string().min(1, 'Please select an age range')
      : z.string().optional(),
    guardian_name: z.string().optional(),
    guardian_phone: z.string().optional(),
    category_ids: z.array(z.string()).min(
      1, 'Please select at least one area of interest'
    ),
    referral_source_label: z.string().optional(),
    referral_source_other: z.string().optional(),
    referral_name: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.age_range === 'under_18') {
      if (!data.guardian_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardian_name'],
          message: 'Guardian name is required for volunteers under 18',
        })
      }
      if (!data.guardian_phone?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardian_phone'],
          message: 'Guardian phone is required for volunteers under 18',
        })
      }
    }
    if (data.referral_source_label === 'Other') {
      if (!data.referral_source_other?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['referral_source_other'],
          message: 'Please tell us how you heard about us',
        })
      }
    }
  })
}

export default function VolunteerForm({
  categories,
  hearingOptions,
  showSchool,
  showAgeRange,
}: Props) {
  const schema = useMemo(
    () => createSchema(showAgeRange),
    [showAgeRange]
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<VolunteerFormData>({
    resolver: zodResolver(schema) as Resolver<VolunteerFormData>,
    defaultValues: { category_ids: [] },
  })

  const watchedAge = watch('age_range')
  const watchedPronouns = watch('pronouns')
  const watchedReferral = watch('referral_source_label')

  const [formState, setFormState] =
    useState<'idle' | 'success' | 'duplicate' | 'error'>('idle')
  const [duplicateInfo, setDuplicateInfo] =
    useState<{ id: string; name: string } | null>(null)
  const [pendingData, setPendingData] =
    useState<VolunteerFormData | null>(null)
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const onSubmit = async (data: VolunteerFormData) => {
    setErrorMessage(null)
    const result = await submitVolunteerForm(data)

    if (result.status === 'success') {
      setFormState('success')
    } else if (result.status === 'duplicate') {
      setPendingData(data)
      setDuplicateInfo({
        id:   result.existingId,
        name: result.existingName,
      })
      setFormState('duplicate')
    } else {
      setErrorMessage(result.message)
      setFormState('error')
    }
  }

  const handleMerge = async () => {
    if (!pendingData || !duplicateInfo) return
    const result = await mergeVolunteer(duplicateInfo.id, pendingData)
    if (result.status === 'success') {
      setFormState('success')
    } else {
      setErrorMessage(result.message)
      setFormState('error')
    }
  }

  const handleUseDifferentInfo = () => {
    setFormState('idle')
    setDuplicateInfo(null)
    setPendingData(null)
  }

  const inputClasses =
    'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
  const labelClasses = 'block text-sm font-semibold text-dark mb-1'
  const errorClasses = 'mt-1 text-sm text-orange'

  if (formState === 'success') {
    return (
      <div className="rounded-xl bg-light-navy border border-divider
                      p-8 text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-full bg-orange mx-auto
                        mb-4 flex items-center justify-center">
          <span className="text-white text-xl font-bold">✓</span>
        </div>
        <h2 className="text-navy font-bold text-xl mb-2">
          You&apos;re in! Thank you for signing up.
        </h2>
        <p className="text-mid-gray text-sm leading-relaxed">
          We&apos;ve sent a confirmation email with a link to update
          your information any time. We&apos;ll be in touch when
          opportunities come up — we can&apos;t wait to have you
          with us!
        </p>
      </div>
    )
  }

  if (formState === 'duplicate' && duplicateInfo) {
    return (
      <div className="rounded-xl border border-divider
                      bg-pale-orange p-8 max-w-xl mx-auto">
        <h2 className="text-navy font-bold text-lg mb-2">
          We found an existing record
        </h2>
        <p className="text-dark text-sm leading-relaxed mb-6">
          We already have a record for{' '}
          <span className="font-semibold">{duplicateInfo.name}</span>{' '}
          with the email or phone you entered. Would you like
          to update that record with the information you just
          entered?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleMerge}
            className="flex-1 py-3 bg-navy text-white font-bold
                       rounded-lg hover:bg-opacity-90 transition-colors">
            Update My Record
          </button>
          <button
            onClick={handleUseDifferentInfo}
            className="flex-1 py-3 bg-white text-navy font-semibold
                       rounded-lg border border-divider
                       hover:border-navy transition-colors">
            Use Different Contact Info
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto px-4 space-y-5"
    >
      {(formState === 'error' && errorMessage) && (
        <div className="mb-4 rounded-lg bg-pale-orange border
                        border-orange p-4 text-sm text-dark">
          {errorMessage}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className={labelClasses}>
          Full Name<span className="text-orange ml-0.5">*</span>
        </label>
        <input type="text" className={inputClasses} {...register('full_name')} />
        {errors.full_name && (
          <p className={errorClasses}>{errors.full_name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className={labelClasses}>
          Email Address<span className="text-orange ml-0.5">*</span>
        </label>
        <input type="email" className={inputClasses} {...register('email')} />
        {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className={labelClasses}>
          Phone Number<span className="text-orange ml-0.5">*</span>
        </label>
        <input type="tel" className={inputClasses} {...register('phone')} />
        {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
      </div>

      {/* Pronouns */}
      <div>
        <label className={labelClasses}>Preferred Pronouns</label>
        <select className={inputClasses} {...register('pronouns')}>
          <option value="">Select pronouns (optional)</option>
          <option value="She/Her">She/Her</option>
          <option value="He/Him">He/Him</option>
          <option value="They/Them">They/Them</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        {watchedPronouns === 'Other' && (
          <input
            type="text"
            className={`${inputClasses} mt-2`}
            placeholder="Please specify"
            {...register('pronouns_other')}
          />
        )}
      </div>

      {/* School */}
      {showSchool && (
        <div>
          <label className={labelClasses}>School (if applicable)</label>
          <input type="text" className={inputClasses} {...register('school')} />
        </div>
      )}

      {/* Age Range */}
      {showAgeRange && (
        <div>
          <label className={labelClasses}>
            Age Range <span className="text-orange ml-0.5">*</span>
          </label>
          <select className={inputClasses} {...register('age_range')}>
            <option value="">Select age range</option>
            <option value="under_18">Under 18</option>
            <option value="18_25">18–25</option>
            <option value="26_35">26–35</option>
            <option value="36_50">36–50</option>
            <option value="51_plus">51+</option>
            <option value="prefer_not">Prefer not to say</option>
          </select>

          {/* Guardian fields */}
          {watchedAge === 'under_18' && (
            <div className="bg-pale-orange border border-orange rounded-lg p-4 mt-2">
              <p className="text-sm text-dark mb-3">
                Because you&apos;re under 18, we need a parent or guardian&apos;s
                contact information.
              </p>
              <div className="space-y-5">
                <div>
                  <label className={labelClasses}>
                    Guardian Name<span className="text-orange ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    className={inputClasses}
                    {...register('guardian_name')}
                  />
                  {errors.guardian_name && (
                    <p className={errorClasses}>{errors.guardian_name.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>
                    Guardian Phone<span className="text-orange ml-0.5">*</span>
                  </label>
                  <input
                    type="tel"
                    className={inputClasses}
                    {...register('guardian_phone')}
                  />
                  {errors.guardian_phone && (
                    <p className={errorClasses}>{errors.guardian_phone.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Volunteer interest areas */}
      <div>
        <label className={labelClasses}>
          Areas of Interest<span className="text-orange ml-0.5">*</span>
        </label>
        <p className="text-sm text-mid-gray">
          Select everything that interests you — no pressure to commit to any
          specific role.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 cursor-pointer p-2 rounded border border-divider hover:border-steel hover:bg-light-navy transition-colors has-[:checked]:border-navy has-[:checked]:bg-light-navy"
            >
              <input
                type="checkbox"
                value={cat.id}
                onChange={(e) => {
                  const current = getValues('category_ids') ?? []
                  if (e.target.checked) {
                    setValue('category_ids', [...current, cat.id], {
                      shouldValidate: true,
                    })
                  } else {
                    setValue(
                      'category_ids',
                      current.filter((id) => id !== cat.id),
                      { shouldValidate: true }
                    )
                  }
                }}
              />
              <span className="text-sm text-dark">{cat.name}</span>
            </label>
          ))}
        </div>
        {errors.category_ids && (
          <p className={errorClasses}>{errors.category_ids.message}</p>
        )}
      </div>

      {/* How did you hear about us */}
      <div>
        <label className={labelClasses}>How did you hear about us?</label>
        <select className={inputClasses} {...register('referral_source_label')}>
          <option value="">Select one (optional)</option>
          {hearingOptions.map((opt) => (
            <option key={opt.id} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
        {watchedReferral === 'Other' && (
          <>
            <input
              type="text"
              className={`${inputClasses} mt-2`}
              placeholder="Please tell us more"
              {...register('referral_source_other')}
            />
            {errors.referral_source_other && (
              <p className={errorClasses}>
                {errors.referral_source_other.message}
              </p>
            )}
          </>
        )}
      </div>

      {/* Referred by */}
      <div>
        <label className={labelClasses}>Referred by (optional)</label>
        <p className="text-sm text-mid-gray mb-1">
          If someone specific invited you, let us know!
        </p>
        <input type="text" className={inputClasses} {...register('referral_name')} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-orange text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        Sign Me Up!
      </button>
    </form>
  )
}
