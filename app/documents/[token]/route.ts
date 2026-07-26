import { getAdminClient } from '@/lib/supabase/admin'
import { getServerClient } from '@/lib/supabase/server'

// Universal document access route. Public — no Supabase Auth session exists
// here except when checking a 'backend'-tier document, where getServerClient()
// reads the requester's own session cookie (if any) to verify admin access.
// All storage operations use the 'media' bucket (confirmed live, private,
// Task A6).

// YouTube/Vimeo embeds and direct audio links route through the player page
// (/documents/view/[token], built 15.4) instead of redirecting straight to
// external_url. Same logic duplicated (not imported) in
// components/crew/media/MediaLibrary.tsx and app/documents/view/[token]/page.tsx
// — one is a server route handler, one a client component, one a server page;
// none can share a module across those boundaries cleanly for a function this small.
function detectLinkType(url: string): 'youtube' | 'vimeo' | 'audio' | 'other' {
  // YouTube: standard watch URL or youtu.be short URL
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) return 'youtube'
  // Vimeo: standard vimeo.com/[numeric-id] URLs
  if (/vimeo\.com\/\d+/.test(url)) return 'vimeo'
  // Direct audio files by extension
  if (/\.(mp3|wav|ogg|m4a|flac|aac)(\?|$)/i.test(url)) return 'audio'
  return 'other'
}

function isViewableMimeType(mimeType: string | null): boolean {
  if (!mimeType) return false
  return (
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/') ||
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf'
  )
}

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = getAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  const { data: doc } = await supabase
    .from('documents')
    .select('id, title, entry_type, storage_path, external_url, access_tier, is_active, mime_type')
    .eq('access_token', token)
    .maybeSingle()

  if (!doc || !doc.is_active) {
    return Response.redirect(new URL('/not-found', siteUrl), 302)
  }

  if (doc.access_tier === 'backend') {
    const serverClient = await getServerClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/crew/login', siteUrl)
      loginUrl.searchParams.set('redirect', `/documents/${token}`)
      return Response.redirect(loginUrl.toString(), 302)
    }

    const { data: adminUser } = await serverClient
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!adminUser) {
      return Response.redirect(new URL('/crew/login', siteUrl).toString(), 302)
    }
  }
  // 'public' and 'link_only' tiers proceed without a session check.

  if (doc.entry_type === 'file') {
    if (!doc.storage_path) {
      return Response.redirect(new URL('/not-found', siteUrl), 302)
    }

    // Viewable file types route through the player page for an inline
    // viewing experience instead of a raw signed-URL download.
    if (isViewableMimeType(doc.mime_type)) {
      return Response.redirect(new URL(`/documents/view/${token}`, siteUrl), 302)
    }

    // Non-viewable files: generate signed URL for download
    const { data: signedData, error } = await supabase.storage
      .from('media')
      .createSignedUrl(doc.storage_path, 3600)

    if (error || !signedData?.signedUrl) {
      return Response.redirect(new URL('/not-found', siteUrl), 302)
    }

    return Response.redirect(signedData.signedUrl, 302)
  }

  if (doc.entry_type === 'link') {
    if (!doc.external_url) {
      return Response.redirect(new URL('/not-found', siteUrl), 302)
    }

    // Embeds and audio links route through the player page
    const linkType = detectLinkType(doc.external_url)
    if (linkType !== 'other') {
      return Response.redirect(new URL(`/documents/view/${token}`, siteUrl), 302)
    }

    // Generic links: redirect directly
    return Response.redirect(doc.external_url, 302)
  }

  return Response.redirect(new URL('/not-found', siteUrl), 302)
}
