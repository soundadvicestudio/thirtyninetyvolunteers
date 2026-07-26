import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { generateQR } from '@/lib/qr'
import { MediaLibrary } from '@/components/crew/media/MediaLibrary'
import type { MediaFolder, MediaDocument, MediaDocumentType } from '@/components/crew/media/MediaLibrary'

type AccessGrantRow = { id: string; access_type: 'role' | 'user'; role: string | null; admin_user_id: string | null }

type RawFolderRow = {
  id: string
  name: string
  description: string | null
  visibility: 'public' | 'link_only' | 'backend' | 'restricted'
  sort_order: number
  media_folder_access: AccessGrantRow[] | null
}

type RawDocumentRow = {
  id: string
  access_token: string
  title: string
  description: string | null
  document_type_id: string | null
  folder_id: string | null
  entry_type: 'file' | 'link'
  storage_path: string | null
  external_url: string | null
  mime_type: string | null
  access_tier: 'public' | 'link_only' | 'backend'
  attached_to_type: string | null
  attached_to_id: string | null
  uploaded_by: string | null
  created_at: string
  document_types: { name: string } | null
  document_access: AccessGrantRow[] | null
}

export default async function MediaPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/crew/login')

  const supabase = await getServerClient()

  const [{ data: documentTypeRows }, { data: folderRows }, { data: rawDocuments }] = await Promise.all([
    supabase.from('document_types').select('id, name, is_active').eq('is_active', true).order('sort_order'),
    supabase
      .from('media_folders')
      .select(
        `
        id, name, description, visibility, sort_order,
        media_folder_access ( id, access_type, role, admin_user_id )
        `
      )
      .order('sort_order'),
    supabase
      .from('documents')
      .select(
        `
        id, access_token, title, description, document_type_id,
        folder_id, entry_type, storage_path, external_url,
        mime_type, access_tier, attached_to_type, attached_to_id,
        uploaded_by, created_at,
        document_types ( name ),
        document_access ( id, access_type, role, admin_user_id )
        `
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ])

  const documents = (rawDocuments ?? []) as unknown as RawDocumentRow[]

  // Fetch attached_to_name for documents with show/rehearsal context, and
  // uploader names for the "Uploaded" column — both merged in separately
  // (simpler than embedding multiple ambiguous FK relationships in one
  // Supabase select).
  const showIds = documents.filter((d) => d.attached_to_type === 'show' && d.attached_to_id).map((d) => d.attached_to_id!)
  const batchIds = documents
    .filter((d) => d.attached_to_type === 'rehearsal_batch' && d.attached_to_id)
    .map((d) => d.attached_to_id!)
  const uploaderIds = Array.from(new Set(documents.filter((d) => d.uploaded_by).map((d) => d.uploaded_by!)))

  const [{ data: shows }, { data: batches }, { data: uploaders }] = await Promise.all([
    showIds.length > 0
      ? supabase.from('shows').select('id, name').in('id', showIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    batchIds.length > 0
      ? supabase.from('rehearsal_batches').select('id, title').in('id', batchIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    uploaderIds.length > 0
      ? supabase.from('admin_users').select('id, name').in('id', uploaderIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ])

  const documentsWithQr: MediaDocument[] = await Promise.all(
    documents.map(async (doc) => {
      const url = `${process.env.NEXT_PUBLIC_SITE_URL}/documents/${doc.access_token}`
      const qr = await generateQR(url)

      const attachedName =
        doc.attached_to_type === 'show'
          ? shows?.find((s) => s.id === doc.attached_to_id)?.name
          : doc.attached_to_type === 'rehearsal_batch'
            ? batches?.find((b) => b.id === doc.attached_to_id)?.title
            : undefined

      const uploaderName = doc.uploaded_by ? (uploaders?.find((u) => u.id === doc.uploaded_by)?.name ?? null) : null

      return {
        id: doc.id,
        access_token: doc.access_token,
        title: doc.title,
        description: doc.description,
        document_type_id: doc.document_type_id,
        folder_id: doc.folder_id,
        entry_type: doc.entry_type,
        external_url: doc.external_url,
        mime_type: doc.mime_type,
        access_tier: doc.access_tier,
        attached_to_type: doc.attached_to_type,
        created_at: doc.created_at,
        document_types: doc.document_types,
        document_access: doc.document_access ?? [],
        qrSvg: qr.svg,
        qrPngBase64: qr.pngBase64,
        attachedName,
        uploaderName,
      }
    })
  )

  const folders: MediaFolder[] = ((folderRows ?? []) as unknown as RawFolderRow[]).map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    visibility: f.visibility,
    sort_order: f.sort_order,
    media_folder_access: f.media_folder_access ?? [],
  }))

  const documentTypes: MediaDocumentType[] = (documentTypeRows ?? []).map((t) => ({ id: t.id, name: t.name }))

  return (
    <div className="space-y-6">
      <MediaLibrary
        folders={folders}
        documents={documentsWithQr}
        adminRole={admin.role}
        adminId={admin.id}
        documentTypes={documentTypes}
      />
    </div>
  )
}
