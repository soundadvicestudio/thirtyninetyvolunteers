import { formatInTimeZone } from 'date-fns-tz'
import { getAdminClient } from '@/lib/supabase/admin'
import { formatWallClockCT } from '@/lib/utils/date'
import { buildThankYouEmailPayload, sendBatchEmails } from '@/lib/email'

const CT = 'America/Chicago'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = getAdminClient()

    // A. Target date: CURRENT_DATE - 2 in CT (DST-safe — see QuickStats.tsx
    // getUpcomingShowsThisMonth for the same pattern). show_date is a bare
    // date column, so once we have the correct CT calendar day, plain UTC
    // date arithmetic on it is safe (no further timezone conversion needed).
    const todayCT = formatInTimeZone(new Date(), CT, 'yyyy-MM-dd')
    const targetDateObj = new Date(`${todayCT}T00:00:00Z`)
    targetDateObj.setUTCDate(targetDateObj.getUTCDate() - 2)
    const targetDate = targetDateObj.toISOString().slice(0, 10)

    const { data: showDates } = await client
      .from('show_dates')
      .select('id, show_id, show_date, show_time')
      .eq('show_date', targetDate)
      .is('thank_you_sent_at', null)

    if (!showDates || showDates.length === 0) {
      return Response.json({ processed: 0, sent: 0, skipped: 0 })
    }

    const showIds = [...new Set(showDates.map((d) => d.show_id))]
    const { data: shows } = await client.from('shows').select('id, name').in('id', showIds)
    const showById = new Map((shows ?? []).map((s) => [s.id, s]))

    // B. Batch-fetch claimed slot_claims + showed attendance across all
    // dates in two queries, then group in JS by show_date_id — avoids a
    // separate round trip per date.
    const dateIds = showDates.map((d) => d.id)
    const { data: allClaims } = await client
      .from('slot_claims')
      .select('id, show_date_id, volunteer_name, volunteer_email')
      .in('show_date_id', dateIds)
      .eq('status', 'claimed')

    const claimIds = (allClaims ?? []).map((c) => c.id)
    const { data: allAttendance } =
      claimIds.length > 0
        ? await client.from('attendance').select('slot_claim_id').in('slot_claim_id', claimIds).eq('status', 'showed')
        : { data: [] as { slot_claim_id: string }[] }

    const showedClaimIds = new Set((allAttendance ?? []).map((a) => a.slot_claim_id))

    const claimsByDate = new Map<string, { id: string; volunteer_name: string; volunteer_email: string }[]>()
    for (const c of allClaims ?? []) {
      if (!showedClaimIds.has(c.id)) continue
      const list = claimsByDate.get(c.show_date_id) ?? []
      list.push(c)
      claimsByDate.set(c.show_date_id, list)
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    let totalSent = 0
    let skipped = 0

    for (const date of showDates) {
      const show = showById.get(date.show_id)
      if (!show) {
        skipped++
        continue
      }

      const showedClaims = claimsByDate.get(date.id) ?? []

      // C. Deduplicate by lowercased email — same logic as sendShowBulkEmail.
      const recipientMap = new Map<string, { name: string; email: string }>()
      for (const c of showedClaims) {
        const key = c.volunteer_email.toLowerCase()
        recipientMap.set(key, { name: c.volunteer_name, email: c.volunteer_email })
      }
      const recipients = [...recipientMap.values()]

      if (recipients.length === 0) {
        // No showed volunteers — mark sent so this date isn't re-checked
        // on every future run. No emails to send or log.
        skipped++
        await client.from('show_dates').update({ thank_you_sent_at: new Date().toISOString() }).eq('id', date.id)
        continue
      }

      // D. Build payloads.
      const formattedDate = formatWallClockCT(date.show_date, null, 'MMMM d, yyyy')
      const payloads = recipients.map((r) =>
        buildThankYouEmailPayload({
          recipientEmail: r.email,
          recipientName: r.name,
          showName: show.name,
          showDate: formattedDate,
          siteUrl,
        })
      )

      try {
        // E. Send.
        await sendBatchEmails(payloads)

        // F. Log.
        const bodyPreview = `Thank you so much for volunteering for ${show.name} on ${formattedDate}. Your time and dedication make 30 By Ninety Theatre possible.`.slice(
          0,
          200
        )

        const { data: logRow } = await client
          .from('email_log')
          .insert({
            sent_by: null,
            subject: `Thank you for volunteering — ${show.name}`,
            body_preview: bodyPreview,
            recipient_type: 'transactional',
            recipient_filter: `show_date:${date.id}`,
            reply_to: payloads[0]?.replyTo ?? null,
            recipient_count: recipients.length,
          })
          .select('id')
          .single()

        if (logRow) {
          await client.from('email_log_recipients').insert(
            recipients.map((r) => ({
              email_log_id: logRow.id,
              volunteer_id: null,
              email_address: r.email,
            }))
          )
        }

        // G. Mark sent — only after send + log succeed, so a failure is
        // retried on the next run rather than silently skipped forever.
        await client.from('show_dates').update({ thank_you_sent_at: new Date().toISOString() }).eq('id', date.id)

        totalSent += recipients.length
      } catch (err) {
        console.error('[cron/thankyou] send/log failed for show_date', date.id, err)
      }
    }

    // H. Return.
    return Response.json({ processed: showDates.length, sent: totalSent, skipped })
  } catch (err) {
    console.error('[cron/thankyou] error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
