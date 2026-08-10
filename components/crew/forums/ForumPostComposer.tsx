'use client'

// XHR used instead of fetch() — fetch() does not support upload progress events.
// xhr.upload.onprogress is the only browser-native way to report upload progress.

import { useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { X, Paperclip } from 'lucide-react'
import { getPostAttachmentUploadUrl, createForumPost } from '@/lib/actions/forum-posts'

type AttachmentInfo = {
  path: string
  originalFilename: string
  mimeType: string
  fileSizeBytes: number
}

type PendingFile = {
  file: File
  tempKey: string
  attachmentInfo: AttachmentInfo | null
  progress: number
  status: 'queued' | 'uploading' | 'done' | 'error'
  errorMessage: string | null
}

// Matches the Supabase Storage signed-upload-URL contract for a File/Blob
// body: a FormData payload with a cacheControl field and the file appended
// under an empty field name — not a raw file body with a Content-Type
// header. Same pattern as InventoryPhotoUploader.tsx (6th sanctioned XHR file).
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

export default function ForumPostComposer({ threadId }: { threadId: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: '',
    immediatelyRender: false, // required for Next.js App Router to prevent hydration mismatch
  })

  function handleSetLink() {
    const previousUrl = editor?.getAttributes('link').href ?? ''
    const url = window.prompt('Enter URL:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor?.chain().focus().unsetLink().run()
      return
    }
    editor?.chain().focus().setLink({ href: url }).run()
  }

  async function uploadOne(tempKey: string, file: File) {
    setPendingFiles((prev) => prev.map((f) => (f.tempKey === tempKey ? { ...f, status: 'uploading' } : f)))

    const urlResult = await getPostAttachmentUploadUrl(tempKey, file.name, file.type)
    if (!urlResult) {
      setPendingFiles((prev) =>
        prev.map((f) =>
          f.tempKey === tempKey ? { ...f, status: 'error', errorMessage: 'Upload URL failed. Please try again.' } : f
        )
      )
      return
    }

    try {
      await uploadWithProgress(urlResult.signedUrl, file, (percent) => {
        setPendingFiles((prev) => prev.map((f) => (f.tempKey === tempKey ? { ...f, progress: percent } : f)))
      })
    } catch {
      setPendingFiles((prev) =>
        prev.map((f) => (f.tempKey === tempKey ? { ...f, status: 'error', errorMessage: 'Upload failed.' } : f))
      )
      return
    }

    setPendingFiles((prev) =>
      prev.map((f) =>
        f.tempKey === tempKey
          ? {
              ...f,
              status: 'done',
              progress: 100,
              attachmentInfo: {
                path: urlResult.path,
                originalFilename: file.name,
                mimeType: file.type,
                fileSizeBytes: file.size,
              },
            }
          : f
      )
    )
  }

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (selected.length === 0) return

    const newEntries: PendingFile[] = selected.map((file) => ({
      file,
      tempKey: crypto.randomUUID(),
      attachmentInfo: null,
      progress: 0,
      status: 'queued',
      errorMessage: null,
    }))
    setPendingFiles((prev) => [...prev, ...newEntries])

    // Sequential, not concurrent — matches InventoryPhotoUploader.tsx, avoids
    // overloading progress-tracking state with interleaved updates.
    for (const entry of newEntries) {
      await uploadOne(entry.tempKey, entry.file)
    }
  }

  function handleRemoveFile(tempKey: string) {
    setPendingFiles((prev) => prev.filter((f) => f.tempKey !== tempKey))
  }

  async function handleSubmit() {
    if (!editor || editor.getText().trim().length === 0) {
      setSubmitError('Post body cannot be empty.')
      return
    }
    if (pendingFiles.some((f) => f.status === 'uploading' || f.status === 'queued')) {
      setSubmitError('Please wait for uploads to finish.')
      return
    }

    const attachments = pendingFiles
      .filter((f): f is PendingFile & { attachmentInfo: AttachmentInfo } => f.status === 'done' && f.attachmentInfo !== null)
      .map((f) => f.attachmentInfo)

    setSubmitError(null)
    setIsSubmitting(true)
    const result = await createForumPost(threadId, editor.getHTML(), attachments)
    setIsSubmitting(false)

    if ('error' in result) {
      setSubmitError(result.error)
      return
    }

    editor.commands.clearContent()
    setPendingFiles([])
    setSubmitError(null)
    router.refresh()
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-bold text-dark dark:text-dark-text">Post a Reply</h3>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-divider dark:border-dark-border bg-gray-50 dark:bg-dark-surface/50 rounded-t-md">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-xs rounded font-bold ${
            editor?.isActive('bold')
              ? 'bg-brand-primary text-white'
              : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-xs rounded italic ${
            editor?.isActive('italic')
              ? 'bg-brand-primary text-white'
              : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 text-xs rounded underline ${
            editor?.isActive('underline')
              ? 'bg-brand-primary text-white'
              : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
          }`}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 text-xs rounded font-bold ${
            editor?.isActive('heading', { level: 1 })
              ? 'bg-brand-primary text-white'
              : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-xs rounded font-semibold ${
            editor?.isActive('heading', { level: 2 })
              ? 'bg-brand-primary text-white'
              : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 text-xs rounded font-semibold ${
            editor?.isActive('heading', { level: 3 })
              ? 'bg-brand-primary text-white'
              : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-xs rounded ${
            editor?.isActive('bulletList')
              ? 'bg-brand-primary text-white'
              : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 text-xs rounded ${
            editor?.isActive('orderedList')
              ? 'bg-brand-primary text-white'
              : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
          }`}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 text-xs rounded ${
            editor?.isActive('blockquote')
              ? 'bg-brand-primary text-white'
              : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
          }`}
        >
          &ldquo; Quote
        </button>
        <button
          type="button"
          onClick={handleSetLink}
          className={`px-2 py-1 text-xs rounded ${
            editor?.isActive('link')
              ? 'bg-brand-primary text-white'
              : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
          }`}
          title="Insert or edit link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 text-xs rounded text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border"
          title="Insert horizontal rule"
        >
          —
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[120px] px-3 py-2 text-sm
          text-dark dark:text-dark-text
          bg-white dark:bg-dark-surface
          rounded-b-md border-x border-b
          border-divider dark:border-dark-border
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:min-h-[100px]
          [&_.ProseMirror_p]:mb-3
          [&_.ProseMirror_ul]:list-disc
          [&_.ProseMirror_ul]:pl-5
          [&_.ProseMirror_ol]:list-decimal
          [&_.ProseMirror_ol]:pl-5
          [&_.ProseMirror_blockquote]:border-l-4
          [&_.ProseMirror_blockquote]:border-divider
          [&_.ProseMirror_blockquote]:pl-3
          [&_.ProseMirror_strong]:font-bold
          [&_.ProseMirror_em]:italic"
      />

      {/* Attachments */}
      <div className="space-y-2">
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border cursor-pointer"
        >
          <Paperclip size={13} />
          Attach files
        </button>

        {pendingFiles.length > 0 && (
          <div className="space-y-2">
            {pendingFiles.map((f) => (
              <div key={f.tempKey} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-dark dark:text-dark-text truncate">{f.file.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {f.status === 'done' && <span className="text-green-600 dark:text-green-400">✓</span>}
                    {f.status === 'error' && (
                      <span className="text-brand-accent text-xs">{f.errorMessage ?? 'Error'}</span>
                    )}
                    {f.status === 'uploading' && (
                      <span className="text-mid-gray dark:text-dark-muted text-xs">{f.progress}%</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(f.tempKey)}
                      aria-label={`Remove ${f.file.name}`}
                      className="text-mid-gray hover:text-brand-accent cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                {f.status === 'uploading' && (
                  <div className="w-full bg-divider dark:bg-dark-border rounded-full h-1.5 overflow-hidden mt-1">
                    <div className="bg-brand-accent h-1.5 transition-all" style={{ width: `${f.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {submitError && <p className="text-sm text-brand-accent">{submitError}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || pendingFiles.some((f) => f.status === 'uploading' || f.status === 'queued')}
        className="px-5 py-2 bg-brand-primary text-white rounded text-sm font-semibold disabled:opacity-50 hover:bg-brand-primary-mid cursor-pointer"
      >
        {isSubmitting ? 'Posting…' : 'Post Reply'}
      </button>
    </div>
  )
}
