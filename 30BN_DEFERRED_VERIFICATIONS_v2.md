# 30 By Ninety Theatre — Carry-Forward Verification Checklist
## Version 8 | July 2026 | Phase CAL Complete (CAL.1–CAL.10c + ADMIN.26)

This document contains ONLY items requiring manual owner
verification — browser interaction, email inbox checks,
phone, or second account. Database-verifiable items are
handled separately in 30BN-DB-VERIFY.3.

Everything confirmed PASS in VERIFY-1 through VERIFY-4
has been removed. Items confirmed FAIL in VERIFY-1 were
fixed by ADMIN.14 and require re-verification (🔁).

Sections cover: ADMIN.14 re-verify, Phases 5–7 remaining,
ADMIN.15–19, Phase 8 (Call Board), Phase 9 (Hours &
Milestones), Phase 10 (Audit Log), ADMIN.20 (Dashboard),
Phase 11.1–11.2 (Stubs/404/Settings), ADMIN.21–24,
Phase 12 (12.1–12.4).

---

## SEED DATA CLEANUP

Before launch, run this SQL in the Supabase dashboard
in this exact order (email_log first to avoid FK violation):

  DELETE FROM email_log
  WHERE id = '1061a638-0c83-412c-9f46-819d37387d97';

  DELETE FROM audit_log
  WHERE id = '2d059238-6516-4dba-9108-3721d0982dd3';

  DELETE FROM opportunity_submissions
  WHERE id = 'ca6989e1-800e-4e87-9803-93218d192c0b';

  DELETE FROM volunteers
  WHERE email LIKE 'seed-%@30bn-test.invalid';

  UPDATE shows
  SET notifications_sent_at = NULL
  WHERE id = 'bd3f4b2a-a8aa-461f-9a78-4ea29d2c96bb';

Also clean up verification session data created in SETUP-1:

  DELETE FROM form_responses
  WHERE form_id = '2aa17d2c-b421-4071-9208-78fec95fd642';

  DELETE FROM forms
  WHERE id = '2aa17d2c-b421-4071-9208-78fec95fd642';

  DELETE FROM slot_claims
  WHERE volunteer_email IN (
    'browsertest@30bn-test.invalid',
    'verifyclaimer@30bn-test.invalid',
    'waitlisttest@30bn-test.invalid',
    'livetest@30bn-test.invalid'
  );

  DELETE FROM volunteers
  WHERE email IN (
    'testviewer@30bn-test.invalid'
  );

The "Test" show (bd3f4b2a) is currently LIVE and publicly
visible. Archive or unpublish before launch.

Also clean up any email_log + email_log_recipients rows
created by ADMIN.23 bulk email test sends before launch:

  DELETE FROM email_log_recipients
  WHERE email_log_id IN (
    SELECT id FROM email_log
    WHERE recipient_filter LIKE 'show:%'
      AND sent_by IS NOT NULL
      AND sent_at > '2026-07-01'
  );

  DELETE FROM email_log
  WHERE recipient_filter LIKE 'show:%'
    AND sent_by IS NOT NULL
    AND sent_at > '2026-07-01';

Also clean up any thank-you cron email_log rows
created during testing before launch:

  DELETE FROM email_log_recipients
  WHERE email_log_id IN (
    SELECT id FROM email_log
    WHERE recipient_filter LIKE 'show_date:%'
      AND sent_by IS NULL
      AND sent_at > '2026-07-01'
  );

  DELETE FROM email_log
  WHERE recipient_filter LIKE 'show_date:%'
    AND sent_by IS NULL
    AND sent_at > '2026-07-01';

Also reset any show_dates.thank_you_sent_at values
populated during test cron runs:

  UPDATE show_dates
  SET thank_you_sent_at = NULL
  WHERE thank_you_sent_at IS NOT NULL;

Also clean up the 8 calendar_events seeded in CAL.5b
before launch (these are test events on next-week dates):

  DELETE FROM calendar_event_contacts
  WHERE calendar_event_id IN (
    SELECT id FROM calendar_events
    WHERE source = 'manual'
      AND title IN (
        'Late Summer Showcase',
        'Fall Play Rehearsal',
        'Ensemble Workshop Rehearsal',
        'Youth Acting Class',
        'Board Meeting',
        'Directors Blocking Session',
        'Space Rental — Birthday Party',
        'Community Workshop'
      )
  );

  DELETE FROM calendar_events
  WHERE source = 'manual'
    AND title IN (
      'Late Summer Showcase',
      'Fall Play Rehearsal',
      'Ensemble Workshop Rehearsal',
      'Youth Acting Class',
      'Board Meeting',
      'Directors Blocking Session',
      'Space Rental — Birthday Party',
      'Community Workshop'
    );

Also clean up any show_date_buffer rows created during
testing (buffer values of 0 are harmless but rows with
test values should be reset):

  UPDATE show_date_buffer
  SET buffer_before_minutes = 0,
      buffer_after_minutes = 0
  WHERE buffer_before_minutes > 0
     OR buffer_after_minutes > 0;

Also clean up any test recurring event series and
their occurrences created during testing:

  DELETE FROM calendar_event_contacts
  WHERE calendar_event_id IN (
    SELECT id FROM calendar_events
    WHERE recurrence_group_id IS NOT NULL
      AND source = 'manual'
  );

  DELETE FROM calendar_events
  WHERE recurrence_group_id IS NOT NULL
    AND source = 'manual';

  DELETE FROM recurrence_groups
  WHERE submitted_by IN (
    SELECT id FROM admin_users
    WHERE email NOT LIKE '%@30byninety.com'
  );

Note: The above SQL deletes manual recurring events
only. Show-sourced performance events (source = 'show')
are not affected. Review before running at launch —
only delete test series, not any real production series
that may have been created.

---

## PREREQUISITE

- [ ] **A1** — Viewer account (testviewer@30bn-test.invalid)
      was created in SETUP-1 but its password is not known.
      Reset the password via Supabase Auth dashboard →
      Authentication → Users before running any Viewer
      checks. Record the new password for VERIFY-7.

---

## FIXES TO RE-VERIFY (ADMIN.14)

These items FAILED in VERIFY-1 and have been fixed.
Re-verify after ADMIN.14 is deployed.

- [ ] **ADMIN.14 V1** 🔁 — After claiming a slot via
      /shows/[id], navigate to /shows without a hard
      reload. Confirm the show card's slot count updates
      immediately.

- [ ] **ADMIN.14 V2** 🔁 — After changing a show's status
      to "Past" in the admin Settings tab, navigate to
      /shows. Confirm the show disappears from the listing
      without a hard reload.

- [ ] **ADMIN.14 V3** 🔁 — In dark mode, open any modal
      (e.g., Create User, confirmation dialogs). Hover
      over the close (×) button. Confirm a visible hover
      state appears — distinctly different from the dialog
      background.

- [ ] **ADMIN.14 V4** 🔁 — Toggle from dark mode to light
      mode using the sidebar toggle. Confirm the page
      visually switches immediately without requiring a
      hard reload or second toggle.

- [ ] **ADMIN.14 V5** 🔁 — Navigate to /crew/shows and
      edit a show that has a date with no roles assigned.
      Confirm the form loads without an undeletable blank
      role row. Confirm you can save without being forced
      to add an unwanted role.

- [ ] **ADMIN.14 V6** 🔁 — Navigate to
      /crew/shows/opportunities. Find an archived
      opportunity. Confirm a "Reactivate" button is
      visible on that row. Click it. Confirm status
      changes to active and it reappears in the active
      list.

---

## PHASE 5 — REMAINING ITEMS

---

### 30BN-5.2 — Slot Claiming (remaining)

Items not covered in VERIFY-4 — require email delivery
or specific conditions.

- [ ] **5.2 V2** — Claim confirmation email arrives with
      show name, date, time, role, and working cancel link.
      *(Requires real email delivery)*

- [ ] **5.2 V3** — volunteer_instructions appear in the
      claim confirmation email if set on the show.
      *(Requires real email delivery)*

- [ ] **5.2 V9** — Waitlist confirmation email arrives
      with correct position number.
      *(Requires real email delivery)*

- [ ] **5.2 V16** — Cancel a claimed slot when another
      volunteer is waitlisted: promotion email sent to
      promoted volunteer. Positions renumber correctly.
      *(Requires real email delivery + Supabase confirm)*

- [ ] **5.2 V17** — Show editors receive a cancellation
      notification email after a claimed slot is cancelled.
      If no editors assigned, no email sent, no error.
      *(Requires real email delivery)*

- [ ] **5.2 V21** — *(Pending Vercel scheduled run)*
      Verify in Vercel → Functions → Cron Jobs logs after
      the first midnight CT run, or trigger manually from
      Vercel dashboard.

---

### 30BN-5.3 — Category-Match Notifications (remaining)

Items not covered in VERIFY-5 — require email delivery
or second account.

- [ ] **5.3 V2** — Publish a show with a role matching a
      volunteer's category. Confirm notification email
      arrives with show name, matching roles, and link
      to /shows. *(Requires real email delivery)*

- [ ] **5.3 V4** — *(Covered in VERIFY-5 A2 — confirm
      PASS was recorded)* Publish with notify toggle
      unchecked; notifications_sent_at stays null.

- [ ] **5.3 V5** — *(Covered in VERIFY-5 A1 — confirm
      PASS was recorded)* Republish warning appears when
      notifications_sent_at is already set.

- [ ] **5.3 V6** — Volunteer with multiple matching roles
      receives exactly one email — not one per role.
      *(Requires real email delivery)*

- [ ] **5.3 V7** — Volunteer with no matching categories
      receives no email. *(Requires real email delivery)*

- [ ] **5.3 V8** — *(Covered in VERIFY-5 B1 — confirm
      PASS was recorded)* Settings tab live transition
      inline panel behavior.

- [ ] **5.3 V9** — Overview tab Volunteer Notifications
      section is NOT visible to Viewer role.
      *(Requires Viewer account — A1)*

- [ ] **5.3 V10** — *(Covered in VERIFY-5 C1/C3 — confirm
      PASS was recorded)* "Send Again" confirm prompt and
      Cancel behavior.

- [ ] **5.3 V11** — *(Covered in VERIFY-5 C2 — confirm
      PASS was recorded)* "Notifications last sent"
      timestamp displays correctly formatted.

- [ ] **5.3 V12** — *(Covered in VERIFY-5 C1 — confirm
      PASS was recorded)* Live show with no matching
      volunteers: send returns 0, no error.

- [ ] **5.3 V13** — Viewer sees no notification toggle
      or trigger button on any surface.
      *(Requires Viewer account — A1)*

---

## PHASE 6 — REMAINING ITEMS

Items from VERIFY-6a, VERIFY-6b, and VERIFY-7 — not yet
run at the time this document was written.

---

### 30BN-6.1 — Form Builder (VERIFY-6a)

- [ ] **6.1 V1** — /crew/forms list page renders. "New
      Form" button visible for Editor/Super Admin.

- [ ] **6.1 V2** — /crew/forms/new loads with empty
      builder: title, description, status selector,
      empty field list, "+ Add Field" button.

- [ ] **6.1 V3** — All 8 field types show correct config
      panels: text/textarea/date/number/rating show no
      options editor; dropdown/radio/checkbox show options
      editor with "Add option" button.

- [ ] **6.1 V4** — Dropdown options editor: add, reorder
      with ↑↓, delete, confirm delete blocked at 1 option.

- [ ] **6.1 V5** — Field list ↑↓ reorder changes visual
      order of fields.

- [ ] **6.1 V6** — Preview tab renders all 8 field types
      in read-only mode in the Build tab's order.

- [ ] **6.1 V7** — Save as Draft: redirect to /crew/forms,
      draft badge appears, Supabase confirms forms row
      and form_fields rows with correct data. *(Supabase)*

- [ ] **6.1 V8** — Edit saved form: all fields load with
      labels, types, options pre-populated.

- [ ] **6.1 V9** — Change status to live: "live" badge
      on list page.

- [ ] **6.1 V10** — Change status to closed: "closed"
      badge on list page.

- [ ] **6.1 V11** — Viewer: "New Form" button absent.
      Navigating to /crew/forms/new redirects.
      *(Requires Viewer account — A1)*

---

### 30BN-6.2 — Public Form Page (VERIFY-6b)

- [ ] **6.2 V1** — /forms/[id] for a live form renders
      with title, description, all fields in order.

- [ ] **6.2 V2** — /forms/[id] for a draft form shows
      generic "not available" — no form, no crash.

- [ ] **6.2 V3** — /forms/[id] for a closed form shows
      "no longer accepting responses" with title visible.

- [ ] **6.2 V4** — /forms/[id] for non-existent UUID
      shows graceful "not available" — no crash.

- [ ] **6.2 V5** — All 8 field types render correctly:
      text → single-line; textarea → multi-line;
      dropdown → select with options; radio → radio
      buttons; checkbox → checkboxes; date → date picker;
      rating → 5 numbered buttons; number → number input.

- [ ] **6.2 V6** — Submit with required fields empty:
      per-field validation errors appear without reload.

- [ ] **6.2 V7** — Fill all fields and submit: in-page
      success message appears; form replaced; no redirect.

- [ ] **6.2 V8** — Supabase: form_responses row exists
      with correct form_id. form_response_values rows
      exist one per field. *(Supabase)*

- [ ] **6.2 V9** — Submit with email matching a volunteers
      record: form_responses.volunteer_id is set.
      *(Supabase)*

- [ ] **6.2 V10** — Submit with unmatched email:
      volunteer_id is null. *(Supabase)*

- [ ] **6.2 V11** — Checkbox with 2 selections: value
      stored as JSON array string '["A","B"]'. *(Supabase)*

- [ ] **6.2 V12** — Rating click "3": value stored as
      "3". *(Supabase)*

- [ ] **6.2 V13** — Form renders at 375px without
      horizontal scroll. Inputs tappable.

---

### 30BN-6.3 — Form Response Viewer & Embed (VERIFY-6b)

**Form Detail Page**

- [ ] **6.3 V1** — /crew/forms/[id] renders: title,
      status badge, description, dates, response count
      with link, Edit button.

- [ ] **6.3 V2** — Public URL displayed correctly. Copy
      button copies it to clipboard.

- [ ] **6.3 V3** — Embed code shows correct iframe
      snippet. Copy button works.

- [ ] **6.3 V4** — QR section: inline SVG preview visible.
      PNG download works. SVG download works.
      *(QR scan with real phone — owner manual action)*

- [ ] **6.3 V5** — Edit button visible and links to
      /crew/forms/[id]/edit.

**Response Viewer**

- [ ] **6.3 V6** — /crew/forms/[id]/responses renders
      with form title and back link to detail page.

- [ ] **6.3 V7** — Empty state "No responses yet" renders
      on a form with no submissions.

- [ ] **6.3 V8** — Response appears in table with correct
      submitted_at and field values after submission.

- [ ] **6.3 V9** — Column headers match field labels in
      sort_order sequence.

- [ ] **6.3 V10** — Checkbox value displays as
      "Option A, Option C" not raw JSON.

- [ ] **6.3 V11** — Matched response shows volunteer name
      as clickable link to profile.

- [ ] **6.3 V12** — Unmatched response shows "—" in
      Volunteer column.

**Filters**

- [ ] **6.3 V13** — Date range filter: future date hides
      responses; clearing restores them.

- [ ] **6.3 V14** — Match filter: Matched/Unmatched/All
      correctly filters the response table.

**CSV Export**

- [ ] **6.3 V15** — Export CSV: correct filename, headers
      include Submitted At / Volunteer Name / Volunteer
      Email / all field labels, values correct.

- [ ] **6.3 V16** — Filtered export contains only
      filtered rows, not all responses.

---

---

## ADMIN.15 — Self-Registration, Pending Approval &
              Change Password

All items require the production site and a real email
address to verify email delivery.

**Registration flow:**

- [ ] **ADMIN.15 V1** — On /crew/login, a "Request
      Access" link or tab is visible. Clicking it reveals
      the registration form (Full Name, Email, Password,
      Confirm Password). Login form remains accessible.

- [ ] **ADMIN.15 V2** — Submit the registration form
      with a new email address. Confirm in-page success
      message appears ("Your request has been submitted").
      No redirect.

- [ ] **ADMIN.15 V3** — Supabase: confirm a row exists
      in pending_registrations with status = 'pending'
      and the correct name/email. *(Supabase)*

- [ ] **ADMIN.15 V4** — Super Admin receives notification
      email with subject "New access request — [name]
      ([email])" and a link to /crew/settings/users.
      *(Requires real email delivery)*

