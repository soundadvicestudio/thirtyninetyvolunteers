'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getAdminUser, type AdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit'

export type ActionResult = { success: true } | { error: string }

const MAX_BANNER_TEXT_LENGTH = 280
const MAX_LABEL_LENGTH = 100
const MAX_EMAIL_LENGTH = 254

function requireEditor(admin: AdminUser | null): admin is AdminUser {
  return !!admin && admin.role !== 'viewer'
}

async function upsertSetting(
  supabase: Awaited<ReturnType<typeof getServerClient>>,
  key: string,
  value: string,
  adminId: string
) {
  return supabase.from('app_settings').upsert(
    {
      key,
      value,
      updated_by: adminId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  )
}

export async function setPinnedSeason(seasonId: string | null): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: previous } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'dashboard_season_id')
    .maybeSingle()

  const value = seasonId ?? ''

  const { error } = await supabase.from('app_settings').upsert(
    {
      key: 'dashboard_season_id',
      value,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  )

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/crew/dashboard')

  await logAction(
    admin.id,
    'settings.update',
    'app_settings',
    'dashboard_season_id',
    { value: previous?.value ?? null },
    { value: seasonId }
  )

  return { success: true }
}

const bannerSchema = z.object({
  text: z.string().max(MAX_BANNER_TEXT_LENGTH, 'Banner text must be 280 characters or fewer.'),
  active: z.boolean(),
})

export async function saveAnnouncementBanner(text: string, active: boolean): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!requireEditor(admin)) {
    return { error: 'Unauthorized' }
  }

  const parsed = bannerSchema.safeParse({ text, active })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid banner input.' }
  }

  const supabase = await getServerClient()

  const { data: previousRows } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['announcement_banner_text', 'announcement_banner_active'])

  const previousMap = new Map((previousRows ?? []).map((r) => [r.key, r.value]))
  const oldText = previousMap.get('announcement_banner_text') ?? ''
  const oldActive = previousMap.get('announcement_banner_active') === 'true'

  const [{ error: textError }, { error: activeError }] = await Promise.all([
    upsertSetting(supabase, 'announcement_banner_text', parsed.data.text, admin.id),
    upsertSetting(supabase, 'announcement_banner_active', String(parsed.data.active), admin.id),
  ])

  if (textError || activeError) {
    return { error: (textError ?? activeError)?.message ?? 'Something went wrong saving the banner.' }
  }

  revalidatePath('/')

  await logAction(
    admin.id,
    'settings.update',
    'app_settings',
    'announcement_banner',
    { text: oldText, active: oldActive },
    { text: parsed.data.text, active: parsed.data.active }
  )

  return { success: true }
}

const signupTogglesSchema = z.object({
  showSchool: z.boolean(),
  showAgeRange: z.boolean(),
})

export async function saveSignupFormToggles(
  showSchool: boolean,
  showAgeRange: boolean
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!requireEditor(admin)) {
    return { error: 'Unauthorized' }
  }

  const parsed = signupTogglesSchema.safeParse({ showSchool, showAgeRange })
  if (!parsed.success) {
    return { error: 'Invalid signup form settings.' }
  }

  const supabase = await getServerClient()

  const { data: previousRows } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['signup_show_school', 'signup_show_age_range'])

  const previousMap = new Map((previousRows ?? []).map((r) => [r.key, r.value]))
  const oldShowSchool = previousMap.get('signup_show_school') !== 'false'
  const oldShowAgeRange = previousMap.get('signup_show_age_range') !== 'false'

  const [{ error: schoolError }, { error: ageError }] = await Promise.all([
    upsertSetting(supabase, 'signup_show_school', String(parsed.data.showSchool), admin.id),
    upsertSetting(supabase, 'signup_show_age_range', String(parsed.data.showAgeRange), admin.id),
  ])

  if (schoolError || ageError) {
    return {
      error: (schoolError ?? ageError)?.message ?? 'Something went wrong saving signup form settings.',
    }
  }

  revalidatePath('/')

  await logAction(
    admin.id,
    'settings.update',
    'app_settings',
    'signup_form',
    { showSchool: oldShowSchool, showAgeRange: oldShowAgeRange },
    { showSchool: parsed.data.showSchool, showAgeRange: parsed.data.showAgeRange }
  )

  return { success: true }
}

const defaultHoursSchema = z.object({
  mainstage: z.number().min(0).max(24).finite(),
  studioX: z.number().min(0).max(24).finite(),
  oneOff: z.number().min(0).max(24).finite(),
})

