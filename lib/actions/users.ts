'use server'

import { randomBytes } from 'crypto'
import { z } from 'zod'
import { getAdminUser } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
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

  const client = getAdminClient()

  const { data: existing } = await client
    .from('admin_users')
    .select('id')
    .eq('email', value.email)
    .maybeSingle()

  if (existing) {
    return { error: 'email_exists' }
  }

  const tempPassword = generateTempPassword()

  const { data, error: authError } = await client.auth.admin.createUser({
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

  const { error: insertError } = await client.from('admin_users').insert({
    id: data.user.id,
    name: value.name,
    email: value.email,
    role: value.role,
    is_active: true,
  })

  if (insertError) {
    console.error('createUser admin_users insert error:', insertError)
    await client.auth.admin.deleteUser(data.user.id)
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

  const client = getAdminClient()

  const { data: target, error: fetchError } = await client
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

  const { error } = await client
    .from('admin_users')
    .update({ is_active: false })
    .eq('id', targetId)

  if (error) {
    console.error('deactivateUser error:', error)
    return { error: 'Something went wrong deactivating this user. Please try again.' }
  }

  await logAction(admin.id, 'user.deactivate', 'admin_user', targetId)

  return { success: true }
}

export async function reactivateUser(targetId: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const client = getAdminClient()

  const { error } = await client
    .from('admin_users')
    .update({ is_active: true })
    .eq('id', targetId)

  if (error) {
    console.error('reactivateUser error:', error)
    return { error: 'Something went wrong reactivating this user. Please try again.' }
  }

  await logAction(admin.id, 'user.reactivate', 'admin_user', targetId)

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

  const client = getAdminClient()

  const { data: target, error: fetchError } = await client
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

  const { error } = await client
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

  return { success: true }
}
