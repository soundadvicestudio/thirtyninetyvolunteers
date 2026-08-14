'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, Editor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapLink from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { createReply } from '@/lib/actions/messages'

interface ReplyComposerProps {
  threadId: string
}

export default function ReplyComposer({ threadId }: ReplyComposerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

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
  })

  function handleSubmit() {
    if (!editor || isPending) return
    if (editor.getText().trim().length === 0) return
    const body = editor.getHTML()

    setError(null)
    startTransition(async () => {
      const result = await createReply(threadId, body)
      if ('error' in result) {
        setError(result.error)
        return
      }
      editor.commands.clearContent()
      router.refresh()
    })
  }

  return (
    <div className="border-t border-neutral-border dark:border-dark-border pt-6 mt-2">
      <h2 className="text-sm font-semibold text-dark dark:text-dark-text mb-3">Reply</h2>

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border border-b-0 border-neutral-border dark:border-dark-border rounded-t-lg bg-neutral-surface dark:bg-dark-nav">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
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
          disabled={!editor}
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
          disabled={!editor}
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
          disabled={!editor}
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
          disabled={!editor}
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
          disabled={!editor}
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
          disabled={!editor}
          className="px-2 py-1 text-xs rounded disabled:opacity-50 text-dark dark:text-dark-text hover:bg-white dark:hover:bg-dark-border"
          title="Insert horizontal rule"
        >
          —
        </button>
      </div>

      {/* Editor */}
      <div className="border border-neutral-border dark:border-dark-border rounded-b-lg bg-white dark:bg-dark-surface">
        <EditorContent
          editor={editor}
          className="text-sm text-dark dark:text-dark-text p-3 min-h-[100px] focus:outline-none
            [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[80px]
            [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-4
            [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-4
            [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_em]:italic"
        />
      </div>

      {/* Error */}
      {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>}

      {/* Submit */}
      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !editor}
          className="px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Sending...' : 'Send Reply'}
        </button>
      </div>
    </div>
  )
}
