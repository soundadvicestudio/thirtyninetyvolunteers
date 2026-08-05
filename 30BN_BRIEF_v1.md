# 30 By Ninety Theatre — Volunteer Platform
## 30BN_BRIEF_v1.md — Complete & Authoritative — v4.7
### Created: July 2026 | Last Updated: August 2026 — v4.7 (Phase AUDITIONS complete — all 10 build prompts shipped (AUDITIONS.A through AUDITIONS.4b); Migration 032 applied; 8 new tables; feature_auditions live; public signup/check-in/upload/cancel pages; admin list + 6-tab detail page; TipTap merge tag extension; 4 email functions; HelpContent 15th section (Auditions); Deferred Verifications v19 (65 items); schema corrections (audition_signups.phone NOT NULL, original_filename, consent_form_submissions.audition_signup_id, calendar_events.source_audition_id); R23 signature corrected; Phase 17 Launch is next)

---

## 1. Project Overview

**30 By Ninety Theatre Volunteer Platform** is a custom, full-stack volunteer management system built from scratch for 30 By Ninety Theatre (Old Mandeville, Louisiana). It replaces SignUp Genius and Google Forms with a single, branded, permanently owned platform.

**Built and maintained by:** Jonathan Sturcken (YLC member) — sole point of contact for questions, updates, and future development.

**Two user-facing surfaces:**
- **Public:** Volunteer signup landing page · per-show slot claiming pages · Volunteer Call Board self-service portal · Public Events Calendar (`/calendar`) · Rehearsal self check-in (`/rehearsal-checkin/[token]`) · Audition signup (`/auditions/[id]`) · Audition self check-in (`/audition-checkin/[token]`) · Audition material upload (`/auditions/upload/[token]`) · Audition signup cancel (`/auditions/cancel/[token]`)
- **Private (Production Crew):** Full admin backend for Super Admins, Editors, and Viewers

**Supabase project:** `thirtyninetyvolunteers` (ID: `nutvjkplbtobcmymqtzx`, org: `thirtybyninety`)
**GitHub repo:** `soundadvicestudio/thirtyninetyvolunteers` (private)
**Deployment:** Vercel (auto-deploy on GitHub push)
**Local folder:** `/Users/soundadvice/volunteers`
**Alpha URL:** `https://thirtyninetyvolunteers-a9wa3ttc3-soundadvicestudios-projects.vercel.app`
**Production URL:** `https://30byninetyvolunteers.com` (live)
**Current phase:** Phase AUDITIONS (Audition Management System) complete — all 10 build prompts shipped (AUDITIONS.A through AUDITIONS.4b). Migration 032 applied. Phase 17 (Launch) is next. Phase CAST planned post-launch.

