import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/feature-flags'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export async function GET(request: Request) {
  // Auth check
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Feature flag check — authenticated context, matches inventory tags route pattern
  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.messages) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 403 })
  }

  // Extract params
  const url = new URL(request.url)
  const fileName = url.searchParams.get('fileName') ?? 'file'
  const fileSizeParam = url.searchParams.get('fileSize')
  const fileSize = fileSizeParam ? parseInt(fileSizeParam, 10) : 0

  // Size guard — enforcement is ultimately Supabase Storage policies,
  // but reject clearly oversized requests early
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB` },
      { status: 413 }
    )
  }

  // Generate temp storage path
  const ext = fileName.includes('.') ? fileName.split('.').pop() : ''
  const uuid = crypto.randomUUID()
  const tempKey = crypto.randomUUID()
  const storedName = ext ? `${uuid}.${ext}` : uuid
  const path = `messages/temp/${tempKey}/${storedName}`

  // Generate signed upload URL — getAdminClient() required for storage API
  const adminClient = getAdminClient()
  const { data, error } = await adminClient.storage.from('media').createSignedUploadUrl(path)

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path,
    tempKey,
  })
}
