'use client'

import { Plus } from 'lucide-react'

function ActiveBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      Active
    </span>
  )
}

function PendingBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-700">
      Pending
    </span>
  )
}

function CancelledBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Cancelled
    </span>
  )
}

export function CompletedBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      Completed
    </span>
  )
}

export function RehearsalsMockup() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Rehearsals — Option A Mockup (List View)
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rehearsals</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage rehearsal schedules and attendance.
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="bg-neutral-surface border border-neutral-border rounded-lg p-1 flex gap-1">
          <span className="bg-brand-primary text-white rounded-md px-3 py-1.5 text-sm font-medium">
            Active
          </span>
          <span className="text-gray-600 dark:text-gray-400 rounded-md px-3 py-1.5 text-sm cursor-pointer">
            All
          </span>
        </div>

        <button
          type="button"
          className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border">
              <th className="text-left pl-4 pr-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Schedule Title
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Date Range
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Assignees
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Next Rehearsal
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Status
              </th>
              <th className="pr-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">Into the Woods</td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Sep 15 – Nov 3, 2025</td>
              <td className="text-center px-3 py-4 text-gray-600 dark:text-gray-400">12</td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Oct 17, 2025 · 6:00 PM</td>
              <td className="px-3 py-4">
                <ActiveBadge />
              </td>
              <td className="text-brand-primary hover:text-brand-primary-dark text-sm cursor-pointer pr-4">
                View →
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">A Christmas Carol</td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Oct 28 – Dec 12, 2025</td>
              <td className="text-center px-3 py-4 text-gray-600 dark:text-gray-400">9</td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Oct 28, 2025 · 7:00 PM</td>
              <td className="px-3 py-4">
                <ActiveBadge />
              </td>
              <td className="text-brand-primary hover:text-brand-primary-dark text-sm cursor-pointer pr-4">
                View →
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                Spring Musical 2026 — Pre-Production
              </td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Nov 10 – Dec 20, 2025</td>
              <td className="text-center px-3 py-4 text-gray-600 dark:text-gray-400">4</td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Nov 10, 2025 · 6:30 PM</td>
              <td className="px-3 py-4">
                <PendingBadge />
              </td>
              <td className="text-brand-primary hover:text-brand-primary-dark text-sm cursor-pointer pr-4">
                View →
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                Wizard of Oz — Cancelled
              </td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Aug 1 – Sep 30, 2025</td>
              <td className="text-center px-3 py-4 text-gray-600 dark:text-gray-400">8</td>
              <td className="text-gray-400 px-3 py-4">—</td>
              <td className="px-3 py-4">
                <CancelledBadge />
              </td>
              <td className="text-brand-primary hover:text-brand-primary-dark text-sm cursor-pointer pr-4">
                View →
              </td>
            </tr>
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-neutral-border bg-neutral-surface dark:bg-dark-nav text-xs text-gray-500 dark:text-gray-400">
          Showing 4 schedules — 3 active, 1 cancelled
        </div>
      </div>
    </div>
  )
}
