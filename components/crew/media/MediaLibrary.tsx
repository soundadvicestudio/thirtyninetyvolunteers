'use client'

import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Link2, FolderPlus, Pencil, Copy, Check, QrCode, Trash2, X } from 'lucide-react'
import { formatCT } from '@/lib/utils/date'
import {
  getMediaUploadUrl,
  confirmMediaUpload,
  addMediaLink,
  updateDocument,
  deleteDocument,
  createFolder,
  updateFolder,
  deleteFolder,
} from '@/lib/actions/media'
import { HelpTooltip } from '@/components/crew/HelpTooltip'
import type { AdminRole } from '@/types/admin'

type AccessTier = 'public' | 'link_only' | 'backend'
type FolderVisibility = AccessTier | 'restricted'
type AccessGrantRow = { id: string; access_type: 'role' | 'user'; role: string | null; admin_user_id: string | null }

export type MediaFolder = {
  id: string
  name: string
  description: string | null
  visibility: FolderVisibility
  sort_order: number
  media_folder_access: AccessGrantRow[]
}

export type MediaDocument = {
  id: string
  access_token: string
  title: string
  description: string | null
  document_type_id: string | null
  folder_id: string | null
  entry_type: 'file' | 'link'
  external_url: string | null
  mime_type: string | null
  access_tier: AccessTier
  attached_to_type: string | null
  created_at: string
  document_types: { name: string } | null
  document_access: AccessGrantRow[]
  qrSvg: string
  qrPngBase64: string
  attachedName?: string
  uploaderName: string | null
}

export type MediaDocumentType = { id: string; name: string }

const TIER_LABELS: Record<AccessTier, string> = {
  public: 'Public',
  link_only: 'Link Only',
  backend: 'Backend',
}

const TIER_BADGE_CLASSES: Record<AccessTier, string> = {
  public: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  link_only: 'bg-[#729ABF]/20 text-[#729ABF] dark:bg-[#729ABF]/20 dark:text-[#729ABF]',
  backend: 'bg-mid-gray/20 text-mid-gray dark:bg-dark-bg dark:text-dark-muted',
}

function hasAccessGrantMatch(grants: AccessGrantRow[], role: AdminRole, adminId: string): boolean {
  return grants.some(
    (g) => (g.access_type === 'role' && g.role === role) || (g.access_type === 'user' && g.admin_user_id === adminId)
  )
}

// Duplicated from app/documents/[token]/route.ts (not imported — this is a
// Client Component; the route handler is server-only). Same logic again in
// app/documents/view/[token]/page.tsx.
function detectLinkType(url: string): 'youtube' | 'vimeo' | 'audio' | 'other' {
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) return 'youtube'
  if (/vimeo\.com\/\d+/.test(url)) return 'vimeo'
  if (/\.(mp3|wav|ogg|m4a|flac|aac)(\?|$)/i.test(url)) return 'audio'
  return 'other'
}

function isPlayable(doc: MediaDocument): boolean {
  if (doc.entry_type === 'file') {
    if (!doc.mime_type) return false
    return (
      doc.mime_type.startsWith('video/') ||
      doc.mime_type.startsWith('audio/') ||
      doc.mime_type.startsWith('image/') ||
      doc.mime_type === 'application/pdf'
    )
  }
  if (doc.entry_type === 'link' && doc.external_url) {
    return detectLinkType(doc.external_url) !== 'other'
  }
  return false
}

function getPlayLabel(doc: MediaDocument): string {
  if (doc.entry_type === 'file') {
    if (doc.mime_type?.startsWith('video/')) return '▶ Play'
    if (doc.mime_type?.startsWith('audio/')) return '♪ Play'
    if (doc.mime_type?.startsWith('image/')) return 'Preview'
    if (doc.mime_type === 'application/pdf') return 'View PDF'
  }
  if (doc.entry_type === 'link' && doc.external_url) {
    const t = detectLinkType(doc.external_url)
    if (t === 'youtube' || t === 'vimeo') return '▶ Play'
    if (t === 'audio') return '♪ Play'
  }
  return 'View'
}

