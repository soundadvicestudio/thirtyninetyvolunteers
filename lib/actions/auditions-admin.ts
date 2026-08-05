'use server'

import { revalidatePath } from 'next/cache'
import sanitizeHtml from 'sanitize-html'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser, type AdminUser } from '@/lib/auth'
import { normalizePhone } from '@/lib/utils/phone'
import { logAction } from '@/lib/audit'
import { sendBatchEmails } from '@/lib/email'
import { syncAuditionToCalendar } from '@/lib/actions/calendar-sync'
import { substituteMergeTags, type MergeTagValues } from '@/lib/utils/merge-tags'
import { formatWallClockCT } from '@/lib/utils/date'
import type {
  Audition,
  AuditionAssignment,
  AuditionCalendarVisibility,
  AuditionEmailStatusType,
  AuditionEmailTemplate,
  AuditionDetailData,
  AuditionListItem,
  AuditionSignup,
  AuditionSignupStatus,
  AuditionSignupWithDetails,
  AuditionStatus,
  AuditionType,
} from '@/types/audition'

const EDITOR_TIER_ROLES = ['super_admin', 'owner_admin', 'editor']
const BULK_EMAIL_TIER_ROLES = ['super_admin', 'owner_admin', 'editor', 'production']

// ─── Private helper: assertAuditionAccess ──────────────────────
//
// Core access control for Production-role callers. Two independent paths
// grant access, per Brief §7 / §11 Phase AUDITIONS: show assignment (via
// show_editors) or direct audition assignment (via audition_assignments).
// Neither path implies the other.

async function assertAuditionAccess(
  supabase: SupabaseClient,
  admin: AdminUser,
  auditionId: string
): Promise<{ allowed: boolean; error?: string }> {
  if (EDITOR_TIER_ROLES.includes(admin.role)) {
    return { allowed: true }
  }

  if (admin.role === 'viewer') {
    return { allowed: false, error: 'Insufficient permissions' }
  }

  if (admin.role === 'production') {
    const { data: audition } = await supabase
      .from('auditions')
      .select('show_id')
      .eq('id', auditionId)
      .single()

    if (audition?.show_id) {
      // show_editors uses 'admin_id' (not 'admin_user_id') — confirmed
      // AUDITIONS.A Audit G3 / AUDITIONS.1b Task A4.
      const { data: showEditor } = await supabase
        .from('show_editors')
        .select('id')
        .eq('show_id', audition.show_id)
        .eq('admin_id', admin.id)
        .maybeSingle()

      if (showEditor) return { allowed: true }
    }

    // audition_assignments uses 'admin_user_id' (Migration 032).
    const { data: assignment } = await supabase
      .from('audition_assignments')
      .select('id')
      .eq('audition_id', auditionId)
      .eq('admin_user_id', admin.id)
      .maybeSingle()

    if (assignment) return { allowed: true }

    return { allowed: false, error: 'You are not assigned to this audition.' }
  }

  return { allowed: false, error: 'Insufficient permissions' }
}

// ─── C1: getAuditionList ────────────────────────────────────────

export async function getAuditionList(): Promise<AuditionListItem[]> {
  try {
    const admin = await getAdminUser()
    if (!admin) return []

    const supabase = await getServerClient()

    let query = supabase
      .from('auditions')
      .select('id, title, status, type, date_start, date_end, show_id, show:shows(name), location:locations(name)')
      .order('date_start', { ascending: false })

    if (admin.role === 'production') {
      const [{ data: assignmentRows }, { data: showEditorRows }] = await Promise.all([
        supabase.from('audition_assignments').select('audition_id').eq('admin_user_id', admin.id),
        supabase.from('show_editors').select('show_id').eq('admin_id', admin.id),
      ])

      const assignedAuditionIds = [...new Set((assignmentRows ?? []).map((r) => r.audition_id))]
      const assignedShowIds = [...new Set((showEditorRows ?? []).map((r) => r.show_id))]

      if (assignedAuditionIds.length === 0 && assignedShowIds.length === 0) {
        return []
      }

      const orParts: string[] = []
      if (assignedAuditionIds.length > 0) orParts.push(`id.in.(${assignedAuditionIds.join(',')})`)
      if (assignedShowIds.length > 0) orParts.push(`show_id.in.(${assignedShowIds.join(',')})`)
      query = query.or(orParts.join(','))
    }

    const { data: auditions, error } = await query
    if (error || !auditions) return []

    const auditionIds = auditions.map((a) => a.id)
    const signupCounts: Record<string, number> = {}
    if (auditionIds.length > 0) {
      const { data: signupRows } = await supabase
        .from('audition_signups')
        .select('audition_id')
        .in('audition_id', auditionIds)
        .neq('status', 'withdrawn')

      for (const row of signupRows ?? []) {
        signupCounts[row.audition_id] = (signupCounts[row.audition_id] ?? 0) + 1
      }
    }

    return auditions.map((a) => {
      const show = Array.isArray(a.show) ? a.show[0] : a.show
      const location = Array.isArray(a.location) ? a.location[0] : a.location
      return {
        id: a.id,
        title: a.title,
        status: a.status,
        type: a.type,
        date_start: a.date_start,
        date_end: a.date_end,
        show_id: a.show_id,
        show_title: show?.name ?? null,
        signup_count: signupCounts[a.id] ?? 0,
        location_name: location?.name ?? null,
      }
    })
  } catch (err) {
    console.error('getAuditionList error:', err)
    return []
  }
}

