import 'server-only'
import { Resend } from 'resend'
import { getAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type ConfirmationEmailParams = {
  to: string
  name: string
  updateToken: string
  categoryNames: string[]
  volunteerId?: string | null
}

export async function sendVolunteerConfirmationEmail({
  to,
  name,
  updateToken,
  categoryNames,
  volunteerId,
}: ConfirmationEmailParams): Promise<void> {
  const updateUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/update?token=${updateToken}`
  const safeName = escapeHtml(name)

  const categoriesHtml =
    categoryNames.length > 0
      ? `<p style="color:#555;margin:16px 0 8px;">
           Your areas of interest:
         </p>
         <ul style="color:#555;margin:0;padding-left:20px;">
           ${categoryNames.map(n =>
             `<li style="margin-bottom:4px;">${escapeHtml(n)}</li>`
           ).join('')}
         </ul>`
      : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;
                 font-family:'Open Sans',Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;
                  background:#ffffff;border-radius:8px;
                  overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:#293994;padding:28px 32px;">
          <p style="margin:0;color:#ffffff;font-size:20px;
                    font-weight:700;letter-spacing:0.5px;">
            30 By Ninety Theatre
          </p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <h1 style="color:#293994;font-size:22px;font-weight:700;
                     margin:0 0 12px;">
            Welcome to the family, ${safeName}!
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            Thank you for signing up to volunteer with 30 By Ninety
            Theatre. We're so glad you're here — volunteers like you
            are what make every production possible.
          </p>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            We'll reach out when opportunities match your interests.
            In the meantime, you can update your information any time
            using the link below.
          </p>
          <p style="color:#555;line-height:1.6;margin:16px 0 0;">
            In the meantime, you can browse current volunteer opportunities
            on our shows page — new calls are posted throughout the season.
          </p>
          <div style="margin:16px 0 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shows"
               style="color:#293994;font-weight:600;text-decoration:underline;">
              View Volunteer Opportunities →
            </a>
          </div>

          ${categoriesHtml}

          <!-- CTA -->
          <div style="margin:28px 0 0;">
            <a href="${updateUrl}"
               style="display:inline-block;background:#F26522;
                      color:#ffffff;text-decoration:none;
                      padding:14px 28px;border-radius:8px;
                      font-weight:700;font-size:15px;">
              Update My Information
            </a>
          </div>
          <p style="color:#aaa;font-size:12px;margin:16px 0 0;">
            Or copy this link: ${updateUrl}
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f5f5f5;padding:16px 32px;
                    border-top:1px solid #D0D5E8;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            30 By Ninety Theatre · Old Mandeville, Louisiana
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const subject = `Welcome to 30 By Ninety Theatre, ${name}!`

  await resend.emails.send({
    from: '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    to,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview:
      `Thank you for signing up to volunteer with 30 By Ninety Theatre. We're so glad you're here — volunteers like you are what make every production possible.`.slice(
        0,
        150
      ),
    recipientType: 'transactional',
    recipientFilter: 'trigger:signup',
    sentBy: null,
    recipients: [{ email: to, volunteerId: volunteerId ?? null }],
  })
}

// ─── Update link email ───────────────────────────────────────────

type UpdateLinkEmailParams = {
  to: string
  name: string
  updateToken: string
}

export async function sendUpdateLinkEmail({
  to,
  name,
  updateToken,
}: UpdateLinkEmailParams): Promise<void> {
  const updateUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/update?token=${updateToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;
                 font-family:'Open Sans',Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;
                  background:#ffffff;border-radius:8px;
                  overflow:hidden;
                  box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <div style="background:#293994;padding:28px 32px;">
          <p style="margin:0;color:#ffffff;font-size:20px;
                    font-weight:700;">
            30 By Ninety Theatre
          </p>
        </div>
        <div style="padding:32px;">
          <h1 style="color:#293994;font-size:22px;font-weight:700;
                     margin:0 0 12px;">
            Hi ${escapeHtml(name)} — here's your update link
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">
            You requested a link to update your volunteer
            information. Click below to view and edit your record.
          </p>
          <a href="${updateUrl}"
             style="display:inline-block;background:#F26522;
                    color:#ffffff;text-decoration:none;
                    padding:14px 28px;border-radius:8px;
                    font-weight:700;font-size:15px;">
            Update My Information
          </a>
          <p style="color:#aaa;font-size:12px;margin:16px 0 0;">
            Or copy this link: ${updateUrl}
          </p>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;
                    border-top:1px solid #D0D5E8;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            30 By Ninety Theatre · Old Mandeville, Louisiana
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await resend.emails.send({
    from: '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    to,
    subject: 'Your link to update your volunteer information',
    html,
  })
}

// ─── Info updated confirmation email ─────────────────────────────

type InfoUpdatedEmailParams = {
  to: string
  name: string
  updateToken: string
  volunteerId?: string | null
}

export async function sendInfoUpdatedEmail({
  to,
  name,
  updateToken,
  volunteerId,
}: InfoUpdatedEmailParams): Promise<void> {
  const updateUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/update?token=${updateToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;
                 font-family:'Open Sans',Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;
                  background:#ffffff;border-radius:8px;
                  overflow:hidden;
                  box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <div style="background:#293994;padding:28px 32px;">
          <p style="margin:0;color:#ffffff;font-size:20px;
                    font-weight:700;">
            30 By Ninety Theatre
          </p>
        </div>
        <div style="padding:32px;">
          <h1 style="color:#293994;font-size:22px;font-weight:700;
                     margin:0 0 12px;">
            Your information has been updated
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">
            Hi ${escapeHtml(name)} — we've saved your updated
            volunteer information. If you need to make any further
            changes, use the link below.
          </p>
          <a href="${updateUrl}"
             style="display:inline-block;background:#F26522;
                    color:#ffffff;text-decoration:none;
                    padding:14px 28px;border-radius:8px;
                    font-weight:700;font-size:15px;">
            Update My Information Again
          </a>
          <p style="color:#aaa;font-size:12px;margin:16px 0 0;">
            Or copy this link: ${updateUrl}
          </p>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;
                    border-top:1px solid #D0D5E8;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            30 By Ninety Theatre · Old Mandeville, Louisiana
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const subject = 'Your volunteer information has been updated'

  await resend.emails.send({
    from: '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    to,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview:
      `Hi ${name} — we've saved your updated volunteer information. If you need to make any further changes, use the link below.`.slice(
        0,
        150
      ),
    recipientType: 'transactional',
    recipientFilter: 'trigger:update',
    sentBy: null,
    recipients: [{ email: to, volunteerId: volunteerId ?? null }],
  })
}