// XHR (not fetch) is required here specifically for upload progress events
// (xhr.upload.onprogress) — fetch has no equivalent for upload progress.
// Same pattern as components/consent/ConsentUploadForm.tsx.
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

const inputClasses =
  'rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'

function FolderSelect({
  folders,
  value,
  onChange,
}: {
  folders: MediaFolder[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={`${inputClasses} flex-1 min-w-[160px]`}
    >
      <option value="">No folder</option>
      {folders.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  )
}

function AccessTierSelect({ value, onChange }: { value: AccessTier; onChange: (value: AccessTier) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AccessTier)}
      className={`${inputClasses} flex-1 min-w-[140px]`}
    >
      <option value="public">Public</option>
      <option value="link_only">Link Only</option>
      <option value="backend">Backend</option>
    </select>
  )
}

function DocumentTypeSelect({
  documentTypes,
  value,
  onChange,
}: {
  documentTypes: MediaDocumentType[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={`${inputClasses} flex-1 min-w-[160px]`}
    >
      <option value="">No document type</option>
      {documentTypes.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  )
}

function UploadForm({
  folders,
  documentTypes,
  onClose,
}: {
  folders: MediaFolder[]
  documentTypes: MediaDocumentType[]
  onClose: () => void
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [accessTier, setAccessTier] = useState<AccessTier>('backend')
  const [documentTypeId, setDocumentTypeId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [state, setState] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null)
    setError(null)
  }

  async function handleUpload() {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!selectedFile) {
      setError('Please choose a file to upload.')
      return
    }

    setState('uploading')
    setProgress(0)
    setError(null)

    const urlResult = await getMediaUploadUrl(title, selectedFile.name, selectedFile.type, folderId)
    if ('error' in urlResult) {
      setError(urlResult.error)
      setState('error')
      return
    }

    try {
      await uploadWithProgress(urlResult.signedUrl, selectedFile, setProgress)
    } catch (err) {
      console.error('Media upload error:', err)
      setError('Upload failed. Please try again.')
      setState('error')
      return
    }

    const confirmResult = await confirmMediaUpload(
      urlResult.path,
      selectedFile.type,
      selectedFile.size,
      selectedFile.name,
      title,
      folderId,
      accessTier,
      documentTypeId,
      description || null
    )

    if (!confirmResult.success) {
      setError(confirmResult.error ?? 'Something went wrong. Please try again.')
      setState('error')
      return
    }

    router.refresh()
    onClose()
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-4">
      <h3 className="text-sm font-bold text-brand-primary dark:text-brand-primary-mid uppercase tracking-wide mb-3">Upload File</h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={state === 'uploading'}
          className={`${inputClasses} w-full`}
        />
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            disabled={state === 'uploading'}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={state === 'uploading'}
            className={`${inputClasses} w-full text-left cursor-pointer disabled:opacity-50`}
          >
            {selectedFile ? selectedFile.name : 'Choose File'}
          </button>
        </div>
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={state === 'uploading'}
          rows={2}
          className={`${inputClasses} w-full`}
        />
        <div className="flex flex-wrap gap-3">
          <FolderSelect folders={folders} value={folderId} onChange={setFolderId} />
          <AccessTierSelect value={accessTier} onChange={setAccessTier} />
          <DocumentTypeSelect documentTypes={documentTypes} value={documentTypeId} onChange={setDocumentTypeId} />
        </div>

        {state === 'uploading' && (
          <div>
            <div className="w-full bg-divider dark:bg-dark-bg rounded-full h-2 overflow-hidden">
              <div className="bg-brand-accent h-2 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">Uploading… {progress}%</p>
          </div>
        )}

        {error && <p className="text-sm text-brand-accent">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleUpload}
            disabled={state === 'uploading'}
            className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            {state === 'uploading' ? 'Uploading…' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={state === 'uploading'}
            className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function LinkForm({
  folders,
  documentTypes,
  onClose,
}: {
  folders: MediaFolder[]
  documentTypes: MediaDocumentType[]
  onClose: () => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [accessTier, setAccessTier] = useState<AccessTier>('backend')
  const [documentTypeId, setDocumentTypeId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    setIsSubmitting(true)
    const result = await addMediaLink(title, url, folderId, accessTier, documentTypeId, description || null)
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-4">
      <h3 className="text-sm font-bold text-brand-primary dark:text-brand-primary-mid uppercase tracking-wide mb-3">Add Link</h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          className={`${inputClasses} w-full`}
        />
        <input
          type="text"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isSubmitting}
          className={`${inputClasses} w-full`}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          rows={2}
          className={`${inputClasses} w-full`}
        />
        <div className="flex flex-wrap gap-3">
          <FolderSelect folders={folders} value={folderId} onChange={setFolderId} />
          <AccessTierSelect value={accessTier} onChange={setAccessTier} />
          <DocumentTypeSelect documentTypes={documentTypes} value={documentTypeId} onChange={setDocumentTypeId} />
        </div>

        {error && <p className="text-sm text-brand-accent">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Adding…' : 'Add Link'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function NewFolderForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<FolderVisibility>('backend')
  const [accessNote, setAccessNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setError(null)
    setIsSubmitting(true)
    const result = await createFolder({ name, description: description || undefined, visibility })
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 mb-4">
      <h3 className="text-sm font-bold text-brand-primary dark:text-brand-primary-mid uppercase tracking-wide mb-3">New Folder</h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          className={`${inputClasses} w-full`}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          rows={2}
          className={`${inputClasses} w-full`}
        />
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as FolderVisibility)}
          disabled={isSubmitting}
          className={`${inputClasses} w-full`}
        >
          <option value="public">Public</option>
          <option value="link_only">Link Only</option>
          <option value="backend">Backend</option>
          <option value="restricted">Restricted</option>
        </select>

        {visibility === 'restricted' && (
          <div className="rounded-lg border border-divider dark:border-dark-border p-3 bg-gray-50/30 dark:bg-dark-bg/40">
            <p className="text-xs text-mid-gray dark:text-dark-muted mb-2">
              Full role/user access controls for restricted folders are coming in a future update. For now, use this
              note to record who should have access and coordinate manually with your team — it is not saved
              automatically.
            </p>
            <textarea
              placeholder="e.g. Editors and Jane Smith"
              value={accessNote}
              onChange={(e) => setAccessNote(e.target.value)}
              disabled={isSubmitting}
              rows={2}
              className={`${inputClasses} w-full`}
            />
          </div>
        )}

        {error && <p className="text-sm text-brand-accent">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Creating…' : 'Create Folder'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function FolderEditForm({
  folder,
  canDelete,
  onClose,
  onDelete,
}: {
  folder: MediaFolder
  canDelete: boolean
  onClose: () => void
  onDelete: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState(folder.name)
  const [description, setDescription] = useState(folder.description ?? '')
  const [visibility, setVisibility] = useState<FolderVisibility>(folder.visibility)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await updateFolder(folder.id, { name, description, visibility })
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4 mb-4 flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isSubmitting}
        className={`${inputClasses} flex-1 min-w-[140px]`}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isSubmitting}
        className={`${inputClasses} flex-1 min-w-[160px]`}
      />
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value as FolderVisibility)}
        disabled={isSubmitting}
        className={inputClasses}
      >
        <option value="public">Public</option>
        <option value="link_only">Link Only</option>
        <option value="backend">Backend</option>
        <option value="restricted">Restricted</option>
      </select>
      {error && <p className="text-sm text-brand-accent w-full">{error}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSubmitting}
        className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
      >
        Cancel
      </button>
      {canDelete &&
        (confirmingDelete ? (
          <span className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-dark dark:text-dark-text">Delete this folder?</span>
            <button
              type="button"
              onClick={onDelete}
              className="text-xs font-semibold text-white bg-brand-accent hover:bg-opacity-90 transition-colors rounded px-2 py-1 cursor-pointer"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-xs font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="ml-auto p-1.5 rounded text-brand-accent hover:bg-brand-accent-light cursor-pointer dark:hover:bg-dark-surface/50"
            aria-label={`Delete ${folder.name}`}
          >
            <Trash2 size={16} />
          </button>
        ))}
    </div>
  )
}

function DocumentEditForm({
  doc,
  folders,
  onClose,
}: {
  doc: MediaDocument
  folders: MediaFolder[]
  onClose: () => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState(doc.title)
  const [description, setDescription] = useState(doc.description ?? '')
  const [accessTier, setAccessTier] = useState<AccessTier>(doc.access_tier)
  const [folderId, setFolderId] = useState<string | null>(doc.folder_id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await updateDocument(doc.id, {
      title,
      description,
      access_tier: accessTier,
      folder_id: folderId,
    })
    setIsSubmitting(false)
    if (!result.success) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <tr>
      <td colSpan={6} className="px-4 py-3 bg-gray-50/30 dark:bg-dark-bg/40">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className={`${inputClasses} flex-1 min-w-[140px]`}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className={`${inputClasses} flex-1 min-w-[160px]`}
          />
          <AccessTierSelect value={accessTier} onChange={setAccessTier} />
          <FolderSelect folders={folders} value={folderId} onChange={setFolderId} />
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-sm font-semibold text-dark dark:text-dark-text hover:underline cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-sm text-brand-accent mt-2">{error}</p>}
      </td>
    </tr>
  )
}

function QrModal({ doc, onClose }: { doc: MediaDocument; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const distributionUrl = `${siteUrl}/documents/${doc.access_token}`
  const slug = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  async function handleCopy() {
    await navigator.clipboard.writeText(distributionUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      onClick={onClose}
      aria-hidden="true"
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 max-w-sm w-full"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-dark dark:text-dark-text">{doc.title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded text-dark hover:bg-gray-100 cursor-pointer dark:text-dark-text dark:hover:bg-dark-surface/50 shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div
          className="w-[200px] h-[200px] mx-auto [&>svg]:w-full [&>svg]:h-full bg-white p-2 rounded-lg border border-divider dark:border-dark-border"
          dangerouslySetInnerHTML={{ __html: doc.qrSvg }}
        />
        <div className="flex gap-4 mt-3 justify-center">
          <a
            href={`data:image/png;base64,${doc.qrPngBase64}`}
            download={`${slug}-qr.png`}
            className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
          >
            Download PNG
          </a>
          <a
            href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(doc.qrSvg)}`}
            download={`${slug}-qr.svg`}
            className="text-sm font-semibold text-brand-primary dark:text-brand-primary-mid hover:underline"
          >
            Download SVG
          </a>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={distributionUrl}
            className={`${inputClasses} flex-1 text-xs`}
          />
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy link"
            className="p-2 rounded text-brand-primary hover:bg-gray-100 cursor-pointer dark:text-brand-primary-mid dark:hover:bg-dark-surface/50 shrink-0"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function MediaLibrary({
  folders,
  documents,
  adminRole,
  adminId,
  documentTypes,
}: {
  folders: MediaFolder[]
  documents: MediaDocument[]
  adminRole: AdminRole
  adminId: string
  documentTypes: MediaDocumentType[]
}) {
  const router = useRouter()
  const canManage = adminRole === 'super_admin' || adminRole === 'owner_admin' || adminRole === 'editor'
  const canDelete = adminRole === 'super_admin' || adminRole === 'owner_admin'

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [showNewFolderForm, setShowNewFolderForm] = useState(false)
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null)
  const [qrDocumentId, setQrDocumentId] = useState<string | null>(null)
  const [copiedDocumentId, setCopiedDocumentId] = useState<string | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)

  const visibleFolders = useMemo(
    () => folders.filter((f) => f.visibility !== 'restricted' || hasAccessGrantMatch(f.media_folder_access, adminRole, adminId)),
    [folders, adminRole, adminId]
  )

  const visibleFolderIds = useMemo(() => new Set(visibleFolders.map((f) => f.id)), [visibleFolders])

  const visibleDocuments = useMemo(
    () =>
      documents.filter((d) => {
        if (d.document_access.length > 0) {
          return hasAccessGrantMatch(d.document_access, adminRole, adminId)
        }
        if (!d.folder_id) return true
        return visibleFolderIds.has(d.folder_id)
      }),
    [documents, visibleFolderIds, adminRole, adminId]
  )

  const filteredDocuments = useMemo(() => {
    if (!selectedFolderId) return visibleDocuments
    return visibleDocuments.filter((d) => d.folder_id === selectedFolderId)
  }, [visibleDocuments, selectedFolderId])

  const folderDocCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of visibleDocuments) {
      if (d.folder_id) counts[d.folder_id] = (counts[d.folder_id] ?? 0) + 1
    }
    return counts
  }, [visibleDocuments])

  const qrDocument = qrDocumentId ? (documents.find((d) => d.id === qrDocumentId) ?? null) : null

  async function handleCopyLink(doc: MediaDocument) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    await navigator.clipboard.writeText(`${siteUrl}/documents/${doc.access_token}`)
    setCopiedDocumentId(doc.id)
    setTimeout(() => setCopiedDocumentId(null), 2000)
  }

  async function handleDelete(id: string) {
    setRowError(null)
    const result = await deleteDocument(id)
    setConfirmingDeleteId(null)
    if (!result.success) {
      setRowError(result.error ?? 'Something went wrong deleting this document.')
      return
    }
    router.refresh()
  }

  async function handleDeleteFolder(id: string) {
    setRowError(null)
    const result = await deleteFolder(id)
    if (!result.success) {
      setRowError(
        result.error === 'folder_has_documents'
          ? 'This folder still has documents in it. Move or delete them first.'
          : (result.error ?? 'Something went wrong deleting this folder.')
      )
      return
    }
    if (selectedFolderId === id) setSelectedFolderId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Media Library</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setShowUploadForm((v) => !v)
              setShowLinkForm(false)
              setShowNewFolderForm(false)
            }}
            className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            <Upload size={16} />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLinkForm((v) => !v)
              setShowUploadForm(false)
              setShowNewFolderForm(false)
            }}
            className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-primary-mid transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            <Link2 size={16} />
            Add Link
          </button>
          {canManage && (
            <button
              type="button"
              onClick={() => {
                setShowNewFolderForm((v) => !v)
                setShowUploadForm(false)
                setShowLinkForm(false)
              }}
              className="flex items-center gap-2 border border-brand-primary text-brand-primary dark:border-brand-primary-mid dark:text-brand-primary-mid hover:bg-white dark:hover:bg-dark-surface/50 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
            >
              <FolderPlus size={16} />
              New Folder
            </button>
          )}
        </div>
      </div>

      {showUploadForm && (
        <UploadForm folders={visibleFolders} documentTypes={documentTypes} onClose={() => setShowUploadForm(false)} />
      )}
      {showLinkForm && (
        <LinkForm folders={visibleFolders} documentTypes={documentTypes} onClose={() => setShowLinkForm(false)} />
      )}
      {showNewFolderForm && <NewFolderForm onClose={() => setShowNewFolderForm(false)} />}

      <div className="flex items-center gap-2 flex-wrap overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedFolderId(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
            selectedFolderId === null
              ? 'bg-brand-primary text-white'
              : 'bg-white/50 text-dark hover:bg-gray-100 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surface/70'
          }`}
        >
          All Files ({visibleDocuments.length})
        </button>
        {visibleFolders.map((folder) => (
          <div key={folder.id} className="group flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedFolderId(folder.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                selectedFolderId === folder.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-white/50 text-dark hover:bg-gray-100 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surface/70'
              }`}
            >
              {folder.name} ({folderDocCounts[folder.id] ?? 0})
            </button>
            {canManage && (
              <button
                type="button"
                onClick={() => setEditingFolderId(folder.id)}
                aria-label={`Edit ${folder.name}`}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-mid-gray hover:bg-white cursor-pointer dark:text-dark-muted dark:hover:bg-dark-surface/50 transition-opacity"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
        ))}
        {visibleFolders.length === 0 && (
          <span className="text-sm text-mid-gray dark:text-dark-muted whitespace-nowrap">
            No folders yet. Create a folder to organize your media.
          </span>
        )}
      </div>

      {editingFolderId &&
        (() => {
          const folder = folders.find((f) => f.id === editingFolderId)
          if (!folder) return null
          return (
            <FolderEditForm
              folder={folder}
              canDelete={canDelete}
              onClose={() => setEditingFolderId(null)}
              onDelete={() => {
                handleDeleteFolder(folder.id)
                setEditingFolderId(null)
              }}
            />
          )
        })()}

      {rowError && <p className="text-sm text-brand-accent">{rowError}</p>}

      <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-x-auto">
        {filteredDocuments.length === 0 ? (
          <p className="text-mid-gray dark:text-dark-muted text-sm p-6">No documents here yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider dark:border-dark-border text-left">
                <th className="px-4 py-2 font-semibold text-dark dark:text-dark-text">Title</th>
                <th className="px-4 py-2 font-semibold text-dark dark:text-dark-text">Type</th>
                <th className="px-4 py-2 font-semibold text-dark dark:text-dark-text">Entry</th>
                <th className="px-4 py-2 font-semibold text-dark dark:text-dark-text whitespace-nowrap">
                  Tier <HelpTooltip anchor="media-library-access" label="Sharing and Access" />
                </th>
                <th className="px-4 py-2 font-semibold text-dark dark:text-dark-text">Uploaded</th>
                <th className="px-4 py-2 font-semibold text-dark dark:text-dark-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) =>
                editingDocumentId === doc.id ? (
                  <DocumentEditForm
                    key={doc.id}
                    doc={doc}
                    folders={visibleFolders}
                    onClose={() => setEditingDocumentId(null)}
                  />
                ) : (
                  <tr key={doc.id} className="border-b border-divider dark:border-dark-border last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-dark dark:text-dark-text">{doc.title}</div>
                      {doc.attachedName && (
                        <div className="text-xs text-mid-gray dark:text-dark-muted mt-0.5">
                          {doc.attached_to_type === 'show' ? 'Show' : 'Rehearsal'}: {doc.attachedName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-dark dark:text-dark-text">{doc.document_types?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-[#729ABF]/20 text-[#729ABF]">
                        {doc.entry_type === 'file' ? 'File' : 'Link'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${TIER_BADGE_CLASSES[doc.access_tier]}`}>
                        {TIER_LABELS[doc.access_tier]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-dark dark:text-dark-text whitespace-nowrap">
                      {formatCT(doc.created_at, 'MMM d, yyyy')}
                      {doc.uploaderName && (
                        <span className="text-mid-gray dark:text-dark-muted"> · {doc.uploaderName}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isPlayable(doc) && (
                          <a
                            href={`/documents/${doc.access_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold px-2 py-1 rounded bg-brand-primary text-white hover:opacity-80 transition-opacity whitespace-nowrap"
                          >
                            {getPlayLabel(doc)}
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(doc)}
                          aria-label="Copy link"
                          className="p-1.5 rounded text-brand-primary hover:bg-gray-100 cursor-pointer dark:text-brand-primary-mid dark:hover:bg-dark-surface/50"
                        >
                          {copiedDocumentId === doc.id ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrDocumentId(doc.id)}
                          aria-label="Show QR code"
                          className="p-1.5 rounded text-brand-primary hover:bg-gray-100 cursor-pointer dark:text-brand-primary-mid dark:hover:bg-dark-surface/50"
                        >
                          <QrCode size={16} />
                        </button>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => setEditingDocumentId(doc.id)}
                            aria-label={`Edit ${doc.title}`}
                            className="p-1.5 rounded text-brand-primary hover:bg-gray-100 cursor-pointer dark:text-brand-primary-mid dark:hover:bg-dark-surface/50"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        {canDelete &&
                          (confirmingDeleteId === doc.id ? (
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleDelete(doc.id)}
                                className="text-xs font-semibold text-white bg-brand-accent hover:bg-opacity-90 transition-colors rounded px-2 py-1 cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingDeleteId(null)}
                                className="text-xs font-semibold text-mid-gray dark:text-dark-muted hover:underline cursor-pointer"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmingDeleteId(doc.id)}
                              aria-label={`Delete ${doc.title}`}
                              className="p-1.5 rounded text-brand-accent hover:bg-brand-accent-light cursor-pointer dark:hover:bg-dark-surface/50"
                            >
                              <Trash2 size={16} />
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {qrDocument && <QrModal doc={qrDocument} onClose={() => setQrDocumentId(null)} />}
    </div>
  )
}
