'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit'
import type { AdminRole } from '@/types/admin'

type AccessTier = 'public' | 'link_only' | 'backend'
type FolderVisibility = 'public' | 'link_only' | 'backend' | 'restricted'
type AccessGrant = { access_type: 'role' | 'user'; role?: string; admin_user_id?: string }

function isEditorRole(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'owner_admin' || role === 'editor'
}

function isSuperAdminOrOwnerAdmin(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'owner_admin'
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_')
}

const MIME_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/mp4': 'm4a',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/plain': 'txt',
}

function getExtFromMimeType(mimeType: string): string {
  return MIME_EXTENSION[mimeType] ?? 'bin'
}

// ─── Upload Actions ────────────────────────────────────────

export async function getMediaUploadUrl(
  title: string,
  filename: string,
  mimeType: string,
  folderId: string | null
): Promise<{ signedUrl: string; path: string; documentId: string } | { error: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return { error: 'unauthorized' }
    }

    if (!title.trim()) {
      return { error: 'Title is required.' }
    }
    if (!mimeType) {
      return { error: 'invalid_file_type' }
    }

    const documentId = crypto.randomUUID()
    const sanitizedFilename = sanitizeFilename(filename) || `file.${getExtFromMimeType(mimeType)}`
    const path = `library/${folderId ?? 'unattached'}/${documentId}/${Date.now()}-${sanitizedFilename}`

    // Storage requires service role on this private bucket — the 'media'
    // bucket has zero storage.objects RLS policies (confirmed via live
    // Supabase query during Task A), so getServerClient() cannot call any
    // storage.* method here. getAdminClient() used for this call only,
    // matching the established pattern in lib/actions/consent.ts
    // (getConsentUploadUrl()).
    const supabase = getAdminClient()
    const { data, error } = await supabase.storage.from('media').createSignedUploadUrl(path)

    if (error || !data) {
      console.error('getMediaUploadUrl storage error:', error)
      return { error: 'storage_error' }
    }

    return { signedUrl: data.signedUrl, path, documentId }
  } catch (err) {
    console.error('getMediaUploadUrl unexpected error:', err)
    return { error: 'unknown' }
  }
}

export async function confirmMediaUpload(
  path: string,
  mimeType: string,
  fileSize: number,
  originalFilename: string,
  title: string,
  folderId: string | null,
  accessTier: AccessTier,
  documentTypeId: string | null,
  description: string | null
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return { success: false, error: 'unauthorized' }
    }

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return { success: false, error: 'Title is required.' }
    }

    const supabase = await getServerClient()

    const { data: inserted, error } = await supabase
      .from('documents')
      .insert({
        entry_type: 'file',
        storage_path: path,
        mime_type: mimeType,
        file_size: fileSize,
        original_filename: originalFilename,
        title: trimmedTitle,
        folder_id: folderId,
        access_tier: accessTier,
        document_type_id: documentTypeId,
        description: description?.trim() || null,
        uploaded_by: admin.id,
      })
      .select('id')
      .single()

    if (error || !inserted) {
      console.error('confirmMediaUpload insert error:', error)
      return { success: false, error: 'Something went wrong saving this document. Please try again.' }
    }

    await logAction(admin.id, 'media.upload', 'document', inserted.id, undefined, {
      title: trimmedTitle,
      entry_type: 'file',
      access_tier: accessTier,
    })

    revalidatePath('/crew/media')

    return { success: true, documentId: inserted.id }
  } catch (err) {
    console.error('confirmMediaUpload unexpected error:', err)
    return { success: false, error: 'unknown' }
  }
}

export async function addMediaLink(
  title: string,
  externalUrl: string,
  folderId: string | null,
  accessTier: AccessTier,
  documentTypeId: string | null,
  description: string | null
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return { success: false, error: 'unauthorized' }
    }

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return { success: false, error: 'Title is required.' }
    }

    const trimmedUrl = externalUrl.trim()
    if (!/^https?:\/\//.test(trimmedUrl)) {
      return { success: false, error: 'Please enter a valid URL starting with http:// or https://.' }
    }

    const supabase = await getServerClient()

    const { data: inserted, error } = await supabase
      .from('documents')
      .insert({
        entry_type: 'link',
        external_url: trimmedUrl,
        title: trimmedTitle,
        folder_id: folderId,
        access_tier: accessTier,
        document_type_id: documentTypeId,
        description: description?.trim() || null,
        uploaded_by: admin.id,
      })
      .select('id')
      .single()

    if (error || !inserted) {
      console.error('addMediaLink insert error:', error)
      return { success: false, error: 'Something went wrong saving this link. Please try again.' }
    }

    await logAction(admin.id, 'media.link_add', 'document', inserted.id, undefined, {
      title: trimmedTitle,
      entry_type: 'link',
      access_tier: accessTier,
    })

    revalidatePath('/crew/media')

    return { success: true, documentId: inserted.id }
  } catch (err) {
    console.error('addMediaLink unexpected error:', err)
    return { success: false, error: 'unknown' }
  }
}

