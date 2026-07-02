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
