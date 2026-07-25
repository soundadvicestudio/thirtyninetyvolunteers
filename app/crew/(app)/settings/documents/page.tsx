import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { DocumentTypesManager } from '@/components/crew/settings/DocumentTypesManager'
import { ConsentSubmissionsQueue } from '@/components/crew/settings/ConsentSubmissionsQueue'
import type { DocumentTypeRow } from '@/components/crew/settings/DocumentTypesManager'
import type { ConsentSubmissionRow } from '@/components/crew/settings/ConsentSubmissionsQueue'

type RawDocumentTypeRow = {
  id: string
  name: string
  slug: string
  description: string | null
  is_system: boolean
  is_active: boolean
  sort_order: number
  documents: Array<{ id: string; title: string; is_type_active: boolean; created_at: string }> | null
}

type RawSubmissionRow = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string | null
  submitted_file_path: string | null
  notes: string | null
  created_at: string
  volunteers: { id: string; full_name: string; email: string } | null
  document_types: { name: string } | null
}

export default async function DocumentsSettingsPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const canManage = ['super_admin', 'owner_admin'].includes(admin.role)
  if (!canManage) {
    redirect('/crew/settings')
  }

  const supabase = await getServerClient()

  const [{ data: documentTypeRows }, { data: submissionRows }] = await Promise.all([
    supabase
      .from('document_types')
      .select(
        `
        id, name, slug, description, is_system, is_active, sort_order,
        documents ( id, title, is_type_active, created_at )
        `
      )
      .order('sort_order', { ascending: true }),
    supabase
      .from('consent_form_submissions')
      .select(
        `
        id, status, submitted_at, submitted_file_path, notes, created_at,
        volunteers ( id, full_name, email ),
        document_types ( name )
        `
      )
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const documentTypes: DocumentTypeRow[] = ((documentTypeRows ?? []) as unknown as RawDocumentTypeRow[]).map(
    (t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      is_system: t.is_system,
      is_active: t.is_active,
      sort_order: t.sort_order,
      documents: t.documents ?? [],
    })
  )

  const submissions: ConsentSubmissionRow[] = ((submissionRows ?? []) as unknown as RawSubmissionRow[]).map(
    (s) => ({
      id: s.id,
      status: s.status,
      submittedAt: s.submitted_at,
      submittedFilePath: s.submitted_file_path,
      notes: s.notes,
      createdAt: s.created_at,
      volunteer: s.volunteers,
      documentTypeName: s.document_types?.name ?? 'Unknown',
    })
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">Document Management</h1>
        <p className="text-sm text-mid-gray dark:text-dark-muted">
          Manage document types and review consent form submissions from volunteers under 18.
        </p>
      </div>
      <DocumentTypesManager documentTypes={documentTypes} adminRole={admin.role} />
      <ConsentSubmissionsQueue submissions={submissions} />
    </div>
  )
}
