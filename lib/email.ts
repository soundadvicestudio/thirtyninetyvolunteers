import 'server-only'
import { Resend } from 'resend'

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
}

export async function sendVolunteerConfirmationEmail({
  to,
  name,
  updateToken,
  categoryNames,
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
             `<li style="margin-bottom:4px;">${n}</li>`
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

  await resend.emails.send({
    from: '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    to,
    subject: `Welcome to 30 By Ninety Theatre, ${name}!`,
    html,
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
}

export async function sendInfoUpdatedEmail({
  to,
  name,
  updateToken,
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

  await resend.emails.send({
    from: '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    to,
    subject: 'Your volunteer information has been updated',
    html,
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

export async function sendSlotClaimEmail({
  to,
  volunteerName,
  showName,
  showDate,
  showTime,
  roleName,
  volunteerInstructions,
  cancelUrl,
}: SlotClaimEmailParams): Promise<void> {
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

export async function sendWaitlistPromotionEmail({
  to,
  volunteerName,
  showName,
  showDate,
  showTime,
  roleName,
  volunteerInstructions,
  cancelUrl,
}: SlotClaimEmailParams): Promise<void> {
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
// is required per R8, so the cron does not call sendReminderEmail() (single
// send) directly.
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

export async function sendReminderEmail(params: ReminderEmailParams): Promise<void> {
  await resend.emails.send(buildReminderEmailPayload(params))
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
