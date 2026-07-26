import { redirect } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { getServerClient } from '@/lib/supabase/server'

// PUBLIC ROUTE — getAdminClient() only for doc lookup and storage; never
// getServerClient() except for the backend-tier session check below. Same
// pattern as app/documents/[token]/route.ts, which redirects here for
// viewable file types and embeddable/audio links.

type ContentType = 'video' | 'audio' | 'pdf' | 'image' | 'youtube' | 'vimeo' | 'download' | 'other'

// Duplicated from app/documents/[token]/route.ts (not imported — a route
// handler and a page component can't cleanly share a module boundary for a
// function this small; see the comment in route.ts).
function detectLinkType(url: string): 'youtube' | 'vimeo' | 'audio' | 'other' {
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) return 'youtube'
  if (/vimeo\.com\/\d+/.test(url)) return 'vimeo'
  if (/\.(mp3|wav|ogg|m4a|flac|aac)(\?|$)/i.test(url)) return 'audio'
  return 'other'
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/)
  return m?.[1] ?? null
}

export async function generateMetadata() {
  return {
    title: 'Media Viewer',
    robots: { index: false, follow: false },
  }
}

export default async function DocumentViewerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = getAdminClient()

  const { data: doc } = await supabase
    .from('documents')
    .select('id, title, entry_type, storage_path, external_url, mime_type, access_tier, is_active, access_token')
    .eq('access_token', token)
    .maybeSingle()

  if (!doc || !doc.is_active) {
    redirect('/not-found')
  }

  if (doc.access_tier === 'backend') {
    const serverClient = await getServerClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      redirect(`/crew/login?redirect=/documents/view/${token}`)
    }

    const { data: adminUser } = await serverClient
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!adminUser) {
      redirect(`/crew/login?redirect=/documents/view/${token}`)
    }
  }

  let mediaSrc: string
  if (doc.entry_type === 'file') {
    if (!doc.storage_path) {
      redirect('/not-found')
    }
    const { data: signedData } = await supabase.storage.from('media').createSignedUrl(doc.storage_path, 3600)
    if (!signedData?.signedUrl) {
      redirect('/not-found')
    }
    mediaSrc = signedData.signedUrl
  } else {
    if (!doc.external_url) {
      redirect('/not-found')
    }
    mediaSrc = doc.external_url
  }

  let contentType: ContentType
  if (doc.entry_type === 'file') {
    if (doc.mime_type?.startsWith('video/')) {
      contentType = 'video'
    } else if (doc.mime_type?.startsWith('audio/')) {
      contentType = 'audio'
    } else if (doc.mime_type === 'application/pdf') {
      contentType = 'pdf'
    } else if (doc.mime_type?.startsWith('image/')) {
      contentType = 'image'
    } else {
      contentType = 'download'
    }
  } else {
    contentType = detectLinkType(mediaSrc)
  }

  if (contentType === 'other') {
    redirect(doc.external_url!)
  }

  if (contentType === 'download') {
    redirect(mediaSrc)
  }

  let youTubeId: string | null = null
  if (contentType === 'youtube') {
    youTubeId = extractYouTubeId(mediaSrc)
    if (!youTubeId) {
      redirect('/not-found')
    }
  }

  let vimeoId: string | null = null
  if (contentType === 'vimeo') {
    vimeoId = mediaSrc.match(/vimeo\.com\/(\d+)/)?.[1] ?? null
    if (!vimeoId) {
      redirect('/not-found')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-dark dark:text-dark-text mb-4 text-center">{doc.title}</h1>

        {contentType === 'video' && (
          <video
            src={mediaSrc}
            controls
            className="w-full max-w-3xl mx-auto rounded-lg block"
            style={{ aspectRatio: '16/9' }}
          />
        )}

        {contentType === 'audio' && <audio src={mediaSrc} controls className="w-full max-w-2xl mx-auto block" />}

        {contentType === 'pdf' && (
          <iframe
            src={mediaSrc}
            className="w-full"
            style={{ height: '80vh', minHeight: '500px' }}
            title={doc.title}
          />
        )}

        {contentType === 'image' && (
          // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage signed URL, not a local/static asset
          <img
            src={mediaSrc}
            alt={doc.title}
            className="max-w-full mx-auto rounded-lg block"
            style={{ maxHeight: '80vh', objectFit: 'contain' }}
          />
        )}

        {contentType === 'youtube' && (
          <iframe
            src={`https://www.youtube.com/embed/${youTubeId}`}
            title={doc.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full"
            style={{ aspectRatio: '16/9', border: 'none' }}
          />
        )}

        {contentType === 'vimeo' && (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={doc.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full"
            style={{ aspectRatio: '16/9', border: 'none' }}
          />
        )}
      </div>
    </div>
  )
}