OpenCall OS: This platform is the master reference implementation for OpenCall OS (opencallos.com) — a bespoke volunteer and venue management platform for arts organizations and nonprofits. Each client deployment is a self-contained installation (own GitHub repo, Supabase project, Vercel deployment, domain). Jonathan (Super Admin) configures each deployment via the Setup Panel and transfers ownership at delivery. The 30BN deployment is the live proving ground — every feature built and validated here ships into the OpenCall OS template. See Phase SETUP and Phase THEME in §11.

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
| **Production** | New admin role (CAL.2). Directors and Stage Managers. No access to volunteer database or other Production Crew functions. Lands on `/crew/calendar` after login. Has access to `/crew/calendar`, `/crew/media` (Media Library — ADMIN.30), `/crew/help`, `/crew/rehearsals` (Rehearsal Management — Phase 21, feature_rehearsals flag; sees only assigned schedules), and `/crew/auditions` (Audition Management — Phase AUDITIONS, feature_auditions flag; full read/write on assigned auditions and shows). Assignment is independent per resource: Production users are granted access to a show explicitly (via show editors assignment) OR to a standalone audition directly (via audition assignments). Both paths are independent. Show assignment grants access to all auditions linked to that show via show_id. Audition assignment grants access to that specific audition only. |
| **Auditioner** | A person who signs up to audition for a show or production. Auditioners are NOT volunteers — they are a separate data entity stored in `audition_signups`, not in the `volunteers` table. Signing up to audition does not create a volunteer record. A "convert to volunteer" admin action (Phase AUDITIONS, status = Cast) can optionally create a linked volunteer record after casting. |
| **Calendar Editor** | A boolean flag (`calendar_editor`) on Editor, Viewer, and Owner Admin accounts. When true: direct write access to calendar (events saved as approved). When false (default): submissions go to pending queue for Super Admin approval. |
| **Owner Admin** | New role between Super Admin and Editor (introduced for OpenCall OS client deployments). Full operational access identical to Super Admin in all areas EXCEPT the Setup Panel (`/crew/settings/setup`), which is Super Admin only. Owner Admin can create and manage Editor, Viewer, Production, and Owner Admin accounts. Owner Admin can deactivate other Owner Admin accounts. Cannot create Super Admin accounts or deactivate Super Admin accounts. In every client deployment, the theater's own staff hold Owner Admin accounts; Jonathan holds the Super Admin account permanently. |
| **OpenCall OS** | The commercial product built on this codebase template. Each client organization gets their own self-contained deployment configured via the Setup Panel. No code changes required between client deployments — all customization is data-driven through `app_settings`. |
| **Setup Panel** | Super Admin-only configuration panel at `/crew/settings/setup`. Allows Jonathan to brand and configure each OpenCall OS client deployment without code changes: org identity, brand colors, logo, email configuration, feature flags, and instance label. Owner Admins are hard-blocked from this route. |

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Next.js (App Router, TypeScript) | Use `create-next-app@latest`. Do not pin to a version. |
| **Database** | Supabase (PostgreSQL) | Project: `thirtyninetyvolunteers` |
| **Auth** | Supabase Auth (email/password + Google OAuth) | Google SSO live in Alpha. Admin self-registration with pending approval flow added in ADMIN.15. Super Admin must approve before access is granted. |
| **File Storage** | Supabase Storage | Active. Private bucket `media` stores all platform media files (consent form submissions, media library files — Phase 15.3 built the library). P-DC pattern (direct browser upload to Supabase Storage via signed upload URL — bypasses Vercel 4.5MB serverless limit). All file types supported: PDF, image, video, audio. Access controlled via signed URLs generated server-side. Viewable files (video, audio, image, PDF) and YouTube/Vimeo links redirect to `/documents/view/[token]` player page (Phase 15.4). |
| **Styling** | Tailwind CSS v4 | CSS-first. See §4 Critical Constraint. |
| **UI Components** | shadcn/ui | Accessible, non-technical-friendly. `cssVariables: false` set in `components.json` — required for Tailwind v4 compatibility. All shadcn components must have default semantic color classes (`bg-primary`, `border-input`, `text-foreground`, etc.) replaced with explicit brand Tailwind classes at the time of addition. See R15. |
| **Email** | Resend | Domain `30byninetyvolunteers.com` verified in Resend during Alpha. Sending address: `volunteers@30byninetyvolunteers.com`. Free tier: 5 req/s — see R8. |
| **QR Codes** | `qrcode` npm package | Level H error correction. SVG + PNG export. NOT `react-qr-code`. |
| **Forms** | react-hook-form + zod + @hookform/resolvers | All form validation. `@hookform/resolvers` is a required peer package for `zodResolver` — install alongside react-hook-form. |
| **Dates** | date-fns + date-fns-tz | Two utility functions in `lib/utils/date.ts`. `formatCT()` — for full `timestamptz` values (created_at, updated_at, claimed_at, etc.) which include timezone info. `formatWallClockCT()` — for bare `date` column values (`'YYYY-MM-DD'`) and manually constructed date+time strings; these parse as UTC on Vercel without this function, shifting displayed dates by hours. Never use raw date-fns `format()`. See R23. |
| **Icons** | lucide-react | Icon system. |
| **Deployment** | Vercel (Hobby plan) | Auto-deploy on GitHub push. |
| **Image Config** | next.config.ts images.remotePatterns | Must include *.supabase.co hostname pattern (added ADMIN.33). Required for dynamic logo rendering when org_logo_url points to Supabase Storage. Without this entry, next/image will throw a runtime error on any deployment with a custom uploaded logo. |
| **Export** | `@react-pdf/renderer` | PDF export of volunteer list via server-side route handler. CSV export is client-side via `lib/utils/csv.ts`. Brand colors passed as props via `createStyles()` factory (THEME.4 — see §8 Volunteer List PDF). |
| **Color Utility** | `lib/utils/color.ts` | `lightenHex(hex, amount)` — pure server-side hex tint computation. Blends a hex color with white at the given percentage. Used by `resolveEmailSettings()` to compute `brandPrimaryLight` (8% tint of `brand_primary`) and by the PDF export route handler for the same derivation. Required because email clients and `@react-pdf/renderer` do not support CSS custom properties or `color-mix()` — tints must be concrete hex strings computed server-side. Established THEME.3b. |
| **Rich Text** | TipTap (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-underline`) | Rich text editing in the email blast composer (`/crew/communication`). StarterKit provides bold, italic, bullet/ordered lists, blockquote, headings, horizontal rule. `@tiptap/extension-link` and `@tiptap/extension-underline` added in ADMIN.27. Toolbar: B, I, U, H1, H2, —, • List, 1. List, 🔗. Editor outputs HTML passed to `sendBlastEmail()`. **Custom extension pattern (Phase AUDITIONS.4a):** `MergeTagExtension.ts` in `components/crew/auditions/` — inline/atom Node with `data-merge-tag` attribute round-trip, `insertMergeTag(tag)` command via module augmentation (`declare module '@tiptap/core'`), `.merge-tag-pill` CSS class for visual display. All TipTap editor instances in admin components use `immediatelyRender: false` (SSR/hydration safety — required in Next.js App Router). Installed 13.3b; extensions added ADMIN.27; custom extension added AUDITIONS.4a. |
| **Image Cropping** | react-easy-crop v6.2.3 | Client-side image crop editor for brand asset uploads in the Setup Panel (BrandImageUploader.tsx). Used for logo (free aspect ratio) and favicon (1:1 square lock). Installed SETUP.2. |
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

**Storage Buckets:**
- `media` — all platform media files (private; signed URLs required for access). Created Phase 15.2. Path namespacing within the bucket: `consent-forms/[volunteer_id]/[submission_id]/` for consent submissions; `library/[folder_id]/[document_id]/` for media library files (Phase 15.3); `attachments/[type]/[record_id]/[document_id]/` for show/rehearsal/audition attachments (future phases). No public access — all reads go through the `/documents/[token]` redirect route which enforces access tier and generates signed URLs.
- `brand` — brand asset files (public; direct URL access without auth). Created SETUP.2. Stores logo and favicon uploads from the Setup Panel. Path namespacing: `brand/logo/[uuid].png` for logo uploads, `brand/favicon/[uuid].png` for favicon uploads. Public because these assets are served directly on public pages (landing page logo, browser favicon `<link rel="icon">`) without any auth layer. Never use this bucket for sensitive or access-controlled content.

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
- From address: `volunteers@30byninetyvolunteers.com` (domain verified in Resend during Alpha — no domain change needed at Launch). Dynamic from-address implemented (SETUP.3/ADMIN.31): `resolveEmailSettings()` internal helper in `lib/email.ts` fetches `email_from_address`, `email_from_name`, `org_logo_url`, `org_name`, `org_contact_email`, and `brand_primary` + `brand_accent` from `app_settings` in a single query. Returns `{ from: string, logoUrl: string, orgName: string, orgContactEmail: string, brandPrimary: string, brandAccent: string, brandPrimaryLight: string }`. `brandPrimaryLight` is derived server-side as `lightenHex(brandPrimary, 0.08)` from `lib/utils/color.ts` — an 8% tint of `brand_primary` matching the `--brand-primary-light` CSS custom property. Falls back to 30BN defaults when keys are absent or empty. Called in all direct-call send functions. Never exported — internal to `lib/email.ts`. Extended THEME.3 (brandPrimary/brandAccent) and THEME.3b (brandPrimaryLight). The FROM_ADDRESS and REPLY_TO module-level constants were deleted in ADMIN.34; the 4 payload builders (buildReminderEmailPayload, buildThankYouEmailPayload, buildShowBulkEmailPayload, buildCategoryMatchNotificationPayload) now accept explicit `from?: string`, `replyTo?: string`, `brandPrimary?: string`, and `brandAccent?: string` params with inline 30BN defaults as fallback, and all call sites in lib/actions/shows.ts and both cron routes pass the dynamic values directly.
- Default Reply-To: `info@30byninety.com` (editable per send by Editor)
- All emails use branded HTML templates (built Phase 13.2): table-based layout, inline styles only (email client compatibility), max 600px content width, navy (`#293994`) header, white content area, footer-gray (`#F5F5F5`) footer.
- Shared wrapper: `buildEmailHtml({ subject, preheader, body, footerNote?, logoUrl?, brandPrimary?, brandAccent?, brandPrimaryLight? })` in `lib/email.ts` (internal, not exported). Accepts optional `logoUrl` (added SETUP.3), `brandPrimary`, `brandAccent`, and `brandPrimaryLight` params (added THEME.3/THEME.3b). All values come from `resolveEmailSettings()` at the call site — never hardcoded per-function. Email client brand color approach: Email clients do not support CSS custom properties (`var()`) or `color-mix()`. Brand hex values are string-interpolated at send time using `brandPrimary` and `brandAccent` fetched from `app_settings`, and `brandPrimaryLight` computed server-side via `lightenHex()`. This is distinct from the CSS custom property approach used in the web UI (THEME.1/2). `buildCtaButton(label, url, color)` helper (internal): each call site passes the correct dynamic color — `brandPrimary` for structural/nav buttons, `brandAccent` for action/CTA buttons. Public page org identity: `resolveOrgIdentity()` in `lib/utils/org-identity.ts` fetches `org_name`, `org_tagline`, `org_contact_email`, `org_website_url`, `org_location`, and `org_logo_url` from `app_settings` for use in public Server Components (landing page heading, footer, copyright, logo). Uses `getAdminClient()` — safe for public pages and cron routes with no admin session. Falls back to 30BN defaults. Extended in ADMIN.33 to include `org_logo_url` (required for the public page org identity sweep). The admin crew layout (`app/crew/(app)/layout.tsx`) fetches org via `resolveOrgIdentity()` and passes it as a prop to `Sidebar.tsx` (Client Component — cannot call `resolveOrgIdentity()` directly per R10). Never import from a Client Component.
- CTA buttons built via `buildCtaButton(label, url, color)` helper (internal). Volunteer-facing CTAs link to `/callboard`. Admin-facing CTAs link to `/crew/login` or `/crew/`.
- All user-supplied values interpolated into HTML email strings must be wrapped in `escapeHtml()` (internal to `lib/email.ts`). Exception: the blast body passed from TipTap is sanitized via `sanitize-html` instead of escaped — escaping would corrupt the HTML structure. See `sendBlastEmail()` in `lib/actions/blast.ts`.
- All outbound emails (system-triggered and admin-triggered) logged to `email_log` + `email_log_recipients` as of Phase 13.1.
- **Export status of send functions (confirmed AUDITIONS.4b):** All `send*Email()` functions in `lib/email.ts` ARE exported — only the HTML-building helpers (`buildEmailHtml()`, `buildCtaButton()`, `escapeHtml()`, `logEmailSent()`) are internal. Prior planning assumed send functions were unexported; the live file confirms they are exported. Callers in `lib/actions/auditions.ts` and `lib/actions/auditions-admin.ts` import them directly.

---

## 7. User Roles & Access

| Role | Route Access | Can Edit | Can Email | Notes |
|---|---|---|---|---|
| Super Admin | All `/crew/*` including `/crew/settings/setup` | Yes | Yes | Creates/manages all admin accounts including Owner Admin. Only role with access to the Setup Panel. |
| Owner Admin | All `/crew/*` EXCEPT `/crew/settings/setup` | Yes | Yes | Full operational access identical to Super Admin in all areas except the Setup Panel. Can create and manage Editor, Viewer, Production, and Owner Admin accounts. Can deactivate other Owner Admin accounts. Cannot create Super Admin accounts or deactivate Super Admin accounts. Can edit and delete volunteer notes (ADMIN.33 — RLS updated Migration 028). Email blast composer: yes. Calendar direct-write: yes if `calendar_editor = true`. Introduced for OpenCall OS client deployments. Built SETUP.0. Permissions expanded ADMIN.33. |
| Editor | All `/crew/*` except Settings hub and user management | Yes | Yes | Full operational access. Cannot access Settings sub-pages (owner decision — Settings is Super Admin and Owner Admin only). Bulk email from show detail built in ADMIN.23. Full blast system built Phase 13. Calendar: by default submits events for approval; if `calendar_editor = true`, gets direct write access (events approved immediately). |
| Viewer | All `/crew/*` except Settings hub | No | No | Read-only. No edit controls rendered. Cannot access Settings sub-pages. |
| Production | `/crew/calendar`, `/crew/media`, `/crew/help`, `/crew/rehearsals` (assigned only), `/crew/auditions` (assigned only) | Calendar submission only | No | Directors and Stage Managers. Can submit events/rehearsal schedules for Super Admin approval. Cannot access volunteer database, shows, settings, or any other Production Crew section. Full read/write on assigned rehearsal schedules (Phase 21) and assigned auditions and shows (Phase AUDITIONS — AUDITIONS.2a). Assignment is per-resource and independent: show assignment (via show editors) grants access to all auditions linked to that show; direct audition assignment grants access to that audition only. Sidebar shows Calendar, Media Library, Help, Rehearsals, and Auditions. Redirected to `/crew/calendar` on login. Built CAL.2. Help page access added HELP.2a. Media Library confirmed ADMIN.30. Rehearsals added Phase 21. Show + audition access added AUDITIONS.2a. |
| Volunteer | `/callboard` | Own profile card only | No | Email or phone lookup → immediate cookie session |
| Public | `/`, `/shows/*`, `/opportunities/*`, `/forms/*`, `/update`, `/checkin/*`, `/consent/*`, `/documents/*`, `/calendar`, `/rehearsal-checkin/[token]`, `/auditions/[id]`, `/audition-checkin/[token]`, `/auditions/upload/[token]`, `/auditions/cancel/[token]` | No | No | No auth required. `/consent/[token]` — under-18 consent form upload page (token-gated). `/documents/[token]` — universal document redirect route (enforces access tier; backend-tier documents redirect to `/crew/login`). `/rehearsal-checkin/[token]` — rehearsal self check-in page (token-gated, no auth required, Production users self-report identity via roster dropdown). `/auditions/[id]` — public audition signup page (open call and timed-slot modes, role selection, material uploads, is_minor/guardian fields, consent trigger for under-18). `/audition-checkin/[token]` — audition self check-in page (token-gated, no auth required, roster dropdown identity — same pattern as rehearsal check-in). `/auditions/upload/[token]` — late material upload page; upload_token from signup confirmation email; P-DC pattern. `/auditions/cancel/[token]` — audition signup cancellation page; cancel_token from confirmation email; sets status = 'withdrawn'. |

**`calendar_editor` flag:** A boolean column on `admin_users` (default false, added Migration 017). When true on an Editor, Viewer, or Owner Admin account: that user gets direct write access to the calendar (events saved as `approved` immediately, Book Space button visible). When false: all calendar submissions go to the pending approval queue for Super Admin assignment and approval. Cannot be set on `super_admin` or `production` accounts (DB CHECK constraint enforces this; `owner_admin` CAN have `calendar_editor = true` — CHECK constraint updated in Migration 023). **UI toggle built CAL.6** on `/crew/settings/users` (Super Admin only) via `toggleCalendarEditor()` server action in `lib/actions/users.ts`. Logged to `audit_log` as `user.calendar_editor_change`.

**Auth model:** Admin accounts exist in `admin_users` table (linked to Supabase Auth). Admins authenticate via email/password or Google OAuth — both routes verify the `admin_users` record before granting access. Volunteers are NOT Supabase Auth users — they identify themselves via email or phone lookup on the Call Board; a match sets a 7-day cookie session with no magic link or email step required.
**Admin accounts:** Created by Super Admin OR via the self-registration "Request Access" flow on the login page. Production accounts can be created two ways: (1) directly by Super Admin via CreateUserModal (Super Admin callers only — added ADMIN.33), or (2) via the Request Access flow, assigned `role = 'production'` by Super Admin or Owner Admin on approval (added ADMIN.33/34). Owner Admin accounts can be created directly by both Super Admin and Owner Admin callers, and assigned via the registration approval flow by both callers. Google OAuth callback updated in CAL.3 to redirect production-role users to `/crew/calendar` instead of `/crew/dashboard`.

**Google OAuth registration path (built ADMIN.36):** A user with no `admin_users` row who authenticates via Google OAuth is routed through the same Request Access approval flow as email/password self-registration — `app/auth/callback/route.ts` inserts a `pending_registrations` row and notifies active Super Admins, exactly as `registerAdminRequest()` does for the email/password path. Google-registered pending requests are approved/declined identically to email/password requests via `approveRegistration()` / `declineRegistration()`. The callback uses two Supabase clients with different responsibilities: the session client (`createServerClient()`) handles code exchange, the `admin_users` lookup, and `signOut()` when blocking an inactive account; the admin client (`getAdminClient()`) handles all `pending_registrations` operations and the `email_log`/`email_log_recipients` inserts for the new-registrant notification — required because a newly-OAuth'd user has a valid Supabase Auth session but is not yet a Super Admin, and fails the `pending_registrations` RLS policy under the session client.

**`is_active` gating on the Google OAuth path (fixed ADMIN.38):** The callback's `admin_users` lookup originally selected only the columns needed to establish identity, omitting `is_active` — a deactivated admin could complete Google OAuth and reach `/crew/dashboard` despite being deactivated everywhere else. Fixed: the SELECT was widened to include `is_active`; when `is_active === false`, the callback calls `supabase.auth.signOut()` on the session client BEFORE redirecting to `?error=not_authorized` — a bare redirect without sign-out would leave a live Supabase Auth session in the browser. This matches the sign-out-before-redirect pattern the email/password path already used via `getAdminUser()`.

**Proxy/Middleware (CAL.2, renamed ADMIN.28):** Route protection is handled by `proxy.ts` at the repo root (renamed from `middleware.ts` to `proxy.ts` in ADMIN.28 — Next.js 16 convention). Production-role users are restricted — any `/crew/*` route other than `/crew/calendar`, `/crew/calendar/*`, and `/crew/help` redirects to `/crew/calendar` (`/crew/help` exception added HELP.2a). Owner Admin is permitted on all `/crew/*` routes EXCEPT `/crew/settings/setup` (hard-redirect to `/crew/dashboard`). Self-registered accounts are held in `pending_registrations` with status = 'pending' until a Super Admin approves and assigns a role. Super Admins receive an email notification on each new registration request. Feature flag route guards (SETUP.1): `proxy.ts` matcher extended to include public routes `/calendar` and `/checkin/:path*`. When a flagged feature is off, proxy blocks: `/crew/calendar` and `/crew/calendar/*` (`feature_calendar`); `/crew/tools/checkin` (`feature_checkin`); `/crew/communication` (`feature_blast`); `/calendar` (`feature_calendar`); `/checkin/*` (`feature_checkin`). Flag fetch is conditional — only fires when the request path matches one of the five guarded paths. Uses `getAdminClient()` and `getFeatureFlags()`.

**Phase 21 proxy.ts additions (21.2 + 21.3):** Four changes were made to `proxy.ts` across Phase 21: (1) `needsFlagCheck` extended to cover `/crew/rehearsals` (21.2) and `/rehearsal-checkin/` paths (21.3 — required a separate condition; the `/crew/rehearsals` addition did not cover it). (2) Production-role restriction exception: `!pathname.startsWith('/crew/rehearsals')` added to the Production allowlist alongside `/crew/calendar`, `/crew/help`, and `/crew/media`. Production users may access the Rehearsals route tree; per-schedule filtering happens at the data layer. (3) Crew-route flag block for `/crew/rehearsals` added after the calendar/checkin/blast blocks — redirects to `/crew/dashboard` when `flags.rehearsals` is false. (4) `/rehearsal-checkin/:path*` added to the matcher array (21.3, before the public flag block was written — SETUP.1 F1 discipline); public flag block redirects to `/` when `flags.rehearsals` is false and pathname starts with `/rehearsal-checkin/`.

**Phase AUDITIONS proxy.ts additions (AUDITIONS.2a + AUDITIONS.3a/3b):** Five changes required across Phase AUDITIONS: (1) `needsFlagCheck` extended to cover `/crew/auditions` and `/audition-checkin/` paths — two separate conditions, same pattern as Phase 21 rehearsals. (2) Production-role restriction exception: `!pathname.startsWith('/crew/auditions')` added to the Production allowlist — Production users may access the Auditions route tree; per-audition access filtering happens at the data layer. (3) Crew-route flag block for `/crew/auditions` added after the rehearsals block — redirects to `/crew/dashboard` when `flags.auditions` is false. (4) `/auditions/:path*` and `/audition-checkin/:path*` added to the matcher array BEFORE any flag block or guard logic is written (SETUP.1 F1 discipline — matcher must cover all guarded paths before guards are written). (5) Public flag block redirects to `/` when `flags.auditions` is false and pathname starts with `/auditions/` or `/audition-checkin/`.

---

## 8. Complete Feature Set

### Public — Volunteer Signup Landing Page (`/`)
- Branded, mobile-first landing page in 30 By Ninety visual identity
- Accessible via QR code (in programs and print)
- Heading reads "Welcome to the {org_name} Volunteer Family" above the fold and "Join the {org_name} Volunteer Community" above the form — both dynamic from `app_settings.org_name` via `resolveOrgIdentity()` (ADMIN.31/ADMIN.33). Footer displays `org_contact_email` (mailto link), `org_website_url` (link), and `org_location` (text) when set. Copyright line uses `{org_name}` dynamically (ADMIN.31b). `app/page.tsx` uses `getAdminClient()` — correct for public page with no admin session (corrected ADMIN.31).
- OpenCall OS public page org identity sweep (ADMIN.33): All 13 public-facing pages and the admin Sidebar now use `resolveOrgIdentity()` for dynamic logo, alt text, and copyright. Affected pages: `app/not-found.tsx`, `app/cancel/page.tsx`, `app/calendar/page.tsx`, `app/opportunities/[id]/page.tsx`, `app/forms/[id]/page.tsx`, `app/crew/(auth)/login/page.tsx`, `app/consent/[token]/page.tsx`, `app/callboard/page.tsx`, `app/checkin/[token]/page.tsx`, `app/shows/page.tsx`, `app/shows/[id]/page.tsx`, `app/page.tsx` (second heading fixed), `components/crew/Sidebar.tsx` (logo — org fetched in layout, passed as prop). Dynamic logo pattern: `src={org.org_logo_url || '/logo.png'}`, alt text: `{org.org_name}`, copyright: `© {org.org_name}`.
- Conditional announcement banner renders BELOW the logo/header area (not above). Full-width, bg-orange, prominent. Admin-controlled on/off.
- Consent form link removed from the landing page. Under-18 volunteers receive a personalized consent form request email automatically during signup when `is_minor = true` (built Phase 15.2). The email contains a unique `/consent/[upload_token]` link for uploading the signed form. Adults never see a consent form prompt on the landing page.
- Two equal-weight outlined CTA buttons above the signup form: "Update My Info" (→ `/update`) and "View Opportunities" (→ `/callboard`). Appear below the bridging text, above the form.
- **Upcoming Auditions card (Phase AUDITIONS):** When `feature_auditions` is on, a card or section showing published upcoming auditions appears on the landing page. Each entry links to `/auditions/[id]`. Hidden entirely when no auditions are published or the flag is off.
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
  - Preferred contact method (built 19.1–19.3): optional dropdown (Email / Phone / No preference). Maps to `volunteers.communication_preference`. Advisory only — no system enforcement.
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
- Preferred contact method (built 19.2): preference field pre-filled from `volunteers.communication_preference`. Same options as signup form. Submits via `updateVolunteerInfo()` in `app/update/actions.ts` — the public-route action for this form, distinct from `updateVolunteer()` in `lib/actions/volunteers.ts` (the admin-session action used by the Production Crew backend). Any future field added to the volunteer profile that must also be editable here needs to be added to both action files; missing one silently drops the field on whichever path was skipped (gap confirmed and closed in 19.2).
- On submit: update record, send "Your info has been updated" email

### Public — Show Listing (`/shows`)
- Lists all shows with status = 'live' that have at least one open slot in any role
- Shows with no open slots hidden entirely
- Per-show card: name, type, dates, open roles with slot counts, "Volunteer" button
- Mobile-first, QR-friendly
- **Upcoming Auditions card (Phase AUDITIONS):** When `feature_auditions` is on, a card or section appears on this page showing all published upcoming auditions. Each entry links to `/auditions/[id]`. Hidden entirely when no auditions are published or the flag is off.

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
- Preferred contact method (built 19.3): preference badge displayed on the volunteer card. Volunteer can update preference inline via a select element (calls `updateCallboardPreference()` in `lib/actions/callboard.ts`).
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

### Public — Check-In Page (`/checkin/[token]`) — Built Phase 14

**Two QR types, one route.** The `[token]` can be either a `show_dates.check_in_token`
(per-date QR) or a `shows.check_in_token` (whole-show QR). The route resolves which
table the token belongs to by querying `show_dates` first, then `shows` as a fallback.

**Per-date token:** Resolves directly to one show date. Volunteer enters email or phone,
system matches against `slot_claims` for that date, auto-marks Showed.

**Whole-show token:** Auto-selects the nearest upcoming show date (today or future in CT).
A date picker appears when the show has multiple upcoming dates — volunteer can confirm
or choose a different date.

**Lookup result states:**
- Found + not yet checked in → inserts `attendance` row (`status = 'showed'`,
  `source = 'checkin'`, `marked_by = null`, hours from 3-tier fallback, `hours_confirmed
  = false`). Triggers `checkFirstCall()` + `checkMilestones()` non-blocking. Success state
  with volunteer name.
- Already checked in → idempotent success ("You're already checked in").
- Not found (no slot claim for this volunteer + date) → "You're not on the list yet"
  → reveals inline full signup form (same fields as the public landing page, same
  `app_settings` toggles respected). Submitting creates the volunteer record, sends
  confirmation email, inserts `attendance` with `slot_claim_id = null` (walk-in),
  triggers `checkFirstCall()`. Success: "You're all checked in — check your email."
- Invalid/expired token → static branded error page.
- Date in the past (in CT) → "This check-in period has ended."

**Architecture:** Public Server Component at `app/checkin/[token]/page.tsx` (no route group,
same pattern as `/opportunities/[id]`). Client Component `CheckInClient.tsx` manages all
interactive state. Server actions in `lib/actions/checkin.ts` (uses `getAdminClient()` —
no session on public route). Uses `formatCT(new Date(), 'yyyy-MM-dd')` for CT date comparison.
Inline signup uses XHR (not fetch) for upload progress; react-hook-form + zod via
`createCheckInSignupSchema(showAgeRange)` factory. No `<form>` element (project constraint).

**`/consent/[token]` — Under-18 Consent Form Upload Page (built Phase 15.2):**
Public page at `app/consent/[token]/page.tsx`. Token comes from `consent_form_submissions
.upload_token`. Three server-rendered states: (1) invalid token → static error; (2)
already submitted (`submitted_file_path IS NOT NULL`) → "received" confirmation; (3)
pending → renders `ConsentUploadForm.tsx`. Upload uses P-DC pattern: `getConsentUploadUrl()`
generates a Supabase signed upload URL, client PUTs directly to `media` bucket under
`consent-forms/[volunteer_id]/[submission_id]/`, then `confirmConsentSubmission()` records
the path. XHR used for progress indicator. Accepted types: PDF, JPG, PNG, GIF, WebP.
Tokens are permanent until submission. Light mode only, mobile-first, max-w-[480px].

### Admin — Production Crew (`/crew`)

**General:**
- **Light/Dark Mode:** The admin UI supports a Light/Dark mode toggle in the crew sidebar (sun/moon icon, bottom of sidebar). Preference persisted to localStorage. Always defaults to light mode when no saved preference exists — `prefers-color-scheme` OS detection was explicitly removed in ADMIN.27. Implemented via Tailwind v4 `@variant dark` scoped to `[data-theme="dark"]` on the admin layout wrapper. Dark palette uses static hex values in `@theme` (dark-bg, dark-surface, dark-border, dark-nav, dark-text, dark-muted). Public pages unaffected.

  **Dark mode cascade defect — resolved ADMIN.39a–c:** A systemic PostCSS cascade ordering defect was confirmed in ADMIN.35-AUDIT and fully resolved across 54 files in ADMIN.39a–c. Root cause: hand-authored `@layer utilities` classes (e.g. `bg-brand-primary-light`) compile at ~line 2880 of the PostCSS output; Tailwind's auto-generated dark: utilities compile at ~line 2362. Equal specificity (0,0,1,0) — last-in-cascade wins. Any element pairing a hand-authored brand utility with a native dark: utility on the same property rendered the light-mode brand color in both modes.

  Fix pattern: replace `bg-brand-primary-light` with a static Tailwind neutral (`bg-gray-50`, `bg-white`, or `bg-gray-100` depending on element context and dark: target) on each affected element. The dark: classes were preserved throughout — they were correct intent, just losing to the cascade. Special cases addressed: three zebra-stripe dark targets corrected (dark-surface → dark-bg); two dark hover targets corrected (RecurrenceScopePicker: dark-surface → dark-border; FieldRow: dark-nav → dark-border); one incorrectly swept badge dark class removed (ShowDetail:421 — dark:bg-dark-nav removed, brand base preserved); heading text fixed via `dark:text-brand-primary-mid` (not dark:text-dark-text — the latter is a native class and would lose to the hand-authored base via the same cascade defect).

  Light mode visual impact: uniform subtle brand tint removal across all admin card headers, table headers, badges, and button hover states. `bg-brand-primary-light` was an 8% brand/92% white blend; replacements are pure neutrals (`bg-gray-50`, `bg-white`, `bg-gray-100`). The shift is uniform and intentional — tradeoff accepted in ADMIN.35 and applied consistently throughout ADMIN.39a–c.

  **ADMIN.40 (complete):** `OpportunityForm.tsx:99,115` — two `has-[:checked]:` radio-card elements (claim-type selector). Single-part fix: `has-[:checked]:bg-brand-primary-light` → `has-[:checked]:bg-white`. Dark target `dark:has-[:checked]:bg-dark-surface/50` confirmed correct (card sits over `dark:bg-dark-bg` canvas — not a self-match). Commit 1da6b04.

  **globals.css opacity-variant gap — closed ADMIN.41/42:** A separate bug class from R35 was discovered in `components/ui/button.tsx` during ADMIN.40's F7 sweep: hand-authored `@layer utilities` classes do NOT auto-generate opacity-suffix variants (`/NN`) or pseudo-class-stacked combinations (`hover:/NN`, `focus-visible:/NN`, `dark:hover:/NN`). Each combination requires its own explicitly authored rule in globals.css. Missing rules produce silent CSS failures — zero visual effect, or silent fallback to a sibling class.

  ADMIN.41 closed the immediate gap: `dark:bg-brand-primary-light/30` and `dark:hover:bg-brand-primary-light/50` rules authored. Commit b050736.

  ADMIN.42-AUDIT conducted a full exhaustive audit of all 3 `components/ui/` files (button.tsx, dialog.tsx, alert-dialog.tsx — 29 brand utility class references, zero WRONG items). Confirmed 12 MISSING rules across 3 families: brand-primary (2), brand-primary-mid (1), brand-accent (9). Three had ACCESSIBILITY impact (keyboard focus rings producing no color):
  - `focus-visible:ring-brand-primary/50` — ALL button variants + dialog close button
  - `focus-visible:ring-brand-accent/20` — destructive button
  - `dark:focus-visible:ring-brand-accent/40` — dark mode

  ADMIN.42 closed all 12 gaps in a single globals.css pass. Three insertion points: after brand-primary opacity block, after brand-primary-mid opacity block, after brand-accent opacity block. Zero component files changed. Zero regressions (pure additions). Commit 2a34f44.

  The `components/ui/` primitive layer is now fully covered. See R36 in §13 for the standing rule.

  **New standing rule (R35):** See §13. Never pair a hand-authored `@layer utilities` class with a native Tailwind dark: utility on the same CSS property. Use native Tailwind pairs on both sides, or use hand-authored pairs on both sides in the correct order within the `@layer utilities` block.
- **PWA / Add to Home Screen:** Admin users (all roles) can add Production Crew to their device home screen. Admin-only scope (`/crew/`). Offline support via network-first service worker (serves cached content when offline, refreshes on open when connected). App icon: blue X on navy background. `start_url`: `/crew/dashboard`.
- **Mobile sidebar** (built 12.1): Hamburger button (Menu icon) in TopBar, visible only below the `md` breakpoint (768px). Opens a full-height slide-in drawer with overlay. Three close methods: tap overlay, tap X button inside drawer, or navigate to any route (auto-close via `usePathname()` effect). State managed via `MobileSidebarContext` (see §3). Sidebar renders as a fixed left column on tablet+ (768px+) — unchanged from original desktop behavior.

- **Help page** (`/crew/help`, built 12.2b, all roles): Single-page how-to guide. Two-column layout on desktop (sticky TOC on left, content on right). Mobile: "Jump to section" block at top collapses to full-width content. Sections: Your Volunteers · Shows · Attendance and Hours · The Volunteer Signup Form · Settings · The Volunteer Call Board · Standing Opportunities · Getting Help. 8 h2 sections, 23 h3 subsections, all with named anchor IDs. Tip callouts (blue left border) and Warning callouts (orange left border). Server Component, no data fetching. scroll-behavior: smooth. "Help" nav link added to `components/crew/Sidebar.tsx` (HelpCircle icon, all roles, bottom of nav list).
- **Tooltip system** (`components/crew/HelpTooltip.tsx`, built 12.2c): Shared Server Component wrapping a `next/link` to `/crew/help#[anchor]`. Renders a small HelpCircle icon (muted, hover-brightens). Named export. No 'use client'. 32 placements across Production Crew (see Help System section below for full list). Each links directly to the relevant help page anchor — no popovers. Safe to use in Client Components (confirmed ADMIN.29 — no server-only imports).

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
- Preferred contact method (built 19.3): `communication_preference` visible as a display-only badge appended to the Name cell in the volunteer list table (matching the `requires_service_hours` SH badge pattern — non-null values only; null rows show nothing). Preference filter built in Phase 19.3 and added to the existing filter bar (All / Email only / Phone only / Either is fine). Filter is server-side: URL param `?preference=` → `applyBaseFilters()` in `lib/volunteers/list.ts` → `.eq('communication_preference', value)`. Filter state plumbing in `lib/volunteers/url.ts`. Filter bar control in `components/crew/volunteers/FilterPanel.tsx`.
- PDF export available (Editor/Super Admin) via
  server-side route handler at `/crew/volunteers/export`.
  Landscape A4, branded header, 9-column table (added
  "Svc Hrs" column in ADMIN.17). Filter fix applied in
  ADMIN.20. Brand color architecture (THEME.4): `VolunteerListPDF.tsx` uses a `createStyles(brandPrimary, brandPrimaryLight)` factory function (called inside the component body with resolved prop values) instead of module-scope constants. `@react-pdf/renderer` calls `StyleSheet.create()` at module load time, making top-level constants invisible to component props — the factory pattern is required. The PDF route handler (`app/crew/(app)/volunteers/export/route.tsx`) fetches `brand_primary` from `app_settings` and computes `brandPrimaryLight` via `lightenHex()`, then passes both as props to `VolunteerListPDF`. Default prop values preserve the original 30BN colors as fallback.
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
- **Editor Notes:** comment-style entries — each note logged with author name + timestamp. Stacked chronologically. Visible to Editors and Super Admins only. Never visible to volunteer (RLS enforced). Editors and Super Admins can add notes (append-only for Editors). Super Admins and Owner Admins can also edit and delete existing notes (Owner Admin permission added ADMIN.33). Editors are confirmed append-only — editNote() and deleteNote() guards use ['super_admin','owner_admin'] allowlist, explicitly excluding Editor. This was re-confirmed in ADMIN.39-AUDIT F4 (session decision, July 2026). No migration needed — the RLS policies on volunteer_notes UPDATE/DELETE only cover is_super_admin_or_owner_admin(), consistent with this decision. Implemented via Migration 004 RLS policies. For preferences, scheduling considerations, history, sensitive info.
- Status toggle: Active / Archived (Editors only, confirmation prompt)
- Preferred contact method (built 19.3): editable field in the personal info section (Editors, Super Admin, Owner Admin). Displays as an informational badge alongside contact fields when view-only. Stored in `volunteers.communication_preference`. `<select>` uses `z.string().optional()` in `lib/validations/volunteerProfile.ts` — not `z.enum([...]).nullable().optional()`. An unselected `<select>` submits an empty string, which fails `z.enum()` validation silently and blocks the save at the default state; the server action normalizes `'' → null` via `|| null` (R18) before the DB write. Confirmed failure mode: the original 19.1 schema used `z.enum()` and broke every profile save where the preference was left at "No preference" — corrected in 19.3.
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
- Create new account: Name, Email, Role (Editor/Viewer/Owner Admin for SA+OA callers; Production additionally available to Super Admin only), Send Welcome Email toggle
  - Creates Supabase Auth user, inserts `admin_users` record, sends branded welcome email with login link + temp password + instructions to change password
- Deactivate/reactivate (cannot deactivate own account)
- Multiple Super Admins are supported. Deactivate button is disabled for ALL Super Admin rows in the Users table (not just own account).
- Change role (Super Admin only). Super Admin role cannot be changed via the Users panel.
- Super Admin cannot be demoted via this panel
- **`calendar_editor` toggle** (CAL.6, updated SETUP.0): on each Editor, Viewer, and Owner Admin row — grants or revokes direct calendar write access. Toggle absent on Super Admin and Production rows. Calls `toggleCalendarEditor()` in `lib/actions/users.ts`.
- **ADMIN.26:** All four user management actions (`createUser`, `deactivateUser`, `reactivateUser`, `changeRole`) migrated to `getServerClient()` with `revalidatePath('/crew/settings/users')`. Client components use `router.refresh()` instead of `window.location.href`. `changeRole()` guards: Production role cannot be set via role change; admin cannot change own role.
- **SETUP.0 + ADMIN.33 user management updates:** Role permissions expanded in ADMIN.33. Current state:
  Create account (`CreateUserModal.tsx`): Super Admin callers see Editor, Viewer, Production, and Owner Admin options. Owner Admin callers see Editor, Viewer, and Owner Admin options. Production is SA-only for direct create.
  Registration approval (`PendingRegistrations.tsx`): Both Super Admin and Owner Admin callers can assign Editor, Viewer, Production, and Owner Admin. Only Super Admin can assign Super Admin via this flow (the only path that can mint an additional Super Admin account — ADMIN.34 F1 self-caught and corrected).
  Change role (`UsersTable.tsx`): Dropdown offers Editor, Viewer, Production, and Owner Admin to all SA + OA callers. Super Admin rows always hidden (never show dropdown). Super Admin cannot be assigned via role change (server guard). Production rows now show the dropdown (previously hidden). OA-on-OA rows now show the dropdown (previously locked).
  Deactivate: Owner Admin can deactivate other Owner Admin accounts (OA-on-OA lock removed ADMIN.33). Super Admin accounts cannot be deactivated by any caller.
  Volunteer notes: Owner Admin can edit and delete volunteer notes (app-layer guards updated ADMIN.33; RLS updated Migration 028).
  Server action guards are authoritative; UI selectors match. `UsersTable.tsx`, `CreateUserModal.tsx`, `PendingRegistrations.tsx`, `lib/actions/users.ts`, `lib/actions/admin-registration.ts`, and `lib/actions/volunteers.ts` all updated.
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
  - Volunteers tab: per-role roster, attendance status, per-date filter. **"Self
    Check-In" badge** (built Phase 14.2) on attendance rows where `source = 'checkin'`
    — visually distinguishes QR self-check-ins from admin-marked attendance. Rows
    where `source = 'manual'` show no badge. `attendance.source` added to the
    data fetch in Phase 14.2.
  - Waitlist tab: ordered list per role, volunteer name + time added
  - Dates tab: read-only, all show dates in order. Past dates visually distinguished.
    **Check-in QRs (built Phase 14.2):** Whole-show QR at the top of the tab
    (links to `/checkin/[show.check_in_token]` — scanning auto-selects nearest
    upcoming date, volunteer can switch). Per-date QR on each date row (always
    visible, links to `/checkin/[show_date.check_in_token]`). Both QRs show PNG
    and SVG download links. All QR containers are white regardless of theme (QR
    scanability requirement). Generated server-side via `generateQR()` in `lib/qr.ts`.
    Both `check_in_token` columns added in Migration 024.
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
  `components/crew/shows/BulkEmailSection.tsx`. (ADMIN.34:
  the `DEFAULT_SUBJECT` constant has been removed from
  `BulkEmailSection.tsx`. The component now accepts a
  `defaultSubject` prop (type `string`) from its parent
  show detail page, which constructs the default as
  `Message from ${org.org_name}` via `resolveOrgIdentity()`.)

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
  Code" button, auto-prepends https:// if no protocol provided. QR preview renders in a white
  container regardless of dark mode (QR scanability requires white background).
- QR History Panel (added ADMIN.34): Every successful generation is saved to the `qr_codes`
  table (Migration 029). Shared across all admins (any admin sees all saved QRs). Chronological
  panel (newest first, capped at 50 rows) below the generator. Each row shows: label (or URL
  domain if no label), full URL, "Generated by [name] · [date]", PNG download link, SVG
  download link. Data URI download links — plain `<a>` tags, no JS required. Empty state:
  "No QR codes generated yet." Save is best-effort — failure never blocks returning the QR.
- `lib/actions/qr.ts` — `generateQRCode(url, label)` server action (updated ADMIN.34): trims,
  validates, prepends protocol, calls `generateQR()`, inserts into `qr_codes` (best-effort),
  calls `revalidatePath('/crew/tools/qr-generator')`, returns `{ svg, pngBase64 }` or
  `{ error }`. The `url, label` signature replaces the prior url-only signature.
- `lib/data/qr.ts` — `getQRHistory(supabase)` (new ADMIN.34): queries `qr_codes` with creator
  name join, `ORDER BY created_at DESC`, `LIMIT 50`. Returns up to 50 rows.
- Page architecture (restructured ADMIN.34): `app/crew/(app)/tools/qr-generator/page.tsx`
  (Server Component — fetches history via `getQRHistory()`) +
  `components/crew/tools/QRGeneratorForm.tsx` (Client Component — form state and generation) +
  `components/crew/tools/QRHistoryPanel.tsx` (Server Component — history list, plain `<a>`
  download links).
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
- **Gap closed (ADMIN.31):** `submitVolunteerForm()` now calls `logAction(null, 'volunteer.signup', 'volunteer', newVolunteerId, undefined, { name, email })` after successful insert. Non-blocking (try/catch, errors swallowed). `volunteer.signup` is the first entry in the Volunteers AuditAction group — distinct from `volunteer.create` (admin-created) which does not exist as a type since all volunteer creation is via public self-registration.
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
- **Shared iCalendar utility:** `lib/utils/ical.ts` — `generateVEvent()`, `wrapInCalendar()`, `buildClaimICalEvent()`, `buildAdminCalendarEvents()`. Pure TypeScript, RFC 5545 compliant, CRLF line endings, 75-octet line folding, text escaping. Updated ADMIN.33: PRODID changed to `-//OpenCall OS//Volunteer Platform//EN`; default `calName` changed to 'Volunteer Calendar'; event UID domains changed from `@30byninetyvolunteers.com` to `@opencallos.com`. Both .ics route handlers (`feed.ics` and `claim.ics`) now fetch `org_name` from `app_settings` and pass it as the `calName` to `wrapInCalendar()`.

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

**Rehearsal Management (`/crew/rehearsals`, Phase 21 — complete):**
Gated behind `feature_rehearsals` flag (R34 compliant). Visible to all roles when flag is on. Production users see only schedules they are assigned to.

**Sidebar nav link:** ClipboardList icon. Label: "Rehearsals". Positioned after Calendar. HelpTooltip → `#rehearsals`. Data-driven via NAV_ITEMS + FLAG_GATED_HREFS + Production allowlist — three-part atomic edit (Audit E, 21.A confirmed pattern).

**Schedule list (`/crew/rehearsals`):** Server Component. Columns: Title | Date range | Assignee count | Next rehearsal date | Status | View link. Note: no "Show" column — `rehearsal_batches` has no `show_id` FK; the batch title serves as the production identifier (Brief column list corrected from original spec). Active / All filter (client-side toggle, default Active). "New Schedule" button surfaces `CalendarBulkRehearsalForm` as the primary entry point for SA/OA/Editor/Production — confirmed self-contained and reusable outside CalendarShell (21.2 Task A). Viewer sees no "New Schedule" button. HelpTooltip on page header → `#rehearsals`.

**Schedule detail (`/crew/rehearsals/[id]`):** Server Component shell + Client Component tabs. Three tabs: Roster | Dates | Attendance. Production access guard: redirect to `/crew/rehearsals` if Production user is not in `rehearsal_schedule_assignments` for this batch.

*Roster tab:*
- List of schedule-level assignees: name, role badge, email
- "Add user" search (SA/OA/Editor only): filters Production admin users client-side, calls `assignUserToSchedule()`
- "Remove" per assignee (SA/OA/Editor): calls `removeUserFromSchedule()`
- Per-assignee override count: displays "Per-date overrides: [N]" (read-only in Roster tab — full override UI is in Dates tab)

*Dates tab:*
- All `calendar_events` in batch, ordered by start_time ASC
- Each row: date/time via `formatCT()` (start_time is timestamptz — NOT formatWallClockCT()), location, roster count, attendance count / total, status badge
- Expandable per-date: calls `getEffectiveRoster(eventId)` via useTransition on first expand; caches in Map<eventId, roster> so re-expand does not re-fetch
- Override controls (SA/OA/Editor only): "Exclude from this date" → `addDateOverride(eventId, userId, 'exclude')`; "Add to this date" (non-assignees) → `addDateOverride(eventId, userId, 'include')`; "Remove from this date" → `removeDateOverride()`
- QR code per date: PNG via `generateQR()` from `lib/qr.ts` (Level H, R6). Links to `/rehearsal-checkin/[check_in_token]`. White container regardless of theme (scanability — same rule as show check-in QRs from Phase 14). Pre-generated server-side in the shell page and passed as prop to avoid async calls inside the Client Component.
- Attendance column: stub "—" in 21.2, populated in 21.3

*Attendance tab:*
- Per-date sections ordered by start_time ASC
- X of Y attended summary per section header
- Expand per date: calls `getRehearsalAttendanceForEvent(eventId)` — returns ALL effective roster members (not only those with records); status = null for unmarked
- SA/OA/Editor: mark buttons for any roster member (Showed / No-Show / Excused) via `markRehearsalAttendance()` (UPSERT)
- Production: mark buttons for own row only (adminId match)
- Viewer: status badges only, no buttons
- "Mark All Present" (SA/OA/Editor, two-step inline confirm): calls `markAllRehearsalAttended()` — single batch upsert, not a loop of individual calls
- Self Check-In source badge on rows where `source = 'checkin'` (matches Phase 14.2 volunteer attendance pattern)
- HelpTooltip on Roster header → `#rehearsals-assignments`; Dates header → `#rehearsals-assignments`; Attendance header → `#rehearsals-attendance`

**Public check-in (`/rehearsal-checkin/[token]`):**
Server Component + Client Component. No Supabase Auth session required. `getAdminClient()` only (public route invariant, Process §7). File-level `// PUBLIC ROUTE` header comment. Light mode only (no dark: classes — ADMIN.6). `noindex` metadata. Branded header (org logo — matches all other public routes). Five UI states:

1. *Invalid token* — "Invalid or expired check-in link. Contact your stage manager." (rendered server-side)
2. *Valid, awaiting check-in* — rehearsal title, date, time, location; dropdown of effective roster names (self-reported identity, not email/phone lookup — key difference from Phase 14 volunteer check-in); "Check In" button disabled until name selected
3. *Success* — "You're checked in to [title] on [date]." + `formatCT(checkedInAt, 'h:mm a')`
4. *Already checked in* — "You already checked in at [time]." (reassuring, not an error)
5. *Not on roster* — "Your name is not on the roster for this rehearsal. Contact your stage manager."

Attendance record created with `source = 'checkin'`. Self Check-In badge appears on the Attendance tab for that person.

**Key new files (Phase 21):**

Server actions:
- `lib/actions/rehearsals.ts` — PUBLIC ROUTE file: `getRehearsalCheckInData()`, `checkInToRehearsal()` — `getAdminClient()` only. Note: Brief's original single-file spec was corrected — Process §7 public-route invariant requires the split into two files.
- `lib/actions/rehearsals-admin.ts` — authenticated actions: `getRehearsalSchedules()`, `getRehearsalScheduleDetail()`, `getEffectiveRoster()`, `getRehearsalAttendanceForEvent()`, `assignUserToSchedule()`, `removeUserFromSchedule()`, `addDateOverride()`, `removeDateOverride()`, `markRehearsalAttendance()`, `markAllRehearsalAttended()`

Utilities and types:
- `lib/utils/rehearsal-roster.ts` — effective-roster set-math utility (schedule assignees MINUS excludes PLUS includes); accepts supabase client as parameter (established CAL.3 pattern); shared between public and admin action files
- `types/rehearsal.ts` — all Phase 21 types including `RehearsalEventSummary` base type (includes `location_name` — join added in 21.3 Q1 when public check-in page needed it; moved to shared base so both public and admin paths benefit)

Pages and components:
- `app/crew/(app)/rehearsals/page.tsx` — schedule list
- `app/crew/(app)/rehearsals/[id]/page.tsx` — detail shell
- `components/crew/rehearsals/RehearsalsListClient.tsx`
- `components/crew/rehearsals/RehearsalDetailTabs.tsx`
- `app/rehearsal-checkin/[token]/page.tsx` — public check-in
- `components/rehearsal-checkin/RehearsalCheckInClient.tsx`

**Audition Management (`/crew/auditions`, Phase AUDITIONS — pre-launch):**
Gated behind `feature_auditions` flag (R34 compliant). Visible to Super Admin, Owner Admin, Editor, Production (assigned only), and Viewer (read-only). Production users see only auditions and shows they are explicitly assigned to.

**Audition types:** Open call (no slots) or timed slots (configurable slot duration, total slot count, and cap per slot — 1 for appointment model, N for group session). Both types support callbacks as linked child auditions via `parent_audition_id` FK.

**Show linkage:** An audition can optionally be linked to a show via nullable `show_id` FK, or exist as a standalone audition. Both are supported.

**Per-audition configuration (admin-controlled at creation):**
- Type (open_call / timed_slots), slot config (duration, total, cap per slot)
- Role/character selection: toggle on/off. When on: admin defines a list of roles via `audition_roles` table; auditioners pick from this list at signup.
- Material uploads: per-type toggles (headshot image, resume PDF, sheet music PDF, MP3/backing track, video reel). Each independently enabled/disabled per audition.
- Calendar visibility: admin_only or public (public auditions sync to `calendar_events` as `event_type = 'audition'`).
- Notification emails: toggle (default off). When on: status change to Callback, Cast, or Not Cast automatically sends the configured template for that audition. When off: no automatic send; manual bulk email still available.

**Production assignment model:** Two independent paths grant a Production user access to an audition. (1) Show assignment: Production user added to a show via the show editors mechanism — grants full read/write on that show AND all auditions linked to it via `show_id`. (2) Direct audition assignment: Production user added to a standalone audition via `audition_assignments` join table — grants full read/write on that audition only. Neither path implies the other. Managed from the audition detail Settings tab.

**Audition list (`/crew/auditions`):** Server Component. Columns: title, linked show (or "Standalone"), type badge, date(s), signup count, status. Active / All filter (client-side toggle, default Active). "New Audition" button (SA/OA/Editor/Production — Production users who are newly creating an audition are responsible for assigning themselves). Viewer sees no "New Audition" button.

**Audition detail (`/crew/auditions/[id]`):** Server Component shell + Client Component tabs. Six tabs:

*Overview* — title, dates, type, show link (if any), parent audition link (if callback), status toggle (Draft / Published / Closed / Archived), public URL copy button, auditions card preview. **Check-in QR display:** SVG inline (via `dangerouslySetInnerHTML`) for display + PNG + SVG download links with fixed filenames (same pattern as show and rehearsal QRs — white container, scanability-safe regardless of dark mode). Shell page generates both `svg` and `pngBase64` via `generateQR()` and passes both as props.

*Signups* — full auditioner roster with expandable rows (same pattern as Rehearsal attendance tab). Collapsed per row: name, email, slot/time, role selected, status badge, material indicators (✓ per type submitted). Expanded per row: private admin notes (append-only, Editor+), cast role assignment field, communication history for this auditioner, status changer, "Convert to Volunteer" button (visible when status = Cast; SA/OA/Editor only — inserts `volunteers` record pre-populated with name/email/phone, logs to audit_log, no automatic Supabase Auth account created). SA/OA/Editor/Production (assigned): full read/write including status changes and notes. Viewer: read-only status badges only.

*Materials* — aggregate view of all submitted materials, filterable by type. Per row: auditioner name, material type badge, upload date, view/download link.

*Communication* — ad-hoc bulk email to all signups for this audition, or filtered by status (Callback only / Cast only / Not Cast only / all). TipTap composer (same as blast composer). Separate from the template system — for ad-hoc sends only.

*Email Templates* — three independently configurable email templates, one per status transition: Callback, Cast, and Not Cast. Each template section has a TipTap editor (`useEditor` with `immediatelyRender: false` — required for SSR/hydration safety, matches BlastComposer.tsx pattern) with a merge tag inserter toolbar (one button per MERGE_TAGS entry calls `editor.commands.insertMergeTag(tag)`), a live preview panel (`previewAuditionEmailTemplate()` server action substitutes sample values and returns branded HTML), and a Save button (`saveAuditionEmailTemplate()`). Notification emails enabled/disabled toggle at the top of the tab (default off) — calls `updateAudition()` with `notification_emails_enabled` field. If no template exists for a status, automatic firing is silently skipped even when the toggle is on — prevents blank emails. Template content stored in `audition_email_templates` table (one row per audition per status type). Supported merge tags: `{{auditioner_name}}`, `{{show_title}}`, `{{audition_title}}`, `{{audition_date}}`, `{{audition_location}}`, `{{role_name}}`, `{{cast_role}}`, `{{org_name}}`. Template content is lazy-loaded when the tab first opens; editor content initialized via `editor.commands.setContent()` after load (not via `useEditor` content prop — async data arrives after mount). Three separate `useEditor()` instances at component top level (React hooks rules — not in a loop).

*Settings* — all audition configuration (type, slot config, role selection list, material toggles, calendar visibility, show link, parent audition link for callbacks, `audition_assignments` roster for Production users, archive/delete actions).

**Public signup page (`/auditions/[id]`):**
Public Server Component + Client Component. `getAdminClient()` only. Light mode only. `noindex` metadata. Branded header (`resolveOrgIdentity()`). Shows audition title, description, date(s)/time(s), location. Form fields: name (required), email (required), phone (required), age range / is_minor, guardian name + phone (when is_minor = true), role selection (when enabled for this audition — dropdown from `audition_roles`), time slot picker (when timed_slots type — grid of available slots; full slots shown as unavailable/grayed), material uploads (whichever types are enabled — inline P-DC upload, one per type). Duplicate detection by email per audition — friendly message if already registered. On submit: sends `sendAuditionSignupConfirmation()` containing a cancel link (via `cancel_token`) and an upload link (via `upload_token`) for submitting missed materials later. Under-18 auditioners: non-blocking consent trigger — queries `document_types` for `slug = 'cast_consent_form'` and `is_active = true`, inserts `consent_form_submissions` row (with `audition_signup_id` FK set — added in Migration 032), sends `sendAuditionConsentFormRequestEmail()` (audition-specific function, NOT `sendConsentFormRequestEmail()` which is volunteer-specific). Same non-blocking try/catch pattern as Phase 15.2 volunteer consent; uses the separately-seeded `cast_consent_form` system document type.

**Self-cancel:** Via `cancel_token` link in confirmation email. Links to `/auditions/cancel/[token]` (public Server Component page, built AUDITIONS.4b). Page calls `cancelAuditionSignup(token)`, sets status = 'withdrawn', sends `sendAuditionCancellationEmail()`. Shows success or "link not valid" state. `resolveOrgIdentity()` branded header. `noindex`.

**Late material upload:** Via `upload_token` link. Unique per signup. Routes to `/auditions/upload/[token]` — allows uploading any material type that was enabled for the audition but not submitted at signup. Same P-DC pattern as Phase 15.

**Public auditions card:** A card or section on the landing page (`/`) and `/shows` showing all published upcoming auditions. Each card entry: audition title, linked show name (if applicable), date(s), "Sign up to audition →" link to `/auditions/[id]`. Visible when `feature_auditions` is on. Does not require a dedicated `/auditions` listing page.

**Check-in (day-of):** `check_in_token` on the `auditions` table. Public self-check-in at `/audition-checkin/[token]`. Same five UI states as rehearsal check-in: invalid token, awaiting check-in, success, already checked in, not on roster. Auditioner picks their name from the effective signup roster dropdown — self-reported identity, not email/phone lookup. Attendance record created with `source = 'checkin'`. Self Check-In badge appears on the Signups tab for that row. Admin can also mark attendance manually from the Signups tab (`source = 'manual'`).

**Calendar integration:** When `calendar_visibility = 'public'`, the audition syncs to `calendar_events` as `event_type = 'audition'`, `status = 'approved'`. Sync follows the same `syncShowDateToCalendar()` pattern extended for auditions. Public `/calendar` shows it when visibility is public. Admin calendar always shows it.

**Email functions (all in `lib/email.ts`, all exported — AUDITIONS.4b):**
- `sendAuditionSignupConfirmation()` — sent on successful signup. Contains cancel link (`/auditions/cancel/${cancelToken}`), upload link (`/auditions/upload/${uploadToken}`), audition details.
- `sendAuditionConsentFormRequestEmail()` — sent for under-18 auditioners. Separate from `sendConsentFormRequestEmail()` (volunteer version) — uses audition-specific copy. Same upload CTA (`/consent/[uploadToken]`) and conditional download CTA pattern. trigger: `'audition_consent_form_request'`.
- `sendAuditionStatusEmail({ signupId, auditionId, status })` — fires when notification toggle is on and a template exists for the given status. Fetches template internally, runs `substituteMergeTags()`, sends single-recipient email. trigger: `'audition_status_${status}'`. Silent skip if no template.
- `sendAuditionCancellationEmail({ to, name, auditionTitle })` — sent when auditioner cancels via cancel token link. trigger: `'audition_cancellation'`.
- All logged to `email_log` / `email_log_recipients`. `recipient_type = 'transactional'` for all four.

**Key files (Phase AUDITIONS):**
Server actions:
- `lib/actions/auditions.ts` — PUBLIC ROUTE file: `getAuditionPublicData()`, `submitAuditionSignup()`, `cancelAuditionSignup()`, `getAuditionUploadData()`, `confirmAuditionMaterialUpload()`, `getAuditionCheckInData()`, `checkInToAudition()`, `getAuditionMaterialUploadUrl()`, `getUpcomingAuditions()` — `getAdminClient()` only.
- `lib/actions/auditions-admin.ts` — authenticated: `getAuditionList()`, `getAuditionDetail()`, `createAudition()`, `updateAudition()`, `updateAuditionStatus()`, `updateAuditionSignupStatus()`, `addAuditionNote()`, `assignProductionUser()`, `removeProductionUser()`, `sendAuditionBulkEmail()`, `saveAuditionEmailTemplate()`, `getAuditionEmailTemplates()`, `convertToVolunteer()`, `getAuditionMaterialSignedUrl()`, `previewAuditionEmailTemplate()`, `createAuditionRole()`, `deleteAuditionRole()`, `reorderAuditionRoles()`, `getAuditionsSelectData()`.
Utilities and types:
- `types/audition.ts` — all Phase AUDITIONS types.
Pages and components:
- `app/crew/(app)/auditions/page.tsx` — admin list
- `app/crew/(app)/auditions/[id]/page.tsx` — admin detail shell (passes both svg + pngBase64 from generateQR to tabs)
- `components/crew/auditions/AuditionsListClient.tsx` — list + creation modal
- `components/crew/auditions/AuditionDetailTabs.tsx` — six tabs (Overview, Signups, Materials, Communication, Email Templates, Settings — all fully implemented)
- `components/crew/auditions/MergeTagExtension.ts` — custom TipTap Node extension (inline/atom, data-merge-tag round-trip, insertMergeTag command, module augmentation)
- `lib/utils/merge-tags.ts` — pure utility: MERGE_TAGS const, MergeTagValues type, substituteMergeTags()
- `app/auditions/[id]/page.tsx` — public signup page
- `app/auditions/upload/[token]/page.tsx` — late material upload page
- `app/auditions/cancel/[token]/page.tsx` — signup cancellation page (AUDITIONS.4b)
- `app/audition-checkin/[token]/page.tsx` — public check-in
- `components/audition/AuditionSignupClient.tsx` — full form including slot picker, materials, description display
- `components/audition/AuditionUploadClient.tsx` — late upload form
- `components/audition-checkin/AuditionCheckInClient.tsx`

**Communication (`/crew/communication`, built Phase 13.3a/b):**
Full email blast composer. Editor and Super Admin only
(Viewers see a locked message). Stub replaced entirely.

Access: Editor and Super Admin can compose and send. Owner Admin has full blast access (same as Super Admin). Viewers see a locked message explaining that email sending requires Editor or higher access.

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

**In-App Help System (`/crew/help`, HELP phase + ADMIN.30 — complete):**
Role-filtered single-page help guide. The page reads the current admin's role and `calendar_editor` flag via `getAdminUser()` and renders only the sections relevant to that role. TOC is dynamically built from the same role-filtered section registry (`ALL_SECTIONS` array in `components/crew/help/HelpContent.tsx`).

Page structure: Server Component shell at `app/crew/(app)/help/page.tsx` passes role and `calendarEditor` to `HelpContent` component. `HelpContent.tsx` contains: `TocSection` type, `ALL_SECTIONS` registry, `filterSections()` + `isSectionVisible()` + `flattenSections()` helpers, Tip/Warning callout components, role-aware `TocList`, and all section JSX. Note: ALL_SECTIONS is a pure TOC/role registry — section content lives in guarded JSX blocks in the component return body.

Role visibility:
- Super Admin: all 14 sections
- Owner Admin: same as Super Admin (Settings section visible — owner_admin gets Settings access). All non-Settings ALL_SECTIONS entries now include `owner_admin` — fixed in HELP.2e (47 entries updated).
- Editor: all sections except Settings
- Viewer: all sections except Settings and Communication; no edit-only subsections
- Production: Master Calendar, Media Library, Getting Help, and Rehearsals

All 15 sections (in order — confirmed against the live `ALL_SECTIONS` array, AUDITIONS.4b): Dashboard · Your Volunteers · Shows · Attendance and Hours · The Volunteer Signup Form · Settings · Master Calendar · Communication · Check-In System · Media Library · The Volunteer Call Board · Standing Opportunities · Getting Help · Rehearsals · Auditions

Sections and anchors: 15 h2 sections, ~50 subsections, all with named anchor IDs. Key anchors (must-preserve — 9 original HelpTooltip targets): `hours`, `milestones`, `default-hours`, `volunteer-profile`, `publish-show`, `categories`, `volunteer-communication`, `show-volunteers`, `waitlist`. HELP phase anchors: `dashboard`, `dashboard-stats`, `dashboard-season`, `dashboard-feed`, `calendar`, `calendar-overview`, `calendar-submit`, `calendar-direct-create`, `calendar-bulk-rehearsal`, `calendar-recurring`, `calendar-pending`, `calendar-book-space`, `calendar-export`, `calendar-public`, `communication`, `blast-compose`, `audit-log`, `location-management`, `email-activity-log`. ADMIN.30 anchors: `check-in`, `check-in-qr`, `check-in-dashboard`, `document-types`, `consent-forms`, `media-library`, `media-library-upload`, `media-library-access`. Phase 21 anchors: `rehearsals`, `rehearsals-schedules`, `rehearsals-assignments`, `rehearsals-attendance`, `rehearsals-checkin`. Phase AUDITIONS anchors: `auditions`, `auditions-overview`, `auditions-signups`, `auditions-materials`, `auditions-checkin`.

HelpTooltip placements: 40 total. Original 17 (12.2c): dashboard card headings, volunteer profile sections, show detail, show form, volunteer list milestone filter, settings. HELP.2d (5): `SeasonAtAGlance.tsx` → `dashboard-season`; `communication/page.tsx` → `blast-compose`; `settings/locations/page.tsx` → `location-management`; `settings/audit-log/page.tsx` → `audit-log`; `settings/email-activity/page.tsx` → `email-activity-log`. ADMIN.29 (4): `CalendarShell.tsx` → `calendar-submit`, `calendar-export`, `calendar-book-space`; `PendingQueueClient.tsx` → `calendar-pending`. ADMIN.30 (6): `app/crew/(app)/tools/checkin/page.tsx` → `check-in-dashboard`; `ShowDetail.tsx` (Dates tab) → `check-in-qr`; `DocumentTypesManager.tsx` → `document-types`; `ConsentSubmissionsQueue.tsx` (×2 — empty-state + main render) → `consent-forms`; `MediaLibrary.tsx` → `media-library-access`. Phase 21 (5): `Sidebar.tsx` → `rehearsals` (nav link); `rehearsals/page.tsx` → `rehearsals` (list header); `RehearsalDetailTabs.tsx` → `rehearsals-assignments` (Roster tab), `rehearsals-assignments` (Dates tab), `rehearsals-attendance` (Attendance tab). Phase AUDITIONS (3): `app/crew/(app)/auditions/page.tsx` → `auditions` (list page header — placed in Server Component, not list client); `AuditionDetailTabs.tsx` → `auditions-signups` (Signups tab header); `AuditionDetailTabs.tsx` → `auditions-materials` (Materials tab header). NOTE: the Auditions sidebar nav link HelpTooltip is handled by the generalized Sidebar special-case (both `/crew/rehearsals` and `/crew/auditions` handled in one dynamic block — AUDITIONS.2b).

Production sidebar: Help link added (HELP.2b). Media Library link also visible to Production (ADMIN.30 confirmed — Production has `/crew/media` sidebar access). Rehearsals link visible to Production (Phase 21). Auditions link visible to Production (Phase AUDITIONS). HelpContent Auditions section visible to Production role (Phase AUDITIONS — same visibility as Rehearsals).

Settings section (owner decision): Settings is Super Admin + Owner Admin only (`roles: ['super_admin', 'owner_admin']`). The two new Settings subsections added in ADMIN.30 (`document-types`, `consent-forms`) follow the same SA/OA-only guard.

Key files: `app/crew/(app)/help/page.tsx` (thin shell), `components/crew/help/HelpContent.tsx` (full content + role logic). Note: two previously hardcoded 30BN-specific references in `HelpContent.tsx` were replaced with generic language in ADMIN.33: the Reply-To default email address now reads "your organization's contact email"; the example platform URL now reads "your platform URL followed by /callboard".

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
| Announcement Banner | `/crew/settings/announcement` | Super Admin + Owner Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") |
| Hearing Options | `/crew/settings/hearing-options` | Super Admin + Owner Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") |
| Signup Form | `/crew/settings/signup-form` | Super Admin + Owner Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") |
| General Defaults | `/crew/settings/general` | Super Admin + Owner Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") |
| Category Management | `/crew/settings/categories` | Super Admin + Owner Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") |
| User Management | `/crew/settings/users` | Super Admin + Owner Admin (LinkedCard, with restrictions — see §7); Editor + Viewer (LockedCard "Super Admin only") |
| Audit Log | `/crew/settings/audit-log` | Super Admin + Owner Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") |
| Email Activity | `/crew/settings/email-activity` | Super Admin + Owner Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") — built 13.1 |
| Document Management | `/crew/settings/documents` | Super Admin + Owner Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") — built Phase 15.1; "Beta" badge removed 15.1 Q2 fix |
| Location Management | `/crew/settings/locations` | Super Admin + Owner Admin (LinkedCard); Editor + Viewer (LockedCard "Super Admin only") — **built CAL.8** |
| Platform Setup | `/crew/settings/setup` | Super Admin ONLY (LinkedCard); Owner Admin + Editor + Viewer (LockedCard "Super Admin only") — Phase SETUP |

**Email Activity (`/crew/settings/email-activity`, built Phase 13.1 — Super Admin only):**
Global log of all emails sent by the platform. Three tabs via `?tab=` URL param:
- All Emails — paginated reverse-chronological log of all `email_log` rows. 25/page, `?page=N`.
- System Only — same log filtered to `sent_by IS NULL` (system-triggered emails only).
- About System Emails — static trigger catalog listing all 15 automated email triggers, when each fires, who receives it, and spam protections in place. Phase AUDITIONS added 4 audition triggers: audition signup confirmation, audition consent form request, audition status notification, audition cancellation.

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

**Platform Setup (`/crew/settings/setup`) — Built Phase SETUP (SETUP.0–4 complete):**
Super Admin-only configuration panel for OpenCall OS deployments. Hard-blocked for all other roles including Owner Admin (`proxy.ts` hard-redirect to `/crew/dashboard`). Not visible in sidebar for non-Super-Admin accounts. Settings hub: "Platform Setup" LinkedCard for Super Admin; LockedCard ("Super Admin only") for all other roles. Page double-guarded: `proxy.ts` + server-side role check.

Eight independently-saving sections (each has its own Save button — no "Save All"):

Section 1 — Organization Identity: `org_name`, `org_tagline`, `org_contact_email`, `org_website_url`, `org_location`. Text inputs. Used in email templates, page title (`generateMetadata()`), public landing page heading and footer (via `resolveOrgIdentity()`).

Section 2 — Brand Colors: `brand_primary`, `brand_accent`. Native `<input type="color">` pickers (same pattern as Location Management). Phase THEME complete — brand colors now propagate dynamically across all rendering surfaces: public pages and admin UI via CSS custom properties injected in `app/layout.tsx` (THEME.1/2); email templates via string interpolation at send time using `resolveEmailSettings()` (THEME.3/3b); PDF exports via `createStyles()` factory props (THEME.4). Changing these values in the Setup Panel immediately affects all surfaces on next page render / email send.

Section 3 — Logo: `org_logo_url`. Two input modes: (a) URL input (paste any public image URL), or (b) file upload via BrandImageUploader — P-DC pattern to `brand/logo/` in the `brand` public bucket, crop editor (react-easy-crop, free aspect ratio, PNG output). Whichever was used last wins. Falls back to `${NEXT_PUBLIC_SITE_URL}/logo.png` when unset. Used in email templates (via `resolveEmailSettings()`) and public landing page.

Section 4 — Favicon: `favicon_url`. Same two-mode input as logo but with 1:1 square aspect ratio lock in the crop editor. Stored in `brand/favicon/` in the `brand` public bucket. `generateMetadata()` in `app/layout.tsx` reads this and injects `<link rel="icon">`. Falls back to static `app/favicon.ico` when unset.

Section 5 — Email Configuration: `email_from_address`, `email_from_name`. Editable fields. All Resend sends read these dynamically via `resolveEmailSettings()`. `default_reply_to` displayed read-only with link to General Defaults.

Section 6 — Feature Flags: Five toggles, one per flag, one Save button. Each flag is an `app_settings` key with value `'true'` or `'false'`. All reads via `getFeatureFlags()` in `lib/feature-flags.ts` — never inline. Flag changes trigger `revalidatePath('/crew', 'layout')` + public route paths for immediate sidebar and page propagation. `saveFeatureFlags()` revalidates `/crew/rehearsals` and `/crew/auditions` alongside existing paths.

| Feature | app_settings key | Default | What disabling blocks |
|---|---|---|---|
| Calendar & Space Management | `feature_calendar` | `'true'` | `/crew/calendar/*`, public `/calendar`, `syncShowDateToCalendar()`, calendar links in emails, .ics links on Call Board |
| Check-In System | `feature_checkin` | `'true'` | `/crew/tools/checkin`, public `/checkin/*`, check-in action guards |
| Email Blast Composer | `feature_blast` | `'true'` | `/crew/communication`, blast action guards |
| Rehearsal Management | `feature_rehearsals` | `''` (enabled by default — `!== 'false'` evaluates truthy) | `/crew/rehearsals/*`, `/rehearsal-checkin/*`, `createRehearsalBatch()` flag guard, Rehearsals sidebar link |
| Audition Management | `feature_auditions` | `''` (enabled by default — `!== 'false'` evaluates truthy) | `/crew/auditions/*`, `/auditions/*`, `/audition-checkin/*`, all audition server action guards, Auditions sidebar link |

Note: Standing Opportunities, Volunteer Hours & Milestones, Document Management, and Forms are core features — not feature-flagged. All clients have access to these.

Section 7 — Platform Identity: `instance_label`. Internal deployment label (e.g. "Pelican Playhouse"). Displayed in the Setup Panel page header only — never visible to other roles. Helps Jonathan identify which client's backend he is managing across multiple deployments.

Section 8 — 404 Page (added ADMIN.33): `not_found_heading`, `not_found_body`. Two text fields. Heading max 100 chars, body max 300 chars. Controls the heading and body text shown on `app/not-found.tsx`. Seeded in Migration 028 with defaults: heading = "Page Not Found", body = "We couldn't find what you were looking for." (matches the original hardcoded text exactly — no visible change on deploy). Super Admin only (Setup Panel).

Key files (Phase SETUP):
- `app/crew/(app)/settings/setup/page.tsx` — Server Component, double-guarded, fetches 18 `app_settings` keys
- `components/crew/settings/SetupPanel.tsx` — Client Component, eight sections
- `components/crew/settings/BrandImageUploader.tsx` — shared upload+crop component (logo + favicon)
- `lib/actions/setup.ts` — nine server actions: `saveOrgIdentity()`, `saveBrandColors()`, `saveLogoUrl()`, `saveFaviconUrl()`, `saveEmailConfig()`, `saveFeatureFlags()`, `saveInstanceLabel()`, `saveNotFoundPage()`, `getSignedBrandUploadUrl()`
- `lib/feature-flags.ts` — `getFeatureFlags()` + `FeatureFlags` type (built SETUP.1)
- `lib/utils/image-crop.ts` — `getCroppedImg()` canvas crop utility (built SETUP.2)
- `lib/utils/org-identity.ts` — `resolveOrgIdentity()` for public Server Components (built ADMIN.31; extended ADMIN.33 to include `org_logo_url`)
- `app/layout.tsx` — `generateMetadata()` reads `favicon_url`, `org_name`, and `org_tagline` from `app_settings` (ADMIN.34)

**Document Management (`/crew/settings/documents`) — Built Phase 15.1–15.2:**
Super Admin + Owner Admin only. "Beta" badge removed from the Settings hub card
(15.1 Q2 fix — card gating now matches the page guard).

**Two sections on the settings page:**

**Section 1 — Document Types Manager (built Phase 15.1):**
Full CRUD for `document_types` table. Add, rename inline, toggle active, reorder
(↑↓), delete (blocked for `is_system = true` types and types with attached
documents). Per type: shows the currently active document for that type (title
+ upload date) and a "Set Active Document" picker. System types cannot be deleted,
only deactivated. Built component: `DocumentTypesManager.tsx`.

Seeded document types: Volunteer Consent Form (`volunteer_consent_form`, system),
Cast / Auditioner Consent Form (`cast_consent_form`, system — placeholder, no doc
yet), Volunteer Handbook, Production Schedule, Audition Materials.

**Section 2 — Consent Form Submissions Queue (built Phase 15.2):**
Three-tab view (Pending / Approved / Rejected). Shows all `consent_form_submissions`
rows. Columns: Volunteer (linked to profile), Form Type, Submitted, File (view link),
Action (Approve / Reject with inline notes field). Approve and reject buttons call
`approveConsentSubmission()` / `rejectConsentSubmission()` in `lib/actions/documents.ts`
and set `reviewed_by`, `reviewed_at`, optional `notes`. Built component:
`ConsentSubmissionsQueue.tsx`.

**`/documents/[token]` — Universal Document Redirect Route (built Phase 15.2):**
Route handler at `app/documents/[token]/route.ts`. Looks up `documents` by
`access_token`. Enforces access tier:
- `public` / `link_only` → proceed without auth check (having the link is the
  credential for `link_only`)
- `backend` → verifies admin session via `getServerClient().auth.getUser()` +
  `admin_users` lookup; redirects to `/crew/login?redirect=/documents/[token]`
  if unauthenticated
- Inactive document → redirects to `/not-found`
For `entry_type = 'file'`: generates 1-hour signed URL from `media` bucket
(`supabase.storage.from('media').createSignedUrl(storage_path, 3600)`) and redirects.
For `entry_type = 'link'`: `detectLinkType()` helper classifies the URL as
YouTube, Vimeo, audio, or generic link. YouTube/Vimeo/audio links redirect to
`/documents/view/[token]` player page (Phase 15.4). Generic links redirect
directly to `external_url`.
Uses `getAdminClient()` for document lookup and storage (no session on public route);
`getServerClient()` only for backend-tier session check.

**Under-18 Consent Form Email Trigger (built Phase 15.2):**
In `submitVolunteerForm()` (app/actions/volunteer.ts): when `data.age_range ===
'under_18'`, a non-blocking try/catch block runs after signup confirmation:
(1) queries `document_types` for `slug = 'volunteer_consent_form'` with
`is_active = true`; (2) inserts `consent_form_submissions` row with a DB-generated
`upload_token`; (3) queries `documents` for `is_type_active = true` on this type
to build an `activeFormUrl` (null if no document uploaded yet); (4) calls
`sendConsentFormRequestEmail()`. On failure: `console.error`, never throws —
volunteer signup is never blocked by consent flow failure.

`sendConsentFormRequestEmail()` in `lib/email.ts`: branded HTML email with
upload CTA (always present, links to `/consent/[uploadToken]`) and conditional
download CTA (only when `activeFormUrl` is not null). When null: "Your coordinator
will provide you with the consent form." Logged with
`trigger:consent_form_request`. `escapeHtml()` on volunteer name only.

**Master Media Library (`/crew/media`, built Phase 15.3):**
All roles (including Production). Folder browser (left panel) + document table
(right panel). Each document row shows: title, type badge, access tier badge,
action buttons (Copy Link, QR download, Play/View).

Upload and link entry: "Upload File" button triggers P-DC pattern (signed
upload URL from `getConsentUploadUrl()` variant in `lib/actions/documents.ts`,
client XHR PUT to `media` bucket under `library/[folder_id]/[doc_id]/`,
confirmation server action records path in DB). "Add Link" button opens a
form for external URL + title. Both go to the currently selected folder.

Access tiers: `public` (anyone with the link, no login required), `link_only`
(same — having the URL is the credential), `backend` (authenticated admin
session required; others redirected to `/crew/login`). Tier displayed as a
badge on each row and enforced by `/documents/[token]` redirect route.

Distribution: "Copy Link" copies the `/documents/[token]` URL (access-tier-
enforced). "QR" downloads a QR code for the link. Play/View button appears
on playable/viewable entries (video, audio, image, PDF, YouTube, Vimeo) and
opens `/documents/view/[token]`.

Component: `components/crew/media/MediaLibrary.tsx` (Client Component).
Helpers inside: `detectLinkType()`, `isPlayable()`, `getPlayLabel()`.

**Media Player Page (`/documents/view/[token]`, built Phase 15.4):**
Public Server Component at `app/documents/view/[token]/page.tsx`. Enforces
access tier (backend tier → redirects unauthenticated users to login). Generates
signed URL for file entries. Renders appropriate player based on content type:
- YouTube/Vimeo: embed iframe
- Video files: native `<video>` element
- Audio files: native `<audio>` element
- Images: `<img>` element
- PDF: `<iframe>` or download link
- Generic links: auto-redirect to external URL
Robots: `noindex` (access-controlled content). Light mode only (public page).

**`/documents/[token]` route updates (Phase 15.4):**
`detectLinkType()` and `isViewableMimeType()` helpers added to
`app/documents/[token]/route.ts`. Viewable files (video, audio, image, PDF by
mime type) and YouTube/Vimeo/audio links now redirect to `/documents/view/[token]`
instead of directly to the signed URL or external URL. Generic/non-viewable links
still redirect directly. `detectLinkType()` implementations are independent
per-file (route handler, MediaLibrary.tsx, view/page.tsx) — intentional given
server/client boundary.

**Key files:**
`lib/actions/documents.ts` — document type CRUD + consent submission review
`lib/actions/consent.ts` — `getConsentUploadUrl()`, `confirmConsentSubmission()`
`lib/actions/checkin-admin.ts` — `getCheckInRosterForDate()` (separate from
  `lib/actions/checkin.ts` which is public-route `getAdminClient()` only)
`lib/data/checkin.ts` — `getCheckInDashboardData(supabase)`
`app/documents/[token]/route.ts` — universal document redirect route handler
  (Phase 15.4: `detectLinkType()` + `isViewableMimeType()` helpers added;
  YouTube/Vimeo/audio/viewable-file → redirect to player page)
`app/documents/view/[token]/page.tsx` — public player page (Phase 15.4):
  video/audio/image/PDF/YouTube/Vimeo player, access tier enforcement, noindex
`app/consent/[token]/page.tsx` — public consent form upload page
`app/crew/(app)/tools/checkin/page.tsx` — server component shell for check-in
  dashboard (HelpTooltip added ADMIN.30)
`components/consent/ConsentUploadForm.tsx` — Client Component, XHR P-DC upload
`components/crew/tools/CheckInDashboard.tsx` — live check-in dashboard Client Component
`components/crew/media/MediaLibrary.tsx` — master media library (Phase 15.3)
  Client Component; helpers: `detectLinkType()`, `isPlayable()`, `getPlayLabel()`
`components/crew/settings/DocumentTypesManager.tsx`
`components/crew/settings/ConsentSubmissionsQueue.tsx`
`lib/validations/checkin.ts` — `createCheckInSignupSchema(showAgeRange)` factory
`types/checkin.ts` — `CheckInTokenResolution`, `CheckInResult`, `CheckInRoster`,
  `CheckInDashboardData`, and related types

**Check-In Dashboard (`/crew/tools/checkin`) — Built Phase 14.3:**
All roles. Live-updating dashboard for door-side use on show nights. Auto-refreshes
every 10 seconds via `router.refresh()` + `setInterval`. "Last updated Xs ago"
counter between refreshes.

**Layout:** Top section = full roster for the show with the nearest upcoming
show_date (today or future, CT-aware). Below = all other future shows in
chronological accordion, each collapsed showing show name + date + "X / Y checked in"
summary. Only one accordion can be expanded at a time.

**Full roster (top show and expanded accordions):** All `slot_claims` with
`status = 'claimed'` for the selected show date, grouped by role. Per-row
attendance status:
- `showed` + `source = 'checkin'` → green "✓ Checked In (QR)"
- `showed` + `source = 'manual'` → green "✓ Checked In (Admin)"
- `no_show` → red "✗ No-Show"
- `excused` → amber "Excused"
- No attendance record → gray "— Awaiting"

**Walk-In section:** Attendance rows with `slot_claim_id = null` (created by
`checkInNewVolunteer()` — volunteers who signed up at the door). Shows volunteer
name + check-in time. Null `volunteer_id` handled gracefully ("Unknown Volunteer").

**Date selector:** Shown when top show has multiple upcoming dates. Changing the
selected date triggers `getCheckInRosterForDate(showDateId)` server action for fresh
roster data.

**Architecture:** Server Component shell (`page.tsx`) fetches initial data via
`getCheckInDashboardData(supabase)` in `lib/data/checkin.ts` (uses `getServerClient()`
— admin page). Client Component `CheckInDashboard.tsx` manages interval, date selection,
accordion state. Server action `getCheckInRosterForDate()` in `lib/actions/checkin-admin.ts`
(uses `getServerClient()` — authenticated admin session; separate file from
`lib/actions/checkin.ts` which is public-route `getAdminClient()` only).

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
Adds UPDATE/DELETE policies on `volunteer_notes` restricted to `is_super_admin()`. Creates `is_super_admin()` helper function. Super Admins can edit and delete notes; Editors cannot. Updated in Migration 028: UPDATE/DELETE policies repointed to `is_super_admin_or_owner_admin()` — Owner Admin can now also edit and delete volunteer notes.

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

**Migration 020 status:** Applied — `020_locations_default_hours.sql` (ADMIN.25). Adds `default_hours numeric(4,2)` (nullable, no default) to `locations`. When set, takes precedence over the `app_settings` name→bucket fallback in `getLocationHoursBucket()`. Per-location default hours UI built in CAL.8
(/crew/settings/locations).

**Migration 021 status:** Applied — `021_admin_calendar_token.sql` (CAL.7). Adds `calendar_subscription_token uuid NOT NULL DEFAULT gen_random_uuid()` to `admin_users`. Creates UNIQUE index `idx_admin_users_calendar_token` on `admin_users(calendar_subscription_token)`. Gives every existing admin a unique subscription token on migration; new admins get one via the DEFAULT. Used by the iCalendar admin feed route (`/api/calendar/feed.ics`) to authenticate calendar app subscription requests without a session cookie.

**Migration 022 status:** Applied — `022_recurring_events.sql` (CAL.10a). Creates `recurrence_groups` table (series template for recurring calendar events). Adds `recurrence_group_id uuid REFERENCES recurrence_groups(id) ON DELETE SET NULL` to `calendar_events`. Creates index `idx_calendar_events_recurrence_group` on `calendar_events(recurrence_group_id)`. RLS on `recurrence_groups`: authenticated SELECT + INSERT, super_admin_all FOR ALL (using is_admin()).

**Migration 023 status:** Applied — `023_owner_admin_feature_flags.sql` (SETUP.0):
- Updated `admin_users.role` CHECK to include `'owner_admin'`
- Updated `calendar_editor` CHECK to allow `owner_admin`
- Replaced `is_editor()` Postgres function to include `owner_admin`
- Inserted 17 default `app_settings` rows for all SETUP keys via `INSERT ... ON CONFLICT (key) DO NOTHING`
- Added `is_super_admin_or_owner_admin()` helper function (plain `LANGUAGE sql STABLE`, same pattern as `is_editor()`/`is_admin()`/`is_super_admin()` — not a SECURITY DEFINER RPC, so R28 does not apply) to fix a discovered gap: the `locations` table's RLS write policy used `is_super_admin()` exclusively, which would have blocked Owner Admin location-management writes despite the app-level guard passing — repointed to `is_super_admin_or_owner_admin()`

**Migration 024 status:** Applied — `024_checkin_system.sql` (14.1):
- Added `check_in_token uuid NOT NULL DEFAULT gen_random_uuid()` to `show_dates`.
  Created UNIQUE index `idx_show_dates_check_in_token`.
- Made `attendance.slot_claim_id` nullable (dropped NOT NULL constraint).
  Existing rows unaffected. Walk-in check-ins (via public check-in page for
  new volunteers) use `slot_claim_id = null`.

**Migration 025 status:** Applied — `025_document_system.sql` (15.1):
Dropped the old `documents` table (which had `document_type IN
('consent_under18','general')` and `file_path` — a narrow Alpha-era schema with
zero live rows at drop time). Created six new tables:
- `document_types` — org-level document type registry with slugs for system
  behavior (e.g. `volunteer_consent_form`). RLS: authenticated SELECT all;
  `is_super_admin_or_owner_admin()` for write. Seeded with 5 types.
- `media_folders` — folder/category layer for the master media library.
  RLS: authenticated SELECT; `is_editor()` INSERT/UPDATE; SA/OA DELETE.
  `handle_updated_at()` trigger on `updated_at`.
- `media_folder_access` — role/user-specific folder visibility grants.
  RLS: authenticated SELECT; `is_editor()` INSERT/DELETE.
- `documents` (new schema) — core documents table with `access_token` (UUID,
  unique), `entry_type` ('file'/'link'), `storage_path` (for files),
  `external_url` (for links), `mime_type`, `access_tier`
  ('public'/'link_only'/'backend'), `is_type_active` (one active per type),
  `attached_to_type`/`attached_to_id` (polymorphic show/rehearsal/audition
  attachment). RLS: authenticated SELECT all; authenticated INSERT;
  `is_editor()` UPDATE; `is_super_admin_or_owner_admin()` DELETE.
  `handle_updated_at()` trigger on `updated_at`.
- `document_access` — role/user-specific document visibility grants.
  Same RLS pattern as `media_folder_access`.
- `consent_form_submissions` — tracks under-18 consent form uploads. Fields:
  `upload_token` (UUID, unique — sent in email), `volunteer_id`, `document_type_id`,
  `status` ('pending'/'approved'/'rejected'), `submitted_file_path` (null until
  uploaded), `submitted_at`, `reviewed_by`, `reviewed_at`, `notes`. RLS:
  authenticated all; anon SELECT WHERE status = 'pending' (for public upload page
  token validation via `getAdminClient()`).

**Migration 026 status:** Applied —
`026_feature_flag_cleanup.sql` (SETUP.1):
- Deleted stale flag rows from `app_settings`:
  `feature_documents`, `feature_opportunities`,
  `feature_hours_milestones` (these features are core
  — not optional flags. Rows seeded in Migration 023
  via `ON CONFLICT DO NOTHING`; deleted here.)
- Inserted `favicon_url` with default `''`
  (not included in Migration 023 seed set).

**Migration 027 status:** Applied —
`027_renumber_waitlist_function.sql` (ADMIN.31):
Creates `renumber_waitlist(p_role_id uuid, p_cancelled_position integer)` plain SQL function.
Atomically decrements `waitlist_position` for all
`slot_claims` with `status = 'waitlisted'` and
`waitlist_position > p_cancelled_position` in a
given role. Single UPDATE eliminates the prior
sequential-JS-update race condition in
`cancelClaim()`. NOT SECURITY DEFINER — runs with
caller (authenticated admin) privileges. REVOKE/GRANT
applied defensively (`authenticated` has EXECUTE;
PUBLIC and anon do not). `proacl` confirmed:
`{postgres=X/postgres, authenticated=X/postgres, service_role=X/postgres}`.

**Migration 028 status:** Applied — `028_owner_admin_notes_404_settings.sql` (ADMIN.33):

Rewrote `volunteer_notes` UPDATE policy: dropped `superadmin_update_notes` (gated on `is_super_admin()`), created `volunteer_notes_update_sa_oa` (gated on `is_super_admin_or_owner_admin()`).
Rewrote `volunteer_notes` DELETE policy: dropped `superadmin_delete_notes`, created `volunteer_notes_delete_sa_oa` (gated on `is_super_admin_or_owner_admin()`).
Seeded two new `app_settings` keys: `not_found_heading` = 'Page Not Found' and `not_found_body` = "We couldn't find what you were looking for." (`ON CONFLICT DO NOTHING`).

**Migration 029 status:** Applied — `029_qr_codes.sql` (ADMIN.34):
Creates `qr_codes` table for shared QR code history. Indexes on `created_at DESC` and `created_by`. RLS enabled: SELECT for all authenticated, INSERT for all authenticated, DELETE for `is_super_admin_or_owner_admin()` only.

**Migration 030 status:** Applied — `030_communication_preference.sql` (19.1). Adds nullable
`communication_preference` text CHECK ('email'|'phone'|'either') column to `volunteers` table. No index
needed (advisory only — never filtered). RLS unchanged (volunteers table RLS already covers
all write paths).

**Migration 031 status:** Applied — `031_rehearsal_management.sql` (Phase 21):
- Added `check_in_token uuid DEFAULT gen_random_uuid()` to
  `calendar_events`. Nullable. Partial UNIQUE index
  `idx_calendar_events_check_in_token WHERE check_in_token
  IS NOT NULL`. Existing rows receive NULL.
- Created `rehearsal_schedule_assignments` table: schedule-
  level assignment of Production admin users to rehearsal
  batches. RLS: is_editor() full; Viewer SELECT; Production
  SELECT own rows (admin_user_id = auth.uid()).
- Created `rehearsal_date_assignments` table: per-date
  overrides (include/exclude) for specific users on specific
  calendar events. Same RLS pattern.
- Created `rehearsal_attendance` table: attendance records
  for rehearsals, linked to calendar_events + admin_users.
  RLS: is_editor() full; Viewer SELECT; Production SELECT +
  INSERT own rows. Clean separation from volunteer attendance
  table.
- Seeded `feature_rehearsals` into `app_settings` (value
  `''` — evaluates as enabled via `!== 'false'` logic).

**Next migration:** 033. No pending migrations.

**Migration 032 status:** Applied — `032_audition_management.sql` (Phase AUDITIONS).
Created eight new tables (auditions, audition_roles, audition_slots, audition_signups,
audition_signup_notes, audition_materials, audition_assignments, audition_email_templates),
seeded `feature_auditions` in `app_settings`, and ALTERed `calendar_events_event_type_check`
to include `'audition'`. Additional inline schema fixes applied via Supabase MCP after
Migration 032: `audition_signups.phone SET NOT NULL` (AUDITIONS.2a), `email_log.recipient_type`
CHECK updated to include `'audition'` (AUDITIONS.2a), `calendar_events.source_audition_id`
column + partial unique index added (AUDITIONS.1b), `calendar_events_source_check` updated
to include `'audition'` (AUDITIONS.1b), `consent_form_submissions.audition_signup_id` column
+ partial index added (AUDITIONS.1a inline section). NOTE (confirmed via live Supabase query,
DOC.59): none of these five inline fixes are reflected in the committed `032_audition_
management.sql` file at repo root — the file on disk creates the eight tables and seeds
`feature_auditions` only. The live database schema is correct; the migration file is a
historical snapshot that has drifted from it. A fresh database seeded from this repo's
migration files alone would NOT match production until these five ALTERs are captured in
a follow-up migration file (e.g. `033_audition_schema_fixes.sql`).

### auditions
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
title                 text NOT NULL
description           text
show_id               uuid REFERENCES shows(id) ON DELETE SET NULL
parent_audition_id    uuid REFERENCES auditions(id) ON DELETE SET NULL
location_id           uuid REFERENCES locations(id) ON DELETE SET NULL
type                  text NOT NULL DEFAULT 'open_call'
                      CHECK (type IN ('open_call','timed_slots'))
status                text NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','published','closed','archived'))
date_start            date NOT NULL
date_end              date
time_start            time without time zone
time_end              time without time zone
slot_duration_minutes integer
slots_total           integer
slot_cap              integer NOT NULL DEFAULT 1
role_selection_enabled boolean NOT NULL DEFAULT false
material_headshot     boolean NOT NULL DEFAULT false
material_resume       boolean NOT NULL DEFAULT false
material_sheet_music  boolean NOT NULL DEFAULT false
material_mp3          boolean NOT NULL DEFAULT false
material_video        boolean NOT NULL DEFAULT false
calendar_visibility   text NOT NULL DEFAULT 'admin_only'
                      CHECK (calendar_visibility IN ('admin_only','public'))
notification_emails_enabled boolean NOT NULL DEFAULT false
check_in_token        uuid NOT NULL DEFAULT gen_random_uuid()
created_by            uuid REFERENCES admin_users(id)
created_at            timestamptz NOT NULL DEFAULT now()
updated_at            timestamptz NOT NULL DEFAULT now()
-- UNIQUE INDEX: idx_auditions_check_in_token on check_in_token
-- INDEX: idx_auditions_show_id
-- INDEX: idx_auditions_status
-- INDEX: idx_auditions_created_by
-- Trigger: handle_updated_at() on updated_at
-- RLS: is_editor() all operations; authenticated SELECT; anon SELECT WHERE status='published'
-- Migration 032 (032_audition_management.sql)
```

### audition_roles
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
audition_id   uuid NOT NULL REFERENCES auditions(id) ON DELETE CASCADE
name          text NOT NULL
sort_order    integer NOT NULL DEFAULT 0
created_at    timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_audition_roles_audition_id
-- RLS: is_editor() INSERT/UPDATE/DELETE; authenticated SELECT
-- Migration 032 (032_audition_management.sql)
```

### audition_slots
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
audition_id   uuid NOT NULL REFERENCES auditions(id) ON DELETE CASCADE
start_time    timestamptz NOT NULL
cap           integer NOT NULL DEFAULT 1
created_at    timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_audition_slots_audition_id
-- RLS: is_editor() INSERT/UPDATE/DELETE; authenticated SELECT; anon SELECT
-- Migration 032 (032_audition_management.sql)
```

### audition_signups
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
audition_id         uuid NOT NULL REFERENCES auditions(id) ON DELETE CASCADE
slot_id             uuid REFERENCES audition_slots(id) ON DELETE SET NULL
audition_role_id    uuid REFERENCES audition_roles(id) ON DELETE SET NULL
name                text NOT NULL
email               text NOT NULL
phone               text NOT NULL
is_minor            boolean NOT NULL DEFAULT false
guardian_name       text
guardian_phone      text
status              text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','callback','cast','not_cast','withdrawn'))
cast_role           text
cancel_token        uuid NOT NULL DEFAULT gen_random_uuid()
upload_token        uuid NOT NULL DEFAULT gen_random_uuid()
checked_in_at       timestamptz
check_in_source     text CHECK (check_in_source IN ('checkin','manual'))
signed_up_at        timestamptz NOT NULL DEFAULT now()
-- UNIQUE INDEX: idx_audition_signups_cancel_token on cancel_token
-- UNIQUE INDEX: idx_audition_signups_upload_token on upload_token
-- INDEX: idx_audition_signups_audition_id
-- INDEX: idx_audition_signups_slot_id
-- INDEX: idx_audition_signups_status
-- RLS: is_editor() all authenticated operations; anon INSERT (public signup);
--      anon SELECT WHERE cancel_token matches (for cancel page token validation)
-- Migration 032 (032_audition_management.sql)
-- NOTE: phone was NOT NULL in Migration 032 as applied
--   (AUDITIONS.2a inline fix — ALTER TABLE audition_signups
--   ALTER COLUMN phone SET NOT NULL). The original spec had
--   it nullable. Corrected here to match the live schema.
```

### audition_signup_notes
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
signup_id   uuid NOT NULL REFERENCES audition_signups(id) ON DELETE CASCADE
content     text NOT NULL
created_by  uuid REFERENCES admin_users(id)
created_at  timestamptz NOT NULL DEFAULT now()
-- Append-only (no UPDATE/DELETE RLS policies)
-- INDEX: idx_audition_signup_notes_signup_id
-- RLS: is_editor() SELECT + INSERT; no UPDATE or DELETE
-- Migration 032 (032_audition_management.sql)
```

### audition_materials
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
signup_id         uuid NOT NULL REFERENCES audition_signups(id) ON DELETE CASCADE
material_type     text NOT NULL
                  CHECK (material_type IN ('headshot','resume','sheet_music','mp3','video'))
storage_path      text NOT NULL
original_filename text
uploaded_at       timestamptz NOT NULL DEFAULT now()
-- original_filename: intentional enhancement over Brief spec (AUDITIONS.1a) —
--   needed for meaningful filename display in admin Materials tab
-- INDEX: idx_audition_materials_signup_id
-- RLS: is_editor() SELECT + DELETE; anon INSERT (upload token validated in action)
-- Migration 032 (032_audition_management.sql)
```

### audition_assignments
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
audition_id     uuid NOT NULL REFERENCES auditions(id) ON DELETE CASCADE
admin_user_id   uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE
created_at      timestamptz NOT NULL DEFAULT now()
-- UNIQUE INDEX: idx_audition_assignments_unique on (audition_id, admin_user_id)
-- INDEX: idx_audition_assignments_admin_user_id
-- RLS: is_editor() INSERT/DELETE; authenticated SELECT
-- Governs Production-role direct audition access (standalone auditions).
-- Show-linked access is governed by show_editors (existing table).
-- Migration 032 (032_audition_management.sql)
```

### audition_email_templates
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
audition_id     uuid NOT NULL REFERENCES auditions(id) ON DELETE CASCADE
status_type     text NOT NULL
                CHECK (status_type IN ('callback','cast','not_cast'))
subject         text NOT NULL DEFAULT ''
body_html       text NOT NULL DEFAULT ''
updated_by      uuid REFERENCES admin_users(id)
updated_at      timestamptz NOT NULL DEFAULT now()
-- UNIQUE INDEX: idx_audition_email_templates_unique on (audition_id, status_type)
-- RLS: is_editor() all operations; authenticated SELECT
-- Stores TipTap HTML output per audition per status type.
-- If no row exists for a status, automatic email firing is silently skipped.
-- Merge tags in body_html are substituted at send time:
--   {{auditioner_name}}, {{show_title}}, {{audition_title}},
--   {{audition_date}}, {{audition_location}}, {{role_name}},
--   {{cast_role}}, {{org_name}}
-- Migration 032 (032_audition_management.sql)
```

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
communication_preference text CHECK (communication_preference IN ('email','phone','either'))
-- communication_preference: nullable, advisory only, no system enforcement. Applied Migration 030 (19.1).
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
-- RLS on locations: public_select_locations (SELECT, anon +
--   authenticated), super_admin_all (FOR ALL, authenticated,
--   is_super_admin_or_owner_admin() — repointed SETUP.0;
--   policy name unchanged, only the underlying function
--   changed. Original is_super_admin() would have blocked
--   Owner Admin location-management writes.)
-- Migration 016 (016_locations_show_type_migration.sql)
-- Migration 020 adds default_hours (nullable).
-- Per-location default hours UI built in CAL.8.
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
check_in_token   uuid NOT NULL DEFAULT gen_random_uuid()
-- INDEX: idx_show_dates_show_id
-- UNIQUE INDEX: idx_show_dates_check_in_token (Migration 024)
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
-- NOTE: check_in_token added in Migration 024 (14.1).
-- NOT NULL DEFAULT gen_random_uuid(). UNIQUE index.
-- Used by the public /checkin/[token] page and the admin
-- Dates tab per-date check-in QR. Links to:
-- ${NEXT_PUBLIC_SITE_URL}/checkin/[check_in_token]
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
slot_claim_id    uuid REFERENCES slot_claims(id)
-- NOTE: Made nullable in Migration 024 (14.1).
-- Walk-in check-ins via /checkin/[token] (new
-- volunteer signs up at the door) have
-- slot_claim_id = null — no prior slot claim exists.
-- All pre-Migration-024 rows have a non-null value.
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
id               uuid PRIMARY KEY
-- IMPORTANT: This IS the Supabase Auth UUID — there is
-- no separate auth_user_id column. admin_users.id equals
-- auth.uid() in every RLS policy context. Any RLS policy
-- that needs to self-scope to the calling admin must use
-- admin_user_id = auth.uid() directly (for FK columns
-- referencing admin_users.id) or id = auth.uid() (for
-- the admin_users table itself). Confirmed in 21.1 F1:
-- the 21.1 prompt draft used a non-existent auth_user_id
-- column in migration RLS policies; corrected to
-- admin_user_id = auth.uid() before applying.
name             text NOT NULL
email            text NOT NULL UNIQUE
role             text NOT NULL CHECK (role IN (
  'super_admin','owner_admin','editor','viewer',
  'production'
))
-- NOTE: 'owner_admin' added in Migration 023
-- (SETUP.0). Sits between super_admin and editor.
-- Full access except /crew/settings/setup. Can
-- create and manage Editor/Viewer/Production/Owner
-- Admin accounts. Can deactivate other Owner Admin
-- accounts. Cannot create or deactivate super_admin
-- accounts. Permissions expanded in ADMIN.33.
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
--   (CAL.2). Default false. When true on an editor,
--   viewer, or owner_admin account: direct write access
--   to calendar (events approved immediately). DB CHECK
--   constraint enforces calendar_editor = false on
--   super_admin and production accounts. owner_admin
--   CAN have calendar_editor = true (CHECK constraint
--   updated in Migration 023 / SETUP.0). UI toggle built
--   CAL.6 on /crew/settings/users (Super Admin only) via
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
  source IN ('show','manual','audition')
)
-- 'audition' added inline via Supabase MCP in AUDITIONS.1b.
source_show_date_id uuid REFERENCES show_dates(id)
  ON DELETE CASCADE