// ─── Production Crew welcome email ───────────────────────────────

const ROLE_LABELS: Record<'editor' | 'viewer', string> = {
  editor: 'Editor',
  viewer: 'Viewer',
}

type WelcomeEmailParams = {
  toEmail: string
  toName: string
  role: 'editor' | 'viewer'
  tempPassword: string
}

export async function sendWelcomeEmail({
  toEmail,
  toName,
  role,
  tempPassword,
}: WelcomeEmailParams): Promise<void> {
  const loginUrl = 'https://30byninetyvolunteers.com/crew/login'
  const safeName = escapeHtml(toName)
  const safeEmail = escapeHtml(toEmail)
  const safePassword = escapeHtml(tempPassword)
  const roleLabel = ROLE_LABELS[role]

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;
                 font-family:'Open Sans',Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;
                  background:#ffffff;border-radius:8px;
                  overflow:hidden;
                  box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <div style="background:#293994;padding:28px 32px;">
          <p style="margin:0;color:#ffffff;font-size:20px;
                    font-weight:700;">
            30 By Ninety Theatre
          </p>
        </div>
        <div style="padding:32px;">
          <h1 style="color:#293994;font-size:22px;font-weight:700;
                     margin:0 0 12px;">
            Hi ${safeName},
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">
            You've been added to the 30 By Ninety Theatre Production Crew
            as ${roleLabel}.
          </p>

          <div style="background:#EEF1FA;border-radius:8px;
                      padding:20px 24px;margin:0 0 24px;">
            <p style="margin:0 0 8px;color:#293994;font-size:13px;
                      font-weight:700;text-transform:uppercase;
                      letter-spacing:0.5px;">
              Login Details
            </p>
            <p style="margin:0 0 4px;color:#555;font-size:14px;">
              Login URL:
              <a href="${loginUrl}" style="color:#293994;font-weight:600;">
                ${loginUrl}
              </a>
            </p>
            <p style="margin:0 0 4px;color:#555;font-size:14px;">
              Email: <strong style="color:#1A1A1A;">${safeEmail}</strong>
            </p>
            <p style="margin:0;color:#555;font-size:14px;">
              Temporary Password:
              <strong style="color:#1A1A1A;">${safePassword}</strong>
            </p>
          </div>

          <p style="color:#555;line-height:1.6;margin:0 0 24px;">
            Please log in and change your password after your first
            sign-in.
          </p>

          <a href="${loginUrl}"
             style="display:inline-block;background:#F26522;
                    color:#ffffff;text-decoration:none;
                    padding:14px 28px;border-radius:8px;
                    font-weight:700;font-size:15px;">
            Log In to Production Crew
          </a>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;
                    border-top:1px solid #D0D5E8;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            30 By Ninety Theatre · Old Mandeville, Louisiana
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await resend.emails.send({
    from: '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    replyTo: 'info@30byninety.com',
    to: toEmail,
    subject: 'Welcome to 30 By Ninety Theatre Production Crew',
    html,
  })
}

