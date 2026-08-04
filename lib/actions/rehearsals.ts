'use server'

// PUBLIC ROUTE — getAdminClient() only, never getServerClient()
// Serves app/rehearsal-checkin/[token]/page.tsx
// No Supabase Auth session available on this route.

import { getAdminClient } from '@/lib/supabase/admin'
import { resolveEffectiveRoster } from '@/lib/utils/rehearsal-roster'
import type { RehearsalCheckInData, CheckInToRehearsalResult } from '@/types/rehearsal'

export async function getRehearsalCheckInData(token: string): Promise<RehearsalCheckInData | null> {
  const supabase = getAdminClient()

  const { data: event } = await supabase
    .from('calendar_events')
    .select('id, title, start_time, end_time, location_id, rehearsal_batch_id, status')
    .eq('check_in_token', token)
    .maybeSingle()

  if (!event) return null

  let batchTitle = event.title
  if (event.rehearsal_batch_id) {
    const { data: batch } = await supabase
      .from('rehearsal_batches')
      .select('title')
      .eq('id', event.rehearsal_batch_id)
      .maybeSingle()
    if (batch) batchTitle = batch.title
  }

  const roster = await resolveEffectiveRoster(supabase, event.id, event.rehearsal_batch_id)

  return {
    event,
    batchTitle,
    effectiveRoster: roster.map((r) => ({ id: r.id, full_name: r.full_name })),
  }
}

export async function checkInToRehearsal(token: string, adminUserId: string): Promise<CheckInToRehearsalResult> {
  try {
    const data = await getRehearsalCheckInData(token)
    if (!data) {
      return { result: 'invalid-token' }
    }

    const onRoster = data.effectiveRoster.some((r) => r.id === adminUserId)
    if (!onRoster) {
      return { result: 'not-on-roster' }
    }

    const supabase = getAdminClient()
    const nowIso = new Date().toISOString()

    const { data: inserted, error: insertError } = await supabase
      .from('rehearsal_attendance')
      .upsert(
        {
          calendar_event_id: data.event.id,
          admin_user_id: adminUserId,
          status: 'showed',
          source: 'checkin',
          checked_in_at: nowIso,
        },
        { onConflict: 'calendar_event_id,admin_user_id', ignoreDuplicates: true }
      )
      .select('checked_in_at')

    if (insertError) {
      console.error('checkInToRehearsal insert error:', insertError)
      return { result: 'error' }
    }

    if (!inserted || inserted.length === 0) {
      const { data: existing } = await supabase
        .from('rehearsal_attendance')
        .select('checked_in_at, created_at')
        .eq('calendar_event_id', data.event.id)
        .eq('admin_user_id', adminUserId)
        .maybeSingle()
      return {
        result: 'already-checked-in',
        checkedInAt: existing?.checked_in_at ?? existing?.created_at ?? nowIso,
      }
    }

    return { result: 'success', checkedInAt: nowIso }
  } catch (err) {
    console.error('checkInToRehearsal unexpected error:', err)
    return { result: 'error' }
  }
}
