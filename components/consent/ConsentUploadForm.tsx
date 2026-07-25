'use client'

import { useState, useRef, type ChangeEvent } from 'react'
import { getConsentUploadUrl, confirmConsentSubmission } from '@/lib/actions/consent'

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

const ERROR_MESSAGES: Record<string, string> = {
  invalid_file_type: 'Please upload a PDF or image.',
  storage_error: 'Upload failed. Please try again.',
  already_submitted: 'This form has already been submitted.',
}

function errorMessageFor(code?: string): string {
  return (code && ERROR_MESSAGES[code]) || 'Something went wrong. Please try again.'
}

// XHR (not fetch) is required here specifically for upload progress events
// (xhr.upload.onprogress) -- fetch has no equivalent for upload progress.
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

    // Matches the Supabase Storage signed-upload-URL contract for a
    // File/Blob body: a FormData payload with a cacheControl field and the
    // file appended under an empty field name.
    const formData = new FormData()
    formData.append('cacheControl', '3600')
    formData.append('', file)
    xhr.send(formData)
  })
}

export default function ConsentUploadForm({
  uploadToken,
  volunteerName,
  documentTypeName,
}: {
  uploadToken: string
  volunteerName: string
  documentTypeName: string
}) {
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null)
    setErrorMessage(null)
  }

  async function handleUpload() {
    if (!selectedFile) {
      setErrorMessage('Please choose a file to upload.')
      return
    }

    setState('uploading')
    setProgress(0)
    setErrorMessage(null)

    const urlResult = await getConsentUploadUrl(uploadToken, selectedFile.name, selectedFile.type)
    if ('error' in urlResult) {
      setErrorMessage(errorMessageFor(urlResult.error))
      setState('error')
      return
    }

    try {
      await uploadWithProgress(urlResult.signedUrl, selectedFile, setProgress)
    } catch (err) {
      console.error('Consent form upload error:', err)
      setErrorMessage(errorMessageFor('storage_error'))
      setState('error')
      return
    }

    const confirmResult = await confirmConsentSubmission(uploadToken, urlResult.path)
    if (!confirmResult.success) {
      setErrorMessage(errorMessageFor(confirmResult.error))
      setState('error')
      return
    }

    setState('success')
  }

  const inputClasses =
    'w-full rounded-lg border border-divider px-4 py-3 text-base text-dark focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors'

  if (state === 'success') {
    return (
      <div className="max-w-[480px] mx-auto px-4 text-center py-10">
        <div className="w-16 h-16 rounded-full bg-orange mx-auto flex items-center justify-center">
          <span className="text-white text-2xl font-bold">✓</span>
        </div>
        <h1 className="text-navy font-bold text-2xl mt-4 mb-2">Thank you, {volunteerName}!</h1>
        <p className="text-mid-gray text-base">
          Your {documentTypeName.toLowerCase()} has been received. A coordinator will review it and be in touch if
          anything is needed.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 space-y-5">
      <div className="text-center mb-2">
        <h1 className="text-navy font-bold text-xl mb-2">Hi {volunteerName},</h1>
        <p className="text-dark text-sm leading-relaxed">
          Please upload your completed {documentTypeName.toLowerCase()} below. We accept PDF or image files (JPG,
          PNG, GIF, WEBP).
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-dark mb-1">Choose file</label>
        {/* Hidden file input — triggered by the button below */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={state === 'uploading'}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={state === 'uploading'}
          className={`${inputClasses} text-left cursor-pointer disabled:opacity-50`}
        >
          {selectedFile ? selectedFile.name : 'Choose File'}
        </button>
      </div>

      {state === 'uploading' && (
        <div>
          <div className="w-full bg-divider rounded-full h-2 overflow-hidden">
            <div className="bg-orange h-2 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-mid-gray mt-1 text-center">Uploading… {progress}%</p>
        </div>
      )}

      {errorMessage && (
        <div>
          <p className="text-sm text-orange">{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              setState('idle')
              setErrorMessage(null)
              setSelectedFile(null)
            }}
            className="mt-2 text-sm font-semibold text-navy hover:underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={state === 'uploading' || !selectedFile}
        className="w-full py-3 bg-orange text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 cursor-pointer"
      >
        {state === 'uploading' ? 'Uploading…' : 'Upload Form'}
      </button>
    </div>
  )
}
