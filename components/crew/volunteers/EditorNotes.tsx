'use client'

import { useState } from 'react'
import { formatCT } from '@/lib/utils/date'
import { addNote, editNote, deleteNote } from '@/lib/actions/volunteers'

type Note = {
  id: string
  body: string
  created_at: string
  admin_users: { name: string } | null
}

function reload() {
  window.location.href = window.location.pathname
}

function NoteItem({ note, isSuperAdmin }: { note: Note; isSuperAdmin: boolean }) {
  const [mode, setMode] = useState<'view' | 'edit' | 'delete-confirm'>('view')
  const [draftBody, setDraftBody] = useState(note.body)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)
    const result = await editNote(note.id, draftBody)
    if ('success' in result) {
      reload()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
  }

  function handleCancelEdit() {
    setDraftBody(note.body)
    setMode('view')
    setError(null)
  }

  async function handleConfirmDelete() {
    setIsSubmitting(true)
    const result = await deleteNote(note.id)
    if ('success' in result) {
      reload()
      return
    }
    setIsSubmitting(false)
    setError(result.error)
    setMode('view')
  }

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-dark dark:text-dark-text text-sm">
            {note.admin_users?.name ?? 'Unknown'}
          </span>
          <span className="text-xs text-mid-gray dark:text-dark-muted">
            {formatCT(note.created_at, 'MMM d, yyyy h:mm a')}
          </span>
        </div>

        {isSuperAdmin && mode === 'view' && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className="text-mid-gray dark:text-dark-muted hover:text-navy text-xs cursor-pointer transition-colors"
            >
              ✏ Edit
            </button>
            <button
              type="button"
              onClick={() => setMode('delete-confirm')}
              className="text-mid-gray dark:text-dark-muted hover:text-orange text-xs cursor-pointer transition-colors"
            >
              🗑 Delete
            </button>
          </div>
        )}

        {isSuperAdmin && mode === 'delete-confirm' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark dark:text-dark-text">Delete this note?</span>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="text-xs bg-orange text-white px-2 py-0.5 rounded hover:bg-orange/90 cursor-pointer disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setMode('view')}
              disabled={isSubmitting}
              className="text-xs border border-divider dark:border-dark-border text-dark dark:text-dark-text px-2 py-0.5 rounded hover:bg-light-navy dark:hover:bg-dark-surface/50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {mode === 'edit' ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-divider dark:border-dark-border px-3 py-2 text-sm text-dark dark:text-dark-text resize-y focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors"
          />
          {error && <p className="text-xs text-orange">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || !draftBody.trim()}
              className="text-xs bg-orange text-white px-2 py-0.5 rounded hover:bg-orange/90 cursor-pointer disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSubmitting}
              className="text-xs border border-divider dark:border-dark-border text-dark dark:text-dark-text px-2 py-0.5 rounded hover:bg-light-navy dark:hover:bg-dark-surface/50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-dark dark:text-dark-text text-sm mt-1 whitespace-pre-wrap">{note.body}</p>
      )}

      {mode === 'delete-confirm' && error && <p className="text-xs text-orange mt-1">{error}</p>}
    </div>
  )
}

export default function EditorNotes({
  volunteerId,
  notes,
  isSuperAdmin,
}: {
  volunteerId: string
  notes: Note[]
  isSuperAdmin: boolean
}) {
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const trimmed = body.trim()
    if (!trimmed) return

    setIsSubmitting(true)
    setError(null)

    const result = await addNote(volunteerId, trimmed)

    if ('success' in result) {
      setBody('')
      reload()
      return
    }

    setError(result.error)
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6">
      <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-4">Editor Notes</h2>

      {notes.length === 0 ? (
        <p className="text-mid-gray dark:text-dark-muted text-sm mb-4">No notes yet.</p>
      ) : (
        <div className="divide-y divide-divider dark:divide-dark-border mb-6">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} isSuperAdmin={isSuperAdmin} />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note about this volunteer..."
          rows={3}
          className="w-full rounded-lg border border-divider px-3 py-2 text-sm text-dark resize-y focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors"
        />
        {error && <p className="text-sm text-orange">{error}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !body.trim()}
          className="bg-orange text-white font-bold px-5 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          Add Note
        </button>
      </div>
    </div>
  )
}
