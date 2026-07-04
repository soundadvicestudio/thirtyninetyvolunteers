import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getFormDetail } from '@/lib/data/forms'
import { generateQR } from '@/lib/qr'
import { formatCT } from '@/lib/utils/date'
import { FORM_STATUS_LABEL, FORM_STATUS_BADGE } from '@/lib/utils/formDisplay'
import FormDetailActions from './FormDetailActions'

export default async function FormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const { id } = await params
  const form = await getFormDetail(id)

  if (!form) {
    notFound()
  }

  const canEdit = admin.role === 'super_admin' || admin.role === 'editor'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const publicUrl = `${siteUrl}/forms/${id}`
  const embedCode = `<iframe\n  src="${publicUrl}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  title="${form.title}">\n</iframe>`

  const qr = await generateQR(publicUrl)

  return (
    <div>
      <Link
        href="/crew/forms"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Forms
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-dark dark:text-dark-text">{form.title}</h1>
          <span className={`text-xs font-semibold rounded px-2 py-0.5 ${FORM_STATUS_BADGE[form.status]}`}>
            {FORM_STATUS_LABEL[form.status]}
          </span>
        </div>
        {canEdit && (
          <Link
            href={`/crew/forms/${id}/edit`}
            className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium"
          >
            Edit Form
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-dark dark:text-dark-text">Form Info</h2>
          {form.description && <p className="text-dark dark:text-dark-text">{form.description}</p>}
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-mid-gray dark:text-dark-muted">Created:</dt>
              <dd className="text-dark dark:text-dark-text">{formatCT(form.created_at, 'MMM d, yyyy h:mm a')}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-mid-gray dark:text-dark-muted">Last updated:</dt>
              <dd className="text-dark dark:text-dark-text">{formatCT(form.updated_at, 'MMM d, yyyy h:mm a')}</dd>
            </div>
            <div className="flex gap-2 items-center">
              <dt className="text-mid-gray dark:text-dark-muted">Responses:</dt>
              <dd>
                <Link
                  href={`/crew/forms/${id}/responses`}
                  className="text-navy dark:text-steel font-semibold hover:underline"
                >
                  {form.response_count}
                </Link>
              </dd>
            </div>
          </dl>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">Sharing</h2>
            {form.status !== 'live' && (
              <p className="text-sm text-orange mb-3">Form must be live to accept responses.</p>
            )}
            <FormDetailActions publicUrl={publicUrl} embedCode={embedCode} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-dark dark:text-dark-text mb-3">QR Code</h2>
            <div
              className="w-[200px] h-[200px] [&>svg]:w-full [&>svg]:h-full bg-white p-2 rounded-lg border border-divider dark:border-dark-border"
              dangerouslySetInnerHTML={{ __html: qr.svg }}
            />
            <div className="flex gap-4 mt-3">
              <a
                href={`data:image/png;base64,${qr.pngBase64}`}
                download="form-qr.png"
                className="text-sm font-semibold text-navy dark:text-steel hover:underline"
              >
                Download PNG
              </a>
              <a
                href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr.svg)}`}
                download="form-qr.svg"
                className="text-sm font-semibold text-navy dark:text-steel hover:underline"
              >
                Download SVG
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
