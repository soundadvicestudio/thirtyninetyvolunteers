'use server'

import { getServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await getServerClient()
  await supabase.auth.signOut()
  redirect('/crew/login')
}
