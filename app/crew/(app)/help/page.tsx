import type { ReactNode } from 'react'

type TocSubItem = { label: string; href: string }
type TocItem = { label: string; href: string; subsections?: TocSubItem[] }

const TOC: TocItem[] = [
  {
    label: 'Your Volunteers',
    href: '#volunteers',
    subsections: [
      { label: 'Finding a Volunteer', href: '#find-volunteer' },
      { label: 'Reading a Profile', href: '#volunteer-profile' },
      { label: 'Editing Information', href: '#edit-volunteer' },
      { label: 'Archiving a Volunteer', href: '#archive-volunteer' },
      { label: 'Communication History', href: '#volunteer-communication' },
    ],
  },
  {
    label: 'Shows',
    href: '#shows',
    subsections: [
      { label: 'Show Statuses', href: '#show-status' },
      { label: 'Creating a Show', href: '#create-show' },
      { label: 'Publishing a Show', href: '#publish-show' },
      { label: "Managing Who's Signed Up", href: '#show-volunteers' },
      { label: 'Messaging Volunteers', href: '#show-email' },
      { label: 'The Waitlist', href: '#waitlist' },
      { label: 'Post-Show Report', href: '#post-show-report' },
    ],
  },
  {
    label: 'Attendance and Hours',
    href: '#attendance',
    subsections: [
      { label: 'Marking Attendance', href: '#mark-attendance' },
      { label: 'How Hours Work', href: '#hours' },
      { label: 'Milestones', href: '#milestones' },
    ],
  },
  {
    label: 'The Signup Form',
    href: '#signup-form',
    subsections: [
      { label: 'What Volunteers See', href: '#what-volunteers-see' },
      { label: 'Announcement Banner', href: '#announcement-banner' },
      { label: 'Form Field Settings', href: '#form-settings' },
    ],
  },
  {
    label: 'Settings',
    href: '#settings',
    subsections: [
      { label: 'Hearing Options', href: '#hearing-options' },
      { label: 'Default Hours', href: '#default-hours' },
      { label: 'Reply-To Email', href: '#reply-to' },
      { label: 'Categories', href: '#categories' },
      { label: 'User Accounts', href: '#user-accounts' },
    ],
  },
  { label: 'The Volunteer Call Board', href: '#callboard' },
  { label: 'Standing Opportunities', href: '#opportunities' },
  { label: 'Getting Help', href: '#getting-help' },
]

const tocLinkClasses =
  'block text-sm text-mid-gray dark:text-dark-muted hover:text-navy dark:hover:text-steel transition-colors py-0.5'

