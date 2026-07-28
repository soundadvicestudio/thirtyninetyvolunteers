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

// Internal helper — fetches dynamic email settings
// from app_settings in one query. Falls back to
// 30BN defaults so existing behavior is preserved
// if keys are absent or empty.
type EmailSettings = {
  from: string
  logoUrl: string
  orgName: string
  orgContactEmail: string
}

async function resolveEmailSettings(): Promise<EmailSettings> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['email_from_address', 'email_from_name', 'org_logo_url', 'org_name', 'org_contact_email'])
  const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))
  const address = map['email_from_address'] || 'volunteers@30byninetyvolunteers.com'
  const name = map['email_from_name'] || '30 By Ninety Theatre Volunteers'
  const logoUrl = map['org_logo_url'] || `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
  const orgName = map['org_name'] || '30 By Ninety Theatre'
  const orgContactEmail = map['org_contact_email'] || 'info@30byninety.com'
  return {
    from: `${name} <${address}>`,
    logoUrl,
    orgName,
    orgContactEmail,
  }
}

// ─── Shared branded email wrapper (30BN-13.2) ────────────────────
// Table-based layout, inline styles only — required for Outlook/email
// client compatibility. subject and preheader are escaped internally
// since they're plain text dropped into an HTML context (<title> and
// the hidden preheader div); body is pre-composed HTML supplied by the
// caller, who is responsible for escaping any dynamic values within it.

function buildEmailHtml({
  subject,
  preheader,
  body,
  footerNote,
  logoUrl,
  orgName,
}: {
  subject: string
  preheader: string
  body: string
  footerNote?: string
  logoUrl?: string
  orgName?: string
}): string {
  const resolvedLogoUrl = logoUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
  const safeOrgName = escapeHtml(orgName || '30 By Ninety Theatre')
  const logoHtml = resolvedLogoUrl
    ? `<img src="${resolvedLogoUrl}" height="50" width="auto" alt="${safeOrgName}" style="display:block;margin:0 auto;">`
    : ''
  const safeTitle = escapeHtml(subject)
  const safePreheader = escapeHtml(preheader)
  const note =
    footerNote ??
    `You're receiving this email because you signed up to volunteer with ${safeOrgName}.`

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${safeTitle}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#F5F5F5;font-family:'Open Sans',Arial,sans-serif;">

      <div style="display:none;max-height:0;overflow:hidden;color:#F5F5F5;">
        ${safePreheader}
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F5F5;">
        <tr>
          <td align="center" style="padding:24px 16px;">

            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:8px;overflow:hidden;">

              <tr>
                <td bgcolor="#293994" style="background-color:#293994;padding:24px 32px;text-align:center;">
                  ${logoHtml}
                  <p style="margin:8px 0 0 0;color:#FFFFFF;font-size:13px;font-family:'Open Sans',Arial,sans-serif;letter-spacing:0.5px;text-transform:uppercase;">
                    ${safeOrgName}
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:32px;color:#1A1A1A;font-size:15px;line-height:1.6;font-family:'Open Sans',Arial,sans-serif;">
                  ${body}
                </td>
              </tr>

              <tr>
                <td bgcolor="#F5F5F5" style="background-color:#F5F5F5;padding:24px 32px;text-align:center;border-top:1px solid #D0D5E8;">
                  <p style="margin:0;color:#555555;font-size:12px;line-height:1.5;font-family:'Open Sans',Arial,sans-serif;">
                    ${safeOrgName}
                    <br>
                    ${note}
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>

    </body>
    </html>
  `
}

// ─── Reusable CTA button (30BN-13.2) ─────────────────────────────
// <a>-as-button, not <button> — required for email client rendering.

function buildCtaButton(label: string, url: string, color = '#293994'): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr>
        <td bgcolor="${color}" align="center" style="background-color:${color};border-radius:6px;padding:14px 28px;">
          <a href="${url}" style="color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;font-family:'Open Sans',Arial,sans-serif;display:inline-block;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `
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
  const emailSettings = await resolveEmailSettings()

  const categoriesHtml =
    categoryNames.length > 0
      ? `
        <p style="margin:16px 0 8px;color:#555555;font-size:15px;">Your selected interests:</p>
        <ul style="margin:0 0 16px;padding-left:20px;color:#555555;font-size:15px;">
          ${categoryNames.map((n) => `<li style="margin-bottom:4px;">${escapeHtml(n)}</li>`).join('')}
        </ul>
      `
      : ''

  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you for signing up to volunteer with ${escapeHtml(emailSettings.orgName)}. We're excited to have you join our community!
    </p>
    ${categoriesHtml}
    <p style="margin:0 0 8px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You can update your information at any time using the link below.
    </p>
    <p style="margin:0 0 24px;font-size:14px;">
      <a href="${updateUrl}" style="color:#293994;">${updateUrl}</a>
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`)}
  `

  const subject = `Welcome to ${emailSettings.orgName}, ${name}!`
  const html = buildEmailHtml({
    subject,
    preheader: `Welcome to the ${emailSettings.orgName} volunteer community!`,
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    to,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview: `Welcome to ${emailSettings.orgName} volunteers! Your signup is confirmed.`,
    recipientType: 'transactional',
    recipientFilter: 'trigger:signup',
    sentBy: null,
    recipients: [{ email: to, volunteerId: volunteerId ?? null }],
  })
}

