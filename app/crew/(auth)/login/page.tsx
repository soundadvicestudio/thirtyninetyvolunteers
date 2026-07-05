import Image from 'next/image'
import AuthTabs from './AuthTabs'

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Invalid email or password. Please try again.',
  not_authorized: 'This account is not authorized for Production Crew access.',
  auth_callback_failed: 'Sign-in failed. Please try again.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const errorMessage = error ? ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.' : null

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-8">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="30 By Ninety Theatre" width={120} height={80} priority />
        </div>
        <h1 className="text-2xl font-bold text-navy text-center">
          Production Crew
        </h1>
        <p className="text-mid-gray text-center mt-1 mb-6">Sign in to continue</p>

        {errorMessage && (
          <div className="bg-pale-orange border border-orange text-dark text-sm rounded px-3 py-2 mb-4">
            {errorMessage}
          </div>
        )}

        <AuthTabs />
      </div>
    </main>
  )
}
