'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'
import { formatWallClockCT } from '@/lib/utils/date'
import { logAction } from '@/lib/audit'
import {
  sendSlotClaimEmail,
  sendWaitlistConfirmationEmail,
  sendWaitlistPromotionEmail,
  sendCancellationEditorNotificationEmail,
} from '@/lib/email'

export type SubmitClaimInput = {
  roleId: string
  showDateId: string
  volunteerName: string
  volunteerEmail: string
  volunteerPhone: string
  isWaitlist: boolean
  force?: boolean
}

export type SubmitClaimResult =
  | { status: 'claimed'; claimToken: string }
  | { status: 'waitlisted'; position: number; claimToken: string }
  | { status: 'duplicate_same' }
  | { status: 'duplicate_show'; existingDates: string[] }
  | { status: 'error'; message: string }

export async function submitClaim(data: SubmitClaimInput): Promise<SubmitClaimResult> {
  try {
    const roleId = data.roleId
    const showDateId = data.showDateId
    const volunteerName = data.volunteerName.trim()
    const volunteerEmail = data.volunteerEmail.trim().toLowerCase()
    const volunteerPhone = data.volunteerPhone.trim()
    const force = data.force ?? false

    if (!roleId || !showDateId || !volunteerName || !volunteerEmail) {
      return { status: 'error', message: 'Please check your name and email and try again.' }
    }

    if (volunteerName.length > 150 || volunteerEmail.length > 150 || volunteerPhone.length > 30) {
      return { status: 'error', message: 'Please check your name, email, and phone and try again.' }
    }

    const client = getAdminClient()

    // A. Fetch role and show context
    const { data: role, error: roleError } = await client
      .from('volunteer_roles')
      .select('id, role_name, slots_available, show_date_id, category_id')
      .eq('id', roleId)
      .maybeSingle()

    if (roleError || !role) {
      return { status: 'error', message: 'This role could not be found.' }
    }

    if (role.show_date_id !== showDateId) {
      return { status: 'error', message: 'This role does not belong to the selected date.' }
    }

    const { data: showDate, error: showDateError } = await client
      .from('show_dates')
      .select('id, show_id, show_date, show_time')
      .eq('id', showDateId)
      .maybeSingle()

    if (showDateError || !showDate) {
      return { status: 'error', message: 'This date could not be found.' }
    }

    const { data: show, error: showError } = await client
      .from('shows')
      .select('id, name, status, volunteer_instructions')
      .eq('id', showDate.show_id)
      .maybeSingle()

    if (showError || !show || show.status !== 'live') {
      return { status: 'error', message: 'This show is no longer accepting volunteers.' }
    }

    // B. Same role + same date duplicate check (always runs, even with force=true).
    // Two separate parameterized queries (email, phone) rather than a raw
    // .or() filter string — avoids embedding user input into a PostgREST
    // filter expression.
    const [{ data: sameByEmail }, { data: sameByPhone }] = await Promise.all([
      client
        .from('slot_claims')
        .select('id')
        .eq('volunteer_role_id', roleId)
        .eq('show_date_id', showDateId)
        .neq('status', 'cancelled')
        .ilike('volunteer_email', volunteerEmail),
      volunteerPhone
        ? client
            .from('slot_claims')
            .select('id')
            .eq('volunteer_role_id', roleId)
            .eq('show_date_id', showDateId)
            .neq('status', 'cancelled')
            .eq('volunteer_phone', volunteerPhone)
        : Promise.resolve({ data: [] as { id: string }[] }),
    ])

    if ((sameByEmail?.length ?? 0) > 0 || (sameByPhone?.length ?? 0) > 0) {
      return { status: 'duplicate_same' }
    }

    // C. Cross-date same-show duplicate check (only when force=false).
    const { data: otherDates } = await client
      .from('show_dates')
      .select('id, show_date, show_time')
      .eq('show_id', show.id)
      .neq('id', showDateId)

    const otherDateIds = (otherDates ?? []).map((d) => d.id)

    if (!force && otherDateIds.length > 0) {
      const [{ data: crossByEmail }, { data: crossByPhone }] = await Promise.all([
        client
          .from('slot_claims')
          .select('show_date_id')
          .in('show_date_id', otherDateIds)
          .neq('status', 'cancelled')
          .ilike('volunteer_email', volunteerEmail),
        volunteerPhone
          ? client
              .from('slot_claims')
              .select('show_date_id')
              .in('show_date_id', otherDateIds)
              .neq('status', 'cancelled')
              .eq('volunteer_phone', volunteerPhone)
          : Promise.resolve({ data: [] as { show_date_id: string }[] }),
      ])

      const matchedDateIds = new Set([
        ...(crossByEmail ?? []).map((r) => r.show_date_id),
        ...(crossByPhone ?? []).map((r) => r.show_date_id),
      ])

      if (matchedDateIds.size > 0) {
        const existingDates = (otherDates ?? [])
          .filter((d) => matchedDateIds.has(d.id))
          .map((d) => formatWallClockCT(d.show_date, d.show_time, 'MMM d, yyyy'))
        return { status: 'duplicate_show', existingDates }
      }
    }

    // D. Volunteer record lookup — sequential email-then-phone (30BN-2.4 pattern).
    let volunteerId: string | null = null
    const { data: volByEmail } = await client
      .from('volunteers')
      .select('id')
      .ilike('email', volunteerEmail)
      .maybeSingle()
    if (volByEmail) {
      volunteerId = volByEmail.id
    } else if (volunteerPhone) {
      const { data: volByPhone } = await client.from('volunteers').select('id').eq('phone', volunteerPhone).maybeSingle()
      if (volByPhone) volunteerId = volByPhone.id
    }

    // E. Actual slot availability — server-computed, ignores client isWaitlist hint.
    const { count: claimedCount } = await client
      .from('slot_claims')
      .select('id', { count: 'exact', head: true })
      .eq('volunteer_role_id', roleId)
      .eq('status', 'claimed')

    const actuallyFull = (claimedCount ?? 0) >= role.slots_available

    // F. Waitlist position if needed.
    let waitlistPosition: number | null = null
    if (actuallyFull) {
      const { count: waitlistedCount } = await client
        .from('slot_claims')
        .select('id', { count: 'exact', head: true })
        .eq('volunteer_role_id', roleId)
        .eq('status', 'waitlisted')
      waitlistPosition = (waitlistedCount ?? 0) + 1
    }

    // G. Insert.
    const { data: inserted, error: insertError } = await client
      .from('slot_claims')
      .insert({
        volunteer_role_id: roleId,
        show_date_id: showDateId,
        volunteer_id: volunteerId || null,
        volunteer_name: volunteerName,
        volunteer_email: volunteerEmail,
        volunteer_phone: volunteerPhone || null,
        status: actuallyFull ? 'waitlisted' : 'claimed',
        waitlist_position: actuallyFull ? waitlistPosition : null,
      })
      .select('id, claim_token')
      .single()

    if (insertError || !inserted) {
      console.error('submitClaim insert error:', insertError)
      return { status: 'error', message: 'Something went wrong submitting your claim. Please try again.' }
    }

    revalidatePath('/shows')
    revalidatePath(`/shows/${show.id}`)

    // H + I. Confirmation email + email_log — non-blocking, claim is already inserted.
    const formattedDate = formatWallClockCT(showDate.show_date, showDate.show_time, 'MMMM d, yyyy')
    const formattedTime = formatWallClockCT(showDate.show_date, showDate.show_time, 'h:mm a')
    const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/cancel?token=${inserted.claim_token}`

    try {
      let subject: string
      if (actuallyFull) {
        subject = `You're on the waitlist — ${show.name}`
        await sendWaitlistConfirmationEmail({
          to: volunteerEmail,
          volunteerName,
          showName: show.name,
          showDate: formattedDate,
          showTime: formattedTime,
          roleName: role.role_name,
          waitlistPosition: waitlistPosition ?? 0,
          cancelUrl,
        })
      } else {
        subject = `You're signed up! — ${show.name}`
        await sendSlotClaimEmail({
          to: volunteerEmail,
          volunteerName,
          showName: show.name,
          showDate: formattedDate,
          showTime: formattedTime,
          roleName: role.role_name,
          volunteerInstructions: show.volunteer_instructions,
          cancelUrl,
        })
      }

      const { data: logRow } = await client
        .from('email_log')
        .insert({
          sent_by: null,
          subject,
          recipient_type: 'transactional',
          recipient_count: 1,
        })
        .select('id')
        .single()

      if (logRow) {
        await client.from('email_log_recipients').insert({
          email_log_id: logRow.id,
          volunteer_id: volunteerId,
          email_address: volunteerEmail,
        })
      }
    } catch (err) {
      console.error('[email] slot claim confirmation failed:', err)
    }

    // J. Return.
    if (actuallyFull) {
      return { status: 'waitlisted', position: waitlistPosition ?? 0, claimToken: inserted.claim_token }
    }
    return { status: 'claimed', claimToken: inserted.claim_token }
  } catch (err) {
    console.error('submitClaim error:', err)
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}

