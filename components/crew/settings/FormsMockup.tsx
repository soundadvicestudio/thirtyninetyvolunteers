'use client'

export function LiveBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      Live
    </span>
  )
}

export function DraftBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-700">
      Draft
    </span>
  )
}

export function ClosedBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      Closed
    </span>
  )
}

export function FormsMockup() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Forms — Option A Mockup (List View)
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forms & Surveys</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Custom forms for volunteer intake and data collection.
            </p>
          </div>
          <button
            type="button"
            className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark"
          >
            New Form
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border">
              <th className="text-left pl-4 pr-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Form Title
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Status
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Fields
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Responses
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Created
              </th>
              <th className="pr-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                2025 Volunteer Interest Form
              </td>
              <td className="px-3 py-4">
                <LiveBadge />
              </td>
              <td className="text-center text-gray-600 dark:text-gray-400 px-3 py-4">12</td>
              <td className="text-center text-brand-primary font-medium cursor-pointer px-3 py-4">89</td>
              <td className="text-xs text-gray-500 dark:text-gray-400 px-3 py-4">Aug 2024</td>
              <td className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 pr-4 py-4 cursor-pointer">
                Edit
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                Post-Show Feedback Survey
              </td>
              <td className="px-3 py-4">
                <LiveBadge />
              </td>
              <td className="text-center text-gray-600 dark:text-gray-400 px-3 py-4">8</td>
              <td className="text-center text-brand-primary font-medium cursor-pointer px-3 py-4">34</td>
              <td className="text-xs text-gray-500 dark:text-gray-400 px-3 py-4">Oct 2024</td>
              <td className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 pr-4 py-4 cursor-pointer">
                Edit
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                Volunteer Skills Assessment
              </td>
              <td className="px-3 py-4">
                <DraftBadge />
              </td>
              <td className="text-center text-gray-600 dark:text-gray-400 px-3 py-4">15</td>
              <td className="text-center text-gray-400 dark:text-gray-600 px-3 py-4">0</td>
              <td className="text-xs text-gray-500 dark:text-gray-400 px-3 py-4">Nov 2024</td>
              <td className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 pr-4 py-4 cursor-pointer">
                Edit
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="font-medium text-gray-900 dark:text-white pl-4 pr-3 py-4">
                2024 Season Volunteer Survey
              </td>
              <td className="px-3 py-4">
                <ClosedBadge />
              </td>
              <td className="text-center text-gray-600 dark:text-gray-400 px-3 py-4">10</td>
              <td className="text-center text-brand-primary font-medium cursor-pointer px-3 py-4">142</td>
              <td className="text-xs text-gray-500 dark:text-gray-400 px-3 py-4">Jan 2024</td>
              <td className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 pr-4 py-4 cursor-pointer">
                Edit
              </td>
            </tr>
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-neutral-border bg-neutral-surface dark:bg-dark-nav text-xs text-gray-500 dark:text-gray-400">
          4 forms — 2 live, 1 draft, 1 closed
        </div>
      </div>
    </div>
  )
}