// ─── Standing Opportunity submission emails ──────────────────────

type OpportunityEmailParams = {
  to: string
  name: string
  opportunityTitle: string
}

export async function sendOpportunityEOIEmail({
  to,
  name,
  opportunityTitle,
}: OpportunityEmailParams): Promise<{ subject: string; preview: string }> {
  const safeName = escapeHtml(name)
  const safeTitle = escapeHtml(opportunityTitle)
  const subject = 'Thanks for your interest — 30 By Ninety Theatre'
  const preview = `Thank you for your interest in ${opportunityTitle}. A member of our team will be in touch soon.`.slice(
    0,
    200
  )

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;
                 font-family:'Open Sans',Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;
                  background:#ffffff;border-radius:8px;
                  overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <div style="background:#293994;padding:28px 32px;">
          <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
            30 By Ninety Theatre
          </p>
        </div>
        <div style="padding:32px;">
          <h1 style="color:#293994;font-size:22px;font-weight:700;
                     margin:0 0 12px;">
            Thanks for your interest, ${safeName}!
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            We've received your expression of interest in
            <strong>${safeTitle}</strong>. A member of our team will follow
            up with you personally soon.
          </p>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">
            In the meantime, feel free to browse other upcoming volunteer
            opportunities.
          </p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shows"
             style="display:inline-block;background:#F26522;
                    color:#ffffff;text-decoration:none;
                    padding:14px 28px;border-radius:8px;
                    font-weight:700;font-size:15px;">
            Browse Upcoming Shows
          </a>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;
                    border-top:1px solid #D0D5E8;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            30 By Ninety Theatre · Old Mandeville, Louisiana
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await resend.emails.send({
    from: '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    to,
    subject,
    html,
  })

  return { subject, preview }
}

export async function sendOpportunitySlotClaimEmail({
  to,
  name,
  opportunityTitle,
}: OpportunityEmailParams): Promise<{ subject: string; preview: string }> {
  const safeName = escapeHtml(name)
  const safeTitle = escapeHtml(opportunityTitle)
  const subject = `You're signed up — ${opportunityTitle}`
  const preview = `You're confirmed for ${opportunityTitle}. We're so glad to have you on board.`.slice(
    0,
    200
  )

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;
                 font-family:'Open Sans',Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;
                  background:#ffffff;border-radius:8px;
                  overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <div style="background:#293994;padding:28px 32px;">
          <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
            30 By Ninety Theatre
          </p>
        </div>
        <div style="padding:32px;">
          <h1 style="color:#293994;font-size:22px;font-weight:700;
                     margin:0 0 12px;">
            You're signed up, ${safeName}!
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            You're confirmed for <strong>${safeTitle}</strong>. We're so glad
            to have you on board — thank you for volunteering with us.
          </p>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">
            In the meantime, feel free to browse other upcoming volunteer
            opportunities.
          </p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shows"
             style="display:inline-block;background:#F26522;
                    color:#ffffff;text-decoration:none;
                    padding:14px 28px;border-radius:8px;
                    font-weight:700;font-size:15px;">
            Browse Upcoming Shows
          </a>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;
                    border-top:1px solid #D0D5E8;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            30 By Ninety Theatre · Old Mandeville, Louisiana
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await resend.emails.send({
    from: '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    to,
    subject,
    html,
  })

  return { subject, preview }
}


// ─── Slot claiming emails (30BN-5.2) ─────────────────────────────

const FROM_ADDRESS = '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>'
const REPLY_TO = 'info@30byninety.com'

