'use server'

import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type BetaFeedbackType = 'feature_request' | 'bug_report' | 'other'

export type BetaFeedbackRow = {
  id: string
  submitted_by: string
  submitter_name: string
  role_snapshot: string
  type: BetaFeedbackType
  message: string
  submitted_at: string
  completed_at: string | null
}

// submitBetaFeedback — available to all authenticated roles
// Inserts a new feedback row for the current user.
// No notifications. No return confirmation beyond success/error.
export async function submitBetaFeedback(
  type: BetaFeedbackType,
  message: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }

  const trimmed = message.trim()
  if (!trimmed) return { error: 'Message is required.' }
  if (trimmed.length > 2000) return { error: 'Message must be 2000 characters or fewer.' }

  const { error } = await supabase.from('beta_feedback').insert({
    submitted_by: admin.id,
    role_snapshot: admin.role,
    type,
    message: trimmed,
  })

  if (error) return { error: 'Failed to submit. Please try again.' }
  return { success: true }
}

// completeBetaFeedback — Super Admin only
// Soft-archives a feedback row by setting completed_at = now().
// Removes it from the queue view without deleting the row.
export async function completeBetaFeedback(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await getServerClient()
  const admin = await getAdminUser()
  if (!admin) return { error: 'Unauthorized' }
  if (admin.role !== 'super_admin') return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('beta_feedback')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', id)
    .is('completed_at', null) // idempotency guard — no-op if already completed

  if (error) return { error: 'Failed to mark complete. Please try again.' }
  revalidatePath('/crew/settings/beta')
  return { success: true }
}