source_audition_id uuid REFERENCES auditions(id) ON DELETE SET NULL
-- NULL for all non-audition-sourced events.
-- UNIQUE partial index: idx_calendar_events_source_audition_id
--   WHERE source_audition_id IS NOT NULL.
-- Used as upsert conflict anchor in syncAuditionToCalendar().
-- Added inline via Supabase MCP in AUDITIONS.1b Task D (not in
--   Migration 032 SQL file — applied as a separate ALTER).
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
-- INDEX: idx_calendar_events_check_in_token
--   (partial, WHERE check_in_token IS NOT NULL, Migration 031)
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

check_in_token uuid DEFAULT gen_random_uuid()
-- Nullable. Added Migration 031 (031_rehearsal_management.sql).
-- Powers /rehearsal-checkin/[token] public route.
-- Partial UNIQUE index: idx_calendar_events_check_in_token
-- WHERE check_in_token IS NOT NULL.
-- Existing rows receive NULL (correct — only new rehearsal
-- events that need QR check-in receive tokens).
-- Parallel to show_dates.check_in_token (Phase 14).
```

### rehearsal_schedule_assignments
```sql
id                 uuid PRIMARY KEY DEFAULT gen_random_uuid()
rehearsal_batch_id uuid NOT NULL REFERENCES rehearsal_batches(id)
                   ON DELETE CASCADE
