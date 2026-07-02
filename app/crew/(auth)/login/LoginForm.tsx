'use client'

import { createClient } from '@/lib/supabase/client'
import { emailLogin } from './actions'

export default function LoginForm() {
  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    })
  }

  return (
    <div>
      <form action={emailLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-dark mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-divider px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-dark mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-divider px-3 py-2 text-dark focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-navy text-white font-semibold py-2 rounded hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-divider" />
        <span className="text-sm text-mid-gray">or</span>
        <div className="flex-1 h-px bg-divider" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 bg-white border border-divider text-dark font-semibold py-2 rounded hover:bg-light-navy transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.8 2.73v2.27h2.92c1.71-1.57 2.68-3.88 2.68-6.64z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.97H.96C.35 6.2 0 7.56 0 9s.35 2.8.96 4.03l3.01-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.97l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
          />
        </svg>
        Sign in with Google
      </button>
    </div>
  )
}
