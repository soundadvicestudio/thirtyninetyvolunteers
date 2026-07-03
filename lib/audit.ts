import 'server-only'
import { getAdminClient } from '@/lib/supabase/admin'

export type AuditAction =
  | 'volunteer.update'
  | 'volunteer.archive'
  | 'volunteer.unarchive'
  | 'volunteer.note.add'
  | 'category.create'
  | 'category.rename'
  | 'category.reorder'
  | 'category.visibility'
  | 'user.create'
  | 'user.deactivate'
  | 'user.reactivate'
  | 'user.role_change'
  | 'volunteer.note.edit'
  | 'volunteer.note.delete'
  | 'show.create'
  | 'show.update'
  | 'season.create'
  | 'show.status_change'
  | 'attendance.mark'
  | 'show.editor_add'
  | 'show.editor_remove'
  | 'opportunity.create'
  | 'opportunity.update'
  | 'opportunity.archive'
  | 'opportunity.submission'

export async function logAction(
  adminId: string,
  action: AuditAction,
  targetType: string,
  targetId: string,
  before?: Record<string, unknown>,
  after?: Record<string, unknown>
): Promise<void> {
  try {
    const client = getAdminClient()
    await client.from('audit_log').insert({
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      before_value: before ?? null,
      after_value: after ?? null,
    })
  } catch (err) {
    console.error('[audit] logAction failed:', err)
    // Non-blocking — never throw from audit logging
  }
}
