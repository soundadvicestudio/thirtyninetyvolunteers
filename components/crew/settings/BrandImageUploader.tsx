'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { getCroppedImg, type CroppedAreaPixels } from '@/lib/utils/image-crop'
import { getSignedBrandUploadUrl, saveLogoUrl, saveFaviconUrl } from '@/lib/actions/setup'

type Mode = 'idle' | 'cropping' | 'uploading' | 'error'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const inputClasses =
  'w-full rounded-md border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-navy'

export default function BrandImageUploader({
  label,
  settingsKey,
  storagePath,
  aspectRatio,
  currentValue,
  onSave,
}: {
  label: string
  settingsKey: 'org_logo_url' | 'favicon_url'
  storagePath: 'logo' | 'favicon'
  aspectRatio: number | undefined
  currentValue: string
  onSave: (url: string) => void
}) {
  const [mode, setMode] = useState<Mode>('idle')
  const [urlInput, setUrlInput] = useState(currentValue)
  const [imageSrc, setImageSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const saveAction = settingsKey === 'org_logo_url' ? saveLogoUrl : saveFaviconUrl
  const previewMaxWidth = storagePath === 'favicon' ? 'max-w-[80px]' : 'max-w-[200px]'

  function handleFileButtonClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImageSrc(URL.createObjectURL(file))
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setMode('cropping')
  }

  function handleCancelCrop() {
    URL.revokeObjectURL(imageSrc)
    setImageSrc('')
    setMode('idle')
  }

  async function handleCropAndUpload() {
    if (!croppedAreaPixels) return
    setMode('uploading')
    setUploadProgress(0)

    let croppedBlob: Blob
    try {
      croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
    } catch {
      setMode('error')
      setErrorMessage('Something went wrong processing the image. Please try again.')
      return
    }

    const result = await getSignedBrandUploadUrl({ filename: 'brand-image.png', type: storagePath })
    if ('error' in result) {
      setMode('error')
      setErrorMessage(result.error)
      return
    }
    const { signedUrl, publicUrl } = result

    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)

    // XHR used instead of fetch() — fetch() does not support upload progress events.
    // xhr.upload.onprogress is the only browser-native way to report upload progress.
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const saveResult = await saveAction({ url: publicUrl })
        if ('error' in saveResult) {
          setMode('error')
          setErrorMessage(saveResult.error)
          return
        }
        URL.revokeObjectURL(imageSrc)
        setUrlInput(publicUrl)
        setMode('idle')
        setSaveStatus('saved')
        onSave(publicUrl)
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setMode('error')
        setErrorMessage(`Upload failed (HTTP ${xhr.status})`)
      }
    }

    xhr.onerror = () => {
      setMode('error')
      setErrorMessage('Upload failed — network error')
    }

    // FormData with a cacheControl field and the file appended under an
    // empty field name matches the Supabase Storage signed-upload-URL
    // contract for a File/Blob body — same pattern as
    // components/crew/media/MediaLibrary.tsx and
    // components/consent/ConsentUploadForm.tsx, the two other sanctioned
    // XHR uses in this project.
    const formData = new FormData()
    formData.append('cacheControl', '3600')
    formData.append('', croppedBlob, 'brand-image.png')
    xhr.send(formData)
  }

  async function handleSaveUrl() {
    setSaveStatus('saving')
    const trimmed = urlInput.trim()
    const result = await saveAction({ url: trimmed })
    if ('error' in result) {
      setSaveStatus('error')
      setErrorMessage(result.error)
      return
    }
    setSaveStatus('saved')
    onSave(trimmed)
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  if (mode === 'error') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600">{errorMessage}</p>
        <button
          type="button"
          onClick={() => setMode('idle')}
          className="bg-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-steel transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (mode === 'uploading') {
    return (
      <div className="space-y-2">
        <div className="w-full h-2 rounded-full bg-light-navy overflow-hidden">
          <div
            className="h-full bg-navy transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className="text-sm text-mid-gray dark:text-dark-muted">Uploading... {uploadProgress}%</p>
      </div>
    )
  }

  if (mode === 'cropping') {
    return (
      <div className="space-y-3">
        <div className="relative min-h-[300px] bg-dark rounded-md overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_: Area, pixels: CroppedAreaPixels) => setCroppedAreaPixels(pixels)}
          />
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCropAndUpload}
            disabled={!croppedAreaPixels}
            className="bg-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-steel transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Crop & Upload
          </button>
          <button
            type="button"
            onClick={handleCancelCrop}
            className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {currentValue && (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary external/storage URL, not a static local asset next/image can optimize
        <img
          src={urlInput || currentValue}
          alt={label}
          className={`${previewMaxWidth} rounded border border-divider dark:border-dark-border`}
        />
      )}
      <div className="flex items-center gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={`https://example.com/${storagePath}.png`}
          className={inputClasses}
        />
        <button
          type="button"
          onClick={handleSaveUrl}
          disabled={saveStatus === 'saving'}
          className="shrink-0 bg-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-steel transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save URL'}
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleFileButtonClick}
          className="border border-navy text-navy px-4 py-2 rounded-md text-sm font-medium hover:bg-light-navy transition-colors cursor-pointer"
        >
          Upload File
        </button>
        {saveStatus === 'saved' && <span className="text-sm text-green-600">✓ Saved</span>}
      </div>
      {saveStatus === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
