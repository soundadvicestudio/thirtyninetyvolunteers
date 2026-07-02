'use server'

import { getServerClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { getAdminUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function emailLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await getServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/crew/login?error=invalid_credentials')
  }

  // Verify this authenticated user exists in admin_users
  const adminUser = await getAdminUser()

  if (!adminUser) {
    // Authenticated with Supabase but not an admin — sign out
    await supabase.auth.signOut()
    redirect('/crew/login?error=not_authorized')
  }

  try {
    const adminClient = getAdminClient()
    await adminClient
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id)
  } catch (err) {
    console.error('Failed to update last_login:', err)
  }

  redirect('/crew/dashboard')
}