admin_user_id      uuid NOT NULL REFERENCES admin_users(id)
                   ON DELETE CASCADE
assigned_at        timestamptz NOT NULL DEFAULT now()
assigned_by        uuid REFERENCES admin_users(id)
-- UNIQUE (rehearsal_batch_id, admin_user_id)
-- INDEX: idx_rsa_batch (rehearsal_batch_id)
-- INDEX: idx_rsa_user (admin_user_id)
-- INDEX: idx_rsa_assigned_by (assigned_by)
-- RLS: SA/OA/Editor — full access (is_editor());
--      Viewer — SELECT only (role = 'viewer');
--      Production — SELECT own rows only
--      (admin_user_id = auth.uid() — direct UUID match,
--       no join needed; admin_users.id IS the Auth UUID)
-- Migration 031 (031_rehearsal_management.sql)
```

### rehearsal_date_assignments
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
calendar_event_id uuid NOT NULL REFERENCES calendar_events(id)
                  ON DELETE CASCADE
admin_user_id     uuid NOT NULL REFERENCES admin_users(id)
                  ON DELETE CASCADE
override_type     text NOT NULL CHECK (override_type IN
                  ('include', 'exclude'))
created_at        timestamptz NOT NULL DEFAULT now()
created_by        uuid REFERENCES admin_users(id)
-- UNIQUE (calendar_event_id, admin_user_id)
-- INDEX: idx_rda_event (calendar_event_id)
-- INDEX: idx_rda_user (admin_user_id)
-- INDEX: idx_rda_created_by (created_by)
-- RLS: SA/OA/Editor — full access (is_editor());
--      Viewer — SELECT only;
--      Production — SELECT own rows only
--      (admin_user_id = auth.uid())
-- override_type: 'include' adds a non-schedule-assignee to
--   a specific date; 'exclude' removes a schedule-assignee
--   from a specific date.
-- Migration 031 (031_rehearsal_management.sql)
```

### rehearsal_attendance
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
calendar_event_id uuid NOT NULL REFERENCES calendar_events(id)
                  ON DELETE CASCADE
admin_user_id     uuid NOT NULL REFERENCES admin_users(id)
                  ON DELETE CASCADE
status            text NOT NULL CHECK (status IN
                  ('showed', 'no-show', 'excused'))
source            text NOT NULL CHECK (source IN
                  ('checkin', 'manual'))
