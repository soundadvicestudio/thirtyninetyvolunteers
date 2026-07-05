# 30 By Ninety Theatre — Volunteer Platform
## 30BN_BRIEF_v1.md — Complete & Authoritative
### Created: July 2026 | Last Updated: July 2026 — v1.9 (9.2 and 10.1 build corrections)

---

## 1. Project Overview

**30 By Ninety Theatre Volunteer Platform** is a custom, full-stack volunteer management system built from scratch for 30 By Ninety Theatre (Old Mandeville, Louisiana). It replaces SignUp Genius and Google Forms with a single, branded, permanently owned platform.

**Built and maintained by:** Jonathan Sturcken (YLC member) — sole point of contact for questions, updates, and future development.

**Two user-facing surfaces:**
- **Public:** Volunteer signup landing page · per-show slot claiming pages · Volunteer Call Board self-service portal
- **Private (Production Crew):** Full admin backend for Super Admins, Editors, and Viewers

**Supabase project:** `thirtyninetyvolunteers` (ID: `nutvjkplbtobcmymqtzx`, org: `thirtybyninety`)
**GitHub repo:** `soundadvicestudio/thirtyninetyvolunteers` (private)
**Deployment:** Vercel (auto-deploy on GitHub push)
**Local folder:** `/Users/soundadvice/volunteers`
**Alpha URL:** `https://thirtyninetyvolunteers-a9wa3ttc3-soundadvicestudios-projects.vercel.app`
**Production URL:** `https://30byninetyvolunteers.com` (live)
**Current phase:** Alpha build in progress — Phases 1–10 complete, Phase 11 pending

---

## 2. Naming & Terminology

| Term | Definition |
|---|---|
| **Production Crew** | Admin backend display label. Route: `/crew` |
| **Volunteer Call Board** | Volunteer self-service portal display label. Route: `/callboard` |
| **Call** | A single volunteer appearance at a show or event. Never "shift." |
| **Super Admin** | Highest role. Full control including user management. |
| **Editor** | Theater exec or volunteer manager. Full read/write operational access. |
| **Viewer** | Coordinator-level. Read-only access. No email sending, no editing. |
| **Live** | Show status: visible to the public, open for slot claims. |
| **Season** | A grouped set of shows for a given year (e.g., 2025–26 Season). |
| **The Roster** | NOT USED. The volunteer database section is labeled **Volunteers**. |
| **Production Crew** | The admin backend. Labeled "Production Crew" in navigation. |

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Next.js (App Router, TypeScript) | Use `create-next-app@latest`. Do not pin to a version. |
| **Database** | Supabase (PostgreSQL) | Project: `thirtyninetyvolunteers` |
| **Auth** | Supabase Auth (email/password + Google OAuth) | Google SSO live in Alpha. Admin self-registration with pending approval flow added in ADMIN.15. Super Admin must approve before access is granted. |
| **File Storage** | Supabase Storage | Beta only (PDF consent form uploads). |
| **Styling** | Tailwind CSS v4 | CSS-first. See §4 Critical Constraint. |
| **UI Components** | shadcn/ui | Accessible, non-technical-friendly. `cssVariables: false` set in `components.json` — required for Tailwind v4 compatibility. All shadcn components must have default semantic color classes (`bg-primary`, `border-input`, `text-foreground`, etc.) replaced with explicit brand Tailwind classes at the time of addition. See R15. |
| **Email** | Resend | Domain `30byninetyvolunteers.com` verified in Resend during Alpha. Sending address: `volunteers@30byninetyvolunteers.com`. Free tier: 5 req/s — see R8. |
| **QR Codes** | `qrcode` npm package | Level H error correction. SVG + PNG export. NOT `react-qr-code`. |
| **Forms** | react-hook-form + zod + @hookform/resolvers | All form validation. `@hookform/resolvers` is a required peer package for `zodResolver` — install alongside react-hook-form. |
| **Dates** | date-fns + date-fns-tz | Two utility functions in `lib/utils/date.ts`. `formatCT()` — for full `timestamptz` values (created_at, updated_at, claimed_at, etc.) which include timezone info. `formatWallClockCT()` — for bare `date` column values (`'YYYY-MM-DD'`) and manually constructed date+time strings; these parse as UTC on Vercel without this function, shifting displayed dates by hours. Never use raw date-fns `format()`. See R23. |
| **Icons** | lucide-react | Icon system. |
| **Deployment** | Vercel (Hobby plan) | Auto-deploy on GitHub push. |
| **Export** | `@react-pdf/renderer` | PDF export of volunteer list via server-side route handler. CSV export is client-side via `lib/utils/csv.ts`. |
| **PWA** | Manual service worker | Admin-only PWA at `/crew` scope. Manifest at `public/manifest.json`, service worker at `public/sw.js` (network-first strategy). Icons generated via Sharp from `public/logo.png`. `start_url`: `/crew/dashboard`. |

**React Hook Form — Nested Arrays:**
Nested `useFieldArray` calls (arrays of arrays, e.g. dates each containing their own roles list) must be placed in their own named sub-component. React's rules of hooks prohibit calling `useFieldArray` inside a render loop over a parent field array. Pattern established in ADMIN.11 (DateRow sub-component inside ShowForm). See R24.

### Critical Constraint — Tailwind v4
Tailwind v4 uses CSS-first configuration. **There is no `tailwind.config.ts` in this project — do not create one.**
Use `postcss.config.mjs` with `@tailwindcss/postcss`.
The `@theme` block in `globals.css` **MUST use static hex values only.**
`var()` references inside `@theme` are NOT supported and cause runtime 404s even when the build succeeds.
This is a confirmed critical failure mode inherited from TWH build experience.

Correct `globals.css` structure:
```css
@import "tailwindcss";

@theme {
  --color-navy: #293994;
  --color-steel: #729ABF;
  --color-orange: #F26522;
  /* etc — static hex only, no var() */
}
```

### Critical Constraint — Resend Rate Limit
Free tier: **5 req/s**. Bulk sends MUST use `resend.batch.send([...])`.
Never call `resend.emails.send()` in a loop. This will hit the rate limit and drop emails.

### Critical Constraint — Vercel Hobby File Uploads
4.5MB serverless function body limit on Hobby plan.
PDF uploads (Beta document management) MUST use the **P-DC pattern** (direct browser upload to Supabase Storage). Never route file uploads through Server Actions on Hobby plan.

---

## 4. Environment Variables

All variables must be present in `.env.local` locally AND in Vercel Environment Variables before any deploy. Missing vars cause silent runtime failures, not build failures.

```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon/public key (safe for client)
SUPABASE_SERVICE_ROLE_KEY=       # Service role key — NEVER expose client-side
RESEND_API_KEY=                  # Resend API key (Alpha: sandbox key)
NEXT_PUBLIC_SITE_URL=            # Full site URL (http://localhost:3000 locally; Vercel URL on deploy)
CRON_SECRET=                     # Secret for Vercel Cron Job auth — must match vercel.json cron route
```

**Pre-deploy checklist:** Confirm all six are set in Vercel → Settings → Environment Variables before every deployment. A missing variable will not fail the build but WILL cause auth failures, email failures, or cron failures at runtime.

---

## 5. Supabase Configuration

**Authentication → URL Configuration (confirmed in Supabase dashboard):**
- Site URL: `https://30byninetyvolunteers.com`
- Redirect URLs (all confirmed):
  - `http://localhost:3000/auth/callback`
  - `https://thirtyninetyvolunteers-a9wa3ttc3-soundadvicestudios-projects.vercel.app/auth/callback`
  - `https://30byninetyvolunteers.com/auth/callback`
  - `https://nutvjkplbtobcmymqtzx.supabase.co/auth/v1/callback` (Google OAuth)

**Auth settings (confirmed):**
- Email/password: enabled
- Google OAuth: enabled — credentials from Google Cloud Console (OAuth client: "Volunteers Final")
- Email confirmation: disabled (accounts are either created by Super Admin or self-registered via the Request Access flow — all pending registrations require Super Admin approval before the account is active)

**Google Cloud Console OAuth client ("Volunteers Final"):**
- Authorized JavaScript origins: `http://localhost:3000`, `https://thirtyninetyvolunteers-a9wa3ttc3-soundadvicestudios-projects.vercel.app`, `https://30byninetyvolunteers.com`
- Authorized redirect URIs: all four Supabase/local/Vercel/production callback URLs above

**Storage Buckets (Beta — create when needed):**
- `documents` — volunteer consent form PDFs (public read)

---

## 6. Brand System

### Color Palette
```
Navy (primary):       #293994  --color-navy
Steel Blue:           #729ABF  --color-steel
Slate (header bg):    #97ACBF  --color-slate
Orange (CTA):         #F26522  --color-orange
Light Navy (accent):  #EEF1FA  --color-light-navy
Pale Orange (highlight): #FFF4EE --color-pale-orange
Footer Gray:          #F5F5F5  --color-footer-gray
Divider:              #D0D5E8  --color-divider
White:                #FFFFFF
Dark Text:            #1A1A1A  --color-dark
Mid Gray:             #555555  --color-mid-gray
```

### Typography
- **Font:** Open Sans (Google Fonts)
- **Weights used:** 300 (Light), 400 (Regular), 600 (Semibold), 700 (Bold), 800 (ExtraBold)
- **Google Fonts import:** `Open Sans:wght@300;400;600;700;800`

### Logo
- **File:** `theatre-logo-sm.png` (blue X mark with "30 Ninety Theatre" lettering)
- **Location:** `/public/logo.png` (copy and rename on project setup)
- **Usage:** Public landing page header, email templates
- **Background:** Transparent — works on white and navy backgrounds

### Email Design
- From address: `volunteers@30byninetyvolunteers.com` (domain verified in Resend during Alpha — no domain change needed at Launch)
- Default Reply-To: `info@30byninety.com` (editable per send by Editor)
- All emails use 30 By Ninety brand colors and Open Sans

---

## 7. User Roles & Access

| Role | Route Access | Can Edit | Can Email | Notes |
|---|---|---|---|---|
| Super Admin | All `/crew/*` + `/crew/settings/users` | Yes | Yes | Creates/manages all admin accounts |
| Editor | All `/crew/*` except user management | Yes | Yes (Beta) | Full operational access |
| Viewer | All `/crew/*` | No | No | Read-only. No edit controls rendered. |
| Volunteer | `/callboard` | Own profile card only | No | Email or phone lookup → immediate cookie session |
| Public | `/`, `/shows/*`, `/opportunities/*`, `/forms/*`, `/update`, `/checkin/*` | No | No | No auth required |

**Auth model:** Admin accounts exist in `admin_users` table (linked to Supabase Auth). Admins authenticate via email/password or Google OAuth — both routes verify the `admin_users` record before granting access. Volunteers are NOT Supabase Auth users — they identify themselves via email or phone lookup on the Call Board; a match sets a 7-day cookie session with no magic link or email step required.
**Admin accounts:** Created by Super Admin OR via the self-registration "Request Access" flow on the login page. Self-registered accounts are held in `pending_registrations` with status = 'pending' until a Super Admin approves and assigns a role. Super Admins receive an email notification on each new registration request.

---

## 8. Complete Feature Set

### Public — Volunteer Signup Landing Page (`/`)
- Branded, mobile-first landing page in 30 By Ninety visual identity
- Accessible via QR code (in programs and print)
- Heading reads "Join the 30 By Ninety Theatre Volunteer Community" (not "Join Our Next Production")
- Redundant "30 By Ninety Theatre" text under the logo has been removed
- Conditional announcement banner renders BELOW the logo/header area (not above). Full-width, bg-orange, prominent. Admin-controlled on/off.
- Downloadable consent form link (under-18; admin-swappable PDF — Beta)
- Two equal-weight outlined CTA buttons above the signup form: "Update My Info" (→ `/update`) and "View Opportunities" (→ `/callboard`). Appear below the bridging text, above the form.
- "Sign up to add your name to our volunteer list" subheading appears immediately above the form.
- Discreet "Production Crew" text link in page footer → `/crew/login` (intentionally subtle — small text, not a CTA button)
- Volunteer registration form:
  - Full name (required)
  - Email (required)
  - Phone (required)
  - Preferred pronouns (optional): dropdown (She/Her, He/Him, They/Them, Other, Prefer not to say) + free text
  - School (optional, toggleable by admin)
  - Age range (optional, toggleable by admin): Under 18 · 18–25 · 26–35 · 36–50 · 51+ · Prefer not to say
  - Is under 18: when "Under 18" selected → reveals Guardian Name (required) + Guardian Phone (required)
  - Service hours: when School is non-empty, reveals "Do you require service hours for your school or organization?" Yes/No question. Stored as `requires_service_hours` boolean. Hidden and reset to `false` when School is cleared.
  - Volunteer interest areas: multi-select from active `volunteer_categories`
  - How did you hear about us: dropdown from `hearing_options` table + "Other" with text input
  - Referred by: free text (optional)
- On submit: duplicate detection by email OR phone
  - No match → insert, send confirmation email
  - Match found → friendly merge prompt ("We found an existing record — update it?")
- Confirmation email: branded, warm, includes personal update token link
- Success state: warm thank-you in-page (no redirect)
- Confirmation email sent on signup includes a link to `/shows` so volunteers can browse upcoming opportunities immediately.
- `age_range` field is required when `signup_show_age_range` setting is `true` (owner decision, 30BN-2.3-FIX).

### Public — Volunteer Info Update (`/update`)
- Token-based: each volunteer has a unique `update_token` (UUID)
- Entry via link in confirmation email or token re-request (enter email/phone → receive new link)
- Pre-filled editable form (all fields; email read-only for reference; phone re-checked for duplicates on change)
- Service hours question appears pre-filled when the volunteer has a school value on file. Same conditional trigger as the signup form.
- On submit: update record, send "Your info has been updated" email

### Public — Show Listing (`/shows`)
- Lists all shows with status = 'live' that have at least one open slot in any role
- Shows with no open slots hidden entirely
- Per-show card: name, type, dates, open roles with slot counts, "Volunteer" button
- Mobile-first, QR-friendly

### Public — Per-Show Claiming Page (`/shows/[id]`)
- Unique public URL per show — shareable independently (works for non-database volunteers, rental productions)
- Displays: show name, description, dates/times, volunteer roles with open slot counts
- Waitlist option appears when a role is fully claimed
- Claim form: Name, Email, Phone (pre-fill if email/phone found in DB)
- On claim:
  - Same role + same date duplicate (same email/phone) → reassurance message inline; no second insert
  - Different date of same show (same email/phone) → friendly cross-date heads-up prompt with Confirm / No thanks; Confirm proceeds to insert a second claim for the new date
  - Success → insert `slot_claims`, send confirmation email with custom show instructions
  - Full → insert as waitlisted, send waitlist confirmation
