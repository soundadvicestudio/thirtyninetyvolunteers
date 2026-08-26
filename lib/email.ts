import 'server-only'
import { Resend } from 'resend'
import { getAdminClient } from '@/lib/supabase/admin'
import { lightenHex } from '@/lib/utils/color'
import { substituteMergeTags, type MergeTagValues } from '@/lib/utils/merge-tags'
import { formatWallClockCT } from '@/lib/utils/date'
import type { AuditionEmailStatusType } from '@/types/audition'

const resend = new Resend(process.env.RESEND_API_KEY)

// ADMIN.61 — Resend's SDK returns { data, error } rather than throwing on
// API-level failures (unverified domain, rate limit, validation). These
// wrappers throw on error so existing upstream try/catch blocks fire on
// real delivery failures instead of silently treating them as sent.
async function sendEmail(
  params: Parameters<typeof resend.emails.send>[0]
): Promise<void> {
  const { error } = await resend.emails.send(params)
  if (error) throw new Error(`Resend send failed: ${error.message}`)
}

async function sendBatch(
  params: Parameters<typeof resend.batch.send>[0]
): Promise<void> {
  const { error } = await resend.batch.send(params)
  if (error) throw new Error(`Resend batch failed: ${error.message}`)
}

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
  brandPrimary: string
  brandAccent: string
  brandPrimaryLight: string
  timezone: string
}