// ─── C2: getAuditionDetail ──────────────────────────────────────

export async function getAuditionDetail(auditionId: string): Promise<AuditionDetailData | null> {
  try {
    const admin = await getAdminUser()
    if (!admin) return null

    const supabase = await getServerClient()

    const access = await assertAuditionAccess(supabase, admin, auditionId)
    if (!access.allowed) return null

    const { data: audition } = await supabase.from('auditions').select('*').eq('id', auditionId).maybeSingle()
    if (!audition) return null

    const [{ data: roles }, { data: slots }, { data: locationRow }, { data: showRow }, { data: parentRow }, { data: assignmentRows }] =
      await Promise.all([
        supabase
          .from('audition_roles')
          .select('id, audition_id, name, sort_order, created_at')
          .eq('audition_id', auditionId)
          .order('sort_order', { ascending: true }),
        supabase
          .from('audition_slots')
          .select('id, audition_id, start_time, cap, created_at')
          .eq('audition_id', auditionId)
          .order('start_time', { ascending: true }),
        audition.location_id
          ? supabase.from('locations').select('id, name, color').eq('id', audition.location_id).maybeSingle()
          : Promise.resolve({ data: null }),
        audition.show_id
          ? supabase.from('shows').select('id, name').eq('id', audition.show_id).maybeSingle()
          : Promise.resolve({ data: null }),
        audition.parent_audition_id
          ? supabase.from('auditions').select('id, title').eq('id', audition.parent_audition_id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from('audition_assignments')
          .select('id, audition_id, admin_user_id, created_at, admin_users(id, name, role)')
          .eq('audition_id', auditionId),
      ])

    const assignments = (assignmentRows ?? []).map((row) => {
      const adminRow = Array.isArray(row.admin_users) ? row.admin_users[0] : row.admin_users
      return {
        id: row.id,
        audition_id: row.audition_id,
        admin_user_id: row.admin_user_id,
        created_at: row.created_at,
        admin: {
          id: adminRow?.id ?? row.admin_user_id,
          full_name: adminRow?.name ?? '',
          role: adminRow?.role ?? '',
        },
      }
    }) as (AuditionAssignment & { admin: { id: string; full_name: string; role: string } })[]

    return {
      audition: audition as unknown as Audition,
      roles: roles ?? [],
      slots: slots ?? [],
      location: locationRow ? { id: locationRow.id, name: locationRow.name, color: locationRow.color } : null,
      show: showRow ? { id: showRow.id, name: showRow.name } : null,
      parent_audition: parentRow ? { id: parentRow.id, title: parentRow.title } : null,
      assignments,
    }
  } catch (err) {
    console.error('getAuditionDetail error:', err)
    return null
  }
}

// ─── C3: createAudition ─────────────────────────────────────────

export type CreateAuditionInput = {
  title: string
  description?: string | null
  showId?: string | null
  parentAuditionId?: string | null
  locationId?: string | null
  type: AuditionType
  dateStart: string
  dateEnd?: string | null
  timeStart?: string | null
  timeEnd?: string | null
  slotDurationMinutes?: number | null
  slotsTotal?: number | null
  slotCap?: number
  roleSelectionEnabled?: boolean
  materialHeadshot?: boolean
  materialResume?: boolean
  materialSheetMusic?: boolean
  materialMp3?: boolean
  materialVideo?: boolean
  calendarVisibility?: AuditionCalendarVisibility
  notificationEmailsEnabled?: boolean
}

export async function createAudition(
  data: CreateAuditionInput
): Promise<{ success: boolean; auditionId?: string; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin || !EDITOR_TIER_ROLES.includes(admin.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const supabase = await getServerClient()

    const { data: row, error } = await supabase
      .from('auditions')
      .insert({
        title: data.title,
        description: data.description || null,
        show_id: data.showId || null,
        parent_audition_id: data.parentAuditionId || null,
        location_id: data.locationId || null,
        type: data.type,
        date_start: data.dateStart,
        date_end: data.dateEnd || null,
        time_start: data.timeStart || null,
        time_end: data.timeEnd || null,
        slot_duration_minutes: data.slotDurationMinutes ?? null,
        slots_total: data.slotsTotal ?? null,
        slot_cap: data.slotCap ?? 1,
        role_selection_enabled: data.roleSelectionEnabled ?? false,
        material_headshot: data.materialHeadshot ?? false,
        material_resume: data.materialResume ?? false,
        material_sheet_music: data.materialSheetMusic ?? false,
        material_mp3: data.materialMp3 ?? false,
        material_video: data.materialVideo ?? false,
        calendar_visibility: data.calendarVisibility ?? 'admin_only',
        notification_emails_enabled: data.notificationEmailsEnabled ?? false,
        created_by: admin.id,
      })
      .select('id')
      .single()

    if (error || !row) {
      console.error('createAudition insert error:', error)
      return { success: false, error: 'Failed to create audition.' }
    }

    revalidatePath('/crew/auditions')
    return { success: true, auditionId: row.id }
  } catch (err) {
    console.error('createAudition unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── C4: updateAudition ─────────────────────────────────────────

export type UpdateAuditionInput = Partial<CreateAuditionInput>

export async function updateAudition(
  auditionId: string,
  data: UpdateAuditionInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const supabase = await getServerClient()

    const access = await assertAuditionAccess(supabase, admin, auditionId)
    if (!access.allowed) return { success: false, error: access.error ?? 'Insufficient permissions' }

    const updatePayload: Record<string, unknown> = {}
    if (data.title !== undefined) updatePayload.title = data.title
    if (data.description !== undefined) updatePayload.description = data.description || null
    if (data.showId !== undefined) updatePayload.show_id = data.showId || null
    if (data.parentAuditionId !== undefined) updatePayload.parent_audition_id = data.parentAuditionId || null
    if (data.locationId !== undefined) updatePayload.location_id = data.locationId || null
    if (data.type !== undefined) updatePayload.type = data.type
    if (data.dateStart !== undefined) updatePayload.date_start = data.dateStart
    if (data.dateEnd !== undefined) updatePayload.date_end = data.dateEnd || null
    if (data.timeStart !== undefined) updatePayload.time_start = data.timeStart || null
    if (data.timeEnd !== undefined) updatePayload.time_end = data.timeEnd || null
    if (data.slotDurationMinutes !== undefined) updatePayload.slot_duration_minutes = data.slotDurationMinutes ?? null
    if (data.slotsTotal !== undefined) updatePayload.slots_total = data.slotsTotal ?? null
    if (data.slotCap !== undefined) updatePayload.slot_cap = data.slotCap
    if (data.roleSelectionEnabled !== undefined) updatePayload.role_selection_enabled = data.roleSelectionEnabled
    if (data.materialHeadshot !== undefined) updatePayload.material_headshot = data.materialHeadshot
    if (data.materialResume !== undefined) updatePayload.material_resume = data.materialResume
    if (data.materialSheetMusic !== undefined) updatePayload.material_sheet_music = data.materialSheetMusic
    if (data.materialMp3 !== undefined) updatePayload.material_mp3 = data.materialMp3
    if (data.materialVideo !== undefined) updatePayload.material_video = data.materialVideo
    if (data.calendarVisibility !== undefined) updatePayload.calendar_visibility = data.calendarVisibility
    if (data.notificationEmailsEnabled !== undefined)
      updatePayload.notification_emails_enabled = data.notificationEmailsEnabled

    const { error } = await supabase.from('auditions').update(updatePayload).eq('id', auditionId)

    if (error) {
      console.error('updateAudition update error:', error)
      return { success: false, error: 'Failed to update audition.' }
    }

    // Non-blocking: sync audition to calendar if published and
    // calendar_visibility = 'public'. syncAuditionToCalendar() checks the
    // flag and visibility internally — safe to call unconditionally.
    syncAuditionToCalendar(auditionId, supabase).catch((err) => console.error('Calendar sync error:', err))

    revalidatePath('/crew/auditions')
    revalidatePath(`/crew/auditions/${auditionId}`)
    return { success: true }
  } catch (err) {
    console.error('updateAudition unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── C5: updateAuditionStatus ───────────────────────────────────

export async function updateAuditionStatus(
  auditionId: string,
  status: AuditionStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const supabase = await getServerClient()

    if (status === 'archived') {
      if (!EDITOR_TIER_ROLES.includes(admin.role)) {
        return { success: false, error: 'Insufficient permissions' }
      }
    } else {
      const access = await assertAuditionAccess(supabase, admin, auditionId)
      if (!access.allowed) return { success: false, error: access.error ?? 'Insufficient permissions' }
    }

    const { error } = await supabase.from('auditions').update({ status }).eq('id', auditionId)

    if (error) {
      console.error('updateAuditionStatus update error:', error)
      return { success: false, error: 'Failed to update status.' }
    }

    if (['draft', 'closed', 'archived'].includes(status)) {
      // Remove from calendar when no longer published.
      await supabase.from('calendar_events').delete().eq('source_audition_id', auditionId)
    } else if (status === 'published') {
      // Sync to calendar when published. Non-blocking — see updateAudition().
      syncAuditionToCalendar(auditionId, supabase).catch((err) => console.error('Calendar sync error:', err))
    }

    revalidatePath('/crew/auditions')
    revalidatePath(`/crew/auditions/${auditionId}`)
    return { success: true }
  } catch (err) {
    console.error('updateAuditionStatus unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── C6: getAuditionSignups ─────────────────────────────────────

export async function getAuditionSignups(auditionId: string): Promise<AuditionSignupWithDetails[]> {
  try {
    const admin = await getAdminUser()
    if (!admin) return []

    const supabase = await getServerClient()

    const access = await assertAuditionAccess(supabase, admin, auditionId)
    if (!access.allowed) return []

    const { data: signups } = await supabase
      .from('audition_signups')
      .select('*')
      .eq('audition_id', auditionId)
      .order('signed_up_at', { ascending: true })

    if (!signups || signups.length === 0) return []

    const signupIds = signups.map((s) => s.id)
    const slotIds = [...new Set(signups.map((s) => s.slot_id).filter((id): id is string => Boolean(id)))]
    const roleIds = [...new Set(signups.map((s) => s.audition_role_id).filter((id): id is string => Boolean(id)))]

    const [{ data: slots }, { data: roles }, { data: notes }, { data: materials }] = await Promise.all([
      slotIds.length > 0
        ? supabase.from('audition_slots').select('id, start_time').in('id', slotIds)
        : Promise.resolve({ data: [] as { id: string; start_time: string }[] }),
      roleIds.length > 0
        ? supabase.from('audition_roles').select('id, name').in('id', roleIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      supabase
        .from('audition_signup_notes')
        .select('*')
        .in('signup_id', signupIds)
        .order('created_at', { ascending: true }),
      supabase.from('audition_materials').select('*').in('signup_id', signupIds),
    ])

    const slotMap = new Map((slots ?? []).map((s) => [s.id, s]))
    const roleMap = new Map((roles ?? []).map((r) => [r.id, r]))

    return signups.map((signup) => ({
      signup: signup as unknown as AuditionSignup,
      slot: signup.slot_id && slotMap.has(signup.slot_id) ? { start_time: slotMap.get(signup.slot_id)!.start_time } : null,
      role: signup.audition_role_id && roleMap.has(signup.audition_role_id) ? { name: roleMap.get(signup.audition_role_id)!.name } : null,
      notes: (notes ?? []).filter((n) => n.signup_id === signup.id),
      materials: (materials ?? []).filter((m) => m.signup_id === signup.id),
    }))
  } catch (err) {
    console.error('getAuditionSignups error:', err)
    return []
  }
}

// ─── D: getAuditionMaterialSignedUrl ────────────────────────────
//
// Used by the Materials tab to generate signed download URLs. Read-URL
// generation works on getServerClient() (authenticated admin session) —
// unlike SETUP.2's getSignedBrandUploadUrl(), which requires getAdminClient()
// for the Storage Admin API's upload-URL creation specifically.

export async function getAuditionMaterialSignedUrl(
  materialId: string
): Promise<{ url: string | null; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) return { url: null, error: 'Unauthorized' }

    const supabase = await getServerClient()

    const { data: material } = await supabase
      .from('audition_materials')
      .select('storage_path, signup_id')
      .eq('id', materialId)
      .maybeSingle()

    if (!material) return { url: null, error: 'Not found' }

    const { data: signedData, error: signError } = await supabase.storage
      .from('media')
      .createSignedUrl(material.storage_path, 3600)

    if (signError || !signedData) {
      console.error('getAuditionMaterialSignedUrl storage error:', signError)
      return { url: null, error: 'Failed to generate download link.' }
    }

    return { url: signedData.signedUrl }
  } catch (err) {
    console.error('getAuditionMaterialSignedUrl unexpected error:', err)
    return { url: null, error: 'An unexpected error occurred.' }
  }
}

// ─── C7: updateAuditionSignupStatus ─────────────────────────────

// SCOPE ADDITION (AUDITIONS.2b): accepts an optional castRole param so the
// Signups tab's cast-role field can be saved atomically with a status
// change, rather than adding a 15th server action for a single column.
export async function updateAuditionSignupStatus(
  signupId: string,
  status: AuditionSignupStatus,
  castRole?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const supabase = await getServerClient()

    const { data: signup } = await supabase
      .from('audition_signups')
      .select('audition_id')
      .eq('id', signupId)
      .single()

    if (!signup) return { success: false, error: 'Signup not found.' }

    const access = await assertAuditionAccess(supabase, admin, signup.audition_id)
    if (!access.allowed) return { success: false, error: access.error ?? 'Insufficient permissions' }

    const updatePayload: { status: AuditionSignupStatus; cast_role?: string | null } = { status }
    if (castRole !== undefined) {
      updatePayload.cast_role = castRole || null
    }

    const { error } = await supabase.from('audition_signups').update(updatePayload).eq('id', signupId)

    if (error) {
      console.error('updateAuditionSignupStatus update error:', error)
      return { success: false, error: 'Failed to update status.' }
    }

    // TODO AUDITIONS.4b: if notification_emails_enabled && a template exists
    // for this status, call sendAuditionStatusEmail(signupId, status)
    // non-blocking. Implemented when email functions are built in 4b.

    revalidatePath(`/crew/auditions/${signup.audition_id}`)
    return { success: true }
  } catch (err) {
    console.error('updateAuditionSignupStatus unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── C8: addAuditionNote ────────────────────────────────────────

export async function addAuditionNote(
  signupId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const trimmed = content.trim()
    if (!trimmed) return { success: false, error: 'Note cannot be empty.' }

    const supabase = await getServerClient()

    const { data: signup } = await supabase
      .from('audition_signups')
      .select('audition_id')
      .eq('id', signupId)
      .single()

    if (!signup) return { success: false, error: 'Signup not found.' }

    const access = await assertAuditionAccess(supabase, admin, signup.audition_id)
    if (!access.allowed) return { success: false, error: access.error ?? 'Insufficient permissions' }

    const { error } = await supabase.from('audition_signup_notes').insert({
      signup_id: signupId,
      content: trimmed,
      created_by: admin.id,
    })

    if (error) {
      console.error('addAuditionNote insert error:', error)
      return { success: false, error: 'Failed to save note.' }
    }

    revalidatePath(`/crew/auditions/${signup.audition_id}`)
    return { success: true }
  } catch (err) {
    console.error('addAuditionNote unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── C9: assignProductionUser ───────────────────────────────────

export async function assignProductionUser(
  auditionId: string,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin || !EDITOR_TIER_ROLES.includes(admin.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const supabase = await getServerClient()

    const { data: targetAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', adminUserId)
      .eq('role', 'production')
      .maybeSingle()

    if (!targetAdmin) {
      return { success: false, error: 'Selected user is not a Production-role account.' }
    }

    const { error } = await supabase
      .from('audition_assignments')
      .upsert(
        { audition_id: auditionId, admin_user_id: adminUserId },
        { onConflict: 'audition_id,admin_user_id', ignoreDuplicates: true }
      )

    if (error) {
      console.error('assignProductionUser upsert error:', error)
      return { success: false, error: 'Failed to assign user.' }
    }

    revalidatePath(`/crew/auditions/${auditionId}`)
    return { success: true }
  } catch (err) {
    console.error('assignProductionUser unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── C10: removeProductionUser ──────────────────────────────────

export async function removeProductionUser(
  auditionId: string,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin || !EDITOR_TIER_ROLES.includes(admin.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('audition_assignments')
      .delete()
      .eq('audition_id', auditionId)
      .eq('admin_user_id', adminUserId)

    if (error) {
      console.error('removeProductionUser delete error:', error)
      return { success: false, error: 'Failed to remove user.' }
    }

    revalidatePath(`/crew/auditions/${auditionId}`)
    return { success: true }
  } catch (err) {
    console.error('removeProductionUser unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── C11: sendAuditionBulkEmail ─────────────────────────────────

// Local duplicate of lib/email.ts's escapeHtml() — not exported there.
// Same reasoning as lib/actions/blast.ts's local copy (30BN-13.3a).
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Local equivalent of lib/email.ts's buildEmailHtml() — not exported there.
// Same branded table-based layout as buildBlastEmailHtml() in blast.ts.
// `body` arrives pre-sanitized by sendAuditionBulkEmail() — never escape it
// here, it is TipTap-generated HTML (R31).
function buildAuditionBulkEmailHtml({
  recipientName,
  subject,
  body,
  orgName,
  brandPrimary,
}: {
  recipientName: string
  subject: string
  body: string
  orgName?: string
  brandPrimary?: string
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const safeOrgName = escapeHtml(orgName || '30 By Ninety Theatre')
  const resolvedBrandPrimary = brandPrimary || '#293994'
  const logoHtml = siteUrl
    ? `<img src="${siteUrl}/logo.png" height="50" width="auto" alt="${safeOrgName}" style="display:block;margin:0 auto;">`
    : ''
  const safeName = escapeHtml(recipientName)
  const safeSubject = escapeHtml(subject)

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${safeSubject}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#F5F5F5;font-family:'Open Sans',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F5F5;">
        <tr>
          <td align="center" style="padding:24px 16px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
              <tr>
                <td bgcolor="${resolvedBrandPrimary}" style="background-color:${resolvedBrandPrimary};padding:24px 32px;text-align:center;">
                  ${logoHtml}
                  <p style="margin:8px 0 0 0;color:#FFFFFF;font-size:13px;font-family:'Open Sans',Arial,sans-serif;letter-spacing:0.5px;text-transform:uppercase;">
                    ${safeOrgName}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#1A1A1A;font-size:15px;line-height:1.6;font-family:'Open Sans',Arial,sans-serif;">
                  <p style="margin:0 0 20px;color:#1A1A1A;font-size:15px;line-height:1.6;">
                    Hi ${safeName},
                  </p>
                  <div style="color:#1A1A1A;font-size:15px;line-height:1.6;white-space:pre-line;">
                    ${body}
                  </div>
                </td>
              </tr>
              <tr>
                <td bgcolor="#F5F5F5" style="background-color:#F5F5F5;padding:24px 32px;text-align:center;border-top:1px solid #D0D5E8;">
                  <p style="margin:0;color:#555555;font-size:12px;line-height:1.5;font-family:'Open Sans',Arial,sans-serif;">
                    ${safeOrgName}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export async function sendAuditionBulkEmail(params: {
  auditionId: string
  subject: string
  bodyHtml: string
  statusFilter?: AuditionSignupStatus[]
}): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin || !BULK_EMAIL_TIER_ROLES.includes(admin.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const supabase = await getServerClient()

    if (admin.role === 'production') {
      const access = await assertAuditionAccess(supabase, admin, params.auditionId)
      if (!access.allowed) return { success: false, error: access.error ?? 'Insufficient permissions' }
    }

    let signupQuery = supabase
      .from('audition_signups')
      .select('name, email')
      .eq('audition_id', params.auditionId)
      .neq('status', 'withdrawn')

    if (params.statusFilter && params.statusFilter.length > 0) {
      signupQuery = signupQuery.in('status', params.statusFilter)
    }

    const { data: signupRows } = await signupQuery

    const seen = new Set<string>()
    const recipients = (signupRows ?? []).filter((r) => {
      const key = r.email.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    if (recipients.length === 0) {
      return { success: true, count: 0 }
    }

    // resolveEmailSettings() is internal to lib/email.ts (not exported) —
    // same inline app_settings fetch pattern as lib/actions/blast.ts.
    const { data: settingsData } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['email_from_address', 'email_from_name', 'org_name', 'brand_primary'])
    const settingsMap = Object.fromEntries(
      (settingsData ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
    )
    const emailFrom = `${settingsMap['email_from_name'] || '30 By Ninety Theatre Volunteers'} <${
      settingsMap['email_from_address'] || 'volunteers@30byninetyvolunteers.com'
    }>`
    const orgName = settingsMap['org_name'] || '30 By Ninety Theatre'
    const brandPrimary = settingsMap['brand_primary'] || '#293994'

    // Sanitize TipTap HTML before sending (R31) — never escapeHtml() the body.
    const sanitizedBody = sanitizeHtml(params.bodyHtml, {
      allowedTags: ['p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3', 'blockquote', 'hr', 'a'],
      allowedAttributes: { a: ['href', 'rel'] },
      allowedSchemes: ['http', 'https', 'mailto'],
    })

    const payloads = recipients.map((r) => ({
      from: emailFrom,
      to: r.email,
      subject: params.subject,
      html: buildAuditionBulkEmailHtml({
        recipientName: r.name,
        subject: params.subject,
        body: sanitizedBody,
        orgName,
        brandPrimary,
      }),
    }))

    // R8 — sendBatchEmails() chunks into groups of 100 and calls
    // resend.batch.send() per chunk. Never loop resend.emails.send().
    await sendBatchEmails(payloads)

    const { data: logRow, error: logError } = await supabase
      .from('email_log')
      .insert({
        subject: params.subject,
        body_preview: sanitizedBody.replace(/<[^>]+>/g, '').slice(0, 150),
        recipient_type: 'individual',
        recipient_filter: `audition:${params.auditionId}`,
        sent_by: admin.id,
        recipient_count: recipients.length,
      })
      .select('id')
      .single()

    if (logError) {
      console.error('sendAuditionBulkEmail email_log error:', logError)
    } else if (logRow) {
      await supabase.from('email_log_recipients').insert(
        recipients.map((r) => ({
          email_log_id: logRow.id,
          volunteer_id: null,
          email_address: r.email,
        }))
      )
    }

    revalidatePath(`/crew/auditions/${params.auditionId}`)

    return { success: true, count: recipients.length }
  } catch (err) {
    console.error('sendAuditionBulkEmail error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── C12: saveAuditionEmailTemplate ─────────────────────────────

export async function saveAuditionEmailTemplate(params: {
  auditionId: string
  statusType: AuditionEmailStatusType
  subject: string
  bodyHtml: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const supabase = await getServerClient()

    const access = await assertAuditionAccess(supabase, admin, params.auditionId)
    if (!access.allowed) return { success: false, error: access.error ?? 'Insufficient permissions' }

    const { error } = await supabase.from('audition_email_templates').upsert(
      {
        audition_id: params.auditionId,
        status_type: params.statusType,
        subject: params.subject,
        body_html: params.bodyHtml,
        updated_by: admin.id,
      },
      { onConflict: 'audition_id,status_type', ignoreDuplicates: false }
    )

    if (error) {
      console.error('saveAuditionEmailTemplate upsert error:', error)
      return { success: false, error: 'Failed to save template.' }
    }

    revalidatePath(`/crew/auditions/${params.auditionId}`)
    return { success: true }
  } catch (err) {
    console.error('saveAuditionEmailTemplate unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── C13: getAuditionEmailTemplates ─────────────────────────────

export async function getAuditionEmailTemplates(auditionId: string): Promise<AuditionEmailTemplate[]> {
  try {
    const admin = await getAdminUser()
    if (!admin) return []

    const supabase = await getServerClient()

    const access = await assertAuditionAccess(supabase, admin, auditionId)
    if (!access.allowed) return []

    const { data } = await supabase
      .from('audition_email_templates')
      .select('*')
      .eq('audition_id', auditionId)
      .order('status_type', { ascending: true })

    return (data ?? []) as unknown as AuditionEmailTemplate[]
  } catch (err) {
    console.error('getAuditionEmailTemplates error:', err)
    return []
  }
}

// ─── C14: convertToVolunteer ────────────────────────────────────

export async function convertToVolunteer(
  signupId: string
): Promise<{ success: boolean; volunteerId?: string; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin || !EDITOR_TIER_ROLES.includes(admin.role)) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const supabase = await getServerClient()

    const { data: signup } = await supabase
      .from('audition_signups')
      .select('id, audition_id, name, email, phone, status')
      .eq('id', signupId)
      .maybeSingle()

    if (!signup) return { success: false, error: 'Signup not found.' }
    if (signup.status !== 'cast') {
      return { success: false, error: 'Only auditioners with status "Cast" can be converted to a volunteer.' }
    }

    const normalizedEmail = signup.email.toLowerCase()

    const { data: existingVolunteer } = await supabase
      .from('volunteers')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingVolunteer) {
      return { success: false, error: 'A volunteer record with this email already exists.' }
    }

    // audition_signups.phone is now NOT NULL (AUDITIONS.2a Task A Inline
    // Fix 1) — matches volunteers.phone NOT NULL. No absent-phone guard
    // needed; normalizePhone() handles trimming/formatting.
    const { data: volunteer, error: insertError } = await supabase
      .from('volunteers')
      .insert({
        full_name: signup.name,
        email: normalizedEmail,
        phone: normalizePhone(signup.phone),
        status: 'active',
      })
      .select('id')
      .single()

    if (insertError || !volunteer) {
      console.error('convertToVolunteer insert error:', insertError)
      return { success: false, error: 'Failed to create volunteer record.' }
    }

    try {
      await logAction(admin.id, 'audition.convert_to_volunteer', 'volunteer', volunteer.id, undefined, {
        audition_signup_id: signupId,
      })
    } catch (auditError) {
      console.error('convertToVolunteer audit log failed:', auditError)
    }

    revalidatePath(`/crew/auditions/${signup.audition_id}`)
    revalidatePath('/crew/volunteers')

    return { success: true, volunteerId: volunteer.id }
  } catch (err) {
    console.error('convertToVolunteer unexpected error:', err)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ─── E: previewAuditionEmailTemplate ────────────────────────────
//
// Read-only. Renders a preview-only HTML wrapper (not the full email
// client compatibility layer used by buildAuditionBulkEmailHtml() /
// the AUDITIONS.4b send functions) with sample merge tag values
// substituted in, so an admin can see brand colors and layout before
// saving a template.

// Local copy of escapeHtml — same duplication rationale as the
// sendAuditionBulkEmail() escapeHtml() above and lib/utils/merge-tags.ts's
// own local copy. Kept separate (not reused) since this one only ever
// escapes short trusted-shape strings (a hex color, a subject line) for
// inline style/text interpolation — a different call site than either.
function escapeHtmlInline(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function previewAuditionEmailTemplate(
  auditionId: string,
  subject: string,
  bodyHtml: string
): Promise<{ previewHtml: string | null; error?: string }> {
  try {
    const admin = await getAdminUser()
    if (!admin) return { previewHtml: null, error: 'Unauthorized' }

    const supabase = await getServerClient()

    const access = await assertAuditionAccess(supabase, admin, auditionId)
    if (!access.allowed) return { previewHtml: null, error: access.error ?? 'Insufficient permissions' }

    const { data: audition } = await supabase
      .from('auditions')
      .select(
        'id, title, date_start, time_start, shows!auditions_show_id_fkey ( name ), locations!auditions_location_id_fkey ( name )'
      )
      .eq('id', auditionId)
      .single()

    if (!audition) return { previewHtml: null, error: 'Audition not found' }

    // resolveEmailSettings() is internal to lib/email.ts (not exported) —
    // same inline app_settings fetch pattern as sendAuditionBulkEmail().
    const { data: settingsData } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['org_name', 'brand_primary', 'brand_accent', 'email_from_name'])
    const settingsMap = Object.fromEntries(
      (settingsData ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
    )
    const orgName = settingsMap['org_name'] || '30 By Ninety Theatre'
    const brandPrimary = settingsMap['brand_primary'] || '#293994'

    // Supabase normalizes to-one FK joins as either an object or a
    // single-element array depending on relation inference — same
    // normalization pattern used throughout this file and auditions.ts
    // (getAuditionList, getAuditionDetail, getUpcomingAuditions).
    const show = Array.isArray(audition.shows) ? audition.shows[0] : audition.shows
    const location = Array.isArray(audition.locations) ? audition.locations[0] : audition.locations

    const sampleValues: MergeTagValues = {
      auditioner_name: 'Alex Sample',
      show_title: show?.name ?? 'Sample Show',
      audition_title: audition.title,
      audition_date: formatWallClockCT(audition.date_start, null, 'MMMM d, yyyy'),
      audition_location: location?.name ?? 'Main Theater',
      role_name: 'Sample Role',
      cast_role: 'Sample Role',
      org_name: orgName,
    }

    const substitutedBody = substituteMergeTags(bodyHtml, sampleValues)

    const safeBrandPrimary = escapeHtmlInline(brandPrimary)
    const safeSubject = escapeHtmlInline(subject || '(No subject)')

    const previewHtml = `
      <div style="font-family: 'Open Sans', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background: ${safeBrandPrimary}; padding: 16px 24px;">
          <p style="color: white; font-size: 14px; font-weight: 600; margin: 0;">
            ${safeSubject}
          </p>
        </div>
        <div style="padding: 24px; background: white; line-height: 1.6; color: #1a1a1a;">
          ${substitutedBody}
        </div>
        <div style="padding: 16px 24px; background: #f5f5f5; font-size: 12px; color: #555;">
          <em>Preview only — sample data shown</em>
        </div>
      </div>
    `

    return { previewHtml }
  } catch (err) {
    console.error('previewAuditionEmailTemplate error:', err)
    return { previewHtml: null, error: 'An unexpected error occurred.' }
  }
}
