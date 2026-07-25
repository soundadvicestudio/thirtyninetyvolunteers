import Image from 'next/image'
import { getAdminClient } from '@/lib/supabase/admin'
import ConsentUploadForm from '@/components/consent/ConsentUploadForm'

export const metadata = {
  title: 'Submit Consent Form',
  robots: { index: false, follow: false },
}

// Matches the established public-page header pattern (app/shows/[id],
// app/opportunities/[id], app/checkin/[token]) — white header, centered
// logo, orange accent underline.
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

type RawSubmissionRow = {
  submitted_file_path: string | null
  volunteers: { full_name: string } | null
  document_types: { name: string } | null
}

export default async function ConsentUploadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = getAdminClient()

  const { data: submissionRow } = await supabase
    .from('consent_form_submissions')
    .select(
      `
      submitted_file_path,
      volunteers ( full_name ),
      document_types ( name )
      `
    )
    .eq('upload_token', token)
    .maybeSingle()

  if (!submissionRow) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md text-center">
            <h1 className="text-navy font-bold text-xl mb-3">This link is not valid.</h1>
            <p className="text-mid-gray text-sm leading-relaxed">Please contact your coordinator for assistance.</p>
          </div>
        </main>
      </div>
    )
  }

  const submission = submissionRow as unknown as RawSubmissionRow
  const volunteerName = submission.volunteers?.full_name ?? 'there'
  const documentTypeName = submission.document_types?.name ?? 'Consent Form'

  if (submission.submitted_file_path !== null) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md text-center">
            <h1 className="text-navy font-bold text-xl mb-3">Thank you — your form has been received.</h1>
            <p className="text-mid-gray text-sm leading-relaxed">
              We&apos;ve received your {documentTypeName.toLowerCase()}. No further action is needed.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 bg-white py-10">
        <ConsentUploadForm uploadToken={token} volunteerName={volunteerName} documentTypeName={documentTypeName} />
      </main>
    </div>
  )
}
