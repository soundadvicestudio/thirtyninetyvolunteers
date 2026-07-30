# 30 By Ninety Theatre — Carry-Forward Verification Checklist
## Version 17 | July 2026 | Phase 19 Complete

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
Phase 12 (12.1–12.4), ADMIN.25, CAL.1–CAL.10c, ADMIN.26,
Phase 13 (13.1–13.4c), HELP.1–HELP.2d, ADMIN.27–29,
SETUP.0, Phase 14 (14.1–14.3), Phase 15 (15.1–15.2),
HELP.2e, ADMIN.33 (role permissions + branding + 404 page
customization), ADMIN.34 (QR history panel + OA approval),
Phase THEME (dynamic CSS brand color system —
THEME.A through THEME.3b-4), ADMIN.35 (dark mode main
content fix), ADMIN.36 (Google OAuth registration path),
ADMIN.37 (revalidatePath gaps + role guard fix),
ADMIN.38 (is_active Google path + Production role guards),
Phase 19 (communication preferences — 19.2 public forms,
19.3 Call Board + admin + volunteer list).

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

Also clean up any test blast emails and newly-logged
transactional emails created during Phase 13 testing:

  DELETE FROM email_log_recipients
  WHERE email_log_id IN (
    SELECT id FROM email_log
    WHERE recipient_type IN ('all','individual')
      AND sent_at > '2026-07-01'
  );

  DELETE FROM email_log
  WHERE recipient_type IN ('all','individual')
    AND sent_at > '2026-07-01';

Also clean up transactional log entries created during
Phase 13 testing (trigger:signup, trigger:slot_claim,
trigger:update_link_request, etc.) — these accumulate
from test actions and should be removed before launch:

  DELETE FROM email_log_recipients
  WHERE email_log_id IN (
    SELECT id FROM email_log
    WHERE recipient_type = 'transactional'
      AND sent_by IS NULL
      AND sent_at > '2026-07-01'
      AND recipient_filter NOT LIKE 'show_date:%'
  );

  DELETE FROM email_log
  WHERE recipient_type = 'transactional'
    AND sent_by IS NULL
    AND sent_at > '2026-07-01'
    AND recipient_filter NOT LIKE 'show_date:%';

Note: the recipient_filter NOT LIKE 'show_date:%'
guard preserves thank-you cron rows (already handled
by the existing thank-you cron cleanup block above).
Review all deletes carefully before running — only
remove test data, not any real volunteer interactions
that may have occurred.

Also clean up any consent_form_submissions rows
created during Phase 15.2 testing:

  DELETE FROM consent_form_submissions
  WHERE volunteer_id IN (
    SELECT id FROM volunteers
    WHERE email LIKE '%@30bn-test.invalid'
      OR email LIKE '%@test.invalid'
  );

Also clean up any test documents rows created during
Phase 15.1 testing (if any were added via the
Document Types Manager during verification):

  -- Remove any test document_types added (not the
  -- seeded system types — is_system = true ones
  -- should be kept). Only remove any test entries
  -- you added manually:
  -- DELETE FROM document_types
  -- WHERE is_system = false
  --   AND created_at > '2026-07-01'
  --   AND name LIKE 'Test%';
  -- (Review before running — only remove test rows,
  -- not any real document types added for production use)

Note: Supabase Storage files uploaded to the 'media'
bucket during testing (consent forms, test documents)
should be reviewed and deleted manually via the
Supabase dashboard → Storage → media bucket before
launch. No SQL needed — Storage objects are managed
via the Storage API, not directly via SQL.

Also clean up any test documents or media_folders rows
created during Phase 15.3 testing:

  -- Remove any test documents added via the Media Library
  -- during verification (not real production documents):
  -- DELETE FROM documents
  -- WHERE uploaded_by IN (
  --   SELECT id FROM admin_users
  --   WHERE email LIKE '%@30bn-test.invalid'
  -- )
  -- AND created_at > '2026-07-01';
  -- (Review before running — only remove test uploads,
  -- not any real media library files added for production)

  -- Remove any test media_folders created during testing:
  -- DELETE FROM media_folders
  -- WHERE created_by IN (
  --   SELECT id FROM admin_users
  --   WHERE email LIKE '%@30bn-test.invalid'
  -- )
  -- AND created_at > '2026-07-01';
  -- (Review before running)

Note: Supabase Storage files uploaded to the 'media'
bucket under library/ during Phase 15.3 testing should
be reviewed and deleted manually via the Supabase
dashboard → Storage → media bucket before launch.
Files are under the library/ prefix. No SQL needed for
Storage objects.

Note for SETUP.0: No new test data was introduced by
the role guard sweep (Migration 023, SETUP.0). The
Owner Admin role and new app_settings keys are
production configuration, not test data — do not
delete them.

Note for SETUP.2: Logo and favicon images uploaded
to the brand bucket during Setup Panel testing (under
brand/logo/ and brand/favicon/) are NOT SQL-managed.
Delete test placeholder images manually via the
Supabase dashboard → Storage → brand bucket before
launch. Keep the production logo and favicon images
you intend to use. No SQL needed — Storage objects
are managed via the Storage API.

Note for ADMIN.34: The qr_codes table stores every
QR code generated via the standalone generator. Any
QR codes generated during development testing can be
cleared before launch with:

  DELETE FROM qr_codes
  WHERE created_at < '[date of first real use]';

Review before running — only delete test generations,
not any QR codes created for real operational use
(e.g. QRs generated for actual show check-in pages).

Note for Phase THEME: No new database rows are created
by the THEME build — the CSS brand color system reads
from existing app_settings rows (brand_primary and
brand_accent) that were seeded in Migration 023. If
brand_primary or brand_accent were changed in the Setup
Panel during THEME verification testing, restore them
to the 30BN defaults before launch:

  UPDATE app_settings
  SET value = '#293994'
  WHERE key = 'brand_primary';

  UPDATE app_settings
  SET value = '#F26522'
  WHERE key = 'brand_accent';

No other THEME-related cleanup is required. The
@layer utilities block in globals.css and the
CSS custom property injection in app/layout.tsx
are production code, not test data.

Note for ADMIN.36: Any pending_registrations rows created
during Google OAuth registration testing (test Google
accounts used to verify the new "Continue with Google"
path in the Request Access panel) should be cleaned up
before launch. Declined test registrations are automatically
removed via declineRegistration() → auth.admin.deleteUser().
For any pending or approved test registrations, run:

  DELETE FROM pending_registrations
  WHERE email IN (
    '[test-google-email-1@gmail.com]',
    '[test-google-email-2@gmail.com]'
  );
  -- Replace with actual test Google email addresses used
  -- during ADMIN.36 verification. Only delete test accounts
  -- — not any real staff members who registered via Google.

Also remove the corresponding Supabase Auth users manually
via the Supabase dashboard → Authentication → Users for
any test Google accounts that were approved and then not
deactivated via the normal flow.

Note for Phase 19: No new test database rows are created
specifically by the communication_preference feature
(Migration 030 adds a nullable column with no default).
Any preference values set during 19.2/19.3 testing on
volunteers with test emails (LIKE '%@30bn-test.invalid')
will be removed by the existing volunteer cleanup SQL
block above. No additional cleanup SQL is needed.

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

- [ ] **5.3 V6** — Volunteer with multiple matching roles
      receives exactly one email — not one per role.
      *(Requires real email delivery)*

- [ ] **5.3 V7** — Volunteer with no matching categories
      receives no email. *(Requires real email delivery)*

- [ ] **5.3 V9** — Overview tab Volunteer Notifications
      section is NOT visible to Viewer role.
      *(Requires Viewer account — A1)*

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

**QR History Panel (added ADMIN.34):**

- [ ] **7.1 V11** — Below the QR generator form: confirm
      a "Saved QR Codes" history panel is visible (or
      an "No QR codes generated yet." empty state if no
      QRs have been generated by any admin).