async function resolveEmailSettings(): Promise<EmailSettings> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', [
      'email_from_address',
      'email_from_name',
      'org_logo_url',
      'org_name',
      'org_contact_email',
      'brand_primary',
      'brand_accent',
      'org_timezone',
    ])
  const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))
  const address = map['email_from_address'] || 'volunteers@30byninetyvolunteers.com'
  const name = map['email_from_name'] || '30 By Ninety Theatre Volunteers'
  const logoUrl = map['org_logo_url'] || `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
  const orgName = map['org_name'] || '30 By Ninety Theatre'
  const orgContactEmail = map['org_contact_email'] || 'info@30byninety.com'
  const brandPrimary = map['brand_primary'] || '#293994'
  const brandAccent = map['brand_accent'] || '#F26522'
  const brandPrimaryLight = lightenHex(brandPrimary, 0.08)
  const timezone = map['org_timezone'] || 'America/Chicago'
  return {
    from: `${name} <${address}>`,
    logoUrl,
    orgName,
    orgContactEmail,
    brandPrimary,
    brandAccent,
    brandPrimaryLight,
    timezone,
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
  brandPrimary,
}: {
  subject: string
  preheader: string
  body: string
  footerNote?: string
  logoUrl?: string
  orgName?: string
  brandPrimary?: string
}): string {
  const resolvedBrandPrimary = brandPrimary || '#293994'
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
                <td bgcolor="${resolvedBrandPrimary}" style="background-color:${resolvedBrandPrimary};padding:24px 32px;text-align:center;">
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
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you for signing up to volunteer with ${escapeHtml(emailSettings.orgName)}. We're excited to have you join our community!
    </p>
    ${categoriesHtml}
    <p style="margin:0 0 8px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You can update your information at any time using the link below.
    </p>
    <p style="margin:0 0 24px;font-size:14px;">
      <a href="${updateUrl}" style="color:${emailSettings.brandPrimary};">${updateUrl}</a>
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`, emailSettings.brandPrimary)}
  `

  const subject = `Welcome to ${emailSettings.orgName}, ${name}!`
  const html = buildEmailHtml({
    subject,
    preheader: `Welcome to the ${emailSettings.orgName} volunteer community!`,
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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
      ${buildCtaButton('Download Consent Form', activeFormUrl, emailSettings.brandPrimary)}
    `
    : `
      <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
        Your coordinator will provide you with the consent form. Once you have a signed copy, please use the
        button below to upload it.
      </p>
    `

  const body = `
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you for signing up to volunteer with ${escapeHtml(emailSettings.orgName)}! Because you're under 18, we need a
      signed ${documentTypeName} from a parent or guardian before you can start volunteering.
    </p>
    ${downloadSectionHtml}
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Please use the button below to upload your completed form.
    </p>
    ${buildCtaButton('Upload Consent Form', uploadUrl, emailSettings.brandPrimary)}
  `

  const subject = 'Action needed: submit your volunteer consent form'
  const html = buildEmailHtml({
    subject,
    preheader: 'Please submit your volunteer consent form to get started.',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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
  const emailSettings = await resolveEmailSettings()

  const body = `
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You requested a link to update your volunteer information. Click the button below to get started.
    </p>
    ${buildCtaButton('Update My Info', updateUrl, emailSettings.brandPrimary)}
    <p style="margin:24px 0 0;color:#555555;font-size:13px;line-height:1.6;">
      This link is unique to your account. If you didn't request this, you can safely ignore this email.
    </p>
  `

  const subject = 'Your link to update your volunteer information'
  const html = buildEmailHtml({
    subject,
    preheader: "Here's your link to update your volunteer info.",
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Your volunteer profile with ${escapeHtml(emailSettings.orgName)} has been updated successfully.
    </p>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      If you didn't make this change, please contact us at
      <a href="mailto:${escapeHtml(emailSettings.orgContactEmail)}" style="color:${emailSettings.brandPrimary};">${escapeHtml(emailSettings.orgContactEmail)}</a>.
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`, emailSettings.brandPrimary)}
  `

  const subject = 'Your volunteer information has been updated'
  const html = buildEmailHtml({
    subject,
    preheader: 'Your volunteer information has been updated.',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You've been added to the ${escapeHtml(emailSettings.orgName)} Production Crew as ${roleLabel}.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td bgcolor="${emailSettings.brandPrimaryLight}" style="background-color:${emailSettings.brandPrimaryLight};border-radius:8px;padding:20px 24px;">
          <p style="margin:0 0 8px;color:${emailSettings.brandPrimary};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
            Login Details
          </p>
          <p style="margin:0 0 4px;color:#555555;font-size:14px;">
            Login URL: <a href="${loginUrl}" style="color:${emailSettings.brandPrimary};font-weight:600;">${loginUrl}</a>
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
    ${buildCtaButton('Log In to Production Crew', loginUrl, emailSettings.brandPrimary)}
  `

  const subject = `Welcome to ${emailSettings.orgName} Production Crew`
  const html = buildEmailHtml({
    subject,
    preheader: 'Your Production Crew account is ready.',
    body,
    footerNote: `This email was sent because a Production Crew account was created for you at ${escapeHtml(emailSettings.orgName)}.`,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you for your interest in <strong>${safeTitle}</strong>. A member of our team will be in touch
      with you soon.
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`, emailSettings.brandPrimary)}
  `

  const html = buildEmailHtml({
    subject,
    preheader: 'We received your expression of interest.',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You're confirmed for <strong>${safeTitle}</strong> with ${escapeHtml(emailSettings.orgName)}. We're looking forward to
      working with you!
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`, emailSettings.brandPrimary)}
  `

  const html = buildEmailHtml({
    subject,
    preheader: 'Your volunteer position is confirmed!',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
    from: emailSettings.from,
    to,
    subject,
    html,
  })

  return { subject, preview }
}


// ─── Slot claiming emails (30BN-5.2) ─────────────────────────────

function emailShell(bodyHtml: string, orgName?: string, brandPrimary?: string): string {
  const safeOrgName = escapeHtml(orgName || '30 By Ninety Theatre')
  const resolvedBrandPrimary = brandPrimary || '#293994'
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f5f5;
                 font-family:'Open Sans',Arial,sans-serif;">
      <div style="max-width:560px;margin:32px auto;
                  background:#ffffff;border-radius:8px;
                  overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
        <div style="background:${resolvedBrandPrimary};padding:28px 32px;">
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

function instructionsBlockHtml(volunteerInstructions: string | null, brandPrimary?: string): string {
  if (!volunteerInstructions) return ''
  const resolvedBrandPrimary = brandPrimary || '#293994'
  const resolvedBrandPrimaryLight = lightenHex(resolvedBrandPrimary, 0.08)
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td bgcolor="${resolvedBrandPrimaryLight}" style="background-color:${resolvedBrandPrimaryLight};border-radius:8px;padding:20px 24px;">
          <p style="margin:0 0 8px;color:${resolvedBrandPrimary};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
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

function cancelLinkHtml(cancelUrl: string, brandPrimary?: string): string {
  const resolvedBrandPrimary = brandPrimary || '#293994'
  return `
    <p style="color:#888888;font-size:12px;margin:24px 0 0;font-family:'Open Sans',Arial,sans-serif;">
      Need to cancel? <a href="${cancelUrl}" style="color:${resolvedBrandPrimary};">Click here</a>.
    </p>
  `
}

function addToCalendarLinkHtml(claimToken: string, brandPrimary?: string): string {
  const resolvedBrandPrimary = brandPrimary || '#293994'
  const icsUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/calendar/claim.ics?token=${claimToken}`
  return `
    <p style="margin:16px 0;">
      <a href="${icsUrl}" style="color:${resolvedBrandPrimary};text-decoration:underline;">
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
  const emailSettings = await resolveEmailSettings()
  const body = `
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${escapeHtml(volunteerName)},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Great news — your volunteer spot has been confirmed for <strong>${escapeHtml(showName)}</strong>.
    </p>
    ${showDetailsBlockHtml(showName, showDate, showTime, roleName)}
    ${instructionsBlockHtml(volunteerInstructions, emailSettings.brandPrimary)}
    ${calendarEnabled ? addToCalendarLinkHtml(claimToken, emailSettings.brandPrimary) : ''}
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`, emailSettings.brandPrimary)}
    ${cancelLinkHtml(cancelUrl, emailSettings.brandPrimary)}
  `

  const subject = `You're signed up! — ${showName}`
  const html = buildEmailHtml({
    subject,
    preheader: 'Your volunteer spot is confirmed!',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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
  const emailSettings = await resolveEmailSettings()
  const body = `
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${escapeHtml(volunteerName)},</h1>
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
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`, emailSettings.brandPrimary)}
    <p style="margin:24px 0 0;color:#888888;font-size:12px;font-family:'Open Sans',Arial,sans-serif;">
      Plans changed? <a href="${cancelUrl}" style="color:${emailSettings.brandPrimary};">Remove yourself from the waitlist</a>.
    </p>
  `

  const subject = `You're on the waitlist — ${showName}`
  const html = buildEmailHtml({
    subject,
    preheader: `You're on the waitlist for ${showName}.`,
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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
  const emailSettings = await resolveEmailSettings()
  const body = `
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${escapeHtml(volunteerName)},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Great news! A volunteer spot has opened up for <strong>${escapeHtml(showName)}</strong>, and you've moved
      from the waitlist to a confirmed spot.
    </p>
    ${showDetailsBlockHtml(showName, showDate, showTime, roleName)}
    ${calendarEnabled ? addToCalendarLinkHtml(claimToken, emailSettings.brandPrimary) : ''}
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`, emailSettings.brandPrimary)}
    ${cancelLinkHtml(cancelUrl, emailSettings.brandPrimary)}
  `

  const subject = `Good news — a spot opened up! — ${showName}`
  const html = buildEmailHtml({
    subject,
    preheader: 'Good news — a volunteer spot just opened up!',
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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
    <h1 style="color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;margin:0 0 12px;">
      Volunteer cancellation
    </h1>
    <p style="color:#555;line-height:1.6;margin:0 0 16px;">
      <strong>${escapeHtml(volunteerName)}</strong> (${escapeHtml(volunteerEmail)}) has cancelled
      their volunteer spot for <strong>${escapeHtml(roleName)}</strong> on ${escapeHtml(showDate)}
      (${escapeHtml(showName)}).
    </p>
    <a href="${adminShowUrl}"
       style="display:inline-block;background:${emailSettings.brandAccent};
              color:#ffffff;text-decoration:none;
              padding:14px 28px;border-radius:8px;
              font-weight:700;font-size:15px;">
      View Show in Production Crew
    </a>
  `,
    emailSettings.orgName,
    emailSettings.brandPrimary
  )

  // R8 — multi-recipient send uses resend.batch.send(), one entry per editor.
  await sendBatch(
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
  brandPrimary?: string
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
  brandPrimary,
}: ReminderEmailParams): { from: string; replyTo: string; to: string; subject: string; html: string } {
  const safeOrgName = escapeHtml(orgName || '30 By Ninety Theatre')
  const resolvedBrandPrimary = brandPrimary || '#293994'
  const body = `
    <h1 style="margin:0 0 16px;color:${resolvedBrandPrimary};font-size:22px;font-weight:700;">Hi ${escapeHtml(volunteerName)},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Just a friendly reminder that you're volunteering tomorrow:
    </p>
    ${showDetailsBlockHtml(showName, showDate, showTime, roleName)}
    ${instructionsBlockHtml(volunteerInstructions, resolvedBrandPrimary)}
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`, resolvedBrandPrimary)}
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
    brandPrimary: resolvedBrandPrimary,
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
  brandPrimary?: string
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
  brandPrimary,
}: ThankYouEmailParams): { from: string; replyTo: string; to: string; subject: string; html: string } {
  const safeOrgName = escapeHtml(orgName || '30 By Ninety Theatre')
  const resolvedBrandPrimary = brandPrimary || '#293994'
  const body = `
    <h1 style="margin:0 0 16px;color:${resolvedBrandPrimary};font-size:22px;font-weight:700;">Thank you, ${escapeHtml(recipientName)}!</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you so much for volunteering for <strong>${escapeHtml(showName)}</strong> on ${showDate}. Your
      time and dedication make ${safeOrgName} possible.
    </p>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You can view your updated volunteer hours and milestones on the Volunteer Call Board.
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${siteUrl}/callboard`, resolvedBrandPrimary)}
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
    brandPrimary: resolvedBrandPrimary,
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
    await sendBatch(chunk)
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
  brandPrimary?: string
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
  brandPrimary,
}: CategoryMatchNotificationEmailParams): {
  from: string
  replyTo: string
  to: string
  subject: string
  html: string
} {
  const rolesList = matchingRoles.map((r) => escapeHtml(r)).join(', ')
  const resolvedBrandPrimary = brandPrimary || '#293994'

  const body = `
    <h1 style="margin:0 0 16px;color:${resolvedBrandPrimary};font-size:22px;font-weight:700;">Hi ${escapeHtml(volunteerName)}, we could use your help!</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      A show you might be interested in is coming up: <strong>${escapeHtml(showName)}</strong>.
    </p>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      We're looking for volunteers in these areas: <strong>${rolesList}</strong>.
    </p>
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`, resolvedBrandPrimary)}
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
    brandPrimary: resolvedBrandPrimary,
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
  await sendEmail(
    buildCategoryMatchNotificationPayload({
      ...params,
      from: emailSettings.from,
      replyTo: emailSettings.orgContactEmail,
      brandPrimary: emailSettings.brandPrimary,
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
  brandPrimary?: string
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
  brandPrimary,
}: ShowBulkEmailParams): {
  from: string
  replyTo: string
  to: string
  subject: string
  html: string
} {
  const safeBody = escapeHtml(body)
  const preheader = body.slice(0, 100)
  const resolvedBrandPrimary = brandPrimary || '#293994'

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
      <a href="${siteUrl}/update" style="color:${resolvedBrandPrimary};">${siteUrl}/update</a>.
    </p>
  `

  const html = buildEmailHtml({
    subject,
    preheader,
    body: bodyHtml,
    footerNote: `This message was sent to you by the production team at ${escapeHtml(orgName || '30 By Ninety Theatre')}.`,
    logoUrl,
    orgName,
    brandPrimary: resolvedBrandPrimary,
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
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">New access request</h1>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      <strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) has requested access to the
      ${escapeHtml(emailSettings.orgName)} Production Crew. Log in to review and approve or decline this request.
    </p>
    ${buildCtaButton('Review Request', reviewUrl, emailSettings.brandPrimary)}
  `

  const html = buildEmailHtml({
    subject,
    preheader: 'A new Production Crew access request is waiting.',
    body,
    footerNote: `This email was sent to Production Crew administrators of ${escapeHtml(emailSettings.orgName)}.`,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  if (to.length === 1) {
    await sendEmail({
      from: emailSettings.from,
      to: to[0],
      subject,
      html,
    })
    return
  }

  // R8 — multi-recipient send uses resend.batch.send(), one entry per Super Admin.
  await sendBatch(
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
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${escapeHtml(name)}, you're approved!</h1>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Your request to join the ${escapeHtml(emailSettings.orgName)} Production Crew has been approved. You can now log in
      at the link below with the email and password you registered with.
    </p>
    ${buildCtaButton('Log In to Production Crew', loginUrl, emailSettings.brandPrimary)}
  `

  const subject = 'Your access request has been approved'
  const html = buildEmailHtml({
    subject,
    preheader: 'Your Production Crew access has been approved.',
    body,
    footerNote: 'This email was sent because your Production Crew access request was approved.',
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to,
    subject,
    html,
  })
}

type GoogleApprovalEmailParams = {
  to: string
  name: string
  sentBy: string | null
}

// Approval welcome email for Google OAuth registrants — no temp password,
// since the Google identity is the credential. Sign-in is via the
// "Sign in with Google" button, not email/password.
export async function sendGoogleApprovalEmail({
  to,
  name,
  sentBy,
}: GoogleApprovalEmailParams): Promise<void> {
  const emailSettings = await resolveEmailSettings()
  const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/crew/login`
  const safeName = escapeHtml(name)
  const safeOrgName = escapeHtml(emailSettings.orgName)

  const body = `
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName}, you're approved!</h1>
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Great news — your request to join the ${safeOrgName} Production Crew has been approved. Use the button below
      to sign in with your Google account.
    </p>
    ${buildCtaButton('Sign In to Production Crew', loginUrl, emailSettings.brandPrimary)}
  `

  const subject = `Your ${emailSettings.orgName} Production Crew access has been approved`
  const html = buildEmailHtml({
    subject,
    preheader: 'Your Production Crew access has been approved.',
    body,
    footerNote: `This email was sent because your Production Crew access request was approved at ${safeOrgName}.`,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview: 'Your Google account has been approved for Production Crew access.',
    recipientType: 'transactional',
    recipientFilter: 'trigger:google_approval',
    sentBy,
    recipients: [{ email: to }],
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
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${escapeHtml(name)},</h1>
    <p style="margin:0 0 8px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you for your interest in the ${escapeHtml(emailSettings.orgName)} Production Crew. Unfortunately your access
      request was not approved at this time.
    </p>
    <p style="margin:0;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Please reach out to us at <a href="mailto:${escapeHtml(emailSettings.orgContactEmail)}" style="color:${emailSettings.brandPrimary};">${escapeHtml(emailSettings.orgContactEmail)}</a>
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
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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
  orgName: string,
  brandPrimary?: string
): MilestoneEmailContent {
  const safeName = escapeHtml(name)
  const safeOrgName = escapeHtml(orgName)
  const resolvedBrandPrimary = brandPrimary || '#293994'
  const totalHoursLine =
    totalHours != null
      ? `<p style="color:#555555;line-height:1.6;margin:16px 0 0;">Your total hours: <strong>${totalHours}</strong>.</p>`
      : ''

  switch (milestoneHours) {
    case 0:
      return {
        subject: `Welcome to the ${orgName} volunteer family!`,
        bodyHtml: `
          <h1 style="color:${resolvedBrandPrimary};font-size:22px;font-weight:700;margin:0 0 12px;">
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
          <h1 style="color:${resolvedBrandPrimary};font-size:22px;font-weight:700;margin:0 0 12px;">
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
          <h1 style="color:${resolvedBrandPrimary};font-size:22px;font-weight:700;margin:0 0 12px;">
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
          <h1 style="color:${resolvedBrandPrimary};font-size:22px;font-weight:700;margin:0 0 12px;">
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
          <h1 style="color:${resolvedBrandPrimary};font-size:22px;font-weight:700;margin:0 0 12px;">
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
          <h1 style="color:${resolvedBrandPrimary};font-size:22px;font-weight:700;margin:0 0 12px;">
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
          <h1 style="color:${resolvedBrandPrimary};font-size:22px;font-weight:700;margin:0 0 12px;">
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
          <h1 style="color:${resolvedBrandPrimary};font-size:22px;font-weight:700;margin:0 0 12px;">
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
    emailSettings.orgName,
    emailSettings.brandPrimary
  )

  const body = `
    ${bodyHtml}
    ${buildCtaButton('Visit Your Volunteer Hub', `${process.env.NEXT_PUBLIC_SITE_URL}/callboard`, emailSettings.brandPrimary)}
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
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
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

// ─── Audition signup confirmation email (Phase AUDITIONS) ────────

type AuditionSignupConfirmationParams = {
  to: string
  name: string
  auditionTitle: string
  auditionDate: string
  auditionTime: string | null
  locationName: string | null
  cancelToken: string
  uploadToken: string
  hasMaterials: boolean
  siteUrl: string
  auditionId: string
}

export async function sendAuditionSignupConfirmation({
  to,
  name,
  auditionTitle,
  auditionDate,
  auditionTime,
  locationName,
  cancelToken,
  uploadToken,
  hasMaterials,
  siteUrl,
  auditionId,
}: AuditionSignupConfirmationParams): Promise<void> {
  const emailSettings = await resolveEmailSettings()
  const safeName = escapeHtml(name)
  const safeTitle = escapeHtml(auditionTitle)
  const cancelUrl = `${siteUrl}/auditions/cancel/${cancelToken}`
  const uploadUrl = `${siteUrl}/auditions/upload/${uploadToken}`
  const detailsUrl = `${siteUrl}/auditions/${auditionId}`

  const scheduleBlockHtml =
    auditionDate || auditionTime || locationName
      ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
          <tr>
            <td bgcolor="#F5F5F5" style="background-color:#F5F5F5;border-radius:8px;padding:16px 20px;">
              ${auditionDate ? `<p style="margin:0 0 4px;color:#1A1A1A;font-size:14px;">Date: ${escapeHtml(auditionDate)}</p>` : ''}
              ${auditionTime ? `<p style="margin:0 0 4px;color:#1A1A1A;font-size:14px;">Time: ${escapeHtml(auditionTime)}</p>` : ''}
              ${locationName ? `<p style="margin:0;color:#1A1A1A;font-size:14px;">Location: ${escapeHtml(locationName)}</p>` : ''}
            </td>
          </tr>
        </table>
      `
      : ''

  const uploadSectionHtml = hasMaterials
    ? `
      <p style="margin:0 0 8px;color:#1A1A1A;font-size:15px;line-height:1.6;">
        Need to submit materials?
      </p>
      <p style="margin:0 0 20px;font-size:14px;">
        <a href="${uploadUrl}" style="color:${emailSettings.brandPrimary};">${uploadUrl}</a>
      </p>
    `
    : ''

  const body = `
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      You're signed up to audition for <strong>${safeTitle}</strong>.
    </p>
    ${scheduleBlockHtml}
    ${buildCtaButton('View Audition Details', detailsUrl, emailSettings.brandAccent)}
    ${uploadSectionHtml}
    <p style="margin:24px 0 0;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Need to cancel?
    </p>
    <p style="margin:0;font-size:14px;">
      <a href="${cancelUrl}" style="color:${emailSettings.brandPrimary};">${cancelUrl}</a>
    </p>
  `

  const subject = `Audition signup confirmed — ${auditionTitle}`
  const html = buildEmailHtml({
    subject,
    preheader: `You're signed up to audition for ${auditionTitle}.`,
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview: `You're signed up to audition for ${auditionTitle}.`,
    recipientType: 'transactional',
    recipientFilter: 'trigger:audition_signup_confirmation',
    sentBy: null,
    recipients: [{ email: to }],
  })
}

// ─── Audition consent form request email (Phase AUDITIONS) ──────

type AuditionConsentFormRequestEmailParams = {
  to: string
  name: string
  auditionTitle: string
  uploadToken: string
  activeFormUrl: string | null
  documentTypeName: string
  auditionSignupId: string
}

export async function sendAuditionConsentFormRequestEmail({
  to,
  name,
  auditionTitle,
  uploadToken,
  activeFormUrl,
  documentTypeName,
}: AuditionConsentFormRequestEmailParams): Promise<void> {
  const uploadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/consent/${uploadToken}`
  const safeName = escapeHtml(name)
  const safeTitle = escapeHtml(auditionTitle)
  const safeDocTypeName = escapeHtml(documentTypeName)
  const emailSettings = await resolveEmailSettings()

  const downloadSectionHtml = activeFormUrl
    ? `
      <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
        Please download the ${safeDocTypeName}, have a parent or guardian sign it, then use the button below to
        upload the signed copy.
      </p>
      ${buildCtaButton('Download Consent Form', activeFormUrl, emailSettings.brandPrimary)}
    `
    : `
      <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
        Your coordinator will provide you with the consent form. Once you have a signed copy, please use the
        button below to upload it.
      </p>
    `

  const body = `
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Thank you for signing up to audition for <strong>${safeTitle}</strong>. Because you or your auditioner is
      under 18, a signed ${safeDocTypeName} from a parent or guardian is required.
    </p>
    ${downloadSectionHtml}
    <p style="margin:0 0 24px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Please use the button below to upload your completed form.
    </p>
    ${buildCtaButton('Submit Your Consent Form', uploadUrl, emailSettings.brandPrimary)}
  `

  const subject = `Action needed: consent form for ${auditionTitle}`
  const html = buildEmailHtml({
    subject,
    preheader: `A signed consent form is needed for ${auditionTitle}.`,
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
    from: emailSettings.from,
    to,
    subject,
    html,
  })

  // NOTE: email_log_recipients.volunteer_id is nullable — auditioners are
  // not volunteers. Traceability to the audition_signup is via
  // consent_form_submissions.audition_signup_id (Migration 032), not via
  // this email log entry, which carries no audition FK. Accepted
  // traceability approach confirmed AUDITIONS.A Audit E.
  await logEmailSent({
    subject,
    bodyPreview: `A signed consent form is needed for ${auditionTitle}.`,
    recipientType: 'transactional',
    recipientFilter: 'trigger:audition_consent_form_request',
    sentBy: null,
    recipients: [{ email: to, volunteerId: null }],
  })
}

// ─── Audition status change notification email (Phase AUDITIONS) ─
//
// Unlike every other function in this file, this one fetches all of its
// own data — the call site (updateAuditionSignupStatus() in
// lib/actions/auditions-admin.ts) passes only IDs. Deliberate exception
// to the "dumb function, all data passed in" convention used elsewhere in
// this file, since the call site does not already have the show/location/
// template data joined and assembling it there would require restructuring
// that action for a single non-blocking side effect.

type AuditionStatusEmailParams = {
  signupId: string
  auditionId: string
  status: AuditionEmailStatusType
}

export async function sendAuditionStatusEmail({ signupId, auditionId, status }: AuditionStatusEmailParams): Promise<void> {
  const supabase = getAdminClient()

  const { data: template } = await supabase
    .from('audition_email_templates')
    .select('subject, body_html')
    .eq('audition_id', auditionId)
    .eq('status_type', status)
    .maybeSingle()

  // Brief §8: "If no template exists for a status, automatic firing is
  // silently skipped." No error, no throw.
  if (!template) return

  const { data: signup } = await supabase
    .from('audition_signups')
    .select('name, email, cast_role')
    .eq('id', signupId)
    .maybeSingle()

  if (!signup) return

  const { data: audition } = await supabase
    .from('auditions')
    .select(
      'title, date_start, time_start, shows!auditions_show_id_fkey ( name ), locations!auditions_location_id_fkey ( name )'
    )
    .eq('id', auditionId)
    .maybeSingle()

  if (!audition) return

  const emailSettings = await resolveEmailSettings()

  // Supabase normalizes to-one FK joins as either an object or a
  // single-element array depending on relation inference — same
  // normalization pattern used throughout lib/actions/auditions.ts and
  // lib/actions/auditions-admin.ts.
  const show = Array.isArray(audition.shows) ? audition.shows[0] : audition.shows
  const location = Array.isArray(audition.locations) ? audition.locations[0] : audition.locations

  const values: MergeTagValues = {
    auditioner_name: signup.name,
    show_title: show?.name,
    audition_title: audition.title,
    audition_date: formatWallClockCT(audition.date_start, null, 'MMMM d, yyyy', emailSettings.timezone),
    audition_location: location?.name,
    cast_role: signup.cast_role ?? undefined,
    org_name: emailSettings.orgName,
  }

  // The substituted body is TipTap-generated HTML with merge tag values
  // already escaped internally by substituteMergeTags() — do NOT
  // escapeHtml() it here, same exception as the blast body (Process §14).
  const substitutedBody = substituteMergeTags(template.body_html, values)

  const html = buildEmailHtml({
    subject: template.subject,
    preheader: template.subject,
    body: substitutedBody,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  // R8 — single recipient uses resend.emails.send() directly, not batch.
  await sendEmail({
    from: emailSettings.from,
    replyTo: emailSettings.orgContactEmail,
    to: signup.email,
    subject: template.subject,
    html,
  })

  await logEmailSent({
    subject: template.subject,
    bodyPreview: template.subject,
    recipientType: 'transactional',
    recipientFilter: `trigger:audition_status_${status}`,
    sentBy: null,
    recipients: [{ email: signup.email }],
  })
}

// ─── Audition cancellation confirmation email (Phase AUDITIONS) ──

type AuditionCancellationEmailParams = {
  to: string
  name: string
  auditionTitle: string
}

export async function sendAuditionCancellationEmail({
  to,
  name,
  auditionTitle,
}: AuditionCancellationEmailParams): Promise<void> {
  const emailSettings = await resolveEmailSettings()
  const safeName = escapeHtml(name)
  const safeTitle = escapeHtml(auditionTitle)

  const body = `
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${safeName},</h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      Your signup to audition for <strong>${safeTitle}</strong> has been cancelled. If this was a mistake, please
      sign up again at the audition page.
    </p>
    <p style="margin:0;color:#1A1A1A;font-size:15px;line-height:1.6;">
      No further action is needed.
    </p>
  `

  const subject = 'Your audition signup has been cancelled'
  const html = buildEmailHtml({
    subject,
    preheader: `Your audition signup for ${auditionTitle} has been cancelled.`,
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
    from: emailSettings.from,
    to,
    subject,
    html,
  })

  await logEmailSent({
    subject,
    bodyPreview: `Your audition signup for ${auditionTitle} has been cancelled.`,
    recipientType: 'transactional',
    recipientFilter: 'trigger:audition_cancellation',
    sentBy: null,
    recipients: [{ email: to }],
  })
}

// ─── Forum reply notification (Phase FORUMS) ─────────────────────
// R8 — batch sends via sendBatchEmails()/resend.batch.send() since a
// thread can have more than one subscriber. One personalized payload is
// built per subscriber, then sent and logged as a single batch — same
// pattern as buildReminderEmailPayload()/buildThankYouEmailPayload().

export async function sendForumNotificationEmail(
  threadId: string,
  newPostId: string
): Promise<{ notifiedUserIds: string[] }> {
  const adminClient = getAdminClient()

  const { data: post } = await adminClient
    .from('forum_posts')
    .select('author_id')
    .eq('id', newPostId)
    .maybeSingle()
  if (!post) return { notifiedUserIds: [] }

  const { data: thread } = await adminClient
    .from('forum_threads')
    .select('title, forum_id')
    .eq('id', threadId)
    .maybeSingle()
  if (!thread) return { notifiedUserIds: [] }

  const { data: poster } = await adminClient.from('admin_users').select('name').eq('id', post.author_id).maybeSingle()
  const posterName = poster?.name || 'Someone'

  const { data: subs } = await adminClient
    .from('forum_thread_subscriptions')
    .select('admin_user_id, admin_users!forum_thread_subscriptions_admin_user_id_fkey(email, name)')
    .eq('thread_id', threadId)
    .neq('admin_user_id', post.author_id)
  if (!subs || subs.length === 0) return { notifiedUserIds: [] }

  const notifiedUserIds = subs.map((sub) => sub.admin_user_id)

  const emailSettings = await resolveEmailSettings()
  const threadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/crew/forums/${thread.forum_id}/${threadId}`
  const safePosterName = escapeHtml(posterName)
  const safeTitle = escapeHtml(thread.title)
  const subject = `${emailSettings.orgName} — New reply in "${thread.title}"`

  const payloads: BatchEmailPayload[] = []
  for (const sub of subs) {
    const subscriber = Array.isArray(sub.admin_users) ? sub.admin_users[0] : sub.admin_users
    if (!subscriber?.email) continue

    const body = `
      <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">Hi ${escapeHtml(subscriber.name || 'there')},</h1>
      <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
        ${safePosterName} replied to a thread you're subscribed to:
      </p>
      <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
        <strong>${safeTitle}</strong>
      </p>
      ${buildCtaButton('View Thread', threadUrl, emailSettings.brandPrimary)}
    `

    payloads.push({
      from: emailSettings.from,
      to: subscriber.email,
      subject,
      html: buildEmailHtml({
        subject,
        preheader: `${safePosterName} replied to ${safeTitle}`,
        body,
        logoUrl: emailSettings.logoUrl,
        orgName: emailSettings.orgName,
        brandPrimary: emailSettings.brandPrimary,
      }),
    })
  }

  if (payloads.length === 0) return { notifiedUserIds }

  try {
    await sendBatchEmails(payloads)
    await logEmailSent({
      subject,
      bodyPreview: `${posterName} replied to ${thread.title}`,
      recipientType: 'transactional',
      recipientFilter: 'trigger:forum_notification',
      sentBy: null,
      recipients: payloads.map((p) => ({ email: p.to })),
    })
  } catch {
    // Swallow — notification failure must never propagate. The call site
    // in forum-posts.ts also wraps this call in try/catch as defense in depth.
  }

  return { notifiedUserIds }
}

// ─── Direct message notification email (Phase MESSAGES) ──────────

export async function sendDirectMessageEmail({
  to,
  senderName,
  subject,
  threadId,
  senderId,
  isReply = false,
}: {
  to: string
  senderName: string
  subject: string
  threadId: string
  senderId: string
  isReply?: boolean
}): Promise<void> {
  const emailSettings = await resolveEmailSettings()
  const safeSubject = escapeHtml(subject)
  const safeSenderName = escapeHtml(senderName)
  const emailSubject = isReply ? `Re: ${safeSubject}` : `New message: ${safeSubject}`
  const threadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/crew/messages/${threadId}`

  const body = `
    <h1 style="margin:0 0 16px;color:${emailSettings.brandPrimary};font-size:22px;font-weight:700;">
      You have a new ${isReply ? 'reply' : 'message'}
    </h1>
    <p style="margin:0 0 16px;color:#1A1A1A;font-size:15px;line-height:1.6;">
      ${safeSenderName} sent you a message regarding:
      <strong>${safeSubject}</strong>
    </p>
    ${buildCtaButton('View Message', threadUrl, emailSettings.brandPrimary)}
  `

  const html = buildEmailHtml({
    subject: emailSubject,
    preheader: `${safeSenderName} sent you a message: ${safeSubject}`,
    body,
    logoUrl: emailSettings.logoUrl,
    orgName: emailSettings.orgName,
    brandPrimary: emailSettings.brandPrimary,
  })

  await sendEmail({
    from: emailSettings.from,
    to,
    subject: emailSubject,
    html,
  })

  await logEmailSent({
    subject: emailSubject,
    bodyPreview: `${senderName} sent you a ${isReply ? 'reply' : 'message'} regarding: ${subject}`,
    recipientType: 'transactional',
    recipientFilter: 'trigger:direct_message',
    sentBy: senderId,
    recipients: [{ email: to, volunteerId: null }],
  })
}
