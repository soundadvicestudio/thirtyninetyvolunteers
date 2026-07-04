'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { archiveOpportunity, reactivateOpportunity } from '@/lib/actions/opportunities'
import type { AdminUser } from '@/lib/auth'
import type { OpportunityWithSubmissionCount, ClaimType, OpportunityStatus } from '@/types/opportunity'

const CLAIM_TYPE_LABEL: Record<ClaimType, string> = { eoi: 'EOI', slot_claim: 'Slot Claim' }
const CLAIM_TYPE_BADGE: Record<ClaimType, string> = {
  eoi: 'bg-steel text-white',
  slot_claim: 'bg-navy text-white',
}
const OPP_STATUS_LABEL: Record<OpportunityStatus, string> = { active: 'Active', archived: 'Archived' }
const OPP_STATUS_BADGE: Record<OpportunityStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-mid-gray/20 text-mid-gray dark:bg-dark-border dark:text-dark-muted',
}

export default function OpportunityList({
  opportunities,
  adminRole,
}: {
  opportunities: OpportunityWithSubmissionCount[]
  adminRole: AdminUser['role']
}) {
  const router = useRouter()
  const canEdit = adminRole === 'super_admin' || adminRole === 'editor'
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)
  const [reactivatingId, setReactivatingId] = useState<string | null>(null)
  const [reactivateError, setReactivateError] = useState<string | null>(null)

  async function handleArchive(id: string) {
    setArchivingId(id)
    setArchiveError(null)
    const result = await archiveOpportunity(id)
    setArchivingId(null)
    if ('error' in result) {
      setArchiveError(result.error)
      return
    }
    router.refresh()
  }

  async function handleReactivate(id: string) {
    setReactivatingId(id)
    setReactivateError(null)
    const result = await reactivateOpportunity(id)
    setReactivatingId(null)
    if ('error' in result) {
      setReactivateError(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div>
      <Link
        href="/crew/shows"
        className="text-sm text-mid-gray dark:text-dark-muted hover:text-navy flex items-center gap-1 mb-6"
      >
        ← Shows
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-dark-text">Standing Opportunities</h1>
        {canEdit && (
          <Link
            href="/crew/shows/opportunities/new"
            className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium"
          >
            ＋ New Opportunity
          </Link>
        )}
      </div>

      {archiveError && (
        <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark dark:text-dark-text mb-4">
          {archiveError}
        </div>
      )}

      {reactivateError && (
        <div className="rounded-lg bg-pale-orange border border-orange p-3 text-sm text-dark dark:text-dark-text mb-4">
          {reactivateError}
        </div>
      )}

      {opportunities.length === 0 ? (
        <p className="text-mid-gray dark:text-dark-muted text-center py-16">No standing opportunities yet.</p>
      ) : (
        <div className="border border-divider dark:border-dark-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider dark:border-dark-border text-left text-mid-gray dark:text-dark-muted bg-light-navy dark:bg-dark-nav">
                  <th className="px-4 py-2 font-semibold">Title</th>
                  <th className="px-4 py-2 font-semibold">Claim Type</th>
                  <th className="px-4 py-2 font-semibold">Slot Cap</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold">Submissions</th>
                  <th className="px-4 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface">
                {opportunities.map((opp, i) => {
                  const isArchived = opp.status === 'archived'
                  return (
                    <tr
                      key={opp.id}
                      className={`${i % 2 === 1 ? 'bg-gray-50 dark:bg-dark-bg' : ''} border-b border-divider dark:border-dark-border last:border-b-0 ${
                        isArchived ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-2 font-medium">
                        <Link
                          href={`/crew/shows/opportunities/${opp.id}`}
                          className="text-dark dark:text-dark-text hover:text-navy dark:hover:text-steel transition-colors"
                        >
                          {opp.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs font-semibold rounded px-2 py-0.5 ${CLAIM_TYPE_BADGE[opp.claim_type]}`}
                        >
                          {CLAIM_TYPE_LABEL[opp.claim_type]}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-dark dark:text-dark-text">
                        {opp.slot_cap_enabled && opp.slot_cap != null ? opp.slot_cap : 'Open-ended'}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs font-semibold rounded px-2 py-0.5 ${OPP_STATUS_BADGE[opp.status]}`}
                        >
                          {OPP_STATUS_LABEL[opp.status]}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-dark dark:text-dark-text">{opp.submission_count}</td>
                      <td className="px-4 py-2">
                        {canEdit && !isArchived && (
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/crew/shows/opportunities/${opp.id}/edit`}
                              className="text-xs font-semibold text-navy dark:text-steel hover:underline"
                            >
                              Edit
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  type="button"
                                  className="text-xs font-semibold text-orange hover:underline cursor-pointer"
                                >
                                  Archive
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Archive &quot;{opp.title}&quot;?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    It will no longer accept submissions and will disappear from the
                                    public page.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogPrimitive.Cancel className="border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                                    Cancel
                                  </AlertDialogPrimitive.Cancel>
                                  <AlertDialogPrimitive.Action
                                    onClick={() => handleArchive(opp.id)}
                                    disabled={archivingId === opp.id}
                                    className="bg-orange text-white hover:bg-orange/90 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50"
                                  >
                                    Archive
                                  </AlertDialogPrimitive.Action>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        {canEdit && isArchived && (
                          <button
                            type="button"
                            onClick={() => handleReactivate(opp.id)}
                            disabled={reactivatingId === opp.id}
                            className="text-xs font-semibold text-navy dark:text-steel hover:underline cursor-pointer disabled:opacity-50"
                          >
                            {reactivatingId === opp.id ? 'Reactivating…' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