- `submitClaim()` in `lib/actions/claims.ts` accepts an optional `force: boolean` flag; when true, skips the cross-date duplicate check (used when volunteer confirms the cross-date prompt)
- Self-cancel: tokenized link in confirmation email → `/cancel?token=[claim_token]`
  - Cancel page (`app/cancel/page.tsx`): shows claim details (show, date, role, name) + email confirmation input. Volunteer must confirm their email before cancellation proceeds.
  - On confirm: set `slot_claims.status = 'cancelled'`, `cancelled_at = now()`
  - Waitlist promotion (claimed cancellations only): promotes next waitlisted volunteer, renumbers remaining positions, sends promotion email
  - Waitlisted cancellations: renumbers remaining positions only; no editor notification, no promotion
  - Editor notification: all `show_editors` for the show receive a cancellation email (claimed cancellations only; skipped silently if no editors assigned)
  - 24hr reminder is handled by the Vercel Cron Job — promoted claims are picked up automatically on the next cron run

### Public — Volunteer Call Board (`/callboard`)
The Call Board is a single-page opportunities hub — the master view of everything a volunteer
can act on. Opportunities are the hero content and load for everyone. Volunteer identity is
optional and additive: entering email or phone personalizes the view with a volunteer card.

**Opportunities (always visible — no login required):**
- All live shows with open slots: show name, type, dates, open roles with slot counts,
  "Volunteer" button → `/shows/[id]`
- All active standing opportunities: title, description, claim type, "Learn More" button
  → `/opportunities/[id]`
- Mobile-first, QR-friendly. Designed as the primary destination for QR code scans from
  programs and print materials.

**Volunteer identity (optional — personalizes the view):**
- Persistent "Find your record" prompt on the page (email or phone input)
- Match found → set 7-day cookie session → volunteer card appears, no redirect, no email
- No match → friendly prompt: "You're not in our system yet — sign up here" → link to `/`
- Return visit with valid cookie → card loads automatically, no re-entry needed
- Sign out: clear cookie → card dismisses, page remains showing all opportunities

**Volunteer card (visible when session active):**
- Name, categories, total hours, next milestone + hours remaining
- Hours summary line: "[X] hours from [Y] shows • [Z] manual hours" (manual hours omitted if 0)
- Milestone badges (earned milestones displayed visually)
- Expandable call history: past calls (show, date via `formatWallClockCT()`, role, attendance
  status, hours logged). Sorted by `show_date` DESC. Collapsed by default.
- "Edit my info" → `/update?token=[update_token]` (existing update flow)
- "Sign out" button → calls `signOutCallboard()` then `router.refresh()`
- Active claims flagged inline on opportunity cards ("You're signed up" indicator)

**Session mechanics:**
- Cookie name: `callboard_session` — stores volunteer id, expires 7 days
- No token columns on `volunteers` table — session is cookie-only
- `lib/callboard/session.ts` — `getCallboardSession()`: reads cookie, fetches volunteer
  via `getAdminClient()`, returns volunteer or null
- `lib/actions/callboard.ts` — `lookupVolunteer(input)`: sequential email-then-phone
  maybeSingle() lookup, strips non-digits for phone comparison. Sets cookie on match.
  `signOutCallboard()`: deletes cookie.
- Middleware: `/callboard` excluded from admin session checks. Anonymous access intentional.
- No migration needed — no schema changes for the Call Board session.

### Public — Check-In Page (`/checkin/[token]`) — Alpha (stub in Alpha, full in Beta)
- Per-show-date QR code links to this page
- Enter email or phone → matched to `slot_claims` for that show date → auto-marks Showed
- Success/not-found/not-rostered states handled gracefully

### Admin — Production Crew (`/crew`)

**General:**
- **Light/Dark Mode:** The admin UI supports a Light/Dark mode toggle in the crew sidebar (sun/moon icon, bottom of sidebar). Preference persisted to localStorage. System preference (`prefers-color-scheme`) used as default when no saved preference exists. Implemented via Tailwind v4 `@variant dark` scoped to `[data-theme="dark"]` on the admin layout wrapper. Dark palette uses static hex values in `@theme` (dark-bg, dark-surface, dark-border, dark-nav, dark-text, dark-muted). Public pages unaffected.
- **PWA / Add to Home Screen:** Admin users (all roles) can add Production Crew to their device home screen. Admin-only scope (`/crew/`). Offline support via network-first service worker (serves cached content when offline, refreshes on open when connected). App icon: blue X on navy background. `start_url`: `/crew/dashboard`. Mobile sidebar (collapsible/hamburger) deferred to Phase 12 — PWA is most usable on tablet (768px+) until then.

**Login (`/crew/login`):**
- Email/password form
- Google SSO: deferred to Beta
- On success: redirect to `/crew/dashboard` if valid `admin_users` record
- Invalid credentials or unregistered email: clear error, no redirect
- **Request Access** — "Request Access" toggle below the login form reveals a registration panel (Full Name, Email, Password, Confirm Password). On submit: creates Supabase Auth user, inserts `pending_registrations` row (status = 'pending'), sends notification email to all active Super Admins. Success state: in-page message, no redirect. Duplicate checks: existing `admin_users` email → "already registered"; existing pending row → "request already pending."

**Dashboard (`/crew/dashboard`):**
- **Season at a Glance + Quick Stats:** Planned but not yet built. ADMIN.20 will deliver: per-show staffing fill status (red/yellow/green per role), Super Admin-configurable season selector (stored in `app_settings` as `dashboard_season_id`), and stat tiles (Total Active Volunteers, Upcoming Shows This Month, Volunteers Needed, Recent Signups 7 days). Falls back to all live shows when no season is pinned.
- **Pending Hours Review** (Editor/Super Admin only): all past `attendance` records with `status = 'showed'` and `hours_confirmed = false`, grouped by show + date. Per-volunteer row: name, role, editable hours input (pre-filled with current `hours_logged`), Confirm button. On confirm: `confirmHours()` applies delta to `volunteers.total_hours`, inserts correction entry in `volunteer_hours_log` if delta ≠ 0, sets `hours_confirmed = true`. Card hidden when empty. Built in 30BN-9.1 (PendingHoursCard).
- **Pending Milestone Acknowledgments** (Editor/Super Admin only): all `milestone_log` rows with `editor_acknowledged = false`, per volunteer. "Mark Acknowledged" button prompts Editors to give a personal thank-you. Clears on acknowledge. Built in 30BN-9.2 (PendingMilestonesCard).
- **Activity feed:** paginated feed of platform events — volunteer signups, slot claims, cancellations, opportunity submissions — in reverse chronological order. Loads 10 at a time; "Load more" button appends the next 10. Per-user read state: each admin has an `activity_cleared_at` timestamp; events newer than this are highlighted "NEW." "Mark all as read" updates the timestamp without a page reload. Events include volunteer name (linked to profile) and context (show name linked to show detail, opportunity title linked to opportunity detail). Implemented via `get_activity_feed()` Supabase RPC (UNION of four event sources, SECURITY DEFINER).
- **Add to Home Screen card** (mobile only, dismissible): device-aware PWA install prompt. iOS: numbered steps with Share icon. Android: "Install App" button triggering native `beforeinstallprompt`. Hidden when already installed or dismissed (localStorage key). Built in ADMIN.16.

**Volunteers (`/crew/volunteers`):**
- Searchable, filterable, sortable list (full-text: name/email/phone)
- Filters: category, status (active/archived), age range, school, is_minor, milestone tier, Service Hours Required (Yes/No/All)
- Volunteer list is filterable by category (role)
- SH badge on list rows indicating `requires_service_hours`
- Sort: name, date joined, total hours, last call date
- Columns: Name, Email, Phone, Categories, Total Hours, Calls, Status, Joined
- Bulk select: export selected to CSV. `requires_service_hours` included in CSV export.
- **Export Matching (CSV):** filter-aware all-pages CSV export — exports all volunteers matching the current active filters, not just the current page. Built in ADMIN.19 (replaced the prior all-volunteers-ignoring-filters export).
- PDF export available (Editor/Super Admin) via server-side route handler at `/crew/volunteers/export`. Landscape A4, branded header, 9-column table (added "Svc Hrs" column in ADMIN.17). **Known gap:** the PDF route handler manually reconstructs URL params rather than reusing the full page-level state object, so it does not respect all active filters — specifically `milestoneTier` is not honored. The CSV "Export Matching" export is unaffected (it reuses the page-level state end-to-end). PDF filter gap is a pre-launch fix candidate.
- Milestone Tier filter: active as of 30BN-9.2. Filter options: Any milestone earned, First Call, 10+ Hours, 20+ Hours, 50+ Hours, 100+ Hours. Filter runs a pre-query against `milestone_log` then applies `.in('id', matchingIds)` on the main volunteer query.
- Row click → volunteer profile

**Volunteer Profile (`/crew/volunteers/[id]`):**
- All submitted fields (editable by Editors, read-only for Viewers)
- Service Hours Required field in Personal section: "Yes" (orange) / "No" (mid-gray) / "—" if no school on file. Editable in edit mode.
- Category tags (editable)
- Call history table (show, date, role, attendance, hours). Sorted by `show_date` descending via JS sort after fetch — fixed in ADMIN.19. The `.order('claimed_at')` PostgREST call was removed since `show_date` is fetched in the nested select and sorted client-side.
- **Hours section** (built in 30BN-9.1):
  - Total hours (from `volunteers.total_hours`)
  - Per-season breakdown: attendance hours grouped by season + manual hours as a separate "Manual Entries" line. Two queries + JS grouping (PostgREST cannot traverse `source_id` FK gap).
  - Full hours log table: Date | Hours (+/−) | Type | Note | Added By. `logged_date` (bare date, `formatWallClockCT`) for manual entries; `created_at` (timestamptz, `formatCT`) for attendance entries.
  - Manual entry form (Editors only): Hours, Date (defaults today), Note (required). Calls `addManualHours()` → inserts `volunteer_hours_log` (source_type: 'manual', logged_date set), updates `volunteers.total_hours`, calls milestone stubs.
- **Milestone history section** (built in 30BN-9.1, populated by 30BN-9.2): read-only list of all `milestone_log` rows for this volunteer. milestone_label | `formatCT(triggered_at)`. Empty state: "No milestones yet."
- All profile mutation components standardized to `router.refresh()` in ADMIN.19 (EditorNotes, StatusToggle, VolunteerProfileForm). `setIsEditing(false)` added alongside refresh in VolunteerProfileForm to prevent stale form state.
- **Editor Notes:** comment-style entries — each note logged with author name + timestamp. Stacked chronologically. Visible to Editors and Super Admins only. Never visible to volunteer (RLS enforced). Editors and Super Admins can add notes (append-only for Editors). Super Admins can also edit and delete existing notes. Implemented via Migration 004 RLS policies. For preferences, scheduling considerations, history, sensitive info.
- Status toggle: Active / Archived (Editors only, confirmation prompt)
- Audit entries for this volunteer (read-only, Editors only)

**Category Management (`/crew/settings/categories`):**
- Super Admin only (not Editor or Viewer)
- Add, rename, reorder (drag-and-drop or arrows), visibility toggle
- Visibility toggle: hides from public signup form. Does NOT affect existing DB assignments. Can be re-enabled at any time.
- Category description is editable inline from the category list (ADMIN.19) — same edit session as the name, submitted together. A `<textarea rows={2}>` appears in the row's edit mode. Server-side cap: 500 characters. The creation-time description field also uses a `<textarea>` (ADMIN.19). `renameCategory()` extended to accept optional `description` param.
- Default categories (seeded): Ushers/Front of House · Band Members · Concessions · Backstage Crew · Wardrobe/Costumes · Hair/Make-Up · Lighting Design · Lighting Operator · Sound Design · Sound Operator · Set Build · Set Design · Stage Manager · Tech · Cleaning/Organization

**User Management (`/crew/settings/users`) — Super Admin only:**
- List all admin users: name, email, role, status, last login, created
- **Pending Registrations section** (appears above admin list when requests exist): per-request row with name, email, requested time, role selector (default Viewer), Approve and Decline buttons with inline confirmation. Badge on Users sidebar nav link showing pending count. Approve: creates `admin_users` row, sends approval email. Decline: deletes Supabase Auth user, sends decline email. Both log to `audit_log`. Built in ADMIN.15.
- Create new account: Name, Email, Role (Editor/Viewer), Send Welcome Email toggle
  - Creates Supabase Auth user, inserts `admin_users` record, sends branded welcome email with login link + temp password + instructions to change password
- Deactivate/reactivate (cannot deactivate own account)
- Multiple Super Admins are supported. Deactivate button is disabled for ALL Super Admin rows in the Users table (not just own account).
- Change role (Super Admin only). Super Admin role cannot be changed via the Users panel.
- Super Admin cannot be demoted via this panel
- **Change Password** — `/crew/settings/password` page accessible to all logged-in admins via "Change Password" link in the top bar. New Password + Confirm New Password fields (min 8 chars). Uses Supabase Auth `updateUser({ password })`. No current password field required (relies on valid session). Logged to `audit_log` as `user.password_change`. Built in ADMIN.15.

**Show Management (`/crew/shows`):**
- Show list organized by season, filter by type/status
- Create/edit show: name, show type (Mainstage/Studio X/One-Off), season, dates+times with per-date volunteer roles (each date has its own independent role configuration — role name, category, slot count), assigned editors, custom show instructions (included in slot claim confirmation email), status (draft/live/past/archived). "Copy roles from previous date" convenience copies the role structure from the preceding date row.
- Draft/Live toggle: live = visible to public immediately
- Per-show detail page (`/crew/shows/[id]`):
  - Tabs: Overview / Volunteers / Waitlist / Dates / Settings
  - Volunteers tab: per-role roster, attendance status, per-date filter
  - Waitlist tab: ordered list per role, volunteer name + time added
  - Settings tab: assigned editors (add/remove any time), status selector (all four values: Draft/Live/Past/Archived). Note: there is no separate public visibility boolean — public visibility is controlled entirely by status = 'live'.
- Post-event attendance marking (Editors only, only available after show date has passed):
  - Per-volunteer, per-date: Showed / No-Show / Excused
  - Showed: triggers hours increment + milestone check
  - Bulk mark: per-role "Mark All Showed" button (one button per role section, not a global button for all roles at once)
- Attendance re-marking: changing a volunteer from Showed to No-Show or Excused subtracts the previously logged hours from `volunteers.total_hours` and inserts a negative `volunteer_hours_log` entry. Changing from a non-Showed status to Showed adds hours. The hours delta is computed server-side and applied atomically. If `slot_claims.volunteer_id` is null (non-registered volunteer), the attendance record is still inserted but hours are not tallied.

**Standing Volunteer Opportunities (30BN-4.4a/4.4b):**
- Non-show volunteer opportunities for intern positions, long-term roles, and organizational interest. Public URL: `/opportunities/[id]`. Linked from `/shows` public page above productions (wired in Phase 5).
- Admin management at `/crew/shows/opportunities`: list (all statuses), create, edit, archive. Cross-linked from `/crew/shows` via "Standing Opportunities →" link.
- Per opportunity, admin designates:
  - Title and optional description
  - Claim type: Expression of Interest (EOI) OR Slot Claim. EOI = volunteer submits interest, Editor follows up manually. Slot Claim = same cap enforcement as show slot claiming.
  - Slot cap: optional toggle. If off, open-ended. If on, enter a slot count. Cap applies to both EOI and Slot Claim types.
