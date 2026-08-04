import type { SupabaseClient } from '@supabase/supabase-js'

// Effective roster = schedule-level assignees MINUS per-date excludes PLUS
// per-date includes. Implemented as TypeScript set math, not a SECURITY
// DEFINER RPC (Brief §11).
export function computeEffectiveRosterIds(
  scheduleAssigneeIds: string[],
  excludeIds: string[],
  includeIds: string[]
): string[] {
  const excludeSet = new Set(excludeIds)
  const effective = new Set(scheduleAssigneeIds.filter((id) => !excludeSet.has(id)))
  includeIds.forEach((id) => effective.add(id))
  return Array.from(effective)
}

export type EffectiveRosterMember = { id: string; full_name: string; email: string; role: string }

// Accepts the supabase client as a parameter — caller constructs it
// (getAdminClient() for the public check-in route, getServerClient() for
// authenticated admin contexts). Same principle as hasConflict() in
// lib/utils/calendar-conflict.ts.
export async function resolveEffectiveRoster(
  supabase: SupabaseClient,
  calendarEventId: string,
  rehearsalBatchId: string | null
): Promise<EffectiveRosterMember[]> {
  const [{ data: scheduleRows }, { data: excludeRows }, { data: includeRows }] = await Promise.all([
    rehearsalBatchId
      ? supabase
          .from('rehearsal_schedule_assignments')
          .select('admin_user_id')
          .eq('rehearsal_batch_id', rehearsalBatchId)
      : Promise.resolve({ data: [] as { admin_user_id: string }[] }),
    supabase
      .from('rehearsal_date_assignments')
      .select('admin_user_id')
      .eq('calendar_event_id', calendarEventId)
      .eq('override_type', 'exclude'),
    supabase
      .from('rehearsal_date_assignments')
      .select('admin_user_id')
      .eq('calendar_event_id', calendarEventId)
      .eq('override_type', 'include'),
  ])

  const effectiveIds = computeEffectiveRosterIds(
    (scheduleRows ?? []).map((r: { admin_user_id: string }) => r.admin_user_id),
    (excludeRows ?? []).map((r: { admin_user_id: string }) => r.admin_user_id),
    (includeRows ?? []).map((r: { admin_user_id: string }) => r.admin_user_id)
  )

  if (effectiveIds.length === 0) return []

  const { data: users } = await supabase.from('admin_users').select('id, name, email, role').in('id', effectiveIds)

  return (users ?? []).map((u: { id: string; name: string; email: string; role: string }) => ({
    id: u.id,
    full_name: u.name,
    email: u.email,
    role: u.role,
  }))
}
