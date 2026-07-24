'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getAdminUser } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { logAction } from '@/lib/audit'
import {
  sendPendingRegistrationEmail,
  sendRegistrationApprovedEmail,
  sendRegistrationDeclinedEmail,
} from '@/lib/email'

export type ActionResult = { success: true } | { error: string }

type PendingRegistration = {
  id: string
  name: string
  email: string
  auth_user_id: string
  status: 'pending' | 'approved' | 'declined'
  requested_at: string
  reviewed_by: string | null
  reviewed_at: string | null
}

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function registerAdminRequest(
  name: string,
  email: string,
  password: string
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({ name, email, password })
  if (!parsed.success) {
    return { error: 'Invalid input. Please check the form and try again.' }
  }
  const value = parsed.data

  const client = getAdminClient()

  const { data: existingAdmin } = await client
    .from('admin_users')
    .select('id')
    .eq('email', value.email)
    .maybeSingle()

  if (existingAdmin) {
    return { error: 'already_registered' }
  }

  const { data: existingPending } = await client
    .from('pending_registrations')
    .select('id')
    .eq('email', value.email)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingPending) {
    return { error: 'already_pending' }
  }

  const { data: authData, error: authError } = await client.auth.admin.createUser({
    email: value.email,
    password: value.password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return { error: 'auth_failed' }
  }

  const { error: insertError } = await client.from('pending_registrations').insert({
    name: value.name,
    email: value.email,
    auth_user_id: authData.user.id,
    status: 'pending',
  })

  if (insertError) {
    console.error('registerAdminRequest pending_registrations insert error:', insertError)
    await client.auth.admin.deleteUser(authData.user.id)
    return { error: 'registration_failed' }
  }

  try {
    const { data: superAdmins } = await client
      .from('admin_users')
      .select('email')
      .eq('role', 'super_admin')
      .eq('is_active', true)

    const recipients = ((superAdmins ?? []) as { email: string }[]).map((row) => row.email)
    const subject = `New access request — ${value.name} (${value.email})`
    await sendPendingRegistrationEmail({ to: recipients, name: value.name, email: value.email })

    // sendPendingRegistrationEmail() silently no-ops when recipients is
    // empty — only log when there was actually something to send.
    if (recipients.length > 0) {
      try {
        const { data: logRow } = await client
          .from('email_log')
          .insert({
            sent_by: null,
            subject,
            body_preview: 'A new Production Crew access request is waiting for your review.',
            recipient_type: 'transactional',
            recipient_filter: 'trigger:admin_registration_request',
            recipient_count: recipients.length,
          })
          .select('id')
          .single()

        if (logRow) {
          await client.from('email_log_recipients').insert(
            recipients.map((email) => ({
              email_log_id: logRow.id,
              volunteer_id: null,
              email_address: email,
            }))
          )
        }
      } catch {
        // Logging failure must never block registration.
      }
    }
  } catch (err) {
    console.error('[email] sendPendingRegistrationEmail failed:', err)
  }

  return { success: true }
}

const ROLE_VALUES = ['super_admin', 'editor', 'viewer'] as const
type AdminRole = (typeof ROLE_VALUES)[number]

export async function approveRegistration(pendingId: string, role: AdminRole): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  if (!ROLE_VALUES.includes(role)) {
    return { error: 'Invalid role.' }
  }

  const client = getAdminClient()

  const { data: pending, error: fetchError } = await client
    .from('pending_registrations')
    .select('*')
    .eq('id', pendingId)
    .eq('status', 'pending')
    .single()

  if (fetchError || !pending) {
    return { error: 'Registration request not found or already reviewed.' }
  }
  const pendingRow = pending as PendingRegistration

  const { error: insertError } = await client.from('admin_users').insert({
    id: pendingRow.auth_user_id,
    name: pendingRow.name,
    email: pendingRow.email,
    role,
    is_active: true,
  })

  if (insertError) {
    console.error('approveRegistration admin_users insert error:', insertError)
    return { error: 'Failed to create admin account. The request remains pending — please retry.' }
  }

  const { error: updateError } = await client
    .from('pending_registrations')
    .update({
      status: 'approved',
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', pendingId)

  if (updateError) {
    console.error('approveRegistration pending_registrations update error:', updateError)
  }

  try {
    await sendRegistrationApprovedEmail({ to: pendingRow.email, name: pendingRow.name })

    try {
      const { data: logRow } = await client
        .from('email_log')
        .insert({
          sent_by: admin.id,
          subject: 'Your access request has been approved',
          recipient_type: 'transactional',
          recipient_filter: 'trigger:admin_approved',
          recipient_count: 1,
        })
        .select('id')
        .single()

      if (logRow) {
        await client.from('email_log_recipients').insert({
          email_log_id: logRow.id,
          volunteer_id: null,
          email_address: pendingRow.email,
        })
      }
    } catch {
      // Logging failure must never block approval.
    }
  } catch (err) {
    console.error('[email] sendRegistrationApprovedEmail failed:', err)
  }

  await logAction(admin.id, 'user.create', 'admin_user', pendingRow.auth_user_id, undefined, {
    name: pendingRow.name,
    email: pendingRow.email,
    role,
  })

  revalidatePath('/crew/settings/users')

  return { success: true }
}

export async function declineRegistration(pendingId: string): Promise<ActionResult> {
  const admin = await getAdminUser()
  if (!admin || admin.role !== 'super_admin') {
    return { error: 'Unauthorized' }
  }

  const client = getAdminClient()

  const { data: pending, error: fetchError } = await client
    .from('pending_registrations')
    .select('*')
    .eq('id', pendingId)
    .eq('status', 'pending')
    .single()

  if (fetchError || !pending) {
    return { error: 'Registration request not found or already reviewed.' }
  }
  const pendingRow = pending as PendingRegistration

  const { error: deleteError } = await client.auth.admin.deleteUser(pendingRow.auth_user_id)

  if (deleteError) {
    console.error('declineRegistration deleteUser error:', deleteError)
    return { error: 'Failed to remove the auth account. Please retry or handle manually.' }
  }

  const { error: updateError } = await client
    .from('pending_registrations')
    .update({
      status: 'declined',
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', pendingId)

  if (updateError) {
    console.error('declineRegistration pending_registrations update error:', updateError)
  }

  try {
    await sendRegistrationDeclinedEmail({ to: pendingRow.email, name: pendingRow.name })

    try {
      const { data: logRow } = await client
        .from('email_log')
        .insert({
          sent_by: admin.id,
          subject: 'Your access request was not approved',
          recipient_type: 'transactional',
          recipient_filter: 'trigger:admin_declined',
          recipient_count: 1,
        })
        .select('id')
        .single()

      if (logRow) {
        await client.from('email_log_recipients').insert({
          email_log_id: logRow.id,
          volunteer_id: null,
          email_address: pendingRow.email,
        })
      }
    } catch {
      // Logging failure must never block decline.
    }
  } catch (err) {
    console.error('[email] sendRegistrationDeclinedEmail failed:', err)
  }

  await logAction(admin.id, 'user.decline_registration', 'pending_registration', pendingId, undefined, {
    email: pendingRow.email,
  })

  revalidatePath('/crew/settings/users')

  return { success: true }
}
