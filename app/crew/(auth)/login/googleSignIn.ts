import { createClient } from '@/lib/supabase/client'

// Shared by both the main login Google button and the Request Access
// panel's Google button — same OAuth call, same redirect target. The
// callback route (app/auth/callback/route.ts) distinguishes login vs.
// registration based on whether an admin_users row already exists.
export async function signInWithGoogle() {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback',
    },
  })
}
