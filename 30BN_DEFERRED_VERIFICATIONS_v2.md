# 30 By Ninety Theatre — Carry-Forward Verification Checklist
## Version 4 | July 2026 | Through Phase 10.1 (pre-Phase 11)

This document contains ONLY items requiring manual owner
verification — browser interaction, email inbox checks,
phone, or second account. Database-verifiable items are
handled separately in 30BN-DB-VERIFY.3.

Everything confirmed PASS in VERIFY-1 through VERIFY-4
has been removed. Items confirmed FAIL in VERIFY-1 were
fixed by ADMIN.14 and require re-verification (🔁).

Sections cover: ADMIN.14 re-verify, Phases 5–7 remaining,
ADMIN.15–19, Phase 8 (Call Board), Phase 9 (Hours &
Milestones), Phase 10 (Audit Log).

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
4.1 V9, 4.3 V17, 4.4a V6, 5.3 V9, 5.3 V13, 6.1 V11

### Requires real email delivery:
4.4b V2, 4.4b V7, 5.2 V2, 5.2 V3, 5.2 V9,
5.2 V16, 5.2 V17, 5.3 V2, 5.3 V6, 5.3 V7

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

### Phase 9.2 — requires real email delivery:
9.2 V1, V2, V3

### Phase 9.2 — requires Viewer account (A1):
9.2 V6

### Phase 10.1 — requires Viewer account (A1):
10.1 V2, 10.1 V9 (partial)

### Needs test data (VERIFY Test Form from SETUP-1):
6.2 V7–V12, 6.3 V8–V16

---

## NOTES ON VERIFY-5 ITEMS

VERIFY-5 was not yet run. The following items are listed
in this document as pending but will be confirmed or
cleared when VERIFY-5 runs:
5.3 V4, V5, V8, V10, V11, V12

If VERIFY-5 confirms them PASS, cross them off this list.
If any FAIL, add them to the fixes queue.

---

*Total items in this carry-forward list: 157*
*Includes: 6 ADMIN.14 re-verify, 52 Phase 4–6 items,*
*10 email delivery, 10 Phase 7/QR, Vercel cron,*
*23 ADMIN.15, 7 ADMIN.16, 2 ADMIN.17, 3 ADMIN.17-FIX,*
*6 ADMIN.19, 11 Phase 8, 8 Phase 9.1, 9 Phase 9.2,*
*9 Phase 10.1*
*Database-verifiable items handled separately in*
*30BN-DB-VERIFY.3 (not counted here)*
*Last updated: July 2026 — v4 (through Phase 10.1, pre-Phase 11)*
*Previous version covered through ADMIN.16 (pre-Phase 8)*