- [ ] **ADMIN.15 V5** — Submit registration again with
      the same email. Confirm "request already pending"
      error appears — no duplicate row created.

- [ ] **ADMIN.15 V6** — Submit registration with an
      email that already exists in admin_users. Confirm
      "already registered" error appears.

**Approval flow:**

- [ ] **ADMIN.15 V7** — On /crew/settings/users (as
      Super Admin), a "Pending Registrations" section
      appears above the admin user list when a pending
      request exists. Shows name, email, requested time,
      role selector (default Viewer), Approve and
      Decline buttons.

- [ ] **ADMIN.15 V8** — The Users sidebar nav item has
      a navy badge showing the pending count (e.g. "1").
      Badge only visible to Super Admins.

- [ ] **ADMIN.15 V9** — Click Approve on a pending row.
      Inline confirmation appears ("Are you sure?").
      Confirm and proceed.

- [ ] **ADMIN.15 V10** — After approval: pending row
      disappears, badge count decrements (or badge
      disappears if count reaches 0), approved user
      appears in the admin users list with the selected
      role and active status.

- [ ] **ADMIN.15 V11** — Supabase: confirm admin_users
      row exists for the approved user with correct role
      and is_active = true. Confirm pending_registrations
      row status = 'approved'. *(Supabase)*

- [ ] **ADMIN.15 V12** — Approved user receives email
      confirming access with login URL and instructions.
      *(Requires real email delivery)*

- [ ] **ADMIN.15 V13** — Approved user can log in at
      /crew/login with the email and password they
      registered with.

**Decline flow:**

- [ ] **ADMIN.15 V14** — Submit a second test
      registration (different email). Click Decline.
      Inline confirmation appears. Confirm and proceed.

- [ ] **ADMIN.15 V15** — After decline: row disappears,
      badge decrements. Declined user cannot log in
      (Auth user deleted).

- [ ] **ADMIN.15 V16** — Supabase: confirm
      pending_registrations row status = 'declined'.
      Confirm Auth user no longer exists in Supabase
      Authentication → Users. *(Supabase)*

- [ ] **ADMIN.15 V17** — Declined user receives email
      with a polite "not approved" message.
      *(Requires real email delivery)*

**Change password:**

- [ ] **ADMIN.15 V18** — "Change Password" link visible
      in the top bar for all admin roles (Super Admin,
      Editor, Viewer). Navigates to /crew/settings/
      password.

- [ ] **ADMIN.15 V19** — /crew/settings/password renders
      with New Password and Confirm New Password fields.

- [ ] **ADMIN.15 V20** — Submit with passwords that do
      not match. Confirm validation error — no request
      sent.

- [ ] **ADMIN.15 V21** — Submit with a valid new password
      (8+ characters). Confirm in-page success message.
      Sign out. Sign back in with the new password.
      Confirm login succeeds.

**Referral field labels:**