function emailShell(bodyHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;
                 font-family:'Open Sans',Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;
                  background:#ffffff;border-radius:8px;
                  overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <div style="background:#293994;padding:28px 32px;">
          <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
            30 By Ninety Theatre
          </p>
        </div>
        <div style="padding:32px;">
          ${bodyHtml}
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;
                    border-top:1px solid #D0D5E8;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            30 By Ninety Theatre · Old Mandeville, Louisiana
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function showDetailsBlockHtml(showName: string, showDate: string, showTime: string, roleName: string): string {
  return `
    <div style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
      <p style="margin:0 0 4px;color:#1A1A1A;font-size:15px;"><strong>${escapeHtml(showName)}</strong></p>
      <p style="margin:0 0 4px;color:#555;font-size:14px;">${escapeHtml(showDate)} at ${escapeHtml(showTime)}</p>
      <p style="margin:0;color:#555;font-size:14px;">Role: ${escapeHtml(roleName)}</p>
    </div>
  `
}

function instructionsBlockHtml(volunteerInstructions: string | null): string {
  if (!volunteerInstructions) return ''
  return `
    <div style="background:#EEF1FA;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 8px;color:#293994;font-size:13px;font-weight:700;
                text-transform:uppercase;letter-spacing:0.5px;">
        Special Instructions
      </p>
      <p style="margin:0;color:#555;font-size:14px;line-height:1.6;white-space:pre-line;">
        ${escapeHtml(volunteerInstructions)}
      </p>
    </div>
  `
}

function cancelLinkHtml(cancelUrl: string): string {
  return `
    <p style="color:#aaa;font-size:12px;margin:24px 0 0;">
      Need to cancel? <a href="${cancelUrl}" style="color:#293994;">Click here</a>.
    </p>
  `
}

function addToCalendarLinkHtml(claimToken: string): string {
  const icsUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/calendar/claim.ics?token=${claimToken}`
  return `
    <p style="margin:16px 0;">
      <a href="${icsUrl}" style="color:#293994;text-decoration:underline;">
        📅 Add to your calendar
      </a>
    </p>
  `
}

function browseShowsButtonHtml(): string {
  return `
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shows"
       style="display:inline-block;background:#F26522;
              color:#ffffff;text-decoration:none;
              padding:14px 28px;border-radius:8px;
              font-weight:700;font-size:15px;">
      Browse More Opportunities
    </a>
  `
}

type SlotClaimEmailParams = {
  to: string
  volunteerName: string
  showName: string
  showDate: string
  showTime: string
  roleName: string
  volunteerInstructions: string | null
  cancelUrl: string
}

type SendSlotClaimEmailParams = SlotClaimEmailParams & { claimToken: string }

export async function sendSlotClaimEmail({
  to,
  volunteerName,
  showName,
  showDate,
  showTime,
  roleName,
  volunteerInstructions,
  cancelUrl,
  claimToken,
}: SendSlotClaimEmailParams): Promise<void> {
  const html = emailShell(`
    <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
      You're signed up, ${escapeHtml(volunteerName)}!
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      Thanks for volunteering — here are your details:
    </p>
    ${showDetailsBlockHtml(showName, showDate, showTime, roleName)}
    ${instructionsBlockHtml(volunteerInstructions)}
    ${browseShowsButtonHtml()}
    ${cancelLinkHtml(cancelUrl)}
    ${addToCalendarLinkHtml(claimToken)}
  `)

  await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to,
    subject: `You're signed up! — ${showName}`,
    html,
  })
}

type WaitlistConfirmationEmailParams = {
  to: string
  volunteerName: string
  showName: string
  showDate: string
  showTime: string
  roleName: string
  waitlistPosition: number
  cancelUrl: string
}

export async function sendWaitlistConfirmationEmail({
  to,
  volunteerName,
  showName,
  showDate,
  showTime,
  roleName,
  waitlistPosition,
  cancelUrl,
}: WaitlistConfirmationEmailParams): Promise<void> {
  const html = emailShell(`
    <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
      You're on the waitlist, ${escapeHtml(volunteerName)}
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      This role is currently full, but you're position <strong>#${waitlistPosition}</strong>
      on the waitlist. We'll email you right away if a spot opens up.
    </p>
    ${showDetailsBlockHtml(showName, showDate, showTime, roleName)}
    ${browseShowsButtonHtml()}
    <p style="color:#aaa;font-size:12px;margin:24px 0 0;">
      Plans changed? <a href="${cancelUrl}" style="color:#293994;">Remove yourself from the waitlist</a>.
    </p>
  `)

  await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to,
    subject: `You're on the waitlist — ${showName}`,
    html,
  })
}

type SendWaitlistPromotionEmailParams = SlotClaimEmailParams & { claimToken: string }

