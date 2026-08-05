'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { formatCT, formatWallClockCT } from '@/lib/utils/date'
import {
  submitAuditionSignup,
  getAuditionMaterialUploadUrl,
  confirmAuditionMaterialUpload,
} from '@/lib/actions/auditions'
import type { AuditionPublicData, AuditionMaterialType } from '@/types/audition'

type PageState = 'form' | 'submitting' | 'uploading' | 'success' | 'duplicate' | 'slot-full'

const MATERIAL_CONFIG: Record<AuditionMaterialType, { label: string; accept: string }> = {
  headshot: { label: 'Headshot photo', accept: 'image/jpeg,image/png,image/gif,image/webp' },
  resume: { label: 'Resume (PDF)', accept: 'application/pdf' },
  sheet_music: { label: 'Sheet music (PDF)', accept: 'application/pdf' },
  mp3: { label: 'MP3 or audio file', accept: 'audio/mpeg,audio/mp4,audio/wav' },
  video: { label: 'Video reel or audition tape', accept: 'video/mp4,video/quicktime,video/webm' },
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// time_start/time_end are `time without time zone` columns — raw strings
// like "19:00:00". Neither formatCT() (timestamptz) nor formatWallClockCT()
// (date columns) apply here; this is a plain string formatter.
function formatTime(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

// XHR required for upload progress tracking — fetch() does not support
// onprogress. Matches the Supabase Storage signed-upload-URL contract
// confirmed in ConsentUploadForm.tsx / MediaLibrary.tsx / BrandImageUploader.tsx:
// a FormData payload with a cacheControl field and the file appended under
// an empty field name — not a raw file body with a Content-Type header.
function uploadWithProgress(signedUrl: string, file: File, onProgress: (percent: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error('Upload network error'))

    const formData = new FormData()
    formData.append('cacheControl', '3600')
    formData.append('', file)
    xhr.send(formData)
  })
}

const inputClasses =
  'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors'

