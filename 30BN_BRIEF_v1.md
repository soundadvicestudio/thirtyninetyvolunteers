# 30 By Ninety Theatre — Volunteer Platform
## 30BN_BRIEF_v1.md — Complete & Authoritative
### Created: July 2026 | Last Updated: July 2026 — v1.3 (Phase 3 complete, Admin prompts through ADMIN.7 complete)

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
**Current phase:** Alpha build in progress — Phase 3 complete, Phase 4 pending (ADMIN.1 through ADMIN.7 ✓)

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
| **Auth** | Supabase Auth (email/password + Google OAuth) | Google SSO live in Alpha. No self-registration — Super Admin creates all accounts. |
| **File Storage** | Supabase Storage | Beta only (PDF consent form uploads). |
| **Styling** | Tailwind CSS v4 | CSS-first. See §4 Critical Constraint. |
| **UI Components** | shadcn/ui | Accessible, non-technical-friendly. `cssVariables: false` set in `components.json` — required for Tailwind v4 compatibility. All shadcn components must have default semantic color classes (`bg-primary`, `border-input`, `text-foreground`, etc.) replaced with explicit brand Tailwind classes at the time of addition. See R15. |
| **Email** | Resend | Domain `30byninetyvolunteers.com` verified in Resend during Alpha. Sending address: `volunteers@30byninetyvolunteers.com`. Free tier: 5 req/s — see R8. |
| **QR Codes** | `qrcode` npm package | Level H error correction. SVG + PNG export. NOT `react-qr-code`. |
| **Forms** | react-hook-form + zod + @hookform/resolvers | All form validation. `@hookform/resolvers` is a required peer package for `zodResolver` — install alongside react-hook-form. |
| **Dates** | date-fns + date-fns-tz | All date/time display uses `formatCT()` from `lib/utils/date.ts` with America/Chicago (Central Time, auto-DST). Never use raw date-fns `format()` for user-facing dates. |
| **Icons** | lucide-react | Icon system. |
| **Deployment** | Vercel (Hobby plan) | Auto-deploy on GitHub push. |
| **Export** | `@react-pdf/renderer` | PDF export of volunteer list via server-side route handler. CSV export is client-side via `lib/utils/csv.ts`. |
| **PWA** | Manual service worker | Admin-only PWA at `/crew` scope. Manifest at `public/manifest.json`, service worker at `public/sw.js` (network-first strategy). Icons generated via Sharp from `public/logo.png`. `start_url`: `/crew/dashboard`. |

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
```

**Pre-deploy checklist:** Confirm all five are set in Vercel → Settings → Environment Variables before every deployment. A missing variable will not fail the build but WILL cause auth failures or email failures at runtime.

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
- Email confirmation: disabled (accounts created by Super Admin only, not self-registered)

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
| Volunteer | `/callboard/*` | Own profile only | No | Passwordless login via token |
| Public | `/`, `/shows/*`, `/forms/*`, `/update`, `/checkin/*` | No | No | No auth required |

**Auth model:** Admin accounts exist in `admin_users` table (linked to Supabase Auth). Admins authenticate via email/password or Google OAuth — both routes verify the `admin_users` record before granting access. Volunteers are NOT Supabase Auth users — they use tokenized magic links only.
**No self-registration for admins.** Super Admin creates all accounts manually and triggers a welcome email with credentials.

---

## 8. Complete Feature Set

### Public — Volunteer Signup Landing Page (`/`)
- Branded, mobile-first landing page in 30 By Ninety visual identity
- Accessible via QR code (in programs and print)
- Heading reads "Join the 30 By Ninety Theatre Volunteer Community" (not "Join Our Next Production")
- Redundant "30 By Ninety Theatre" text under the logo has been removed
- Conditional announcement banner renders BELOW the logo/header area (not above). Full-width, bg-orange, prominent. Admin-controlled on/off.
- Downloadable consent form link (under-18; admin-swappable PDF — Beta)
- Two equal-weight outlined CTA buttons above the signup form: "Update My Info" (→ `/update`) and "View Opportunities" (→ `/shows`). Appear below the bridging text, above the form.
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
  - Same show/same date duplicate → friendly non-discouraging confirmation prompt
  - Success → insert `slot_claims`, send confirmation email with custom show instructions
  - Full → insert as waitlisted, send waitlist confirmation
- Self-cancel: tokenized link in confirmation email → cancel page → cancels claim
  - Cancellation: reopens slot (or promotes next waitlisted volunteer)
  - Immediate email to all `show_editors` for that show
  - If waitlist promoted: sends new confirmation + schedules 24hr reminder

### Public — Volunteer Call Board (`/callboard`)
- Passwordless login: enter email or phone → receive magic link email
- `/callboard/auth?token=[token]`: validates token, sets session, redirects to `/callboard/profile`
- Session: 7-day cookie (single-use token)
- Profile page: editable (all fields; email read-only; phone re-checks duplicates)
- Call history: table of past calls (show, date, role, attendance status)
- Hours summary: total hours, per-season breakdown, next milestone + hours remaining
- Milestone badges: visual display of all milestones achieved
- Upcoming opportunities tab: all live shows with open slots, link to `/shows/[id]`

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

**Dashboard (`/crew/dashboard`):**
- Season at a glance: all live shows, per-role fill status (red/yellow/green)
- Quick stats: Total Active Volunteers, Upcoming Shows This Month, Volunteers Needed, Recent Signups (7 days)
- Pending milestone acknowledgments widget (volunteers who hit milestone, awaiting personal thanks)
- Recent activity feed: last 10 slot claims, cancellations, new signups

**Volunteers (`/crew/volunteers`):**
- Searchable, filterable, sortable list (full-text: name/email/phone)
- Filters: category, status (active/archived), age range, school, is_minor, milestone tier, Service Hours Required (Yes/No/All)
- Volunteer list is filterable by category (role)
- SH badge on list rows indicating `requires_service_hours`
- Sort: name, date joined, total hours, last call date
- Columns: Name, Email, Phone, Categories, Total Hours, Calls, Status, Joined
- Bulk select: export selected to CSV. `requires_service_hours` included in CSV export.
- PDF export available (Editor/Super Admin) via server-side route handler at `/crew/volunteers/export`. Respects current filters. Landscape A4, branded header, 8-column table.
- Row click → volunteer profile

**Volunteer Profile (`/crew/volunteers/[id]`):**
- All submitted fields (editable by Editors, read-only for Viewers)
- Service Hours Required field in Personal section: "Yes" (orange) / "No" (mid-gray) / "—" if no school on file. Editable in edit mode.
- Category tags (editable)
- Call history table (show, date, role, attendance, hours). Sorted by `claimed_at` descending (PostgREST limitation — strict `show_date` ordering deferred to Phase 12 via Supabase view/RPC).
- Hours summary + milestone history
- **Editor Notes:** comment-style entries — each note logged with author name + timestamp. Stacked chronologically. Visible to Editors and Super Admins only. Never visible to volunteer (RLS enforced). Editors and Super Admins can add notes (append-only for Editors). Super Admins can also edit and delete existing notes. Implemented via Migration 004 RLS policies. For preferences, scheduling considerations, history, sensitive info.
- Status toggle: Active / Archived (Editors only, confirmation prompt)
- Audit entries for this volunteer (read-only, Editors only)

**Category Management (`/crew/settings/categories`):**
- Super Admin only (not Editor or Viewer)
- Add, rename, reorder (drag-and-drop or arrows), visibility toggle
- Visibility toggle: hides from public signup form. Does NOT affect existing DB assignments. Can be re-enabled at any time.
- Category description is settable at creation time only — not editable from the table. Phase 11 cleanup item.
- Default categories (seeded): Ushers/Front of House · Band Members · Concessions · Backstage Crew · Wardrobe/Costumes · Hair/Make-Up · Lighting Design · Lighting Operator · Sound Design · Sound Operator · Set Build · Set Design · Stage Manager · Tech · Cleaning/Organization

**User Management (`/crew/settings/users`) — Super Admin only:**
- List all admin users: name, email, role, status, last login, created
- Create new account: Name, Email, Role (Editor/Viewer), Send Welcome Email toggle
  - Creates Supabase Auth user, inserts `admin_users` record, sends branded welcome email with login link + temp password + instructions to change password
- Deactivate/reactivate (cannot deactivate own account)
- Multiple Super Admins are supported. Deactivate button is disabled for ALL Super Admin rows in the Users table (not just own account).
- Change role (Super Admin only). Super Admin role cannot be changed via the Users panel.
- Super Admin cannot be demoted via this panel

**Show Management (`/crew/shows`):**
- Show list organized by season, filter by type/status
- Create/edit show: name, show type (Mainstage/Studio X/One-Off), season, dates+times (multiple), volunteer roles + slot counts per role, assigned editors, custom show instructions (included in slot claim confirmation email), status (draft/live/past/archived)
- Draft/Live toggle: live = visible to public immediately
- Per-show detail page (`/crew/shows/[id]`):
  - Tabs: Overview / Volunteers / Waitlist / Dates / Settings
  - Volunteers tab: per-role roster, attendance status, per-date filter
  - Waitlist tab: ordered list per role, volunteer name + time added
  - Settings tab: assigned editors (add/remove any time), public page toggle, status
- Post-event attendance marking (Editors only, only available after show date has passed):
  - Per-volunteer, per-date: Showed / No-Show / Excused
  - Showed: triggers hours increment + milestone check
  - Bulk mark: select all → mark all Showed

**Standing Volunteer Opportunities (30BN-4.4):**
- Non-show volunteer opportunities for intern positions, long-term roles, and organizational interest. Appears on `/shows` public page above productions.
- Per opportunity, admin can designate:
  - Claim type: Expression of Interest (EOI) OR Slot Claim. EOI = volunteer submits interest, Editor follows up manually. Slot Claim = same flow as show slot claiming.
  - Slot cap: optional toggle. If off, open-ended. If on, enter a slot count. EOI opportunities default to open-ended but cap can be toggled.
- Confirmation email copy reflects EOI vs. Slot Claim.

**Category-Match Notifications (30BN-5.3):**
- When a show is published (status → live), the system can notify all volunteers who have selected a matching category/role.
- One email per volunteer per show regardless of how many roles match (deduplicated before send).
- Send Notifications toggle at publish time.
- Manual trigger available after publication.
- No auto-fire on republish unless explicitly confirmed via warning prompt (only if notifications were previously sent for that show).
- Notification email includes a general link to `/shows` (not a specific show URL).
- Uses `resend.batch.send()` per R8.

**Staffing Dashboard (`/crew/dashboard`):** See Dashboard above.

**Forms & Surveys (`/crew/forms`):**
- Form builder: text, textarea, dropdown, checkbox, radio, date, rating (1–5), number
- Per-field: label, placeholder, required toggle, option list (for dropdown/radio/checkbox), sort order (drag-and-drop)
- Preview mode before publish
- Status: draft / live / closed
- Published form → unique public URL (`/forms/[id]`) + embeddable widget code + QR code
- Response viewer: table, linked volunteer profiles (email/phone match), date filter, CSV export

**QR Code Generator (`/crew/tools/qr-generator`):**
- Standalone: paste any URL → generate, preview, download PNG + SVG
- Level H error correction (scannable with up to 30% damage/obstruction)
- PNG: min 2000×2000px for print use
- SVG: vector, infinitely scalable
- Per-show QR: on show detail page (links to `/shows/[id]`)
- Per-form QR: on form detail page (links to `/forms/[id]`)
- All three use the same shared QR utility component

**Volunteer Hours & Milestones:**
- Auto-tally: hours increment when attendance marked Showed
- Default hours per show type (configurable in settings): Mainstage = 3hrs, Studio X = 2hrs, One-Off = 2hrs — overridable per show
- Manual entry: Editors add hours with note (e.g., "Set build — 4 hours")
- Milestone thresholds: First Call · 10h · 20h · 35h · 50h · 75h · 100h · every 25h thereafter
- On milestone: send congratulations email to volunteer + flag in dashboard for Editor personal thanks
- Milestone history on profile + Call Board

**Audit Log (`/crew/settings/audit-log`):**
- Read-only. Editors only.
- All admin actions logged: volunteer create/edit/archive, show create/edit/publish, slot claim/cancel, attendance mark, user create/role change, category change, email sent, settings changed
- Filter: user, action type, date range, target type
- Permanent, tamper-proof

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

All tables created in Migration 001. All FK columns have explicit indexes.

**Migration 001 status:** Applied — `001_core_schema.sql` live on project `nutvjkplbtobcmymqtzx`.

**Migration 002 status:** Applied — `002_volunteer_notes_role_rls.sql`
Fixes `volunteer_notes` RLS: replaced generic `authenticated_all_admin` (FOR ALL) policy with role-scoped SELECT/INSERT restricted to `is_editor()` (editor + super_admin). No UPDATE or DELETE policy (append-only). Creates `is_editor()` helper function.

**Migration 003 status:** Applied — `003_requires_service_hours.sql`
Adds `requires_service_hours` boolean NOT NULL DEFAULT false to `volunteers` table.

**Migration 004 status:** Applied — `004_volunteer_notes_superadmin_rls.sql`
Adds UPDATE/DELETE policies on `volunteer_notes` restricted to `is_super_admin()`. Creates `is_super_admin()` helper function. Super Admins can edit and delete notes; Editors cannot.

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
created_at       timestamptz NOT NULL DEFAULT now()
updated_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_shows_season_id, idx_shows_status
-- Trigger: trg_shows_updated_at
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
show_id          uuid NOT NULL REFERENCES shows(id) ON DELETE CASCADE
category_id      uuid REFERENCES volunteer_categories(id)
role_name        text NOT NULL
slots_available  integer NOT NULL DEFAULT 1
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_volunteer_roles_show_id
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
source           text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','checkin'))
marked_by        uuid REFERENCES admin_users(id)
marked_at        timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_attendance_volunteer_id, idx_attendance_show_id
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
last_login       timestamptz
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_admin_users_email
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
field_id         uuid NOT NULL REFERENCES form_fields(id)
value            text
-- INDEX: idx_frv_response_id
```

### volunteer_hours_log
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
volunteer_id     uuid NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE
hours            numeric(4,2) NOT NULL
source_type      text NOT NULL CHECK (source_type IN ('attendance','manual'))
source_id        uuid
note             text
added_by         uuid REFERENCES admin_users(id)
created_at       timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_hours_log_volunteer_id
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
30BN-DOC.4    ⏳ Process Update v1.3 (next prompt)
```

---

### Phase 4 — Shows & Season Management

**30BN-4.1 — Show Creation & Edit**
- `/crew/shows/new` and `/crew/shows/[id]/edit`
- Full form per §8: name, type, season (select existing or create inline), dates+times (dynamic rows — add/remove), volunteer roles (dynamic rows: role name + slot count), assigned editors (multi-select), volunteer instructions, status
- Volunteer instructions field: plaintext, included verbatim in slot claim confirmation emails
- Default hours: inherit from `app_settings` by show type, overridable per show
- Save as Draft or Publish Live (warn before Live if any role has 0 slots)
- All fields editable post-creation
- Quality gate: show appears in list; dates and roles saved correctly; assigned editors visible in show detail

**30BN-4.2 — Season Management & Show List**
- `/crew/shows`: shows organized by season (tab or accordion per season)
- Create season inline (name + optional date range)
- Per-show card: name, type badge, status badge, date range, staffing summary (X/Y total slots filled across all roles)
- Filters: type, status
- Quick actions: Edit, View Public Page, Copy Public URL, Set Live/Draft toggle
- Quality gate: multiple seasons display correctly; status toggles take effect; public URL copy works

**30BN-4.3 — Admin Show Detail**
- `/crew/shows/[id]`: tabbed detail view per §8 (Overview / Volunteers / Waitlist / Dates / Settings)
- Overview: show info, edit link, public URL with copy button, QR code (from shared utility)
- Volunteers tab: per-role roster, attendance status column, per-date filter dropdown
- Waitlist tab: ordered list per role (position, name, email, time added)
- Dates tab: list of all dates/times
- Settings tab: assigned editors (add/remove inline), public page toggle, status selector
- Post-event attendance marking: only available when `show_date` is in the past. Per-volunteer selector: Showed / No-Show / Excused. Bulk mark all Showed button.
- On Showed: insert `attendance`, increment `volunteer.total_hours`, insert `volunteer_hours_log`, trigger milestone check
- Quality gate: all tabs render correctly; attendance marking only available for past dates; hours update on volunteer profile after marking

**30BN-4.4 — Standing Volunteer Opportunities**
- Non-show volunteer opportunities for intern positions, long-term roles, and organizational interest, per §8. Appears on `/shows` public page above productions.
- Per opportunity: claim type (Expression of Interest OR Slot Claim), optional slot cap toggle (EOI defaults open-ended, cap can be toggled on with a slot count)
- Confirmation email copy reflects EOI vs. Slot Claim
- Quality gate: opportunity appears above productions on `/shows`; EOI submissions logged for manual follow-up; Slot Claim opportunities behave like show slot claiming including cap enforcement

---

### Phase 5 — Public Show Claiming

**30BN-5.1 — Public Show Listing & Per-Show Claiming Page**
- `/shows`: all live shows with ≥1 open slot, mobile-first, branded
- `/shows/[id]`: show detail, all dates/times, all roles with open slot counts, waitlist indicator when full
- Claiming form: Name, Email, Phone. Pre-fill if email/phone found in `volunteers`.
- Waitlist form: same fields, appears when role is full (replaces claim button with "Join Waitlist")
- Each show page has a standalone public URL — works independently for non-DB volunteers and rental productions
- Quality gate: only live shows with open slots appear; full roles show waitlist; closed shows redirect to `/shows` with friendly message

**30BN-5.2 — Slot Claiming Logic & Self-Cancel**
Claim flow:
- Check for existing active claim by same email/phone for same show_date_id + volunteer_role_id
- If exists: friendly duplicate prompt ("You're already signed up for this show on [date] — did you mean to sign up again?") — Confirm / Cancel
- If no conflict: insert `slot_claims` (status: 'claimed')
- If role full: insert as 'waitlisted' (assign `waitlist_position`)
- On claim: send confirmation email including `volunteer_instructions` from show record
- On waitlist: send waitlist confirmation email

Cancel flow:
- Tokenized cancel link in confirmation email: `/cancel?token=[claim_token]`
- Cancel page: show claim details, email confirmation input, confirm button
- On confirm: set `slot_claims.status = 'cancelled'`, `cancelled_at = now()`
- Check for next waitlisted volunteer for same role/date:
  - If exists: update their status to 'claimed', send new confirmation email + schedule 24hr reminder
  - If not: slot simply reopens
- Send cancellation notification to all `show_editors` for that show (via Resend)

24hr reminder:
- Vercel Cron Job (daily): query `slot_claims` for show_dates in next 24 hours, status = 'claimed'
- Send reminder email to each volunteer
- Log in `email_log` (recipient_type: 'transactional')

Quality gate: claim inserts correctly; duplicate warning fires; waitlist promotes on cancel; editor notification sends; 24hr cron verified in Vercel logs

**30BN-5.3 — Category-Match Notification Emails**
- When a show is published (status → live), notify all volunteers who have selected a matching category/role, per §8
- One email per volunteer per show regardless of how many roles match (deduplicated before send)
- Send Notifications toggle at publish time; manual trigger available after publication
- No auto-fire on republish unless explicitly confirmed via warning prompt (only if notifications were previously sent for that show)
- Notification email includes a general link to `/shows` (not a specific show URL)
- Uses `resend.batch.send()` per R8
- Quality gate: publishing with toggle on sends exactly one email per matching volunteer; republish does not silently resend; manual trigger works; email_log records the send

---

### Phase 6 — Custom Forms & Surveys

**30BN-6.1 — Form Builder**
- `/crew/forms/new` and `/crew/forms/[id]/edit`
- All field types per §8
- Dynamic field list: add field → select type → configure. Reorder via drag-and-drop.
- Preview tab: renders form exactly as public will see it
- Save draft / Publish live / Close
- Published form: `forms.status = 'live'` → public URL active
- Quality gate: all field types render in preview; draft/live/closed states work; form appears at `/forms/[id]` when live

**30BN-6.2 — Public Form Page & Response Capture**
- `/forms/[id]`: renders all fields per `form_fields` config, branded, mobile-friendly
- On submit: insert `form_responses` + `form_response_values`
- Profile linking: check submitted email + phone against `volunteers` → if match, set `form_responses.volunteer_id`
- Confirmation message in-page (no redirect)
- Closed form: friendly "This form is no longer accepting responses" state
- Quality gate: responses appear in `form_responses`; email/phone matching links to correct volunteer

**30BN-6.3 — Form Response Viewer & Embed**
- `/crew/forms/[id]/responses`: table of all responses, linked volunteer name (clickable → profile), all field values, date submitted
- Filters: date range, matched/unmatched volunteer
- Export: CSV of all responses (all field values + volunteer name if matched)
- Embed widget code: `<iframe src="/forms/[id]" ...>` snippet — copyable from form detail page
- Quality gate: responses display correctly; CSV downloads with correct headers; iframe code is copyable

---

### Phase 7 — QR Code Generator

**30BN-7.1 — QR Code Utility & Generator Tool**
Shared QR utility used in three places:
- `lib/qr.ts`: exports `generateQR(url: string): Promise<{ svg: string, png: Buffer }>` using `qrcode` npm package, error correction level H, min 2000px PNG
- Standalone generator: `/crew/tools/qr-generator` — URL input, label, live preview, download PNG button, download SVG button
- Per-show QR: on show detail Overview tab — QR for `/shows/[id]`. Download buttons.
- Per-form QR: on form detail page — QR for `/forms/[id]`. Download buttons.
- All three use the same `generateQR()` utility
- Quality gate: QR codes scan correctly on a real device; PNG downloads at ≥2000px; SVG downloads as valid vector

---

### Phase 8 — Volunteer Call Board

**30BN-8.1 — Call Board Login & Session**
- `/callboard`: landing with email or phone lookup form
  - Input: email OR phone
  - Match found: generate single-use `callboard_token` (store in `volunteers.callboard_token` + `callboard_token_expires_at`), send magic link email
  - No match: "We don't have a record with that info" + link to signup
- `/callboard/auth?token=[token]`: validate token + expiry → set 7-day session cookie → redirect to `/callboard/profile`. Invalid/expired → friendly error.
- Sign out: clear cookie → redirect to `/callboard`
- Quality gate: magic link email received; valid token logs in; expired/invalid token handled gracefully

*(Add to schema: `volunteers.callboard_token uuid`, `volunteers.callboard_token_expires_at timestamptz` — added in 30BN-8.1 migration)*

**30BN-8.2 — Call Board Portal Pages**
- `/callboard/profile`: editable profile (all fields; email read-only; phone re-checks duplicates). Save in-page, success toast. Hours summary, milestone badges.
- `/callboard/opportunities`: all live shows with open slots → cards → link to `/shows/[id]`. Existing claims flagged inline.
- `/callboard/history`: past calls table (show, date, role, attendance status, hours)
- Milestone badges: visual display per `milestone_log`. Progress bar to next milestone.
- Quality gate: profile edits persist; opportunities reflect live shows; badges display correctly for volunteer with existing milestone history

---

### Phase 9 — Volunteer Hours & Milestones

**30BN-9.1 — Hours Tracking**
- Auto-increment already wired in 30BN-4.3 (attendance marking). This prompt adds manual entry and verification.
- Manual hours entry on volunteer profile (Editors only): hours amount + note + date → insert `volunteer_hours_log` (source_type: 'manual') → update `volunteers.total_hours` → trigger milestone check
- Hours display: profile shows total, per-season breakdown (join on `shows.season_id` via `attendance` + `show_dates`), `volunteer_hours_log` table for full history
- Quality gate: manual hours add to total; per-season breakdown accurate; hours log shows both auto and manual entries

**30BN-9.2 — Milestone System**
- `lib/milestones.ts`: `MILESTONE_THRESHOLDS = [0, 10, 20, 35, 50, 75, 100]` (0 = "First Call" — triggered on first attendance mark, not hours). After 100: every 25.
- `checkMilestones(volunteerId)`: runs after every hours update. Queries existing `milestone_log` records to find highest hit. Computes next threshold. If new total crosses threshold: insert `milestone_log`, send congratulations email (tier-specific copy), set `editor_acknowledged = false` on the record.
- Dashboard widget (from 30BN-4.3 placeholder): query `milestone_log WHERE editor_acknowledged = false` → display with volunteer name, milestone, "Mark Acknowledged" button (Editor only)
- "First Call" trigger: separate from hours — fires on first attendance record with status = 'showed'. Inserts `milestone_log` with `milestone_hours = 0`, `milestone_label = 'First Call'`.
- Quality gate: milestones fire correctly at each threshold; congratulations email sends; dashboard widget shows pending acknowledgments; acknowledging clears from widget

---

### Phase 10 — Audit Log

**30BN-10.1 — Audit Log**
Wire audit logging throughout the app and build the read-only viewer.
- `lib/audit.ts`: `logAction(adminId, action, targetType, targetId, before?, after?)` — inserts `audit_log` record. Server-only.
- Add `logAction()` calls to all existing editor mutations built in prior phases:
  - Volunteer: create, update, archive/unarchive
  - Category: create, rename, visibility toggle
  - Show: create, update, status change
  - Slot claim: manual cancellation (admin-initiated)
  - Attendance: mark attendance
  - User: create, role change, deactivate/reactivate
  - Settings: any `app_settings` change
  - Hearing options: any change
  - Editor notes: add note
- `/crew/settings/audit-log`: read-only table. Filters: admin user, action type, date range, target type. Columns: Date, Admin, Action, Target, Details (expandable before/after JSON diff).
- Quality gate: every editor action now appears in the log with correct metadata; viewer cannot access audit log (route guard); before/after values capture relevant field changes

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

**Deferred polish items (added since v1.2):**
- Mobile sidebar (collapsible/hamburger for PWA on phone-sized screens)
- PDF export column for `requires_service_hours`
- Call history sort by `show_date` (currently `claimed_at` — PostgREST limitation)
- Volunteer list all-pages CSV export (currently limited to current page for filtered export)
- Out-of-range page param clamping on volunteer list
- Category description inline editing
- Dialog close-X dark mode hover treatment (`button.tsx` not swept in ADMIN.6)
- Password change UI for new admin accounts

**30BN-12.1 — Mobile Optimization & Empty States**
- Full responsive audit: `/` (landing), `/shows`, `/shows/[id]`, `/callboard/*`, `/forms/[id]`, `/update`, `/cancel`
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

### R12 — window.location.href Over router.push() for Post-Mutation Nav
Prefer `window.location.href` over `router.push()` in Client Components that require a full Server Component re-render after a mutation.

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

---

*This document is updated at the completion of each build phase.*
*Version history:*
*v1 (initial — all Alpha prompts, full schema, brand system, standing rules)*
*v1.1 (July 2026 — Phase 1 complete: project facts confirmed, Google SSO moved to Alpha, Production Crew footer link added, Open Decisions #1/#3/#4 resolved, R15 added)*
*v1.2 (July 2026 — Phase 2 complete: @hookform/resolvers added to §3, Resend domain verified and from address confirmed, Open Decision #2 resolved, age_range required decision noted, shows link in confirmation email, R16/R17 cross-references added, R18 empty string normalization added, R8 single-send clarification)*
*v1.3 (July 2026 — Phase 3 complete: date-fns-tz/@react-pdf/renderer/PWA added to §3, requires_service_hours added to §8 and §9 (Migration 003), Editor Notes Super Admin edit/delete added (Migration 004), multiple Super Admins support documented, Light/Dark mode and PWA documented, Standing Volunteer Opportunities (4.4) and Category-Match Notifications (5.3) added as new prompt slots, Phase 3 marked complete, Open Decisions #6/#7 added, R19–R22 added)*
*Cross-reference: 30BN_PROCESS_v1.md v1.2*
