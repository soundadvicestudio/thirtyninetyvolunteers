'use client'

export function CommunicationMockup() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Communication — Option A Mockup (Compose + Confirm Steps)
      </p>

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
          Step 1 — Compose
        </p>

        <div className="pb-4 border-b border-neutral-border mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Send Email Blast</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Compose and send an email to volunteers.
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Send To
            </label>
            <div className="bg-neutral-surface border border-neutral-border rounded-lg p-1 flex gap-1 w-full">
              <span className="flex-1 bg-brand-primary text-white rounded-md px-3 py-2 text-sm font-medium text-center">
                All Volunteers
              </span>
              <span className="flex-1 text-gray-600 dark:text-gray-400 rounded-md px-3 py-2 text-sm text-center cursor-pointer">
                By Category
              </span>
              <span className="flex-1 text-gray-600 dark:text-gray-400 rounded-md px-3 py-2 text-sm text-center cursor-pointer">
                Individual
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <span className="text-xs text-gray-400">42 / 200</span>
            </div>
            <div className="border border-neutral-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-white w-full">
              Volunteer Opportunities — October 2025
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reply-To
            </label>
            <div className="border border-neutral-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-white w-full">
              info@30byninetyvolunteers.com
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Replies from volunteers will go to this address.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <div className="bg-neutral-surface border border-neutral-border rounded-t-md px-2 py-1.5 flex items-center gap-0.5 flex-wrap">
              <span className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav cursor-pointer">
                B
              </span>
              <span className="w-8 h-8 rounded flex items-center justify-center text-sm italic text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav cursor-pointer">
                I
              </span>
              <span className="w-8 h-8 rounded flex items-center justify-center text-sm underline text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav cursor-pointer">
                U
              </span>
              <span className="w-8 h-8 rounded flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav cursor-pointer">
                H1
              </span>
              <span className="w-8 h-8 rounded flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav cursor-pointer">
                H2
              </span>
              <span className="w-8 h-8 rounded flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav cursor-pointer">
                —
              </span>
              <span className="w-8 h-8 rounded flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav cursor-pointer">
                • List
              </span>
              <span className="w-8 h-8 rounded flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav cursor-pointer">
                1. List
              </span>
              <span className="w-8 h-8 rounded flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-nav cursor-pointer">
                🔗
              </span>
            </div>
            <div className="bg-white dark:bg-dark-surface border border-neutral-border border-t-0 rounded-b-md min-h-[160px] p-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="mb-2">Hi [volunteer name],</p>
              <p className="mb-2">
                We have several exciting volunteer opportunities coming up this month at 30 By Ninety
                Theatre.
              </p>
              <p className="mb-2 font-semibold">Into the Woods — Oct 12–Nov 3</p>
              <p>{"We'd love to see you there. Sign up at your convenience via the Call Board."}</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="bg-brand-primary text-white rounded-md px-6 py-2.5 text-sm font-medium hover:bg-brand-primary-dark"
            >
              Preview & Send
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-border pt-6 mt-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
          Step 2 — Confirm (after Preview & Send)
        </p>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Subject
            </div>
            <div className="text-sm text-gray-900 dark:text-white mt-0.5">
              Volunteer Opportunities — October 2025
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Recipients
            </div>
            <div className="text-sm text-gray-900 dark:text-white mt-0.5">All Volunteers</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Recipient Count
            </div>
            <div className="text-sm text-gray-900 dark:text-white mt-0.5">142 volunteers</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Reply-To
            </div>
            <div className="text-sm text-gray-900 dark:text-white mt-0.5">
              info@30byninetyvolunteers.com
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sample recipients:</p>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            <p>sarah.mitchell@email.com</p>
            <p>jthibodaux@gmail.com</p>
            <p>marcusd@yahoo.com</p>
            <p>cfontenot@outlook.com</p>
            <p>rbroussard@email.com</p>
          </div>
          <p className="text-xs text-gray-400 italic mt-1">...and 137 more</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Message preview:
          </p>
          <div className="bg-neutral-surface border border-neutral-border rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 mt-1">
            Hi [volunteer name], We have several exciting volunteer opportunities coming up this month
            at 30 By Ninety Theatre...
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300 rounded-lg px-4 py-3 text-sm">
          ⚠ This will send an email to 142 volunteers. This action cannot be undone.
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            className="border border-neutral-border bg-neutral-surface text-gray-700 dark:text-gray-300 rounded-md px-4 py-2 text-sm cursor-pointer"
          >
            ← Back
          </button>
          <button
            type="button"
            className="bg-brand-accent text-white rounded-md px-6 py-2.5 text-sm font-medium hover:bg-brand-accent-dark"
          >
            Send Email Blast
          </button>
        </div>
      </div>
    </div>
  )
}
