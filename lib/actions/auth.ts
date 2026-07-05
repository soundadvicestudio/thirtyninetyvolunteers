'use server'

import { z } from 'zod'
import { getServerClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/auth'
import { logAction } from '@/lib/audit'

export type ActionResult = { success: true } | { error: string }

const changePasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function changePassword(newPassword: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin) {
    return { error: 'Unauthorized' }
  }

  const parsed = changePasswordSchema.safeParse({ newPassword })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid password.' }
  }

  const supabase = await getServerClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword })

  if (error) {
    return { error: error.message }
  }

  // No before/after values — password is never stored or logged in plaintext.
  await logAction(admin.id, 'user.password_change', 'admin_user', admin.id)

  return { success: true }
}
