'use server'

import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'
import { formatWallClockCT } from '@/lib/utils/date'
import { getOrgTimezone } from '@/lib/utils/org-timezone'
import { normalizePhone } from '@/lib/utils/phone'
import { logAction } from '@/lib/audit'
import { createNotification } from '@/lib/utils/notifications'
import {
  sendSlotClaimEmail,
  sendWaitlistConfirmationEmail,
  sendWaitlistPromotionEmail,
  sendSlotCancellationEmail,
  sendUpdateLinkEmail,
} from '@/lib/email'

export type SubmitClaimInput = {
  roleId: string
  showDateId: string
  volunteerName: string
  volunteerEmail: string
  volunteerPhone: string
  isWaitlist: boolean
  force?: boolean
  honeypot?: string
  knownVolunteerId?: string
}

export type SubmitClaimResult =
  | { status: 'claimed'; claimToken: string }
  | { status: 'waitlisted'; position: number; claimToken: string }
  | { status: 'duplicate_same' }
  | { status: 'duplicate_show'; existingDates: string[] }
  | { status: 'error'; message: string }

// ADMIN.62 — lookup-first slot claim gate. Public route, getAdminClient()
// only. Sequential email-then-phone maybeSingle() lookup — matches the
// pattern established in claims.ts/callboard.ts (avoids embedding raw user
// input into a PostgREST .or() filter expression).
export async function lookupVolunteerForClaim(
  email: string,
  phone: string
): Promise<
  | { found: true; volunteerId: string; volunteerName: string }
  | { found: false }
> {
  const supabase = getAdminClient()

  // Try email first (lowercased + trimmed)
  if (email.trim()) {
    const { data: byEmail } = await supabase
      .from('volunteers')
      .select('id, full_name')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (byEmail) {
      return {
        found: true,
        volunteerId: byEmail.id,
        volunteerName: byEmail.full_name,
      }
    }
  }

  // Try normalized phone
  if (phone.trim()) {
    const normalizedPhone = normalizePhone(phone)
    const { data: byPhone } = await supabase
      .from('volunteers')
      .select('id, full_name')
      .eq('phone', normalizedPhone)
      .maybeSingle()

    if (byPhone) {
      return {
        found: true,
        volunteerId: byPhone.id,
        volunteerName: byPhone.full_name,
      }
    }
  }

  return { found: false }
}

// ADMIN.62 — atomic (best-effort sequential) lookup-or-create + claim for
// the "not found" path. Volunteer is created first, then the claim is
// submitted via submitClaim() with the resolved knownVolunteerId so its
// internal lookup is skipped. Public route, getAdminClient() only.
export async function submitClaimWithLookup(input: {
  roleId: string
  showDateId: string
  volunteerName: string
  volunteerEmail: string
  volunteerPhone: string
  isWaitlist: boolean
  honeypot: string
}): Promise<
  | { status: 'claimed'; claimToken: string }
  | { status: 'waitlisted'; position: number; claimToken: string }
  | { status: 'error'; message: string }
