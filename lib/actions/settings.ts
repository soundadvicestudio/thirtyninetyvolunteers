'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit'

export type ActionResult = { success: true } | { error: string }

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