checked_in_at     timestamptz
marked_by         uuid REFERENCES admin_users(id)
created_at        timestamptz NOT NULL DEFAULT now()
-- UNIQUE (calendar_event_id, admin_user_id)
-- INDEX: idx_rattend_event (calendar_event_id)
-- INDEX: idx_rattend_user (admin_user_id)
-- INDEX: idx_rattend_marked_by (marked_by)
-- RLS: SA/OA/Editor — full access (is_editor());
--      Viewer — SELECT only;
--      Production — SELECT own rows only (SELECT) +
--        INSERT own rows only (INSERT) for manual marking
--        on own dates (admin_user_id = auth.uid()).
--        QR self-check-in uses getAdminClient() (bypasses
--        RLS) — Production INSERT RLS is belt-and-suspenders
--        for the manual marking path.
-- source 'checkin' = QR self check-in via
--   /rehearsal-checkin/[token]; 'manual' = admin-marked.
-- checked_in_at: set on checkin source; null for manual.
-- Clean separation from the volunteer attendance table
--   (which tracks show attendances for volunteers, not
--   rehearsal attendances for admin/production users).
-- Migration 031 (031_rehearsal_management.sql)
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
recipient_type   text NOT NULL CHECK (recipient_type IN ('all','category','individual','transactional','audition'))
-- 'audition' added to CHECK constraint via Supabase MCP in
--   AUDITIONS.2a. CORRECTION (confirmed against live code,
--   DOC.59): sendAuditionBulkEmail() in lib/actions/auditions-
--   admin.ts actually logs recipient_type = 'individual' for
--   audition bulk sends, not 'audition' — the constraint value
--   is not currently exercised by any code path.
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

### qr_codes
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
url         text NOT NULL
label       text
svg         text NOT NULL
png_base64  text NOT NULL
created_by  uuid REFERENCES admin_users(id)
            ON DELETE SET NULL
created_at  timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_qr_codes_created_at on (created_at DESC)
--   For chronological history queries.
-- INDEX: idx_qr_codes_created_by
--   For per-admin filtering (future use).
-- RLS: qr_codes_select_authenticated — SELECT,
--   authenticated, USING (true) — shared history,
--   all admins see all saved QRs.
-- RLS: qr_codes_insert_authenticated — INSERT,
--   authenticated, WITH CHECK (true) — any admin
--   can generate and save.
-- RLS: qr_codes_delete_sa_oa — DELETE,
--   authenticated, USING (is_super_admin_or_owner_admin())
-- History capped at 50 rows in getQRHistory()
--   (no DB-level cap — enforced in query LIMIT).
-- png_base64 is stored without the data: URI prefix.
--   Callers construct: data:image/png;base64,{png_base64}
-- svg is the raw SVG string.
--   Callers construct: data:image/svg+xml;charset=utf-8,
--   {encodeURIComponent(svg)}
-- Migration 029 (029_qr_codes.sql)
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

### documents (new schema — Migration 025)
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
access_token      uuid NOT NULL DEFAULT gen_random_uuid()
title             text NOT NULL
description       text
document_type_id  uuid REFERENCES document_types(id)
                  ON DELETE SET NULL
folder_id         uuid REFERENCES media_folders(id)
                  ON DELETE SET NULL
entry_type        text NOT NULL CHECK (entry_type IN ('file','link'))
storage_path      text  -- Supabase Storage path within 'media' bucket
external_url      text  -- for link entries
mime_type         text  -- detected at upload (determines player in 15.4)
file_size         bigint
original_filename text
access_tier       text NOT NULL DEFAULT 'backend'
                  CHECK (access_tier IN ('public','link_only','backend'))
is_active         boolean NOT NULL DEFAULT true
is_type_active    boolean NOT NULL DEFAULT false
-- True = this is the current active document for its type.
-- Only one document per document_type_id should have this true.
-- Enforced at app layer via setTypeActiveDocument() action.
-- Partial index: idx_documents_is_type_active WHERE is_type_active = true
attached_to_type  text CHECK (attached_to_type IN (
                    'show','rehearsal_batch','audition'
                  ))
attached_to_id    uuid  -- polymorphic FK, enforced at app layer
uploaded_by       uuid REFERENCES admin_users(id)
created_at        timestamptz NOT NULL DEFAULT now()
updated_at        timestamptz NOT NULL DEFAULT now()
-- UNIQUE INDEX: idx_documents_access_token on access_token
-- INDEX: idx_documents_document_type_id
-- INDEX: idx_documents_folder_id
-- INDEX: idx_documents_uploaded_by
-- INDEX: idx_documents_attached_to (attached_to_type, attached_to_id)
-- RLS: authenticated SELECT all; authenticated INSERT;
--   is_editor() UPDATE; is_super_admin_or_owner_admin() DELETE
-- Trigger: handle_updated_at() on updated_at
-- NOTE: old documents table (document_type IN ('consent_under18',
--   'general'), file_path) dropped in Migration 025. Had zero live
--   rows at the time of drop.
-- Migration 025 (025_document_system.sql)
```

### document_types
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
name         text NOT NULL
slug         text NOT NULL
description  text
is_system    boolean NOT NULL DEFAULT false
is_active    boolean NOT NULL DEFAULT true
sort_order   integer NOT NULL DEFAULT 0
created_at   timestamptz NOT NULL DEFAULT now()
-- UNIQUE INDEX: idx_document_types_slug on slug
-- INDEX: idx_document_types_sort_order
-- RLS: authenticated SELECT all;
--   is_super_admin_or_owner_admin() INSERT/UPDATE/DELETE
-- Seeded: volunteer_consent_form (system), cast_consent_form (system),
--   volunteer_handbook, production_schedule, audition_materials
-- is_system = true: cannot delete (app-layer guard); only deactivate.
-- Migration 025 (025_document_system.sql)
```

### consent_form_submissions
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
upload_token        uuid NOT NULL DEFAULT gen_random_uuid()
volunteer_id        uuid REFERENCES volunteers(id) ON DELETE CASCADE
document_type_id    uuid NOT NULL REFERENCES document_types(id)
status              text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected'))
submitted_file_path text  -- null until file uploaded via /consent/[token]
submitted_at        timestamptz  -- null until submitted
reviewed_by         uuid REFERENCES admin_users(id)
reviewed_at         timestamptz
notes               text
created_at          timestamptz NOT NULL DEFAULT now()
-- UNIQUE INDEX: idx_consent_submissions_token on upload_token
-- INDEX: idx_consent_submissions_volunteer_id
-- INDEX: idx_consent_submissions_status
-- INDEX: idx_consent_submissions_doc_type on document_type_id
-- RLS: admin_all (authenticated, all operations);
--   anon SELECT WHERE status = 'pending' (token validation on
--   public /consent/[token] page uses getAdminClient() — this
--   policy is a safety net)
audition_signup_id uuid REFERENCES audition_signups(id) ON DELETE SET NULL
-- NULL for volunteer consent submissions (uses volunteer_id instead).
-- Set for auditioner consent submissions — links consent record to
--   the audition_signups row. Added in Migration 032 (AUDITIONS.1a
--   inline ALTER after audition_signups table was created).
-- INDEX: idx_consent_submissions_audition_signup (WHERE NOT NULL)
-- Upload token is permanent until submitted_file_path is set.
-- Status 'pending' means awaiting admin review (not "no file yet" —
--   submitted_file_path IS NOT NULL indicates file received).
-- Migration 025 (025_document_system.sql)
```

**Media library tables (Migration 025 — documented DOC.37c):**

### media_folders
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
name         text NOT NULL
description  text
sort_order   integer NOT NULL DEFAULT 0
created_by   uuid REFERENCES admin_users(id)
created_at   timestamptz NOT NULL DEFAULT now()
updated_at   timestamptz NOT NULL DEFAULT now()
-- Trigger: handle_updated_at() on updated_at
-- RLS: authenticated SELECT; is_editor() INSERT/UPDATE;
--   is_super_admin_or_owner_admin() DELETE
-- Folders are the organizational layer for /crew/media.
-- Each document optionally belongs to one folder via
--   documents.folder_id FK (ON DELETE SET NULL).
-- Migration 025 (025_document_system.sql)
```

### media_folder_access
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
folder_id    uuid NOT NULL
  REFERENCES media_folders(id) ON DELETE CASCADE