function TocList() {
  return (
    <nav className="space-y-3">
      {TOC.map((item) => (
        <div key={item.href}>
          <a href={item.href} className={tocLinkClasses}>
            {item.label}
          </a>
          {item.subsections && (
            <div>
              {item.subsections.map((sub) => (
                <a key={sub.href} href={sub.href} className={`${tocLinkClasses} pl-4`}>
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

function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="bg-light-navy dark:bg-dark-surface border-l-4 border-navy dark:border-steel p-4 rounded-r my-4">
      <p className="text-sm text-dark dark:text-dark-text leading-relaxed">
        <span className="font-semibold">{'\u{1F4A1} Tip:'}</span> {children}
      </p>
    </div>
  )
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="bg-pale-orange dark:bg-dark-surface border-l-4 border-orange p-4 rounded-r my-4">
      <p className="text-sm text-dark dark:text-dark-text leading-relaxed">
        <span className="font-semibold">{'⚠️ Important:'}</span> {children}
      </p>
    </div>
  )
}

function Divider() {
  return <hr className="border-t border-divider dark:border-dark-border my-12" />
}

const h2Classes = 'text-2xl font-bold text-navy dark:text-dark-text mb-4 mt-12'
const h3Classes = 'text-lg font-semibold text-dark dark:text-dark-text mb-2 mt-8'
const pClasses = 'text-dark dark:text-dark-text leading-relaxed mb-4'
const ulClasses = 'list-disc pl-5 space-y-1 text-dark dark:text-dark-text leading-relaxed mb-4'
const olClasses = 'list-decimal pl-5 space-y-1 text-dark dark:text-dark-text leading-relaxed mb-4'

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto" style={{ scrollBehavior: 'smooth' }}>
      <h1 className="text-2xl font-bold text-navy dark:text-dark-text mb-2">{`Help & How-To Guide`}</h1>
      <p className="text-dark dark:text-dark-text leading-relaxed mb-8">
        {`Everything you need to know to manage volunteers in Production Crew.`}
      </p>

      {/* Mobile jump-to-section */}
      <div className="lg:hidden border border-divider dark:border-dark-border rounded-lg p-4 mb-8">
        <p className="text-sm font-semibold text-dark dark:text-dark-text mb-2">{`Jump to section:`}</p>
        <TocList />
      </div>

      <div className="lg:flex lg:gap-12 lg:items-start">
        <aside className="hidden lg:block w-60 shrink-0 sticky top-4 self-start">
          <TocList />
        </aside>

        <div className="flex-1 min-w-0">
          {/* ───────── Your Volunteers ───────── */}
          <section id="volunteers">
            <h2 className={h2Classes}>{`Your Volunteers`}</h2>

            <h3 id="find-volunteer" className={h3Classes}>{`Finding a Volunteer`}</h3>
            <p className={pClasses}>{`Click Volunteers in the left menu. You'll see a list of everyone in the system.`}</p>
            <p className={pClasses}>
              {`To find someone specific, type their name, email address, or phone number in the search box at the top.`}
            </p>
            <p className={pClasses}>
              {`To narrow the list, use the filters on the left: category, age range, service hours requirement, and more. You can combine filters.`}
            </p>

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

            <h3 id="edit-volunteer" className={h3Classes}>{`Editing a Volunteer's Information`}</h3>
            <p className={pClasses}>{`Open the volunteer's profile and click the Edit button near the top of the page.`}</p>
            <p className={pClasses}>{`Make your changes and click Save. The updates take effect immediately.`}</p>
            <p className={pClasses}>
              {`Note: email addresses are shown but cannot be edited here. If a volunteer's email has changed, contact your Super Admin.`}
            </p>

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

            <h3 id="volunteer-communication" className={h3Classes}>{`Communication History`}</h3>
            <p className={pClasses}>
              {`The Communication History section on a volunteer's profile shows every email this platform has sent to them — confirmation emails, slot claim notices, milestone congratulations, and show messages.`}
            </p>
            <p className={pClasses}>{`Click the section heading to expand it.`}</p>
            <p className={pClasses}>
              {`Note: emails you send outside the platform (from your personal email or another system) won't appear here.`}
            </p>
          </section>

          <Divider />

          {/* ───────── Shows ───────── */}
          <section id="shows">
            <h2 className={h2Classes}>{`Shows`}</h2>

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

            <h3 id="create-show" className={h3Classes}>{`Creating a Show`}</h3>
            <p className={pClasses}>{`Click Shows in the left menu, then click New Show.`}</p>
            <p className={pClasses}>{`Fill in:`}</p>
            <ul className={ulClasses}>
              <li>{`Show name (like "South Pacific" or "Studio X: Holiday Showcase")`}</li>
              <li>{`Show type: Mainstage, Studio X, or One-Off`}</li>
              <li>{`Season (select an existing season or type a new one — it will be created automatically)`}</li>
            </ul>
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
              {`The Default Hours field controls how many hours each volunteer earns for this show. It fills in automatically based on show type, but you can change it.`}
            </p>
            <p className={pClasses}>
              {`When you're ready, click Publish to make the show live, or Save as Draft to save without publishing.`}
            </p>

            <h3 id="publish-show" className={h3Classes}>{`Publishing a Show`}</h3>
            <p className={pClasses}>{`Publishing makes a show visible to volunteers immediately. They can start signing up right away.`}</p>
            <p className={pClasses}>
              {`When you publish for the first time, you'll see an option to send a notification email. This email goes to all volunteers whose interests match the roles in your show. Check the box to send it.`}
            </p>
            <Tip>
              {`If you publish quietly (without sending notifications), you can always send them later from the show's Overview tab using the Send Notifications button.`}
            </Tip>

            <h3 id="show-volunteers" className={h3Classes}>{`Managing Who's Signed Up`}</h3>
            <p className={pClasses}>{`Click a show's name to open its detail page, then click the Volunteers tab.`}</p>
            <p className={pClasses}>{`Use the date dropdown at the top to switch between performance dates. Each date shows its own roster.`}</p>
            <p className={pClasses}>{`You'll see each volunteer's name, contact information, and attendance status.`}</p>

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

            <h3 id="waitlist" className={h3Classes}>{`The Waitlist`}</h3>
            <p className={pClasses}>
              {`When all slots for a role are filled, new volunteers are added to the waitlist automatically. They receive a confirmation email letting them know they're on the waitlist.`}
            </p>
            <p className={pClasses}>
              {`If a signed-up volunteer cancels, the first person on the waitlist is moved up automatically. They receive a new confirmation email with the full details.`}
            </p>
            <p className={pClasses}>{`You can see the current waitlist from the show's Waitlist tab.`}</p>

            <h3 id="post-show-report" className={h3Classes}>{`Post-Show Report`}</h3>
            <p className={pClasses}>{`After a show is marked Past, a Report tab appears on the show's detail page.`}</p>
            <p className={pClasses}>
              {`The report shows the total number of volunteer appearances, how many showed up, how many were no-shows, total hours logged, and the attendance rate. It breaks these numbers down by date so you can see how each performance night went.`}
            </p>
          </section>

          <Divider />

          {/* ───────── Attendance and Hours ───────── */}
          <section id="attendance">
            <h2 className={h2Classes}>{`Attendance and Hours`}</h2>

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

            <h3 id="milestones" className={h3Classes}>{`Milestones`}</h3>
            <p className={pClasses}>
              {`Volunteers earn milestones as they accumulate hours. The milestones are: First Call (their very first appearance), 10 hours, 20 hours, 35 hours, 50 hours, 75 hours, and 100 hours.`}
            </p>
            <p className={pClasses}>{`When a volunteer hits a milestone, they receive a congratulations email automatically.`}</p>
            <p className={pClasses}>
              {`You'll also see a Pending Milestone Acknowledgments card on your dashboard. This is your reminder to reach out personally and celebrate their achievement. Click Mark Acknowledged after you've done that.`}
            </p>
          </section>

          <Divider />

          {/* ───────── The Volunteer Signup Form ───────── */}
          <section id="signup-form">
            <h2 className={h2Classes}>{`The Volunteer Signup Form`}</h2>

            <h3 id="what-volunteers-see" className={h3Classes}>{`What Volunteers See`}</h3>
            <p className={pClasses}>{`The public volunteer signup page is the first thing new volunteers see. It's available at your platform's web address.`}</p>
            <p className={pClasses}>
              {`Volunteers fill in their name, email address, and phone number. They can also choose their volunteer interests (like Ushers or Backstage Crew) and answer a few optional questions.`}
            </p>
            <p className={pClasses}>
              {`Every volunteer receives a confirmation email after signing up. That email includes a personal link they can use anytime to update their information.`}
            </p>

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

            <h3 id="form-settings" className={h3Classes}>{`Form Field Settings`}</h3>
            <p className={pClasses}>{`You can turn the School field and the Age Range field on or off on the volunteer signup form.`}</p>
            <p className={pClasses}>{`Go to Settings, then click Signup Form.`}</p>
            <p className={pClasses}>{`Toggle each field on or off and click Save. Changes take effect immediately.`}</p>
          </section>

          <Divider />

          {/* ───────── Settings ───────── */}
          <section id="settings">
            <h2 className={h2Classes}>{`Settings`}</h2>

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

            <h3 id="default-hours" className={h3Classes}>{`Default Volunteer Hours`}</h3>
            <p className={pClasses}>{`Default hours are the number of hours automatically credited to a volunteer per call, based on show type.`}</p>
            <p className={pClasses}>{`Go to Settings, then click General Defaults.`}</p>
            <p className={pClasses}>{`The three show types each have their own default: Mainstage, Studio X, and One-Off.`}</p>
            <Warning>{`Changing default hours only affects new shows created after the change. Existing shows keep their original setting.`}</Warning>

            <h3 id="reply-to" className={h3Classes}>{`Reply-To Email Address`}</h3>
            <p className={pClasses}>{`When a volunteer hits Reply on a platform email, their message goes to the Reply-To address.`}</p>
            <p className={pClasses}>{`The default is info@30byninety.com.`}</p>
            <p className={pClasses}>{`To change it: go to Settings, then General Defaults.`}</p>

            <h3 id="categories" className={h3Classes}>{`Volunteer Categories`}</h3>
            <p className={pClasses}>
              {`Categories are the volunteer interest areas that appear on the signup form — things like Ushers, Concessions, or Backstage Crew.`}
            </p>
            <p className={pClasses}>{`Go to Settings, then Category Management to add, rename, reorder, or hide categories.`}</p>
            <Warning>{`Only Super Admins can manage categories.`}</Warning>
            <p className={pClasses}>
              {`Hiding a category removes it from the signup form but does not affect any existing volunteer records that already have that category.`}
            </p>

            <h3 id="user-accounts" className={h3Classes}>{`Production Crew Accounts`}</h3>
            <p className={pClasses}>{`Production Crew has three account types:`}</p>
            <p className={pClasses}>
              <strong>{`Super Admin`}</strong>
              {` — full access, including the ability to create and manage all other accounts.`}
            </p>
            <p className={pClasses}>
              <strong>{`Editor`}</strong>
              {` — full read and write access for all volunteer and show management. Cannot manage user accounts.`}
            </p>
            <p className={pClasses}>
              <strong>{`Viewer`}</strong>
              {` — read-only access. Can see everything but cannot make any changes.`}
            </p>
            <Warning>{`Only Super Admins can create, change, or deactivate Production Crew accounts. Go to Settings, then User Management.`}</Warning>
            <p className={pClasses}>
              {`New team members can also request access themselves from the Production Crew login page. A Super Admin must approve the request before access is granted.`}
            </p>
          </section>

          <Divider />

          {/* ───────── The Volunteer Call Board ───────── */}
          <section id="callboard">
            <h2 className={h2Classes}>{`The Volunteer Call Board`}</h2>
            <p className={pClasses}>
              {`The Volunteer Call Board is the page volunteers use after they've signed up. They can find it at your platform address followed by /callboard (for example: 30byninetyvolunteers.com/callboard).`}
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

          <Divider />

          {/* ───────── Standing Opportunities ───────── */}
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

          <Divider />

          {/* ───────── Getting Help ───────── */}
          <section id="getting-help">
            <h2 className={h2Classes}>{`Getting Help`}</h2>
            <p className={pClasses}>{`For technical questions or anything not covered here, contact Jonathan Sturcken.`}</p>
            <Tip>
              {`Most questions can be answered by exploring the page in question. Nothing in Production Crew can be accidentally broken beyond repair, and nothing is permanently deleted (only archived).`}
            </Tip>
          </section>
        </div>
      </div>
    </div>
  )
}
