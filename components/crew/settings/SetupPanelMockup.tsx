'use client'

function ToggleRow({ name, description }: { name: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>
      </div>
      <div className="relative w-11 h-6 cursor-pointer flex-shrink-0">
        <div className="w-11 h-6 rounded-full bg-brand-primary" />
        <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow-sm" />
      </div>
    </div>
  )
}

export function SetupPanelMockup() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Setup Panel — Option A Mockup (Sections 1, 2 & 6)
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Setup</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              30 By Ninety Theatre
              <span className="ml-2 text-xs bg-neutral-surface border border-neutral-border rounded-full px-2 py-0.5 text-gray-500">
                Instance: 30BN
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
        <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 bg-neutral-border rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
              1
            </span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Organization Identity
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
            Basic information about your organization, used throughout the platform and in emails.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Organization Name
            </label>
            <div className="border border-neutral-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-white w-full">
              30 By Ninety Theatre
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tagline
            </label>
            <div className="border border-neutral-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-white w-full">
              {"Old Mandeville's Community Theater"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact Email
            </label>
            <div className="border border-neutral-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-white w-full">
              info@30byninetyvolunteers.com
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website URL
            </label>
            <div className="border border-neutral-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-white w-full">
              https://30byninetyvolunteers.com
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-border bg-neutral-surface dark:bg-dark-nav flex justify-end">
          <button
            type="button"
            className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
        <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 bg-neutral-border rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
              2
            </span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Brand Colors</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
            Primary and accent colors used across all pages and email templates.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg border border-neutral-border flex-shrink-0 cursor-pointer"
              style={{ backgroundColor: '#293994' }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Primary Color</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Navigation, buttons, and primary interactive elements.
              </div>
              <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1 bg-neutral-surface border border-neutral-border rounded px-2 py-0.5 inline-block">
                #293994
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg border border-neutral-border flex-shrink-0 cursor-pointer"
              style={{ backgroundColor: '#F26522' }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">Accent Color</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Call-to-action buttons and highlights.
              </div>
              <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1 bg-neutral-surface border border-neutral-border rounded px-2 py-0.5 inline-block">
                #F26522
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-border bg-neutral-surface dark:bg-dark-nav flex justify-end">
          <button
            type="button"
            className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
        <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 bg-neutral-border rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
              6
            </span>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Feature Flags</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
            Enable or disable platform features for this deployment.
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="divide-y divide-neutral-border">
            <ToggleRow name="Calendar & Space Management" description="Event scheduling and venue booking." />
            <ToggleRow name="Check-In System" description="QR code volunteer check-in for shows." />
            <ToggleRow name="Email Blast Composer" description="Send bulk emails to volunteers." />
            <ToggleRow
              name="Rehearsal Management"
              description="Schedule and track rehearsal attendance."
            />
            <ToggleRow
              name="Audition Management"
              description="Manage auditions, signups, and materials."
            />
            <ToggleRow name="Inventory Management" description="Track props, costumes, and equipment." />
            <ToggleRow name="Internal Forums" description="Private discussion boards for the crew." />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-border bg-neutral-surface dark:bg-dark-nav flex justify-end">
          <button
            type="button"
            className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 border-t border-neutral-border" />
        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
          Sections 3–5, 7–8 not shown in mockup
        </span>
        <div className="flex-1 border-t border-neutral-border" />
      </div>
    </div>
  )
}
