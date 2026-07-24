# 30 By Ninety Theatre — Volunteer Platform
## 30BN_BRIEF_v1.md — Complete & Authoritative — v3.2
### Created: July 2026 | Last Updated: July 2026 — v3.2 (Phase 13 complete — Phase 14 next)

---

## 1. Project Overview

**30 By Ninety Theatre Volunteer Platform** is a custom, full-stack volunteer management system built from scratch for 30 By Ninety Theatre (Old Mandeville, Louisiana). It replaces SignUp Genius and Google Forms with a single, branded, permanently owned platform.

**Built and maintained by:** Jonathan Sturcken (YLC member) — sole point of contact for questions, updates, and future development.

**Two user-facing surfaces:**
- **Public:** Volunteer signup landing page · per-show slot claiming pages · Volunteer Call Board self-service portal · Public Events Calendar (`/calendar`)
- **Private (Production Crew):** Full admin backend for Super Admins, Editors, and Viewers

**Supabase project:** `thirtyninetyvolunteers` (ID: `nutvjkplbtobcmymqtzx`, org: `thirtybyninety`)
**GitHub repo:** `soundadvicestudio/thirtyninetyvolunteers` (private)
**Deployment:** Vercel (auto-deploy on GitHub push)
**Local folder:** `/Users/soundadvice/volunteers`
**Alpha URL:** `https://thirtyninetyvolunteers-a9wa3ttc3-soundadvicestudios-projects.vercel.app`
**Production URL:** `https://30byninetyvolunteers.com` (live)
**Current phase:** Phase 13 complete (13.1–13.4b). Phase 14 (Check-In System) next.

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
| **Production** | New admin role (CAL.2). Calendar-only access. Directors and Stage Managers. No access to volunteer database or other Production Crew functions. Lands on `/crew/calendar` after login. |
| **Calendar Editor** | A boolean flag (`calendar_editor`) on Editor and Viewer accounts. When true: direct write access to calendar (events saved as approved). When false (default): submissions go to pending queue for Super Admin approval. |

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
| **Rich Text** | TipTap (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`) | Rich text editing in the email blast composer (`/crew/communication`). StarterKit provides bold, italic, bullet/ordered lists, blockquote. Editor outputs HTML passed to `sendBlastEmail()`. Installed 13.3b. |
| **HTML Sanitization** | `sanitize-html` + `@types/sanitize-html` | Server-side sanitization of TipTap HTML output in `sendBlastEmail()` before the email payload is built. Allowlist: `p`, `strong`, `em`, `ul`, `ol`, `li`, `br`, `h1`–`h3`, `blockquote`, `a[href]` only. HTTP/HTTPS/mailto schemes only. Strips `<script>`, event handlers, and `javascript:` hrefs. Installed 13.4a. |
| **PWA** | Manual service worker | Admin-only PWA at `/crew` scope. Manifest at `public/manifest.json`, service worker at `public/sw.js` (network-first strategy). Icons generated via Sharp from `public/logo.png`. `start_url`: `/crew/dashboard`. |

**Mobile Sidebar State Pattern (established 12.1):**
The crew layout (`app/crew/(app)/layout.tsx`) is a Server Component. To share sidebar open/close state between Sidebar.tsx and TopBar.tsx without converting the layout to a Client Component, a thin Context provider (`components/crew/MobileSidebarContext.tsx`) wraps only the sidebar + topbar + main area. The layout itself stays a Server Component. This pattern should be used for any future shared UI state in the crew layout.

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
- All emails use branded HTML templates (built Phase 13.2): table-based layout, inline styles only (email client compatibility), max 600px content width, navy (`#293994`) header, white content area, footer-gray (`#F5F5F5`) footer.
- Shared wrapper: `buildEmailHtml({ subject, preheader, body, footerNote? })` in `lib/email.ts` (internal, not exported). Logo uses `${NEXT_PUBLIC_SITE_URL}/logo.png` with graceful fallback to text-only header if env var is absent.
- CTA buttons built via `buildCtaButton(label, url, color)` helper (internal). Volunteer-facing CTAs link to `/callboard`. Admin-facing CTAs link to `/crew/login` or `/crew/`.
- All user-supplied values interpolated into HTML email strings must be wrapped in `escapeHtml()` (internal to `lib/email.ts`). Exception: the blast body passed from TipTap is sanitized via `sanitize-html` instead of escaped — escaping would corrupt the HTML structure. See `sendBlastEmail()` in `lib/actions/blast.ts`.
- All outbound emails (system-triggered and admin-triggered) logged to `email_log` + `email_log_recipients` as of Phase 13.1.

---

## 7. User Roles & Access

| Role | Route Access | Can Edit | Can Email | Notes |
|---|---|---|---|---|
| Super Admin | All `/crew/*` + `/crew/settings/users` | Yes | Yes | Creates/manages all admin accounts |
| Editor | All `/crew/*` except user management | Yes | Yes | Full operational access. Bulk email from show detail built in ADMIN.23. Full blast system in Phase 13. Calendar: by default submits events for approval; if `calendar_editor = true`, gets direct write access (events approved immediately). |
| Viewer | All `/crew/*` | No | No | Read-only. No edit controls rendered. |
| Production | `/crew/calendar` only | Calendar submission only | No | Calendar-only role. Can submit events/rehearsal schedules for Super Admin approval. Cannot access volunteer database, shows, settings, or any other Production Crew section. Sidebar shows Calendar only. Redirected to `/crew/calendar` on login. Built CAL.2. |
| Volunteer | `/callboard` | Own profile card only | No | Email or phone lookup → immediate cookie session |
| Public | `/`, `/shows/*`, `/opportunities/*`, `/forms/*`, `/update`, `/checkin/*`, `/calendar` | No | No | No auth required |

**`calendar_editor` flag:** A boolean column on `admin_users` (default false, added Migration 017). When true on an Editor or Viewer account: that user gets direct write access to the calendar (events saved as `approved` immediately, Book Space button visible). When false: all calendar submissions go to the pending approval queue for Super Admin assignment and approval. Cannot be set on `super_admin` or `production` accounts (DB CHECK constraint enforces this). **UI toggle built CAL.6** on `/crew/settings/users` (Super Admin only) via `toggleCalendarEditor()` server action in `lib/actions/users.ts`. Logged to `audit_log` as `user.calendar_editor_change`.

**Auth model:** Admin accounts exist in `admin_users` table (linked to Supabase Auth). Admins authenticate via email/password or Google OAuth — both routes verify the `admin_users` record before granting access. Volunteers are NOT Supabase Auth users — they identify themselves via email or phone lookup on the Call Board; a match sets a 7-day cookie session with no magic link or email step required.
**Admin accounts:** Created by Super Admin OR via the self-registration "Request Access" flow on the login page. Production accounts use the same Request Access flow — assigned `role = 'production'` by the Super Admin on approval. Google OAuth callback updated in CAL.3 to redirect production-role users to `/crew/calendar` instead of `/crew/dashboard`.

**Middleware (CAL.2):** Production-role users are restricted at middleware level — any `/crew/*` route other than `/crew/calendar` and `/crew/calendar/*` redirects to `/crew/calendar`. Self-registered accounts are held in `pending_registrations` with status = 'pending' until a Super Admin approves and assigns a role. Super Admins receive an email notification on each new registration request.

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
- Honeypot spam prevention (built 12.1): hidden
  uncontrolled `<input name="website">` field
  (off-screen via CSS, not display:none). If populated
  on submit → silent fake-success returned, no DB
  write. Bots fill all inputs; real users never see
  or interact with it.
- On submit: duplicate detection by email OR phone
  - No match → insert, send confirmation email
  - Match found → friendly merge prompt ("We found an existing record — update it?")
- Confirmation email: branded, warm, includes personal update token link
- Success state: warm thank-you in-page (no redirect)
- Confirmation email sent on signup includes a CTA button linking to `/callboard` (updated Phase 13.2 — was `/shows` in Alpha).
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
- Honeypot spam prevention (built 12.1): same hidden
  field pattern as signup form. Silent rejection if
  populated.
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
- Name, categories, total hours, next milestone +
  hours remaining
- Hours summary line (built 12.3): "[X] hours across
  [Y] shows" where Y = count of distinct shows with
  at least one Showed attendance. Shows "[X] total
  hours" when Y = 0 (only manual hours or zero history).
  No "manual hours" label — hours are hours.
- Milestone badges (earned milestones displayed visually)
- Expandable section (built 12.3 — replaces flat list):
  Per-show grouped breakdown. Each show: show name
  (bold), sub-rows per call (date via
  `formatWallClockCT()`, role, colored status badge
  — green/red/amber, hours if Showed), per-show
  "X hrs total" line. After all show groups: "Other
  Hours" section for manual entries (note + date +
  hours) — omitted if no manual entries. Empty state:
  "No calls on record yet." Collapsed by default.
- "Edit my info" → `/update?token=[update_token]`
- "Sign out" → calls `signOutCallboard()` then
  `router.refresh()`
- Active claims flagged inline on opportunity cards
  ("You're signed up" indicator)
- Key types: `CallboardCallHistoryRow` (includes
  `show_id` added in 12.3), `CallboardManualHoursEntry`
  — both in `types/callboard.ts`.
- Data: `manualHoursEntries` prop (full entries with
  hours, note, logged_date) replaced the prior
  `manualHoursTotal: number` prop.

**Session mechanics:**
- Cookie name: `callboard_session` — stores volunteer id, expires 7 days
- No token columns on `volunteers` table — session is cookie-only
- `lib/callboard/session.ts` — `getCallboardSession()`: reads cookie, fetches volunteer
  via `getAdminClient()`, returns volunteer or null
- `lib/actions/callboard.ts` — `lookupVolunteer(input)`: sequential email-then-phone
  maybeSingle() lookup, normalizes phone via `normalizePhone()` from `lib/utils/phone.ts` before
  comparison. Sets cookie on match.
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
- **PWA / Add to Home Screen:** Admin users (all roles) can add Production Crew to their device home screen. Admin-only scope (`/crew/`). Offline support via network-first service worker (serves cached content when offline, refreshes on open when connected). App icon: blue X on navy background. `start_url`: `/crew/dashboard`.
- **Mobile sidebar** (built 12.1): Hamburger button (Menu icon) in TopBar, visible only below the `md` breakpoint (768px). Opens a full-height slide-in drawer with overlay. Three close methods: tap overlay, tap X button inside drawer, or navigate to any route (auto-close via `usePathname()` effect). State managed via `MobileSidebarContext` (see §3). Sidebar renders as a fixed left column on tablet+ (768px+) — unchanged from original desktop behavior.

- **Help page** (`/crew/help`, built 12.2b, all roles): Single-page how-to guide. Two-column layout on desktop (sticky TOC on left, content on right). Mobile: "Jump to section" block at top collapses to full-width content. Sections: Your Volunteers · Shows · Attendance and Hours · The Volunteer Signup Form · Settings · The Volunteer Call Board · Standing Opportunities · Getting Help. 8 h2 sections, 23 h3 subsections, all with named anchor IDs. Tip callouts (blue left border) and Warning callouts (orange left border). Server Component, no data fetching. scroll-behavior: smooth. "Help" nav link added to `components/crew/Sidebar.tsx` (HelpCircle icon, all roles, bottom of nav list).
- **Tooltip system** (`components/crew/HelpTooltip.tsx`, built 12.2c): Shared Server Component wrapping a `next/link` to `/crew/help#[anchor]`. Renders a small HelpCircle icon (muted, hover-brightens). Named export. No 'use client'. 16 placements across Production Crew on non-obvious UI elements: dashboard card headings, volunteer profile sections (hours, milestones, editor notes, SH badge, communication history), show detail (notifications, waitlist, report), show form (default hours, notifications toggle), volunteer list (milestone tier filter), settings (category visibility, general defaults). Each links directly to the relevant help page anchor — no popovers.

**Login (`/crew/login`):**
- Email/password form
- Google SSO: live in Alpha (30BN-1.3)
- On success: redirect to `/crew/dashboard` if valid `admin_users` record
- Invalid credentials or unregistered email: clear error, no redirect
- **Request Access** — "Request Access" toggle below the login form reveals a registration panel (Full Name, Email, Password, Confirm Password). On submit: creates Supabase Auth user, inserts `pending_registrations` row (status = 'pending'), sends notification email to all active Super Admins. Success state: in-page message, no redirect. Duplicate checks: existing `admin_users` email → "already registered"; existing pending row → "request already pending."

**Dashboard (`/crew/dashboard`):**
- **Quick Stats** (built ADMIN.20, all roles): four stat
  tiles at the top of the dashboard. Total Active
  Volunteers (count WHERE status = 'active'); Upcoming
  Shows This Month (live shows with at least one
  show_date in the current CT calendar month, computed
  via `date-fns-tz` with 'America/Chicago' — DST-safe);
  Volunteers Needed (sum of open slots across all live
  shows); New Volunteers (7 Days) (created_at in last
  7 days). Uses `getServerClient()`. Components:
  `components/crew/dashboard/QuickStats.tsx`.
