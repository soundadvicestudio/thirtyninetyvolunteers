import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/auth'
import OpportunityForm from '@/components/crew/opportunities/OpportunityForm'

export default async function NewOpportunityPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }
  if (admin.role === 'viewer') {
    redirect('/crew/shows/opportunities')
  }

  return (
    <div>
      <Link
        href="/crew/shows/opportunities"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Back to Standing Opportunities
      </Link>

      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-1">New Standing Opportunity</h1>
      <p className="text-mid-gray dark:text-dark-muted text-sm mb-8">
        Create a non-show volunteer opportunity for the public page.
      </p>

      <OpportunityForm />
    </div>
  )
}
