import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { getAdminUser } from '@/lib/auth'
import { getServerClient } from '@/lib/supabase/server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { getUsersForDirectory } from '@/lib/data/messages'

export default async function UsersDirectoryPage() {
  const admin = await getAdminUser()
  if (!admin) {
    redirect('/crew/login')
  }

  const supabase = await getServerClient()
  const flags = await getFeatureFlags(supabase)
  if (!flags.messages) {
    redirect('/crew/dashboard')
  }

  const allUsers = await getUsersForDirectory(supabase)
  const users = allUsers.filter((u) => u.id !== admin.id)

  return (
    <div className="p-6">
      <div className="pb-4 border-b border-neutral-border mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Crew Directory</h1>
        <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
          Send a message to any crew member.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-sm text-mid-gray dark:text-dark-muted">
          No other crew members found.
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface rounded-lg border border-neutral-border overflow-hidden">
          <ul className="divide-y divide-neutral-border dark:divide-dark-border">
            {users.map((user) => {
              const initials = (user.name || '?')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()

              return (
                <li
                  key={user.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary-subtle flex items-center justify-center text-xs font-bold text-brand-primary flex-shrink-0">
                      {initials}
                    </div>
                    <span className="text-sm font-medium text-dark dark:text-dark-text">{user.name}</span>
                  </div>

                  <Link
                    href={`/crew/messages/compose?to=${user.id}`}
                    className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
                  >
                    <Mail size={15} />
                    Message
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
