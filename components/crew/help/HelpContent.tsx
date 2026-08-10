import type { ReactNode } from 'react'
import { AdminRole } from '@/types/admin'

interface HelpContentProps {
  role: AdminRole
  calendarEditor: boolean
}

interface TocSection {
  id: string
  label: string
  roles: AdminRole[]
  calendarEditorOnly?: boolean // true = only visible when calendarEditor=true AND role permits
  children?: TocSection[]
}

// Single source of truth for both the TOC and the section-visibility checks
// below. Every section/subsection that exists today in the help page is
// represented here — no new sections, no removed sections (HELP.2b adds
// new entries). Role lists mirror the HELP.1 Task E role assignment map.
const ALL_SECTIONS: TocSection[] = [
  {
    id: 'dashboard',
    label: 'Your Dashboard',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer'],
    children: [
      { id: 'dashboard-stats', label: 'Quick Stats', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'dashboard-season', label: 'Season at a Glance', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'dashboard-feed', label: 'Activity Feed', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
    ],
  },
  {
    id: 'volunteers',
    label: 'Your Volunteers',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer'],
    children: [
      { id: 'find-volunteer', label: 'Finding a Volunteer', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'volunteer-profile', label: "Reading a Profile", roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'edit-volunteer', label: 'Editing Information', roles: ['super_admin', 'owner_admin', 'editor'] },
      { id: 'archive-volunteer', label: 'Archiving a Volunteer', roles: ['super_admin', 'owner_admin', 'editor'] },
      { id: 'volunteer-communication', label: 'Communication History', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
    ],
  },
  {
    id: 'shows',
    label: 'Shows',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer'],
    children: [
      { id: 'show-status', label: 'Show Statuses', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'create-show', label: 'Creating a Show', roles: ['super_admin', 'owner_admin', 'editor'] },
      { id: 'publish-show', label: 'Publishing a Show', roles: ['super_admin', 'owner_admin', 'editor'] },
      { id: 'show-volunteers', label: "Managing Who's Signed Up", roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'show-email', label: 'Messaging Volunteers', roles: ['super_admin', 'owner_admin', 'editor'] },
      { id: 'waitlist', label: 'The Waitlist', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'post-show-report', label: 'Post-Show Report', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance and Hours',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer'],
    children: [
      { id: 'mark-attendance', label: 'Marking Attendance', roles: ['super_admin', 'owner_admin', 'editor'] },
      { id: 'hours', label: 'How Hours Work', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'milestones', label: 'Milestones', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
    ],
  },
  {
    id: 'signup-form',
    label: 'The Signup Form',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer'],
    children: [
      { id: 'what-volunteers-see', label: 'What Volunteers See', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'announcement-banner', label: 'Announcement Banner', roles: ['super_admin', 'owner_admin', 'editor'] },
      { id: 'form-settings', label: 'Form Field Settings', roles: ['super_admin', 'owner_admin', 'editor'] },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    roles: ['super_admin', 'owner_admin'],
    children: [
      { id: 'hearing-options', label: 'Hearing Options', roles: ['super_admin', 'owner_admin'] },
      { id: 'default-hours', label: 'Default Hours', roles: ['super_admin', 'owner_admin'] },
      { id: 'reply-to', label: 'Reply-To Email', roles: ['super_admin', 'owner_admin'] },
      { id: 'categories', label: 'Categories', roles: ['super_admin', 'owner_admin'] },
      { id: 'user-accounts', label: 'User Accounts', roles: ['super_admin', 'owner_admin'] },
      { id: 'audit-log', label: 'Audit Log', roles: ['super_admin', 'owner_admin'] },
      { id: 'location-management', label: 'Location Management', roles: ['super_admin', 'owner_admin'] },
      { id: 'email-activity-log', label: 'Email Activity Log', roles: ['super_admin', 'owner_admin'] },
      { id: 'document-types', label: 'Document Types', roles: ['super_admin', 'owner_admin'] },
      { id: 'consent-forms', label: 'Consent Form Submissions', roles: ['super_admin', 'owner_admin'] },
    ],
  },
  {
    id: 'calendar',
    label: 'Master Calendar',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'],
    children: [
      { id: 'calendar-overview', label: 'Calendar Overview', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'calendar-submit', label: 'Submitting an Event', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'calendar-direct-create', label: 'Direct Event Creation', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'calendar-bulk-rehearsal', label: 'Bulk Rehearsal Schedules', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'calendar-recurring', label: 'Recurring Events', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'calendar-pending', label: 'Pending Approval Queue', roles: ['super_admin', 'owner_admin'] },
      { id: 'calendar-book-space', label: 'Book Space', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'calendar-export', label: 'Calendar Export & Subscription', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'calendar-public', label: 'The Public Calendar', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    roles: ['super_admin', 'owner_admin', 'editor'],
    children: [
      { id: 'blast-compose', label: 'Sending an Email Blast', roles: ['super_admin', 'owner_admin', 'editor'] },
    ],
  },
  {
    id: 'check-in',
    label: 'Check-In System',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer'],
    children: [
      { id: 'check-in-qr', label: 'Check-In QR Codes', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'check-in-dashboard', label: 'Live Check-In Dashboard', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
    ],
  },
  {
    id: 'media-library',
    label: 'Media Library',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'],
    children: [
      { id: 'media-library-upload', label: 'Uploading Files and Links', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'media-library-access', label: 'Sharing and Access', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
    ],
  },
  { id: 'callboard', label: 'The Volunteer Call Board', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
  { id: 'opportunities', label: 'Standing Opportunities', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
  { id: 'getting-help', label: 'Getting Help', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
  {
    id: 'rehearsals',
    label: 'Rehearsals',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'],
    children: [
      { id: 'rehearsals-schedules', label: 'Understanding Schedules', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'rehearsals-assignments', label: 'Managing Assignments', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'rehearsals-attendance', label: 'Recording Attendance', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'rehearsals-checkin', label: 'The Check-In QR Code', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
    ],
  },
  {
    id: 'auditions',
    label: 'Auditions',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'],
    children: [
      { id: 'auditions-overview', label: 'Overview', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'auditions-signups', label: 'Managing Signups', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'auditions-materials', label: 'Materials', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
      { id: 'auditions-checkin', label: 'Day-of Check-In', roles: ['super_admin', 'owner_admin', 'editor', 'viewer', 'production'] },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    roles: ['super_admin', 'owner_admin', 'editor', 'viewer'],
    children: [
      { id: 'inventory-overview', label: 'Overview', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'inventory-items', label: 'Managing Items', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'inventory-checkout', label: 'Checkout & Returns', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
      { id: 'inventory-tags', label: 'Printing Tags', roles: ['super_admin', 'owner_admin', 'editor', 'viewer'] },
    ],
  },
]

function flattenSections(sections: TocSection[]): TocSection[] {
  return sections.flatMap((s) => [s, ...(s.children ? flattenSections(s.children) : [])])
}

function filterSections(sections: TocSection[], role: AdminRole, calendarEditor: boolean): TocSection[] {
  return sections
    .filter((s) => {
      if (!s.roles.includes(role)) return false
      if (s.calendarEditorOnly && !calendarEditor && role !== 'super_admin') return false
      return true
    })
    .map((s) => ({
      ...s,
      children: s.children ? filterSections(s.children, role, calendarEditor) : undefined,
    }))
}

function isSectionVisible(id: string, role: AdminRole, calendarEditor: boolean): boolean {
  const flat = flattenSections(ALL_SECTIONS)
  const section = flat.find((s) => s.id === id)
  if (!section) return false
  if (!section.roles.includes(role)) return false
  if (section.calendarEditorOnly && !calendarEditor && role !== 'super_admin') return false
  return true
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-dark-surface border-l-4 border-brand-primary dark:border-brand-primary-mid p-4 rounded-r my-4">
      <p className="text-sm text-dark dark:text-dark-text leading-relaxed">
        <span className="font-semibold">{'\u{1F4A1} Tip:'}</span> {children}
      </p>
    </div>
  )
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 dark:bg-dark-surface border-l-4 border-brand-accent p-4 rounded-r my-4">
      <p className="text-sm text-dark dark:text-dark-text leading-relaxed">
        <span className="font-semibold">{'⚠️ Important:'}</span> {children}
      </p>
    </div>
  )
}

function Divider() {
  return <hr className="border-t border-divider dark:border-dark-border my-12" />
}

const h2Classes = 'text-2xl font-bold text-brand-primary dark:text-brand-primary-mid mb-4 mt-12'
const h3Classes = 'text-lg font-semibold text-dark dark:text-dark-text mb-2 mt-8'
const pClasses = 'text-dark dark:text-dark-text leading-relaxed mb-4'
const ulClasses = 'list-disc pl-5 space-y-1 text-dark dark:text-dark-text leading-relaxed mb-4'
const olClasses = 'list-decimal pl-5 space-y-1 text-dark dark:text-dark-text leading-relaxed mb-4'

// Exact className patterns preserved from the original static TocList in
// page.tsx (HELP.1 Task A2) — only the data source changed, from a
// hardcoded TOC array to the role-filtered `sections` prop.
const tocLinkClasses =
  'block text-sm text-mid-gray dark:text-dark-muted hover:text-brand-primary dark:hover:text-brand-primary-mid transition-colors py-0.5'

function TocList({ sections }: { sections: TocSection[] }) {
  return (
    <nav className="space-y-3">
      {sections.map((s) => (
        <div key={s.id}>
          <a href={`#${s.id}`} className={tocLinkClasses}>
            {s.label}
          </a>
          {s.children && s.children.length > 0 && (
            <div>
              {s.children.map((sub) => (
                <a key={sub.id} href={`#${sub.id}`} className={`${tocLinkClasses} pl-4`}>
                  {sub.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}

export default function HelpContent({ role, calendarEditor }: HelpContentProps) {
  const visible = filterSections(ALL_SECTIONS, role, calendarEditor)
  const show = (id: string) => isSectionVisible(id, role, calendarEditor)

  return (
    <div className="max-w-6xl mx-auto" style={{ scrollBehavior: 'smooth' }}>
      <h1 className="text-2xl font-bold text-brand-primary dark:text-brand-primary-mid mb-2">{`Help & How-To Guide`}</h1>
      <p className="text-dark dark:text-dark-text leading-relaxed mb-8">
        {`Everything you need to know to manage volunteers in Production Crew.`}
      </p>

      {/* Mobile jump-to-section */}
      <div className="lg:hidden border border-divider dark:border-dark-border rounded-lg p-4 mb-8">
        <p className="text-sm font-semibold text-dark dark:text-dark-text mb-2">{`Jump to section:`}</p>
        <TocList sections={visible} />
      </div>

      <div className="lg:flex lg:gap-12 lg:items-start">
        <aside className="hidden lg:block w-60 shrink-0 sticky top-4 self-start">
          <TocList sections={visible} />
        </aside>

        <div className="flex-1 min-w-0">
          {/* ───────── Your Dashboard ───────── */}
          {show('dashboard') && (
            <section id="dashboard">
              <h2 className={h2Classes}>{`Your Dashboard`}</h2>
              <p className={pClasses}>
                {`The dashboard is the first thing you see when you log in. It gives you a quick look at what's happening across the platform.`}
              </p>

              {show('dashboard-stats') && (
                <>
                  <h3 id="dashboard-stats" className={h3Classes}>{`Quick Stats`}</h3>
                  <p className={pClasses}>
                    {`Four tiles at the top of the dashboard show you the numbers that matter most right now.`}
                  </p>
                  <ul className={ulClasses}>
                    <li>{`Total Active Volunteers — everyone currently active in the system.`}</li>
                    <li>{`Upcoming Shows This Month — live shows with at least one date in the current calendar month.`}</li>
                    <li>{`Volunteers Needed — the total number of open slots across all live shows.`}</li>
                    <li>{`New Volunteers (7 Days) — people who signed up in the last seven days.`}</li>
                  </ul>
                </>
              )}

              {show('dashboard-season') && (
                <>
                  <h3 id="dashboard-season" className={h3Classes}>{`Season at a Glance`}</h3>
                  <p className={pClasses}>
                    {`Below Quick Stats, you'll see a staffing overview for the current season. Each show is listed with its roles. A green indicator means a role is fully filled. Yellow means it's partially filled. Red means no one has signed up yet.`}
                  </p>
                  <p className={pClasses}>
                    {`Super Admins can switch which season is displayed using the season selector at the top of this section. Editors and Viewers always see the currently pinned season.`}
                  </p>
                </>
              )}

              {show('dashboard-feed') && (
                <>
                  <h3 id="dashboard-feed" className={h3Classes}>{`Activity Feed`}</h3>
                  <p className={pClasses}>
                    {`The Activity Feed at the bottom of the dashboard shows you recent platform activity — new volunteer signups, slot claims, cancellations, and opportunity submissions. New items are highlighted so you can see what happened since your last visit.`}
                  </p>
                  <p className={pClasses}>
                    {`Click "Mark all as read" to clear the highlights. Click "Load more" to see older activity.`}
                  </p>
                  <Tip>
                    {`The Pending Hours and Pending Milestone Acknowledgments cards appear on the dashboard when action is needed. See `}
                    <a href="#hours" className="text-brand-primary underline dark:text-brand-primary-mid">
                      {`How Hours Work`}
                    </a>
                    {` and `}
                    <a href="#milestones" className="text-brand-primary underline dark:text-brand-primary-mid">
                      {`Milestones`}
                    </a>
                    {` for more detail.`}
                  </Tip>
                </>
              )}
            </section>
          )}

          {show('dashboard') && <Divider />}

          {/* ───────── Your Volunteers ───────── */}
          {show('volunteers') && (
            <section id="volunteers">
              <h2 className={h2Classes}>{`Your Volunteers`}</h2>

              {show('find-volunteer') && (
                <>
                  <h3 id="find-volunteer" className={h3Classes}>{`Finding a Volunteer`}</h3>
                  <p className={pClasses}>{`Click Volunteers in the left menu. You'll see a list of everyone in the system.`}</p>
                  <p className={pClasses}>
                    {`To find someone specific, type their name, email address, or phone number in the search box at the top.`}
                  </p>
                  <p className={pClasses}>
                    {`To narrow the list, use the filters on the left: category, age range, service hours requirement, and more. You can combine filters.`}
                  </p>
                </>
              )}

              {show('volunteer-profile') && (
                <>
                  <h3 id="volunteer-profile" className={h3Classes}>{`Reading a Volunteer's Profile`}</h3>
                  <p className={pClasses}>{`Click any volunteer's name to open their profile.`}</p>
                  <p className={pClasses}>{`Here's what you'll find:`}</p>
                  <p className={pClasses}>
                    <strong>{`Personal information`}</strong>
                    {` — their name, contact details, pronouns, school, and age range.`}
                  </p>
                  <p className={pClasses}>
                    <strong>{`Categories`}</strong>
                    {` — the volunteer roles they're interested in, like Ushers or Concessions.`}
                  </p>
                  <p className={pClasses}>
                    <strong>{`Total hours`}</strong>
                    {` — the total number of hours they've earned across all their calls. Hours are added automatically when you mark attendance.`}
                  </p>
                  <p className={pClasses}>
                    <strong>{`Call history`}</strong>
                    {` — every show they've volunteered for, with dates, roles, and attendance status.`}
                  </p>
                  <p className={pClasses}>
                    <strong>{`Milestones`}</strong>
                    {` — badges they've earned for reaching hour totals. First Call is awarded on their very first appearance. Then 10 hours, 20 hours, and so on.`}
                  </p>
                  <p className={pClasses}>
                    <strong>{`Editor Notes`}</strong>
                    {` — private notes that only Editors and Super Admins can see. Use this for scheduling preferences, personal history, anything important about this volunteer. Volunteers never see these notes.`}
                  </p>
                  <p className={pClasses}>
                    <strong>{`Communication history`}</strong>
                    {` — every email the platform has sent to this volunteer.`}
                  </p>
                  <Tip>
                    {`The SH badge next to a volunteer's name means they need service hours for school or an organization. Keep this in mind when assigning roles.`}
                  </Tip>
                </>
              )}

              {show('edit-volunteer') && (
                <>
                  <h3 id="edit-volunteer" className={h3Classes}>{`Editing a Volunteer's Information`}</h3>
                  <p className={pClasses}>{`Open the volunteer's profile and click the Edit button near the top of the page.`}</p>
                  <p className={pClasses}>{`Make your changes and click Save. The updates take effect immediately.`}</p>
                  <p className={pClasses}>
                    {`Note: email addresses are shown but cannot be edited here. If a volunteer's email has changed, contact your Super Admin.`}
                  </p>
                </>
              )}

              {show('archive-volunteer') && (
                <>
                  <h3 id="archive-volunteer" className={h3Classes}>{`Archiving a Volunteer`}</h3>
                  <p className={pClasses}>
                    {`Archiving removes a volunteer from your active lists but keeps all their history, hours, and records completely intact.`}
                  </p>
                  <p className={pClasses}>{`To archive: open their profile and click Archive. You'll be asked to confirm.`}</p>
                  <p className={pClasses}>{`To bring them back: open their profile and click Reactivate.`}</p>
                  <Warning>{`Archiving is reversible. No information is ever deleted.`}</Warning>
                  <p className={pClasses}>
                    {`Use archiving for volunteers who have moved away or are no longer available. Do not archive someone just because they missed a show.`}
                  </p>
                </>
              )}

              {show('volunteer-communication') && (
                <>
                  <h3 id="volunteer-communication" className={h3Classes}>{`Communication History`}</h3>
                  <p className={pClasses}>
                    {`The Communication History section on a volunteer's profile shows every email this platform has sent to them — confirmation emails, slot claim notices, milestone congratulations, and show messages.`}
                  </p>
                  <p className={pClasses}>{`Click the section heading to expand it.`}</p>
                  <p className={pClasses}>
                    {`Note: emails you send outside the platform (from your personal email or another system) won't appear here.`}
                  </p>
                </>
              )}
            </section>
          )}

          {show('volunteers') && <Divider />}

          {/* ───────── Shows ───────── */}
          {show('shows') && (
            <section id="shows">
              <h2 className={h2Classes}>{`Shows`}</h2>

              {show('show-status') && (
                <>
                  <h3 id="show-status" className={h3Classes}>{`Understanding Show Statuses`}</h3>
                  <p className={pClasses}>{`Every show has one of four statuses:`}</p>
                  <p className={pClasses}>
                    <strong>{`Draft`}</strong>
                    {` — only visible to Production Crew. Volunteers cannot see it or sign up yet. Use this while you're still setting things up.`}
                  </p>
                  <p className={pClasses}>
                    <strong>{`Live`}</strong>
                    {` — visible to volunteers on the public signup page. Volunteers can sign up right now.`}
                  </p>
                  <p className={pClasses}>
                    <strong>{`Past`}</strong>
                    {` — the show is over. You can mark attendance for past shows.`}
                  </p>
                  <p className={pClasses}>
                    <strong>{`Archived`}</strong>
                    {` — hidden from everything. Use this for canceled shows you want to keep on record.`}
                  </p>
                  <Tip>{`You can change a show's status at any time from the show's Settings tab.`}</Tip>
                </>
              )}

              {show('create-show') && (
                <>
                  <h3 id="create-show" className={h3Classes}>{`Creating a Show`}</h3>
                  <p className={pClasses}>{`Click Shows in the left menu, then click New Show.`}</p>
                  <p className={pClasses}>{`Fill in:`}</p>
                  <ul className={ulClasses}>
                    <li>{`Show name (like "South Pacific" or "Studio X: Holiday Showcase")`}</li>
                    <li>{`Location — choose where this show will be performed`}</li>
                    <li>{`Season (select an existing season or type a new one — it will be created automatically)`}</li>
                  </ul>
                  <p className={pClasses}>
                    <strong>{`Location`}</strong>
                    {` — the list comes from your active locations, the same locations that appear on the master calendar. Your Super Admin manages this list in Settings.`}
                  </p>
                  <p className={pClasses}>
                    {`Add your performance dates. For each date, add the volunteer roles you need and how many slots each role has. For example: Ushers (6 slots), Concessions (4 slots).`}
                  </p>
                  <Tip>
                    {`If your show has multiple dates with the same roles, use the "Copy roles from previous date" button. It copies the role setup from the date above and saves you from entering it again.`}
                  </Tip>
                  <p className={pClasses}>
                    {`Add volunteer instructions if needed — parking info, dress code, where to check in. These appear in the confirmation email every volunteer receives when they sign up.`}
                  </p>
                  <p className={pClasses}>
                    {`Default volunteer hours are set per location. You can change the hours for any individual show date if needed.`}
                  </p>
                  <p className={pClasses}>
                    {`When you're ready, click Publish to make the show live, or Save as Draft to save without publishing.`}
                  </p>
                </>
              )}

              {show('publish-show') && (
                <>
                  <h3 id="publish-show" className={h3Classes}>{`Publishing a Show`}</h3>
                  <p className={pClasses}>{`Publishing makes a show visible to volunteers immediately. They can start signing up right away.`}</p>
                  <p className={pClasses}>
                    {`When you publish for the first time, you'll see an option to send a notification email. This email goes to all volunteers whose interests match the roles in your show. Check the box to send it.`}
                  </p>
                  <Tip>
                    {`If you publish quietly (without sending notifications), you can always send them later from the show's Overview tab using the Send Notifications button.`}
                  </Tip>
                </>
              )}

              {show('show-volunteers') && (
                <>
                  <h3 id="show-volunteers" className={h3Classes}>{`Managing Who's Signed Up`}</h3>
                  <p className={pClasses}>{`Click a show's name to open its detail page, then click the Volunteers tab.`}</p>
                  <p className={pClasses}>{`Use the date dropdown at the top to switch between performance dates. Each date shows its own roster.`}</p>
                  <p className={pClasses}>{`You'll see each volunteer's name, contact information, and attendance status.`}</p>
                </>
              )}

              {show('show-email') && (
                <>
                  <h3 id="show-email" className={h3Classes}>{`Messaging Volunteers for a Show`}</h3>
                  <p className={pClasses}>
                    {`From any show's Overview tab, click the Message Volunteers button. The button shows how many volunteers will receive the message.`}
                  </p>
                  <p className={pClasses}>
                    {`Write your subject line and message, then click Send. The message goes to everyone currently signed up for this show. Waitlisted volunteers do not receive it.`}
                  </p>
                  <p className={pClasses}>
                    {`Use this for parking reminders, costume requirements, schedule changes, or anything the whole group needs to know.`}
                  </p>
                </>
              )}

              {show('waitlist') && (
                <>
                  <h3 id="waitlist" className={h3Classes}>{`The Waitlist`}</h3>
                  <p className={pClasses}>
                    {`When all slots for a role are filled, new volunteers are added to the waitlist automatically. They receive a confirmation email letting them know they're on the waitlist.`}
                  </p>
                  <p className={pClasses}>
                    {`If a signed-up volunteer cancels, the first person on the waitlist is moved up automatically. They receive a new confirmation email with the full details.`}
                  </p>
                  <p className={pClasses}>{`You can see the current waitlist from the show's Waitlist tab.`}</p>
                </>
              )}

              {show('post-show-report') && (
                <>
                  <h3 id="post-show-report" className={h3Classes}>{`Post-Show Report`}</h3>
                  <p className={pClasses}>{`After a show is marked Past, a Report tab appears on the show's detail page.`}</p>
                  <p className={pClasses}>
                    {`The report shows the total number of volunteer appearances, how many showed up, how many were no-shows, how many were excused, total hours logged, and the attendance rate. It breaks these numbers down by date so you can see how each performance night went.`}
                  </p>
                </>
              )}
            </section>
          )}

          {show('shows') && <Divider />}

          {/* ───────── Attendance and Hours ───────── */}
          {show('attendance') && (
            <section id="attendance">
              <h2 className={h2Classes}>{`Attendance and Hours`}</h2>

              {show('mark-attendance') && (
                <>
                  <h3 id="mark-attendance" className={h3Classes}>{`Marking Attendance`}</h3>
                  <p className={pClasses}>{`You can only mark attendance after a show date has passed. The system enforces this automatically.`}</p>
                  <p className={pClasses}>{`To mark attendance:`}</p>
                  <ol className={olClasses}>
                    <li>{`Open the show and click the Volunteers tab.`}</li>
                    <li>{`Select the show date from the dropdown.`}</li>
                    <li>{`For each volunteer, click Showed, No-Show, or Excused.`}</li>
                  </ol>
                  <p className={pClasses}>
                    {`The Mark All Showed button marks everyone on the roster as Showed at once. Use this when nearly everyone showed up, then adjust the exceptions individually.`}
                  </p>
                  <p className={pClasses}>{`Hours are added to each volunteer's total automatically when you mark them as Showed.`}</p>
                </>
              )}

              {show('hours') && (
                <>
                  <h3 id="hours" className={h3Classes}>{`How Hours Work`}</h3>
                  <p className={pClasses}>
                    {`When you mark a volunteer as Showed, the system logs hours for them automatically. The number of hours is based on the show's Default Hours setting.`}
                  </p>
                  <p className={pClasses}>
                    {`After you mark attendance, you'll see a Pending Hours Review card on your dashboard. This is your chance to confirm or adjust the hours before they become final.`}
                  </p>
                  <p className={pClasses}>{`To confirm hours: click the checkmark next to each volunteer's name. To adjust: change the number and then click confirm.`}</p>
                  <Tip>
                    {`You can also add hours manually to a volunteer's record for work done outside a show — like helping with set build or administrative work. Open their profile, click the Hours tab, and click Add Manual Hours. You'll need to include a note describing the work.`}
                  </Tip>
                </>
              )}

              {show('milestones') && (
                <>
                  <h3 id="milestones" className={h3Classes}>{`Milestones`}</h3>
                  <p className={pClasses}>
                    {`Volunteers earn milestones as they accumulate hours. The milestones are: First Call (their very first appearance), 10 hours, 20 hours, 35 hours, 50 hours, 75 hours, 100 hours, and every 25 hours thereafter.`}
                  </p>
                  <p className={pClasses}>{`When a volunteer hits a milestone, they receive a congratulations email automatically.`}</p>
                  <p className={pClasses}>
                    {`You'll also see a Pending Milestone Acknowledgments card on your dashboard. This is your reminder to reach out personally and celebrate their achievement. Click Mark Acknowledged after you've done that.`}
                  </p>
                </>
              )}
            </section>
          )}

          {show('attendance') && <Divider />}

          {/* ───────── The Volunteer Signup Form ───────── */}
          {show('signup-form') && (
            <section id="signup-form">
              <h2 className={h2Classes}>{`The Volunteer Signup Form`}</h2>

              {show('what-volunteers-see') && (
                <>
                  <h3 id="what-volunteers-see" className={h3Classes}>{`What Volunteers See`}</h3>
                  <p className={pClasses}>{`The public volunteer signup page is the first thing new volunteers see. It's available at your platform's web address.`}</p>
                  <p className={pClasses}>
                    {`Volunteers fill in their name, email address, and phone number. They can also choose their volunteer interests (like Ushers or Backstage Crew) and answer a few optional questions.`}
                  </p>
                  <p className={pClasses}>
                    {`Every volunteer receives a confirmation email after signing up. That email includes a personal link they can use anytime to update their information.`}
                  </p>
                </>
              )}

              {show('announcement-banner') && (
                <>
                  <h3 id="announcement-banner" className={h3Classes}>{`Announcement Banner`}</h3>
                  <p className={pClasses}>
                    {`The announcement banner is a colored bar that appears at the top of the volunteer signup page. Use it to share urgent news, upcoming events, or anything you want every visitor to see.`}
                  </p>
                  <p className={pClasses}>{`To manage it: go to Settings in the left menu, then click Announcement Banner.`}</p>
                  <p className={pClasses}>{`Turn the banner on or off with the toggle. Type your message in the text box. Click Save.`}</p>
                  <p className={pClasses}>{`The banner appears or disappears on the public page immediately — no delay.`}</p>
                  <Tip>
                    {`Keep banner messages short and specific. "Volunteer sign-ups open for South Pacific — auditions Friday!" works better than a paragraph.`}
                  </Tip>
                </>
              )}

              {show('form-settings') && (
                <>
                  <h3 id="form-settings" className={h3Classes}>{`Form Field Settings`}</h3>
                  <p className={pClasses}>{`You can turn the School field and the Age Range field on or off on the volunteer signup form.`}</p>
                  <p className={pClasses}>{`Go to Settings, then click Signup Form.`}</p>
                  <p className={pClasses}>{`Toggle each field on or off and click Save. Changes take effect immediately.`}</p>
                </>
              )}
            </section>
          )}

          {show('signup-form') && <Divider />}

          {/* ───────── Settings ───────── */}
          {show('settings') && (
            <section id="settings">
              <h2 className={h2Classes}>{`Settings`}</h2>

              {show('hearing-options') && (
                <>
                  <h3 id="hearing-options" className={h3Classes}>{`Hearing Options`}</h3>
                  <p className={pClasses}>{`The "How did you hear about us?" dropdown on the volunteer signup form is fully customizable.`}</p>
                  <p className={pClasses}>{`Go to Settings, then click Hearing Options.`}</p>
                  <p className={pClasses}>{`From there you can:`}</p>
                  <ul className={ulClasses}>
                    <li>{`Add a new option`}</li>
                    <li>{`Rename an existing option`}</li>
                    <li>{`Change the order options appear in`}</li>
                    <li>{`Hide an option (it won't appear on new signups, but existing records that used it are unchanged)`}</li>
                  </ul>
                </>
              )}

              {show('default-hours') && (
                <>
                  <h3 id="default-hours" className={h3Classes}>{`Default Volunteer Hours`}</h3>
                  <p className={pClasses}>
                    {`Every location can have its own default hours. Your Super Admin sets these in Location Management under Settings. When a location has no default set, the system falls back to one of three general buckets: Mainstage, Studio X, or One-Off — also set in Settings.`}
                  </p>
                  <p className={pClasses}>
                    {`You can always override hours for any individual show date when you create or edit a show.`}
                  </p>
                  <Warning>{`Changing the default hours in Settings does not update hours for show dates that already exist. It only affects new show dates going forward.`}</Warning>
                </>
              )}

              {show('reply-to') && (
                <>
                  <h3 id="reply-to" className={h3Classes}>{`Reply-To Email Address`}</h3>
                  <p className={pClasses}>{`When a volunteer hits Reply on a platform email, their message goes to the Reply-To address.`}</p>
                  <p className={pClasses}>{`The default is your organization's contact email.`}</p>
                  <p className={pClasses}>{`To change it: go to Settings, then General Defaults.`}</p>
                </>
              )}

              {show('categories') && (
                <>
                  <h3 id="categories" className={h3Classes}>{`Volunteer Categories`}</h3>
                  <p className={pClasses}>
                    {`Categories are the volunteer interest areas that appear on the signup form — things like Ushers, Concessions, or Backstage Crew.`}
                  </p>
                  <p className={pClasses}>{`Go to Settings, then Category Management to add, rename, reorder, or hide categories.`}</p>
                  <Warning>{`Only Super Admins can manage categories.`}</Warning>
                  <p className={pClasses}>
                    {`Hiding a category removes it from the signup form but does not affect any existing volunteer records that already have that category.`}
                  </p>
                </>
              )}

              {show('user-accounts') && (
                <>
                  <h3 id="user-accounts" className={h3Classes}>{`Production Crew Accounts`}</h3>
                  <p className={pClasses}>{`Production Crew has four account types:`}</p>
                  <ul className={ulClasses}>
                    <li>
                      <strong>{`Super Admin`}</strong>
                      {` — full access to everything. Manages accounts, settings, and all platform content.`}
                    </li>
                    <li>
                      <strong>{`Editor`}</strong>
                      {` — can create and edit shows, volunteers, forms, and send emails. Cannot access Settings or manage other accounts.`}
                    </li>
                    <li>
                      <strong>{`Viewer`}</strong>
                      {` — read-only access to volunteers, shows, and forms. Cannot make any changes.`}
                    </li>
                    <li>
                      <strong>{`Production`}</strong>
                      {` — calendar access only. Designed for directors and stage managers who need to submit and view rehearsal schedules but do not manage volunteers. Cannot access any other part of Production Crew.`}
                    </li>
                  </ul>
                  <p className={pClasses}>
                    {`Super Admins can also grant any Editor or Viewer account direct calendar write access using the Calendar Editor toggle on their account. By default, Editors and Viewers submit calendar events for Super Admin approval. With Calendar Editor turned on, their events are approved immediately.`}
                  </p>
                  <Tip>
                    {`To add a new account, go to Settings then User Management. New users can also request access from the login page — a Super Admin must approve the request before they can log in.`}
                  </Tip>
                </>
              )}

              <h3 id="audit-log" className={h3Classes}>{`Audit Log`}</h3>
              <p className={pClasses}>
                {`The Audit Log keeps a permanent record of every action taken in Production Crew — who did it, what changed, and when. Use it to track edits, spot mistakes, and review account activity.`}
              </p>
              <p className={pClasses}>
                {`Every row shows the action type, the admin who performed it, and the date and time. Click any row to expand it and see the before-and-after values for that change.`}
              </p>
              <p className={pClasses}>
                {`Use the filters at the top to narrow results by action type or date range. The log is read-only — nothing in it can be edited or deleted.`}
              </p>
              <Tip>
                {`If something on the platform looks wrong and you aren't sure what happened, the Audit Log is the first place to check.`}
              </Tip>

              <h3 id="location-management" className={h3Classes}>{`Location Management`}</h3>
              <p className={pClasses}>
                {`Locations are the spaces your theater uses for performances, rehearsals, and other events. They appear on the master calendar as color-coded entries and drive how default volunteer hours are calculated for shows.`}
              </p>
              <p className={pClasses}>
                {`You can add a new location, give it a display color, and set a default number of volunteer hours for events in that space. You can also rename, reorder, or deactivate locations at any time. Deactivated locations are hidden from new events but existing calendar entries are not affected.`}
              </p>
              <Tip>
                {`The color you assign to a location appears on the master calendar and in the location legend. Choose colors that are easy to tell apart at a glance.`}
              </Tip>

              <h3 id="email-activity-log" className={h3Classes}>{`Email Activity Log`}</h3>
              <p className={pClasses}>
                {`The Email Activity Log shows every email the platform has sent — automatic system emails and emails you sent manually. Use it to confirm that a message went out, check who received it, and see a preview of what it said.`}
              </p>
              <p className={pClasses}>
                {`The log has three tabs. All Emails shows everything. System Only shows automatic emails like slot confirmations, reminders, and milestone notifications. About System Emails explains what each automatic email is and when it fires.`}
              </p>
              <Tip>
                {`If a volunteer says they never got a confirmation email, check the Email Activity Log first. You can see exactly what was sent and when.`}
              </Tip>

              <h3 id="document-types" className={h3Classes}>{`Document Types`}</h3>
              <p className={pClasses}>
                {`Document Types define the categories of documents your organization distributes through the platform. Go to Settings, then Document Management to manage them.`}
              </p>
              <p className={pClasses}>
                {`The platform comes with five built-in types: Volunteer Consent Form, Cast / Auditioner Consent Form, Volunteer Handbook, Production Schedule, and Audition Materials. The two consent form types are system types — you can deactivate them but not delete them.`}
              </p>
              <p className={pClasses}>
                {`Each document type can have one active document assigned to it. When a volunteer signs up as a minor, the system automatically emails them the active Volunteer Consent Form. If no active document is set, the email tells them their coordinator will provide the form.`}
              </p>
              <Tip>
                {`Add your own document types for anything else you regularly share — show programs, audition sides, cast lists. Keep the name short and clear.`}
              </Tip>

              <h3 id="consent-forms" className={h3Classes}>{`Consent Form Submissions`}</h3>
              <p className={pClasses}>
                {`When a volunteer signs up and marks their age as under 18, the platform automatically sends them an email with a link to upload a signed consent form. You review those submissions here.`}
              </p>
              <p className={pClasses}>
                {`The Consent Form Submissions queue has three tabs: Pending, Approved, and Rejected. Pending means a form has been received and is waiting for your review. Click Approve to accept it or Reject to decline it — you can add a note when rejecting.`}
              </p>
              <Tip>
                {`A submission appears here as soon as the volunteer uploads the file. You do not need to follow up with them — the platform handles the collection automatically.`}
              </Tip>
            </section>
          )}

          {show('settings') && <Divider />}

          {/* ───────── Master Calendar ───────── */}
          {show('calendar') && (
            <section id="calendar">
              <h2 className={h2Classes}>{`Master Calendar`}</h2>
              <p className={pClasses}>
                {`The master calendar shows everything happening in your spaces — performances, rehearsals, meetings, rentals, and more. All roles can view the calendar. What you can do on it depends on your account type.`}
              </p>

              {show('calendar-overview') && (
                <>
                  <h3 id="calendar-overview" className={h3Classes}>{`Calendar Overview`}</h3>
                  <p className={pClasses}>
                    {`The calendar has three views. Switch between them using the buttons at the top.`}
                  </p>
                  <ul className={ulClasses}>
                    <li>{`Month view — a traditional calendar grid. Click any day to see its full event list.`}</li>
                    <li>{`Week view — a room-booking grid showing all locations side by side. Events appear as color-coded blocks. On a phone, this view switches to a simple list.`}</li>
                    <li>{`Agenda view — a chronological list of upcoming events over the next 90 days.`}</li>
                  </ul>
                  <p className={pClasses}>
                    {`Each location has its own color. The color legend below the filter bar shows you which color belongs to which space. Use the filters to narrow what you see by location, event type, or season.`}
                  </p>
                  <p className={pClasses}>
                    {`Click any event to open the day panel. The day panel shows all events for that day and the available time windows for each location.`}
                  </p>
                </>
              )}

              {show('calendar-submit') && (
                <>
                  <h3 id="calendar-submit" className={h3Classes}>{`Submitting an Event`}</h3>
                  <p className={pClasses}>
                    {`To add an event to the calendar, click the "Submit Request" button at the top right and choose Single Event, Rehearsal Schedule, or Recurring Event.`}
                  </p>
                  <p className={pClasses}>
                    {`Fill in the event details. Location is labeled "Preferred Location" — it's a request, not a guaranteed booking. A Super Admin will review your submission and assign a location before approving it.`}
                  </p>
                  <p className={pClasses}>
                    {`Once submitted, your event goes to the pending queue. You'll see it on the calendar as pending until a Super Admin approves it.`}
                  </p>
                  <Tip>
                    {`Performance events are added to the calendar automatically when you create a show. You do not need to add them manually.`}
                  </Tip>
                </>
              )}

              {show('calendar-direct-create') && (
                <>
                  <h3 id="calendar-direct-create" className={h3Classes}>{`Direct Event Creation`}</h3>
                  <p className={pClasses}>
                    {`Super Admins and anyone with direct calendar access can create events that are approved immediately — no pending queue. The button at the top right says "Add Event" instead of "Submit Request" when you have this access.`}
                  </p>
                  <p className={pClasses}>
                    {`When creating an event directly, you can check for scheduling conflicts before saving. If a conflict is found, you can choose to override it or pick a different time.`}
                  </p>
                  <Tip>
                    {`If your button says "Submit Request" and you need direct access, ask your Super Admin to turn on the Calendar Editor toggle for your account.`}
                  </Tip>
                </>
              )}

              {show('calendar-bulk-rehearsal') && (
                <>
                  <h3 id="calendar-bulk-rehearsal" className={h3Classes}>{`Bulk Rehearsal Schedules`}</h3>
                  <p className={pClasses}>
                    {`Use the Rehearsal Schedule option to submit multiple rehearsal dates at once. This is faster than adding them one at a time.`}
                  </p>
                  <p className={pClasses}>
                    {`Add each date and time you need. You can add a preferred location and contact information for each date. When you're done, submit the whole batch in one step.`}
                  </p>
                  <p className={pClasses}>
                    {`Each date in the batch goes through the same review process as a single event. A Super Admin can approve or skip individual dates in the batch.`}
                  </p>
                </>
              )}

              {show('calendar-recurring') && (
                <>
                  <h3 id="calendar-recurring" className={h3Classes}>{`Recurring Events`}</h3>
                  <p className={pClasses}>
                    {`Use Recurring Event to create a series of events that repeat on a regular schedule — weekly, every two weeks, or monthly.`}
                  </p>
                  <p className={pClasses}>
                    {`Set a start date, an end date (optional), and a frequency. The calendar will show you a preview of how many events will be created before you submit.`}
                  </p>
                  <p className={pClasses}>
                    {`Recurring events show a "↻" symbol on the calendar so you can tell them apart from one-time events.`}
                  </p>
                  <p className={pClasses}>
                    {`When you edit or cancel a recurring event, you'll be asked which events to affect.`}
                  </p>
                  <ul className={ulClasses}>
                    <li>{`Only this occurrence — changes just the one event you clicked.`}</li>
                    <li>{`This and all future occurrences — changes this event and everything after it in the series.`}</li>
                    <li>{`All occurrences — changes every event in the series.`}</li>
                  </ul>
                </>
              )}

              {show('calendar-pending') && (
                <>
                  <h3 id="calendar-pending" className={h3Classes}>{`Pending Approval Queue`}</h3>
                  <p className={pClasses}>
                    {`When someone submits an event for approval, it appears in the pending queue. You'll see a badge on the Pending Requests link at the top of the calendar showing how many are waiting.`}
                  </p>
                  <p className={pClasses}>
                    {`The queue is organized into three sections: Rehearsal Batches, Recurring Events, and Individual Requests. Each row shows the event details, a conflict indicator, and a location selector.`}
                  </p>
                  <p className={pClasses}>
                    {`Assign a location and click Approve to add the event to the calendar. If a date has a scheduling conflict, the Approve button is disabled until you choose a different location or resolve the conflict. Use "Approve All Available" to approve every non-conflicted event in a batch at once.`}
                  </p>
                </>
              )}

              {show('calendar-book-space') && (
                <>
                  <h3 id="calendar-book-space" className={h3Classes}>{`Book Space`}</h3>
                  <p className={pClasses}>
                    {`The Book Space tool helps you find an open time slot before creating an event. Click "Book Space" at the top of the calendar to open the panel.`}
                  </p>
                  <p className={pClasses}>
                    {`Enter a date and time range. The panel will show you which locations are available during that window. Click "Book This Slot" next to any available location to open the event form with that date, time, and location already filled in.`}
                  </p>
                  <Tip>
                    {`Book Space is only available to Super Admins and admins with direct calendar access. If you don't see the Book Space button, ask your Super Admin about getting direct calendar access.`}
                  </Tip>
                </>
              )}

              {show('calendar-export') && (
                <>
                  <h3 id="calendar-export" className={h3Classes}>{`Calendar Export & Subscription`}</h3>
                  <p className={pClasses}>
                    {`Click the Export button at the top of the calendar to open the export panel. You have two options.`}
                  </p>
                  <ul className={ulClasses}>
                    <li>{`Subscribe — copy the subscription URL and add it to Google Calendar, Apple Calendar, or Outlook. Your calendar app will stay in sync automatically as events are added or changed.`}</li>
                    <li>{`Download — download a snapshot of the calendar as an .ics file.`}</li>
                  </ul>
                  <Warning>
                    {`Your subscription URL is unique to your account. Do not share it with others. If you think someone else has your URL, click "Rotate subscription URL" to generate a new one. The old URL will stop working immediately.`}
                  </Warning>
                </>
              )}

              {show('calendar-public') && (
                <>
                  <h3 id="calendar-public" className={h3Classes}>{`The Public Calendar`}</h3>
                  <p className={pClasses}>
                    {`There is a public-facing calendar at /calendar that anyone can view without logging in. It shows approved performance events only — not rehearsals, meetings, or other internal events.`}
                  </p>
                  <p className={pClasses}>
                    {`Shows with open volunteer slots display an orange dot so visitors know where help is needed. Clicking a show opens a summary with a link to sign up.`}
                  </p>
                  <Tip>
                    {`The public calendar is linked from your volunteer signup page and the Call Board. Volunteers can use it to plan ahead.`}
                  </Tip>
                </>
              )}
            </section>
          )}

          {show('calendar') && <Divider />}

          {/* ───────── Communication ───────── */}
          {show('communication') && (
            <section id="communication">
              <h2 className={h2Classes}>{`Communication`}</h2>
              <p className={pClasses}>
                {`The Communication page lets you send an email to your volunteers directly from Production Crew — no need to use a separate email tool.`}
              </p>

              {show('blast-compose') && (
                <>
                  <h3 id="blast-compose" className={h3Classes}>{`Sending an Email Blast`}</h3>
                  <p className={pClasses}>
                    {`Go to Communication in the sidebar to open the email composer. Choose who should receive the email.`}
                  </p>
                  <ul className={ulClasses}>
                    <li>{`All Volunteers — sends to every active volunteer in the system.`}</li>
                    <li>{`By Category — sends to volunteers in one or more selected categories.`}</li>
                    <li>{`Individual — search for specific volunteers by name or email and add them to the recipient list.`}</li>
                  </ul>
                  <p className={pClasses}>
                    {`Write your subject and message. The editor supports bold, italic, underline, headings, lists, and links. When you're ready, click "Preview & Send" to see how many people will receive the email before you confirm.`}
                  </p>
                  <p className={pClasses}>
                    {`The Reply-To field controls where replies go. It is pre-filled with your default reply-to address from Settings.`}
                  </p>
                  <Tip>
                    {`This tool sends to your full volunteer list or a filtered group. To message only the volunteers signed up for a specific show, use "Message Volunteers" on the show detail page instead.`}
                  </Tip>
                  <p className={pClasses}>
                    {`Every email blast is logged in the Email Activity Log under Settings so you always have a record of what was sent and who received it.`}
                  </p>
                </>
              )}
            </section>
          )}

          {show('communication') && <Divider />}

          {/* ───────── Check-In System ───────── */}
          {show('check-in') && (
            <section id="check-in">
              <h2 className={h2Classes}>{`Check-In System`}</h2>
              <p className={pClasses}>
                {`The check-in system lets volunteers scan a QR code to mark themselves present at a show. No app download required — it works in any phone browser.`}
              </p>

              {show('check-in-qr') && (
                <>
                  <h3 id="check-in-qr" className={h3Classes}>{`Check-In QR Codes`}</h3>
                  <p className={pClasses}>
                    {`Each show and each show date has its own QR code. You can find them on the show detail page — click into any show, then go to the Dates tab.`}
                  </p>
                  <p className={pClasses}>
                    {`At the top of the Dates tab you'll see a whole-show QR code. This is the one to use when you only have one upcoming date — it automatically sends the volunteer to check in for the next upcoming date. Each date row also has its own QR code for that specific date.`}
                  </p>
                  <p className={pClasses}>
                    {`Download the QR as a PNG to print it, or as an SVG for digital use. Print it and post it at the door, or display it on a tablet. QR containers are always white so the code scans correctly in any lighting.`}
                  </p>
                  <Tip>
                    {`For a single-date show, use the whole-show QR. For a run with multiple dates, use the per-date QR at each performance so check-ins are attributed to the correct date.`}
                  </Tip>
                  <p className={pClasses}>
                    {`When a volunteer scans the QR, they'll see a simple check-in form. They enter their email or phone number. If they're on the roster for that date, the system marks them as present. If they're not on the roster, they can fill out a quick walk-in form to sign up on the spot.`}
                  </p>
                </>
              )}

              {show('check-in-dashboard') && (
                <>
                  <h3 id="check-in-dashboard" className={h3Classes}>{`Live Check-In Dashboard`}</h3>
                  <p className={pClasses}>
                    {`Go to Check-In in the sidebar to open the live check-in dashboard. It shows every rostered volunteer for your next upcoming show, grouped by role, with their current check-in status.`}
                  </p>
                  <p className={pClasses}>
                    {`Status indicators: a green checkmark with "QR" means the volunteer checked themselves in. A green checkmark with "Admin" means you or an Editor marked them. A dash means they haven't checked in yet. Red means no-show, amber means excused.`}
                  </p>
                  <p className={pClasses}>
                    {`The dashboard refreshes automatically every 10 seconds. The "Last updated" line at the top tells you exactly how recently the data was updated.`}
                  </p>
                  <p className={pClasses}>
                    {`If you have multiple upcoming dates, use the date selector to switch between them. Other shows with upcoming dates appear in a collapsible list below the main roster.`}
                  </p>
                  <Tip>
                    {`Set up a tablet at the door showing the check-in dashboard. As volunteers scan the QR on their phones, you can watch them appear on the dashboard in real time.`}
                  </Tip>
                </>
              )}
            </section>
          )}

          {show('check-in') && <Divider />}

          {/* ───────── Media Library ───────── */}
          {show('media-library') && (
            <section id="media-library">
              <h2 className={h2Classes}>{`Media Library`}</h2>
              <p className={pClasses}>
                {`The Media Library at /crew/media is where you store and share documents, videos, links, and other files with your team. Anyone with a Production Crew login can view the library.`}
              </p>
              <p className={pClasses}>
                {`Files are organized into folders. Click a folder in the left panel to see its contents. Each document or link appears as a row with its title, type, and action buttons.`}
              </p>

              {show('media-library-upload') && (
                <>
                  <h3 id="media-library-upload" className={h3Classes}>{`Uploading Files and Links`}</h3>
                  <p className={pClasses}>
                    {`To upload a file, click Upload File in the current folder. Select a PDF, image, video, or audio file. A progress bar shows the upload status. The file goes directly to secure storage — it does not pass through the server.`}
                  </p>
                  <p className={pClasses}>
                    {`To add a YouTube video, Vimeo video, or any external link, click Add Link instead. Paste the URL and give it a title. YouTube and Vimeo links open a built-in player when someone views them.`}
                  </p>
                  <Tip>
                    {`You can upload PDFs, images (JPG, PNG), videos (MP4), and audio files (MP3). For large video files, add a YouTube or Vimeo link instead of uploading directly.`}
                  </Tip>
                </>
              )}

              {show('media-library-access') && (
                <>
                  <h3 id="media-library-access" className={h3Classes}>{`Sharing and Access`}</h3>
                  <p className={pClasses}>
                    {`Each document has an access level. Public means anyone with the link can view it — no login required. Link Only means the same, but the file won't appear in any public directory. Backend means only logged-in Production Crew members can access it.`}
                  </p>
                  <p className={pClasses}>
                    {`To share a document, click Copy Link on any row. The link routes through the platform — the platform checks the access level before showing the file. You can also download a QR code for the link.`}
                  </p>
                  <p className={pClasses}>
                    {`Videos and audio files open in a built-in player page. PDFs and images also display inline — no download required.`}
                  </p>
                  <Warning>
                    {`If you set a document to Public, anyone with the link can view it without logging in. Use Public only for content you're comfortable sharing openly.`}
                  </Warning>
                </>
              )}
            </section>
          )}

          {show('media-library') && <Divider />}

          {/* ───────── The Volunteer Call Board ───────── */}
          {show('callboard') && (
            <section id="callboard">
              <h2 className={h2Classes}>{`The Volunteer Call Board`}</h2>
              <p className={pClasses}>
                {`The Volunteer Call Board is the page volunteers use after they've signed up. They can find it at your platform URL followed by /callboard.`}
              </p>
              <p className={pClasses}>{`On the Call Board, volunteers can:`}</p>
              <ul className={ulClasses}>
                <li>{`See all upcoming shows and sign up for them`}</li>
                <li>{`Enter their email or phone number to find their personal record`}</li>
                <li>{`View their hours, milestones, and call history`}</li>
                <li>{`Click "Edit my info" to update their contact information and interests`}</li>
              </ul>
              <Tip>
                {`Send returning volunteers to the Call Board, not the main signup page. The Call Board is their home base once they're already in the system.`}
              </Tip>
            </section>
          )}

          {show('callboard') && <Divider />}

          {/* ───────── Standing Opportunities ───────── */}
          {show('opportunities') && (
            <section id="opportunities">
              <h2 className={h2Classes}>{`Standing Opportunities`}</h2>
              <p className={pClasses}>
                {`Standing Opportunities are volunteer roles that aren't tied to a specific show — things like internship positions, long-term roles, or general interest areas.`}
              </p>
              <p className={pClasses}>{`They appear on the volunteer signup page alongside upcoming shows.`}</p>
              <p className={pClasses}>{`To manage them: click Shows in the left menu, then click the Standing Opportunities link.`}</p>
              <p className={pClasses}>{`Two types are available:`}</p>
              <p className={pClasses}>
                <strong>{`Expression of Interest`}</strong>
                {` — volunteers raise their hand and you follow up with them personally. No cap.`}
              </p>
              <p className={pClasses}>
                <strong>{`Slot Claim`}</strong>
                {` — works like a show role, with a maximum number of slots. When it's full, no more submissions are accepted.`}
              </p>
            </section>
          )}

          {show('opportunities') && <Divider />}

          {/* ───────── Getting Help ───────── */}
          {show('getting-help') && (
            <section id="getting-help">
              <h2 className={h2Classes}>{`Getting Help`}</h2>
              <p className={pClasses}>{`For technical questions or anything not covered here, contact Jonathan Sturcken.`}</p>
              <Tip>
                {`Most questions can be answered by exploring the page in question. Nothing in Production Crew can be accidentally broken beyond repair, and nothing is permanently deleted (only archived).`}
              </Tip>
            </section>
          )}

          {show('getting-help') && <Divider />}

          {/* ───────── Rehearsals ───────── */}
          {show('rehearsals') && (
            <section id="rehearsals">
              <h2 className={h2Classes}>{`Rehearsals`}</h2>
              <p className={pClasses}>
                {`Rehearsal Management lets you schedule rehearsal dates, assign your team, and track who showed up.`}
              </p>

              {show('rehearsals-schedules') && (
                <>
                  <h3 id="rehearsals-schedules" className={h3Classes}>{`Understanding Schedules`}</h3>
                  <p className={pClasses}>
                    {`A rehearsal schedule is a named batch of dates for one production. Create one using the "New Schedule" button on the Rehearsals page.`}
                  </p>
                  <p className={pClasses}>{`Dates go through the same approval queue as other calendar events.`}</p>
                  <p className={pClasses}>{`Production users see only the schedules they are assigned to.`}</p>
                </>
              )}

              {show('rehearsals-assignments') && (
                <>
                  <h3 id="rehearsals-assignments" className={h3Classes}>{`Managing Assignments`}</h3>
                  <p className={pClasses}>
                    {`Every schedule has a default roster — the people expected at every date. Use the Roster tab to add or remove people from the default roster.`}
                  </p>
                  <p className={pClasses}>
                    {`Individual dates can override the default. Exclude someone from one date, or add someone for one date only. Use the Dates tab for per-date changes.`}
                  </p>
                  <Tip>
                    {`Overrides affect only the specific date. The default roster stays the same. For example: your lighting designer is only needed the final two weeks. Add them to just those dates using the Dates tab.`}
                  </Tip>
                </>
              )}

              {show('rehearsals-attendance') && (
                <>
                  <h3 id="rehearsals-attendance" className={h3Classes}>{`Recording Attendance`}</h3>
                  <p className={pClasses}>
                    {`Open any date on the Attendance tab to mark who showed up. Three options: Showed, No-Show, or Excused.`}
                  </p>
                  <p className={pClasses}>{`Editors and above can mark anyone. Production users can mark their own attendance.`}</p>
                  <p className={pClasses}>
                    {`Use "Mark All Present" to mark the full roster as showed in one step. You can change a mark at any time.`}
                  </p>
                </>
              )}

              {show('rehearsals-checkin') && (
                <>
                  <h3 id="rehearsals-checkin" className={h3Classes}>{`The Check-In QR Code`}</h3>
                  <p className={pClasses}>
                    {`Each rehearsal date has a QR code on the Dates tab. Team members scan it on their phone to check themselves in. No login required.`}
                  </p>
                  <p className={pClasses}>{`They select their name from a list and tap Check In. Their attendance is recorded automatically.`}</p>
                  <Tip>
                    {`The QR links to a public page. Share it with your team, but treat it like a door code. `}
                    {`Don't`}
                    {` post it publicly.`}
                  </Tip>
                </>
              )}
            </section>
          )}

          {show('rehearsals') && <Divider />}

          {/* ───────── Auditions ───────── */}
          {show('auditions') && (
            <section id="auditions">
              <h2 className={h2Classes}>{`Auditions`}</h2>
              <p className={pClasses}>
                {`The Auditions system lets you manage open calls and timed-slot auditions. Auditioners sign up on a public page. You review their submissions in the admin panel.`}
              </p>

              {show('auditions-overview') && (
                <>
                  <h3 id="auditions-overview" className={h3Classes}>{`Overview`}</h3>
                  <p className={pClasses}>
                    {`Go to Auditions in the sidebar to see all auditions. Click New Audition to create one. Choose Open Call (anyone shows up) or Timed Slots (people pick a specific time).`}
                  </p>
                  <p className={pClasses}>
                    {`Once you publish an audition, a public signup page goes live. Share the link or post it on your website. Auditioners fill out the form and `}
                    {`you'll`}
                    {` see them in the Signups tab.`}
                  </p>
                </>
              )}

              {show('auditions-signups') && (
                <>
                  <h3 id="auditions-signups" className={h3Classes}>{`Managing Signups`}</h3>
                  <p className={pClasses}>
                    {`Open an audition and click the Signups tab. Each row shows an `}
                    {`auditioner's`}
                    {` name, contact info, and current status.`}
                  </p>
                  <p className={pClasses}>
                    {`Click a row to expand it. You can change the status (Pending, Callback, Cast, Not Cast, or Withdrawn), add private notes, and record which role they were cast in.`}
                  </p>
                  <p className={pClasses}>
                    {`When you mark someone as Cast, a Convert to Volunteer button appears. Click it to add them to your volunteer database automatically.`}
                  </p>
                  <Tip>
                    {`Set up email templates in the Email Templates tab to automatically notify auditioners when their status changes.`}
                  </Tip>
                </>
              )}

              {show('auditions-materials') && (
                <>
                  <h3 id="auditions-materials" className={h3Classes}>{`Materials`}</h3>
                  <p className={pClasses}>
                    {`When you create an audition, you can enable material uploads: headshots, resumes, sheet music, MP3 files, or video reels. Auditioners upload when they sign up, or later using a link in their confirmation email.`}
                  </p>
                  <p className={pClasses}>
                    {`Click the Materials tab on any audition to see everything submitted. Download any file using the link in that row.`}
                  </p>
                </>
              )}

              {show('auditions-checkin') && (
                <>
                  <h3 id="auditions-checkin" className={h3Classes}>{`Day-of Check-In`}</h3>
                  <p className={pClasses}>
                    {`Each audition has a check-in QR code on the Overview tab. Print it or display it on a screen. Auditioners scan it and select their name to check in — no app required.`}
                  </p>
                  <p className={pClasses}>
                    {`You can also mark attendance manually from the Signups tab. Self check-ins show a badge so you can tell them apart from manual marks.`}
                  </p>
                </>
              )}
            </section>
          )}

          {show('auditions') && <Divider />}

          {/* ───────── Inventory ───────── */}
          {show('inventory') && (
            <section id="inventory">
              <h2 className={h2Classes}>{`Inventory`}</h2>
              <p className={pClasses}>
                {`Inventory management is coming soon.`}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
