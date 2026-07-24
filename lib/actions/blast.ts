'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import sanitizeHtml from 'sanitize-html'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'
import { sendBatchEmails } from '@/lib/email'

type BlastPayload = {
  recipientMode: 'all' | 'category' | 'individual'
  categoryIds: string[]
  individualIds: string[]
  subject: string
  replyTo: string
  body: string
}

type Recipient = {
  id: string
  full_name: string
  email: string
}

// Not exported — shared recipient resolution for previewBlast() and
// sendBlastEmail(), so the two can never drift out of sync.
async function resolveBlastRecipients(payload: BlastPayload): Promise<Recipient[]> {
  const supabase = await getServerClient()
  let rows: Recipient[] = []

  if (payload.recipientMode === 'all') {
    const { data } = await supabase
      .from('volunteers')
      .select('id, full_name, email')
      .eq('status', 'active')
    rows = data ?? []
  } else if (payload.recipientMode === 'category') {
    if (!payload.categoryIds?.length) return []
    // Two-query approach: get matching volunteer IDs from assignments,
    // then fetch volunteer records. Avoids PostgREST inner-join syntax
    // ambiguity — same pattern used throughout this codebase.
    const { data: assignments } = await supabase
      .from('volunteer_category_assignments')
      .select('volunteer_id')
      .in('category_id', payload.categoryIds)
    const ids = [...new Set((assignments ?? []).map((a) => a.volunteer_id))]
    if (ids.length === 0) return []
    const { data } = await supabase
      .from('volunteers')
      .select('id, full_name, email')
      .in('id', ids)
      .eq('status', 'active')
    rows = data ?? []
  } else if (payload.recipientMode === 'individual') {
    if (!payload.individualIds?.length) return []
    const { data } = await supabase
      .from('volunteers')
      .select('id, full_name, email')
      .in('id', payload.individualIds)
      .eq('status', 'active')
    rows = data ?? []
  }

  // Deduplicate by lowercased email — same pattern as sendShowBulkEmail()
  // in lib/actions/shows.ts.
  const seen = new Set<string>()
  return rows.filter((r) => {
    const key = r.email.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const FROM_ADDRESS = '30 By Ninety Theatre <volunteers@30byninetyvolunteers.com>'

// Local duplicate of lib/email.ts's escapeHtml() — that function is not
// exported, and lib/email.ts is out of scope for this prompt (30BN-13.3a).
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Local equivalent of lib/email.ts's buildEmailHtml() — that helper is
// not exported. Table-based layout, inline styles only, matching the
// branded look of every other transactional email in the app.
//
// IMPORTANT: `body` is NOT escaped here — it is TipTap-generated HTML
// (30BN-13.3b) and escaping it would turn every tag into visible text.
// The caller (sendBlastEmail(), 30BN-13.4a) sanitizes it with
// sanitize-html before it ever reaches this function, so by the time
// it arrives here it is already restricted to a safe allowlist of tags
// and attributes. `recipientName` and `subject` ARE escaped here: they
// are always plain text, never HTML.
function buildBlastEmailHtml({
  recipientName,
  subject,
  body,
}: {
  recipientName: string
  subject: string
  body: string
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const logoHtml = siteUrl
    ? `<img src="${siteUrl}/logo.png" height="50" width="auto" alt="30 By Ninety Theatre" style="display:block;margin:0 auto;">`
    : ''
  const safeName = escapeHtml(recipientName)
  const safeSubject = escapeHtml(subject)

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${safeSubject}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#F5F5F5;font-family:'Open Sans',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F5F5;">
        <tr>
          <td align="center" style="padding:24px 16px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:8px;overflow:hidden;">
              <tr>
                <td bgcolor="#293994" style="background-color:#293994;padding:24px 32px;text-align:center;">
                  ${logoHtml}
                  <p style="margin:8px 0 0 0;color:#FFFFFF;font-size:13px;font-family:'Open Sans',Arial,sans-serif;letter-spacing:0.5px;">
                    30 BY NINETY THEATRE
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;color:#1A1A1A;font-size:15px;line-height:1.6;font-family:'Open Sans',Arial,sans-serif;">
                  <p style="margin:0 0 20px;color:#1A1A1A;font-size:15px;line-height:1.6;">
                    Hi ${safeName},
                  </p>
                  <!-- body is TipTap HTML (13.3b), sanitized by the caller
                       before reaching here (13.4a). white-space:pre-line
                       preserves paragraph spacing; revisit if it ever
                       double-spaces rich-text block elements. -->
                  <div style="color:#1A1A1A;font-size:15px;line-height:1.6;white-space:pre-line;">
                    ${body}
                  </div>
                </td>
              </tr>
              <tr>
                <td bgcolor="#F5F5F5" style="background-color:#F5F5F5;padding:24px 32px;text-align:center;border-top:1px solid #D0D5E8;">
                  <p style="margin:0;color:#555555;font-size:12px;line-height:1.5;font-family:'Open Sans',Arial,sans-serif;">
                    30 By Ninety Theatre &bull; Old Mandeville, LA
                    <br>
                    This message was sent to you by the 30 By Ninety Theatre Production Crew.
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

export async function searchVolunteers(
  query: string
): Promise<Array<{ id: string; full_name: string; email: string }>> {
  const term = query.trim()
  if (term.length < 2) return []
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('volunteers')
    .select('id, full_name, email')
    .eq('status', 'active')
    .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
    .order('full_name')
    .limit(10)
  if (error || !data) return []
  return data
}

type BlastPreview = {
  recipientCount: number
  sampleEmails: string[]
  error?: string
}

export async function previewBlast(payload: BlastPayload): Promise<BlastPreview> {
  try {
    const admin = await getAdminUser()
    if (!admin || admin.role === 'viewer' || admin.role === 'production') {
      return { recipientCount: 0, sampleEmails: [], error: 'Insufficient permissions' }
    }

    const recipients = await resolveBlastRecipients(payload)

    return {
      recipientCount: recipients.length,
      sampleEmails: recipients.slice(0, 5).map((r) => r.email),
    }
  } catch (err) {
    console.error('previewBlast error:', err)
    return { recipientCount: 0, sampleEmails: [], error: 'Failed to resolve recipients' }
  }
}

const blastSchema = z.object({
  subject: z.string().min(1).max(200),
  replyTo: z.string().email(),
  body: z.string().min(1).max(10000),
  recipientMode: z.enum(['all', 'category', 'individual']),
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  individualIds: z.array(z.string().uuid()).optional().default([]),
})

type BlastResult = {
  success: boolean
  recipientCount: number
  error?: string
}

export async function sendBlastEmail(payload: BlastPayload): Promise<BlastResult> {
  try {
    const admin = await getAdminUser()
    if (!admin || admin.role === 'viewer' || admin.role === 'production') {
      return { success: false, recipientCount: 0, error: 'Insufficient permissions' }
    }

    const parsed = blastSchema.safeParse(payload)
    if (!parsed.success) {
      return { success: false, recipientCount: 0, error: 'Invalid input' }
    }

    const recipients = await resolveBlastRecipients(parsed.data)
    if (recipients.length === 0) {
      return { success: false, recipientCount: 0, error: 'No recipients found' }
    }

    // Sanitize the TipTap HTML output before sending (30BN-13.4a).
    // Allows only the tags and attributes StarterKit produces. Strips
    // <script>, event handlers, and javascript: hrefs. Does NOT escape
    // the body — it remains HTML for the email template.
    const sanitizedBody = sanitizeHtml(parsed.data.body, {
      allowedTags: ['p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3', 'blockquote', 'hr', 'a'],
      allowedAttributes: {
        a: ['href', 'rel'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
    })

    // Build payloads — one per recipient. Case B (see 30BN-13.3a build
    // report): buildShowBulkEmailPayload() in lib/email.ts is exported but
    // hardcodes show-specific copy that doesn't fit a general blast, and
    // lib/email.ts is out of scope for this prompt. buildBlastEmailHtml()
    // above is the local equivalent.
    // NOTE: sanitizedBody (not parsed.data.body) is passed through as-is
    // from here on — do NOT wrap it in escapeHtml() here or in
    // buildBlastEmailHtml(). It is TipTap-generated HTML (30BN-13.3b);
    // escaping it would turn every tag into visible text. sanitizeHtml()
    // above is what makes this safe to trust — it strips anything not on
    // the allowlist before this point.
    const payloads = recipients.map((r) => ({
      from: FROM_ADDRESS,
      replyTo: parsed.data.replyTo,
      to: r.email,
      subject: parsed.data.subject,
      html: buildBlastEmailHtml({
        recipientName: r.full_name,
        subject: parsed.data.subject,
        body: sanitizedBody,
      }),
    }))

    await sendBatchEmails(payloads)

    const recipientFilter =
      parsed.data.recipientMode === 'category'
        ? `category:${parsed.data.categoryIds.join(',')}`
        : parsed.data.recipientMode

    const supabase = await getServerClient()
    const { data: logRow, error: logError } = await supabase
      .from('email_log')
      .insert({
        subject: parsed.data.subject,
        body_preview: sanitizedBody.replace(/<[^>]+>/g, '').slice(0, 150),
        recipient_type: parsed.data.recipientMode,
        recipient_filter: recipientFilter,
        sent_by: admin.id,
        reply_to: parsed.data.replyTo,
        recipient_count: recipients.length,
      })
      .select('id')
      .single()

    if (logError) {
      console.error('sendBlastEmail email_log error:', logError)
    } else if (logRow) {
      await supabase.from('email_log_recipients').insert(
        recipients.map((r) => ({
          email_log_id: logRow.id,
          volunteer_id: r.id,
          email_address: r.email,
        }))
      )
    }

    revalidatePath('/crew/communication')

    return { success: true, recipientCount: recipients.length }
  } catch (err) {
    console.error('sendBlastEmail error:', err)
    return { success: false, recipientCount: 0, error: 'An unexpected error occurred' }
  }
}