export async function sendWaitlistPromotionEmail({
  to,
  volunteerName,
  showName,
  showDate,
  showTime,
  roleName,
  volunteerInstructions,
  cancelUrl,
  claimToken,
}: SendWaitlistPromotionEmailParams): Promise<void> {
  const html = emailShell(`
    <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
      Good news, ${escapeHtml(volunteerName)} — a spot opened up!
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      You've moved from the waitlist to a confirmed spot. Here are your details:
    </p>
    ${showDetailsBlockHtml(showName, showDate, showTime, roleName)}
    ${instructionsBlockHtml(volunteerInstructions)}
    ${browseShowsButtonHtml()}
    ${cancelLinkHtml(cancelUrl)}
    ${addToCalendarLinkHtml(claimToken)}
  `)

  await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to,
    subject: `Good news — a spot opened up! — ${showName}`,
    html,
  })
}

type CancellationEditorNotificationEmailParams = {
  to: string[]
  volunteerName: string
  volunteerEmail: string
  showName: string
  showDate: string
  roleName: string
  adminShowUrl: string
}

export async function sendCancellationEditorNotificationEmail({
  to,
  volunteerName,
  volunteerEmail,
  showName,
  showDate,
  roleName,
  adminShowUrl,
}: CancellationEditorNotificationEmailParams): Promise<void> {
  if (to.length === 0) return

  const subject = `Volunteer cancellation — ${showName}`
  const html = emailShell(`
    <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
      Volunteer cancellation
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      <strong>${escapeHtml(volunteerName)}</strong> (${escapeHtml(volunteerEmail)}) has cancelled
      their volunteer spot for <strong>${escapeHtml(roleName)}</strong> on ${escapeHtml(showDate)}
      (${escapeHtml(showName)}).
    </p>
    <a href="${adminShowUrl}"
       style="display:inline-block;background:#F26522;
              color:#ffffff;text-decoration:none;
              padding:14px 28px;border-radius:8px;
              font-weight:700;font-size:15px;">
      View Show in Production Crew
    </a>
  `)

  // R8 — multi-recipient send uses resend.batch.send(), one entry per editor.
  await resend.batch.send(
    to.map((address) => ({
      from: FROM_ADDRESS,
      replyTo: REPLY_TO,
      to: address,
      subject,
      html,
    }))
  )
}

type ReminderEmailParams = {
  to: string
  volunteerName: string
  showName: string
  showDate: string
  showTime: string
  roleName: string
  volunteerInstructions: string | null
}

// Exported so the 24hr reminder cron (app/api/cron/reminders) can build
// payload objects for resend.batch.send() — batching multi-recipient sends
// is required per R8, so the cron never sends reminders one at a time.
export function buildReminderEmailPayload({
  to,
  volunteerName,
  showName,
  showDate,
  showTime,
  roleName,
  volunteerInstructions,
}: ReminderEmailParams): { from: string; replyTo: string; to: string; subject: string; html: string } {
  const html = emailShell(`
    <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
      See you tomorrow, ${escapeHtml(volunteerName)}!
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      Just a friendly reminder that you're volunteering tomorrow:
    </p>
    ${showDetailsBlockHtml(showName, showDate, showTime, roleName)}
    ${instructionsBlockHtml(volunteerInstructions)}
    <p style="color:#555;line-height:1.6;margin:24px 0 0;">
      Thank you for volunteering with 30 By Ninety Theatre!
    </p>
  `)

  return {
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to,
    subject: `Reminder: you're volunteering tomorrow — ${showName}`,
    html,
  }
}

type ThankYouEmailParams = {
  recipientEmail: string
  recipientName: string
  showName: string
  showDate: string
  siteUrl: string
}

// Exported so the post-show thank-you cron (app/api/cron/thankyou) can build
// payload objects for sendBatchEmails() — same batching reasoning as
// buildReminderEmailPayload.
export function buildThankYouEmailPayload({
  recipientEmail,
  recipientName,
  showName,
  showDate,
  siteUrl,
}: ThankYouEmailParams): { from: string; replyTo: string; to: string; subject: string; html: string } {
  const html = emailShell(`
    <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
      Thank you, ${escapeHtml(recipientName)}!
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      Thank you so much for volunteering for <strong>${escapeHtml(showName)}</strong> on ${showDate}. Your time
      and dedication make 30 By Ninety Theatre possible.
    </p>
    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
      You can view your updated volunteer hours and milestones on the Volunteer Call Board.
    </p>
    <a href="${siteUrl}/callboard"
       style="display:inline-block;background:#F26522;
              color:#ffffff;text-decoration:none;
              padding:14px 28px;border-radius:8px;
              font-weight:700;font-size:15px;">
      View My Volunteer Card
    </a>
    <p style="color:#555;line-height:1.6;margin:24px 0 0;">
      With gratitude,<br />30 By Ninety Theatre
    </p>
  `)

  return {
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to: recipientEmail,
    subject: `Thank you for volunteering — ${showName}`,
    html,
  }
}

