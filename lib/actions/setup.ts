'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit'

type ActionResult = { success: true } | { error: string }

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_RE = /^https?:\/\/.+/

async function upsertSetting(
  supabase: Awaited<ReturnType<typeof getServerClient>>,
  key: string,
  value: string,
  adminId: string
) {
  return supabase.from('app_settings').upsert(
    { key, value, updated_by: adminId, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  )
}

export async function saveOrgIdentity(formData: FormData): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const orgName = (formData.get('org_name') as string | null)?.trim() || ''
  const orgTagline = (formData.get('org_tagline') as string | null)?.trim() || ''
  const orgContactEmail = (formData.get('org_contact_email') as string | null)?.trim() || ''
  const orgWebsiteUrl = (formData.get('org_website_url') as string | null)?.trim() || ''
  const orgLocation = (formData.get('org_location') as string | null)?.trim() || ''

  if (!orgName) {
    return { error: 'Organization name is required.' }
  }
  if (orgName.length > 100) {
    return { error: 'Organization name must be 100 characters or fewer.' }
  }
  if (orgTagline.length > 200) {
    return { error: 'Tagline must be 200 characters or fewer.' }
  }
  if (orgContactEmail && !EMAIL_RE.test(orgContactEmail)) {
    return { error: 'Invalid email format.' }
  }
  if (orgWebsiteUrl && !URL_RE.test(orgWebsiteUrl)) {
    return { error: 'Invalid URL format.' }
  }
  if (orgLocation.length > 100) {
    return { error: 'City / State must be 100 characters or fewer.' }
  }

  const supabase = await getServerClient()

  const keys = ['org_name', 'org_tagline', 'org_contact_email', 'org_website_url', 'org_location']
  const { data: previousRows } = await supabase.from('app_settings').select('key, value').in('key', keys)
  const previousMap = new Map((previousRows ?? []).map((r) => [r.key, r.value]))

  const values: Record<string, string> = {
    org_name: orgName,
    org_tagline: orgTagline,
    org_contact_email: orgContactEmail,
    org_website_url: orgWebsiteUrl,
    org_location: orgLocation,
  }

  const results = await Promise.all(
    keys.map((key) => upsertSetting(supabase, key, values[key], admin.id))
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    return { error: failed.error.message }
  }

  revalidatePath('/')
  revalidatePath('/crew/settings/setup')

  await logAction(
    admin.id,
    'settings.update',
    'app_settings',
    'org_identity',
    { ...Object.fromEntries(keys.map((k) => [k, previousMap.get(k) ?? ''])) },
    values
  )

  return { success: true }
}

export async function saveBrandColors(formData: FormData): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const brandPrimary = (formData.get('brand_primary') as string | null)?.trim() || ''
  const brandAccent = (formData.get('brand_accent') as string | null)?.trim() || ''

  if (!HEX_COLOR_RE.test(brandPrimary) || !HEX_COLOR_RE.test(brandAccent)) {
    return { error: 'Invalid color format' }
  }

  const supabase = await getServerClient()

  const { data: previousRows } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['brand_primary', 'brand_accent'])
  const previousMap = new Map((previousRows ?? []).map((r) => [r.key, r.value]))

  const [{ error: primaryError }, { error: accentError }] = await Promise.all([
    upsertSetting(supabase, 'brand_primary', brandPrimary, admin.id),
    upsertSetting(supabase, 'brand_accent', brandAccent, admin.id),
  ])

  if (primaryError || accentError) {
    return { error: (primaryError ?? accentError)?.message ?? 'Something went wrong saving brand colors.' }
  }

  revalidatePath('/')
  revalidatePath('/crew/settings/setup')

  await logAction(
    admin.id,
    'settings.update',
    'app_settings',
    'brand_colors',
    { brand_primary: previousMap.get('brand_primary') ?? '', brand_accent: previousMap.get('brand_accent') ?? '' },
    { brand_primary: brandPrimary, brand_accent: brandAccent }
  )

  return { success: true }
}

export async function saveLogoUrl(data: { url: string }): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const url = data.url?.trim() || ''
  const supabase = await getServerClient()

  const { data: previous } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'org_logo_url')
    .maybeSingle()

  const { error } = await upsertSetting(supabase, 'org_logo_url', url, admin.id)
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/crew/settings/setup')

  await logAction(
    admin.id,
    'settings.update',
    'app_settings',
    'org_logo_url',
    { value: previous?.value ?? '' },
    { value: url }
  )

  return { success: true }
}

export async function saveFaviconUrl(data: { url: string }): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const url = data.url?.trim() || ''
  const supabase = await getServerClient()

  const { data: previous } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'favicon_url')
    .maybeSingle()

  const { error } = await upsertSetting(supabase, 'favicon_url', url, admin.id)
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/crew/settings/setup')

  await logAction(
    admin.id,
    'settings.update',
    'app_settings',
    'favicon_url',
    { value: previous?.value ?? '' },
    { value: url }
  )

  return { success: true }
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 50)
}

export async function getSignedBrandUploadUrl(data: {
  filename: string
  type: 'logo' | 'favicon'
}): Promise<{ signedUrl: string; path: string; publicUrl: string } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const sanitizedFilename = sanitizeFilename(data.filename) || 'brand-image.png'
  const path = `${data.type}/${randomUUID()}-${sanitizedFilename}`

  // Storage requires service role here — the 'brand' bucket has zero
  // storage.objects RLS policies (confirmed via live Supabase query during
  // Task A, same finding as the 'media' bucket), so getServerClient()
  // cannot call any storage.* method. getAdminClient() used for this call
  // only; every other action in this file uses getServerClient(). Matches
  // the established pattern in lib/actions/media.ts (getMediaUploadUrl()).
  const supabase = getAdminClient()
  const { data: signed, error } = await supabase.storage.from('brand').createSignedUploadUrl(path)

  if (error || !signed) {
    console.error('getSignedBrandUploadUrl storage error:', error)
    return { error: 'Something went wrong preparing the upload. Please try again.' }
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brand/${path}`

  return { signedUrl: signed.signedUrl, path, publicUrl }
}
