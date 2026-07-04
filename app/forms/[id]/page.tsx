import Image from 'next/image'
import Link from 'next/link'
import { getPublicForm } from '@/lib/data/forms'
import PublicForm from './PublicForm'

function PublicHeader() {
  return (
    <header className="w-full bg-white border-b border-divider">
      <div className="max-w-2xl mx-auto py-6 px-6 text-center">
        <Image src="/logo.png" alt="30 By Ninety Theatre" width={112} height={64} className="mx-auto" />
        <span className="block w-16 h-0.5 bg-orange mx-auto mt-2" />
      </div>
    </header>
  )
}

function Unavailable() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <h1 className="text-navy font-bold text-xl mb-3">This form is not available.</h1>
          <p className="text-mid-gray text-sm leading-relaxed mb-6">
            It may have been removed, or the link may be incorrect.
          </p>
          <Link
            href="/"
            className="inline-block bg-navy text-white font-semibold py-3 px-6 rounded hover:bg-opacity-90 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}

function Closed({ title, description }: { title: string; description: string | null }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 bg-white py-10 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-navy font-bold text-2xl md:text-3xl mb-4">{title}</h1>
          {description && (
            <p className="text-dark text-base leading-relaxed mb-8 whitespace-pre-wrap">{description}</p>
          )}
          <div className="rounded-xl bg-pale-orange border border-divider p-6 text-center max-w-xl">
            <p className="text-dark font-semibold">This form is no longer accepting responses.</p>
          </div>
          <Link href="/" className="inline-block mt-6 text-navy font-semibold underline">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}

export default async function PublicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const form = await getPublicForm(id)

  // Never reveal that a draft form exists — same "not available" state as
  // a missing form entirely.
  if (!form || form.status === 'draft') {
    return <Unavailable />
  }

  if (form.status === 'closed') {
    return <Closed title={form.title} description={form.description} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 bg-white py-10 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-navy font-bold text-2xl md:text-3xl mb-4">{form.title}</h1>
          {form.description && (
            <p className="text-dark text-base leading-relaxed mb-8 whitespace-pre-wrap">{form.description}</p>
          )}
          <div className="border-t border-divider mb-8" />
          <PublicForm form={form} />
        </div>
      </main>
    </div>
  )
}
