'use client'

import { Plus } from 'lucide-react'

function TimedSlotsBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center bg-brand-primary-light text-brand-primary">
      Timed Slots
    </span>
  )
}

function OpenCallBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
      Open Call
    </span>
  )
}

function PublishedBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      Published
    </span>
  )
}

function DraftBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-700">
      Draft
    </span>
  )
}

function ClosedBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      Closed
    </span>
  )
}

export function ArchivedBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Archived
    </span>
  )
}

export function AuditionsMockup() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Auditions — Option A Mockup (List View)
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Auditions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage audition events, signups, and materials.
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
          New Audition
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border">
              <th className="text-left pl-4 pr-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Title
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Show
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Type
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Date(s)
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Signups
              </th>
              <th className="text-left pr-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                Into the Woods — Principal Auditions
              </td>
              <td className="px-3 py-4">
                <span className="text-brand-primary text-sm cursor-pointer hover:text-brand-primary-dark">
                  Into the Woods
                </span>
              </td>
              <td className="px-3 py-4">
                <TimedSlotsBadge />
              </td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Oct 18–19, 2025</td>
              <td className="text-center px-3 py-4 text-gray-600 dark:text-gray-400">34</td>
              <td className="pr-4 py-4">
                <PublishedBadge />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                A Christmas Carol — Open Auditions
              </td>
              <td className="px-3 py-4">
                <span className="text-brand-primary text-sm cursor-pointer hover:text-brand-primary-dark">
                  A Christmas Carol
                </span>
              </td>
              <td className="px-3 py-4">
                <OpenCallBadge />
              </td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Nov 2, 2025</td>
              <td className="text-center px-3 py-4 text-gray-600 dark:text-gray-400">18</td>
              <td className="pr-4 py-4">
                <PublishedBadge />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                Spring Musical 2026 — Principal Auditions
              </td>
              <td className="px-3 py-4">
                <span className="text-gray-400 dark:text-gray-500 italic text-sm">Standalone</span>
              </td>
              <td className="px-3 py-4">
                <TimedSlotsBadge />
              </td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Jan 10–11, 2026</td>
              <td className="text-center px-3 py-4 text-gray-600 dark:text-gray-400">0</td>
              <td className="pr-4 py-4">
                <DraftBadge />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                Community Reading — Open Auditions
              </td>
              <td className="px-3 py-4">
                <span className="text-gray-400 dark:text-gray-500 italic text-sm">Standalone</span>
              </td>
              <td className="px-3 py-4">
                <OpenCallBadge />
              </td>
              <td className="text-gray-600 dark:text-gray-400 px-3 py-4">Sep 5, 2025</td>
              <td className="text-center px-3 py-4 text-gray-600 dark:text-gray-400">22</td>
              <td className="pr-4 py-4">
                <ClosedBadge />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-neutral-border bg-neutral-surface dark:bg-dark-nav text-xs text-gray-500 dark:text-gray-400">
          Showing 4 auditions — 2 published, 1 draft, 1 closed
        </div>
      </div>
    </div>
  )
}
