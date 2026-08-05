'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { getAuditionMaterialUploadUrl, confirmAuditionMaterialUpload } from '@/lib/actions/auditions'
import type { AuditionUploadData, AuditionMaterialType } from '@/types/audition'

const MATERIAL_CONFIG: Record<AuditionMaterialType, { label: string; accept: string }> = {
  headshot: { label: 'Headshot photo', accept: 'image/jpeg,image/png,image/gif,image/webp' },
  resume: { label: 'Resume (PDF)', accept: 'application/pdf' },
  sheet_music: { label: 'Sheet music (PDF)', accept: 'application/pdf' },
  mp3: { label: 'MP3 or audio file', accept: 'audio/mpeg,audio/mp4,audio/wav' },
  video: { label: 'Video reel or audition tape', accept: 'video/mp4,video/quicktime,video/webm' },
}

// XHR required for upload progress tracking — fetch() does not support
// onprogress. Same FormData + cacheControl contract confirmed across
// ConsentUploadForm.tsx / MediaLibrary.tsx / BrandImageUploader.tsx /
// AuditionSignupClient.tsx: a FormData payload with a cacheControl field
// and the file under an empty field name — no Content-Type header set.
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

const triggerButtonClasses =
  'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark text-left focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors cursor-pointer'

export default function AuditionUploadClient({ data, uploadToken }: { data: AuditionUploadData; uploadToken: string }) {
  const [selectedFiles, setSelectedFiles] = useState<Record<AuditionMaterialType, File | null>>(() => {
    const init = {} as Record<AuditionMaterialType, File | null>
    data.enabledMaterialTypes.forEach((t) => {
      init[t] = null
    })
    return init
  })
  const [uploadProgress, setUploadProgress] = useState<Record<AuditionMaterialType, number>>(() => {
    const init = {} as Record<AuditionMaterialType, number>
    data.enabledMaterialTypes.forEach((t) => {
      init[t] = 0
    })
    return init
  })
  const [uploadErrors, setUploadErrors] = useState<Record<AuditionMaterialType, string | null>>(() => {
    const init = {} as Record<AuditionMaterialType, string | null>
    data.enabledMaterialTypes.forEach((t) => {
      init[t] = null
    })
    return init
  })
  const [uploadSuccesses, setUploadSuccesses] = useState<Record<AuditionMaterialType, boolean>>(() => {
    const init = {} as Record<AuditionMaterialType, boolean>
    data.enabledMaterialTypes.forEach((t) => {
      init[t] = false
    })
    return init
  })
  const [uploading, setUploading] = useState(false)
  const [allDone, setAllDone] = useState(false)

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const existingTypes = new Set(data.existingMaterials.map((m) => m.material_type))

  function handleFileSelect(type: AuditionMaterialType, e: ChangeEvent<HTMLInputElement>) {
    setSelectedFiles((prev) => ({ ...prev, [type]: e.target.files?.[0] ?? null }))
  }

  async function handleUpload() {
    setUploading(true)
    setAllDone(false)

    for (const type of data.enabledMaterialTypes) {
      const file = selectedFiles[type]
      if (!file) continue

      try {
        const { signedUrl, path, error } = await getAuditionMaterialUploadUrl(uploadToken, type, file.name)
        if (error || !signedUrl || !path) {
          setUploadErrors((prev) => ({ ...prev, [type]: error || 'Upload failed.' }))
          continue
        }

        await uploadWithProgress(signedUrl, file, (percent) => {
          setUploadProgress((prev) => ({ ...prev, [type]: percent }))
        })

        await confirmAuditionMaterialUpload({
          uploadToken,
          storagePath: path,
          materialType: type,
          originalFilename: file.name,
        })

        setUploadSuccesses((prev) => ({ ...prev, [type]: true }))
      } catch (err) {
        console.error(`Audition material upload failed (${type}):`, err)
        setUploadErrors((prev) => ({ ...prev, [type]: 'Upload failed. Please try again.' }))
      }
    }

    setUploading(false)
    setAllDone(true)
  }

  const hasSelectedFiles = Object.values(selectedFiles).some((f) => f !== null)
  const anyErrors = Object.values(uploadErrors).some(Boolean)

  if (allDone && !anyErrors) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-brand-accent mx-auto flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">✓</span>
        </div>
        <h2 className="text-brand-primary font-bold text-2xl mb-2">{"You're all set!"}</h2>
        <p className="text-dark text-base leading-relaxed">
          {'Your materials have been submitted. We look forward to your audition!'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-brand-primary font-bold text-2xl md:text-3xl mb-2">Submit your audition materials</h1>
      <p className="text-dark text-sm mb-8">
        {data.auditionerName} — {data.auditionTitle}
      </p>

      <div className="space-y-5">
        {data.enabledMaterialTypes.map((type) => {
          const config = MATERIAL_CONFIG[type]
          const file = selectedFiles[type]
          const alreadySubmitted = existingTypes.has(type)
          const uploadedThisSession = uploadSuccesses[type]

          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-semibold text-dark">{config.label}</label>
                {uploadedThisSession ? (
                  <span className="text-xs font-semibold text-brand-accent">✓ Uploaded</span>
                ) : (
                  alreadySubmitted && <span className="text-xs font-semibold text-brand-accent">✓ Already submitted</span>
                )}
              </div>

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
                  className={triggerButtonClasses}
                >
                  Choose file
                </button>
              )}

              {uploading && file && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className="bg-brand-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress[type]}%` }}
                  />
                </div>
              )}

              {uploadErrors[type] && <p className="text-red-600 text-sm mt-1">{uploadErrors[type]}</p>}
            </div>
          )
        })}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!hasSelectedFiles || uploading}
          className="w-full py-3 bg-brand-accent text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {uploading ? 'Uploading...' : 'Upload materials'}
        </button>

        {allDone && anyErrors && (
          <p className="text-amber-700 text-sm text-center">{"Some files couldn't be uploaded. Please try again."}</p>
        )}
      </div>
    </div>
  )
}
