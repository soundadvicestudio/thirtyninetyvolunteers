import { getAdminClient } from '@/lib/supabase/admin'
import { formatWallClockCT } from '@/lib/utils/date'
import { buildReminderEmailPayload, sendBatchEmails } from '@/lib/email'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = getAdminClient()

    // A. Target date: CURRENT_DATE + 1 in UTC.
    const now = new Date()
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
    const targetDate = tomorrow.toISOString().slice(0, 10)

    const { data: showDates } = await client
      .from('show_dates')
      .select('id, show_id, show_date, show_time')
      .eq('show_date', targetDate)

    if (!showDates || showDates.length === 0) {
      return Response.json({ reminders: 0 })
    }

    const showIds = [...new Set(showDates.map((d) => d.show_id))]
    const { data: liveShows } = await client
      .from('shows')
      .select('id, name, volunteer_instructions, status')
      .in('id', showIds)
      .eq('status', 'live')

    const liveShowMap = new Map((liveShows ?? []).map((s) => [s.id, s]))
    const eligibleDates = showDates.filter((d) => liveShowMap.has(d.show_id))

    if (eligibleDates.length === 0) {
      return Response.json({ reminders: 0 })
    }

    const dateIds = eligibleDates.map((d) => d.id)
    const dateById = new Map(eligibleDates.map((d) => [d.id, d]))

    const { data: claims } = await client
      .from('slot_claims')
      .select('id, volunteer_id, volunteer_name, volunteer_email, volunteer_role_id, show_date_id')
      .in('show_date_id', dateIds)
      .eq('status', 'claimed')

    if (!claims || claims.length === 0) {
      return Response.json({ reminders: 0 })
    }

    const roleIds = [...new Set(claims.map((c) => c.volunteer_role_id))]
    const { data: roles } = await client.from('volunteer_roles').select('id, role_name').in('id', roleIds)
    const roleById = new Map((roles ?? []).map((r) => [r.id, r]))

    // C. Format and batch send.
    const payloads = claims
      .map((claim) => {
        const showDate = dateById.get(claim.show_date_id)
        const show = showDate ? liveShowMap.get(showDate.show_id) : null
        const role = roleById.get(claim.volunteer_role_id)
        if (!showDate || !show || !role) return null

        return buildReminderEmailPayload({
          to: claim.volunteer_email,
          volunteerName: claim.volunteer_name,
          showName: show.name,
          showDate: formatWallClockCT(showDate.show_date, showDate.show_time, 'EEEE, MMMM d, yyyy'),
          showTime: formatWallClockCT(showDate.show_date, showDate.show_time, 'h:mm a'),
          roleName: role.role_name,
          volunteerInstructions: show.volunteer_instructions,
        })
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)

    try {
      await sendBatchEmails(payloads)

      // D. Log the send.
      const { data: logRow } = await client
        .from('email_log')
        .insert({
          sent_by: null,
          subject: '24hr volunteer reminder',
          recipient_type: 'transactional',
          recipient_count: claims.length,
        })
        .select('id')
        .single()

      if (logRow) {
        await client.from('email_log_recipients').insert(
          claims.map((c) => ({
            email_log_id: logRow.id,
            volunteer_id: c.volunteer_id,
            email_address: c.volunteer_email,
          }))
        )
      }
    } catch (err) {
      console.error('[cron/reminders] batch send or logging failed:', err)
    }

    // E. Return.
    return Response.json({ reminders: claims.length })
  } catch (err) {
    console.error('[cron/reminders] error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