- **Season at a Glance** (built ADMIN.20, all roles):
  per-show staffing view for the pinned season, or all
  live shows as fallback when no season is pinned. Each
  show card lists roles with a staffing indicator per
  role: red (0 claimed), yellow (partial), green (fully
  claimed). Super Admin-only season selector dropdown
  in section header — selecting a season upserts
  `app_settings.dashboard_season_id` via
  `setPinnedSeason()` in `lib/actions/settings.ts` and
  revalidates the dashboard in place. Editors and
  Viewers see the pinned season data but have no
  selector. Fallback: when `dashboard_season_id` is
  null or unset, shows all live shows. Components:
  `components/crew/dashboard/SeasonAtAGlance.tsx`,
  `components/crew/dashboard/SeasonSelector.tsx`.
- **Pending Hours Review** (Editor/Super Admin only):
  all past `attendance` records with `status = 'showed'`
  and `hours_confirmed = false`, grouped by show + date.
  Per-volunteer row: name, role, editable hours input
  (pre-filled with current `hours_logged`), Confirm
  button. On confirm: `confirmHours()` applies delta to
  `volunteers.total_hours`, inserts correction entry in
  `volunteer_hours_log` if delta ≠ 0, sets
  `hours_confirmed = true`. Card hidden when empty.
  Built in 30BN-9.1 (PendingHoursCard).
- **Pending Milestone Acknowledgments** (Editor/Super
  Admin only): all `milestone_log` rows with
  `editor_acknowledged = false`, per volunteer. "Mark
  Acknowledged" button prompts Editors to give a
  personal thank-you. Clears on acknowledge. Built in
  30BN-9.2 (PendingMilestonesCard).
- **Activity feed:** paginated feed of platform events —
  volunteer signups, slot claims, cancellations,
  opportunity submissions — in reverse chronological
  order. Loads 10 at a time; "Load more" button appends
  the next 10. Per-user read state: each admin has an
  `activity_cleared_at` timestamp; events newer than
  this are highlighted "NEW." "Mark all as read" updates
  the timestamp without a page reload. Events include
  volunteer name (linked to profile) and context (show
  name linked to show detail, opportunity title linked
  to opportunity detail). Implemented via
  `get_activity_feed()` Supabase RPC (UNION of four
  event sources, SECURITY DEFINER).
- **Add to Home Screen card** (mobile only, dismissible):
  device-aware PWA install prompt. iOS: numbered steps
  with Share icon. Android: "Install App" button
  triggering native `beforeinstallprompt`. Hidden when
  already installed or dismissed (localStorage key).
  Built in ADMIN.16.
- **Dashboard section render order** (top to bottom):
  Quick Stats → Season at a Glance → Pending Milestones
  → Pending Hours → Add to Home Screen (mobile only)
  → Activity Feed.

**Volunteers (`/crew/volunteers`):**
- Searchable, filterable, sortable list (full-text: name/email/phone)
- Filters: category, status (active/archived), age range, school, is_minor, milestone tier, Service Hours Required (Yes/No/All)
- Volunteer list is filterable by category (role)
- SH badge on list rows indicating `requires_service_hours`
- Sort: name, date joined, total hours, last call date
- Columns: Name, Email, Phone, Categories, Total Hours,
  Calls, Status, Joined. Phone column displays formatted
  via `formatPhone()` from `lib/utils/phone.ts`
  (e.g. "(985) 555-1234" — ADMIN.21).
- Bulk select: export selected to CSV. `requires_service_hours` included in CSV export.
- **Export Matching (CSV):** filter-aware all-pages CSV export — exports all volunteers matching the current active filters, not just the current page. Built in ADMIN.19 (replaced the prior all-volunteers-ignoring-filters export).
- PDF export available (Editor/Super Admin) via
  server-side route handler at `/crew/volunteers/export`.
  Landscape A4, branded header, 9-column table (added
  "Svc Hrs" column in ADMIN.17). Filter fix applied in
  ADMIN.20: both `milestoneTier` and `service_hours`
  params were previously dropped by the route handler;
  both now pass through correctly. The CSV "Export
  Matching" export was unaffected and remains correct.
- Milestone Tier filter: active as of 30BN-9.2. Filter options: Any milestone earned, First Call, 10+ Hours, 20+ Hours, 50+ Hours, 100+ Hours. Filter runs a pre-query against `milestone_log` then applies `.in('id', matchingIds)` on the main volunteer query.
- Row click → volunteer profile

**Volunteer Profile (`/crew/volunteers/[id]`):**
- All submitted fields (editable by Editors, read-only
  for Viewers). Phone displays formatted in view mode
  (e.g. "(985) 555-1234") via `formatPhone()` from
  `lib/utils/phone.ts`; edit-mode input shows raw
  digits-only value as stored (ADMIN.21).
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
- **Communication History** (built ADMIN.24, all roles):
  collapsible section below Milestone History. Shows all
  emails logged to this volunteer via
  `email_log_recipients` JOIN `email_log`. Collapsed by
  default; expand/collapse via chevron toggle. Columns:
  Date (`formatCT` — `sent_at` is timestamptz), Subject,
  Type (human-readable: "Transactional", "Show Message"
  for `recipient_filter` starting with 'show:',
  "Category Email", "Direct", "All Volunteers"), Sent By
  (admin name or "System" for null `sent_by`), Preview
  (body_preview truncated to 80 chars; "—" if null).
  Empty state: "No emails on record for this volunteer"
  with clarifying note that only platform-logged emails
  appear. Visible to all admin roles including Viewers.
  Component:
  `components/crew/volunteers/CommunicationHistory.tsx`.
  Note: only emails explicitly logged via `email_log` /
  `email_log_recipients` appear here. All system-triggered
  email paths are logged as of Phase 13.1.

**Category Management (`/crew/settings/categories`):**
- Super Admin only (not Editor or Viewer)
- Add, rename, reorder (↑↓ arrow buttons — no drag library), visibility toggle
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
- **`calendar_editor` toggle** (CAL.6): on each Editor/Viewer row — grants or revokes direct calendar write access. Toggle absent on Super Admin and Production rows. Calls `toggleCalendarEditor()` in `lib/actions/users.ts`.
- **ADMIN.26:** All four user management actions (`createUser`, `deactivateUser`, `reactivateUser`, `changeRole`) migrated to `getServerClient()` with `revalidatePath('/crew/settings/users')`. Client components use `router.refresh()` instead of `window.location.href`. `changeRole()` guards: Production role cannot be set via role change; admin cannot change own role.
- **Change Password** — `/crew/settings/password` page accessible to all logged-in admins via "Change Password" link in the top bar. New Password + Confirm New Password fields (min 8 chars). Uses Supabase Auth `updateUser({ password })`. No current password field required (relies on valid session). Logged to `audit_log` as `user.password_change`. Built in ADMIN.15.

**Show Management (`/crew/shows`):**
- Show list organized by season, filter by location/status
- Create/edit show: name, location (loaded from `locations` table — never hardcoded, R4), season, dates+times (start time + optional end time — added CAL.4a, Migration 019) with per-date volunteer roles (each date has its own independent role configuration — role name, category, slot count), assigned editors, custom show instructions (included in slot claim confirmation email), status (draft/live/past/archived). "Copy roles from previous date" convenience copies the role structure from the preceding date row.
- **Buffer time per show date** (built CAL.3): each show date has optional "Reserve before" and "Reserve after" fields (in minutes, default 0). Stored in `show_date_buffer` table. Buffer windows appear on the master calendar in a lighter shade of the location color; they are NOT part of the public performance time display. Used for conflict detection when booking other events into the same space.
- Draft/Live toggle: live = visible to public immediately
- Per-show detail page (`/crew/shows/[id]`):
  - Tabs: Overview / Volunteers / Waitlist / Dates /
  Report / Settings. The Report tab renders only when
  show.status = 'past' (hidden on all other statuses).
  - Volunteers tab: per-role roster, attendance status, per-date filter
  - Waitlist tab: ordered list per role, volunteer name + time added
  - Settings tab: assigned editors (add/remove any time), status selector (all four values: Draft/Live/Past/Archived). Note: there is no separate public visibility boolean — public visibility is controlled entirely by status = 'live'.
- Post-event attendance marking (Editors only, only available after show date has passed):
  - Per-volunteer, per-date: Showed / No-Show / Excused
  - Showed: triggers hours increment + milestone check
  - Bulk mark: per-role "Mark All Showed" button (one button per role section, not a global button for all roles at once)
- Attendance re-marking: changing a volunteer from
  Showed to No-Show or Excused subtracts the previously
  logged hours from `volunteers.total_hours` and inserts
  a negative `volunteer_hours_log` entry. Changing from
  a non-Showed status to Showed adds hours. The hours
  delta is computed server-side and applied atomically.
  If `slot_claims.volunteer_id` is null (non-registered
  volunteer), the attendance record is still inserted but
  hours are not tallied.
- **Post-Show Report tab** (built ADMIN.22, all roles,
  status = 'past' only): aggregate stats for the full
  show. Six stat tiles: Claimed Appearances (distinct
  claimed slot_claims), Showed Up, No-Shows, Excused,
  Total Hours (sum of hours_logged WHERE status =
  'showed'), Attendance Rate (showed ÷ total marked
  × 100; null when no records marked). Per-date
  breakdown table: Date | Claimed | Showed | No-Show |
  Excused | Unmarked | Hours. Empty states: "No
  volunteers rostered" and "Attendance not marked yet"
  notice. Hours pending confirmation subtext when any
  showed records have `hours_confirmed = false`. Data
  fetched via `getPostShowReportData(showId, supabase)`
  in `lib/data/showReport.ts`. Component:
  `components/crew/shows/PostShowReport.tsx`.
- **Bulk Email from Show Detail** (built ADMIN.23,
  Editor/Super Admin only): "Message Volunteers (N)"
  button on Overview tab, where N = unique claimed
  volunteer emails. Inline compose form: Subject,
  Reply-To (pre-fills from `default_reply_to`),
  Message. Two-step: compose → confirm → send.
  Deduplication by lowercased email server-side.
  Sends via shared `sendBatchEmails()` helper in
  `lib/email.ts` (chunks of 100, R8). Logs to
  `email_log` (recipient_type = 'category',
  recipient_filter = 'show:{showId}') and
  `email_log_recipients`. Server action:
  `sendShowBulkEmail()` in `lib/actions/shows.ts`.
  Component:
  `components/crew/shows/BulkEmailSection.tsx`.

- **Automated Post-Show Thank-You Email** (built 12.4): Vercel Cron Job at `app/api/cron/thankyou/route.ts`, runs daily at 07:00 UTC (02:00 CT). Finds show_dates where `show_date = CURRENT_DATE - 2` (48 hours after the show, giving Editors time to mark attendance) AND `thank_you_sent_at IS NULL`. For each date: fetches all slot_claims with status = 'claimed' that have an attendance record with status = 'showed'. Deduplicates by lowercased email. Sends via `sendBatchEmails()` helper (R8). Logs to `email_log` (recipient_type = 'transactional', sent_by = null, recipient_filter = 'show_date:{dateId}') + `email_log_recipients`. Sets `show_dates.thank_you_sent_at = now()` after successful send+log. Dates with zero showed volunteers: marked sent immediately, no emails sent. CRON_SECRET auth. Email function: `buildThankYouEmailPayload()` in `lib/email.ts`. `escapeHtml()` applied to recipientName and showName. Migration 015 adds `thank_you_sent_at timestamptz` (nullable) to `show_dates`.

**Standing Volunteer Opportunities (30BN-4.4a/4.4b):**
- Non-show volunteer opportunities for intern positions, long-term roles, and organizational interest. Public URL: `/opportunities/[id]`. Linked from `/shows` public page above productions (wired in Phase 5).
- Admin management at `/crew/shows/opportunities`: list (all statuses), create, edit, archive. Cross-linked from `/crew/shows` via "Standing Opportunities →" link.
- Per opportunity, admin designates:
  - Title and optional description
  - Claim type: Expression of Interest (EOI) OR Slot Claim. EOI = volunteer submits interest, Editor follows up manually. Slot Claim = same cap enforcement as show slot claiming.
  - Slot cap: optional toggle. If off, open-ended. If on, enter a slot count. Cap applies to both EOI and Slot Claim types.
- Public submission page (`/opportunities/[id]`): name, email, phone form. Duplicate detection by email (friendly message, not an error). Cap enforcement: if Slot Claim and cap hit, "full" message rendered, no form shown. Honeypot spam prevention (built 12.1): same hidden field pattern. Silent rejection if populated.
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
  keyed by field id. Honeypot spam prevention (built 12.1): same hidden field pattern as other
  public forms. Silent rejection if populated. Checkbox fields use Controller (not register) for string[] value management.
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

**Master Calendar (`/crew/calendar` + public `/calendar`):**

**Overview:** A theater-wide room-booking and event calendar system. Two surfaces: a full Production Crew admin calendar at `/crew/calendar` and a public read-only Events Calendar at `/calendar` (shows performance dates and volunteer-needs indicators only).

