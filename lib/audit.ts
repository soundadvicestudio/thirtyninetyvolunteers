import 'server-only'
import { getAdminClient } from '@/lib/supabase/admin'

export type AuditAction =
  // Volunteers
  | 'volunteer.update'
  | 'volunteer.archive'
  | 'volunteer.unarchive'
  | 'volunteer.note.add'
  | 'volunteer.note.edit'
  | 'volunteer.note.delete'
  | 'volunteer.hours_add'

  // Shows & Seasons
  | 'show.create'
  | 'show.update'
  | 'show.status_change'
  | 'show.editor_add'
  | 'show.editor_remove'
  | 'season.create'

  // Categories
  | 'category.create'
  | 'category.rename'
  | 'category.reorder'
  | 'category.visibility'

  // Users & Auth
  | 'user.create'
  | 'user.deactivate'
  | 'user.reactivate'
  | 'user.role_change'
  | 'user.decline_registration'
  | 'user.password_change'
  | 'user.calendar_editor_change'

  // Opportunities
  | 'opportunity.create'
  | 'opportunity.update'
  | 'opportunity.archive'
  | 'opportunity.reactivate'
  | 'opportunity.submission'

  // Forms
  | 'form.create'
  | 'form.update'

  // Attendance & Hours
  | 'attendance.mark'
  | 'attendance.hours_confirm'

  // Slot Claims
  | 'slot_claim.cancel'

  // Milestones
  | 'milestone.acknowledge'

  // Settings (Phase 11 — logAction() calls added in Phase 11.2; types
  // defined here so the audit log viewer can display them once they appear)
  | 'settings.update'
  | 'hearing_options.create'
  | 'hearing_options.update'
  | 'hearing_options.reorder'
  | 'hearing_options.deactivate'

  // Locations
  | 'location.create'
  | 'location.update'
  | 'location.reorder'
  | 'location.deactivate'

export async function logAction(
  adminId: string | null,
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