// ─── Consent form request email (30BN-15.2) ──────────────────────

type ConsentFormRequestEmailParams = {
  to: string
  name: string
  uploadToken: string
  activeFormUrl: string | null
  documentTypeName: string
  volunteerId?: string | null
}

export async function sendConsentFormRequestEmail({
  to,
  name,
  uploadToken,
  activeFormUrl,
  documentTypeName,
  volunteerId,
}: ConsentFormRequestEmailParams): Promise<void> {
  const uploadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/consent/${uploadToken}`
  const safeName = escapeHtml(name)
  const emailSettings = await resolveEmailSettings()

  const downloadSectionHtml = activeFormUrl
    ? `
      <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
        Please download the ${documentTypeName}, have a parent or guardian sign it, then use the button below to
        upload the signed copy.
      </p>
      ${buildCtaButton('Download Consent Form', activeFormUrl, '#293994')}
    `
    : `
      <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
        Your coordinator will provide you with the consent form. Once you have a signed copy, please use the
        button below to upload it.
      </p>
    `

  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you for signing up to volunteer with ${escapeHtml(emailSettings.orgName)}! Because you're under 18, we need a
      signed ${documentTypeName} from a parent or guardian before you can start volunteering.
    </p>
    ${downloadSectionHtml}
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Please use the button below to upload your completed form.
    </p>
    ${buildCtaButton('Upload Consent Form', uploadUrl)}
  `

  const subject = 'Action needed: submit your volunteer consent form'
  const html = buildEmailHtml({
    subject,
    preheader: 'Please submit your volunteer consent form to get started.',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    to,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview: 'Please submit your volunteer consent form to get started.',
    recipientType: 'transactional',
    recipientFilter: 'trigger:consent_form_request',
    sentBy: null,
    recipients: [{ email: to, volunteerId: volunteerId ?? null }],
  })
}

// ─── Update link email ───────────────────────────────────────────

type UpdateLinkEmailParams = {
  to: string
  name: string
  updateToken: string
  volunteerId?: string | null
}

