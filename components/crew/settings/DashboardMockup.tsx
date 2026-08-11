'use client'

export function DashboardMockup() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Dashboard — Option A Mockup
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {"Welcome back — here's what's happening at 30 By Ninety Theatre."}
        </p>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg p-5 shadow-sm dark:shadow-none border-t-2 border-t-brand-primary">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">142</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active Volunteers</div>
          </div>
          <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg p-5 shadow-sm dark:shadow-none border-t-2 border-t-brand-primary">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">3</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Shows This Month</div>
          </div>
          <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg p-5 shadow-sm dark:shadow-none border-t-2 border-t-brand-primary">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">18</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Volunteers Needed</div>
          </div>
          <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg p-5 shadow-sm dark:shadow-none border-t-2 border-t-brand-primary">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">7</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">New This Week</div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Season at a Glance</h2>
          <span className="text-xs bg-gray-100 dark:bg-dark-nav text-gray-600 dark:text-gray-400 rounded-full px-3 py-1">
            2024–2025 Season
          </span>
        </div>
        <div className="space-y-3">
          <div className="bg-neutral-surface dark:bg-dark-surface border border-neutral-border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">Into the Woods</span>
              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full px-2 py-0.5">
                Live
              </span>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mr-2 bg-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ushers</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">12 / 12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mr-2 bg-yellow-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Box Office</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">3 / 5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mr-2 bg-red-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Concessions</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">0 / 4</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-surface dark:bg-dark-surface border border-neutral-border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">A Christmas Carol</span>
              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full px-2 py-0.5">
                Live
              </span>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mr-2 bg-yellow-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ushers</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">8 / 12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mr-2 bg-green-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Backstage</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">4 / 4</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mr-2 bg-yellow-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Box Office</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">2 / 5</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-surface dark:bg-dark-surface border border-neutral-border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">The Wizard of Oz</span>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mr-2 bg-gray-300" />
                  <span className="text-sm text-gray-400 dark:text-gray-600">Ushers</span>
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-600">— / —</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mr-2 bg-gray-300" />
                  <span className="text-sm text-gray-400 dark:text-gray-600">Box Office</span>
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-600">— / —</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-600 italic mt-3">No dates posted yet</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Pending Milestones</h2>
        <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border last:border-b-0">
            <div>
              <div className="font-medium text-sm text-gray-900 dark:text-white">Sarah Mitchell</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">🎉 100-Hour Milestone</div>
            </div>
            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded-md bg-brand-primary text-white hover:bg-brand-primary-dark"
            >
              Acknowledge
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border last:border-b-0">
            <div>
              <div className="font-medium text-sm text-gray-900 dark:text-white">James Thibodaux</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">⭐ 25-Hour Milestone</div>
            </div>
            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded-md bg-brand-primary text-white hover:bg-brand-primary-dark"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Pending Hours Review</h2>
        <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border last:border-b-0">
            <div>
              <div className="font-medium text-sm text-gray-900 dark:text-white">Marcus Dupree</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Into the Woods — Oct 14</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value="3.5"
                className="w-16 text-center border border-neutral-border rounded-md px-2 py-1 text-sm bg-white dark:bg-dark-surface"
              />
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-md bg-brand-accent text-white hover:bg-brand-accent-dark"
              >
                Confirm
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border last:border-b-0">
            <div>
              <div className="font-medium text-sm text-gray-900 dark:text-white">Celeste Fontenot</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Into the Woods — Oct 15</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value="3.5"
                className="w-16 text-center border border-neutral-border rounded-md px-2 py-1 text-sm bg-white dark:bg-dark-surface"
              />
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-md bg-brand-accent text-white hover:bg-brand-accent-dark"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Activity Feed</h2>
          <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
            Mark all as read
          </span>
        </div>
        <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg">
          <div className="flex items-start gap-3 px-4 py-3 border-b border-neutral-border last:border-b-0">
            <div className="w-8 h-8 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary text-xs font-semibold flex-shrink-0">
              SM
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">Sarah Mitchell</span> signed up
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ushers · Into the Woods · Oct 14</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="block bg-brand-primary-subtle text-brand-primary text-xs rounded-full px-2 py-0.5 mb-1">
                NEW
              </span>
              <span className="text-xs text-gray-400">2 min ago</span>
            </div>
          </div>
          <div className="flex items-start gap-3 px-4 py-3 border-b border-neutral-border last:border-b-0">
            <div className="w-8 h-8 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary text-xs font-semibold flex-shrink-0">
              JT
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">James Thibodaux</span> claimed a slot
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Box Office · A Christmas Carol · Nov 22</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="block bg-brand-primary-subtle text-brand-primary text-xs rounded-full px-2 py-0.5 mb-1">
                NEW
              </span>
              <span className="text-xs text-gray-400">14 min ago</span>
            </div>
          </div>
          <div className="flex items-start gap-3 px-4 py-3 border-b border-neutral-border last:border-b-0">
            <div className="w-8 h-8 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary text-xs font-semibold flex-shrink-0">
              MD
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">Marcus Dupree</span> submitted a volunteer form
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">New volunteer registration</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs text-gray-400">1 hour ago</span>
            </div>
          </div>
          <div className="flex items-start gap-3 px-4 py-3 border-b border-neutral-border last:border-b-0">
            <div className="w-8 h-8 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary text-xs font-semibold flex-shrink-0">
              CF
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">Celeste Fontenot</span> was added to the waitlist
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Backstage · Into the Woods · Oct 15</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs text-gray-400">3 hours ago</span>
            </div>
          </div>
          <div className="flex items-start gap-3 px-4 py-3 border-b border-neutral-border last:border-b-0">
            <div className="w-8 h-8 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary text-xs font-semibold flex-shrink-0">
              RB
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">Robert Broussard</span>
                {"'s attendance was marked Showed"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Into the Woods · Oct 12</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs text-gray-400">Yesterday</span>
            </div>
          </div>
        </div>
        <div className="text-center py-3 text-sm text-brand-primary hover:text-brand-primary-dark cursor-pointer">
          Load more
        </div>
      </div>
    </div>
  )
}