// ─── Document Management Actions ───────────────────────────

export async function updateDocument(
  id: string,
  data: {
    title?: string
    description?: string
    access_tier?: AccessTier
    folder_id?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin || !isEditorRole(admin.role)) {
    return { success: false, error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('documents')
    .select('title, description, access_tier, folder_id')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { success: false, error: 'Could not find this document.' }
  }

  const updatePayload: Record<string, unknown> = {}
  if (data.title !== undefined) updatePayload.title = data.title.trim()
  if (data.description !== undefined) updatePayload.description = data.description.trim() || null
  if (data.access_tier !== undefined) updatePayload.access_tier = data.access_tier
  if (data.folder_id !== undefined) updatePayload.folder_id = data.folder_id

  const { error: updateError } = await supabase.from('documents').update(updatePayload).eq('id', id)

  if (updateError) {
    console.error('updateDocument error:', updateError)
    return { success: false, error: 'Something went wrong updating this document. Please try again.' }
  }

  await logAction(admin.id, 'media.update', 'document', id, current, updatePayload)

  revalidatePath('/crew/media')

  return { success: true }
}

export async function deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin || !isSuperAdminOrOwnerAdmin(admin.role)) {
    return { success: false, error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('title, entry_type, storage_path')
    .eq('id', id)
    .single()

  if (fetchError || !doc) {
    return { success: false, error: 'Could not find this document.' }
  }

  if (doc.entry_type === 'file' && doc.storage_path) {
    // Storage delete requires service role on this private bucket — the
    // 'media' bucket has zero storage.objects RLS policies (confirmed via
    // live Supabase query during Task A). getAdminClient() used for this
    // call only; the DB delete below still uses getServerClient().
    const storageClient = getAdminClient()
    const { error: storageError } = await storageClient.storage.from('media').remove([doc.storage_path])
    if (storageError) {
      console.error('deleteDocument storage error:', storageError)
      return { success: false, error: 'Something went wrong deleting the file. Please try again.' }
    }
  }

  // document_access rows CASCADE-delete automatically (confirmed via live
  // FK constraint check — ON DELETE CASCADE on document_id).
  const { error: deleteError } = await supabase.from('documents').delete().eq('id', id)

  if (deleteError) {
    console.error('deleteDocument error:', deleteError)
    return { success: false, error: 'Something went wrong deleting this document. Please try again.' }
  }

  await logAction(admin.id, 'media.delete', 'document', id, { title: doc.title }, undefined)

  revalidatePath('/crew/media')

  return { success: true }
}

// ─── Folder Actions ─────────────────────────────────────────

export async function createFolder(data: {
  name: string
  description?: string
  visibility: FolderVisibility
}): Promise<{ success: boolean; folderId?: string; error?: string }> {
  const admin = await getAdminUser()
  if (!admin || !isEditorRole(admin.role)) {
    return { success: false, error: 'unauthorized' }
  }

  const trimmedName = data.name.trim()
  if (!trimmedName) {
    return { success: false, error: 'Name is required.' }
  }

  const supabase = await getServerClient()

  const { data: maxRow } = await supabase
    .from('media_folders')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (maxRow?.sort_order ?? 0) + 1

  const { data: inserted, error } = await supabase
    .from('media_folders')
    .insert({
      name: trimmedName,
      description: data.description?.trim() || null,
      visibility: data.visibility,
      sort_order: sortOrder,
      created_by: admin.id,
    })
    .select('id')
    .single()

  if (error || !inserted) {
    console.error('createFolder error:', error)
    return { success: false, error: 'Something went wrong creating this folder. Please try again.' }
  }

  await logAction(admin.id, 'media_folder.create', 'media_folder', inserted.id, undefined, {
    name: trimmedName,
    visibility: data.visibility,
  })

  revalidatePath('/crew/media')

  return { success: true, folderId: inserted.id }
}

export async function updateFolder(
  id: string,
  data: { name?: string; description?: string; visibility?: FolderVisibility }
): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin || !isEditorRole(admin.role)) {
    return { success: false, error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('media_folders')
    .select('name, description, visibility')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { success: false, error: 'Could not find this folder.' }
  }

  const updatePayload: Record<string, unknown> = {}
  if (data.name !== undefined) updatePayload.name = data.name.trim()
  if (data.description !== undefined) updatePayload.description = data.description.trim() || null
  if (data.visibility !== undefined) updatePayload.visibility = data.visibility

  const { error: updateError } = await supabase.from('media_folders').update(updatePayload).eq('id', id)

  if (updateError) {
    console.error('updateFolder error:', updateError)
    return { success: false, error: 'Something went wrong updating this folder. Please try again.' }
  }

  await logAction(admin.id, 'media_folder.update', 'media_folder', id, current, updatePayload)

  revalidatePath('/crew/media')

  return { success: true }
}