- Public submission page (`/opportunities/[id]`): name, email, phone form. Duplicate detection by email (friendly message, not an error). Cap enforcement: if Slot Claim and cap hit, "full" message rendered, no form shown.
- Confirmation email copy is distinct by claim type: EOI — warm, "we'll be in touch." Slot Claim — confirms the position.
- Admin detail page (`/crew/shows/opportunities/[id]`): public URL copy/view, edit link, submissions table (name, email, phone, linked volunteer profile if email/phone matches a `volunteers` record, submitted date, status).
- Submissions logged to `opportunity_submissions`. All submissions (including public) logged to `audit_log` with `admin_id = null` (see R25).
- No waitlist for opportunity submissions in Alpha.
- Archive action: sets `status = 'archived'`. Reactivate action: sets `status = 'active'`.
  Both are available to Editors and Super Admins from the opportunities admin list.
  `reactivateOpportunity()` added in ADMIN.14. `opportunity.reactivate` added to AuditAction.

**Category-Match Notifications (30BN-5.3):**
- When a show is published (status → live), the system can notify all volunteers who have selected a matching category/role.
- One email per volunteer per show regardless of how many roles match (deduplicated by the `get_show_notification_targets()` RPC via GROUP BY — see §9).
- Notification state tracked via `shows.notifications_sent_at` (nullable timestamptz — null = never sent, non-null = timestamp of most recent send).
- Send Notifications toggle at publish time: checked by default on first publish (notifications_sent_at null), unchecked by default on republish (notifications_sent_at non-null).
- Republish guard: if notifications_sent_at is non-null and toggle is checked, an inline warning appears before sending.
- Show form (new/edit): toggle appears near "Save & Publish" button, only when status = 'live'.
- Settings tab (show detail): selecting 'live' reveals an inline panel with toggle + confirm/cancel before committing the status change.
- Manual trigger on Overview tab (Editor/Super Admin only, live shows only): "Send Notifications" button (first send) or "Send Again" with inline confirm (repeat send). Shows "Notifications last sent [formatCT(notifications_sent_at)]" after first send.
- Notification email links to `/shows` (not a specific show URL). Subject: "Volunteer opportunity — [show name]".
- Uses `resend.batch.send()` in chunks of 100 per R8.
- `sendShowNotifications()` in `lib/actions/shows.ts` uses `getServerClient()` (admin-authenticated context).

**Staffing Dashboard (`/crew/dashboard`):** See Dashboard above.

**Forms & Surveys (`/crew/forms`):**
- Form builder at `/crew/forms/new` and `/crew/forms/[id]/edit`
- Field types: text, textarea, dropdown, checkbox, radio, date, rating (1–5), number
- Per-field: label, placeholder, required toggle, option list (for dropdown/radio/checkbox), sort_order
- Field reorder via up/down arrow buttons — NOT drag-and-drop. No drag library is installed.
  This was a confirmed explicit decision (replacing the original spec language). Do not install
  a drag library for this feature.
- Nested options arrays (for dropdown/radio/checkbox) are managed in their own sub-component
  `FieldOptionsEditor` per R24 — nested useFieldArray cannot be inlined in the parent field row.
- The options field in form_fields stores a JSON array string in the DB; parsed to string[] on
  read. Internally managed as `{ value: string }[]` in react-hook-form state (RHF requires
  object arrays for useFieldArray, not primitive string arrays); unwrapped to string[] at the
  FormData boundary and before passing to FormPreview.
- Preview tab: renders all 8 field types in read-only/disabled mode
- Status: draft / live / closed. Status selector + save buttons in FormBuilder.tsx.
- Form detail page (`/crew/forms/[id]`): public URL + copy, embed code + copy, QR code
  (inline SVG preview, PNG + SVG download via data URI pattern — same as show detail).
  Response count linked to responses page. Edit button (Editor/Super Admin only).
- Published form → unique public URL (`/forms/[id]`) — accessible publicly only when live.
  Draft and closed forms show a generic "not available" or "no longer accepting" state.
- Public form (`/forms/[id]`): dynamic zod schema built from field configuration at runtime,
  keyed by field id. Checkbox fields use Controller (not register) for string[] value management.
  Rating field rendered as 5 plain <button> elements (R19). Volunteer profile linking scans
  submitted values for email (@) and phone (digits) patterns — best-effort, not field-typed.
- Response viewer at `/crew/forms/[id]/responses`: client-side date range and match/unmatch
  filters (useMemo, no round trip). Checkbox values stored as JSON array string, rendered as
  comma-joined string in the viewer. CSV export of filtered set via lib/utils/csv.ts.
- Embed widget code: `<iframe src="/forms/[id]" ...>` snippet — copyable from form detail page.
- Key files: types/form.ts, lib/validations/form.ts, lib/data/forms.ts (getPublicForm,
  getFormDetail, getFormResponses), lib/actions/forms.ts (createForm, updateForm, getForms,
  getForm, submitFormResponse), lib/utils/formDisplay.ts (shared status label/badge maps),
  components/crew/forms/ (FormBuilder, FieldRow, FieldOptionsEditor, FormPreview, FormList).
- **updateForm() field sync** (fixed in ADMIN.17-FIX): uses diff-based field reconciliation — existing fields are UPDATEd in place (preserving response values), genuinely new fields are INSERTed, only explicitly removed fields are DELETEd (CASCADE on form_response_values fires only here). Field IDs flow through the full pipeline: DB → getForm() → FormBuilder defaultValues → buildPayload() → updateForm(). The prior full-replace strategy (delete-all / insert-all) was replaced because Migration 012's ON DELETE CASCADE on form_response_values.field_id made it destructive. revalidatePath added to both createForm() and updateForm() in ADMIN.17-FIX and ADMIN.19.
- **Per-value length cap** added in ADMIN.19: form_response_values.value capped at 2000 chars server-side in submitFormResponse().

