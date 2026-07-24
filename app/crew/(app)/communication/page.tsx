import { getAdminUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/supabase/server'
import BlastComposer from '@/components/crew/communication/BlastComposer'

export default async function CommunicationPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/crew/login')

  const supabase = await getServerClient()

  const { data: replyToSetting } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'default_reply_to')
    .maybeSingle()

  const defaultReplyTo = replyToSetting?.value ?? 'info@30byninety.com'

  const { data: categories } = await supabase
    .from('volunteer_categories')
    .select('id, name')
    .eq('is_visible', true)
    .order('sort_order')

  const canSend = admin.role === 'editor' || admin.role === 'super_admin'

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-dark dark:text-dark-text mb-2">Communication</h1>
      <p className="text-mid-gray dark:text-dark-muted mb-6">Send an email to your volunteers.</p>

      {canSend ? (
        <BlastComposer defaultReplyTo={defaultReplyTo} categories={categories ?? []} />
      ) : (
        <div className="rounded-lg border border-divider dark:border-dark-border p-6">
          <p className="font-semibold text-dark dark:text-dark-text mb-1">Email sending not available</p>
          <p className="text-mid-gray dark:text-dark-muted text-sm">
            Sending emails requires Editor or Super Admin access. Contact a Super Admin if you need to send a
            message to volunteers.
          </p>
        </div>
      )}
    </div>
  )
}
