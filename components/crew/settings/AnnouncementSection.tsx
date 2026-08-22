'use client'

import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { saveAnnouncement } from '@/lib/actions/setup'
import { getAnnouncementContent } from '@/lib/actions/announcements'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const cardClasses = 'border border-divider dark:border-dark-border rounded-lg overflow-hidden'
const headingClasses = 'text-lg font-semibold text-dark dark:text-dark-text'
const descriptionClasses = 'text-sm text-mid-gray dark:text-dark-muted mb-4'
const labelClasses = 'block text-sm font-medium text-dark dark:text-dark-text mb-1'
const saveButtonClasses =
  'bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-primary-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'owner_admin', label: 'Owner Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'production', label: 'Production' },
]

function SaveFeedback({ status, errorMessage }: { status: SaveStatus; errorMessage: string }) {
  if (status === 'saved') return <span className="text-sm text-green-600">✓ Saved</span>
  if (status === 'error') return <span className="text-sm text-red-600">{errorMessage}</span>
  return null
}

export default function AnnouncementSection() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
    ],
    content: '',
    immediatelyRender: false, // required for Next.js App Router to prevent hydration mismatch
  })

  // Self-loading — fetch current announcement content once the editor
  // instance exists, then sync into the editor + role state inside this
  // same effect. Do NOT split this into a second effect keyed on the
  // fetched data — that pattern trips the react-hooks/set-state-in-effect
  // rule (confirmed cascading-render anti-pattern, AUDITIONS.2c F7).
  useEffect(() => {
    if (!editor) return
    getAnnouncementContent().then((data) => {
      editor.commands.setContent(data.body)
      setSelectedRoles(data.roles)
    })
  }, [editor])

  function toggleRole(role: string) {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  function selectAll() {
    setSelectedRoles(ROLE_OPTIONS.map((r) => r.value))
  }

  function clearAll() {
    setSelectedRoles([])
  }

  async function handleSave() {
    if (!editor) return
    setStatus('saving')
    const fd = new FormData()
    fd.append('dashboard_announcement_body', editor.getHTML())
    fd.append('dashboard_announcement_roles', JSON.stringify(selectedRoles))

    const result = await saveAnnouncement(fd)
    if ('error' in result) {
      setStatus('error')
      setErrorMessage(result.error)
      return
    }
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className={cardClasses}>
      <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-6 py-4">
        <h2 className={headingClasses}>Dashboard Announcement</h2>
        <p className={descriptionClasses}>
          Publish an announcement that appears at the top of the Dashboard for the roles you select below.
        </p>
      </div>

      <div className="bg-white dark:bg-dark-surface px-6 py-5 space-y-4">
        <div>
          <label className={labelClasses}>Message</label>
        <div className="flex flex-wrap gap-1 p-2 border-b border-divider dark:border-dark-border bg-gray-50 dark:bg-dark-surface rounded-t-md">
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
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 text-xs rounded font-semibold ${
              editor?.isActive('heading', { level: 2 })
                ? 'bg-brand-primary text-white'
                : 'text-dark dark:text-dark-text hover:bg-divider dark:hover:bg-dark-border'
            }`}
          >
            H2
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
            [&_.ProseMirror]:min-h-[100px]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-dark dark:text-dark-text">Visible to</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
            >
              Clear all
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {ROLE_OPTIONS.map((r) => (
            <label
              key={r.value}
              className="flex items-center gap-1.5 text-sm text-dark dark:text-dark-text cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedRoles.includes(r.value)}
                onChange={() => toggleRole(r.value)}
                className="rounded border-divider dark:border-dark-border text-brand-primary focus:ring-brand-primary cursor-pointer"
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      </div>
      <div className="bg-neutral-surface dark:bg-dark-nav border-t border-neutral-border px-6 py-4 flex items-center justify-end gap-3">
        <SaveFeedback status={status} errorMessage={errorMessage} />
        <button type="button" onClick={handleSave} disabled={status === 'saving'} className={saveButtonClasses}>
          {status === 'saving' ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  )
}
