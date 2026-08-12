'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit'

// This file serves the public /consent/[token] upload page — no Supabase
// Auth session exists in this context. getAdminClient() only; never
// getServerClient() (same pattern as lib/actions/checkin.ts).

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'])

const MIME_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

type ConsentSubmissionRow = {
  id: string
  volunteer_id: string | null
  document_type_id: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_file_path: string | null
}

type ValidateResult =
  | { valid: true; submission: ConsentSubmissionRow }
  | { valid: false; reason: 'not_found' | 'already_submitted' }

async function validateConsentToken(uploadToken: string): Promise<ValidateResult> {
  const supabase = getAdminClient()

  const { data } = await supabase
    .from('consent_form_submissions')
    .select('id, volunteer_id, document_type_id, status, submitted_file_path')
    .eq('upload_token', uploadToken)
    .maybeSingle()

  if (!data) {
    return { valid: false, reason: 'not_found' }
  }
  if (data.submitted_file_path !== null) {
    return { valid: false, reason: 'already_submitted' }
  }
  return { valid: true, submission: data }
}

export async function getConsentUploadUrl(
  uploadToken: string,
  filename: string,
  mimeType: string
): Promise<{ signedUrl: string; path: string } | { error: string }> {
  try {
    const result = await validateConsentToken(uploadToken)
    if (!result.valid) {
      return { error: result.reason }
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return { error: 'invalid_file_type' }
    }

    const ext = MIME_EXTENSION[mimeType]
    const path = `consent-forms/${result.submission.volunteer_id}/${result.submission.id}/${Date.now()}-consent.${ext}`

    const supabase = getAdminClient()
    const { data, error } = await supabase.storage.from('media').createSignedUploadUrl(path)

    if (error || !data) {
      console.error('getConsentUploadUrl storage error:', error)
      return { error: 'storage_error' }
    }

    return { signedUrl: data.signedUrl, path }
  } catch (err) {
    console.error('getConsentUploadUrl unexpected error:', err)
    return { error: 'unknown' }
  }
}

export async function confirmConsentSubmission(
  uploadToken: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await validateConsentToken(uploadToken)
    if (!result.valid) {
      return { success: false, error: result.reason }
    }

    const supabase = getAdminClient()
    const { error } = await supabase
      .from('consent_form_submissions')
      .update({
        submitted_file_path: storagePath,
        submitted_at: new Date().toISOString(),
      })
      .eq('upload_token', uploadToken)
      .is('submitted_file_path', null)

    if (error) {
      console.error('confirmConsentSubmission update error:', error)
      return { success: false, error: 'unknown' }
    }

    await logAction(
      null,
      'consent_submission.file_received',
      'consent_form_submission',
      result.submission.id,
      { submitted_file_path: null },
      { submitted_file_path: storagePath }
    )

    revalidatePath('/crew/settings/documents')
    revalidatePath('/crew', 'layout')

    return { success: true }
  } catch (err) {
    console.error('confirmConsentSubmission unexpected error:', err)
    return { success: false, error: 'unknown' }
  }
}
