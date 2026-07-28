'use client'

import { useState, useMemo } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check } from 'lucide-react'
import { formatWallClockCT } from '@/lib/utils/date'
import { checkInVolunteer, checkInNewVolunteer } from '@/lib/actions/checkin'
import type { CheckInTokenResolution, CheckInResult } from '@/types/checkin'
import type { CheckInSignupInput } from '@/lib/validations/checkin'

type Props = {
  resolution: Extract<CheckInTokenResolution, { type: 'date' | 'show' }>
  token: string
  categories: Array<{ id: string; name: string }>
  hearingOptions: Array<{ id: string; label: string }>
  showSchool: boolean
  showAgeRange: boolean
}

type PageState =
  | 'lookup'
  | 'submitting'
  | 'success'
  | 'already_in'
  | 'not_found'
  | 'signup_submitting'
  | 'signup_success'

// Raw form shape — mirrors components/VolunteerForm.tsx's field set (including
// the "Other" sub-fields for pronouns/referral source). Collapsed into
// CheckInSignupInput (flat pronouns/referral_source/is_minor) at submit time,
// since checkInNewVolunteer() expects the already-collapsed shape.
type SignupFormValues = {
  full_name: string
  email: string
  phone: string
  pronouns?: string
  pronouns_other?: string
  school?: string
  age_range?: string
  guardian_name?: string
  guardian_phone?: string
  requires_service_hours: boolean
  referral_source_label?: string
  referral_source_other?: string
  referral_name?: string
  category_ids: string[]
}

function createSignupSchema(showAgeRange: boolean) {
  return z
    .object({
      full_name: z.string().min(1, 'Full name is required').max(150),
      email: z.string().email('Please enter a valid email address').max(150),
      phone: z.string().min(10, 'Phone number is required').max(30),
      pronouns: z.string().max(100).optional(),
      pronouns_other: z.string().optional(),
      school: z.string().max(200).optional(),
      age_range: showAgeRange ? z.string().min(1, 'Please select an age range') : z.string().optional(),
      guardian_name: z.string().max(150).optional(),
      guardian_phone: z.string().max(30).optional(),
      requires_service_hours: z.boolean().default(false),
      referral_source_label: z.string().optional(),
      referral_source_other: z.string().max(500).optional(),
      referral_name: z.string().max(200).optional(),
      category_ids: z.array(z.string()).optional().default([]),
    })
    .superRefine((data, ctx) => {
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
      if (data.referral_source_label === 'Other' && !data.referral_source_other?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['referral_source_other'],
          message: 'Please tell us how you heard about us',
        })
      }
    })
}

const PRONOUN_OPTIONS = ['She/Her', 'He/Him', 'They/Them', 'Other', 'Prefer not to say']
const AGE_RANGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'under_18', label: 'Under 18' },
  { value: '18_25', label: '18–25' },
  { value: '26_35', label: '26–35' },
  { value: '36_50', label: '36–50' },
  { value: '51_plus', label: '51+' },
  { value: 'prefer_not', label: 'Prefer not to say' },
]

function CheckIcon() {
  return (
    <div className="w-16 h-16 rounded-full bg-brand-accent mx-auto flex items-center justify-center">
      <Check className="text-white" size={32} strokeWidth={3} />
    </div>
  )
}