**Volunteer Hours Review System:**
- **Option A model**: hours log immediately when attendance is marked Showed (using show's `default_hours`). `attendance.hours_confirmed = false` on every Showed mark. Editors review and confirm/adjust via the dashboard Pending Hours Review card. Corrections apply a delta to `volunteers.total_hours` and insert a signed entry in `volunteer_hours_log`.
- `markAttendance()` sets `hours_confirmed = false` on all Showed marks (new marks and re-marks). Re-marking away from Showed also resets `hours_confirmed = false`.
- `confirmHours(attendanceId, newHours)`: validates 0 ≤ hours ≤ 24, idempotency guard, computes delta, clamps total at 0, updates attendance row, inserts correction log entry if delta ≠ 0, calls milestone stubs, revalidates dashboard + volunteer profile.
- `addManualHours(volunteerId, hours, note, loggedDate)`: for non-show activity. Source_type: 'manual'. Hours capped at 24. Note required. logged_date required (bare date stored in `volunteer_hours_log.logged_date`). Calls milestone stubs.
- Migrations: 011 adds `attendance.hours_confirmed` (boolean NOT NULL DEFAULT false) and `volunteer_hours_log.logged_date` (date nullable). Composite index `idx_attendance_hours_confirmed(hours_confirmed, status)`.
- Email functions: none — hours review is an internal admin workflow.

**QR Code Generator (`/crew/tools/qr-generator`):**
- `lib/qr.ts`: server-side utility. `generateQR(url)` → `{ svg: string, pngBase64: string }`.
  Level H error correction. 2000×2000px PNG (base64, no data: prefix — callers construct
  download links as `href="data:image/png;base64,${pngBase64}"`). SVG download uses data URI:
  `href="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}"`. This is the confirmed
  actual pattern (not Blob) — verified against the show detail page implementation.
- Standalone generator (`/crew/tools/qr-generator`): URL input + optional label, "Generate QR
  Code" button, auto-prepends https:// if no protocol provided, result cleared on URL input
  change. QR preview renders in a white container regardless of dark mode (QR scanability
  requires white background). lib/actions/qr.ts wraps generateQR() as a server action for the
  standalone tool.
- Per-show QR: on show detail Overview tab (links to `/shows/[id]`). Built in 30BN-4.3.
- Per-form QR: on form detail page `/crew/forms/[id]` (links to `/forms/[id]`). Built in
  30BN-6.3 — pulled forward from Phase 7 scope because the form detail page was built then.
- All surfaces use the same `generateQR()` from lib/qr.ts.

**Volunteer Hours & Milestones:**
- Auto-tally: hours increment when attendance marked Showed (using show's default_hours, then reviewed via Pending Hours Review card)
- Default hours per show type (configurable in settings): Mainstage = 3hrs, Studio X = 2hrs, One-Off = 2hrs — overridable per show
- Manual entry: Editors add hours with note (e.g., "Set build — 4 hours") via the manual entry form on the volunteer profile
- Milestone thresholds: First Call · 10h · 20h · 35h · 50h · 75h · 100h · every 25h thereafter
- `MILESTONE_THRESHOLDS` and `getNextMilestone()` live in `lib/milestones-shared.ts` — a pure,
  client-safe file with no server-only dependencies. `lib/milestones.ts` (carries `'server-only'`)
  re-exports both for server-side callers and holds `checkMilestones()`/`checkFirstCall()`. This
  split prevents the `'server-only'` directive from poisoning the client bundle when the Call
  Board's VolunteerCard needs the pure helpers. Established 9.2.
- **`checkMilestones(volunteerId)`**: fetches current total and all previously earned thresholds from `milestone_log`. Finds all newly crossed thresholds (handles multiple crossings in one action). For each: inserts `milestone_log` row, sends tier-specific congratulations email, sets `editor_acknowledged = false`. 23505 (UNIQUE violation) errors handled gracefully — confirms UNIQUE constraint on `(volunteer_id, milestone_hours)` as the race-condition backstop.
- **`checkFirstCall(volunteerId)`**: checks for existing `milestone_hours = 0` row before inserting. Fires on first `attendance` record with `status = 'showed'`. Inserts `milestone_log` with `milestone_hours = 0`, `milestone_label = 'First Call'`.
- **`sendMilestoneEmail()`**: tier-specific subject and body for each threshold. Warm, personal copy. Single recipient — `resend.emails.send()` (R8). CTA links to `/callboard`.
- **`acknowledgeMilestone(milestoneId)`**: sets `editor_acknowledged = true`. Logged to `audit_log` as `milestone.acknowledge` (audit call added in 10.1, not 9.2). revalidatePath('/crew/dashboard').
- Milestone history on profile (30BN-9.1 section, populated by 30BN-9.2) + Call Board volunteer card (badges + next milestone label).
- Migration 013: UNIQUE constraint on `milestone_log(volunteer_id, milestone_hours)`.

**Audit Log (`/crew/settings/audit-log`):**
- Read-only. Editors and Super Admins only. Viewers redirected to dashboard.
- Server-side paginated (25 per page), filtered viewer built in 30BN-10.1.
- Entry point: "Audit Log" card on `/crew/settings` hub — a `LinkedCard` to
  `/crew/settings/audit-log` for Editors and Super Admins; a `LockedCard` with badge
  "Editor & Super Admin only" for Viewers. Added in 30BN-10.1 as a necessary undocumented
  addition — the page would have been unreachable without it.
- Filters: Admin User dropdown, Action Type dropdown (grouped by category), Target Type
  dropdown, Date From/To (DST-aware CT boundary via `fromZonedTime()` from `date-fns-tz` —
  not a hardcoded UTC offset, since Central Time alternates CST/CDT seasonally). Native
  `<form method="GET">` — filter changes update URL params, triggering server re-fetch.
- Columns: Date (`formatCT`) | Admin (name, "Public" for null admin_id) | Action
  (human-readable label) | Target (type + truncated id, linked to detail page where possible) |
  Details (expandable "View diff" inline panel).
- Diff panel: shows only changed keys (before → after). Keys only in after = "Added", only
  in before = "Removed". Unchanged keys hidden. Values rendered as strings; null → "—";
  boolean → "Yes"/"No".
- Action type dropdown groups: Volunteers, Shows & Seasons, Categories, Users & Auth,
  Opportunities, Forms, Attendance & Hours, **Slot Claims**, Milestones, Settings (Phase 11).
  Note: "Slot Claims" is a distinct group (not part of "Attendance & Hours") — added in
  10.1 build for consistency with the AuditAction type union organization.
- `logAction()` calls added to `acknowledgeMilestone()` (milestone.acknowledge) and
  `changePassword()` (user.password_change — no before/after values) in 30BN-10.1.
  `changePassword()` also gained a missing `getAdminUser()` call in 10.1 — ADMIN.15's
  original implementation had omitted it.
- Phase 11 AuditAction types pre-defined in type union: `settings.update`,
  `hearing_options.create`, `hearing_options.update`, `hearing_options.reorder`,
  `hearing_options.deactivate`. logAction() calls added in Phase 11.2.
- **Known gap:** `submitVolunteerForm()` (public signup action, `app/actions/volunteer.ts`)
  has no `logAction()` call. Public signup with null admin_id is valid per R25, but this
  action predates that pattern. Deferred — decision pending on whether to backfill.
- All admin actions logged: see complete AuditAction union in lib/audit.ts.
- Permanent, tamper-proof.

**Communication (Beta stubs in Alpha):**
- Email blasts: all volunteers / by category / individual
- Reply-to: editable per send, default `info@30byninety.com`
- Rich text composer, recipient preview, confirm before send
- Communication history log: every email logged

**Announcement Banner (`/crew/settings/announcement`):**
- Text input, on/off toggle, save → takes effect on public landing page immediately

**App Settings (`/crew/settings`):**
- Announcement banner
- Hearing options management (add/rename/reorder/deactivate)
- Signup form field toggles (school visible, age range visible)
- Default hours per show type
- Default reply-to email address

**Document Management (`/crew/settings/documents`) — Beta:**
- Upload/swap consent form PDF
- One active document per type
- Public landing page link auto-updates

**Check-In System (Beta — stub in Alpha):**
- Per-show-date check-in QR generated from show detail
- Public check-in page at `/checkin/[token]`

---

## 9. Database Schema

**MIGRATION FILE LOCATION:** All migration `.sql` files live at repo root (alongside `001_core_schema.sql`). There is no `supabase/migrations/` directory in this project. Do not create one. (R21)

Core tables created in Migration 001. Subsequent migrations add columns and tables as noted below. All FK columns have explicit indexes.

**Migration 001 status:** Applied — `001_core_schema.sql` live on project `nutvjkplbtobcmymqtzx`.

**Migration 002 status:** Applied — `002_volunteer_notes_role_rls.sql`
Fixes `volunteer_notes` RLS: replaced generic `authenticated_all_admin` (FOR ALL) policy with role-scoped SELECT/INSERT restricted to `is_editor()` (editor + super_admin). No UPDATE or DELETE policy (append-only). Creates `is_editor()` helper function.

**Migration 003 status:** Applied — `003_requires_service_hours.sql`
Adds `requires_service_hours` boolean NOT NULL DEFAULT false to `volunteers` table.

**Migration 004 status:** Applied — `004_volunteer_notes_superadmin_rls.sql`
Adds UPDATE/DELETE policies on `volunteer_notes` restricted to `is_super_admin()`. Creates `is_super_admin()` helper function. Super Admins can edit and delete notes; Editors cannot.

**Migration 005 status:** Applied — `005_standing_opportunities.sql`
Adds `standing_opportunities` and `opportunity_submissions` tables with indexes, `trg_standing_opportunities_updated_at` trigger (reuses `handle_updated_at()` function), and 4 RLS policies (admin_all + public_select_active on opportunities; admin_all + anon_insert on submissions).

**Migration 006 status:** Applied — `006_roles_per_date.sql`
Restructures `volunteer_roles`: replaces `show_id` FK with `show_date_id` FK (references `show_dates`). Backfills existing rows to each show's earliest date. Drops old `show_id` column, FK, and index. Adds `idx_volunteer_roles_show_date_id`. Roles now belong to individual show dates, enabling per-date independent staffing configurations.

**Migration 007 status:** Applied — `007_activity_feed.sql`
Adds `activity_cleared_at timestamptz` (nullable) to `admin_users`. Creates `get_activity_feed(p_limit, p_offset)` SECURITY DEFINER RPC function: UNIONs volunteer signups, slot claims, slot cancellations, and opportunity submissions into a unified chronological event feed. Granted to authenticated role.

**Migration 008 status:** Applied — `008_show_notifications.sql`
Adds `notifications_sent_at timestamptz` (nullable) to `shows`. Creates
`get_show_notification_targets(p_show_id uuid)` SECURITY DEFINER RPC function:
joins `volunteers → volunteer_category_assignments → volunteer_roles → show_dates`
to return matching volunteer id, full_name, email, and aggregated matching role
names for a given show. Granted to `authenticated` role only.
**Security note:** EXECUTE explicitly revoked from PUBLIC and anon roles after
creation (PostgreSQL grants EXECUTE to PUBLIC by default on new functions;
without this REVOKE, the anon role could call SECURITY DEFINER functions via
PostgREST and bypass RLS entirely). This REVOKE pattern is now a standing rule
(R28) and must be applied to all future SECURITY DEFINER functions.

**Migration 009 status:** Applied — `009_fix_activity_feed_execute_privilege.sql`
Revokes EXECUTE on `get_activity_feed(p_limit integer, p_offset integer)`
from PUBLIC and anon roles. Re-grants to authenticated for auditability.
Same fix as Migration 008 applied to the earlier SECURITY DEFINER function.
See R28.

**Migration 010 status:** Applied — `010_pending_registrations.sql`
Adds `pending_registrations` table for admin self-registration approval flow (ADMIN.15).

### pending_registrations
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
name           text NOT NULL
email          text NOT NULL
auth_user_id   uuid NOT NULL
status         text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','declined'))
requested_at   timestamptz NOT NULL DEFAULT now()
reviewed_by    uuid REFERENCES admin_users(id)
reviewed_at    timestamptz
-- UNIQUE INDEX: idx_pending_reg_email
-- INDEX: idx_pending_reg_status
-- RLS: super_admin_all_pending (authenticated, is_super_admin())
--      anon_insert_pending (anon, INSERT only)
```

**Migration 011 status:** Applied — `011_hours_tracking.sql`
Adds `attendance.hours_confirmed boolean NOT NULL DEFAULT false` with
composite index `idx_attendance_hours_confirmed(hours_confirmed, status)`.
Adds `volunteer_hours_log.logged_date date` (nullable).

**Migration 012 status:** Applied — `012_form_response_values_cascade.sql`
Changes `form_response_values.field_id` FK from NO ACTION to ON DELETE CASCADE.

**Migration 013 status:** Applied — `013_milestone_log_unique.sql`
Adds UNIQUE constraint `milestone_log_volunteer_threshold_unique` on
`(volunteer_id, milestone_hours)`.

**Next migration:** 014

**`is_admin()` function ordering constraint (confirmed technical necessity):**
`LANGUAGE sql` functions are catalog-validated at `CREATE FUNCTION` time.
Creating `is_admin()` before `admin_users` throws `42P01: relation "public.admin_users" does not exist`.
Correct order: create all tables first → create `is_admin()` → create RLS policies.
The function definition is unchanged; only its position in the migration differs from the original prompt spec.

### volunteers
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
full_name        text NOT NULL
email            text NOT NULL
phone            text NOT NULL
pronouns         text
school           text
age_range        text CHECK (age_range IN ('under_18','18_25','26_35','36_50','51_plus','prefer_not'))
is_minor         boolean NOT NULL DEFAULT false
guardian_name    text
guardian_phone   text
referral_source  text
referral_name    text
update_token     uuid NOT NULL DEFAULT gen_random_uuid()
status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived'))
total_hours      numeric(6,2) NOT NULL DEFAULT 0
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
requires_service_hours  boolean NOT NULL DEFAULT false
-- Constraint: UNIQUE (email), UNIQUE (phone)
-- Trigger: trg_volunteers_updated_at on UPDATE
```

### volunteer_categories
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
name             text NOT NULL
description      text
sort_order       integer NOT NULL DEFAULT 0
is_visible       boolean NOT NULL DEFAULT true
created_at       timestamptz NOT NULL DEFAULT now()
```

### volunteer_category_assignments
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
volunteer_id     uuid NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE
category_id      uuid NOT NULL REFERENCES volunteer_categories(id) ON DELETE CASCADE
created_at       timestamptz NOT NULL DEFAULT now()
-- UNIQUE (volunteer_id, category_id)
-- INDEX: idx_vca_volunteer_id, idx_vca_category_id
```

### volunteer_notes
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
volunteer_id     uuid NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE
author_id        uuid NOT NULL REFERENCES admin_users(id)
body             text NOT NULL
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_vnotes_volunteer_id
-- RLS: SELECT/INSERT for editors and super_admins
-- (is_editor()). UPDATE/DELETE for super_admins
-- only (is_super_admin()). Notes are append-only
-- for Editors. Never accessible via public routes.
```

### seasons
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
name             text NOT NULL
start_date       date
end_date         date
is_current       boolean NOT NULL DEFAULT false
created_at       timestamptz NOT NULL DEFAULT now()
```

### shows
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
season_id        uuid REFERENCES seasons(id)
name             text NOT NULL
show_type        text NOT NULL CHECK (show_type IN ('mainstage','studio_x','one_off'))
description      text
status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live','past','archived'))
volunteer_instructions text
check_in_token   uuid DEFAULT gen_random_uuid()
default_hours    numeric(4,2)
notifications_sent_at timestamptz
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_shows_season_id, idx_shows_status
-- Trigger: trg_shows_updated_at
-- NOTE: notifications_sent_at added in Migration 008.
-- Null = notifications never sent; non-null = timestamp
-- of most recent category-match notification send.
```

### show_dates
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
show_id          uuid NOT NULL REFERENCES shows(id) ON DELETE CASCADE
show_date        date NOT NULL
show_time        time NOT NULL
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_show_dates_show_id
```

### volunteer_roles
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
show_date_id     uuid NOT NULL REFERENCES show_dates(id) ON DELETE CASCADE
category_id      uuid REFERENCES volunteer_categories(id)
role_name        text NOT NULL
slots_available  integer NOT NULL DEFAULT 1
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_volunteer_roles_show_date_id
-- NOTE: roles belong to show_dates, not shows.
-- To query all roles for a show, join through
-- show_dates: WHERE show_dates.show_id = [id]
-- Migration 006 (006_roles_per_date.sql)
```

### slot_claims
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
volunteer_role_id uuid NOT NULL REFERENCES volunteer_roles(id) ON DELETE CASCADE
show_date_id     uuid NOT NULL REFERENCES show_dates(id) ON DELETE CASCADE
volunteer_id     uuid REFERENCES volunteers(id)
volunteer_name   text NOT NULL
volunteer_email  text NOT NULL
volunteer_phone  text
claim_token      uuid NOT NULL DEFAULT gen_random_uuid()
status           text NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed','cancelled','waitlisted'))
waitlist_position integer
claimed_at       timestamptz NOT NULL DEFAULT now()
cancelled_at     timestamptz
-- INDEX: idx_slot_claims_role_id, idx_slot_claims_volunteer_id, idx_slot_claims_show_date_id
-- NOTE: show_date_id is denormalized as of
-- Migration 006 — the date is implied by
-- volunteer_role_id → show_date_id on
-- volunteer_roles. Kept for query convenience.
-- Phase 12 cleanup candidate.
```

### attendance
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
slot_claim_id    uuid NOT NULL REFERENCES slot_claims(id)
volunteer_id     uuid REFERENCES volunteers(id)
show_id          uuid NOT NULL REFERENCES shows(id)
show_date_id     uuid NOT NULL REFERENCES show_dates(id)
status           text NOT NULL CHECK (status IN ('showed','no_show','excused'))
hours_logged     numeric(4,2) NOT NULL DEFAULT 0
hours_confirmed  boolean NOT NULL DEFAULT false
source           text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','checkin'))
marked_by        uuid REFERENCES admin_users(id)
marked_at        timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_attendance_volunteer_id, idx_attendance_show_id
-- INDEX: idx_attendance_hours_confirmed(hours_confirmed, status) — Migration 011
-- NOTE: hours_confirmed added in Migration 011. Set to false on every
-- Showed mark. Editors confirm/adjust via dashboard Pending Hours Review card.
```

### show_editors
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
show_id          uuid NOT NULL REFERENCES shows(id) ON DELETE CASCADE
admin_id         uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE
created_at       timestamptz NOT NULL DEFAULT now()
-- UNIQUE (show_id, admin_id)
-- INDEX: idx_show_editors_show_id, idx_show_editors_admin_id
```

### admin_users
```sql
id               uuid PRIMARY KEY  -- matches Supabase Auth UUID
name             text NOT NULL
email            text NOT NULL UNIQUE
role             text NOT NULL CHECK (role IN ('super_admin','editor','viewer'))
is_active        boolean NOT NULL DEFAULT true
last_login               timestamptz
activity_cleared_at      timestamptz
created_at               timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_admin_users_email
-- NOTE: activity_cleared_at added in Migration 007.
-- Null = never cleared; all feed events treated
-- as new until first clear.
```

### forms
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
title            text NOT NULL
description      text
status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live','closed'))
created_by       uuid REFERENCES admin_users(id)
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
qr_token         uuid NOT NULL DEFAULT gen_random_uuid()
```

### form_fields
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
form_id          uuid NOT NULL REFERENCES forms(id) ON DELETE CASCADE
field_type       text NOT NULL CHECK (field_type IN ('text','textarea','dropdown','checkbox','radio','date','rating','number'))
label            text NOT NULL
placeholder      text
options          jsonb
is_required      boolean NOT NULL DEFAULT false
sort_order       integer NOT NULL DEFAULT 0
-- INDEX: idx_form_fields_form_id
```

### form_responses
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
form_id          uuid NOT NULL REFERENCES forms(id)
volunteer_id     uuid REFERENCES volunteers(id)
submitted_at     timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_form_responses_form_id, idx_form_responses_volunteer_id
```

### form_response_values
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
response_id      uuid NOT NULL REFERENCES form_responses(id) ON DELETE CASCADE
field_id         uuid NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE
value            text
-- INDEX: idx_frv_response_id
-- NOTE: field_id FK changed from NO ACTION to ON DELETE CASCADE in
-- Migration 012 (012_form_response_values_cascade.sql). Combined with
-- updateForm()'s diff-based field sync (ADMIN.17-FIX), cascade fires
-- only when fields are explicitly deleted by an Editor — not on saves
-- where fields are retained.
```

### volunteer_hours_log
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
volunteer_id     uuid NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE
hours            numeric(4,2) NOT NULL
source_type      text NOT NULL CHECK (source_type IN ('attendance','manual'))
source_id        uuid
note             text
logged_date      date
added_by         uuid REFERENCES admin_users(id)
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_hours_log_volunteer_id
-- NOTE: logged_date added in Migration 011. Set for manual entries
-- (user-supplied date); null for attendance entries (date implied by
-- attendance record's show_date_id). Display: formatWallClockCT()
-- for logged_date (bare date); formatCT() for created_at (timestamptz).
```

### milestone_log
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
volunteer_id     uuid NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE
milestone_hours  numeric(6,2) NOT NULL
milestone_label  text NOT NULL
triggered_at     timestamptz NOT NULL DEFAULT now()
email_sent       boolean NOT NULL DEFAULT false
editor_notified  boolean NOT NULL DEFAULT false
editor_acknowledged boolean NOT NULL DEFAULT false
-- INDEX: idx_milestone_log_volunteer_id
-- UNIQUE: milestone_log_volunteer_threshold_unique (volunteer_id,
--   milestone_hours) — Migration 013. Race-condition backstop for
--   checkMilestones() and checkFirstCall(). 23505 errors caught and
--   handled gracefully in both functions.
```

### email_log
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
sent_by          uuid REFERENCES admin_users(id)
sent_at          timestamptz NOT NULL DEFAULT now()
subject          text NOT NULL
body_preview     text
recipient_type   text NOT NULL CHECK (recipient_type IN ('all','category','individual','transactional'))
recipient_filter text
reply_to         text
recipient_count  integer NOT NULL DEFAULT 0
```

### email_log_recipients
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
email_log_id     uuid NOT NULL REFERENCES email_log(id) ON DELETE CASCADE
volunteer_id     uuid REFERENCES volunteers(id)
email_address    text NOT NULL
-- INDEX: idx_email_log_recipients_log_id
```

### audit_log
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
admin_id         uuid REFERENCES admin_users(id)
action           text NOT NULL
target_type      text NOT NULL
target_id        text
before_value     jsonb
after_value      jsonb
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_audit_log_admin_id, idx_audit_log_target_type, idx_audit_log_created_at
```

### documents
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
name             text NOT NULL
document_type    text NOT NULL CHECK (document_type IN ('consent_under18','general'))
file_path        text NOT NULL
is_active        boolean NOT NULL DEFAULT false
uploaded_by      uuid REFERENCES admin_users(id)
uploaded_at      timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_documents_type_active
```

### app_settings
```sql
key              text PRIMARY KEY
value            text
updated_by       uuid REFERENCES admin_users(id)
updated_at       timestamptz NOT NULL DEFAULT now()
```

### hearing_options
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
label            text NOT NULL
sort_order       integer NOT NULL DEFAULT 0
is_active        boolean NOT NULL DEFAULT true
```

### standing_opportunities
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
title            text NOT NULL
description      text
claim_type       text NOT NULL
  CHECK (claim_type IN ('eoi', 'slot_claim'))
slot_cap_enabled boolean NOT NULL DEFAULT false
slot_cap         integer
status           text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'archived'))
created_by       uuid REFERENCES admin_users(id)
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_opp_status
-- Trigger: trg_standing_opportunities_updated_at
-- RLS: admin_all (authenticated, is_admin()),
--      public_select_active (anon, status='active')
-- Migration 005 (005_standing_opportunities.sql)
```

### opportunity_submissions
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
opportunity_id   uuid NOT NULL
  REFERENCES standing_opportunities(id) ON DELETE CASCADE
volunteer_id     uuid REFERENCES volunteers(id)
volunteer_name   text NOT NULL
volunteer_email  text NOT NULL
volunteer_phone  text
submission_token uuid NOT NULL DEFAULT gen_random_uuid()
status           text NOT NULL DEFAULT 'submitted'
  CHECK (status IN ('submitted', 'cancelled'))
submitted_at     timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_opp_submissions_opportunity_id
-- INDEX: idx_opp_submissions_volunteer_id
-- RLS: admin_all (authenticated, is_admin()),
--      anon_insert (anon INSERT only — no anon SELECT)
-- Migration 005 (005_standing_opportunities.sql)
```

**Default `app_settings` seed values:**
```
announcement_banner_active  → 'false'
announcement_banner_text    → ''
signup_show_school          → 'true'
signup_show_age_range       → 'true'
default_reply_to            → 'info@30byninety.com'
default_hours_mainstage     → '3'
default_hours_studio_x      → '2'
default_hours_one_off       → '2'
```

**Default `hearing_options` seed:**
Social Media (Instagram/Facebook/TikTok) · Word of Mouth · Program/QR Code · Our Website · Previous Patron/Audience Member · Another Volunteer · Other

**Default `volunteer_categories` seed:**
Ushers/Front of House · Band Members · Concessions · Backstage Crew · Wardrobe/Costumes · Hair/Make-Up · Lighting Design · Lighting Operator · Sound Design · Sound Operator · Set Build · Set Design · Stage Manager · Tech · Cleaning/Organization

---

## 10. Alpha Build — Phases & Prompts

**Alpha goal:** Fully functional, demonstrable system covering the complete core platform. Every feature below is production-quality — not a prototype, not a stub unless explicitly noted.

**Alpha includes:** Volunteer signup, Production Crew backend, show management, slot claiming, custom forms, QR codes, Volunteer Call Board, volunteer hours/milestones, audit log, stub pages for all Beta features, custom 404.

**Alpha excludes (Beta):** Email blasts, check-in system (full), document upload management.
*(Google SSO moved to Alpha — completed in 30BN-1.3)*

**Prompt naming:** `30BN-[Phase].[Prompt]`

---

### Phase 1 — Foundation ✓ Complete

**30BN-1.1 — Database Schema & Supabase Setup ✓**
Apply Migration 001: all tables, indexes, foreign keys, triggers, RLS policies, and seed data.
- All tables per §9 schema
- Triggers: `trg_volunteers_updated_at`, `trg_shows_updated_at`
- Supabase Auth: email/password enabled, no email confirmation, no self-registration
- RLS policies: anonymous can INSERT to `volunteers`, `slot_claims`, `form_responses`, `form_response_values`. Authenticated admin users (checking `admin_users` table) have full access scoped by role. `volunteer_notes` SELECT restricted to admin users only — never accessible via public routes.
- Seed: `volunteer_categories`, `hearing_options`, `app_settings` defaults
- Quality gate: all tables present in Supabase dashboard; seed data visible; RLS enabled on all tables

**30BN-1.2 — Next.js Project Scaffold & Vercel Deploy ✓**
Initialize project and confirm live deployment pipeline.
- `create-next-app@latest` (TypeScript, App Router, Tailwind, no `tailwind.config.ts`)
- Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `resend`, `qrcode`, `react-hook-form`, `zod`, `date-fns`, `lucide-react`, `shadcn/ui`
- Configure Tailwind v4 (`postcss.config.mjs`, `globals.css` with `@theme` static hex values — brand palette from §6)
- Configure Open Sans via Google Fonts in `layout.tsx`
- Supabase client utilities: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server components/actions)
- `lib/supabase/admin.ts`: admin client using SERVICE_ROLE_KEY — server-only, never imported in client components
- `.env.local` template with all five variables (values filled from Supabase dashboard + Resend)
- `/public/logo.png`: place theater logo
- Basic folder structure: `/app`, `/components`, `/lib`, `/types`
- Push to GitHub; connect Vercel; confirm auto-deploy pipeline
- Update `NEXT_PUBLIC_SITE_URL` in Vercel env to preview URL post-deploy
- Quality gate: Vercel deploy succeeds, `https://[preview].vercel.app` loads without error

**30BN-1.3 — Authentication System ✓**
Admin login, session management, and route protection.
**Scope note:** Google SSO included in Alpha (owner decision, 30BN-1.3 session) — moved forward from Beta Phase 16.
**Gap note:** `admin_users.last_login` column exists but is never written on sign-in. Address as `30BN-ADMIN.1` before Phase 3 ships.
- `/crew/login`: email/password form using Supabase Auth. On success: verify email exists in `admin_users` AND `is_active = true` → redirect to `/crew/dashboard`. On failure: clear error message.
- Auth callback route: `/auth/callback` (exchanges code for session)
- Middleware: protect all `/crew/*` routes. Redirect unauthenticated → `/crew/login`. Redirect authenticated non-admin (not in `admin_users`) → `/crew/login` with error.
- Role context: server-side helper `lib/auth.ts` → `getAdminUser()` returns `admin_users` record for current session. Used throughout Production Crew.
- Sign-out action: clears Supabase session, redirects to `/crew/login`
- Bootstrap: seed one Super Admin row in `admin_users` with known credentials for first login
- Quality gate: can log in with seeded Super Admin account; `/crew/dashboard` loads; logout works; unauthenticated `/crew/anything` redirects to login

---

### Phase 2 — Public Volunteer Signup ✓ Complete

**30BN-2.1 — Landing Page Design & Layout ✓**
- `/` page: full 30 By Ninety branding (§6 palette, Open Sans, logo)
- Announcement banner: conditional render when `app_settings.announcement_banner_active = 'true'`
- Consent form link: link to active `documents` record type `consent_under18` (returns null gracefully if none — link hidden)
- "Update my info" link → `/update`
- Responsive: mobile-first. Designed for QR-code scan arrival (fast load, large tap targets, no horizontal scroll)
- Art direction: warm, energetic, inviting — theater-branded without being stiff. The page should feel like being welcomed into a community.
- Quality gate: renders correctly on mobile (375px) and desktop; banner conditional behavior works; all links functional

**30BN-2.2 — Volunteer Registration Form ✓**
All fields per §8 feature set. Build with `react-hook-form` + `zod`.
- Guardian fields: revealed when age_range = 'under_18'. `is_minor` set to true in DB.
- Category multi-select: loaded from `volunteer_categories` WHERE `is_visible = true`
- Hearing options: loaded from `hearing_options` WHERE `is_active = true`
- School/age range visibility: respect `app_settings` toggles
- Inline field-level validation errors. No full-page reload on submit.
- Quality gate: all fields validate correctly; guardian fields show/hide on trigger; submit reaches Supabase
- **Decision note:** `age_range` made required when `showAgeRange` is true (2.3-FIX). `@hookform/resolvers` confirmed required peer package — added to §3.

**30BN-2.3 — Form Submission Logic ✓**
- On submit: check `volunteers` for matching email OR phone
  - No match: insert volunteer, generate `update_token`, send Resend confirmation email (sandbox)
  - Match: surface merge prompt ("We found your record — update it?") — on confirm, update; on cancel, proceed as new entry
- Confirmation email: branded template, thank you, categories listed, personal update link (`/update?token=[update_token]`)
- Success state: warm in-page thank-you message, no redirect
- Error state: clear messaging, no data lost on network failure
- Duplicate check covers: exact email match OR exact phone match
- Quality gate: new signup appears in Supabase `volunteers`; email received in Resend dashboard; duplicate detection triggers correctly
- **Decision notes:** Confirmation email includes link to `/shows`. From address `volunteers@30byninetyvolunteers.com` (domain verified mid-Alpha, not deferred to Launch). Empty string fields normalized to null via `|| null` before DB insert — see R18.

**30BN-2.4 — Volunteer Info Update Flow ✓**
- `/update`: if no token in URL → show email/phone lookup form → on match, send new update link email; no match → friendly "not found" + link to signup
- `/update?token=[uuid]`: validate token against `volunteers.update_token` → load volunteer data into pre-filled form (all fields; email read-only)
- On submit: update record, send "Your info has been updated" confirmation email, regenerate `update_token`
- Invalid/expired pattern: token is tied to the record; regenerating on each successful update invalidates old links
- Quality gate: update flow works end-to-end; invalid token shows graceful error; updated data visible in Supabase
- **Pattern notes:** Duplicate detection uses sequential email-then-phone queries (not OR) to avoid `maybeSingle()` conflict when email and phone match different records. Phone conflict check on update uses `.neq('id', volunteerId)` to exclude the current record.

---

### Phase 3 — Production Crew Core ✓ Complete

**30BN-3.1 — Admin Layout & Navigation ✓**
- `/crew` layout: sidebar nav, top bar (logged-in user name + role badge + sign out), main content area
- Navigation items — all admins: Dashboard, Volunteers, Shows, Forms, QR Generator, Communication (stub), Settings
- Navigation items — Editors + Super Admin only: all edit controls rendered
- Navigation items — Viewers: edit controls hidden/replaced with read-only indicators
- Navigation items — Super Admin only: Users (in Settings)
- Empty states and loading skeletons for every major view
- Role badge: color-coded (Super Admin = navy, Editor = steel blue, Viewer = gray)
- Quality gate: nav renders correctly for all three role types; Viewer sees no edit controls

**30BN-3.2 — Volunteers List View ✓**
- `/crew/volunteers`: paginated volunteer list with all filters and sort from §8
- Columns, search, filters per §8
- Bulk select → "Export Selected" (CSV with all fields)
- Row click → `/crew/volunteers/[id]`
- Quality gate: search, filter, sort, pagination all work; CSV export downloads correctly

**30BN-3.2b — PDF Export + Minor Fixes ✓**
- PDF export route handler at `/crew/volunteers/export` (Editor/Super Admin). Respects current filters. Landscape A4, branded header, 8-column table. Uses `@react-pdf/renderer`.
- Minor fixes to the Volunteers List View surfaced during 3.2 verification.
- Quality gate: PDF downloads correctly and reflects active filters; minor fixes verified

**30BN-3.3 — Volunteer Profile Page ✓**
- `/crew/volunteers/[id]`: full profile per §8
- All fields, editable inline by Editors (save triggers `updated_at`, logs to `audit_log`)
- Editor Notes: below profile. Notes input (textarea + submit). Notes displayed stacked chronologically with author name, formatted timestamp. Editors only — not rendered for Viewers. RLS ensures this data never leaks to public routes.
- Call history table (pulls from `slot_claims` + `attendance`)
- Hours summary, milestone history
- Status toggle: Active ↔ Archived (confirmation dialog, Editors only)
- Quality gate: edit saves correctly; notes appear with correct author/timestamp; archived status persists; Viewer sees no edit controls or notes

**30BN-3.4 — Category Management ✓**
- `/crew/settings/categories`: list of all categories
- Add category (name + optional description), rename inline, reorder, visibility toggle
- Visibility toggle: immediately updates `volunteer_categories.is_visible`. Public signup form reflects change without deploy.
- Deactivating a category does NOT remove existing `volunteer_category_assignments` records
- Quality gate: add/rename/reorder/toggle all persist; public form immediately shows/hides toggled category

**30BN-3.5 — Super Admin User Management ✓**
- `/crew/settings/users` (Super Admin only — middleware guards route)
- Full user list per §8
- Create account: form → insert `admin_users` + create Supabase Auth user via admin client → send branded welcome email (Resend) with: login URL, email, temporary password, instructions to change password
- Deactivate/reactivate (guard: cannot deactivate own account)
- Change role (Super Admin only)
- Quality gate: new user can log in with provided credentials; deactivated user blocked at middleware; role change reflected immediately

**Document & Admin Prompts (since v1.2):**
```
30BN-ADMIN.2  ✓ Cleanup: sign-out button, timezone utility, landing page updates
30BN-ADMIN.3  ✓ Cosmetic fix: sign-out hover, sort header hover, CTA position
30BN-ADMIN.4  ✓ Service hours field (schema + all surfaces)
30BN-ADMIN.5  ✓ Users table Super Admin fix + Super Admin note edit/delete + PWA
30BN-ADMIN.6  ✓ Light/Dark mode toggle
30BN-ADMIN.7  ✓ Fix PWA start_url
30BN-DOC.3    ✓ Brief Update v1.3 (this prompt)
30BN-DOC.4    ✓ Process Update v1.3
```

---

### Phase 4 — Shows & Season Management ✓ Complete

**30BN-4.1 — Show Creation & Edit ✓**
- `/crew/shows/new` and `/crew/shows/[id]/edit` under `app/crew/(app)/` (R20)
- Unified "Show Dates & Roles" form: dates and roles are one section; each date row owns its own nested roles (role name, category from DB per R4, slot count). Minimum one date and one role per date required.
- "Copy roles from previous date" on each date row (except first) copies role structure from the preceding date — reduces repetitive entry for multi-date shows with identical staffing.
- Nested `useFieldArray` per date lives in a `DateRow` sub-component (R24).
- Season: select existing or create new inline (created on form submit, not eagerly).
- Default hours: auto-fills from `app_settings` by show type when not manually edited; manually overridable per show.
- Save as Draft / Save & Publish. Publish warns if any role across any date has 0 slots; slots_available accepts 0 so the warning is reachable.
- Edit mode: update-in-place for existing dates and roles (preserves slot_claims FKs). Deletion guarded against active claims; blocked deletions returned as warnings via query params, not blocking the full save.
- `lib/validations/show.ts` — form and server payload schemas. `types/show.ts` — Show, ShowDate, ShowDateWithRoles, ShowRole types.
- Audit: `show.create`, `show.update`

**30BN-4.2 — Season Management & Show List ✓**
- `/crew/shows`: season accordion (not tabs). Season with `is_current = true` expanded by default; if none, most recently created season. All other seasons collapsed.
- Empty seasons (zero shows) always render with "0 shows" header when no filter is active. Hidden only when a type/status filter empties them.
- "Unseasoned Shows" group for shows with null season_id — visible only when it has shows.
- Inline season creation panel (name, optional dates) above accordion; uses `router.refresh()` on success (in-place update, not navigation).
- Per-show card: name, type badge, status badge, date range (via `formatWallClockCT()`), staffing summary (X/Y slots across all dates and roles, color-coded). Staffing summary query joins through `show_dates → volunteer_roles → slot_claims`.
- Filters: type, status — client-side, no round trip.
- Quick actions: Edit, View Public Page (opens new tab), Copy Public URL (clipboard, 2s feedback), Set Live/Draft toggle (calls `toggleShowStatus()`, `router.refresh()` on success).
- Viewer: Edit, Set Live/Draft, New Show, New Season controls hidden. View and Copy URL visible.
- `lib/utils/showDisplay.ts` — shared type/status badge maps (imported by list and detail views).
- Audit: `season.create`, `show.status_change`

**30BN-4.3 — Admin Show Detail ✓**
- `/crew/shows/[id]`: five-tab view (Overview / Volunteers / Waitlist / Dates / Settings)
- Overview: show info, edit link (Editor/Super Admin), public URL with copy/view, QR code (inline SVG preview + PNG and SVG download links). QR generated server-side via `lib/qr.ts`.
- Volunteers tab: per-date filter dropdown (default: most recent past date). For the selected date, roles are read directly from the date object (roles are date-scoped post-Migration 006). Per-role table: volunteer name, email, claimed at, attendance selector. Auto-save on selector change (no separate save button). Per-role bulk "Mark All Showed" button. Past dates only show controls (R13). Future dates show "—". Warning indicator on rows where `slot_claim.volunteer_id` is null ("hours won't tally").
- Waitlist tab: ordered list per role (waitlist_position ASC) — name, email, added at.
- Dates tab: read-only, all show dates in order. Past dates visually distinguished.
- Settings tab: assigned editors search/add/remove (`addShowEditor`, `removeShowEditor`). Status selector (all four values — Draft/Live/Past/Archived) via `updateShowStatus()`. No separate public toggle — visibility is status = 'live'.
- Attendance re-marking: hours delta computed server-side (subtract on Showed→other, add on other→Showed). Null volunteer_id: attendance row inserted, hours skip.
- `lib/qr.ts` introduced here: `generateQR(url)` → `{ svg: string, pngBase64: string }`. Level H (R6). 2000px PNG. Used here, in Phase 6, and Phase 7.
- `lib/milestones.ts` stub introduced here: `checkMilestones()` and `checkFirstCall()`. Wired in attendance action; real logic ships in 9.2.
- `lib/actions/attendance.ts` — `markAttendance()`, `bulkMarkAttendance()`.
- `formatWallClockCT()` added to `lib/utils/date.ts` (R23). Used for all show_date/show_time display.
- Audit: `attendance.mark`, `show.editor_add`, `show.editor_remove`, `show.status_change`

**30BN-4.4a — Standing Volunteer Opportunities: Admin Management ✓**
- Migration 005: `standing_opportunities` and `opportunity_submissions` tables (see §9).
- `/crew/shows/opportunities`: admin list with claim-type badges, slot cap display, submission counts, archive confirmation. Cross-linked from `/crew/shows`. Back-link to `/crew/shows`.
- `/crew/shows/opportunities/new` and `/crew/shows/opportunities/[id]/edit`: create/edit form (title, description, claim type, slot cap toggle).
- Archive action: sets `status = 'archived'`. No reactivate in Alpha (Q-item).
- `lib/actions/opportunities.ts` — `createOpportunity()`, `updateOpportunity()`, `archiveOpportunity()`.
- Audit: `opportunity.create`, `opportunity.update`, `opportunity.archive`

**30BN-4.4b — Standing Volunteer Opportunities: Public Submission & Admin Viewer ✓**
- Public page `app/opportunities/[id]/page.tsx` (at app root — no `app/(public)/` route group exists in this project). Branded header, "no longer available" state for inactive/missing, "full" state for capped Slot Claim opportunities.
- Submission form (`OpportunitySubmitForm.tsx`): name, email, phone. Submit label and success copy vary by claim type. Duplicate detection by email. Light mode only (public pages, per ADMIN.6).
- `lib/actions/submissions.ts` — `submitOpportunity()`: validates active status, enforces cap, checks duplicate, matches to volunteer record, inserts submission, sends confirmation email, logs to email_log/email_log_recipients, logs to audit_log with admin_id = null (R25).
- Two email templates in `lib/email.ts`: `sendOpportunityEOIEmail()` ("we'll be in touch"), `sendOpportunitySlotClaimEmail()` ("you're signed up").
- Admin detail page (`/crew/shows/opportunities/[id]`): public URL copy/view, edit link, submissions table with linked volunteer profile links.
- Audit: `opportunity.submission` (null admin_id)

**Document & Admin Prompts (since v1.3):**
```
30BN-ADMIN.8   ✓ (prior session — details in "Volunteer Platform Build Pt 2")
30BN-ADMIN.9   ✓ Timezone sweep — formatWallClockCT()
30BN-ADMIN.10  ✓ Season display fix + opportunity submission audit log
30BN-ADMIN.11  ✓ Roles-per-date schema fix (Migration 006)
30BN-ADMIN.12  ✓ Activity feed with pagination and per-user read state (Migration 007)
30BN-DOC.5     ✓ Brief Update v1.4
30BN-DOC.6     ✓ Process Update v1.4
30BN-DOC.7     ✓ Brief Update v1.5 (Phase 5)
30BN-DOC.8     ✓ Process Update v1.5
30BN-ADMIN.14  ✓ Cache revalidation sweep (revalidatePath
                 in all mutating actions), dialog close-button
                 dark hover fix, theme toggle hydration fix
                 (ThemeProvider → document.body), show edit
                 blank-role trap fix, opportunity reactivate
                 action and UI. R29/R30 established.
30BN-DOC.9     ✓ Brief Update v1.6 (Phases 6 and 7)
30BN-DOC.10    ✓ Process Update v1.6
30BN-DOC.11    ✓ Brief Update v1.7 (Call Board redesign)
30BN-DOC.12    ✓ Deferred Verification Document v3
                 (ADMIN.15–16 items added)
30BN-ADMIN.15  ✓ Self-registration + pending approval
                 flow, change password page, referral
                 field label corrections. Migration 010.
30BN-ADMIN.16  ✓ Add to Home Screen PWA card (dashboard),
                 Opportunities sidebar link, /crew redirect
                 fix, Brief cleanup (DOC.11 Q1 + stale
                 deferred item)
30BN-ADMIN.17  ✓ Lint sweep (zero errors/warnings achieved)
                 + Phase 12 quick wins: sendReminderEmail()
                 removed, PDF Svc Hrs column, page-param
                 clamp, Migration 012 (CASCADE)
30BN-ADMIN.17-FIX ✓ updateForm() diff-based field sync
                 (critical data-destruction fix enabled by
                 Migration 012 CASCADE). revalidatePath
                 added to updateForm() and createForm().
30BN-ADMIN.18  ✓ Read/audit/diagnose session (call history
                 sort, CSV export, category description,
                 empty states, image audit, input
                 sanitization). No code changes.
30BN-ADMIN.19  ✓ Targeted fixes: markAttendance() +
                 createForm() revalidatePath (R29),
                 call history JS sort (admin + Call Board),
                 filter-aware CSV export, category
                 description inline editing,
                 R18 fix (8× ?? → ||), .max() caps on
                 public Zod schemas, profile standardized
                 to router.refresh(), dark: gaps fixed on
                 profile header/status badge
```

---

### Phase 5 — Public Show Claiming ✓ Complete

**30BN-5.1 — Public Show Listing & Per-Show Page ✓**
- `/shows`: all live shows with ≥1 open slot, mobile-first, branded
- `/shows/[id]`: show detail, all dates/times, all roles with open slot counts, waitlist indicator when full
- Claiming form: Name, Email, Phone. Pre-fill if email/phone found in `volunteers`.
- Waitlist form: same fields, appears when role is full (replaces claim button with "Join Waitlist")
- Each show page has a standalone public URL — works independently for non-DB volunteers and rental productions
- Quality gate: only live shows with open slots appear; full roles show waitlist; closed shows redirect to `/shows` with friendly message

**30BN-5.2 — Slot Claiming Logic & Self-Cancel ✓**
Claim flow:
- Two-tier duplicate detection: (A) same role + same date → reassurance, no insert; (B) different date of same show → cross-date heads-up prompt, Confirm proceeds to insert. Both checked by email ILIKE and phone. `force: boolean` param on `submitClaim()` skips check B when volunteer confirms.
- Slot availability computed server-side (never trusts client `isWaitlist` hint). Counts only `status = 'claimed'` records.
- Volunteer match: sequential email-then-phone lookup sets `slot_claims.volunteer_id` FK if found.
- On claim: insert `slot_claims` (status: 'claimed'), send `sendSlotClaimEmail()` with `volunteer_instructions` and cancel URL.
- On full: insert as 'waitlisted' (assign `waitlist_position`), send `sendWaitlistConfirmationEmail()`.
- Cancel flow: `/cancel?token=[claim_token]` → email verification → cancel → waitlist promotion + renumber → editor notification (claimed cancellations only). See §8 Per-Show Claiming Page.
- 24hr reminder: Vercel Cron Job at `0 5 * * *` (5 AM UTC = midnight CT) via `app/api/cron/reminders/route.ts`. Queries claims where `show_date = CURRENT_DATE + 1` and `status = 'claimed'`. Batch sends via `resend.batch.send()` in chunks of 100. Route secured by `CRON_SECRET` Bearer token.
- `vercel.json` at repo root configures the cron schedule.
- New email functions: `sendSlotClaimEmail`, `sendWaitlistConfirmationEmail`, `sendWaitlistPromotionEmail`, `sendCancellationEditorNotificationEmail`, `sendReminderEmail` (+ `buildReminderEmailPayload` helper for batch use).
- `cancelClaim()` added to `lib/actions/claims.ts`. `slot_claim.cancel` added to AuditAction union.
- **Implementation note (Q1):** Waitlist renumbering uses sequential per-row JS updates (supabase-js has no expression-based col = col - 1 update). Correct for realistic waitlist sizes; candidate for a Postgres function in Phase 12 if concurrent cancellations become a concern.

**30BN-5.3 — Category-Match Notification Emails ✓**
- `get_show_notification_targets(p_show_id uuid)` SECURITY DEFINER RPC (Migration 008) returns deduplicated volunteers with matching role names; EXECUTE revoked from PUBLIC and anon (R28).
- `sendShowNotifications(showId)` in `lib/actions/shows.ts` uses `getServerClient()` (admin session context). Calls RPC, batch-sends via `buildCategoryMatchNotificationPayload` + `resend.batch.send()` in chunks of 100, updates `shows.notifications_sent_at` after send, logs to `email_log`.
- UI surfaces: show form toggle (near Save & Publish), Settings tab inline panel on live transition, Overview tab NotificationsSection (manual trigger with confirm step for repeat sends).
- `notifications_sent_at` (timestamptz on `shows`) tracks send state. See §9.
- `types/show.ts` updated with `notifications_sent_at: string | null`.

---

### Phase 6 — Custom Forms & Surveys ✓ Complete

**30BN-6.1 — Form Builder ✓**
- `/crew/forms/new` and `/crew/forms/[id]/edit` under `app/crew/(app)/` (R20)
- All 8 field types per §8. Field reorder via ↑↓ arrow buttons — NOT drag-and-drop (confirmed
  decision; no drag library installed). Nested options arrays in their own FieldOptionsEditor
  sub-component per R24.
- Preview tab renders all field types in read-only mode using FormPreview component.
- Status: draft / live / closed. Save buttons update status on submit.
- Form detail page (`/crew/forms/[id]`) ships in 6.3 — the list page links to edit and responses.
- lib/validations/form.ts — zod schema for the builder. types/form.ts — all form types.

**30BN-6.2 — Public Form Page & Response Capture ✓**
- `/forms/[id]`: three states — live (form renders), closed ("no longer accepting"), draft/missing
  (generic "not available" — draft status not revealed publicly).
- Dynamic zod schema built at runtime from field config, keyed by field id.
- Checkbox: Controller-managed string[] value. Rating: 5 plain <button> elements (R19).
- Profile linking: scans submitted values for email (@) and phone (digits) patterns.
  Sequential email-then-phone volunteer lookup (maybeSingle). volunteer_id set if matched.
- Checkbox values stored as JSON array string; all other values as plain text or null.
- lib/data/forms.ts — getPublicForm() uses getAdminClient() (public route, no session).
- lib/actions/forms.ts — submitFormResponse() added: live-status gate, required field
  validation, volunteer linking, batch insert of form_response_values.

**30BN-6.3 — Form Response Viewer & Embed ✓**
- Form detail page (`/crew/forms/[id]`): public URL + copy, embed code + copy, QR code
  (inline SVG preview + PNG/SVG data URI downloads), response count, Edit button.
  Per-form QR pulled forward from Phase 7 here since the detail page was built in this prompt.
- `/crew/forms/[id]/responses`: client-side filters (date range, match/unmatch) via useMemo.
  Checkbox values rendered as comma-joined string. CSV export of filtered set.
  Volunteer name in matched rows links to profile.
- lib/data/forms.ts — getFormDetail() and getFormResponses() added (getServerClient() —
  admin session exists on these pages). No N+1: 5 fixed queries regardless of response count.
- lib/utils/formDisplay.ts — shared form status label/badge maps (extracted from FormList.tsx
  for reuse on detail page, matching showDisplay.ts pattern).
- lib/utils/csv.ts — escapeCsvField exported (was private) for ResponseViewer reuse.

---

### Phase 7 — QR Code Generator ✓ Complete

**30BN-7.1 — QR Code Utility & Generator Tool ✓**
- `lib/qr.ts` and `generateQR()` already existed from 30BN-4.3. Per-show QR already on
  show detail Overview tab (4.3). Per-form QR pulled forward into 6.3 (not built here).
- This prompt delivered only the standalone generator tool.
- Standalone generator (`/crew/tools/qr-generator`): URL input (auto-prepends https://),
  optional label (used in filename sanitization), "Generate QR Code" button, inline SVG
  preview in white container, PNG and SVG data URI download links.
- `lib/actions/qr.ts` — `generateQRCode(url)` server action: trims, validates, prepends
  protocol, calls generateQR(), returns { svg, pngBase64 } or { error }.
- Sidebar nav link to /crew/tools/qr-generator was already present from Phase 3 nav stub.
- Phase 7 is now complete. The per-form QR (originally scoped here) shipped in 6.3.

---

### Phase 8 — Volunteer Call Board ✓ Complete

**30BN-8.1 — Call Board Session & Identity ✓**
- Single `/callboard` page (no sub-routes). Server component reads `callboard_session`
  cookie on load. If valid volunteer id → fetches volunteer record → "identified" state.
  If no cookie or invalid → anonymous state.
- Email/phone lookup: `lookupVolunteer(input)` server action. Sequential email-then-phone
  maybeSingle() lookup. Match → set `callboard_session` cookie (httpOnly, 7-day, volunteer id)
  → return to client → card appears without redirect. No email sent. No token generated.
  No match → return { notFound: true } → signup prompt rendered.
- Sign out: `signOutCallboard()` clears cookie → `router.refresh()` → anonymous state.
  Opportunities remain visible.
- `lib/callboard/session.ts` — `getCallboardSession()`: reads cookie, fetches volunteer
  via `getAdminClient()`. `lib/actions/callboard.ts` — lookupVolunteer + signOutCallboard.
  `types/callboard.ts` — shared types.
- No migration. No schema changes. Cookie-only session.
- Quality gate: email lookup, phone lookup, no-match prompt, cookie persistence, sign out,
  active claim indicator, call history, milestone badges, landing page CTA click-through,
  mobile layout — all pending owner verification.

---

### Phase 9 — Volunteer Hours & Milestones ✓ Complete

**30BN-9.1 — Hours Tracking ✓**
- Migration 011: `attendance.hours_confirmed boolean NOT NULL DEFAULT false` (composite index),
  `volunteer_hours_log.logged_date date` (nullable).
- `markAttendance()` updated: `hours_confirmed = false` on all Showed marks and re-marks.
- `confirmHours(attendanceId, newHours)`: validates 0–24h, idempotency guard, computes delta,
  clamps total at 0, updates attendance + total_hours + volunteer_hours_log correction entry.
  Calls milestone stubs. Audits. revalidatePath dashboard + volunteer profile.
- `addManualHours(volunteerId, hours, note, loggedDate)`: inserts manual log entry
  (source_type: 'manual', logged_date set), updates total_hours, calls milestone stubs.
  Audits as `volunteer.hours_add`. revalidatePath volunteer profile.
- Dashboard PendingHoursCard: past Showed records with hours_confirmed = false, grouped by
  show + date. Confirm/adjust inline. Hidden when empty. Editor/Super Admin only.
- Volunteer profile Hours section: total, per-season breakdown (two queries + JS grouping),
  full signed hours log table, manual entry form (Editors only).
- Volunteer profile Milestone History section: read-only `milestone_log` display, empty state.
- Quality gate: all pending owner verification.

**30BN-9.2 — Milestone System ✓**
- `MILESTONE_THRESHOLDS` and `getNextMilestone()` live in `lib/milestones-shared.ts` — a pure,
  client-safe file with no server-only dependencies. `lib/milestones.ts` (carries `'server-only'`)
  re-exports both for server-side callers and holds `checkMilestones()`/`checkFirstCall()`. This
  split prevents the `'server-only'` directive from poisoning the client bundle when the Call
  Board's VolunteerCard needs the pure helpers.
- `checkMilestones()` and `checkFirstCall()` implemented (no longer stubs). Handles multiple
  threshold crossings in one action. 23505 race-condition guard via UNIQUE constraint
  (Migration 013).
- `sendMilestoneEmail()` added to `lib/email.ts`: tier-specific subject + body for each
  threshold (First Call, 10h, 20h, 35h, 50h, 75h, 100h, 125h+). Single recipient send. CTA
  links to `/callboard`.
- `acknowledgeMilestone(milestoneId)`: sets `editor_acknowledged = true`. revalidatePath
  dashboard. (Audit logging for this action was added later, in 10.1 — see Phase 10.)
- Dashboard PendingMilestonesCard: all milestone_log rows with editor_acknowledged = false.
  "Mark Acknowledged" per row. Placed above PendingHoursCard. Editor/Super Admin only.
- Milestone Tier filter activated on volunteer list: Any milestone, First Call, 10+/20+/
  50+/100+ Hours. Pre-query against milestone_log + .in('id', matchingIds).
- VolunteerCard.tsx (Call Board) imports MILESTONE_THRESHOLDS and getNextMilestone() from
  lib/milestones-shared.ts — local duplicate logic removed.
- Call Board volunteer card: hours breakdown summary line added (9.2). Manual hours total
  fetched separately and passed as prop.
- Quality gate: all pending owner verification.

---

### Phase 10 — Audit Log ✓ Complete

**30BN-10.1 — Audit Log ✓**
- `logAction()` was already live and being called throughout the app from prior phases.
  This prompt added the viewer UI and filled remaining gaps.
- **New logAction() calls added:** `acknowledgeMilestone()` → `milestone.acknowledge`;
  `changePassword()` → `user.password_change` (no before/after — password never logged).
- **`changePassword()` gap fix:** ADMIN.15's original implementation omitted the
  `getAdminUser()` call needed to attribute the audit entry to the acting admin — added
  here in 10.1.
- **AuditAction type union completed** with organized comment groups — including "Slot
  Claims" as its own distinct group — and Phase 11 forward declarations
  (`settings.update`, `hearing_options.*`).
- **DST-aware date filtering:** date-range filters use `fromZonedTime()` from
  `date-fns-tz` to compute the correct UTC boundary for CT, rather than a hardcoded
  offset — Central Time alternates CST/CDT seasonally.
- **Viewer** (`/crew/settings/audit-log`): Editors + Super Admins only (Viewers redirect to
  dashboard). Server-side paginated (25/page), filtered. AuditLogFilters component (native
  GET form, grouped action type `<optgroup>` dropdown). AuditLogTable component (expandable
  diff rows, single row expanded at a time, before/after diff shows only changed keys).
  Target IDs linked to relevant admin pages where possible.
- Quality gate: all pending owner verification.

---

### Phase 11 — Stub Pages, 404 & App Settings

**30BN-11.1 — Beta Stub Pages & Custom 404**
- Communication page (`/crew/communication`): stub shell with "Email blast system coming soon" state. Navigation link active. No dead ends.
- Check-in tool page (`/crew/tools/checkin`): stub shell with description of feature + "Coming soon" state.
- Document management (`/crew/settings/documents`): stub shell with "Document upload management coming soon" state.
- Custom 404 page (`app/not-found.tsx`): branded 30 By Ninety design, friendly message, links back to `/` (public) and `/crew/dashboard` (admin)
- Global error boundary (`app/error.tsx`): branded error page, option to retry or return home
- Quality gate: all stub pages render without error; 404 displays correctly on unknown routes; error boundary catches runtime errors

**30BN-11.2 — App Settings & Announcement Banner**
- `/crew/settings`: settings hub with section cards linking to sub-pages
- Announcement banner: `/crew/settings/announcement` — text input (280 char limit), on/off toggle, save. Preview renders banner as it will appear on landing page. Takes effect immediately (no cache delay).
- Hearing options: `/crew/settings/hearing-options` — same UX pattern as category management (add, rename, reorder, deactivate)
- Signup form toggles: `/crew/settings/signup-form` — school field visible toggle, age range visible toggle
- Default hours per show type: Mainstage / Studio X / One-Off — numeric inputs
- Default reply-to address: email input, validated, saved to `app_settings`
- Quality gate: banner appears/disappears on landing page immediately after toggle; hearing options changes reflect on signup form; all settings persist on page reload

---

### Phase 12 — Polish, Mobile & Performance

**Completed admin prompts (since Phase 5):**
- `30BN-ADMIN.13` ✓ Security fix — REVOKE EXECUTE on `get_activity_feed()`
  from PUBLIC and anon roles (Migration 009). Same
  vulnerability class as caught and fixed in 5.3 for
  `get_show_notification_targets()`. See R28.

**Deferred polish items:**
- Mobile sidebar (collapsible/hamburger for PWA on phone-sized screens)
- Waitlist renumbering in `cancelClaim()` — sequential JS updates. Postgres function
  candidate for Phase 12 if concurrent cancellations become a concern at scale.
- `slot_claims.show_date_id` denormalization — Phase 12 schema review.
- Phone normalization — `lookupVolunteer()` strips non-digits but signup/update/claims use
  exact-string phone matching. Cross-cutting fix needs own ADMIN prompt before launch
  (ADMIN.20 or later). Requires DB data-quality assessment.
- Dashboard "Season at a Glance" + "Quick Stats" widgets — planned for ADMIN.20. Super Admin
  configurable season selector stored in `app_settings` as `dashboard_season_id`.
- `window.location.href` pattern still present in `CategoriesTable.tsx` reload() — Phase 12
  or small ADMIN prompt.
- Dark: variant gaps on `VolunteersTable.tsx` status badge and some section `<h2>` headings
  on volunteer profile — Phase 12.
- Step tracker prompt convention note — R27, process rule, not a code item.

**Completed since v1.2 (removed from deferred list):**
- ~~PDF export column for `requires_service_hours`~~ — Added in ADMIN.17 (9-column table).
- ~~Call history sort by `show_date`~~ — Fixed in ADMIN.19 (JS sort on fetched show_date).
- ~~Volunteer list all-pages CSV export~~ — Fixed in ADMIN.19 (filter-aware export).
- ~~Out-of-range page param clamping~~ — Fixed in ADMIN.17.
- ~~Category description inline editing~~ — Fixed in ADMIN.19.
- ~~Dialog close-X dark mode hover~~ — Fixed in ADMIN.14.
- ~~Password change UI~~ — Built in ADMIN.15.
- ~~`sendReminderEmail()` unused function~~ — Removed in ADMIN.17.
- ~~`form_response_values.field_id` no CASCADE~~ — Fixed in Migration 012 + ADMIN.17-FIX.
- ~~ThemeProvider.tsx ESLint warning~~ — Suppressed with documented comment in ADMIN.17.

**30BN-12.1 — Mobile Optimization & Empty States**
- Full responsive audit: `/` (landing), `/shows`, `/shows/[id]`, `/callboard`, `/forms/[id]`, `/update`, `/cancel`
- Test at 375px (iPhone SE), 390px (iPhone 14), 768px (tablet)
- Admin: basic tablet support for `/crew/*` (usable on iPad for day-of coordination)
- Empty states for: volunteer list (no results), show list (no shows this season), form responses (no submissions), waitlist (no waitlisted), call history (no calls yet), dashboard (no upcoming shows)
- Rate limiting on public form submissions (basic — prevent bot spam without blocking real users)
- Quality gate: all public pages usable on 375px; no horizontal scroll; tap targets ≥44px

**30BN-12.2 — Performance, Security & In-App Help**
- Supabase query optimization: add any missing indexes identified during build; review N+1 query patterns
- Image optimization: `<Image>` component for logo; proper `alt` text throughout
- Input sanitization audit: all text inputs in public forms sanitized before DB insert
- RLS policy final review: confirm `volunteer_notes` inaccessible via public routes; confirm `admin_users` inaccessible without valid session
- `/crew/help`: in-app help page with clear sections covering all Editor workflows (mirrors Editor How-To from proposal). Tooltip icons (`?`) on non-obvious UI elements throughout Production Crew linking to relevant help sections.
- Quality gate: no exposed sensitive data via Supabase RLS test queries; help page complete and accurate; all tooltips functional

---

## 11. Beta Build — Phases & Prompts (Overview)

*Full Beta prompt detail to be written in 30BN_BRIEF_v2.md upon Alpha completion and board approval.*

### Phase 13 — Email Blast System (~4 prompts)
- Resend full integration: branded HTML templates for all email types
- All transactional emails (currently using plain text in Alpha)
- **Email CTA consistency:** standardize all transactional email CTAs to link to
  `/callboard` (the established volunteer hub). Currently most transactional emails
  link to `/shows`; milestone emails already link to `/callboard` (set in 9.2).
  Phase 13 reconciles all CTAs in one pass.
- Blast composer: compose, recipient selector, reply-to, preview, send, confirm
- Communication history log (already schema'd, wire the viewer)

### Phase 14 — Check-In System (~2 prompts)
- Per-show-date check-in QR code generation (from show detail)
- Full check-in page: email/phone entry → auto-mark attendance → success/error states
- Replace Alpha stub

### Phase 15 — Document Management (~1 prompt)
- PDF upload to Supabase Storage using P-DC pattern (direct browser upload — Vercel 4.5MB limit)
- Active document management: one active per type
- Landing page consent form link wired to active document
- Replace Alpha stub

### Phase 16 — Google SSO ✓ Completed in Alpha (30BN-1.3)
- Configure Google OAuth in Supabase Auth
- Add "Sign in with Google" button to `/crew/login`
- Confirm redirect URIs for production domain

### Phase 17 — Launch (~2 prompts)
- Domain setup (CNAME or new domain purchase)
- Resend domain verification (SPF, DKIM, DMARC DNS records)
- Production environment audit
- End-to-end flow testing on production domain

### Phase 18 — Additional Alpha Features (confirmed)
These features were added to Alpha scope during the build session:
- **Volunteer communication history on volunteer profile** — tab showing all emails sent
  to a volunteer (transactional now; blast emails added when Phase 13 ships)
- **Show-level post-show reporting** — summary tab on show detail (total volunteers, total
  hours, attendance rate, no-show count) available when status = 'past'
- **Volunteer self-service hours history on Call Board** — per-show breakdown in expanded
  card section (built partially in 9.2; full breakdown prompt TBD)
- **Bulk email from show detail** — "Message volunteers for this show" quick action;
  sends to all claimed volunteers for a show; simpler than Phase 13 blast system

### New Beta features (confirmed)
- **Waitlist → claim promotion notification preferences** — volunteer opt-in for
  notification method (email vs. future SMS). Requires infrastructure decision.
- **Automated thank-you email after a show** — triggered 24–48 hours after show date
  passes, sent to everyone marked Showed. Community-building. Similar infrastructure
  to existing reminder cron job.

---

## 12. Open Decisions Log

| # | Decision | Status | Notes |
|---|---|---|---|
| 1 | Production domain | ✅ Resolved | `30byninetyvolunteers.com` — purchased and live |
| 2 | Sending email address | ✅ Resolved | `volunteers@30byninetyvolunteers.com` — domain verified in Resend during Phase 2 Alpha build |
| 3 | Google OAuth credentials | ✅ Resolved | Implemented in Alpha (30BN-1.3). Google Cloud OAuth client "Volunteers Final" configured and live. |
| 4 | Jonathan's surname | ✅ Resolved | Sturcken — Jonathan Sturcken |
| 5 | Under-18 consent form PDF | 🔄 Pending | Existing PDF or new one needed at Beta launch. |
| 6 | Multiple Super Admins | ✅ Resolved | Multiple Super Admins are expected and supported. Deactivate disabled for all Super Admin rows. Role change blocked for Super Admin rows. |
| 7 | Mobile PWA sidebar | 🔄 Pending | Collapsible sidebar for phone-sized screens deferred to Phase 12. PWA usable on tablet (768px+) until then. |

---

## 13. Standing Rules

Rules established during the build. **All are non-negotiable.** New rules added here as they arise.

### R1 — Session Starter Block Is Mandatory
Every Claude Code session must begin with the Session Starter Block from 30BN_PROCESS_v1.md §1. No build work begins until both documents are confirmed read.

### R2 — Schema Verification Before Every Table Touch
Before writing any SQL or server action touching a DB table, run the information_schema query (§2 of Process). Never assume column names.

### R3 — Scope Lock Per Prompt
Every prompt has a defined scope. Do not build outside it. Adjacent items go in Q-items in the post-build summary.

### R4 — Volunteer Categories Always From DB
Never hardcode category names in any component. Always load from `volunteer_categories WHERE is_visible = true`. This applies to the public signup form, the admin filter, the profile editor, and everywhere else.

### R5 — Editor Notes Never Exposed to Public Routes
`volunteer_notes` is SELECT-restricted to admin users via RLS. No public route, no volunteer-facing route, and no Call Board session should ever query this table. This is a security requirement, not a preference.

### R6 — QR Codes Always Level H
All QR codes use error correction level H. No exceptions. This ensures print reliability.

### R7 — Tailwind v4: No tailwind.config.ts, @theme Static Hex Only
No `tailwind.config.ts` in this project. `@theme` in `globals.css` uses static hex values only. `var()` inside `@theme` causes runtime 404s even on successful build.

### R8 — Resend Batch for All Bulk Sends
Any send to more than one recipient uses `resend.batch.send([...])`. Never loop `resend.emails.send()`. Single transactional emails (one recipient) use `resend.emails.send()` directly — `resend.batch.send()` is for multi-recipient sends only.

### R9 — Vercel P-DC Pattern for File Uploads
PDF uploads (Beta doc management) must use direct browser upload to Supabase Storage, not Server Actions. Vercel Hobby plan 4.5MB serverless limit.

### R10 — SUPABASE_SERVICE_ROLE_KEY Server-Only
`SUPABASE_SERVICE_ROLE_KEY` is never imported in any client component or used in any route that could be called client-side. Admin client (`lib/supabase/admin.ts`) is server-only.

### R11 — Prompt Sizing: Split at More Than One Major Deliverable
If a prompt touches more than one of {migration, server action, page, modal/component}, evaluate splitting into sub-prompts. One clear deliverable per prompt, fully verifiable before the next begins.

### R12 — router.refresh() for In-Place Re-Renders; window.location.href for Full Nav
`router.refresh()` is the preferred pattern for Client Components that need to re-fetch
Server Component data after a mutation without navigating away (e.g. profile page after
a note is added, dashboard after a card item is confirmed). Standardized across volunteer
profile mutations in ADMIN.19 (EditorNotes, StatusToggle, VolunteerProfileForm).
`window.location.href` is used only when a full navigation to a different URL is required.
Never use `router.push()` for post-mutation re-renders — it does not re-run Server
Component data fetches. Established ADMIN.3, refined ADMIN.19.

### R13 — Attendance Marking: Past Dates Only
The attendance marking UI and its server action must verify that the `show_date` is in the past before accepting the request. Enforced at application layer, backed by server action validation.

### R14 — Milestone "First Call" Is Not Hours-Based
The First Call milestone fires on the first `attendance` record with `status = 'showed'` — not when total hours first exceed 0. These are different triggers.

### R15 — shadcn Components Must Use Brand Tailwind Classes
This project runs `cssVariables: false` in `components.json` (required for Tailwind v4 compatibility). shadcn's default semantic color tokens (`bg-primary`, `border-input`, `ring-ring`, `text-foreground`, `text-muted-foreground`, etc.) will not resolve. At the time any shadcn component is added, replace all default semantic color classes with explicit brand Tailwind classes (`bg-navy`, `border-divider`, `text-dark`, `text-mid-gray`, etc.). Never leave shadcn default color classes in committed code.

### R16 — No Browser Verification (process rule)
Documented in 30BN_PROCESS_v1.md §14. Referenced here for R-number continuity.

### R17 — shadcn Init var() Revert (process rule)
Documented in 30BN_PROCESS_v1.md §14. Referenced here for R-number continuity.

### R18 — Empty String Normalization to Null
When inserting or updating optional string fields in the database — especially those with CHECK constraints or NOT NULL requirements — use `|| null` rather than `?? null` to normalize the value. `??` passes empty strings through unchanged; `||` converts empty strings, null, and undefined all to null. Example: `age_range: data.age_range || null`. Confirmed failure mode: empty string violated `volunteers_age_range_check` (error code 23514, 30BN-2.3-FIX).

### R19 — Plain <button> Over Button Component for Brand Hover Behavior
tailwind-merge does not recognize custom `@theme` color tokens as the same class group. Appending brand hover classes (`hover:bg-steel`, `hover:bg-navy`, etc.) via `className` to shadcn Button/cva components produces unpredictable cascade results — both the variant class and the override may end up in the DOM with cascade order deciding the winner. Use plain `<button>` elements with explicit Tailwind classes whenever brand hover behavior is required. Never import the Button component in files where brand-colored hover states are needed. Established ADMIN.3.

### R20 — All /crew/* Pages Under app/crew/(app)/
The route group pattern established in 30BN-3.1 requires all Production Crew pages and route handlers to live under `app/crew/(app)/`. Files placed directly at `app/crew/[route]/page.tsx` (without the route group) will render without the sidebar/topbar layout shell. Every prompt building a `/crew/*` page must follow this pattern. `/crew/login` lives under `app/crew/(auth)/login/` per the sibling route group pattern.

### R21 — Migration Files at Repo Root
Migration `.sql` files live at repo root alongside `001_core_schema.sql`. There is no `supabase/migrations/` directory in this project and one must not be created. Filename format: `{number}_{descriptive_snake_case}.sql`. Sequential numbering: 001, 002, 003, etc.

### R22 — Vercel Deploy Verification Is Owner-Side
Claude Code does not have Vercel CLI access and cannot confirm deploy status independently. Build reports confirm the git push succeeded and note that Vercel auto-deploy will trigger. Owner confirms deploy independently via the Vercel dashboard. Claude Code must not flag absence of deploy confirmation as a build concern or a Flag item.

### R23 — formatWallClockCT() for Date-Only Columns
`formatCT()` parses bare `date` column values (`'YYYY-MM-DD'`) as UTC on Vercel (UTC runtime), shifting displayed dates by hours for Central Time users. Use `formatWallClockCT()` from `lib/utils/date.ts` for any value sourced from a `date` column or manually constructed date+time string. Use `formatCT()` only for full `timestamptz` values (created_at, updated_at, claimed_at, etc.) which include timezone info and parse correctly. Established ADMIN.9. See also the grep check in Process §10.

### R24 — Nested useFieldArray Requires Its Own Sub-Component
React's rules of hooks prohibit calling `useFieldArray` inside a render loop over a parent field array. Any form with arrays-of-arrays (e.g. dates each containing their own roles list) must place the nested `useFieldArray` in its own named sub-component. Pattern: parent maps over date fields and renders `<DateRow key={...} index={...} control={...} />` where `DateRow` owns the nested `useFieldArray`. Confirmed in ADMIN.11. Applying this pattern after the fact is a major refactor; design forms with this requirement in mind from the start.

### R25 — Public Submissions Use null admin_id in audit_log
`logAction()` accepts `string | null` as its first argument (widened in ADMIN.10 — `audit_log.admin_id` is nullable in the schema). When a public-facing action has no admin session (e.g. opportunity submission, volunteer signup), pass `null` as admin_id. Never skip logging to avoid the null — public submissions are consequential and must be in the audit trail. Established ADMIN.10.

### R26 — Roles Belong to show_dates, Not shows
`volunteer_roles.show_date_id` is the FK parent as of Migration 006. Each show date has its own independent role configuration. Any code that needs "all roles for a show" must join through `show_dates`: `volunteer_roles JOIN show_dates ON volunteer_roles.show_date_id = show_dates.id WHERE show_dates.show_id = [id]`. Never assume or attempt to query volunteer_roles by show_id — that column no longer exists. Established ADMIN.11.

### R27 — Step Tracker Is a Single Persistent Widget
The step tracker declared at the start of a build session is a single element that updates in place as work progresses. It must not be re-emitted or repeated after individual steps — doing so produces multiple copies that obscure build progress rather than clarifying it. Prompts must not include the instruction to "re-emit the tracker after each step." Claude Code manages the live-update behavior natively when given an initial tracker declaration. Established Phase 4 build session.

### R28 — SECURITY DEFINER RPCs Must Revoke Public/Anon Execute
PostgreSQL grants EXECUTE to PUBLIC by default when a function is created. For SECURITY DEFINER functions, this means the anon role can call them directly via PostgREST and bypass RLS entirely — exposing any data the function returns regardless of row-level policies. After creating any SECURITY DEFINER function, immediately add:
```sql
REVOKE EXECUTE ON FUNCTION function_name(param_types) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION function_name(param_types) FROM anon;
GRANT EXECUTE ON FUNCTION function_name(param_types) TO authenticated;
```
Include these REVOKE/GRANT statements in the same migration file as the CREATE FUNCTION. Verify with `SELECT proacl FROM pg_proc WHERE proname = 'function_name'` — result must not include `=X/` (PUBLIC) or `anon=X/`. Established 30BN-5.3. Fixed retroactively in ADMIN.13 (Migration 009): `get_activity_feed()` (Migration 007) received the same REVOKE treatment. Both RPCs are now correctly restricted.

### R29 — revalidatePath() Required After Every Mutation
Next.js App Router caches Server Component renders by default. Without explicit cache invalidation,
mutations (status changes, slot claims, editor adds, etc.) are not reflected on the page until
Next.js revalidates on its own schedule — which can be minutes or never for static-ish pages.
After every server action that mutates data, call `revalidatePath()` for all routes that display
that data. Import from `'next/cache'`. Common patterns:
- Show status change: revalidatePath('/shows'), revalidatePath('/crew/shows'), revalidatePath(`/crew/shows/${id}`)
- Slot claim/cancel: revalidatePath('/shows'), revalidatePath(`/shows/${showId}`)
- Editor add/remove: revalidatePath(`/crew/shows/${showId}`)
- Opportunity mutations: revalidatePath('/crew/shows/opportunities')
Never call revalidatePath() in a 'use client' file — it is server-only.
Confirmed failure mode: show status change not reflected on /shows (VERIFY-1 C9); slot count
not updating on show card after claim (VERIFY-4). Fixed in ADMIN.14.

### R30 — Theme Toggle Must Target document.body
The `data-theme` attribute that drives the Tailwind `@variant dark` rule must be applied to
`document.body`, not to an inner wrapper element. Setting it on a child div creates a two-DOM-node
conflict with the pre-hydration inline script: the inline script sets `data-theme` on one element,
the React component sets it on another, and React's reconciliation can leave the original stale
attribute in place until a hard reload. Both `ThemeProvider.tsx` and the inline script in
`app/crew/(app)/layout.tsx` must target `document.body` explicitly. The effect in ThemeProvider
must have the current theme value in its dependency array so it runs on every toggle, not just
on mount. Established ADMIN.14.

---

*This document is updated at the completion of each build phase.*
*Version history:*
*v1 (initial — all Alpha prompts, full schema, brand system, standing rules)*
*v1.1 (July 2026 — Phase 1 complete: project facts confirmed, Google SSO moved to Alpha, Production Crew footer link added, Open Decisions #1/#3/#4 resolved, R15 added)*
*v1.2 (July 2026 — Phase 2 complete: @hookform/resolvers added to §3, Resend domain verified and from address confirmed, Open Decision #2 resolved, age_range required decision noted, shows link in confirmation email, R16/R17 cross-references added, R18 empty string normalization added, R8 single-send clarification)*
*v1.3 (July 2026 — Phase 3 complete: date-fns-tz/@react-pdf/renderer/PWA added to §3, requires_service_hours added to §8 and §9 (Migration 003), Editor Notes Super Admin edit/delete added (Migration 004), multiple Super Admins support documented, Light/Dark mode and PWA documented, Standing Volunteer Opportunities (4.4) and Category-Match Notifications (5.3) added as new prompt slots, Phase 3 marked complete, Open Decisions #6/#7 added, R19–R22 added)*
*v1.4 (July 2026 — Phase 4 complete: volunteer_roles restructured to show_date_id (Migration 006), standing_opportunities and opportunity_submissions added (Migration 005), activity_cleared_at added to admin_users (Migration 007), activity feed with pagination and per-user read state, roles-per-date form structure, formatWallClockCT() for date-only columns, R23–R27 added, Phase 4 prompts and all ADMIN prompts through ADMIN.12 marked complete)*
*v1.5 (July 2026 — Phase 5 complete: slot claiming with two-tier duplicate detection, self-cancel flow with email verification, waitlist promotion and renumbering, 24hr Vercel Cron reminder, category-match notifications with notifications_sent_at tracking and SECURITY DEFINER RPC, CRON_SECRET env var added, /cancel public route, vercel.json cron config, R28 (SECURITY DEFINER REVOKE) added, ADMIN.13 planned for get_activity_feed() security fix, Phase 5 prompts 5.1–5.3 marked complete, DOC.7–DOC.8 logged)*
*v1.6 (July 2026 — Phases 6 and 7 complete: form builder with arrow reorder (not drag), public form with dynamic zod schema, response viewer with client-side filters and CSV export, form detail page with embed code and QR, standalone QR generator tool, per-form QR pulled forward into 6.3, lib/data/forms.ts and lib/actions/qr.ts added, ADMIN.14 (cache revalidation sweep, theme toggle hydration fix, dialog hover fix, blank-role trap fix, opportunity reactivate), R28 retroactive note corrected, R29 (revalidatePath required) and R30 (theme toggle targets document.body) added, duplicate deferred item removed, new deferred items added (form_response_values FK, ThemeProvider ESLint), DOC.8/ADMIN.14/DOC.9 logged)*
*v1.7 (July 2026 — Call Board redesign: single-page opportunities hub replacing multi-page portal; magic link / token email flow eliminated; email-or-phone lookup sets cookie session directly with no email step; no callboard_token columns on volunteers table; volunteer card renders inline on /callboard; sub-routes /callboard/profile, /callboard/history, /callboard/opportunities eliminated; §7 auth note updated; §8 Call Board spec replaced; §10 Phase 8 prompt specs replaced; DOC.11 logged)*
*v1.9 (July 2026 — 9.2 and 10.1 build corrections: PDF export filter gap noted (milestoneTier not honored); audit log settings hub card documented (LinkedCard/LockedCard); Slot Claims audit group bolded with distinct-group note; submitVolunteerForm() logging gap documented; Phase 13 email CTA consistency note added; §8 Milestone System corrections from DOC.13 confirmed already accurate (lib/milestones-shared.ts, acknowledgeMilestone 10.1 attribution, sendMilestoneEmail CTA) — no further change needed there; DOC.15 logged)*
*v1.8 (July 2026 — Phases 8–10 complete, ADMIN.15–19: §1 current phase updated; §3 auth row corrected for self-registration; §5 auth settings corrected; §7 Volunteer row + auth model updated; §8 landing page CTA → /callboard; §8 login page self-registration added; §8 dashboard hours/milestone widgets + honest Season at a Glance status; §8 volunteers list CSV/PDF/milestone filter updated; §8 volunteer profile sort/hours/milestones/refresh corrected; §8 category description editing corrected; §8 user management approval flow + change password added; §8 forms updateForm() diff-based sync documented; §8 Hours Review and Milestone System sections added (including the lib/milestones-shared.ts split pattern); §8 Call Board confirmed redesign + hours breakdown; §8 audit log viewer details added (DST-aware filtering, Slot Claims group, changePassword getAdminUser fix); §9 Migrations 010–013 added, attendance + volunteer_hours_log + form_response_values + milestone_log schemas updated; §10 DOC.4 fixed, ADMIN.15–19 + DOC.11–12 logged, Phases 8–10 marked complete (9.2/10.1 entries corrected to match Process v1.8 — acknowledgeMilestone audit call attributed to 10.1, not 9.2), Phase 12 deferred list cleaned; §11 Phase 18 + new Beta features added; §13 R12 updated; DOC.13 logged)*
*Cross-reference: 30BN_PROCESS_v1.md v1.8*
