import { formatInTimeZone } from 'date-fns-tz'
import { getAdminClient } from '@/lib/supabase/admin'
import { formatWallClockCT } from '@/lib/utils/date'
import { buildReminderEmailPayload, sendBatchEmails } from '@/lib/email'

const CT = 'America/Chicago'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = getAdminClient()

    // A. Target date: CURRENT_DATE + 1 in CT (DST-safe — same pattern as
    // app/api/cron/thankyou/route.ts). show_date is a bare date column, so
    // once we have the correct CT calendar day, plain UTC date arithmetic
    // on it is safe (no further timezone conversion needed).
    const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')
    const targetDateObj = new Date(`${todayCT}T00:00:00Z`)
    targetDateObj.setUTCDate(targetDateObj.getUTCDate() + 1)
    const targetDate = targetDateObj.toISOString().slice(0, 10)

    const { data: showDates } = await client
      .from('show_dates')
      .select('id, show_id, show_date, show_time, end_time')
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

    // C. Dynamic email settings — from address + logo URL.
    // resolveEmailSettings() is internal to lib/email.ts, so this cron
    // queries app_settings directly using the same fallback defaults.
    const { data: settingsData } = await client
      .from('app_settings')
      .select('key, value')
      .in('key', ['email_from_address', 'email_from_name', 'org_logo_url'])
    const settingsMap = Object.fromEntries(
      (settingsData ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
    )
    const emailFrom = `${settingsMap['email_from_name'] || '30 By Ninety Theatre Volunteers'} <${
      settingsMap['email_from_address'] || 'volunteers@30byninetyvolunteers.com'
    }>`
    const logoUrl = settingsMap['org_logo_url'] || `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`

    // D. Format and batch send.
    const payloads = claims
      .map((claim) => {
        const showDate = dateById.get(claim.show_date_id)
        const show = showDate ? liveShowMap.get(showDate.show_id) : null
        const role = roleById.get(claim.volunteer_role_id)
        if (!showDate || !show || !role) return null

        const showTime = showDate.end_time
          ? `${formatWallClockCT(showDate.show_date, showDate.show_time, 'h:mm a')} – ${formatWallClockCT(showDate.show_date, showDate.end_time, 'h:mm a')}`
          : formatWallClockCT(showDate.show_date, showDate.show_time, 'h:mm a')

        return {
          ...buildReminderEmailPayload({
            to: claim.volunteer_email,
            volunteerName: claim.volunteer_name,
            showName: show.name,
            showDate: formatWallClockCT(showDate.show_date, showDate.show_time, 'EEEE, MMMM d, yyyy'),
            showTime,
            roleName: role.role_name,
            volunteerInstructions: show.volunteer_instructions,
            logoUrl,
          }),
          from: emailFrom,
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)

    try {
      await sendBatchEmails(payloads)

      // E. Log the send.
      const { data: logRow } = await client
        .from('email_log')
        .insert({
          sent_by: null,
          subject: '24hr volunteer reminder',
          body_preview: 'Your volunteer call is tomorrow.',
          recipient_type: 'transactional',
          recipient_filter: 'cron:reminders',
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

    // F. Return.
    return Response.json({ reminders: claims.length })
  } catch (err) {
    console.error('[cron/reminders] error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
