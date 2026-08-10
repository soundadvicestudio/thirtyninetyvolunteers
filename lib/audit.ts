import 'server-only'
import { getAdminClient } from '@/lib/supabase/admin'

export type AuditAction =
  // Volunteers
  // Public self-registration (submitVolunteerForm)
  | 'volunteer.signup'
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
  | 'user.inventory_manager_change'

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

  // Recurring Events
  | 'recurring_event.create'
  | 'recurring_event.edit'
  | 'recurring_event.cancel'

  // Check-In
  | 'attendance.checkin'
  | 'volunteer.checkin_signup'

  // Documents
  | 'document_type.create'
  | 'document_type.update'
  | 'document_type.delete'
  | 'document_type.reorder'
  | 'consent_submission.approve'
  | 'consent_submission.reject'
  | 'consent_submission.file_received'

  // Media Library
  | 'media.upload'
  | 'media.link_add'
  | 'media.update'
  | 'media.delete'
  | 'media_folder.create'
  | 'media_folder.update'
  | 'media_folder.delete'

  // Auditions
  | 'audition.convert_to_volunteer'

  // Inventory
  | 'inventory_category.create'
  | 'inventory_category.update'
  | 'inventory_category.reorder'
  | 'inventory_category.deactivate'
  | 'inventory_location.create'
  | 'inventory_location.update'
  | 'inventory_location.reorder'
  | 'inventory_location.deactivate'
  | 'inventory_item.create'
  | 'inventory_item.update'
  | 'inventory_item.deactivate'
  | 'inventory_item.reactivate'
  | 'inventory_item.delete'
  | 'inventory_photo.upload'
  | 'inventory_photo.delete'
  | 'inventory_photo.reorder'
  | 'inventory_note.add'
  | 'inventory_checkout.create'
  | 'inventory_checkout.return'

  // Forums
  | 'forum_group.create'
  | 'forum_group.update'
  | 'forum_group.delete'
  | 'forum_group_member.add'
  | 'forum_group_member.remove'

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