type BatchEmailPayload = { from: string; replyTo?: string; to: string; subject: string; html: string }

const BATCH_CHUNK_SIZE = 100

// R8 — resend.batch.send() accepts at most 100 entries per call. Chunks any
// larger payload list into groups of 100, sending one batch call per chunk.
export async function sendBatchEmails(payloads: BatchEmailPayload[]): Promise<void> {
  for (let i = 0; i < payloads.length; i += BATCH_CHUNK_SIZE) {
    const chunk = payloads.slice(i, i + BATCH_CHUNK_SIZE)
    await resend.batch.send(chunk)
  }
}


// ─── Category-match volunteer notification email (30BN-5.3) ─────

type CategoryMatchNotificationEmailParams = {
  to: string
  volunteerName: string
  showName: string
  matchingRoles: string[]
}

// Exported so sendShowNotifications() (lib/actions/shows.ts) can build
// payload objects for resend.batch.send() — same reasoning as
// buildReminderEmailPayload: batching multi-recipient sends is required
// per R8, so the action does not call sendCategoryMatchNotificationEmail()
// (single send) in a loop.
export function buildCategoryMatchNotificationPayload({
  to,
  volunteerName,
  showName,
  matchingRoles,
}: CategoryMatchNotificationEmailParams): {
  from: string
  replyTo: string
  to: string
  subject: string
  html: string
} {
  const rolesList = matchingRoles.map((r) => escapeHtml(r)).join(', ')

  const html = emailShell(`
    <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
      Hi ${escapeHtml(volunteerName)}, we could use your help!
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      A show you might be interested in is coming up: <strong>${escapeHtml(showName)}</strong>.
    </p>
    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
      We're looking for volunteers in these areas: <strong>${rolesList}</strong>.
    </p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shows"
       style="display:inline-block;background:#F26522;
              color:#ffffff;text-decoration:none;
              padding:14px 28px;border-radius:8px;
              font-weight:700;font-size:15px;">
      View Volunteer Opportunities
    </a>
    <p style="color:#555;line-height:1.6;margin:24px 0 0;">
      We'd love to have you on board — sign up today!
    </p>
  `)

  return {
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to,
    subject: `Volunteer opportunity — ${showName}`,
    html,
  }
}

export async function sendCategoryMatchNotificationEmail(
  params: CategoryMatchNotificationEmailParams
): Promise<void> {
  await resend.emails.send(buildCategoryMatchNotificationPayload(params))
}

// ─── Show bulk email — "Message Volunteers" quick action (30BN-ADMIN.23) ─

type ShowBulkEmailParams = {
  recipientEmail: string
  recipientName: string
  subject: string
  body: string
  replyTo: string
  showName: string
  siteUrl: string
}

// Exported so sendShowBulkEmail() (lib/actions/shows.ts) can build payload
// objects for sendBatchEmails() — same batching reasoning as
// buildReminderEmailPayload/buildCategoryMatchNotificationPayload. Kept
// visually minimal (no branded button/highlight block) since this is an
// admin-composed operational message, not a campaign template. replyTo is
// per-send here (not the module REPLY_TO default) — the admin can edit it.
export function buildShowBulkEmailPayload({
  recipientEmail,
  recipientName,
  subject,
  body,
  replyTo,
  showName,
  siteUrl,
}: ShowBulkEmailParams): {
  from: string
  replyTo: string
  to: string
  subject: string
  html: string
} {
  const html = emailShell(`
    <p style="color:#1A1A1A;line-height:1.6;margin:0 0 4px;">
      Hi ${escapeHtml(recipientName)},
    </p>
    <p style="color:#1A1A1A;line-height:1.6;margin:0 0 20px;white-space:pre-line;">
      ${escapeHtml(body)}
    </p>
    <p style="color:#aaa;font-size:12px;margin:24px 0 0;border-top:1px solid #D0D5E8;padding-top:16px;">
      This message was sent to volunteers rostered for ${escapeHtml(showName)}.<br />
      To update your volunteer information, visit
      <a href="${siteUrl}/update" style="color:#293994;">${siteUrl}/update</a>.
    </p>
  `)

  return {
    from: FROM_ADDRESS,
    replyTo,
    to: recipientEmail,
    subject,
    html,
  }
}

// ─── Admin self-registration emails (30BN-ADMIN.15) ──────────────

type PendingRegistrationEmailParams = {
  to: string[]
  name: string
  email: string
}

