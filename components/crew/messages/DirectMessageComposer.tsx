// =============================================================================
// 8th sanctioned XHR file — DirectMessageComposer.tsx
// XHR is used for file upload progress tracking. fetch() does not support
// upload progress events. xhr.upload.onprogress is the only browser-native
// way to report real-time upload progress to the user.
// All other HTTP in this project uses fetch().
// =============================================================================

'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useEditor, Editor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapLink from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { Paperclip, X } from 'lucide-react'
import type { AttachmentInput } from '@/types/messages'

// Imperative handle interface — exposed to parents via ref
export interface DirectMessageComposerHandle {
  getBody(): string
  getAttachments(): AttachmentInput[]
  clear(): void
  isEmpty(): boolean
}

interface DirectMessageComposerProps {
  disabled?: boolean
  minHeight?: string
  onEmptyChange?: (isEmpty: boolean) => void
}

const DirectMessageComposer = forwardRef<DirectMessageComposerHandle, DirectMessageComposerProps>(
  function DirectMessageComposer({ disabled = false, minHeight = '100px', onEmptyChange }, ref) {
    // Attachment state stores metadata + temp identifier
    const [attachments, setAttachments] = useState<(AttachmentInput & { _tempPath: string })[]>([])
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // TipTap — explicit Editor | null required (FORUMS.5 Q3 standing rule)
    const editor: Editor | null = useEditor({
      extensions: [
        StarterKit,
        Underline,
        TipTapLink.configure({
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer' },
        }),
      ],
      content: '',
      immediatelyRender: false,
      onCreate: ({ editor }) => {
        onEmptyChange?.(editor.getText().trim().length === 0)
      },
      onUpdate: ({ editor }) => {
        onEmptyChange?.(editor.getText().trim().length === 0)
      },
    })

    // Expose imperative API to parents
    useImperativeHandle(ref, () => ({
      getBody(): string {
        return editor?.getHTML() ?? ''
      },
      getAttachments(): AttachmentInput[] {
        return attachments.map((a) => ({
          tempKey: a.tempKey,
          fileName: a.fileName,
          fileSize: a.fileSize,
          contentType: a.contentType,
        }))
      },
      clear(): void {
        editor?.commands.clearContent()
        setAttachments([])
        setUploadError(null)
      },
      isEmpty(): boolean {
        return !editor || editor.getText().trim().length === 0
      },
    }))

    function handleRemoveAttachment(tempKey: string): void {
      setAttachments((prev) => prev.filter((a) => a.tempKey !== tempKey))
    }

    async function handleFileSelect(file: File): Promise<void> {
      setUploading(true)
      setUploadError(null)

      try {
        // Step 1: Request a signed upload URL from the route handler
        const res = await fetch(
          `/api/messages/upload` +
            `?fileName=${encodeURIComponent(file.name)}` +
            `&contentType=${encodeURIComponent(file.type || 'application/octet-stream')}` +
            `&fileSize=${file.size}`
        )
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? 'Failed to get upload URL')
        }
        const { signedUrl, tempKey } = (await res.json()) as {
          signedUrl: string
          path: string
          tempKey: string
        }

        // Step 2: PUT file directly to Supabase Storage via XHR
        // XHR used instead of fetch() — fetch() does not support upload progress
        // events. xhr.upload.onprogress is the only browser-native way to report
        // upload progress to the user. Body format: FormData with cacheControl
        // and file under empty field name '' (P-DC pattern — Process §7).
        await new Promise<void>((resolve, reject) => {
          const formData = new FormData()
          formData.append('cacheControl', '3600')
          formData.append('', file)

          const xhr = new XMLHttpRequest()
          xhr.open('PUT', signedUrl)
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
          xhr.onerror = () => reject(new Error('Network error during upload'))
          xhr.send(formData)
        })

        // Step 3: Record attachment metadata for submission
        setAttachments((prev) => [
          ...prev,
          {
            tempKey,
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type || 'application/octet-stream',
            _tempPath: tempKey,
          },
        ])
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      } finally {
        setUploading(false)
        // Reset file input so the same file can be re-selected if needed
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }

    return (
      <div>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border border-b-0 border-neutral-border dark:border-dark-border rounded-t-lg bg-neutral-surface dark:bg-dark-nav flex-wrap">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor || disabled}
            className={`px-2 py-1 text-xs rounded font-bold disabled:opacity-50 ${
              editor?.isActive('bold')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor || disabled}
            className={`px-2 py-1 text-xs rounded italic disabled:opacity-50 ${
              editor?.isActive('italic')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            disabled={!editor || disabled}
            className={`px-2 py-1 text-xs rounded underline disabled:opacity-50 ${
              editor?.isActive('underline')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={!editor || disabled}
            className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${
              editor?.isActive('bulletList')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            disabled={!editor || disabled}
            className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${
              editor?.isActive('orderedList')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => {
              const previousUrl = editor?.getAttributes('link').href ?? ''
              const url = window.prompt('URL', previousUrl)
              if (url === null) return
              if (url === '') {
                editor?.chain().focus().unsetLink().run()
                return
              }
              editor?.chain().focus().setLink({ href: url }).run()
            }}
            disabled={!editor || disabled}
            className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${
              editor?.isActive('link')
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border'
            }`}
            title="Insert or edit link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            disabled={!editor || disabled}
            className="px-2 py-1 text-xs rounded disabled:opacity-50 text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border"
            title="Insert horizontal rule"
          >
            —
          </button>

          {/* Attach file button — right-aligned via ml-auto */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading || !editor}
            className={`ml-auto flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
              uploading
                ? 'text-mid-gray dark:text-dark-muted opacity-70'
                : 'text-mid-gray dark:text-dark-muted hover:bg-white dark:hover:bg-dark-border'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Attach file"
          >
            <Paperclip size={13} />
            {uploading ? 'Uploading…' : 'Attach'}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFileSelect(file)
          }}
        />

        {/* Editor */}
        <div className="border border-neutral-border dark:border-dark-border rounded-b-lg bg-white dark:bg-dark-surface">
          <EditorContent
            editor={editor}
            style={{ minHeight }}
            className="text-sm text-dark dark:text-dark-text p-3
              [&_.ProseMirror]:outline-none
              [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-4
              [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-4
              [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_em]:italic"
          />
        </div>

        {/* Upload error */}
        {uploadError && <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">{uploadError}</p>}

        {/* Attachment list */}
        {attachments.length > 0 && (
          <ul className="mt-2 space-y-1">
            {attachments.map((att) => (
              <li
                key={att.tempKey}
                className="flex items-center justify-between gap-2 px-2 py-1 bg-neutral-surface dark:bg-dark-nav rounded text-xs"
              >
                <span className="truncate text-dark dark:text-dark-text">
                  {att.fileName}
                  <span className="text-mid-gray dark:text-dark-muted ml-1.5">
                    ({Math.round(att.fileSize / 1024)}KB)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.tempKey)}
                  className="flex-shrink-0 text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text transition-colors"
                  aria-label={`Remove ${att.fileName}`}
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
)

export default DirectMessageComposer
