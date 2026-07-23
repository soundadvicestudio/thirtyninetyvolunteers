type TriggerEntry = {
  name: string
  fires: string
  recipient: string
  spam: string
}

const TRIGGERS: TriggerEntry[] = [
  {
    name: 'Volunteer Signup Confirmation',
    fires: 'Fires when a new volunteer submits the signup form.',
    recipient: 'The new volunteer.',
    spam: 'Only fires on successful insert; duplicate submissions receive a merge prompt, not a new email.',
  },
  {
    name: 'Volunteer Info Update Confirmation',
    fires: 'Fires when a volunteer submits the /update form.',
    recipient: 'The volunteer.',
    spam: 'Requires a valid update_token; one email per form submission.',
  },
  {
    name: 'Slot Claim Confirmation',
    fires: 'Fires when a volunteer successfully claims a slot.',
    recipient: 'The claimant.',
    spam: 'Duplicate same-role/same-date claims are blocked at the server; cross-date claims require explicit confirmation before a second email is sent.',
  },
  {
    name: 'Waitlist Confirmation',
    fires: 'Fires when a slot is full and the volunteer joins the waitlist.',
    recipient: 'The waitlisted volunteer.',
    spam: 'One per waitlist insert.',
  },
  {
    name: 'Waitlist Promotion',
    fires: 'Fires when a cancellation promotes the next person off the waitlist.',
    recipient: 'The promoted volunteer.',
    spam: 'Only the next volunteer in position order is promoted; one email per promotion event.',
  },
  {
    name: 'Cancellation — Editor Notification',
    fires: 'Fires when a claimed (not waitlisted) slot is cancelled.',
    recipient: 'All assigned editors for that show.',
    spam: 'Waitlisted cancellations do not trigger this; silently skipped if no editors are assigned.',
  },
  {
    name: '24-Hour Reminder (automated cron)',
    fires: 'Fires nightly at midnight CT via Vercel Cron.',
    recipient: 'All volunteers with a claimed slot for the following calendar day.',
    spam: 'Only claims with show_date = tomorrow are included; each volunteer receives at most one reminder per show date.',
  },
  {
    name: 'Post-Show Thank-You (automated cron)',
    fires: 'Fires 48 hours after each show date via Vercel Cron.',
    recipient: 'All volunteers who were marked Showed for that date.',
    spam: 'thank_you_sent_at flag on show_dates prevents re-send; dates with zero showed volunteers are marked sent without sending any emails.',
  },
  {
    name: 'Opportunity — Expression of Interest Confirmation',
    fires: 'Fires when a volunteer submits to an EOI-type standing opportunity.',
    recipient: 'The submitter.',
    spam: 'Duplicate submissions by email are blocked with a friendly message; no second email is sent.',
  },
  {
    name: 'Opportunity — Slot Claim Confirmation',
    fires: 'Fires when a volunteer claims a slot on a Slot Claim-type standing opportunity.',
    recipient: 'The submitter.',
    spam: 'Same duplicate detection as EOI.',
  },
  {
    name: 'Volunteer Milestone',
    fires:
      'Fires when a volunteer crosses an hours milestone threshold (First Call, 10h, 20h, 35h, 50h, 75h, 100h, +25h each).',
    recipient: 'The volunteer.',
    spam: 'UNIQUE constraint on milestone_log(volunteer_id, milestone_hours) prevents duplicate milestone awards; 23505 errors caught gracefully.',
  },
]

export default function AboutSystemEmails() {
  return (
    <div>
      <div className="space-y-4">
        {TRIGGERS.map((t) => (
          <div
            key={t.name}
            className="bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-5"
          >
            <h3 className="font-bold text-dark dark:text-dark-text mb-2">{t.name}</h3>
            <p className="text-sm text-dark dark:text-dark-text mb-2">{t.fires}</p>
            <p className="text-sm text-mid-gray dark:text-dark-muted mb-1">
              <span className="font-semibold text-dark dark:text-dark-text">Recipient: </span>
              {t.recipient}
            </p>
            <p className="text-sm text-mid-gray dark:text-dark-muted">
              <span className="font-semibold text-dark dark:text-dark-text">Spam protection: </span>
              {t.spam}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-mid-gray dark:text-dark-muted mt-6">
        Admin-triggered emails (category notifications, show messages, email blasts) are also
        logged here and appear in the All Emails tab. They are initiated by a Production Crew
        member, not automatically by the system.
      </p>
    </div>
  )
}