// Notifies all active Super Admins that a new access request is awaiting
// review. R8 — multi-recipient uses resend.batch.send(); a single Super
// Admin recipient uses resend.emails.send() directly.
export async function sendPendingRegistrationEmail({
  to,
  name,
  email,
}: PendingRegistrationEmailParams): Promise<void> {
  if (to.length === 0) return

  const subject = `New access request — ${name} (${email})`
  const html = emailShell(`
    <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
      New access request
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
      <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) has requested access to the
      30 By Ninety Theatre Production Crew. Log in to review and approve or decline this request.
    </p>
    <a href="https://30byninetyvolunteers.com/crew/settings/users"
       style="display:inline-block;background:#F26522;
              color:#ffffff;text-decoration:none;
              padding:14px 28px;border-radius:8px;
              font-weight:700;font-size:15px;">
      Review Request
    </a>
  `)

  if (to.length === 1) {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: to[0],
      subject,
      html,
    })
    return
  }

  // R8 — multi-recipient send uses resend.batch.send(), one entry per Super Admin.
  await resend.batch.send(
    to.map((address) => ({
      from: FROM_ADDRESS,
      to: address,
      subject,
      html,
    }))
  )
}

type RegistrationApprovedEmailParams = {
  to: string
  name: string
}

export async function sendRegistrationApprovedEmail({
  to,
  name,
}: RegistrationApprovedEmailParams): Promise<void> {
  const loginUrl = 'https://30byninetyvolunteers.com/crew/login'

  const html = emailShell(`
    <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
      Hi ${escapeHtml(name)}, you're approved!
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
      Your request to join the 30 By Ninety Theatre Production Crew has been approved.
      You can now log in at the link below with the email and password you registered with.
    </p>
    <a href="${loginUrl}"
       style="display:inline-block;background:#F26522;
              color:#ffffff;text-decoration:none;
              padding:14px 28px;border-radius:8px;
              font-weight:700;font-size:15px;">
      Log In to Production Crew
    </a>
  `)

  await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to,
    subject: 'Your access request has been approved',
    html,
  })
}

type RegistrationDeclinedEmailParams = {
  to: string
  name: string
}

export async function sendRegistrationDeclinedEmail({
  to,
  name,
}: RegistrationDeclinedEmailParams): Promise<void> {
  const html = emailShell(`
    <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
      Hi ${escapeHtml(name)},
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 24px;">
      Thank you for your interest in the 30 By Ninety Theatre Production Crew. Unfortunately your
      access request was not approved at this time. Please reach out to the theatre directly if
      you have questions.
    </p>
  `)

  await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to,
    subject: 'Your access request was not approved',
    html,
  })
}

// ─── Milestone congratulations email (30BN-9.2) ──────────────────

type MilestoneEmailContent = { subject: string; bodyHtml: string }

