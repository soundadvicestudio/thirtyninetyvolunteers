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
