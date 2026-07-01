'use server'

import { getServerClient } from '@/lib/supabase/server'
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

  redirect('/crew/dashboard')
}
