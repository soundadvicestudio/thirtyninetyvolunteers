import type { SupabaseClient } from '@supabase/supabase-js'

// Standard interval overlap: [A.start, A.end) and [B.start, B.end) overlap
// if A.start < B.end AND A.end > B.start.
export async function hasConflict(
  locationId: string,
  startTime: Date,
  endTime: Date,
  supabase: SupabaseClient,
  excludeEventId?: string
): Promise<boolean> {
  let query = supabase
    .from('calendar_events')
    .select('id')
    .eq('location_id', locationId)
    .eq('status', 'approved')
    .lt('start_time', endTime.toISOString())
    .gt('end_time', startTime.toISOString())
    .limit(1)

  if (excludeEventId) {
    query = query.neq('id', excludeEventId)
  }

  const { data } = await query
  return (data ?? []).length > 0
}

// Buffer-aware conflict check used when approving show dates — expands
// the candidate window by the show's buffer_before/after minutes before
// running the same overlap query.
export async function hasConflictWithBuffer(
  locationId: string,
  startTime: Date,
  endTime: Date,
  bufferBeforeMinutes: number,
  bufferAfterMinutes: number,
  supabase: SupabaseClient,
  excludeEventId?: string
): Promise<boolean> {
  const bufferedStart = new Date(startTime.getTime() - bufferBeforeMinutes * 60000)
  const bufferedEnd = new Date(endTime.getTime() + bufferAfterMinutes * 60000)
  return hasConflict(locationId, bufferedStart, bufferedEnd, supabase, excludeEventId)
}