export async function sendUpdateLinkEmail({
  to,
  name,
  updateToken,
  volunteerId,
}: UpdateLinkEmailParams): Promise<void> {
  const updateUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/update?token=${updateToken}`
  const safeName = escapeHtml(name)

  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You requested a link to update your volunteer information. Click the button below to get started.
    </p>
    ${buildCtaButton('Update My Info', updateUrl)}
    <p style="margin:24px 0 0;color:#555555;font-size:13px;line-height:1.6;">
      This link is unique to your account. If you didn't request this, you can safely ignore this email.
    </p>
  `

  const subject = 'Your link to update your volunteer information'
  const emailSettings = await resolveEmailSettings()
  const html = buildEmailHtml({
    subject,
    preheader: "Here's your link to update your volunteer info.",
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    to,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview: 'Your link to update your volunteer information is ready.',
    recipientType: 'transactional',
    recipientFilter: 'trigger:update_link_request',
    sentBy: null,
    recipients: [{ email: to, volunteerId: volunteerId ?? null }],
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
  volunteerId,
}: InfoUpdatedEmailParams): Promise<void> {
  const safeName = escapeHtml(name)
  const emailSettings = await resolveEmailSettings()

  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Your volunteer profile with ${escapeHtml(emailSettings.orgName)} has been updated successfully.
    </p>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      If you didn't make this change, please contact us at
      <a href="mailto:${escapeHtml(emailSettings.orgContactEmail)}" style="color:#293994;">${escapeHtml(emailSettings.orgContactEmail)}</a>.
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`)}
  `

  const subject = 'Your volunteer information has been updated'
  const html = buildEmailHtml({
    subject,
    preheader: 'Your volunteer information has been updated.',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    to,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview: 'Your volunteer information has been updated successfully.',
    recipientType: 'transactional',
    recipientFilter: 'trigger:update',
    sentBy: null,
    recipients: [{ email: to, volunteerId: volunteerId ?? null }],
  })
}

// ─── Production Crew welcome email ───────────────────────────────

const ROLE_LABELS: Record<'editor' | 'viewer' | 'owner_admin' | 'production', string> = {
  editor: 'Editor',
  viewer: 'Viewer',
  owner_admin: 'Owner Admin',
  production: 'Production',
}

type WelcomeEmailParams = {
  toEmail: string
  toName: string
  role: 'editor' | 'viewer' | 'owner_admin' | 'production'
  tempPassword: string
}

export async function sendWelcomeEmail({
  toEmail,
  toName,
  role,
  tempPassword,
}: WelcomeEmailParams): Promise<void> {
  const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/crew/login`
  const safeName = escapeHtml(toName)
  const safeEmail = escapeHtml(toEmail)
  const safePassword = escapeHtml(tempPassword)
  const roleLabel = ROLE_LABELS[role]
  const emailSettings = await resolveEmailSettings()

  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You've been added to the ${escapeHtml(emailSettings.orgName)} Production Crew as ${roleLabel}.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td bgcolor="#EEF1FA" style="background-color:#EEF1FA;border-radius:8px;padding:20px 24px;">
          <p style="margin:0 0 8px;color:#293994;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
            Login Details
          </p>
          <p style="margin:0 0 4px;color:#555555;font-size:14px;">
            Login URL: <a href="${loginUrl}" style="color:#293994;font-weight:600;">${loginUrl}</a>
          </p>
          <p style="margin:0 0 4px;color:#555555;font-size:14px;">
            Email: <strong style="color:#1A1A1A;">${safeEmail}</strong>
          </p>
          <p style="margin:0;color:#555555;font-size:14px;">
            Temporary Password: <strong style="color:#1A1A1A;">${safePassword}</strong>
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Please log in and change your password after your first sign-in.
    </p>
    ${buildCtaButton('Log In to Production Crew', loginUrl)}
  `

  const subject = `Welcome to ${emailSettings.orgName} Production Crew`
  const html = buildEmailHtml({
    subject,
    preheader: 'Your Production Crew account is ready.',
    body,
    footerNote: `This email was sent because a Production Crew account was created for you at ${escapeHtml(emailSettings.orgName)}.`,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to: toEmail,
    subject,
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
  const emailSettings = await resolveEmailSettings()
  const subject = `Thanks for your interest — ${emailSettings.orgName}`
  const preview = "Your expression of interest has been received. We'll be in touch soon."

  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you for your interest in <strong>${safeTitle}</strong>. A member of our team will be in touch
      with you soon.
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`)}
  `

  const html = buildEmailHtml({
    subject,
    preheader: 'We received your expression of interest.',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
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
  const emailSettings = await resolveEmailSettings()
  const subject = `You're signed up — ${opportunityTitle}`
  const preview = `Your position for ${opportunityTitle} is confirmed.`

  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You're confirmed for <strong>${safeTitle}</strong> with ${escapeHtml(emailSettings.orgName)}. We're looking forward to
      working with you!
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`)}
  `

  const html = buildEmailHtml({
    subject,
    preheader: 'Your volunteer position is confirmed!',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    to,
    subject,
    html,
  })

  return { subject, preview }
}


// ─── Slot claiming emails (30BN-5.2) ─────────────────────────────

function emailShell(bodyHtml: string, orgName?: string): string {
  const safeOrgName = escapeHtml(orgName || '30 By Ninety Theatre')
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
            ${safeOrgName}
          </p>
        </div>
        <div style="padding:32px;">
          ${bodyHtml}
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;
                    border-top:1px solid #D0D5E8;">
          <p style="margin:0;color:#aaa;font-size:12px;">
            ${safeOrgName}
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function showDetailsBlockHtml(showName: string, showDate: string, showTime: string, roleName: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
      <tr>
        <td bgcolor="#F5F5F5" style="background-color:#F5F5F5;border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 8px;color:#1A1A1A;font-size:15px;font-weight:700;">${escapeHtml(showName)}</p>
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="color:#555555;font-size:14px;padding:2px 0;">Date:</td>
              <td style="color:#1A1A1A;font-size:14px;padding:2px 0 2px 8px;">${escapeHtml(showDate)}</td>
            </tr>
            <tr>
              <td style="color:#555555;font-size:14px;padding:2px 0;">Time:</td>
              <td style="color:#1A1A1A;font-size:14px;padding:2px 0 2px 8px;">${escapeHtml(showTime)}</td>
            </tr>
            <tr>
              <td style="color:#555555;font-size:14px;padding:2px 0;">Role:</td>
              <td style="color:#1A1A1A;font-size:14px;padding:2px 0 2px 8px;">${escapeHtml(roleName)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

function instructionsBlockHtml(volunteerInstructions: string | null): string {
  if (!volunteerInstructions) return ''
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td bgcolor="#EEF1FA" style="background-color:#EEF1FA;border-radius:8px;padding:20px 24px;">
          <p style="margin:0 0 8px;color:#293994;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
            Special Instructions
          </p>
          <p style="margin:0;color:#555555;font-size:14px;line-height:1.6;white-space:pre-line;">
            ${escapeHtml(volunteerInstructions)}
          </p>
        </td>
      </tr>
    </table>
  `
}

function cancelLinkHtml(cancelUrl: string): string {
  return `
    <p style="color:#888888;font-size:12px;margin:24px 0 0;font-family:'Open Sans',Arial,sans-serif;">
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

type SendSlotClaimEmailParams = SlotClaimEmailParams & { claimToken: string; calendarEnabled?: boolean }

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
  calendarEnabled = true,
}: SendSlotClaimEmailParams): Promise<void> {
  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${escapeHtml(volunteerName)},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Great news — your volunteer spot has been confirmed for <strong>${escapeHtml(showName)}</strong>.
    </p>
    ${showDetailsBlockHtml(showName, showDate, showTime, roleName)}
    ${instructionsBlockHtml(volunteerInstructions)}
    ${calendarEnabled ? addToCalendarLinkHtml(claimToken) : ''}
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`)}
    ${cancelLinkHtml(cancelUrl)}
  `

  const subject = `You're signed up! — ${showName}`
  const emailSettings = await resolveEmailSettings()
  const html = buildEmailHtml({
    subject,
    preheader: 'Your volunteer spot is confirmed!',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to,
    subject,
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
  roleName,
  waitlistPosition,
  cancelUrl,
}: WaitlistConfirmationEmailParams): Promise<void> {
  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${escapeHtml(volunteerName)},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thanks for your interest in volunteering for <strong>${escapeHtml(showName)}</strong>. All volunteer spots
      for the <strong>${escapeHtml(roleName)}</strong> role are currently filled, but you're on the waitlist!
    </p>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You are currently <strong>#${waitlistPosition}</strong> on the waitlist.
    </p>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      We'll notify you right away if a spot opens up.
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`)}
    <p style="margin:24px 0 0;color:#888888;font-size:12px;font-family:'Open Sans',Arial,sans-serif;">
      Plans changed? <a href="${cancelUrl}" style="color:#293994;">Remove yourself from the waitlist</a>.
    </p>
  `

  const subject = `You're on the waitlist — ${showName}`
  const emailSettings = await resolveEmailSettings()
  const html = buildEmailHtml({
    subject,
    preheader: `You're on the waitlist for ${showName}.`,
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to,
    subject,
    html,
  })
}

type SendWaitlistPromotionEmailParams = SlotClaimEmailParams & { claimToken: string; calendarEnabled?: boolean }

export async function sendWaitlistPromotionEmail({
  to,
  volunteerName,
  showName,
  showDate,
  showTime,
  roleName,
  cancelUrl,
  claimToken,
  calendarEnabled = true,
}: SendWaitlistPromotionEmailParams): Promise<void> {
  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${escapeHtml(volunteerName)},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Great news! A volunteer spot has opened up for <strong>${escapeHtml(showName)}</strong>, and you've moved
      from the waitlist to a confirmed spot.
    </p>
    ${showDetailsBlockHtml(showName, showDate, showTime, roleName)}
    ${calendarEnabled ? addToCalendarLinkHtml(claimToken) : ''}
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`)}
    ${cancelLinkHtml(cancelUrl)}
  `

  const subject = `Good news — a spot opened up! — ${showName}`
  const emailSettings = await resolveEmailSettings()
  const html = buildEmailHtml({
    subject,
    preheader: 'Good news — a volunteer spot just opened up!',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to,
    subject,
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

  const emailSettings = await resolveEmailSettings()
  const subject = `Volunteer cancellation — ${showName}`
  const html = emailShell(
    `
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
  `,
    emailSettings.orgName
  )

  // R8 — multi-recipient send uses resend.batch.send(), one entry per editor.
  await resend.batch.send(
    to.map((address) => ({
      from: emailSettings.from,
      replyTo: emailSettings.orgContactEmail,
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
  logoUrl?: string
  orgName?: string
  from?: string
  replyTo?: string
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
  logoUrl,
  orgName,
  from,
  replyTo,
}: ReminderEmailParams): { from: string; replyTo: string; to: string; subject: string; html: string } {
  const safeOrgName = escapeHtml(orgName || '30 By Ninety Theatre')
  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${escapeHtml(volunteerName)},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Just a friendly reminder that you're volunteering tomorrow:
    </p>
    ${showDetailsBlockHtml(showName, showDate, showTime, roleName)}
    ${instructionsBlockHtml(volunteerInstructions)}
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`)}
    <p style="margin:24px 0 0;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you for volunteering with ${safeOrgName}!
    </p>
  `

  const subject = `Reminder: you're volunteering tomorrow — ${showName}`
  const html = buildEmailHtml({
    subject,
    preheader: 'Your volunteer call is tomorrow!',
    body,
    logoUrl,
    orgName,
  })

  return {
    from: from ?? '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    replyTo: replyTo ?? 'info@30byninety.com',
    to,
    subject,
    html,
  }
}

type ThankYouEmailParams = {
  recipientEmail: string
  recipientName: string
  showName: string
  showDate: string
  siteUrl: string
  logoUrl?: string
  orgName?: string
  from?: string
  replyTo?: string
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
  logoUrl,
  orgName,
  from,
  replyTo,
}: ThankYouEmailParams): { from: string; replyTo: string; to: string; subject: string; html: string } {
  const safeOrgName = escapeHtml(orgName || '30 By Ninety Theatre')
  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Thank you, ${escapeHtml(recipientName)}!</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you so much for volunteering for <strong>${escapeHtml(showName)}</strong> on ${showDate}. Your
      time and dedication make ${safeOrgName} possible.
    </p>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You can view your updated volunteer hours and milestones on the Volunteer Call Board.
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${siteUrl}/callboard`)}
    <p style="margin:24px 0 0;color:#1A1A1A;font-size:15px;line-height:1.6;">
      With gratitude,<br>${safeOrgName}
    </p>
  `

  const subject = `Thank you for volunteering — ${showName}`
  const html = buildEmailHtml({
    subject,
    preheader: 'Thank you for volunteering with us!',
    body,
    logoUrl,
    orgName,
  })

  return {
    from: from ?? '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    replyTo: replyTo ?? 'info@30byninety.com',
    to: recipientEmail,
    subject,
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
  logoUrl?: string
  orgName?: string
  from?: string
  replyTo?: string
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
  logoUrl,
  orgName,
  from,
  replyTo,
}: CategoryMatchNotificationEmailParams): {
  from: string
  replyTo: string
  to: string
  subject: string
  html: string
} {
  const rolesList = matchingRoles.map((r) => escapeHtml(r)).join(', ')

  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${escapeHtml(volunteerName)}, we could use your help!</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      A show you might be interested in is coming up: <strong>${escapeHtml(showName)}</strong>.
    </p>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      We're looking for volunteers in these areas: <strong>${rolesList}</strong>.
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`)}
    <p style="margin:24px 0 0;color:#1A1A1A;font-size:15px;line-height:1.6;">
      We'd love to have you on board — sign up today!
    </p>
  `

  const subject = `Volunteer opportunity — ${showName}`
  const html = buildEmailHtml({
    subject,
    preheader: 'A volunteer opportunity matching your interests is now open.',
    body,
    logoUrl,
    orgName,
  })

  return {
    from: from ?? '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
    replyTo: replyTo ?? 'info@30byninety.com',
    to,
    subject,
    html,
  }
}

export async function sendCategoryMatchNotificationEmail(
  params: CategoryMatchNotificationEmailParams
): Promise<void> {
  const emailSettings = await resolveEmailSettings()
  await resend.emails.send(
    buildCategoryMatchNotificationPayload({
      ...params,
      from: emailSettings.from,
      replyTo: emailSettings.orgContactEmail,
    })
  )
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
  logoUrl?: string
  orgName?: string
  from?: string
}

// Exported so sendShowBulkEmail() (lib/actions/shows.ts) can build payload
// objects for sendBatchEmails() — same batching reasoning as
// buildReminderEmailPayload/buildCategoryMatchNotificationPayload. Kept
// visually minimal (no branded button/highlight block) since this is an
// admin-composed operational message, not a campaign template. replyTo is
// per-send here (the admin can edit it) rather than a shared default.
export function buildShowBulkEmailPayload({
  recipientEmail,
  recipientName,
  subject,
  body,
  replyTo,
  showName,
  siteUrl,
  logoUrl,
  orgName,
  from,
}: ShowBulkEmailParams): {
  from: string
  replyTo: string
  to: string
  subject: string
  html: string
} {
  const safeBody = escapeHtml(body)
  const preheader = body.slice(0, 100)

  const bodyHtml = `
    <p style="margin:0 0 4px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Hi ${escapeHtml(recipientName)},
    </p>
    <p style="margin:0 0 20px;color:#1A1A1A;font-size:15px;line-height:1.6;white-space:pre-line;">
      ${safeBody}
    </p>
    <p style="margin:24px 0 0;color:#555555;font-size:12px;border-top:1px solid #D0D5E8;padding-top:16px;">
      This message was sent to volunteers rostered for ${escapeHtml(showName)}.<br>
      To update your volunteer information, visit
      <a href="${siteUrl}/update" style="color:#293994;">${siteUrl}/update</a>.
    </p>
  `

  const html = buildEmailHtml({
    subject,
    preheader,
    body: bodyHtml,
    footerNote: `This message was sent to you by the production team at ${escapeHtml(orgName || '30 By Ninety Theatre')}.`,
    logoUrl,
    orgName,
  })

  return {
    from: from ?? '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>',
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

  const emailSettings = await resolveEmailSettings()
  const reviewUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/crew/settings/users`
  const subject = `New access request — ${name} (${email})`
  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">New access request</h1>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) has requested access to the
      ${escapeHtml(emailSettings.orgName)} Production Crew. Log in to review and approve or decline this request.
    </p>
    ${buildCtaButton('Review Request', reviewUrl)}
  `

  const html = buildEmailHtml({
    subject,
    preheader: 'A new Production Crew access request is waiting.',
    body,
    footerNote: `This email was sent to Production Crew administrators of ${escapeHtml(emailSettings.orgName)}.`,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  if (to.length === 1) {
    await resend.emails.send({
      from: emailSettings.from,
      to: to[0],
      subject,
      html,
    })
    return
  }

  // R8 — multi-recipient send uses resend.batch.send(), one entry per Super Admin.
  await resend.batch.send(
    to.map((address) => ({
      from: emailSettings.from,
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
  const emailSettings = await resolveEmailSettings()
  const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/crew/login`

  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${escapeHtml(name)}, you're approved!</h1>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Your request to join the ${escapeHtml(emailSettings.orgName)} Production Crew has been approved. You can now log in
      at the link below with the email and password you registered with.
    </p>
    ${buildCtaButton('Log In to Production Crew', loginUrl)}
  `

  const subject = 'Your access request has been approved'
  const html = buildEmailHtml({
    subject,
    preheader: 'Your Production Crew access has been approved.',
    body,
    footerNote: 'This email was sent because your Production Crew access request was approved.',
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to,
    subject,
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
  const emailSettings = await resolveEmailSettings()
  const body = `
    <h1 style="margin:0 0 16px;color:#293994;font-size:22px;font-weight:700;">Hi ${escapeHtml(name)},</h1>
    <p style="margin:0 0 8px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you for your interest in the ${escapeHtml(emailSettings.orgName)} Production Crew. Unfortunately your access
      request was not approved at this time.
    </p>
    <p style="margin:0;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Please reach out to us at <a href="mailto:${escapeHtml(emailSettings.orgContactEmail)}" style="color:#293994;">${escapeHtml(emailSettings.orgContactEmail)}</a>
      if you have questions.
    </p>
  `

  const subject = 'Your access request was not approved'
  const html = buildEmailHtml({
    subject,
    preheader: 'Update on your Production Crew access request.',
    body,
    footerNote: `This email was sent in response to your Production Crew access request at ${escapeHtml(emailSettings.orgName)}.`,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to,
    subject,
    html,
  })
}

// ─── Milestone congratulations email (30BN-9.2) ──────────────────

type MilestoneEmailContent = { subject: string; bodyHtml: string }

function milestoneEmailContent(
  name: string,
  milestoneLabel: string,
  milestoneHours: number,
  totalHours: number | null,
  orgName: string
): MilestoneEmailContent {
  const safeName = escapeHtml(name)
  const safeOrgName = escapeHtml(orgName)
  const totalHoursLine =
    totalHours != null
      ? `<p style="color:#555555;line-height:1.6;margin:16px 0 0;">Your total hours: <strong>${totalHours}</strong>.</p>`
      : ''

  switch (milestoneHours) {
    case 0:
      return {
        subject: `Welcome to the ${orgName} volunteer family!`,
        bodyHtml: `
          <h1 style="color:#293994;font-size:22px;font-weight:700;margin:0 0 12px;">
            Welcome to the family, ${safeName}!
          </h1>
          <p style="color:#555555;line-height:1.6;margin:0 0 16px;">
            Welcome to the ${safeOrgName} volunteer community! You've just made your first
            contribution to bringing live theatre to our community — and that means everything to us.
          </p>
          <p style="color:#555555;line-height:1.6;margin:0 0 16px;">
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
          <p style="color:#555555;line-height:1.6;margin:0 0 16px;">
            You've officially logged 10 volunteer hours with ${safeOrgName}. That's real time,
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
          <p style="color:#555555;line-height:1.6;margin:0 0 16px;">
            20 hours. You keep showing up, and it shows. The ${safeOrgName} community is stronger
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
          <p style="color:#555555;line-height:1.6;margin:0 0 16px;">
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
          <p style="color:#555555;line-height:1.6;margin:0 0 16px;">
            Fifty hours. Take a moment to let that sink in. You've given 50 hours of your time to
            ${safeOrgName} — and our community is richer for it. This is a milestone worth
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
          <p style="color:#555555;line-height:1.6;margin:0 0 16px;">
            75 hours of service — you've become one of the pillars of the ${safeOrgName} volunteer
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
          <p style="color:#555555;line-height:1.6;margin:0 0 16px;">
            One hundred hours. This is something very few volunteers ever achieve, and you've done
            it. 100 hours of showing up, helping out, and making live theatre happen. We are deeply
            grateful. You are part of what makes ${safeOrgName} special.
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
          <p style="color:#555555;line-height:1.6;margin:0 0 16px;">
            ${escapeHtml(milestoneLabel)} of volunteer service. You continue to show up for
            ${safeOrgName} in ways that genuinely move us. Thank you for your extraordinary
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
  const emailSettings = await resolveEmailSettings()
  const { subject, bodyHtml } = milestoneEmailContent(
    name,
    milestoneLabel,
    milestoneHours,
    totalHours,
    emailSettings.orgName
  )

  const body = `
    ${bodyHtml}
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`)}
    <p style="margin:24px 0 0;color:#555555;font-size:15px;line-height:1.6;">
      — The ${escapeHtml(emailSettings.orgName)} Team
    </p>
  `

  const html = buildEmailHtml({
    subject,
    preheader: "You've reached a new volunteer milestone!",
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
  })

  await resend.emails.send({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to: email,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview: `Congratulations on reaching ${milestoneLabel}!`,
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