export async function deleteFolder(id: string): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin || !isSuperAdminOrOwnerAdmin(admin.role)) {
    return { success: false, error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  const { count } = await supabase.from('documents').select('id', { count: 'exact', head: true }).eq('folder_id', id)

  if ((count ?? 0) > 0) {
    return { success: false, error: 'folder_has_documents' }
  }

  const { data: current, error: fetchError } = await supabase
    .from('media_folders')
    .select('name')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { success: false, error: 'Could not find this folder.' }
  }

  // media_folder_access rows CASCADE-delete automatically (confirmed via
  // live FK constraint check — ON DELETE CASCADE on folder_id).
  const { error: deleteError } = await supabase.from('media_folders').delete().eq('id', id)

  if (deleteError) {
    console.error('deleteFolder error:', deleteError)
    return { success: false, error: 'Something went wrong deleting this folder. Please try again.' }
  }

  await logAction(admin.id, 'media_folder.delete', 'media_folder', id, { name: current.name }, undefined)

  revalidatePath('/crew/media')

  return { success: true }
}

// ─── Access Grant Actions ───────────────────────────────────

export async function updateFolderAccess(
  folderId: string,
  grants: AccessGrant[]
): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin || !isEditorRole(admin.role)) {
    return { success: false, error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  const { error: deleteError } = await supabase.from('media_folder_access').delete().eq('folder_id', folderId)
  if (deleteError) {
    console.error('updateFolderAccess delete error:', deleteError)
    return { success: false, error: 'Something went wrong updating access. Please try again.' }
  }

  if (grants.length > 0) {
    const { error: insertError } = await supabase.from('media_folder_access').insert(
      grants.map((g) => ({
        folder_id: folderId,
        access_type: g.access_type,
        role: g.role ?? null,
        admin_user_id: g.admin_user_id ?? null,
      }))
    )
    if (insertError) {
      console.error('updateFolderAccess insert error:', insertError)
      return { success: false, error: 'Something went wrong updating access. Please try again.' }
    }
  }

  revalidatePath('/crew/media')

  return { success: true }
}

export async function updateDocumentAccess(
  documentId: string,
  grants: AccessGrant[]
): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin || !isEditorRole(admin.role)) {
    return { success: false, error: 'unauthorized' }
  }

  const supabase = await getServerClient()

  const { error: deleteError } = await supabase.from('document_access').delete().eq('document_id', documentId)
  if (deleteError) {
    console.error('updateDocumentAccess delete error:', deleteError)
    return { success: false, error: 'Something went wrong updating access. Please try again.' }
  }

  if (grants.length > 0) {
    const { error: insertError } = await supabase.from('document_access').insert(
      grants.map((g) => ({
        document_id: documentId,
        access_type: g.access_type,
        role: g.role ?? null,
        admin_user_id: g.admin_user_id ?? null,
      }))
    )
    if (insertError) {
      console.error('updateDocumentAccess insert error:', insertError)
      return { success: false, error: 'Something went wrong updating access. Please try again.' }
    }
  }

  revalidatePath('/crew/media')

  return { success: true }
}
