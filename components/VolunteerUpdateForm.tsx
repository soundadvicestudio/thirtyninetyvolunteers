'use client'

import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { UpdateFormData } from '@/types/volunteer'
import { updateVolunteerInfo } from '@/app/update/actions'

type InitialData = {
  full_name: string
  phone: string
  pronouns: string
  pronouns_other: string
  school: string
  age_range: string
  guardian_name: string
  guardian_phone: string
  category_ids: string[]
  referral_source_label: string
  referral_source_other: string
  referral_name: string
}

type Props = {
  volunteerId: string
  email: string
  initialData: InitialData
  categories: Array<{ id: string; name: string }>
  hearingOptions: Array<{ id: string; label: string }>
}

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  pronouns: z.string().optional(),
  pronouns_other: z.string().optional(),
  school: z.string().optional(),
  age_range: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  category_ids: z.array(z.string()).optional().default([]),
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

export default function VolunteerUpdateForm({
  volunteerId,
  email,
  initialData,
  categories,
  hearingOptions,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<UpdateFormData>({
    resolver: zodResolver(schema) as Resolver<UpdateFormData>,
    defaultValues: initialData,
  })

  const watchedAge = watch('age_range')
  const watchedPronouns = watch('pronouns')
  const watchedReferral = watch('referral_source_label')
  const selectedCategories = watch('category_ids') ?? []

  const [formState, setFormState] =
    useState<'idle' | 'success'>('idle')
  const [phoneConflict, setPhoneConflict] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit = async (data: UpdateFormData) => {
    setErrorMessage(null)
    setPhoneConflict(false)
    const result = await updateVolunteerInfo(volunteerId, data)
    if (result.status === 'success') {
      setFormState('success')
    } else if (result.status === 'phone_conflict') {
      setPhoneConflict(true)
    } else {
      setErrorMessage(result.message)
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
  const labelClasses = 'block text-sm font-semibold text-dark mb-1'
  const errorClasses = 'mt-1 text-sm text-orange'

  if (formState === 'success') {
    return (
      <div className="rounded-xl bg-light-navy border border-divider
                      p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-orange mx-auto mb-4
                        flex items-center justify-center">
          <span className="text-white text-xl font-bold">✓</span>
        </div>
        <h2 className="text-navy font-bold text-xl mb-2">
          Your information has been updated
        </h2>
        <p className="text-mid-gray text-sm leading-relaxed">
          We've saved your changes and sent a confirmation email with
          a new update link for future use.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Email (read-only) */}
      <div>
        <p className="block text-sm font-semibold text-dark mb-1">
          Email Address
        </p>
        <p className="w-full rounded-lg border border-divider
                      bg-light-navy px-4 py-3 text-base
                      text-mid-gray">
          {email}
        </p>
        <p className="mt-1 text-xs text-mid-gray">
          To change your email address, please contact us directly.
        </p>
      </div>

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

      {/* Phone */}
      <div>
        <label className={labelClasses}>
          Phone Number<span className="text-orange ml-0.5">*</span>
        </label>
        <input type="tel" className={inputClasses} {...register('phone')} />
        {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
        {phoneConflict && (
          <p className={errorClasses}>
            This phone number is already associated with another
            record. Please use a different number.
          </p>
        )}
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
      <div>
        <label className={labelClasses}>School (if applicable)</label>
        <input type="text" className={inputClasses} {...register('school')} />
      </div>

      {/* Age Range */}
      <div>
        <label className={labelClasses}>Age Range</label>
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

      {/* Volunteer interest areas */}
      <div>
        <label className={labelClasses}>Areas of Interest</label>
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
                checked={selectedCategories.includes(cat.id)}
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

      {/* Error banner */}
      {errorMessage && (
        <div className="rounded-lg bg-pale-orange border border-orange
                        p-4 text-sm text-dark">
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-orange text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
      >
        Save Changes
      </button>
    </form>
  )
}
