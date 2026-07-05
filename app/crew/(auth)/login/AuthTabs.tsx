'use client'

import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AuthTabs() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div>
      {mode === 'login' ? <LoginForm /> : <RegisterForm />}

      <p className="text-center text-sm text-mid-gray mt-6">
        {mode === 'login' ? (
          <>
            Need an account?{' '}
            <button
              type="button"
              onClick={() => setMode('register')}
              className="text-navy font-semibold hover:underline cursor-pointer"
            >
              Request Access
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-navy font-semibold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </>
        )}
      </p>
    </div>
  )
}