export async function saveDefaultHours(
  mainstage: number,
  studioX: number,
  oneOff: number
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!requireEditor(admin)) {
    return { error: 'Unauthorized' }
  }

  const parsed = defaultHoursSchema.safeParse({ mainstage, studioX, oneOff })
  if (!parsed.success) {
    return { error: 'Hours must be numbers between 0 and 24.' }
  }

  const supabase = await getServerClient()

  const { data: previousRows } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['default_hours_mainstage', 'default_hours_studio_x', 'default_hours_one_off'])

  const previousMap = new Map((previousRows ?? []).map((r) => [r.key, r.value]))
  const before = {
    mainstage: previousMap.get('default_hours_mainstage') ?? null,
    studioX: previousMap.get('default_hours_studio_x') ?? null,
    oneOff: previousMap.get('default_hours_one_off') ?? null,
  }

  const [{ error: mainstageError }, { error: studioXError }, { error: oneOffError }] =
    await Promise.all([
      upsertSetting(supabase, 'default_hours_mainstage', String(parsed.data.mainstage), admin.id),
      upsertSetting(supabase, 'default_hours_studio_x', String(parsed.data.studioX), admin.id),
      upsertSetting(supabase, 'default_hours_one_off', String(parsed.data.oneOff), admin.id),
    ])

  const firstError = mainstageError ?? studioXError ?? oneOffError
  if (firstError) {
    return { error: firstError.message || 'Something went wrong saving default hours.' }
  }

  revalidatePath('/crew/shows/new')
  revalidatePath('/crew/shows/[id]', 'page')
  revalidatePath('/crew/shows/[id]/edit', 'page')

  await logAction(
    admin.id,
    'settings.update',
    'app_settings',
    'default_hours',
    before,
    { mainstage: parsed.data.mainstage, studioX: parsed.data.studioX, oneOff: parsed.data.oneOff }
  )

  return { success: true }
}

const replyToSchema = z.string().trim().max(MAX_EMAIL_LENGTH).email('Enter a valid email address.')

export async function saveDefaultReplyTo(email: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!requireEditor(admin)) {
    return { error: 'Unauthorized' }
  }

  const parsed = replyToSchema.safeParse(email)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Enter a valid email address.' }
  }

  const supabase = await getServerClient()

  const { data: previous } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'default_reply_to')
    .maybeSingle()

  const { error } = await upsertSetting(supabase, 'default_reply_to', parsed.data, admin.id)

  if (error) {
    return { error: error.message }
  }

  await logAction(
    admin.id,
    'settings.update',
    'app_settings',
    'default_reply_to',
    { value: previous?.value ?? null },
    { value: parsed.data }
  )

  return { success: true }
}

const hearingLabelSchema = z
  .string()
  .trim()
  .min(1, 'Label is required.')
  .max(MAX_LABEL_LENGTH, 'Label must be 100 characters or fewer.')

export async function addHearingOption(label: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!requireEditor(admin)) {
    return { error: 'Unauthorized' }
  }

  const parsed = hearingLabelSchema.safeParse(label)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid label.' }
  }

  const supabase = await getServerClient()

  const { data: maxRow } = await supabase
    .from('hearing_options')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (maxRow?.sort_order ?? -1) + 1

  const { data: inserted, error } = await supabase
    .from('hearing_options')
    .insert({ label: parsed.data, sort_order: sortOrder, is_active: true })
    .select('id')
    .single()

  if (error || !inserted) {
    return { error: error?.message ?? 'Something went wrong adding the hearing option.' }
  }

  revalidatePath('/')

  await logAction(admin.id, 'hearing_options.create', 'hearing_options', inserted.id, undefined, {
    label: parsed.data,
    sort_order: sortOrder,
    is_active: true,
  })

  return { success: true }
}

export async function updateHearingOption(id: string, label: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!requireEditor(admin)) {
    return { error: 'Unauthorized' }
  }

  const parsed = hearingLabelSchema.safeParse(label)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid label.' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('hearing_options')
    .select('label')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this hearing option.' }
  }

  const { error } = await supabase
    .from('hearing_options')
    .update({ label: parsed.data })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')

  await logAction(
    admin.id,
    'hearing_options.update',
    'hearing_options',
    id,
    { label: current.label },
    { label: parsed.data }
  )

  return { success: true }
}

export async function reorderHearingOption(
  id: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!requireEditor(admin)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: options, error: fetchError } = await supabase
    .from('hearing_options')
    .select('id, sort_order')
    .order('sort_order', { ascending: true })

  if (fetchError || !options) {
    return { error: 'Could not load hearing options.' }
  }

  const index = options.findIndex((o) => o.id === id)
  if (index === -1) {
    return { error: 'Could not find this hearing option.' }
  }

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= options.length) {
    return { success: true }
  }

  const current = options[index]
  const swapTarget = options[swapIndex]

  const { error: updateCurrentError } = await supabase
    .from('hearing_options')
    .update({ sort_order: swapTarget.sort_order })
    .eq('id', current.id)

  if (updateCurrentError) {
    return { error: 'Something went wrong reordering hearing options. Please try again.' }
  }

  const { error: updateSwapError } = await supabase
    .from('hearing_options')
    .update({ sort_order: current.sort_order })
    .eq('id', swapTarget.id)

  if (updateSwapError) {
    return { error: 'Something went wrong reordering hearing options. Please try again.' }
  }

  revalidatePath('/')

  await logAction(admin.id, 'hearing_options.reorder', 'hearing_options', id, undefined, {
    direction,
  })

  return { success: true }
}

export async function toggleHearingOptionActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!requireEditor(admin)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: current, error: fetchError } = await supabase
    .from('hearing_options')
    .select('is_active')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return { error: 'Could not find this hearing option.' }
  }

  const { error } = await supabase
    .from('hearing_options')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')

  await logAction(
    admin.id,
    'hearing_options.deactivate',
    'hearing_options',
    id,
    { is_active: current.is_active },
    { is_active: isActive }
  )

  return { success: true }
}