**Locations (`locations` table, Migration 016):** Locations replace the old `show_type` concept (CAL.1 migration). All bookable spaces are rows in the `locations` table: Mainstage (#293994 navy), Mainstage Lobby (#0D9488 teal), Green Room (#15803D green), Studio X (#F26522 orange), Studio X Office (#7C3AED purple). Each location has a display color used for event chips, the room-booking grid, and the legend. Location management UI (add/edit/reorder/deactivate, color picker, per-location `default_hours`) built in CAL.8 (`/crew/settings/locations`). Shows now carry a `location_id` FK instead of a `show_type` text column.

**Show-to-Calendar Auto-Sync (CAL.3):** When a show date is created or updated, a `calendar_events` row is automatically upserted via `syncShowDateToCalendar(showDateId, supabase)` in `lib/actions/calendar-sync.ts`. Key behavior:
- `event_type = 'performance'`, `source = 'show'`, `status = 'approved'`, `submitted_by = null`
- `start_time` / `end_time` built from `show_date` + `show_time` / `end_time` via `fromZonedTime()` with CT — DST-safe (R23 pattern). Falls back to `start_time + 3 hours` when `end_time` is null.
- Upserted on `source_show_date_id` unique constraint. UPDATE (not insert) when show date is edited.
- CASCADE DELETE: when a show date is deleted, its linked `calendar_events` row is deleted automatically.
- Show-sourced events are always `approved` — no pending queue.
- Buffer time stored in `show_date_buffer`; used for conflict detection but does not affect the calendar event's stored start/end times.
- `hasConflict()` and `hasConflictWithBuffer()` in `lib/utils/calendar-conflict.ts` — shared conflict detection utility used by sync, approval queue, and Book Space panel.

**Event Types (manual events):** Performance events are auto-generated from shows only — never created manually. All other types are available for manual creation: Rehearsal, Teaching, Meeting, Event, Rental (Super Admin only), Other (with custom label). Type drives color-coded filtering and legend display. Rental is restricted to Super Admin; all other types available to all roles (subject to approval flow).

**Roles and Access on the Calendar:**
- Super Admin: full read/write. Direct-create (events approved immediately). Can approve, edit, cancel any event. Only role that can create Rentals.
- Editor/Viewer (calendar_editor = false, default): can view all approved events, submit single events or rehearsal batches for approval. Events saved as `pending`.
- Editor/Viewer (calendar_editor = true): direct-create access (events approved immediately). Book Space button visible.
- Production: can view the calendar and submit events/rehearsal schedules for approval. Same pending flow as default Editor/Viewer.

**`/crew/calendar` — Admin Calendar Page (CAL.4b):** Three switchable views, all in one page:
- **Month view:** 7-column calendar grid. Up to 3 colored event chips per day (overflow: "+N more"). Day click opens day detail panel.
- **Week view (unified grid, CAL.9):** One master grid — all locations displayed concurrently, events color-coded by location. Columns = Mon–Sun (day headers). Time axis 7 AM–10 PM at 1-hour increments. Overlapping events rendered side-by-side via column-splitting algorithm (`computeColumnLayout()` in `lib/utils/calendar-layout.ts`). Buffer windows shown as lighter shade of location color behind their parent event block. Current-time indicator (red line) when viewing current week. Location name shown on event blocks. The previous 'All Locations / Booked Only' per-location-row toggle has been removed — the filter bar's location multi-select serves this purpose. **Mobile (< 768px):** Week grid replaced by `WeekAgendaView.tsx` — events for Mon–Sun listed chronologically with a note to use a larger screen for the full grid. Desktop and mobile shown via Tailwind `hidden md:block` / `md:hidden` pattern.
- **Agenda view:** Chronological list, grouped by date. Colored left border per event. 90-day forward window. Empty dates omitted.
- **Location Legend (`CalendarLegend.tsx`):** Horizontal color-chip row visible across all views and all roles, below the filter bar. Shows all active locations with their assigned colors.
- **Filter bar:** Location multi-select, Event Type multi-select, Season (server-side re-fetch). Location/type filters applied client-side; season filter triggers server re-fetch (requires show→season join). Week-view only: "All Locations / Booked Only" toggle. Mobile: collapses to "Filters" button.
- **Day detail panel:** Slide-in from right (desktop) / bottom sheet (mobile). Two sections: Booked (events in time order) and Available Windows (free time slots per location within 7 AM–10 PM, computed via `getAvailableWindows()` from `lib/utils/calendar-availability.ts`). Recurring events show a '↻ Part of a recurring series' note below the location name. Super Admin sees Edit and Cancel event buttons on each row. Edit on a recurring event opens `RecurrenceScopePicker.tsx` before the form; Cancel on a recurring event opens it in cancel mode. Edit on a non-recurring event opens the form directly (existing behavior).
- **Pending Requests link** (Super Admin only): in calendar header. Badge shows count of pending events.
- **"Add Event" / "Submit Request" dropdown:** Three options: Single Event, Rehearsal Schedule, Recurring Event. Label adapts to role (Super Admin / calendar_editor → "Add Event"; others → "Submit Request").
- **Book Space panel** (`CalendarBookSpacePanel.tsx`): slides in from the LEFT (not right — avoids day panel conflict). Date + time range + location search → returns per-location availability. "Book This Slot" pre-fills CalendarEventForm. Visible to Super Admin and `calendar_editor` users only.
- **URL params:** `view`, `date`, `locations`, `types`, `season`. Shareable, survive navigation. (`show_locations` param removed in CAL.9 alongside the toggle it controlled.)
- **Mobile optimization (CAL.9):** Calendar header collapses secondary buttons (Export, Book Space, Pending Requests) into a ⋯ More dropdown on mobile. Primary action button (Add Event/Submit Request) always visible. CalendarEventForm and Bulk RehearsalForm render as bottom sheets on mobile (full-width, rounded top corners, sticky footer). CalendarBookSpacePanel already bottom-sheet on mobile (built CAL.5b). PendingQueueClient batch date table wrapped in overflow-x-auto for horizontal scroll.

**Event Creation / Submission (CAL.5a):** Single form `CalendarEventForm.tsx` with role-adaptive behavior:
- Fields: Title, Event Type, Custom Type Label (if Other), Location (required for Super Admin / calendar_editor; optional "Preferred Location" for others), Date, Start Time, End Time, Description, Requirements, Contacts (up to 5, name + phone, normalized via `normalizePhone()`).
- Super Admin / calendar_editor: conflict detection ("Check Availability" button before submit). Can override conflicts. Events saved as `approved`.
- Other roles: no conflict check at submission. Events saved as `pending`. Preferred location stored for reference but not enforced.
- Performance type excluded from manual creation (auto-generated from shows only).
- Contacts stored in `calendar_event_contacts` (CASCADE DELETE from calendar_events).
- Edit flow: "Edit" button on day panel event rows (Super Admin only). Pre-fills form with existing data.
- Server actions: `createCalendarEvent()`, `updateCalendarEvent()`, `checkEventConflict()` in `lib/actions/calendar.ts`.
- Zod schemas: `calendarEventSchema` (client) + `calendarEventSubmitSchema` (server, with cross-field end > start check) in `lib/validations/calendar.ts`.

**Bulk Rehearsal Submission (CAL.5b):** `CalendarBulkRehearsalForm.tsx` — dedicated modal for submitting a full rehearsal schedule:
- Batch details: Production Title (stored in `rehearsal_batches` table), Preferred Location, Default Start Time, Default End Time, Description, Requirements, Contacts.
- Date management: date picker adds dates to a list. New dates auto-pre-fill from Default Start/End Time. "Apply to all dates" button updates all existing rows to current defaults. Per-row start/end time override. Dates auto-sort chronologically after every add.
- Contacts repeated across all events in the batch.
- Server action: `createRehearsalBatch()` in `lib/actions/calendar.ts`. Each date becomes a separate `calendar_events` row with `rehearsal_batch_id` set.
- For direct-create (Super Admin / calendar_editor): per-date conflict detection runs server-side. Partial success — non-conflicting dates approved, conflicting dates reported.
- For pending flow: all dates saved as pending, no conflict check at submission.

**Pending Approval Queue (`/crew/calendar/pending`, CAL.5b + CAL.10c):** Super Admin only. Server-side conflict pre-check at page load for events with a preferred location set. Three sections:
- Rehearsal Batches: grouped by batch, collapsible cards. Per-date table: Date, Requested Time, Location Selector, Conflict Indicator (⚠ / ✓ / —), Approve / Skip actions. "Approve All Available" approves non-conflicted dates via `approveBatch()`.
- Recurring Events (CAL.10c): grouped by `recurrence_group_id`, same card pattern as batches. Header shows series title + frequency badge. Approve All calls `approveCalendarEvent()` per occurrence.
- Individual Requests: non-batch, non-recurring events.
Location selector onChange triggers live `checkEventConflict()` re-check. Approve button disabled when conflict confirmed. `approveCalendarEvent(eventId, locationId)` runs a final server-side conflict check before approving.
Server actions: `approveCalendarEvent()`, `approveBatch()`, `cancelCalendarEvent()` in `lib/actions/calendar.ts`.

**Public Events Calendar (`/calendar`, CAL.7 — built):** Read-only public page (`app/calendar/page.tsx`, `getAdminClient()`, no auth). Month view only. Shows `event_type = 'performance'` and `status = 'approved'` events. Colored event pills (location color) per day. "Needs volunteers" indicator (orange) on show dates with at least one open slot. Click pill → show name, time, "Sign up to volunteer →" link to `/shows/[id]`. Month navigation via `?month=YYYY-MM` URL param (CT-safe default). Light mode only (no dark: classes — public page per ADMIN.6). "View Calendar" link added to `/` landing page and `/shows` page. Component: `components/calendar/PublicCalendarGrid.tsx`.

**Recurring Events (CAL.10a–c):**

**Schema:** `recurrence_groups` table (Migration 022) is the series template. Each occurrence is a standard `calendar_events` row with `recurrence_group_id` FK (nullable, ON DELETE SET NULL). Fields on `recurrence_groups`: title, event_type, custom_type_label, location_id, start_time (time), end_time (time), description, requirements, frequency (`weekly` | `biweekly` | `monthly`), series_start_date (date), series_end_date (date, nullable), status (`active` | `cancelled`), submitted_by.

**Generation:** `generateOccurrenceDates()` in `lib/utils/calendar-recurrence.ts` (pure, client-safe) generates YYYY-MM-DD date strings from series_start_date forward. Cap: 12 months if series_end_date is null. Monthly uses date-fns `addMonths()` (handles month-end correctly — Jan 31 + 1 month → Feb 28/29). Returns an array of date strings; each becomes one `calendar_events` row via `buildEventTimes()`.

**Frequencies:**
- `weekly`: repeats every 7 days from series_start_date
- `biweekly`: repeats every 14 days
- `monthly`: repeats on the same day of the month

**Creation:** Third option in the action dropdown. `CalendarRecurringEventForm.tsx` — same modal pattern as CalendarEventForm. Fields: Title, Event Type, Location, Start Time, End Time, Frequency (radio buttons: Weekly / Bi-Weekly / Monthly), First Occurrence (date), Last Occurrence (optional date), live N-events preview (`describeRecurrence()` from `lib/utils/calendar-recurrence.ts`), Description, Requirements, Contacts. Live preview: "Weekly on Mondays — 52 events through Jul 2027". Server action: `createRecurringEvent()` in `lib/actions/calendar.ts`. Batch inserts all occurrence rows in one call.

**Edit/cancel scope picker:** `RecurrenceScopePicker.tsx` — modal with three choices:
- "Only this occurrence" — updates/cancels one event, detaches it from the series (recurrence_group_id → null for edits)
- "This and all future occurrences" — updates/cancels this and all later events in the group
- "All occurrences" — updates/cancels every event; cancel also sets recurrence_groups.status = 'cancelled'

Clicking Edit on a recurring event in the day panel opens the scope picker first, then the form. Clicking Cancel on a recurring event opens the scope picker in cancel mode — no form, direct action. Non-recurring events: Edit opens form directly, Cancel calls `cancelCalendarEvent()` directly.

**Server actions** (in `lib/actions/calendar.ts`): `createRecurringEvent()`, `editRecurringOccurrence()`, `cancelRecurringOccurrence()`.

**Pending queue:** Recurring Events section in PendingQueueClient alongside Rehearsal Batches and Individual Requests. Grouped by `recurrence_group_id`. Card header shows series title + frequency badge. Same location selector + conflict indicator per occurrence. Approve All Available calls `approveCalendarEvent()` loop (not `approveBatch()` — deferred optimization).

**AuditAction types:** `recurring_event.create`, `recurring_event.edit`, `recurring_event.cancel`.

**Key utilities:**
- `lib/utils/calendar-recurrence.ts` — `generateOccurrenceDates()`, `describeRecurrence()` (pure, client-safe)
- `types/calendar.ts` — `RecurrenceGroup`, `RecurrenceGroupFrequency`, `RecurrenceGroupStatus`
- `lib/validations/calendar.ts` — `recurringEventSchema`, `RecurringEventFormData`

**CalendarEventChip recurring indicator (CAL.10c):** Recurring events show a '↻' icon overlay. In compact mode (month grid pills): tiny icon in top-right corner, `aria-hidden`. In full mode (agenda view rows): small '↻ Recurring' label below the title.

**iCalendar Export & Subscription (CAL.7):** Admin calendar export for Production Crew users. Two modes:
- **Subscription URL (live sync):** `/api/calendar/feed.ics?token=[calendar_subscription_token]`. Token is per-admin UUID stored in `admin_users.calendar_subscription_token` (Migration 021, NOT NULL DEFAULT gen_random_uuid()). Calendar apps (Google Calendar, Apple Calendar, Outlook) subscribe to this URL and auto-sync as events are added or changed. Auth via token (calendar apps can't send session cookies). Route uses `getAdminClient()`. Returns all approved `calendar_events` as iCalendar format.
- **Download (.ics file):** Same route with the admin's own token; download delivers a snapshot.
- **`CalendarExportModal.tsx`:** In the calendar header (Export button, all roles). Subscribe section: URL display with copy button, per-platform instructions (Google/Apple/Outlook), "Rotate subscription URL" button (`rotateCalendarToken()` server action generates a new UUID, invalidates old URL). Download section: direct `<a>` link to the .ics route.
- **Volunteer slot-claim `.ics` (CAL.7 + ADMIN.26):** `/api/calendar/claim.ics?token=[claim_token]`. Public route (no auth — uses claim_token for identity). Returns a single VEVENT for the claimed show date. DST-safe CT time construction (fromZonedTime pattern). Fixed filename `volunteer-call.ics`. Added to: (1) slot claim confirmation email ("📅 Add to your calendar" link), (2) waitlist promotion email (ADMIN.26 — `sendWaitlistPromotionEmail()` now accepts and uses `claimToken`), (3) Call Board call history rows (claimed status only).
- **Shared iCalendar utility:** `lib/utils/ical.ts` — `generateVEvent()`, `wrapInCalendar()`, `buildClaimICalEvent()`, `buildAdminCalendarEvents()`. Pure TypeScript, RFC 5545 compliant, CRLF line endings, 75-octet line folding, text escaping.

**Key files (CAL phase):**
- `lib/actions/calendar-sync.ts` — `syncShowDateToCalendar()`
- `lib/utils/calendar-conflict.ts` — `hasConflict()`, `hasConflictWithBuffer()`
- `lib/utils/calendar-availability.ts` — `getAvailableWindows()`, grid helpers
- `types/admin.ts` — `AdminRole` type (consolidated from inline definitions in CAL.2; `lib/auth.ts` re-exports it)
- `lib/utils/calendar-recurrence.ts` — `generateOccurrenceDates()`, `describeRecurrence()`
- `lib/utils/calendar-layout.ts` — `computeColumnLayout()`, `computeEventPosition()`, `EventWithLayout` type (unified week grid layout)
- `lib/utils/ical.ts` — `generateVEvent()`, `wrapInCalendar()`, `buildClaimICalEvent()`, `buildAdminCalendarEvents()` (iCalendar generation)
- `lib/actions/calendar.ts` — all calendar server actions including `createRecurringEvent()`, `editRecurringOccurrence()`, `cancelRecurringOccurrence()`, `rotateCalendarToken()`
- `lib/validations/calendar.ts` — `calendarEventSchema`, `calendarEventSubmitSchema`, `rehearsalBatchSchema`, `recurringEventSchema`
- `types/calendar.ts` — `CalendarEvent`, `CalendarEventType`, `CalendarEventContact`, `RehearsalBatch`, `ShowDateBuffer`, `RecurrenceGroup`, `RecurrenceGroupFrequency`, `RecurrenceGroupStatus`
- `components/crew/calendar/` — CalendarShell, CalendarMonthView, CalendarWeekView (wrapper), UnifiedWeekGrid, WeekAgendaView, CalendarAgendaView, CalendarDayPanel, CalendarFilterBar, CalendarEventChip, CalendarLegend, CalendarEventForm, CalendarBulkRehearsalForm, CalendarRecurringEventForm, RecurrenceScopePicker, CalendarExportModal, PendingQueueClient, CalendarBookSpacePanel (Note: `CalendarWeekGrid.tsx` deleted in ADMIN.26 — replaced by UnifiedWeekGrid.tsx in CAL.9)
- `components/calendar/PublicCalendarGrid.tsx` (public /calendar page — separate from crew components)

**ADMIN.25 — Default Hours Fallback Update:** `getLocationHoursBucket()` in `lib/actions/attendance.ts` (and the parallel auto-fill in `ShowForm.tsx`) was updated to check `locations.default_hours` (Migration 020 — numeric, nullable) as the primary source before falling back to the `app_settings` name→bucket map. This means per-location default hours can be set directly on the `locations` record. The three existing `app_settings` keys (`default_hours_mainstage`, `default_hours_studio_x`, `default_hours_one_off`) remain as fallbacks when `locations.default_hours` is null. Per-location `default_hours` UI built in CAL.8 (`/crew/settings/locations`).

**Communication (`/crew/communication`, built Phase 13.3a/b):**
Full email blast composer. Editor and Super Admin only
(Viewers see a locked message). Stub replaced entirely.

Recipient modes:
- "All Volunteers" — sends to all `status = 'active'` volunteers
- "By Category" — multi-select from visible `volunteer_categories`; volunteers matching ANY selected category receive the email (two-query approach: assignments → volunteer IDs → active volunteers)
- "Individual" — debounced name/email search via `searchVolunteers()` server action; selected volunteers shown as removable chips

Compose → Confirm → Sent flow (client-side step machine):
- Compose step: recipient mode selector (stacks vertically on mobile — 13.4b), subject (max 200 chars), reply-to (pre-filled from `default_reply_to`), TipTap rich text body (max 10,000 chars)
- "Preview & Send" calls `previewBlast()` server action → returns `recipientCount` + `sampleEmails` (first 5) without sending → advances to Confirm step
- Confirm step: summary card (subject, reply-to, recipient mode, count, sample emails, body plain-text preview), orange warning banner, Back button (restores compose), Send button
- "Send Email Blast" calls `sendBlastEmail()` → Sent step with success message and recipient count
- Sent step: "Send Another Email" button resets all state to initial compose

Server actions (all in `lib/actions/blast.ts`):
- `searchVolunteers(query)` — active volunteer search (min 2 chars, max 10 results)
- `previewBlast(payload)` — resolves recipients, returns count + sample, does not send
- `sendBlastEmail(payload)` — Zod validation, recipient resolution, dedup by lowercased email, sanitize-html on TipTap body (allowlist: p/strong/em/ul/ol/li/br/h1–h3/blockquote/a[href]; HTTP/HTTPS/mailto only), batch send via `sendBatchEmails()`, logs to `email_log` (`sent_by = admin.id`, `recipient_type = recipientMode`) + `email_log_recipients`
- Private helper: `resolveBlastRecipients()` — used by both preview and send to avoid duplication
- `recipient_filter` values: `'all'` / `'category:{id1},{id2}'` / `'individual'`

Email template: Local `buildBlastEmailHtml()` in `blast.ts` (not `buildShowBulkEmailPayload()` — that function has a show-context line that is semantically wrong for blasts). Same table-based inline-style pattern as `buildEmailHtml()`.

Validation (Zod): subject min 1 max 200; body min 1 max 10,000; replyTo email format. Viewer and Production roles blocked at action level (return error, never throw).

Mobile (13.4b): Recipient mode tab bar stacks vertically below `sm` breakpoint. Confirm step button row uses `flex-wrap` for narrow viewports.

Component: `components/crew/communication/BlastComposer.tsx` ('use client'). Page: `app/crew/(app)/communication/page.tsx` (Server Component — fetches `default_reply_to` and visible categories).

**Announcement Banner (`/crew/settings/announcement`):**
Built in Phase 11.2. Text input (280 char limit with
live character count), on/off toggle, save → takes
effect on public landing page immediately via
`revalidatePath('/')`. Light-mode preview of how the
banner will appear on the public page (always light
regardless of admin dark mode). Server action:
`saveAnnouncementBanner()` in `lib/actions/settings.ts`.

**App Settings (`/crew/settings`):**
Built in Phase 11.2. Settings hub at `/crew/settings`
displays 8 section cards using the `LinkedCard` /
`LockedCard` role-gating pattern (established in
30BN-10.1 for the Audit Log card).

| Card | Route | Access |
|---|---|---|
| Announcement Banner | `/crew/settings/announcement` | Editor + Super Admin (LinkedCard); Viewer (LockedCard) |
| Hearing Options | `/crew/settings/hearing-options` | Editor + Super Admin (LinkedCard); Viewer (LockedCard) |
| Signup Form | `/crew/settings/signup-form` | Editor + Super Admin (LinkedCard); Viewer (LockedCard) |
| General Defaults | `/crew/settings/general` | Editor + Super Admin (LinkedCard); Viewer (LockedCard) |
| Category Management | `/crew/settings/categories` | Super Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") |
| User Management | `/crew/settings/users` | Super Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") |
| Audit Log | `/crew/settings/audit-log` | Editor + Super Admin (LinkedCard); Viewer (LockedCard "Editor & Super Admin only") |
| Email Activity | `/crew/settings/email-activity` | Super Admin only (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") — built 13.1 |
| Document Management | `/crew/settings/documents` | Editor + Super Admin (LinkedCard, "Beta" badge); Viewer (LockedCard) |
| Location Management | `/crew/settings/locations` | Super Admin only (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") — **built CAL.8** |

**Email Activity (`/crew/settings/email-activity`, built Phase 13.1 — Super Admin only):**
Global log of all emails sent by the platform. Three tabs via `?tab=` URL param:
- All Emails — paginated reverse-chronological log of all `email_log` rows. 25/page, `?page=N`.
- System Only — same log filtered to `sent_by IS NULL` (system-triggered emails only).
- About System Emails — static trigger catalog listing all 11 automated email triggers, when each fires, who receives it, and spam protections in place.

Log columns: Date (`formatCT(sent_at)`), Subject, Type (human-readable label), Sent By (admin name or "System"), Recipients (`recipient_count`), Trigger/Filter (`recipient_filter` in monospace badge).

Type label mapping: transactional + `sent_by IS NULL` → "System"; transactional + `sent_by IS NOT NULL` → "Transactional"; category + `recipient_filter` starts with `show:` → "Show Message"; category otherwise → "Category Email"; all → "All Volunteers"; individual → "Direct".

Mobile (13.4b): Tab bar uses `flex-wrap` + `whitespace-nowrap` — wraps cleanly at 375px. Log table hidden below `sm` breakpoint; mobile card layout (date + type badge, subject, sent-by + recipient count, trigger badge) renders instead.

Page: `app/crew/(app)/settings/email-activity/page.tsx` (Server Component). Component: `components/crew/settings/AboutSystemEmails.tsx` (static trigger catalog).

Sub-pages built in Phase 11.2:
- `/crew/settings/announcement` — see Announcement
  Banner above.
- `/crew/settings/hearing-options` — Add, rename
  (inline edit), reorder (↑↓ arrows — no drag library),
  deactivate/reactivate. Uses `is_active` column.
  Deactivated options hidden from public signup form.
  `revalidatePath('/')` on all mutations. Actions:
  `addHearingOption()`, `updateHearingOption()`,
  `reorderHearingOption()`, `toggleHearingOptionActive()`.
  Audit types: `hearing_options.create/update/reorder/
  deactivate` (deactivate used for both directions).
- `/crew/settings/signup-form` — Two toggles:
  `signup_show_school`, `signup_show_age_range`. Single
  save. `revalidatePath('/')`. Action:
  `saveSignupFormToggles()`.
- `/crew/settings/general` — Default hours (fallback by location bucket: Mainstage/Studio X/One-Off, min 0 max 24, step 0.5) and default reply-to email. These keys are now fallbacks only — per-location `default_hours` on the `locations` table takes precedence when set (ADMIN.25). A fallback hierarchy note with a link to Location Management was added to this page in CAL.8. Two
  independently-saving sections. Actions:
  `saveDefaultHours()`, `saveDefaultReplyTo()`.

**Location Management (`/crew/settings/locations`, CAL.8 — Super Admin only):**
- Full CRUD for the `locations` table. Page: `app/crew/(app)/settings/locations/page.tsx`. Component: `components/crew/settings/LocationsManager.tsx`.
- **Add new location:** Name, color (`<input type="color">` — native OS color picker, 6-digit hex), per-location `default_hours` (numeric, optional, takes precedence over `app_settings` bucket fallbacks per ADMIN.25). New location appears at bottom with `sort_order = max + 1`, `is_active = true`.
- **Edit existing location:** Inline edit (same row) — name, color picker pre-filled, default_hours. Save updates immediately.
- **Reorder:** ↑↓ arrow buttons. No drag library (R6). Same pattern as hearing_options reorder.
- **Deactivate / Reactivate:** Deactivated locations hidden from event type selectors and week grid rows. Existing calendar events keep their location FK.
- **Server actions** (in `lib/actions/settings.ts`): `createLocation()`, `updateLocation()`, `reorderLocation()`, `toggleLocationActive()`. All Super Admin only, audit-logged, `revalidatePath()` for settings + calendar + shows routes.
- **AuditAction types:** `location.create`, `location.update`, `location.reorder`, `location.deactivate` (covers both directions).

All settings mutations use `getServerClient()`, upsert
via `ON CONFLICT (key) DO UPDATE`, log to `audit_log`
as `settings.update` with before/after values, and live
in `lib/actions/settings.ts` (created in ADMIN.20 for
`setPinnedSeason()`; Phase 11.2 actions added then).
Viewers redirected to `/crew/settings` hub if they
navigate directly to any sub-page.

**Document Management (`/crew/settings/documents`) — Beta:**
Stub page built in Phase 11.1. Displays "Coming Soon"
state with feature description. Linked from the
Settings hub with a "Beta" badge. Full system
(upload/swap consent form PDF, one active per type,
landing page link auto-updates using P-DC pattern)
deferred to Phase 15 (Beta).

**Check-In System (Beta — stub in Alpha):**
Admin tool stub page built in Phase 11.1 at
`/crew/tools/checkin`. "Check-In" sidebar nav link
added (Phase 11.1 — appears after QR Generator in the
sidebar). Displays "Coming Soon" state with feature
description. Full system (per-show-date check-in QR
from show detail, public check-in page at
`/checkin/[token]`, email/phone entry → auto-mark
attendance) deferred to Phase 14 (Beta).

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

**Migration 014 status:** Applied — `014_normalize_phone.sql`
(ADMIN.21) Data-only migration — no schema changes.
Normalizes existing phone values to digits-only:
`UPDATE volunteers SET phone = regexp_replace(phone,
'[^0-9]', '', 'g') WHERE phone != regexp_replace(...)`
and the equivalent for `slot_claims.volunteer_phone`.
Both updates are idempotent (WHERE guard ensures rows
already normalized are not touched).

**Migration 015 status:** Applied —
`015_show_date_thank_you.sql` (12.4).
Adds `thank_you_sent_at timestamptz` (nullable, no
default) to `show_dates`. Used by the post-show
thank-you cron to track whether a thank-you email
has been sent for each show date.

**Migration 016 status:** Applied — `016_locations_show_type_migration.sql` (CAL.1). Creates `locations` table with 5 seeded locations (Mainstage, Mainstage Lobby, Green Room, Studio X, Studio X Office) and their display colors. Removes `shows.show_type` text CHECK constraint column. Adds `shows.location_id uuid NOT NULL REFERENCES locations(id)`. Backfills existing show rows to matching location IDs. Adds `idx_shows_location_id`. RLS on locations: public SELECT (anon + authenticated), super_admin_all FOR ALL.

**Migration 017 status:** Applied — `017_calendar_schema.sql` (CAL.2). Creates four new tables: `rehearsal_batches`, `calendar_events` (with `handle_updated_at()` trigger), `calendar_event_contacts`, `show_date_buffer`. Extends `admin_users`: adds `calendar_editor boolean NOT NULL DEFAULT false`; extends role CHECK constraint to include `'production'`. RLS enabled on all four new tables (10 policies total).

**Migration 018 status:** Applied — `018_calendar_submitted_by_nullable.sql` (CAL.3). Makes `calendar_events.submitted_by` nullable (show-sourced events have no individual submitter). Adds UNIQUE constraint `calendar_events_source_show_date_id_unique` on `source_show_date_id` — required for the upsert conflict anchor in `syncShowDateToCalendar()`.

**Migration 019 status:** Applied — `019_show_dates_end_time.sql` (CAL.4a). Adds `end_time time without time zone` (nullable, no default) to `show_dates`. Null = end time not yet set; sync utility falls back to startTime + 3 hours when null.

**Migration 020 status:** Applied — `020_locations_default_hours.sql` (ADMIN.25). Adds `default_hours numeric(4,2)` (nullable, no default) to `locations`. When set, takes precedence over the `app_settings` name→bucket fallback in `getLocationHoursBucket()`. Per-location UI planned for CAL.8.

**Migration 021 status:** Applied — `021_admin_calendar_token.sql` (CAL.7). Adds `calendar_subscription_token uuid NOT NULL DEFAULT gen_random_uuid()` to `admin_users`. Creates UNIQUE index `idx_admin_users_calendar_token` on `admin_users(calendar_subscription_token)`. Gives every existing admin a unique subscription token on migration; new admins get one via the DEFAULT. Used by the iCalendar admin feed route (`/api/calendar/feed.ics`) to authenticate calendar app subscription requests without a session cookie.

**Migration 022 status:** Applied — `022_recurring_events.sql` (CAL.10a). Creates `recurrence_groups` table (series template for recurring calendar events). Adds `recurrence_group_id uuid REFERENCES recurrence_groups(id) ON DELETE SET NULL` to `calendar_events`. Creates index `idx_calendar_events_recurrence_group` on `calendar_events(recurrence_group_id)`. RLS on `recurrence_groups`: authenticated SELECT + INSERT, super_admin_all FOR ALL (using is_admin()).

**Next migration:** 023

Historical note: the email_log_recipients volunteer_id
index (`idx_email_log_recipients_volunteer_id`) was
confirmed pre-existing on the live DB during ADMIN.24
pre-work. No migration file was needed or created for
it.

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
requires_service_hours boolean NOT NULL DEFAULT false
-- Constraint: UNIQUE (email), UNIQUE (phone)
-- NOTE: phone stored as digits-only (no formatting)
-- as of Migration 014 (ADMIN.21). All write paths
-- normalize via normalizePhone() from
-- lib/utils/phone.ts before insert/update/compare.
-- Display via formatPhone() in admin UI.
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

### locations
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
name             text NOT NULL
color            text NOT NULL
sort_order       integer NOT NULL DEFAULT 0
is_active        boolean NOT NULL DEFAULT true
default_hours    numeric(4,2)
created_at       timestamptz NOT NULL DEFAULT now()
-- Seeded with 5 locations: Mainstage (#293994),
-- Mainstage Lobby (#0D9488), Green Room (#15803D),
-- Studio X (#F26522), Studio X Office (#7C3AED)
-- RLS: public_select_locations (SELECT, anon +
--   authenticated), super_admin_all (FOR ALL,
--   authenticated, is_super_admin())
-- Migration 016 (016_locations_show_type_migration.sql)
-- Migration 020 adds default_hours (nullable).
-- Per-location default hours UI planned CAL.8.
```

### shows
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
season_id        uuid REFERENCES seasons(id)
name             text NOT NULL
location_id      uuid NOT NULL REFERENCES locations(id)
description      text
status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','live','past','archived'))
volunteer_instructions text
check_in_token   uuid DEFAULT gen_random_uuid()
default_hours    numeric(4,2)
notifications_sent_at timestamptz
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_shows_season_id, idx_shows_status
-- INDEX: idx_shows_location_id (Migration 016)
-- Trigger: trg_shows_updated_at
-- NOTE: show_type column removed in Migration 016
-- (CAL.1). Replaced by location_id FK to locations
-- table. Show form loads locations from DB (R4).
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
end_time         time without time zone
created_at       timestamptz NOT NULL DEFAULT now()
thank_you_sent_at timestamptz
-- INDEX: idx_show_dates_show_id
-- NOTE: end_time added in Migration 019 (CAL.4a).
-- Nullable — null = end time not yet set. When null,
-- syncShowDateToCalendar() uses startTime + 3 hours
-- as a fallback for calendar_events.end_time. Admin
-- show detail and public pages display as range
-- ('7:30 PM – 10:00 PM') when present, single time
-- when null. Buffer time stored separately in
-- show_date_buffer (not in this table).
-- NOTE: thank_you_sent_at added in Migration 015 (12.4).
-- Null = post-show thank-you email not yet sent.
-- Non-null = timestamp when it was sent. The thank-you
-- cron checks IS NULL to avoid re-sending on subsequent
-- daily runs.
```

### show_date_buffer
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
show_date_id     uuid NOT NULL UNIQUE
  REFERENCES show_dates(id) ON DELETE CASCADE
buffer_before_minutes integer NOT NULL DEFAULT 0
buffer_after_minutes  integer NOT NULL DEFAULT 0
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_show_date_buffer_show_date_id
-- UNIQUE on show_date_id — one buffer record per date.
-- Used for conflict detection via hasConflictWithBuffer()
-- in lib/utils/calendar-conflict.ts. Buffer windows
-- displayed on the weekly room-booking grid as a
-- lighter shade of the location color. Not part of
-- the public performance time display.
-- RLS: authenticated SELECT, super_admin_all write.
-- Migration 017 (017_calendar_schema.sql)
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
-- NOTE: stored as digits-only as of Migration 014
-- (ADMIN.21). Same normalization as volunteers.phone.
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
-- INDEX: idx_attendance_slot_claim_id (confirmed present
--   on live DB in 12.2a audit — not in original Brief §9)
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
role             text NOT NULL CHECK (role IN (
  'super_admin','editor','viewer','production'
))
is_active        boolean NOT NULL DEFAULT true
calendar_editor  boolean NOT NULL DEFAULT false
calendar_subscription_token uuid NOT NULL
  DEFAULT gen_random_uuid()
last_login               timestamptz
activity_cleared_at      timestamptz
created_at               timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_admin_users_email
-- NOTE: activity_cleared_at added in Migration 007.
-- Null = never cleared; all feed events treated
-- as new until first clear.
-- NOTE: 'production' added to role CHECK in Migration
--   017 (CAL.2). Production accounts have calendar-only
--   access — see §7 roles table.
-- NOTE: calendar_editor boolean added in Migration 017
--   (CAL.2). Default false. When true on an editor or
--   viewer account: direct write access to calendar
--   (events approved immediately). DB CHECK constraint
--   enforces calendar_editor = false on super_admin
--   and production accounts. UI toggle built CAL.6 on
--   /crew/settings/users (Super Admin only) via
--   toggleCalendarEditor() in lib/actions/users.ts.
--   Logged as user.calendar_editor_change in audit_log.
-- NOTE: calendar_subscription_token added Migration 021
--   (CAL.7). uuid NOT NULL DEFAULT gen_random_uuid().
--   UNIQUE index idx_admin_users_calendar_token.
--   Used by /api/calendar/feed.ics to authenticate
--   calendar app subscriptions without a session cookie.
--   Rotate via rotateCalendarToken() server action.
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

### rehearsal_batches
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
title            text NOT NULL
submitted_by     uuid NOT NULL REFERENCES admin_users(id)
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_rehearsal_batches_submitted_by
-- Groups a bulk rehearsal schedule submission so the
-- pending queue can display and approve/skip all dates
-- in a batch together. Each calendar_events row in the
-- batch carries rehearsal_batch_id FK back to this
-- table. Single events have rehearsal_batch_id = null.
-- RLS: authenticated SELECT/INSERT; super_admin write.
-- Migration 017 (017_calendar_schema.sql)
```

### calendar_events
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
title            text NOT NULL
event_type       text NOT NULL CHECK (event_type IN (
  'performance','rehearsal','teaching',
  'meeting','event','rental','other'
))
custom_type_label text
location_id      uuid REFERENCES locations(id)
start_time       timestamptz NOT NULL
end_time         timestamptz NOT NULL
description      text
requirements     text
status           text NOT NULL DEFAULT 'pending' CHECK (
  status IN ('pending','approved','cancelled')
)
source           text NOT NULL DEFAULT 'manual' CHECK (
  source IN ('show','manual')
)
source_show_date_id uuid REFERENCES show_dates(id)
  ON DELETE CASCADE
rehearsal_batch_id  uuid REFERENCES rehearsal_batches(id)
  ON DELETE SET NULL
recurrence_group_id uuid REFERENCES recurrence_groups(id)
  ON DELETE SET NULL
submitted_by     uuid REFERENCES admin_users(id)
approved_by      uuid REFERENCES admin_users(id)
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_calendar_events_location_id
-- INDEX: idx_calendar_events_start_time
-- INDEX: idx_calendar_events_status
-- INDEX: idx_calendar_events_source_show_date_id
-- INDEX: idx_calendar_events_submitted_by
-- INDEX: idx_calendar_events_rehearsal_batch_id
-- INDEX: idx_calendar_events_recurrence_group
--   (idx_calendar_events_recurrence_group_id on
--   calendar_events.recurrence_group_id — Migration 022)
-- NOTE: recurrence_group_id added Migration 022
--   (CAL.10a). Nullable, ON DELETE SET NULL. When set:
--   this event is one occurrence in a recurring series.
--   Editing with scope='this' sets it to null (detaches
--   from series). See recurrence_groups table.
-- UNIQUE: calendar_events_source_show_date_id_unique
--   on source_show_date_id (Migration 018) —
--   required upsert conflict anchor for
--   syncShowDateToCalendar().
-- Trigger: handle_updated_at() on updated_at.
-- NOTE: submitted_by is nullable (Migration 018) —
--   show-sourced events (source='show') have no
--   individual submitter; submitted_by = null.
-- NOTE: performance events (event_type='performance')
--   are auto-generated from shows via
--   syncShowDateToCalendar() — never created manually.
--   Rental type restricted to Super Admin in UI.
-- RLS: authenticated SELECT all; authenticated INSERT;
--   super_admin UPDATE/DELETE.
-- Migration 017 (017_calendar_schema.sql)
```

### calendar_event_contacts
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
calendar_event_id uuid NOT NULL
  REFERENCES calendar_events(id) ON DELETE CASCADE
name             text NOT NULL
phone            text NOT NULL
sort_order       integer NOT NULL DEFAULT 0
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_calendar_event_contacts_event_id
-- Phone stored as digits-only (normalizePhone() applied
-- in createCalendarEvent() and createRehearsalBatch()
-- before insert, per ADMIN.21 pattern).
-- RLS: authenticated all operations.
-- Migration 017 (017_calendar_schema.sql)
```

### recurrence_groups
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
title            text NOT NULL
event_type       text NOT NULL CHECK (event_type IN (
  'performance','rehearsal','teaching',
  'meeting','event','rental','other'
))
custom_type_label text
location_id      uuid REFERENCES locations(id)
start_time       time NOT NULL
end_time         time NOT NULL
description      text
requirements     text
frequency        text NOT NULL CHECK (
  frequency IN ('weekly','biweekly','monthly')
)
series_start_date date NOT NULL
series_end_date   date
status           text NOT NULL DEFAULT 'active' CHECK (
  status IN ('active','cancelled')
)
submitted_by     uuid NOT NULL
  REFERENCES admin_users(id)
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_recurrence_groups_submitted_by
-- RLS: authenticated_select_recurrence_groups
--   (SELECT, authenticated), authenticated_insert_
--   recurrence_groups (INSERT, authenticated),
--   super_admin_modify_recurrence_groups (ALL,
--   authenticated, is_admin()).
-- Series template: each occurrence is a separate
--   calendar_events row with recurrence_group_id FK.
-- frequency values: 'weekly' (every 7 days),
--   'biweekly' (every 14 days), 'monthly' (same day
--   of month, date-fns addMonths() — handles month-
--   end correctly: Jan 31 + 1mo → Feb 28/29).
-- series_end_date null = indefinite (capped at 12
--   months forward by generateOccurrenceDates()).
-- status 'cancelled': set when cancel scope='all'.
--   Individual occurrence cancels use
--   calendar_events.status = 'cancelled' instead.
-- Migration 022 (022_recurring_events.sql)
```

### email_log
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
sent_by          uuid REFERENCES admin_users(id)
sent_at          timestamptz NOT NULL DEFAULT now()
subject          text NOT NULL
body_preview     text
-- Plain-text preview of email body (first 150 chars).
-- For TipTap-sourced blast emails: HTML tags stripped
-- before truncation (.replace(/<[^>]+>/g,'').slice(0,150)).
-- All system-triggered sends populate this field as
-- of Phase 13.1. Pre-13.1 entries may have null here.
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
-- INDEX: idx_email_log_recipients_volunteer_id
-- (pre-existed on live DB prior to ADMIN.24;
-- Migration 015 was not needed or created)
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

Runtime-added key (not seeded in Migration 001):
```
dashboard_season_id → uuid | null
```

Added by `setPinnedSeason()` via ON CONFLICT upsert
when a Super Admin first selects a season on the
dashboard. Null or absent = fallback to all live shows.

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
30BN-ADMIN.20  ✓ Dashboard Season at a Glance,
                 Quick Stats, Super Admin season
                 selector (dashboard_season_id in
                 app_settings), PDF export filter fix
                 (milestoneTier + service_hours both
                 now honored). lib/actions/settings.ts
                 created with setPinnedSeason().
                 Components: QuickStats.tsx,
                 SeasonAtAGlance.tsx, SeasonSelector.tsx.
30BN-ADMIN.21  ✓ Phone normalization — Migration 014
                 (digits-only storage in volunteers.phone
                 and slot_claims.volunteer_phone),
                 lib/utils/phone.ts (normalizePhone() +
                 formatPhone()), all write paths updated
                 (submitVolunteerForm, updateVolunteerInfo,
                 submitClaim, updateVolunteer, both
                 lookupVolunteer functions). Admin display
                 formatted (list column + profile view).
30BN-ADMIN.22  ✓ Post-show reporting — "Report" tab on
                 show detail (status = 'past' only).
                 lib/data/showReport.ts +
                 getPostShowReportData(). Component:
                 PostShowReport.tsx. Types added to
                 types/show.ts.
30BN-ADMIN.23  ✓ Bulk email from show detail —
                 "Message Volunteers (N)" on Overview tab
                 (Editor/Super Admin only). Deduplication
                 by lowercased email. sendShowBulkEmail()
                 + buildShowBulkEmailPayload() added.
                 Logs to email_log (recipient_type =
                 'category', recipient_filter =
                 'show:{showId}') + email_log_recipients.
                 Component: BulkEmailSection.tsx.
30BN-ADMIN.24  ✓ Communication history on volunteer
                 profile — collapsible section below
                 Milestone History, all roles. Fetches
                 email_log_recipients JOIN email_log.
                 Component: CommunicationHistory.tsx.
                 Type: CommunicationHistoryEntry in
                 types/volunteer.ts. Migration 015
                 skipped (index already existed).
30BN-DOC.17    ✓ Brief Update v2.0 (this prompt —
                 Phases 11.1, 11.2, ADMIN.20–24,
                 comprehensive corrections)
30BN-DOC.18    ✓ Deferred Verification Document v5
                 (Phase 11 + ADMIN.20–24 items added,
                 89 new verification items)
30BN-DOC.19    ✓ Process Update v2.0 (Phase 11,
                 ADMIN.20–24, comprehensive corrections)
30BN-DOC.20    ✓ Header version sync (Brief + Process
                 headers updated to v2.0)
30BN-12.1      ✓ (see Phase 12 above)
30BN-12.2a     ✓ (see Phase 12 above)
30BN-12.2b     ✓ (see Phase 12 above)
30BN-12.2c     ✓ (see Phase 12 above)
30BN-12.3      ✓ (see Phase 12 above)
30BN-12.4      ✓ (see Phase 12 above)
30BN-DOC.21    ✓ Brief Update v2.1 (Phase 12 complete,
                 Alpha build complete — this prompt)
30BN-ADMIN.25  ✓ Deferred item sweep (Q1/Q4/Q3+Q6/Q5):
                 getLocationHoursBucket() updated to use
                 locations.default_hours as primary path,
                 app_settings bucket map as fallback only
                 (Migration 020). Buffer NaN Zod preprocess
                 fix (z.preprocess NaN→0). End time range
                 display on cancel page + reminder cron.
                 Season filter enabled in CalendarFilterBar
                 + server-side fetch in calendar/page.tsx.
30BN-CAL.1     ✓ show_type → location_id migration
                 (Migration 016). Full audit of 19 files.
                 locations table created + seeded (5 rows).
                 ShowType union removed; Location type
                 added. Show form loads locations from DB.
                 getLocationHoursBucket() added to
                 lib/utils/showDisplay.ts as temporary
                 name→bucket fallback (later superseded
                 by ADMIN.25 primary lookup).
30BN-CAL.2     ✓ Calendar schema foundation (Migration
                 017): rehearsal_batches, calendar_events,
                 calendar_event_contacts, show_date_buffer.
                 admin_users: production role + calendar_
                 editor boolean. Middleware production
                 route restriction. Sidebar Calendar nav
                 link (all roles). Login + OAuth redirect
                 for production role. types/admin.ts
                 created as shared AdminRole source;
                 lib/auth.ts re-exports it.
30BN-CAL.3     ✓ Show-to-calendar auto-sync + conflict
                 detection. Migration 018 (submitted_by
                 nullable + source_show_date_id unique
                 constraint). syncShowDateToCalendar() in
                 lib/actions/calendar-sync.ts (DST-safe
                 CT→UTC, 3hr fallback when end_time null).
                 hasConflict() + hasConflictWithBuffer()
                 in lib/utils/calendar-conflict.ts.
                 Buffer time UI on DateRow (show_date_buffer
                 upsert). Google OAuth callback production
                 role redirect fix.
30BN-CAL.4a    ✓ end_time on show_dates (Migration 019).
                 DateRow End Time field (optional, no
                 required indicator). Time range display
                 ("7:30 PM – 10:00 PM") on admin show
                 detail (Volunteers tab + Dates tab),
                 public /shows/[id], /callboard.
                 syncShowDateToCalendar() updated to use
                 end_time when present. Edge case guard:
                 end_time ≤ show_time falls back to 3hr
                 default with console.warn.
30BN-CAL.4b    ✓ Full /crew/calendar page: month view
                 (35/42-day grid, 3-chip limit + overflow),
                 weekly room-booking grid (absolute-
                 positioned event + buffer blocks, current-
                 time indicator), agenda view (90-day,
                 date-grouped). Filter bar (location +
                 type client-side; season server re-fetch).
                 Location legend (CalendarLegend.tsx).
                 Day detail panel (booked + available
                 windows via getAvailableWindows()).
                 lib/utils/calendar-availability.ts created
                 (UTC-anchored grid helpers).
30BN-CAL.5a    ✓ Event creation + submission forms.
                 CalendarEventForm (role-adaptive: type
                 list, location required/optional, conflict
                 check + override for direct-create, contacts
                 useFieldArray, dark: variants). lib/actions/
                 calendar.ts created: checkEventConflict(),
                 createCalendarEvent(), updateCalendarEvent().
                 lib/validations/calendar.ts created:
                 calendarEventSchema (client) +
                 calendarEventSubmitSchema (server, cross-
                 field end > start). "Add Event"/"Submit
                 Request" dropdown in CalendarShell. Edit
                 button on day panel (Super Admin only).
30BN-CAL.5b    ✓ Seed data (8 calendar_events). Calendar-
                 Legend wired. CalendarShell header: action
                 dropdown (Single Event / Rehearsal
                 Schedule), Pending Requests link + badge,
                 Book Space button. rehearsalBatchSchema
                 added. New server actions: createRehearsal-
                 Batch(), approveCalendarEvent(), approveBatch
                 (), cancelCalendarEvent(), findAvailableSlots
                 (). CalendarBulkRehearsalForm (default
                 times, per-date override, contacts).
                 Pending queue at /crew/calendar/pending +
                 PendingQueueClient. CalendarBookSpacePanel
                 (left panel, pre-fills event form).
                 calendarEditor flag fully wired in
                 createCalendarEvent().
30BN-CAL.5b-AUDIT ✓ Post-build read-only audit (84 items
                 checked, 60 PASS, 17 PARTIAL, 7 FAIL).
                 Identified 7 items requiring fix prompt.
30BN-CAL.5b-FIX ✓ 6 fixes from audit: CalendarLegend
                 "Locations:" label; initialDate prop on
                 bulk form + mount useEffect pre-populate;
                 defaultStartTime/defaultEndTime state +
                 pre-fill on add + auto-sort (manual sort
                 button removed); initialConflicts +
                 adminRole props on PendingQueueClient +
                 conflictStatus state + handleLocationChange
                 with live checkEventConflict + conflict
                 column in batch table + individual cards;
                 pending/page.tsx hasConflict pre-check
                 loop; findAvailableSlots results → slots.
30BN-CAL.5b-FIX2 ✓ handleApproveSingle() fallback:
                 accepts fallbackLocationId param, resolves
                 locationSelections[eventId] ??
                 fallbackLocationId ?? ''. Individual event
                 Approve button disabled condition updated.
30BN-DOC.25a   ✓ Brief Update v3.0 Part A (§1, §2, §7,
                 §8): current phase, public surfaces,
                 Production role + Calendar Editor in
                 terminology, roles table updated,
                 calendar_editor flag documented, show
                 type → location in show management,
                 end time + buffer time in show dates,
                 full Master Calendar section added,
                 General Defaults fallback note updated,
                 Location Management card added to settings.
30BN-DOC.26    ✓ Process Update v3.0 (Phase CAL
                 active through CAL.5b — §7 client
                 patterns, §8 commit-before-build-
                 report, §10/§11 calendar checks,
                 §14 five new process rules)
30BN-DOC.27    ✓ Deferred Verifications v7 (CAL.1–
                 CAL.5b-FIX2 items — 110 new items,
                 Quick Reference + Seed Data Cleanup
                 updated, metadata relocated to end)
30BN-CAL.6     ✓ calendar_editor toggle on user
                 management page. toggleCalendar
                 Editor() server action +
                 user.calendar_editor_change audit
                 type. Production row type fix
                 (ROLE_BADGE['production'] gap).
                 Batch Approve fallback fix (Q8
                 from CAL.5b-FIX2).
30BN-CAL.7     ✓ Public /calendar page + iCal
                 admin subscription feed (Migration
                 021: calendar_subscription_token;
                 /api/calendar/feed.ics;
                 CalendarExportModal.tsx;
                 rotateCalendarToken()). Volunteer
                 slot-claim .ics (/api/calendar/
                 claim.ics). lib/utils/ical.ts.
                 sendSlotClaimEmail() +
                 sendWaitlistPromotionEmail()
                 calendar links. Call Board claim
                 history calendar links. "View
                 Calendar" links on / + /shows.
30BN-CAL.8     ✓ Location Management settings
                 (/crew/settings/locations).
                 createLocation(), updateLocation(),
                 reorderLocation(), toggleLocation
                 Active() in lib/actions/settings.ts.
                 location.* AuditAction types.
                 General Defaults fallback note +
                 link. Batch location conflict
                 check loop (batchConflictChecking
                 state, Approve All disabled).
30BN-CAL.9     ✓ Unified week grid — Unified
                 WeekGrid.tsx (column-splitting
                 algorithm, buffer blocks, current-
                 time indicator). WeekAgendaView
                 .tsx (mobile). CalendarWeekView
                 .tsx rewritten. Toggle removed.
                 Mobile: ⋯ More header menu, bottom
                 sheet forms, flex-col pending rows.
                 lib/utils/calendar-layout.ts
                 (computeColumnLayout(), compute
                 EventPosition(), EventWithLayout).
30BN-CAL.10a   ✓ Recurring events foundation.
                 Migration 022 (recurrence_groups
                 + calendar_events.recurrence_group
                 _id, RLS). lib/utils/calendar-
                 recurrence.ts (generate
                 OccurrenceDates(), describe
                 Recurrence() — pure, client-safe).
                 recurringEventSchema. RecurrenceGroup
                 types in types/calendar.ts.
                 createRecurringEvent(), edit
                 RecurringOccurrence(), cancel
                 RecurringOccurrence() in lib/
                 actions/calendar.ts.
30BN-CAL.10b   ✓ Recurring events creation UI.
                 CalendarRecurringEventForm.tsx
                 (live preview, frequency radio,
                 role-adaptive). RecurrenceScopePicker
                 .tsx (edit/cancel scope modal,
                 mobile bottom sheet). CalendarShell:
                 third dropdown, scope picker state
                 + handlers + editScope.
                 CalendarEventForm: editScope prop +
                 editRecurringOccurrence() routing.
30BN-CAL.10c   ✓ Recurring events display + queue.
                 CalendarDayPanel: scope picker
                 trigger, Cancel event button,
                 "↻ Part of a recurring series"
                 note. CalendarEventChip: ↻ overlay
                 (compact) + label (full mode).
                 PendingQueueClient: Recurring
                 Events section + trueIndividual
                 Events filter. pending/page.tsx:
                 recurrence_groups fetch.
30BN-ADMIN.26  ✓ CAL phase cleanup. users.ts:
                 deactivateUser/reactivateUser/
                 changeRole migrated to
                 getServerClient() + revalidatePath;
                 createUser() keeps getAdminClient()
                 for auth.admin.* calls (sanctioned).
                 UsersTable.tsx: router.refresh()
                 replaces window.location.href;
                 setIsSubmitting(false) bug fixed.
                 changeRole() Production guard.
                 sendWaitlistPromotionEmail() +
                 claimToken + calendar link.
                 claim.ics Content-Disposition →
                 fixed filename "volunteer-call
                 .ics". CalendarWeekGrid.tsx deleted.
30BN-DOC.28a   ✓ Brief Update v3.1 Part A (§1,
                 §2, §7, §8): phase updated (CAL
                 complete), terminology duplicate
                 removed, calendar_editor note +
                 User Management ADMIN.26/CAL.6,
                 week view unified grid, mobile
                 optimization note, dropdown three
                 options, day panel recurring
                 features, chip ↻ indicator anchor,
                 public /calendar built, iCalendar
                 export section, Location Management
                 built + full spec, Recurring Events
                 section, Key files updated, pending
                 queue three sections.
30BN-DOC.29    ✓ Process Update v3.1 (Phase CAL
                 complete — §7 iCalendar + createUser
                 exceptions + Content-Disposition
                 rule; §11 three new checklist items;
                 §13 Phase CAL complete + prompt log
                 through ADMIN.26; §14 two new rules)
30BN-DOC.30    ✓ Deferred Verifications v8 (CAL.6–
                 CAL.10c + ADMIN.26 items — 115 new
                 items, Quick Reference expanded,
                 Seed Data Cleanup + recurrence_groups
                 cleanup, metadata block relocated
                 to document end)
30BN-13.1      ✓ Transactional email logging gap closed.
                 logEmailSent() helper (lib/email.ts,
                 internal). 11 email paths now log to
                 email_log + email_log_recipients.
                 recipient_filter tags added to 7 pre-
                 existing inserts. Email Activity page
                 (/crew/settings/email-activity, 3 tabs,
                 Super Admin only). EmailActivity card
                 added to Settings hub.
30BN-13.2      ✓ Branded HTML email templates. All 17
                 send functions converted from plain text.
                 buildEmailHtml() + buildCtaButton()
                 helpers (internal). All volunteer CTAs
                 → /callboard. Dead browseShowsButtonHtml()
                 removed.
30BN-13.3a     ✓ Blast composer backend + UI shell.
                 lib/actions/blast.ts (searchVolunteers,
                 previewBlast, sendBlastEmail,
                 resolveBlastRecipients). BlastComposer
                 .tsx (compose→confirm→sent). /crew/
                 communication stub replaced.
30BN-13.3b     ✓ TipTap rich text editor. @tiptap/react
                 @tiptap/pm @tiptap/starter-kit v3.28.0.
                 immediatelyRender:false. Toolbar: Bold/
                 Italic/Bullet/Ordered lists. editor
                 .getHTML()/.getText() replace body state.
30BN-13.4a     ✓ Logging cleanup + sanitization.
                 sendUpdateLinkEmail() now logs (volunteerId
                 param added). sendPendingRegistration
                 Email() now logs inline (admin-registration
                 .ts). body_preview added to 5 pre-existing
                 inserts. 10× #555 → #555555. sanitize-html
                 installed; sanitizeHtml() in sendBlast
                 Email().
30BN-13.4b     ✓ Mobile optimization. BlastComposer:
                 tab bar stacks on mobile, confirm row
                 flex-wrap. email-activity: tab bar
                 flex-wrap, mobile card layout below sm.
                 AboutSystemEmails: clean.
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

**30BN-11.1 — Beta Stub Pages & Custom 404 ✓**
- Three admin stub pages (Server Components, dark: variants, R20-compliant paths): `/crew/communication`, `/crew/tools/checkin`, `/crew/settings/documents`. Each has a "Coming Soon" badge, centered lucide-react icon, and a one-sentence feature description. No data fetching, no mutations.
- "Check-In" sidebar nav link added to `components/crew/Sidebar.tsx` immediately after QR Generator (ScanLine icon, all roles, isActivePath() active state).
- `app/not-found.tsx` — branded Server Component 404 page. Light-mode only (no dark: variants — public-facing). 30 By Ninety logo, "Page Not Found" heading, two `next/link` navigation links: `/` and `/crew/dashboard`. Note: spec originally said plain `<a>` tags; `next/link` was substituted to maintain zero-error lint baseline (`@next/next/no-html-link-for-pages` rule). R19's concern (Button/cva tailwind-merge) does not apply to Link.
- `app/error.tsx` — branded Client Component ('use client' required by Next.js). Light-mode only. AlertTriangle icon (text-orange), "Something went wrong" heading, "Try again" plain `<button>` (calls `reset()`), "Go home" `next/link`. Error message/digest never displayed to user.

**30BN-11.2 — App Settings & Announcement Banner ✓**
- `/crew/settings` hub replaced — placeholder from Phase 3 replaced with full 8-card grid using LinkedCard/LockedCard role gating. See §8 App Settings for complete spec.
- `/crew/settings/announcement` — full implementation. See §8 Announcement Banner.
- `/crew/settings/hearing-options` — full implementation. See §8 App Settings.
- `/crew/settings/signup-form` — full implementation. See §8 App Settings.
- `/crew/settings/general` — full implementation. See §8 App Settings.
- `lib/actions/settings.ts` — server actions added: `saveAnnouncementBanner()`, `saveSignupFormToggles()`, `saveDefaultHours()`, `saveDefaultReplyTo()`, `addHearingOption()`, `updateHearingOption()`, `reorderHearingOption()`, `toggleHearingOptionActive()`. `setPinnedSeason()` (ADMIN.20) preserved.
- New components: `components/crew/settings/AnnouncementBannerForm.tsx`, `HearingOptionsManager.tsx`, `SignupFormSettings.tsx`, `GeneralSettings.tsx`.
- Phase 11 AuditAction types (`settings.update`, `hearing_options.*`) now have call sites wired.

---

### Phase 12 — Polish, Mobile & Performance

**Completed admin prompts (since Phase 5):**
- `30BN-ADMIN.13` ✓ Security fix — REVOKE EXECUTE on `get_activity_feed()`
  from PUBLIC and anon roles (Migration 009). Same
  vulnerability class as caught and fixed in 5.3 for
  `get_show_notification_targets()`. See R28.

**Deferred polish items (carry to Beta):**
- Waitlist renumbering in `cancelClaim()` — sequential
  JS updates. Postgres function candidate if concurrent
  cancellations become a concern at scale.
- `slot_claims.show_date_id` denormalization — schema
  review deferred to Beta.
- Phone search: volunteer list search uses
  `phone.ilike.%term%` against raw search input. With
  phone stored digits-only, formatted searches
  (e.g. "985-555-1234") won't match. Beta fix candidate.
- Reminder cron (`app/api/cron/reminders/route.ts`)
  uses raw UTC Date math rather than the DST-safe CT
  approach used in the thank-you cron and QuickStats.
  Low practical impact (reminder window is forgiving)
  but inconsistent. Beta fix candidate.

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

**Completed since v1.9 (removed from deferred list):**
- ~~Phone normalization across signup/update/claims~~
  — Fixed in ADMIN.21 (Migration 014 + lib/utils/phone.ts).
- ~~Dashboard "Season at a Glance" + "Quick Stats"~~
  — Built in ADMIN.20.
- ~~PDF export filter gap (milestoneTier, service_hours)~~
  — Fixed in ADMIN.20.
- ~~Dark: profile header/status badge gap~~ — Fixed ADMIN.19.

**Completed since v2.0 (removed from deferred list):**
- ~~Mobile sidebar (collapsible/hamburger)~~ — Built
  in 12.1 (MobileSidebarContext, hamburger in TopBar,
  slide-in drawer with overlay + auto-close).
- ~~window.location.href in CategoriesTable.tsx~~ —
  Fixed in 12.1 (router.refresh() pattern).
- ~~Dark: variant on VolunteersTable.tsx status badge~~
  — Fixed in 12.1.
- ~~opportunity_submissions.volunteer_phone~~ —
  normalizePhone() confirmed applied in 12.1; live DB
  data confirmed clean.

**Phase 12 ✓ Complete**

**30BN-12.1 ✓** Mobile optimization: responsive audit
of 7 public pages (375/390/768px), 2 real tap-target
fixes (ShowDatePicker, CallboardLookupForm). Admin
tablet audit: spec-compliant, no changes needed. All 6
empty states confirmed present. Honeypot spam prevention
on all 4 public form surfaces (uncontrolled ref pattern).
Mobile sidebar (MobileSidebarContext + hamburger +
drawer). CategoriesTable router.refresh() fix.
VolunteersTable dark: status badge fix.
opportunity_submissions phone normalization confirmed
clean. TopBar phone-width responsive collapse.

**30BN-12.2a ✓** Performance/security audit (Phase A
read-only + Phase B targeted fixes): dashboard
Promise.all parallelization (5 independent queries →
one batch, HIGH impact). Email template escaping gap
fixed (categoryNames in sendVolunteerConfirmationEmail).
R18 fix: 4× ?? null → || null in app/actions/volunteer.ts.
Length caps added to sendShowBulkEmail() (subject 200,
body 10000). Index audit: all FK columns confirmed
indexed (idx_attendance_slot_claim_id pre-existing but
undocumented). RLS: all 8 tables confirmed clean.
dangerouslySetInnerHTML: 4 hits, all safe.

**30BN-12.2b ✓** In-app help page at /crew/help. Help
nav link in sidebar. Two-column layout with sticky TOC.
8 sections, 23 subsections, 31 anchor IDs. Tip/Warning
callout patterns. Server Component, boomer-proof plain
English content written in the prompt spec verbatim.

**30BN-12.2c ✓** HelpTooltip shared component (Server
Component, next/link, named export). 16 placements
across Production Crew (of 17 planned — E3 Waitlist
heading fixed in 12.4). Covers: dashboard cards,
volunteer profile (5 locations), show detail (3),
show form (2), volunteer list (1), settings (2).

**30BN-12.3 ✓** Call Board volunteer card per-show
hours breakdown. manualHoursTotal prop replaced with
manualHoursEntries (full entries). Hours summary line
simplified to "[X] hours across [Y] shows." Expandable
section: flat list replaced with show-grouped breakdown
(show name → call sub-rows → per-show total) + "Other
Hours" section for manual entries. show_id added to
CallboardCallHistoryRow type. CallboardManualHoursEntry
type added.

**30BN-12.4 ✓** Automated post-show thank-you email
cron (see §8 Show Management). Waitlist tab "Waitlist"
h2 heading added (E3 fix from 12.2c). Duplicate Editor
Notes heading removed from page.tsx; HelpTooltip moved
to EditorNotes.tsx internal heading (Q1 fix from 12.2c).
Migration 015 applied.

---

## 11. Beta Build — Phases & Prompts (Overview)

*Phase 13 is complete (13.1–13.4b). Phase 14 (Check-In System) is next.*

### Phase CAL — Master Calendar System ✓ Complete

**CAL.1 ✓** show_type → location_id migration.
**CAL.2 ✓** Calendar schema + Production role.
**CAL.3 ✓** Show-to-calendar sync + conflict detection
  + buffer time UI.
**CAL.4a ✓** end_time on show_dates.
**CAL.4b ✓** Full /crew/calendar UI (month, week,
  agenda, legend, day panel, filter bar).
**CAL.5a ✓** Event creation and submission forms.
**CAL.5b ✓** Seed data, bulk rehearsal form, pending
  approval queue, Book Space panel.
**CAL.6 ✓** calendar_editor toggle on user management
  page. Batch Approve button fallback fix.
**CAL.7 ✓** Public /calendar page. iCalendar admin
  subscription feed + volunteer slot-claim .ics.
  CalendarExportModal. Calendar links in emails.
**CAL.8 ✓** Location Management settings page.
  Per-location default_hours UI. General Defaults
  fallback note. Batch location conflict check fix.
**CAL.9 ✓** Unified week grid (UnifiedWeekGrid.tsx,
  column-splitting). Mobile optimization (⋯ More
  header, bottom sheet modals, WeekAgendaView.tsx).
**CAL.10a ✓** Recurring events foundation: Migration
  022, recurrence_groups table, calendar-recurrence
  .ts utility, three new server actions.
**CAL.10b ✓** Recurring events creation UI:
  CalendarRecurringEventForm.tsx (live preview),
  RecurrenceScopePicker.tsx, Shell wiring.
**CAL.10c ✓** Recurring events display + pending
  queue: day panel scope picker, ↻ chip indicator,
  Recurring Events queue section.

### Phase 13 — Email Blast System ✓ Complete

**13.1 ✓** Transactional email logging gap closed across
all email send paths. `logEmailSent()` helper added to
`lib/email.ts` (internal). `email_log` writes added to
11 previously unlogged email functions. `recipient_filter`
tags added to 7 pre-existing log writes. Email Activity
log page built at `/crew/settings/email-activity`
(Super Admin only, three tabs). Email Activity card
added to Settings hub.

**13.2 ✓** Branded HTML email templates — all 17 send
functions in `lib/email.ts` converted from plain text
to table-based inline-style HTML using brand system.
`buildEmailHtml()` shared wrapper + `buildCtaButton()`
helper added (both internal). All volunteer-facing email
CTAs standardized to `/callboard`. Admin-facing CTAs
unchanged. `addToCalendarLinkHtml()` confirmed already
inline-styled. Dead `browseShowsButtonHtml()` removed.

**13.3a ✓** Email blast composer — backend + UI shell.
`lib/actions/blast.ts` created: `searchVolunteers()`,
`previewBlast()`, `sendBlastEmail()`, private
`resolveBlastRecipients()`. `BlastComposer.tsx` created
with full compose → confirm → sent step machine.
`/crew/communication` stub replaced with live composer
page. Plain `<textarea>` placeholder for body field.

**13.3b ✓** TipTap rich text editor integrated into
`BlastComposer.tsx`. `@tiptap/react`, `@tiptap/pm`,
`@tiptap/starter-kit` v3.28.0 installed.
`immediatelyRender: false` (Next.js hydration guard).
Toolbar: Bold, Italic, Bullet List, Ordered List.
Body state replaced by `editor.getHTML()` /
`editor.getText()`. Confirm preview and `email_log`
`body_preview` both use `getText()` (HTML tags stripped).

**13.4a ✓** Logging cleanup + HTML sanitization.
`sendUpdateLinkEmail()` now logs (`trigger:update_link_
request`; `volunteerId` param added + threaded from both
call sites in `app/update/actions.ts`).
`sendPendingRegistrationEmail()` now logs inline in
`lib/actions/admin-registration.ts` (Case B — recipient
list visible at call site; zero-recipient guard added).
`body_preview` added to 5 pre-existing `email_log`
inserts in `claims.ts` (3), `reminders/route.ts` (1);
`submissions.ts` was already populated. 10 shorthand
hex (`#555`) values normalized to `#555555` in
`milestoneEmailContent()`. `sanitize-html` +
`@types/sanitize-html` installed; `sanitizeHtml()`
called on `parsed.data.body` in `sendBlastEmail()`
before payload build.

**13.4b ✓** Mobile optimization for Phase 13 UI surfaces.
`BlastComposer.tsx`: recipient mode tab bar
(`flex flex-col sm:flex-row`, buttons `w-full sm:w-auto`),
confirm button row (`flex-wrap`).
`/crew/settings/email-activity/page.tsx`: tab bar
(`flex-wrap` + `whitespace-nowrap`), log table
hidden below `sm` with mobile card layout above it.
`AboutSystemEmails.tsx`: verified clean, no changes.

**13.4c** — npm vulnerability sweep (pending).

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

### Phase 18 — Additional Alpha Features ✓ Complete
These features were added to Alpha scope and are now built:
- **Volunteer communication history on volunteer profile** ✓ Built ADMIN.24. Collapsible
  section on volunteer profile page; shows emails logged via email_log. See §8 Volunteer
  Profile.
- **Show-level post-show reporting** ✓ Built ADMIN.22. "Report" tab on show detail
  (status = 'past' only). See §8 Show Management.
- **Volunteer self-service hours history on Call Board** ✓ Built 30BN-12.3. Per-show grouped
  breakdown (show name → call sub-rows → per-show total) + "Other Hours" section for manual
  entries. Hours summary simplified to "[X] hours across [Y] shows."
- **Bulk email from show detail** ✓ Built ADMIN.23. "Message Volunteers" on Overview tab.
  See §8 Show Management.

### New Beta features (confirmed)
- **Waitlist → claim promotion notification preferences**
  — volunteer opt-in for notification method (email vs.
  future SMS). Requires infrastructure decision.

~~**Automated thank-you email after a show**~~ —
✓ Built in Alpha (30BN-12.4). See §8 Show Management.

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
| 7 | Mobile PWA sidebar | ✅ Resolved | Built in 30BN-12.1. Hamburger button + slide-in drawer at <768px. MobileSidebarContext pattern. Fixed-column sidebar unchanged at 768px+. |

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

### R31 — Blast Body Uses sanitize-html, Not escapeHtml()
The email blast body originates from TipTap's `getHTML()` output — it is already structured HTML and must NOT be passed through `escapeHtml()`. Doing so would encode all angle brackets and produce literal `&lt;p&gt;` text in the email body. Instead, `sanitizeHtml()` from the `sanitize-html` package is called in `sendBlastEmail()` before the body reaches `buildBlastEmailHtml()`. The sanitizer strips disallowed tags and attributes while preserving the HTML structure. Allowlist: `p`, `strong`, `em`, `ul`, `ol`, `li`, `br`, `h1`, `h2`, `h3`, `blockquote`, `a[href]`. Schemes: `http`, `https`, `mailto` only. Established 13.4a.

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
*v1.8 (July 2026 — Phases 8–10 complete, ADMIN.15–19: see previous entry — v1.8 was applied after v1.9 in document history; ordering preserved as-is for audit trail integrity)*
*v2.0 (July 2026 — Alpha feature-complete: §1 current phase updated (11 complete, 12 pending); §7 Editor email updated; §8 Dashboard rewritten (ADMIN.20 complete); §8 Volunteers phone display + PDF filter fix noted; §8 Volunteer Profile stale audit bullet removed, Communication History added (ADMIN.24), phone display note added; §8 Show Management Report tab + post-show report (ADMIN.22) + bulk email (ADMIN.23) documented; §8 Announcement Banner marked built; §8 App Settings expanded to full spec (11.2); §8 Communication/Check-In/Document Management stub status updated (11.1); §9 Migration 014 status + next migration updated; §9 volunteers + slot_claims phone normalization notes; §9 email_log_recipients volunteer_id index noted; §9 app_settings dashboard_season_id runtime key noted; §10 Phase 11.1 and 11.2 marked complete; §10 Phase 12 deferred list updated (3 items completed, 2 new gaps noted); §10 ADMIN.20–24 + DOC.17 added to prompt log; §11 Phase 18 items marked complete; DOC.17 logged)*
*v2.1 (July 2026 — Alpha build complete: §1 phase
updated (complete); §3 MobileSidebarContext pattern
added; §7 Login Google SSO stale line corrected; §8
Call Board volunteer card updated (12.3 hours summary
+ grouped breakdown); §8 Admin mobile sidebar marked
built (12.1); §8 honeypot noted on all 4 public form
surfaces (12.1); §8 help page + HelpTooltip system
documented (12.2b/c); §8 automated thank-you email
documented (12.4); §8 category management drag-and-drop
removed from reorder description; §9 show_dates
thank_you_sent_at column added (Migration 015); §9
attendance slot_claim_id index noted; §9 Migration 015
status + next migration 016; §10 Phase 12 deferred
list updated (4 items resolved, 4 carried to Beta); §10
Phase 12 prompts all marked complete (12.1–12.4); §10
DOC.20–DOC.21 + 12.1–12.4 added to prompt log; §11
Beta thank-you email marked built in Alpha; §12 Open
Decision #7 resolved; DOC.21 logged)*
*Cross-reference: 30BN_PROCESS_v1.md v3.1*
*v3.2 (July 2026 — Phase 13 complete: §1 current phase updated (Phase 13 complete, Phase 14 next); §3 TipTap and sanitize-html added to tech stack table; §6 email design section expanded (branded HTML templates, buildEmailHtml() wrapper, CTA rules, sanitization exception, universal logging); §8 signup confirmation CTA updated (/shows → /callboard); §8 Communication History stale pre-Phase-13 note updated; §8 Communication page stub replaced with full blast composer spec; §8 Settings hub card table updated (Email Activity card added); §8 Email Activity page new section added; §9 email_log body_preview comment updated; §11 Phase 13 header line updated (Phase 14 next); §11 Phase 13 section replaced (forward-looking → completed summary, 13.1–13.4b each described); §11 Phase 18 Call Board hours marked complete (12.3); §11 prompt log updated (13.1–13.4b added); §13 R31 added (blast body uses sanitize-html, not escapeHtml()); DOC.33 logged)*
*v3.0 (July 2026 — Beta Phase CAL active: §1 current phase updated (Beta underway, Phase CAL active); §1 public surfaces updated (/calendar added); §2 terminology table updated (Production role, Calendar Editor flag); §7 roles table updated (Production row, calendar_editor flag paragraph, middleware note); §8 Show Management updated (show_type → location, end time, buffer time); §8 Master Calendar section added (full feature spec: locations, auto-sync, event types, role access, calendar views, event creation, bulk rehearsal, pending queue, Book Space, public calendar); §8 General Defaults fallback note updated; §8 Location Management card added (planned CAL.8); §9 Migrations 016–020 status added, next migration 021; §9 locations table added; §9 shows.show_type replaced by location_id; §9 show_dates.end_time added; §9 show_date_buffer table added; §9 rehearsal_batches, calendar_events, calendar_event_contacts tables added; §9 admin_users.role extended + calendar_editor added; §10 ADMIN.25 + CAL.1–CAL.5b + all fix prompts + DOC.25a added to prompt log; §11 Phase CAL added with CAL.1–CAL.5b marked complete + CAL.6–CAL.8 planned; DOC.25a/25b logged)*
*v3.1 (July 2026 — Phase CAL complete: §9 Migrations 021–022 status added (021: admin calendar token; 022: recurring events schema); next migration updated to 023; admin_users calendar_subscription_token column + calendar_editor note updated (built not planned); calendar_events recurrence_group_id column + index + note added; recurrence_groups table schema block added; §8 F2 fixed (duplicate Key Files entries removed); §8 F3 fixed (stale 'planned for CAL.8' Locations note updated to built); §10 prompt log DOC.26–30 + CAL.6–CAL.10c + ADMIN.26 added; §11 Phase CAL marked complete (CAL.1–CAL.10c); DOC.28a/28b logged)*
