'use client'

import { Plus } from 'lucide-react'

export function InterestFormBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
      Interest Form
    </span>
  )
}

export function SlotClaimBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
      Slot Claim
    </span>
  )
}

export function ActiveBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      Active
    </span>
  )
}

export function ArchivedBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      Archived
    </span>
  )
}

export function OpportunitiesMockup() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Opportunities — Option A Mockup (List View)
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Standing Opportunities</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Recurring volunteer roles open year-round.
            </p>
          </div>
          <button
            type="button"
            className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Opportunity
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border">
              <th className="text-left pl-4 pr-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Opportunity
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Claim Type
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Slot Cap
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Submissions
              </th>
              <th className="text-left px-3 pr-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                Front of House — General
              </td>
              <td className="px-3 py-4">
                <InterestFormBadge />
              </td>
              <td className="text-gray-500 dark:text-gray-400 px-3 py-4">Unlimited</td>
              <td className="text-center text-brand-primary font-medium px-3 py-4">47</td>
              <td className="px-3 pr-4 py-4">
                <ActiveBadge />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">Set Build Crew</td>
              <td className="px-3 py-4">
                <SlotClaimBadge />
              </td>
              <td className="text-gray-500 dark:text-gray-400 px-3 py-4">12 slots</td>
              <td className="text-center text-brand-primary font-medium px-3 py-4">12</td>
              <td className="px-3 pr-4 py-4">
                <ActiveBadge />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                Box Office Assistant
              </td>
              <td className="px-3 py-4">
                <SlotClaimBadge />
              </td>
              <td className="text-gray-500 dark:text-gray-400 px-3 py-4">6 slots</td>
              <td className="text-center text-brand-primary font-medium px-3 py-4">6</td>
              <td className="px-3 pr-4 py-4">
                <ActiveBadge />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                Volunteer Coordinator — Spring 2024
              </td>
              <td className="px-3 py-4">
                <InterestFormBadge />
              </td>
              <td className="text-gray-500 dark:text-gray-400 px-3 py-4">Unlimited</td>
              <td className="text-center text-gray-500 dark:text-gray-400 px-3 py-4">23</td>
              <td className="px-3 pr-4 py-4">
                <ArchivedBadge />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-neutral-border bg-neutral-surface dark:bg-dark-nav text-xs text-gray-500 dark:text-gray-400">
          4 opportunities — 3 active, 1 archived
        </div>
      </div>
    </div>
  )
}