> {
  if (input.honeypot) {
    return { status: 'claimed', claimToken: crypto.randomUUID() }
  }

  const supabase = getAdminClient()
  const normalizedPhone = normalizePhone(input.volunteerPhone)
  const normalizedEmail = input.volunteerEmail.toLowerCase().trim()
  const trimmedName = input.volunteerName.trim()

  try {
    let volunteerId: string

    // Step 1: Check for race-condition duplicate (volunteer may have been
    // created between the client lookup and now). Sequential queries —
    // consistent with codebase pattern.
    const { data: existingByEmail } = await supabase
      .from('volunteers')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingByEmail) {
      volunteerId = existingByEmail.id
    } else {
      const { data: existingByPhone } = await supabase
        .from('volunteers')
        .select('id')
        .eq('phone', normalizedPhone)
        .maybeSingle()

      if (existingByPhone) {
        volunteerId = existingByPhone.id
      } else {
        // Step 2: Create new volunteer record. SELECT id AND update_token
        // in the same INSERT response — no second round-trip.
        const { data: newVolunteer, error: insertError } = await supabase
          .from('volunteers')
          .insert({
            full_name: trimmedName,
            email: normalizedEmail,
            phone: normalizedPhone,
          })
          .select('id, update_token')
          .single()

        if (insertError?.code === '23505') {
          // Unique constraint race — fetch existing
          const { data: raceByEmail } = await supabase
            .from('volunteers')
            .select('id')
            .eq('email', normalizedEmail)
            .maybeSingle()
          const { data: raceByPhone } = await supabase
            .from('volunteers')
            .select('id')
            .eq('phone', normalizedPhone)
            .maybeSingle()
          const raceVolunteer = raceByEmail ?? raceByPhone
          if (!raceVolunteer) {
            return {
              status: 'error',
              message: 'Unable to create your volunteer record.',
            }
          }
          volunteerId = raceVolunteer.id
        } else if (insertError || !newVolunteer) {
          return {
            status: 'error',
            message: 'Unable to create your volunteer record.',
          }
        } else {
          volunteerId = newVolunteer.id

          // Step 3: Send update-link email so the new volunteer can
          // complete their profile. NON-BLOCKING — email failure must
          // never fail the claim.
          try {
            await sendUpdateLinkEmail({
              to: normalizedEmail,
              name: trimmedName,
              updateToken: newVolunteer.update_token,
              volunteerId,
            })
          } catch {
            // Non-fatal — swallow silently
          }
        }
      }
    }

    // Step 4: Submit the claim with the resolved volunteerId. submitClaim()
    // handles all duplicate checks, waitlist logic, confirmation email,
    // and email_log write.
    const claimResult = await submitClaim({
      roleId: input.roleId,
      showDateId: input.showDateId,
      volunteerName: trimmedName,
      volunteerEmail: normalizedEmail,
      volunteerPhone: normalizedPhone,
      isWaitlist: input.isWaitlist,
      force: false,
      honeypot: '',
      knownVolunteerId: volunteerId,
    })

    if (claimResult.status === 'claimed' || claimResult.status === 'waitlisted' || claimResult.status === 'error') {
      return claimResult
    }

    // duplicate_same / duplicate_show are not expected for a
    // just-resolved volunteer, but degrade gracefully rather than
    // returning a status outside this function's narrower result type.
    return {
      status: 'error',
      message: 'You appear to already have a claim for this show. Please check your email for details.',
    }
  } catch (err) {
    console.error('submitClaimWithLookup error:', err)
    return {
      status: 'error',
      message: 'An unexpected error occurred.',
    }
  }
}

