'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import { formatPhone } from '@/lib/utils/phone'
import { updateVolunteer } from '@/lib/actions/volunteers'
import { volunteerProfileSchema, type VolunteerProfileFormValues } from '@/lib/validations/volunteerProfile'
import type { VolunteerProfile } from '@/types/volunteer'
import type { AdminUser } from '@/lib/auth'

const AGE_RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'under_18', label: 'Under 18' },
  { value: '18_25', label: '18–25' },
  { value: '26_35', label: '26–35' },
  { value: '36_50', label: '36–50' },
  { value: '51_plus', label: '51+' },
  { value: 'prefer_not', label: 'Prefer not to say' },
]

function ageRangeLabel(value: string | null): string {
  return AGE_RANGE_OPTIONS.find((o) => o.value === value)?.label ?? '—'
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-sm text-mid-gray dark:text-dark-muted">{label}</p>
      <p className="text-dark dark:text-dark-text">{value || '—'}</p>
    </div>
  )
}

const inputClasses =
  'w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'
const labelClasses = 'block text-sm font-semibold text-dark dark:text-dark-text mb-1'
const errorClasses = 'mt-1 text-sm text-orange'

export default function VolunteerProfileForm({
  volunteer,
  categories,
  allCategories,
  role,
}: {
  volunteer: VolunteerProfile
  categories: { id: string; name: string }[]
  allCategories: { id: string; name: string }[]
  role: AdminUser['role']
}) {
  const router = useRouter()
  const canEdit = role === 'super_admin' || role === 'editor'
  const [isEditing, setIsEditing] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VolunteerProfileFormValues>({
    resolver: zodResolver(volunteerProfileSchema) as Resolver<VolunteerProfileFormValues>,
    defaultValues: {
      full_name: volunteer.full_name,
      email: volunteer.email,
      phone: volunteer.phone,
      pronouns: volunteer.pronouns ?? '',
      school: volunteer.school ?? '',
      age_range: volunteer.age_range ?? '',
      is_minor: volunteer.is_minor,
      guardian_name: volunteer.guardian_name ?? '',
      guardian_phone: volunteer.guardian_phone ?? '',
      requires_service_hours: volunteer.requires_service_hours,
      category_ids: categories.map((c) => c.id),
      referral_source: volunteer.referral_source ?? '',
      referral_name: volunteer.referral_name ?? '',
    },
  })

  // react-hook-form's watch() is required (Brief §3); switching to useWatch() per
  // field would be a broader refactor across this form's conditional-reveal logic,
  // not a surgical fix.
  // eslint-disable-next-line react-hooks/incompatible-library
  const isMinor = watch('is_minor')
  const selectedCategories = watch('category_ids') ?? []
  const watchedSchool = watch('school')
  const watchedRequiresServiceHours = watch('requires_service_hours')
  const showServiceHours = !!watchedSchool?.trim()

  useEffect(() => {
    if (!showServiceHours) {
      setValue('requires_service_hours', false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showServiceHours])

  async function onSubmit(data: VolunteerProfileFormValues) {
    setFormError(null)
    const result = await updateVolunteer(volunteer.id, data)

    if ('success' in result) {
      setIsEditing(false)
      router.refresh()
      return
    }

    if (result.error === 'email_taken') {
      setError('email', { message: 'This email is already in use.' })
      return
    }
    if (result.error === 'phone_taken') {
      setError('phone', { message: 'This phone number is already in use.' })
      return
    }
    setFormError(result.error)
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-dark dark:text-dark-text">Profile Details</h2>
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-sm bg-white dark:bg-dark-surface border border-navy text-navy font-semibold px-3 py-1.5 rounded hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-navy dark:text-steel uppercase tracking-wide">Contact</h3>
            <Field label="Full Name" value={volunteer.full_name} />
            <Field label="Email" value={volunteer.email} />
            <Field label="Phone" value={formatPhone(volunteer.phone)} />
            <Field label="Preferred Pronouns" value={volunteer.pronouns} />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-navy dark:text-steel uppercase tracking-wide">Personal</h3>
            <Field label="Age Range" value={ageRangeLabel(volunteer.age_range)} />
            <Field label="School / Organization" value={volunteer.school} />
            <div>
              <p className="text-sm text-mid-gray dark:text-dark-muted">Service Hours Required</p>
              {volunteer.requires_service_hours ? (
                <p className="text-orange font-medium">Yes</p>
              ) : volunteer.school ? (
                <p className="text-mid-gray dark:text-dark-muted">No</p>
              ) : (
                <p className="text-mid-gray dark:text-dark-muted">—</p>
              )}
            </div>
            <Field label="Is Minor" value={volunteer.is_minor ? 'Yes' : 'No'} />
            {volunteer.is_minor && (
              <>
                <Field label="Guardian Name" value={volunteer.guardian_name} />
                <Field label="Guardian Phone" value={volunteer.guardian_phone} />
              </>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-navy dark:text-steel uppercase tracking-wide">
              Volunteer Interests
            </h3>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <span
                    key={c.id}
                    className="bg-light-navy dark:bg-dark-border text-navy dark:text-dark-text text-xs rounded-full px-2 py-0.5"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-dark dark:text-dark-text">—</p>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-navy dark:text-steel uppercase tracking-wide">
              How They Found Us
            </h3>
            <Field label="How did you hear about us?" value={volunteer.referral_source} />
            <Field label="Referred by (name)" value={volunteer.referral_name} />
          </section>

          <section className="space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-navy dark:text-steel uppercase tracking-wide">Account</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Joined" value={formatCT(volunteer.created_at, 'MMM d, yyyy')} />
              <Field label="Last Updated" value={formatCT(volunteer.updated_at, 'MMM d, yyyy')} />
              <Field label="Status" value={volunteer.status === 'active' ? 'Active' : 'Archived'} />
            </div>
          </section>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>
                Full Name<span className="text-orange ml-0.5">*</span>
              </label>
              <input type="text" className={inputClasses} {...register('full_name')} />
              {errors.full_name && <p className={errorClasses}>{errors.full_name.message}</p>}
            </div>

            <div>
              <label className={labelClasses}>
                Email<span className="text-orange ml-0.5">*</span>
              </label>
              <input type="email" className={inputClasses} {...register('email')} />
              {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
            </div>

            <div>
              <label className={labelClasses}>
                Phone<span className="text-orange ml-0.5">*</span>
              </label>
              <input type="tel" className={inputClasses} {...register('phone')} />
              {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
            </div>

            <div>
              <label className={labelClasses}>Preferred Pronouns</label>
              <input type="text" className={inputClasses} {...register('pronouns')} />
            </div>

            <div>
              <label className={labelClasses}>School / Organization</label>
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
                        onChange={() =>
                          setValue('requires_service_hours', true, { shouldValidate: true })
                        }
                        className="text-navy focus:ring-navy"
                      />
                      <span className="text-sm text-dark dark:text-dark-text">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={watchedRequiresServiceHours === false}
                        onChange={() =>
                          setValue('requires_service_hours', false, { shouldValidate: true })
                        }
                        className="text-navy focus:ring-navy"
                      />
                      <span className="text-sm text-dark dark:text-dark-text">No</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={labelClasses}>Age Range</label>
              <select className={inputClasses} {...register('age_range')}>
                <option value="">Select age range</option>
                {AGE_RANGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_minor')}
                  className="rounded border-divider dark:border-dark-border text-navy focus:ring-navy"
                />
                <span className="text-sm font-semibold text-dark dark:text-dark-text">Is Minor</span>
              </label>

              {isMinor && (
                <div className="bg-pale-orange border border-orange rounded-lg p-4 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>
                      Guardian Name<span className="text-orange ml-0.5">*</span>
                    </label>
                    <input type="text" className={inputClasses} {...register('guardian_name')} />
                    {errors.guardian_name && (
                      <p className={errorClasses}>{errors.guardian_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClasses}>
                      Guardian Phone<span className="text-orange ml-0.5">*</span>
                    </label>
                    <input type="tel" className={inputClasses} {...register('guardian_phone')} />
                    {errors.guardian_phone && (
                      <p className={errorClasses}>{errors.guardian_phone.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={labelClasses}>Categories</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                {allCategories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded border border-divider dark:border-dark-border hover:border-steel hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors has-[:checked]:border-navy has-[:checked]:bg-light-navy dark:has-[:checked]:bg-dark-surface/50"
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
                    <span className="text-sm text-dark dark:text-dark-text">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClasses}>How did you hear about us?</label>
              <input type="text" className={inputClasses} {...register('referral_source')} />
            </div>

            <div>
              <label className={labelClasses}>Referred by (name)</label>
              <input type="text" className={inputClasses} {...register('referral_name')} />
            </div>
          </div>

          {formError && (
            <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark">
              {formError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange text-white font-bold px-5 py-2.5 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border text-dark dark:text-dark-text font-semibold px-5 py-2.5 rounded-lg hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