function milestoneEmailContent(
  name: string,
  milestoneLabel: string,
  milestoneHours: number,
  totalHours: number | null
): MilestoneEmailContent {
  const safeName = escapeHtml(name)
  const totalHoursLine =
    totalHours != null
      ? `<p style="color:#555;line-height:1.6;margin:16px 0 0;">Your total hours: <strong>${totalHours}</strong>.</p>`
      : ''

  switch (milestoneHours) {
    case 0:
      return {
        subject: 'Welcome to the 30 By Ninety volunteer family!',
        bodyHtml: `
          <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
            Welcome to the family, ${safeName}!
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            Welcome to the 30 By Ninety Theatre volunteer community! You've just made your first
            contribution to bringing live theatre to our community — and that means everything to us.
          </p>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            We're so glad you're here. Keep an eye out for upcoming shows and opportunities on the
            Volunteer Call Board. We can't wait to see you again.
          </p>
        `,
      }
    case 10:
      return {
        subject: "You've reached 10 volunteer hours — thank you!",
        bodyHtml: `
          <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
            10 hours, ${safeName}!
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            You've officially logged 10 volunteer hours with 30 By Ninety Theatre. That's real time,
            real effort, and a real difference in the lives of everyone who walks through our doors.
            Thank you.
          </p>
          ${totalHoursLine}
        `,
      }
    case 20:
      return {
        subject: "20 hours of giving — you're making a difference",
        bodyHtml: `
          <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
            20 hours, ${safeName}
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            20 hours. You keep showing up, and it shows. The 30 By Ninety community is stronger
            because you're part of it. Thank you for your continued dedication.
          </p>
          ${totalHoursLine}
        `,
      }
    case 35:
      return {
        subject: "35 hours — you're becoming a cornerstone of our community",
        bodyHtml: `
          <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
            35 hours, ${safeName}
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            35 volunteer hours is no small thing — that's a serious commitment to our community and
            to live theatre. We see you, and we're grateful for every hour you've given.
          </p>
          ${totalHoursLine}
        `,
      }
    case 50:
      return {
        subject: `50 volunteer hours — that's remarkable, ${name}`,
        bodyHtml: `
          <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
            50 hours, ${safeName}
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            Fifty hours. Take a moment to let that sink in. You've given 50 hours of your time to 30
            By Ninety Theatre — and our community is richer for it. This is a milestone worth
            celebrating. Thank you, from all of us.
          </p>
          ${totalHoursLine}
        `,
      }
    case 75:
      return {
        subject: "75 hours of dedication — we're so grateful",
        bodyHtml: `
          <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
            75 hours, ${safeName}
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            75 hours of service — you've become one of the pillars of the 30 By Ninety volunteer
            community. The shows we produce, the experiences we create, the community we build — all
            of it exists because of people like you.
          </p>
          ${totalHoursLine}
        `,
      }
    case 100:
      return {
        subject: "100 hours — you've achieved something truly special",
        bodyHtml: `
          <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
            100 hours, ${safeName}
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            One hundred hours. This is something very few volunteers ever achieve, and you've done
            it. 100 hours of showing up, helping out, and making live theatre happen. We are deeply
            grateful. You are part of what makes 30 By Ninety special.
          </p>
          ${totalHoursLine}
        `,
      }
    default:
      return {
        subject: `${milestoneHours} hours of service — thank you for everything`,
        bodyHtml: `
          <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
            ${escapeHtml(milestoneLabel)}, ${safeName}
          </h1>
          <p style="color:#555;line-height:1.6;margin:0 0 16px;">
            ${escapeHtml(milestoneLabel)} of volunteer service. You continue to show up for 30 By
            Ninety Theatre in ways that genuinely move us. Thank you for your extraordinary
            commitment to our community.
          </p>
          ${totalHoursLine}
        `,
      }
  }
}

export async function sendMilestoneEmail(
  email: string,
  name: string,
  milestoneLabel: string,
  milestoneHours: number,
  totalHours: number | null,
  volunteerId?: string | null
): Promise<void> {
  const { subject, bodyHtml } = milestoneEmailContent(name, milestoneLabel, milestoneHours, totalHours)

  const html = emailShell(`
    ${bodyHtml}
    <div style="margin:24px 0 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/callboard"
         style="display:inline-block;background:#F26522;
                color:#ffffff;text-decoration:none;
                padding:14px 28px;border-radius:8px;
                font-weight:700;font-size:15px;">
        View Your Volunteer Card
      </a>
    </div>
    <p style="color:#555;line-height:1.6;margin:24px 0 0;">
      — The 30 By Ninety Theatre Team
    </p>
  `)

  await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to: email,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview: bodyHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 150),
    recipientType: 'transactional',
    recipientFilter: 'trigger:milestone',
    sentBy: null,
    recipients: [{ email, volunteerId: volunteerId ?? null }],
  })
}

// ─── Email activity logging helper (30BN-13.1) ───────────────────
// Internal — not exported. Always called AFTER the Resend send succeeds.
// All errors are silently swallowed: a logging failure must never block
// email delivery or propagate to the caller.

async function logEmailSent({
  subject,
  bodyPreview,
  recipientType,
  recipientFilter,
  sentBy,
  recipients,
}: {
  subject: string
  bodyPreview?: string
  recipientType: 'all' | 'category' | 'individual' | 'transactional'
  recipientFilter?: string
  sentBy?: string | null
  recipients: Array<{
    email: string
    volunteerId?: string | null
  }>
}): Promise<void> {
  try {
    const supabase = getAdminClient()
    const { data: logRow, error: logError } = await supabase
      .from('email_log')
      .insert({
        subject,
        body_preview: bodyPreview ?? null,
        recipient_type: recipientType,
        recipient_filter: recipientFilter ?? null,
        sent_by: sentBy ?? null,
        reply_to: null,
        recipient_count: recipients.length,
      })
      .select('id')
      .single()

    if (logError || !logRow) return

    if (recipients.length > 0) {
      const recipientRows = recipients.map((r) => ({
        email_log_id: logRow.id,
        email_address: r.email,
        volunteer_id: r.volunteerId ?? null,
      }))
      await supabase.from('email_log_recipients').insert(recipientRows)
    }
  } catch {
    // Silently swallow — log failure must never block email delivery.
  }
}
