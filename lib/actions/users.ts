'use server'

import { randomBytes } from 'crypto'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { getServerClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/audit'
import { sendWelcomeEmail } from '@/lib/email'

export type ActionResult = { success: true } | { error: string }
export type CreateUserResult = { success: true; emailFailed: boolean } | { error: string }

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  role: z.enum(['editor', 'viewer']),
})

const TEMP_PASSWORD_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'

function generateTempPassword(): string {
  const bytes = randomBytes(16)
  return Array.from(bytes)
    .map((b) => TEMP_PASSWORD_CHARS[b % TEMP_PASSWORD_CHARS.length])
    .join('')
}

function isDuplicateEmailError(message: string | undefined): boolean {
  if (!message) return false
  const lower = message.toLowerCase()
  return lower.includes('already') || lower.includes('duplicate') || lower.includes('exist')
}

export async function createUser(
  name: string,
  email: string,
  role: 'editor' | 'viewer',
  sendWelcome: boolean
): Promise<CreateUserResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const parsed = createUserSchema.safeParse({ name, email, role })
  if (!parsed.success) {
    return { error: 'Invalid input. Please check the form and try again.' }
  }
  const value = parsed.data

  const supabase = await getServerClient()

  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', value.email)
    .maybeSingle()

  if (existing) {
    return { error: 'email_exists' }
  }

  const tempPassword = generateTempPassword()

  // auth.admin.* requires the service role key — this is the sanctioned
  // getAdminClient() use case per Brief §7 ("Super Admin account creation").
  // It cannot run on a session-scoped client regardless of RLS.
  const adminClient = getAdminClient()

  const { data, error: authError } = await adminClient.auth.admin.createUser({
    email: value.email,
    password: tempPassword,
    email_confirm: true,
  })

  if (authError || !data.user) {
    if (isDuplicateEmailError(authError?.message)) {
      return { error: 'email_exists' }
    }
    return { error: authError?.message ?? 'Failed to create account.' }
  }

  const { error: insertError } = await supabase.from('admin_users').insert({
    id: data.user.id,
    name: value.name,
    email: value.email,
    role: value.role,
    is_active: true,
  })

  if (insertError) {
    console.error('createUser admin_users insert error:', insertError)
    await adminClient.auth.admin.deleteUser(data.user.id)
    return { error: 'Failed to create admin record. Auth user has been cleaned up.' }
  }

  let emailFailed = false
  if (sendWelcome) {
    try {
      await sendWelcomeEmail({
        toEmail: value.email,
        toName: value.name,
        role: value.role,
        tempPassword,
      })

      try {
        const { data: logRow } = await adminClient
          .from('email_log')
          .insert({
            sent_by: admin.id,
            subject: 'Welcome to 30 By Ninety Theatre Production Crew',
            recipient_type: 'transactional',
            recipient_filter: 'trigger:admin_welcome',
            recipient_count: 1,
          })
          .select('id')
          .single()

        if (logRow) {
          await adminClient.from('email_log_recipients').insert({
            email_log_id: logRow.id,
            volunteer_id: null,
            email_address: value.email,
          })
        }
      } catch {
        // Logging failure must never block account creation.
      }
    } catch (err) {
      console.error('[email] sendWelcomeEmail failed:', err)
      emailFailed = true
    }
  }

  await logAction(admin.id, 'user.create', 'admin_user', data.user.id, undefined, {
    name: value.name,
    email: value.email,
    role: value.role,
  })

  revalidatePath('/crew/settings/users')

  return { success: true, emailFailed }
}

export async function deactivateUser(targetId: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  if (targetId === admin.id) {
    return { error: 'Cannot deactivate your own account.' }
  }

  const supabase = await getServerClient()

  const { data: target, error: fetchError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', targetId)
    .single()

  if (fetchError || !target) {
    return { error: 'Could not find this user.' }
  }

  if (target.role === 'super_admin') {
    return { error: 'Cannot deactivate a Super Admin account via this panel.' }
  }

  const { error } = await supabase
    .from('admin_users')
    .update({ is_active: false })
    .eq('id', targetId)

  if (error) {
    console.error('deactivateUser error:', error)
    return { error: 'Something went wrong deactivating this user. Please try again.' }
  }

  await logAction(admin.id, 'user.deactivate', 'admin_user', targetId)

  revalidatePath('/crew/settings/users')

  return { success: true }
}

export async function reactivateUser(targetId: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { error } = await supabase
    .from('admin_users')
    .update({ is_active: true })
    .eq('id', targetId)

  if (error) {
    console.error('reactivateUser error:', error)
    return { error: 'Something went wrong reactivating this user. Please try again.' }
  }

  await logAction(admin.id, 'user.reactivate', 'admin_user', targetId)

  revalidatePath('/crew/settings/users')

  return { success: true }
}

export async function changeRole(
  targetId: string,
  newRole: 'editor' | 'viewer'
): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  if (targetId === admin.id) {
    return { error: 'Cannot change your own role.' }
  }

  // Defense-in-depth: newRole is typed 'editor' | 'viewer' so no compile-time
  // caller can pass 'production', but a raw/untyped call to the Server Action
  // endpoint bypasses that. Compare via a widened cast since the literal
  // union has no structural overlap with 'production'.
  if ((newRole as string) === 'production') {
    return { error: 'The Production role cannot be assigned via role change. Create a new Production account instead.' }
  }

  const supabase = await getServerClient()

  const { data: target, error: fetchError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', targetId)
    .single()

  if (fetchError || !target) {
    return { error: 'Could not find this user.' }
  }

  if (target.role === 'super_admin') {
    return { error: 'Super Admin roles cannot be changed via this panel.' }
  }

  const { error } = await supabase
    .from('admin_users')
    .update({ role: newRole })
    .eq('id', targetId)

  if (error) {
    console.error('changeRole error:', error)
    return { error: 'Something went wrong changing the role. Please try again.' }
  }

  await logAction(
    admin.id,
    'user.role_change',
    'admin_user',
    targetId,
    { role: target.role },
    { role: newRole }
  )

  revalidatePath('/crew/settings/users')

  return { success: true }
}

export async function toggleCalendarEditor(
  targetUserId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await getServerClient()

  const { data: target } = await supabase
    .from('admin_users')
    .select('role, calendar_editor')
    .eq('id', targetUserId)
    .maybeSingle()

  if (!target) {
    return { success: false, error: 'User not found' }
  }

  if (!['editor', 'viewer'].includes(target.role)) {
    return {
      success: false,
      error: 'Calendar editor access can only be granted to Editor or Viewer accounts.',
    }
  }

  const { error: updateError } = await supabase
    .from('admin_users')
    .update({ calendar_editor: enabled })
    .eq('id', targetUserId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  await logAction(
    admin.id,
    'user.calendar_editor_change',
    'admin_user',
    targetUserId,
    { calendar_editor: !enabled },
    { calendar_editor: enabled }
  )

  revalidatePath('/crew/settings/users')

  return { success: true }
}