- [ ] **7.1 V12** — Generate a QR code with a label.
      Confirm the generated QR immediately appears in
      the history panel as the newest row. Confirm the
      row shows: the label, the full URL, "Generated by
      [your name] · [today's date]", a PNG download link,
      and an SVG download link.

- [ ] **7.1 V13** — Click the PNG download link on a
      history row. Confirm a PNG file downloads. Confirm
      the file contains a valid QR code image (open in
      image viewer or scan with phone).

- [ ] **7.1 V14** — Click the SVG download link on a
      history row. Confirm an SVG file downloads. Confirm
      the file renders as a valid QR code vector.

- [ ] **7.1 V15** — Generate a QR code without a label.
      Confirm the history row shows the URL domain (or
      the full URL) as the display label in place of a
      named label.

- [ ] **7.1 V16** — Log in as a different admin account.
      Navigate to /crew/tools/qr-generator. Confirm the
      same QR history panel is visible and shows QR
      codes generated by the other admin. Confirm history
      is shared across all admin accounts.
      *(Requires a second admin account)*

- [ ] **7.1 V17** — Confirm the history panel is ordered
      newest first. If multiple QRs have been generated,
      confirm the most recently generated appears at the
      top.

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
CAL.10a V4, V5 (INSERT + ON DELETE SET NULL — not
verifiable via service role; require a real auth
session or manual test)

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

### Phase 13.1 — requires Editor/Viewer accounts (A1):
13.1 V2, 13.1 V4

### Phase 13.1 — requires real email delivery or existing
log rows:
13.1 V5, 13.1 V6

### Phase 13.2 — requires real email delivery:
13.2 V1, 13.2 V2, 13.2 V3, 13.2 V4, 13.2 V5, 13.2 V6

### Phase 13.3a — requires Viewer account (A1):
13.3a V2

### Phase 13.3a — requires real email delivery:
13.3a V8

### Phase 13.3a — requires Supabase cross-check
(optional):
13.3a V9

### Phase 13.3b — requires real email delivery:
13.3b V4

### Phase 13.4a — requires real email delivery:
13.4a V1, 13.4a V3

### Phase 13.4a — advanced/optional (devtools):
13.4a V4

### Phase 13.4b — requires phone-width viewport:
13.4b V1, 13.4b V2, 13.4b V3, 13.4b V4, 13.4b V5,
13.4b V6, 13.4b V7

### ADMIN.27 — requires real email delivery:
ADMIN.27 V6

### ADMIN.27 — requires incognito/cleared localStorage:
ADMIN.27 V7

### HELP.2a — requires Production account:
HELP.2a V1, HELP.2a V2, HELP.2a V3

### HELP.2b — requires Editor account:
HELP.2b V1

### HELP.2b — requires Viewer account (A1):
HELP.2b V2

### HELP.2c — requires Viewer account (A1):
HELP.2c V2, HELP.2c V7

### HELP.2c — requires Production account:
HELP.2c V4

### ADMIN.29 — requires calendar_editor or Super Admin:
ADMIN.29 V8

### SETUP.0 — requires Owner Admin account:
SETUP.0 V1, V2, V3, V5, V6 (Owner Admin access checks)

### SETUP.0 — requires Super Admin:
SETUP.0 V4, V5 (confirming OA-only vs SA-only distinctions)

### Phase 14.1 — requires upcoming show with claims:
14.1 V1–V12 (all check-in page items require a live
  show with future show_dates and slot_claims)

### Phase 14.1 — requires real email delivery:
14.1 V12 (minor consent form email trigger)

### Phase 14.1 — requires Supabase cross-check:
14.1 V3, V4, V6 (attendance row creation, idempotency,
  walk-in slot_claim_id = null)

### Phase 14.1 — requires phone (QR scan):
14.1 V11 (scan per-date check-in QR with real phone)

### Phase 14.2 — requires show with show_dates:
14.2 V1–V5 (Dates tab QRs require shows with dates)

### Phase 14.2 — requires phone (QR scan):
14.2 V5 (scan whole-show and per-date QRs)

### Phase 14.2 — requires attendance with source='checkin':
14.2 V6 (Self Check-In badge — requires a real check-in
  event to have occurred via public check-in page)

### Phase 14.3 — requires upcoming shows:
14.3 V3–V9 (dashboard roster and accordion require
  shows with future show_dates)

### Phase 15.1 — requires Super Admin or Owner Admin:
15.1 V1–V18 (entire Document Management settings page
  is SA/OA only)

### Phase 15.1 — requires Supabase cross-check:
15.1 V16 (approve submission → status = 'approved')

### Phase 15.2 — requires document row with known token:
15.2 V2, V3, V4, V5 (redirect route tests require
  real document records in the documents table)

### Phase 15.2 — requires file in media bucket:
15.2 V5 (file-type document redirect requires an actual
  uploaded file — defer to Phase 15.3 build completion)

### Phase 15.2 — requires consent_form_submissions row:
15.2 V6–V12 (consent upload page requires a real
  pending submission with known upload_token)

### Phase 15.2 — requires real email delivery:
15.2 V13 (consent form trigger email delivery check)

### Phase 15.2 — requires Supabase cross-check:
15.2 V10, V14 (submitted_file_path populated, submission
  row created on minor signup)

### Phase 15.2 — requires phone-width viewport:
15.2 V16 (mobile responsiveness of /consent/[token])

### ADMIN.30 — requires Production account:
ADMIN.30 V5 (Media Library visible, Check-In absent),
ADMIN.30 V3 (Opportunities sub-routes still active)

### HELP.2e — requires Owner Admin account:
HELP.2e V1–V5 (all require Owner Admin login)

### Phase 15.3 — requires Production account:
15.3 V2, 15.3 V3 (Production role access to /crew/media)

### Phase 15.3 — requires Supabase cross-check
(optional):
15.3 V11 (access tier badge vs documents table)

### Phase 15.4 — requires backend-tier document:
15.4 V9 (unauthenticated redirect to /crew/login)

### Phase 15.4 — requires phone-width viewport:
15.4 V11 (mobile responsiveness of player page)

### Phase 15.4 — advanced/optional (devtools):
15.4 V12 (robots noindex meta tag on player page)

### SETUP.1 — requires feature flag toggled off:
SETUP.1 V1–V9 (all proxy guard checks require
feature_calendar or feature_checkin or
feature_blast to be set to 'false' via the
Setup Panel — restore to 'true' after verifying)

### SETUP.2 — requires Super Admin (Setup Panel access):
SETUP.2 V1–V14 (Setup Panel is Super Admin only;
logo/favicon upload tests require the brand
bucket to be accessible)

### SETUP.2 — requires Owner Admin account:
SETUP.2 V2 (confirm Setup Panel redirect for
Owner Admin)

### SETUP.2 — requires real email delivery:
SETUP.3 V5 (confirm dynamic from address in email
headers)

### SETUP.4 — requires feature flag toggled off:
SETUP.4 V5–V7 (sidebar link behavior after flag
saves — see SETUP.1 for full proxy guard checks)

### ADMIN.31 — requires landing page with org identity set:
ADMIN.31 V1–V4 (confirm dynamic heading/footer —
org_name, org_tagline, org_contact_email,
org_website_url, org_location must be set in
Setup Panel first)

### ADMIN.31 — requires Supabase cross-check:
ADMIN.31 V8 (volunteer.signup in audit_log)

### ADMIN.31 — requires real email delivery:
ADMIN.31 V5 (dynamic from address verification)

### ADMIN.31 — requires a volunteer with formatted phone number:
ADMIN.31 V6 (phone search strips non-digits)

### ADMIN.33 — requires Owner Admin account:
ADMIN.33 V1, V2, V3, V8, V9, V10, V11, V12,
V13 (all Owner Admin permission checks)

### ADMIN.33 — requires Super Admin:
ADMIN.33 V7 (Production in direct-create),
ADMIN.33 V14 (Production direct-create),
ADMIN.33 V20–V23 (Setup Panel Section 8)

### ADMIN.33 — public pages (no login required):
ADMIN.33 V15–V19 (branding sweep — any browser)

### ADMIN.34 — requires Owner Admin account:
ADMIN.34 V1, V2, V3 (OA approval flow)

### ADMIN.34 — advanced/optional (devtools):
ADMIN.34 V4 (metadata description tag check)

### Phase 7 QR History — requires second admin account:
7.1 V16 (shared history cross-account check)

### Phase THEME — requires Super Admin (Setup Panel):
THEME V2 (brand_primary change on public page),
THEME V7 (brand_primary propagation test),
THEME V8 (brand_accent propagation test),
THEME V13 (PDF export with test brand color),
THEME V14 (PDF export restored to default)

### Phase THEME — requires real email delivery:
THEME V9 (signup confirmation email brand colors),
THEME V10 (slot claim email brand colors),
THEME V11 (email blast brand colors),
THEME V12 (milestone email brand colors — optional)

### Phase THEME — advanced/optional (devtools):
THEME V1 (CSS custom property injection in <body>)

### Phase THEME — browser only (no special requirements):
THEME V3 (public pages /callboard, /shows, /forms),
THEME V4 (/crew/login admin login page),
THEME V5 (admin Production Crew dashboard),
THEME V6 (admin volunteers and shows pages)

### ADMIN.35 — dark mode browser verification:
ADMIN.35 V1–V4 (all browser)

### ADMIN.36 — requires real Google account:
ADMIN.36 V2, V5, V8, V9, V10, V11

### ADMIN.36 — requires Supabase cross-check:
ADMIN.36 V3, V10

### ADMIN.36 — requires real email delivery:
ADMIN.36 V4 (to Super Admin), V7 (to Google account)

### ADMIN.37 — browser verification:
ADMIN.37 V1–V5 (all browser)

### ADMIN.38 — requires Production account:
ADMIN.38 V1, V2

### Phase 19.2 — requires Supabase cross-check:
19.2 V2, V3, V5, V6

### Phase 19.3 Call Board — requires Supabase cross-check:
19.3 V3, V4

### Phase 19.3 Admin Profile — requires Viewer account (A1):
19.3 V8

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
      Superseded by Phase 13.3a — /crew/communication
      is now the full blast composer. See Phase 13
      verification items below.

- [~] **11.1 V2** — ~~Navigate to /crew/tools/checkin.
      Confirm the page renders with sidebar layout,
      "Coming Soon" badge, and the check-in feature
      description.~~ SUPERSEDED: /crew/tools/checkin
      is now the live check-in dashboard (Phase 14.3).
      See Phase 14.3 verification items.

- [~] **11.1 V3** — ~~Navigate to /crew/settings/documents.
      Confirm the page renders with sidebar layout,
      "Coming Soon" badge, and document management
      description.~~ SUPERSEDED: /crew/settings/documents
      is now the live Document Management settings page
      (Phase 15.1). See Phase 15.1 verification items.

- [~] **11.1 V4** — ~~Toggle to dark mode. Navigate to
      each of the three stub pages. Confirm all text
      and backgrounds render correctly — no invisible
      text or missing dark: variants.~~ PARTIALLY
      SUPERSEDED: /crew/communication replaced in 13.3a,
      /crew/tools/checkin replaced in 14.3,
      /crew/settings/documents replaced in 15.1.
      Dark mode on /crew/communication verified under
      Phase 13. Dark mode on live checkin/documents
      pages: see Phase 14.3 and Phase 15.1 items.

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
      Admin. Confirm all expected cards are visible:
      Announcement Banner, Hearing Options, Signup Form,
      General Defaults, Category Management, User
      Management, Audit Log, Document Management,
      Email Activity, Location Management.
      Note: the Document Management card no longer has
      a "Beta" badge — it was removed in Phase 15.1.
      Confirm the card links to /crew/settings/documents
      and is accessible (SA/OA only — Editors and Viewers
      see a LockedCard). See Phase 15.1 V4.

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
      pre-fills with a default value in the form
      "Message from [org name]" (dynamic — sourced
      from org_name in app_settings via
      resolveOrgIdentity(); updated ADMIN.33 from
      hardcoded "Message from 30 By Ninety Theatre").
      Confirm Reply-To pre-fills with the
      default_reply_to value from app_settings.

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

## SETUP.1 — Feature Flag Proxy Guards

*SETUP.1 built the feature flag system and proxy.ts
route guards. These checks verify that toggling a
flag to 'false' in the Setup Panel actually blocks
the guarded routes. Run these AFTER SETUP.4 is
verified (you need the Setup Panel working to toggle
flags). Restore all flags to 'true' when done.*

*PREREQUISITE: At least one show with a future date
must exist for the /checkin/ and /calendar checks
to produce meaningful results. The Setup Panel
(/crew/settings/setup) must be accessible
(Super Admin only).*

**Setup before testing — toggle a flag off:**

- [ ] **SETUP.1 V1** — In the Setup Panel
      (/crew/settings/setup), toggle "Calendar &
      Space Management" to OFF and save. Confirm the
      save succeeds with a success state. Reload the
      page. Confirm the toggle remains OFF.

**Calendar flag blocked routes (feature_calendar = 'false'):**

- [ ] **SETUP.1 V2** — With feature_calendar = 'false':
      navigate to /crew/calendar. Confirm you are
      redirected to /crew/dashboard — NOT the
      calendar page.

- [ ] **SETUP.1 V3** — With feature_calendar = 'false':
      navigate to the public /calendar page (no login).
      Confirm you receive a 404 or "not found" response
      — NOT the public calendar grid.

- [ ] **SETUP.1 V4** — With feature_calendar = 'false':
      confirm the "Calendar" link is absent from the
      Production Crew sidebar. Navigate to the sidebar
      — no Calendar nav link should appear.

**Restore and verify calendar:**

- [ ] **SETUP.1 V5** — Toggle "Calendar & Space
      Management" back to ON. Save. Confirm the
      Calendar link reappears in the sidebar without
      a full page reload. Navigate to /crew/calendar.
      Confirm it loads normally.

**Check-In flag (feature_checkin = 'false'):**

- [ ] **SETUP.1 V6** — Toggle "Check-In System" to
      OFF and save. Navigate to /crew/tools/checkin.
      Confirm redirect to /crew/dashboard. Navigate
      to the public /checkin/[any-uuid]. Confirm 404
      or blocked response. Restore the flag to ON
      after verifying.

**Blast flag (feature_blast = 'false'):**

- [ ] **SETUP.1 V7** — Toggle "Email Blast Composer"
      to OFF and save. Navigate to /crew/communication.
      Confirm redirect to /crew/dashboard. Confirm
      the "Communication" sidebar link is absent.
      Restore the flag to ON after verifying.

**Core features unaffected by any flag:**

- [ ] **SETUP.1 V8** — With ALL flags back ON: confirm
      /crew/shows, /crew/volunteers, /crew/forms,
      /crew/media, /crew/settings all load normally.
      Core features are never gated by feature flags.

**Feature flags propagate without full reload:**

- [ ] **SETUP.1 V9** — Toggle any flag in the Setup
      Panel and save. WITHOUT a full page reload:
      confirm the sidebar link for that feature
      appears or disappears immediately. The
      revalidatePath('/crew', 'layout') call in
      saveFeatureFlags() should propagate changes
      to the layout on the next navigation.
      (May require navigating to another page
      to trigger the layout re-render)

---

## SETUP.2 — Setup Panel UI Sections 1–4

*SETUP.2 built the Setup Panel UI: Org Identity,
Brand Colors, Logo, and Favicon sections. The
Setup Panel is at /crew/settings/setup and is
Super Admin only.*

**Access control:**

- [ ] **SETUP.2 V1** — Log in as Super Admin.
      Navigate to /crew/settings/setup. Confirm
      the Platform Setup page loads — showing
      eight collapsible sections (or cards).

- [ ] **SETUP.2 V2** — Log in as Owner Admin.
      Navigate to /crew/settings/setup directly.
      Confirm you are redirected to /crew/dashboard.
      Confirm the sidebar does NOT show a "Platform
      Setup" link for Owner Admin.
      *(Requires Owner Admin account)*

**Settings hub card:**

- [ ] **SETUP.2 V3** — As Super Admin: navigate to
      /crew/settings. Confirm "Platform Setup" is
      a LinkedCard (clickable, links to
      /crew/settings/setup). As Owner Admin: confirm
      "Platform Setup" is a LockedCard ("Super Admin
      only" label, not clickable).
      *(Requires Owner Admin account)*

**Section 1 — Org Identity:**

- [ ] **SETUP.2 V4** — On /crew/settings/setup:
      find Section 1 (Organization Identity).
      Update the Organization Name field to a test
      value (e.g. "Test Theatre"). Click Save.
      Confirm a success state appears. Reload the
      page. Confirm the saved value persists in
      the field.

- [ ] **SETUP.2 V5** — After setting org_name in V4:
      navigate to the public landing page (/). Confirm
      the page heading reads "Join the Test Theatre
      Volunteer Community" (or reflects your test
      value). Restore org_name to "30 By Ninety
      Theatre" after verifying.

**Section 2 — Brand Colors:**

- [ ] **SETUP.2 V6** — On /crew/settings/setup:
      find Section 2 (Brand Colors). Change the
      primary color picker to a test value. Click
      Save. Confirm a success state. Reload the page.
      Confirm the color picker shows the saved value.
      Restore to #293994 after verifying.
      (Note: color changes affect email templates
      and public pages only until Phase THEME ships —
      admin UI uses static Tailwind classes)

**Section 3 — Logo:**

- [ ] **SETUP.2 V7** — On /crew/settings/setup:
      find Section 3 (Logo). Test the URL input
      path: paste a valid public image URL into
      the URL field. Click Save. Confirm success.
      Navigate to the landing page (/). Confirm
      the logo in the email header reflects the
      new URL. (Requires sending a test email to
      verify logo in email — or check Resend
      dashboard for next outbound email)

- [ ] **SETUP.2 V8** — Test the file upload path
      in Section 3: click the upload/crop option.
      Select an image file. Confirm a crop editor
      appears. Adjust the crop. Confirm clicking
      "Save Logo" (or equivalent) uploads the
      image and shows the cropped result. Confirm
      the org_logo_url app_settings key is updated.
      (Supabase cross-check optional)

**Section 4 — Favicon:**

- [ ] **SETUP.2 V9** — On /crew/settings/setup:
      find Section 4 (Favicon). Test the file
      upload path: click the upload option. Select
      an image file. Confirm the crop editor
      enforces a 1:1 square aspect ratio (you
      cannot create a non-square crop). Confirm
      clicking Save uploads and stores the favicon.

- [ ] **SETUP.2 V10** — After saving a favicon
      in V9: open a new browser tab and navigate
      to any /crew/* page. Check the browser tab.
      Confirm the favicon has changed to the
      uploaded image (may require a hard reload
      — Ctrl+Shift+R or Cmd+Shift+R).
      (Owner manual action — browser tab check)

- [ ] **SETUP.2 V11** — Check the page <title>
      in the browser tab or devtools. Confirm it
      includes the org_name set in Section 1
      (dynamic title from generateMetadata()).

**Section header instance label:**

- [ ] **SETUP.2 V12** — On /crew/settings/setup:
      scroll to Section 7 (Platform Identity) and
      set an Instance Label value (e.g. "30BN Test").
      Save. Confirm the Setup Panel page header
      updates to show the instance label beside
      "Platform Setup" (e.g. "Platform Setup · 30BN
      Test"). Reload and confirm it persists.

**All sections visible:**

- [ ] **SETUP.2 V13** — Confirm all eight sections
      are present on /crew/settings/setup:
      Organization Identity, Brand Colors, Logo,
      Favicon, Email Configuration, Feature Flags,
      Platform Identity, 404 Page (added ADMIN.33).
      Each section has its own Save button (no
      "Save All").

- [ ] **SETUP.2 V14** — Saving one section does NOT
      affect the values in any other section. After
      saving Section 1, verify Section 2 still shows
      its previously saved value unchanged.

---

## SETUP.3 — Email Configuration Section

*SETUP.3 built Section 5 of the Setup Panel (Email
Configuration) and wired resolveEmailSettings() to
all 16 Resend send functions. Verification confirms
the dynamic from address and name propagate to
real outbound emails.*

**Section 5 — Email Config:**

- [ ] **SETUP.3 V1** — On /crew/settings/setup:
      find Section 5 (Email Configuration). Confirm
      two editable fields: Sending Address and
      Sending Name. Confirm Default Reply-To is
      displayed read-only with a link to General
      Defaults (/crew/settings/general).

- [ ] **SETUP.3 V2** — Update the Sending Name
      to a test value (e.g. "30BN Test Volunteers").
      Click Save. Confirm success. Reload the page.
      Confirm the saved value persists.

- [ ] **SETUP.3 V3** — Restore the Sending Name
      to "30 By Ninety Theatre Volunteers" after V2.
      Confirm save succeeds and value restores.

**Dynamic from address in outbound emails:**

- [ ] **SETUP.3 V4** — *(Requires real email delivery)*
      After setting a custom Sending Name in V2:
      trigger any system email (e.g. sign up a test
      volunteer at /). Confirm the email arrives
      with the FROM name matching the custom value
      set in the Setup Panel — NOT the hardcoded
      "30 By Ninety Theatre Volunteers" default.

- [ ] **SETUP.3 V5** — *(Requires real email delivery)*
      Check the email headers (Resend dashboard
      or email client). Confirm the from address
      matches email_from_address from app_settings
      — not a hardcoded volunteers@ address (unless
      that IS the value in app_settings).

**Section renders correctly:**

- [ ] **SETUP.3 V6** — Confirm Section 5 is the
      5th section on the page (after Org Identity,
      Brand Colors, Logo, Favicon in that order).
      Confirm sections are ordered 1–7 top to
      bottom without gaps.

---

## SETUP.4 — Feature Flags + Instance Label Sections

*SETUP.4 built Sections 6 and 7 of the Setup Panel:
Feature Flags (three toggle switches) and Platform
Identity (instance label). Full proxy guard testing
is in SETUP.1 — these items focus on the Setup
Panel UI behavior.*

**Section 6 — Feature Flags:**

- [ ] **SETUP.4 V1** — On /crew/settings/setup:
      find Section 6 (Feature Flags). Confirm three
      toggle rows are present:
      - Calendar & Space Management
      - Check-In System
      - Email Blast Composer
      Confirm each row shows the feature label, a
      one-sentence description, and a toggle switch
      showing current ON/OFF state.

- [ ] **SETUP.4 V2** — Toggle the "Calendar & Space
      Management" switch to OFF (if currently ON).
      Confirm the toggle visually switches — pill
      changes from navy to gray, circle moves left.
      Confirm NO automatic save fires — the toggle
      change is optimistic (local state only until
      Save is clicked).

- [ ] **SETUP.4 V3** — Click "Save Feature Flags".
      Confirm a success state appears. WITHOUT
      reloading: navigate to /crew/calendar via the
      sidebar or address bar. Confirm redirect to
      /crew/dashboard. Restore the flag to ON
      and save again before proceeding.

- [ ] **SETUP.4 V4** — With all flags ON: reload
      /crew/settings/setup. Confirm all three
      toggles show in the ON position (matching
      the saved state in app_settings).

**Section 7 — Platform Identity (Instance Label):**

- [ ] **SETUP.4 V5** — On /crew/settings/setup:
      find Section 7 (Platform Identity). Confirm
      an "Instance Label" text field is present
      with a placeholder like "e.g. Pelican
      Playhouse." Confirm the current saved value
      is pre-filled (e.g. "30 By Ninety Theatre").

- [ ] **SETUP.4 V6** — Update the instance label
      to a test value. Click "Save Identity Label."
      Confirm success. Confirm the page header
      updates to show the test label beside
      "Platform Setup."

- [ ] **SETUP.4 V7** — Log in as Owner Admin.
      Navigate to /crew/settings. Confirm the
      Platform Setup card shows as a LockedCard —
      the instance label is NOT displayed to Owner
      Admin (it's Super Admin Setup Panel only).
      *(Requires Owner Admin account)*

- [ ] **SETUP.4 V8** — Restore the instance label
      to its production value (e.g. "30 By Ninety
      Theatre"). Save. Confirm it persists on reload.

---

## ADMIN.31 — Deferred Item Sweep

*ADMIN.31 closed seven deferred items: landing page
org identity from app_settings, email payload builders
dynamic from/logo, phone search strip, reminder cron
DST fix, volunteer.signup audit logging, and waitlist
renumbering RPC. ADMIN.31b removed the dead documents
query and made the copyright line dynamic.*

**Landing page — dynamic org identity (ADMIN.31):**

- [ ] **ADMIN.31 V1** — Navigate to the public
      landing page (/). Confirm the main heading
      reads "Join the [org_name] Volunteer
      Community" — where [org_name] is the value
      set in Setup Panel Section 1 (e.g. "Join the
      30 By Ninety Theatre Volunteer Community").
      (Requires org_name to be set in app_settings)

- [ ] **ADMIN.31 V2** — On the landing page footer:
      if org_contact_email is set in app_settings,
      confirm it appears as a mailto link. If
      org_website_url is set, confirm it appears
      as an external link. If org_location is set,
      confirm it appears as plain text.
      (At least one field must be set to verify)

- [ ] **ADMIN.31 V3** — On the landing page footer:
      confirm the copyright line reads
      "© [org_name]" using the dynamic org_name —
      NOT the hardcoded "© 30 By Ninety Theatre"
      (ADMIN.31b fix). (Requires org_name to be
      set — confirms dynamic copyright)

- [ ] **ADMIN.31 V4** — Temporarily update org_name
      in the Setup Panel to a test value (e.g.
      "Pelican Playhouse"). Save. Navigate to
      the landing page. Confirm the heading and
      copyright BOTH update to reflect the new
      org_name. Restore org_name to "30 By Ninety
      Theatre" after verifying.

**Landing page — no console errors (ADMIN.31b):**

- [ ] **ADMIN.31 V5** — Open browser developer
      tools (F12 → Console). Navigate to the
      landing page (/). Confirm NO console errors
      appear related to a missing documents query
      or invalid column references. The dead
      pre-Migration-025 documents query was removed
      in ADMIN.31b — no errors should appear.
      *(Advanced — devtools required)*

**Phone search (ADMIN.31):**

- [ ] **ADMIN.31 V6** — Navigate to /crew/volunteers.
      In the search box, type a formatted phone
      number that exists in the volunteers table
      (e.g. "(985) 555-1234" if a volunteer has
      phone stored as "9855551234"). Confirm the
      correct volunteer appears in results.
      (Previously, formatted phone searches
      would return no results because the DB
      stores digits-only. ADMIN.31 fixed this
      by stripping non-digits before the ilike
      query.)

**Waitlist renumbering (ADMIN.31):**

- [ ] **ADMIN.31 V7** — Set up a test scenario:
      claim a role to fill all slots (creating a
      waitlist). Add at least 2–3 waitlisted claims.
      Note the waitlist_position values (e.g. 1, 2, 3).
      Cancel the waitlisted claim at position 1
      (not a claimed slot). Confirm:
      - The remaining waitlisted claims renumber
      to 1 and 2 (gap closed).
      - No duplicate position numbers remain.
      (Supabase cross-check: SELECT waitlist_position,
      volunteer_name FROM slot_claims WHERE
      volunteer_role_id = [role_id] AND
      status = 'waitlisted' ORDER BY
      waitlist_position)

**volunteer.signup in audit log (ADMIN.31):**

- [ ] **ADMIN.31 V8** — Complete a new volunteer
      signup at /. Navigate to /crew/settings/audit-log
      as Super Admin or Editor. In the Action Type
      filter, look for "volunteer.signup" or "Volunteer
      Signup" (human-readable label). Confirm an entry
      appears for the signup just completed showing
      the volunteer's name and email in the details.
      (Supabase cross-check: SELECT * FROM audit_log
      WHERE action = 'volunteer.signup' ORDER BY
      created_at DESC LIMIT 5)

**Dynamic email from address (ADMIN.31):**

- [ ] **ADMIN.31 V9** — *(Requires real email delivery)*
      Trigger a transactional email (e.g. sign up
      a test volunteer). Check the email in an inbox
      or the Resend dashboard. Confirm the FROM name
      matches the Sending Name set in Setup Panel
      Section 5. Confirm the FROM address matches
      the Sending Address from Section 5.
      (This confirms resolveEmailSettings() is
      working across the full send pipeline)

**Reminder cron DST consistency (ADMIN.31):**

- [ ] **ADMIN.31 V10** — *(Advanced — Vercel logs)*
      After the next scheduled cron run (5 AM UTC
      daily): check Vercel → Functions → Cron Jobs
      logs for app/api/cron/reminders/route.ts.
      Confirm no timezone errors appear in logs.
      Confirm the cron ran and sent emails to
      volunteers with shows the following day
      in CT time. (This is best verified around
      daylight saving time transitions — deferred
      to next DST transition if not immediately
      testable)

---

## SETUP.0 — Owner Admin Role + Feature Flags

*SETUP.0 added the `owner_admin` role and ran a
role guard sweep across 29 files. Verification items
focus on the new role's access boundaries.*

**Owner Admin access boundaries:**

- [ ] **SETUP.0 V1** — Log in as Owner Admin. Confirm
      you can access all /crew/* pages EXCEPT
      /crew/settings/setup. Confirm /crew/settings/setup
      redirects to /crew/dashboard (hard-blocked by
      proxy.ts).
      *(Requires Owner Admin account)*

- [ ] **SETUP.0 V2** — As Owner Admin: confirm you can
      access /crew/settings (hub), /crew/settings/users,
      /crew/settings/categories, /crew/settings/locations,
      /crew/settings/audit-log, and /crew/settings/
      email-activity — all should load without redirect.
      *(Requires Owner Admin account)*

- [ ] **SETUP.0 V3** — As Owner Admin on
      /crew/settings/users: confirm the create-account
      form's role selector shows Editor and Viewer only
      — NOT Owner Admin or Super Admin. Confirm Owner
      Admin rows in the user list show as locked
      (deactivate button absent for Owner Admin caller
      on Owner Admin rows).
      *(Requires Owner Admin account)*

- [ ] **SETUP.0 V4** — As Super Admin on
      /crew/settings/users: confirm Owner Admin rows are
      present and actionable — deactivate button visible,
      role badge distinct (different color from Super
      Admin and Editor).

**Settings hub card:**

- [ ] **SETUP.0 V5** — As Owner Admin: confirm the
      Settings hub (/crew/settings) shows "Platform
      Setup" as a LockedCard (not linked). As Super
      Admin: confirm "Platform Setup" is a LinkedCard
      to /crew/settings/setup.
      *(Requires Owner Admin account)*

**calendar_editor toggle on Owner Admin accounts:**

- [ ] **SETUP.0 V6** — As Super Admin on
      /crew/settings/users: confirm the calendar_editor
      toggle is visible on Owner Admin rows (same as
      Editor rows). Toggle it on for an Owner Admin.
      Confirm the Owner Admin now has direct-write
      calendar access (events they create are approved
      immediately, no pending queue).
      *(Requires Owner Admin account + calendar access)*

**Note — ADMIN.33 expanded Owner Admin permissions:**
The following SETUP.0 behaviors have changed as of
ADMIN.33 and should be re-verified with the updated
permission model:

- Owner Admin CAN now create and assign Owner Admin
  accounts (previously blocked). Verify: as Owner
  Admin, create a new user and confirm "Owner Admin"
  appears in the role selector.
- Owner Admin CAN now deactivate other Owner Admin
  accounts (OA-on-OA lock removed). Verify: as Owner
  Admin, attempt to deactivate another OA row and
  confirm the Deactivate button is enabled.
- The Setup Panel (/crew/settings/setup) remains
  Super Admin only — this is unchanged.

These re-verification checks do not have individual
V-numbers — run them as part of SETUP.0 re-verify
or ADMIN.33 verification.

---

## PHASE 14 — CHECK-IN SYSTEM

---

### 14.1 — Public Check-In Page

*Prerequisite: at least one live show with a future
show_date and at least one slot_claims row for that
date. The show's check_in_token (whole-show) and the
show_date's check_in_token (per-date) must exist
(added by Migration 024 — present on all show_dates).*

**Per-date token:**

- [ ] **14.1 V1** — Navigate to /checkin/[show_date_
      check_in_token] for a future show date. Confirm
      the page loads with show name, date, time, and
      an email/phone lookup form. Confirm the page is
      public — no admin login required.

- [ ] **14.1 V2** — Enter a valid email/phone of a
      volunteer who has a slot_claims row for this
      date. Confirm the page transitions to a success
      state showing the volunteer's name and
      "You're checked in!" or equivalent.

- [ ] **14.1 V3** — *(Supabase)* After a successful
      check-in: confirm an attendance row was created
      with status = 'showed', source = 'checkin',
      marked_by = null, and slot_claim_id matching
      the volunteer's slot claim for this date.

- [ ] **14.1 V4** — Try to check in the same volunteer
      again using the same token. Confirm an
      idempotent success state appears — "You're
      already checked in" or similar. Confirm no
      duplicate attendance row is created.
      *(Supabase cross-check)*

- [ ] **14.1 V5** — Enter an email/phone not on the
      roster for this date. Confirm a "you're not
      on the list" state appears with an option to
      sign up (inline walk-in form visible).

- [ ] **14.1 V6** — Fill out the walk-in inline signup
      form (name, email, phone, required fields).
      Submit. Confirm a success state appears.
      *(Supabase)* Confirm a new volunteers row was
      created and an attendance row with
      slot_claim_id = null and source = 'checkin'.

- [ ] **14.1 V7** — Navigate to /checkin/[invalid-uuid].
      Confirm a branded error page appears — not a
      crash or blank page.

- [ ] **14.1 V8** — Navigate to /checkin/[token] for
      a show_date that was in the past (show_date < today
      in CT). Confirm a "check-in period has ended"
      message appears — the form is not shown.

**Whole-show token:**

- [ ] **14.1 V9** — Navigate to /checkin/[show_
      check_in_token] (the whole-show token from
      shows.check_in_token). Confirm the page resolves
      to the nearest upcoming date automatically.

- [ ] **14.1 V10** — When a show has multiple upcoming
      dates: confirm a date picker or selector appears
      so the volunteer can confirm or switch the date.
      Confirm the lookup form does not appear until
      a date is selected/confirmed.

**QR scan:**

- [ ] **14.1 V11** — *(Owner — phone required)* Scan
      the per-date check-in QR from the Dates tab of
      a show in /crew/shows/[id]. Confirm it navigates
      to the correct /checkin/[token] URL on a real
      phone.

**Minor consent trigger:**

- [ ] **14.1 V12** — Complete a walk-in signup (14.1
      V6) with age_range = 'under_18'. Confirm in
      Supabase that a consent_form_submissions row was
      created with status = 'pending' for that volunteer.
      *(Supabase)* *(Requires real email delivery to
      confirm the email was sent with the upload link)*

---

### 14.2 — Show Detail Check-In QRs + Source Badge

*Prerequisite: a show in /crew/shows/[id] with at
least one show_date.*

**Dates tab QRs:**

- [ ] **14.2 V1** — Navigate to /crew/shows/[id]
      → Dates tab. Confirm a whole-show QR code is
      visible at the top of the tab (above the
      individual dates list). Confirm it has PNG and
      SVG download links.

- [ ] **14.2 V2** — On the same Dates tab: for each
      individual show date row, confirm a per-date
      QR code is visible. Confirm PNG and SVG download
      links appear for each date.

- [ ] **14.2 V3** — Confirm the QR codes are always
      visible — not hidden or conditional on the date
      being in the future. Past dates should also show
      the QR (for record-keeping).

- [ ] **14.2 V4** — Click "Download PNG" on any QR
      code. Confirm a PNG file downloads. *(Owner manual
      action — phone required for full scan test)*
      Confirm the QR container has a white background
      regardless of dark/light mode (QR scan requirement).

- [ ] **14.2 V5** — *(Owner — phone required)* Scan
      the whole-show QR. Confirm it navigates to
      /checkin/[shows.check_in_token] on a real phone.
      Scan a per-date QR. Confirm it navigates to
      /checkin/[show_dates.check_in_token].

**Volunteers tab source badge:**

- [ ] **14.2 V6** — Navigate to /crew/shows/[id] →
      Volunteers tab. Select a past show date that has
      at least one attendance record with source =
      'checkin'. Confirm a "Self Check-In" badge (or
      equivalent label) is visible on that row. Confirm
      rows with source = 'manual' show no such badge.

---

### 14.3 — Live Check-In Dashboard

*Navigate to /crew/tools/checkin as any admin role.*

**Page loads as live dashboard (not stub):**

- [ ] **14.3 V1** — Navigate to /crew/tools/checkin
      as Super Admin. Confirm the page shows a live
      check-in dashboard — NOT a "Coming Soon" stub.
      Confirm the page title is something like "Check-In
      Dashboard" and roster data is visible (or an
      appropriate empty state if no upcoming shows).

- [ ] **14.3 V2** — Log in as Viewer or Editor.
      Navigate to /crew/tools/checkin. Confirm the
      dashboard loads correctly for all roles
      (no role restriction on this page).

**Next show and roster display:**

- [ ] **14.3 V3** — If a show with upcoming dates
      exists: confirm the top section shows that show's
      name and the nearest upcoming show_date's full
      roster — all slot_claims with status = 'claimed',
      grouped by role.

- [ ] **14.3 V4** — Confirm each roster row shows the
      volunteer name, role name, and an attendance
      status indicator:
      - No attendance record → "— Awaiting" (gray)
      - source = 'checkin', status = 'showed' →
        "✓ Checked In (QR)" (green)
      - source = 'manual', status = 'showed' →
        "✓ Checked In (Admin)" (green)
      - status = 'no_show' → "✗ No-Show" (red)
      - status = 'excused' → "Excused" (amber)

- [ ] **14.3 V5** — Confirm a summary line appears
      near the top of the roster section showing
      "[X] of [Y] checked in" (where X = showed count,
      Y = rostered count).

**Auto-refresh:**

- [ ] **14.3 V6** — Wait approximately 10–15 seconds
      on the dashboard page. Confirm a "Last updated
      Xs ago" indicator increments. After 10 seconds:
      confirm it resets to "Last updated 0s ago" or
      similar (indicating a refresh fired). Confirm
      the roster data did not disappear during the
      refresh.

**Walk-in section:**

- [ ] **14.3 V7** — If any attendance rows exist with
      slot_claim_id = null for the selected show date:
      confirm a "Walk-In Check-Ins" section appears
      below the main roster showing walk-in names and
      check-in times.

**Date selector and accordion:**

- [ ] **14.3 V8** — If the top show has multiple
      upcoming dates: confirm a date selector (dropdown
      or similar) is visible. Changing the selected date
      updates the roster to reflect that date's claims.

- [ ] **14.3 V9** — If other shows have upcoming
      dates: confirm they appear below the top show
      in a collapsed accordion. Each row shows show
      name, nearest date, and "X / Y checked in"
      summary. Click/tap to expand an accordion row.
      Confirm it shows that show's roster.

**Empty state:**

- [ ] **14.3 V10** — If no upcoming shows exist:
      confirm an appropriate empty state appears
      ("No upcoming shows" or similar) — no crash
      or blank page.

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
      ⚠️ **DB-VERIFY.4 FINDING (Q17 FAIL):** As of
      July 2026, the live DB has 2 shows (1 draft, 1
      live) and 3 show_dates rows, but zero
      calendar_events rows with source = 'show'. The
      sync (syncShowDateToCalendar()) has not produced
      any records. Root cause unknown — may be that
      the show dates predate CAL.3 and were never
      backfilled, or a bug in the sync trigger path.
      Requires Phase A/B investigation before this
      item can be cleared.

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

- [~] **ADMIN.26 V5** — Attempt to change a user's
      role to Production using the UI role selector.
      Confirm the Production option is absent from the
      selector (UI guard from CAL.6). **SUPERSEDED**
      by ADMIN.33: the changeRole() dropdown now offers
      Editor, Viewer, Production, and Owner Admin to
      all SA + OA callers. Production is no longer
      blocked from the role-change dropdown. See
      ADMIN.33 V4 below for the updated changeRole()
      verification.

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

## PHASE 13.1 — Email Activity Log & Transactional
                Logging

**Settings hub — Email Activity card:**

- [ ] **13.1 V1** — Navigate to /crew/settings as Super
      Admin. Confirm an "Email Activity" card is present
      between the Audit Log card and the Document
      Management card. Confirm it is a LinkedCard (not
      locked) for Super Admin.

- [ ] **13.1 V2** — Log in as Editor. Navigate to
      /crew/settings. Confirm the Email Activity card
      appears as a LockedCard with a "Super Admin only"
      indicator. Log in as Viewer. Confirm the same
      LockedCard behavior.
      *(Requires Editor account and Viewer account — A1)*

**Email Activity page:**

- [ ] **13.1 V3** — Navigate to /crew/settings/email-
      activity as Super Admin. Confirm the page loads
      with three tabs: "All Emails," "System Only," and
      "About System Emails."

- [ ] **13.1 V4** — Navigate to /crew/settings/email-
      activity as Editor. Confirm you are redirected to
      /crew/settings (Editor cannot access this page).
      *(Requires Editor account)*

- [ ] **13.1 V5** — On the "All Emails" tab: confirm
      existing logged email rows appear (e.g. rows from
      category-match notifications or show bulk emails
      sent via ADMIN.23, or the thank-you cron rows).
      Confirm columns: Date, Subject, Type, Sent By,
      Recipients, Trigger/Filter.

- [ ] **13.1 V6** — Trigger a transactional email (e.g.
      sign up a test volunteer, or claim a slot). Navigate
      to /crew/settings/email-activity. Confirm the new
      email appears in the "All Emails" tab with the
      correct recipient_filter tag (e.g.
      "trigger:signup" or "trigger:slot_claim").

- [ ] **13.1 V7** — Click the "System Only" tab. Confirm
      only rows with Sent By = "System" appear — no
      admin-triggered bulk emails or blasts.

- [ ] **13.1 V8** — Click the "About System Emails" tab.
      Confirm a static catalog of automated email triggers
      is visible, listing at least the 11 system email
      types with when each fires, who receives it, and
      spam protection notes.

- [ ] **13.1 V9** — If more than 25 email rows exist:
      confirm pagination controls appear ("Previous" /
      "Page N of M" / "Next"). Confirm clicking Next
      loads the next page. Confirm page state persists
      in the URL (?page=N).

- [ ] **13.1 V10** — Toggle to dark mode. Navigate to
      /crew/settings/email-activity. Confirm the page,
      all tabs, and log table render correctly — no light
      backgrounds or invisible text.

---

## PHASE 13.2 — Branded HTML Email Templates

*These items require real email delivery to a real inbox.
Trigger each email type and check rendering in Gmail and
Apple Mail (or whatever email clients are available).*

- [ ] **13.2 V1** — Trigger a volunteer signup
      confirmation by submitting a new volunteer on
      the public signup form (/). Open the email in
      Gmail. Confirm: branded navy header with logo,
      white content area, correct volunteer name, category
      list (if categories selected), and a "Visit Your
      Volunteer Hub" CTA button linking to /callboard.
      *(Requires real email delivery)*

- [ ] **13.2 V2** — Claim a slot on a live show as a
      test volunteer (/shows/[id]). Open the claim
      confirmation email. Confirm: show name in subject,
      show details table (role, date, time), "📅 Add to
      your calendar" link, "Visit Your Volunteer Hub" CTA,
      and a plain-text cancel link below the CTA. Confirm
      the CTA links to /callboard — not /shows.
      *(Requires real email delivery)*

- [ ] **13.2 V3** — Create a new admin account via
      /crew/settings/users with "Send Welcome Email"
      toggled on. Open the welcome email. Confirm: branded
      header, welcome message, login link pointing to
      /crew/login (not /callboard — admin emails link
      to the admin login). *(Requires real email delivery)*

- [ ] **13.2 V4** — If a volunteer gets promoted off the
      waitlist (cancel another claim that has a waitlisted
      volunteer): open the waitlist promotion email.
      Confirm it contains the show details, "📅 Add to
      your calendar" link, "Visit Your Volunteer Hub" CTA,
      and a cancel link. *(Requires real email delivery
      + waitlisted volunteer setup)*

- [ ] **13.2 V5** — Confirm the table layout renders
      correctly in both Gmail and Apple Mail — no broken
      table borders, no raw HTML visible, content width
      ≤ 600px, branded colors (navy header, orange CTAs)
      visible. *(Spot-check any one email)*

- [ ] **13.2 V6** — Confirm the logo image loads in the
      email header (the img src points to the production
      URL). If the logo does not load, confirm the theater
      name text "30 BY NINETY THEATRE" still appears as
      fallback text in the header.
      *(Check during any real email delivery test)*

---

## PHASE 13.3a — Email Blast Composer (Backend + Shell)

- [ ] **13.3a V1** — Navigate to /crew/communication as
      Editor or Super Admin. Confirm the stub "Coming
      Soon" page is gone and the full blast composer
      renders with: "New Email Blast" heading, three
      recipient mode buttons (All Volunteers, By Category,
      Individual), Subject field, Reply-To field (pre-
      filled), and Message body area.

- [ ] **13.3a V2** — Log in as Viewer. Navigate to
      /crew/communication. Confirm the composer is not
      visible. Confirm a "Email sending not available"
      locked message appears explaining that Editor or
      Super Admin access is required.
      *(Requires Viewer account — A1)*

- [ ] **13.3a V3** — Click "By Category." Confirm a
      checkbox list of volunteer categories appears.
      Confirm the categories match those visible in
      /crew/settings/categories (loaded from DB — not
      hardcoded).

- [ ] **13.3a V4** — Click "Individual." Confirm a
      search input appears. Type at least 2 characters
      of a volunteer name or email. Confirm a dropdown
      of matching active volunteers appears within ~300ms
      (debounced). Confirm clicking a result adds that
      volunteer as a chip below the input.

- [ ] **13.3a V5** — Click the × on a selected individual
      chip. Confirm the volunteer is removed from the
      recipient list.

- [ ] **13.3a V6** — Fill in a subject, reply-to, and
      message body. Click "Preview & Send →". Confirm a
      loading state appears on the button, then the
      Confirm step renders with: summary card (subject,
      reply-to, recipient mode, recipient count, sample
      emails, body preview), an orange warning banner,
      "← Back" and "Send Email Blast" buttons.

- [ ] **13.3a V7** — On the Confirm step, click "← Back."
      Confirm the compose form returns with all fields
      intact (subject, reply-to, body, recipient mode,
      any selected categories/individuals still present).

- [ ] **13.3a V8** — Complete the compose and confirm
      steps for a small recipient group (e.g. "By
      Category" with one category that has few volunteers,
      or "Individual" with one test volunteer). Click
      "Send Email Blast." Confirm the Sent step appears:
      CheckCircle icon, "Email sent successfully!", correct
      recipient count, "Send Another Email" button.

- [ ] **13.3a V9** — Check /crew/settings/email-activity
      after a successful blast. Confirm a new row appears
      with recipient_type matching the mode used (e.g.
      'all', 'category', or 'individual') and the
      correct recipient_filter value ('all',
      'category:{ids}', or 'individual').
      *(Supabase cross-check optional)*

- [ ] **13.3a V10** — Click "Send Another Email." Confirm
      all form state resets: mode back to "All Volunteers,"
      subject/reply-to/body cleared, no selected
      categories or individuals.

---

## PHASE 13.3b — TipTap Rich Text Editor

- [ ] **13.3b V1** — Navigate to /crew/communication.
      Confirm the message body area is a rich text editor
      — not a plain textarea. Confirm a toolbar appears
      above the editor with four buttons: B (Bold), I
      (Italic), • List (Bullet List), 1. List (Ordered
      List).
      Superseded by ADMIN.27 — toolbar expanded to 9
      buttons. See ADMIN.27 V1 below.

- [ ] **13.3b V2** — Click inside the editor and type
      some text. Select a word and click the Bold button.
      Confirm the word becomes bold AND the Bold button
      highlights (active state — navy background) while
      the cursor is inside bold text. Click Bold again
      to toggle off. Confirm the highlighting removes.

- [ ] **13.3b V3** — Repeat the active-state check for
      Italic, Bullet List, and Ordered List. Each button
      should highlight when the cursor is inside content
      of that type.

- [ ] **13.3b V4** — Type a multi-paragraph message
      using the editor (multiple paragraphs, at least
      one bold phrase, one bullet list). Send a test
      blast to a single test volunteer. Open the received
      email. Confirm: paragraphs are separated (not one
      long block of text), bold text appears bold, the
      bullet list renders as an HTML list (not raw <ul>
      tags). *(Requires real email delivery)*

- [ ] **13.3b V5** — On the Confirm step: confirm the
      "Preview" field in the summary card shows readable
      plain text — not raw HTML like <p> or <strong>.
      The preview should be the first ~150 characters of
      the message content without markup.

- [ ] **13.3b V6** — After a successful blast send:
      navigate to /crew/settings/email-activity. Confirm
      the body_preview column for the new blast row shows
      plain readable text — no HTML tags visible.

- [ ] **13.3b V7** — Click "Send Another Email" after a
      successful send. Confirm the editor content is
      cleared (editor resets to empty). Confirm the
      toolbar buttons are no longer in an active state.

---

## PHASE 13.4a — Logging Cleanup & HTML Sanitization

- [ ] **13.4a V1** — Navigate to /update (volunteer info
      update page). Enter a volunteer's email or phone
      to request a new update link. The email is sent.
      Navigate to /crew/settings/email-activity. Confirm
      a new row appears with recipient_filter =
      'trigger:update_link_request' and Sent By = "System."
      *(Requires real email delivery to trigger)*

- [ ] **13.4a V2** — Submit a new admin access request
      via the "Request Access" panel on /crew/login.
      Navigate to /crew/settings/email-activity as Super
      Admin. Confirm a new row appears with
      recipient_filter = 'trigger:admin_registration_
      request', Sent By = "System", and recipient_count
      matching the number of active Super Admins.

- [ ] **13.4a V3** — Compose a test blast with formatted
      content: bold text, italic text, a bullet list, and
      a hyperlink. Send to a single test recipient. Open
      the received email. Confirm all formatting renders
      correctly — bold appears bold, list renders as a
      list, link is clickable. Confirm no raw HTML tags
      are visible anywhere in the email.
      *(Requires real email delivery)*

- [ ] **13.4a V4** — *(Advanced/optional — requires
      browser devtools)* On /crew/communication, open
      browser developer tools. In the Elements panel,
      find the TipTap editor's contenteditable div.
      Manually inject a <script>alert('xss')</script>
      tag into the editor's innerHTML. Then send the
      blast. Confirm: no alert fires on the recipient
      side, and the received email does not contain any
      <script> tag. *(Verifies sanitize-html strips
      disallowed tags before sending)*

---

## PHASE 13.4b — Mobile Optimization

*Check at 375px viewport width (phone-width). Use browser
dev tools device emulation or narrow the browser window.*

**Blast composer (/crew/communication):**

- [ ] **13.4b V1** — At 375px viewport: navigate to
      /crew/communication as Editor or Super Admin.
      Confirm the three recipient mode buttons ("All
      Volunteers," "By Category," "Individual") stack
      vertically — one button per row — rather than
      appearing side by side in a row that overflows.

- [ ] **13.4b V2** — At 375px: complete the compose
      form and advance to the Confirm step. Confirm
      the "← Back" and "Send Email Blast" buttons
      are both fully visible and tappable — neither
      is cut off or overlapping.

- [ ] **13.4b V3** — At 768px viewport: confirm the
      recipient mode buttons return to a horizontal
      layout (side by side). This confirms the
      sm:flex-row breakpoint is working correctly.

**Email Activity page (/crew/settings/email-activity):**

- [ ] **13.4b V4** — At 375px viewport: navigate to
      /crew/settings/email-activity. Confirm the three
      tab labels ("All Emails," "System Only," "About
      System Emails") wrap onto two lines rather than
      overflowing the viewport. Confirm no horizontal
      scroll appears.

- [ ] **13.4b V5** — At 375px: on the "All Emails" or
      "System Only" tab (with at least one email row):
      confirm the log table is NOT visible. Confirm
      instead a card layout appears — each email row
      shown as a stacked card with date, type badge,
      subject, sent-by/recipient count, and trigger
      badge.

- [ ] **13.4b V6** — At 768px or wider: confirm the
      log table IS visible and the mobile card layout
      is hidden. This confirms the hidden sm:block
      / sm:hidden pattern is working correctly.

- [ ] **13.4b V7** — At 375px: toggle to dark mode.
      Navigate to /crew/settings/email-activity. Confirm
      the mobile card layout renders correctly in dark
      mode — no light backgrounds or invisible text on
      the cards.

---

## PHASE 13.4c — npm Vulnerability Sweep

No owner verification required. All changes are
dependency-level (package.json / package-lock.json).
Verify Vercel build succeeded after the next deploy.

---

## ADMIN.27 — TipTap Rich Formatting + Light Mode Default

**Expanded toolbar — /crew/communication:**

- [ ] **ADMIN.27 V1** — Navigate to /crew/communication
      as Editor or Super Admin. Confirm the toolbar above
      the rich text editor now shows NINE buttons in this
      order: B (Bold), I (Italic), U (Underline), H1,
      H2, — (Horizontal Rule), • List (Bullet), 1. List
      (Ordered), 🔗 (Link). Confirm all nine are visible
      without wrapping on a desktop viewport.

- [ ] **ADMIN.27 V2** — Select a word in the editor and
      click the U (Underline) button. Confirm the word
      becomes underlined and the U button highlights
      (active state — navy background). Click again to
      toggle off.

- [ ] **ADMIN.27 V3** — Click the H1 button with the
      cursor on a paragraph. Confirm the text becomes a
      large heading. Click H2. Confirm it becomes a
      medium heading. Click H1 again to toggle off.
      Confirm the active state highlights correctly for
      each.

- [ ] **ADMIN.27 V4** — Click the — (Horizontal Rule)
      button. Confirm a horizontal divider line is
      inserted in the editor. Confirm no active state
      highlight (horizontal rules are not toggle states).

- [ ] **ADMIN.27 V5** — Select some text and click the
      🔗 (Link) button. Confirm a browser prompt appears
      asking for a URL. Enter a URL (e.g.
      https://30byninety.com). Confirm the selected text
      becomes a clickable link. Click the 🔗 button
      again while the cursor is inside the link. Confirm
      a prompt appears pre-filled with the existing URL.
      Clear it and confirm the link is removed.

- [ ] **ADMIN.27 V6** — Send a test blast containing:
      underlined text, an H1 heading, a horizontal rule,
      and a clickable link. Open the received email.
      Confirm: underline is visible, heading renders
      large, horizontal rule appears as a dividing line,
      link is clickable. No raw HTML tags visible.
      *(Requires real email delivery)*

**Light mode default:**

- [ ] **ADMIN.27 V7** — Open the admin panel
      (/crew/login) in a browser with no localStorage
      (use a fresh incognito window or clear
      localStorage). Confirm the page renders in LIGHT
      mode — not dark — without any user action. The
      default must now be light regardless of the
      operating system's color scheme preference.

- [ ] **ADMIN.27 V8** — Log in and toggle to dark mode
      using the sidebar theme toggle. Close the tab.
      Reopen /crew/dashboard in the same browser (not
      incognito). Confirm dark mode persists (stored
      preference honored). Toggle back to light.
      Close and reopen. Confirm light persists.

---

## HELP.2a — Help Page: Structural Scaffold

**Production role access to /crew/help:**

- [ ] **HELP.2a V1** — Log in as a Production-role
      account. Confirm the sidebar shows a Help link
      (HelpCircle icon, labeled "Help") alongside the
      Calendar link. *(Requires Production account)*

- [ ] **HELP.2a V2** — As Production role, navigate to
      /crew/help. Confirm the page loads — you are NOT
      redirected to /crew/calendar.
      *(Requires Production account)*

- [ ] **HELP.2a V3** — As Production role on /crew/help:
      confirm the TOC on the left shows ONLY two
      sections: "Master Calendar" and "Getting Help."
      Confirm no other sections (Volunteers, Shows,
      Dashboard, Communication, etc.) appear in the TOC
      or the page content. *(Requires Production account)*

- [ ] **HELP.2a V4** — As Super Admin, navigate to
      /crew/help. Confirm the page loads correctly (no
      regression — role-aware TOC renders all sections
      for Super Admin). *(Quick sanity check)*

---

## HELP.2b — Help Page: Existing Sections Updated

**Role-filtered sections:**

- [ ] **HELP.2b V1** — Log in as Editor. Navigate to
      /crew/help. Confirm the Settings section does NOT
      appear in the TOC or the page content.
      *(Requires Editor account)*

- [ ] **HELP.2b V2** — As Viewer on /crew/help: confirm
      the Settings section is absent. Confirm the
      Communication section is absent. Confirm no edit-
      only subsections appear within Volunteers (no "Edit
      a Volunteer" or "Archive a Volunteer"), Shows (no
      "Create a Show" or "Publish a Show"), or Attendance
      (no "Mark Attendance"). *(Requires Viewer account
      — A1)*

- [ ] **HELP.2b V3** — As Super Admin on /crew/help:
      confirm the Settings section IS present and contains
      three new subsections: "Audit Log," "Location
      Management," and "Email Activity Log" — in addition
      to the existing Settings subsections.

**Updated content accuracy:**

- [ ] **HELP.2b V4** — On /crew/help, navigate to
      Settings → General Defaults (or the default hours
      subsection). Confirm the content describes the
      HIERARCHY: per-location default hours take
      precedence, with the three bucket fallbacks
      (Mainstage/Studio X/One-Off) as fallback only.
      Confirm no mention of "show type."

- [ ] **HELP.2b V5** — Navigate to the account types
      section of /crew/help (within Settings → User
      Management or equivalent). Confirm FOUR account
      types are described: Super Admin, Editor, Viewer,
      and Production. Confirm the calendar_editor flag
      is mentioned. *(Super Admin only)*

---

## HELP.2c — Help Page: New Sections

**Dashboard section:**

- [ ] **HELP.2c V1** — As Super Admin or Editor, navigate
      to /crew/help. Confirm a "Your Dashboard" section
      appears in the TOC and on the page. Confirm it
      contains subsections for: Quick Stats, Season at a
      Glance, and Activity Feed.

- [ ] **HELP.2c V2** — As Viewer on /crew/help: confirm
      "Your Dashboard" is present (Viewers can see the
      dashboard). Confirm the Pending Hours and Pending
      Milestones are NOT described as standalone
      subsections (those are Editor/SA features) — they
      are mentioned as a cross-link only in the Activity
      Feed Tip. *(Requires Viewer account — A1)*

**Master Calendar section:**

- [ ] **HELP.2c V3** — As Super Admin on /crew/help:
      confirm a "Master Calendar" section appears in the
      TOC with 9 subsections: Calendar Overview,
      Submitting an Event, Direct Event Creation, Bulk
      Rehearsal Schedules, Recurring Events, Pending
      Approval Queue, Book Space, Calendar Export &
      Subscription, The Public Calendar.

- [ ] **HELP.2c V4** — As Production role on /crew/help:
      confirm the "Master Calendar" section is visible
      with all 9 subsections EXCEPT "Pending Approval
      Queue" (Super Admin only). Confirm all 8 visible
      subsections appear in the TOC.
      *(Requires Production account)*

- [ ] **HELP.2c V5** — As Editor or Viewer on /crew/help:
      confirm "Pending Approval Queue" subsection is
      absent from the TOC and content. Confirm the other
      8 calendar subsections are present.

**Communication section:**

- [ ] **HELP.2c V6** — As Super Admin or Editor on
      /crew/help: confirm a "Communication" section
      appears in the TOC with a "Sending an Email Blast"
      subsection. Confirm the content describes the three
      recipient modes (All Volunteers, By Category,
      Individual) and the compose → confirm → sent flow.

- [ ] **HELP.2c V7** — As Viewer on /crew/help: confirm
      the "Communication" section is absent from the TOC
      and page content entirely. *(Requires Viewer
      account — A1)*

---

## HELP.2d + ADMIN.29 — New HelpTooltip Placements

Each HelpTooltip is a small HelpCircle icon that appears
next to a heading or button. Clicking it links to the
relevant /crew/help anchor.

- [ ] **ADMIN.29 V1** — Navigate to /crew/dashboard.
      Find the "Season at a Glance" section heading.
      Confirm a small HelpCircle icon appears next to it.
      Click it. Confirm it navigates to
      /crew/help#dashboard-season.

- [ ] **ADMIN.29 V2** — Navigate to /crew/communication.
      Find the "Communication" page heading (h1).
      Confirm a small HelpCircle icon appears next to it.
      Click it. Confirm it navigates to
      /crew/help#blast-compose.

- [ ] **ADMIN.29 V3** — Navigate to
      /crew/settings/locations. Find the page heading.
      Confirm a small HelpCircle icon appears next to it.
      Click it. Confirm it navigates to
      /crew/help#location-management.

- [ ] **ADMIN.29 V4** — Navigate to
      /crew/settings/audit-log. Find the page heading.
      Confirm a small HelpCircle icon appears next to it.
      Click it. Confirm it navigates to
      /crew/help#audit-log.

- [ ] **ADMIN.29 V5** — Navigate to
      /crew/settings/email-activity. Find the page
      heading. Confirm a small HelpCircle icon appears
      next to it. Click it. Confirm it navigates to
      /crew/help#email-activity-log.

- [ ] **ADMIN.29 V6** — Navigate to /crew/calendar.
      Find the "Add Event" / "Submit Request" dropdown
      button in the calendar header. Confirm a small
      HelpCircle icon appears immediately after (as a
      sibling element — NOT inside the button). Click it.
      Confirm it navigates to /crew/help#calendar-submit.

- [ ] **ADMIN.29 V7** — On /crew/calendar: find the
      "Export" button in the calendar header (desktop
      only — not visible in the mobile ⋯ More menu).
      Confirm a HelpCircle icon appears next to it.
      Click it. Confirm it navigates to
      /crew/help#calendar-export.

- [ ] **ADMIN.29 V8** — On /crew/calendar (as Super
      Admin or calendar_editor holder): find the "Book
      Space" button in the calendar header (desktop
      only). Confirm a HelpCircle icon appears next to
      it. Click it. Confirm it navigates to
      /crew/help#calendar-book-space. As a non-calendar-
      editor Editor: confirm the Book Space button AND
      its tooltip are both absent.

- [ ] **ADMIN.29 V9** — Navigate to
      /crew/calendar/pending as Super Admin. Find the
      "Pending Calendar Requests" h1 heading. Confirm
      a HelpCircle icon appears inside the h1 (inline
      with the text). Click it. Confirm it navigates to
      /crew/help#calendar-pending.

---

## PHASE 15 — DOCUMENT & MEDIA SYSTEM

---

### 15.1 — Document Types Manager + Consent Queue

*Navigate to /crew/settings/documents as Super Admin
or Owner Admin.*

**Settings page (no longer a stub):**

- [ ] **15.1 V1** — Navigate to /crew/settings/documents
      as Super Admin. Confirm the page shows two live
      sections: "Document Types" and "Consent Form
      Submissions" — NOT a "Coming Soon" stub.

- [ ] **15.1 V2** — As Editor: navigate to
      /crew/settings/documents. Confirm you are
      redirected to /crew/settings (Editors cannot
      access this page).

**Settings hub card:**

- [ ] **15.1 V3** — Navigate to /crew/settings as
      Editor. Confirm the "Document Management" card
      shows as a LockedCard ("Super Admin only" label).
      Confirm there is NO "Beta" badge on the card
      for any role — that badge was removed.

- [ ] **15.1 V4** — As Super Admin: confirm the
      "Document Management" card on /crew/settings
      is a LinkedCard that navigates to
      /crew/settings/documents.

**Document Types Manager:**

- [ ] **15.1 V5** — On /crew/settings/documents:
      confirm the Document Types section lists all
      5 seeded types:
      - Volunteer Consent Form (system badge)
      - Cast / Auditioner Consent Form (system badge)
      - Volunteer Handbook
      - Production Schedule
      - Audition Materials

- [ ] **15.1 V6** — Confirm system types
      (Volunteer Consent Form and Cast / Auditioner
      Consent Form) show a "System" badge and have
      their delete button disabled or absent. Confirm
      a tooltip or label indicates they cannot be
      deleted.

- [ ] **15.1 V7** — Add a new non-system document type
      (e.g. "Test Type"). Confirm it appears at the
      bottom of the list. Confirm an auto-generated
      slug is shown.

- [ ] **15.1 V8** — Rename the test type using the
      inline edit. Confirm the new name persists on
      reload.

- [ ] **15.1 V9** — Use ↑↓ arrows to reorder the test
      type. Confirm the visual order changes. Reload
      the page. Confirm the order persists.

- [ ] **15.1 V10** — Toggle the test type to inactive.
      Confirm its status changes. Toggle it back to
      active. Confirm it returns to active status.

- [ ] **15.1 V11** — Delete the test type (the one
      added in V7). Confirm it disappears from the
      list. Confirm system types (V6) cannot be
      deleted — clicking delete shows an error or
      has no effect.

- [ ] **15.1 V12** — On any document type row: confirm
      an "Active Document" subsection shows either the
      current active document (title + date) or a "No
      active document" empty state. *(At launch, all
      types will show "No active document" until a
      document is uploaded in Phase 15.3.)*

**Consent Form Submissions Queue:**

- [ ] **15.1 V13** — On /crew/settings/documents:
      confirm the "Consent Form Submissions" section
      is visible with three tab options:
      Pending / Approved / Rejected.

- [ ] **15.1 V14** — With no submissions in the system:
      confirm the Pending tab shows an appropriate
      empty state — something like "No pending consent
      form submissions have been received yet."

- [ ] **15.1 V15** — If a pending submission exists
      (e.g. created by testing 14.1 V12 or 15.2 V11):
      confirm the Pending tab shows the volunteer name,
      form type, submitted date/time, a file link, and
      Approve / Reject action buttons.

- [ ] **15.1 V16** — Click Approve on a pending
      submission. Confirm the row moves from the
      Pending tab to the Approved tab. Confirm the
      submission's status in Supabase is now
      'approved'. *(Supabase cross-check)*

- [ ] **15.1 V17** — Click Reject on another pending
      submission (or the same one if only one exists).
      A notes field should appear for entering a reason.
      Submit the rejection. Confirm the row moves to
      the Rejected tab.

- [ ] **15.1 V18** — Toggle to dark mode. Navigate
      to /crew/settings/documents. Confirm both
      sections render correctly — no invisible text
      or missing dark: variants.

---

### 15.2 — Redirect Route + Consent Upload Page

*The /documents/[token] route requires an actual
document record with a known access_token. The
/consent/[token] page requires an actual
consent_form_submissions row with a known upload_token.*

**`/documents/[token]` redirect route:**

- [ ] **15.2 V1** — Navigate to /documents/[invalid-
      uuid]. Confirm you are redirected to /not-found
      — not a crash or blank page.

- [ ] **15.2 V2** — *(Requires an active document row
      in the documents table with access_tier = 'public'
      or 'link_only' and entry_type = 'link')* Navigate
      to /documents/[access_token] for that document.
      Confirm you are redirected to the external_url
      without being prompted to log in.

- [ ] **15.2 V3** — *(Requires an active document row
      with access_tier = 'backend' and entry_type =
      'link')* While NOT logged in to /crew: navigate
      to /documents/[access_token]. Confirm you are
      redirected to /crew/login?redirect=/documents/
      [token] — not the external URL.

- [ ] **15.2 V4** — Repeat V3 while logged in as an
      admin. Confirm you are redirected to the
      external_url (backend-tier document accessible
      to authenticated admins).

- [ ] **15.2 V5** — *(Requires an active document row
      with entry_type = 'file' and a real file in the
      media bucket)* Navigate to /documents/[token].
      Confirm you are redirected to a Supabase Storage
      signed URL (the URL will contain 'supabase' or
      'storage' in the hostname). Confirm the file
      opens or downloads correctly.
      *(This requires a file to have been uploaded via
      Phase 15.3 — defer if 15.3 is not yet built)*

**`/consent/[token]` upload page:**

- [ ] **15.2 V6** — Navigate to /consent/[invalid-uuid].
      Confirm a branded error page appears: "This link
      is not valid" or equivalent. Confirm no upload
      form is shown.

- [ ] **15.2 V7** — *(Requires a consent_form_submissions
      row with status = 'pending' and a known
      upload_token)* Navigate to /consent/[upload_token].
      Confirm a branded upload page appears with:
      - A greeting mentioning the volunteer's name
      - A file picker area with "Choose File" button
      - Accepted formats note (PDF, JPG, PNG)
      - An "Upload & Submit" button (disabled until
        a file is selected)
      Confirm the page is light mode only (no dark
      mode applied — public page).

- [ ] **15.2 V8** — On the /consent/[token] page:
      select a PDF file. Confirm the filename appears
      in the file picker area and the "Upload & Submit"
      button becomes enabled.

- [ ] **15.2 V9** — Click "Upload & Submit" with a
      valid file selected. Confirm a progress bar or
      progress indicator appears during upload. Confirm
      the page transitions to a success state:
      "Thank you, [name]!" or equivalent message.
      Confirm the upload button and file picker are
      gone — no further submission possible.

- [ ] **15.2 V10** — *(Supabase)* After a successful
      upload: confirm the consent_form_submissions row
      now has submitted_file_path populated (not null)
      and submitted_at set. Confirm status is still
      'pending' (awaiting admin review).

- [ ] **15.2 V11** — Navigate back to /consent/[same_
      token]. Confirm the page shows an "already
      submitted" state — the upload form is NOT
      shown again.

- [ ] **15.2 V12** — Try uploading a file with an
      unsupported type (e.g. a .txt or .docx file).
      Confirm the browser's file picker or the app
      rejects it — the "Upload & Submit" button should
      not proceed with an invalid file type.

**Consent form email (under-18 signup trigger):**

- [ ] **15.2 V13** — *(Requires real email delivery)*
      Complete a volunteer signup at / with age_range =
      'under_18'. Confirm a consent form request email
      arrives with:
      - Subject containing "Consent Form"
      - An "Upload Signed Form" CTA button linking to
        /consent/[a real token]
      - If no active Volunteer Consent Form document
        is set: "Your coordinator will provide you
        with the consent form" language (no download
        button). If an active document IS set: a
        "Download Consent Form" button appears before
        the upload CTA.

- [ ] **15.2 V14** — *(Supabase)* After the signup
      (15.2 V13): confirm a consent_form_submissions
      row exists for the new volunteer with
      status = 'pending' and submitted_file_path = null.

- [ ] **15.2 V15** — Navigate to
      /crew/settings/documents → Consent Form Submissions
      → Pending tab. Confirm the new submission appears
      with the volunteer's name and "Volunteer Consent
      Form" type.

- [ ] **15.2 V16** — On a mobile viewport (375px):
      confirm /consent/[token] renders without horizontal
      scroll. Confirm the file picker and button are
      tap-friendly.
      *(Owner — phone or narrow browser required)*

---

## ADMIN.30 — Sidebar Fix + Help Page Updates

**Sidebar dual-highlight fix:**

- [ ] **ADMIN.30 V1** — Navigate to /crew/shows. Confirm
      the "Shows" sidebar link is active (highlighted).
      Confirm the "Opportunities" link is NOT highlighted
      simultaneously.

- [ ] **ADMIN.30 V2** — Navigate to /crew/shows/
      opportunities. Confirm the "Opportunities" sidebar
      link is active. Confirm the "Shows" link is NOT
      highlighted simultaneously.

- [ ] **ADMIN.30 V3** — Navigate to /crew/shows/
      opportunities/new and then /crew/shows/
      opportunities/[id]/edit (if an opportunity exists).
      Confirm the "Opportunities" link remains active on
      both sub-routes — prefix matching still works
      correctly for Opportunities' own sub-pages.

**Help page: new sections in TOC:**

- [ ] **ADMIN.30 V4** — Navigate to /crew/help as Super
      Admin. Confirm the left-side TOC now shows 13
      sections including "Check-In System" and "Media
      Library" (which were not present before ADMIN.30).

- [ ] **ADMIN.30 V5** — Navigate to /crew/help as
      Production role. Confirm "Media Library" section is
      visible in the TOC alongside "Master Calendar" and
      "Getting Help." Confirm "Check-In System" is NOT
      visible to Production (Production has no access to
      /crew/tools/checkin).

- [ ] **ADMIN.30 V6** — As Super Admin on /crew/help:
      scroll to or click the "Check-In System" section.
      Confirm it has two subsections: "Check-In QR Codes"
      and "Live Check-In Dashboard." Confirm the content
      explains QR placement on the Dates tab and the
      auto-refreshing dashboard.

- [ ] **ADMIN.30 V7** — As Super Admin on /crew/help:
      scroll to or click the "Media Library" section.
      Confirm it has two subsections: "Uploading Files and
      Links" and "Sharing and Access." Confirm the content
      describes access tiers (public/link_only/backend)
      and the distribution link/QR pattern.

- [ ] **ADMIN.30 V8** — As Super Admin on /crew/help:
      scroll to the Settings section. Confirm two new
      subsections are present: "Document Types" and
      "Consent Form Submissions." Confirm this content
      does NOT appear when logged in as Editor.

- [ ] **ADMIN.30 V9** — Log in as Editor. Navigate to
      /crew/help. Confirm "Check-In System" and "Media
      Library" sections are visible. Confirm the
      "Settings" section is still absent (Settings is
      SA/OA only). Confirm all other sections render as
      expected.

**New HelpTooltip placements:**

- [ ] **ADMIN.30 V10** — Navigate to /crew/tools/checkin.
      Confirm a HelpTooltip (? icon) appears near the
      page heading. Click it. Confirm it navigates to
      /crew/help#check-in-dashboard.

- [ ] **ADMIN.30 V11** — Navigate to /crew/shows/[id] →
      Dates tab. Confirm a HelpTooltip appears near the
      "Whole-Show Check-In QR" heading or the check-in
      QR section. Click it. Confirm it navigates to
      /crew/help#check-in-qr.

- [ ] **ADMIN.30 V12** — Navigate to /crew/settings/
      documents. Confirm a HelpTooltip appears near the
      "Document Types" section heading. Click it. Confirm
      it navigates to /crew/help#document-types.

- [ ] **ADMIN.30 V13** — On /crew/settings/documents:
      confirm a HelpTooltip appears near the "Consent
      Form Submissions" heading — this heading appears in
      both the empty state and the populated state. Click
      it in either state. Confirm it navigates to
      /crew/help#consent-forms.

- [ ] **ADMIN.30 V14** — Navigate to /crew/media.
      Confirm a HelpTooltip appears near the "Tier"
      column header in the document table. Click it.
      Confirm it navigates to /crew/help#media-library-
      access.

---

## PHASE 15.3 — MASTER MEDIA LIBRARY

*Prerequisite: /crew/media must be accessible (all roles
including Production). For upload tests, at least one
media_folder must exist, or the interface must handle a
no-folders state gracefully.*

**Page loads (not a stub):**

- [ ] **15.3 V1** — Navigate to /crew/media as Super
      Admin. Confirm the page shows a live Media Library
      interface — a folder browser panel on the left and
      a document table on the right. NOT a "Coming Soon"
      stub.

- [ ] **15.3 V2** — Log in as Production role. Navigate
      to /crew/media. Confirm access is granted — the
      Media Library is visible to Production (unlike most
      /crew pages). Confirm no admin-only actions are
      visible (edit/upload controls may differ by role).

- [ ] **15.3 V3** — Log in as Production role. Confirm
      the sidebar shows a "Media Library" link (or
      equivalent nav entry). Confirm clicking it
      navigates to /crew/media.

**File upload (P-DC pattern):**

- [ ] **15.3 V4** — As Super Admin or Editor: click
      "Upload File" (or equivalent button). Select a
      supported file type (PDF or image). Confirm a
      progress indicator or progress bar appears during
      upload. Confirm the upload completes without error.

- [ ] **15.3 V5** — After successful upload: confirm
      the new file appears in the document table with a
      title, file type badge (PDF/Image/etc.), and an
      access tier badge (default: Backend).

**Link entry:**

- [ ] **15.3 V6** — Click "Add Link" (or equivalent).
      Enter a YouTube URL and a title. Save. Confirm the
      new entry appears in the table as a link-type entry
      with a "Play" action button.

- [ ] **15.3 V7** — Add a generic external link (non-
      YouTube, non-Vimeo). Confirm it appears with a
      "View" or "Open" button — not a "Play" button.

**Play/View button eligibility:**

- [ ] **15.3 V8** — Confirm Play/View buttons appear on
      the following entry types: video files, audio files,
      image files, PDF files, YouTube links, Vimeo links.
      Confirm Play/View does NOT appear on generic
      external links.

**Copy Link and QR:**

- [ ] **15.3 V9** — Click "Copy Link" on any document
      row. Paste the copied URL. Confirm it is a
      /documents/[token] URL — not a direct Supabase
      Storage URL or a raw YouTube/Vimeo URL.

- [ ] **15.3 V10** — Click "QR" on any document row.
      Confirm a QR code file downloads (PNG or SVG).

**Access tier badges:**

- [ ] **15.3 V11** — Confirm each document row shows an
      access tier badge: "Public," "Link Only," or
      "Backend." Confirm the badge reflects the actual
      access_tier value in the documents table.
      *(Supabase cross-check optional)*

**Dark mode and mobile:**

- [ ] **15.3 V12** — Toggle to dark mode. Navigate to
      /crew/media. Confirm the folder browser and
      document table render correctly without broken
      colors or layout issues.

---

## PHASE 15.4 — MEDIA PLAYERS + EMBED DETECTION

*Prerequisite: at least one document of each type
(YouTube link, video file, audio file, image file, PDF)
should exist in the Media Library from Phase 15.3
testing. The /documents/[token] and
/documents/view/[token] routes are public pages.*

**Player page — YouTube embed:**

- [ ] **15.4 V1** — On /crew/media: click Play on a
      YouTube link entry. Confirm the browser navigates
      to /documents/view/[token]. Confirm the page shows
      a YouTube embed iframe — not a redirect to YouTube
      itself.

**Player page — video file:**

- [ ] **15.4 V2** — Click Play on a video file entry
      (e.g. MP4). Confirm /documents/view/[token]
      renders a native `<video>` element with the video
      content. Confirm it plays on click.

**Player page — audio file:**

- [ ] **15.4 V3** — Click Play on an audio file entry.
      Confirm /documents/view/[token] renders a native
      `<audio>` element. Confirm audio plays on click.

**Player page — PDF:**

- [ ] **15.4 V4** — Click View on a PDF file entry.
      Confirm /documents/view/[token] renders the PDF
      inline (iframe or embedded viewer). Confirm the PDF
      is readable without needing to download.

**Player page — image:**

- [ ] **15.4 V5** — Click View on an image entry
      (JPG, PNG, etc.). Confirm /documents/view/[token]
      renders the image inline in the page.

**Route redirect behavior:**

- [ ] **15.4 V6** — Copy the /documents/[token] link
      for a YouTube document and navigate to it directly
      (not via the Play button). Confirm the URL
      redirects to /documents/view/[token] — the player
      page — rather than redirecting directly to YouTube.

- [ ] **15.4 V7** — Navigate to /documents/[token] for
      a file-type document with a viewable mime type
      (video/mp4 or image/jpeg). Confirm the URL
      redirects to /documents/view/[token] rather than
      directly to the Supabase signed URL.

- [ ] **15.4 V8** — Navigate to /documents/[token] for
      a generic external link (not YouTube/Vimeo/audio/
      viewable file). Confirm it redirects directly to
      the external URL — no player page intermediate.

**Access tier enforcement on player page:**

- [ ] **15.4 V9** — Navigate to /documents/view/[token]
      for a document with access_tier = 'backend' while
      NOT logged in (use incognito or log out). Confirm
      the page redirects to /crew/login (with a redirect
      param back to the player page). *(May require an
      active backend-tier document in the system)*

**Public page characteristics:**

- [ ] **15.4 V10** — Navigate to /documents/view/[token]
      while logged in as any admin role. Confirm the page
      is light mode only — the sidebar and top bar are
      absent (it's a public page, not in the /crew layout).
      Confirm it renders correctly without dark mode styles.

**Mobile:**

- [ ] **15.4 V11** — On a mobile viewport (375px):
      navigate to /documents/view/[token] for a YouTube
      or video entry. Confirm the embed or video player
      is responsive — fills width without horizontal
      scroll.
      *(Owner — phone or narrow browser required)*

**Robots / indexing:**

- [ ] **15.4 V12** — *(Advanced/optional)* Use browser
      devtools to inspect the HTML `<head>` on
      /documents/view/[token]. Confirm a
      `<meta name="robots" content="noindex">` tag is
      present (access-controlled content should not be
      indexed by search engines).

---

## HELP.2e — ALL_SECTIONS Owner Admin Sweep

*Prerequisite: an Owner Admin account must exist.
If none exists, create one via /crew/settings/users
(Super Admin only) before running these checks.*

- [ ] **HELP.2e V1** — Log in as Owner Admin. Navigate
      to /crew/help. Confirm the left-side TOC shows
      all 13 sections — the same full list that Super
      Admin sees. Previously, Owner Admin would have
      seen a reduced set (Editor-level visibility)
      because owner_admin was missing from most
      ALL_SECTIONS role arrays. The full list should
      include: Dashboard, Your Volunteers, Shows,
      Attendance and Hours, The Volunteer Signup Form,
      Settings, Master Calendar, Communication,
      Check-In System, Media Library, The Volunteer
      Call Board, Standing Opportunities, Getting Help.

- [ ] **HELP.2e V2** — As Owner Admin on /crew/help:
      confirm the Communication section is visible
      (including the "Sending an Email Blast" subsection).
      Prior to HELP.2e, this section was ['super_admin',
      'editor'] — Owner Admin was excluded.

- [ ] **HELP.2e V3** — As Owner Admin on /crew/help:
      confirm the Settings section is visible with all
      its subsections (Announcement Banner, Hearing
      Options, Signup Form, General Defaults, Categories,
      User Accounts, Audit Log, Location Management,
      Email Activity, Document Types, Consent Form
      Submissions). Settings was already correct (SA/OA
      only) — this is a confirmatory check.

- [ ] **HELP.2e V4** — As Owner Admin on /crew/help:
      scroll to the Master Calendar section. Confirm
      the "Pending Approval Queue" subsection is visible.
      This entry previously had ['super_admin'] only —
      Owner Admin was excluded despite having full
      operational access to the pending queue.

- [ ] **HELP.2e V5** — As Owner Admin: navigate to
      /crew/calendar/pending. Confirm the page loads
      the full Pending Approval Queue — no redirect to
      dashboard. This confirms the app-level access
      matches the help page role visibility fixed in
      HELP.2e.

---

## ADMIN.33 — Role Permissions, Branding Sweep & Setup Panel Section 8

*ADMIN.33 expanded Owner Admin permissions, swept all
hardcoded 30BN branding to dynamic org_name, and added
Setup Panel Section 8 (404 Page customization). Many
items below require an Owner Admin account.*

*PREREQUISITE: An Owner Admin account must exist.
If none exists, create one via /crew/settings/users.*

**Owner Admin — User Management permissions:**

- [ ] **ADMIN.33 V1** — Log in as Owner Admin. Navigate
      to /crew/settings/users. Click "Create Account."
      Confirm the role selector includes "Owner Admin"
      as an option. (Previously, Owner Admin callers
      could only assign Editor or Viewer.)
      *(Requires Owner Admin account)*

- [ ] **ADMIN.33 V2** — As Owner Admin: create a new
      account and assign the role "Owner Admin." Confirm
      the account appears in the user list with the
      Owner Admin badge. Confirm no error is returned.
      *(Requires Owner Admin account)*

- [ ] **ADMIN.33 V3** — As Owner Admin: find another
      Owner Admin row in the user list. Confirm the
      Deactivate button is enabled (not greyed out or
      absent). (Previously, OA rows were locked when
      the caller was also Owner Admin.)
      *(Requires a second Owner Admin account)*

- [ ] **ADMIN.33 V4** — Navigate to /crew/settings/users.
      Find any Editor or Viewer row. Confirm the role
      selector now offers four options: Editor, Viewer,
      Production, Owner Admin. (Previously only Editor
      and Viewer were offered.)

- [ ] **ADMIN.33 V5** — Use the role selector to change
      an Editor to Production. Confirm the role badge
      updates to "Production" in place.

- [ ] **ADMIN.33 V6** — Use the role selector to change
      a Viewer to Owner Admin. Confirm the role badge
      updates to "Owner Admin" in place.

- [ ] **ADMIN.33 V7** — As Super Admin: in
      /crew/settings/users, click "Create Account." Confirm
      the role selector includes "Production" as an option
      (Super Admin can directly create Production accounts).
      Confirm "Owner Admin" is also present. Confirm
      "Super Admin" is NOT a selectable option in this
      dropdown. (Super Admin cannot be created via
      direct-create — only via registration approval.)

**Owner Admin — Operational permissions:**

- [ ] **ADMIN.33 V8** — Navigate to /crew/shows as Owner
      Admin. Confirm the "New Show," "Edit," and "Set
      Live/Draft" controls are visible and functional.
      (Previously, ShowList.tsx excluded Owner Admin
      from these controls due to a variable name miss
      in the SETUP.0 grep sweep.)
      *(Requires Owner Admin account)*

- [ ] **ADMIN.33 V9** — Navigate to /crew/shows/[id] as
      Owner Admin. Confirm the edit controls on the show
      detail page are active — tab controls, attendance
      marking, Settings tab. (ShowDetail.tsx canEdit
      now includes owner_admin.)
      *(Requires Owner Admin account)*

- [ ] **ADMIN.33 V10** — Navigate to /crew/forms as Owner
      Admin. Confirm the "New Form" button is visible and
      functional. (FormList.tsx canEdit now includes
      owner_admin.)
      *(Requires Owner Admin account)*

- [ ] **ADMIN.33 V11** — Navigate to
      /crew/shows/opportunities as Owner Admin. Confirm
      archive/reactivate controls are visible on
      opportunity rows. (OpportunityList.tsx canEdit now
      includes owner_admin.)
      *(Requires Owner Admin account)*

- [ ] **ADMIN.33 V12** — Navigate to /crew/calendar as
      Owner Admin. Click on a day cell that has an
      approved event. In the day detail panel, confirm
      the Edit and Cancel buttons are visible. (Previously,
      CalendarDayPanel.tsx gated these to super_admin only
      despite the server actions allowing owner_admin.)
      *(Requires Owner Admin account)*

- [ ] **ADMIN.33 V13** — Navigate to a volunteer profile
      as Owner Admin. Add an Editor Note. Confirm the
      note saves successfully. Edit the note. Confirm
      the edit persists. Delete the note. Confirm it
      disappears. (volunteer_notes UPDATE/DELETE RLS
      repointed to is_super_admin_or_owner_admin()
      in Migration 028; app-layer guard also updated.)
      *(Requires Owner Admin account)*

**Production role — direct create (ADMIN.33):**

- [ ] **ADMIN.33 V14** — As Super Admin: create a new
      admin account with role = "Production" via
      /crew/settings/users → Create Account. Confirm
      the account appears in the user list with a
      "Production" badge. Confirm no error.
      (Previously, Production could only be assigned
      via the registration approval flow — never via
      direct create.)

**OpenCall OS public branding — org identity sweep:**

- [ ] **ADMIN.33 V15** — Navigate to the public landing
      page (/). Confirm the logo in the header renders
      from the org_logo_url stored in app_settings (if
      one has been uploaded). Confirm the org name
      appears in the hero headings dynamically.
      Confirm the copyright footer shows the org name.

- [ ] **ADMIN.33 V16** — Navigate to /shows (public show
      listing page). Confirm the logo in the page header
      renders dynamically. Confirm the copyright footer
      shows the org name.

- [ ] **ADMIN.33 V17** — Navigate to /callboard. Confirm
      the logo and copyright are dynamic (org name, not
      hardcoded "30 By Ninety Theatre").

- [ ] **ADMIN.33 V18** — Navigate to /crew/login (the
      admin login page). Confirm the logo in the header
      renders from org_logo_url (or falls back to
      /logo.png if unset).

- [ ] **ADMIN.33 V19** — Navigate to a non-existent
      route (e.g. /this-does-not-exist). Confirm the
      custom 404 page renders with the dynamic logo
      from org_logo_url. Confirm the heading and body
      text match the values set in Setup Panel Section 8
      (or the defaults if Section 8 has not been
      customized: "Page Not Found" / "We couldn't find
      what you were looking for.").

**Setup Panel Section 8 — 404 Page customization:**

- [ ] **ADMIN.33 V20** — Navigate to /crew/settings/setup
      as Super Admin. Confirm Section 8 ("404 Page") is
      present below Section 7 (Platform Identity).
      Confirm it has two fields: Heading (text input,
      max 100 chars) and Body Text (textarea, max 300
      chars). Confirm both show the current values
      (defaults: "Page Not Found" and "We couldn't find
      what you were looking for.").

- [ ] **ADMIN.33 V21** — Change the Heading to a test
      value (e.g. "Lost? We've got you."). Click Save.
      Confirm a success state appears. Navigate to a
      non-existent route (e.g. /this-doesnt-exist).
      Confirm the 404 page now shows the new heading.

- [ ] **ADMIN.33 V22** — Change the Body Text to a test
      value. Save. Navigate to a non-existent route.
      Confirm the new body text appears on the 404 page.

- [ ] **ADMIN.33 V23** — Restore the Heading and Body
      Text to their defaults ("Page Not Found" / "We
      couldn't find what you were looking for."). Save.
      Confirm the 404 page returns to showing the
      default text.

## ADMIN.34 — QR History + OA Approval Fix

*ADMIN.34 added the QR code history panel (shared,
DB-persisted), fixed the OA-can-assign-OA gap in
the registration approval flow, wired org_tagline
into metadata, and wired org_contact_email into
email functions.*

*QR history panel items are in Phase 7 section
above (7.1 V11–V17).*

**Owner Admin — registration approval flow:**

- [ ] **ADMIN.34 V1** — As Owner Admin: submit a new
      registration request via /crew/login → Request
      Access (use a test email). As Owner Admin (log
      back in): navigate to /crew/settings/users.
      Confirm the pending request appears in the
      Pending Registrations section.
      *(Requires Owner Admin account and a new pending
      registration)*

- [ ] **ADMIN.34 V2** — As Owner Admin: on the pending
      registration row, confirm the role selector
      includes "Owner Admin" as an option. (Previously,
      OA callers only saw Editor/Viewer in the approval
      role selector.)

- [ ] **ADMIN.34 V3** — As Owner Admin: approve the
      pending registration with role = "Owner Admin."
      Confirm the registration is approved and the
      new user appears in the admin list with an
      Owner Admin badge. Confirm no error.

**Metadata description via org_tagline:**

- [ ] **ADMIN.34 V4** — *(Advanced/optional — requires
      browser devtools)* Navigate to any page on the
      platform (e.g. /). Open browser devtools →
      Elements panel. Find the <head> section. Confirm
      a <meta name="description"> tag is present. If
      org_tagline is set in the Setup Panel, confirm
      its value matches. If org_tagline is empty
      (default), confirm the fallback reads "Volunteer
      management platform" — NOT an empty string.

---

## ADMIN.35 — Dark Mode Main Content Area Fix

*Context: ADMIN.35 replaced `bg-brand-primary-light` with
`bg-gray-50` on the `<main>` content wrapper in
`app/crew/(app)/layout.tsx`. This fixed the main content
area showing an off-white background in dark mode instead
of the correct dark palette color. The sidebar and top bar
were unaffected. A broader cascade defect (~50 files)
remains deferred to ADMIN.39.*

**Main content area in dark mode:**

- [ ] **ADMIN.35 V1** — Toggle to dark mode using the
      sidebar toggle. Navigate to /crew/dashboard. Confirm
      the main content area (the region displaying the
      Quick Stats cards and Season at a Glance section)
      renders with a visibly dark background — NOT an
      off-white or light-grey background. The background
      should be clearly darker than the card surfaces.

- [ ] **ADMIN.35 V2** — While in dark mode on
      /crew/dashboard: confirm the sidebar (left column)
      and top bar (header strip) also show dark
      backgrounds. These were unaffected by the regression
      and should be correct — this is a baseline
      confirmation.

- [ ] **ADMIN.35 V3** — While in dark mode: navigate to
      /crew/volunteers, /crew/shows, and
      /crew/settings/users. Confirm the main content area
      background on each page is consistently dark —
      not light or off-white.

- [ ] **ADMIN.35 V4** — Switch back to light mode.
      Confirm the main content area returns to a neutral
      light background (not dark). Confirm toggle works
      correctly in both directions.

---

## ADMIN.36 — Google OAuth Registration Path

*Context: ADMIN.36 added a "Continue with Google" button
to the Request Access panel on /crew/login. Google
registrants enter the same pending approval queue as
email/password registrants. The OAuth callback handles
three states: new registrant, already pending, and
previously declined. ADMIN.38 added the is_active check
on the Google path.*

*Prerequisites: A real Google account to use for testing.
A Super Admin account to approve/decline. A real email
address on the Super Admin account to receive notification
emails.*

**"Continue with Google" button visible in Request Access:**

- [ ] **ADMIN.36 V1** — Navigate to /crew/login. Click
      "Request Access" (the toggle that reveals the
      registration panel). Confirm a "Continue with
      Google" button (or "Sign in with Google") is visible
      below the email/password fields, separated by a
      visual divider (e.g. "or" divider line).

**New Google registrant flow:**

- [ ] **ADMIN.36 V2** — From the Request Access panel,
      click "Continue with Google." Complete the Google
      OAuth flow using a Google account that has never
      registered on this platform. Confirm you are
      redirected to /crew/login with a success message
      referencing Google account submission (e.g. "Your
      Google account has been submitted for approval").

- [ ] **ADMIN.36 V3** — Supabase: confirm a row exists
      in pending_registrations with the Google account's
      email, a non-empty name (from Google profile), and
      status = 'pending'. Confirm auth_user_id is set to
      a valid Supabase Auth user UUID. *(Supabase)*

- [ ] **ADMIN.36 V4** — Super Admin receives a
      notification email: "New access request — [name]
      ([email])" with a link to /crew/settings/users.
      *(Requires real email delivery to Super Admin)*

**Already-pending state:**

- [ ] **ADMIN.36 V5** — From the Request Access panel,
      click "Continue with Google" again using the same
      Google account (which is now pending). Confirm
      redirect to /crew/login with a "request already
      pending" message — not an error and no duplicate
      row created.

**Approval flow — Google registrant:**

- [ ] **ADMIN.36 V6** — As Super Admin: navigate to
      /crew/settings/users. Confirm the Google registrant
      appears in the Pending Registrations section with
      their name and email from Google. Approve with any
      role (e.g. Editor).

- [ ] **ADMIN.36 V7** — After approval: approved Google
      registrant receives an email with a link to sign in
      via Google — NO temp password, NO "change your
      password" instructions. CTA button links to
      /crew/login. *(Requires real email delivery to the
      Google account's email address)*

- [ ] **ADMIN.36 V8** — The approved Google account
      clicks "Sign in with Google" on the main /crew/login
      form (not Request Access). Confirm redirect to
      /crew/dashboard with the correct role (e.g. Editor
      sidebar and permissions). *(Requires the Google
      account used in V2)*

**is_active check on Google path (ADMIN.38):**

- [ ] **ADMIN.36 V9** — As Super Admin: deactivate the
      approved Google test account. Log out. Navigate to
      /crew/login. Click "Sign in with Google" on the main
      login form. Complete the Google OAuth flow. Confirm
      redirect to /crew/login?error=not_authorized — NOT
      to /crew/dashboard. The deactivated account must
      not gain access.
      *(Requires the approved test Google account from V8)*

**Decline flow — Google registrant:**

- [ ] **ADMIN.36 V10** — Register a second test Google
      account via the Request Access panel. As Super Admin:
      decline the registration. Confirm the pending row
      disappears. Supabase: confirm pending_registrations
      status = 'declined' AND the Supabase Auth user no
      longer exists in Authentication → Users.
      *(Supabase)*

**Previously-declined state:**

- [ ] **ADMIN.36 V11** — Using the second Google account
      that was just declined in V10: navigate to
      /crew/login → Request Access → "Continue with
      Google." Complete the OAuth flow. Confirm redirect
      to /crew/login?error=declined with a declined
      message — not the new-registrant path.

---

## ADMIN.37 — revalidatePath Gaps + Role Guard Fix

*Context: ADMIN.37 added missing revalidatePath() calls
to addNote(), editNote(), deleteNote(), and toggleStatus()
in lib/actions/volunteers.ts. It also fixed the
updateVolunteer() role guard from a viewer-only exclusion
to an allowlist that correctly blocks Production role.*

*Prerequisites: Editor account. A volunteer profile with
at least one existing note (or create one during testing).*

**Note actions — immediate refresh without hard reload:**

- [ ] **ADMIN.37 V1** — As Editor: navigate to a
      volunteer profile. Add a new note. Confirm the note
      appears on the page immediately after saving —
      without a hard reload or manual page refresh.

- [ ] **ADMIN.37 V2** — Edit an existing note (as Editor
      or Super Admin if note editing is available). Confirm
      the updated content appears on the page immediately
      after saving — no hard reload required.

- [ ] **ADMIN.37 V3** — Delete a note (as Super Admin).
      Confirm it disappears from the page immediately —
      no hard reload required.

**Status toggle — immediate refresh on list and profile:**

- [ ] **ADMIN.37 V4** — As Editor: navigate to
      /crew/volunteers (the volunteer list). Open a
      volunteer profile. Archive the volunteer. Navigate
      back to /crew/volunteers. Confirm the archived
      volunteer is no longer visible on the active list
      (assuming the default filter shows active volunteers
      only) — without a hard reload.

- [ ] **ADMIN.37 V5** — Reactivate the archived volunteer
      from their profile. Navigate back to /crew/volunteers.
      Confirm they reappear on the active list immediately.

---

## ADMIN.38 — is_active Google Path + Production Role Guards

*Context: ADMIN.38 fixed two gaps: (1) the Google OAuth
callback now checks is_active and signs out + redirects
inactive accounts, matching the email/password path; (2)
addNote(), toggleStatus(), and addManualHours() in
lib/actions/volunteers.ts now correctly block Production
role via the allowlist pattern.*

*Note: ADMIN.38 V1 (is_active Google check) is covered by
ADMIN.36 V9 above — do not duplicate. The Production role
guard corrections are server-action-level fixes; the
browser-level Production role routing verification (cannot
access /crew/volunteers) is the primary check.*

**Production role cannot access volunteer database:**

- [ ] **ADMIN.38 V1** — Log in as a Production role
      account. Confirm the sidebar shows Calendar, Media
      Library, and Help only — no Volunteers, Shows, or
      other sections. Attempt to navigate directly to
      /crew/volunteers. Confirm redirect to /crew/calendar
      (proxy blocks this route for Production). Confirm
      no volunteer data is exposed.

- [ ] **ADMIN.38 V2** — As Production: attempt to navigate
      to /crew/volunteers/[any-volunteer-id]. Confirm
      redirect to /crew/calendar. Production must not be
      able to access any volunteer profile page directly.
      *(Requires Production account — may need to create
      one via /crew/settings/users if none exists)*

---

## Phase 19 — Volunteer Communication Preferences

*Context: Phase 19 (19.1–19.3) added the optional
`communication_preference` column to volunteers (nullable
text CHECK 'email'|'phone'|'either'). Advisory only — no
system enforcement. Displayed in the volunteer signup form,
/update form, Call Board volunteer card, admin volunteer
profile, and volunteer list.*

*Label mapping: 'email'→"Email", 'phone'→"Phone",
'either'→"Either is fine", null→"No preference" (forms
and Call Board) or "—" (admin profile view mode).*

---

### Phase 19.2 — Public Forms

*Prerequisites: A volunteer with a known update token for
/update testing. A real browser session for the public
signup form at /.*

**Signup form (/)**:

- [ ] **19.2 V1** — Navigate to / (public volunteer signup
      form). Scroll to the bottom of the form fields.
      Confirm a "Preferred contact method" dropdown appears
      after the "Referred by" field. Confirm four options:
      "No preference," "Email," "Phone," "Either is fine."
      Confirm the field has no required indicator (it is
      optional).

- [ ] **19.2 V2** — Submit the signup form with "Email"
      selected for preferred contact method (use a test
      email). Supabase: confirm `volunteers.
      communication_preference = 'email'` for the new
      volunteer row. *(Supabase)*

- [ ] **19.2 V3** — Submit the signup form with "No
      preference" selected (the default empty option).
      Supabase: confirm `volunteers.communication_preference
      IS NULL` for the resulting volunteer row. *(Supabase)*

**Update form (/update):**

- [ ] **19.2 V4** — Navigate to /update using a volunteer's
      update token (for a volunteer who has a non-null
      communication_preference). Confirm the "Preferred
      contact method" dropdown appears pre-filled with their
      current preference value.

- [ ] **19.2 V5** — Change the preference on /update to
      a different value and submit. Confirm the in-page
      success message appears. Supabase: confirm
      `volunteers.communication_preference` updated to the
      new value. *(Supabase)*

- [ ] **19.2 V6** — Change the preference to "No
      preference" (empty option) and submit. Supabase:
      confirm `volunteers.communication_preference IS NULL`
      after update — not an empty string ''. *(Supabase)*

---

### Phase 19.3 — Call Board Volunteer Card

*Prerequisites: A volunteer with a known email or phone
for Call Board lookup.*

- [ ] **19.3 V1** — Navigate to /callboard. Look up a
      known volunteer (enter their email or phone). After
      the volunteer card loads, confirm a "Preferred
      contact method" section is visible on the card with
      a dropdown/select element.

- [ ] **19.3 V2** — On the Call Board volunteer card:
      change the preference using the inline select (e.g.
      select "Phone"). Confirm the UI updates (optimistic
      state). Reload the page. Look up the same volunteer.
      Confirm the preference persists as "Phone."

- [ ] **19.3 V3** — Supabase: confirm `volunteers.
      communication_preference = 'phone'` for the volunteer
      updated in V2. *(Supabase)*

- [ ] **19.3 V4** — Change the preference on the Call
      Board card back to "No preference" (empty option).
      Reload. Confirm the select shows "No preference" as
      the selected state. Supabase: confirm
      `communication_preference IS NULL`. *(Supabase)*

---

### Phase 19.3 — Admin Volunteer Profile

*Prerequisites: Editor account. Viewer account (A1).
A volunteer with a known preference value.*

- [ ] **19.3 V5** — As Editor or Super Admin: navigate
      to a volunteer profile. In view mode (not editing),
      confirm "Preferred contact method" appears in the
      personal info section alongside other contact fields.
      For a volunteer with a saved preference, confirm the
      value displays (e.g. "Email"). For a volunteer with
      null preference, confirm "—" displays.

- [ ] **19.3 V6** — Click "Edit" to enter edit mode.
      Confirm a "Preferred contact method" select appears
      with the volunteer's current value pre-filled. The
      select shows "No preference" for null values.

- [ ] **19.3 V7** — Change the preference in edit mode
      to a different value. Click Save. Confirm the updated
      value appears in view mode immediately without a
      hard reload.

- [ ] **19.3 V8** — As Viewer (A1): navigate to a
      volunteer profile. Confirm the "Preferred contact
      method" field is visible in view mode (all roles can
      see it). Confirm no edit select or edit button is
      shown — view-only for Viewers.

---

### Phase 19.3 — Volunteer List

*Prerequisites: At least one volunteer with a non-null
communication_preference and at least one volunteer with
null preference exist in the system.*

- [ ] **19.3 V9** — Navigate to /crew/volunteers. Find
      a volunteer row where the volunteer has a non-null
      communication_preference. Confirm a small badge
      appears on their row (e.g. "Email," "Phone," or
      "Either") appended to the Name cell alongside any
      existing SH badge.

- [ ] **19.3 V10** — Find a volunteer row where
      communication_preference is null. Confirm no
      preference badge appears on their row — empty/clean
      state.

- [ ] **19.3 V11** — Locate the "Preferred Contact" filter
      in the volunteer list filter bar (alongside other
      filters: status, category, etc.). Select "Email
      only." Confirm only volunteers with
      communication_preference = 'email' appear in the
      list. No null-preference volunteers should appear.

- [ ] **19.3 V12** — Change the filter to "Phone only."
      Confirm only phone-preference volunteers appear.
      Change to "Either is fine." Change to "All" (default).
      Confirm the full list restores on "All."

- [ ] **19.3 V13** — Combine the preference filter with
      another filter (e.g. category or status). Confirm
      both filters apply simultaneously — only volunteers
      matching both conditions appear.

- [ ] **19.3 V14** — Download the volunteer CSV export
      (with no active filters, or with the preference
      filter active). Open the CSV. Confirm a "Preferred
      Contact" column exists. Confirm values read "Email,"
      "Phone," "No preference," or blank (empty string for
      null) — never the raw DB values ('email', 'phone',
      'either').

---

## Phase THEME — Dynamic CSS Brand Color System

Phase THEME (THEME.A through THEME.3b-4) replaced all
static hardcoded brand colors across the platform with a
dynamic system driven by `brand_primary` and `brand_accent`
in `app_settings`. Verification confirms colors propagate
correctly at all rendering surfaces: web UI (CSS custom
properties), email templates (dynamic hex interpolation),
and PDF exports (`createStyles()` factory).

**PREREQUISITE:** `brand_primary` and `brand_accent` must
be set to recognizable test values in the Setup Panel
(Section 2 — Brand Colors) before running V1–V8 and
V13–V14. Use distinctive colors (e.g. hot pink `#FF1493`
and lime green `#00FF00`) so any failure to update is
immediately obvious. Restore to 30BN defaults
(`#293994` / `#F26522`) after completing verification.

**CSS custom property injection:**

- [ ] **THEME V1** — *(Advanced/optional — requires
      browser devtools)* Open any page on the production
      site (e.g. /). Open browser devtools → Elements
      → <body> element. Confirm a <style> tag exists as
      the first child of <body> containing:
      `:root { --brand-primary: [hex]; --brand-accent:
      [hex]; --brand-primary-mid: color-mix(...);
      --brand-primary-tint: color-mix(...);
      --brand-primary-light: color-mix(...);
      --brand-accent-light: color-mix(...); }`
      Confirm the --brand-primary and --brand-accent
      values match what is set in the Setup Panel.

**Public page brand colors:**

- [ ] **THEME V2** — Navigate to the public landing page
      (/). Confirm the primary brand color (e.g. the
      header background, CTA button fill, or nav bar)
      reflects the current brand_primary value set in
      the Setup Panel — not a hardcoded navy blue.
      Change brand_primary in the Setup Panel. Reload
      the public page. Confirm the color updates.
      *(Requires Setup Panel access — Super Admin)*

- [ ] **THEME V3** — Navigate to /callboard, /shows,
      and /forms/[id] (a live form). Confirm primary
      brand colors (buttons, headers, borders) on all
      three pages match the current brand_primary value.
      Confirm accent colors (CTA buttons, highlights)
      match brand_accent.

- [ ] **THEME V4** — Navigate to /crew/login (the admin
      login page). Confirm the primary brand color on
      the login form (button, border, focus ring) matches
      the current brand_primary — not hardcoded navy.

**Admin UI brand colors:**

- [ ] **THEME V5** — Log in to the admin Production Crew
      (/crew/dashboard). Confirm the sidebar, top bar,
      active nav item highlight, and primary action
      buttons all reflect the current brand_primary.
      Confirm CTA buttons and accent elements reflect
      brand_accent.

- [ ] **THEME V6** — Navigate to /crew/volunteers, a
      volunteer profile, and /crew/shows. Confirm table
      headers, active filters, primary buttons, and link
      colors match the current brand_primary / brand_accent
      values. No element should show hardcoded navy or
      orange if test colors are set.

**Brand color change propagation:**

- [ ] **THEME V7** — As Super Admin: navigate to
      /crew/settings/setup → Section 2 (Brand Colors).
      Change brand_primary to a distinctly different test
      color. Click Save. Navigate to a public page (/).
      Confirm the new color appears immediately (may
      require a page reload — SSR fetches at render time).
      Navigate to an admin page (/crew/dashboard). Confirm
      the new color appears there too. Restore brand_primary
      to `#293994` after confirming.
      *(Requires Super Admin access and Setup Panel)*

- [ ] **THEME V8** — Repeat V7 for brand_accent (change
      to a test color, confirm CTA buttons and accent
      elements update on both public and admin pages,
      restore to `#F26522`).
      *(Requires Super Admin access and Setup Panel)*

**Email brand colors:**

- [ ] **THEME V9** — Sign up as a new test volunteer on /
      using a real email address. Receive the confirmation
      email. Confirm the email header background, CTA
      button color, and any colored text use the current
      brand_primary / brand_accent values — not hardcoded
      navy/orange. *(Requires real email delivery)*

- [ ] **THEME V10** — Claim a slot on a live show as a
      test volunteer (real email). Receive the slot claim
      confirmation email. Confirm the email uses dynamic
      brand colors matching the current Setup Panel values.
      *(Requires real email delivery)*

- [ ] **THEME V11** — As Super Admin or Editor: send an
      email blast via /crew/communication to a test
      recipient. Receive the blast email. Confirm the
      email header and any structural colors reflect the
      current brand_primary. *(Requires real email delivery)*

- [ ] **THEME V12** — *(Optional — requires milestone
      trigger)* Trigger a milestone for a test volunteer
      (e.g. mark Showed for their first time). Receive the
      milestone congratulations email. Confirm the email
      uses dynamic brand colors — particularly the colored
      milestone tier badge and CTA button.
      *(Requires real email delivery)*

**PDF export brand colors:**

- [ ] **THEME V13** — With a distinctive test color set
      for brand_primary (not the default navy): navigate
      to /crew/volunteers and download the PDF export.
      Open the downloaded PDF. Confirm the branded header
      background reflects the test brand_primary color —
      not hardcoded navy. *(Requires Super Admin or Editor
      account + PDF viewer)*

- [ ] **THEME V14** — Restore brand_primary to `#293994`.
      Download the PDF export again. Confirm the header
      returns to navy (`#293994` — the 30BN default).
      This confirms the PDF correctly reads the live
      app_settings value rather than a cached static value.
      *(Requires PDF viewer)*

---

*Total items in this carry-forward list: 830*
*(788 v16 items + 42 new v17 items)*
*Prior (v16): 788 items*
*v17 additions: 42 new items — ADMIN.35 (V1–V4: dark
mode main content area verification), ADMIN.36 (V1–V11:
Google OAuth registration path — new registrant, pending,
declined, approval, is_active check), ADMIN.37 (V1–V5:
revalidatePath gaps — note add/edit/delete, status toggle
list refresh), ADMIN.38 (V1–V2: Production role routing
verification), Phase 19.2 (V1–V6: communication_preference
on public signup form and /update form), Phase 19.3 (V1–V4:
Call Board inline select, V5–V8: admin volunteer profile
view/edit, V9–V14: volunteer list badge + filter + CSV).*
*v17 superseded: none.*
*v17 updated: none (Seed Data Cleanup: ADMIN.36 Google test
registration cleanup note added; Phase 19 no-cleanup note
added).*
*Database-verifiable items handled separately in*
*30BN-DB-VERIFY.4 (not counted here)*
*Last updated: July 2026 — v17 (Phase 19 complete:
communication_preference on volunteers; Google OAuth
registration path; dark mode main content fix; revalidatePath
gaps fixed; Production role guard corrections.)*
*DB-VERIFY.4 (July 2026): 5 items removed after live*
*Supabase confirmation (12.4 V1, ADMIN.21 V1,*
*CAL.10a V1/V2/V3). CAL.3 V2 annotated with FAIL*
*finding (zero show-sourced calendar_events despite*
*show_dates existing — requires investigation).*
*CAL.10a V4/V5, CAL.3 V6/V7/V8, CAL.4a V7/V8*
*retained (require browser action or real auth session).*

