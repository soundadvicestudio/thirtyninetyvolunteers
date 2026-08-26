const EVENT_PRIMARY = { backgroundColor: 'var(--brand-primary)' }
const EVENT_ACCENT = { backgroundColor: 'var(--brand-accent)' }

export function EventPill({ label, variant }: { label: string; variant: 'primary' | 'accent' }) {
  return (
    <span
      className="inline-block text-[10px] px-1.5 py-0.5 rounded text-white truncate w-full"
      style={variant === 'primary' ? EVENT_PRIMARY : EVENT_ACCENT}
    >
      {label}
    </span>
  )
}

export function TodayIndicator({ day }: { day: number }) {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-semibold"
      style={{ backgroundColor: 'var(--brand-primary)' }}
    >
      {day}
    </span>
  )
}

export function InterestChip({ label }: { label: string }) {
  return (
    <span className="inline-block text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
      {label}
    </span>
  )
}

export function VolunteerHomeMockup() {
  return (
    <div className="min-h-screen bg-white">
      <p
        className="text-xs font-medium uppercase tracking-widest px-4 pt-6"
        style={{ color: 'var(--brand-primary)' }}
      >
        Volunteer Home Page — Redesign Mockup
      </p>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="pb-4 border-b border-neutral-border mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to the 30 By Ninety Theatre Volunteer Family</h1>
          <p className="text-sm text-gray-500 mt-1">
            Our volunteers are the heart of every production — from backstage to the box office.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#"
            className="w-full sm:w-auto text-center px-6 py-3 rounded text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Update My Info
          </a>
          <a
            href="#"
            className="w-full sm:w-auto text-center px-6 py-3 rounded text-sm font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Upcoming Volunteer Opportunities
          </a>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mt-8">
          <div className="flex-1 min-w-0">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-surface border-b border-neutral-border px-5 py-3 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-700">Upcoming Events</span>
                <span className="text-xs text-gray-500">‹ October 2025 ›</span>
              </div>
              <div className="bg-white px-4 py-3">
                <div className="grid grid-cols-7">
                  <div className="text-xs text-gray-400 text-center py-1 border-b border-neutral-border">Sun</div>
                  <div className="text-xs text-gray-400 text-center py-1 border-b border-neutral-border">Mon</div>
                  <div className="text-xs text-gray-400 text-center py-1 border-b border-neutral-border">Tue</div>
                  <div className="text-xs text-gray-400 text-center py-1 border-b border-neutral-border">Wed</div>
                  <div className="text-xs text-gray-400 text-center py-1 border-b border-neutral-border">Thu</div>
                  <div className="text-xs text-gray-400 text-center py-1 border-b border-neutral-border">Fri</div>
                  <div className="text-xs text-gray-400 text-center py-1 border-b border-neutral-border">Sat</div>

                  {/* Week 1 */}
                  <div className="text-xs text-center py-1 relative"></div>
                  <div className="text-xs text-center py-1 relative"></div>
                  <div className="text-xs text-center py-1 relative"></div>
                  <div className="text-xs text-center py-1 relative">1</div>
                  <div className="text-xs text-center py-1 relative">2</div>
                  <div className="text-xs text-center py-1 relative">3</div>
                  <div className="text-xs text-center py-1 relative space-y-0.5">
                    <div>4</div>
                    <EventPill label="Mainstage" variant="primary" />
                  </div>

                  {/* Week 2 */}
                  <div className="text-xs text-center py-1 relative">5</div>
                  <div className="text-xs text-center py-1 relative">6</div>
                  <div className="text-xs text-center py-1 relative">7</div>
                  <div className="text-xs text-center py-1 relative">8</div>
                  <div className="text-xs text-center py-1 relative">9</div>
                  <div className="text-xs text-center py-1 relative">10</div>
                  <div className="text-xs text-center py-1 relative space-y-0.5">
                    <div>11</div>
                    <EventPill label="Studio X" variant="accent" />
                  </div>

                  {/* Week 3 */}
                  <div className="text-xs text-center py-1 relative">12</div>
                  <div className="text-xs text-center py-1 relative">13</div>
                  <div className="text-xs text-center py-1 relative">14</div>
                  <div className="text-xs text-center py-1 relative">
                    <TodayIndicator day={15} />
                  </div>
                  <div className="text-xs text-center py-1 relative">16</div>
                  <div className="text-xs text-center py-1 relative">17</div>
                  <div className="text-xs text-center py-1 relative space-y-0.5">
                    <div>18</div>
                    <EventPill label="Mainstage" variant="primary" />
                  </div>

                  {/* Week 4 */}
                  <div className="text-xs text-center py-1 relative">19</div>
                  <div className="text-xs text-center py-1 relative">20</div>
                  <div className="text-xs text-center py-1 relative">21</div>
                  <div className="text-xs text-center py-1 relative">22</div>
                  <div className="text-xs text-center py-1 relative">23</div>
                  <div className="text-xs text-center py-1 relative">24</div>
                  <div className="text-xs text-center py-1 relative space-y-0.5">
                    <div>25</div>
                    <EventPill label="Mainstage" variant="primary" />
                  </div>

                  {/* Week 5 */}
                  <div className="text-xs text-center py-1 relative">26</div>
                  <div className="text-xs text-center py-1 relative">27</div>
                  <div className="text-xs text-center py-1 relative">28</div>
                  <div className="text-xs text-center py-1 relative">29</div>
                  <div className="text-xs text-center py-1 relative">30</div>
                  <div className="text-xs text-center py-1 relative">31</div>
                  <div className="text-xs text-center py-1 relative"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-surface border-b border-neutral-border px-5 py-3">
                <span className="font-semibold text-sm text-gray-700">Join Our Volunteer Family</span>
              </div>
              <div className="bg-white px-5 py-4 space-y-3">
                <input
                  type="text"
                  placeholder="Full name"
                  disabled
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 disabled:bg-gray-50"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  disabled
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 disabled:bg-gray-50"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  disabled
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-700 placeholder-gray-400 disabled:bg-gray-50"
                />
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Volunteer Interests</p>
                  <div className="flex flex-wrap gap-2">
                    <InterestChip label="Ushers/Front of House" />
                    <InterestChip label="Backstage Crew" />
                    <InterestChip label="Lighting Operator" />
                  </div>
                </div>
                <select
                  disabled
                  defaultValue=""
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 text-gray-500 disabled:bg-gray-50"
                >
                  <option value="">How did you hear about us — Select one...</option>
                </select>
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                >
                  Sign Up to Volunteer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm font-semibold text-gray-700 mb-3">Upcoming Auditions</p>
          <div className="border border-gray-200 rounded-lg bg-white px-5 py-4 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-700">
              Spring Musical Auditions — Saturday, Nov 1, 2025
            </p>
            <a
              href="#"
              className="shrink-0 text-sm font-medium hover:underline"
              style={{ color: 'var(--brand-primary)' }}
            >
              Learn More →
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-8 pt-6 border-t border-gray-100">
          <p>© 30 By Ninety Theatre</p>
          <p className="mt-1">info@30byninety.com · 30byninety.com · Old Mandeville, LA</p>
        </div>
      </div>
    </div>
  )
}
