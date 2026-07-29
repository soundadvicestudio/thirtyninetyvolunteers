import Image from 'next/image'
import { resolveOrgIdentity } from '@/lib/utils/org-identity'
import AuthTabs from './AuthTabs'

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Invalid email or password. Please try again.',
  not_authorized: 'This account is not authorized for Production Crew access.',
  auth_callback_failed: 'Sign-in failed. Please try again.',
  declined: 'Your access request was not approved. Please contact the Production Crew admin for assistance.',
}

const INFO_MESSAGES: Record<string, string> = {
  pending: 'Your request is already pending. A Production Crew admin will review it shortly.',
}

const REGISTERED_MESSAGES: Record<string, string> = {
  google: 'Your Google account has been submitted for approval. A Production Crew admin will review your request shortly.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pending?: string; registered?: string }>
}) {
  const { error, pending, registered } = await searchParams
  const errorMessage = error ? ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.' : null
  const infoMessage = pending ? INFO_MESSAGES[pending] : registered ? REGISTERED_MESSAGES[registered] : null
  const org = await resolveOrgIdentity()

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-8">
        <div className="flex justify-center mb-6">
          <Image src={org.org_logo_url || '/logo.png'} alt={org.org_name} width={120} height={80} priority />
        </div>
        <h1 className="text-2xl font-bold text-brand-primary text-center">
          Production Crew
        </h1>
        <p className="text-mid-gray text-center mt-1 mb-6">Sign in to continue</p>

        {errorMessage && (
          <div className="bg-brand-accent-light border border-brand-accent text-dark text-sm rounded px-3 py-2 mb-4">
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div className="bg-brand-primary-light border border-divider text-dark text-sm rounded px-3 py-3 mb-4">
            {infoMessage}
          </div>
        )}

        <AuthTabs />
      </div>
    </main>
  )
}