- [ ] **ADMIN.15 V22** — Navigate to any volunteer
      profile. In view mode, confirm the field labels
      read "How did you hear about us?" (not "Referral
      Source") and "Referred by (name)" (not "Referred
      By" or "referral_name").

- [ ] **ADMIN.15 V23** — Open a volunteer profile in
      edit mode. Confirm the same corrected labels appear
      on the input fields.

**Flag to carry forward:**

F1 — Supabase security advisor flags
pending_registrations.anon_insert_pending (WITH CHECK
(true) for anon INSERT) as "RLS Policy Always True."
This matches the established pattern on volunteers,
slot_claims, opportunity_submissions, form_responses,
and form_response_values. The action always runs
server-side via getAdminClient() so the anon policy
is not exercised in practice. Owner awareness item —
not a blocker. Decide before launch whether to tighten.

---

## ADMIN.16 — Sidebar Link, /crew Redirect &
              Add to Home Screen

- [ ] **ADMIN.16 V1** — Navigate to /crew directly
      (not /crew/dashboard) while authenticated. Confirm
      you land on /crew/dashboard without an error or
      404.

- [ ] **ADMIN.16 V2** — Navigate to /crew while NOT
      authenticated (log out first). Confirm redirect to
      /crew/login.

- [ ] **ADMIN.16 V3** — In the crew sidebar, confirm an
      "Opportunities" link appears directly below "Shows."
      Confirm it navigates to /crew/shows/opportunities.

- [ ] **ADMIN.16 V4** — While on /crew/shows/
      opportunities, confirm "Opportunities" is
      highlighted in the sidebar active state.

- [ ] **ADMIN.16 V5** — On a mobile device (phone),
      load /crew/dashboard in Safari (iOS). Confirm the
      "Add to Home Screen" card appears with numbered
      step-by-step instructions. *(Owner — phone required)*

- [ ] **ADMIN.16 V6** — Dismiss the card using the ×
      button. Reload the page. Confirm the card does not
      reappear. *(Owner — phone required)*

- [ ] **ADMIN.16 V7** — On a tablet (768px+) or desktop
      browser, confirm the Add to Home Screen card is not
      visible at all (md:hidden).

**Known cosmetic issue (no fix needed now):**

Q1 — While on /crew/shows/opportunities, both "Shows"
and "Opportunities" sidebar items may highlight
simultaneously due to the shared isActivePath() prefix
match. Pre-existing pattern (same behavior as Settings/
Users). Cosmetic only — flagged for a future polish pass
if desired.

---

## ADMIN.17 — Lint Sweep & Phase 12 Quick Wins

- [ ] **ADMIN.17 V1** — Download the volunteer PDF
      export (/crew/volunteers/export). Confirm a "Svc Hrs"
      column is present with Yes/No values per volunteer.
      Confirm layout is not broken (no column overflow).

- [ ] **ADMIN.17 V2** — Navigate to
      /crew/volunteers?page=999. Confirm you are
      redirected to the last valid page (not an empty
      list). Confirm active filters are preserved in
      the redirect URL.

---

## ADMIN.17-FIX — updateForm() Diff-Based Field Sync

These verify that saving a form does not destroy
response values for fields that were not removed.

- [ ] **17-FIX V1** — Open an existing form that has
      at least one response. Edit only the form title.
      Save. Navigate to the response viewer. Confirm
      all existing responses and their field values
      are intact.

- [ ] **17-FIX V2** — Open the same form. Add a new
      field. Save. Confirm existing responses are still
      intact. Confirm the new field appears on the
      public form page.

- [ ] **17-FIX V3** — Open the form. Remove a field
      that has response values. Save. Confirm the field
      is gone from the public form. Confirm the response
      viewer no longer shows that column. Confirm
      response rows themselves still exist (only that
      field's values are gone — this is correct behavior).

---

## ADMIN.19 — Targeted Fixes

- [ ] **ADMIN.19 V1** — Navigate to a volunteer profile
      with a call history spanning multiple shows. Confirm
      calls are sorted by show date (most recent show
      first) — not by the date the slot was claimed.

- [ ] **ADMIN.19 V2** — On the volunteer list, apply a
      category filter (or any filter). Click "Export
      Matching (CSV)." Confirm the downloaded CSV
      contains only volunteers matching the active filter
      — not all volunteers.

- [ ] **ADMIN.19 V3** — Navigate to /crew/settings/
      categories. Click the edit icon on any category.
      Confirm a description textarea appears alongside
      the name input. Enter a description. Save. Confirm
      the description persists on the category list.

- [ ] **ADMIN.19 V4** — Navigate to /crew/settings/
      categories → New Category form. Confirm the
      description field is a textarea (not a single-line
      input).

- [ ] **ADMIN.19 V5** — Toggle to dark mode. Navigate
      to any volunteer profile. Confirm the page header
      (volunteer name, "Back to Volunteers" link, and
      Active/Archived status badge) render correctly
      in dark mode — no invisible text, no white-on-white.

- [ ] **ADMIN.19 V6** — On a volunteer profile as Editor:
      add a note, archive/reactivate the volunteer, and
      edit a profile field. After each action, confirm
      the page updates in place without a full reload
      and the correct view state is restored (e.g. edit
      form closes after save).

---

## PHASE 8 — VOLUNTEER CALL BOARD (30BN-8.1)

**Anonymous visit:**

- [ ] **8.1 V1** — Navigate to /callboard without a
      session cookie (fresh browser or incognito).
      Confirm all live shows and active standing
      opportunities render. Confirm a "Find your record"
      lookup form is visible. No volunteer card shown.

**Volunteer identity — lookup:**

- [ ] **8.1 V2** — Enter a known volunteer's email
      address in the lookup form. Confirm the volunteer
      card appears without a redirect or email being
      sent.

- [ ] **8.1 V3** — Sign out. Enter the same volunteer's
      phone number. Confirm the card appears correctly.

- [ ] **8.1 V4** — Enter an email address not in the
      system. Confirm a friendly "not in our system —
      sign up here" prompt appears with a link to /.

**Session persistence:**

- [ ] **8.1 V5** — After identifying as a volunteer,
      reload the page. Confirm the volunteer card loads
      automatically without re-entering email/phone.

- [ ] **8.1 V6** — Click "Sign out." Confirm the card
      disappears and the lookup form returns. Confirm
      opportunities remain visible — the page does not
      navigate away.

**Volunteer card content:**

- [ ] **8.1 V7** — With an active session: on a show
      card for a show this volunteer has claimed,
      confirm a "You're signed up" indicator appears
      inline. *(Requires an active claimed slot for this
      volunteer)*

- [ ] **8.1 V8** — Click "Call History" (or expand
      button) on the volunteer card. Confirm past calls
      appear with correct show name, date, role, and
      attendance status.

- [ ] **8.1 V9** — If the volunteer has any milestones
      earned: confirm milestone badges are visible on
      the card.

**Landing page:**

- [ ] **8.1 V10** — On the public landing page (/),
      click "View Opportunities." Confirm it navigates
      to /callboard, not /shows.

**Mobile:**

- [ ] **8.1 V11** — Load /callboard on a phone at
      375px. Confirm opportunities and volunteer card
      are readable. No horizontal scroll.
      *(Owner — phone required)*

---

## PHASE 9.1 — HOURS TRACKING

**Dashboard Pending Hours Review card:**

- [ ] **9.1 V1** — Log in as Editor. Navigate to
      /crew/dashboard. If any volunteer has been marked
      Showed but hours not yet confirmed: confirm the
      "Hours Review" card appears above the Activity
      Feed with a count badge and grouped rows.

- [ ] **9.1 V2** — Click Confirm on a row without
      changing the hours. Confirm the row disappears
      and the count badge decrements (or card hides
      if last row).

- [ ] **9.1 V3** — Click Confirm on a row after
      changing the hours value. Confirm the row
      disappears. Navigate to that volunteer's profile.
      Confirm total_hours reflects the adjustment and
      a correction entry appears in the hours log table.

- [ ] **9.1 V4** — Log in as Viewer. Navigate to
      /crew/dashboard. Confirm the Hours Review card
      is not visible. *(Requires Viewer account — A1)*

**Volunteer profile hours section:**

- [ ] **9.1 V5** — Navigate to a volunteer profile
      with at least one attendance record. Confirm the
      Hours section shows: total hours heading,
      per-season breakdown table (with season name and
      hour totals), and a full hours log table (Date,
      Hours, Type, Note, Added By columns).

- [ ] **9.1 V6** — As Editor: use the manual hours
      entry form on a volunteer profile. Enter hours,
      date, and a description. Submit. Confirm total
      hours updates immediately and the new entry
      appears in the hours log with Type = "Manual."

- [ ] **9.1 V7** — Log in as Viewer. Navigate to a
      volunteer profile. Confirm the hours log and
      milestone history sections are visible. Confirm
      the manual entry form is absent.
      *(Requires Viewer account — A1)*

**Milestone history section:**

- [ ] **9.1 V8** — Navigate to any volunteer profile.
      Confirm the Milestone History section is present.
      If the volunteer has no milestones yet: confirm
      "No milestones yet." appears without an error.

---

## PHASE 9.2 — MILESTONE SYSTEM

**Milestone triggers:**

- [ ] **9.2 V1** — Mark a volunteer as Showed for the
      very first time (no prior attendance records for
      this volunteer). Confirm the First Call milestone
      congratulations email arrives in their inbox.
      *(Requires real email delivery)*

- [ ] **9.2 V2** — Log or confirm hours so a volunteer's
      total crosses the 10-hour threshold. Confirm a
      "10 Hours" congratulations email arrives.
      *(Requires real email delivery)*

- [ ] **9.2 V3** — Add manual hours to a volunteer that
      cross multiple thresholds at once (e.g. from 0 to
      25 hours, crossing 10h and 20h). Confirm separate
      congratulations emails arrive for each threshold
      crossed. *(Requires real email delivery)*

**Dashboard Pending Milestone Acknowledgments card:**

- [ ] **9.2 V4** — Navigate to /crew/dashboard as
      Editor. If any milestones have been triggered:
      confirm the "Milestone Acknowledgments" card
      appears ABOVE the "Hours Review" card. Confirm
      volunteer name, milestone label, and date are
      shown per row.

- [ ] **9.2 V5** — Click "Mark Acknowledged" on a
      milestone row. Confirm the row disappears. Confirm
      the card hides when the last row is acknowledged.

- [ ] **9.2 V6** — Log in as Viewer. Navigate to
      /crew/dashboard. Confirm the Milestone
      Acknowledgments card is not visible.
      *(Requires Viewer account — A1)*

**Volunteer profile:**

- [ ] **9.2 V7** — Navigate to a volunteer profile who
      has triggered at least one milestone. Confirm the
      Milestone History section now shows real entries
      (not the "No milestones yet." empty state).

**Call Board volunteer card:**

- [ ] **9.2 V8** — Identify as a volunteer on /callboard
      who has logged hours. Confirm the volunteer card
      shows a summary line "[X] hours from [Y] shows"
      (with "• [Z] manual hours" if applicable).

**Milestone Tier filter:**

- [ ] **9.2 V9** — On the volunteer list, apply the
      "First Call" milestone tier filter. Confirm only
      volunteers with a First Call milestone log entry
      appear. Apply "10+ Hours" filter. Confirm only
      volunteers who have crossed the 10-hour milestone
      appear. Apply "Any milestone earned" filter.
      Confirm only volunteers with at least one milestone
      appear.

---

## PHASE 10.1 — AUDIT LOG VIEWER

**Access and navigation:**

- [ ] **10.1 V1** — Log in as Editor. Navigate to
      /crew/settings. Confirm an "Audit Log" card is
      visible and linked. Click it. Confirm
      /crew/settings/audit-log loads with log entries.

- [ ] **10.1 V2** — Log in as Viewer. Navigate to
      /crew/settings/audit-log directly. Confirm you
      are redirected to /crew/dashboard.
      *(Requires Viewer account — A1)*

**Filters:**

- [ ] **10.1 V3** — Apply the Admin User filter to
      a specific admin name. Confirm only entries for
      that admin appear.

- [ ] **10.1 V4** — Apply the Action Type filter
      (e.g. "Profile updated"). Confirm only entries
      with that action appear.

- [ ] **10.1 V5** — Apply a date range filter spanning
      only today. Confirm only today's entries appear.
      Apply a past date range. Confirm entries from
      that range appear. Confirm CT day boundaries are
      correct (midnight CT, not midnight UTC).

**Diff view:**

- [ ] **10.1 V6** — Find an entry with before/after
      values (e.g. a volunteer profile update). Click
      "View diff." Confirm an inline panel appears
      showing only changed fields (Field | Before |
      After). Confirm unchanged fields are not shown.
      Confirm null values display as "—" and booleans
      as "Yes"/"No."

**Audit entries for new actions:**

- [ ] **10.1 V7** — Acknowledge a milestone from the
      dashboard. Navigate to the audit log. Confirm a
      "Milestone acknowledged" entry appears for the
      correct volunteer.

- [ ] **10.1 V8** — Change your password via
      /crew/settings/password. Navigate to the audit
      log. Confirm a "Password changed" entry appears
      with no before/after values.

**Settings hub:**

- [ ] **10.1 V9** — Navigate to /crew/settings as
      Editor. Confirm the Audit Log card is visible
      and linked. Log in as Viewer. Navigate to
      /crew/settings. Confirm the Audit Log card
      shows as locked/inaccessible.
      *(Viewer check requires Viewer account — A1)*

---

## PHASE 7 — QR CODE GENERATOR (7.1)

- [ ] **7.1 V1** — /crew/tools/qr-generator loads within
      the crew sidebar layout (not a stub or blank page).

- [ ] **7.1 V2** — Enter a URL and click "Generate QR
      Code." QR preview appears below the inputs.

- [ ] **7.1 V3** — "Download PNG" downloads a PNG file
      that contains a visible QR code image.

- [ ] **7.1 V4** — "Download SVG" downloads an SVG file
      that renders as a valid QR code vector.

- [ ] **7.1 V5** — Enter a label. Confirm downloaded
      files use a sanitized form of the label as filename.

- [ ] **7.1 V6** — Enter a URL without protocol (e.g.,
      "30byninetyvolunteers.com"). Confirm a QR is
      generated (https:// prepended automatically).

- [ ] **7.1 V7** — Clear the URL field and click Generate.
      Confirm inline error appears — no QR generated.

- [ ] **7.1 V8** — Generate a QR, then change the URL
      input. Confirm the previous QR result disappears
      immediately (cleared on input change).

- [ ] **7.1 V9** — *(Owner manual action — phone required)*
      Scan the PNG QR code with a real phone. Confirm it
      navigates to the correct URL.

- [ ] **7.1 V10** — In dark mode, the QR preview has a
      white background (not dark) — required for scanner
      readability.

---

## VIEWER-GATED ITEMS (VERIFY-7)

All require the Viewer account (A1 — password reset needed).

- [ ] **4.1 V9** — Viewer navigates to /crew/shows/new.
      Confirm redirect — form inaccessible.

- [ ] **4.3 V17** — Viewer on show detail page: no Edit
      link, no attendance controls, no editor add/remove,
      no status selector.

- [ ] **4.4a V6** — Viewer on /crew/shows/opportunities:
      list visible, New/Edit/Archive controls hidden.

- [ ] **5.3 V9** — Viewer on show Overview tab: Volunteer
      Notifications section not visible.

- [ ] **5.3 V13** — Viewer: no notification toggle or
      trigger button on any surface.

- [ ] **6.1 V11** — Viewer: "New Form" absent on list.
      /crew/forms/new redirects.

---

## WAITLIST UI (VERIFY-7 — requires Supabase slot adjustment)

Requires temporarily setting a role's slots_available to 1
to make it appear full. See VERIFY-7 Section A for SQL.

- [ ] **5.1 V2** — Live show with all slots claimed does
      NOT appear on /shows.

- [ ] **5.1 V9** — Full role shows "Join the Waitlist"
      button, not "Claim My Spot."

- [ ] **5.1 V10** — Date where all roles are full is
      labeled "Full" and non-interactive in date picker.

- [ ] **5.2 V8 (browser)** — Submit a waitlist claim:
      waitlist success state appears ("You're on the
      waitlist at position N").

---

## NOTIFICATION TIMESTAMP (VERIFY-7 Section C)

- [ ] **5.3 V3 (browser)** — Trigger "Send Again" on
      Overview tab. Confirm "Notifications last sent"
      timestamp updates to current time (not stale seed
      timestamp from DB-VERIFY.2).

---

## EMAIL DELIVERY ITEMS (manual — owner inbox)

These cannot be verified by Claude in Chrome. Check your
inbox alongside the relevant Chrome sessions.

From address: 30 By Ninety Theatre
  <volunteers@30byninetyvolunteers.com>

**Opportunity submission emails (alongside VERIFY-2):**

- [ ] **4.4b V2 (email)** — After submitting an EOI
      opportunity with a real email address: confirmation
      email arrives.

- [ ] **4.4b V7 (EOI)** — EOI confirmation email has
      warm "we'll be in touch" tone — not transactional.

- [ ] **4.4b V7 (Slot Claim)** — Slot Claim confirmation
      email explicitly confirms the position — not "we'll
      be in touch." *(Skip if no Slot Claim opportunity
      was tested)*

**Slot claim emails (alongside VERIFY-4):**

- [ ] **5.2 V2** — Claim confirmation email arrives with
      show name, date, time, role, and working /cancel link.

- [ ] **5.2 V3** — volunteer_instructions appear in claim
      email if set on the show.

- [ ] **5.2 V9** — Waitlist confirmation email arrives
      with correct position number.

- [ ] **5.2 V16 (email)** — After cancelling a claimed
      slot with a waitlisted volunteer: promotion email
      arrives at the waitlisted volunteer's address.

- [ ] **5.2 V17 (email)** — After a claimed cancellation:
      show editors receive a cancellation notification
      email. (Requires editors to be assigned to show.)

**Notification emails (alongside VERIFY-5):**

- [ ] **5.3 V2 (email)** — After publishing a show with
      a matching volunteer category: notification email
      arrives with show name, matching role names, and
      link to /shows.

- [ ] **5.3 V6 (email)** — Volunteer matching multiple
      roles receives exactly one notification email.

- [ ] **5.3 V7 (email)** — Volunteer with no matching
      categories receives no notification email.

---

## VERCEL DASHBOARD

- [ ] **5.2 V21** — After first midnight CT cron run (or
      via manual trigger in Vercel dashboard): Vercel →
      Functions → Cron Jobs logs confirm the reminders
      cron ran and returned a result.

---

## QUICK REFERENCE

### Requires Viewer account password reset (A1):
4.1 V9, 4.3 V17, 4.4a V6, 5.3 V9, 5.3 V13, 6.1 V11,
10.1 V2, 10.1 V9 (partial), 11.2 V3, 11.2 V10,
ADMIN.23 V2, ADMIN.24 V10, 12.2b V2

### Requires real email delivery:
4.4b V2, 4.4b V7, 5.2 V2, 5.2 V3, 5.2 V9,
5.2 V16, 5.2 V17, 5.3 V2, 5.3 V6, 5.3 V7,
9.2 V1, V2, V3, ADMIN.23 V11, 12.4 V5

### Requires Supabase slot adjustment (temporary):
5.1 V2, 5.1 V9, 5.1 V10, 5.2 V8 (browser)

### Requires Vercel dashboard:
5.2 V21

### Requires phone for QR scan:
6.3 V4 (partial), 7.1 V9

### Re-verify after ADMIN.14 deploy:
ADMIN.14 V1–V6

### ADMIN.15 — requires real email delivery:
ADMIN.15 V4, V12, V17

### ADMIN.15 — requires Supabase confirmation:
ADMIN.15 V3, V11, V16

### ADMIN.15 — requires phone/second account:
ADMIN.15 V13 (log in as approved user)

### ADMIN.16 — requires phone:
ADMIN.16 V5, V6

### ADMIN.17 — browser + download:
ADMIN.17 V1 (PDF export), ADMIN.17 V2 (page clamping)

### ADMIN.17-FIX — requires form with existing responses:
17-FIX V1, V2, V3

### ADMIN.19 — browser verification:
ADMIN.19 V1–V6 (all browser)

### Phase 8 — requires phone:
8.1 V11

### Phase 9.1 — requires Viewer account (A1):
9.1 V4, 9.1 V7

### Phase 9.2 — requires Viewer account (A1):
9.2 V6

### Phase 10.1 — requires Viewer account (A1):
10.1 V2, 10.1 V9 (partial)

### Needs test data (VERIFY Test Form from SETUP-1):
6.2 V7–V12, 6.3 V8–V16

### ADMIN.20 — requires Editor account:
ADMIN.20 V6

### ADMIN.20 — requires PDF download:
ADMIN.20 V12, V13

### Phase 11.1 — requires temporary code change:
11.1 V11, V12 (error boundary test — throw + revert)

### Phase 11.2 — requires Editor account:
11.2 V2

### Phase 11.2 — requires Supabase cross-check:
11.2 V25 (audit log entry after settings save)

### ADMIN.21 — requires Supabase cross-check:
ADMIN.21 V1 (phone stored as digits-only after signup)

### ADMIN.22 — requires a show set to status = 'past':
ADMIN.22 V1–V9 (flip test show via Settings tab)

### ADMIN.23 — requires Supabase cross-check:
ADMIN.23 V9, V10 (email_log + deduplication)

### ADMIN.23 — requires real email delivery:
ADMIN.23 V11

### ADMIN.25 — requires Supabase cross-check:
ADMIN.25 V2 (location default_hours test)

### CAL.1 — requires show management access:
CAL.1 V1–V7 (all browser, some Supabase optional)

### CAL.2 — requires Production account:
CAL.2 V3, V4, V5, V6 (Production role login)

### CAL.3 — requires Supabase cross-check:
CAL.3 V2, V3, V4 (calendar_events sync), V6, V8
(show_date_buffer rows)

### CAL.3 — requires Google SSO Production account:
CAL.3 V1

### CAL.4a — requires Supabase cross-check:
CAL.4a V7, V8 (calendar_events end_time)

### CAL.4b — requires calendar event data:
CAL.4b V7–V17 (event chips, week grid, agenda —
require approved events to exist; use seeded data
from CAL.5b or create via event form)

### CAL.5a — requires conflict setup:
CAL.5a V15 (create two overlapping events)

### CAL.5a — requires Viewer account (A1) for
negative check:
CAL.5a V12 (Viewer should NOT see Edit buttons)

### CAL.5b — requires Supabase cross-check:
CAL.5b V20 (calendar_editor flag toggle)

### CAL.5b — requires Editor account:
CAL.5b V16 (Book Space button visibility check)

### CAL.5b-FIX2 — batch-context Q8 note:
CAL.5b-FIX2 V4 (known limitation — document result)

### ADMIN.26 — requires real email delivery:
ADMIN.26 V7, V8 (waitlist promotion calendar link)

### CAL.6 — requires Editor account:
CAL.6 V3, V4 (calendar_editor toggle + login as editor)

### CAL.6 — requires Production account:
CAL.6 V8 (confirm row renders correctly)

### CAL.7 — requires real email delivery:
CAL.7 V15, V16 (claim confirmation + calendar link)

### CAL.7 — requires Google Calendar or Apple Calendar:
CAL.7 V12 (URL subscription test — owner manual action)

### CAL.7 — requires mobile viewport or phone:
CAL.7 V7 (/calendar at 375px)

### CAL.8 — requires Editor account:
CAL.8 V2 (Location Management locked card)

### CAL.8 — requires Supabase cross-check:
CAL.10b V10 (calendar_event_contacts after recurring
  create — Supabase verification)

### CAL.9 — requires mobile viewport or phone:
CAL.9 V7–V18 (all mobile behavior — most verifiable
  by narrowing browser window)

### CAL.10a — requires Supabase cross-check:
CAL.10a V1–V5 (schema + RLS + INSERT verification)

### CAL.10a — requires developer console or REPL:
CAL.10a V6–V10 (utility function spot-checks)

### CAL.10b — requires Supabase cross-check:
CAL.10b V10 (contacts created with recurring series)

### CAL.10c — requires approved recurring series
(created in CAL.10b):
CAL.10c V1–V12 (most items need existing data)

### CAL.10c — requires pending recurring series:
CAL.10c V13–V17 (pending queue Recurring Events
  section)

---

## NOTES ON VERIFY-5 ITEMS

VERIFY-5 was not yet run. The following items are listed
in this document as pending but will be confirmed or
cleared when VERIFY-5 runs:
5.3 V4, V5, V8, V10, V11, V12

If VERIFY-5 confirms them PASS, cross them off this list.
If any FAIL, add them to the fixes queue.

---

## ADMIN.20 — Dashboard (Season at a Glance + Quick Stats)

**Quick Stats tiles:**

- [ ] **ADMIN.20 V1** — Navigate to /crew/dashboard as
      any admin role. Confirm four Quick Stats tiles
      appear at the top: "Total Active Volunteers,"
      "Upcoming Shows This Month," "Volunteers Needed,"
      and "New Volunteers (7 Days)." Confirm all four
      show numeric values (not blank or zero if data
      exists to back them).

- [ ] **ADMIN.20 V2** — Confirm "Total Active Volunteers"
      matches the count of volunteers with status =
      'active' visible on /crew/volunteers. *(Supabase
      cross-check optional)*

- [ ] **ADMIN.20 V3** — Confirm "Volunteers Needed"
      reflects total open slots across all live shows
      (slots_available minus claimed count). If no live
      shows exist or all slots are filled, value should
      be 0, not blank.

**Season at a Glance (fallback — no pinned season):**

- [ ] **ADMIN.20 V4** — With no season pinned
      (dashboard_season_id not yet set in app_settings),
      confirm the Season at a Glance section heading
      reads "All Live Shows" and lists all currently
      live shows.

- [ ] **ADMIN.20 V5** — For a live show with roles,
      confirm each role row shows a staffing indicator:
      red dot for 0 claimed, yellow for partial, green
      for fully claimed. Confirm the claimed/total slot
      count appears beside the role name.

**Season selector (Super Admin only):**

- [ ] **ADMIN.20 V6** — Log in as Super Admin. Confirm
      a season selector dropdown appears in the Season
      at a Glance section header. Log in as Editor.
      Confirm the selector is absent — the section
      shows the same data but with no selector.
      *(Requires Editor account)*

- [ ] **ADMIN.20 V7** — As Super Admin: select a season
      from the dropdown. Confirm the section updates
      in place (no full page reload) and shows only
      shows belonging to that season. Confirm the
      section heading changes to the season name.

- [ ] **ADMIN.20 V8** — Select "— All Live Shows —"
      from the dropdown. Confirm the section reverts
      to fallback mode showing all live shows.

- [ ] **ADMIN.20 V9** — After selecting a season,
      reload the page. Confirm the same season remains
      pinned (the selection persisted to app_settings).

**Dashboard layout and dark mode:**

- [ ] **ADMIN.20 V10** — Confirm section render order
      from top to bottom: Quick Stats → Season at a
      Glance → Pending Milestones → Pending Hours →
      Add to Home Screen (mobile only) → Activity Feed.

- [ ] **ADMIN.20 V11** — Toggle to dark mode. Confirm
      Quick Stats tiles and Season at a Glance section
      respect dark: variants — no light backgrounds
      or invisible text.

**PDF export filter fix:**

- [ ] **ADMIN.20 V12** — On /crew/volunteers, apply the
      "Service Hours Required" filter (Yes). Click the
      PDF export link. Open the downloaded PDF. Confirm
      only volunteers with requires_service_hours = true
      appear. *(Verifies the service_hours filter fix
      bundled with ADMIN.20)*

- [ ] **ADMIN.20 V13** — Apply the milestone tier filter
      (e.g. "First Call"). Click PDF export. Confirm
      only volunteers with a First Call milestone entry
      appear in the PDF. *(Verifies the milestoneTier
      filter fix)*

---

## PHASE 11.1 — Beta Stub Pages & Custom 404

**Admin stub pages:**

- [ ] **11.1 V1** — Navigate to /crew/communication.
      Confirm the page renders within the sidebar layout
      (not a blank page or 404). Confirm "Coming Soon"
      badge and feature description are visible.

- [ ] **11.1 V2** — Navigate to /crew/tools/checkin.
      Confirm the page renders with sidebar layout,
      "Coming Soon" badge, and the check-in feature
      description.

- [ ] **11.1 V3** — Navigate to /crew/settings/documents.
      Confirm the page renders with sidebar layout,
      "Coming Soon" badge, and document management
      description.

- [ ] **11.1 V4** — Toggle to dark mode. Navigate to
      each of the three stub pages. Confirm all text
      and backgrounds render correctly — no invisible
      text or missing dark: variants.

**Check-In sidebar link:**

- [ ] **11.1 V5** — In the crew sidebar, confirm a
      "Check-In" link appears immediately after
      "QR Generator." Confirm it navigates to
      /crew/tools/checkin.

- [ ] **11.1 V6** — While on /crew/tools/checkin,
      confirm the "Check-In" sidebar link is highlighted
      as active (same visual treatment as other active
      links).

**Custom 404 page:**

- [ ] **11.1 V7** — Navigate to a non-existent public
      route (e.g. /this-does-not-exist). Confirm the
      custom branded 404 page appears — not the default
      Next.js 404. Confirm the 30 By Ninety logo,
      friendly heading, and both navigation links
      ("Go to volunteer signup" → / and "Go to
      Production Crew" → /crew/dashboard) are visible.

- [ ] **11.1 V8** — Navigate to a non-existent admin
      route (e.g. /crew/doesnotexist). Confirm the same
      custom 404 page appears.

- [ ] **11.1 V9** — Click "Go to volunteer signup" on
      the 404 page. Confirm it navigates to /. Click
      "Go to Production Crew." Confirm it navigates
      to /crew/dashboard.

- [ ] **11.1 V10** — In dark mode, navigate to a
      non-existent route. Confirm the 404 page stays
      light (no dark mode applied — public-facing page).

**Global error boundary:**

- [ ] **11.1 V11** — *(Requires temporary code change)*
      In any crew page Server Component, add
      `throw new Error('test')` temporarily and deploy
      (or trigger locally). Confirm the branded error
      page appears with "Something went wrong" heading,
      the AlertTriangle icon, and both action elements.
      Revert the throw immediately after confirming.

- [ ] **11.1 V12** — On the error page, click "Try
      again." Confirm the page re-renders (reset()
      is called). *(Confirm during the same test
      session as V11)*

---

## PHASE 11.2 — App Settings & Announcement Banner

**Settings hub (/crew/settings):**

- [ ] **11.2 V1** — Navigate to /crew/settings as Super
      Admin. Confirm all 8 cards are visible:
      Announcement Banner, Hearing Options, Signup Form,
      General Defaults, Category Management, User
      Management, Audit Log, Document Management.
      Confirm "Document Management" card has a "Beta"
      or "Coming Soon" badge.

- [ ] **11.2 V2** — As Super Admin: confirm Category
      Management and User Management cards are linked
      (LinkedCard). Log in as Editor. Confirm those
      two cards show as locked/inaccessible (LockedCard
      with "Super Admin only" indicator). Confirm all
      other cards are linked.
      *(Requires Editor account)*

- [ ] **11.2 V3** — Log in as Viewer. Navigate to
      /crew/settings. Confirm Announcement Banner,
      Hearing Options, Signup Form, General Defaults,
      and Audit Log cards appear as locked. Confirm
      Category Management and User Management cards
      appear as locked.
      *(Requires Viewer account — A1)*

**Announcement banner:**

- [ ] **11.2 V4** — Navigate to /crew/settings/
      announcement. Confirm the page loads with the
      toggle, textarea, character count, preview
      section, and save button.

- [ ] **11.2 V5** — Type text into the banner textarea.
      Confirm the character count updates live
      (e.g. "42 / 280").

- [ ] **11.2 V6** — Check the "Banner active" toggle
      and enter text. Confirm the preview section shows
      a rendered banner matching the entered text in
      light-mode styling (even if admin is in dark mode).

- [ ] **11.2 V7** — Save with banner active and text
      set. Navigate to / (public landing page) in a
      new tab. Confirm the announcement banner appears
      immediately at the top of the page — no Vercel
      redeploy required.

- [ ] **11.2 V8** — Return to /crew/settings/announcement.
      Uncheck the active toggle. Save. Reload / in the
      public tab. Confirm the banner disappears
      immediately.

- [ ] **11.2 V9** — Attempt to save with text exceeding
      280 characters. Confirm a validation error
      appears — the save does not proceed.

- [ ] **11.2 V10** — Log in as Viewer. Navigate to
      /crew/settings/announcement directly. Confirm
      redirect to /crew/settings (Viewer cannot access
      sub-pages). *(Requires Viewer account — A1)*

**Hearing options:**

- [ ] **11.2 V11** — Navigate to /crew/settings/
      hearing-options. Confirm all seeded options are
      listed with their current sort order and
      active/inactive status.

- [ ] **11.2 V12** — Add a new option (e.g. "Newsletter").
      Confirm it appears at the bottom of the list.

- [ ] **11.2 V13** — Click the edit icon on an existing
      option. Change the label. Save. Confirm the new
      label persists on the list.

- [ ] **11.2 V14** — Use the ↑↓ arrows to reorder an
      option. Confirm the visual order changes. Reload
      the page. Confirm the new order persists.

- [ ] **11.2 V15** — Deactivate an active hearing option.
      Confirm its status changes to inactive. Navigate
      to / (public signup form) and confirm the
      deactivated option no longer appears in the
      "How did you hear about us?" dropdown.

- [ ] **11.2 V16** — Reactivate a previously deactivated
      option. Confirm it reappears in the public signup
      form dropdown.

**Signup form toggles:**

- [ ] **11.2 V17** — Navigate to /crew/settings/
      signup-form. Confirm both toggles (School field,
      Age Range field) are present and reflect current
      settings.

- [ ] **11.2 V18** — Uncheck the School field toggle.
      Save. Navigate to / (public signup form). Confirm
      the School field is no longer visible.

- [ ] **11.2 V19** — Re-enable the School toggle. Save.
      Confirm School field reappears on / immediately.

- [ ] **11.2 V20** — Uncheck Age Range. Save. Confirm
      the Age Range dropdown and under-18 guardian
      fields are hidden on the public form.

**General defaults:**

- [ ] **11.2 V21** — Navigate to /crew/settings/general.
      Confirm default hours for Mainstage, Studio X,
      and One-Off are displayed and editable. Confirm
      Default Reply-To shows the current value.

- [ ] **11.2 V22** — Change the Mainstage default hours
      value. Save. Navigate to /crew/shows/new. Select
      show type "Mainstage." Confirm the Default Hours
      field pre-fills with the new value.

- [ ] **11.2 V23** — Change the Default Reply-To email.
      Save. Confirm the value persists on reload of
      /crew/settings/general.

- [ ] **11.2 V24** — Attempt to save Default Reply-To
      with an invalid email format. Confirm a validation
      error appears — save does not proceed.

**Audit logging:**

- [ ] **11.2 V25** — After saving any settings change
      (banner, hearing option, toggle, hours, reply-to),
      navigate to /crew/settings/audit-log. Confirm a
      settings.update (or hearing_options.*) entry
      appears with correct before/after values.

**Dark mode:**

- [ ] **11.2 V26** — Toggle to dark mode. Navigate to
      /crew/settings, /crew/settings/announcement,
      /crew/settings/hearing-options, /crew/settings/
      signup-form, and /crew/settings/general. Confirm
      all pages render correctly — no light backgrounds
      or invisible text on any sub-page.

---

## ADMIN.21 — Phone Normalization

**Signup flow:**

- [ ] **ADMIN.21 V1** — Submit the volunteer signup
      form at / using a formatted phone number
      (e.g. "(985) 555-0001"). After submission, check
      the volunteer record in Supabase (or the admin
      profile). Confirm phone is stored as digits-only
      ("9855550001"). *(Supabase cross-check)*

- [ ] **ADMIN.21 V2** — Attempt to sign up again with
      the same number in a different format
      (e.g. "985-555-0001"). Confirm the duplicate
      detection fires — not treated as a new volunteer.

**Call Board lookup:**

- [ ] **ADMIN.21 V3** — On /callboard, enter a phone
      number with formatting (e.g. "(985) 555-0001")
      in the volunteer lookup field. Confirm the
      correct volunteer card appears (lookup works
      against digits-only stored value).

**Slot claim duplicate detection:**

- [ ] **ADMIN.21 V4** — Attempt to claim a slot on
      /shows/[id] using the same phone number in a
      different format than was used on the original
      claim. Confirm the duplicate detection fires
      correctly (not treated as a new claim).

**Admin display:**

- [ ] **ADMIN.21 V5** — Navigate to /crew/volunteers.
      Confirm the phone column shows formatted values
      (e.g. "(985) 555-0001") not raw digits.

- [ ] **ADMIN.21 V6** — Navigate to a volunteer profile.
      In view mode, confirm the phone field shows
      the formatted display (e.g. "(985) 555-0001").
      Click Edit. Confirm the edit-mode input shows
      the raw digits-only value ("9855550001"), not
      the formatted display.

---

## ADMIN.22 — Post-Show Reporting

*Prerequisite: a show must have status = 'past' for
these to be testable. Set a test show to 'past' via
the Settings tab on the show detail page.*

- [ ] **ADMIN.22 V1** — Navigate to /crew/shows/[id]
      for a show with status = 'past'. Confirm a
      "Report" tab appears in the tab bar between
      "Dates" and "Settings."

- [ ] **ADMIN.22 V2** — Navigate to /crew/shows/[id]
      for a show with status = 'live', 'draft', or
      'archived'. Confirm no "Report" tab appears in
      the tab bar.

- [ ] **ADMIN.22 V3** — Click the Report tab on a
      past show. Confirm six stat tiles appear:
      Claimed Appearances, Showed Up, No-Shows,
      Excused, Total Hours, Attendance Rate.

- [ ] **ADMIN.22 V4** — On a past show with claimed
      volunteers but no attendance marked yet: confirm
      the Attendance Rate tile shows "—" and a notice
      appears: "Attendance has not been marked yet."
      Confirm claimed appearance count is still visible.

- [ ] **ADMIN.22 V5** — On a past show with some
      attendance marked: confirm Showed Up, No-Show,
      and Excused counts sum to the total attendance
      marked. Confirm Attendance Rate calculates
      correctly (showed ÷ total marked × 100).

- [ ] **ADMIN.22 V6** — Confirm the per-date breakdown
      table appears below the tiles with one row per
      show date. Confirm Date, Claimed, Showed, No-Show,
      Excused, Unmarked, and Hours columns are present.

- [ ] **ADMIN.22 V7** — If any showed attendance
      records have hours_confirmed = false: confirm
      a subtext "N appearances pending hours
      confirmation" appears on the Total Hours tile.

- [ ] **ADMIN.22 V8** — Toggle to dark mode. Navigate
      to the Report tab. Confirm tiles and table render
      correctly — no light backgrounds or invisible text.

- [ ] **ADMIN.22 V9** — Confirm all existing tabs
      (Overview, Volunteers, Waitlist, Dates, Settings)
      still load correctly and are visually unchanged
      after ADMIN.22 was deployed.

---

## ADMIN.23 — Bulk Email from Show Detail

*Prerequisite: the test show must have at least one
claimed volunteer (slot_claims.status = 'claimed').*

**Button visibility and empty state:**

- [ ] **ADMIN.23 V1** — Navigate to /crew/shows/[id]
      Overview tab as Editor or Super Admin. Confirm a
      "Message Volunteers (N)" button appears, where N
      is the count of unique claimed volunteer emails.

- [ ] **ADMIN.23 V2** — Log in as Viewer. Navigate to
      the same show Overview tab. Confirm the "Message
      Volunteers" button is absent entirely.
      *(Requires Viewer account — A1)*

- [ ] **ADMIN.23 V3** — Navigate to a show with zero
      claimed volunteers. Confirm the "Message
      Volunteers" button is replaced by muted text:
      "No volunteers are currently rostered for
      this show."

**Compose flow:**

- [ ] **ADMIN.23 V4** — Click "Message Volunteers (N)."
      Confirm a compose form appears with Subject,
      Reply-To, and Message fields. Confirm Subject
      pre-fills with "Message from 30 By Ninety Theatre"
      and Reply-To pre-fills with the default_reply_to
      value from app_settings.

- [ ] **ADMIN.23 V5** — Clear the subject field. Confirm
      the "Send Message" button is disabled. Clear the
      message body. Confirm the button remains disabled.
      Populate both fields. Confirm the button becomes
      enabled.

- [ ] **ADMIN.23 V6** — Click "Send Message" with both
      fields populated. Confirm an inline confirmation
      prompt appears showing the recipient count:
      "Send this message to N volunteer(s)?"

- [ ] **ADMIN.23 V7** — Click "Cancel" on the
      confirmation prompt. Confirm the form stays
      open with the composed message intact — the
      prompt dismisses but the form does not close.

**Send and logging:**

- [ ] **ADMIN.23 V8** — Click "Yes, Send" on the
      confirmation. Confirm a success message appears
      showing the sent count. Confirm the form closes
      after a brief delay.

- [ ] **ADMIN.23 V9** — After a successful send, check
      Supabase: confirm one email_log row was created
      with recipient_type = 'category', recipient_filter
      = 'show:[showId]', and recipient_count matching
      the unique email count. Confirm email_log_recipients
      rows exist — one per unique claimed email.
      *(Supabase)*

- [ ] **ADMIN.23 V10** — If the test show has a
      volunteer with two claimed slots (different dates
      of the same show), verify email_log_recipients
      has only one row for that volunteer's email —
      not two. *(Supabase — deduplication check)*

- [ ] **ADMIN.23 V11** — *(Requires real email delivery)*
      After a successful send, confirm the email arrives
      at a real inbox with the correct subject, body,
      and show name reference in the footer.

**Dark mode:**

- [ ] **ADMIN.23 V12** — Toggle to dark mode. Navigate
      to a show Overview tab. Confirm the "Message
      Volunteers" button and opened compose form
      render correctly — no light backgrounds or
      invisible text.

---

## ADMIN.24 — Communication History on Volunteer Profile

- [ ] **ADMIN.24 V1** — Navigate to any volunteer
      profile. Confirm a "Communication History"
      section appears below the Milestone History
      section. Confirm it is collapsed by default,
      showing only the heading and a count
      (e.g. "Communication History (3)" or
      "Communication History (None)").

- [ ] **ADMIN.24 V2** — Click the heading or chevron
      to expand the section. Confirm the section
      expands to show either the email table or the
      empty state message.

- [ ] **ADMIN.24 V3** — Click the heading or chevron
      again. Confirm the section collapses back.

- [ ] **ADMIN.24 V4** — For a volunteer with no logged
      emails: confirm the expanded state shows "No
      emails on record for this volunteer." with a
      second line: "Only emails sent and logged through
      this platform appear here."

- [ ] **ADMIN.24 V5** — For a volunteer with at least
      one logged email (e.g. a slot claim confirmation
      that was logged, or a show message sent via
      ADMIN.23): confirm the table shows the correct
      entry with Date, Subject, Type, Sent By, and
      Preview columns.

- [ ] **ADMIN.24 V6** — Confirm the Date column shows
      a full date and time (not just a date — sent_at
      is a timestamptz, e.g. "Jul 8, 2026 at 2:30 PM").

- [ ] **ADMIN.24 V7** — Confirm the Type column shows
      a human-readable label: "Transactional" for
      system emails, "Show Message" for bulk emails
      sent via ADMIN.23 (recipient_filter starts with
      'show:').

- [ ] **ADMIN.24 V8** — Confirm the Sent By column
      shows an admin name for admin-initiated emails
      and "System" for automated/transactional emails
      (where sent_by is null in email_log).

- [ ] **ADMIN.24 V9** — For an entry with a long body
      preview: confirm the Preview column truncates
      at ~80 characters with "…" appended. For an
      entry with no body preview: confirm "—" appears.

- [ ] **ADMIN.24 V10** — Log in as Viewer. Navigate to
      a volunteer profile. Confirm the Communication
      History section is visible and can be expanded.
      *(Viewer sees this section — no role restriction.
      Requires Viewer account — A1)*

- [ ] **ADMIN.24 V11** — Toggle to dark mode. Navigate
      to a volunteer profile and expand the
      Communication History section. Confirm the
      section renders correctly in dark mode — no
      light backgrounds or invisible text.

---

## PHASE 12.1 — Mobile Optimization, Honeypot &
              Deferred Fixes

**Mobile sidebar:**

- [ ] **12.1 V1** — On a phone-width browser (≤ 767px)
      or by narrowing the browser window below the md
      breakpoint: confirm the sidebar is hidden and a
      hamburger menu button (☰) appears in the top bar.
      On desktop/tablet (≥ 768px): confirm the sidebar
      is visible as a fixed column and the hamburger
      button is absent.

- [ ] **12.1 V2** — At phone width: tap/click the
      hamburger button. Confirm the sidebar slides in
      from the left as a drawer with a semi-transparent
      overlay behind it.

- [ ] **12.1 V3** — With the drawer open: tap/click the
      overlay area. Confirm the drawer closes.

- [ ] **12.1 V4** — With the drawer open: tap/click the
      X button inside the drawer. Confirm the drawer
      closes.

- [ ] **12.1 V5** — With the drawer open: click a
      navigation link (e.g., "Volunteers"). Confirm the
      drawer closes automatically and the new page loads.

- [ ] **12.1 V6** — Toggle to dark mode. Open the mobile
      drawer. Confirm it renders with the correct dark
      background and all nav links are readable — no
      invisible text.

- [ ] **12.1 V7** — At phone width (< 768px): confirm
      the top bar adapts correctly — admin name and
      "Change Password" link are hidden, Sign Out becomes
      icon-only. The hamburger button and Sign Out icon
      should both be visible without horizontal overflow.

**Honeypot spam prevention:**

- [ ] **12.1 V8** — Open the volunteer signup form at /.
      Using browser dev tools (Elements panel), locate
      the hidden `<input name="website">` field. Its
      CSS should position it far off-screen (left: -9999px
      or similar) — NOT display:none. Confirm it is not
      visible to a normal user.

- [ ] **12.1 V9** — Using dev tools, manually set the
      value of the `name="website"` input to any non-empty
      string (e.g. "bot"). Submit the form. Confirm a
      success message appears BUT check Supabase — confirm
      NO new volunteer row was created.
      *(Supabase cross-check)*

- [ ] **12.1 V10** — Submit the volunteer signup form
      normally (website field empty). Confirm the
      submission works exactly as before — volunteer
      created, confirmation shown.

- [ ] **12.1 V11** — Repeat the honeypot test (12.1 V9)
      on the slot claiming form at /shows/[id]. Set the
      hidden website field to a non-empty value, submit,
      confirm fake success with no slot_claims row
      created. *(Supabase cross-check)*

- [ ] **12.1 V12** — Repeat on the opportunity submission
      form at /opportunities/[id]. Same: fake success,
      no opportunity_submissions row created.
      *(Supabase cross-check)*

- [ ] **12.1 V13** — Repeat on a public form at
      /forms/[id]. Same: fake success, no form_responses
      row created. *(Supabase cross-check)*

**Small deferred fixes:**

- [ ] **12.1 V14** — Navigate to /crew/settings/categories.
      Rename a category using the inline edit. Confirm
      the category list updates in place immediately
      (no full page reload — uses router.refresh()
      rather than window.location.href).

- [ ] **12.1 V15** — Reorder a category using the ↑↓
      arrows. Confirm the list reorders in place without
      a full page reload.

- [ ] **12.1 V16** — In dark mode, navigate to
      /crew/volunteers. Confirm the "Active" and
      "Archived" status badges in the status column
      are readable — not invisible against the dark
      background.

---

## PHASE 12.2a — Performance & Security Audit

*Note: Most 12.2a items were verified by Claude Code
directly via database queries and lint/build checks.
The items below require owner-side confirmation.*

- [ ] **12.2a V1** — Navigate to /crew/dashboard.
      Confirm the page loads noticeably faster than
      before (subjective check — the dashboard now
      runs 5 queries in parallel instead of sequentially).
      Most noticeable on slower connections or devices.

- [ ] **12.2a V2** — *(Supabase cross-check)* In the
      Supabase dashboard SQL editor, run:
        SELECT * FROM volunteer_notes LIMIT 1;
      while NOT logged in as an admin (use an anon or
      public context). Confirm the query returns 0 rows
      (RLS restriction). Alternatively, confirm via
      Supabase → Authentication → Policies that
      volunteer_notes has no anon SELECT policy.

---

## PHASE 12.2b — In-App Help Page

- [ ] **12.2b V1** — Navigate to /crew/help as Super
      Admin. Confirm the page loads without error and
      displays the heading "Help & How-To Guide."

- [ ] **12.2b V2** — Log in as Editor. Confirm /crew/help
      loads. Log in as Viewer. Confirm /crew/help loads.
      *(All roles should have access)*

- [ ] **12.2b V3** — Confirm a "Help" nav link appears
      at the bottom of the crew sidebar with a question-
      mark circle icon (HelpCircle). Confirm it
      highlights as active when on /crew/help.

- [ ] **12.2b V4** — On a desktop viewport (≥ 1024px):
      confirm a sticky table of contents column appears
      on the left side of the page, and the content
      occupies the right side.

- [ ] **12.2b V5** — On a mobile/tablet viewport
      (< 1024px): confirm the TOC sidebar is hidden and
      a "Jump to section" block appears at the top of
      the page instead.

- [ ] **12.2b V6** — Click a table of contents link
      (e.g. "Shows"). Confirm the page scrolls smoothly
      to the correct section heading.

- [ ] **12.2b V7** — Confirm at least one Tip callout
      (blue left border) and one Warning callout
      (orange left border) are visible on the page.

- [ ] **12.2b V8** — Toggle to dark mode. Navigate to
      /crew/help. Confirm the page renders correctly —
      section headings, body text, and callout boxes
      are readable. No light backgrounds or invisible
      text.

- [ ] **12.2b V9** — On a 375px viewport, confirm
      /crew/help has no horizontal scroll and all text
      is readable.

- [ ] **12.2b V10** — Verify all 8 major section
      headings are present: "Your Volunteers", "Shows",
      "Attendance and Hours", "The Volunteer Signup
      Form", "Settings", "The Volunteer Call Board",
      "Standing Opportunities", "Getting Help."

---

## PHASE 12.2c — Tooltip System

*Spot-check a representative sample of the 16 tooltip
placements. All follow the same pattern — spot-checking
4–5 confirms the system works.*

- [ ] **12.2c V1** — Navigate to /crew/dashboard.
      Confirm a small question-mark circle icon (?) is
      visible inline with the "Hours Review" card
      heading and the "Milestone Acknowledgments" card
      heading. Confirm the icon is small and muted —
      not obtrusive.

- [ ] **12.2c V2** — Click the ? icon next to "Hours
      Review" on the dashboard. Confirm it navigates to
      /crew/help#hours and lands on the "How Hours Work"
      section.

- [ ] **12.2c V3** — Navigate to a volunteer profile.
      Confirm a ? icon appears inline with the "Editor
      Notes" section heading. Click it — confirm it
      navigates to /crew/help#volunteer-profile.

- [ ] **12.2c V4** — Navigate to /crew/shows/[id]
      Waitlist tab. Confirm a "Waitlist" h2 heading
      appears at the top of the tab content (added in
      12.4) with a ? icon inline. Click it — confirm
      it navigates to /crew/help#waitlist.

- [ ] **12.2c V5** — Toggle to dark mode. Navigate to
      any page with tooltip icons. Confirm the ? icons
      are visible (muted color, not invisible against
      dark background) and brighten on hover.

---

## PHASE 12.3 — Call Board Hours Breakdown

*Prerequisites: volunteer must have at least one show
appearance (slot claim + attendance marked Showed) to
test the grouped breakdown. A volunteer with only
manual hours tests the "Other Hours" section.*

- [ ] **12.3 V1** — Navigate to /callboard. Look up a
      volunteer who has show appearances. Confirm the
      hours summary line reads "[X] hours across [Y]
      shows" — NOT the old format "[X] hours from [Y]
      shows • [Z] manual hours."

- [ ] **12.3 V2** — For a volunteer with no show
      appearances (only manual hours or zero): confirm
      the summary line reads "[X] total hours" — not
      "hours across 0 shows."

- [ ] **12.3 V3** — Expand the volunteer card's history
      section (tap/click the expand button). Confirm
      the content is now grouped by show — each show
      has its name as a bold heading, with individual
      call sub-rows beneath it.

- [ ] **12.3 V4** — For each call sub-row, confirm it
      shows: the show date (formatted, not raw), the
      role name, the attendance status with color coding
      (green for Showed, red for No-Show, amber for
      Excused), and hours (shown only for Showed rows).

- [ ] **12.3 V5** — Confirm a "X hrs total" line
      appears below each show's call rows (showing
      only hours from Showed calls).

- [ ] **12.3 V6** — For a volunteer who has had manual
      hours added by an Editor (e.g. "Set build — 4
      hours"): confirm an "Other Hours" section appears
      after the show groups, with the note text, date,
      and hours displayed.

- [ ] **12.3 V7** — For a volunteer with no manual
      hours: confirm no "Other Hours" section appears
      at all.

- [ ] **12.3 V8** — For a new volunteer with no call
      history and no manual hours: expand the section
      and confirm the empty state reads "No calls on
      record yet."

- [ ] **12.3 V9** — Confirm there is no "manual hours"
      label anywhere visible on the volunteer card —
      not in the summary line, not in any section
      heading.

---

## PHASE 12.4 — Automated Thank-You Email & Fixes

**Automated thank-you email cron:**

- [ ] **12.4 V1** — *(Supabase cross-check)* Confirm the
      `thank_you_sent_at` column exists on the
      `show_dates` table:
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'show_dates'
          AND column_name = 'thank_you_sent_at';
      Must return one row: nullable timestamptz.

- [ ] **12.4 V2** — In Vercel dashboard → Settings →
      Cron Jobs: confirm two cron entries exist —
      `/api/cron/reminders` (0 5 * * *) and
      `/api/cron/thankyou` (0 7 * * *).

- [ ] **12.4 V3** — Confirm the cron route is protected:
      make an HTTP request to
      /api/cron/thankyou without the Authorization
      header (or with a wrong value). Confirm a 401
      response is returned.

- [ ] **12.4 V4** — *(Requires waiting for a real cron
      run OR triggering manually from Vercel dashboard)*
      After the cron runs against a show date that was
      2+ days ago with showed attendance: confirm in
      Supabase that `show_dates.thank_you_sent_at` is
      now populated for that date, and that an email_log
      row exists with recipient_filter = 'show_date:
      [dateId]' and recipient_type = 'transactional'.
      *(Supabase cross-check)*

- [ ] **12.4 V5** — *(Requires real email delivery)*
      After the thank-you cron runs: confirm a
      thank-you email arrives in a real inbox with
      subject "Thank you for volunteering — [show name]",
      the correct show name and date in the body, and
      the /callboard CTA link.

**Waitlist tab heading (E3 fix from 12.2c):**

- [ ] **12.4 V6** — Navigate to /crew/shows/[id] and
      click the Waitlist tab. Confirm a "Waitlist"
      heading (h2) appears at the top of the tab
      content area — even when the waitlist is empty.
      This heading should be visible alongside a ?
      tooltip icon.

**Editor Notes heading deduplication (Q1 fix
from 12.2c):**

- [ ] **12.4 V7** — Navigate to any volunteer profile.
      Confirm the "Editor Notes" heading appears exactly
      ONCE — not twice. (Previously one heading was in
      page.tsx and one inside the EditorNotes component;
      the page.tsx duplicate was removed.)

- [ ] **12.4 V8** — On the same volunteer profile, confirm
      the ? tooltip icon is still present next to the
      "Editor Notes" heading (it was moved to the
      component's internal heading in 12.4).

---

## ADMIN.25 — Deferred Item Sweep

**Default hours fallback (location-aware lookup):**

- [ ] **ADMIN.25 V1** — Mark a volunteer as Showed on a
      show that has no per-show default_hours override,
      at a location that has no default_hours set in the
      locations table. Confirm hours still populate
      automatically from the app_settings bucket fallback
      (e.g. Mainstage → 3 hours). *(Requires attendance
      marking on a show)*

- [ ] **ADMIN.25 V2** — *(Supabase cross-check)* In the
      Supabase dashboard SQL editor, set default_hours on
      one location directly:
        UPDATE locations
        SET default_hours = 2.5
        WHERE name = 'Studio X';
      Then mark attendance Showed on a Studio X show with
      no per-show override. Confirm hours logged = 2.5
      (the location default), not the app_settings value.
      Reset after testing:
        UPDATE locations SET default_hours = NULL
        WHERE name = 'Studio X';

**Buffer minute NaN fix:**

- [ ] **ADMIN.25 V3** — Navigate to /crew/shows/[id]/edit.
      On any show date row, clear the "Reserve before
      (minutes)" field completely (backspace until blank).
      Click Save. Confirm the form submits successfully
      and the field is saved as 0. No Zod validation
      error about NaN should appear.

**End time range on cancel page:**

- [ ] **ADMIN.25 V4** — On a show date that has end_time
      set: have a volunteer cancel their slot claim by
      visiting the cancel page (/cancel?token=...).
      Confirm the show time displays as a range
      (e.g. "7:30 PM – 10:00 PM") rather than just
      a start time. *(Requires a real cancellation flow)*

- [ ] **ADMIN.25 V5** — On a show date with no end_time
      set: visit the cancel page. Confirm only the start
      time appears (no range, no empty dash).

**Season filter on calendar:**

- [ ] **ADMIN.25 V6** — Navigate to /crew/calendar.
      Open the filter bar. Confirm a Season filter
      dropdown is present. Select a specific season
      (e.g. "Season 13"). Confirm only show-sourced
      performance events belonging to that season appear.
      Manual events (rehearsals, meetings, etc.) should
      remain visible regardless of season filter.

- [ ] **ADMIN.25 V7** — With the season filter applied,
      confirm that switching to a different season updates
      the calendar without a full page reload (URL param
      updates, server re-fetch occurs).

- [ ] **ADMIN.25 V8** — Clear the season filter
      (select "All Seasons" or equivalent). Confirm all
      approved events return to view.

---

## CAL.1 — Show Type → Location Migration

*After CAL.1, all shows use a location (from the locations
table) instead of a show_type text field. The show form
must load locations from the database.*

- [ ] **CAL.1 V1** — Navigate to /crew/shows/new. Confirm
      the location field renders as a dropdown (not a
      text input or hardcoded select). Confirm all 5
      seeded locations appear: Mainstage, Mainstage Lobby,
      Green Room, Studio X, Studio X Office.

- [ ] **CAL.1 V2** — Create a new show and select a
      location from the dropdown. Save. Confirm the show
      saves successfully. Navigate to the show detail
      page. Confirm the location name appears where show
      type previously appeared.

- [ ] **CAL.1 V3** — Edit an existing show. Confirm the
      location dropdown pre-fills with the show's current
      location. Change it to a different location. Save.
      Confirm the new location is reflected on the show
      detail and show list pages.

- [ ] **CAL.1 V4** — Navigate to /crew/shows. Confirm
      the show list displays location names (e.g.
      "Mainstage") with a colored badge where show
      type previously appeared. Confirm the filter
      dropdown for type/location shows location names
      (not show_type values like 'mainstage').

- [ ] **CAL.1 V5** — Navigate to /shows (public page).
      Confirm show location labels render correctly
      alongside each show card (location name, not a
      raw key like 'studio_x').

- [ ] **CAL.1 V6** — Navigate to /crew/shows/[id] (show
      detail). Confirm the location name appears in the
      Overview tab where the show type previously appeared.
      Confirm the Season at a Glance dashboard section
      still renders location badges correctly for live shows.

- [ ] **CAL.1 V7** — Mark a volunteer as Showed on the
      existing "Test" Mainstage show (which has 9 show
      dates and 9 slot claims). Confirm attendance is
      marked normally. Confirm default hours populate
      from the app_settings Mainstage fallback (3 hours)
      since no per-show or per-location override exists.
      *(Exercises the getLocationHoursBucket fallback
      added in CAL.1 and updated in ADMIN.25)*

---

## CAL.2 — Calendar Schema & Production Role

*CAL.2 added the Production role and Calendar nav link.
Production accounts can only access /crew/calendar.*

- [ ] **CAL.2 V1** — Log in as an existing Editor account.
      Confirm a "Calendar" nav link appears in the
      sidebar. Confirm all other nav items (Dashboard,
      Volunteers, Shows, etc.) are still present and
      functional.

- [ ] **CAL.2 V2** — Log in as Super Admin. Confirm the
      Calendar nav link appears in the sidebar. Confirm
      full navigation is intact.

- [ ] **CAL.2 V3** — Create a new admin account via the
      Request Access flow. As Super Admin, approve it
      with role = "Production." Log in as that account.
      Confirm login redirects to /crew/calendar (not
      /crew/dashboard). Confirm the sidebar shows ONLY
      the Calendar link (no Volunteers, Shows, Settings,
      Dashboard, etc.).

- [ ] **CAL.2 V4** — While logged in as a Production
      account: navigate directly to /crew/dashboard.
      Confirm you are redirected to /crew/calendar
      immediately — the dashboard is inaccessible.

- [ ] **CAL.2 V5** — While logged in as a Production
      account: navigate directly to /crew/volunteers.
      Confirm redirect to /crew/calendar.

- [ ] **CAL.2 V6** — In the TopBar, confirm the role
      badge displays "Production" (not "Viewer" or
      blank) for a Production-role account.

---

## CAL.3 — Show-to-Calendar Sync & Buffer Time

*CAL.3 wires show dates to calendar_events automatically
and adds buffer time fields to the show date form.*

**Google OAuth production role redirect:**

- [ ] **CAL.3 V1** — Sign in to a Production-role account
      via Google SSO (not email/password). Confirm the
      OAuth callback redirects to /crew/calendar — not
      /crew/dashboard. *(Requires a Production account
      with Google OAuth linked)*

**Show-to-calendar auto-sync:**

- [ ] **CAL.3 V2** — Create a new show date on an existing
      show (or create a new show with a date). After
      saving: check Supabase — confirm a calendar_events
      row now exists with source = 'show', status =
      'approved', event_type = 'performance', and
      start_time matching the show date's date + time
      in UTC. *(Supabase cross-check)*

- [ ] **CAL.3 V3** — Edit an existing show date — change
      its show_time. Save. Check Supabase — confirm the
      corresponding calendar_events row's start_time
      updated to match the new time. *(Supabase)*

- [ ] **CAL.3 V4** — Delete a show date (if the show has
      multiple dates). Check Supabase — confirm the
      calendar_events row with that source_show_date_id
      is gone (CASCADE delete). *(Supabase)*

**Buffer time fields:**

- [ ] **CAL.3 V5** — Navigate to /crew/shows/[id]/edit.
      On any show date row, confirm two new fields appear:
      "Reserve before (minutes)" and "Reserve after
      (minutes)". Both should default to 0 and be
      optional (no required indicator).

- [ ] **CAL.3 V6** — Set "Reserve before" to 60 and
      "Reserve after" to 30 on a show date. Save.
      Confirm in Supabase that a show_date_buffer row
      was created with the correct values for that
      show_date_id. *(Supabase)*

- [ ] **CAL.3 V7** — Edit the same show again. Confirm
      the buffer fields pre-fill with the saved values
      (60 before, 30 after) rather than resetting to 0.

- [ ] **CAL.3 V8** — Set both buffer fields back to 0
      and save. Confirm in Supabase the show_date_buffer
      row now shows 0/0 (not deleted). *(Supabase)*

---

## CAL.4a — End Time on Show Dates

*CAL.4a adds an optional End Time field to each show date.
When set, times display as a range throughout the app.*

- [ ] **CAL.4a V1** — Navigate to /crew/shows/[id]/edit.
      On any date row, confirm an "End Time" field
      appears immediately after the "Show Time" field.
      Confirm it is optional — no asterisk or required
      indicator. Confirm a placeholder or helper text
      reads "End time (optional)" or similar.

- [ ] **CAL.4a V2** — Set an end time on a show date
      (e.g. 10:00 PM for a 7:30 PM show). Save. Navigate
      to /crew/shows/[id] (admin show detail). Confirm
      the Dates tab shows the time as a range:
      "7:30 PM – 10:00 PM" for that date.

- [ ] **CAL.4a V3** — On the same show detail page,
      navigate to the Volunteers tab. Select the date
      with an end time. Confirm the date picker dropdown
      label also shows the time range format.

- [ ] **CAL.4a V4** — Leave a different show date's end
      time blank. Confirm only the start time appears
      for that date — no dash, no empty range, no error.

- [ ] **CAL.4a V5** — Navigate to /shows/[id] (public
      show page). Find the date with end time set.
      Confirm the time range displays correctly for
      public visitors. Confirm the date without end time
      shows only the start time.

- [ ] **CAL.4a V6** — Identify as a volunteer on
      /callboard. Find a show card for a show with end
      time set. Confirm the time range appears in the
      show card display. Confirm the date without end
      time shows only the start time.

- [ ] **CAL.4a V7** — *(Supabase cross-check)* After
      setting an end time: confirm the calendar_events
      row for that show date now has a correct end_time
      in UTC (matching the CT end time entered in the
      form). Confirm a show date with no end time has
      a calendar_events end_time approximately 3 hours
      after start_time (the fallback).

- [ ] **CAL.4a V8** — Edit the show date and remove the
      end time (clear the field). Save. Confirm the
      admin show detail returns to showing only the
      start time. Confirm in Supabase the calendar_events
      end_time reverts to the 3-hour fallback. *(Supabase)*

---

## CAL.4b — Master Calendar UI

*CAL.4b delivers the full /crew/calendar page with three
views, filter bar, location legend, and day detail panel.
Verify with real calendar_events data (seeded in CAL.5b
or created via the event form in CAL.5a).*

**Page load and navigation:**

- [ ] **CAL.4b V1** — Navigate to /crew/calendar as
      Editor. Confirm the page loads with the month
      view active. Confirm a "Calendar" nav link is
      highlighted as active in the sidebar.

- [ ] **CAL.4b V2** — Navigate to /crew/calendar as
      Super Admin. Confirm a "Pending Requests" link
      appears in the calendar header (Super Admin only).

- [ ] **CAL.4b V3** — Navigate to /crew/calendar as
      Production-role account. Confirm the calendar
      loads. Confirm no other nav items appear in the
      sidebar.

**Month view:**

- [ ] **CAL.4b V4** — In month view: confirm a 7-column
      grid renders for the current month. Confirm today's
      date is highlighted. Confirm days outside the
      current month are visually dimmed.

- [ ] **CAL.4b V5** — Click the "Previous" and "Next"
      navigation buttons. Confirm the calendar advances
      by one month each click. Confirm the period label
      (e.g. "July 2026") updates accordingly.

- [ ] **CAL.4b V6** — Click the "Today" button.
      Confirm the calendar returns to the current month
      and today's date is visible.

- [ ] **CAL.4b V7** — If approved calendar events exist:
      confirm colored event chips appear on the correct
      dates in the month grid. Confirm chip color matches
      the location's assigned color.

- [ ] **CAL.4b V8** — Click any day that has events.
      Confirm the day detail panel slides in from the
      right (desktop) or appears as a bottom sheet
      (mobile). Confirm booked events are listed in
      time order.

- [ ] **CAL.4b V9** — In the day detail panel: confirm
      an "Available Windows" section appears below the
      booked events. Confirm it lists each location with
      its free time slots within 7 AM–10 PM.

- [ ] **CAL.4b V10** — Close the day panel using the X
      button. Confirm it closes. Click the backdrop
      behind the panel. Confirm it also closes.

**Week view (room-booking grid):**

- [ ] **CAL.4b V11** — Switch to the Week view tab.
      Confirm the room-booking grid renders with rows
      for active locations and columns for Mon–Sun.
      Confirm the time axis shows 7 AM through 10 PM
      in 1-hour increments.

- [ ] **CAL.4b V12** — Confirm the "All Locations"
      toggle shows all 5 location rows. Toggle to
      "Booked Only." Confirm only locations with
      at least one event this week appear. Toggle back
      to "All Locations." Confirm all 5 rows return.

- [ ] **CAL.4b V13** — If approved events exist in
      the current week: confirm event blocks appear as
      colored rectangles positioned at the correct time
      within the grid. Confirm block height is
      proportional to event duration.

- [ ] **CAL.4b V14** — Click "Previous" and "Next"
      in the week view. Confirm the grid advances by
      one week. Confirm the period label updates
      (e.g. "Jul 13 – 19, 2026").

**Agenda view:**

- [ ] **CAL.4b V15** — Switch to the Agenda view tab.
      Confirm events are grouped by date with a date
      heading per day. Confirm events within each day
      are sorted by start time.

- [ ] **CAL.4b V16** — Confirm each event row shows:
      colored left border (location color), title,
      time range, and location name.

- [ ] **CAL.4b V17** — With no events in the next 90
      days (or after filtering to show no results):
      confirm a "No events" empty state message
      appears.

**Location legend:**

- [ ] **CAL.4b V18** — Confirm a location legend bar
      appears below the filter bar across all three
      views. Confirm it shows a colored circle and
      name for each active location. Confirm a
      "Locations:" label prefix appears before the
      chips.

**Filter bar:**

- [ ] **CAL.4b V19** — Open the location filter
      dropdown. Select one location. Confirm only
      events at that location appear on the calendar.
      Confirm the filter works without a page reload
      (client-side).

- [ ] **CAL.4b V20** — Open the event type filter.
      Select "Rehearsal." Confirm only rehearsal
      events appear. Clear the filter. Confirm all
      event types return.

- [ ] **CAL.4b V21** — Click "Clear filters" (or
      equivalent). Confirm all active filters reset
      simultaneously.

- [ ] **CAL.4b V22** — On a mobile viewport (< 768px):
      confirm the filter bar collapses to a "Filters"
      button. Tap it. Confirm the filters expand.

**Dark mode:**

- [ ] **CAL.4b V23** — Toggle to dark mode. Navigate
      to /crew/calendar. Confirm all three views render
      correctly — no light backgrounds or invisible text.
      Confirm event chips and filter dropdowns are
      readable in dark mode.

---

## CAL.5a — Event Creation & Submission Forms

*CAL.5a adds the event creation form for Super Admins
(direct-create) and submission flow for other roles
(pending approval).*

**Header button:**

- [ ] **CAL.5a V1** — Navigate to /crew/calendar as
      Super Admin. Confirm a dropdown button labeled
      "Add Event" appears in the calendar header.
      Click it. Confirm a dropdown opens with two
      options: "Single Event" and "Rehearsal
      Schedule."

- [ ] **CAL.5a V2** — Navigate to /crew/calendar as
      Editor. Confirm the button is labeled "Submit
      Request" (not "Add Event"). Confirm the same
      two dropdown options appear.

**Single event form — Super Admin:**

- [ ] **CAL.5a V3** — As Super Admin: click "Single
      Event." Confirm a modal form opens labeled
      "Add to Calendar." Confirm all fields are
      present: Title, Event Type, Location (required),
      Date, Start Time, End Time, Description,
      Requirements, Contacts section.

- [ ] **CAL.5a V4** — In the Event Type dropdown:
      confirm "Performance" is NOT listed as an
      option. Confirm "Rental" IS listed for Super
      Admin.

- [ ] **CAL.5a V5** — Select a Location, Date, Start
      Time, and End Time. Click "Check Availability."
      Confirm a result appears: either green
      "Available" or amber "Conflict detected"
      with the option to proceed anyway.

- [ ] **CAL.5a V6** — Fill all required fields and
      submit. Confirm the event appears immediately
      on the calendar as an approved event with the
      correct location color. Confirm no pending queue
      involvement.

**Single event form — non-Super-Admin:**

- [ ] **CAL.5a V7** — As Editor: click "Submit Request"
      → "Single Event." Confirm the form opens labeled
      "Submit for Approval." Confirm Location is
      labeled "Preferred Location (optional)" — not
      required. Confirm "Rental" is NOT in the event
      type dropdown.

- [ ] **CAL.5a V8** — Confirm a role note appears near
      the top of the form: "Your request will be
      reviewed by an admin who will assign a location
      and add it to the calendar."

- [ ] **CAL.5a V9** — Submit the form as Editor (with
      or without a preferred location). Confirm the
      event is NOT visible on the calendar to other
      roles. Log in as Super Admin — confirm the event
      IS visible on the calendar with dashed-border
      pending styling. Confirm the "Pending Requests"
      badge count incremented.

**Custom type label:**

- [ ] **CAL.5a V10** — In the event form, select
      "Other" as the Event Type. Confirm a "Custom
      Type Label" text field appears. Change to a
      different type. Confirm the field disappears.

**Contacts:**

- [ ] **CAL.5a V11** — In the Contacts section, click
      "Add Contact." Confirm a Name and Phone row
      appears. Add up to 5 contacts. Confirm the
      "Add Contact" button is hidden after the 5th
      contact is added. Remove one contact. Confirm
      the button reappears.

**Edit flow (Super Admin only):**

- [ ] **CAL.5a V12** — As Super Admin: click a day on
      the calendar to open the day panel. Find an
      approved event. Confirm an "Edit" button
      appears next to it. *(Viewer, Editor, Production
      should NOT see Edit buttons)*

- [ ] **CAL.5a V13** — Click "Edit" on an event in
      the day panel. Confirm the event form opens
      pre-filled with all existing data (title, type,
      location, date, times, description, contacts).

- [ ] **CAL.5a V14** — Change the title and save.
      Confirm the calendar updates immediately to
      show the new title.

**Conflict detection:**

- [ ] **CAL.5a V15** — Create an approved event
      (e.g. Mainstage, Monday 7 PM – 9 PM). Then
      open the event form again and try to create
      another event at Mainstage, Monday 8 PM – 10 PM.
      Click "Check Availability." Confirm a conflict
      warning appears. Confirm the Super Admin can
      still proceed and save anyway.

**Dark mode:**

- [ ] **CAL.5a V16** — Toggle to dark mode. Open the
      event creation form. Confirm it renders correctly
      — no light backgrounds or invisible text in the
      modal.

---

## CAL.5b — Bulk Rehearsal, Pending Queue & Book Space

*CAL.5b adds bulk rehearsal submission, the pending
approval queue, and the Book Space panel.*

**Seed data:**

- [ ] **CAL.5b V1** — Navigate to /crew/calendar
      (month or week view). Confirm the 8 seeded test
      events appear on the calendar on the correct dates
      (next week). Confirm events are color-coded by
      location. Confirm the 3 pending events are only
      visible to Super Admin with dashed-border styling.

**Bulk rehearsal form:**

- [ ] **CAL.5b V2** — Click the action dropdown →
      "Rehearsal Schedule." Confirm the bulk form
      opens labeled "Add Rehearsal Schedule" (Super
      Admin) or "Submit Rehearsal Schedule" (other
      roles).

- [ ] **CAL.5b V3** — Enter a Production Title and
      set Default Start Time (e.g. 7:00 PM) and
      Default End Time (e.g. 10:00 PM). Use the date
      picker to add 3 dates. Confirm each new date row
      auto-pre-fills with the default times.

- [ ] **CAL.5b V4** — Add dates in non-chronological
      order (e.g. Monday, then Saturday, then Wednesday).
      Confirm the date list auto-sorts chronologically
      after each add — no manual sort button needed.

- [ ] **CAL.5b V5** — Change the Default Start Time
      to 2:00 PM. Click "Apply to all dates." Confirm
      all existing date rows update their Start Time to
      2:00 PM.

- [ ] **CAL.5b V6** — Override one individual date's
      time by editing its Start/End Time fields directly
      in the table. Click "Apply to all dates" again.
      Confirm ALL rows update to the default (including
      the manually edited one).

- [ ] **CAL.5b V7** — Click "Apply to all dates" with
      the Default Start Time field empty. Confirm an
      inline validation message appears rather than
      silently resetting all times to blank.

- [ ] **CAL.5b V8** — Submit the rehearsal batch as
      Editor. Confirm all dates are saved as pending
      events. Navigate to /crew/calendar/pending as
      Super Admin. Confirm the batch appears grouped
      under the submitted title.

**Pending approval queue:**

- [ ] **CAL.5b V9** — As Super Admin: navigate to
      /crew/calendar/pending. Confirm the page loads
      (not a 404). Confirm the 3 seeded pending events
      appear. Confirm any pending event with a preferred
      location shows a conflict indicator (⚠ or ✓
      based on whether that location is booked at that
      time).

- [ ] **CAL.5b V10** — For a pending event with a
      preferred location already set: confirm the
      Approve button is enabled without touching the
      location dropdown. Click Approve. Confirm the
      event is approved, appears on the calendar, and
      is removed from the queue.

- [ ] **CAL.5b V11** — For a pending event with no
      preferred location: confirm the Approve button
      is disabled until a location is selected from
      the dropdown.

- [ ] **CAL.5b V12** — Change the location selector
      for a pending event to a different location.
      Confirm the conflict indicator updates immediately
      (without page reload) to reflect availability at
      the new location.

- [ ] **CAL.5b V13** — On a rehearsal batch in the
      pending queue: click "Approve All Available."
      Confirm all non-conflicted dates with a location
      assigned are approved. Confirm any conflicted or
      no-location dates remain in the queue.

- [ ] **CAL.5b V14** — After approving events from the
      queue: navigate to /crew/calendar. Confirm the
      newly approved events appear on the calendar with
      correct location colors and times.

- [ ] **CAL.5b V15** — Confirm the "Pending Requests"
      badge count in the calendar header decrements
      correctly as events are approved. Badge should
      hide when count reaches 0.

**Book Space panel:**

- [ ] **CAL.5b V16** — As Super Admin: confirm a
      "Book Space" button is visible in the calendar
      header. Log in as Editor (with calendar_editor =
      false by default). Confirm the Book Space button
      is NOT visible. *(Requires editor account)*

- [ ] **CAL.5b V17** — As Super Admin: click "Book
      Space." Confirm a panel slides in from the LEFT
      side of the viewport (not the right — day panel
      opens from the right).

- [ ] **CAL.5b V18** — In the Book Space panel: enter
      a date, start time, and end time. Click "Find
      Available Spaces" (or "Search Availability").
      Confirm results appear showing which locations
      are available (green) and which are booked (amber/
      red with conflicting event info).

- [ ] **CAL.5b V19** — Click "Book This Slot" on an
      available location. Confirm the Book Space panel
      closes and the single event creation form opens
      pre-filled with the selected date, time, and
      location.

**calendarEditor flag:**

- [ ] **CAL.5b V20** — *(Supabase cross-check)* In
      Supabase, set calendar_editor = true on an Editor
      account:
        UPDATE admin_users
        SET calendar_editor = true
        WHERE email = '[editor email]';
      Log in as that Editor. Confirm the header button
      now reads "Add Event" (not "Submit Request").
      Submit a single event. Confirm it appears on the
      calendar immediately as approved (not pending).
      Reset after testing:
        UPDATE admin_users
        SET calendar_editor = false
        WHERE email = '[editor email]';

**Dark mode:**

- [ ] **CAL.5b V21** — Toggle to dark mode. Confirm the
      bulk rehearsal form, pending queue page, and Book
      Space panel all render correctly — no light
      backgrounds or invisible text.

---

## CAL.5b-FIX — Post-Audit Targeted Fixes

*These items verify specific gaps identified in the
CAL.5b-AUDIT findings report and fixed in CAL.5b-FIX.*

- [ ] **CAL.5b-FIX V1** — Navigate to /crew/calendar.
      Confirm the location legend bar shows a "Locations:"
      text label before the first colored chip. Confirm
      this label is visible in all three views (Month,
      Week, Agenda).

- [ ] **CAL.5b-FIX V2** — Click a specific day in the
      month or week view to open the day panel. Then
      click the action dropdown → "Rehearsal Schedule."
      Confirm the bulk form opens with one date row
      already pre-filled with the day you clicked.

- [ ] **CAL.5b-FIX V3** — Open the bulk rehearsal form.
      Set Default Start Time to 7:00 PM and Default End
      Time to 10:00 PM. Use the date picker to add a
      date. Confirm the new date row auto-pre-fills with
      7:00 PM start and 10:00 PM end. Add another date.
      Confirm it also pre-fills automatically.

- [ ] **CAL.5b-FIX V4** — Confirm there is NO "Sort
      Chronologically" button anywhere on the bulk
      rehearsal form. Dates should sort automatically
      after each add — no manual sort trigger needed.

- [ ] **CAL.5b-FIX V5** — Add dates in non-chronological
      order and confirm they auto-sort after every add.
      This confirms the auto-sort-on-add behavior.

- [ ] **CAL.5b-FIX V6** — In the pending queue, for a
      pending event that has a preferred location set:
      confirm the conflict indicator (⚠ / ✓ / —) is
      pre-populated on page load based on a server-side
      conflict check. You should not need to touch the
      location dropdown to see the initial conflict
      status.

- [ ] **CAL.5b-FIX V7** — In the pending queue: change
      the location selector for a pending event. Confirm
      the conflict indicator updates immediately (within
      1–2 seconds) to reflect the new location's
      availability.

- [ ] **CAL.5b-FIX V8** — In the pending queue: for a
      pending event where the selected location has a
      conflict: confirm the Approve button is visually
      disabled (greyed out, not clickable).

- [ ] **CAL.5b-FIX V9** — In the Book Space panel:
      search for availability. Confirm results appear
      correctly (this verifies the findAvailableSlots
      return key fix — previously the panel showed
      no results due to a .results vs .slots mismatch).

---

## CAL.5b-FIX2 — Approve Fallback Fix

*CAL.5b-FIX2 fixes the handleApproveSingle() function
so that individual pending events with a preferred
location can be approved without touching the dropdown.*

- [ ] **CAL.5b-FIX2 V1** — In the pending queue: find
      an individual pending event (not part of a batch)
      that was submitted with a preferred location_id
      set. WITHOUT touching the location selector
      dropdown: confirm the Approve button is ENABLED
      (not greyed out). The preferred location should
      pre-fill the selector visually.

- [ ] **CAL.5b-FIX2 V2** — Click Approve on that event
      without touching the dropdown. Confirm the event
      is approved successfully into the preferred
      location. Confirm it appears on the calendar at
      that location.

- [ ] **CAL.5b-FIX2 V3** — Find a pending event with
      NO preferred location_id set. Confirm the Approve
      button is DISABLED until a location is manually
      selected from the dropdown. Select a location.
      Confirm the button becomes enabled.

- [ ] **CAL.5b-FIX2 V4** — *(Q8 note — expected
      behavior to document)* For a BATCH date that was
      submitted with a preferred location: the Approve
      button for batch-date rows may still appear
      disabled until the dropdown is touched (Q8 from
      CAL.5b-FIX2 build report — the batch-context
      disable condition was not updated in FIX2). Note
      whether the button is enabled or disabled without
      touching the dropdown. This is a known limitation
      to be addressed in CAL.8.

---

## ADMIN.26 — CAL Phase Cleanup & Debt Resolution

**User management in-place refresh (users.ts
migration from window.location.href → router.refresh):**

- [ ] **ADMIN.26 V1** — Navigate to /crew/settings/users
      as Super Admin. Create a new admin account (any
      name/email/role). Confirm the new user appears
      in the list without a full page reload.

- [ ] **ADMIN.26 V2** — Deactivate a user from the
      list. Confirm the row updates in place (Active →
      Deactivated) without a full page reload.

- [ ] **ADMIN.26 V3** — Reactivate that user. Confirm
      the row updates in place without a full page
      reload.

- [ ] **ADMIN.26 V4** — Change a user's role (e.g.
      Editor → Viewer). Confirm the role badge updates
      in place without a full page reload.

**changeRole() server-side guards:**

- [ ] **ADMIN.26 V5** — Attempt to change a user's
      role to Production using the UI role selector.
      Confirm the Production option is absent from the
      selector (UI guard from CAL.6). *(The server-side
      guard is a defense-in-depth measure for direct
      API calls — not verifiable through normal UI.)*

- [ ] **ADMIN.26 V6** — *(Verify own-account guard
      exists)* As Super Admin, attempt to change your
      own role using the role selector. Confirm the
      selector is disabled or absent on your own row.
      *(Pre-existing guard — confirming it still works
      after ADMIN.26 refactor)*

**Waitlist promotion email calendar link
(sendWaitlistPromotionEmail update):**

- [ ] **ADMIN.26 V7** — *(Requires real email delivery)*
      Promote a waitlisted volunteer by cancelling the
      claim ahead of them. Confirm the promotion email
      received by the promoted volunteer contains an
      "Add to your calendar" link (📅 Add to your
      calendar). Confirm the link points to
      /api/calendar/claim.ics?token=[token].

- [ ] **ADMIN.26 V8** — *(Requires real email delivery)*
      Click the "Add to your calendar" link in the
      waitlist promotion email. Confirm a .ics file
      downloads with the correct show name, date, time,
      and role name.

**Slot claim .ics fixed filename:**

- [ ] **ADMIN.26 V9** — Download a slot claim .ics
      file via /api/calendar/claim.ics?token=[valid
      claim token]. Confirm the downloaded filename is
      "volunteer-call.ics" — not the show name.

**Audit log regression check:**

- [ ] **ADMIN.26 V10** — After performing any user
      management action (create, deactivate, reactivate,
      or role change), navigate to /crew/settings/audit-
      log. Confirm the corresponding audit entry appears
      (user.create, user.deactivate, etc.) with correct
      before/after values. *(Confirms audit logging
      still works after getServerClient() migration)*

---

## CAL.6 — Calendar Editor Toggle & Batch Approve Fix

**Calendar Editor toggle on user management page:**

- [ ] **CAL.6 V1** — Navigate to /crew/settings/users
      as Super Admin. Confirm an Editor account row
      shows a "Calendar Editor" checkbox. Confirm a
      Viewer account row also shows the checkbox.
      Confirm a Super Admin row does NOT show it.
      Confirm a Production-role row does NOT show it.

- [ ] **CAL.6 V2** — Toggle Calendar Editor ON for an
      Editor account. Confirm the checkbox updates in
      place (router.refresh() — no full page reload).
      Confirm no error message appears.

- [ ] **CAL.6 V3** — Log in as that Editor account.
      Confirm the calendar header button now reads
      "Add Event" (not "Submit Request"). Create a
      single event. Confirm it appears on the calendar
      immediately as approved (not pending).

- [ ] **CAL.6 V4** — Log back in as Super Admin.
      Toggle Calendar Editor OFF for that Editor.
      Log in as the Editor again. Confirm the header
      button reverts to "Submit Request." Submit an
      event. Confirm it goes to the pending queue.

- [ ] **CAL.6 V5** — After toggling Calendar Editor
      ON or OFF: navigate to /crew/settings/audit-log.
      Confirm a user.calendar_editor_change entry
      appears with the correct before/after values.

**Batch approve button disabled condition fix:**

- [ ] **CAL.6 V6** — In the pending queue: find a
      rehearsal batch whose dates were submitted with
      a preferred location. WITHOUT touching the
      location selector dropdown on any batch date row:
      confirm the Approve button for those rows is
      ENABLED (not greyed out). The preferred location
      should appear pre-selected in the dropdown.

- [ ] **CAL.6 V7** — Click Approve on a batch date
      with a preferred location without touching the
      dropdown. Confirm the event is approved into
      the preferred location and appears on the calendar.

- [ ] **CAL.6 V8** — For a Production-role account
      (if one exists): navigate to /crew/settings/users.
      Confirm the Production row renders correctly —
      role badge shows "Production," no role selector
      visible, no Calendar Editor checkbox visible.
      Confirm the page does not crash.

---

## CAL.7 — Public Calendar, iCalendar Export &
           Volunteer Slot-Claim .ics

**Public /calendar page:**

- [ ] **CAL.7 V1** — Navigate to /calendar (no login
      required). Confirm the page loads with the
      current month's grid. Confirm it is light mode
      only — no dark background even if the browser
      prefers dark. Confirm it is branded with the 30
      By Ninety visual identity.

- [ ] **CAL.7 V2** — Confirm performance events (from
      live approved shows) appear as colored pills on
      the correct dates. Confirm pill color matches
      the show's location color.

- [ ] **CAL.7 V3** — If a show date has at least one
      open volunteer slot: confirm an orange indicator
      ("Volunteers needed" or similar) appears on
      that day's pill or cell.

- [ ] **CAL.7 V4** — Click an event pill. Confirm the
      show name, time range, and "Sign up to
      volunteer →" link appear. Confirm clicking the
      link navigates to /shows/[showId].

- [ ] **CAL.7 V5** — Click the previous month (←)
      and next month (→) navigation buttons. Confirm
      the grid advances by one month and the period
      label updates.

- [ ] **CAL.7 V6** — Confirm a "View Calendar" link
      or button is visible on the public landing page
      (/). Confirm clicking it navigates to /calendar.
      Confirm a "View Calendar →" link also appears
      on the /shows page.

- [ ] **CAL.7 V7** — On a 375px viewport (mobile):
      confirm /calendar renders without horizontal
      scroll. Confirm day cells are readable. Confirm
      event pills are visible (as dots or abbreviated
      text). Confirm month navigation works.

**Admin iCalendar export:**

- [ ] **CAL.7 V8** — Navigate to /crew/calendar as
      any admin role. Confirm an "Export" button is
      visible in the calendar header.

- [ ] **CAL.7 V9** — Click Export. Confirm a modal
      opens labeled "Export / Subscribe to Calendar."
      Confirm two sections are visible: Subscribe
      (with a URL field and copy button) and Download
      (with a download link).

- [ ] **CAL.7 V10** — Click the copy button next to
      the subscription URL. Confirm a 2-second
      "Copied!" feedback appears.

- [ ] **CAL.7 V11** — Click "Download calendar
      (.ics)". Confirm a .ics file downloads. Open
      it in a text editor. Confirm it contains
      VCALENDAR / VEVENT blocks with correct event
      titles and dates.

- [ ] **CAL.7 V12** — *(Requires Google Calendar or
      Apple Calendar)* Paste the subscription URL
      into a calendar app as a URL subscription.
      Confirm events appear and are correctly named.
      *(Owner manual action — calendar app required)*

- [ ] **CAL.7 V13** — Click "Rotate subscription
      URL" in the Export modal. Confirm the displayed
      URL changes immediately (new token). Confirm
      the old URL now returns 401 when accessed
      directly.

- [ ] **CAL.7 V14** — Visit /api/calendar/feed.ics
      with no token or an invalid token. Confirm a
      401 response is returned.

**Volunteer slot-claim .ics:**

- [ ] **CAL.7 V15** — *(Requires real email delivery)*
      Claim a slot via /shows/[id]. Confirm the claim
      confirmation email contains a "📅 Add to your
      calendar" link. Confirm the link points to
      /api/calendar/claim.ics?token=[claim_token].

- [ ] **CAL.7 V16** — Click the "Add to your
      calendar" link from the claim email. Confirm
      a .ics file downloads named "volunteer-call.ics"
      (not the show name). Open it — confirm it
      contains one VEVENT with the show name, role,
      correct date, time range, and location.

- [ ] **CAL.7 V17** — Visit /api/calendar/claim.ics
      with an invalid or expired token. Confirm a
      404 response.

- [ ] **CAL.7 V18** — Identify as a volunteer on
      /callboard who has a currently claimed (unresolved)
      call. Expand the call history section. Confirm
      an "Add to calendar" link appears on that
      claimed-and-unresolved row. Confirm it is absent
      on rows with attendance status (showed/no-show/
      excused).

- [ ] **CAL.7 V19** — Click "Add to calendar" on a
      Call Board call history row. Confirm the .ics
      file downloads with the correct show data.

---

## CAL.8 — Location Management Settings,
           General Defaults Update & Batch Conflict Fix

**Location Management settings page:**

- [ ] **CAL.8 V1** — Navigate to /crew/settings as
      Super Admin. Confirm a "Location Management"
      card is visible and linked. Click it. Confirm
      /crew/settings/locations loads.

- [ ] **CAL.8 V2** — Navigate to /crew/settings as
      Editor. Confirm the Location Management card
      is visible but locked ("Super Admin only"
      indicator). Confirm clicking it does not
      navigate to /crew/settings/locations.

- [ ] **CAL.8 V3** — On /crew/settings/locations as
      Super Admin: confirm all 5 seeded locations
      appear (Mainstage, Mainstage Lobby, Green Room,
      Studio X, Studio X Office), each with a colored
      dot, name, ↑↓ reorder buttons, Edit, and
      Deactivate controls.

- [ ] **CAL.8 V4** — Navigate directly to
      /crew/settings/locations as Editor. Confirm
      you are redirected to /crew/settings.

- [ ] **CAL.8 V5** — Click "Edit" on Mainstage.
      Confirm an inline edit form appears with the
      name pre-filled, a color picker pre-filled
      with the current hex (#293994), and a
      default_hours field (blank or pre-filled if
      set). Change the name to "Mainstage Stage"
      and save. Confirm the list updates to show
      the new name. Change it back to "Mainstage"
      and save.

- [ ] **CAL.8 V6** — Click the color picker on any
      location's edit form. Confirm the native OS
      color picker opens. Select a new color. Confirm
      the hex value updates in the text next to the
      picker. Save. Confirm the colored dot in the
      list reflects the new color. Revert to the
      original color.

- [ ] **CAL.8 V7** — Set a default_hours value (e.g.
      2.5) on Studio X Office via the edit form.
      Save. Confirm the value persists when you
      re-open the edit form.

- [ ] **CAL.8 V8** — Use the ↑↓ arrows to reorder
      a location. Confirm the visual order changes
      immediately. Reload the page. Confirm the new
      order persists.

- [ ] **CAL.8 V9** — Click "Deactivate" on a
      location (e.g. Mainstage Lobby). Confirm the
      row becomes visually muted with a "Deactivated"
      badge. Confirm the reorder arrows are disabled
      on that row.

- [ ] **CAL.8 V10** — After deactivating Mainstage
      Lobby: navigate to /crew/calendar week view.
      Confirm Mainstage Lobby no longer appears as
      a row in the grid.

- [ ] **CAL.8 V11** — Reactivate Mainstage Lobby.
      Confirm it reappears on the Location Management
      page. Navigate to /crew/calendar week view.
      Confirm Mainstage Lobby reappears as a row.

- [ ] **CAL.8 V12** — After adding a new location
      (or modifying an existing one): navigate to
      /crew/calendar. Confirm the location legend
      at the bottom of the filter bar reflects the
      current active locations.

- [ ] **CAL.8 V13** — Navigate to /crew/settings/
      general. Confirm a note appears above or within
      the Default Hours section explaining that
      per-location defaults take precedence and
      linking to "Location Management." Click the
      link. Confirm it navigates to
      /crew/settings/locations.

- [ ] **CAL.8 V14** — Navigate to /crew/settings/
      audit-log. After creating, editing, reordering,
      or deactivating a location: confirm the
      corresponding audit entry appears (location.create,
      location.update, location.reorder, or
      location.deactivate).

- [ ] **CAL.8 V15** — Toggle to dark mode. Navigate
      to /crew/settings/locations. Confirm the page
      renders correctly — no light backgrounds, no
      invisible text, colored dots visible.

**Batch location conflict check fix:**

- [ ] **CAL.8 V16** — In the pending queue: find a
      rehearsal batch with multiple pending dates.
      Click "Apply location to all dates" (or the
      equivalent button that sets the same location
      for all batch rows at once). Confirm conflict
      indicators update for ALL dates in the batch —
      not just the rows whose dropdowns were touched
      individually.

- [ ] **CAL.8 V17** — During the batch conflict
      check: confirm the "Approve All Available"
      button is disabled while the check runs, and
      a "Checking availability..." indicator
      appears near the batch Apply button.

- [ ] **CAL.8 V18** — After the batch conflict
      check completes: confirm conflict indicators
      are accurate for all rows (⚠ for conflicted, ✓
      for available). Confirm "Approve All Available"
      re-enables for non-conflicted rows.

---

## CAL.9 — Unified Week Grid & Mobile Optimization

**Unified week grid (desktop ≥ 768px):**

- [ ] **CAL.9 V1** — Navigate to /crew/calendar and
      switch to the Week view on a desktop viewport
      (≥ 768px). Confirm ONE unified grid renders
      (not separate rows per location). Confirm events
      from different locations appear on the same
      grid, each color-coded by their location color.

- [ ] **CAL.9 V2** — Confirm the "All Locations /
      Booked Only" toggle is GONE from the week view
      header. It should not appear anywhere in the
      week view.

- [ ] **CAL.9 V3** — If two approved events exist at
      overlapping times in different locations (or
      the same location): confirm they render side-by-
      side in the same day column (column splitting),
      not one covering the other.

- [ ] **CAL.9 V4** — Confirm buffer blocks (if any
      show dates have non-zero buffer_before or
      buffer_after) render as lighter-shade blocks
      behind their parent performance event at the
      correct time position.

- [ ] **CAL.9 V5** — Confirm a red horizontal line
      appears at the current time when viewing the
      current week. Navigate to a different week.
      Confirm the line disappears.

- [ ] **CAL.9 V6** — On an event block that is tall
      enough (≥ 48px): confirm the location name
      appears as a secondary line below the title.

**Mobile week view (< 768px):**

- [ ] **CAL.9 V7** — On a mobile viewport (< 768px):
      switch to the Week view. Confirm the full week
      grid does NOT render. Instead, confirm a week
      agenda view appears — events listed
      chronologically grouped by day (Mon through Sun
      for the current week).

- [ ] **CAL.9 V8** — Confirm a note appears on the
      mobile week view: "For the full weekly grid
      view, use a larger screen" (or equivalent text).

**Mobile calendar header:**

- [ ] **CAL.9 V9** — On a mobile viewport: confirm
      a "⋯" (More) button appears in the calendar
      header. Confirm the "Add Event" / "Submit
      Request" primary button is still visible.
      Confirm Export, Book Space, and Pending Requests
      buttons are NOT individually visible — they
      should be collapsed into the ⋯ menu.

- [ ] **CAL.9 V10** — Tap the ⋯ button. Confirm a
      dropdown opens containing Export, Book Space
      (if applicable), and Pending Requests (Super
      Admin). Tap Export. Confirm the Export modal
      opens.

- [ ] **CAL.9 V11** — On a desktop viewport (≥768px):
      confirm all header buttons remain individually
      visible (Export, Book Space if applicable,
      Pending Requests if Super Admin, Add Event/
      Submit Request). No ⋯ button on desktop.

**Mobile forms (bottom sheets):**

- [ ] **CAL.9 V12** — On a mobile viewport: click
      "Add Event" → "Single Event." Confirm the
      CalendarEventForm appears as a bottom sheet
      (slides up from bottom, full width, rounded
      top corners). Confirm the footer buttons
      (Cancel / Submit) are visible without scrolling.

- [ ] **CAL.9 V13** — On a mobile viewport: click
      "Add Event" → "Rehearsal Schedule." Confirm
      the CalendarBulkRehearsalForm appears as a
      bottom sheet. Confirm date rows and default
      time fields stack vertically on mobile (not
      horizontal overflow).

**Mobile pending queue:**

- [ ] **CAL.9 V14** — On a mobile viewport: navigate
      to /crew/calendar/pending. Confirm the batch
      date rows stack vertically (flex-col on mobile)
      — date, time, location selector, and actions
      each appear on their own line rather than a
      single overflowing horizontal row.

**Mobile month and agenda views:**

- [ ] **CAL.9 V15** — On a mobile viewport: confirm
      the Month view renders correctly. Day cells are
      readable, event pills are visible, and there is
      no horizontal scroll.

- [ ] **CAL.9 V16** — On a 375px viewport:
      confirm /crew/calendar in Month view has no
      horizontal scroll and all text is readable.

- [ ] **CAL.9 V17** — On a mobile viewport: switch
      to Agenda view. Confirm event rows are
      tap-friendly (adequate height for touch targets).
      Confirm the filter bar collapses to a Filters
      button.

**Public /calendar mobile:**

- [ ] **CAL.9 V18** — On a 375px viewport: confirm
      /calendar (public) renders without horizontal
      scroll. Confirm event pills appear as colored
      dots (not overflowing text). Confirm month
      navigation prev/next buttons are accessible.

**Dark mode:**

- [ ] **CAL.9 V19** — Toggle to dark mode. Navigate
      to /crew/calendar week view on desktop. Confirm
      the unified grid renders correctly — time axis
      labels, grid lines, and event blocks all visible.
      No invisible text or missing backgrounds.

---

## CAL.10a — Recurring Events: Schema & Utilities

*CAL.10a is the data-layer foundation — no UI is visible
yet. All verification items are Supabase cross-checks
and utility function tests.*

**Schema verification (Supabase cross-checks):**

- [ ] **CAL.10a V1** — *(Supabase)* Confirm the
      `recurrence_groups` table exists with the correct
      columns:
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'recurrence_groups'
        ORDER BY ordinal_position;
      Must return: id, title, event_type,
      custom_type_label, location_id, start_time,
      end_time, description, requirements, frequency,
      series_start_date, series_end_date, status,
      submitted_by, created_at.

- [ ] **CAL.10a V2** — *(Supabase)* Confirm
      `calendar_events.recurrence_group_id` exists:
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'calendar_events'
          AND column_name = 'recurrence_group_id';
      Must return one row: nullable uuid.

- [ ] **CAL.10a V3** — *(Supabase)* Confirm RLS on
      `recurrence_groups`:
        SELECT policyname FROM pg_policies
        WHERE tablename = 'recurrence_groups';
      Must return exactly 3 policies:
      authenticated_select_recurrence_groups,
      authenticated_insert_recurrence_groups,
      super_admin_modify_recurrence_groups.

- [ ] **CAL.10a V4** — *(Supabase)* Confirm an INSERT
      into recurrence_groups as an authenticated admin
      user succeeds. Use the SQL editor while logged in:
        INSERT INTO recurrence_groups (title, event_type,
          frequency, series_start_date, submitted_by,
          start_time, end_time)
        VALUES ('Test Series', 'rehearsal', 'weekly',
          CURRENT_DATE, [your admin_users id],
          '19:00', '22:00');
      Must succeed. Delete the test row after.

- [ ] **CAL.10a V5** — *(Supabase)* Confirm the
      ON DELETE SET NULL behavior: delete a test
      recurrence_groups row. Confirm the corresponding
      calendar_events rows have recurrence_group_id
      set to NULL (not deleted). *(Only test if a
      test series exists — skip if no test data.)*

**Utility function spot-checks:**

- [ ] **CAL.10a V6** — *(Developer test)* In a
      browser console or Node.js REPL with
      lib/utils/calendar-recurrence.ts available:
      call generateOccurrenceDates('2026-07-21',
      'weekly', null) and confirm it returns exactly
      52 dates (or correct count to 12-month cap),
      each 7 days apart.

- [ ] **CAL.10a V7** — *(Developer test)* Call
      generateOccurrenceDates('2026-01-31',
      'monthly', null, 3). Confirm the second date
      is '2026-02-28' (not Feb 30 or Feb 31 — date-fns
      month-end handling).

- [ ] **CAL.10a V8** — *(Developer test)* Call
      generateOccurrenceDates with an endDate earlier
      than the cap. Confirm the returned array stops
      at or before the endDate.

- [ ] **CAL.10a V9** — *(Developer test)* Call
      describeRecurrence('weekly', '2026-07-21',
      null). Confirm the result contains 'Weekly on
      Mondays' (or correct day name for July 21, 2026)
      and a count.

- [ ] **CAL.10a V10** — *(Developer test)* Call
      describeRecurrence('monthly', '2026-01-31',
      null). Confirm the result contains 'Monthly on
      the 31st.'

---

## CAL.10b — Recurring Events: Creation UI & Shell
             Wiring

**Action dropdown third option:**

- [ ] **CAL.10b V1** — Navigate to /crew/calendar as
      Super Admin. Click the "Add Event" dropdown.
      Confirm THREE options appear: "Single Event,"
      "Rehearsal Schedule," and "Recurring Event."

- [ ] **CAL.10b V2** — Navigate as Editor. Click
      "Submit Request." Confirm the same three
      options appear.

**Recurring Event creation form:**

- [ ] **CAL.10b V3** — Click "Recurring Event."
      Confirm a modal form opens labeled "Add
      Recurring Event" (Super Admin) or "Submit
      Recurring Event" (Editor). Confirm all fields
      are present: Title, Event Type, Location
      (required for Super Admin, optional for others),
      Start Time, End Time, Frequency radio buttons
      (Weekly / Bi-Weekly / Monthly), First Occurrence
      (date), Last Occurrence (optional date),
      Description, Requirements, Contacts.

- [ ] **CAL.10b V4** — Set Frequency to Weekly and
      enter a First Occurrence date. Confirm a live
      preview appears below the date fields: e.g.
      "Weekly on Mondays — 52 events through Jul 2027"
      (count and end date will vary). Confirm the
      preview updates when you change the frequency
      or Last Occurrence date.

- [ ] **CAL.10b V5** — Change Frequency to Monthly.
      Confirm the preview updates to "Monthly on the
      [Nth] — N events through [date]".

- [ ] **CAL.10b V6** — Set a Last Occurrence date
      approximately 1 month from the First Occurrence.
      Confirm the preview shows a much smaller event
      count (1–5 events) rather than the full 12-month
      cap.

- [ ] **CAL.10b V7** — As Super Admin: fill in all
      required fields and click "Add to Calendar."
      Confirm a success message appears ("Created N
      recurring events."). Confirm the form closes.
      Navigate to /crew/calendar. Confirm events from
      the series appear on the correct dates with the
      correct location color.

- [ ] **CAL.10b V8** — As Editor: submit a recurring
      event series. Confirm the form shows "Submit
      for Approval." After submitting, confirm the
      events appear in the pending queue
      (/crew/calendar/pending) under a "Recurring
      Events" section, NOT in "Individual Requests."

- [ ] **CAL.10b V9** — Confirm the Rental event type
      is NOT available in the type dropdown for
      Editor. Confirm it IS available for Super Admin.

- [ ] **CAL.10b V10** — Add 2 contacts to the form
      (name + phone each). Submit. Confirm the
      recurring events were created with those contacts.
      *(Supabase cross-check: SELECT * FROM
      calendar_event_contacts WHERE calendar_event_id
      IN (SELECT id FROM calendar_events WHERE
      recurrence_group_id = [new group id]);)*

**Regression check — non-recurring edit:**

- [ ] **CAL.10b V11** — Click on a non-recurring event
      in the day panel. Click the Edit button. Confirm
      the CalendarEventForm opens directly — NO scope
      picker appears. This confirms the branching logic
      correctly distinguishes recurring from non-
      recurring events.

**Dark mode:**

- [ ] **CAL.10b V12** — Toggle to dark mode. Open the
      Recurring Event form and the scope picker (by
      editing a recurring event if one exists). Confirm
      both render correctly — no light backgrounds or
      invisible text.

---

## CAL.10c — Recurring Events: Display, Day Panel
             & Pending Queue

*Prerequisites: at least one approved recurring event
series must exist (created in CAL.10b) to verify most
of these items. The pending queue items require at least
one submitted-but-pending recurring series.*

**Day panel — recurring event features:**

- [ ] **CAL.10c V1** — Click a day that has a recurring
      event. In the day panel Booked section, confirm
      the event shows a "↻ Part of a recurring series"
      note below the location name.

- [ ] **CAL.10c V2** — Confirm a non-recurring event
      (single manual event) on the same panel does NOT
      show the "↻ Part of a recurring series" note.

- [ ] **CAL.10c V3** — As Super Admin: click the Edit
      button on a recurring event in the day panel.
      Confirm the RecurrenceScopePicker modal appears
      BEFORE the edit form — showing three options:
      "Only this occurrence," "This and all future
      occurrences," "All occurrences."

- [ ] **CAL.10c V4** — Select "Only this occurrence"
      in the scope picker. Change the title. Save.
      Confirm only this occurrence's title changed on
      the calendar. Confirm other occurrences in the
      series still have the original title.

- [ ] **CAL.10c V5** — Select "This and all future
      occurrences" on a later occurrence. Change the
      start time. Confirm all future occurrences update
      to the new time. Confirm past occurrences are
      unchanged.

- [ ] **CAL.10c V6** — Select "All occurrences."
      Change the location. Confirm every event in the
      series now shows the new location color.

- [ ] **CAL.10c V7** — As Super Admin: click the
      "Cancel event" button on a recurring event.
      Confirm the RecurrenceScopePicker opens in
      cancel mode — option labels read "Only this
      occurrence," "This and all future occurrences,"
      "Cancel the entire series."

- [ ] **CAL.10c V8** — Select "Only this occurrence"
      in cancel mode. Confirm that one occurrence
      disappears from the calendar. Confirm other
      occurrences remain.

- [ ] **CAL.10c V9** — Select "Cancel the entire
      series." Confirm all occurrences in the series
      disappear from the calendar.

- [ ] **CAL.10c V10** — Click "Cancel event" on a
      non-recurring event. Confirm NO scope picker
      appears — the event is cancelled directly.
      Confirm it disappears from the calendar.

**Recurring indicators on event chips:**

- [ ] **CAL.10c V11** — In Month view: confirm that
      recurring event pills show a small "↻" icon
      in the top-right corner of the pill. Confirm
      non-recurring events do NOT show this icon.

- [ ] **CAL.10c V12** — In Agenda view: confirm that
      recurring events show a "↻ Recurring" label
      below the event title. Confirm non-recurring
      events do NOT show this label.

**Pending queue — Recurring Events section:**

- [ ] **CAL.10c V13** — Navigate to /crew/calendar/
      pending as Super Admin (with at least one
      pending recurring series). Confirm a "Recurring
      Events" section appears between the Rehearsal
      Batches section and the Individual Requests
      section.

- [ ] **CAL.10c V14** — In the Recurring Events
      section: confirm each group card shows the
      series title and a frequency badge ("Weekly,"
      "Bi-Weekly," or "Monthly").

- [ ] **CAL.10c V15** — Confirm recurring event
      occurrences do NOT appear in the "Individual
      Requests" section — they should only appear in
      "Recurring Events."

- [ ] **CAL.10c V16** — In the Recurring Events
      section: use the location selector dropdown on
      one pending occurrence. Confirm the conflict
      indicator updates (⚠ or ✓) for that occurrence.

- [ ] **CAL.10c V17** — Click "Approve All Available"
      on a recurring events group. Confirm that
      non-conflicted occurrences with a location
      selected are approved and appear on the calendar.
      Confirm conflicted occurrences remain in the
      queue.

- [ ] **CAL.10c V18** — After approving recurring
      events from the queue: navigate to /crew/calendar.
      Confirm the approved occurrences appear on the
      calendar with correct location colors, times,
      and the ↻ icon.

**Dark mode:**

- [ ] **CAL.10c V19** — Toggle to dark mode. Interact
      with a recurring event in the day panel (scope
      picker, edit form). Navigate to the pending
      queue's Recurring Events section. Confirm all
      components render correctly in dark mode — no
      light backgrounds or invisible text.

---

*Total items in this carry-forward list: 539*
*Prior (v7): 424 items through CAL.5b-FIX2*
*New (v8): 115 items —*
*10 ADMIN.26, 8 CAL.6, 19 CAL.7, 18 CAL.8,*
*19 CAL.9, 10 CAL.10a, 12 CAL.10b, 19 CAL.10c*
*Quick Reference expanded with CAL.6–CAL.10c and*
*ADMIN.26 categories. Seed Data Cleanup updated*
*with recurrence_groups test data. Metadata block*
*relocated from mid-document to document end.*
*(New items not counted as verification items)*
*Database-verifiable items handled separately in*
*30BN-DB-VERIFY.3 (not counted here)*
*Last updated: July 2026 — v8 (Phase CAL complete —*
*CAL.1–CAL.10c + ADMIN.26; Phase 13 next)*
*Previous version covered through CAL.5b-FIX2*

