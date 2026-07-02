'use client'

import { useState } from 'react'
import { formatCT } from '@/lib/utils/date'
import { addNote } from '@/lib/actions/volunteers'

type Note = {
  id: string
  body: string
  created_at: string
  admin_users: { name: string } | null
}

export default function EditorNotes({
  volunteerId,
  notes,
}: {
  volunteerId: string
  notes: Note[]
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
      window.location.href = window.location.pathname
      return
    }

    setError(result.error)
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white border border-divider rounded-lg p-6">
      <h2 className="text-lg font-bold text-dark mb-4">Editor Notes</h2>

      {notes.length === 0 ? (
        <p className="text-mid-gray text-sm mb-4">No notes yet.</p>
      ) : (
        <div className="divide-y divide-divider mb-6">
          {notes.map((note) => (
            <div key={note.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-dark text-sm">
                  {note.admin_users?.name ?? 'Unknown'}
                </span>
                <span className="text-xs text-mid-gray">
                  {formatCT(note.created_at, 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              <p className="text-dark text-sm mt-1 whitespace-pre-wrap">{note.body}</p>
            </div>
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
