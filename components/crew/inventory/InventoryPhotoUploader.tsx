'use client'

// XHR used instead of fetch() — fetch() does not support upload progress events.
// xhr.upload.onprogress is the only browser-native way to report upload progress.

import { useRef, useState, type ChangeEvent } from 'react'
import { getInventoryPhotoUploadUrl, confirmInventoryPhotoUpload } from '@/lib/actions/inventory'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

type UploadStatus = 'pending' | 'uploading' | 'done' | 'error'

type UploadItem = {
  file: File
  progress: number
  status: UploadStatus
  error?: string
}

// Matches the Supabase Storage signed-upload-URL contract for a File/Blob
// body: a FormData payload with a cacheControl field and the file appended
// under an empty field name — not a raw file body with a Content-Type
// header. Confirmed correct pattern in AUDITIONS.3a F1.
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

export default function InventoryPhotoUploader({
  itemId,
  existingPhotoCount,
  onUploadComplete,
}: {
  itemId: string
  existingPhotoCount: number
  onUploadComplete: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectError, setSelectError] = useState<string | null>(null)

  async function processFiles(files: File[]) {
    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      setUploads((prev) =>
        prev.map((u, idx) => (idx === i ? { ...u, status: 'uploading' } : u))
      )

      const urlResult = await getInventoryPhotoUploadUrl(itemId, file.name, file.type)
      if ('error' in urlResult) {
        setUploads((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, status: 'error', error: urlResult.error } : u))
        )
        continue
      }

      try {
        await uploadWithProgress(urlResult.signedUrl, file, (percent) => {
          setUploads((prev) => prev.map((u, idx) => (idx === i ? { ...u, progress: percent } : u)))
        })
      } catch {
        setUploads((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, status: 'error', error: 'Upload failed.' } : u))
        )
        continue
      }

      const confirmResult = await confirmInventoryPhotoUpload(itemId, urlResult.path, existingPhotoCount + i + 1)
      if (!('success' in confirmResult)) {
        setUploads((prev) =>
          prev.map((u, idx) => (idx === i ? { ...u, status: 'error', error: confirmResult.error } : u))
        )
        continue
      }

      setUploads((prev) => prev.map((u, idx) => (idx === i ? { ...u, status: 'done', progress: 100 } : u)))
    }

    setIsUploading(false)
    onUploadComplete()

    // Clear the upload list shortly after everything settles so the
    // uploader resets to its idle state for the next batch.
    setTimeout(() => setUploads([]), 2000)
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setSelectError(null)
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

    const invalidType = selected.find((f) => !f.type.startsWith('image/'))
    if (invalidType) {
      setSelectError(`${invalidType.name} is not an image file.`)
      e.target.value = ''
      return
    }

    const oversized = selected.find((f) => f.size > MAX_FILE_SIZE)
    if (oversized) {
      setSelectError(`${oversized.name} is larger than 10MB.`)
      e.target.value = ''
      return
    }

    setUploads(selected.map((file) => ({ file, progress: 0, status: 'pending' as UploadStatus })))
    e.target.value = ''
    processFiles(selected)
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? 'Uploading…' : 'Add Photos'}
      </button>

      {selectError && <p className="text-sm text-brand-accent">{selectError}</p>}

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div key={`${upload.file.name}-${index}`} className="text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-dark dark:text-dark-text truncate">{upload.file.name}</span>
                {upload.status === 'done' && <span className="text-green-600 dark:text-green-400">✓</span>}
                {upload.status === 'error' && (
                  <span className="text-brand-accent text-xs">{upload.error ?? 'Error'}</span>
                )}
                {upload.status === 'uploading' && (
                  <span className="text-mid-gray dark:text-dark-muted text-xs">{upload.progress}%</span>
                )}
              </div>
              {upload.status === 'uploading' && (
                <div className="w-full bg-divider dark:bg-dark-border rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    className="bg-brand-accent h-1.5 transition-all"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
