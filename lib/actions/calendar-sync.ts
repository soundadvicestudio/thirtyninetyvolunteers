import 'server-only'
import { fromZonedTime } from 'date-fns-tz'
import type { SupabaseClient } from '@supabase/supabase-js'

const CT = 'America/Chicago'

type ShowDateWithShowRow = {
  id: string
  show_date: string
  show_time: string
  end_time: string | null
  show: { id: string; name: string; location_id: string } | null
}

// Keeps calendar_events in sync with show_dates whenever a show date is
// created or updated (30BN-CAL.3). Fire-and-forget: errors are logged,
// never thrown — a calendar sync failure must never break a show save.
export async function syncShowDateToCalendar(
  showDateId: string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    const { data: showDateRaw } = await supabase
      .from('show_dates')
      .select(
        `
        id,
        show_date,
        show_time,
        end_time,
        show:shows (
          id,
          name,
          location_id
        )
        `
      )
      .eq('id', showDateId)
      .single()

    if (!showDateRaw) return

    const showDate = showDateRaw as unknown as ShowDateWithShowRow
    if (!showDate.show) return

    // show_date is a bare date and show_time is a time-without-timezone —
    // both are Central Time wall-clock values with no offset attached.
    // fromZonedTime() anchors them to CT (DST-safe) before converting to
    // UTC for storage, matching the confirmed pattern in
    // lib/utils/date.ts's formatWallClockCT() (space separator, not "T").
    const wallClock = `${showDate.show_date} ${showDate.show_time}`
    const startTime = fromZonedTime(wallClock, CT)

    const FALLBACK_DURATION_MS = 3 * 60 * 60 * 1000
    let endTime: Date
    if (showDate.end_time) {
      endTime = fromZonedTime(`${showDate.show_date} ${showDate.end_time}`, CT)
      if (endTime.getTime() <= startTime.getTime()) {
        console.warn(
          `show_date ${showDateId}: end_time is not after show_time — using 3hr fallback`
        )
        endTime = new Date(startTime.getTime() + FALLBACK_DURATION_MS)
      }
    } else {
      // No end_time set yet — 3-hour default is a placeholder until an
      // admin edits the show date with a real end time.
      endTime = new Date(startTime.getTime() + FALLBACK_DURATION_MS)
    }

    await supabase.from('calendar_events').upsert(
      {
        title: showDate.show.name,
        event_type: 'performance',
        location_id: showDate.show.location_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'approved',
        source: 'show',
        source_show_date_id: showDateId,
        submitted_by: null,
        approved_by: null,
      },
      {
        onConflict: 'source_show_date_id',
        ignoreDuplicates: false,
      }
    )
  } catch (err) {
    console.error('syncShowDateToCalendar error:', err)
  }
}
