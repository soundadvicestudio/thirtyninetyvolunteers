'use client'

import Link from 'next/link'
import { formatCT } from '@/lib/utils/date'
import { FORM_STATUS_LABEL, FORM_STATUS_BADGE } from '@/lib/utils/formDisplay'
import type { AdminUser } from '@/lib/auth'
import type { FormListItem } from '@/types/form'

export default function FormList({
  forms,
  adminRole,
}: {
  forms: FormListItem[]
  adminRole: AdminUser['role']
}) {
  const canEdit = adminRole === 'super_admin' || adminRole === 'editor'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Forms</h1>
        {canEdit && (
          <Link
            href="/crew/forms/new"
            className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium"
          >
            ＋ New Form
          </Link>
        )}
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-mid-gray dark:text-dark-muted mb-4">No forms yet. Create your first form.</p>
          {canEdit && (
            <Link
              href="/crew/forms/new"
              className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium"
            >
              ＋ New Form
            </Link>
          )}
        </div>
      ) : (
        <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted bg-light-navy dark:bg-dark-nav">
                  <th className="px-4 py-2 font-semibold">Title</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold">Responses</th>
                  <th className="px-4 py-2 font-semibold">Created</th>
                  <th className="px-4 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface">
                {forms.map((form, i) => (
                  <tr
                    key={form.id}
                    className={`${i % 2 === 1 ? 'bg-gray-50 dark:bg-dark-bg' : ''} border-b border-divider dark:border-dark-border last:border-b-0`}
                  >
                    <td className="px-4 py-2 font-medium text-dark dark:text-dark-text">{form.title}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-xs font-semibold rounded px-2 py-0.5 ${FORM_STATUS_BADGE[form.status]}`}
                      >
                        {FORM_STATUS_LABEL[form.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-dark dark:text-dark-text">{form.response_count}</td>
                    <td className="px-4 py-2 text-dark dark:text-dark-text">
                      {formatCT(form.created_at, 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-2">
                      {canEdit ? (
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/crew/forms/${form.id}/edit`}
                            className="text-xs font-semibold text-navy dark:text-steel hover:underline"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/crew/forms/${form.id}/responses`}
                            className="text-xs font-semibold text-navy dark:text-steel hover:underline"
                          >
                            View Responses
                          </Link>
                        </div>
                      ) : (
                        <span className="text-xs text-mid-gray dark:text-dark-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