export default function CheckInClient({
  resolution,
  token,
  categories,
  hearingOptions,
  showSchool,
  showAgeRange,
}: Props) {
  const hasMultipleDates = resolution.type === 'show' && resolution.dates.length > 1
  const initialDateId = resolution.type === 'show' ? resolution.selectedDate.id : resolution.showDate.id

  const [state, setState] = useState<PageState>('lookup')
  const [selectedDateId, setSelectedDateId] = useState<string>(initialDateId)
  const [lookupInput, setLookupInput] = useState('')
  const [volunteerName, setVolunteerName] = useState('')
  const [inlineError, setInlineError] = useState<string | null>(null)

  const schema = useMemo(() => createSignupSchema(showAgeRange), [showAgeRange])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting: rhfSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(schema) as Resolver<SignupFormValues>,
    defaultValues: { category_ids: [], requires_service_hours: false },
  })

  // react-hook-form's watch() is required here (Brief §3) — matches the
  // established pattern in components/VolunteerForm.tsx.
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedAge = watch('age_range')
  const watchedPronouns = watch('pronouns')
  const watchedReferral = watch('referral_source_label')
  const watchedSchool = watch('school')
  const watchedRequiresServiceHours = watch('requires_service_hours')
  const showServiceHours = !!watchedSchool?.trim()

  const activeDate =
    resolution.type === 'show'
      ? (resolution.dates.find((d) => d.id === selectedDateId) ?? resolution.selectedDate)
      : resolution.showDate

  function applyResult(result: CheckInResult, isFromSignup: boolean) {
    if ('success' in result) {
      setVolunteerName(result.volunteerName)
      setState('success')
      return
    }
    if ('alreadyCheckedIn' in result) {
      setVolunteerName(result.volunteerName)
      setState('already_in')
      return
    }
    if ('notFound' in result) {
      if (isFromSignup) {
        // Matched an existing volunteer record but no claimed spot for this
        // date — surface this rather than silently re-showing a blank form.
        setInlineError('We found your info, but no claimed spot for this date — please check with a crew member.')
      }
      setState('not_found')
      return
    }
    if (result.error === 'date_passed') {
      setInlineError('This check-in period has ended.')
    } else {
      setInlineError('Something went wrong. Please ask a crew member for help.')
    }
    setState(isFromSignup ? 'not_found' : 'lookup')
  }

  async function handleLookup() {
    const trimmed = lookupInput.trim()
    if (!trimmed) return

    setState('submitting')
    setInlineError(null)
    const result = await checkInVolunteer(token, trimmed, selectedDateId)

    if ('notFound' in result) {
      if (trimmed.includes('@')) {
        setValue('email', trimmed)
      } else {
        setValue('phone', trimmed)
      }
    }

    applyResult(result, false)
  }

  async function onSignupSubmit(data: SignupFormValues) {
    setState('signup_submitting')
    setInlineError(null)

    const pronounsFinal = data.pronouns === 'Other' ? data.pronouns_other || undefined : data.pronouns
    const referralFinal =
      data.referral_source_label === 'Other' ? data.referral_source_other || undefined : data.referral_source_label

    const payload: CheckInSignupInput = {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      pronouns: pronounsFinal,
      school: data.school,
      age_range: data.age_range,
      is_minor: data.age_range === 'under_18',
      guardian_name: data.guardian_name,
      guardian_phone: data.guardian_phone,
      requires_service_hours: showServiceHours ? data.requires_service_hours : false,
      referral_source: referralFinal,
      referral_name: data.referral_name,
      category_ids: data.category_ids,
    }

    const result = await checkInNewVolunteer(token, selectedDateId, payload, showAgeRange)

    if ('success' in result) {
      setVolunteerName(result.volunteerName)
      setState('signup_success')
      return
    }

    if (result.error === 'duplicate_handled' && result.result) {
      applyResult(result.result, true)
      return
    }

    if (result.error === 'date_passed') {
      setInlineError('This check-in period has ended.')
    } else {
      setInlineError('Something went wrong. Please ask a crew member for help.')
    }
    setState('not_found')
  }

  const inputClasses =
    'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors'
  const labelClasses = 'block text-sm font-semibold text-dark mb-1'
  const errorClasses = 'mt-1 text-sm text-brand-accent'

  if (state === 'success') {
    return (
      <div className="max-w-[480px] mx-auto px-4 text-center py-10">
        <CheckIcon />
        <h1 className="text-brand-primary font-bold text-2xl mt-4 mb-2">You&apos;re checked in!</h1>
        <p className="text-mid-gray text-base">Welcome, {volunteerName}! See you at the show.</p>
      </div>
    )
  }

  if (state === 'already_in') {
    return (
      <div className="max-w-[480px] mx-auto px-4 text-center py-10">
        <CheckIcon />
        <h1 className="text-brand-primary font-bold text-2xl mt-4 mb-2">You&apos;re already checked in!</h1>
        <p className="text-mid-gray text-base">See you tonight, {volunteerName}.</p>
      </div>
    )
  }

  if (state === 'signup_success') {
    return (
      <div className="max-w-[480px] mx-auto px-4 text-center py-10">
        <CheckIcon />
        <h1 className="text-brand-primary font-bold text-2xl mt-4 mb-2">You&apos;re all checked in!</h1>
        <p className="text-mid-gray text-base">
          Welcome, {volunteerName}! We&apos;ve added you to our volunteer list — check your email for a
          confirmation.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 space-y-5">
      {hasMultipleDates && resolution.type === 'show' && (
        <div className="text-center pb-2">
          <p className="text-dark text-sm">
            Checking in for {formatWallClockCT(activeDate.show_date, activeDate.show_time, 'EEEE, MMM d')}.
          </p>
          <label className="block mt-2">
            <span className="text-sm text-mid-gray">Different date?</span>
            <select
              className={`${inputClasses} mt-1`}
              value={selectedDateId}
              onChange={(e) => setSelectedDateId(e.target.value)}
            >
              {resolution.dates.map((d) => (
                <option key={d.id} value={d.id}>
                  {formatWallClockCT(d.show_date, d.show_time, 'EEEE, MMM d — h:mm a')}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {(state === 'lookup' || state === 'submitting') && (
        <div className="space-y-4">
          <label className={labelClasses}>Enter your email or phone number to check in</label>
          <input
            type="text"
            className={inputClasses}
            value={lookupInput}
            onChange={(e) => setLookupInput(e.target.value)}
            disabled={state === 'submitting'}
          />
          {inlineError && <p className={errorClasses}>{inlineError}</p>}
          <button
            type="button"
            onClick={handleLookup}
            disabled={state === 'submitting'}
            className="w-full py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {state === 'submitting' ? 'Checking...' : 'Check In'}
          </button>
        </div>
      )}

      {(state === 'not_found' || state === 'signup_submitting') && (
        <div className="space-y-5">
          <p className="text-dark text-sm">
            You&apos;re not on the list yet — sign up below and we&apos;ll get you checked in!
          </p>
          {inlineError && <p className={errorClasses}>{inlineError}</p>}

          <div>
            <label className={labelClasses}>
              Full Name<span className="text-brand-accent ml-0.5">*</span>
            </label>
            <input type="text" className={inputClasses} {...register('full_name')} />
            {errors.full_name && <p className={errorClasses}>{errors.full_name.message}</p>}
          </div>

          <div>
            <label className={labelClasses}>
              Email Address<span className="text-brand-accent ml-0.5">*</span>
            </label>
            <input type="email" className={inputClasses} {...register('email')} />
            {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
          </div>

          <div>
            <label className={labelClasses}>
              Phone Number<span className="text-brand-accent ml-0.5">*</span>
            </label>
            <input type="tel" className={inputClasses} {...register('phone')} />
            {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
          </div>

          <div>
            <label className={labelClasses}>Preferred Pronouns</label>
            <select className={inputClasses} {...register('pronouns')}>
              <option value="">Select pronouns (optional)</option>
              {PRONOUN_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
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

          {showSchool && (
            <div>
              <label className={labelClasses}>School (if applicable)</label>
              <input type="text" className={inputClasses} {...register('school')} />

              {showServiceHours && (
                <div className="mt-3">
                  <label className={labelClasses}>
                    Do you require service hours for your school or organization?
                  </label>
                  <div className="flex gap-6 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={watchedRequiresServiceHours === true}
                        onChange={() => setValue('requires_service_hours', true, { shouldValidate: true })}
                        className="text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-dark">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={watchedRequiresServiceHours === false}
                        onChange={() => setValue('requires_service_hours', false, { shouldValidate: true })}
                        className="text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-dark">No</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {showAgeRange && (
            <div>
              <label className={labelClasses}>
                Age Range <span className="text-brand-accent ml-0.5">*</span>
              </label>
              <select className={inputClasses} {...register('age_range')}>
                <option value="">Select age range</option>
                {AGE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.age_range && <p className={errorClasses}>{errors.age_range.message}</p>}

              {watchedAge === 'under_18' && (
                <div className="bg-brand-accent-light border border-brand-accent rounded-lg p-4 mt-2">
                  <p className="text-sm text-dark mb-3">
                    Because you&apos;re under 18, we need a parent or guardian&apos;s contact information.
                  </p>
                  <div className="space-y-5">
                    <div>
                      <label className={labelClasses}>
                        Guardian Name<span className="text-brand-accent ml-0.5">*</span>
                      </label>
                      <input type="text" className={inputClasses} {...register('guardian_name')} />
                      {errors.guardian_name && <p className={errorClasses}>{errors.guardian_name.message}</p>}
                    </div>
                    <div>
                      <label className={labelClasses}>
                        Guardian Phone<span className="text-brand-accent ml-0.5">*</span>
                      </label>
                      <input type="tel" className={inputClasses} {...register('guardian_phone')} />
                      {errors.guardian_phone && <p className={errorClasses}>{errors.guardian_phone.message}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className={labelClasses}>Areas of Interest</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded border border-divider hover:border-brand-primary-mid transition-colors has-[:checked]:border-brand-primary has-[:checked]:bg-brand-primary-light"
                >
                  <input
                    type="checkbox"
                    value={cat.id}
                    onChange={(e) => {
                      const current = getValues('category_ids') ?? []
                      if (e.target.checked) {
                        setValue('category_ids', [...current, cat.id])
                      } else {
                        setValue(
                          'category_ids',
                          current.filter((id) => id !== cat.id)
                        )
                      }
                    }}
                  />
                  <span className="text-sm text-dark">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

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
                {errors.referral_source_other && <p className={errorClasses}>{errors.referral_source_other.message}</p>}
              </>
            )}
          </div>

          <div>
            <label className={labelClasses}>Referred by (optional)</label>
            <input type="text" className={inputClasses} {...register('referral_name')} />
          </div>

          <button
            type="button"
            onClick={handleSubmit(onSignupSubmit)}
            disabled={state === 'signup_submitting' || rhfSubmitting}
            className="w-full py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {state === 'signup_submitting' ? 'Signing up...' : 'Sign Up & Check In'}
          </button>
        </div>
      )}
    </div>
  )
}