export default function AuditionSignupClient({ data, orgName }: { data: AuditionPublicData; orgName: string }) {
  const [pageState, setPageState] = useState<PageState>('form')
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isMinor, setIsMinor] = useState(false)
  const [guardianName, setGuardianName] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Record<AuditionMaterialType, File | null>>({
    headshot: null,
    resume: null,
    sheet_music: null,
    mp3: null,
    video: null,
  })
  const [uploadProgress, setUploadProgress] = useState<Record<AuditionMaterialType, number>>({
    headshot: 0,
    resume: 0,
    sheet_music: 0,
    mp3: 0,
    video: 0,
  })
  const [uploadErrors, setUploadErrors] = useState<Record<AuditionMaterialType, string | null>>({
    headshot: null,
    resume: null,
    sheet_music: null,
    mp3: null,
    video: null,
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [, setSuccessSignupId] = useState<string | null>(null)
  const [uploadToken, setUploadToken] = useState<string | null>(null)

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const enabledMaterialTypes: AuditionMaterialType[] = []
  if (data.audition.material_headshot) enabledMaterialTypes.push('headshot')
  if (data.audition.material_resume) enabledMaterialTypes.push('resume')
  if (data.audition.material_sheet_music) enabledMaterialTypes.push('sheet_music')
  if (data.audition.material_mp3) enabledMaterialTypes.push('mp3')
  if (data.audition.material_video) enabledMaterialTypes.push('video')

  function handleFileSelect(type: AuditionMaterialType, e: ChangeEvent<HTMLInputElement>) {
    setSelectedFiles((prev) => ({ ...prev, [type]: e.target.files?.[0] ?? null }))
  }

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = 'Full name is required.'
    if (!email.trim()) {
      errors.email = 'Email is required.'
    } else if (!EMAIL_RE.test(email)) {
      errors.email = 'Please enter a valid email address.'
    }
    if (!phone.trim()) errors.phone = 'Phone number is required.'
    if (isMinor && !guardianName.trim()) errors.guardianName = 'Guardian name is required.'
    if (isMinor && !guardianPhone.trim()) errors.guardianPhone = 'Guardian phone is required.'
    if (data.audition.type === 'timed_slots' && !selectedSlotId) errors.slot = 'Please select a time slot.'
    return errors
  }

  async function uploadFiles(token: string) {
    for (const type of enabledMaterialTypes) {
      const file = selectedFiles[type]
      if (!file) continue

      try {
        const { signedUrl, path, error } = await getAuditionMaterialUploadUrl(token, type, file.name)
        if (error || !signedUrl || !path) {
          setUploadErrors((prev) => ({ ...prev, [type]: error || 'Upload failed.' }))
          continue
        }

        await uploadWithProgress(signedUrl, file, (percent) => {
          setUploadProgress((prev) => ({ ...prev, [type]: percent }))
        })

        await confirmAuditionMaterialUpload({
          uploadToken: token,
          storagePath: path,
          materialType: type,
          originalFilename: file.name,
        })
      } catch (err) {
        console.error(`Audition material upload failed (${type}):`, err)
        setUploadErrors((prev) => ({
          ...prev,
          [type]: "Upload failed. You can upload this file later using the link in your confirmation email.",
        }))
      }
    }

    setPageState('success')
  }

  async function handleSubmit() {
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setPageState('submitting')
    setSubmitError(null)

    const result = await submitAuditionSignup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone,
      auditionId: data.audition.id,
      slotId: selectedSlotId,
      auditionRoleId: selectedRoleId,
      isMinor,
      guardianName: isMinor ? guardianName.trim() : null,
      guardianPhone: isMinor ? guardianPhone.trim() : null,
    })

    if (!result.success) {
      if (result.error?.includes('already signed up')) {
        setPageState('duplicate')
      } else if (result.error?.includes('time slot is now full')) {
        setPageState('slot-full')
      } else {
        setSubmitError(result.error || 'Something went wrong.')
        setPageState('form')
      }
      return
    }

    setSuccessSignupId(result.signupId ?? null)
    setUploadToken(result.uploadToken ?? null)

    const hasFiles = Object.values(selectedFiles).some((f) => f !== null)
    if (hasFiles && result.uploadToken) {
      setPageState('uploading')
      await uploadFiles(result.uploadToken)
    } else {
      setPageState('success')
    }
  }

  // ─── Terminal / interstitial states ───────────────────────────

  if (pageState === 'duplicate') {
    return (
      <div className="text-center py-10">
        <h2 className="text-brand-primary font-bold text-xl mb-3">{"You're already registered!"}</h2>
        <p className="text-dark text-sm leading-relaxed">
          {"You've already signed up to audition for this show. If you need to make changes, use the link in your confirmation email."}
        </p>
      </div>
    )
  }

  if (pageState === 'uploading') {
    return (
      <div className="py-10">
        <h2 className="text-brand-primary font-bold text-xl mb-6 text-center">Uploading your materials…</h2>
        <div className="space-y-4">
          {enabledMaterialTypes.map((type) => {
            const file = selectedFiles[type]
            if (!file) return null
            return (
              <div key={type}>
                <span className="text-sm text-dark font-medium">{MATERIAL_CONFIG[type].label}</span>
                {uploadErrors[type] ? (
                  <p className="text-red-600 text-sm mt-1">{uploadErrors[type]}</p>
                ) : (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                    <div
                      className="bg-brand-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress[type]}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (pageState === 'success') {
    const anyUploadFailed = Object.values(uploadErrors).some(Boolean)
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-brand-accent mx-auto flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">✓</span>
        </div>
        <h2 className="text-brand-primary font-bold text-2xl mb-2">{"You're all set!"}</h2>
        <p className="text-dark text-base leading-relaxed">
          {"Thank you for signing up to audition. You'll receive a confirmation email shortly with all the details."}
        </p>
        {anyUploadFailed && (
          <p className="text-amber-700 text-sm mt-4">
            {"Some files couldn't be uploaded. You can submit them using the link in your confirmation email."}
          </p>
        )}
      </div>
    )
  }

  if (pageState === 'slot-full') {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 text-base mb-4">
          {'That time slot just filled up. Please choose a different time.'}
        </p>
        <button
          type="button"
          onClick={() => {
            setSelectedSlotId(null)
            setPageState('form')
          }}
          className="inline-block bg-brand-primary text-white font-semibold py-3 px-6 rounded hover:bg-opacity-90 transition-colors cursor-pointer"
        >
          Choose another time
        </button>
      </div>
    )
  }

  // ─── Form (pageState === 'form' || 'submitting') ───────────────

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-brand-primary font-bold text-2xl md:text-3xl mb-2">{data.audition.title}</h1>
        <p className="text-dark text-sm">
          {formatWallClockCT(data.audition.date_start, null, 'MMMM d, yyyy')}
          {data.audition.date_end ? ` – ${formatWallClockCT(data.audition.date_end, null, 'MMMM d, yyyy')}` : ''}
        </p>
        {(data.audition.time_start || data.audition.time_end) && (
          <p className="text-dark text-sm">
            {formatTime(data.audition.time_start)}
            {data.audition.time_end ? ` – ${formatTime(data.audition.time_end)}` : ''}
          </p>
        )}
        {data.location && <p className="text-dark text-sm">{data.location.name}</p>}
        <span className="inline-block text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 mt-2 bg-brand-primary-light text-brand-primary">
          {data.audition.type === 'timed_slots' ? 'Timed Slots' : 'Open Call'}
        </span>
        {data.audition.description && (
          <p className="text-mid-gray mt-2 text-sm leading-relaxed">{data.audition.description}</p>
        )}
      </div>

      {data.audition.type === 'timed_slots' && (
        <div className="mb-8">
          <h2 className="text-dark font-semibold text-base mb-3">Choose your audition time:</h2>
          {data.slots.length === 0 ? (
            <p className="text-mid-gray text-sm">No time slots are available yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.slots.map((slot) => {
                const remaining = slot.cap - slot.signupCount
                const isFull = remaining <= 0
                const isSelected = selectedSlotId === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                      isFull
                        ? 'pointer-events-none opacity-50 cursor-not-allowed border-divider bg-gray-50'
                        : isSelected
                          ? 'border-brand-primary bg-brand-primary-light cursor-pointer'
                          : 'border-divider hover:border-brand-primary cursor-pointer'
                    }`}
                  >
                    <p className="font-semibold text-dark">{formatCT(slot.start_time, 'h:mm a')}</p>
                    <p className="text-xs text-mid-gray mt-0.5">
                      {isFull ? 'Full' : `${remaining} of ${slot.cap} spots remaining`}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
          {fieldErrors.slot && <p className="text-red-600 text-sm mt-2">{fieldErrors.slot}</p>}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-dark mb-1">Full name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
          {fieldErrors.name && <p className="text-red-600 text-sm mt-1">{fieldErrors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
          {fieldErrors.email && <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark mb-1">Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
          {fieldErrors.phone && <p className="text-red-600 text-sm mt-1">{fieldErrors.phone}</p>}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isMinor} onChange={(e) => setIsMinor(e.target.checked)} />
          <span className="text-sm text-dark">I am under 18 years old</span>
        </label>

        {isMinor && (
          <div className="space-y-5 rounded-lg bg-gray-50 p-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">Guardian name</label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className={inputClasses}
              />
              {fieldErrors.guardianName && <p className="text-red-600 text-sm mt-1">{fieldErrors.guardianName}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">Guardian phone</label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className={inputClasses}
              />
              {fieldErrors.guardianPhone && <p className="text-red-600 text-sm mt-1">{fieldErrors.guardianPhone}</p>}
            </div>
          </div>
        )}

        {data.audition.role_selection_enabled && data.roles.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-dark mb-1">{"Role you're auditioning for"}</label>
            <select
              value={selectedRoleId || ''}
              onChange={(e) => setSelectedRoleId(e.target.value || null)}
              className={inputClasses}
            >
              <option value="">Select a role...</option>
              {data.roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {enabledMaterialTypes.length > 0 && (
          <div className="space-y-4 pt-2">
            {enabledMaterialTypes.map((type) => {
              const config = MATERIAL_CONFIG[type]
              const file = selectedFiles[type]
              return (
                <div key={type}>
                  <label className="block text-sm font-semibold text-dark mb-1">
                    {config.label} <span className="text-mid-gray font-normal">(optional)</span>
                  </label>
                  <input
                    ref={(el) => {
                      fileInputRefs.current[type] = el
                    }}
                    type="file"
                    accept={config.accept}
                    className="hidden"
                    onChange={(e) => handleFileSelect(type, e)}
                  />
                  {file ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-dark truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles((prev) => ({ ...prev, [type]: null }))}
                        className="text-sm font-semibold text-brand-accent hover:underline cursor-pointer whitespace-nowrap"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[type]?.click()}
                      className={`${inputClasses} text-left cursor-pointer`}
                    >
                      Choose file
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={pageState === 'submitting'}
          className="w-full py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {pageState === 'submitting' ? 'Signing up...' : 'Sign up to audition'}
        </button>

        {submitError && <p className="text-red-600 text-sm mt-2">{submitError}</p>}
      </div>

      {/* orgName / uploadToken retained for parity with the confirmation-email
          flow (AUDITIONS.4b) — not otherwise rendered on this page. */}
      <span className="hidden" data-org={orgName} data-upload-token={uploadToken ?? ''} />
    </div>
  )
}
