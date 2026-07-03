'use server'

export type SubmitClaimResult = { success: boolean; error?: string }

// TODO (30BN-5.2) — replace this stub with full slot-claiming logic:
//   - Duplicate claim detection: same volunteer (email/phone) + same
//     show_date_id + volunteer_role_id already active ('claimed' or
//     'waitlisted') → friendly non-discouraging confirmation prompt.
//   - Insert into slot_claims: status 'claimed' if a slot is open,
//     'waitlisted' (with an assigned waitlist_position) if full.
//   - Volunteer record match/link: sequential email-then-phone lookup
//     against `volunteers` (pattern established in
//     lib/actions/submissions.ts) → set slot_claims.volunteer_id.
//   - Confirmation email via Resend (sendSlotClaimEmail), including the
//     show's volunteer_instructions; sendWaitlistConfirmationEmail when
//     isWaitlist.
//   - Audit log entry (logAction(null, 'slot_claim.create', ...) — R25,
//     null admin_id for public-facing actions).
export async function submitClaim(data: {
  roleId: string
  showDateId: string
  volunteerName: string
  volunteerEmail: string
  volunteerPhone: string
  isWaitlist: boolean
}): Promise<SubmitClaimResult> {
  void data
  return { success: false, error: 'Claiming logic ships in 5.2' }
}