export async function submitClaim(data: SubmitClaimInput): Promise<SubmitClaimResult> {
  try {
    // Honeypot: bots fill hidden fields humans never see. Silent fake success.
    if (data.honeypot) {
      return { status: 'claimed', claimToken: crypto.randomUUID() }
    }

    const roleId = data.roleId
    const showDateId = data.showDateId
    const volunteerName = data.volunteerName.trim()
    const volunteerEmail = data.volunteerEmail.trim().toLowerCase()
    const volunteerPhone = normalizePhone(data.volunteerPhone.trim())
    const force = data.force ?? false

    if (!roleId || !showDateId || !volunteerName || !volunteerEmail) {
      return { status: 'error', message: 'Please check your name and email and try again.' }
    }

    if (volunteerName.length > 150 || volunteerEmail.length > 150 || volunteerPhone.length > 30) {
      return { status: 'error', message: 'Please check your name, email, and phone and try again.' }
    }

    const client = getAdminClient()
    const flags = await getFeatureFlags(client)
    const tz = await getOrgTimezone(client)

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
          .map((d) => formatWallClockCT(d.show_date, d.show_time, 'MMM d, yyyy', tz))
        return { status: 'duplicate_show', existingDates }
      }
    }

    // D. Volunteer record lookup — sequential email-then-phone (30BN-2.4 pattern).
    // Skipped when knownVolunteerId is already resolved (ADMIN.62 lookup-first gate).
    let volunteerId: string | null = data.knownVolunteerId ?? null

    if (!volunteerId) {
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
    const formattedDate = formatWallClockCT(showDate.show_date, showDate.show_time, 'MMMM d, yyyy', tz)
    const formattedTime = formatWallClockCT(showDate.show_date, showDate.show_time, 'h:mm a', tz)
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
          claimToken: inserted.claim_token,
          calendarEnabled: flags.calendar,
        })
      }

      const { data: logRow } = await client
        .from('email_log')
        .insert({
          sent_by: null,
          subject,
          body_preview: actuallyFull
            ? `You are on the waitlist for ${role.role_name} — ${show.name}`.slice(0, 150)
            : `Your volunteer spot is confirmed — ${role.role_name} for ${show.name}`.slice(0, 150),
          recipient_type: 'transactional',
          recipient_filter: actuallyFull ? 'trigger:waitlist_added' : 'trigger:slot_claim',
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
    const flags = await getFeatureFlags(client)
    const tz = await getOrgTimezone(client)

    // A. Look up claim by claim_token.
    const { data: claim, error: claimError } = await client
      .from('slot_claims')
      .select('id, status, volunteer_email, volunteer_role_id, show_date_id, volunteer_name, waitlist_position, volunteer_id')
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
        volunteer_id: string | null
      } | null = null

      if (wasClaimed) {
        // D. Promote the next waitlisted volunteer, if any.
        const { data: nextWaitlisted } = await client
          .from('slot_claims')
          .select('id, volunteer_email, volunteer_name, claim_token, waitlist_position, volunteer_id')
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

          const { error: renumberError } = await client.rpc('renumber_waitlist', {
            p_role_id: claim.volunteer_role_id,
            p_cancelled_position: nextWaitlisted.waitlist_position ?? 0,
          })
          if (renumberError) {
            console.error('Waitlist renumber failed:', renumberError)
            // Non-fatal — cancellation succeeded, renumbering
            // failure is logged but does not block the response
          }

          promotedClaim = nextWaitlisted
        }
      } else if (wasWaitlistPosition != null) {
        // Cancelling a waitlisted entry — renumber only those behind it.
        const { error: renumberError } = await client.rpc('renumber_waitlist', {
          p_role_id: claim.volunteer_role_id,
          p_cancelled_position: wasWaitlistPosition,
        })
        if (renumberError) {
          console.error('Waitlist renumber failed:', renumberError)
          // Non-fatal — cancellation succeeded, renumbering
          // failure is logged but does not block the response
        }
      }

      // E. Fetch show/date/role context — needed for the volunteer
      // cancellation confirmation email (ADMIN.64, fires for both
      // 'claimed' and 'waitlisted' cancellations) and, when the claim
      // was 'claimed', for in-app editor notifications + the waitlist
      // promotion email.
      const { data: showDateRow } = await client
        .from('show_dates')
        .select('id, show_id, show_date, show_time')
        .eq('id', claim.show_date_id)
        .maybeSingle()

      if (showDateRow) {
        const [{ data: showRow }, { data: roleRow }] = await Promise.all([
          client.from('shows').select('id, name, volunteer_instructions').eq('id', showDateRow.show_id).maybeSingle(),
          client.from('volunteer_roles').select('role_name').eq('id', claim.volunteer_role_id).maybeSingle(),
        ])

        const formattedShowDate = formatWallClockCT(showDateRow.show_date, showDateRow.show_time, 'MMMM d, yyyy', tz)
        const formattedShowTime = formatWallClockCT(showDateRow.show_date, showDateRow.show_time, 'h:mm a', tz)

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
              claimToken: promotedClaim.claim_token,
              calendarEnabled: flags.calendar,
            })

            const { data: logRow } = await client
              .from('email_log')
              .insert({
                sent_by: null,
                subject: `Good news — a spot opened up! — ${showRow.name}`,
                body_preview: `Good news — a spot opened up for ${roleRow.role_name} at ${showRow.name}`.slice(
                  0,
                  150
                ),
                recipient_type: 'transactional',
                recipient_filter: 'trigger:waitlist_promoted',
                recipient_count: 1,
              })
              .select('id')
              .single()

            if (logRow) {
              await client.from('email_log_recipients').insert({
                email_log_id: logRow.id,
                volunteer_id: promotedClaim.volunteer_id,
                email_address: promotedClaim.volunteer_email,
              })
            }
          } catch (err) {
            console.error('[email] waitlist promotion failed:', err)
          }
        }

        // ADMIN.64 — in-app notification to each show editor, replacing
        // the former sendCancellationEditorNotificationEmail() call.
        // Scope unchanged from the original code: claimed-slot
        // cancellations only — waitlisted cancellations never notified
        // editors before, and still don't.
        if (wasClaimed && showRow && roleRow) {
          const { data: editorLinks } = await client
            .from('show_editors')
            .select('admin_id')
            .eq('show_id', showDateRow.show_id)

          const adminIds = (editorLinks ?? []).map((e) => e.admin_id)
          let editorAdminIds: string[] = []
          if (adminIds.length > 0) {
            const { data: editors } = await client
              .from('admin_users')
              .select('id')
              .in('id', adminIds)
              .eq('is_active', true)
            editorAdminIds = (editors ?? []).map((e) => e.id)
          }

          const notifTitle = `Volunteer cancellation — ${showRow.name}`
          const notifHref = `/crew/shows/${showDateRow.show_id}`
          const notifBody = `${claim.volunteer_name} (${claim.volunteer_email}) cancelled their ${roleRow.role_name} spot for ${showRow.name} on ${formattedShowDate}.`

          void (async () => {
            try {
              for (const editorAdminId of editorAdminIds) {
                await createNotification(editorAdminId, 'slot_cancellation', notifTitle, notifHref, notifBody, client)
              }
            } catch {
              // Non-fatal — swallow silently
            }
          })()
        }

        // ADMIN.64 — cancellation confirmation to the volunteer. Fires
        // from cancelClaim() directly so both cancellation paths (Call
        // Board + email link) trigger it. Non-blocking — email failure
        // must never fail the cancellation.
        if (showRow && roleRow) {
          try {
            await sendSlotCancellationEmail({
              to: claim.volunteer_email,
              volunteerName: claim.volunteer_name,
              showName: showRow.name,
              showDate: formattedShowDate,
              showTime: formattedShowTime,
              roleName: roleRow.role_name,
            })

            const { data: logRow } = await client
              .from('email_log')
              .insert({
                sent_by: null,
                subject: `Your slot has been cancelled — ${showRow.name}`,
                body_preview: `Your volunteer spot for ${roleRow.role_name} at ${showRow.name} has been cancelled`.slice(
                  0,
                  150
                ),
                recipient_type: 'transactional',
                recipient_filter: 'trigger:slot_cancellation',
                recipient_count: 1,
              })
              .select('id')
              .single()

            if (logRow) {
              await client.from('email_log_recipients').insert({
                email_log_id: logRow.id,
                volunteer_id: claim.volunteer_id,
                email_address: claim.volunteer_email,
              })
            }
          } catch (err) {
            console.error('[email] slot cancellation confirmation failed:', err)
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

// ADMIN.63 — Call Board cancel wrapper. The volunteer is already
// authenticated via the callboard_session cookie, so cancelClaim()'s own
// email-match re-check is redundant-but-harmless here (the caller always
// passes the session's own email). CancelClaimResult has success/error
// fields only — no status or message fields.
export async function cancelClaimFromCallboard(
  claimToken: string,
  volunteerEmail: string
): Promise<{ success: true } | { error: string }> {
  try {
    const result = await cancelClaim(claimToken, volunteerEmail)
    if (result.success) {
      return { success: true }
    }
    return { error: result.error ?? 'Could not cancel this slot.' }
  } catch {
    return { error: 'An unexpected error occurred.' }
  }
}
