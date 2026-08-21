'use server'

import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function dismissAnnouncement(): Promise<void> {
  const admin = await getAdminUser()
  if (!admin) return

  const supabase = await getServerClient()

  await supabase
    .from('admin_users')
    .update({
      announcement_dismissed_at: new Date().toISOString(),
    })
    .eq('id', admin.id)

  revalidatePath('/crew/dashboard')
}

export async function getAnnouncementContent(): Promise<{
  body: string
  roles: string[]
}> {
  const supabase = await getServerClient()
  const { data: rows } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', [
      'dashboard_announcement_body',
      'dashboard_announcement_roles',
    ])
  const map = new Map(
    (rows ?? []).map((r) => [r.key, r.value])
  )
  let roles: string[] = []
  try {
    roles = JSON.parse(
      map.get('dashboard_announcement_roles') ?? '[]'
    )
    if (!Array.isArray(roles)) roles = []
  } catch {
    roles = []
  }
  return {
    body: map.get('dashboard_announcement_body') ?? '',
    roles,
  }
}