export type CancelClaimResult = { success: boolean; error?: string }

export async function cancelClaim(token: string, confirmedEmail: string): Promise<CancelClaimResult> {
  try {
    const client = getAdminClient()

    // A. Look up claim by claim_token.
    const { data: claim, error: claimError } = await client
      .from('slot_claims')
      .select('id, status, volunteer_email, volunteer_role_id, show_date_id, volunteer_name, waitlist_position')
      .eq('claim_token', token)
      .maybeSingle()

    if (claimError || !claim) {
      return { success: false, error: 'not_found' }
    }

    if (claim.status === 'cancelled') {
      return { success: false, error: 'already_cancelled' }
    }

    // B. Email verification.
    if (claim.volunteer_email.toLowerCase() !== confirmedEmail.trim().toLowerCase()) {
      return { success: false, error: 'email_mismatch' }
    }

    const wasClaimed = claim.status === 'claimed'
    const wasWaitlistPosition = claim.waitlist_position

    // C. Cancel the claim. This must succeed for cancellation to count.
    const { error: cancelError } = await client
      .from('slot_claims')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', claim.id)

    if (cancelError) {
      console.error('cancelClaim update error:', cancelError)
      return { success: false, error: 'Something went wrong. Please try again.' }
    }

    // Cache revalidation — derive show_id from show_dates for /shows and this show's page.
    const { data: showDateForCache } = await client
      .from('show_dates')
      .select('show_id')
      .eq('id', claim.show_date_id)
      .maybeSingle()
    if (showDateForCache) {
      revalidatePath('/shows')
      revalidatePath(`/shows/${showDateForCache.show_id}`)
    }

    // Everything below is best-effort: the cancellation already succeeded,
    // so promotion/notification failures must not flip the result to false.
    try {
      let promotedClaim: {
        id: string
        volunteer_email: string
        volunteer_name: string
        claim_token: string
      } | null = null

      if (wasClaimed) {
        // D. Promote the next waitlisted volunteer, if any.
        const { data: nextWaitlisted } = await client
          .from('slot_claims')
          .select('id, volunteer_email, volunteer_name, claim_token, waitlist_position')
          .eq('volunteer_role_id', claim.volunteer_role_id)
          .eq('status', 'waitlisted')
          .order('waitlist_position', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (nextWaitlisted) {
          await client
            .from('slot_claims')
            .update({ status: 'claimed', waitlist_position: null })
            .eq('id', nextWaitlisted.id)

          const { data: remaining } = await client
            .from('slot_claims')
            .select('id, waitlist_position')
            .eq('volunteer_role_id', claim.volunteer_role_id)
            .eq('status', 'waitlisted')
            .neq('id', nextWaitlisted.id)

          for (const row of remaining ?? []) {
            if (row.waitlist_position != null) {
              await client
                .from('slot_claims')
                .update({ waitlist_position: row.waitlist_position - 1 })
                .eq('id', row.id)
            }
          }

          promotedClaim = nextWaitlisted
        }
      } else if (wasWaitlistPosition != null) {
        // Cancelling a waitlisted entry — renumber only those behind it.
        const { data: remaining } = await client
          .from('slot_claims')
          .select('id, waitlist_position')
          .eq('volunteer_role_id', claim.volunteer_role_id)
          .eq('status', 'waitlisted')
          .gt('waitlist_position', wasWaitlistPosition)

        for (const row of remaining ?? []) {
          if (row.waitlist_position != null) {
            await client
              .from('slot_claims')
              .update({ waitlist_position: row.waitlist_position - 1 })
              .eq('id', row.id)
          }
        }
      }

      // E. Editor notification + promotion email (only if the cancelled claim was 'claimed').
      if (wasClaimed) {
        const { data: showDateRow } = await client
          .from('show_dates')
          .select('id, show_id, show_date, show_time')
          .eq('id', claim.show_date_id)
          .maybeSingle()

        if (showDateRow) {
          const [{ data: showRow }, { data: roleRow }, { data: editorLinks }] = await Promise.all([
            client.from('shows').select('id, name, volunteer_instructions').eq('id', showDateRow.show_id).maybeSingle(),
            client.from('volunteer_roles').select('role_name').eq('id', claim.volunteer_role_id).maybeSingle(),
            client.from('show_editors').select('admin_id').eq('show_id', showDateRow.show_id),
          ])

          const adminIds = (editorLinks ?? []).map((e) => e.admin_id)
          let editorEmails: string[] = []
          if (adminIds.length > 0) {
            const { data: editors } = await client
              .from('admin_users')
              .select('email')
              .in('id', adminIds)
              .eq('is_active', true)
            editorEmails = (editors ?? []).map((e) => e.email)
          }

          const formattedShowDate = formatWallClockCT(showDateRow.show_date, showDateRow.show_time, 'MMMM d, yyyy')
          const formattedShowTime = formatWallClockCT(showDateRow.show_date, showDateRow.show_time, 'h:mm a')

          if (promotedClaim && showRow && roleRow) {
            try {
              const promoCancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/cancel?token=${promotedClaim.claim_token}`
              await sendWaitlistPromotionEmail({
                to: promotedClaim.volunteer_email,
                volunteerName: promotedClaim.volunteer_name,
                showName: showRow.name,
                showDate: formattedShowDate,
                showTime: formattedShowTime,
                roleName: roleRow.role_name,
                volunteerInstructions: showRow.volunteer_instructions,
                cancelUrl: promoCancelUrl,
              })

              const { data: logRow } = await client
                .from('email_log')
                .insert({
                  sent_by: null,
                  subject: `Good news — a spot opened up! — ${showRow.name}`,
                  recipient_type: 'transactional',
                  recipient_count: 1,
                })
                .select('id')
                .single()

              if (logRow) {
                await client.from('email_log_recipients').insert({
                  email_log_id: logRow.id,
                  email_address: promotedClaim.volunteer_email,
                })
              }
            } catch (err) {
              console.error('[email] waitlist promotion failed:', err)
            }
          }

          if (showRow && roleRow) {
            try {
              const adminShowUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/crew/shows/${showDateRow.show_id}`
              await sendCancellationEditorNotificationEmail({
                to: editorEmails,
                volunteerName: claim.volunteer_name,
                volunteerEmail: claim.volunteer_email,
                showName: showRow.name,
                showDate: formattedShowDate,
                roleName: roleRow.role_name,
                adminShowUrl,
              })

              if (editorEmails.length > 0) {
                const { data: logRow } = await client
                  .from('email_log')
                  .insert({
                    sent_by: null,
                    subject: `Volunteer cancellation — ${showRow.name}`,
                    recipient_type: 'transactional',
                    recipient_count: editorEmails.length,
                  })
                  .select('id')
                  .single()

                if (logRow) {
                  await client
                    .from('email_log_recipients')
                    .insert(editorEmails.map((email) => ({ email_log_id: logRow.id, email_address: email })))
                }
              }
            } catch (err) {
              console.error('[email] cancellation editor notification failed:', err)
            }
          }
        }
      }
    } catch (err) {
      console.error('cancelClaim post-processing error:', err)
    }

    // F. Audit log (R25 — null admin_id for public action). logAction never throws.
    await logAction(null, 'slot_claim.cancel', 'slot_claim', claim.id, { status: claim.status }, { status: 'cancelled' })

    // G. Return.
    return { success: true }
  } catch (err) {
    console.error('cancelClaim error:', err)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