role         text CHECK (role IN (
  'super_admin','owner_admin','editor','viewer','production'
))
admin_id     uuid REFERENCES admin_users(id)
-- Either role or admin_id is set (not both). When role is set:
--   all accounts with that role can access this folder.
-- When admin_id is set: only that specific admin can access.
created_at   timestamptz NOT NULL DEFAULT now()
-- RLS: authenticated SELECT; is_editor() INSERT/DELETE
-- Governs folder-level visibility grants beyond default
--   authenticated access. Phase 15.3 built the UI but
--   per-folder access control UI is deferred to a later
--   prompt — all folders currently visible to all roles.
-- Migration 025 (025_document_system.sql)
```

### document_access
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
document_id  uuid NOT NULL
  REFERENCES documents(id) ON DELETE CASCADE
role         text CHECK (role IN (
  'super_admin','owner_admin','editor','viewer','production'
))
admin_id     uuid REFERENCES admin_users(id)
-- Same pattern as media_folder_access: role or admin_id.
created_at   timestamptz NOT NULL DEFAULT now()
-- RLS: authenticated SELECT; is_editor() INSERT/DELETE
-- Document-level visibility grants beyond the access_tier
--   enforcement in /documents/[token]/route.ts.
--   Per-document access control UI deferred to a later phase.
-- Migration 025 (025_document_system.sql)
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

**`is_editor()` Postgres helper function:** Currently checks `role IN ('super_admin', 'editor')`. Updated in Migration 023 (SETUP.0) to include `'owner_admin'`: `role IN ('super_admin', 'owner_admin', 'editor')`. RLS policies that gate on editor-level access (`volunteer_notes` SELECT/INSERT, etc.) will apply correctly to Owner Admin after this update.

**AuditAction types added since Phase 13:** Check-In (14.1): `attendance.checkin`,
`volunteer.checkin_signup`. Documents (15.1): `document_type.create`,
`document_type.update`, `document_type.delete`, `document_type.reorder`,
`consent_submission.approve`, `consent_submission.reject`. Consent file receipt
(15.2): `consent_submission.file_received`. Public signup (ADMIN.31):
`volunteer.signup` — first entry in the Volunteers AuditAction group. Public
self-registration with null admin_id (R25). Logged non-blocking in
`submitVolunteerForm()`. Phase AUDITIONS (AUDITIONS.1b): `audition.convert_to_volunteer`
— logged when an admin converts an auditioner signup to a volunteer record via the
Signups tab Convert to Volunteer action. All types in `lib/audit.ts`, visible in audit log viewer.

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

**New `app_settings` keys added in Migration 023 (SETUP.0):**
All inserted via `INSERT ... ON CONFLICT (key) DO NOTHING` — existing keys never overwritten.
```
org_name                  → '30 By Ninety Theatre'
org_tagline               → ''
org_contact_email         → 'info@30byninety.com'
org_website_url           → ''
org_location              → 'Old Mandeville, LA'
brand_primary             → '#293994'
brand_accent              → '#F26522'
org_logo_url              → ''
email_from_address        → 'volunteers@30byninetyvolunteers.com'
email_from_name           → '30 By Ninety Theatre Volunteers'
feature_calendar          → 'true'
feature_checkin           → 'true'
feature_blast             → 'true'
instance_label            → '30 By Ninety Theatre'
favicon_url               → ''
```

Note: feature_opportunities, feature_hours_milestones,
and feature_documents were seeded in Migration 023 but
deleted in Migration 026 — these are core features, not
optional flags. favicon_url was added in Migration 026.
Two additional keys added in Migration 028 (ADMIN.33):
not_found_heading (default: 'Page Not Found') and
not_found_body (default: "We couldn't find what you
were looking for."). Total active SETUP keys: 17.
Setup Panel page (setup/page.tsx) fetches 18 keys
total (17 SETUP keys + default_reply_to from
General Defaults).

**`feature_rehearsals` key added in Migration 031 (Phase 21):**
Seeded via `INSERT INTO app_settings (key, value) VALUES
('feature_rehearsals', '') ON CONFLICT (key) DO NOTHING`.
Value `''` evaluates as enabled (`!== 'false'`). Added to
`FeatureFlags` type and `getFeatureFlags()` in
`lib/feature-flags.ts`. Setup Panel Section 6 has a fourth
toggle row for this flag. `saveFeatureFlags()` revalidates
`/crew/rehearsals` and `/crew/auditions` alongside existing routes.
Total active SETUP keys: 18. Setup Panel fetches 19 keys
total (18 SETUP keys + default_reply_to).

**`feature_auditions` key added in Migration 032 (Phase AUDITIONS):**
Seeded via `INSERT INTO app_settings (key, value) VALUES
('feature_auditions', '') ON CONFLICT (key) DO NOTHING`.
Value `''` evaluates as enabled (`!== 'false'`). Added to
`FeatureFlags` type and `getFeatureFlags()` in
`lib/feature-flags.ts`. Setup Panel Section 6 has a fifth
toggle row for this flag. `saveFeatureFlags()` revalidates
`/crew/auditions` alongside existing routes.
Total active SETUP keys: 19. Setup Panel fetches 20 keys
total (19 SETUP keys + default_reply_to).

**5-file pattern for adding a new feature flag (confirmed AUDITIONS.1a F2):**
Every new feature flag requires exactly 5 file changes:
1. Migration SQL — seed the key in `app_settings`
2. `lib/feature-flags.ts` — add to FeatureFlags type + getFeatureFlags() fetch + return object
3. `components/crew/settings/SetupPanel.tsx` — 5th toggle in Section 6
4. `app/crew/(app)/settings/setup/page.tsx` — companion edit for SetupPanelInitialValues type widening
5. `lib/actions/setup.ts` — `saveFeatureFlags()` revalidatePath for the new route
Missing any of the five produces a silent failure (wrong TypeScript types, toggle that doesn't save, stale cache on flag change).

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
30BN-DOC.31    ✓ Brief Update v3.2 (Phase 13 complete
                 — see v3.2 history entry)
30BN-DOC.32    ✓ Process Update v3.2 (Phase 13 complete
                 — see v3.2 history entry)
30BN-DOC.33    ✓ Deferred Verifications v9 (Phase 13
                 items added, 11.1 V1 superseded, Quick
                 Reference updated)
30BN-ADMIN.27  ✓ TipTap rich formatting + light mode
                 default. @tiptap/extension-link +
                 @tiptap/extension-underline installed.
                 Toolbar expanded to 9 buttons (B/I/U/
                 H1/H2/—/•List/1.List/🔗). blast.ts
                 sanitize-html allowlist updated (u, hr,
                 rel on a). ThemeProvider.tsx +
                 layout.tsx prefers-color-scheme branch
                 removed — always defaults to light.
30BN-ADMIN.28  ✓ middleware.ts → proxy.ts rename (Next
                 .js 16 convention). Function renamed
                 middleware → proxy. One line changed.
                 Deprecation warning resolved.
30BN-HELP.1    ✓ Help page audit (read-only). Full
                 section/subsection inventory, staleness
                 findings (MAJOR: show_type refs, default
                 hours, 3 account types), HelpTooltip
                 dependency map (9 must-preserve anchors),
                 missing content inventory, role assignment
                 map, proposed section structure.
30BN-HELP.2a   ✓ Help page structural scaffold. proxy.ts
                 /crew/help exception for Production role.
                 getAdminUser() in page.tsx. HelpContent
                 .tsx created (TocSection type, ALL_SECTIONS
                 registry, filterSections/isSectionVisible/
                 flattenSections helpers, role-aware TocList,
                 all existing content moved verbatim).
                 page.tsx reduced from 494 → 10 lines.
30BN-HELP.2b   ✓ Existing sections updated. Settings →
                 SA only (owner decision). Three new
                 Settings subsections (audit-log,
                 location-management, email-activity-log).
                 Three MAJOR stale content fixes (show type
                 → location, default hours hierarchy, four
                 account types + Production description +
                 calendar_editor flag). Eight subsection
                 role guards added. Production Help sidebar
                 link added (Sidebar.tsx visibleNavItems
                 filter). Milestones "every 25h thereafter"
                 added. Post-show Excused tile added.
30BN-HELP.2c   ✓ Three new h2 sections added. Dashboard
                 (3 subsections: dashboard-stats, dashboard-
                 season, dashboard-feed). Master Calendar
                 (9 subsections: calendar-overview through
                 calendar-public). Communication (1
                 subsection: blast-compose). ALL_SECTIONS
                 grew from 8 → 11 top-level entries.
                 HelpContent.tsx: 708 → 1006 lines.
30BN-HELP.2d   ✓ New HelpTooltip placements (5 of 9 —
                 4 deferred to ADMIN.29). SeasonAtAGlance
                 → dashboard-season. communication/page
                 .tsx → blast-compose. settings/locations/
                 page.tsx → location-management. settings/
                 audit-log/page.tsx → audit-log. settings/
                 email-activity/page.tsx → email-activity-
                 log. Count: 17 → 22.
30BN-ADMIN.29  ✓ Deferred calendar HelpTooltip placements
                 (B2–B5 from HELP.2d). All 4 placed in
                 Client Components (CalendarShell.tsx ×3,
                 PendingQueueClient.tsx ×1) — consistent
                 with 10 pre-existing Client Component
                 placements from 12.2c. Sibling placement
                 after </button> (not nested inside) to
                 avoid <a>-in-<button> HTML violation.
                 CalendarShell: calendar-submit (near
                 Add Event/Submit Request dropdown),
                 calendar-export (near desktop Export
                 button only), calendar-book-space (inside
                 canDirectCreate conditional). Pending
                 QueueClient: calendar-pending (inside h1).
                 Count: 22 → 26.
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
  optional label, "Generate QR Code" button, inline SVG preview in white container,
  PNG and SVG data URI download links.
- QR History Panel (added ADMIN.34): Every successful generation is saved to the
  `qr_codes` table (Migration 029). History is shared across all admins (any admin can
  see and re-download any saved QR). Chronological panel (newest first, capped at 50
  rows) displays below the generator: label (or URL domain if no label), full URL,
  "Generated by [name] · [date]", PNG download link, SVG download link. Download links
  are data URIs constructed from stored `png_base64` / `svg` — no JS required, plain
  `<a>` tags. Empty state: "No QR codes generated yet." Save is best-effort — failure
  never blocks returning the QR to the user.
- `lib/actions/qr.ts` — `generateQRCode(url, label)` server action: trims, validates,
  prepends protocol, calls generateQR(), inserts into `qr_codes`, calls
  `revalidatePath('/crew/tools/qr-generator')`, returns { svg, pngBase64 } or { error }.
- `lib/data/qr.ts` — `getQRHistory(supabase)`: queries `qr_codes` with creator name
  join, ordered by `created_at DESC`, limit 50.
- Page restructured (ADMIN.34): Server Component `page.tsx` (fetches history) +
  `components/crew/tools/QRGeneratorForm.tsx` (Client Component — form state) +
  `components/crew/tools/QRHistoryPanel.tsx` (Server Component — history list,
  plain `<a>` download links).
- Sidebar nav link to /crew/tools/qr-generator unchanged.
- Phase 7 is complete. The per-form QR (originally scoped here) shipped in 6.3.

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
- `app/not-found.tsx` — async Server Component 404 page (updated ADMIN.33). Light-mode only (no dark: variants — public-facing). Calls `resolveOrgIdentity()` for dynamic logo and org name. Fetches `not_found_heading` and `not_found_body` from `app_settings` (seeded Migration 028, customizable via Setup Panel Section 8). Dynamic logo (`org_logo_url || '/logo.png'`), dynamic heading, dynamic body text. Two `next/link` navigation links: `/` and `/crew/dashboard`.
- `app/error.tsx` — Client Component ('use client' required by Next.js for error boundaries — cannot use `resolveOrgIdentity()`). Light-mode only. AlertTriangle icon (text-orange), "Something went wrong" heading, "Try again" plain `<button>` (calls `reset()`), "Go home" `next/link`. Logo uses static `/logo.png` with generic alt text "Organization logo" (ADMIN.33 — Client Component constraint). Error message/digest never displayed to user.

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
- `slot_claims.show_date_id` denormalization — schema
  review deferred. ADMIN.31b planned as follow-up.

**Completed since v2.1 (removed from deferred list):**
- Waitlist renumbering in `cancelClaim()` — Fixed
  ADMIN.31: `renumber_waitlist()` Postgres function
  (Migration 027). `cancelClaim()` now calls
  `supabase.rpc('renumber_waitlist', ...)` — single
  atomic UPDATE eliminates the race condition.
- Phone search formatted input mismatch — Fixed
  ADMIN.31: `lib/volunteers/list.ts` strips non-digits
  from search term before ilike when input looks like
  a phone number.
- Reminder cron UTC date math — Fixed ADMIN.31:
  `fromZonedTime()` pattern applied (same as thank-you
  cron). DST-safe CT date boundary now used.

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

*Phase THEME complete. Phase 19 (Communication Preferences) complete. ADMIN.35–42 complete. Phase 21 (Rehearsal Management) complete. Phase AUDITIONS (Audition Management) complete — all 10 build prompts shipped (AUDITIONS.A through AUDITIONS.4b). Migration 032 applied. Phase 17 (Launch) is next.*

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

**13.4c ✓** npm vulnerability sweep. `npm audit fix`
applied (brace-expansion, fast-uri resolved). next
updated 16.2.9 → ^16.2.11 (9 Next.js CVEs resolved).
6 vulnerabilities remain (blocked upstream: postcss/sharp
exact-pinned inside next@16.2.11; shadcn/hono/mcp chain
requires shadcn major downgrade — not applied). All
remaining vulnerabilities are build-time/dev-CLI only,
not runtime exploitable.

### Phase HELP — In-App Help System ✓ Complete

**HELP.1 ✓** Read-only audit of existing help page.
Full section inventory, staleness findings, HelpTooltip
dependency map (9 must-preserve anchors), missing
content inventory (18 areas checked), role assignment
map, proposed section structure blueprint for HELP.2.

**HELP.2a ✓** Structural scaffold. `proxy.ts` exception
for Production role (`/crew/help` added alongside
`/crew/calendar`). `getAdminUser()` added to help
page. `HelpContent.tsx` created with role-aware TOC
system (`ALL_SECTIONS` registry, `filterSections()`,
`isSectionVisible()`, `flattenSections()` helpers).
All existing content moved verbatim. `page.tsx`:
494 → 10 lines.

**HELP.2b ✓** Existing sections updated. Settings
restricted to Super Admin only (owner decision).
Three new Settings subsections added (audit-log,
location-management, email-activity-log). Three MAJOR
stale content fixes (show_type → location; default
hours hierarchy; four account types + Production +
calendar_editor). Eight subsection role guards added.
Production sidebar Help link added. Minor: milestones
"every 25h thereafter", post-show Excused tile.

**HELP.2c ✓** Three new h2 sections: Dashboard (Quick
Stats, Season at a Glance, Activity Feed), Master
Calendar (9 subsections: Overview, Submitting, Direct
Creation, Bulk Rehearsal, Recurring Events, Pending
Queue, Book Space, Export & Subscription, Public
Calendar), Communication (Sending an Email Blast).
`ALL_SECTIONS`: 8 → 11 top-level entries.

**HELP.2d ✓** 5 new HelpTooltip placements:
`SeasonAtAGlance.tsx` → `dashboard-season`; 4 Settings
page headings → `location-management`, `audit-log`,
`email-activity-log`; `communication/page.tsx` →
`blast-compose`. Count: 17 → 22. 4 calendar placements
deferred to ADMIN.29 (Client Component heading issue).

**ADMIN.27 ✓** TipTap rich formatting extensions +
light mode default. See §10 log for detail.

**ADMIN.28 ✓** middleware.ts → proxy.ts rename.
See §10 log for detail.

**ADMIN.29 ✓** 4 deferred calendar HelpTooltip
placements. `CalendarShell.tsx`: `calendar-submit`,
`calendar-export`, `calendar-book-space` (all sibling
to buttons, not nested inside). `PendingQueueClient.tsx`:
`calendar-pending` (inside h1). Final count: 26.

### Phase SETUP — OpenCall OS Setup Panel

**SETUP.0** ✓ — Migration 023 + role guard sweep.
`023_owner_admin_feature_flags.sql` applied: `owner_admin`
added to `admin_users.role` CHECK, `calendar_editor` CHECK
updated to allow `owner_admin`, `is_editor()` replaced to
include `owner_admin`, `is_super_admin_or_owner_admin()`
helper added (locations RLS fix — discovered gap), 17
`app_settings` SETUP keys seeded. Full grep of 47
`super_admin` guard hits across codebase — each evaluated
individually (not bulk-replaced). `AdminRole` type updated
in `types/admin.ts`. `proxy.ts` updated: hard-redirect for
any non-Super-Admin on `/crew/settings/setup`. 29 files
modified total (actions, components, sidebar, help,
settings pages). `TopBar.tsx` exhaustive `Record<AdminRole>`
maps updated (caught by `tsc --noEmit`). Zero lint errors.
Commit df8f907.

**30BN-DOC.36** ✓ — Brief + Process Update v3.4 (SETUP.0
complete — this prompt).

Phase 14 — Check-In System ✓ Complete
  30BN-14.1  ✓ Migration 024 + public check-in page
               (app/checkin/[token]) + lib/actions/
               checkin.ts (resolveCheckInToken,
               checkInVolunteer, checkInNewVolunteer)
               + types/checkin.ts + validations +
               AuditAction types
  30BN-14.1-FIX ✓ Server-side showAgeRange validation
               gap (checkInNewVolunteer + CheckInClient)
  30BN-14.2  ✓ Dates tab QRs (per-date + whole-show) +
               Volunteers tab Self Check-In badge +
               types/show.ts check_in_token + interim
               /crew/tools/checkin stub update
  30BN-14.3  ✓ Live check-in dashboard: lib/data/
               checkin.ts + lib/actions/checkin-admin.ts
               + CheckInDashboard.tsx (10s refresh,
               accordion, roster, walk-ins)

Phase 15 — Document & Media System ✓ Complete
  30BN-15.1  ✓ Migration 025 (6 new tables) + media
               bucket + lib/actions/documents.ts +
               DocumentTypesManager.tsx +
               ConsentSubmissionsQueue.tsx + hub card fix
  30BN-15.2  ✓ /documents/[token]/route.ts + /consent/
               [token]/page.tsx + ConsentUploadForm.tsx +
               lib/actions/consent.ts +
               sendConsentFormRequestEmail() + volunteer
               consent trigger + consent_submission.
               file_received AuditAction
  30BN-15.2-AUDIT ✓ Post-build read-only audit (81 items:
               71 PASS, 1 PARTIAL, 9 FAIL). Identified
               9 items requiring 15.2-FIX (primarily
               activeFormUrl missing from email function
               and trigger — context compaction during
               build).
  30BN-15.2-FIX ✓ All 9 FAILs resolved: activeFormUrl
               param + conditional CTA in email function,
               is_active filter + active doc lookup in
               trigger, hidden file input, Try Again
               button, volunteerName in success state,
               recipientFilter corrected.
  30BN-DOC.37a ✓ Brief Update v3.5 Part A (§1, §3, §5,
               §7, §8, §12 feature spec updates)
  30BN-DOC.37b ✓ Brief Update v3.5 Part B (§9 schema,
               §11 phase tracking, version)
  30BN-15.3  ✓ (see §11 Phase 15 above)
  30BN-15.4  ✓ (see §11 Phase 15 above)
  30BN-DOC.38  ✓ Process Update v3.5 (Phases 14 +
               15.1–15.2 lessons learned — see Process
               doc v3.5 history entry)
  30BN-ADMIN.30 ✓ Sidebar dual-highlight fix (Shows
               link special-case excludes /crew/shows/
               opportunities subtree; isActivePath()
               untouched globally). HelpContent.tsx:
               2 new h2 sections (Check-In System +
               Media Library); 2 new Settings subsections
               (document-types, consent-forms); ALL_SECTIONS
               11 → 13. 6 new HelpTooltip placements
               (checkin/page.tsx, ShowDetail.tsx Dates tab,
               DocumentTypesManager, ConsentSubmissionsQueue
               ×2, MediaLibrary.tsx). Count: 26 → 32.
               7 files modified. Zero lint/tsc errors.
               Commit: 05f52e6.
  30BN-DOC.37c ✓ Brief Update v3.6 (see v3.6 history
               entry)
  30BN-HELP.2e ✓ ALL_SECTIONS owner_admin sweep.
               HelpContent.tsx: owner_admin added to
               all non-Settings section and subsection
               role arrays. 47 entries updated. Zero
               lint/tsc errors.
  30BN-DOC.41  ✓ Brief Update v3.7 (§7 Production row
               + §9 two stale CAL.8 notes fixed +
               HELP.2e logged — this prompt)
  30BN-DOC.42 ✓ Doc Update v3.8/v3.7/v13 — HELP.2e
               completion logged across all three
               governance documents.
  30BN-SETUP.1 ✓ Feature flag infrastructure +
               Migration 026. Commit 2c2a388.
  30BN-SETUP.2 ✓ Setup Panel UI Sections 1–4 + brand
               bucket + BrandImageUploader + react-
               easy-crop. Commit b63fae0.
  30BN-SETUP.3 ✓ Email Configuration section +
               resolveEmailSettings() + 16-function
               sweep. Commit 2cfb880.
  30BN-SETUP.4 ✓ Feature Flags + Instance Label
               sections. Phase SETUP complete.
               Commit 562f9d4.
  30BN-ADMIN.31 ✓ Seven-item deferred sweep: payload
               builder logoUrl threading + call sites,
               resolveOrgIdentity() + landing page
               org identity, getAdminClient on page.tsx,
               phone search strip, reminder cron DST fix,
               volunteer.signup audit logging,
               renumber_waitlist() RPC (Migration 027).
               Commit a6ab89c.
  30BN-ADMIN.31b ✓ Dead pre-Migration-025 documents
               query deleted from app/page.tsx
               (consentDoc + showConsentLink + JSX —
               24 lines). Footer copyright © {org_name}
               dynamic. Commit 6540df9.
  30BN-DOC.43a ✓ Brief Update v3.9 (this prompt)
  30BN-ADMIN.32 ✓ Read-only audit: Owner Admin
               permission gaps (4 component files,
               1 volunteer_notes RLS gap, 1 calendar
               day panel UI gap), Production role
               absent from all User Management paths,
               hardcoded 30BN string inventory (10
               action-needed items), 404 page state,
               role badge completeness (all 5 roles
               confirmed), changeRole() scope gaps.
               No code changes. Findings drove ADMIN.33.
  30BN-ADMIN.33 ✓ (+ ADMIN.33-CONT) Role permissions
               sweep: OA canEdit in 4 components
               (OpportunityList, FormList, ShowList,
               ShowDetail) + CalendarDayPanel; OA/
               Production in CreateUserModal +
               PendingRegistrations + admin-
               registration.ts; changeRole() expanded
               (4 options, Production target rows
               unlocked, OA-on-OA unlocked);
               deactivateUser() OA-on-OA lock removed.
               OpenCall OS branding sweep: resolveEmail
               Settings() extended (orgName +
               orgContactEmail); ~39 email body copy
               hits replaced with dynamic org name;
               blast.ts FROM_ADDRESS fix; all 13 public
               pages + Sidebar wired through
               resolveOrgIdentity() (incl. org_logo_url
               extension + next.config.ts remotePatterns);
               BulkEmailSection defaultSubject prop;
               HelpContent generic language; iCal
               PRODID + UID domains genericized; settings/
               page.tsx production exclusion defense-in-
               depth. Setup Panel Section 8 (404 Page):
               not_found_heading + not_found_body keys,
               saveNotFoundPage() action, SetupPanel.tsx
               Section 8, not-found.tsx dynamic. Migration
               028. 45 files. Commits 43f1b7d + 43f1b7d
               (CONT same commit).
  30BN-ADMIN.34 ✓ QR code history panel (Migration 029,
               qr_codes table, QRGeneratorForm.tsx +
               QRHistoryPanel.tsx, lib/data/qr.ts,
               generateQRCode() extended to persist);
               payload builder parameterization (from/
               replyTo params, FROM_ADDRESS + REPLY_TO
               constants deleted); metadata description
               via org_tagline (|| fallback); resolve
               EmailSettings() orgContactEmail (fixes
               sendInfoUpdatedEmail + sendWelcomeEmail +
               sendRegistrationDeclinedEmail); OA-can-
               assign-OA in PendingRegistrations.tsx +
               approveRegistration() (self-caught guard
               bug corrected before commit — F1).
               13 files. Commit 28e0c4e.
  30BN-DOC.44 ✓ Brief Update v4.0 (ADMIN.32–34:
               OA permissions, OpenCall OS branding
               sweep, QR history, Setup Panel
               Section 8, Migrations 028–029).
  30BN-DOC.44-FIX ✓ Brief §8 QR Generator spec
               synced with ADMIN.34 (history panel,
               generateQRCode signature, new components).
               Commit 122ca3a.
  30BN-DOC.45 ✓ Process Update v3.9 (ADMIN.32–34
               complete, OA permission model, resolve
               EmailSettings return types, || vs ??
               pattern, new grep/checklist items).
               Commit 122ca3a.
  30BN-DOC.46 ✓ Deferred Verifications v15 (ADMIN.33–34
               items: 34 new items — 7.1 V11–V17 QR
               history, ADMIN.33 V1–V23, ADMIN.34 V1–V4;
               stale ref fixes; ADMIN.26 V5 superseded).
               Commit 8b32b85.
  30BN-DOC.46-FIX ✓ Three corrections: ADMIN.23 V4
               attribution (ADMIN.34 → ADMIN.33), item
               count 775 → 774, Brief "Seven" → "Eight"
               independently-saving sections. Commit 7f816fa.
  30BN-THEME.A ✓ Read-only audit. 1,381 brand-derived
               class instances across 130 files. 6 brand-
               derived token families (navy, orange, steel,
               slate, light-navy, pale-orange). Confirmed
               Option A (CSS color-mix). 15 distinct utility
               classes needed (69 rules with variants).
               F1: steel/slate hue mismatch (percentages
               adjusted to 59%/47%). F3: opacity modifier
               pattern resolved via color-mix(transparent).
               F4: categorical color exception policy set.
               Email template THEME.3 preview (42 hex hits).
               No code.
  30BN-THEME.1 ✓ CSS foundation + public pages (30 files,
               305 instances). globals.css @layer utilities
               (69 rules). app/layout.tsx resolveBrandColors()
               + <style> tag (6 custom properties). Commit
               406b188.
  30BN-THEME.2a ✓ Admin pages sweep (30 app/crew/ files,
               110 instances). Categorical exceptions: claim-
               type badges → fixed hex. Commit 6576a55.
  30BN-THEME.2b ✓ Crew shared + settings components (21
               files). Categorical exceptions: role badges
               (TopBar, UsersTable), System badge (Document
               TypesManager), LocationsManager L214/230 left
               untouched. Commit bf53e17.
  30BN-THEME.2c ✓ Shows, volunteers, opportunities, forms,
               dashboard components (28 files, 236 instances).
               Categorical exceptions: claim-type badges
               (OpportunityList), activity-feed borders
               (ActivityFeed). Commit 1c40bc6.
  30BN-THEME.2d ✓ Calendar, communication, media, tools,
               help components (21 files, 201 instances).
               MediaLibrary categorical exception (access-
               tier badge → fixed hex including dark: variants).
               Full-codebase final grep: zero remaining static
               brand token classes. Commit 8bc26d5.
  30BN-THEME.3 ✓ Email template brand color sweep (5 files).
               resolveEmailSettings() +brandPrimary +brand
               Accent. buildEmailHtml() +brandPrimary +brand
               Accent. 4 payload builders gain brand params.
               All call sites in shows.ts + cron routes pass
               dynamic values. Self-caught: emailShell(),
               instructionsBlockHtml(), cancelLinkHtml(),
               addToCalendarLinkHtml() all contain hardcoded
               navy — extended. buildCtaButton() uses navy
               at every call site (never orange — confirmed).
               Commit 69d7dfa.
  30BN-THEME.3b-4 ✓ Light-navy in emails + PDF export brand
               colors (4 files + 1 new). lib/utils/color.ts
               (new — lightenHex() utility). resolveEmail
               Settings() +brandPrimaryLight (computed from
               brandPrimary via lightenHex 8%). sendWelcome
               Email() + instructionsBlockHtml() use brand
               PrimaryLight. VolunteerListPDF.tsx refactored:
               createStyles(brandPrimary, brandPrimaryLight)
               factory (StyleSheet.create() at module-load
               requires factory, not top-level constant —
               self-caught). PDF route handler fetches
               brand_primary + computes brandPrimaryLight.
               Phase THEME fully complete. Commit 66d2ba7.
  30BN-DOC.47 ✓ Brief Update v4.1 (this prompt)
  30BN-ADMIN.35-AUDIT ✓ Dark mode background regression
               audit (read-only). Root cause confirmed:
               bg-brand-primary-light (hand-authored
               @layer utilities, compiled after Tailwind
               auto-generated utilities) overrides
               dark:bg-dark-bg on same element due to
               PostCSS source order. ~74 lines across ~50
               files affected. Main content area gap
               identified at layout.tsx:74.
  30BN-ADMIN.35 ✓ Dark mode main content area fix.
               app/crew/(app)/layout.tsx: bg-brand-
               primary-light → bg-gray-50 on <main>
               wrapper. Broader cascade defect deferred
               to ADMIN.39-AUDIT + ADMIN.39. Commit
               7ffbee9.
  30BN-ADMIN.36 ✓ Google OAuth registration path for
               Request Access flow. auth/callback/route.ts:
               if (!adminUser) branch (new registrant →
               insert pending_registrations + notify SAs
               + ?registered=google; pending → ?pending=true;
               declined → ?error=declined). googleSignIn.ts
               (new — shared handler). RegisterForm.tsx:
               Google button + 3 new param states. lib/
               actions/admin-registration.ts: getUserById()
               for Google identity detection; sendGoogle
               ApprovalEmail() routing. lib/email.ts:
               sendGoogleApprovalEmail(). Discovered: Google
               path never checked is_active (fixed ADMIN.38).
               Discovered: approveRegistration() never called
               createUser() — always reused auth_user_id.
               7 files.
  30BN-ADMIN.37 ✓ revalidatePath gaps + role guard fix.
               lib/actions/volunteers.ts: revalidatePath()
               added to addNote(), editNote(), deleteNote(),
               toggleStatus(). editNote()/deleteNote()
               required .select('volunteer_id').single()
               to retrieve parent ID for revalidation path.
               updateVolunteer() role guard: role==='viewer'
               → allowedRoles allowlist (blocks Production).
               1 file.
  30BN-ADMIN.38 ✓ is_active Google path + email log +
               Production role guards. auth/callback/
               route.ts: SELECT widened to include is_active;
               is_active===false → signOut() + ?error=
               not_authorized. Inline email_log +
               email_log_recipients for Google registrants
               (non-blocking, getAdminClient(), trigger:
               admin_registration_request). lib/actions/
               volunteers.ts: addNote(), toggleStatus(),
               addManualHours() guards → allowedRoles
               allowlist. 2 files.
  30BN-19.1    ✓ Migration 030 + server actions.
               communication_preference column on volunteers
               (nullable text CHECK). submitVolunteerForm()
               (app/actions/volunteer.ts) + updateVolunteer()
               (lib/actions/volunteers.ts): field added.
               updateCallboardPreference() (lib/actions/
               callboard.ts): getAdminClient(), session
               cookie. updateVolunteerPreference() (lib/
               actions/volunteers.ts): getServerClient(),
               allowedRoles guard. CSV export: 'Preferred
               Contact' header. 8 files.
  30BN-19.2    ✓ Public forms. VolunteerForm.tsx + Volunteer
               UpdateForm.tsx: preference dropdown added.
               app/update/actions.ts (updateVolunteerInfo()):
               field added — discovered /update submits
               here, not through lib/actions/volunteers.ts.
               mergeVolunteer(): field added. Zod:
               z.string().optional() not z.enum() — empty
               string from <select> fails enum silently.
               5 files.
  30BN-19.3    ✓ Admin + Call Board UI. session.ts:
               VOLUNTEER_COLUMNS extended. VolunteerCard.tsx:
               badge + inline select, optimistic state,
               router.refresh(). VolunteerProfileForm.tsx:
               view field + edit select, z.enum→z.string
               schema bug fixed. VolunteersTable.tsx: row
               badge. PDF omitted (10-column A4 too tight).
               10 files.
  30BN-DOC.50  ✓ Brief Update v4.2 (Phase 19 complete,
               ADMIN.35–38, auth patterns, zod select
               pattern, update form action clarification).
               Note (added retroactively in DOC.53):
               this update was logged as shipped in the
               Process doc's prompt history but was never
               actually committed to this file — the Brief
               remained at v4.1 in the live repo. Its
               intended content was reconstructed from the
               Process doc and applied together with DOC.53
               in a single v4.1→v4.3 session. See DOC.53
               Flags.
  30BN-ADMIN.39-AUDIT ✓ Full dark mode cascade defect
               inventory. Raw B1–B5 grep: 346 lines /
               87 files. After property-group-aware
               filtering: 245 confirmed pairs across 54
               files. Groups: A (122 REPLACE_BASE), B
               (none), C (4 SHADCN), D (18 decisions).
               All Group D items resolved via owner
               decisions. Companion fix (editNote/delete
               Note role guard) dropped — Editors remain
               append-only (RLS incompatible + design
               intent confirmed). Split into 3 execution
               prompts: 39a/39b/39c.
  30BN-ADMIN.39a ✓ Calendar components + shadcn. 15
               files, 38 edits. CalendarShell (12),
               MonthView, WeekView, DayPanel, EventChip,
               FilterBar, ExportModal, BookSpacePanel,
               EventForm, BulkRehearsalForm, Recurring
               EventForm (including two-part text fix),
               RecurrenceScopePicker (base + dark target
               dark-surface→dark-border), PendingQueue
               Client, dialog.tsx, alert-dialog.tsx.
               Key: governing hover rule established
               (dark target determines gray-50 vs
               gray-100 replacement). Commit db7ebcc.
  30BN-ADMIN.39b ✓ Volunteer/show/forms/settings. 25
               files, 64 edits. Volunteer: Volunteers
               Table (badge two-part text fix), Volunteer
               ProfileForm (dark target correction +
               has-[:checked]: extension), EditorNotes,
               StatusToggle, CommunicationHistory (zebra
               dark-surface→dark-bg), CallHistoryTable
               (same), volunteers/[id]/page. Shows:
               ShowDetail (dark:bg-dark-nav removed from
               brand badge; /30 notice box), ShowList,
               ShowForm, PostShowReport, BulkEmailSection.
               Forms: FormList, FormBuilder, FormDetail
               Actions, FieldRow (dark-nav→dark-border),
               ResponseViewer. Settings: AuditLogTable,
               LocationsManager, HearingOptionsManager,
               CategoriesTable, CreateUserModal, Pending
               Registrations, DocumentTypesManager,
               ConsentSubmissionsQueue. Commit 5213fb4.
  30BN-ADMIN.39c ✓ Dashboard/help/media/tools/comm/
               sidebar/email-activity/opportunities.
               14 files (13 scoped + audit-log/page.tsx
               recovered via F7 sweep), 43 edits.
               HelpContent: Tip/Warning callouts + heading
               text (dark:text-brand-primary-mid, not
               dark:text-dark-text — native class loses
               to hand-authored base via same cascade
               defect). MediaLibrary: 13 instances incl.
               folder-pill base fix + 2 page-level hover
               exceptions. CheckInDashboard (/50 opacity
               preserved). email-activity: badge two-part
               + zebra dark-surface→dark-bg + hover. All
               others standard substitutions. F7 final
               sweep: cascade defect closed across all
               54 audited files. Residual: Opportunity
               Form.tsx:99,115 (not in original audit
               scope — ADMIN.40). Commit 5b9aa6d.
  30BN-DOC.51  ✓ Process Update v4.1 (Phase 19, ADMIN.35–38,
               new patterns and checklist items)
  30BN-DOC.52  ✓ Deferred Verifications v17 (ADMIN.35–38 +
               Phase 19 verification items)
  30BN-DOC.53  ✓ Brief Update v4.3 (this prompt — folds in
               the reconstructed v4.2 content above)
  30BN-ADMIN.40 ✓ OpportunityForm.tsx has-[:checked]:
               cascade fix. Two radio-card elements
               (claim-type selector). Single-part:
               has-[:checked]:bg-brand-primary-light →
               bg-white. Dark target dark-surface/50
               confirmed correct (canvas parent, not
               self-match). 1 file. Commit 1da6b04.
  30BN-ADMIN.41 ✓ globals.css: authored missing
               dark:bg-brand-primary-light/30 +
               dark:hover:bg-brand-primary-light/50
               rules. First discovery of the opacity-
               variant gap class. globals.css only.
               Commit b050736.
  30BN-ADMIN.42-AUDIT ✓ Exhaustive audit of all 3
               components/ui/ files (button.tsx,
               dialog.tsx, alert-dialog.tsx). 29 brand
               utility class references. 12 MISSING
               rules across 3 families. 0 WRONG. Three
               ACCESSIBILITY gaps (focus rings). Full
               matrix + exact CSS + insertion points
               specified — no re-investigation needed.
  30BN-ADMIN.42 ✓ 12 missing globals.css rules added.
               3 passes: brand-primary (2), brand-
               primary-mid (1), brand-accent (9).
               Accessibility gaps closed (focus rings
               now rendering correctly on all button
               variants + dialog close). globals.css
               only. Zero component changes. Zero
               regressions. R36 established.
  30BN-DOC.54  ✓ Process Update v4.2 (ADMIN.39a–c
               patterns, R35 formal rule, Editor
               append-only confirmed, cascade sweep
               complete, prompt log completed)

**SETUP.1** ✓ — Feature flag infrastructure.
`lib/feature-flags.ts`: `getFeatureFlags()` + `FeatureFlags`
type (three flags: calendar, checkin, blast). Migration 026
(delete 3 stale flag rows; insert favicon_url). `proxy.ts`
extended: five guarded routes (3 crew + 2 public), matcher
extended, conditional flag fetch. `app/crew/(app)/layout.tsx`
fetches flags, passes to Sidebar. Sidebar.tsx conditional
rendering for Calendar/Check-In/Communication links.
Per-page guards on 6 pages. Per-action guards: 16 functions
across blast.ts, calendar.ts, checkin.ts, checkin-admin.ts.
`syncShowDateToCalendar()` no-op when calendar off.
`sendSlotClaimEmail()` / `sendWaitlistPromotionEmail()` accept
calendarEnabled param. Call Board .ics links conditional.
22 files. Commit 2c2a388.

**SETUP.2** ✓ — Setup Panel UI Sections 1–4 (Org Identity,
Brand Colors, Logo, Favicon). `lib/actions/setup.ts` created
(6 actions + `getSignedBrandUploadUrl()`). `lib/utils/
image-crop.ts` (`getCroppedImg()` — pure canvas utility).
BrandImageUploader.tsx: URL input OR file upload with
react-easy-crop editor; free aspect ratio for logo, 1:1
square lock for favicon; P-DC to brand public bucket.
SetupPanel.tsx (Sections 1–4). setup/page.tsx (Server
Component, double-guarded). `generateMetadata()` in
`app/layout.tsx` reads favicon_url + org_name. Settings
hub Platform Setup card (SA LinkedCard; all others
LockedCard). brand public bucket created. react-easy-crop
v6.2.3 installed. 8 files created/modified. Commit b63fae0.

**SETUP.3** ✓ — Section 5 (Email Configuration) +
`resolveEmailSettings()` internal helper in `lib/email.ts`
(fetches email_from_address, email_from_name, org_logo_url
in one query; falls back to 30BN defaults). `buildEmailHtml()`
extended with optional logoUrl param. All 16 direct-call
send functions swept to use emailSettings.from and
emailSettings.logoUrl. 4 payload builders
(buildReminderEmailPayload, buildThankYouEmailPayload,
buildShowBulkEmailPayload, buildCategoryMatchNotification Payload) extended with logoUrl? param; call sites in
`lib/actions/shows.ts` and both cron routes use inline
app_settings fetch (ADMIN.31). `saveEmailConfig()` added to
setup.ts. 5 files modified. Commit 2cfb880.

**SETUP.4** ✓ — Sections 6–7 (Feature Flags + Instance Label).
`saveFeatureFlags()` + `saveInstanceLabel()` added to setup.ts.
Flag section: three toggle rows, one Save button, optimistic
local state. `saveFeatureFlags()` revalidates: /crew layout
(propagates to sidebar) + / + /shows + /calendar. Instance
label displayed in setup page header when set. setup/page.tsx
fetches 14 keys total (9 SETUP.2 + default_reply_to SETUP.3 +
4 new: flag keys + instance_label). Phase SETUP complete.
4 files modified. Commit 562f9d4.

### Phase THEME — Dynamic CSS Brand System ✓ Complete

**THEME.A ✓** — Read-only audit. Full inventory of all
brand-derived color classes across 130 files: 1,381 class
instances. Confirmed Option A (CSS `color-mix()` derivation for
tints) with adjusted percentages (steel→59%, slate→47%).
Identified 8 categorical color exceptions (role badges,
claim-type badges, activity-feed borders). Surfaced F1
(`color-mix()` hue mismatch — steel/slate are not pure navy
tints), F3 (opacity modifier `/NN` pattern for `@layer`
utilities), F4 (categorical color reuse). All three
resolved in THEME.1 design decisions before any code.

**THEME.1 ✓** — CSS foundation + public pages sweep.
`app/globals.css`: new `@layer utilities` block (69 CSS
rules — 15 base classes + variants + opacity variants via
`color-mix(..., transparent)`). `app/layout.tsx`:
`resolveBrandColors()` + `<style>` tag injecting 6 CSS
custom properties (`--brand-primary`, `--brand-accent`,
`--brand-primary-mid` 59%, `--brand-primary-tint` 47%,
`--brand-primary-light` 8%, `--brand-accent-light` 5%).
Single injection point in root layout (cascades to all
routes including `/crew/*`). `@theme` block unchanged (R7).
All 30 public files swept (17 app/ + 13 components/) —
305 instances replaced. Categorical exceptions applied.
Commit 406b188.

**THEME.2a–2d ✓** — Admin UI sweep. 100 admin files
(30 app/crew/ + 70 components/crew/). 1,076 instances
replaced across 4 sub-prompts. Categorical exception rule:
role badges, claim-type badges, access-tier badges,
activity-feed borders converted to fixed Tailwind arbitrary
hex (e.g. `bg-[#293994]`) — not brand utility classes.
Full-codebase final grep after THEME.2d confirmed zero
remaining brand-derived static token classes.

**THEME.3 ✓** — Email template brand color sweep.
`resolveEmailSettings()` extended: fetches `brand_primary`
and `brand_accent` from `app_settings`, passes them plus
computed `brandPrimaryLight` to all email functions. All
~42 hardcoded `#293994`/`#F26522` hex hits in `lib/email.ts`
and `lib/actions/blast.ts` replaced with dynamic string
interpolation. 4 payload builders gain `brandPrimary?` and
`brandAccent?` params. String substitution used (not CSS
custom properties — email clients don't support `var()`).
Additional helpers extended: `emailShell()`,
`instructionsBlockHtml()`, `cancelLinkHtml()`,
`addToCalendarLinkHtml()`, `milestoneEmailContent()`.
5 files. Commit 69d7dfa.

**THEME.3b ✓** — Light-navy (`#EEF1FA`) in email templates.
`resolveEmailSettings()` further extended to return
`brandPrimaryLight` computed via `lightenHex(brandPrimary, 0.08)` from new `lib/utils/color.ts`. `instructionsBlockHtml()`
derives its own tint internally (called from payload builders
that don't have a precomputed `brandPrimaryLight`).
`sendWelcomeEmail()` uses `brandPrimaryLight` for login-
details box background. Zero hardcoded `#EEF1FA` remain
in email templates. Bundled with THEME.4 as THEME.3b-4.

**THEME.4 ✓** — PDF export brand colors. `VolunteerListPDF.tsx`
refactored: hardcoded NAVY/LIGHT_NAVY constants replaced
with `createStyles(brandPrimary, brandPrimaryLight)` factory
function called inside the component body. `@react-pdf/renderer`
calls `StyleSheet.create()` at module load time (before props
are available), making the factory pattern mandatory — top-level
constant reassignment would silently fail. Route handler
`app/crew/(app)/volunteers/export/route.tsx` fetches
`brand_primary` from `app_settings`, computes `brandPrimaryLight`
via `lightenHex()`, passes both as props. `lib/utils/color.ts`
created (new file). 4 files. Commit 66d2ba7.

### Phase 14 — Check-In System ✓ Complete

**14.1 ✓** Migration 024 (show_dates.check_in_token + attendance.slot_claim_id
nullable). Public check-in page at `/checkin/[token]` (handles both per-date
and whole-show tokens). `lib/actions/checkin.ts`: `resolveCheckInToken()`,
`checkInVolunteer()`, `checkInNewVolunteer()`. Full inline signup form for
walk-in volunteers. CT-aware date gating. 3-tier hours fallback (`resolveHoursLogged()`
+ `applyHoursForCheckin()`). `lib/validations/checkin.ts`:
`createCheckInSignupSchema(showAgeRange)` factory. `types/checkin.ts`: all
check-in types. `lib/audit.ts`: `attendance.checkin`, `volunteer.checkin_signup`
AuditAction types added.

**14.1-FIX ✓** Three corrections from 14.3 audit (Q3): server-side `checkInNewVolunteer()`
gained `showAgeRange: boolean` param for conditional age_range validation (real gap was
server-side only — client already worked). `CheckInClient.tsx` passes `showAgeRange` prop
through. No schema changes.

**14.2 ✓** Admin show detail updates: Dates tab per-date check-in QRs (always visible,
PNG + SVG downloads) + whole-show QR at top. Volunteers tab "Self Check-In" badge on
`source = 'checkin'` rows. `show_dates.check_in_token` and `shows.check_in_token` added
to data fetches. `/crew/tools/checkin` stub updated to interim pointing message (replaced
in 14.3). `types/show.ts`: `check_in_token?: string` added to ShowDate.

**14.3 ✓** Live check-in dashboard at `/crew/tools/checkin` replacing the stub.
`lib/data/checkin.ts`: `getCheckInDashboardData(supabase)`. `lib/actions/checkin-admin.ts`:
`getCheckInRosterForDate()` (uses `getServerClient()` — authenticated; separate file from
public-route checkin.ts). `components/crew/tools/CheckInDashboard.tsx`: 10s auto-refresh
via `router.refresh()` + `setInterval`, date selector, accordion for other shows, full
RosterTable with all 5 status states, walk-in section, "Last updated Xs ago" counter.
Additional types in `types/checkin.ts`: `CheckInRosterEntry`, `CheckInWalkIn`,
`CheckInRoster`, `CheckInShowSummary`, `CheckInDashboardData`.

### Phase 15 — Document & Media System ✓ Complete

**15.1 ✓** Migration 025 (drop old documents table + create 6 new tables: document_types,
media_folders, media_folder_access, documents, document_access, consent_form_submissions;
5 document_type seed rows). Supabase Storage `media` bucket (private). `lib/audit.ts`:
document and consent_submission AuditAction types. `lib/actions/documents.ts`: document
type CRUD (`createDocumentType`, `updateDocumentType`, `deleteDocumentType`,
`reorderDocumentType`, `setTypeActiveDocument`) + consent submission review
(`approveConsentSubmission`, `rejectConsentSubmission`). `/crew/settings/documents`
page: `DocumentTypesManager.tsx` (inline edit, reorder, system-type guard, active document
picker) + `ConsentSubmissionsQueue.tsx` (3 tabs, approve/reject). Hub card "Beta" badge
removed; guard corrected to SA/OA only (15.1 Q2).

**15.2 ✓** (+ 15.2-AUDIT + 15.2-FIX) `app/documents/[token]/route.ts`: universal
document redirect route (access tier enforcement, signed URL generation from `media`
bucket, link redirect). `app/consent/[token]/page.tsx` + `ConsentUploadForm.tsx`:
public P-DC consent form upload page (XHR with progress, all states, file type
validation). `lib/actions/consent.ts`: `getConsentUploadUrl()` + `confirmConsentSubmission()`
(getAdminClient() only). `sendConsentFormRequestEmail()` in `lib/email.ts`: conditional
download CTA when active form exists, "coordinator will provide" fallback, upload CTA
always present, `trigger:consent_form_request`. Under-18 consent trigger added to
`submitVolunteerForm()`: non-blocking, looks up active consent form document for
`activeFormUrl`, inserts `consent_form_submissions`, sends email.
`lib/audit.ts`: `consent_submission.file_received` added. 15.2-AUDIT caught 9 FAILs
(context compaction during build); 15.2-FIX resolved all: `activeFormUrl` param added
to email function, trigger upgraded to look up active document, `is_active` filter added
to document_types query, file picker UX fixed (hidden input + trigger button), "Try
Again" button added, `volunteerName` added to success state.

**15.3 ✓** Master media library at `/crew/media` (all roles including Production).
`components/crew/media/MediaLibrary.tsx`: folder browser (left panel), document
table (right panel), Copy Link, QR download, Play/View button per row. Access tier
badges. `detectLinkType()`, `isPlayable()`, `getPlayLabel()` helpers. P-DC upload
flow (file picker → signed URL → client PUT → confirmation action). Link entry form
for YouTube/Vimeo/audio/generic. Commit: 26a4585.

**15.4 ✓** Media players + embed detection. `app/documents/view/[token]/page.tsx`
(new public Server Component): access tier enforcement, signed URL for files,
YouTube/Vimeo iframe embed, native `<video>` / `<audio>` players, `<img>` for
images, PDF inline viewer. Robots noindex. `/documents/[token]/route.ts` updated:
`detectLinkType()` + `isViewableMimeType()` helpers; YouTube/Vimeo/audio links and
viewable-mime-type files now route to player page instead of direct redirect.
`MediaLibrary.tsx` updated: Play/View button uses `detectLinkType()` and
`isPlayable()` to determine eligibility; "no folders" empty state added. Commit: 63570b8.

### Phase 16 — Google SSO ✓ Completed in Alpha (30BN-1.3)
- Configure Google OAuth in Supabase Auth
- Add "Sign in with Google" button to `/crew/login`
- Confirm redirect URIs for production domain

### Phase AUDITIONS — Audition Management System ✓ Complete

**Confirmed as pre-launch build:** Specced in full August 2026. All 10 build prompts complete.

**Architecture decisions (confirmed):**
- Auditioners are a separate data entity from volunteers. `audition_signups` table, not `volunteers`. No automatic volunteer record created at signup.
- Auditions can be show-linked (`show_id` FK, nullable) or standalone. Both supported.
- Callbacks are child auditions via `parent_audition_id` FK, nullable. Can be same-day or separate events.
- Two audition types: open_call and timed_slots. Configurable per audition.
- Slot cap is configurable per audition: 1 = appointment model, N = group session.
- Material uploads are per-type toggles per audition: headshot, resume, sheet music, MP3, video.
- Upload at signup AND late upload via unique `upload_token` link (same P-DC pattern as Phase 15).
- Under-18 consent trigger: `cast_consent_form` document type (already seeded in Migration 025). Same non-blocking pattern as Phase 15.2 volunteer consent.
- Notification emails: toggle (default off). When on, status changes fire the configured template automatically. Three templates: Callback, Cast, Not Cast. TipTap editor with merge tags + live preview. Stored in `audition_email_templates` table.
- Public discovery: auditions card on landing page (`/`) and `/shows` only. No dedicated `/auditions` listing page.
- Check-in: `check_in_token` on `auditions` table. Self-check-in at `/audition-checkin/[token]`. Roster-dropdown identity (same as rehearsal check-in). Admin manual marking also available.
- Calendar: auditions with `calendar_visibility = 'public'` sync to `calendar_events` as `event_type = 'audition'`, `status = 'approved'`.
- Convert to volunteer: action available on Signups tab when signup status = Cast (SA/OA/Editor only). Inserts `volunteers` record pre-populated with name/email/phone. No Supabase Auth account created.
- Feature flag: `feature_auditions` (5th active flag, seeded in Migration 032).
- Production access: two independent paths — show assignment (via show editors, grants access to show + all linked auditions) or direct audition assignment (via `audition_assignments` table, standalone auditions only). Managed from audition detail Settings tab. AUDITIONS.2a is a targeted infrastructure prompt that expands Production show access and wires both paths before the admin UI is built.
- Email Templates tab stub pattern: built as a stub in AUDITIONS.2b, fully implemented in AUDITIONS.2c after AUDITIONS.4a ships the TipTap merge tag extension.
- Role access: SA/OA/Editor/Production (assigned) = full read/write. Viewer = read-only. Convert-to-volunteer and archive/delete = SA/OA/Editor only.

**Schema (Migration 032 — 8 new tables):**
`auditions`, `audition_roles`, `audition_slots`, `audition_signups`, `audition_signup_notes`, `audition_materials`, `audition_assignments`, `audition_email_templates`. Full schema blocks in §9.

**11-prompt structure:**

AUDITIONS.A Read-only audit (no code — reuse surface assessment)
AUDITIONS.1a Migration 032 (8 tables + feature_auditions seed) + types/audition.ts
AUDITIONS.1b Server actions (lib/actions/auditions.ts public + lib/actions/auditions-admin.ts authenticated + calendar sync extension)
AUDITIONS.2a Production show access expansion (proxy.ts + show detail guards + sidebar Production allowlist for shows — ADMIN-style infra prompt)
AUDITIONS.2b Admin UI — /crew/auditions list + detail page Overview/Signups/Materials/Communication tabs + sidebar nav (three-part atomic edit) + feature flag guard + Production access guard + audition_assignments roster on Settings tab
AUDITIONS.2c Admin UI — Settings tab + Email Templates tab (TipTap editor stub in 2b, full implementation in 2c after 4a ships)
AUDITIONS.3a Public signup page /auditions/[id] (open call + timed slots + role picker + is_minor + consent trigger + confirmation email)
AUDITIONS.3b Material uploads on signup + late upload route /auditions/upload/[token] + auditions card on / and /shows + /audition-checkin/[token] public check-in + calendar sync
AUDITIONS.4a TipTap merge tag extension (custom TipTap node type, toolbar inserter, live preview server action)
AUDITIONS.4b All email send functions + bulk communication tab + convert-to-volunteer action + HelpContent 15th section + Deferred Verifications v19 additions
DOC.59 Brief v4.7 + Process v4.5 (post-build update after all 10 prompts complete) — this prompt

**30BN-AUDITIONS.A ✓** Read-only audit. Seven read targets confirmed (feature-flags.ts, proxy.ts, Sidebar.tsx, calendar-sync.ts, Phase 15.2 consent trigger, lib/actions/rehearsals.ts check-in pattern, show detail guard). Key findings: feature_auditions absent from all three locations; needsFlagCheck exact insertion points identified; Sidebar three-part atomic edit confirmed; syncAuditionToCalendar() insertion point confirmed; cast_consent_form document type confirmed present; checkInToAudition() takes signupId not adminUserId (auditioners have no Auth identity); show_editors uses admin_id column (not admin_user_id). No code.

**30BN-AUDITIONS.1a ✓** Migration 032 applied (8 new tables: auditions, audition_roles, audition_slots, audition_signups, audition_signup_notes, audition_materials, audition_assignments, audition_email_templates; feature_auditions seeded; calendar_events_event_type_check updated to include 'audition'). `types/audition.ts` created (all Phase AUDITIONS types). `lib/feature-flags.ts` updated (auditions: boolean, 5th flag). `components/crew/settings/SetupPanel.tsx` 5th toggle. `app/crew/(app)/settings/setup/page.tsx` companion edit required (SetupPanelInitialValues type widening). 5 files.

**30BN-AUDITIONS.1b ✓** `lib/actions/auditions.ts` (new — PUBLIC ROUTE: 7 functions). `lib/actions/auditions-admin.ts` (new — 14 authenticated functions + assertAuditionAccess() private helper). `lib/actions/calendar-sync.ts`: syncAuditionToCalendar() added (mirrors syncShowDateToCalendar, source='audition', onConflict: source_audition_id). `lib/audit.ts`: audition.convert_to_volunteer added. Pre-task inline fixes: calendar_events_source_check updated ('audition' added), source_audition_id column + partial unique index added. AUDITIONS.2a F2 later corrected: syncAuditionToCalendar() uses getFeatureFlags(supabase) not inline app_settings fetch (R32). 4 files + 2 inline DB fixes.

**30BN-AUDITIONS.2a ✓** Inline schema fixes: audition_signups.phone SET NOT NULL (requires phone on audition signup form); email_log.recipient_type CHECK updated to include 'audition'. proxy.ts: 5 auditions changes (needsFlagCheck ×3, Production allowlist for /crew/shows/ scoped with trailing slash, crew flag block, public flag block). show detail page: Production access guard added (show_editors.admin_id, redirect to /crew/calendar). lib/actions/shows.ts: 9 mutating actions updated (5 with show_editors membership check for Production, 4 blocking Production entirely). lib/actions/auditions-admin.ts: convertToVolunteer() phone guard removed; lib/actions/auditions.ts: phone required in Zod; types/audition.ts: AuditionSignup.phone: string. calendar-sync.ts: R32 violation corrected (inline app_settings → getFeatureFlags). 7 files + 2 inline DB fixes.

**30BN-AUDITIONS.2b ✓** Sidebar.tsx: 4-part atomic edit (Mic2 icon import, NAV_ITEMS Auditions entry, FLAG_GATED_HREFS, Production allowlist, HelpTooltip generalized to dynamic anchor for both rehearsals and auditions). lib/actions/setup.ts: saveFeatureFlags() revalidatePath adds /crew/auditions. lib/actions/auditions-admin.ts: getAuditionMaterialSignedUrl() added; updateAuditionSignupStatus() extended with castRole parameter. app/crew/(app)/auditions/page.tsx (new — list, auth/flag guards, HelpTooltip). app/crew/(app)/auditions/[id]/page.tsx (new — detail shell, Production guard via assertAuditionAccess, QR pre-generated). components/crew/auditions/AuditionsListClient.tsx (new — Active/All filter, creation modal). components/crew/auditions/AuditionDetailTabs.tsx (new — 6 tabs: Overview, Signups, Materials, Communication implemented; Email Templates and Settings stubbed). 7 files.

**30BN-AUDITIONS.2c ✓** Settings tab full implementation (audition config, role management, Production assignment roster, danger zone). Email Templates tab full implementation (3 useEditor instances with immediatelyRender: false, MergeTagExtension, merge tag toolbar, save/preview per status). QR display corrected (SVG inline + PNG/SVG download links). getAuditionMaterialSignedUrl() access guard added (assertAuditionAccess). description field added to public signup page. New server actions in auditions-admin.ts: createAuditionRole(), deleteAuditionRole(), reorderAuditionRoles(), getAuditionsSelectData(). 4 files.

**30BN-AUDITIONS.3a ✓** app/auditions/[id]/page.tsx (new — public Server Component, white header pattern, generateMetadata noindex, notFound() on null). components/audition/AuditionSignupClient.tsx (new — full state machine: form/submitting/uploading/success/duplicate/slot-full; slot picker for timed_slots; role selection; guardian fields; per-type P-DC material uploads with XHR progress; description field). lib/actions/auditions.ts: getAuditionMaterialUploadUrl() added; submitAuditionSignup() return value extended to include uploadToken. Confirmed: params as Promise<{ id: string }> (Next.js 15 pattern); white header pattern (not navy); formatWallClockCT() takes 3 args (dateStr, timeStr, fmt). 3 files.

**30BN-AUDITIONS.3b ✓** app/auditions/upload/[token]/page.tsx (new). components/audition/AuditionUploadClient.tsx (new). app/audition-checkin/[token]/page.tsx (new — null data renders invalid-token state server-side). components/audition-checkin/AuditionCheckInClient.tsx (new — formatWallClockCT 3-arg, formatTime() local helper for time columns, day-of-week date format 'EEEE, MMMM d, yyyy' on check-in page). lib/actions/auditions.ts: getUpcomingAuditions() added (CT-aware date, inline flag check, show join). lib/actions/auditions-admin.ts: syncAuditionToCalendar() wired non-blocking in updateAudition(); delete + sync in updateAuditionStatus(). app/page.tsx + app/shows/page.tsx: auditions card added (hidden when empty, flags already fetched on both pages). 8 files.

**30BN-AUDITIONS.4a ✓** lib/utils/merge-tags.ts (new — pure utility: MergeTagValues, MERGE_TAGS const array, MergeTag type, substituteMergeTags() with local escapeHtml). components/crew/auditions/MergeTagExtension.ts (new — TipTap Node extension: inline/atom, data-merge-tag round-trip, insertMergeTag command, module augmentation for Commands<ReturnType>). app/globals.css: .merge-tag-pill rule added (CSS custom properties for brand colors per R33). lib/actions/auditions-admin.ts: previewAuditionEmailTemplate() appended. Key findings: formatWallClockCT() takes 3 args (not 2 — confirmed F1); FK join array-normalization pattern (Array.isArray(x) ? x[0] : x) used instead of 'as any' cast. 4 files.

**30BN-AUDITIONS.4b ✓** lib/email.ts: 4 new email functions added (sendAuditionSignupConfirmation, sendAuditionConsentFormRequestEmail, sendAuditionStatusEmail, sendAuditionCancellationEmail — all exported, confirmed F1). lib/actions/auditions.ts: 3 TODO stubs replaced (consent email, confirmation email, cancellation email); formatAuditionTime() local helper added. lib/actions/auditions-admin.ts: status notification stub replaced. app/auditions/cancel/[token]/page.tsx (new — cancel page). components/crew/help/HelpContent.tsx: Auditions section added (15th ALL_SECTIONS entry, 4 subsections: auditions-overview, auditions-signups, auditions-materials, auditions-checkin, all roles including Production). HelpTooltip: 3 new placements (auditions list page header in Server Component, Signups tab, Materials tab). components/crew/settings/AboutSystemEmails.tsx: 4 new audition trigger entries (trigger count 11 → 15). 30BN_DEFERRED_VERIFICATIONS_v2.md: v19 (65 Phase AUDITIONS items added). Key findings: all lib/email.ts send functions are exported (F1); CORRECTION (DOC.59): Auditions is the actual last ALL_SECTIONS entry in the live HelpContent.tsx file — Getting Help precedes Rehearsals and Auditions in array order (not the reverse, as an earlier build log entry claimed). 9 files modified + 1 new.


### Phase 17 — Launch

**17.1 — Production Environment Audit + Setup Panel Configuration**
- Confirm all 6 environment variables set in Vercel production
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`,
  `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`)
- Confirm `NEXT_PUBLIC_SITE_URL` = `https://30byninetyvolunteers.com`
- Run through all 8 Setup Panel sections and populate with
  production 30BN values (org identity, brand colors, logo,
  favicon, email config, feature flags, instance label, 404 page)
- Confirm all five feature flags enabled for launch (`feature_calendar`, `feature_checkin`, `feature_blast`, `feature_rehearsals`, `feature_auditions`)
- Work through Deferred Verifications document (v15, 774 items)

**17.2 — Domain & DNS**
- Confirm `30byninetyvolunteers.com` CNAME/A record points to Vercel
- Confirm domain is not expiring imminently
- Confirm Vercel custom domain is active and SSL certificate valid

**17.3 — Resend Production Configuration**
- Switch from sandbox to production Resend API key in Vercel env
- Confirm domain `30byninetyvolunteers.com` verified in Resend
  (SPF, DKIM, DMARC DNS records — done during Alpha, re-confirm)
- Send test email from live system; confirm delivery, formatting,
  brand colors render correctly

**17.4 — Seed Data Cleanup**
- Run seed data cleanup SQL from Deferred Verifications document
- Delete test volunteer signups, show/slot test data, test QR codes
- Delete test email logs, test audit log entries
- Review and clean `recurrence_groups` table
- Delete test uploads from `brand/logo/` and `brand/favicon/`

**17.5 — End-to-End Flow Testing**
- Public volunteer signup → confirmation email received
- Slot claiming → email received
- Call Board access → volunteer card, hours, history
- Admin login (email/password + Google SSO)
- Show management (create, publish, volunteer visibility)
- Email blast (compose → preview → send to test address)
- Calendar (create event, public calendar visible)
- Check-in (token generation, check-in flow)
- Brand color propagation verification

**17.6 — Google OAuth Production Redirect URIs**
- Update Google Cloud Console OAuth redirect URIs to include
  `https://30byninetyvolunteers.com/auth/callback`
- Confirm in Supabase Auth settings (production URL in allowed
  redirect URLs)

**17.7 — Cron Job Verification**
- Confirm both Vercel Cron jobs active in dashboard
  (`/api/cron/reminders` + `/api/cron/thankyou`)
- Confirm `CRON_SECRET` matches `vercel.json` config
- Confirm cron schedules are correct

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

### Phase 19 — Volunteer Communication Preferences ✓ Complete

Prompt structure: 19.1 (Migration 030 + all server
actions) → 19.2 (public signup form + `/update` flow) →
19.3 (Call Board + admin profile + volunteer list).

Migration 030 status: Applied. New nullable `communication_preference` text CHECK ('email'|'phone'|'either') column on `volunteers`.
No FK, no index (advisory only — never filtered).

**19.1 ✓ — Schema + Server Actions:**
- Migration 030 applied
- `submitVolunteerForm()` (`app/actions/volunteer.ts`, public) — field added to insert
- `updateVolunteer()` (`lib/actions/volunteers.ts`, admin) — field added to update
- Key finding: `lib/actions/volunteer.ts` (singular) does not exist — the original spec had the wrong path. Actual: `app/actions/volunteer.ts` (public) + `lib/actions/volunteers.ts` (admin)
- New `updateCallboardPreference()` in `lib/actions/callboard.ts`
  (volunteer-session-authenticated, updates own preference via cookie)
- `updateVolunteerPreference()` in `lib/actions/volunteers.ts`
  (admin-authenticated, `getServerClient()`, allowedRoles guard)
- Volunteer CSV export headers updated to include preference

**19.2 ✓ — Public Forms:**
- `VolunteerForm.tsx` — "Preferred contact method"
  dropdown (Email / Phone / No preference). Appears after Phone.
- `VolunteerUpdateForm.tsx` — same field, pre-filled from DB
- `app/update/actions.ts` (`updateVolunteerInfo()`) — field added. This is the public-route submit action for `/update`, distinct from `updateVolunteer()` in `lib/actions/volunteers.ts` (admin session). Any field added to the volunteer profile that must also be editable via `/update` needs both files updated — missing one silently drops the field on the skipped path
- `mergeVolunteer()` — field added to the duplicate-merge path
- Zod: `z.string().optional()`, not `z.enum([...]).nullable().optional()` — an unselected `<select>` submits an empty string, which fails `z.enum()` validation silently

**19.3 ✓ — Admin + Call Board:**
- `session.ts` — `VOLUNTEER_COLUMNS` extended; `types/callboard.ts` — `CallboardVolunteer` extended
- `VolunteerCard.tsx` — preference badge + inline update select
  calling `updateCallboardPreference()`, optimistic state, `router.refresh()`
- `VolunteerProfileForm.tsx` — preference field editable in the
  personal info section (Editors, SA, OA); zod schema bug fixed (`z.enum` → `z.string`)
- `VolunteersTable.tsx` — preference display-only badge
- `url.ts` / `list.ts` / `FilterPanel.tsx` — preference filter state, query filter, and filter control
- PDF export — omitted (10-column A4 too tight)

No system enforcement — advisory only. SMS/automated phone delivery
is future infrastructure. Original "waitlist notification only" scope
subsumed — this general preference field serves that purpose.

~~**Automated thank-you email after a show**~~ —
✓ Built in Alpha (30BN-12.4). See §8 Show Management.

### Phase 21 — Rehearsal Management System ✓ Complete

**Architecture (confirmed via 21.A audit + build):**
- Production admin users only (directors, stage managers).
  Cast members are Phase CAST scope.
- Two-tier assignment model: schedule-level default + per-date
  overrides (include/exclude). Effective roster =
  schedule assignees MINUS excludes PLUS includes.
- `createRehearsalBatch()` confirmed already allows Production
  (no guard change needed — 21.A finding).
- `feature_rehearsals` flag confirmed absent from codebase
  and DB before 21.1 (all three locations required addition).
- Sidebar is data-driven (NAV_ITEMS + FLAG_GATED_HREFS +
  Production allowlist) — three-part atomic edit required.
  Missing the Production allowlist addition silently hides
  the link from Production even with the other two correct
  (same failure shape as SETUP.1 F1 — confirmed 21.A Audit E).

**30BN-21.A ✓** Read-only audit. Seven read targets confirmed.
Key findings: `createRehearsalBatch()` has no role guard
(Production already allowed); `calendar_events.check_in_token`
absent (Migration 031 must add it); Sidebar is data-driven
with three-part atomic edit requirement; `feature_rehearsals`
absent from FeatureFlags type, getFeatureFlags(), and
app_settings; proxy.ts matcher/Production/flag blocks all
identified with exact insertion points. No code.

**30BN-21.1 ✓** Migration 031 applied (calendar_events
.check_in_token, rehearsal_schedule_assignments,
rehearsal_date_assignments, rehearsal_attendance, feature_
rehearsals seed). `lib/feature-flags.ts` updated (rehearsals:
boolean added). `lib/actions/rehearsals.ts` (new — PUBLIC
ROUTE: getRehearsalCheckInData, checkInToRehearsal) +
`lib/actions/rehearsals-admin.ts` (new — 8 authenticated
actions). `lib/utils/rehearsal-roster.ts` (new — shared
effective-roster set-math, client-parameterized). `types/
rehearsal.ts` (new). `lib/actions/calendar.ts`:
createRehearsalBatch() flag guard changed from flags.calendar
→ flags.rehearsals. Setup Panel Section 6: 4th toggle for
feature_rehearsals. Note: Brief's original single-file spec
for rehearsals.ts was corrected — Process §7 public-route
invariant requires two files. Key finding: admin_users.id IS
the Supabase Auth UUID (no auth_user_id column) — RLS
Production self-scoping policies use `admin_user_id =
auth.uid()` directly (corrected from erroneous join before
migration was applied). 10 files.

**30BN-21.2 ✓** proxy.ts: needsFlagCheck extended for
/crew/rehearsals, Production exception added, crew-route
flag block added. Sidebar.tsx: 4-part edit (NAV_ITEMS
ClipboardList entry, FLAG_GATED_HREFS entry, Production
allowlist entry, HelpTooltip → #rehearsals). layout.tsx:
confirmed unchanged (full flags object already flows to
Sidebar). `app/crew/(app)/rehearsals/page.tsx` (new —
schedule list, Active/All filter, New Schedule via
CalendarBulkRehearsalForm — confirmed self-contained).
`app/crew/(app)/rehearsals/[id]/page.tsx` (new — detail
shell, Production guard). `components/crew/rehearsals/
RehearsalsListClient.tsx` (new). `components/crew/rehearsals/
RehearsalDetailTabs.tsx` (new — Roster + Dates + Attendance
stub). lib/actions/rehearsals-admin.ts extended: rosterCount,
location_name join, per-assignee overrideCount, check_in_token,
4-state status derivation (needed once UI requirements surfaced
— Q3 21.2). 9 files.

**30BN-21.3 ✓** proxy.ts: /rehearsal-checkin/:path* added to
matcher (before public flag block was written — SETUP.1 F1
discipline); needsFlagCheck extended for /rehearsal-checkin/
(separate condition required — not covered by 21.2 addition);
public flag block added. lib/actions/rehearsals-admin.ts:
`getRehearsalAttendanceForEvent()` (returns ALL effective
roster members, not just those with attendance records —
status: null for unmarked) + `markAllRehearsalAttended()`
(single batch upsert, SA/OA/Editor only). Attendance tab
stub fully replaced in RehearsalDetailTabs.tsx (lazy-load
via useTransition + Map cache, role-gated marking, two-step
inline "Mark All Present" confirm, Self Check-In badge).
`app/rehearsal-checkin/[token]/page.tsx` (new — public,
getAdminClient() only, five UI states, noindex, branded
header) + `components/rehearsal-checkin/RehearsalCheckInClient
.tsx` (new — roster dropdown identity, not email/phone).
`components/crew/help/HelpContent.tsx`: Rehearsals section
added (14th ALL_SECTIONS entry, 4 subsections, all roles).
`app/crew/(app)/rehearsals/page.tsx`: HelpTooltip on page
header added (missed in 21.2). 30BN_DEFERRED_VERIFICATIONS_v2
.md: v18, 55 Phase 21 items added. Note: location_name join
added to getRehearsalCheckInData() (Q1 — public page needed
it; moved to shared RehearsalEventSummary base type).
10 files modified + 2 created.

### Phase CAST — Cast Member Portal (named future phase, post-Phase 21)

Grows from Phase 21 infrastructure. Not yet fully specced. Key planned features:
- Cast member entity (separate from admin_users, own Supabase Auth accounts, own frontend login)
- Cast-facing rehearsal schedule view — which dates they are called for
- Materials distribution to cast via media library
- Cast check-in system (QR-based, parallel to Phase 14 volunteer check-in)
- Production information hub for cast members

---

## 12. Open Decisions Log

| # | Decision | Status | Notes |
|---|---|---|---|
| 1 | Production domain | ✅ Resolved | `30byninetyvolunteers.com` — purchased and live |
| 2 | Sending email address | ✅ Resolved | `volunteers@30byninetyvolunteers.com` — domain verified in Resend during Phase 2 Alpha build |
| 3 | Google OAuth credentials | ✅ Resolved | Implemented in Alpha (30BN-1.3). Google Cloud OAuth client "Volunteers Final" configured and live. |
| 4 | Jonathan's surname | ✅ Resolved | Sturcken — Jonathan Sturcken |
| 5 | Under-18 consent form PDF | 🔄 Partially resolved | Consent form infrastructure fully built (Phase 15.2): upload trigger on signup, submission storage, admin review queue, `/consent/[token]` upload page. The actual PDF document content has not yet been created or uploaded. When a PDF is uploaded and set as the active `volunteer_consent_form` document, it will appear as a download link in the consent request email automatically. |
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
`formatCT()` parses bare `date` column values (`'YYYY-MM-DD'`) as UTC on Vercel (UTC runtime), shifting displayed dates by hours for Central Time users. Use `formatWallClockCT()` from `lib/utils/date.ts` for any value sourced from a `date` column or manually constructed date+time string. Use `formatCT()` only for full `timestamptz` values (created_at, updated_at, claimed_at, etc.) which include timezone info and parse correctly.

**Confirmed function signature (AUDITIONS.3a F1, AUDITIONS.3b F2, AUDITIONS.4a F1 — recurring failure mode):**
`formatWallClockCT(dateStr: string, timeStr: string | null, fmt: string): string`
Three arguments: the date string, an optional time string (null if no time), and the format string. Wrong: `formatWallClockCT(date_start, 'MMMM d, yyyy')` (2 args — silently passes format as timeStr). Correct: `formatWallClockCT(date_start, null, 'MMMM d, yyyy')`.

`time without time zone` columns (e.g. `auditions.time_start`) are raw strings like `'19:00:00'`. Do NOT use `formatCT()` or `formatWallClockCT()` on these — they are not ISO date strings. Use a local `formatTime()` helper:
```typescript
function formatTime(t: string | null): string | null {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}
```
Established ADMIN.9. Signature correction confirmed AUDITIONS.3a/3b/4a. See also the grep check in Process §10.

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

### R32 — Feature Flags Always Via getFeatureFlags()
All feature flag reads in the codebase must go through `getFeatureFlags()` in `lib/feature-flags.ts`. This helper fetches all `feature_*` keys from `app_settings` in a single query and returns a typed object. Never fetch individual feature flag keys inline with separate `app_settings` queries. This ensures: (1) all flags are fetched in one round trip, (2) the typed return object prevents typos in key names, (3) missing keys are handled consistently. Middleware checks flags for route-level blocking; sidebar conditionally renders links based on flags passed as props from layout; individual pages receive flags as props or re-fetch via the helper. Established Phase SETUP design; built SETUP.1. grep exclusion: The inline flag-key-name grep check in Process §10 must exclude `components/crew/settings/SetupPanel.tsx` (in addition to `lib/feature-flags.ts` and `lib/actions/setup.ts`) — the Setup Panel UI uses flag key name strings as FormData keys to build the toggle controls, which is the sanctioned use of those strings in that file and does not constitute an inline flag read.

### R33 — After Phase THEME: CSS Custom Properties for Brand Colors, Not Tailwind Utility Classes
After Phase THEME ships, all components that reference brand-driven colors (`bg-navy`, `text-orange`, `border-navy`, `hover:bg-navy`, etc.) must use CSS custom properties (`var(--brand-primary)`, `var(--brand-accent)`) via inline styles or a small set of CSS utility classes in `globals.css` that reference these variables. Static Tailwind brand color utility classes are no longer permitted in new code after THEME ships — they reference static hex values and cannot respond to `app_settings` color changes. The `@theme` block in `globals.css` is NOT modified (R7 still applies — structural and non-brand colors stay as static hex in `@theme`). Phase THEME.A audits all current usages before any replacements are made. Established Phase THEME design (not yet built — enforced from THEME.1 onward).

### R34 — All Non-Core Features Must Be Built Flag-Ready

Any feature added after Phase SETUP ships that a client might reasonably not want or pay for separately must be built flag-ready at the time of initial build — not retrofitted later. Flag-ready means: (1) a feature_X key exists in app_settings with a default value seeded in the migration; (2) getFeatureFlags() in lib/feature-flags.ts returns the flag in its typed object; (3) proxy.ts blocks the route when the flag is 'false'; (4) the sidebar link renders conditionally based on the flag; (5) any public routes associated with the feature return 404 when the flag is off; (6) any server action that is the exclusive entry point for the feature returns early with an error when the flag is off (defense in depth). Definition of "non-core": features beyond volunteer management, show/slot management, user management, forms, media library, hours & milestones, standing opportunities, and the Call Board. Current flagged features: Calendar (`feature_calendar`), Check-In (`feature_checkin`), Email Blast (`feature_blast`), Rehearsal Management (`feature_rehearsals` — Phase 21), Audition Management (`feature_auditions` — Phase AUDITIONS). When in doubt, build flag-ready — adding a flag is cheap, retrofitting guards is expensive. Established this session; enforced from SETUP.4 onward.

### R35 — Never Pair Hand-Authored @layer utilities Classes With Native Tailwind dark: Utilities on the Same Property

Hand-authored classes in the `@layer utilities` block in `app/globals.css` compile AFTER Tailwind's auto-generated utilities in the PostCSS output (~line 2880 vs ~2362). Equal specificity — last-in-cascade wins. This means any hand-authored class (e.g. `bg-brand-primary-light`) on an element will override a native dark: class (e.g. `dark:bg-dark-bg`) on the same element in dark mode, because the hand-authored class compiles later.

Correct approaches:
(a) Use native Tailwind pairs on both sides:
    `bg-gray-50 dark:bg-dark-bg` — both auto-generated,
    Tailwind handles ordering correctly. (Preferred for
    layout wrappers and structural backgrounds.)
(b) Use hand-authored pairs on both sides in the correct
    order within the `@layer utilities` block:
    Define the base class first, then define a
    `.dark\:...-variant { }` override after it in the
    same block. (Preferred for brand-colored interactive
    elements where the brand tint must appear in both
    modes with a different shade in dark.)

Never use: `bg-brand-primary-light dark:bg-dark-bg`
(mixed: hand-authored base + native dark: class —
the base always wins in dark mode regardless of which
dark: class is specified.)

This defect was confirmed empirically via live PostCSS compilation in ADMIN.35-AUDIT and fully resolved across 54 files in ADMIN.39a–c.

### R36 — Hand-Authored @layer utilities Classes Do NOT Auto-Generate Opacity-Suffix or Pseudo-Class-Stacked Variant Rules

In Tailwind v4 with hand-authored `@layer utilities` classes, each specific combination must be explicitly authored as its own rule. This is distinct from R35 (which is about cascade ordering between hand-authored and native classes) — R36 is about missing rules that produce silent CSS failures.

Examples of combinations that require explicit rules:
```
bg-brand-primary/80          → needs: .bg-brand-primary\/80
hover:bg-brand-primary/80    → needs: .hover\:bg-brand-primary\/80:hover
dark:bg-brand-accent/20      → needs: .dark\:bg-brand-accent\/20:where(...)
focus-visible:ring-brand-primary/50 → needs explicit :focus-visible rule
dark:hover:bg-brand-accent/30 → needs both :where() and :hover chained
```

Native Tailwind utility classes (bg-gray-50, etc.) DO auto-generate these combinations via the JIT engine. Only hand-authored `@layer utilities` brand classes are affected.

Failure mode: a class with no matching rule produces zero CSS output — the element renders as if the class is not present, or silently falls back to a sibling class that produces the wrong color or opacity. No build error, no lint error. Confirmed failure in button.tsx: `focus-visible:ring-brand-primary/50` was present in every button variant but produced no focus ring color (ACCESSIBILITY impact) until ADMIN.42 added the explicit rule.

Correct approach: whenever adding a brand utility class to a component with an opacity suffix or stacked pseudo-class/variant prefix, check globals.css immediately and author the missing rule if it does not exist. See §10 grep check and §11 checklist item in Process for enforcement.

### R37 — admin_users.id Is the Supabase Auth UUID — No auth_user_id Column

`admin_users.id` is the Supabase Auth UUID directly. There is no separate `auth_user_id` column on `admin_users`. When writing RLS policies that need to self-scope to the calling authenticated admin:

- For FK columns referencing `admin_users.id` (e.g. `rehearsal_schedule_assignments.admin_user_id`): use `admin_user_id = auth.uid()` directly.
- For the `admin_users` table itself: use `id = auth.uid()`.

Never construct a subquery joining through a non-existent `auth_user_id` column — it will cause a migration error (`column "auth_user_id" does not exist`).

The existing RLS helper functions (`is_editor()`, `is_super_admin()`, `is_super_admin_or_owner_admin()`, `is_admin()`) all verify role via `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN (...))` — this pattern is correct and consistent with R37.

Confirmed failure mode: the 21.1 prompt draft used `auth_user_id = auth.uid()` in Migration 031 RLS policies for Production self-scoping. Task A schema verification confirmed the column does not exist. Corrected to `admin_user_id = auth.uid()` before applying. Migration applied successfully with the correction.

### R38 — TipTap Merge Tag Extension Pattern

The audition email template system uses a custom TipTap extension to render merge tags (e.g. `{{auditioner_name}}`) as non-editable inline pill nodes in the editor. Key constraints:

- **Custom node type:** A TipTap `Node` extension defines `mergeTag` as an inline, atom, non-editable node. The node stores the tag name as an attribute. Renders as a styled `<span>` pill in the editor DOM.
- **Toolbar inserter:** A custom toolbar button opens a dropdown of available merge tags. On selection, `editor.commands.insertContent({ type: 'mergeTag', attrs: { tag: '{{tag_name}}' } })` inserts the node at the current cursor position.
- **HTML serialization:** The extension's `renderHTML()` method outputs `<span data-merge-tag="{{tag_name}}">{{tag_name}}</span>`. This is what `editor.getHTML()` returns and what gets stored in `audition_email_templates.body_html`.
- **Substitution at send time:** A `substituteMergeTags(html, values)` utility in `lib/utils/merge-tags.ts` performs string replacement of `{{tag_name}}` patterns before the HTML reaches `buildEmailHtml()`. Applied in both `sendAuditionStatusEmail()` and the live preview server action.
- **Live preview:** A server action `previewAuditionEmailTemplate(body_html, subject, auditionId)` substitutes sample values (auditioner name "Alex Sample", show title from DB, etc.) and returns rendered HTML via `buildEmailHtml()` with real brand colors. Preview panel in the Email Templates tab renders this HTML in an iframe-safe container.
- **Never use regex in email HTML:** The substitution utility uses `String.prototype.replaceAll()` on known merge tag strings — not a general regex against the full HTML string. Escaping is applied to substituted values via `escapeHtml()` per the existing email escaping rule. Merge tag names themselves are system-controlled (not user-supplied) and do not need escaping.
- **Established AUDITIONS.4a.** Apply this pattern to any future template system that needs inline merge tags in a TipTap editor context.

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
*v3.3 (July 2026 — HELP phase + OpenCall OS additions: §1 current phase updated (13.4c complete, HELP complete, Phase 14 next); §1 OpenCall OS context paragraph added; §2 Owner Admin, OpenCall OS, Setup Panel terminology rows added; §3 TipTap row updated (extension-link + extension-underline + full toolbar list); §6 email design forward reference notes for dynamic from address and logo URL (Phase SETUP); §7 roles table updated (Owner Admin row added, Editor row corrected — Settings access removed, Production row updated with /crew/help); §7 calendar_editor flag note updated (owner_admin allowed); §7 middleware/proxy note updated (proxy.ts rename, Owner Admin access, Production /crew/help exception); §8 Settings hub card table corrected (all cards = SA + Owner Admin; Platform Setup card added); §8 Communication page Owner Admin access note added; §8 Help System section added (full HELP phase spec, role visibility, anchor inventory, HelpTooltip count 26, Production sidebar, Settings = SA + Owner Admin); §8 Platform Setup section added (full SETUP spec: 6 sections, all app_settings keys, feature flags, implementation notes); §9 is_editor() function update note added; §9 new SETUP app_settings keys added (17 keys); §9 Migration 023 scope added; §9 admin_users.role CHECK updated (owner_admin added); §9 calendar_editor CHECK note updated (owner_admin allowed); §10 prompt log updated (DOC.31–33, ADMIN.27–29, HELP.1–HELP.2d, ADMIN.29 added); §11 header updated (13.4c + HELP complete); §11 Phase 13 13.4c marked complete; §11 Phase HELP section added (HELP.1–HELP.2d + ADMIN.27–29); §11 Phase SETUP section added (SETUP.0–4 forward spec); §11 Phase THEME section added (THEME.A/1–3 forward spec); §13 R32 added (feature flags via getFeatureFlags()); §13 R33 added (CSS custom properties post-THEME); DOC.34 logged)*
*v3.4 (July 2026 — SETUP.0 complete: §1 current phase updated (SETUP.0 complete, Phase 14 next); §2 Calendar Editor terminology updated (Owner Admin added); §7 Owner Admin row updated (built SETUP.0); §8 User Management updated (calendar_editor toggle on OA rows, deactivate guard, role selector restriction, badge — SETUP.0); §9 Migration 023 marked applied (role CHECK, calendar_editor CHECK, is_editor() update, is_super_admin_or_owner_admin() added, 17 app_settings keys, locations RLS repointed); §9 locations table RLS note updated; §9 next migration updated to 024; §11 SETUP.0 marked complete with summary; §11 Phase SETUP header "(pending)" removed; §10/§11 prompt log updated (SETUP.0 ✓, DOC.36 ✓); §13 R32 note updated (not-yet-built language removed, SETUP.1 forward reference added); DOC.36 logged)*
*v3.5 (July 2026 — Phase 14 complete + Phase 15.1–15.2 complete: §1 current phase updated (Phase 14 complete, Phase 15.3 next); §3 File Storage updated (media bucket, P-DC, all file types); §5 Storage Buckets updated (media private bucket replaces documents spec); §7 Public routes updated (/consent/*, /documents/*); §8 landing page consent form bullet replaced (auto-trigger on is_minor); §8 Public Check-In Page replaced (full 14.1–14.3 spec: per-date + whole-show tokens, walk-in signup, all result states, /consent/[token] doc); §8 Check-In Admin section replaced (live dashboard spec: 10s refresh, roster, walk-ins, accordion); §8 Show Management Dates tab updated (check-in QRs); §8 Volunteers tab updated (Self Check-In badge); §8 Document Management replaced (15.1–15.2 spec: document types manager, consent submissions queue, /documents/[token] redirect route, consent trigger, sendConsentFormRequestEmail, 15.3–15.4 pending); §8 Settings hub card Document Management updated (Beta badge removed); §9 show_dates check_in_token column added (Migration 024); §9 attendance slot_claim_id made nullable (Migration 024); §9 old documents table schema replaced with new 6-table schema (Migration 025): documents, document_types, consent_form_submissions (with full schema blocks) + media_folders, media_folder_access, document_access (deferred to DOC.37c); §9 Migration 024–025 status blocks added; §9 next migration updated to 026; §9 AuditAction types note added (14.1 + 15.1 + 15.2 additions); §11 header updated (Phase 15.3 next); §11 Phase 14 marked complete (14.1–14.3 + 14.1-FIX summaries); §11 Phase 15 section replaced (15.1–15.2 ✓ + 15.3–15.4 pending); §11 prompt log updated (14.1–14.3, 14.1-FIX, 15.1, 15.2, 15.2-AUDIT, 15.2-FIX, DOC.37a, DOC.37b added); §12 Open Decision #5 updated (infrastructure built, PDF content pending); DOC.37b logged)*
*v3.6 (July 2026 — Phase 15 complete + ADMIN.30: §1 current phase updated (Phase 15 complete); §3 File Storage updated (media library built + player page noted); §7 Production role updated (/crew/media + /crew/help access confirmed); §8 Light/Dark Mode corrected (prefers-color-scheme note removed — ADMIN.27 removed this branch); §8 Help System section replaced (13 sections, ~46 subsections, full anchor inventory, 32 HelpTooltip placements, Production visibility updated, ADMIN.30 Q1 gap noted); §8 Tooltip system description updated (count 16→32, Client Component note added); §8 /documents/[token] route stale "Phase 15.4 will add" line replaced with built description; §8 Document Management "Planned" block replaced with built Media Library + Player Page specs; §8 Key Files updated (view/[token]/page.tsx, MediaLibrary.tsx, checkin/page.tsx added, route.ts updated); §9 media_folders + media_folder_access + document_access schema blocks added (deferred from DOC.37b); §11 header updated (Phase 15 complete); §11 Phase 15 15.3 and 15.4 entries marked complete with build summaries; §11 prompt log updated (15.3 ✓, 15.4 ✓, DOC.38 ✓, ADMIN.30 ✓, DOC.37c ✓); document header v3.6; DOC.37c logged)*
*v3.7 (July 2026 — Targeted fixes: §7 Production row
updated (Media Library access confirmed ADMIN.30 — added
/crew/media to Production sidebar note); §9 two stale
"planned CAL.8" notes corrected to "built in CAL.8" in
locations table schema block and Migration 020 status
paragraph (DOC.28b F3 carry-forward); §11 prompt log
updated (HELP.2e + DOC.41); HELP.2e: HelpContent.tsx
ALL_SECTIONS sweep — owner_admin added to all non-Settings
section and subsection role arrays (47 entries); DOC.41
logged)*
*v3.8 (July 2026 — HELP.2e completion: §8 Help System Owner Admin bullet updated (removed "known gap (ADMIN.30 Q1)" forward-reference note — HELP.2e fixed all 47 non-Settings ALL_SECTIONS entries; replaced with confirmation that the gap is closed); document header + §1 header bumped to v3.8; §11 prompt log unchanged (HELP.2e + DOC.41 already logged in v3.7); DOC.42 logged)*
*v3.9 (July 2026 — Phase SETUP complete + ADMIN.31/31b: §1 current phase updated (SETUP complete, THEME next); §3 react-easy-crop added; §5 brand public bucket added; §6 email design forward references replaced with implementation facts (resolveEmailSettings, buildEmailHtml logoUrl param, resolveOrgIdentity); §7 proxy feature flag guards documented; §8 Platform Setup section fully replaced (pending spec → built spec: 7 sections, BrandImageUploader, 3-flag set, correct action list, key files); §8 landing page heading/footer dynamic org identity noted; §8 Phase 12 deferred list: 3 items closed (waitlist RPC, phone search, reminder cron DST), 1 remaining; §8 Audit Log known gap closed (volunteer.signup); §9 Migrations 026–027 status blocks added, next migration 028; §9 app_settings seed list corrected (3 flag keys removed, favicon_url added, total 15); §9 AuditAction types: volunteer.signup added; §11 header status updated; §11 Phase SETUP entries SETUP.1–4 all marked complete with summaries; §11 prompt log updated (DOC.42, SETUP.1–4, ADMIN.31, ADMIN.31b, DOC.43a); §11 Phase 15 marked complete; §11 Phase 19 expanded to full communication preference spec; §11 Phase 21 Rehearsal Management System forward spec added; §11 Phase CAST named future phase added; §13 R32 SetupPanel.tsx grep exclusion noted; §13 R34 added (non-core features flag-ready); DOC.43a logged)*
*v4.0 (July 2026 — ADMIN.32–34 complete: §1 current phase updated (ADMIN.32–34 complete, THEME next); §2 Owner Admin terminology updated (can now create/manage/deactivate OA accounts; cannot create SA); §3 next.config.ts images.remotePatterns entry added (.supabase.co — required for uploaded logo rendering); §6 resolveEmailSettings() return type updated (orgName + orgContactEmail added); resolveOrgIdentity() return type updated (org_logo_url added; layout prop pattern documented); generateMetadata() org_tagline documented (|| fallback); FROM_ADDRESS/REPLY_TO constants deleted, payload builders use explicit from/replyTo params; §7 Owner Admin roles table row updated (OA can create/deactivate OA; can edit/delete volunteer notes; permissions expanded ADMIN.33); Auth model updated (Production direct-create added; OA approval paths documented); §8 User Management SETUP.0 block replaced with accurate ADMIN.33 state; create account role description updated; Platform Setup Section 8 added (not_found_heading/body) + key count 18 + 9 server actions; not-found.tsx description updated (async, dynamic, resolveOrgIdentity); error.tsx Client Component constraint noted; Phase 7 QR Generator updated (QR history panel, lib/data/qr.ts, QRGeneratorForm/QRHistoryPanel components, generateQRCode extended); BulkEmailSection defaultSubject prop noted; HelpContent generic language note; public page org identity sweep documented (13 pages + Sidebar); iCal PRODID/UID domains updated to OpenCall OS; §9 Migration 004 OA volunteer_notes note added; Migrations 028–029 status blocks added; next migration 030; qr_codes table schema block added; admin_users owner_admin NOTE updated; app_settings not_found keys + count 17 + page fetch count 18; §11 header updated; prompt log ADMIN.32–34 + DOC.44 added; DOC.44 logged)*
*v4.1 (July 2026 — Phase THEME complete: §1 header + current phase updated (THEME complete, Phase 19 + 21 pre-launch); §3 color.ts utility added to tech stack; PDF export brand color architecture noted (@react-pdf/renderer createStyles factory — THEME.4); §6 resolveEmailSettings() return type updated (brandPrimary + brandAccent + brandPrimaryLight via lightenHex); buildEmailHtml() brand color params documented; email client brand color approach note (string interpolation, not var()); buildCtaButton() dynamic color call sites noted; §8 signup form Phase 19 preference field noted; /update Phase 19 field noted; Call Board volunteer card Phase 19 preference badge + inline update noted; Volunteer Profile Phase 19 editable preference noted (confirmed editable in admin); Volunteer List Phase 19 display-only noted; PDF export createStyles factory architecture documented; Platform Setup Section 2 "Phase THEME must ship" language replaced with completed status; §9 volunteers table communication_preference column Phase 19 note added; Migration 030 context note added; §11 Beta Build header updated; Phase THEME section replaced (all 4 "pending" entries → completed summaries: THEME.A/1/2a–2d/3/3b/4); Phase 17 stub replaced with full 7-sub-phase spec (17.1–17.7); Phase 19 spec updated (prompt structure 19.1/19.2/19.3, admin editable confirmed, CSV export noted, PDF decision noted); Phase 21 moved from post-launch to pre-launch; §11 prompt log: DOC.44 note expanded, DOC.44-FIX + DOC.45 + DOC.46 + DOC.46-FIX + THEME.A + THEME.1 + THEME.2a–2d + THEME.3 + THEME.3b-4 + DOC.47 all added; DOC.47 logged)*
*v4.2 (July 2026 — Phase 19 complete + ADMIN.35–38: reconstructed retroactively during the DOC.53 session — this update was logged as shipped in 30BN_PROCESS_v1.md's §13 prompt history but was never actually committed to this file; the live Brief remained at v4.1 until this session closed the gap. §1 header + current phase updated (Phase 19 + ADMIN.35–38 complete); §7 two new patterns added: Google OAuth registration path (ADMIN.36 — routes through the same Request Access approval flow as email/password self-registration, dual-client pattern in auth/callback/route.ts) and is_active gating on the Google OAuth path (ADMIN.38 — sign out before redirect on inactive account, matching the existing email/password pattern); §8 five "Phase 19 — pending" markers updated to built (signup form, /update, Call Board card, volunteer list, volunteer profile); §8 /update field note extended with the updateVolunteerInfo()/updateVolunteer() two-file update pattern (19.2); §8 Volunteer Profile field note extended with the zod <select> pattern (z.string().optional(), not z.enum() — empty string from an unselected <select> fails enum validation silently; corrected 19.1→19.3); §9 Migration 030 marked applied, volunteers.communication_preference column def uncommented, next-migration pointer updated; §11 header updated; §11 prompt log: ADMIN.35-AUDIT + ADMIN.35 + ADMIN.36 + ADMIN.37 + ADMIN.38 + 19.1 + 19.2 + 19.3 added; §11 Phase 19 section rewritten from planned spec to complete build summary; DOC.50 logged)*
*v4.3 (July 2026 — ADMIN.39-AUDIT + ADMIN.39a–c dark mode cascade closure: §1 header + current phase updated (ADMIN.37–38 + ADMIN.39-AUDIT + ADMIN.39a–c complete; dark mode cascade defect closed across 54 files; Phase 21 next); §8 Volunteer Profile notes spec: Editors confirmed append-only for notes (editNote/deleteNote guards stay SA+OA only — RLS + design intent re-confirmed ADMIN.39-AUDIT F4, July 2026); stale pre-ADMIN.33 wording also corrected here (Owner Admin included alongside Super Admin for edit/delete); §8 Light/Dark Mode: dark mode cascade defect resolution documented (root cause, fix pattern, 54 files, special cases, light mode visual impact, ADMIN.40 residual); §13 R35 added (never pair hand-authored @layer utilities class with native Tailwind dark: utility on same property — two correct approaches documented); §11 prompt log ADMIN.39-AUDIT + ADMIN.39a–c + DOC.51 + DOC.52 + DOC.53 added; §11 Phase 21 pre-requisite bullets corrected from forward-looking language to ✓ Complete (ADMIN.32/33 — stale since v4.0, whose own history entry had claimed this was already fixed); §11 ADMIN.40 carry-forward noted (OpportunityForm.tsx:99,115 — not in original audit scope, pre-Phase-17); DOC.53 logged)*
*v4.4 (July 2026 — ADMIN.40–42 + Phase 21 architecture: §1 current phase updated (ADMIN.40–42 complete, Phase 21 ready); §8 Light/Dark Mode ADMIN.40 noted (OpportunityForm single-part fix confirmed correct dark target), ADMIN.41/42 globals.css opacity-variant closure documented (12 missing rules across 3 component families, 3 accessibility gaps closed, R36 established); §11 Phase 21 full architecture documented (assignment model, schema, 4-prompt structure 21.A–21.3, Production admin users only, schedule + per-date override, rehearsal_attendance table, QR check-in via calendar_events.check_in_token, feature_rehearsals flag, /rehearsal-checkin/[token] public route, existing infra reused); §11 prompt log ADMIN.40–42 + ADMIN.42-AUDIT + DOC.54 added; §13 R36 added (hand-authored @layer utilities do not auto-generate opacity-suffix or stacked-variant rules — each combination requires explicit authoring; silent failure mode; ACCESSIBILITY impact on focus rings confirmed); DOC.55 logged)*
*v4.5 (August 2026 — Phase 21 complete: §1 header + current phase updated (Phase 21 complete, Phase 17 next); §1 public surfaces: /rehearsal-checkin/[token] added; §2 Production row: /crew/rehearsals added (flag-gated, assigned-only); §7 proxy.ts section: Phase 21 additions documented (needsFlagCheck, Production exception, crew flag block, matcher, public flag block); §7 public routes table: /rehearsal-checkin/[token] added; §8 Help System: 13 → 14 sections, 32 → 37 HelpTooltips, Phase 21 anchors added, Rehearsals visible to Production; §8 Setup Panel Section 6: 4th flag toggle (feature_rehearsals); §8 new Rehearsal Management section (full spec: schedule list, detail, roster/dates/attendance tabs, public check-in, key files, two-file server action split confirmed); §9 calendar_events.check_in_token added; §9 three new table blocks (rehearsal_schedule_assignments, rehearsal_date_assignments, rehearsal_attendance); §9 Migration 031 status block; §9 next migration pointer updated (no pending migrations); §9 feature_rehearsals seed documented + SETUP key count 17 → 18, fetch count 18 → 19; §9 admin_users.id RLS note expanded; §11 header updated (Phase 21 complete, Phase 17 next); §11 Phase 21 section replaced (forward-looking spec → completed 4-prompt build summary with 21.A–21.3 each described, key findings documented); §13 R34 flag list: feature_rehearsals added; §13 R37 added (admin_users.id = auth.uid(), no auth_user_id column — RLS authoring rule); DOC.56 logged)*
*v4.6 (August 2026 — Phase AUDITIONS specced as pre-launch build: §1 header + current phase updated (Phase AUDITIONS next, Phase 17 follows); §1 public surfaces: /auditions/[id] + /audition-checkin/[token] added; §2 Production row expanded (assigned shows + assigned auditions, two independent paths); §2 Auditioner terminology row added; §7 roles table Production row updated (shows + auditions access, assignment model); §7 proxy.ts: Phase AUDITIONS proxy additions block added (needsFlagCheck, Production exception, crew flag block, matcher, public flag block); §7 public routes table: /auditions/[id] + /audition-checkin/[token] added; §8 new Audition Management section (full spec: list, six-tab detail, public signup, check-in, email templates, email functions, key files, calendar integration, Production assignment model); §8 Show Listing + Landing Page: Upcoming Auditions card noted; §8 Setup Panel Section 6: 5th flag toggle (feature_auditions); §9 feature_auditions seed block + SETUP key count 18→19 + fetch count 19→20; §9 Migration 032 pending status block; §9 eight new table schema blocks (auditions, audition_roles, audition_slots, audition_signups, audition_signup_notes, audition_materials, audition_assignments, audition_email_templates); §11 header updated (Phase AUDITIONS next, Phase 17 follows); §11 Phase AUDITIONS forward-spec section added (11-prompt structure, all architectural decisions); §11 Phase 17.1 flag count updated (three → five); §13 R34 flag list: feature_auditions added; §13 R38 added (TipTap merge tag extension pattern — mergeTag node type, toolbar inserter, substitution at send time, live preview server action, escapeHtml on substituted values); DOC.58 logged)*
*v4.7 (August 2026 — Phase AUDITIONS complete: §1 header + current phase updated (Phase AUDITIONS complete, Phase 17 next); §1 public surfaces: /auditions/upload/[token] + /auditions/cancel/[token] added; §3 TipTap custom extension pattern (MergeTagExtension) + immediatelyRender: false noted; §3 feature flag 5-file pattern noted; §6 email send function export status corrected (all exported); §7 Public row: 2 new routes added; §8 Audition Management email functions: all 4 named with triggers; §8 public signup: consent email function corrected (sendAuditionConsentFormRequestEmail not sendConsentFormRequestEmail); §8 self-cancel: cancel page described; §8 key files: complete final list; §8 Overview tab: QR display pattern noted; §8 Email Templates tab: useEditor details (immediatelyRender, 3 instances, async content init); §8 Help System: 14 → 15 sections (Auditions added — corrected to its true position before Getting Help per the live ALL_SECTIONS array, not after as originally drafted); 37 → 40 HelpTooltips; Production sidebar: Auditions + HelpContent visibility noted; Setup Panel Section 6: 5 toggles; §8 About System Emails: 11 → 15 triggers; §9 audition_signups.phone: NOT NULL corrected; §9 audition_materials: original_filename column added; §9 consent_form_submissions: audition_signup_id FK column added; §9 calendar_events: source_audition_id FK column added; source CHECK updated to include 'audition'; §9 email_log: recipient_type CHECK note updated (includes 'audition') — corrected to note the value is not yet exercised by any code path; §9 Migration 032: Pending → Applied (full inline fix inventory; migration-file/live-DB drift flagged); §9 next migration: 033; §9 AuditAction: audition.convert_to_volunteer added; §9 saveFeatureFlags revalidatePath: /crew/auditions added; §11 header updated (Phase AUDITIONS complete, Phase 17 next); §11 Phase AUDITIONS: forward spec → completed summary with all 10 prompt build logs (includes a correction to the AUDITIONS.4b log's Help System section-order claim); §13 R23: formatWallClockCT() signature corrected to 3 args (dateStr, timeStr|null, fmt); formatTime() local helper pattern documented for time without timezone columns; DOC.59 logged. NOTE (Q-item, DOC.59): the original prompt's Edit 5 referenced a separate "§7 public routes table" with a per-route row for /audition-checkin/[token] — no such table exists in this document; its intended content was already covered by the existing §7 Public role-access row, updated in this same pass.)*
