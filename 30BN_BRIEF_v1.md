# 30 By Ninety Theatre — Volunteer Platform
## 30BN_BRIEF_v1.md — Complete & Authoritative — v6.4
### Created: July 2026 | Last Updated: August 2026 — v5.5 (DOC.73: Phase NOTIFY complete documented — §1 current phase updated; §8 User Management badge note updated, Settings hub Platform Setup row removed, Sidebar section updated, Forums subscription note updated, new Notification System section added; §9 Migration 036 schema block added, next migration pointer updated, consent_form_submissions reviewed_at note added; §11 Phase NOTIFY build summary added, prompt log updated; §13 TOOLTIP_ANCHOR_MAP removal note added)
### Last Updated: August 2026 — v5.6 (DOC.74: Phase MESSAGES.A–4 documented — §1
current phase updated; §2 Production role updated (/crew/messages + /crew/users); §8
Setup Panel Section 6 updated (7 → 8 toggles, feature_messages added, first opt-in-
default flag); §8 Notification System updated (direct_message 7th type, MessagesIcon,
messageUnread); §8 new Private Messaging section added (full forward spec + partial
build summary MESSAGES.A–4); §9 4 new table schema blocks (message_threads,
thread_replies, thread_reads, thread_reply_attachments); §9 notifications type CHECK
updated (direct_message added); §9 Migration 037 status block added; §9
feature_messages seed documented; §9 SETUP key counts updated (21 → 22); §11 Phase
MESSAGES in-progress section added (MESSAGES.A–4 ✓, MESSAGES.5–8 pending); §11
prompt log updated; §13 R39 + R40 added; DOC.74 logged)
### Last Updated: August 2026 — v5.7 (DOC.75: Phase MESSAGES complete —
§1 current phase updated (MESSAGES complete, Phase 17 next); §5 media
bucket messages/ path namespaces added; §8 Private Messaging section fully
updated (thread view attachment reference corrected, context placements
marked ✓ complete, sanitize-at-write-time sub-section added,
file attachments sub-section added, prompt structure 9 → 8 prompts with
MESSAGES.5–7 all ✓, key files updated to MESSAGES.1–7); §11 Phase MESSAGES
marked ✓ Complete, build summaries for MESSAGES.5–7 added, prompt log
updated; §11 Phase 17.1 flag count 7 → 8 (feature_messages noted as
new opt-in); §13 version history v5.7; DOC.75 logged)
### Last Updated: August 2026 — v5.8 (DOC.76: ADMIN.45/46 + Phase TZ TZ.A–
TZ.4b documented — §1 current phase updated (Phase TZ in active execution,
TZ.5a/5b/TZ.6 remaining); §8 Setup Panel Section 1 updated (org_timezone
select field added, SETUP_KEYS 23→24); §8 QuickStats/Audit Log/Check-In
CT references updated; §8 ShowDetail defaultHours display added (ADMIN.46);
§8 Private Messaging onEmptyChange/isComposerEmpty pattern added (ADMIN.46);
§9 org_timezone key + Migration 038 added; §11 Phase TZ section added
(TZ.A–TZ.4b ✓, TZ.5a/5b/TZ.6 remaining); §11 ADMIN.45 + ADMIN.46 logged;
§13 resolveLayoutSettings rename + getOrgTimezone pattern + TZ phase notes
added; version history v5.8)
### Last Updated: August 2026 — v5.9 (DOC.78: Phase TZ complete —
§1 version + current phase (Phase TZ ✓ Complete, Phase 17 next);
§8 Public Calendar org-timezone-safe default language; §8 Calendar key
files getAvailableWindows() + computeEventPosition() timezone params noted;
§9 Migration 038 marked applied, next migration 039; §11 Phase TZ ✓
Complete (TZ.5a-AUDIT + TZ.5a + TZ.5b build summaries); §11 prompt log
through DOC.78; §13 useNowPosition() hook + module-level helper + TZ.5b
split-state + sibling-helper asymmetry patterns; version history v5.9)
### Last Updated: August 2026 — v6.0 (DOC.80: Phase MM
complete + Beta phases planned — §1 version + current
phase updated; §7 proxy.ts maintenance gate documented;
§8 Platform Setup updated (9 sections, Maintenance Mode
section added, SETUP_KEYS 24→27, action count updated);
§8 /crew/maintenance page new section; §8 Dashboard
planned ANNOUNCE widget noted; §8 Show Management planned
delete noted; §8 QR Generator planned banner + analytics
noted; §8 Style Sandbox planned mockups noted; §8 Forums
discoverability note added; §9 Migration 039 documented,
next migration 040, new app_settings keys added; §11 Phase
MM complete + Beta phases planned; §13 new patterns +
v6.0 version history)
### Last Updated: August 2026 — v6.1 (DOC.83: Beta
phases FORUMS-FIX/FORUMS-UX/ANNOUNCE/SHOWDELETE/
SHOWARCHIVE complete — §1 version + current phase; §7
revalidatePath-during-render rule; §8 Dashboard ANNOUNCE
complete; §8 Forums FORUMS-FIX + FORUMS-UX complete; §8
Show Management SHOWDELETE + SHOWARCHIVE + ShowForm fix;
§8 Platform Setup SETUP_KEYS 27→28, saveAnnouncement,
9th feature flag toggle; §8 Settings hub Dashboard
Announcements card; §9 Migration 040, admin_users
announcement_dismissed_at, 4 new app_settings keys,
next migration 041)
### Last Updated: August 2026 — v6.2 (DOC.85/DOC.86:
Beta phases QRBANNER/QRANALYTICS/SIDEBAR/NAVORDER
complete — §1 current phase updated (all Beta phases ✓,
Phase 17 Launch next); §3 @resvg/resvg-js + next.config.ts
+ types/sidebar.ts; §7 /go/ public route; §8 QR Generator
QRBANNER+QRANALYTICS complete; §8 Style Sandbox mockups
16+17 complete; §8 Sidebar grouped nav + TopBar redesign;
§8 Platform Setup SETUP_KEYS 28→29 + saveSidebarNavOrder
+ NavOrderSection; §9 Migrations 041+042, qr_codes schema
extended, qr_scan_events table, sidebar_nav_order key,
next migration 043; §11 QRBANNER/QRANALYTICS/SIDEBAR/
NAVORDER complete blocks + prompt log; §13 new patterns)
### Last Updated: August 2026 — v6.3 (DOC.87: ADMIN.47–51 + Phase BETA
complete — §1 current phase updated; §2 Editor/Viewer terminology updated;
§7 Editor/Viewer roles updated (Settings access tightened); §7 proxy.ts
new guards documented; §8 Audit Log access updated (SA/OA only); §8
Settings hub table rewritten (hide-not-lock rule, Beta Feedback card added,
15 cards total); §8 Sidebar updated (resolveGroupHrefs, showInventorySettings
prop, Inventory Management conditional link, dual-highlight fix, Beta Feedback
in Settings group); §8 Platform Setup updated (SETUP_KEYS 29→30,
feature_beta, 9th toggle); §8 new Beta Feedback section added; §9 Migration
043 + beta_feedback schema block + next migration updated to 044; §11
ADMIN.47–51 + BETA.A + BETA.1 build summaries + prompt log; §13 hide-not-lock
rule, resolveGroupHrefs pattern, Settings access rule, Inventory Management
sidebar pattern, feature_beta opt-in pattern; DOC.87 logged)
### Last Updated: August 2026 — v6.4 (DOC.88: ADMIN.52–57
complete — §1 current phase updated; §8 Dashboard
SeasonAtAGlance + AnnouncementWidget updated; §8 Notification
System NotificationPanel updated; §8 Platform Setup Section 1
extended (SETUP_KEYS 30→31); §8 Maintenance Page restoration
field; §8 QR Generator font fix + ribbon redesign; §8 Sidebar
Beta Feedback SA exclusion; §9 Migration 044 status block;
§11 ADMIN.52–57 build summaries; §13 new patterns; DOC.88 logged)
### Last Updated: August 2026 — v6.5 (DOC.90/DOC.91: ADMIN.58–60

complete — §1 current phase updated; §8 Dashboard: Quick Stats
31-day tile updates (labels + queries), SeasonAtAGlance full
overhaul (season selector removed, pure 31-day rolling, auditions
added, self-contained, dashboard/page.tsx simplified);
§8 Show Management: deleteShow() single-guard + cascade
(ADMIN.58), updateShowStatus() archive side-effect (cancel
future calendar events + revalidations), ShowList.tsx archived
filter + Opportunities link removed; §8 Sidebar: Beta Feedback
renamed to Beta Testing (all label locations), NavOrderSection
self-healing merge fix, TopBar icon sizing standardized;
§9 Migration 045 status block + app_settings dashboard_season_id
orphaned note; §11 ADMIN.58/59/60 build summaries + prompt log;
§13 five new pattern notes; DOC.90 + DOC.91 logged)

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
**Current phase:** Active Beta — Executive Committee
testing. Platform is in active pre-launch refinement.
Completed Beta phases: FORUMS-FIX ✓, FORUMS-UX ✓,
ANNOUNCE ✓, SHOWDELETE ✓, SHOWARCHIVE ✓, QRBANNER ✓,
QRANALYTICS ✓, SIDEBAR ✓, NAVORDER ✓, Phase BETA ✓
(Beta Feedback System). All planned Beta phases complete.
Phase 17 (Launch) remains next, deferred pending continued
pre-launch refinement.
Post-Beta ADMIN prompts: ADMIN.47–60 ✓ (ADMIN.47–51:
carry-forward cleanup, Settings access tightening, hide-not-lock
rule, Inventory Manager sidebar link; ADMIN.52–57: pre-launch
dashboard refinements, notification panel cleanup, QR banner
fix + ribbon redesign, maintenance restoration field; ADMIN.58–60:
show deletion single-guard + cascade, dashboard 31-day rolling
view + auditions + shows cleanup, Beta Testing rename + NavOrder
self-heal + TopBar icon sizing).
Phase CAST planned post-launch.

OpenCall OS: This platform is the master reference implementation for OpenCall OS (opencallos.com) — a bespoke volunteer and venue management platform for arts organizations and nonprofits. Each client deployment is a self-contained installation (own GitHub repo, Supabase project, Vercel deployment, domain). Jonathan (Super Admin) configures each deployment via the Setup Panel and transfers ownership at delivery. The 30BN deployment is the live proving ground — every feature built and validated here ships into the OpenCall OS template. See Phase SETUP and Phase THEME in §11.

---

## 2. Naming & Terminology

| Term | Definition |
|---|---|
| **Production Crew** | Admin backend display label. Route: `/crew` |
| **Volunteer Call Board** | Volunteer self-service portal display label. Route: `/callboard` |
| **Call** | A single volunteer appearance at a show or event. Never "shift." |
| **Super Admin** | Highest role. Full control including user management. |
| **Editor** | Theater exec or volunteer manager. Full read/write operational access. Cannot access the Settings hub, any Settings sub-page, or the Audit Log — all SA/OA only (tightened ADMIN.50). Editors with `inventory_manager = true` get a direct Inventory Management sidebar link to `/crew/settings/inventory` instead of a Settings hub card. |
| **Viewer** | Coordinator-level. Read-only access. No email sending, no editing. Cannot access the Settings hub or any Settings sub-page — SA/OA only. |
| **Live** | Show status: visible to the public, open for slot claims. |
| **Season** | A grouped set of shows for a given year (e.g., 2025–26 Season). |
| **The Roster** | NOT USED. The volunteer database section is labeled **Volunteers**. |
| **Production** | New admin role (CAL.2). Directors and Stage Managers. No access to volunteer database or other Production Crew functions. Lands on `/crew/calendar` after login. Has access to `/crew/calendar`, `/crew/media` (Media Library — ADMIN.30), `/crew/help`, `/crew/rehearsals` (Rehearsal Management — Phase 21, feature_rehearsals flag; sees only assigned schedules), `/crew/auditions` (Audition Management — Phase AUDITIONS, feature_auditions flag; full read/write on assigned auditions and shows), and `/crew/forums` (Internal Forums — Phase FORUMS, feature_forums flag; access to forums they have been explicitly granted access to, same as all other non-SA/OA roles), and `/crew/messages` (Private Messaging — Phase MESSAGES, feature_messages flag;
full send/receive access) and `/crew/users` (Crew Directory — Phase MESSAGES,
feature_messages flag; browsable directory for composing messages to other users). Assignment is independent per resource: Production users are granted access to a show explicitly (via show editors assignment) OR to a standalone audition directly (via audition assignments). Both paths are independent. Show assignment grants access to all auditions linked to that show via show_id. Audition assignment grants access to that specific audition only. |
| **Auditioner** | A person who signs up to audition for a show or production. Auditioners are NOT volunteers — they are a separate data entity stored in `audition_signups`, not in the `volunteers` table. Signing up to audition does not create a volunteer record. A "convert to volunteer" admin action (Phase AUDITIONS, status = Cast) can optionally create a linked volunteer record after casting. |
| **Calendar Editor** | A boolean flag (`calendar_editor`) on Editor, Viewer, and Owner Admin accounts. When true: direct write access to calendar (events saved as approved). When false (default): submissions go to pending queue for Super Admin approval. |
| **Inventory Manager** | A boolean flag (`inventory_manager`) on admin_users. When true on an Editor account: full write access to inventory (create/edit/deactivate items, manage categories/locations, create checkouts). SA and OA have full inventory write access always regardless of this flag. Viewer and Production roles have no inventory access at all. Toggle managed by SA/OA on the User Management page (same pattern as `calendar_editor`). Added Phase INVENTORY (Migration 034). |
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
| **QR Codes (PNG rasterization)** | `@resvg/resvg-js` | SVG-to-PNG rasterization (replaces QRCode.toBuffer() for all QR PNG generation; requires `serverExternalPackages: ["@resvg/resvg-js"]` in next.config.ts — napi-rs native binary pattern). |
| **Forms** | react-hook-form + zod + @hookform/resolvers | All form validation. `@hookform/resolvers` is a required peer package for `zodResolver` — install alongside react-hook-form. |
| **Dates** | date-fns + date-fns-tz | Two utility functions in `lib/utils/date.ts`. `formatCT()` — for full `timestamptz` values (created_at, updated_at, claimed_at, etc.) which include timezone info. `formatWallClockCT()` — for bare `date` column values (`'YYYY-MM-DD'`) and manually constructed date+time strings; these parse as UTC on Vercel without this function, shifting displayed dates by hours. Never use raw date-fns `format()`. See R23. |
| **Icons** | lucide-react | Icon system. |
| **Deployment** | Vercel (Hobby plan) | Auto-deploy on GitHub push. |
| **Image Config** | next.config.ts images.remotePatterns | Must include *.supabase.co hostname pattern (added ADMIN.33). Required for dynamic logo rendering when org_logo_url points to Supabase Storage. Without this entry, next/image will throw a runtime error on any deployment with a custom uploaded logo. |
| **Export** | `@react-pdf/renderer` | PDF export of volunteer list via server-side route handler. CSV export is client-side via `lib/utils/csv.ts`. Brand colors passed as props via `createStyles()` factory (THEME.4 — see §8 Volunteer List PDF). |
| **Color Utility** | `lib/utils/color.ts` | `lightenHex(hex, amount)` — pure server-side hex tint computation. Blends a hex color with white at the given percentage. Used by `resolveEmailSettings()` to compute `brandPrimaryLight` (8% tint of `brand_primary`) and by the PDF export route handler for the same derivation. Required because email clients and `@react-pdf/renderer` do not support CSS custom properties or `color-mix()` — tints must be concrete hex strings computed server-side. Established THEME.3b. `darkenHex(hex, amount)` — added STYLE.A. Blends a hex color toward black (amount = 1.0 → pure hex; amount = 0.0 → pure black). Used to compute `--brand-primary-dark` and `--brand-accent-dark` CSS custom properties in `resolveBrandColors()`. Same signature convention as `lightenHex()` — different blend target. |
| **Rich Text** | TipTap (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-underline`) | Rich text editing in the email blast composer (`/crew/communication`). StarterKit provides bold, italic, bullet/ordered lists, blockquote, headings, horizontal rule. `@tiptap/extension-link` and `@tiptap/extension-underline` added in ADMIN.27. Toolbar: B, I, U, H1, H2, —, • List, 1. List, 🔗. Editor outputs HTML passed to `sendBlastEmail()`. **Custom extension pattern (Phase AUDITIONS.4a):** `MergeTagExtension.ts` in `components/crew/auditions/` — inline/atom Node with `data-merge-tag` attribute round-trip, `insertMergeTag(tag)` command via module augmentation (`declare module '@tiptap/core'`), `.merge-tag-pill` CSS class for visual display. All TipTap editor instances in admin components use `immediatelyRender: false` (SSR/hydration safety — required in Next.js App Router). Installed 13.3b; extensions added ADMIN.27; custom extension added AUDITIONS.4a. **`useEditor` TypeScript overload caveat (FORUMS.5):** `ReturnType<typeof useEditor>` does not reliably infer `Editor | null` when `immediatelyRender: false` is set — TypeScript picks the last matching overload signature, which may return non-null `Editor`. Always type TipTap editor variables and toolbar helper props explicitly as `Editor | null` to avoid silent null-safety failures. |
| **Image Cropping** | react-easy-crop v6.2.3 | Client-side image crop editor for brand asset uploads in the Setup Panel (BrandImageUploader.tsx). Used for logo (free aspect ratio) and favicon (1:1 square lock). Installed SETUP.2. |
| **HTML Sanitization** | `sanitize-html` + `@types/sanitize-html` | Server-side sanitization of TipTap HTML output in `sendBlastEmail()` before the email payload is built. Allowlist: `p`, `strong`, `em`, `ul`, `ol`, `li`, `br`, `h1`–`h3`, `blockquote`, `a[href]` only. HTTP/HTTPS/mailto schemes only. Strips `<script>`, event handlers, and `javascript:` hrefs. Installed 13.4a. |
| **PWA** | Manual service worker | Admin-only PWA at `/crew` scope. Manifest at `public/manifest.json`, service worker at `public/sw.js` (network-first strategy). Icons generated via Sharp from `public/logo.png`. `start_url`: `/crew/dashboard`. |

**Mobile Sidebar State Pattern (established 12.1):**
The crew layout (`app/crew/(app)/layout.tsx`) is a Server Component. To share sidebar open/close state between Sidebar.tsx and TopBar.tsx without converting the layout to a Client Component, a thin Context provider (`components/crew/MobileSidebarContext.tsx`) wraps only the sidebar + topbar + main area. The layout itself stays a Server Component. This pattern should be used for any future shared UI state in the crew layout.

**React Hook Form — Nested Arrays:**
Nested `useFieldArray` calls (arrays of arrays, e.g. dates each containing their own roles list) must be placed in their own named sub-component. React's rules of hooks prohibit calling `useFieldArray` inside a render loop over a parent field array. Pattern established in ADMIN.11 (DateRow sub-component inside ShowForm). See R24.

**`types/sidebar.ts` — Shared Sidebar Types (established Phase NAVORDER):**
`GroupKey`, `SidebarNavOrder`, `HREF_LABELS`, `DEFAULT_GROUP_ORDER`, `DEFAULT_LINK_ORDER`, `GROUP_LABELS` — shared between `Sidebar.tsx` and `NavOrderSection.tsx`.

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
- `media` — all platform media files (private; signed URLs required for access). Created Phase 15.2. Path namespacing within the bucket: `consent-forms/[volunteer_id]/[submission_id]/` for consent submissions; `library/[folder_id]/[document_id]/` for media library files (Phase 15.3); `attachments/[type]/[record_id]/[document_id]/` for show/rehearsal/audition attachments (future phases); `inventory/[item_id]/[uuid].[ext]` for inventory item photo uploads (Phase INVENTORY). `forums/[post_id]/[uuid].[ext]` for forum post attachments (Phase FORUMS); `forums/temp/[tempKey]/[uuid].[ext]` for temp-key pre-post attachment staging (cleaned up at post creation time via storage .move()). `messages/temp/[tempKey]/[uuid].[ext]` for DM message attachment temp upload staging (Phase MESSAGES.6); `messages/[replyId]/[uuid].[ext]` for final DM attachment path after `adminClient.storage.from('media').move()` at submit time. Storage calls for the forums namespace (createSignedUrl, createSignedUploadUrl, move) use `getAdminClient()` — same dual-client pattern as inventory (storage.objects has no RLS policies). NOTE: storage calls for the inventory namespace (createSignedUrl, createSignedUploadUrl, remove) use `getAdminClient()` — confirmed INVENTORY.3 F1; storage.objects has no RLS policies so service role key is required regardless of session context. No public access — all reads go through the `/documents/[token]` redirect route which enforces access tier and generates signed URLs.
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

### CSS Custom Properties (injected by resolveBrandColors())

`resolveBrandColors()` in `app/layout.tsx` fetches
`brand_primary` and `brand_accent` from `app_settings` and
computes nine CSS custom properties injected via a `<style>`
tag in the root layout, cascading to all routes. The function
returns `{ primary, accent }` — bound as `brand.primary` and
`brand.accent` in the function body (not destructured as
`brandPrimary`/`brandAccent`).

**Six original tokens (THEME.1):**
- `--brand-primary` — raw primary hex
- `--brand-accent` — raw accent hex
- `--brand-primary-mid` — `color-mix(in srgb, var(--brand-primary) 59%, white)`
- `--brand-primary-tint` — `color-mix(in srgb, var(--brand-primary) 47%, white)`
- `--brand-primary-light` — `color-mix(in srgb, var(--brand-primary) 8%, white)`
- `--brand-accent-light` — `color-mix(in srgb, var(--brand-accent) 5%, white)`

**Three new derived tokens (STYLE.A — computed server-side):**
- `--brand-primary-dark` — `darkenHex(brand.primary, 0.82)` — hover/pressed states on primary elements
- `--brand-accent-dark` — `darkenHex(brand.accent, 0.82)` — hover/pressed states on accent elements
- `--brand-primary-subtle` — `lightenHex(brand.primary, 0.03)` — 3% pale tint for zebra rows and focus backgrounds

**Two static neutral tokens (STYLE.A — @theme, not derived):**
Added to the `@theme` block in `app/globals.css` as static hex values. Tailwind v4 auto-generates utility classes from `@theme` tokens — `bg-neutral-surface`, `dark:bg-neutral-surface`, `border-neutral-border`, etc. are all auto-generated; no hand-authoring in `@layer utilities` needed.
- `--color-neutral-surface: #F8F9FA` — card and panel surface color
- `--color-neutral-border: #E2E6EA` — border color for cards, tables, dividers

**Authoring rules confirmed STYLE.A:**
- `@theme` token naming: the `--color-` prefix is required for Tailwind v4 to auto-generate color utility classes. Tokens without this prefix produce inert custom properties with no utility class output.
- `resolveBrandColors()` return shape: `{ primary, accent }` — bound as `brand.primary` and `brand.accent` in the template literal. No `brandPrimary` or `brandAccent` local variables exist.
- Dark variant pattern in `@layer utilities`: uses `:where([data-theme="dark"], [data-theme="dark"] *)` selector, not the two-selector pattern `.dark .class / [data-theme="dark"] .class`.

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
| Editor | All `/crew/*` except the Settings hub (`/crew/settings`), Settings sub-pages, and the Audit Log (`/crew/settings/audit-log`) | Yes | Yes | Full operational access. Cannot access the Settings hub, any Settings sub-page, or the Audit Log — all SA/OA only (tightened ADMIN.50). Editors with `inventory_manager = true` get a direct Inventory Management sidebar link to `/crew/settings/inventory` instead of a Settings hub card. Bulk email from show detail built in ADMIN.23. Full blast system built Phase 13. Calendar: by default submits events for approval; if `calendar_editor = true`, gets direct write access (events approved immediately). |
| Viewer | All `/crew/*` except the Settings hub (`/crew/settings`) and any Settings sub-page | No | No | Read-only. No edit controls rendered. Cannot access the Settings hub or any Settings sub-page — all SA/OA only (tightened ADMIN.50). |
| Production | `/crew/calendar`, `/crew/media`, `/crew/help`, `/crew/rehearsals` (assigned only), `/crew/auditions` (assigned only), `/crew/forums` (granted forums only) | Calendar submission only | No | Directors and Stage Managers. Can submit events/rehearsal schedules for Super Admin approval. Cannot access volunteer database, shows, settings, or any other Production Crew section. Full read/write on assigned rehearsal schedules (Phase 21) and assigned auditions and shows (Phase AUDITIONS — AUDITIONS.2a). Assignment is per-resource and independent: show assignment (via show editors) grants access to all auditions linked to that show; direct audition assignment grants access to that audition only. Sidebar shows Calendar, Media Library, Help, Rehearsals, and Auditions. Redirected to `/crew/calendar` on login. Built CAL.2. Help page access added HELP.2a. Media Library confirmed ADMIN.30. Rehearsals added Phase 21. Show + audition access added AUDITIONS.2a. |
| Volunteer | `/callboard` | Own profile card only | No | Email or phone lookup → immediate cookie session |
| Public | `/`, `/shows/*`, `/opportunities/*`, `/forms/*`, `/update`, `/checkin/*`, `/consent/*`, `/documents/*`, `/calendar`, `/rehearsal-checkin/[token]`, `/auditions/[id]`, `/audition-checkin/[token]`, `/auditions/upload/[token]`, `/auditions/cancel/[token]` | No | No | No auth required. `/consent/[token]` — under-18 consent form upload page (token-gated). `/documents/[token]` — universal document redirect route (enforces access tier; backend-tier documents redirect to `/crew/login`). `/rehearsal-checkin/[token]` — rehearsal self check-in page (token-gated, no auth required, Production users self-report identity via roster dropdown). `/auditions/[id]` — public audition signup page (open call and timed-slot modes, role selection, material uploads, is_minor/guardian fields, consent trigger for under-18). `/audition-checkin/[token]` — audition self check-in page (token-gated, no auth required, roster dropdown identity — same pattern as rehearsal check-in). `/auditions/upload/[token]` — late material upload page; upload_token from signup confirmation email; P-DC pattern. `/auditions/cancel/[token]` — audition signup cancellation page; cancel_token from confirmation email; sets status = 'withdrawn'. |

**`calendar_editor` flag:** A boolean column on `admin_users` (default false, added Migration 017). When true on an Editor, Viewer, or Owner Admin account: that user gets direct write access to the calendar (events saved as `approved` immediately, Book Space button visible). When false: all calendar submissions go to the pending approval queue for Super Admin assignment and approval. Cannot be set on `super_admin` or `production` accounts (DB CHECK constraint enforces this; `owner_admin` CAN have `calendar_editor = true` — CHECK constraint updated in Migration 023). **UI toggle built CAL.6** on `/crew/settings/users` (Super Admin only) via `toggleCalendarEditor()` server action in `lib/actions/users.ts`. Logged to `audit_log` as `user.calendar_editor_change`.

**Auth model:** Admin accounts exist in `admin_users` table (linked to Supabase Auth). Admins authenticate via email/password or Google OAuth — both routes verify the `admin_users` record before granting access. Volunteers are NOT Supabase Auth users — they identify themselves via email or phone lookup on the Call Board; a match sets a 7-day cookie session with no magic link or email step required.
**Admin accounts:** Created by Super Admin OR via the self-registration "Request Access" flow on the login page. Production accounts can be created two ways: (1) directly by Super Admin via CreateUserModal (Super Admin callers only — added ADMIN.33), or (2) via the Request Access flow, assigned `role = 'production'` by Super Admin or Owner Admin on approval (added ADMIN.33/34). Owner Admin accounts can be created directly by both Super Admin and Owner Admin callers, and assigned via the registration approval flow by both callers. Google OAuth callback updated in CAL.3 to redirect production-role users to `/crew/calendar` instead of `/crew/dashboard`.

**Google OAuth registration path (built ADMIN.36):** A user with no `admin_users` row who authenticates via Google OAuth is routed through the same Request Access approval flow as email/password self-registration — `app/auth/callback/route.ts` inserts a `pending_registrations` row and notifies active Super Admins, exactly as `registerAdminRequest()` does for the email/password path. Google-registered pending requests are approved/declined identically to email/password requests via `approveRegistration()` / `declineRegistration()`. The callback uses two Supabase clients with different responsibilities: the session client (`createServerClient()`) handles code exchange, the `admin_users` lookup, and `signOut()` when blocking an inactive account; the admin client (`getAdminClient()`) handles all `pending_registrations` operations and the `email_log`/`email_log_recipients` inserts for the new-registrant notification — required because a newly-OAuth'd user has a valid Supabase Auth session but is not yet a Super Admin, and fails the `pending_registrations` RLS policy under the session client.

**`is_active` gating on the Google OAuth path (fixed ADMIN.38):** The callback's `admin_users` lookup originally selected only the columns needed to establish identity, omitting `is_active` — a deactivated admin could complete Google OAuth and reach `/crew/dashboard` despite being deactivated everywhere else. Fixed: the SELECT was widened to include `is_active`; when `is_active === false`, the callback calls `supabase.auth.signOut()` on the session client BEFORE redirecting to `?error=not_authorized` — a bare redirect without sign-out would leave a live Supabase Auth session in the browser. This matches the sign-out-before-redirect pattern the email/password path already used via `getAdminUser()`.

**Proxy/Middleware (CAL.2, renamed ADMIN.28):** Route protection is handled by `proxy.ts` at the repo root (renamed from `middleware.ts` to `proxy.ts` in ADMIN.28 — Next.js 16 convention). Production-role users are restricted — any `/crew/*` route other than `/crew/calendar`, `/crew/calendar/*`, and `/crew/help` redirects to `/crew/calendar` (`/crew/help` exception added HELP.2a). Owner Admin is permitted on all `/crew/*` routes EXCEPT `/crew/settings/setup` (hard-redirect to `/crew/dashboard`). Self-registered accounts are held in `pending_registrations` with status = 'pending' until a Super Admin approves and assigns a role. Super Admins receive an email notification on each new registration request. Feature flag route guards (SETUP.1): `proxy.ts` matcher extended to include public routes `/calendar` and `/checkin/:path*`. When a flagged feature is off, proxy blocks: `/crew/calendar` and `/crew/calendar/*` (`feature_calendar`); `/crew/tools/checkin` (`feature_checkin`); `/crew/communication` (`feature_blast`); `/calendar` (`feature_calendar`); `/checkin/*` (`feature_checkin`). Flag fetch is conditional — only fires when the request path matches one of the five guarded paths. Uses `getAdminClient()` and `getFeatureFlags()`.

**Phase 21 proxy.ts additions (21.2 + 21.3):** Four changes were made to `proxy.ts` across Phase 21: (1) `needsFlagCheck` extended to cover `/crew/rehearsals` (21.2) and `/rehearsal-checkin/` paths (21.3 — required a separate condition; the `/crew/rehearsals` addition did not cover it). (2) Production-role restriction exception: `!pathname.startsWith('/crew/rehearsals')` added to the Production allowlist alongside `/crew/calendar`, `/crew/help`, and `/crew/media`. Production users may access the Rehearsals route tree; per-schedule filtering happens at the data layer. (3) Crew-route flag block for `/crew/rehearsals` added after the calendar/checkin/blast blocks — redirects to `/crew/dashboard` when `flags.rehearsals` is false. (4) `/rehearsal-checkin/:path*` added to the matcher array (21.3, before the public flag block was written — SETUP.1 F1 discipline); public flag block redirects to `/` when `flags.rehearsals` is false and pathname starts with `/rehearsal-checkin/`.

**Phase AUDITIONS proxy.ts additions (AUDITIONS.2a + AUDITIONS.3a/3b + ADMIN.43):** Five changes across Phase AUDITIONS, with one correction applied in ADMIN.43: (1) `needsFlagCheck` extended to cover `/crew/auditions` and `/audition-checkin/` paths — two separate conditions, same pattern as Phase 21 rehearsals. (2) Production-role restriction exception: `!pathname.startsWith('/crew/auditions')` added to the Production allowlist (ADMIN.43 — documented as applied in AUDITIONS.2a but the commit was missing; the fix was discovered in INVENTORY.A audit F1 and applied as a standalone fix in ADMIN.43, commit b022423) — Production users may access the Auditions route tree; per-audition access filtering happens at the data layer. (3) Crew-route flag block for `/crew/auditions` added after the rehearsals block — redirects to `/crew/dashboard` when `flags.auditions` is false. (4) `/auditions/:path*` and `/audition-checkin/:path*` added to the matcher array BEFORE any flag block or guard logic is written (SETUP.1 F1 discipline — matcher must cover all guarded paths before guards are written). (5) Public flag block redirects to `/` when `flags.auditions` is false and pathname starts with `/auditions/` or `/audition-checkin/`.

**Phase INVENTORY proxy.ts additions (INVENTORY.1):** Two changes made to `proxy.ts` in INVENTORY.1: (1) `needsFlagCheck` extended to cover `/crew/inventory` — one condition appended to the existing chain. No matcher change needed (`/crew/:path*` already covers `/crew/inventory`). (2) Crew-route flag block for `/crew/inventory` added after the auditions block — redirects to `/crew/dashboard` when `flags.inventory` is false. No Production-role restriction exception added — Production has no inventory access (no proxy exception, no sidebar entry for Production).

**Phase FORUMS proxy.ts additions (FORUMS.1):** Three changes were made to `proxy.ts` in FORUMS.1: (1) `needsFlagCheck` extended to cover `/crew/forums` — one condition appended after the inventory condition. No matcher change needed (`/crew/:path*` already covers `/crew/forums`). No public flag block needed — Forums has no public-facing routes (unlike Auditions which has `/auditions/:path*`). (2) Production-role restriction exception: `!pathname.startsWith('/crew/forums')` added to the Production allowlist alongside calendar, media, help, rehearsals, and auditions. Production users have forum access; per-forum filtering happens at the data layer (access grants). (3) Crew-route flag block for `/crew/forums` added after the inventory block — redirects to `/crew/dashboard` when `flags.forums` is false.

**Phase MM proxy.ts additions (MM.1):** One new block added to `proxy.ts` — the maintenance mode gate. It fires before all other checks (before `needsFlagCheck`, before flag fetches, before role-based route guards). Logic: if `pathname.startsWith('/crew/')` AND pathname is not `/crew/login` AND pathname does not start with `/crew/maintenance`, fetch `maintenance_mode` from `app_settings` via `getAdminClient()`. If value is `'true'`: query `admin_users` for the current user's role. If role is `super_admin`, pass through transparently. If role is any other role, redirect to `/crew/maintenance`. If no Supabase Auth session exists, redirect to `/crew/login` (standard auth flow handles this). No matcher change needed — `/crew/:path*` already covers all crew routes. No feature flag — Maintenance Mode is an operational control, not a feature. Documented as MM.1 build, commit 4196623.

**Phase QRANALYTICS proxy.ts (QRANALYTICS.1):** No
changes were needed. The `/go/[token]` public route
handler (`app/go/[token]/route.ts`) is not covered by
the `proxy.ts` matcher — this is intentional. Route
handlers execute regardless of whether proxy.ts runs for
that path. No existing proxy guard intercepts `/go/`
paths (confirmed QRANALYTICS.A audit). The route requires
no feature flag gate, no role guard, and no maintenance
mode exception — it must always be reachable for any
scan of a generated QR code.

**ADMIN.50 proxy.ts additions:** Two new role-based guards
inserted after the Style Sandbox guard:
(1) `/crew/settings` — exact match (`pathname ===
'/crew/settings'`): SA/OA only; all other roles redirected
to `/crew/dashboard`. Uses session-scoped client (same
pattern as Setup and Style Sandbox guards).
(2) `/crew/settings/audit-log` — prefix match
(`pathname.startsWith('/crew/settings/audit-log')`):
SA/OA only; all other roles redirected to `/crew/dashboard`.
Both guards use the same session-client role-fetch pattern
as the pre-existing SA-gate guards. No matcher change
needed — `/crew/:path*` already covers both routes.

**FORUMS-FIX root cause — revalidatePath() prohibited during render:** `revalidatePath()` and `revalidateTag()` may only be called from within a Server Action invocation or a Route Handler — NEVER during a component's render path (i.e., in a Server Component function body that is executing as part of a page render). Calling them during render throws a Next.js runtime error: "Route used revalidatePath during render which is unsupported" — this error bubbles to `app/error.tsx` and displays as a generic "Something went wrong" page with no diagnostic detail. The failure is completely silent to lint and tsc — it only surfaces at runtime.

In FORUMS-FIX, `app/crew/(app)/forums/[forumId]/[threadId]/page.tsx` called `await markThreadRead(threadId)` directly in the Server Component body. `markThreadRead()` internally calls `revalidatePath()`, which threw on every thread page load. Fix: moved `markThreadRead()` to a client-side `useEffect` in `ThreadViewClient.tsx` — the established pattern from `components/crew/messages/ThreadView.tsx` (which correctly calls `void markThreadRead()` in a `useEffect(() => {...}, [data.thread.id])`). Any server action that calls `revalidatePath()` must only be invoked from onClick handlers, form actions, or other client-initiated Server Action calls — never from a Server Component's render function body.

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
  Shows (31 Days) (live shows with at least one show_date
  in the next 31 days from today, computed via
  `formatCT(addDays(new Date(), 31), 'yyyy-MM-dd', timezone)`
  string comparison — R23 pattern, DST-safe);
  Volunteers Needed (31 Days) (sum of open slots across
  live shows that have at least one show_date in the next
  31 days — two-step: get qualifying show IDs, then sum
  open slots for those shows only. Timezone resolved
  internally via `getOrgTimezone(supabase)`.); New Volunteers
  (7 Days) (created_at in last 7 days). Uses
  `getServerClient()`. Components:
  `components/crew/dashboard/QuickStats.tsx`.
- **Season at a Glance / Upcoming Widget** (built ADMIN.20,
  overhauled ADMIN.59, all roles): Pure 31-day rolling
  view of upcoming shows AND upcoming auditions. Season
  selector completely removed (ADMIN.59) — the widget
  no longer reads `dashboard_season_id` or renders
  `SeasonSelector`. Component receives only
  `{ timezone: string }` from `dashboard/page.tsx`.

  Shows query: all live shows with at least one
  `show_date` between today and +31 days (no season filter
  — includes unseasoned shows). Staffing indicator dots per
  role: red (0 claimed), yellow (partial), green (fully
  claimed). Link to `/crew/shows/[id]`.

  Auditions query (ADMIN.59, flag-gated on
  `feature_auditions`): published auditions with
  `date_start` within next 31 days. When flag is off,
  auditions query is skipped entirely. Renders with an
  "Audition" badge in place of staffing dots + link to
  `/crew/auditions/[id]` + linked show name (or "Standalone
  Audition").

  Combined list: Shows and auditions merged into a
  single chronological list sorted by earliest upcoming
  date ascending. Discriminated union type:
  `{ kind: 'show', ... } | { kind: 'audition', ... }`.

  Section header: "Upcoming (Next 31 Days)" — permanent,
  no dynamic season name. "View all shows →" link to
  `/crew/shows` always visible. Empty state: "Nothing
  scheduled in the next 31 days."

  31-day cutoff: `formatCT(addDays(new Date(), 31), 'yyyy-MM-dd', timezone)` — string-comparison pattern
  (R23). `today` string also computed via same
  `formatCT(new Date(), 'yyyy-MM-dd', timezone)` pattern.

  **Architecture:** Genuinely self-contained Server
  Component — `dashboard/page.tsx` passes only `timezone`
  (already resolved via `getOrgTimezone(supabase)` in the
  page). No show data, no season data, no season ID crosses
  the page→component boundary (the Brief's prior claim of
  "self-contained" was only partially true before ADMIN.59).

  **dashboard/page.tsx simplification (ADMIN.59):** Seasons
  fetch and `dashboard_season_id`/`pinnedSeasonId`/
  `pinnedSeasonName`/`seasonList` variables all removed.
  `Promise.all` reduced from 5 to 3 queries. `SeasonSelector`
  import removed.

  **Orphaned code (ADMIN.59/60):** `SeasonSelector.tsx`
  deleted. `setPinnedSeason()` removed from
  `lib/actions/settings.ts`. `dashboard_season_id` key in
  `app_settings` is now orphaned — no code reads or writes
  it. Harmless to leave in DB; optional manual cleanup via
  `DELETE FROM app_settings WHERE key = 'dashboard_season_id'`.

  Components: `components/crew/dashboard/SeasonAtAGlance.tsx`
  (`SeasonSelector.tsx` deleted in ADMIN.60).
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
- **Dashboard section render order** (top to bottom, as
  currently built): Announcement Widget (when active, above
  Quick Stats — Phase ANNOUNCE) → Quick Stats → Season at
  a Glance → Pending Milestones → Pending Hours → Add to
  Home Screen (mobile only) → Activity Feed.
- **Dashboard Announcements Widget (Phase ANNOUNCE ✓
  Complete):** A stacked widget at the very top of the
  Dashboard (above Quick Stats) that displays active
  announcements targeted to the current user's role.
  Super Admin publishes announcements with rich-text
  (TipTap) content, targeting specific roles via
  checkboxes. Each user can dismiss the widget; dismissal
  is per-user and persists via `admin_users.announcement_
  dismissed_at`. New publish resets dismissal state for
  all users (any announcement with `updated_at` newer than
  `dismissed_at` is shown). Multiple targeted announcements
  stack in one widget.

  OA publishing: disabled by default. Enabled via the
  `announcements_oa_enabled` feature flag toggle in
  Platform Setup Feature Flags section. When enabled, OA
  gets a mirror Announcement section at
  `/crew/settings/dashboard-announcement`. The SA Platform
  Setup announcement section and OA mirror section share
  the same underlying data (`dashboard_announcement_*`
  app_settings keys).

  Announcement widget is distinct from the public-facing
  announcement banner on `/` (`announcement_banner_*` keys
  — a completely separate feature with a different storage
  prefix to avoid naming collision).

  **New app_settings keys (Migration 040):**
  - `dashboard_announcement_body` — TipTap HTML content
  - `dashboard_announcement_updated_at` — ISO timestamp
    of last publish (set server-side, never from client)
  - `dashboard_announcement_roles` — JSON array of targeted
    role strings
  - `announcements_oa_enabled` — `'true'`/`'false'` OA
    publishing toggle (added to FeatureFlagsSection as 9th
    toggle; SETUP_KEYS 27 → 28)

  **New column (Migration 040):**
  - `admin_users.announcement_dismissed_at timestamptz`
    (nullable, no default)

  **New files:**
  - `lib/data/announcements.ts` — NO `'use server'`;
    `getActiveAnnouncements(supabase, admin)` data helper;
    returns announcements visible to the current user
    (role targeting + dismissed_at vs updated_at comparison)
  - `lib/actions/announcements.ts` — `'use server'`;
    `dismissAnnouncement()` (sets `announcement_dismissed_at
    = now()`, `getServerClient()`, self-row update, all
    roles); `getAnnouncementContent()` (returns current body
    + roles for AnnouncementSection self-load)
  - `components/crew/settings/AnnouncementSection.tsx` —
    `'use client'` standalone component used in both
    SetupPanel (SA) and OA mirror page. Self-loading: single
    `useEffect([editor])` calls `getAnnouncementContent()`
    and initializes TipTap editor + selectedRoles state.
    TipTap editor (Bold/Italic/Bullet/Ordered/H2 toolbar,
    `immediatelyRender: false`). Five role checkboxes (SA,
    OA, Editor, Viewer, Production) with Select All / Clear
    All. Publish button calls `saveAnnouncement()`. Uses
    `SaveStatus` type with `setStatus('saved')` on success
    and `'error' in result` narrowing.
  - `components/crew/dashboard/AnnouncementWidget.tsx` —
    Server Component; calls `getActiveAnnouncements()`;
    returns null when no active announcements
  - `components/crew/dashboard/AnnouncementWidgetClient.tsx`
    — `'use client'`; receives announcements as props;
    `useState<boolean>(false)` for dismissed; optimistic
    dismiss (set state immediately + `void dismissAnnouncement()`
    non-blocking); TipTap HTML rendered via Tailwind arbitrary
    CSS variant selectors (no `@tailwindcss/typography`)
  **Visual redesign (ADMIN.52):** `AnnouncementWidgetClient.tsx`
  was upgraded to a visually distinct card to draw attention on
  the dashboard. Card uses `bg-orange-50 dark:bg-orange-900/10
  border border-orange-200 dark:border-orange-900/40 border-l-4`
  with `style={{ borderLeftColor: 'var(--brand-accent)' }}` for
  the left accent. Header row: `Megaphone` icon (lucide-react) +
  'Announcement' label. Dismiss button uses `X` icon. TipTap HTML
  content rendered via arbitrary CSS variant selectors (unchanged).
  R35-safe: `dark-surface` is a native `@theme` token, so the
  `bg-orange-50 dark:bg-orange-900/10` pairing is cascade-safe —
  both are native Tailwind utilities.

  **OA mirror page:**
  `app/crew/(app)/settings/dashboard-announcement/page.tsx`
  — double-guarded (SA always; OA only when
  `announcements_oa_enabled === 'true'`; others redirect to
  `/crew/settings`). Renders `<AnnouncementSection />` (no
  props — self-loading).

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
- **Pending Registrations section** (appears above admin list when requests exist): per-request row with name, email, requested time, role selector (default Viewer), Approve and Decline buttons with inline confirmation. Pending registration count now surfaces in the TopBar NotificationPanel "Needs Action" section for SA and OA (ephemeral — clears when the request is approved or declined). Approve: creates `admin_users` row, sends approval email. Decline: deletes Supabase Auth user, sends decline email. Both log to `audit_log`. Built in ADMIN.15.
- Create new account: Name, Email, Role (Editor/Viewer/Owner Admin for SA+OA callers; Production additionally available to Super Admin only), Send Welcome Email toggle
  - Creates Supabase Auth user, inserts `admin_users` record, sends branded welcome email with login link + temp password + instructions to change password
- Deactivate/reactivate (cannot deactivate own account)
- Multiple Super Admins are supported. Deactivate button is disabled for ALL Super Admin rows in the Users table (not just own account).
- Change role (Super Admin only). Super Admin role cannot be changed via the Users panel.
- Super Admin cannot be demoted via this panel
- **`calendar_editor` toggle** (CAL.6, updated SETUP.0): on each Editor, Viewer, and Owner Admin row — grants or revokes direct calendar write access. Toggle absent on Super Admin and Production rows. Calls `toggleCalendarEditor()` in `lib/actions/users.ts`.
- **`inventory_manager` toggle** (INVENTORY.1): on each Editor row only — grants or revokes full inventory write access (create/edit/deactivate items, manage categories and locations, create checkouts). Toggle absent on Super Admin, Owner Admin, Viewer, and Production rows (SA/OA always have full inventory access; Viewer/Production have no inventory access). Calls `toggleInventoryManager()` in `lib/actions/users.ts`. Logged to `audit_log` as `user.inventory_manager_change` (type defined in `lib/audit.ts` — confirmed INVENTORY.2 F1; the AuditAction union lives in `lib/audit.ts`, not `types/audit.ts`). DB CHECK constraint enforces `inventory_manager = false` on `production` and `viewer` accounts. `app/crew/(app)/settings/users/page.tsx` query updated to fetch `inventory_manager` column (unplanned addition confirmed correct in INVENTORY.1 F3). SA/OA callers only.
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
    **Show Delete (updated ADMIN.58 — single guard + cascade):**
    `deleteShow(showId)` server action in `lib/actions/shows.ts`.
    Role guard: strict `['super_admin', 'owner_admin', 'editor']
    .includes(admin.role)`. ONE guard before delete:

    1. **Archived check:** Show must exist and have
       `status = 'archived'`. Returns `{ error: 'Only
       archived shows can be deleted.' }` if not.

    Guards 2 (active slot_claims) and 3 (attendance records)
    removed in ADMIN.58. The former blocking guards were
    replaced by DB cascade changes (Migration 045).

    **Cascade behavior (Migration 045):**
    `attendance.show_id` and `attendance.show_date_id` FKs
    changed from `ON DELETE NO ACTION` to `ON DELETE CASCADE`.
    When a show is deleted: `show_dates` CASCADE → `volunteer_roles`
    CASCADE → `slot_claims` CASCADE (including active commitments).
    `attendance` rows CASCADE via both FKs. `show_editors` CASCADE.
    `calendar_events` linked via `source_show_date_id` CASCADE.

    **Volunteer hours retained:** `volunteer_hours_log.source_id`
    is a bare UUID with no FK — attendance deletion leaves orphaned
    `source_id`s but does not affect `volunteers.total_hours` or the
    log itself. Hours earned at a deleted show are retained on the
    volunteer's record permanently. This is intentional.

    **Notifications cleanup:** Best-effort delete of `notifications`
    rows whose `href LIKE '/crew/shows/${showId}%'` via
    `getAdminClient()` (service role needed — notifications have
    self-scoped RLS). Non-blocking: failure never prevents delete.

    `logAction('show.delete', ...)` fires BEFORE the DELETE
    (row will not exist after). `'show.delete'` added to
    `AuditAction` union in `lib/audit.ts`. On success:
    `revalidatePath('/crew/shows')` + `revalidatePath('/shows')`.

    **UI:** Delete button + `AlertDialog` confirmation in
    `ShowDetail.tsx` `SettingsTab`. State and handler defined
    inside `SettingsTab` (not root `ShowDetail`) — `router`
    and `show` are already in scope there. On success:
    `router.push('/crew/shows')` (not `router.refresh()` —
    the show no longer exists). `AlertDialog` is state-
    controlled (no `AlertDialogTrigger`) — matches pattern
    in `ShowForm.tsx`. Uses `AlertDialogPrimitive.Cancel` and
    `AlertDialogPrimitive.Action` from `radix-ui`.
    **AlertDialog confirmation text (ADMIN.58):** "This will
    permanently delete '[show.name]', all associated dates,
    volunteer slot claims (including active commitments), attendance
    records, and calendar events. Volunteer hours already credited
    to volunteers will not be affected. This cannot be undone."
    Visible only when `canEdit && show.status === 'archived'`.
    `ShowEditorActionResult` return type (not `ActionResult`
    — the live file uses `ShowEditorActionResult` throughout).
    `router.push('/crew/shows')` on success. Commits:
    SHOWDELETE.A/SHOWDELETE.1 (original); ADMIN.58: b075a66.

    Also in Settings tab: a read-only "Default Hours per Volunteer" field showing
    the effective default hours for this show. Resolved value: `show.default_hours`
    (per-show override) if set; otherwise `defaultHours[getLocationHoursBucket(
    show.location?.name)]` (org-level bucket fallback). Displays "—" if neither
    resolves. A note reads "Edit via the show edit form." The `defaultHours`
    prop (the org-level bucket object) is passed from the parent page and threaded
    through to `SettingsTab`. Fixed in ADMIN.46 (the prop was previously declared
    in the type annotation but never destructured — the latent dead prop pattern
    from ADMIN.45).

    **Show Archive (Phase SHOWARCHIVE ✓ Complete):**
    Three changes shipped in SHOWARCHIVE.1:

    1. **ShowForm.tsx Save button fix:** The "Edit Show"
       form (`ShowForm.tsx`) previously had two hardcoded
       buttons — "Save & Publish" (always submitted status
       `'live'`) and "Save as Draft" (always submitted
       `'draft'`) — that completely ignored the Status
       `<select>` dropdown's selected value. Selecting
       `'archived'` or `'past'` from the dropdown and
       clicking either button would silently revert to
       `'live'`/`'draft'`. Fixed: both buttons replaced
       with a single "Save" button that reads the current
       `status` state from the dropdown and calls
       `submitForm()` with the correct status. Note:
       `submitForm()`/`buildPayload()` only support
       `'draft'`/`'live'` for the notification flow — selecting
       `'past'`/`'archived'` shows a guidance message
       directing the user to the Settings tab instead of
       blocking or erroring. Hint text updated to "Set the
       show status before saving."

    2. **Archive button on show cards:** `ShowCard` (defined
       inside `ShowList.tsx` — NOT a separate file) gained
       an Archive button below the Draft/Live toggle, gated
       on `canEdit && (show.status === 'draft' || show.status
       === 'live')`. On click: calls `updateShowStatus(show.id,
       'archived')` directly (no new server action needed).
       On success: shows an inline undo banner with 5-second
       auto-dismiss and an Undo button that calls
       `updateShowStatus(show.id, previousStatus)` to restore.
       `router.refresh()` called on both archive and undo
       success. State lives in `ShowList` (parent), not
       `ShowCard` — same pattern as the existing `isToggling`
       state. Past shows do NOT get the Archive button — they
       appear automatically in the Archived Shows accordion.

    3. **Archived Shows accordion:** New accordion section
       at the bottom of `ShowList.tsx`, after the entire
       groups/season conditional (NOT nested inside it —
       nesting would hide the accordion when the season
       filter returns no results). Shows `status = 'archived'`
       OR `status = 'past'` shows in reverse chronological
       order by `latest_date` (null-safe via `?? ''`). Gated
       on `canEdit && archivedShows.length > 0`. Title:
       "Show Archive". Each show rendered via the existing
       `ShowCard` component — no Archive button props passed
       (shows here are already archived/past). Past shows
       appear automatically without any status change — the
       accordion is a display filter only.

    **Status filter on season/unseasoned groups (ADMIN.59):**
    Season groups and the Unseasoned group now exclude shows
    with `status === 'archived'` or `status === 'past'` from
    their rendered lists. Only live and draft shows appear
    in these sections. Archived and past shows appear exclusively
    in the Archived Shows accordion at the bottom. The client-
    side `statusFilter` dropdown (default `'all'`) remains but now
    operates on a pre-filtered set. The Standing Opportunities
    link that previously appeared on the Shows page header was
    also removed in ADMIN.59 — Opportunities has its own
    dedicated sidebar link.

    Commit: 6557260.

    **Archive side-effect — calendar cleanup (ADMIN.59):**
    When `updateShowStatus()` is called with `newStatus ===
    'archived'`, after the status UPDATE completes, a two-step
    calendar cleanup fires:

    1. Fetch `show_date` IDs for this show
    2. Cancel all `calendar_events` WHERE
       `source_show_date_id IN [showDateIds] AND
       status = 'approved' AND end_time > now()`

    Future approved performance events disappear from both the
    public `/calendar` and admin `/crew/calendar` immediately.
    Past events (already ended) are left as approved history.

    `revalidatePath('/calendar')`, `revalidatePath('/crew/calendar')`,
    and `revalidatePath('/crew/calendar/pending')` added to
    `updateShowStatus()` for ALL status changes (not just archive).

    This archive side-effect fires via ALL archive paths:

    - Archive quick-action button on `ShowCard` (calls
      `updateShowStatus(show.id, 'archived')`)
    - Settings tab status dropdown → Save Status
      (also calls `updateShowStatus()`)
    - Show hard-delete (ADMIN.58): `calendar_events` already CASCADE
      via `source_show_date_id` → `show_dates` → `ON DELETE CASCADE` —
      no explicit cleanup needed for the delete path.
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
- `lib/qr.ts` — server-side utility. `generateQR(url,
  bannerText?)` → `{ svg: string, pngBase64: string }`.
  Level H error correction. PNG produced by rasterizing
  the final composed SVG via `@resvg/resvg-js`
  (`new Resvg(svg, { fitTo: { mode: 'width', value:
  2000 } }).render().asPng()`) — replaces the former
  `QRCode.toBuffer()` call. This means the SVG and PNG
  are always visually identical, including any banner
  text. `serverExternalPackages: ["@resvg/resvg-js"]`
  required in `next.config.ts` (napi-rs native binary).
  Two module-level constants: `BANNER_HEIGHT_UNITS = 10`
  (increased from 6 in ADMIN.56 to accommodate ribbon depth),
  `BANNER_FONT_SIZE = 2.8` (increased from 2.5 in ADMIN.56).
  Private `escapeXml()` helper escapes `&<>"'` before
  injecting admin-supplied banner text into SVG markup.
  'server-only' directive present.
- **Phase QRBANNER ✓ Complete:** Optional text banner
  below the QR matrix. Admin types banner text at
  generation time; a checkbox toggle enables/disables
  the banner per generation (max 50 chars). Banner
  appears in both the inline preview and the downloaded
  SVG and PNG files. Implemented via SVG `<text>` element
  composited below the QR matrix — viewBox extended by
  `BANNER_HEIGHT_UNITS`, white `<rect>` fills the banner
  zone, `<text>` is centered via `text-anchor="middle"`
  + `dominant-baseline="middle"`. `generateQR()` extended
  with optional `bannerText?: string` param. `label`
  and `banner_text` are distinct fields — label is the
  history panel identifier; banner_text is printed on
  the output image. Migration 041. Commit 9f5f341.
- **ADMIN.56 — Banner font fix + ribbon redesign:**

  *Root cause (font not rendering on Vercel):* The `Resvg`
  constructor in `lib/qr.ts` was called with no font option.
  `@resvg/resvg-js` defaults to `loadSystemFonts: true`, which
  silently fails on Vercel's minimal serverless Linux runtime
  (no system fonts present) — no error thrown, zero glyph
  rendering. Confirmed empirically via pixel-count test.

  *Font fix (ADMIN.56-FIX):* Inter Regular v4.0 (SIL Open Font
  License, 398KB) bundled at `public/fonts/banner-font.ttf`.
  Font resolved at runtime via `path.join(process.cwd(), 'public',
  'fonts', 'banner-font.ttf')` + `existsSync()`. `process.cwd()`
  is a runtime expression — Turbopack cannot statically analyze
  it, so the `.ttf` file is never treated as a module. The
  original approach (`createRequire(import.meta.url).resolve(
  'next/dist/compiled/@vercel/og/Geist-Regular.ttf')`) caused a
  Turbopack build failure: Turbopack statically follows literal
  string arguments to `resolve()`, attempted to import the `.ttf`
  as a module, and failed with 'Unknown module type'. The
  `process.cwd()` pattern is the established fix for referencing
  project assets in server-only files to avoid this class of
  Turbopack static analysis failure. Font options passed to
  `Resvg` only when `trimmedBanner` is truthy — no-banner path
  unchanged.

  *Ribbon redesign (ADMIN.56):* The plain white rect + text
  banner was replaced with a 7-element curled-edge ribbon:
  (1) white background rect covering banner zone; (2) `#EEF2FF`
  ribbon body rect with `rx='0.5'`; (3–4) `#B8C4E8` curl-shadow
  triangles at bottom corners (the dark underside of folded
  edges); (5–6) `#D4DCF5` curl-face triangles overlapping the
  shadows (the lighter visible face of the fold); (7) centered
  `#293994` text (brand navy, semibold, `font-family='Arial,
  sans-serif'`). All geometry (ribbonY, ribbonH, curlDepth,
  ribbonBottom, cx) derives dynamically from the parsed viewBox
  width N — no hardcoded coordinates. `escapeXml()` applied to
  bannerText before SVG interpolation (standing security rule).
- **Phase QRANALYTICS ✓ Complete:** Scan tracking for
  newly generated QR codes. New QR codes encode a
  `/go/[redirect_token]` URL instead of the raw target
  URL. The redirect token is generated via
  `crypto.randomUUID()` in `generateQRCode()` before
  calling `generateQR()` — the QR image must encode
  the `/go/` URL, so the token must exist first.
  `app/go/[token]/route.ts` — public GET handler:
  looks up `qr_codes` by `redirect_token`, logs a
  `qr_scan_events` row (scanned_at, user_agent,
  device_type, browser via manual regex parseUserAgent),
  redirects to `target_url`. Scan insert is best-effort
  (try/catch swallows errors). Redirect on token miss:
  `/not-found`. Manual UA parsing: Edge before Chrome
  (both contain "Edg/"), tablet before mobile (Android
  tablet UA lacks "Mobile"). Analytics display in QR
  history panel: aggregate summary (total scans, last
  scanned, device breakdown) + expandable per-scan log
  via `QRScanLogToggle.tsx` ('use client'). Legacy QR
  codes (null redirect_token) show "Analytics not
  available." Migrations 041 + 042. Commits f2c1a73,
  ebbf270, 9cf08a5.
- QR History Panel: Every successful generation is saved
  to the `qr_codes` table. History shared across all
  admins (any admin sees all saved QRs). Panel shows:
  label (or URL domain if no label), banner text when
  present, full URL, "Generated by [name] · [date]",
  analytics summary (trackable codes) or "Analytics not
  available" (legacy), "Show N scans" toggle (trackable
  codes with at least one scan), PNG/SVG download links.
  Capped at 50 rows. Save is best-effort.
- `lib/actions/qr.ts` — `generateQRCode(url, label,
  bannerText?)` server action: generates `redirectToken`
  via `crypto.randomUUID()`, builds redirect URL
  `${NEXT_PUBLIC_SITE_URL}/go/${redirectToken}`, calls
  `generateQR(redirectUrl, bannerText)`, inserts into
  `qr_codes` (best-effort), revalidates, returns
  `{ svg, pngBase64 }` or `{ error }`.
- `lib/data/qr.ts` — `getQRHistory(supabase)` + `QRHistoryEntry`
  type (id, url, label, banner_text, svg, png_base64,
  redirect_token, target_url, created_by, created_at).
  `getQRScanStats(supabase, qrCodeIds)` returns
  `Map<string, QRAnalyticsSummary>` with per-QR-code
  aggregate (scanCount, lastScannedAt, deviceBreakdown,
  events[]). `QRScanEvent` type (scannedAt, deviceType,
  browser).
- Page architecture: `app/crew/(app)/tools/qr-generator/
  page.tsx` (Server Component — fetches history + scan
  stats) + `components/crew/tools/QRGeneratorForm.tsx`
  (Client Component — form state + banner toggle) +
  `components/crew/tools/QRHistoryPanel.tsx` (Server
  Component — history list with analytics) +
  `components/crew/tools/QRScanLogToggle.tsx` ('use
  client' — expand/collapse per-scan log).
- New public route: `app/go/[token]/route.ts` — PUBLIC
  ROUTE header, `getAdminClient()` only, no feature flag
  gate, no matcher entry in proxy.ts needed.
- Per-show QR: on show detail Overview tab. Per-form QR:
  on form detail page. All surfaces use `generateQR()`
  from `lib/qr.ts`; all now get PNG via @resvg/resvg-js.

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
- Read-only. Super Admin and Owner Admin only. All other roles
  (Editor, Viewer, Production) hard-blocked at proxy and server —
  redirected to `/crew/dashboard`.
- Server-side paginated (25 per page), filtered viewer built in 30BN-10.1.
- Entry point: "Audit Log" card on `/crew/settings` hub — `{canAccessAdminSettings &&
  <LinkedCard .../>}` to `/crew/settings/audit-log` for SA/OA; hidden entirely for all
  other roles (hide-not-lock rule, ADMIN.49 — no `LockedCard` fallback).
- Filters: Admin User dropdown, Action Type dropdown (grouped by category), Target Type
  dropdown, Date From/To (DST-aware org-timezone boundary via `fromZonedTime()` from
  `date-fns-tz` with the resolved org timezone — not a hardcoded offset, since
  timezone varies per deployment and alternates seasonally for DST zones). Native
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

**Public Events Calendar (`/calendar`, CAL.7 — built):** Read-only public page (`app/calendar/page.tsx`, `getAdminClient()`, no auth). Month view only. Shows `event_type = 'performance'` and `status = 'approved'` events. Colored event pills (location color) per day. "Needs volunteers" indicator (orange) on show dates with at least one open slot. Click pill → show name, time, "Sign up to volunteer →" link to `/shows/[id]`. Month navigation via `?month=YYYY-MM` URL param (org-timezone-safe
  default — `PublicCalendarGrid.tsx` reads `document.body.dataset.timezone`
  with SSR guard, updated TZ.5b alongside the admin calendar components). Light mode only (no dark: classes — public page per ADMIN.6). "View Calendar" link added to `/` landing page and `/shows` page. Component: `components/calendar/PublicCalendarGrid.tsx`.

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
- `lib/utils/calendar-availability.ts` — `getAvailableWindows(events,
  locationId, dateStr, timezone)` (gained `timezone: string` parameter in
  TZ.5b — caller passes resolved tz); grid helpers remain UTC-anchored
  and timezone-agnostic (exempt from Phase TZ)
- `types/admin.ts` — `AdminRole` type (consolidated from inline definitions in CAL.2; `lib/auth.ts` re-exports it)
- `lib/utils/calendar-recurrence.ts` — `generateOccurrenceDates()`, `describeRecurrence()`
- `lib/utils/calendar-layout.ts` — `computeColumnLayout()` (timezone-
  agnostic, exempt from Phase TZ); `computeEventPosition(startTime, endTime,
  hourHeight, dayStartHour, timezone)` (gained `timezone: string` parameter
  in TZ.5b — caller `UnifiedWeekGrid.tsx` passes tz); `EventWithLayout` type
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

**Inventory Management (`/crew/inventory`, Phase INVENTORY — pre-launch):**
Gated behind `feature_inventory` flag (R34 compliant). Visible to SA, OA, Editor (read-only unless `inventory_manager = true`), and Viewer (read-only). Production role has no access. No public-facing surface — admin backend only.

**Access model:**
- SA and OA: full read/write always (no flag needed).
- Editor with `inventory_manager = true`: full read/write — create/edit/deactivate items, manage categories and locations, create and return checkouts.
- Editor without `inventory_manager`: read-only (view items, view checkout history; no private notes).
- Viewer: read-only (same as Editor without flag — no private notes).
- Production: no access (not in Production allowlist; no proxy exception for this route).
- `inventory_manager` boolean on `admin_users` (NOT NULL DEFAULT false). Toggle managed by SA/OA on User Management page via `toggleInventoryManager()` in `lib/actions/users.ts` (same pattern as `toggleCalendarEditor()`). Logged as `user.inventory_manager_change` in `audit_log`. DB CHECK constraint: `inventory_manager = false` when role is `'production'` or `'viewer'` (enforced at DB level).

**Item records:**
Each item has: auto-generated human-readable ID with category prefix (e.g. `COST-0042`, `PROP-0017` — prefix defined per category, 2–6 uppercase chars, zero-padded 4-digit counter), name, category (FK → `inventory_categories`), description, condition (enum: `excellent` / `good` / `fair` / `poor`), one or more storage locations (from managed `inventory_locations` list OR freeform text — both available per item, stored in `inventory_item_locations`), optional photo attachments (multiple, P-DC pattern, `media` bucket under `inventory/[item_id]/[uuid].[ext]`), active/inactive status, created/updated timestamps.

**Private notes:** Append-only entries on each item. Visible to SA, OA, and Editor only — Viewers cannot see them. Same append-only pattern as volunteer notes (no UPDATE/DELETE RLS). Author name + timestamp on each note. Stored in `inventory_notes` table.

**ID generation:** Server-side utility function `generateItemNumber(categoryId, supabase)` queries the category prefix, counts existing items in that category, and returns `PREFIX-NNNN`. Called at item creation. Prefix is unique per category (UNIQUE constraint on `inventory_categories.prefix`).

**Categories and locations:**
- `inventory_categories` — admin-managed list (SA/OA/inventory_manager): name, prefix (2–6 uppercase chars, UNIQUE), sort_order, is_active. Managed at `/crew/settings/inventory` (SA/OA/inventory_manager — settings-level page).
- `inventory_locations` — admin-managed list (SA/OA/inventory_manager): name, sort_order, is_active. Same settings page. Items can reference managed locations OR a freeform text location — both coexist per item via `inventory_item_locations` table.

**Checkout system:**
Only SA, OA, and `inventory_manager` Editors can create checkouts. A single checkout transaction covers multiple items. Each checkout records: one or more items (via `inventory_checkout_items` join table), checkout target (one of three types — `show`: FK to `shows` table; `user`: FK to `admin_users`; `custom`: freeform name + contact info), optional expected return date (date column — after which the item shows as Overdue in the UI, visual flag only, no email notification), checkout notes (SA/OA/Editor only — not visible to Viewers), return notes (same visibility), checked-out-by (the admin who logged it), checkout date. Return is logged per checkout (not per item individually). `returned_at` timestamptz is set on the `inventory_checkouts` row.

Overdue detection: computed at query time — `expected_return_date < CURRENT_DATE AND returned_at IS NULL`. No cron needed. The "Overdue" availability filter applies this WHERE clause.

**QR tags and print export:**
Each item has a QR code generated via `generateQR()` from `lib/qr.ts` (Level H, R6). QR links to `/crew/inventory/[id]` (the item detail page — admin-authenticated, requires login). Tags display: item name, category name, human-readable item ID, and the QR code. Print export: admins mass-select items on the list page via checkboxes, click "Print Tags" → server-side route handler at `/api/inventory/tags` generates a multi-tag PDF via `@react-pdf/renderer` using the `createStyles()` factory pattern (R33/THEME.4 — brand colors passed as props, not module-scope). Fixed filename: `inventory-tags.pdf`.

**Item list and filters:**
Default view: active items only (toggle to show inactive). Filters: Category, Availability (All / Available / Checked Out / Overdue), Condition, Storage Location. Keyword search on name and description. Checkbox multi-select for tag printing.

**Deactivation and deletion:**
Deactivating an item (retiring it) removes it from the default list view. Items with unreturned checkouts cannot be deactivated until those are returned (action returns an error). When deactivating, system prompts: keep as inactive record OR delete permanently. Permanent delete cascades via FK (photos, notes, checkout items, checkout history all deleted). Hard delete is exposed only after deactivation.

**Prompt structure (6 prompts — all complete):**
- INVENTORY.A ✓ — Read-only audit (no code).
- INVENTORY.1 ✓ — Migration 034 + flag infrastructure + sidebar + user management toggle.
- INVENTORY.2 ✓ — Settings page + item list page + creation modal + `lib/actions/inventory-settings.ts` + `lib/actions/inventory.ts`.
- INVENTORY.3 ✓ — Item detail page + photo gallery (6th sanctioned XHR file) + private notes + deactivation flow.
- INVENTORY.4 ✓ — Checkout system + `lib/actions/inventory-checkouts.ts`.
- INVENTORY.5 ✓ — QR display + PDF tag export + HelpContent full section.

**Key files (Phase INVENTORY — complete):**
- `types/inventory.ts` — InventoryCategory, InventoryLocation, InventoryItem, InventoryItemWithStatus, InventoryPhoto, InventoryNote, InventoryCheckout, CheckoutItem, CreateCheckoutData types
- `lib/audit.ts` — inventory AuditAction types added (inventory_category.*, inventory_location.*, inventory_item.*, inventory_photo.*, inventory_note.*, inventory_checkout.*) — NOTE: AuditAction union lives in `lib/audit.ts`, NOT `types/audit.ts`
- `lib/actions/inventory-settings.ts` — category + location CRUD (SA/OA/inventory_manager); getInventoryCategories(), getInventoryLocations() accept optional supabase client
- `lib/actions/inventory.ts` — item CRUD, generateItemNumber() (internal), photo signed URL generation (storage calls use getAdminClient() — confirmed F1 INVENTORY.3), deactivation/reactivation/deletion
- `lib/actions/inventory-checkouts.ts` — createCheckout() (double-checkout guard), returnCheckout(), getCheckoutsForItem(), getActiveCheckouts(), getSearchableShows(), getSearchableAdminUsers(); two-fetch-plus-TypeScript-join pattern for dual admin_users alias (enrichCheckouts() helper)
- `app/crew/(app)/inventory/page.tsx` — item list page (Server Component; fetches items, categories, locations, active checkouts)
- `app/crew/(app)/inventory/[id]/page.tsx` — item detail page (Server Component; Next.js 15 params Promise; generates QR server-side; notFound() for missing items)
- `app/crew/(app)/settings/inventory/page.tsx` — categories + locations management
- `app/api/inventory/tags/route.tsx` — PDF tag export route handler (.tsx not .ts — embeds JSX directly; auth + flag + Production guards; max 50 items; fixed filename `inventory-tags.pdf`)
- `components/crew/inventory/InventoryListClient.tsx` — item list, filters, checkbox multi-select, Print Tags button (window.open to /api/inventory/tags?ids=...), ActiveCheckoutsPanel, CheckoutModal trigger
- `components/crew/inventory/InventoryDetailTabs.tsx` — 5-tab shell: Overview (item display + inline edit + deactivation), Photos (gallery + uploader), Notes (append-only), Checkouts (history + return + CheckoutModal trigger), QR (SVG display + downloads + single-tag print link)
- `components/crew/inventory/InventoryPhotoUploader.tsx` — P-DC XHR multi-upload (6th sanctioned XHR file; sequential per-file; 10MB limit; FormData body)
- `components/crew/inventory/CheckoutModal.tsx` — multi-item selector, three-way target segmented control (Show/Admin User/Custom), debounced search, double-checkout guard surfaced from server action
- `components/crew/inventory/InventoryTagsPDF.tsx` — @react-pdf/renderer Document component; createStyles() factory (THEME.4 compliant — StyleSheet.create() inside factory, never at module scope); 2-column tag grid per Letter page; PNG QR image rendering
- `components/crew/settings/InventorySettingsClient.tsx` — categories + locations management UI (list/add/inline-edit/reorder/deactivate per section)
- `types/admin.ts` — inventory_manager field added to AdminUser type (unplanned INVENTORY.2 F2 — required for page guards and canWrite computation)
- `lib/auth.ts` — getAdminUser() SELECT extended to fetch inventory_manager (unplanned INVENTORY.2 F2 — without this all inventory_manager checks silently evaluated to undefined)

**Internal Forums (`/crew/forums`, Phase FORUMS — pre-launch):**
Gated behind `feature_forums` flag (R34 compliant). Admin backend only — no public-facing surface. SA and OA see all forums always. All other roles (Editor, Viewer, Production) see only forums they have been explicitly granted access to. Access is checked at query time — the forum list is filtered server-side, never client-side hidden.

**FORUMS-FIX ✓ Complete (Bug Fix):** The forums thread
view was redirecting to `app/error.tsx` ("Something went
wrong") on every page load. Root cause: `app/crew/(app)/
forums/[forumId]/[threadId]/page.tsx` called
`await markThreadRead(threadId)` directly in the Server
Component render body. `markThreadRead()` internally calls
`revalidatePath()`, which Next.js prohibits during render.
Fix: moved `markThreadRead()` to a client-side `useEffect`
in `ThreadViewClient.tsx` (same pattern as `ThreadView.tsx`
in the messages module). The same error fired on "Create
Thread" because `NewThreadModal` navigated immediately to
the new thread's URL after creation — landing on the same
broken render path. Both symptoms resolved by the single
fix. Commit: 29570e0.

**FORUMS-FIX.B ✓ (Follow-up cleanup):** Two additional
fixes: (1) The signed-URL generation loop in
`getThreadWithPosts()` (forum-posts.ts) was not wrapped
in a try/catch — a storage failure would crash the entire
thread fetch. Replaced with a per-attachment try/catch
that logs the error and returns `signed_url: null` on
failure (non-fatal — a broken attachment link is better
than a broken thread view). (2) `app/error.tsx` never
logged the caught error, which made diagnosing runtime
errors require extensive static analysis. Added
`useEffect(() => { console.error('Runtime error caught
by error boundary:', error) }, [error])`. Both fixes:
commit 6b5e230.

**Forum structure (jcink-style, full depth):**
Forum Index → Categories (organizational headers, not postable) → Forums → Threads → Posts (replies). SA/OA create and manage categories and forums from a dedicated management interface at `/crew/forums/manage`. Each forum row in this interface has an expand chevron (▼) that opens a sub-panel with three sections: Access Grants, Moderators, and Thread Prefixes. This chevron is the entry point for all per-forum permission management. **FORUMS-UX ✓ Complete:** A persistent "Manage Access" label (`<span className="text-xs text-mid-gray dark:text-dark-muted">Manage Access</span>`) was added immediately before the expand chevron in `ForumManageClient.tsx`, making the affordance discoverable without requiring the user to hover or explore. The label inherits the same `{!editMode && !confirmingDelete && (...)}` visibility gate as the chevron. Commit: 1651989. The grants UI was built in FORUMS.2; the expand behavior was confirmed working in Beta testing.

**Access grants (per forum — three types, any combination):**
- Role grant: all users of a given role (e.g. "all Editors"). Any user with that role sees the forum automatically.
- Group grant: all members of a named user group. Groups are managed separately at `/crew/settings/groups`.
- Individual grant: a specific admin user by name.
A user sees a forum if they match ANY grant. SA/OA see everything regardless of grants. Access grants are managed per-forum by SA/OA from the forum management interface.

**User groups (`/crew/settings/groups`, SA/OA only):**
Named groups (e.g. "Young Leadership Council," "Theater Executives," "Spring 2026 Team") with admin user membership. Users can belong to multiple groups. Groups feed into forum access grants and have no other platform function. Settings hub card added for Groups.

**Moderation:**
SA and OA have full moderation capabilities across all forums: edit posts, delete posts (soft delete — body replaced with "[Post deleted]", row preserved for thread structure), lock threads (no new replies), pin threads (appear at top of thread list), move threads between forums. SA/OA can appoint per-forum moderators from `forum_moderators` table — moderators have the same capabilities within their assigned forum only.

**Threads and posts:**
Anyone with forum access can create threads and post replies. Thread creation: prefix selector (admin-managed per-forum list, e.g. [ANNOUNCEMENT], [DISCUSSION], [QUESTION]), title, opening post body. Post body: full rich TipTap editor (`immediatelyRender: false`) with StarterKit + `extension-link` + `extension-underline` extensions. Toolbar: Bold, Italic, Underline, H1, H2, H3, Bullet List, Ordered List, Blockquote, Link, Horizontal Rule. Post HTML stored in `forum_posts.body_html`, sanitized via `sanitize-html` at save time (same R31 pattern as blast — broader allowlist since posts are admin-to-admin, not outbound email). Displayed via `dangerouslySetInnerHTML` with sanitized HTML.

**File attachments on posts:** P-DC pattern (7th sanctioned XHR file — `ForumPostComposer.tsx`). Multiple attachments per post. Storage path: `forums/[post_id]/[uuid].[ext]` in `media` bucket. Temp-key pattern: attachments uploaded before post creation using a temp identifier, confirmed and re-pathed at post creation time to avoid orphaned storage objects.

**Thread subscriptions and notifications:**
Users manually subscribe to threads (no auto-subscribe on post). When subscribed, user receives an email notification AND an in-app notification on each new reply to that thread. Email: `sendForumNotificationEmail()` in `lib/email.ts` — now returns `{ notifiedUserIds: string[] }` (refactored NOTIFY.3). In-app: `createNotification()` called per subscriber using the returned `notifiedUserIds`, independently of email deliverability (NOTIFY.3-FIX: early-return path when subscribers have no email now correctly returns the populated array). Non-blocking void IIFE (try/catch, errors swallowed). Email logged to `email_log`. Users can unsubscribe from any thread. Subscribe/unsubscribe toggle visible on thread view.

**Unread tracking:**
`forum_post_reads` table tracks per-user read state (one row per user per post once read). When a user opens a thread, all posts in that thread are batch-upserted as read for that user. Forum index and thread list show unread indicators (bold text or badge) on forums/threads containing unread posts. Unread count computed at render time from `forum_post_reads` — no denormalized counter column.

**Thread sort:** Pinned threads first (is_pinned DESC), then by updated_at DESC (last reply bumps thread to top).

**Post editing:** Users can edit their own posts indefinitely (no time window). Moderators and SA/OA can edit any post. `edited_at` timestamptz set on edit, displayed in UI as "(edited)".

**Soft deletes:** `forum_posts.is_deleted = true` hides the body (shows "[Post deleted]") but preserves the row. Thread reply counts remain accurate. Only moderators, SA, and OA can delete posts (own posts can also be deleted by the author — sets is_deleted).

**Prompt structure (6 prompts — all complete):**
- FORUMS.A ✓ — Read-only audit (no code): audit `lib/feature-flags.ts`, `proxy.ts` (matcher + Production exception needed — Production has forums access), `Sidebar.tsx` (5-part atomic edit, Production allowlist entry required), `lib/actions/setup.ts`, `setup/page.tsx`, `HelpContent.tsx` live section order. Also audit existing TipTap extension list in `BlastComposer.tsx` and `AuditionDetailTabs.tsx` to confirm installed extensions.
- FORUMS.1 ✓ — Migration 035 (12 forum tables) + 5-file flag pattern (`feature_forums`) + proxy.ts (Production exception + flag block, no matcher change, no public block) + Sidebar 5-part atomic edit (MessageSquare icon + NAV_ITEMS + FLAG_GATED_HREFS + Production allowlist + TOOLTIP_ANCHOR_MAP) + User Groups settings page `/crew/settings/groups` (SA/OA only: create/rename/delete groups, add/remove members with name search) + Settings hub Groups card. `lib/actions/forum-groups.ts`. Commit dde841d.
- FORUMS.2 ✓ — Forum management interface `/crew/forums/manage` (SA/OA only): category CRUD (add/rename/reorder/delete), forum CRUD within categories (add/rename/describe/reorder/archive), per-forum access grants UI (all three grant types), per-forum moderator assignment, per-forum thread prefix management. `lib/actions/forum-admin.ts`. 19 new AuditAction types. Commit c1c7328.
- FORUMS.3 ✓ — Forum index `/crew/forums` (filtered by access at query time using TypeScript-join pattern for three-way OR across role/group/individual grants, unread indicators, per-forum last-post info) + thread list page `/crew/forums/[forumId]` (pinned first, then by last activity, unread per thread, mark-all-read action) + read tracking (batch upsert to `forum_post_reads` on thread open). `lib/actions/forums.ts` + `lib/data/forums.ts`. No 'use server' in `lib/data/forums.ts` (data module, not action file). Commit 5c95810.
- FORUMS.4 ✓ — Thread view `/crew/forums/[forumId]/[threadId]` (posts chronological, rendered HTML, subscribe/unsubscribe toggle, mark-read on view) + post composer (TipTap `immediatelyRender: false`, 11-button full toolbar, file attachments via P-DC XHR). `lib/actions/forum-posts.ts`. `ForumPostComposer.tsx` is the 7th sanctioned XHR file. `FORUM_POST_SANITIZE_OPTIONS` exported constant from `forum-posts.ts` for reuse. Dual-client pattern: getServerClient() for DB, getAdminClient() for all storage (3 storage calls). Commit b21b3a4.
- FORUMS.5 ✓ — Thread creation modal (prefix selector, title, opening post — no file attachments on thread creation) + moderation actions (lock/unlock, pin/unpin, move thread — move is SA/OA only) + post editing (inline TipTap editor, async setContent() pattern, shared editor instance) + soft delete + subscription email notification (`sendForumNotificationEmail()` in `lib/email.ts` — uses `sendBatchEmails()` per R8, `resolveEmailSettings()`, `escapeHtml()` on user strings, `logEmailSent()` after send, `sentBy: null`). `lib/actions/forum-moderation.ts`. Dead `forumId` prop removed from `ForumPostComposer.tsx`. Commit e41f66f.

**Key files (Phase FORUMS — complete):**
- `lib/actions/forum-groups.ts` — user group CRUD + membership management (SA/OA only)
- `lib/actions/forum-admin.ts` — category/forum/prefix/grant/moderator management (SA/OA only); `getForumsForMove()` added FORUMS.5
- `lib/actions/forums.ts` — forum index + thread list queries (access-filtered); `markThreadRead()`, `markAllForumRead()`
- `lib/data/forums.ts` — data layer (no 'use server'; accepts supabase client as param); `canAccessForum()`, `isForumModerator()`, `getForumIndexData()`, `getThreadListData()` using TypeScript-join access control
- `lib/actions/forum-posts.ts` — post creation (createForumPost with temp-key attachment move), `getPostAttachmentUploadUrl()`, `getThreadWithPosts()` (with signed URLs), `toggleThreadSubscription()`; `FORUM_POST_SANITIZE_OPTIONS` exported constant (broader allowlist for admin-to-admin posts — reused in forum-moderation.ts)
- `lib/actions/forum-moderation.ts` — `createThread()` (no attachments on thread creation), `lockThread()`, `unlockThread()`, `pinThread()`, `unpinThread()`, `moveThread()` (SA/OA only), `editPost()`, `deletePost()` (soft delete — sets is_deleted=true, body_html='[Post deleted]'); private `isModeratableBy()` helper
- `types/forums.ts` — 17 types total: ForumUserGroup, ForumGroupMember, ForumCategory, Forum, ForumAccessGrant, ForumModerator, ForumThreadPrefix, ForumWithDetails, CategoryWithForums, ForumAdminUserOption, ForumSummary, CategoryWithForumSummary, ThreadSummary, ForumDetail, ForumPostAttachment, ForumPostWithDetails, ThreadViewData
- `app/crew/(app)/forums/page.tsx` — forum index
- `app/crew/(app)/forums/manage/page.tsx` — forum management (SA/OA only; HelpTooltip anchor='forums')
- `app/crew/(app)/forums/[forumId]/page.tsx` — thread list (Next.js 15 async params)
- `app/crew/(app)/forums/[forumId]/[threadId]/page.tsx` — thread view; calls `markThreadRead()` on load
- `app/crew/(app)/settings/groups/page.tsx` — user groups management (SA/OA only)
- `components/crew/forums/ForumPostComposer.tsx` — TipTap post editor with attachments (7th sanctioned XHR file; sequential upload per InventoryPhotoUploader pattern; `forumId` prop removed FORUMS.5 cleanup)
- `components/crew/forums/ForumIndexClient.tsx` — forum index display (read-only, 'use client')
- `components/crew/forums/ThreadListClient.tsx` — thread list + New Thread modal with inline TipTap editor (no file attachments on thread creation)
- `components/crew/forums/ThreadViewClient.tsx` — post list, subscribe toggle, per-post edit/delete (shared editor instance, async setContent() pattern), moderation bar (lock/pin/move)

**Notification System (Phase NOTIFY — complete):**
A two-track notification architecture surfaced via a bell
icon panel in the TopBar. No feature flag — core
infrastructure (R34 exception, same rationale as the Style
Sandbox).

**Two tracks:**

*Track A — Ephemeral (queue-driven, role-filtered):*
Derived live from existing data at render time. Notification
persists until the underlying queue item is resolved — not
when a user clicks through, but when the work is finalized.
No per-user dismissal. No new table for the notification
itself — counts are live SELECT queries.

- Pending registrations: SA + OA. Count from
  `pending_registrations WHERE status = 'pending'`. Clears
  when approved or declined. Links to `/crew/settings/users`.
- Pending calendar events: SA only. Count from
  `calendar_events WHERE status = 'pending'`. Clears when
  approved or cancelled. Links to `/crew/calendar/pending`.
- Pending consent forms: SA + OA + Editor. Count from
  `consent_form_submissions WHERE reviewed_at IS NULL AND
  submitted_file_path IS NOT NULL`. Clears when an admin
  sets `reviewed_at` (the column already existed on the
  live table — confirmed NOTIFY.A, no migration needed).
  Links to `/crew/settings/documents`.

*Track B — Persistent (per-user, stored in `notifications`
table):*
A row is written to the `notifications` table at the
moment the event fires. Each row is tied to a specific
`admin_user_id` recipient. `read_at` nullable — null =
unread. Individually dismissible. History retained.

Persistent notification types (from the `type` CHECK
constraint):
- `audition_signup` — new audition signup submitted.
  Recipients: Editors and Production users assigned to
  that audition (via `audition_assignments` or via
  `show_editors.admin_id` for show-linked auditions).
- `audition_material` — material uploaded for an existing
  signup. Same recipients as `audition_signup`.
- `calendar_approved` — calendar event approved. Recipients:
  Production users assigned to that event (via
  `rehearsal_schedule_assignments` for batch events, or
  `show_editors`/`audition_assignments` for show/audition-
  linked events). Resolved by `resolveCalendarRecipients()`
  private helper in `lib/actions/calendar.ts`.
- `calendar_changed` — calendar event updated (time,
  location, or other change). Same recipients.
- `calendar_cancelled` — calendar event cancelled. Same
  recipients.
- `forum_reply` — new post in a subscribed thread.
  Recipients: all subscribers in `forum_thread_subscriptions`
  (excluding the poster — same exclusion as the email send).
- `direct_message` — sent to the recipient on new thread creation and on each
  new reply (MESSAGES.1/MESSAGES.2)

**NotificationPanel (TopBar):**
`components/crew/NotificationPanel.tsx` — 'use client'.
Rendered as the first child of the TopBar right-side div.
— `MessagesIcon.tsx` ('use client') rendered before `NotificationPanel` in
the TopBar right-side flex div. Conditional on `flags.messages`. Mail (`Mail`)
icon from Lucide, unread count badge (capped at 99+), links to `/crew/messages`.
`unreadCount` prop sourced from `notificationCounts.messageUnread` (MESSAGES.3).

Bell badge: `totalEphemeral + unreadPersistent`. The forum
unread count is intentionally excluded — it has its own
badge on the sidebar Forums link. Badge capped at 99+ for
display. `messageUnread: number` (unread DM thread
count, derived from `getUnreadMessageCount()` in `lib/data/messages.ts`,
included in `getNotificationCounts()` return when `flags.messages` is true)

Dropdown (two sections):
1. "Needs Action" — ephemeral items, role-filtered. Each
   is a link to the relevant queue page. Section hidden
   when no ephemeral items are pending.
2. "Notifications" — persistent items, reverse-
   chronological (all unread persistent items — no row
   cap — ADMIN.54 removed the former 20-row limit). Unread
   rows highlighted (`bg-neutral-surface dark:bg-dark-nav`
   — R35-safe; no dark variant for `bg-brand-primary-subtle`
   exists in globals.css). "Mark all read" button. Each item
   links to `notification.href`.

**Notification panel behavior (ADMIN.53):**
- Mark-as-read removes the notification from the panel
  immediately (optimistic filter-out — the item disappears
  rather than just losing its unread highlight). Server action
  still fires in the background.
- Mark-all-as-read clears the panel to an empty state ('No new
  notifications'). 'Mark all read' button conditionally rendered
  only when `unreadPersistent > 0`.
- `direct_message` type notifications are filtered from the
  rendered list and excluded from the bell badge count. DB rows
  are not deleted — hidden at render time only. The Messages
  icon in TopBar has its own unread badge and is the canonical
  surface for DM unread state.
- `visibleNotifications` derived constant (filters out
  `direct_message` type) drives both the rendered list and the
  `unreadPersistent` count. The former server-computed
  `counts.unreadPersistent` state was removed entirely —
  `unreadPersistent` is now client-derived from
  `visibleNotifications.filter(n => !n.read_at).length`.

State model: SSR-first (initial data from layout server
fetch as props), optimistic client updates via
`startTransition` for mark-read actions. Outside-click
closes dropdown (useEffect + useRef cleanup pattern).

`timeAgo()` is a pure client-safe helper defined locally
in the component — no server imports. `getTypeIcon()`
maps `NotificationType` to lucide-react icons.

**Forum unread badge (Sidebar):**
Forums sidebar link renders a count pill badge when
`forumUnreadCount > 0`. Passed as a prop from the crew
layout (`app/crew/(app)/layout.tsx`). Count derived from
`forum_post_reads` (existing table), filtered to
`is_archived = false` to exclude archived forums. Capped
at 99+ for display. This badge is separate from the TopBar
bell badge — forum unread does not contribute to the bell
total.

**No feature flag:** The notification system is core
infrastructure with no meaningful "off" state. R34
exception confirmed.

**Key new files (Phase NOTIFY):**
- `types/notifications.ts` — `NotificationType`,
  `NotificationRow`, `EphemeralCounts`, `NotificationCounts`
- `lib/utils/notifications.ts` — `createNotification()`
  internal helper (no 'use server'; accepts supabase client
  as param; never throws; companion-module pattern per
  FORUMS.5-FIX rule)
- `lib/data/notifications.ts` — `getForumUnreadCount()`,
  `getNotificationCounts()`, `getUserNotifications()` (no
  'use server'; role-scoped; parallel via Promise.all)
- `lib/actions/notifications.ts` — 'use server': exported
  `getNotificationCounts()`, `getUserNotifications()`,
  `markNotificationRead()`, `markAllNotificationsRead()`
- `components/crew/NotificationPanel.tsx` — 'use client'
  TopBar bell panel

**Key modified files (Phase NOTIFY):**
- `components/crew/Sidebar.tsx` — Users link removed;
  HelpTooltips and TOOLTIP_ANCHOR_MAP removed; Platform
  Setup SA-only link added to bottom section above
  ThemeToggle; Forums link unread badge added
- `app/crew/(app)/layout.tsx` — notification counts + initial
  notifications fetched in server Promise.all; props threaded
  to Sidebar (forumUnreadCount) and TopBar
  (notificationCounts, initialNotifications)
- `components/crew/TopBar.tsx` — NotificationPanel rendered
  as first child of right-side div; props extended
- `lib/email.ts` — `sendForumNotificationEmail()` refactored
  to return `Promise<{ notifiedUserIds: string[] }>`
- `lib/actions/forum-posts.ts` — void IIFE extended to call
  `createNotification()` per subscriber
- `lib/actions/auditions.ts` — `submitAuditionSignup()` and
  `confirmAuditionMaterialUpload()` both have void IIFEs;
  `confirmAuditionMaterialUpload()` select extended with
  `audition_id`
- `lib/actions/calendar.ts` — `resolveCalendarRecipients()`
  private helper added; five write points wired (7 total
  call sites in `cancelRecurringOccurrence` three branches)
- `lib/actions/consent.ts` — `revalidatePath('/crew', 'layout')`
  added to `confirmConsentSubmission()`

**Prompt structure (6 prompts — all complete):**
- NOTIFY.A ✓ — Read-only audit (no code). Key findings:
  `reviewed_at` already present on `consent_form_submissions`;
  TopBar is 'use client'; TOOLTIP_ANCHOR_MAP at lines 57–62;
  HelpTooltip render block at lines 159–170; Platform Setup
  card in settings/page.tsx lines 237–248; `confirmAudition
  MaterialUpload()` missing `audition_id`; `approveBatch()`
  not tracking approved event IDs.
- NOTIFY.1 ✓ — Migration 036 + sidebar/settings cleanup +
  `types/notifications.ts`. Commits 26b2add + c7e8000
  (NOTIFY.1-FIX: HelpTooltip comment).
- NOTIFY.2 ✓ — Notification infrastructure (lib/utils,
  lib/data, lib/actions) + layout prop threading + Sidebar
  forum badge. Commit 6e363d3.
- NOTIFY.3 ✓ — Write-point wiring across 6 action files.
  `getForumUnreadCount()` archived-forum filter fixed.
  `sendForumNotificationEmail()` return type changed.
  Commit 80c7021.
- NOTIFY.4 ✓ — NotificationPanel.tsx + TopBar wiring +
  NOTIFY.3-FIX (early-return path fix in lib/email.ts).
  React 19.2.4 confirmed (async startTransition native).
  Commit 7ea1f19.
- NOTIFY.4-CLEANUP ✓ — Lint baseline restored:
  TOOLTIP_ANCHOR_MAP const removed from Sidebar.tsx;
  unused type imports removed from layout.tsx; dynamic
  pluralization in NotificationPanel.tsx. npm run lint:
  0 errors, 0 warnings. Commit 5e7656f.

**Private Messaging (`/crew/messages`, Phase MESSAGES — in progress):**
Internal mail system for one-on-one private communication between all admin
roles. Backend-only — no volunteer access. Gated behind `feature_messages`
flag (R34 compliant, first opt-in-default flag — seeds as `'false'`).

**Model:** Gmail-like subject-threaded mail system, NOT a chat system.
`message_threads` holds metadata (subject, participants, archive timestamps).
`thread_replies` holds all messages including the first. Multiple independent
subject threads between the same two users are allowed — there is no unique
pair constraint. Compose always creates a new thread. To change subjects, start
a new thread. Replies nest under their thread; there is no nesting within replies.

**All admin roles** (SA, OA, Editor, Viewer, Production) participate equally
as both senders and receivers.

**Inbox (`/crew/messages`):** Three URL-driven tabs (no client-side state):
- **Inbox**: threads where the user is recipient, not archived
- **Sent**: threads created by the user, not archived
- **Archived**: threads where the user's archived timestamp IS NOT NULL

Each thread row shows: subject, other person's name, last reply snippet
(HTML stripped, 160 chars), timestamp (`formatCT(last_reply_at, 'MMM d')`),
and an unread dot (always rendered — `bg-brand-primary` or `bg-transparent`
— for stable layout). Archive button renders a `<form action={archiveWithId}>`
sibling to the thread `<Link>` inside each `<li>` (never nested).
"New Message" button at top right links to `/crew/messages/compose`.

**Archive semantics (per-participant soft-delete):**
`creator_archived_at` and `recipient_archived_at` nullable timestamps on
`message_threads`. Archiving sets the caller's column to `now()`. A new
reply via `createReply()` clears the other participant's archived timestamp —
resurfacing the thread in their Inbox automatically. Archived threads are
not deleted — they appear in the Archived tab.

**Thread view (`/crew/messages/[threadId]`):**
Flat chronological reply list. Each reply: sender name, timestamp, sanitized
HTML body, attachment list (MESSAGES.6, complete). TipTap rich text reply composer at
bottom (`immediatelyRender: false`, `Editor | null`). Auto-refresh polling
(`setInterval(() => router.refresh(), 15000)` — 15s interval, separate
`useEffect` from mark-read). `markThreadRead()` fired on mount via
`startTransition`, upserts `thread_reads`.

**Read receipts:** "Read [time]" displayed below the most recent reply once
the recipient has opened the thread after that reply was sent. Derived from
`thread_reads.last_read_at` for the other participant. The `thread_reads`
SELECT policy is **intentionally asymmetric** — both participants can read all
read records for their shared thread (required for read receipts). This is a
deliberate departure from the self-only scoping used on all other tables.
Do NOT change it to self-only.

**Compose (`/crew/messages/compose`):**
Accepts optional `?to=[userId]` param (pre-fills and locks recipient).
Subject input (varchar 150 — DB-level cap, first use of `varchar(n)` in
schema vs. bare `text`). TipTap body. Calls `createThread()` on submit.
Always creates a new thread — never redirects to an existing thread.

**User Directory (`/crew/users`):**
All active admin users except the current user (self-excluded at page level).
Per-user row: initials avatar, name, "Message" link to
`/crew/messages/compose?to=[userId]`. Accessible to all roles when
`feature_messages` is on. Feature-flag-gated sidebar link ("Directory",
`UserSearch` icon from Lucide, three-part atomic edit MESSAGES.3).

**"Message" entry points (context placements — MESSAGES.7
complete):**
All navigate to `/crew/messages/compose?to=[userId]`:
- User Directory (`/crew/users`) — per-user row
- SA/OA Users page (`/crew/settings/users`) — per-user row (via `!isSelf`
  guard using the already-computed boolean, not a fresh `user.id !==
  currentAdminId` comparison)
- Forum posts (`ThreadViewClient.tsx`) — next to post author; guard
  includes `!post.is_deleted`
- Rehearsal schedule (`RehearsalDetailTabs.tsx` RosterTab) — next to crew
  member; `adminId` threaded from parent → `RehearsalDetailTabs` →
  `RosterTab` (was not passed to RosterTab before MESSAGES.7)
- Audition assignments (`AuditionDetailTabs.tsx` Settings tab) — next to
  assigned editor; `adminId` added to destructured params (pre-existing
  latent bug: declared in type but never destructured — fixed MESSAGES.7)
- Show detail assigned editors (`ShowDetail.tsx`) — next to editor name
  using `editor.admin_id` (NOT `editor.admin_user_id` — show_editors
  column rule); `adminId` added to destructured params (same latent bug
  as auditions — fixed MESSAGES.7)

All context placements guard: `feature_messages` must be on AND target
user ID ≠ current user ID (self-exclusion enforced at render level).

Two pre-existing latent bugs found and fixed in MESSAGES.7:
`AuditionDetailTabs` and `ShowDetail` both declared `adminId: string` in
their prop types but never destructured it — silently dropped despite
parent pages passing it correctly. Both parent pages `shows/[id]/page.tsx`
and `settings/users/page.tsx` also lacked `getFeatureFlags` entirely and
received full import + fetch additions in MESSAGES.7.

**Notification integration:**
- Bell badge (Track B): `direct_message` persistent notification type. Written
  via `createNotification()` inside void IIFEs in `createThread()` (notifies
  recipient) and `createReply()` (notifies other participant). Non-blocking,
  never throws.
- Email: `sendDirectMessageEmail()` in `lib/email.ts` — called alongside
  `createNotification()` in the same void IIFE. Single recipient per call
  (`resend.emails.send()` directly). `recipientType: 'transactional'`,
  `recipients: [{ email: to, volunteerId: null }]` (R8 compliant — single
  recipient send, not batch).

**RLS and privacy:**
All message table operations use `getServerClient()` exclusively — privacy
guarantee is RLS-enforced. `getAdminClient()` is used ONLY inside void IIFEs
for `createNotification()` (requires service role to write notifications for
other users). Using `getAdminClient()` for message table reads would bypass
RLS and break the privacy model.

**Sender mark-as-read:** After inserting a reply (in both `createThread()` and
`createReply()`), the sender's `thread_reads` record is upserted with
`last_read_at = now()` — prevents the sender's own message from appearing in
their unread count.

**Sanitization at write time (MESSAGES.5):**
`DM_SANITIZE_OPTIONS` constant defined in `lib/actions/messages.ts`. Both
`createThread()` and `createReply()` call `sanitizeHtml(body, DM_SANITIZE_OPTIONS)`
before inserting into `thread_replies`. Allowlist: `p`, `strong`, `em`, `u`,
`ul`, `ol`, `li`, `br`, `h1`–`h3`, `blockquote`, `a[href, rel, target]`, `hr`.
Schemes: `http`, `https`, `mailto`. `ThreadView.tsx` renders reply bodies via
`dangerouslySetInnerHTML` safely — sanitization already occurred at write time.
Import pattern: `import sanitizeHtml from 'sanitize-html'` + `import type {
IOptions } from 'sanitize-html'` (matches `lib/actions/forum-post-sanitize.ts`
— same package, same type import path).

`@tailwindcss/typography` is **not installed** in this project. TipTap-generated
HTML in reply bodies is styled via Tailwind arbitrary CSS variant selectors
(`[&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4` etc.) — not `prose` classes.
Do not add `prose` or `prose-sm` to DM message rendering containers; they
produce zero CSS output without the plugin. Note: `ThreadViewClient.tsx` in
the forums module also uses `prose prose-sm max-w-none dark:prose-invert` —
these are equally inert (pre-existing gap, out of MESSAGES scope, deferred
to a future ADMIN or STYLE-ROLLOUT prompt).

**File attachments (MESSAGES.6):**
P-DC pattern — client XHR PUT directly to Supabase Storage; no file bytes
through Next.js (R9). Storage paths: temp `messages/temp/[tempKey]/[uuid].[ext]`
→ final `messages/[replyId]/[uuid].[ext]` via `adminClient.storage.from('media').move()`
at submit time. Per-attachment errors are swallowed via `continue` — the
message is already sent when the attachment loop runs.

`app/api/messages/upload/route.ts` — GET handler. Auth check + `feature_messages`
flag guard (uses `getServerClient()` for flag check — authenticated context,
consistent with established pattern). 10MB file size guard. Calls
`createSignedUploadUrl()` (not `createSignedUrl()`). Returns
`{ signedUrl, path, tempKey }`. `getAdminClient()` used only for the
`createSignedUploadUrl()` storage call (storage API requires service role key
regardless of session context).

`components/crew/messages/DirectMessageComposer.tsx` — **8th sanctioned XHR
file** (required header comment: "XHR used instead of fetch() — fetch() does
not support upload progress events. xhr.upload.onprogress is the only
browser-native way to report upload progress."). `forwardRef` +
`useImperativeHandle` wrapping TipTap editor + file upload UI. Exposes four
methods via `DirectMessageComposerHandle` ref type: `getBody(): string`,
`getAttachments(): AttachmentInput[]`, `clear(): void`, `isEmpty(): boolean`.

ADMIN.46 fix: `DirectMessageComposer.tsx` gained an `onEmptyChange?: (isEmpty:
boolean) => void` prop wired via TipTap's `onCreate` and `onUpdate` hooks —
fires whenever the editor's empty state changes. `ComposeForm.tsx` and
`ReplyComposer.tsx` replaced direct `composerRef.current?.isEmpty()` reads in
their `disabled={}` JSX expressions with a `const [isComposerEmpty, setIsComposerEmpty]
= useState(true)` state, driven by `onEmptyChange={setIsComposerEmpty}`. This
was a behavioral correctness fix: refs are not reactive and reading them during
render produces stale values. Send buttons now correctly disable/enable in
response to composer content changes.

`ComposeForm.tsx` and `ReplyComposer.tsx` both refactored in MESSAGES.6 to
`useRef<DirectMessageComposerHandle>` — all TipTap imports removed from both
parents. Attach button triggers `<input type="file">` via `fileInputRef`;
XHR upload on file select; `FormData` body with `cacheControl: '3600'` and
file appended under empty field name `''` (confirmed P-DC pattern — same as
all 7 prior sanctioned XHR files).

Signed download URLs (TTL 3600s) generated in `getThreadData()` in
`lib/data/messages.ts` via `getAdminClient().storage.from('media').createSignedUrl()`.
`getAdminClient()` used here because `storage.objects` has zero RLS — the
established dual-client pattern. Rendered in `ThreadView.tsx` as file links
with Paperclip icon and KB file size.

`types/messages.ts` extended in MESSAGES.6: `AttachmentInput` type (4 fields:
`tempKey`, `fileName`, `fileSize`, `contentType`) and `ThreadReplyAttachmentWithUrl`
type (6 fields: `id`, `reply_id`, `file_name`, `file_size`, `content_type`,
`signed_url`). `ThreadReplyWithDetails` extended with `attachments:
ThreadReplyAttachmentWithUrl[]`.

**Prompt structure (8 build prompts):**
Note: Compose page and thread view were combined into MESSAGES.5 (originally
planned as two prompts — compose only and thread view only). This collapsed
the numbering from the original 9-prompt plan by one.
- MESSAGES.A ✓ — Read-only audit (13 tasks: proxy.ts, layout, Sidebar,
  feature-flags.ts, SetupPanel.tsx, setup/page.tsx, setup.ts, lib/email.ts,
  notifications CHECK constraint, notifications data files, context placement
  files). No code.
- MESSAGES.1 ✓ — Migration 037 (4 new tables, `direct_message` added to
  notifications CHECK, `feature_messages` seeded 'false'). Commit 8a86d10.
- MESSAGES.2 ✓ — Types, data layer, server actions, email function. 3 new files,
  4 modified. `direct_message` added to NotificationType union (self-caught,
  required for TypeScript). `messageUnread` added to NotificationCounts. Commit 72deeae.
- MESSAGES.3 ✓ — Feature flag 5-file pattern, proxy.ts guards, MessagesIcon.tsx,
  Sidebar (two three-part atomic edits: Messages + Directory), layout prop threading.
  1 new file, 8 modified. Commit 924f6e5.
- MESSAGES.4 ✓ — User Directory page (`/crew/users`) + Messages Inbox page
  (`/crew/messages`, three-tab). 2 new Server Component pages. Commit 4dea6cf.
- MESSAGES.5 ✓ — `/crew/messages/compose` (ComposeForm.tsx with recipient
  search/select, subject, TipTap body) + `/crew/messages/[threadId]` thread
  view (ThreadView.tsx: two independent useEffects — mark-read on mount +
  15s polling; read receipt logic; arbitrary CSS variant selectors for rich
  text rendering — `@tailwindcss/typography` not installed).
  Sanitize-at-write-time added (`DM_SANITIZE_OPTIONS`). 5 new files,
  1 modified. Commit f99d8cc.
- MESSAGES.6 ✓ — File attachments. `DirectMessageComposer.tsx` (8th
  sanctioned XHR file; `forwardRef` + `useImperativeHandle`; exposes
  `getBody/getAttachments/clear/isEmpty` via ref). `app/api/messages/upload/route.ts`
  (GET handler, P-DC signed upload URL, 10MB guard). `ComposeForm.tsx` and
  `ReplyComposer.tsx` both refactored off inline TipTap onto composerRef.
  `types/messages.ts`: `AttachmentInput` + `ThreadReplyAttachmentWithUrl` added.
  `getThreadData()` extended with signed download URLs. 2 new files, 6 modified.
  Commit 178698f.
- MESSAGES.7 ✓ — Context placements (forum posts with `!post.is_deleted` guard,
  rehearsal RosterTab, audition SettingsTab, show editors SettingsTab via
  `editor.admin_id`, SA/OA Users page via `!isSelf`). Fixed two pre-existing
  latent bugs (`adminId` declared but not destructured in `AuditionDetailTabs`
  and `ShowDetail`). Minor fixes: `feature_messages` in `logAction()` audit diff,
  year-aware `formatCT` on thread list. 0 new files, 15 modified.
  Commit b0ed62b. Phase MESSAGES complete.

**Key files (MESSAGES.1–7 — complete):**
- `types/messages.ts` — 9 types: MessageThread, ThreadReply,
  ThreadReplyAttachment, ThreadRead, InboxThreadRow,
  ThreadReplyWithDetails (now includes `attachments` field),
  ThreadDetail, AdminUserBasic, AttachmentInput, ThreadReplyAttachmentWithUrl
- `lib/data/messages.ts` — data layer (import 'server-only', no 'use server',
  supabase as first param, all try/catch): `stripHtmlForPreview()` (internal),
  `getInboxThreads()`, `getSentThreads()`, `getArchivedThreads()`,
  `getThreadData()` (extended MESSAGES.6: fetches `thread_reply_attachments`
  + generates signed download URLs via `getAdminClient()`),
  `getUnreadMessageCount()`, `getUsersForDirectory()`
- `lib/actions/messages.ts` — ('use server', 5 async exports + DM_SANITIZE_OPTIONS
  constant): `createThread()`, `createReply()` (both sanitize body + accept
  optional `attachments?: AttachmentInput[]`), `markThreadRead()`,
  `archiveThread()`, `searchUsers()`
- `components/crew/MessagesIcon.tsx` — 'use client'; Mail icon; badge (99+ cap);
  links to /crew/messages; `unreadCount` prop
- `app/crew/(app)/users/page.tsx` — Server Component; auth + flags.messages guard;
  self-exclusion filter; initials avatar; "Message" link per user
- `app/crew/(app)/messages/page.tsx` — Server Component; three-tab URL-driven inbox;
  "New Message" button; unread dot always rendered; archive form sibling to thread
  Link; year-aware `formatCT` (MESSAGES.7 fix)
- `app/crew/(app)/messages/compose/page.tsx` — Server Component; auth + flag guard;
  `?to=` param resolution with self/inactive-exclusion; renders ComposeForm
- `components/crew/messages/ComposeForm.tsx` — 'use client'; recipient search/select/lock;
  subject input (maxLength 150); `useRef<DirectMessageComposerHandle>` for TipTap +
  attachments; `createThread()` submit → `router.push()` to new thread
- `app/crew/(app)/messages/[threadId]/page.tsx` — Server Component; auth + flag guard;
  `notFound()` on missing/inaccessible thread; 5 props to ThreadView
- `components/crew/messages/ThreadView.tsx` — 'use client'; two separate `useEffect`s
  (mark-read on mount + 15s polling — never coupled); read receipt logic (sender check
  + timestamp comparison, shown only on most recent reply); archive action;
  attachment display (Paperclip icon, KB size, signed URL links)
- `components/crew/messages/ReplyComposer.tsx` — 'use client';
  `useRef<DirectMessageComposerHandle>`; `createReply()` submit; `clear()` on success;
  `router.refresh()`
- `app/api/messages/upload/route.ts` — GET handler; auth + flag guard; 10MB size
  guard; `createSignedUploadUrl()` → returns `{ signedUrl, path, tempKey }`
- `components/crew/messages/DirectMessageComposer.tsx` — **8th sanctioned XHR file**;
  `forwardRef` + `useImperativeHandle`; TipTap editor (7-button toolbar, `Editor | null`
  explicit, `immediatelyRender: false`) + P-DC file upload via XHR FormData;
  exposes `DirectMessageComposerHandle` ref type

Context placements modified in MESSAGES.7:
- `components/crew/forums/ThreadViewClient.tsx` — Message link after post author
- `components/crew/rehearsals/RehearsalDetailTabs.tsx` — Message link in RosterTab
- `components/crew/auditions/AuditionDetailTabs.tsx` — Message link in SettingsTab
- `components/crew/shows/ShowDetail.tsx` — Message link in show editors row
- `components/crew/settings/UsersTable.tsx` — Message link in user row

Note: `lib/email.ts` extended with `sendDirectMessageEmail()`;
`types/notifications.ts` extended with `messageUnread: number` on
`NotificationCounts` and `'direct_message'` on `NotificationType`;
`lib/feature-flags.ts` has 8 flags (`messages: boolean` as 8th);
`lib/data/notifications.ts` calls `getUnreadMessageCount()`.

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

All 17 sections (in order — confirmed against the live `ALL_SECTIONS` array; Forums added FORUMS.1, full content FORUMS.5): Dashboard · Your Volunteers · Shows · Attendance and Hours · The Volunteer Signup Form · Settings · Master Calendar · Communication · Check-In System · Media Library · The Volunteer Call Board · Standing Opportunities · Getting Help · Rehearsals · Auditions · Inventory · Internal Forums

Sections and anchors: 15 h2 sections, ~50 subsections, all with named anchor IDs. Key anchors (must-preserve — 9 original HelpTooltip targets): `hours`, `milestones`, `default-hours`, `volunteer-profile`, `publish-show`, `categories`, `volunteer-communication`, `show-volunteers`, `waitlist`. HELP phase anchors: `dashboard`, `dashboard-stats`, `dashboard-season`, `dashboard-feed`, `calendar`, `calendar-overview`, `calendar-submit`, `calendar-direct-create`, `calendar-bulk-rehearsal`, `calendar-recurring`, `calendar-pending`, `calendar-book-space`, `calendar-export`, `calendar-public`, `communication`, `blast-compose`, `audit-log`, `location-management`, `email-activity-log`. ADMIN.30 anchors: `check-in`, `check-in-qr`, `check-in-dashboard`, `document-types`, `consent-forms`, `media-library`, `media-library-upload`, `media-library-access`. Phase 21 anchors: `rehearsals`, `rehearsals-schedules`, `rehearsals-assignments`, `rehearsals-attendance`, `rehearsals-checkin`. Phase AUDITIONS anchors: `auditions`, `auditions-overview`, `auditions-signups`, `auditions-materials`, `auditions-checkin`. Phase INVENTORY anchors: `inventory`, `inventory-overview`, `inventory-items`, `inventory-checkout`, `inventory-tags`. Phase FORUMS anchors: `forums`, `forums-overview`, `forums-access` (SA/OA only), `forums-threads`, `forums-moderation` (SA/OA only). Full section content added INVENTORY.5. Production role does NOT see the Inventory section (inventory has no Production access).

HelpTooltip placements: 43 total. Original 17 (12.2c): dashboard card headings, volunteer profile sections, show detail, show form, volunteer list milestone filter, settings. HELP.2d (5): `SeasonAtAGlance.tsx` → `dashboard-season`; `communication/page.tsx` → `blast-compose`; `settings/locations/page.tsx` → `location-management`; `settings/audit-log/page.tsx` → `audit-log`; `settings/email-activity/page.tsx` → `email-activity-log`. ADMIN.29 (4): `CalendarShell.tsx` → `calendar-submit`, `calendar-export`, `calendar-book-space`; `PendingQueueClient.tsx` → `calendar-pending`. ADMIN.30 (6): `app/crew/(app)/tools/checkin/page.tsx` → `check-in-dashboard`; `ShowDetail.tsx` (Dates tab) → `check-in-qr`; `DocumentTypesManager.tsx` → `document-types`; `ConsentSubmissionsQueue.tsx` (×2 — empty-state + main render) → `consent-forms`; `MediaLibrary.tsx` → `media-library-access`. Phase 21 (5): `Sidebar.tsx` → `rehearsals` (nav link); `rehearsals/page.tsx` → `rehearsals` (list header); `RehearsalDetailTabs.tsx` → `rehearsals-assignments` (Roster tab), `rehearsals-assignments` (Dates tab), `rehearsals-attendance` (Attendance tab). Phase AUDITIONS (3): `app/crew/(app)/auditions/page.tsx` → `auditions` (list page header — placed in Server Component, not list client); `AuditionDetailTabs.tsx` → `auditions-signups` (Signups tab header); `AuditionDetailTabs.tsx` → `auditions-materials` (Materials tab header). Phase INVENTORY (2, added INVENTORY.5): `InventoryDetailTabs.tsx` → `inventory-checkout` (Checkouts tab header); `InventoryDetailTabs.tsx` → `inventory-tags` (QR tab header). Phase FORUMS (1, added FORUMS.1): `app/crew/(app)/forums/manage/page.tsx` → `forums` (manage page heading, SA/OA only). NOTE: `inventory` anchor HelpTooltip on `/crew/inventory` list page header and `/crew/settings/inventory` settings page header were placed in INVENTORY.2 (confirming 2 earlier INVENTORY placements not counted separately above — total correctly reflects all placements). NOTE: `TOOLTIP_ANCHOR_MAP` and all sidebar nav link HelpTooltips for flagged routes were removed in NOTIFY.1 (render block) and NOTIFY.4-CLEANUP (const). HelpTooltips no longer appear on any sidebar nav link. HelpTooltips on page-level headers and content areas (e.g. the Rehearsals list page header, AuditionDetailTabs section headers) are unchanged — those are in separate component files. The sidebar is now a three-part atomic edit for any new flagged nav link: NAV_ITEMS + FLAG_GATED_HREFS + Production allowlist. The fourth location (TOOLTIP_ANCHOR_MAP) no longer exists.

Production sidebar: Help link added (HELP.2b). Media Library link also visible to Production (ADMIN.30 confirmed — Production has `/crew/media` sidebar access). Rehearsals link visible to Production (Phase 21). Auditions link visible to Production (Phase AUDITIONS). HelpContent Auditions section visible to Production role (Phase AUDITIONS — same visibility as Rehearsals). Forums link visible to Production (Phase FORUMS). HelpContent Forums section visible to Production role (forums-overview and forums-threads subsections; forums-access and forums-moderation are SA/OA only).

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
displays 15 section cards using the hide-not-lock
`LinkedCard`-only pattern (ADMIN.49 — no `LockedCard`
fallback; SA/OA only, all other roles see nothing).

| Card | Route | Access |
|---|---|---|
| Announcement Banner | `/crew/settings/announcement` | SA + OA (LinkedCard); all other roles — hidden |
| Hearing Options | `/crew/settings/hearing-options` | SA + OA (LinkedCard); all other roles — hidden |
| Signup Form | `/crew/settings/signup-form` | SA + OA (LinkedCard); all other roles — hidden |
| General Defaults | `/crew/settings/general` | SA + OA (LinkedCard); all other roles — hidden |
| Category Management | `/crew/settings/categories` | SA + OA (LinkedCard); all other roles — hidden |
| User Management | `/crew/settings/users` | SA + OA (LinkedCard, with restrictions — see §7); all other roles — hidden |
| Audit Log | `/crew/settings/audit-log` | SA + OA (LinkedCard); all other roles — hidden |
| Email Activity | `/crew/settings/email-activity` | SA + OA (LinkedCard); all other roles — hidden |
| Document Management | `/crew/settings/documents` | SA + OA (LinkedCard); all other roles — hidden |
| Location Management | `/crew/settings/locations` | SA + OA (LinkedCard); all other roles — hidden |
| Inventory Settings | `/crew/settings/inventory` | SA + OA (LinkedCard); all other roles — hidden |
| User Groups | `/crew/settings/groups` | SA + OA (LinkedCard); all other roles — hidden |
| Style Sandbox | `/crew/settings/style` | SA only (LinkedCard); all other roles — hidden |
| Dashboard Announcements | `/crew/settings/dashboard-announcement` | SA always (LinkedCard); OA when `announcements_oa_enabled = 'true'` (LinkedCard); all other roles — hidden |
| Beta Feedback | `/crew/settings/beta` | SA + OA (LinkedCard); all other roles — hidden |

**New standing rule (ADMIN.49 — hide-not-lock):** Cards for
SA/OA-only destination pages use `{canAccessAdminSettings &&
<LinkedCard .../>}` — no LockedCard fallback. The `LockedCard`
function has been removed from `settings/page.tsx`. All role-gated
hub cards now use the hide-not-lock pattern. Settings hub page itself
is SA/OA only — Editors, Viewers, and Production are redirected to
`/crew/dashboard` before the JSX renders (proxy guard + server-side
redirect).

**Sidebar — Phase SIDEBAR ✓ Complete:**
`components/crew/Sidebar.tsx` was restructured from a
flat `NAV_ITEMS.map()` to a grouped layout. Key changes:

- **Structure:** Dashboard link ungrouped above four
  labeled sections (Events, People, Utilities, Settings).
  Help moved to the Settings group. ThemeToggle moved
  from Sidebar footer to TopBar. Platform Setup moved
  from Sidebar footer to TopBar. Footer block removed.

- **Four groups and their links (in default order):**
  Events: Calendar, Shows, Rehearsals, Auditions.
  People: Volunteers, Forums (unread badge), Messages
  (unread badge), Crew Directory (/crew/users — label
  changed from "Directory" to "Crew Directory"), Opportunities.
  Utilities: Inventory, Forms, QR Generator, Check-In,
  Communication, Media.
  Settings: Beta Testing (`/crew/settings/beta` — flag-gated, first
  in group), Settings (`/crew/settings` — SA/OA only via FLAG_GATED_HREFS),
  Help. Plus conditional Inventory Management link for Editors with
  `inventory_manager = true` (special-case append, not part of orderable nav).
  Beta Testing is additionally hidden from `super_admin` role
  (ADMIN.55) — SA reaches it via the Settings hub. A filter on
  the resolved hrefs array for the settings group removes
  `/crew/settings/beta` when `admin.role === 'super_admin'`,
  applied after `resolveGroupHrefs()` and before `getGroupItems()`
  so self-healing behavior is unaffected.

- **Active state:** `border-l-4` +
  `style={{ borderLeftColor: 'var(--brand-primary)' }}`
  + `bg-brand-primary-light text-brand-primary` +
  `rounded-r` (right-side only). Confirmed R35-safe:
  `bg-brand-primary-light` has existing dark mode
  coverage in globals.css. `dark:hover:bg-white/10`
  for inactive link hover (replaces former
  `dark:hover:bg-dark-surface/50` which was imperceptible).

- **Rendering:** Five module-level constants
  (DASHBOARD_HREF, EVENTS_HREFS, PEOPLE_HREFS,
  UTILITIES_HREFS, SETTINGS_HREFS) define default
  group membership and order. `getGroupItems()` iterates
  the href array and finds matching `visibleNavItems`.
  `renderLink()` local function handles active state,
  badges, and `onClick={close}` for mobile. Group render
  loop is a dynamic `.map()` over `resolvedGroupOrder`
  (from `navOrder?.groupOrder ?? DEFAULT_GROUP_ORDER`).

- **NAVORDER integration:** `navOrder?: SidebarNavOrder`
  prop accepted from `app/crew/(app)/layout.tsx`. When
  present, `navOrder.groupOrder` determines group
  sequence; `navOrder.linkOrder[groupKey]` determines
  per-group link sequence. Falls back to hardcoded
  defaults when absent or when a group key is missing.
  `GROUP_HREF_DEFAULTS` maps each GroupKey to its
  hardcoded fallback array.

- **Three-part atomic edit still applies** for new
  flagged nav links: NAV_ITEMS + FLAG_GATED_HREFS +
  Production allowlist. TOOLTIP_ANCHOR_MAP no longer
  exists.

- **Self-healing group hrefs — `resolveGroupHrefs()` (ADMIN.49):**
  A merge function added to `Sidebar.tsx` that combines a saved per-group
  nav order with the current `GROUP_HREF_DEFAULTS` — appending any hrefs
  present in defaults but absent from the saved array. Prevents future nav
  additions from being silently hidden when an SA has a saved custom nav
  order from before the new link was added. Applied to all groups in the
  `.map()` render loop.

  **NavOrderSection.tsx self-healing merge (ADMIN.60):**
  `parseNavOrder()` in `NavOrderSection.tsx` now applies the
  same self-healing merge as `resolveGroupHrefs()` in
  `Sidebar.tsx`. After parsing the saved `sidebar_nav_order`
  JSON, for each group key, any hrefs in `DEFAULT_LINK_ORDER[group]`
  missing from the saved array are appended. This ensures
  newly added nav links appear in the reorder UI regardless
  of when the SA last saved their nav order — closing the gap
  where the rendered sidebar self-healed (via `resolveGroupHrefs()`)
  but the Platform Setup reorder UI did not.

  **Conditional Inventory Management link (ADMIN.50):** A special-case
  conditional link appended inside the Settings group render block, gated
  on a new `showInventorySettings` prop (added to SidebarProps interface
  and destructured with default `false`). Visible only to Editors with
  `inventory_manager = true`. NOT part of `SETTINGS_HREFS` or
  `DEFAULT_LINK_ORDER` — rendered outside the orderable nav system.
  `showInventorySettings` computed in `layout.tsx` as
  `admin.role === 'editor' && admin.inventory_manager === true` and
  threaded to `<Sidebar>`. `/crew/settings/inventory` → 'Inventory
  Management' added to `HREF_LABELS` in `types/sidebar.ts`.

  **Settings link visibility (ADMIN.50):** `/crew/settings` is hidden
  from Editor, Viewer, and Production roles via `FLAG_GATED_HREFS` (role
  check using `admin` prop already in scope). Production was already
  excluded by the pre-existing allowlist. Only SA and OA see the Settings
  sidebar link.

  **Dual-highlight fix (BETA.1):** `renderLink()` active-state logic
  special-cases `/crew/settings` — the active condition adds
  `&& !pathname.startsWith('/crew/settings/beta')` to prevent the
  Settings link from showing active when visiting the Beta Testing page.
  Identical pattern to the confirmed Shows/Opportunities fix (ADMIN.30).
  Do NOT modify `isActivePath()` itself.

- **Commits:** SIDEBAR.2 (62e6497), SIDEBAR.3 (99c680b),
  SIDEBAR.4 (57ec5fe), SIDEBAR.5 (b9f4c5e).

**TopBar — Phase SIDEBAR ✓ Complete:**
`components/crew/TopBar.tsx` polished and extended:

- **border-neutral-border** replaces `border-divider
  dark:border-dark-border` on the outer wrapper
  (Option A token — consistent with all other borders).

- **ThemeToggle** moved here from Sidebar footer. Renders
  between NotificationPanel and the admin name span.

- **Platform Setup** moved here from Sidebar footer.
  Renders as a bordered `<Link>` to `/crew/settings/setup`
  with `SlidersHorizontal` icon, styled identically to
  Change Password and Sign Out. SA-only guard:
  `{admin.role === 'super_admin' && (...)}`.

- **Change Password** converted from a plain text link
  to a bordered button matching Sign Out. `KeyRound`
  icon at `className="w-4 h-4"`. Navigates to
  `/crew/settings/password` (preserves existing behavior).

- **Admin identity block:** Name and role badge now
  stacked vertically in a `flex flex-col items-end
  gap-0.5` wrapper (`hidden sm:flex`). Name uses
  `font-semibold` with no `max-w` constraint (full name
  displays). Role badge uses `py-0.5` (compact in
  stacked layout). Icon size on Change Password and
  Sign Out: `className="w-4 h-4"` (not `size` prop).

- **Right-side order (left to right):** MessagesIcon
  (conditional on flags.messages), NotificationPanel,
  ThemeToggle, admin identity block (name + role badge),
  Platform Setup (SA-only), Change Password, Sign Out.

- **Icon size standardization (ADMIN.60):** The three primary
  action icons in the TopBar right side are standardized to
  `className="w-5 h-5"` (20px): Mail icon (`MessagesIcon.tsx`),
  Bell icon (`NotificationPanel.tsx`), and Sun/Moon icons
  (`ThemeToggle.tsx`). Previously, Mail and Bell used
  `size={20}` prop and ThemeToggle used `className="w-4 h-4"`
  (16px — smaller and inconsistent). Secondary action buttons
  (Change Password, Sign Out, Platform Setup) retain
  `className="w-4 h-4"`.

- **Commits:** SIDEBAR.3 (99c680b), SIDEBAR.4 (57ec5fe),
  SIDEBAR.6 (2566a92).

**Email Activity (`/crew/settings/email-activity`, built Phase 13.1 — Super Admin only):**
Global log of all emails sent by the platform. Three tabs via `?tab=` URL param:
- All Emails — paginated reverse-chronological log of all `email_log` rows. 25/page, `?page=N`.
- System Only — same log filtered to `sent_by IS NULL` (system-triggered emails only).
- About System Emails — static trigger catalog listing all 16 automated email triggers, when each fires, who receives it, and spam protections in place. Phase AUDITIONS added 4 audition triggers: audition signup confirmation, audition consent form request, audition status notification, audition cancellation. Phase FORUMS added 1 forum trigger: forum notification (`sendForumNotificationEmail()` — fires when a new reply is posted to a thread a user has subscribed to; non-blocking, errors swallowed; uses `sendBatchEmails()` per R8; `sentBy: null` system-triggered).

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

Nine independently-saving sections (each has its own Save button — no "Save All"):

Section 1 — Maintenance Mode (added Phase MM): Four fields: `maintenance_mode` (boolean toggle — `'true'`/`'false'`), `maintenance_heading` (text, max 100 chars), `maintenance_body` (text, max 300 chars), `maintenance_estimated_restoration` (text, max 150 chars, optional — added ADMIN.57). When `maintenance_mode` is `'true'`, all non-Super-Admin roles accessing any `/crew/*` route (except `/crew/login` and `/crew/maintenance`) are redirected to the maintenance page. Super Admin retains full access at all times. Toggle label changes to "⚠ Maintenance Mode — ON" when active. Heading and body control the text displayed on the `/crew/maintenance` page and can be pre-set before activating. Seeded defaults: heading = "System Maintenance", body = "The crew portal is temporarily unavailable while system updates and performance improvements are in progress. Please check back soon." `maintenance_estimated_restoration` displays as an amber highlighted box with "Estimated restoration:" label on `/crew/maintenance` when set; not displayed when empty. A persistent amber banner in the crew layout warns the Super Admin when Maintenance Mode is active (sibling div between TopBar and main, visible only to SA). Saved via `saveMaintenanceMode()` in `lib/actions/setup.ts` — the function now handles all four fields (the upsert loop picks up the 4th key generically — no structural change to the function was needed). `revalidatePath('/crew', 'layout')` ensures the banner propagates immediately on toggle. Migration 039.

**`saveAnnouncement()` (lib/actions/setup.ts — Phase
ANNOUNCE):** SA always allowed; OA allowed only when
`announcements_oa_enabled === 'true'` (checked at
action level). Accepts `dashboard_announcement_body`
(TipTap HTML — sanitized per R31 allowlist before upsert,
matching blast.ts exactly) and `dashboard_announcement_
roles` (JSON array — validated as non-empty). Sets
`dashboard_announcement_updated_at` to
`new Date().toISOString()` server-side (never trust
client timestamp — prevents dismissal state manipulation).
Upserts all three content keys. Revalidates
`/crew/settings/setup`, `/crew/settings/dashboard-
announcement`, `/crew/dashboard`, and `/crew` layout.
`logAction()` with `'announcement.publish'` AuditAction.
Rendered via the standalone `AnnouncementSection`
component embedded in `SetupPanel.tsx` (not one of the
nine numbered sections — see Dashboard Announcements
Widget in this section for full spec).

**`saveSidebarNavOrder()` (lib/actions/setup.ts —
Phase NAVORDER):** SA only. Accepts a `SidebarNavOrder`
object (validated: non-empty `groupOrder` array + valid
`linkOrder` object). Stores as `JSON.stringify(navOrder)`
via `upsertSetting(supabase, 'sidebar_nav_order', json,
admin.id)`. Fetches current value before write for the
audit log before-diff. `revalidatePath('/crew', 'layout')`
propagates the new order to all crew pages immediately.

`NavOrderSection.tsx` (`components/crew/settings/
NavOrderSection.tsx` — 'use client', new Phase NAVORDER):
Standalone component rendered in `SetupPanel.tsx`
immediately before `AnnouncementSection` (both are
non-numbered standalone sub-components). Receives
`initialValues: SetupPanelInitialValues` as prop.
Manages local state: `navOrder: SidebarNavOrder`
initialized by parsing `initialValues.sidebar_nav_order`
(falls back to `DEFAULT_GROUP_ORDER` + `DEFAULT_LINK_ORDER`
when absent or malformed). Two sub-UIs:
(1) Group order — 4 rows with ↑↓ arrow buttons, first
item ↑ disabled, last item ↓ disabled.
(2) Per-group link order — 4 sequential sub-panels (one
per group in current group order), each with link rows
and ↑↓ buttons. Single "Save Order" button + "Reset to
defaults" text link. Save calls `saveSidebarNavOrder()`.
Reset restores `DEFAULT_GROUP_ORDER` + `DEFAULT_LINK_ORDER`
in local state only — does not auto-save. No drag library
(project convention — R6). Type `SidebarNavOrder` and
constants imported from `@/types/sidebar`.

Section 2 — Organization Identity: `org_name`, `org_tagline`, `org_contact_email`, `org_website_url`, `org_location`. Text inputs. Used in email templates, page title (`generateMetadata()`), public landing page heading and footer (via `resolveOrgIdentity()`).

Also in Section 2: `org_timezone` — Organization Timezone select field.
Populated from `TIMEZONE_OPTIONS` in `lib/utils/org-timezone.ts` (~69 entries,
worldwide coverage — Americas, Europe, Africa, Middle East, Asia, Oceania).
Each entry has an IANA timezone string as value and a city/region name as label
(no hardcoded UTC offset — DST handled automatically by `date-fns-tz`).
Setting is Super Admin only (Setup Panel access is already SA-restricted).
Stored in `app_settings` as `org_timezone`. Seeded `'America/Chicago'` in
Migration 038. `saveOrgIdentity()` extended to handle this field with
imperative validation (must match a value in TIMEZONE_OPTIONS), DB upsert,
and `revalidatePath('/', 'layout')` to propagate the new `data-timezone`
body attribute on next page render.

Section 3 — Brand Colors: `brand_primary`, `brand_accent`. Native `<input type="color">` pickers (same pattern as Location Management). Phase THEME complete — brand colors now propagate dynamically across all rendering surfaces: public pages and admin UI via CSS custom properties injected in `app/layout.tsx` (THEME.1/2); email templates via string interpolation at send time using `resolveEmailSettings()` (THEME.3/3b); PDF exports via `createStyles()` factory props (THEME.4). Changing these values in the Setup Panel immediately affects all surfaces on next page render / email send.

Section 4 — Logo: `org_logo_url`. Two input modes: (a) URL input (paste any public image URL), or (b) file upload via BrandImageUploader — P-DC pattern to `brand/logo/` in the `brand` public bucket, crop editor (react-easy-crop, free aspect ratio, PNG output). Whichever was used last wins. Falls back to `${NEXT_PUBLIC_SITE_URL}/logo.png` when unset. Used in email templates (via `resolveEmailSettings()`) and public landing page.

Section 5 — Favicon: `favicon_url`. Same two-mode input as logo but with 1:1 square aspect ratio lock in the crop editor. Stored in `brand/favicon/` in the `brand` public bucket. `generateMetadata()` in `app/layout.tsx` reads this and injects `<link rel="icon">`. Falls back to static `app/favicon.ico` when unset.

Section 6 — Email Configuration: `email_from_address`, `email_from_name`. Editable fields. All Resend sends read these dynamically via `resolveEmailSettings()`. `default_reply_to` displayed read-only with link to General Defaults.

Section 7 — Feature Flags: Ten toggles (nine `FeatureFlags`-typed flags + one non-flag OA authorization toggle), one Save button. Each flag is an `app_settings` key with value `'true'` or `'false'`. All reads via `getFeatureFlags()` in `lib/feature-flags.ts` — never inline. Flag changes trigger `revalidatePath('/crew', 'layout')` + public route paths for immediate sidebar and page propagation. `saveFeatureFlags()` revalidates `/crew/rehearsals`, `/crew/auditions`, `/crew/inventory`, `/crew/forums`, `/crew/messages`, `/crew/users`, and `/crew/settings/beta` alongside existing paths.

**9th toggle — `announcements_oa_enabled` (Phase ANNOUNCE):**
Added to `FeatureFlagsSection` as a 9th toggle, saved
through the same `saveFeatureFlags()` action. Deliberately
NOT wired through `getFeatureFlags()`/`lib/feature-flags.ts`
(R32 exception) — it is an OA authorization toggle for a
single action, not a route-gating feature flag, so it is
read directly at its two call sites instead. This flag's
wiring is six points, not the standard 5-file pattern: (1)
Migration 040 seed, (2) `setup/page.tsx` SETUP_KEYS array +
SetupPanelInitialValues field, (3) `SetupPanel.tsx`
FeatureFlagsSection 9th toggle UI, (4) `saveFeatureFlags()`
upsert in `lib/actions/setup.ts`, (5) `saveAnnouncement()`
reads the flag to gate OA publish authorization, (6)
`app/crew/(app)/settings/dashboard-announcement/page.tsx`
reads the flag to gate OA page access. See §13 pattern note.

**10th toggle — `feature_beta` (Phase BETA):**
Beta Testing (`feature_beta`) — opt-in, defaults to `'false'`
(disabled). Enables the `/crew/settings/beta` page for crew
members to submit feature requests, bug reports, and general
feedback. Unlike `announcements_oa_enabled`, `feature_beta` IS
wired through `getFeatureFlags()`/`lib/feature-flags.ts` as the
9th `FeatureFlags`-typed flag — the standard 5-file pattern
applies (migration seed, `lib/feature-flags.ts`, `SetupPanel.tsx`,
`setup/page.tsx`, `saveFeatureFlags()` route revalidation). Uses
the standard `|| 'false'` opt-in-by-default fallback (matches
`feature_messages`), not `|| 'true'`. `SetupPanelInitialValues`
in `SetupPanel.tsx` gains `feature_beta: string` as part of the
standard 5-file wiring.

| Feature | app_settings key | Default | What disabling blocks |
|---|---|---|---|
| Calendar & Space Management | `feature_calendar` | `'true'` | `/crew/calendar/*`, public `/calendar`, `syncShowDateToCalendar()`, calendar links in emails, .ics links on Call Board |
| Check-In System | `feature_checkin` | `'true'` | `/crew/tools/checkin`, public `/checkin/*`, check-in action guards |
| Email Blast Composer | `feature_blast` | `'true'` | `/crew/communication`, blast action guards |
| Rehearsal Management | `feature_rehearsals` | `''` (enabled by default — `!== 'false'` evaluates truthy) | `/crew/rehearsals/*`, `/rehearsal-checkin/*`, `createRehearsalBatch()` flag guard, Rehearsals sidebar link |
| Audition Management | `feature_auditions` | `''` (enabled by default — `!== 'false'` evaluates truthy) | `/crew/auditions/*`, `/auditions/*`, `/audition-checkin/*`, all audition server action guards, Auditions sidebar link |
| Inventory Management | `feature_inventory` | `''` (enabled by default — `!== 'false'` evaluates truthy) | `/crew/inventory/*`, all inventory server action guards, Inventory sidebar link |
| Internal Forums | `feature_forums` | `''` (enabled by default — `!== 'false'` evaluates truthy) | `/crew/forums/*`, all forum server action guards, Forums sidebar link |
| Private Messaging | `feature_messages` | `'false'` (disabled by default — first
and only flag that defaults to OFF; opt-in only) | `/crew/messages/*`, `/crew/users`,
message server action guards in `lib/actions/messages.ts`, Messages + Directory
sidebar links |
| Beta Testing | `feature_beta` | `'false'` (disabled by default — second opt-in-only flag) | `/crew/settings/beta`, `submitBetaFeedback()`/`completeBetaFeedback()` server action guards, Beta Testing sidebar link |

Note: Standing Opportunities, Volunteer Hours & Milestones, Document Management, and Forms are core features — not feature-flagged. All clients have access to these.

Section 8 — Platform Identity: `instance_label`. Internal deployment label (e.g. "Pelican Playhouse"). Displayed in the Setup Panel page header only — never visible to other roles. Helps Jonathan identify which client's backend he is managing across multiple deployments.

Section 9 — 404 Page (added ADMIN.33): `not_found_heading`, `not_found_body`. Two text fields. Heading max 100 chars, body max 300 chars. Controls the heading and body text shown on `app/not-found.tsx`. Seeded in Migration 028 with defaults: heading = "Page Not Found", body = "We couldn't find what you were looking for." (matches the original hardcoded text exactly — no visible change on deploy). Super Admin only (Setup Panel).

Key files (Phase SETUP):
- `app/crew/(app)/settings/setup/page.tsx` — Server Component, double-guarded, fetches 31 `app_settings` keys (30 SETUP keys + `default_reply_to`)
- `components/crew/settings/SetupPanel.tsx` — Client Component, nine sections
- `components/crew/settings/BrandImageUploader.tsx` — shared upload+crop component (logo + favicon)
- `lib/actions/setup.ts` — twelve server actions: `saveOrgIdentity()`, `saveBrandColors()`, `saveLogoUrl()`, `saveFaviconUrl()`, `saveEmailConfig()`, `saveFeatureFlags()`, `saveInstanceLabel()`, `saveNotFoundPage()`, `saveMaintenanceMode()`, `saveAnnouncement()`, `saveSidebarNavOrder()`, `getSignedBrandUploadUrl()`
- `lib/feature-flags.ts` — `getFeatureFlags()` + `FeatureFlags` type (built SETUP.1)
- `lib/utils/image-crop.ts` — `getCroppedImg()` canvas crop utility (built SETUP.2)
- `lib/utils/org-identity.ts` — `resolveOrgIdentity()` for public Server Components (built ADMIN.31; extended ADMIN.33 to include `org_logo_url`)
- `lib/utils/org-timezone.ts` — TIMEZONE_OPTIONS array (~69 entries, worldwide
  IANA timezone list) + getOrgTimezone(supabase: SupabaseClient): Promise<string>
  helper with 'America/Chicago' fallback. No 'use server'. Used by all server-
  side TZ consumers and as the source for the Setup Panel timezone select.
- `app/layout.tsx` — `generateMetadata()` reads `favicon_url`, `org_name`, and `org_tagline` from `app_settings` (ADMIN.34)

---

**Beta Testing (`/crew/settings/beta` — Phase BETA ✓ Complete):**
Gated behind `feature_beta` flag (R34 compliant — opt-in,
defaults to `'false'`). Crew-only — no public-facing surface.

**Purpose:** Allows crew members (all roles except SA) to submit
feature requests, bug reports, and general feedback via the
Beta Testing page during the Beta period. Super Admin sees a
queue of all submissions (page heading: "Beta Testing Queue");
all other roles see a submission form.

**Schema (Migration 043 — `beta_feedback` table):**
`id` (uuid PK), `submitted_by` (FK → admin_users ON DELETE
CASCADE), `role_snapshot` (text — role at submission time),
`type` (text CHECK `'feature_request'|'bug_report'|'other'`),
`message` (text NOT NULL), `submitted_at` (timestamptz DEFAULT
now()), `completed_at` (timestamptz nullable — soft archive).
RLS: authenticated INSERT (self-scoped); SA-only SELECT; SA-only
UPDATE (for soft archive). No DELETE policy.

**SA queue view:** Pending items only (`completed_at IS NULL`),
oldest-first. Each row: submitter name, role snapshot badge,
type badge, timestamp (formatted via `formatCT` with org timezone),
full message text (`whitespace-pre-wrap`), "Mark Complete" button.
Mark Complete sets `completed_at = now()` via `completeBetaFeedback()`
and removes the row from the queue (soft archive — row preserved in
DB). No notifications triggered on submission or completion.

**Non-SA/OA submission form (`BetaFeedbackForm.tsx` — 'use client'):**
Type selector (segmented button group: Feature Request / Bug Report /
Other), message textarea (max 2000 chars with live character count),
Submit button. On success: inline "Submitted — thank you!" message,
form resets to blank for additional submissions. No `<form>` element
(R13.3a). Error shown inline on failure.

**Server actions (`lib/actions/beta.ts`):**
- `submitBetaFeedback(type, message)` — all authenticated roles;
  validates + inserts; no revalidatePath (submitter sees no queue).
- `completeBetaFeedback(id)` — SA only; sets `completed_at = now()`;
  idempotency guard (`.is('completed_at', null)`);
  `revalidatePath('/crew/settings/beta')`.

**Hub card:** `{canAccessAdminSettings && <LinkedCard .../>}` —
SA/OA only, no LockedCard (consistent with hide-not-lock rule).
No flag import on `settings/page.tsx` — proxy handles redirect
when flag is off.

**Key files:**
- `043_beta_feedback.sql` — migration
- `lib/actions/beta.ts` — server actions
- `app/crew/(app)/settings/beta/page.tsx` — Server Component shell
  (role-branched: SA queue / non-SA form)
- `components/crew/settings/BetaFeedbackForm.tsx` — 'use client'
  submission form

---

**Maintenance Page (`/crew/maintenance` — Phase MM):**
Standalone page outside the `app/crew/(app)/` route
group — renders without the sidebar/topbar crew layout
shell (intentional exception to R20; blocked non-SA
users must not see the full crew UI). Accessible to any
user redirected by the proxy.ts maintenance gate.

- Fetches `maintenance_heading`, `maintenance_body`, and
  `maintenance_estimated_restoration` from `app_settings` via
  `getAdminClient()` (no admin session required).
- Calls `resolveOrgIdentity()` for logo and org name.
- `generateMetadata()` with `robots: { index: false,
  follow: false }` (noindex).
- Light mode only — no dark: classes (public-facing
  page pattern per ADMIN.6).
- Layout: full-screen centered, logo, h1 heading, p body,
  optional amber restoration box (when
  `maintenance_estimated_restoration` is set: amber bordered
  box with 'Estimated restoration:' label + the value, using
  `border-amber-300 bg-amber-50`, light mode only — no
  dark: classes), 'Return to homepage' link → `/`. No crew
  nav links.
- Page location: `app/crew/maintenance/page.tsx` (not
  inside `(app)` route group).
- NOT in `needsFlagCheck`, NOT in crew flag block, NOT
  in Production allowlist — must always be reachable
  regardless of feature flag state.

---

**Style Sandbox (`/crew/settings/style`, Phase STYLE — complete):**
Super Admin only. A design evaluation tool for iterating on
UI aesthetics before any platform-wide rollout. Not a runtime
theming tool — changes here are made in code (globals.css,
layout.tsx) and immediately reflected in the sandbox, then
validated before the rollout phase (STYLE-ROLLOUT, future).

**Access:** Super Admin only. `proxy.ts` exact-match guard
(`pathname === '/crew/settings/style'`) hard-redirects all
non-Super-Admin roles to `/crew/dashboard`. Server-side
double-guard on the page (same pattern as Platform Setup).
No feature flag — this is the first Super Admin-only tool
with no meaningful "off" state for any client (R34 exception,
documented). No sidebar link — reached via Settings hub card
only, same pattern as all other settings sub-pages.

**Settings hub card:** LinkedCard for Super Admin; LockedCard
for all other roles. Note: `LinkedCard` and `LockedCard` are
locally defined in `app/crew/(app)/settings/page.tsx` — they
are not importable from an external path. Any new card added
to the settings hub edits that file directly.

**Section 1 — Primitive Gallery:** Static render of key UI
primitives using the live CSS token system. Changes to
`globals.css` or `app/layout.tsx` are immediately visible.
Eight groups: Buttons (primary/secondary/destructive with
hover:bg-brand-primary-dark demonstration), Form Input
(default/focused/error states), Card, Data Table (with badge
examples), Navigation Item (active/inactive states), Stat
Card (2×2 grid), Badges (role + brand-derived), Token
Reference (all 11 CSS custom properties with color swatches
via inline style={{ background: 'var(--token)' }}).

**Section 2 — Page Mockups:** Fifteen full-fidelity static
reproductions of admin pages using the Option A design
patterns. All data is hardcoded representative values — no
DB queries. Mockups live entirely within the sandbox; zero
production files are touched. Added STYLE.2 through STYLE.8.

Page mockup inventory (17 total):
1. Dashboard — stat tiles with border-t-brand-primary accent,
   activity feed with NEW badge using bg-brand-primary-subtle
2. Calendar — Month view, location color chips inline style,
   static day detail panel, 35-cell hardcoded grid
3. Rehearsals — schedule list (Active/Pending/Cancelled
   status badges)
4. Auditions — audition list (type badges: Timed Slots/Open
   Call; status badges: Published/Draft/Closed/Archived)
5. Inventory — item table with monospace ID pills using
   bg-neutral-surface, condition badges, availability badges,
   Active Checkouts strip using bg-brand-primary-light
6. Volunteers — 8-column dense table with Name cell inline
   badges (SH badge, communication preference badge)
7. Forums — two sections: Forum Index (category headers +
   forum rows with border-l-4 left accent) + Thread List
   (prefix badges, pin/lock indicators, unread state)
8. Shows — season accordion (expanded with brand-primary
   left accent + "Current" badge; collapsed with neutral
   left accent); per-show staffing mini progress bars
9. Opportunities — list with claim-type badges (Interest
   Form/Slot Claim), submission counts in brand-primary
10. Forms — list with status badges (Live/Draft/Closed),
    response counts in brand-primary
11. QR Generator — generator card, 10×10 static QR grid
    (bg-white always — scanability rule, no dark: override),
    3-entry history panel
12. Check-In Dashboard — roster grouped by role, 5 attendance
    status badge variants, animate-pulse live indicator
13. Communication — Compose step (recipient tabs, static
    TipTap toolbar, body) + Confirm step (orange warning
    banner using bg-orange-50, Send button using bg-brand-accent)
14. Media Library — two-panel layout (folder browser left +
    document table right); active folder uses bg-brand-
    primary-light; type and access tier badge system
15. Setup Panel — 3 section cards (Org Identity, Brand Colors,
    Feature Flags) with header/body/footer pattern; color
    swatches via inline style; toggle switch visuals

**Phase SIDEBAR mockups ✓ Complete (SIDEBAR.1):**
Two additional mockups added to Section 2:
16. Sidebar (`SidebarMockup.tsx`) — grouped/sectioned
    navigation with Dashboard ungrouped above four
    groups (Events, People, Utilities, Settings), active
    Dashboard link with border-l-4 left accent +
    bg-brand-primary-light fill + rounded-r, group
    labels in text-xs uppercase tracking-wider,
    unread badge on Forums (3) and Messages (2),
    footer with Help + Platform Setup + ThemeToggle
    placeholder. Named export only, no 'use client'.
    Commit 6571a7b.
17. Top Nav (`TopNavMockup.tsx`) — polished TopBar
    with border-neutral-border (Option A token, replacing
    border-divider), badge-decorated Mail + Bell icons,
    admin name + role badge, visual Sign Out button.
    Named export only, no 'use client'. Commit 6571a7b.

**Option A design patterns (applied throughout mockups):**
These are the intended targets for STYLE-ROLLOUT:
- Page heading zone: `<div className="pb-4 border-b border-neutral-border">` wrapping h1 + subtitle paragraph
- Stat tile top accent: `border-t-2 border-t-brand-primary` (two separate class strings — never combined)
- Data table header: `bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border`
- Table row hover: `hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors` (both native Tailwind — R35 safe)
- Left border accent: `border-l-4` (Tailwind, sets width) + `style={{ borderLeftColor: 'var(--brand-primary)' }}` (CSS custom property, sets color). Never use `border-brand-primary` alongside a full `border` class — it overrides all four border sides.
- Section card pattern (Setup Panel): header/body/footer with `bg-neutral-surface` header + `border-t border-neutral-border` footer + "Save Changes" per section
- Activity feed NEW badge: `bg-brand-primary-subtle text-brand-primary` (hand-authored — R35: no native dark: pairing on same property)
- Staffing progress bars: hardcoded complete class strings for color (`bg-green-500`, `bg-yellow-400`, `bg-red-500`) and width (`w-[87.5%]`, `w-[58.3%]`, `w-0`) — never computed dynamically (Tailwind purge risk)
- Season accordion: expanded state uses `style={{ borderLeftColor: 'var(--brand-primary)' }}`; collapsed state uses `style={{ borderLeftColor: 'var(--color-neutral-border)' }}`

**Named badge export pattern (established STYLE.4):**
All badge helper functions in mockup components are named
exports (not module-private). This prevents
`@typescript-eslint/no-unused-vars` lint warnings for badge
variants not present in the representative data rows —
discovered STYLE.4 F1 and pre-empted in all subsequent
mockup prompts.

**Key files:**
- `proxy.ts` — exact-match guard for `/crew/settings/style`
- `app/crew/(app)/settings/style/page.tsx` — Server Component shell, SA double-guard
- `components/crew/settings/StyleSandbox.tsx` — Client Component, Section 1 + Section 2
- `lib/utils/color.ts` — `darkenHex()` added alongside `lightenHex()` (STYLE.A)
- `app/globals.css` — `--color-neutral-surface` / `--color-neutral-border` in @theme block; new @layer utilities classes for brand-derived tokens
- `app/layout.tsx` — `resolveBrandColors()` extended to inject 9 total custom properties
- Mockup components (17 files):
  `DashboardMockup.tsx`, `CalendarMockup.tsx`, `RehearsalsMockup.tsx`,
  `AuditionsMockup.tsx`, `InventoryMockup.tsx`, `VolunteersMockup.tsx`,
  `ForumsMockup.tsx`, `ShowsMockup.tsx`, `OpportunitiesMockup.tsx`,
  `FormsMockup.tsx`, `QRGeneratorMockup.tsx`, `CheckInMockup.tsx`,
  `CommunicationMockup.tsx`, `MediaLibraryMockup.tsx`, `SetupPanelMockup.tsx`,
  `SidebarMockup.tsx`, `TopNavMockup.tsx`

---

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
show_date (today or future, org-timezone-aware). Below = all other future shows in
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

**Migration 043 status:** Applied — `043_beta_feedback.sql` (Phase BETA.1):
Creates `beta_feedback` table for in-platform feedback collection during
Beta period. Seeds `feature_beta = 'false'` in `app_settings`
(`ON CONFLICT DO NOTHING`).

**Migration 044 status:** Applied —
`044_maintenance_restoration.sql` (ADMIN.57). Seeds one new
`app_settings` key via `INSERT ... ON CONFLICT DO NOTHING`:
- `maintenance_estimated_restoration → ''` — optional free-form
  text (max 150 chars). Displayed on `/crew/maintenance` as an
  amber highlighted box with 'Estimated restoration:' label when
  non-empty. Managed via `saveMaintenanceMode()` in
  `lib/actions/setup.ts`. Migration file location: repo root
  (same as all prior migrations — not `supabase/migrations/`).

**Migration 045 status:** Applied —
`045_show_delete_cascade.sql` (ADMIN.58, commit b075a66).
Two FK changes on the `attendance` table:

- `attendance_show_id_fkey`: changed from `ON DELETE NO ACTION`
  to `ON DELETE CASCADE` (references `shows(id)`)
- `attendance_show_date_id_fkey`: changed from
  `ON DELETE NO ACTION` to `ON DELETE CASCADE`
  (references `show_dates(id)`)

These changes allow shows to be hard-deleted even when
attendance records exist — the attendance rows cascade
automatically. Previously, any show with even one attendance
record would throw a Postgres FK violation on DELETE.
Volunteer hours (stored in `volunteers.total_hours` and
`volunteer_hours_log`) are NOT affected by these cascades —
`volunteer_hours_log.source_id` is a bare UUID with no FK,
so it becomes orphaned but does not error.

Verified via live query: both FKs confirmed `confdeltype = 'c'`
(CASCADE) after apply.

**Next migration:** 046 (none currently planned).
Migration 045 is applied.

**Migration 032 status:** Applied — `032_audition_management.sql` (Phase AUDITIONS).
Created eight new tables (auditions, audition_roles, audition_slots, audition_signups,
audition_signup_notes, audition_materials, audition_assignments, audition_email_templates),
seeded `feature_auditions` in `app_settings`, and ALTERed `calendar_events_event_type_check`
to include `'audition'`. Additional inline schema fixes applied via Supabase MCP after
Migration 032: `audition_signups.phone SET NOT NULL` (AUDITIONS.2a), `email_log.recipient_type`
CHECK updated to include `'audition'` (AUDITIONS.2a), `calendar_events.source_audition_id`
column + partial unique index added (AUDITIONS.1b), `calendar_events_source_check` updated
to include `'audition'` (AUDITIONS.1b), `consent_form_submissions.audition_signup_id` column
+ partial index added (AUDITIONS.1a inline section). NOTE (confirmed via live Supabase query, DOC.59): these five inline fixes were not reflected in the committed `032_audition_management.sql` file — the file on disk creates the eight tables and seeds `feature_auditions` only. All five fixes have since been captured in `033_audition_schema_fixes.sql` (DB-VERIFY.5, commit 0ed3b5d) and applied to the live database. A fresh environment seeded from the repo's migration files now produces an identical schema to production.

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

### forum_user_groups
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
name         text NOT NULL
description  text
sort_order   integer NOT NULL DEFAULT 0
created_by   uuid REFERENCES admin_users(id)
             ON DELETE SET NULL
created_at   timestamptz NOT NULL DEFAULT now()
updated_at   timestamptz NOT NULL DEFAULT now()
-- UNIQUE INDEX: idx_forum_user_groups_name on name
-- INDEX: idx_forum_user_groups_sort_order
-- INDEX: idx_forum_user_groups_created_by
-- Trigger: handle_updated_at() on updated_at
-- RLS: authenticated SELECT; is_super_admin_or_owner_admin()
--   FOR ALL (INSERT/UPDATE/DELETE)
-- Named groups of admin users for forum access grants.
-- Groups have no platform function beyond access grants.
-- Migration 035 (035_forums.sql)
```

### forum_user_group_members
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
group_id      uuid NOT NULL
              REFERENCES forum_user_groups(id)
              ON DELETE CASCADE
admin_user_id uuid NOT NULL
              REFERENCES admin_users(id)
              ON DELETE CASCADE
created_at    timestamptz NOT NULL DEFAULT now()
-- UNIQUE: (group_id, admin_user_id)
-- INDEX: idx_forum_group_members_group_id
-- INDEX: idx_forum_group_members_user_id
-- RLS: authenticated SELECT; is_super_admin_or_owner_admin()
--   FOR ALL
-- Migration 035 (035_forums.sql)
```

### forum_categories
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
name       text NOT NULL
sort_order integer NOT NULL DEFAULT 0
created_by uuid REFERENCES admin_users(id)
           ON DELETE SET NULL
created_at timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_forum_categories_sort_order
-- INDEX: idx_forum_categories_created_by
-- RLS: authenticated SELECT; is_super_admin_or_owner_admin()
--   FOR ALL
-- Organizational headers for forums. Not postable.
-- Migration 035 (035_forums.sql)
```

### forums
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
category_id uuid NOT NULL
            REFERENCES forum_categories(id)
            ON DELETE CASCADE
name        text NOT NULL
description text
sort_order  integer NOT NULL DEFAULT 0
is_archived boolean NOT NULL DEFAULT false
created_by  uuid REFERENCES admin_users(id)
            ON DELETE SET NULL
created_at  timestamptz NOT NULL DEFAULT now()
updated_at  timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_forums_category_id
-- INDEX: idx_forums_sort_order
-- INDEX: idx_forums_created_by
-- Trigger: handle_updated_at() on updated_at
-- RLS: authenticated SELECT (access filtering at
--   data layer — getForumIndexData() in lib/data/forums.ts);
--   is_super_admin_or_owner_admin() FOR ALL
-- Archived forums hidden from index for all roles.
-- Still accessible via direct URL or manage interface.
-- Migration 035 (035_forums.sql)
```

### forum_access_grants
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
forum_id      uuid NOT NULL
              REFERENCES forums(id) ON DELETE CASCADE
grant_type    text NOT NULL
              CHECK (grant_type IN ('role','group','individual'))
role          text CHECK (role IN (
                'super_admin','owner_admin','editor',
                'viewer','production'
              ))
group_id      uuid REFERENCES forum_user_groups(id)
              ON DELETE CASCADE
admin_user_id uuid REFERENCES admin_users(id)
              ON DELETE CASCADE
created_by    uuid REFERENCES admin_users(id)
              ON DELETE SET NULL
created_at    timestamptz NOT NULL DEFAULT now()
-- Exactly one of role/group_id/admin_user_id is non-null
--   per row (enforced at app layer in addForumAccessGrant()).
-- INDEX: idx_forum_access_grants_forum_id
-- INDEX: idx_forum_access_grants_group_id
-- INDEX: idx_forum_access_grants_admin_user_id
-- RLS: authenticated SELECT; is_super_admin_or_owner_admin()
--   FOR ALL
-- SA/OA bypass all grants at data layer (never checked).
-- Migration 035 (035_forums.sql)
```

### forum_moderators
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
forum_id      uuid NOT NULL
              REFERENCES forums(id) ON DELETE CASCADE
admin_user_id uuid NOT NULL
              REFERENCES admin_users(id) ON DELETE CASCADE
assigned_by   uuid REFERENCES admin_users(id)
              ON DELETE SET NULL
created_at    timestamptz NOT NULL DEFAULT now()
-- UNIQUE: (forum_id, admin_user_id)
-- INDEX: idx_forum_moderators_forum_id
-- INDEX: idx_forum_moderators_admin_user_id
-- RLS: authenticated SELECT; is_super_admin_or_owner_admin()
--   FOR ALL
-- Migration 035 (035_forums.sql)
```

### forum_thread_prefixes
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
forum_id   uuid NOT NULL
           REFERENCES forums(id) ON DELETE CASCADE
label      text NOT NULL
sort_order integer NOT NULL DEFAULT 0
created_at timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_forum_thread_prefixes_forum_id
-- RLS: authenticated SELECT; is_super_admin_or_owner_admin()
--   FOR ALL
-- Migration 035 (035_forums.sql)
```

### forum_threads
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
forum_id   uuid NOT NULL
           REFERENCES forums(id) ON DELETE CASCADE
prefix_id  uuid REFERENCES forum_thread_prefixes(id)
           ON DELETE SET NULL
title      text NOT NULL
created_by uuid NOT NULL REFERENCES admin_users(id)
is_pinned  boolean NOT NULL DEFAULT false
is_locked  boolean NOT NULL DEFAULT false
is_deleted boolean NOT NULL DEFAULT false
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_forum_threads_forum_id
-- INDEX: idx_forum_threads_created_by
-- INDEX: idx_forum_threads_prefix_id
-- Compound sort index: idx_forum_threads_sort on
--   (forum_id, is_pinned DESC, updated_at DESC)
-- Trigger: handle_updated_at() on updated_at
-- RLS: authenticated SELECT; authenticated INSERT
--   (anyone with forum access can create threads —
--   access check at app layer); is_super_admin_or_
--   owner_admin() UPDATE; is_super_admin_or_owner_admin()
--   DELETE
-- is_deleted = true: thread hidden (set by moderation).
--   updated_at bumped when a reply is posted to keep
--   the thread at the top of the sorted list.
-- Migration 035 (035_forums.sql)
```

### forum_posts
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
thread_id  uuid NOT NULL
           REFERENCES forum_threads(id) ON DELETE CASCADE
author_id  uuid NOT NULL REFERENCES admin_users(id)
body_html  text NOT NULL
is_deleted boolean NOT NULL DEFAULT false
edited_at  timestamptz
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_forum_posts_thread_id
-- INDEX: idx_forum_posts_author_id
-- Trigger: handle_updated_at() on updated_at
-- RLS: authenticated SELECT; authenticated INSERT;
--   is_super_admin_or_owner_admin() UPDATE;
--   is_super_admin_or_owner_admin() DELETE
-- Soft delete: is_deleted = true sets body_html =
--   '[Post deleted]' (done at app layer in deletePost()).
--   Row preserved for thread structure + reply count.
-- body_html sanitized via FORUM_POST_SANITIZE_OPTIONS
--   (exported from lib/actions/forum-posts.ts) at
--   save time for both createForumPost() and editPost().
-- Migration 035 (035_forums.sql)
```

### forum_post_attachments
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
post_id         uuid NOT NULL
                REFERENCES forum_posts(id) ON DELETE CASCADE
storage_path    text NOT NULL
filename        text NOT NULL
mime_type       text
file_size_bytes bigint
uploaded_by     uuid REFERENCES admin_users(id)
                ON DELETE SET NULL
created_at      timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_forum_post_attachments_post_id
-- INDEX: idx_forum_post_attachments_uploaded_by
-- RLS: authenticated SELECT; authenticated INSERT;
--   is_super_admin_or_owner_admin() DELETE
-- Storage path: forums/[post_id]/[uuid].[ext] in
--   media bucket (moved from forums/temp/[tempKey]/
--   at post creation time via adminClient.storage.move()).
-- Migration 035 (035_forums.sql)
```

### forum_thread_subscriptions
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
thread_id     uuid NOT NULL
              REFERENCES forum_threads(id) ON DELETE CASCADE
admin_user_id uuid NOT NULL
              REFERENCES admin_users(id) ON DELETE CASCADE
created_at    timestamptz NOT NULL DEFAULT now()
-- UNIQUE: (thread_id, admin_user_id)
-- INDEX: idx_forum_thread_subs_thread_id
-- INDEX: idx_forum_thread_subs_user_id
-- RLS: authenticated SELECT; INSERT WITH CHECK
--   (admin_user_id = auth.uid()) — self-scoped; DELETE
--   USING (admin_user_id = auth.uid()) — self-scoped
-- Users manually subscribe; no auto-subscribe on post.
-- Subscriptions trigger sendForumNotificationEmail()
--   on new replies (non-blocking void IIFE in
--   createForumPost() — caller excluded from send).
-- Migration 035 (035_forums.sql)
```

### forum_post_reads
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
post_id       uuid NOT NULL
              REFERENCES forum_posts(id) ON DELETE CASCADE
admin_user_id uuid NOT NULL
              REFERENCES admin_users(id) ON DELETE CASCADE
read_at       timestamptz NOT NULL DEFAULT now()
-- UNIQUE: (post_id, admin_user_id)
-- INDEX: idx_forum_post_reads_post_id
-- INDEX: idx_forum_post_reads_user_id
-- Composite: idx_forum_post_reads_user_post on
--   (admin_user_id, post_id) for unread queries
-- RLS: authenticated SELECT; INSERT WITH CHECK
--   (admin_user_id = auth.uid()) — self-scoped; DELETE
--   USING (admin_user_id = auth.uid()) — self-scoped
-- Batch-upserted (ON CONFLICT DO NOTHING) when a user
--   opens a thread (markThreadRead() in forums.ts).
-- Unread counts computed at render time from absence
--   of rows — no denormalized counter column.
-- Migration 035 (035_forums.sql)
```

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
calendar_editor boolean NOT NULL DEFAULT false
inventory_manager boolean NOT NULL DEFAULT false
announcement_dismissed_at  timestamptz (nullable —
Phase ANNOUNCE, Migration 040)
calendar_subscription_token uuid NOT NULL
DEFAULT gen_random_uuid()
last_login timestamptz
activity_cleared_at timestamptz
created_at timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_admin_users_email
-- NOTE: activity_cleared_at added in Migration 007.
-- Null = never cleared; all feed events treated
-- as new until first clear.
-- NOTE: 'production' added to role CHECK in Migration
-- 017 (CAL.2). Production accounts have calendar-only
-- access — see §7 roles table.
-- NOTE: calendar_editor boolean added in Migration 017
-- (CAL.2). Default false. When true on an editor,
-- viewer, or owner_admin account: direct write access
-- to calendar (events approved immediately). DB CHECK
-- constraint enforces calendar_editor = false on
-- super_admin and production accounts. owner_admin
-- CAN have calendar_editor = true (CHECK constraint
-- updated in Migration 023 / SETUP.0). UI toggle built
-- CAL.6 on /crew/settings/users (Super Admin only) via
-- toggleCalendarEditor() in lib/actions/users.ts.
-- Logged as user.calendar_editor_change in audit_log.
-- NOTE: inventory_manager boolean added in Migration 034
-- (Phase INVENTORY). Default false. When true on an
-- editor account: full write access to inventory
-- (create/edit/deactivate items, manage categories
-- and locations, create checkouts). SA and OA have
-- full inventory write access always. DB CHECK
-- constraint enforces inventory_manager = false on
-- production and viewer accounts. UI toggle managed
-- by SA/OA on /crew/settings/users via
-- toggleInventoryManager() in lib/actions/users.ts.
-- Logged as user.inventory_manager_change in audit_log.
-- NOTE: AuditAction type union lives in lib/audit.ts —
--   NOT types/audit.ts (no such file exists). Confirmed
--   INVENTORY.2 F1. All inventory AuditAction types
--   (inventory_category.*, inventory_location.*,
--   inventory_item.*, inventory_photo.*, inventory_note.*,
--   inventory_checkout.*) are in lib/audit.ts.
-- NOTE: calendar_subscription_token added Migration 021
-- (CAL.7). uuid NOT NULL DEFAULT gen_random_uuid().
-- UNIQUE index idx_admin_users_calendar_token.
-- Used by /api/calendar/feed.ics to authenticate
-- calendar app subscriptions without a session cookie.
-- Rotate via rotateCalendarToken() server action.
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
banner_text  text
-- Nullable. Added Migration 041 (041_qr_banner_text.sql).
-- Admin-supplied text composited below the QR matrix.
-- Stored so the history panel can display it.
-- Distinct from label: label = display identifier;
--   banner_text = text printed on QR output image.
redirect_token uuid
-- Nullable, no DEFAULT. Added Migration 042.
-- App-generated via crypto.randomUUID() before generateQR().
-- NULL on legacy rows (generated before QRANALYTICS).
-- NULL means "analytics not available" for that row.
-- Partial index: idx_qr_codes_redirect_token
--   WHERE redirect_token IS NOT NULL.
target_url   text
-- Nullable. Added Migration 042.
-- The admin's original destination URL.
-- Used by /go/[token] route handler to redirect scanners.
-- The QR image encodes /go/[redirect_token], NOT target_url.
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

### qr_scan_events
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
qr_code_id  uuid NOT NULL
            REFERENCES qr_codes(id) ON DELETE CASCADE
scanned_at  timestamptz NOT NULL DEFAULT now()
user_agent  text  -- nullable; absent on some bots/clients
device_type text  -- nullable; derived from user_agent
browser     text  -- nullable; derived from user_agent
-- device_type values (parsed in route handler):
--   'mobile' | 'tablet' | 'desktop'
-- browser values:
--   'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other'
-- Parsing order matters: Edge before Chrome (both contain
--   "Edg/"); tablet before mobile (Android tablet UA
--   lacks "Mobile").
-- INDEX: idx_qr_scan_events_qr_code_id on (qr_code_id)
-- RLS: qr_scan_events_select_authenticated — SELECT,
--   authenticated, USING (true)
-- RLS: qr_scan_events_delete_sa_oa — DELETE,
--   authenticated, USING (is_super_admin_or_owner_admin())
-- No INSERT policy — the only writer is /go/[token] route
--   handler which uses getAdminClient() (bypasses RLS).
-- INSERT is best-effort (try/catch swallows errors in the
--   route handler — a scan logging failure must never block
--   the redirect).
-- Migration 042 (042_qr_analytics.sql)
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
-- Already present on live table (confirmed NOTIFY.A
-- audit — no Migration 036 addition needed). Used by
-- the ephemeral consent notification: clears when
-- reviewed_at IS NOT NULL (admin has acknowledged the
-- submission). confirmConsentSubmission() sets this.
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
Signups tab Convert to Volunteer action. All types in `lib/audit.ts`, visible in audit log viewer. Phase FORUMS (FORUMS.1–5): 34 new types across 5 prompts. FORUMS.1 (5): `forum_group.create`, `forum_group.update`, `forum_group.delete`, `forum_group_member.add`, `forum_group_member.remove`. FORUMS.2 (19): `forum_category.create`, `forum_category.update`, `forum_category.reorder`, `forum_category.delete`, `forum_forum.create`, `forum_forum.update`, `forum_forum.reorder`, `forum_forum.archive`, `forum_forum.unarchive`, `forum_forum.delete`, `forum_forum.move`, `forum_access_grant.add`, `forum_access_grant.remove`, `forum_moderator.add`, `forum_moderator.remove`, `forum_prefix.create`, `forum_prefix.update`, `forum_prefix.reorder`, `forum_prefix.delete`. FORUMS.4 (2): `forum_post.create`, `forum_post_attachment.upload`. FORUMS.5 (8): `forum_thread.create`, `forum_thread.lock`, `forum_thread.unlock`, `forum_thread.pin`, `forum_thread.unpin`, `forum_thread.move`, `forum_post.edit`, `forum_post.delete`.

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

**`org_timezone` key added in Migration 038 (Phase TZ — TZ.1):**
`org_timezone → 'America/Chicago'`. Configurable via Setup Panel Section 1
(Super Admin only, `TIMEZONE_OPTIONS` select). See §8 Platform Setup Section 1
and the Migration 038 status block above.

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

**Migration 033 status:** Applied — `033_audition_schema_fixes.sql` (DB-VERIFY.5, commit 0ed3b5d). Captures the five inline schema fixes applied via Supabase MCP during Phase AUDITIONS that were missing from the committed `032_audition_management.sql` file: (1) `audition_signups.phone SET NOT NULL`; (2) `calendar_events.source_audition_id` column + partial unique index; (3) `calendar_events_source_check` updated to include `'audition'`; (4) `consent_form_submissions.audition_signup_id` column + partial index; (5) `email_log.recipient_type` CHECK updated to include `'audition'`. All five idempotent (IF EXISTS / IF NOT EXISTS guards). Pre- and post-migration verified via 12 queries (7 pre + 5 post).

**Migration 034 status:** Applied — `034_inventory_management.sql` (INVENTORY.1, commit c367288). Added `inventory_manager boolean NOT NULL DEFAULT false` to `admin_users` (DB CHECK: false on production/viewer). Created 8 inventory tables: `inventory_categories`, `inventory_locations`, `inventory_items`, `inventory_item_locations`, `inventory_photos`, `inventory_notes`, `inventory_checkouts`, `inventory_checkout_items`. Seeded `feature_inventory` in `app_settings`. RLS: authenticated SELECT on all tables; write operations gated on `is_super_admin_or_owner_admin()` OR `(is_editor() AND inventory_manager = true)`. Exception: `inventory_notes` — SELECT restricted to SA/OA/Editor only (Viewer excluded — private notes); append-only (no UPDATE/DELETE policy).

**`feature_inventory` key added in Migration 034 (Phase INVENTORY):**
Seeded via `INSERT INTO app_settings (key, value) VALUES
('feature_inventory', '') ON CONFLICT (key) DO NOTHING`.
Value `''` evaluates as enabled (`!== 'false'`). Added to
`FeatureFlags` type and `getFeatureFlags()` in
`lib/feature-flags.ts`. Setup Panel Section 6 has a sixth
toggle row for this flag. `saveFeatureFlags()` revalidates
`/crew/inventory` alongside existing routes.
Total active SETUP keys: 20. Setup Panel fetches 21 keys
total (20 SETUP keys + default_reply_to).

**`feature_forums` key added in Migration 035 (Phase FORUMS):**
Seeded via `INSERT INTO app_settings (key, value) VALUES
('feature_forums', '') ON CONFLICT (key) DO NOTHING`.
Value `''` evaluates as enabled (`!== 'false'`). Added to
`FeatureFlags` type and `getFeatureFlags()` in
`lib/feature-flags.ts`. Setup Panel Section 6 has a seventh
toggle row for this flag. `saveFeatureFlags()` revalidates
`/crew/forums` alongside existing routes.
Total active SETUP keys: 22. Setup Panel fetches 23 keys
total (22 SETUP keys + default_reply_to).

**`feature_messages` key added in Migration 037 (Phase MESSAGES):**
Seeded via `INSERT INTO app_settings (key, value) VALUES
('feature_messages', 'false') ON CONFLICT (key) DO NOTHING`.
Value `'false'` evaluates as DISABLED (`=== 'false'`). This is the
**first and only feature flag that defaults to OFF** — all prior flags
default to enabled (`''` or `'true'`). Private Messaging is opt-in; enabling
it activates the Messages + Directory sidebar links, proxy.ts guards, and
TopBar MessagesIcon. Added to `FeatureFlags` type and `getFeatureFlags()`
in `lib/feature-flags.ts`. Setup Panel Section 6 has an eighth toggle row
for this flag. `saveFeatureFlags()` revalidates `/crew/messages` and
`/crew/users` alongside existing routes.
Total active SETUP keys: 28 (27 prior +
`announcements_oa_enabled` added Phase ANNOUNCE /
ANNOUNCE.2). `SETUP_KEYS.length = 28`
— `default_reply_to` is already included within the
`SETUP_KEYS` array, not a separate addition (confirmed
ADMIN.46 Task A4). Setup Panel page (`setup/page.tsx`)
fetches 28 keys total.

**`sidebar_nav_order` key added in NAVORDER.1:**
Stores a JSON object defining the SA's preferred sidebar
group order and per-group link order. Shape:
`{ groupOrder: GroupKey[], linkOrder: Record<GroupKey,
string[]> }` where `GroupKey = 'events' | 'people' |
'utilities' | 'settings'`. Absent key (default for all
deployments) = use hardcoded defaults in `Sidebar.tsx`.
Saved via `saveSidebarNavOrder()` in `lib/actions/setup.ts`.
Read in `app/crew/(app)/layout.tsx` — JSON.parse with
try/catch fallback to null. Total active SETUP keys: 29.
Setup Panel page (setup/page.tsx) fetches 29 SETUP keys.

**`feature_beta` key added in Migration 043 (Phase BETA.1):**
Seeded via `INSERT INTO app_settings (key, value) VALUES
('feature_beta', 'false') ON CONFLICT (key) DO NOTHING`.
Value `'false'` evaluates as DISABLED (`=== 'false'`). This is the
**second flag (after `feature_messages`) that defaults to OFF** —
opt-in only. Beta Feedback is opt-in; enabling it activates the
`/crew/settings/beta` page and Beta Feedback sidebar link. Added to
`FeatureFlags` type and `getFeatureFlags()` in `lib/feature-flags.ts`.
Setup Panel Feature Flags section has a 10th toggle row for this flag
(9th `FeatureFlags`-typed flag). `saveFeatureFlags()` revalidates
`/crew/settings/beta` alongside existing routes.
Total active SETUP keys: 31. Setup Panel page (setup/page.tsx)
fetches 31 SETUP keys.

**Migration 035 status:** Applied — `035_forums.sql` (Phase FORUMS, FORUMS.1, commit dde841d). Created 12 new tables: `forum_user_groups`, `forum_user_group_members`, `forum_categories`, `forums`, `forum_access_grants`, `forum_moderators`, `forum_thread_prefixes`, `forum_threads`, `forum_posts`, `forum_post_attachments`, `forum_thread_subscriptions`, `forum_post_reads`. Seeded `feature_forums` in `app_settings`. RLS: authenticated SELECT on all forum tables; write operations gated on `is_super_admin_or_owner_admin()` for management tables; `forum_threads` and `forum_posts` allow authenticated INSERT (any user with forum access can create content — access filtering at data layer, not RLS); `forum_thread_subscriptions` and `forum_post_reads` use self-scoped policies (`admin_user_id = auth.uid()` — confirmed R37 pattern). `handle_updated_at()` triggers on 4 tables (`forum_user_groups`, `forums`, `forum_threads`, `forum_posts`). Compound sort index on `forum_threads (forum_id, is_pinned DESC, updated_at DESC)` for the primary thread list query. No SECURITY DEFINER functions — R28 does not apply.

**Migration 036 status:** Applied — `036_notifications.sql`
(NOTIFY.1, commits 26b2add + c7e8000). Creates the
`notifications` table for persistent in-app notifications:

```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
admin_user_id uuid NOT NULL REFERENCES admin_users(id)
              ON DELETE CASCADE
type          text NOT NULL CHECK (type IN (
                'audition_signup','audition_material',
                'calendar_approved','calendar_changed',
                'calendar_cancelled','forum_reply','direct_message'))
title         text NOT NULL
body          text
href          text NOT NULL
read_at       timestamptz
created_at    timestamptz NOT NULL DEFAULT now()
-- RLS: select_own — SELECT WHERE admin_user_id = auth.uid()
-- RLS: update_own — UPDATE WHERE admin_user_id = auth.uid()
-- INDEX: idx_notifications_user_id on (admin_user_id)
-- INDEX: idx_notifications_unread on (admin_user_id, read_at)
--   WHERE read_at IS NULL (partial — powers badge count query)
-- INDEX: idx_notifications_created_at on (created_at DESC)
-- No hard delete — rows accumulate; read_at IS NULL = unread.
-- INSERT via getAdminClient() in server actions (service role).
-- 'direct_message' type added Migration 037 (ALTER ... DROP CONSTRAINT
--   notifications_type_check / ADD CONSTRAINT with 7th value).
-- Migration 036 (036_notifications.sql)
```

**Migration 037 status:** Applied — `037_private_messaging.sql` (commit 8a86d10).
Four new tables for Phase MESSAGES private messaging system. `direct_message`
added to `notifications_type_check`. `feature_messages` seeded `'false'` in
`app_settings`.

**Migration 038 status:** Applied — `038_org_timezone.sql` (TZ.1):
Seeds `org_timezone = 'America/Chicago'` in `app_settings` via
`INSERT INTO app_settings (key, value) VALUES ('org_timezone', 'America/Chicago')
ON CONFLICT (key) DO NOTHING`. Preserves existing behavior on the 30BN deployment
— no visible change on deploy. Configurable via Setup Panel Section 1 (Super
Admin only). Client-side: read from `document.body.dataset.timezone` (injected
by `resolveLayoutSettings()` in `app/layout.tsx`). Server-side: read via
`getOrgTimezone(supabase)` in `lib/utils/org-timezone.ts`.

**Migration 039 status:** Applied —
`039_maintenance_mode.sql` (Phase MM, MM.1, commit
4196623). Seeds three `app_settings` keys via `INSERT ...
ON CONFLICT DO NOTHING`:
- `maintenance_mode → 'false'` — boolean string toggle;
  `'true'` activates the proxy.ts gate
- `maintenance_heading → 'System Maintenance'` — h1 on
  the `/crew/maintenance` page (max 100 chars)
- `maintenance_body → 'The crew portal is temporarily
  unavailable while system updates and performance
  improvements are in progress. Please check back soon.'`
  — body text on the `/crew/maintenance` page (max 300
  chars)

**Migration 040 status:** Applied —
`040_dashboard_announcements.sql` (Phase ANNOUNCE,
ANNOUNCE.1). Two changes:
1. Added `announcement_dismissed_at timestamptz` to
   `admin_users` (nullable, no default). When NULL: user
   has never dismissed any announcement. When set:
   compared against `dashboard_announcement_updated_at`
   to determine if the announcement is new for this user.
   AdminUser type in `types/admin.ts` extended to include
   `announcement_dismissed_at: string | null`.
   `getAdminUser()` SELECT in `lib/auth.ts` extended to
   include this column.
2. Seeded four new `app_settings` keys via
   `INSERT ... ON CONFLICT DO NOTHING`:
   - `dashboard_announcement_body → ''`
   - `dashboard_announcement_updated_at → ''`
   - `dashboard_announcement_roles → '[]'`
   - `announcements_oa_enabled → 'false'`

**Migration 041 status:** Applied —
`041_qr_banner_text.sql` (Phase QRBANNER, commit
9f5f341). Adds `banner_text text` (nullable, no default)
to `qr_codes`. Stores the admin-supplied banner text
that is composited below the QR matrix in the generated
SVG and PNG output. Distinct from the `label` column —
label is the history panel display identifier; banner_text
is printed on the output image.

**Migration 042 status:** Applied —
`042_qr_analytics.sql` (Phase QRANALYTICS, commits
f2c1a73 + ebbf270 + 9cf08a5).
Adds two columns to `qr_codes`:
- `redirect_token uuid` (nullable, no DEFAULT — app
  generates via `crypto.randomUUID()` before calling
  `generateQR()`; NULL on legacy rows = "analytics not
  available")
- `target_url text` (nullable — the admin's original
  destination URL, stored for the route handler to
  redirect scanners)
Partial index `idx_qr_codes_redirect_token` on
`qr_codes(redirect_token) WHERE redirect_token IS NOT NULL`.
Creates `qr_scan_events` table (see schema below).
Index `idx_qr_scan_events_qr_code_id` on `qr_code_id`.

### message_threads
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
creator_id            uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE
recipient_id          uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE
subject               varchar(150) NOT NULL
created_at            timestamptz NOT NULL DEFAULT now()
last_reply_at         timestamptz NOT NULL DEFAULT now()
creator_archived_at   timestamptz
recipient_archived_at timestamptz
-- INDEX: idx_message_threads_creator_id
-- INDEX: idx_message_threads_recipient_id
-- INDEX: idx_message_threads_last_reply_at (DESC — inbox sort order)
-- RLS: SELECT for creator or recipient (creator_id = auth.uid() OR
--   recipient_id = auth.uid()); INSERT with auth.uid() = creator_id;
--   UPDATE for both participants (archive flags + last_reply_at)
-- No UNIQUE constraint on participant pair — multiple independent threads
--   between the same two users are explicitly allowed (one per subject).
--   Compose always creates a new thread; no de-duplication logic.
-- Column-level immutability (subject, creator_id, recipient_id) enforced
--   at application layer, not RLS.
-- Migration 037 (037_private_messaging.sql)
```

### thread_replies
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
thread_id  uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE
sender_id  uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE
body       text NOT NULL
created_at timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_thread_replies_thread_id_created_at (composite — primary read
--   pattern: all replies for a thread in chronological order)
-- INDEX: idx_thread_replies_sender_id
-- RLS: SELECT via EXISTS on message_threads participant check;
--   INSERT: auth.uid() = sender_id AND participant EXISTS check
--   (both conditions required — participant check prevents unauthorized
--   reply injection by non-participants who know a thread_id);
--   No UPDATE policy (replies immutable once sent);
--   No DELETE policy (thread archive is the user removal path)
-- All replies including the first message are stored here — message_threads
--   holds metadata only.
-- Migration 037 (037_private_messaging.sql)
```

### thread_reads
```sql
thread_id    uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE
user_id      uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE
last_read_at timestamptz NOT NULL DEFAULT now()
-- PRIMARY KEY: (thread_id, user_id)
-- INDEX: idx_thread_reads_user_id — for unread count query (user_id-first
--   lookup without a known thread_id; the composite PK cannot serve this
--   efficiently since thread_id is the leading column)
-- RLS SELECT: BOTH participants can read ALL read records for their shared
--   thread. INTENTIONAL ASYMMETRY — do not change to self-only. Required
--   for read receipts: each participant must see the other's last_read_at
--   to display "Read [time]" in the thread view.
-- RLS INSERT / UPDATE: self-scoped (user_id = auth.uid()). Both policies
--   required because markThreadRead() uses upsert (INSERT ... ON CONFLICT
--   DO UPDATE) — Supabase evaluates both paths.
-- Migration 037 (037_private_messaging.sql)
```

### thread_reply_attachments
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
reply_id     uuid NOT NULL REFERENCES thread_replies(id) ON DELETE CASCADE
file_path    text NOT NULL
file_name    text NOT NULL
file_size    integer NOT NULL
content_type text NOT NULL
created_at   timestamptz NOT NULL DEFAULT now()
-- INDEX: idx_thread_reply_attachments_reply_id
-- RLS SELECT: two-level EXISTS subquery —
--   EXISTS (SELECT 1 FROM thread_replies tr
--     JOIN message_threads mt ON mt.id = tr.thread_id
--     WHERE tr.id = reply_id
--     AND (mt.creator_id = auth.uid() OR mt.recipient_id = auth.uid()))
-- RLS INSERT: reply sender only —
--   EXISTS (SELECT 1 FROM thread_replies
--     WHERE id = reply_id AND sender_id = auth.uid())
-- Storage path (MESSAGES.6): messages/[replyId]/[uuid].[ext] in media bucket.
--   Temp path: messages/temp/[tempKey]/[uuid].[ext] → moved at reply creation
--   via adminClient.storage.from('media').move(). Storage calls use
--   getAdminClient() — storage.objects has no RLS (established dual-client
--   pattern from INVENTORY.3/FORUMS.4).
-- Migration 037 (037_private_messaging.sql)
```

### beta_feedback
```sql
id            uuid        PRIMARY KEY DEFAULT gen_random_uuid()
submitted_by  uuid        NOT NULL REFERENCES admin_users(id)
              ON DELETE CASCADE
role_snapshot text        NOT NULL
type          text        NOT NULL
              CHECK (type IN ('feature_request','bug_report','other'))
message       text        NOT NULL
submitted_at  timestamptz NOT NULL DEFAULT now()
completed_at  timestamptz
-- completed_at NULL = pending (visible in SA queue)
-- completed_at NOT NULL = soft-archived (hidden from queue,
--   preserved in DB for history)
-- INDEX: idx_beta_feedback_submitted_by
-- INDEX: idx_beta_feedback_submitted_at
-- PARTIAL INDEX: idx_beta_feedback_pending ON submitted_at
--   WHERE completed_at IS NULL
-- RLS: authenticated INSERT (submitted_by = auth.uid());
--   SA-only SELECT; SA-only UPDATE (for soft archive)
-- No DELETE policy — rows are never hard-deleted
-- Migration 043 (043_beta_feedback.sql)
```

**5-file pattern for adding a new feature flag (confirmed AUDITIONS.1a F2):**
Every new feature flag requires exactly 5 file changes:
1. Migration SQL — seed the key in `app_settings`
2. `lib/feature-flags.ts` — add to FeatureFlags type + getFeatureFlags() fetch + return object
3. `components/crew/settings/SetupPanel.tsx` — 5th toggle in Section 6
4. `app/crew/(app)/settings/setup/page.tsx` — companion edit for SetupPanelInitialValues type widening
5. `lib/actions/setup.ts` — `saveFeatureFlags()` revalidatePath for the new route
Missing any of the five produces a silent failure (wrong TypeScript types, toggle that doesn't save, stale cache on flag change).

`dashboard_season_id` — orphaned key (ADMIN.59):
Previously added at runtime by `setPinnedSeason()` in
`lib/actions/settings.ts` when a Super Admin pinned a
season on the dashboard. As of ADMIN.59, `SeasonAtAGlance`
no longer reads this key, `SeasonSelector.tsx` is deleted,
and `setPinnedSeason()` is removed. The key may still exist
in the `app_settings` table for deployments where it was
previously written. No code reads or writes it. Harmless
to leave; optional manual cleanup:
`DELETE FROM app_settings WHERE key = 'dashboard_season_id'`.

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

*Phase NOTIFY complete (NOTIFY.A–NOTIFY.4-CLEANUP, 6 prompts). Phase MESSAGES
complete (MESSAGES.A–7, 8 prompts). Phase TZ ✓ Complete (TZ.A through TZ.6, all
prompts shipped). Phase MM ✓ Complete (MM.A audit, MM.1, MM.2 — 3 prompts).
Phase FORUMS-FIX ✓ Complete. Phase FORUMS-UX ✓ Complete. Phase ANNOUNCE ✓
Complete. Phase SHOWDELETE ✓ Complete. Phase SHOWARCHIVE ✓ Complete (new
phase — not in original Beta plan). Phase QRBANNER ✓
Complete. Phase QRANALYTICS ✓ Complete. Phase SIDEBAR
✓ Complete (SIDEBAR.A audit + SIDEBAR.1 mockups +
SIDEBAR.2–6 production rollout, 6 prompts). Phase
NAVORDER ✓ Complete (NAVORDER.A audit + NAVORDER.1).
All planned Beta phases complete. Phase 17 (Launch)
is next.*

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

**30BN-DB-VERIFY.5 / 30BN-033 ✓** Write and apply 033_audition_schema_fixes.sql. 7 pre-migration DB queries confirmed all 5 inline fixes already live (zero deviations). Migration written with full idempotency guards (IF EXISTS / IF NOT EXISTS). Applied via Supabase MCP — success. 5 post-migration verification queries all passed. 1 file. Commit 0ed3b5d.

**30BN-ADMIN.43 ✓** proxy.ts: add missing `!pathname.startsWith('/crew/auditions')` to Production role allowlist (line 135) — immediately after the rehearsals entry. This exception was documented as applied in AUDITIONS.2a but the commit was never made. Discovered as F1 in INVENTORY.A audit. Lint clean. 1 file. Commit b022423.

**30BN-INVENTORY.A ✓** Read-only audit. See Phase INVENTORY section above for full findings.

**30BN-ADMIN.44 ✓** Two files. Fix 1: `app/crew/(app)/settings/setup/page.tsx` — `??` → `||` for all 5 pre-existing feature flag initialValues entries (feature_calendar, feature_checkin, feature_blast, feature_rehearsals, feature_auditions). Confirmed failure: `feature_rehearsals` and `feature_auditions` are seeded with `''` — `'' ?? 'true'` evaluates to `''`, rendering those toggles OFF in the Setup Panel; saving would have disabled both features. `feature_inventory` already used `||` (correct from INVENTORY.1). Fix 2: `lib/actions/auditions.ts` — stale comment above `getUpcomingAuditions()` corrected (removed false claim that `getFeatureFlags()` "cannot be used" in public-route files — DOC.61/62 correction; removed false claim that `getUpcomingAuditions()` follows the same pattern as `syncAuditionToCalendar()`). No logic changes. Lint clean. 2 files. Commit b654083.

**30BN-INVENTORY.1 ✓** See Phase INVENTORY section above for full build summary. 13 files + 2 unplanned. Commit c367288.

**30BN-INVENTORY.2 ✓** See Phase INVENTORY section above for full build summary. 9 files + 2 unplanned. Commit 48bc27a.

**30BN-INVENTORY.3 ✓** See Phase INVENTORY section above for full build summary. Key finding: storage API calls require getAdminClient() regardless of session context (F1 — confirmed via live pg_policy query showing zero RLS on storage.objects). 6 files. Commit bacd937.

**30BN-INVENTORY.4 ✓** See Phase INVENTORY section above for full build summary. Key finding: Supabase JS client cannot alias dual self-joins — two-fetch-plus-TypeScript-join pattern established (enrichCheckouts() helper). 8 files. Commit 35ba6cb.

**30BN-INVENTORY.5 ✓** See Phase INVENTORY section above for full build summary. Phase INVENTORY complete. Key findings: route handler must be .tsx (JSX embedded); HelpContent content written in live file convention not prompt's markup. 6 files. Commit 7f57805.

**30BN-FORUMS.A ✓** Read-only audit. See Phase FORUMS section above for full findings.

**30BN-FORUMS.1 ✓** See Phase FORUMS section above. 15 files. Commit dde841d.

**30BN-FORUMS.2 ✓** See Phase FORUMS section above. 5 files. Commit c1c7328.

**30BN-FORUMS.3 ✓** See Phase FORUMS section above. 7 files. Commit 5c95810.

**30BN-FORUMS.4 ✓** See Phase FORUMS section above. 6 files. Commit b21b3a4.

**30BN-FORUMS.5 ✓** See Phase FORUMS section above. 9 files. Commit e41f66f.

**30BN-DOC.68 ✓** Brief Update v5.2 Part A (§1/§2/§3/§5/§7/§8 — Phase FORUMS complete).

**30BN-DOC.69 ✓** Brief Update v5.2 Part B (§9 forum schema tables + Migration 035 + §11 Phase FORUMS build summary + prompt log — this prompt).

**30BN-FORUMS.5-FIX ✓** 'use server' non-function export fix. FORUM_POST_SANITIZE_OPTIONS extracted to lib/actions/forum-post-sanitize.ts (no 'use server'). forum-posts.ts + forum-moderation.ts import sites updated. Full 'use server' audit: zero other violations. 3 files. Commit 02f4569.

**30BN-DOC.71 ✓** Brief v5.3 + Process v5.1 (FORUMS.5-FIX documented — 'use server' non-function export constraint added to §7/§10/§11/§13 of Process; §11 FORUMS.5 entry + prompt log updated in Brief — this prompt).

**30BN-STYLE.A ✓** Token extension (darkenHex, --brand-primary-dark, --brand-accent-dark, --brand-primary-subtle, --color-neutral-surface, --color-neutral-border). 3 files. Commit 8cf6144.

**30BN-STYLE.1 ✓** Style Sandbox shell + primitive gallery (proxy.ts guard, settings hub card, style/page.tsx shell, StyleSandbox.tsx with 8-group gallery + Section 2 placeholder). 4 files. Commit aea0090.

**30BN-STYLE.2 ✓** Dashboard mockup (6 sections, border-t-brand-primary stat tiles, bg-brand-primary-subtle NEW badges). 2 files. Commit 67d594e.

**30BN-STYLE.3 ✓** Calendar mockup (35-cell Oct 2025 grid, location colors as named constants + inline styles, static day detail panel). 2 files. Commit 5a29b48.

**30BN-STYLE.4 ✓** Rehearsals + Auditions list mockups. Named export badge helper pattern established (STYLE.4 F1). 3 files. Commit 4b2bd69.

**30BN-STYLE.5 ✓** Inventory + Volunteers list mockups. bg-neutral-surface ID pills, 8-column dense table, overflow-x-auto. Named export pattern pre-empted. 3 files. Commit ae5f455.

**30BN-STYLE.6 ✓** Forums + Shows mockups. Left accent via border-l-4 + style={{ borderLeftColor }}. Season accordion card pattern. Hardcoded w-[N%] progress bar widths. 3 files. Commit db3c980.

**30BN-STYLE.7 ✓** Opportunities, Forms, QR Generator, Check-In mockups. 100-cell explicit QR grid. bg-white on QR container (no dark: override). animate-pulse live indicator. 5 files. Commit 19f9714.

**30BN-STYLE.8 ✓** Communication, Media Library, Setup Panel mockups. bg-brand-accent on Send button. Two-panel Media Library. 3 section card pattern. Named export badge pattern pre-empted. 4 files. Commit 2eb1f1c.

**30BN-DOC.72 ✓** Brief v5.4 + Process v5.2 (this prompt)
  30BN-NOTIFY.A ✓ Read-only audit (7 targets). Key findings
               above.
  30BN-NOTIFY.1 ✓ Migration 036 + sidebar/settings cleanup
               + types/notifications.ts. Commits 26b2add +
               c7e8000 (NOTIFY.1-FIX).
  30BN-NOTIFY.2 ✓ Notification infrastructure (lib/utils,
               lib/data, lib/actions) + layout prop
               threading + Sidebar forum badge.
               Commit 6e363d3.
  30BN-NOTIFY.3 ✓ Write-point wiring (6 action files, 7
               calendar call sites, forum archived-filter
               fix, sendForumNotificationEmail() return
               type). Commit 80c7021.
  30BN-NOTIFY.4 ✓ NotificationPanel.tsx + TopBar wiring +
               NOTIFY.3-FIX (email early-return path).
               Commit 7ea1f19.
  30BN-NOTIFY.4-CLEANUP ✓ Lint baseline: TOOLTIP_ANCHOR_MAP
               removed, unused type imports removed, dynamic
               pluralization. Commit 5e7656f.
  30BN-DOC.73  ✓ Brief v5.5 (this prompt)
  30BN-MESSAGES.A ✓ Read-only audit (13 tasks). Key findings
               above. No code.
  30BN-MESSAGES.1 ✓ Migration 037 (4 new tables, direct_message
               added to notifications CHECK, feature_messages
               seeded 'false'). Commit 8a86d10.
  30BN-MESSAGES.2 ✓ Types, data layer, server actions, email
               function. Commit 72deeae.
  30BN-MESSAGES.3 ✓ Feature flag 5-file pattern + proxy.ts +
               MessagesIcon.tsx + Sidebar two three-part atomic
               edits. Commit 924f6e5.
  30BN-MESSAGES.4 ✓ User Directory page + Messages Inbox page
               (three-tab). Commit 4dea6cf.
  30BN-DOC.74  ✓ Brief v5.6 (this prompt)

**30BN-MESSAGES.5 ✓** See Phase MESSAGES section above for full build summary. 5 new files, 1 modified. Commit f99d8cc.

**30BN-MESSAGES.6 ✓** See Phase MESSAGES section above for full build summary. 2 new files, 6 modified. Commit 178698f.

**30BN-MESSAGES.7 ✓** See Phase MESSAGES section above for full build summary. Phase MESSAGES complete. 0 new files, 15 modified. Commit b0ed62b.

**30BN-DOC.75 ✓** Brief v5.7 (this prompt)

30BN-ADMIN.45 ✓ Dead prop audit — 10 component files, 2 dead
props fixed (defaultHours in ShowDetail,
adminRole in InventoryDetailTabs with suppression).
Pre-existing F1 lint breach discovered.
Commit: 671a6d4.
30BN-ADMIN.46 ✓ Q1 implementation (defaultHours display in
ShowDetail Settings tab) + F1 lint baseline
restored (onEmptyChange on DirectMessageComposer,
isComposerEmpty state in ComposeForm +
ReplyComposer). Commit: 796af84.
30BN-TZ.A ✓ Read-only timezone audit. No code. 7 grep passes,
12 file reads, full classification table.
6 unexpected findings (C5#1–C5#6).
30BN-TZ.1 ✓ Foundation: Migration 038, lib/utils/org-timezone
.ts, date.ts timezone param, app/layout.tsx
resolveLayoutSettings() + data-timezone body attr,
Setup Panel Section 1 org_timezone select.
Commit: ce19f45.
30BN-TZ.2 ✓ Server-side business logic sweep (12 files,
absorbed TZ.3). All const CT + fromZonedTime()
call sites. C5#1 inventory bug fixed. Commit:
c166112.
30BN-TZ.4a ✓ Display layer: Server Component pages (15 files
+ 1 companion). All formatCT/formatWallClockCT
pass tz. C5#5 year boundary bug fixed. Commit:
bfae0f6.
30BN-TZ.4b ✓ Display layer: Server actions + lib/ (13 files).
resolveEmailSettings() extended with timezone.
csv.ts + VolunteerListPDF timezone params. Commit:
cff97ab.
30BN-DOC.76 ✓ Brief Update v5.8 (this prompt)
30BN-TZ.5a-AUDIT ✓ Pre-TZ.5b verification grep (no code).
Zero missed fixes. 10th calendar Client
Component confirmed (PublicCalendarGrid).
30BN-TZ.5a ✓ Client Component display layer sweep
(40 files). PostShowReport wire, csv
wire, sub-component threading, C5#5
year-boundary bug. Commit c83b5ae.
30BN-TZ.5b ✓ Calendar subsystem sweep (12 files).
All const CT removed. getAvailableWindows()
+ computeEventPosition() timezone params.
useNowPosition() hook. Commit e06d1c4.
30BN-DOC.78 ✓ Brief Update v5.9 (Phase TZ complete —
this prompt)
30BN-MM.A ✓ Read-only audit (7 files: proxy.ts, setup.ts,
SetupPanel.tsx, setup/page.tsx, layout.tsx, TopBar.tsx,
not-found.tsx). Key findings: SetupPanel 8 independent
sub-components; no literal section numeral text in code;
SaveStatus uses 'saved' not 'success'; settingsMap is Map
instance; ActionResult needs 'error' in result check.
No code. No commit.
30BN-MM.1 ✓ Migration 039 + saveMaintenanceMode() + proxy.ts
gate + /crew/maintenance page + layout banner. 5 files.
Commit 4196623.
30BN-MM.2 ✓ MaintenanceModeSection sub-component in
SetupPanel.tsx. SETUP_KEYS + initialValues extended to 27.
2 files. Commit 769ecdd.
30BN-DOC.80 ✓ Brief v5.9→v6.0 Part A (§1/§7/§8/§9).
30BN-DOC.81 ✓ Brief v6.0 Part B (§11/§13 — this prompt).
30BN-FORUMS-FIX.A  ✓ Audit + inline fix: markThreadRead
                     moved from Server Component render to
                     ThreadViewClient useEffect. 2 files.
                     Commit 29570e0.
30BN-FORUMS-FIX.B  ✓ signed-URL try/catch + error.tsx
                     console.error. 2 files.
                     Commit 6b5e230.
30BN-FORUMS-UX.1   ✓ "Manage Access" label added to
                     ForumManageClient.tsx. 1 file, 1 line.
                     Commit 1651989.
30BN-ANNOUNCE.A    ✓ Read-only audit (9 targets). Key:
                     layout cannot pass data to children;
                     dashboard_announcement_* prefix needed;
                     AdminUser + getAdminUser() both need
                     column. No code. No commit.
30BN-ANNOUNCE.1    ✓ Migration 040 + saveAnnouncement() +
                     dismissAnnouncement() + getActiveAnnouncements()
                     + AdminUser type + getAdminUser() SELECT
                     + AuditAction. 7 files. Commit 23d28f3.
30BN-ANNOUNCE.2    ✓ AnnouncementSection + AnnouncementWidget
                     + AnnouncementWidgetClient + dashboard
                     integration + SetupPanel OA toggle +
                     OA mirror page + settings hub card.
                     10 files. Commit 98a275e.
30BN-SHOWDELETE.A  ✓ Read-only audit. Key: attendance NO
                     ACTION FK requires separate guard;
                     ShowCard is inline in ShowList.tsx;
                     updateShowStatus() guard is broader
                     than canEdit. No code. No commit.
30BN-SHOWDELETE.1  ✓ deleteShow() + show.delete AuditAction
                     + Delete button + AlertDialog in
                     ShowDetail.tsx SettingsTab. 3 files.
                     Commit b4824dc.
30BN-SHOWARCHIVE.A ✓ Read-only audit. Key: no Archive tab
                     needed (status filter already exists);
                     ShowForm.tsx has hardcoded Save buttons
                     ignoring dropdown; ShowCard is inline
                     in ShowList.tsx. No code. No commit.
30BN-SHOWARCHIVE.1 ✓ ShowForm.tsx Save button fix + Archive
                     button on ShowCard + Archived Shows
                     accordion. 2 files. Commit 6557260.
30BN-DOC.83        ✓ Brief v6.0→v6.1 Part A (§1/§7/§8/§9).
30BN-DOC.84        ✓ Brief v6.1 Part B (§11/§13 — this prompt).
30BN-QRBANNER.A    ✓ Read-only audit. Key: PNG generated
                     independently from SVG via
                     QRCode.toBuffer() — switching to
                     @resvg/resvg-js rasterization
                     confirmed as the correct approach.
                     No code. No commit.
30BN-QRBANNER.1    ✓ Migration 041 + @resvg/resvg-js +
                     banner SVG composition + escapeXml()
                     + QRGeneratorForm banner toggle +
                     QRHistoryPanel banner display.
                     7 files. Commit 9f5f341.
30BN-QRANALYTICS.A ✓ Read-only audit. Key: proxy.ts
                     requires no changes; parseUserAgent()
                     manual regex defined; app/documents/
                     [token]/route.ts confirmed as
                     structural template. No code.
                     No commit.
30BN-QRANALYTICS.1 ✓ Migration 042 + app/go/[token]/
                     route.ts + lib/actions/qr.ts redirect
                     URL + lib/data/qr.ts schema extension.
                     4 files. Commit f2c1a73.
30BN-QRANALYTICS.2 ✓ getQRScanStats() + QRHistoryPanel
                     three-state analytics display.
                     3 files. Commit ebbf270.
30BN-QRANALYTICS.2b ✓ Expandable per-scan log:
                     QRScanLogToggle.tsx + events[]
                     in QRAnalyticsSummary. 3 files.
                     Commit 9cf08a5.
30BN-SIDEBAR.A     ✓ Read-only audit (Sidebar.tsx,
                     TopBar.tsx, layout.tsx,
                     StyleSandbox.tsx). Group structure
                     and active state decisions confirmed.
                     No code. No commit.
30BN-SIDEBAR.1     ✓ SidebarMockup.tsx + TopNavMockup.tsx
                     added to Style Sandbox. 3 files.
                     Commit 6571a7b.
30BN-SIDEBAR.2     ✓ Production grouped sidebar rollout.
                     Crew Directory label. Active state
                     redesign. 1 file. Commit 62e6497.
30BN-SIDEBAR.3     ✓ Dark mode hover fix (dark:hover:
                     bg-white/10, 4 locations) +
                     ThemeToggle to TopBar + Change
                     Password bordered button +
                     border-neutral-border on TopBar.
                     2 files. Commit 99c680b.
30BN-SIDEBAR.4     ✓ Platform Setup to TopBar +
                     admin name font-semibold + truncate.
                     2 files. Commit 57ec5fe.
30BN-SIDEBAR.5     ✓ Help into Settings group + footer
                     removed + logo padding reduced.
                     1 file. Commit b9f4c5e.
30BN-SIDEBAR.6     ✓ Admin identity block (name + role
                     badge stacked, full name displays).
                     1 file. Commit 2566a92.
30BN-NAVORDER.A    ✓ Read-only audit (Sidebar.tsx,
                     SetupPanel.tsx, setup/page.tsx,
                     setup.ts, layout.tsx, hearing options
                     pattern). SidebarNavOrder type
                     design confirmed. No code.
                     No commit.
30BN-NAVORDER.1    ✓ types/sidebar.ts + saveSidebarNavOrder()
                     + setup/page.tsx + SetupPanel.tsx +
                     NavOrderSection.tsx + layout.tsx +
                     Sidebar.tsx. 2 new files, 5 modified.
                     Commit d359668.
30BN-DOC.85        ✓ Brief v6.1→v6.2 Part A (§1/§3/§7/
                     §8/§9 — QRBANNER/QRANALYTICS/SIDEBAR/
                     NAVORDER complete, migrations 041+042,
                     qr_scan_events schema, sidebar_nav_
                     order key).
30BN-DOC.86        ✓ Brief v6.2 Part B (§11 — this prompt).
30BN-ADMIN.47      ✓ Carry-forward cleanup — dead adminRole
                     prop removed from InventoryDetailTabs.tsx.
                     2 files. Commit 678d774.
30BN-ADMIN.48      ✓ setup/page.tsx ?? → || R18 sweep
                     (15 expressions). 1 file. Commit 9f614a0.
30BN-BETA.A        ✓ Read-only audit (9 targets). Key
                     findings above. No code. No commit.
30BN-BETA.1        ✓ Migration 043 + lib/actions/beta.ts +
                     settings/beta page + BetaFeedbackForm.tsx
                     + 5-file flag pattern + sidebar entry.
                     4 new files, 8 modified. Commit a9b1026.
30BN-ADMIN.49      ✓ resolveGroupHrefs() self-healing sidebar
                     fix + Settings hub hide-not-lock
                     (14 cards, LockedCard removed). 2 files.
                     Commit pushed.
30BN-ADMIN.50      ✓ Settings access tightening (SA/OA only
                     for hub + audit log) + Inventory Manager
                     conditional sidebar link. 6 files.
                     Commit pushed.
30BN-ADMIN.51      ✓ settings/page.tsx dead variable cleanup
                     post-ADMIN.50. 1 file. Commit f628541.
30BN-DOC.87        ✓ Brief v6.2→v6.3 (ADMIN.47–51 + Phase
                     BETA complete — this prompt).
30BN-ADMIN.52      ✓ SeasonAtAGlance 31-day cap + sort +
                     AnnouncementWidget visual. Commit 97655be.
30BN-ADMIN.53      ✓ Notification panel cleanup + Season at a
                     Glance label fix. Commit a4dc731.
30BN-ADMIN.54      ✓ Notifications cap removed + TipTap
                     click-to-focus fix. Commit 32eeebd.
30BN-ADMIN.55      ✓ Beta Feedback sidebar link hidden from
                     Super Admin. Commit 52a4ae1.
30BN-ADMIN.56      ✓ QR banner ribbon redesign + font fix
                     attempt (Turbopack fail).
30BN-ADMIN.56-FIX  ✓ QR banner font: public/fonts/ bundled
                     Inter, process.cwd() pattern. Commit f8a66b4.
30BN-ADMIN.57      ✓ Maintenance Mode estimated restoration
                     time field. Migration 044.
30BN-DOC.88        ✓ Brief v6.3→v6.4 Part A (§1/§8/§9).
30BN-DOC.89        ✓ Brief v6.4 Part B (§11/§13 — this prompt).

### Phase QRBANNER — QR Code Label Banner ✓ Complete

**QRBANNER.A ✓** — Read-only audit (no code). Five
files audited: `lib/qr.ts` (confirmed `QRCode.toBuffer()`
for PNG generation — independent of SVG; critical finding
driving the @resvg/resvg-js decision), `lib/actions/qr.ts`
(confirmed `generateQRCode(url, label)` signature and
insert structure), `lib/data/qr.ts` (confirmed
`QRHistoryEntry` type and SELECT clause), `QRGeneratorForm
.tsx` (confirmed state management and result flow),
`QRHistoryPanel.tsx` (confirmed row structure and
insertion point for banner_text). Key finding: PNG was
generated independently from SVG via `QRCode.toBuffer()`
— adding a banner to the SVG alone would leave the PNG
bannerless. Decision: switch all PNG generation to
rasterize the final composed SVG via `@resvg/resvg-js`.
No code. No commit.

**QRBANNER.1 ✓** — Implementation. `@resvg/resvg-js`
installed. Migration 041 applied (`banner_text text`
nullable on `qr_codes`). `lib/qr.ts`: `generateQR(url,
bannerText?)` — optional banner param; SVG composition
extends viewBox by `BANNER_HEIGHT_UNITS = 6`, injects
white `<rect>` + `<text>` element (`BANNER_FONT_SIZE =
2.5`, `text-anchor="middle"`, `dominant-baseline=
"middle"`); private `escapeXml()` helper escapes admin-
supplied text before SVG injection; PNG generation
switched from `QRCode.toBuffer()` to `new Resvg(svg,
{ fitTo: { mode: 'width', value: 2000 } }).render()
.asPng()` — SVG and PNG now always visually identical
including banner. `next.config.ts`: `serverExternal
Packages: ["@resvg/resvg-js"]` added (napi-rs native
binary). `lib/actions/qr.ts`: `generateQRCode(url,
label, bannerText?)` — third param added; passes
`bannerText?.trim() || undefined` to `generateQR()`;
inserts `banner_text: bannerText?.trim() || null` to
`qr_codes`. `lib/data/qr.ts`: `banner_text` added to
`QRHistoryEntry` type and SELECT clause. `QRGenerator
Form.tsx`: `bannerEnabled`/`bannerText` state; toggle
clears `bannerText` when disabled; `qrResult` clears
on banner state change; `maxLength={50}` on banner
text input. `QRHistoryPanel.tsx`: conditional `Banner:
{row.banner_text}` line in history row left block.
`label` and `banner_text` are distinct: label = history
display identifier; banner_text = text printed on image.
0 flags. npm run lint: 0/0. tsc: 0 errors. 7 files
modified. Commit 9f5f341.

### Phase QRANALYTICS — QR Code Scan Tracking ✓ Complete

**QRANALYTICS.A ✓** — Read-only audit (no code). Eight
tasks: `proxy.ts` (confirmed no changes needed — /go/
paths pass through untouched, no existing guard
intercepts them, route handler executes without proxy
coverage); `lib/actions/qr.ts` (confirmed live state
after QRBANNER.1); `lib/data/qr.ts` (confirmed
`QRHistoryEntry` type + SELECT after QRBANNER.1);
`QRHistoryPanel.tsx` (confirmed row structure and
analytics insertion point); `app/go/` directory (does
not exist — new); `NEXT_PUBLIC_SITE_URL` usage pattern
(confirmed `process.env.NEXT_PUBLIC_SITE_URL ?? ''`
fallback pattern); `app/documents/[token]/route.ts`
(confirmed structural template for new route handler —
plain `Request` param, `getAdminClient()`, `Response
.redirect()` with 302, params as Promise); live RLS
query on `qr_codes` (confirmed policy naming convention
for `qr_scan_events` RLS). Proposed `parseUserAgent()`
function: Edge before Chrome (both contain "Edg/"),
tablet before mobile (Android tablet lacks "Mobile"),
fallback 'desktop'/'Other'. No code. No commit.

**QRANALYTICS.1 ✓** — Migration + redirect route +
server action updates. Migration 042 applied:
`redirect_token uuid` (nullable, no DEFAULT) +
`target_url text` on `qr_codes`; partial index
`idx_qr_codes_redirect_token WHERE redirect_token IS
NOT NULL`; `qr_scan_events` table (id, qr_code_id FK
CASCADE, scanned_at, user_agent, device_type, browser);
index `idx_qr_scan_events_qr_code_id`; RLS:
`qr_scan_events_select_authenticated` (SELECT, true)
+ `qr_scan_events_delete_sa_oa` (DELETE,
is_super_admin_or_owner_admin()); no INSERT policy
(writer uses getAdminClient()). `app/go/[token]/
route.ts` (new — PUBLIC ROUTE header, `getAdminClient()`
only, plain `Request` param, params as Promise, private
`parseUserAgent()`, best-effort scan insert in try/catch,
`Response.redirect()` to `target_url` or `/not-found`).
`lib/actions/qr.ts`: `crypto.randomUUID()` generates
`redirectToken` before `generateQR()` call; QR encodes
`/go/${redirectToken}`; `redirect_token` + `target_url`
added to insert; `NEXT_PUBLIC_SITE_URL ?? ''` fallback.
`lib/data/qr.ts`: `redirect_token` + `target_url` added
to `QRHistoryEntry` + SELECT. Owner browser verification
PASSED: QR encodes /go/ URL, redirect works, row in
`qr_scan_events` confirmed. 0 flags. 4 files created/
modified. Commit f2c1a73.

**QRANALYTICS.2 ✓** — Analytics display UI.
`lib/data/qr.ts`: `QRScanEvent` type (scannedAt,
deviceType, browser) + `QRAnalyticsSummary` type
(scanCount, lastScannedAt, deviceBreakdown, events[])
+ `getQRScanStats(supabase, qrCodeIds)` — single
`.in('qr_code_id', qrCodeIds)` query with
`.select('qr_code_id, scanned_at, device_type,
browser').order('scanned_at', { ascending: false })`;
in-memory aggregation into `Map<string,
QRAnalyticsSummary>`; empty-array guard (Supabase
errors on `.in('col', [])`). `qr-generator/page.tsx`:
fetches `getQRScanStats()` alongside history; passes
`scanStats` to `QRHistoryPanel`. `QRHistoryPanel.tsx`:
three-state analytics per row — legacy (`redirect_token`
IS NULL) → "Analytics not available"; trackable, zero
scans → "No scans yet"; scans present → compact stats
line (`N scans · Last: MMM d · Mobile X / Desktop Y /
Tablet Z`). Deviation from prompt spec: `formatCT` lives
in `@/lib/utils/date` (not `@/lib/utils/time` as
specified — corrected by Claude Code from live file).
0 flags. 3 files modified. Commit ebbf270.

**QRANALYTICS.2b ✓** — Expandable per-scan log.
`lib/data/qr.ts`: `events: QRScanEvent[]` added to
`QRAnalyticsSummary`; `browser` added to SELECT clause;
`.order('scanned_at', { ascending: false })` added;
events accumulated in aggregation loop. `QRScanLog
Toggle.tsx` (new — 'use client'; `useState` expand/
collapse; reads timezone from `document.body.dataset
.timezone` with SSR guard — NOT prop-drilled from Server
Component, per standing Client Component timezone
pattern; toggle label "Show {n} scan(s)" / "Hide
scans"; per-event rows showing `formatCT(scannedAt,
'MMM d, yyyy h:mm a', timezone)` · device · browser).
`QRHistoryPanel.tsx`: imports `QRScanLogToggle`;
renders after compact stats line inside `scanCount > 0`
branch only; passes only `events` prop (not timezone —
component reads timezone internally). Deviation from
prompt spec: prompt specified prop-drilled `timezone`
on `QRScanLogToggle` — deviated to internal
`document.body.dataset.timezone` read per the
established Client Component timezone invariant.
0 flags. 3 files modified. Commit 9cf08a5.

### Phase SIDEBAR — Grouped Sidebar + Top Nav Style ✓ Complete

**SIDEBAR.A ✓** — Read-only audit (no code). Four
files audited: `Sidebar.tsx` (18 NAV_ITEMS confirmed in
flat list; `isActivePath()` with Shows special case;
active state was `bg-brand-primary text-white`; flat
`.map()` render; FLAG_GATED_HREFS + Production allowlist
confirmed); `TopBar.tsx` (border-divider on outer
wrapper; right-side: MessagesIcon, NotificationPanel,
admin name, role badge, Change Password as plain link,
Sign Out); `app/crew/(app)/layout.tsx` (Promise.all
structure confirmed; Sidebar and TopBar prop lists);
`StyleSandbox.tsx` (Section 2 divider pattern
confirmed; SetupPanelMockup is last entry before
closing div). Proposed four-group structure: Events
(Calendar top, Shows, Rehearsals, Auditions),
People (Volunteers, Forums, Messages, Directory,
Opportunities), Utilities (Inventory, Forms, QR
Generator, Check-In, Communication, Media), Settings
(Settings). Dashboard ungrouped above groups; Help
ungrouped in footer; Communication in Utilities (not
People). F1: active fill — `bg-brand-primary-subtle`
lacks dark mode coverage; decision: use `bg-brand-
primary-light` (confirmed R35-safe with existing dark
coverage). F2: Dashboard ungrouped above groups,
Help outside Settings. No code. No commit.

**SIDEBAR.1 ✓** — Style Sandbox mockups only. Zero
production files touched. `SidebarMockup.tsx` (new —
named export; no 'use client'; grouped sidebar with
Dashboard active, four labeled groups with correct
links, unread badges on Forums/Messages, footer with
Help + Platform Setup with SlidersHorizontal + static
ThemeToggle placeholder). `TopNavMockup.tsx` (new —
named export; no 'use client'; border-neutral-border
outer wrapper, badge-decorated Mail/Bell, admin name +
role badge, visual Sign Out div). `StyleSandbox.tsx`:
both imported and appended after SetupPanelMockup with
standard dividers. All 19 icons verified via live
lucide-react package before use. 3 files. Commit
6571a7b.

**SIDEBAR.2 ✓** — Production grouped sidebar rollout.
`Sidebar.tsx` restructured: five module-level href
constants (EVENTS_HREFS with Calendar top, PEOPLE_HREFS
with Crew Directory label, UTILITIES_HREFS, SETTINGS_HREFS,
DASHBOARD_HREF); `getGroupItems()` unchanged (call sites
resolve dynamic array); `renderLink()` local function
handles active state, badges, `onClick={close}` for all
links; four hardcoded group blocks → single `.map()`
over `resolvedGroupOrder`; Directory label changed from
"Directory" to "Crew Directory"; active state:
`border-l-4` + `style={{ borderLeftColor: 'var(--brand-
primary)' }}` + `bg-brand-primary-light text-brand-
primary` + `rounded-r`; inactive hover: `dark:hover:
bg-dark-surface/50` (fixed SIDEBAR.3). 1 file. Commit
62e6497.

**SIDEBAR.3 ✓** — Dark mode hover fix + TopBar polish.
`Sidebar.tsx`: `dark:hover:bg-dark-surface/50` →
`dark:hover:bg-white/10` in ALL 4 locations (3 named
link locations + mobile X close button found by Claude
Code). `ThemeToggle` removed from Sidebar, imported +
rendered in `TopBar.tsx` (between NotificationPanel and
admin name). Change Password converted from plain link
to bordered button (`KeyRound` icon at `className="w-4
h-4"`). TopBar outer wrapper: `border-divider
dark:border-dark-border` → `border-neutral-border`.
F1 (4 hover locations not 3) and F2 (icon sizing:
`className="w-4 h-4"` not `size={14}`) both correctly
caught and resolved by Claude Code from live file
inspection. 2 files. Commit 99c680b.

**SIDEBAR.4 ✓** — Platform Setup to TopBar + admin
name polish. `Sidebar.tsx`: Platform Setup SA-only
conditional block removed from footer entirely; Settings
icon import retained (still used by /crew/settings
NAV_ITEMS entry). `TopBar.tsx`: `SlidersHorizontal`
added to lucide-react import; Platform Setup added as
SA-only bordered Link to `/crew/settings/setup` (same
className as Change Password, SlidersHorizontal icon
at `className="w-4 h-4"`, positioned immediately left
of Change Password); admin name span: `font-semibold`
+ `max-w-[120px] truncate` added. Prompt spec had
`{ROLE_BADGE_CLASSES[admin.role]}` as literal text in
className string — Claude Code corrected to template
literal. 2 files. Commit 57ec5fe.

**SIDEBAR.5 ✓** — Help into Settings group, remove
footer, reduce logo padding. `Sidebar.tsx`: `/crew/help`
added to `SETTINGS_HREFS`; `helpItem` const removed
(Help now flows through `getGroupItems()` pipeline);
footer block (border-t wrapper + Help link) removed
entirely; logo/org header padding reduced (live value
was `py-6`, not `py-4` as prompt assumed — changed to
`py-3` per the prompt's explicit target). F1: prompt
stated current padding as `py-4` but live file had
`py-6`; Claude Code read the live file and applied the
correct target. 1 file. Commit b9f4c5e.

**SIDEBAR.6 ✓** — TopBar user identity polish.
`TopBar.tsx`: `max-w-[120px] truncate` removed from
admin name; admin name and role badge wrapped together
in `hidden sm:flex flex-col items-end gap-0.5` identity
block; name uses `leading-tight`; role badge `py-1` →
`py-0.5` for compact stacked layout. Prompt spec had
invalid className syntax (`{ROLE_BADGE_CLASSES[...]}` as
literal text) — Claude Code corrected to template
literal. 1 file. Commit 2566a92.

### Phase NAVORDER — Sidebar Nav Order ✓ Complete

**NAVORDER.A ✓** — Read-only audit (no code). Six files
audited: `Sidebar.tsx` (five group href constants,
`getGroupItems()` body, four hardcoded group render
blocks, `SidebarProps` interface, group label strings);
`SetupPanel.tsx` (`SetupPanelInitialValues` type, nine
numbered sections, section card pattern, `SaveFeedback`
and `cardClasses` not importable from SetupPanel —
standalone components must define own equivalents,
`AnnouncementSection` is a non-numbered standalone
trailing element); `setup/page.tsx` (SETUP_KEYS array,
`initialValues` construction with `|| ''` fallback
pattern); `lib/actions/setup.ts` (`upsertSetting()`
signature, `dashboard_announcement_roles` JSON storage
precedent confirmed: `JSON.stringify()` before
`upsertSetting()`); `app/crew/(app)/layout.tsx`
(Promise.all structure, `<Sidebar>` prop list);
hearing options reorder pattern (↑↓ buttons, disabled
state on first/last, whole-array rewrite on save —
single Save button not per-click). Proposed
`SidebarNavOrder` type: `{ groupOrder: GroupKey[],
linkOrder: Record<GroupKey, string[]> }`. No code.
No commit.

**NAVORDER.1 ✓** — Implementation. Seven files.
`types/sidebar.ts` (new): `GroupKey` type union,
`SidebarNavOrder` type, `HREF_LABELS` record (maps
every href to display label — "Crew Directory" for
`/crew/users`), `DEFAULT_GROUP_ORDER`, `DEFAULT_LINK_ORDER`
(matches live `*_HREFS` constants exactly),
`GROUP_LABELS`. `lib/actions/setup.ts`:
`saveSidebarNavOrder()` appended — SA only, validates
shape, fetches before-value for audit, `JSON.stringify()`
→ `upsertSetting()`, `logAction()`, `revalidatePath(
'/crew', 'layout')`. `setup/page.tsx`: `sidebar_nav_order`
added to SETUP_KEYS (now 29); `|| ''` fallback in
initialValues. `SetupPanel.tsx`: `sidebar_nav_order:
string` in `SetupPanelInitialValues`; `<NavOrderSection>`
rendered before `<AnnouncementSection>`. `NavOrderSection
.tsx` (new — 'use client'): `parseNavOrder()` +
`moveItem()` helpers; `useState<SidebarNavOrder>` with
lazy init; group order reorder UI (4 rows, ↑↓); per-group
link reorder (4 sequential sub-panels, ↑↓); single Save
button + Reset to defaults; no `<form>` elements (R13.3a).
`app/crew/(app)/layout.tsx`: 5th Promise.all entry for
`sidebar_nav_order` fetch; JSON.parse with try/catch;
`navOrder={navOrder}` on `<Sidebar>`. `Sidebar.tsx`:
`navOrder?: SidebarNavOrder` prop (two locations —
interface + destructuring, confirmed two-location prop
addition pattern); `GROUP_HREF_DEFAULTS`; `resolvedGroup
Order` + `groupItems` replace four hardcoded derivations;
group render loop → single `.map()` over `resolvedGroup
Order`. F1: prompt spec omitted `await` on `getServer
Client()` — Claude Code corrected from live file.
F2: `cardClasses` includes `p-6` padding — prompt spec
would have doubled padding; Claude Code applied only
structural classes to outer wrapper. 2 new files,
5 modified. Commit d359668.

### Phase STYLE — Style Sandbox & Design Token Extension ✓ Complete

**STYLE.A ✓** — Token extension. `lib/utils/color.ts`:
`darkenHex()` added. `app/layout.tsx`: `resolveBrandColors()`
extended from 6 to 9 injected CSS custom properties
(`--brand-primary-dark`, `--brand-accent-dark`,
`--brand-primary-subtle`). `app/globals.css`: `@theme` block
gains `--color-neutral-surface` + `--color-neutral-border`
(static hex; `--color-` prefix required for Tailwind utility
generation); `@layer utilities` gains classes for the 3 new
brand-derived tokens. Key findings: `resolveBrandColors()`
returns `{ primary, accent }` not destructured locals (F1
pre-commit); `--color-` prefix required in @theme or tokens
are inert (F3 pre-commit); dark variant pattern is
`:where([data-theme="dark"], [data-theme="dark"] *)` not
two-selector form (F4 pre-commit). 3 files. Commit 8cf6144.

**STYLE.1 ✓** — Style Sandbox shell + primitive gallery.
`proxy.ts`: exact-match Super Admin-only guard for
`/crew/settings/style`. `app/crew/(app)/settings/page.tsx`:
Style Sandbox LinkedCard/LockedCard added (no icon —
skip the optional icon approach to match all 12 existing
cards exactly). `app/crew/(app)/settings/style/page.tsx`
(new — Server Component, double-guard). `components/crew/
settings/StyleSandbox.tsx` (new — Client Component, Section
1 primitive gallery with 8 groups, Section 2 placeholder).
Key findings: no sidebar "Settings section" with sub-links
exists — Settings is a flat NAV_ITEMS entry; Style Sandbox
is hub-card-only (F1 — Task C eliminated). No icon prop on
cards (F3 — keeping all cards visually identical). 4 files.
Commit aea0090.

**STYLE.2 ✓** — Dashboard mockup. `components/crew/settings/
DashboardMockup.tsx` (new — 6 sections: page heading, Quick
Stats stat tiles with border-t-brand-primary accent, Season
at a Glance with staffing dots, Pending Milestones,
Pending Hours Review with brand-accent-dark Confirm buttons,
Activity Feed with bg-brand-primary-subtle NEW badges).
`StyleSandbox.tsx`: placeholder replaced with
`<DashboardMockup />`. 2 files. Commit 67d594e.

**STYLE.3 ✓** — Calendar mockup. `components/crew/settings/
CalendarMockup.tsx` (new — Month view: page heading, view
switcher tabs, filter bar, location legend, 35-cell October
2025 grid with hardcoded event placements, static day detail
panel for Oct 14). Location colors as named constants
(MAINSTAGE_COLOR etc.) used in inline style={{ backgroundColor }}
only — never as Tailwind classes. All 35 cells written
explicitly (no .map() over computed data). F1: grid math
inconsistency (2 leading + 31 October + 2 trailing = 35,
not 3 trailing as spec stated — corrected pre-commit). 2
files. Commit 5a29b48.

**STYLE.4 ✓** — Rehearsals + Auditions list mockups.
`RehearsalsMockup.tsx` + `AuditionsMockup.tsx` (new —
both independently written, named export badge helpers
established as the pattern to prevent unused-var lint
warnings). Named export pattern was the STYLE.4 F1
discovery — pre-empted in all subsequent prompts. 3 files.
Commit 4b2bd69.

**STYLE.5 ✓** — Inventory + Volunteers list mockups.
`InventoryMockup.tsx` (item table with monospace ID pills
using bg-neutral-surface + border-neutral-border, condition
badges, availability badges including bg-brand-primary-light
for Checked Out, Active Checkouts strip) + `VolunteersMockup
.tsx` (8-column dense table with Name cell SH + comm pref
badges, category chips, overflow-x-auto wrapper). Named
export badge pattern pre-empted. 3 files. Commit ae5f455.

**STYLE.6 ✓** — Forums + Shows mockups. `ForumsMockup.tsx`
(two sequential sections: Forum Index with category header
bands + forum rows with border-l-4 + style={{ borderLeftColor
}} left accent pattern; Thread List with prefix badges,
pin/lock icons, unread state) + `ShowsMockup.tsx` (season
accordion: expanded with brand-primary left accent via inline
style, collapsed with neutral left accent; per-show cards
with staffing mini progress bars using hardcoded w-[N%] and
color class strings). All verification counts passed. 3
files. Commit db3c980.

**STYLE.7 ✓** — Opportunities, Forms, QR Generator, Check-In
mockups. Four components in one prompt. `QRGeneratorMockup
.tsx`: 10×10 QR grid — all 100 cells written explicitly with
bg-white/bg-gray-900, white container has NO dark: override
(QR scanability rule). `CheckInMockup.tsx`: roster grouped
by role, 5 named attendance status badge variants, animate-
pulse live indicator (RefreshCw icon substituted for
non-existent Refresh — Q1 accepted). 5 files. Commit 19f9714.

**STYLE.8 ✓** — Communication, Media Library, Setup Panel
mockups. `CommunicationMockup.tsx`: Compose step (static
TipTap toolbar, recipient tabs, body) + Confirm step (orange
warning banner via bg-orange-50, Send button via bg-brand-
accent + hover:bg-brand-accent-dark demonstrating new accent-
dark token). `MediaLibraryMockup.tsx`: two-panel layout,
active folder using bg-brand-primary-light (R35: no native
dark: pairing), 7 named-export badge helpers. `SetupPanelMockup
.tsx`: 3 section cards (header/body/footer), color swatches
as inline style divs, 7 feature flag toggle rows — all 3
section "Save Changes" buttons written explicitly (verification
check required exactly 3 occurrences). 4 files. Commit 2eb1f1c.

### Phase NOTIFY — Notification System ✓ Complete

**NOTIFY.A ✓** Read-only audit (no code). Seven targets
audited with exact line numbers. Key findings: `reviewed_at`
already present on `consent_form_submissions` (no Migration
036 column addition needed — the ephemeral consent
notification clears when this field is non-null);
`TopBar.tsx` is 'use client' (82 lines); `layout.tsx` is
a Server Component (82 lines); `Sidebar.tsx` 206 lines —
`TOOLTIP_ANCHOR_MAP` at lines 57–62, HelpTooltip render
block at lines 159–170, Platform Setup card confirmed in
`settings/page.tsx` lines 237–248; `pendingRegistrationCount`
fetched conditionally in layout; `confirmAuditionMaterial
Upload()` missing `audition_id` in its select (NOTIFY.3
fix); `approveBatch()` does not track approved event IDs
(NOTIFY.3 accumulator fix). No code.

**NOTIFY.1 ✓** Migration 036 applied (`036_notifications.sql`
— `notifications` table: 9 columns, 2 self-scoped RLS
policies, 3 indexes including partial unread index).
`types/notifications.ts` created: `NotificationType`,
`NotificationRow`, `EphemeralCounts`, `NotificationCounts`.
`Sidebar.tsx`: Users link removed from NAV_ITEMS; HelpTooltip
render block removed from nav link loop; TOOLTIP_ANCHOR_MAP
render removed (const retained — removed in NOTIFY.4-
CLEANUP); Platform Setup SA-only link added to bottom section
above ThemeToggle; `pendingRegistrationCount` prop removed.
`app/crew/(app)/settings/page.tsx`: Platform Setup LinkedCard/
LockedCard pair removed (13 cards remain after removal).
`app/crew/(app)/layout.tsx`: `pendingRegistrationCount` fetch
block removed, prop removed from Sidebar call. Stray file
`openingprompt` at repo root removed (was untracked — plain
`rm`, not `git rm`). NOTIFY.1-FIX (commit c7e8000):
HelpTooltip comment fix pre-empted a lint warning. 2 commits:
26b2add + c7e8000.

**NOTIFY.2 ✓** `lib/utils/notifications.ts` (no 'use server'):
`createNotification()` helper — accepts supabase client as
parameter, never throws (companion-module pattern, same rule
as FORUMS.5-FIX). `lib/data/notifications.ts` (no 'use
server'): `getForumUnreadCount()`, `getNotificationCounts()`,
`getUserNotifications()` — all role-scoped, all parallel via
Promise.all. `lib/actions/notifications.ts` ('use server'):
exported `getNotificationCounts()`, `getUserNotifications()`,
`markNotificationRead()`, `markAllNotificationsRead()`.
`app/crew/(app)/layout.tsx` extended: notification fetches
in same Promise.all as `resolveOrgIdentity()`; `forumUnread
Count` passed to Sidebar; `notificationCounts` +
`initialNotifications` passed to TopBar. `Sidebar.tsx`:
`forumUnreadCount` prop added; Forums link badge renders
count pill when >0, capped at 99+. `TopBar.tsx`: props
extended to accept `notificationCounts` + `initialNotifications`
(no JSX yet — panel built NOTIFY.4). Q-item: `getAccessibleForumIds()`
duplicated between `lib/data/forums.ts` and
`lib/data/notifications.ts` (private helper, cleanup
deferred — export from forums.ts and import in
notifications.ts). Commit 6e363d3.

**NOTIFY.3 ✓** `lib/data/notifications.ts`:
`getForumUnreadCount()` fixed to filter `is_archived = false`
via forums join (archived forum posts excluded from badge
count). `lib/email.ts`: `sendForumNotificationEmail()`
refactored to return `Promise<{ notifiedUserIds: string[] }>`;
all return paths updated (early-return-with-no-emails path
initially returned `[]` — corrected in NOTIFY.4 as
NOTIFY.3-FIX). `lib/actions/forum-posts.ts`: thread select
extended with `title`; void IIFE extended to call
`createNotification()` per subscriber using returned
`notifiedUserIds`. `lib/actions/auditions.ts`:
`submitAuditionSignup()` void IIFE added (two-path recipient:
`audition_assignments` + `auditions.show_id` →
`show_editors.admin_id` — note: `show_editors` uses `admin_id`
column, not `admin_user_id`); `confirmAuditionMaterialUpload()`
select extended with `audition_id` + void IIFE added.
`lib/actions/calendar.ts`: `resolveCalendarRecipients()`
private (unexported) helper added (handles rehearsal batch
via `rehearsal_schedule_assignments`, show-linked via
`show_dates` → `show_editors.admin_id`, audition-linked via
`audition_assignments` + `auditions.show_id` → `show_editors`);
five write points wired (`approveCalendarEvent`, `approveBatch`
with `approvedEventIds` accumulator, `cancelCalendarEvent`,
`updateCalendarEvent`, `cancelRecurringOccurrence` — all three
'this'/'future'/'all' branches with `.select('id')` added —
7 total call sites). `lib/actions/consent.ts`:
`revalidatePath('/crew', 'layout')` added to
`confirmConsentSubmission()`. Commit 80c7021.

**NOTIFY.4 ✓** NOTIFY.3-FIX bundled: `lib/email.ts`
`sendForumNotificationEmail()` early-return path (subscribers
exist but have no email address) corrected to return
`{ notifiedUserIds }` (populated array) not
`{ notifiedUserIds: [] }` — in-app notifications are
independent of email deliverability. `components/crew/
NotificationPanel.tsx` created ('use client' first line):
bell button with count badge (totalEphemeral +
unreadPersistent, excludes forumUnread which has sidebar
badge), outside-click via useEffect + useRef with cleanup
return, two-section dropdown ("Needs Action" ephemeral rows
+ "Notifications" persistent rows), optimistic mark-read via
startTransition, mark-all-read, `timeAgo()` pure client-safe
helper (no server imports), `getTypeIcon()` helper.
Unread row background: `bg-neutral-surface dark:bg-dark-nav`
(R35-safe — confirmed via globals.css audit that no dark
variant for `bg-brand-primary-light` exists). React 19.2.4
confirmed (native async-startTransition support). `TopBar.tsx`:
`NotificationPanel` imported and rendered as first child of
right-side div. 3 lint warnings from D2 — all pre-existing
carry-forwards (TOOLTIP_ANCHOR_MAP unused, 2 unused type
imports in layout.tsx), not regressions. Commit 7ea1f19.

**NOTIFY.4-CLEANUP ✓** Lint baseline restored (0 errors, 0
warnings). `Sidebar.tsx`: TOOLTIP_ANCHOR_MAP const + comment
removed (6 lines). `layout.tsx`: unused
`import type { NotificationCounts, NotificationRow }` from
`@/types/notifications` removed (types inferred from function
return types). `NotificationPanel.tsx`: three "(s)" string
literals replaced with dynamic pluralization ternaries. npm
run lint: empty output — clean baseline. tsc --noEmit: 0
errors. Commit 5e7656f.

### Phase MESSAGES — Private Messaging System ✓ Complete

**Architecture (confirmed via MESSAGES.A audit + build):**
- All admin roles participate. Backend-only — no volunteer access.
- Gmail-like model: `message_threads` (subject + metadata) + flat
  chronological `thread_replies`. Multiple independent threads between
  the same two users are allowed — no unique pair constraint.
- `message_threads.creator_archived_at` / `recipient_archived_at` nullable
  timestamps — per-participant soft-delete. New reply clears the other
  participant's archived timestamp, resurfacing the thread in their Inbox.
- `thread_reads` SELECT policy is intentionally asymmetric (both participants
  can read each other's `last_read_at` — required for read receipts). Note this
  asymmetry pattern (already documented in §8) — do not duplicate an R-rule for it.
- `getServerClient()` only for all message table operations. `getAdminClient()`
  only inside void IIFEs for `createNotification()`.
- `feature_messages` flag: first opt-in-default flag (seeds as `'false'`).
- Policy naming: unquoted snake_case with table prefix, `TO authenticated`,
  `WITH CHECK` mirrors `USING` on UPDATE (confirmed MESSAGES.1, now R39).

**MESSAGES.A ✓** Read-only audit. 13 tasks covering proxy.ts, crew layout,
TopBar, Sidebar, lib/feature-flags.ts, SetupPanel.tsx, setup/page.tsx,
lib/actions/setup.ts, lib/email.ts, notifications CHECK constraint
(`notifications_type_check`, 6 types confirmed), lib/data/notifications.ts,
lib/utils/notifications.ts, and all 4 context placement files. Key findings:
`createNotification()` param order confirmed as (adminUserId, type, title, href,
body, supabase) — body before supabase, both required positional; SetupPanel.tsx
uses `fd.append()` not hidden inputs (R13.3a pattern); logEmailSent() has no
admin_user_id concept (volunteerId: null workaround confirmed safe);
`thread_reads` SELECT policy designed asymmetric for read receipts; no
openingprompt file found at repo root (already removed — Brief stale note
cleared). No code. Commit none (audit only).

**MESSAGES.1 ✓** Migration 037 written and applied:
4 new tables (`message_threads`, `thread_replies`, `thread_reads`,
`thread_reply_attachments`) with RLS on all four; `direct_message` added to
`notifications_type_check` (ALTER DROP + ADD CONSTRAINT, 6 → 7 values);
`feature_messages` seeded `'false'`. Policy names follow Migration 036
convention (unquoted snake_case + table prefix + `TO authenticated` +
`WITH CHECK` on UPDATE policies). 5 verification queries all passed.
1 file. Commit 8a86d10.

**MESSAGES.2 ✓** Backend layer built. `types/messages.ts` (7 types).
`lib/data/messages.ts` (import 'server-only', no 'use server', supabase client
as first param, all try/catch, 6 exported functions + `stripHtmlForPreview()`
internal). `lib/actions/messages.ts` ('use server', 5 exported async functions:
`createThread()`, `createReply()`, `markThreadRead()`, `archiveThread()`,
`searchUsers()`). `sendDirectMessageEmail()` added to `lib/email.ts` as final
function. Self-caught additions: `'direct_message'` added to NotificationType
union (required for TypeScript — createNotification() calls in createThread/Reply
would not compile otherwise); `messageUnread` added to `EMPTY_COUNTS` fallback
literal in `lib/actions/notifications.ts` (NotificationCounts field cascade);
`'direct_message'` case added to exhaustive switch in
`NotificationPanel.tsx` (Mail icon — non-behavioral TypeScript fix). 3 new
files, 7 modified (including 2 cascade fixes outside planned scope).
Commit 72deeae.

**MESSAGES.3 ✓** Feature flag 5-file pattern complete + proxy.ts + TopBar
+ Sidebar. `components/crew/MessagesIcon.tsx` (new — 'use client', Mail icon,
badge, link to /crew/messages). `lib/feature-flags.ts`: messages: boolean
(required, 8th flag). `SetupPanel.tsx`: feature_messages type widening,
messagesEnabled state, Private Messaging ToggleRow in Section 6, `fd.append()`
call in handleSave(). `setup/page.tsx`: 'feature_messages' in SETUP_KEYS,
fallback `|| 'false'`. `lib/actions/setup.ts` saveFeatureFlags(): messages
extraction, validation, keys array, upsert row, two new revalidatePaths.
`proxy.ts`: /crew/messages + /crew/users added to needsFlagCheck, two new
guard blocks (no matcher change — /crew/:path* already covers all /crew/*).
`TopBar.tsx`: messagesEnabled?: boolean prop, MessagesIcon renders before
NotificationPanel when messagesEnabled. `Sidebar.tsx`: two three-part atomic
edits (Messages: Inbox icon, NAV_ITEMS, FLAG_GATED_HREFS, allowlist, badge;
Directory: UserSearch icon, NAV_ITEMS, FLAG_GATED_HREFS, allowlist);
messagesUnreadCount?: number prop + destructured default = 0. `layout.tsx`:
messagesEnabled={flags.messages} on TopBar, messagesUnreadCount={notificationCounts.messageUnread}
on Sidebar. Self-caught: Sidebar destructuring default = 0 required alongside
prop type (TS2304 ×3). F1: SetupPanel uses fd.append() not hidden inputs (adapted
correctly). F2: Production allowlist trailing-|| style followed. 1 new file,
8 modified. Commit 924f6e5.

**MESSAGES.4 ✓** User Directory page + Messages Inbox page.
`app/crew/(app)/users/page.tsx` (Server Component; auth + flags.messages guard;
self-exclusion filter; getUsersForDirectory(); initials avatar; "Message" link
to /crew/messages/compose?to=[id]; Option A heading zone). `app/crew/(app)/messages/page.tsx`
(Server Component; three-tab URL-driven inbox via searchParams; activeTab
validation; three-way fetch; TABS array const-asserted; unread dot always
rendered bg-brand-primary/bg-transparent; Thread Link and archive form siblings;
archiveThread.bind(null, thread.id) per thread; empty states all three tabs;
formatCT 2 args). F1: Style Sandbox text colors (text-gray-900/text-gray-400)
are sandbox-only; live convention (text-dark/text-mid-gray) used instead for
production pages. F2: archiveThread.bind() required `as unknown as (formData:
FormData) => Promise<void>` (now R40 — route through unknown for non-void Server
Actions on form actions). 2 new files, 0 modified. Commit 4dea6cf.

**MESSAGES.5 ✓** Sanitize-at-write-time added to
`lib/actions/messages.ts` (`DM_SANITIZE_OPTIONS`; body sanitized in both
`createThread()` and `createReply()` before `thread_replies` insert). Compose
page (`/crew/messages/compose`): Server Component shell + `ComposeForm.tsx`
('use client'; recipient search with 300ms debounce via `useRef` +
`setTimeout`; subject input maxLength 150; TipTap body; `createThread()`
submit; `router.push()` to new thread on success; self-exclusion via
`.neq('id', admin.id)` server-side). Thread view (`/crew/messages/[threadId]`):
Server Component shell + `ThreadView.tsx` ('use client'; two separate
`useEffect`s — `void markThreadRead()` fires once on mount, `setInterval(
() => router.refresh(), 15000)` fires with 15s polling; `clearInterval`
cleanup; read receipt computed as `showReadReceipt` outside JSX map;
arbitrary CSS variant selectors for TipTap HTML display — `@tailwindcss/
typography` not installed). Style Sandbox text tokens (`text-gray-900
dark:text-white`) confirmed not suitable for production pages — live
convention (`text-dark dark:text-dark-text`) used throughout. 5 new files,
1 modified. Commit f99d8cc.

**MESSAGES.6 ✓** File attachment pipeline. `types/messages.ts`: `AttachmentInput`
(4 fields) + `ThreadReplyAttachmentWithUrl` (6 fields) added;
`ThreadReplyWithDetails.attachments` field added. `lib/data/messages.ts`:
`getThreadData()` extended — fetches `thread_reply_attachments` for all
replies, generates signed download URLs via `getAdminClient().storage.
createSignedUrl()` (TTL 3600s), non-fatal try/catch. `lib/actions/messages.ts`:
`createThread()` and `createReply()` accept optional `attachments?:
AttachmentInput[]`; loop: `storage.list()` → `storage.move()` →
`thread_reply_attachments.insert()` per attachment; per-iteration
try/catch with `continue`. `app/api/messages/upload/route.ts` (new —
GET handler; auth + flag + 10MB guard; `createSignedUploadUrl()`;
returns `{ signedUrl, path, tempKey }`). `DirectMessageComposer.tsx` (new —
8th sanctioned XHR file; `forwardRef` + `useImperativeHandle`; 4-method
`DirectMessageComposerHandle` ref type; FormData: `cacheControl: '3600'`
+ file under `''` field name). `ComposeForm.tsx` + `ReplyComposer.tsx`
refactored off inline TipTap onto `composerRef` — all TipTap imports
removed from both parents. `ThreadView.tsx`: attachment list after reply
body (Paperclip icon, signed URL links, KB size). Prompt authoring errors
caught pre-build: reduce generic missing `<`, malformed `<a>` tag in
JSX spec — both fixed before code was written. 2 new files, 6 modified.
Commit 178698f.

**MESSAGES.7 ✓** Context placements + minor fixes. Forum: `ThreadViewClient.tsx`
— Message link after author block, guarded by `messagesEnabled && !post.is_deleted
&& post.author_id !== data.adminId`; parent thread page passes
`messagesEnabled={flags.messages}`. Rehearsal: `adminId` threaded from
`RehearsalDetailTabs` → `RosterTab` (was not passed before); Message link
before Remove, guarded by `a.adminUserId !== adminId`. Audition: pre-existing
latent bug fixed — `adminId` declared in type but never destructured; fixed
destructuring; both `adminId` + `messagesEnabled` threaded into `SettingsTab`.
ShowDetail: same latent bug fixed; Message link uses `editor.admin_id` (NOT
`admin_user_id` — standing schema rule); both threaded into `SettingsTab`.
`shows/[id]/page.tsx` was the only parent lacking `getFeatureFlags` entirely —
added import + fetch. `UsersTable.tsx`: `messagesEnabled` added to interface;
`UserRow` guards with existing `isSelf` boolean (not a fresh `user.id !==
currentAdminId` comparison). `settings/users/page.tsx`: same `getFeatureFlags`
addition. Minor fixes: `feature_messages` added to `saveFeatureFlags()`
`logAction()` before/after diff (`lib/actions/setup.ts`); year-aware
`formatCT` on thread list timestamp; unused `contentType` variable removed
from upload route (MESSAGES.6 Q1); `myLastReadAt` prop removed from
ThreadViewProps interface + page prop pass (MESSAGES.5 Q2). 0 new files,
15 modified. Commit b0ed62b.
Phase MESSAGES — Private Messaging System ✓ Complete (MESSAGES.A–7)

### Phase TZ — Configurable Organization Timezone ✓ Complete

**TZ.A ✓** — Read-only audit. No code. Complete timezone inventory across
entire codebase via 7 grep passes + 12 targeted file reads. Identified:
~2 TZ.1 foundation files, ~11 TZ.2 server-side business logic files, ~30 TZ.4
display layer server files, ~47 TZ.5 display layer client files. Six unexpected
findings (C5#1–C5#6): C5#1 — inventory overdue bug (new Date().toISOString()
compared against bare date column, wrong for ~5–6 UTC evening hours daily);
C5#2 — resolveOrgIdentity() in crew layout cannot reach Server Component pages
beneath it (Next.js layout constraint — independent getOrgTimezone() calls
required per page); C5#3 — 9 calendar Client Components with their own
local const CT bypassing lib/utils/date.ts entirely; C5#4 — partial exemptions
in calendar-availability.ts (getAvailableWindows is timezone-sensitive) and
calendar-layout.ts (computeEventPosition is timezone-sensitive); C5#5 —
messages/page.tsx year-boundary bug (UTC year vs org-timezone year); C5#6 —
auditions.ts inline literal inconsistency. No code. Commit: none (audit only).

**TZ.1 ✓** — Foundation. Migration 038 (org_timezone seeded 'America/Chicago').
`lib/utils/org-timezone.ts` (new): `TIMEZONE_OPTIONS` (~69 IANA entries,
worldwide) + `getOrgTimezone(supabase)` helper. `lib/utils/date.ts`: optional
`timezone?: string` parameter (last position, default 'America/Chicago') added
to `formatCT()` and `formatWallClockCT()`; module-level `const CT` removed —
all 165 existing call sites continue to work unchanged (default preserves CT).
`app/layout.tsx`: `resolveBrandColors()` renamed to `resolveLayoutSettings()`,
extended to fetch `org_timezone` and inject `data-timezone={brand.timezone}` on
`<body>` (first server-rendered `data-*` attribute — client components read via
`document.body.dataset.timezone || 'America/Chicago'`). Setup Panel Section 1:
`org_timezone` `<select>` field + `fd.append()` + `saveOrgIdentity()` extended +
`setup/page.tsx` SETUP_KEYS 23→24. Commit: ce19f45.

**TZ.2 ✓** — Server-side business logic sweep (12 files, absorbed former TZ.3
iCal scope). All `const CT` declarations and `fromZonedTime()`/`formatInTimeZone()`
call sites in server actions and route handlers replaced with `getOrgTimezone(supabase)`.
Key complexities: `calendar.ts` — `buildEventTimes()` private helper gained
`timezone: string` parameter, threaded through 9 call sites in 7 exported
functions, 3 callers needed client construction reordering before first use;
`audit-log/page.tsx` — `applyAuditFilters()` gained `timezone` parameter,
stale CDT offset comment removed. C5#1 inventory overdue bug fixed in
`inventory.ts` and `inventory-checkouts.ts` (replaced UTC date slice with
`formatInTimeZone(new Date(), tz, 'yyyy-MM-dd')`). `auditions.ts` line 748
inline literal normalized. `claim.ics/route.ts` CT replaced. `lib/utils/ical.ts`
confirmed entirely EXEMPT (uses UTC Z-suffix instants — no timezone coupling).
Recurring pattern documented: client-before-usage reordering needed in multiple
files where the Supabase client was constructed lazily. Commit: c166112.

**TZ.4a ✓** — Display layer sweep: Server Component pages (15 files + 1
companion edit). All `formatCT()`/`formatWallClockCT()` call sites in Server
Component page files now pass `tz` as final argument. Nested Server Component
helpers that receive formatted data received `timezone: string` prop:
`SeasonAtAGlance.tsx` (from dashboard page), `QRHistoryPanel.tsx` (+ companion
edit to `qr-generator/page.tsx`), `CallHistoryTable.tsx` (from volunteers/[id]
page), `PostShowReport.tsx` (optional `timezone?: string` with 'America/Chicago'
default — parent `ShowDetail.tsx` is a Client Component, will be wired in
TZ.5a). Same-file helpers (`ShowCard` in callboard, `dateRangeLabel`/
`UpcomingAuditionsCard` in shows) received `timezone` parameter threading.
C5#5 year-boundary bug fixed in `messages/page.tsx`: both sides of year
comparison now use `getYear(toZonedTime(..., tz))`. `audit-log/page.tsx`: PASS
(no display-layer formatCT calls — TZ.2 was the only CT usage in this file).
`email-activity/page.tsx`: supabase client was block-scoped inside conditional;
hoisted `let tz = 'America/Chicago'` outer declaration, consistent with file's
own pattern for similar conditionally-scoped values. Commit: bfae0f6.

**TZ.4b ✓** — Display layer sweep: Server actions + lib/ utilities (13 files).
`resolveEmailSettings()` extended: fetches `org_timezone` from `app_settings`,
returns `timezone: string` in its result object — zero additional DB cost
(extends existing query). All send functions that call `resolveEmailSettings()`
destructure `timezone` and pass it into `formatCT()`/`formatWallClockCT()`
calls. `lib/data/checkin.ts` `getCheckInDashboardData()` gained required
`timezone: string` parameter; companion edit to `tools/checkin/page.tsx`.
`lib/utils/csv.ts` `buildVolunteersCsv()` + `csvExportFilename()` gained
optional `timezone: string = 'America/Chicago'` parameter (Client Component
callers `ExportAllButton.tsx` + `VolunteersTable.tsx` deferred to TZ.5a).
`lib/volunteers/VolunteerListPDF.tsx`: `timezone: string` prop added; companion
edit to `export/route.tsx` extends inline `app_settings` fetch to include
`org_timezone` and passes `timezone={tz}` as prop. Cron routes: trivial (tz
already resolved from TZ.2 — only `formatWallClockCT()` calls needed `, tz`
appended). Commit: cff97ab.

**TZ.5a-AUDIT ✓** — Pre-TZ.5b read-only verification grep. Confirmed zero
missed fixes across all prior TZ sweeps (TZ.2, TZ.4a, TZ.4b, TZ.5a). Full
grep: 67 total hits — 55 confirmed CORRECT SURVIVORS (SSR-guard fallback
reads, function default parameters, server-side fallbacks), 12 TZ.5b TARGET
hits across 12 files, 0 MISSED FIX. Key finding: `components/calendar/
PublicCalendarGrid.tsx` is a 10th calendar Client Component with its own
`const CT` — not counted in TZ.A's original "9 calendar Client Components"
(C5#3) because it lives in `components/calendar/` (public `/calendar` route)
not `components/crew/calendar/` (admin). Included in TZ.5b scope by explicit
owner decision. No code. No commit.

**TZ.5a ✓** — Display layer sweep: Client Components using
`formatCT()`/`formatWallClockCT()` (40 files, commit c83b5ae). All call
sites in Client Components now pass `tz` read from `document.body.dataset.timezone
|| 'America/Chicago'` with required SSR guard. Three deferred carry-forwards
resolved: `ShowDetail.tsx` passes `timezone={tz}` to `<PostShowReport>`;
`ExportAllButton.tsx` and `VolunteersTable.tsx` pass `tz` into
`buildVolunteersCsv()` and `csvExportFilename()`. Sub-component threading
applied in `AuditionDetailTabs.tsx` (OverviewTab/SignupsTab/MaterialsTab),
`RehearsalDetailTabs.tsx` (DatesTab→DateRow, AttendanceTab→AttendanceSection —
2 levels), `InventoryDetailTabs.tsx` (OverviewTab/NotesTab, CheckoutsTab→
CheckoutRow — 2 levels). C5#5 year-boundary bug fixed in `messages/page.tsx`
(both sides of year comparison use `getYear(toZonedTime(..., tz))`).
Self-caught F1: `RehearsalDetailTabs.tsx` `AttendanceSection` had `timezone`
added to type annotation but not the destructured parameter list — a live
recurrence of the MESSAGES.7 latent dead prop pattern. Caught by `npx tsc
--noEmit` before ship, fixed immediately. F2: `ShowList.tsx` was in Task A
hit list but missed during batch sweep — caught only by the Task E verification
grep (not by lint or tsc, since `formatCT(date, fmt)` without tz is valid
TypeScript). Zero lint errors, zero tsc errors.

**TZ.5b ✓** — Calendar subsystem sweep (12 files, commit e06d1c4). Removed
all remaining `const CT = 'America/Chicago'` from calendar utility modules
and Client Components. Pattern A (utility modules — `timezone: string` param
added): `lib/utils/calendar-availability.ts` `getAvailableWindows()`;
`lib/utils/calendar-layout.ts` `computeEventPosition()`. Single caller each:
`CalendarDayPanel.tsx` calls `getAvailableWindows()`; `UnifiedWeekGrid.tsx`
calls `computeEventPosition()`. Pattern B (8 fresh SSR-guarded reads):
`CalendarShell.tsx`, `CalendarEventForm.tsx` (tz declared BEFORE `useForm()`
and all hooks), `CalendarMonthView.tsx`, `CalendarWeekView.tsx`, `CalendarAgendaView.tsx`,
`WeekAgendaView.tsx`, `PublicCalendarGrid.tsx`, `UnifiedWeekGrid.tsx`.
Pattern C (2 split-state files — reused existing TZ.5a tz, no second read):
`CalendarDayPanel.tsx` (3 CT usages: headerDate + 2 Available Windows time
labels + `getAvailableWindows()` call site), `PendingQueueClient.tsx`
(`eventDateLabel()` module-level helper parameterized; `handleLocationChange()`
/ `handleApplyDefaultLocation()` used tz directly). `UnifiedWeekGrid.tsx`
special case: `useNowPosition(days)` custom hook gained `timezone: string` as
second parameter; `timezone` added to `useEffect` deps array; existing
`eslint-disable-next-line react-hooks/exhaustive-deps` comment preserved
verbatim (covers intentional `days` exclusion). Verification grep N4: zero
`'America/Chicago'` literals remaining outside `lib/utils/org-timezone.ts`
and `setup/page.tsx` (canonical definition + R18 fallbacks). Phase TZ fully
complete. Zero lint errors, zero tsc errors.

**TZ.6 ✓** — Brief v5.9 (DOC.78) + Process v5.7 (DOC.79). Phase TZ
documentation complete.

**ADMIN.45 ✓** — Dead Prop Systematic Audit & Fix. Audited ~30 component
and sub-component prop type signatures across 10 target files. Two dead props
found and fixed: `defaultHours` in `ShowDetail.tsx` (declared in type, never
destructured — ESLint suppression added as the prop was not yet used in the
body) and `adminRole` in `InventoryDetailTabs.tsx` (same pattern — ESLint
suppression added; usage deferred). All other 8 files: PASS. Pre-existing
lint baseline breach discovered (F1): 6 errors + 1 warning in
`ComposeForm.tsx`, `ReplyComposer.tsx`, `DirectMessageComposer.tsx`
(react-hooks/refs violations from reading `composerRef.current` directly in
JSX render expressions). Commit: 671a6d4.

**ADMIN.46 ✓** — Q1 Implementation + F1 Lint Baseline Restoration.
`ShowDetail.tsx` Settings tab: "Default Hours per Volunteer" read-only field
added, resolving `show.default_hours ?? defaultHours[getLocationHoursBucket(
show.location?.name)]` with "—" fallback; note "Edit via the show edit form."
ADMIN.45 ESLint suppression for `defaultHours` removed (now used).
`InventoryDetailTabs.tsx` `adminRole`: ADMIN.45 suppression left in place —
Outcome A confirmed (canWrite/canDelete/canSeeNotes already cover all write
gates; adminRole is genuinely redundant), cleanup deferred.
F1 resolved: `DirectMessageComposer.tsx` gained `onEmptyChange` callback prop;
`ComposeForm.tsx` + `ReplyComposer.tsx` replaced stale ref reads in JSX with
`isComposerEmpty` state; unused `_unused` var removed from
DirectMessageComposer. Zero lint errors, zero tsc errors.
4 files modified. Commit: 796af84.

### Phase MM — Maintenance Mode ✓ Complete

**Architecture:** Maintenance Mode is an operational
kill switch for the `/crew` backend. When active, all
non-Super-Admin roles are redirected to a branded
maintenance page (`/crew/maintenance`) and cannot access
any crew functionality. Super Admin retains full access
at all times. The toggle, heading, and body text are
configurable in Platform Setup Section 1.

**MM.A ✓** — Read-only audit. 7 files audited:
`proxy.ts`, `lib/actions/setup.ts`, `components/crew/
settings/SetupPanel.tsx`, `app/crew/(app)/settings/
setup/page.tsx`, `app/crew/(app)/layout.tsx`,
`components/crew/TopBar.tsx`, `app/not-found.tsx`.
Key findings: SetupPanel.tsx has 8 independent
sub-components (not one component with all state at
top); no literal section numeral text exists in code
(section numbering is planning-doc convention only);
`resolveLayoutSettings()` is in root `app/layout.tsx`,
not the crew app layout; `SaveStatus` type uses `'saved'`
not `'success'`; `settingsMap` in setup/page.tsx is a
`Map` instance (`.get()` required, not bracket access);
`ActionResult` is a discriminated union (`'error' in
result` not `result?.error`). No code. No commit.

**MM.1 ✓** — Migration 039 + server action + proxy.ts
gate + maintenance page + layout banner. Migration 039
applied: seeds `maintenance_mode`, `maintenance_heading`,
`maintenance_body` in `app_settings`. `saveMaintenanceMode()`
added to `lib/actions/setup.ts` (SA only; mirrors
`saveNotFoundPage()` pattern; revalidates `/crew` layout
scope for immediate banner propagation). `proxy.ts`
maintenance gate inserted before all other checks (fires
before `needsFlagCheck`, before flag fetches): reads
`maintenance_mode` via `getAdminClient()`; if `'true'`
and non-SA, redirects to `/crew/maintenance`; SA passes
through transparently. `app/crew/maintenance/page.tsx`
created (standalone — NOT in `(app)` route group;
renders without sidebar/topbar; `getAdminClient()` +
`resolveOrgIdentity()`; noindex; light mode only).
`app/crew/(app)/layout.tsx` extended: `maintenance_mode`
fetch as 4th Promise.all entry; `maintenanceModeActive`
boolean derived; amber banner sibling div between TopBar
and main (SA-only visible by definition). `getAdminClient`
import added to layout. 5 files created/modified.
Commit: 4196623.

**MM.2 ✓** — Setup Panel Maintenance Mode section.
`MaintenanceModeSection` sub-component added to
`SetupPanel.tsx` — positioned as first section in the
panel. Contains: `ToggleRow` (conditional label: "⚠
Maintenance Mode — ON" when active), heading text input
(max 100 chars), body textarea (max 300 chars), Save
button + SaveFeedback. Uses `SaveStatus` type and
`setStatus('saved')` per live file convention (not
`'success'` — MM.A finding). `saveMaintenanceMode`
imported and wired. `SetupPanelInitialValues` type
extended (27 fields, was 24). `setup/page.tsx` SETUP_KEYS
extended to 27 keys; initialValues mapping extended with
`|| ''` fallbacks (R18). Self-caught bugs fixed before
tsc: `'error' in result` for ActionResult narrowing;
`.get()` for Map access in settingsMap. 2 files.
Commit: 769ecdd. Phase MM complete.

### Phase FORUMS-FIX — Forums Thread View Bug Fix
✓ Complete

**FORUMS-FIX.A ✓** — Combined audit-and-fix session.
Root cause confirmed: `markThreadRead()` was called
directly in the Server Component render body of
`app/crew/(app)/forums/[forumId]/[threadId]/page.tsx`
(line 31). `markThreadRead()` internally calls
`revalidatePath()`, which Next.js prohibits during
render — throws a runtime error that bubbles to
`app/error.tsx`. This was confirmed via static analysis
(no browser access in session) — confirmed by: (1) zero
broken data in the DB (thread and post both exist,
non-null body, zero attachments), (2) `canAccessForum()`
correctly short-circuits for SA/OA, (3) no null arrays
in ThreadViewClient. None of the four initial candidates
(params not awaited, canAccessForum false, signed-URL
failure, null array) matched — diagnosed as Candidate 5.
Fix: removed `await markThreadRead(threadId)` and its
import from page.tsx; added `useEffect(() => { void
markThreadRead(data.thread.id) }, [data.thread.id])` to
`ThreadViewClient.tsx` — exact pattern from
`components/crew/messages/ThreadView.tsx`. Same fix
resolved the "Create Thread" error (NewThreadModal
navigated to the new thread URL immediately after
creation, landing on the same broken render path).
2 files modified. Commit: 29570e0.

**FORUMS-FIX.B ✓** — Q-item cleanup. Two fixes:
(1) `getThreadWithPosts()` signed-URL loop (forum-posts.ts
lines 96-101) wrapped in per-attachment try/catch —
returns `signed_url: null` on failure instead of crashing
the entire thread fetch. (2) `app/error.tsx`: error prop
was destructured in type but never used in function body
— added `error` to destructuring and added
`useEffect(() => { console.error('Runtime error caught
by error boundary:', error) }, [error])`. Without this
logging, diagnosing the FORUMS-FIX root cause required
hours of static analysis with no stack trace. 2 files.
Commit: 6b5e230.

### Phase FORUMS-UX — Forum Permissions Discoverability
✓ Complete

**FORUMS-UX.1 ✓** — Single targeted fix. Added
`<span className="text-xs text-mid-gray dark:text-dark-
muted">Manage Access</span>` immediately before the
expand chevron button in `ForumManageClient.tsx`'s
`ForumRow` component, inside the `{!editMode &&
!confirmingDelete && (...)}` flex container. The label
reads "Manage Access ▼" as a single discoverable
affordance. 1 file, 1 line inserted. Commit: 1651989.

### Phase ANNOUNCE — Dashboard Announcements Widget
✓ Complete

**ANNOUNCE.A ✓** — Read-only audit (9 targets).
Key findings: layout.tsx cannot pass fetched data to
`{children}` as props (Next.js hard constraint) —
announcement data must be fetched in dashboard/page.tsx;
`settingsMap` is a Map instance throughout setup/page.tsx
(confirmed `.get()` pattern); pre-existing
`announcement_banner_active`/`announcement_banner_text`
keys in app_settings require `dashboard_announcement_*`
prefix for new keys to avoid naming collision; no toast
library installed — inline undo banner pattern required;
OA settings area has no existing page for announcements
— new `/crew/settings/dashboard-announcement` route
needed; `AdminUser` type and `getAdminUser()` SELECT
must both be updated when `announcement_dismissed_at`
column is added (per INVENTORY.1 lesson). No code.
No commit.

**ANNOUNCE.1 ✓** — Migration 040 + server actions +
type extensions. Migration 040 applied: adds
`announcement_dismissed_at timestamptz` to `admin_users`
(nullable); seeds four new app_settings keys. Types/auth:
`types/admin.ts` `AdminUser` extended; `lib/auth.ts`
`getAdminUser()` SELECT extended. `saveAnnouncement()`
added to `lib/actions/setup.ts` (SA always + OA-when-
enabled; R31 sanitization; server-side timestamp; roles
validation; revalidates dashboard). New files:
`lib/data/announcements.ts` (no `'use server'`,
`getActiveAnnouncements()`); `lib/actions/announcements.ts`
(`'use server'`, `dismissAnnouncement()` +
`getAnnouncementContent()`). `'announcement.publish'`
added to AuditAction union in `lib/audit.ts`. 7 files.
Commit: 23d28f3.

**ANNOUNCE.2 ✓** — Full UI. `AnnouncementSection.tsx`
new standalone `'use client'` component (self-loading
via single `useEffect([editor])`, TipTap editor with
Bold/Italic/Bullet/Ordered/H2 toolbar, 5 role checkboxes,
Publish button). `AnnouncementWidget.tsx` (Server
Component, returns null when no active announcements) +
`AnnouncementWidgetClient.tsx` (`'use client'`, optimistic
dismiss). `dashboard/page.tsx`: `<AnnouncementWidget
admin={admin} />` inserted before `<QuickStats />`.
`SetupPanel.tsx`: `announcements_oa_enabled` added as
9th FeatureFlagsSection toggle (state + ToggleRow +
`fd.append()` all added together — Q2 from ANNOUNCE.A);
`<AnnouncementSection />` rendered as last child (no
props — self-loading). `setup/page.tsx`: SETUP_KEYS
27→28; initialValues mapping extended. `saveFeatureFlags()`
fully wired for new flag (all 6 points per A4 correction).
OA mirror page: `app/crew/(app)/settings/dashboard-
announcement/page.tsx` (double-guarded). Settings hub:
Dashboard Announcements card added. `getAnnouncementContent()`
added to `lib/actions/announcements.ts` as 2nd exported
async function. 10 files. Commit: 98a275e. Phase ANNOUNCE
complete.

Key lessons from ANNOUNCE build:
- `saveFeatureFlags()` uses batched `.upsert([])` with
  `isValidFlagValue()` type-guard — NOT `upsertSetting()`
  per key. Requires 6 wiring points per new flag, not 4.
- `AnnouncementSection` must be self-loading (no props)
  because dashboard_announcement_* keys are not in
  SETUP_KEYS and not in `settingsMap`/`initialValues`.
- `dashboard_announcement_*` prefix was required to avoid
  naming collision with pre-existing
  `announcement_banner_*` keys (separate feature).

### Phase SHOWDELETE — Show Hard Delete ✓ Complete

**SHOWDELETE.A ✓** — Read-only audit (6 targets). Key
findings: No dedicated Archive/Unarchive button exists —
archiving is done via the status `<select>` dropdown in
the Settings tab. `ShowCard` is defined INSIDE `ShowList.tsx`
(not a separate file). `updateShowStatus()` role guard
is broader than `canEdit` (allows production-role show
editors) — `deleteShow()` must use strict allowlist.
`attendance` table has two NO ACTION FKs (to `shows.id`
and `show_dates.id`) — active slot_claims check alone
is insufficient to prevent FK violation; attendance
records check is mandatory. `AlertDialog` already
installed (`components/ui/alert-dialog.tsx`), state-
controlled usage in `ShowForm.tsx` is the correct pattern.
`slot_claims.status` has three values: `claimed`,
`waitlisted`, `cancelled` — both `claimed` and
`waitlisted` should block deletion. No code. No commit.

**SHOWDELETE.1 ✓** — `'show.delete'` added to
`AuditAction` union in `lib/audit.ts`. `deleteShow()`
added to `lib/actions/shows.ts` (strict SA/OA/Editor
allowlist; three guards in order: archived → active
claims [two-step query, both statuses] → attendance
records; `logAction()` before DELETE; revalidates
`/crew/shows` + `/shows`). `ShowDetail.tsx`: AlertDialog
imports + `deleteShow` import added; state + handler
(`showDeleteConfirm`, `isDeleting`, `deleteError`,
`handleDelete`) added inside `SettingsTab` (not root
ShowDetail — `router` and `show` are in scope there, not
in root); Delete section + AlertDialog added to Settings
tab. Uses `ShowEditorActionResult` (not `ActionResult` —
the live file's actual return type). `router.push('/crew/
shows')` on success (not `router.refresh()` — show no
longer exists). 3 files. Commit: b4824dc. Phase SHOWDELETE
complete.

Key lessons from SHOWDELETE build:
- `attendance` has NO ACTION FK to `shows.id` — any
  show with attendance records will fail on DELETE without
  an explicit guard. This is different from slot_claims
  which CASCADE via show_dates.
- `ShowCard` is not a separate file — defined inline in
  `ShowList.tsx`.
- `ShowDetail.tsx` Settings tab state and handlers must
  be defined inside `SettingsTab` where `router` and
  `show` are in scope, not in the root `ShowDetail`
  component which does not call `useRouter()`.
- Supabase JS `.in()` does not support nested subqueries
  — must use two-step approach (fetch IDs, then filter).

### Phase SHOWARCHIVE — Show Archive ✓ Complete
(New phase — not in original Beta plan)

**SHOWARCHIVE.A ✓** — Read-only audit (7 targets). Key
findings: The shows page already fetches ALL shows
regardless of status (no status filter on the inline
query) — shows can be filtered by status via the existing
`<select>` dropdown; no new tab or separate fetch needed.
The "Archive" tab proposal was unnecessary — existing
status filter already provides equivalent filtering.
The real gap was the missing quick-action Archive button
on ShowCard. `ShowForm.tsx` had "Save & Publish" / "Save
as Draft" buttons that hardcoded status values, ignoring
the Status dropdown — this was the actual bug causing
archived/past statuses to not save. No toast library
installed — inline undo banner required. No code.
No commit.

**SHOWARCHIVE.1 ✓** — Three changes in two files:
(1) `ShowForm.tsx`: "Save & Publish" + "Save as Draft"
buttons replaced with single "Save" button that reads
`status` from the Status dropdown. Past/archived
selection shows guidance message (not blocked silently).
Notification AlertDialog (for `status === 'live'`) is
preserved. Hint text updated.
(2) `ShowList.tsx`: `updateShowStatus` + `Archive` lucide
icon added to imports; `archivingId`, `archiveError`,
`undoState` state added; `handleArchive()` + `handleUndo()`
handlers added; 5-second auto-dismiss `useEffect` added;
`ShowCard` gained 3 optional props (`isArchiving`,
`archiveError`, `onArchive`); Archive button added to
`ShowCard` gated on `canEdit && (draft || live)`;
Archived Shows accordion added AFTER the entire groups
conditional (not nested inside it — nesting hides it
when season filter returns no results); undo banner added
above list content. `router.refresh()` added to success
branches of both `handleArchive` and `handleUndo` (not
in original prompt snippets but required — shows is a
Server Component prop that needs re-fetch). 2 files.
Commit: 6557260. Phase SHOWARCHIVE complete.

Key lessons from SHOWARCHIVE build:
- "Save & Publish" / "Save as Draft" buttons are in
  `ShowForm.tsx` (the show edit form), NOT in
  `ShowDetail.tsx` (the tabbed detail view). These are
  two completely different pages. `ShowDetail.tsx` already
  had a correct "Save Status" button.
- The Archived Shows accordion must be inserted AFTER the
  entire groups conditional — nesting it inside would hide
  it when the season filter returns no results.
- `router.refresh()` is required after mutations in
  ShowList — shows is a Server Component prop.

### Beta Build — Complete

All planned Beta phases are complete:
- Phase QRBANNER ✓ — QR Code Label Banner
- Phase QRANALYTICS ✓ — QR Code Scan Tracking
- Phase SIDEBAR ✓ — Grouped Sidebar + TopBar Polish
  (SIDEBAR.A audit, SIDEBAR.1 mockups, SIDEBAR.2–6
  production rollout)
- Phase NAVORDER ✓ — Sidebar Nav Order
  (NAVORDER.A audit, NAVORDER.1 implementation)

Phase 17 (Launch) deferred pending Beta refinement. Post-Beta
ADMIN prompts and Phase BETA (Beta Feedback System) followed —
see below.

**ADMIN.47 ✓** — Carry-forward cleanup. Three carry-forward
items audited; two were non-applicable (stale in live code):
Task C (stale QRCode.toBuffer() comment in QRGeneratorForm.tsx)
— not found in live codebase, already resolved in QRBANNER.1.
Task D (default_reply_to missing from SETUP_KEYS) — already
present in SETUP_KEYS at line 19 (resolved ADMIN.46 Task A4).
Task B executed: removed dead `adminRole` prop from
`InventoryDetailTabs.tsx` (type annotation, destructure, ESLint
suppression) + unused `AdminRole` import. Also removed
`adminRole={admin.role}` from call site in
`app/crew/(app)/inventory/[id]/page.tsx` (required to avoid
TypeScript excess-property error). 2 files. Commit 678d774.

**ADMIN.48 ✓** — setup/page.tsx `??` → `||` R18 sweep.
15 `??` expressions replaced with `||` in the `initialValues`
block of `setup/page.tsx` (prompt estimated ~11; live count
was 15). 2 `??` expressions outside `initialValues`
(settingsMap construction, instanceLabel local const)
correctly left untouched. Prompt confirmed zero errors, zero
warnings. 1 file. Commit 9f614a0.

---

**Phase BETA — Beta Feedback System ✓ Complete**

**BETA.A ✓** — Read-only audit (9 targets). Key findings:
F1: dual-highlight risk — `/crew/settings/beta` prefix-matches
`/crew/settings` in `isActivePath()`; fix: special-case
`/crew/settings` in `renderLink()` with
`!pathname.startsWith('/crew/settings/beta')` exclusion.
F2: label must be "Beta Feedback" everywhere.
F3: `feature_beta` defaults OFF — seeds `'false'`, uses
`|| 'false'` pattern (matches `feature_messages`).
F4: proxy must use `pathname.startsWith('/crew/settings/beta')`
only, never broader `/crew/settings`.
F5: `feature_beta` must go in the `feature_*` cluster in
SETUP_KEYS, not appended at end.
F6: `saveFeatureFlags()` has a separate `keys` array AND
`.upsert()` array — both need `'feature_beta'`.
F7: `settings/page.tsx` has zero flag-gated cards; Beta
Feedback hub card uses `canAccessAdminSettings` role gate only.
No code. No commit.

**BETA.1 ✓** — Full implementation. Migration 043 applied
(`beta_feedback` table + RLS + `feature_beta` seed).
`lib/actions/beta.ts` (new): `submitBetaFeedback()` +
`completeBetaFeedback()`. `app/crew/(app)/settings/beta/
page.tsx` (new): SA queue view (oldest-first pending items,
role/type badges, Mark Complete via `.bind()` + R40 assertion)
+ non-SA submission form. `components/crew/settings/
BetaFeedbackForm.tsx` (new): 'use client', no `<form>` element
(R13.3a), controlled state, type segmented control, textarea
with character count, inline success/error. Feature flag
5-file pattern: `lib/feature-flags.ts` (9th flag `beta:
boolean`), `SetupPanel.tsx` (10th toggle "Beta Testing"),
`setup/page.tsx` (SETUP_KEYS 29→30, `|| 'false'` fallback),
`lib/actions/setup.ts` (`saveFeatureFlags()` all 6 wiring
points including both `keys` array and `.upsert()` array),
`proxy.ts` (`/crew/settings/beta` added to `needsFlagCheck`
+ crew flag block). `Sidebar.tsx`: Beta Feedback nav entry
(`MessageSquarePlus` icon), `FLAG_GATED_HREFS` entry, prepended
to `SETTINGS_HREFS`, dual-highlight fix in `renderLink()`.
`types/sidebar.ts`: `'/crew/settings/beta': 'Beta Testing'`
in HREF_LABELS; `/crew/settings/beta` prepended to
`DEFAULT_LINK_ORDER['settings']`. `settings/page.tsx`: Beta
Feedback hub card (`canAccessAdminSettings` gate, no LockedCard
— first card built after hide-not-lock rule). 4 new files,
8 modified. Commit a9b1026.

---

**ADMIN.49 ✓** — Sidebar Beta link fix + Settings hub
hide-not-lock.

Bug 1 root cause: `navOrder?.linkOrder[groupKey] ??
GROUP_HREF_DEFAULTS[groupKey]` — a saved `sidebar_nav_order`
DB row existed (saved before BETA.1) with
`linkOrder.settings = ["/crew/settings", "/crew/help"]`
(no `/crew/settings/beta`). Since non-null, `??` never fell
through to updated defaults, so `getGroupItems()` never
looked up the new href. Fix: added `resolveGroupHrefs()`
to `Sidebar.tsx` — merges saved order with current
`GROUP_HREF_DEFAULTS`, appending any hrefs present in
defaults but missing from saved array. Self-healing for
all future nav additions, for all groups.

Bug 2: 14 cards on `settings/page.tsx` converted from
`cond ? <LinkedCard/> : <LockedCard/>` to `cond &&
<LinkedCard/>`. `LockedCard` function definition removed
(fully unused after conversion — lint would have caught it).
New standing rule: hide-not-lock (see §13).

Q1: Audit Log C3 pattern `(canAccessAdminSettings ||
isEditorOrAbove)` is logically redundant but harmless —
kept as written (simplified in ADMIN.51).
Q2: Stale `sidebar_nav_order` DB row not modified —
`resolveGroupHrefs()` makes it harmless.
F1: `canAccessInventorySettings` used instead of prompt's
literal `(canAccessAdminSettings || admin.inventory_manager)`
— safer (defense-in-depth), identical visible behavior.
2 files. Commit pushed.

**ADMIN.50 ✓** — Settings access tightening + Inventory
Manager sidebar link.

Decisions: Settings sidebar link hidden from Editor/Viewer/
Production (SA/OA only). Editors lose access to Audit Log
entirely (SA/OA only). New "Inventory Management" sidebar
link in Settings group — visible only to Editors with
`inventory_manager = true`. SA/OA already have access via
Settings hub. Settings hub page hard-blocked at proxy and
server for non-SA/OA.

`Sidebar.tsx`: `/crew/settings` added to `FLAG_GATED_HREFS`
with role check using `admin` prop (already in scope —
no new prop needed); `showInventorySettings` prop added
(interface + destructured default `false`); conditional
Inventory Management link rendered as special-case append
inside settings group render block (Package icon — same
as Utilities-group Inventory link); NOT part of
`FLAG_GATED_HREFS` or `DEFAULT_LINK_ORDER` system.
`types/sidebar.ts`: `/crew/settings/inventory` →
`'Inventory Management'` added to `HREF_LABELS`.
`proxy.ts`: `/crew/settings` exact-match guard (SA/OA)
+ `/crew/settings/audit-log` prefix guard (SA/OA) —
both use session-client pattern matching pre-existing
SA guards. `settings/page.tsx`:
`if (!canAccessAdminSettings) redirect('/crew/dashboard')`
added. `audit-log/page.tsx`: tightened from
Viewer-only-block to full SA/OA-only guard.
`layout.tsx`: `showInventorySettings = admin.role ===
'editor' && admin.inventory_manager === true` computed
and threaded to `<Sidebar>`.
F1: Editors lose UI path to Announcement Banner, Hearing
Options, Signup Form, General Defaults (individual sub-page
routes not independently proxy-blocked). Intentional.
F2: Dead variables on `settings/page.tsx`
(`isEditorOrAbove`, inventory editor branch) now
unreachable for Editor/Viewer — deferred to ADMIN.51.
6 files. Commit pushed.

---

**ADMIN.51 ✓** — `settings/page.tsx` dead variable cleanup.
Post-ADMIN.50 simplification: `isEditorOrAbove` (always
true for SA/OA, the only roles reaching JSX) and
`canAccessInventorySettings` (Editor branch unreachable)
both removed. 6 card conditions simplified to
`canAccessAdminSettings`. `canAccessAdminSettings`,
`canAccessDashboardAnnouncements`, and
`admin.role === 'super_admin'` (Style Sandbox) all remain
meaningful and unchanged. 1 file. Commit f628541.

---

**ADMIN.52 ✓** — Season at a Glance refinements + Announcement
Widget visual upgrade.

`SeasonAtAGlance.tsx`: 31-day preview cap applied (only shows
whose earliest `show_date` is within 31 days displayed);
chronological sort by earliest show date ascending (replaces
alphabetical `.order('name')` DB sort); "View all shows →" link
to `/crew/shows` in section header (always visible); empty state
("No upcoming shows in the next 31 days.") and truncation note
("Showing N of M shows — View all →") added. Architecture
finding: `SeasonAtAGlance.tsx` is a self-contained Server
Component that fetches its own data — no show data crosses the
`dashboard/page.tsx` → component boundary. The `timezone` prop
(already resolved in the page) is reused rather than calling
`getOrgTimezone(supabase)` a second time. Cutoff uses
`formatCT(addDays(new Date(), 31), 'yyyy-MM-dd', timezone)` —
the string-comparison pattern (R23 — safer for bare date column
comparison than raw Date object comparison).

`AnnouncementWidgetClient.tsx`: visual redesign — card now uses
`bg-orange-50 dark:bg-orange-900/10 border border-orange-200
dark:border-orange-900/40 border-l-4` with
`style={{ borderLeftColor: 'var(--brand-accent)' }}`; header
gains `Megaphone` icon (lucide-react) + "Announcement" label;
dismiss button uses `X` icon. AnnouncementWidget.tsx Server
Component wrapper untouched. R35 confirmed safe: `dark-surface`
is a native `@theme` token, so pairing `bg-orange-50` with
`dark:bg-orange-900/10` is cascade-correct (both native
Tailwind).

2 files modified. Commit 97655be.

---

**ADMIN.53 ✓** — Notification panel cleanup + Season at a Glance
label fix.

`SeasonAtAGlance.tsx`: fallback section header when no season is
pinned changed from "All Live Shows" to "Upcoming Shows (Next 31
Days)" — corrects misleading label introduced by ADMIN.52's
31-day cap (a show list capped at 31 days should not claim to
show "all" live shows). 1 line changed.

`NotificationPanel.tsx`: Four behavioral changes:
(1) **Mark-as-read removes item** — optimistic update changed
from `.map()` (set `read_at`) to `.filter()` (remove item); the
notification disappears immediately from the panel rather than
just losing its unread highlight. Server action still fires.
(2) **Mark-all clears panel** — `setNotifications([])`;
subsequent empty state shown.
(3) **Empty state** — when `visibleNotifications.length === 0`,
a centered "No new notifications" paragraph renders in place of
the list. "Mark all read" button conditionally rendered only when
`unreadPersistent > 0` (tautologically false guard removed).
(4) **`direct_message` filtered** — `visibleNotifications`
derived constant filters out `direct_message` type at render
time; both the rendered list and bell badge (`unreadPersistent`)
computed from `visibleNotifications` only. DB rows unchanged.
Key architectural finding: `unreadPersistent` was previously a
server-computed `counts.unreadPersistent` field maintained via
`setCounts()` calls — the `counts` state was removed entirely;
`unreadPersistent` is now purely client-derived from
`visibleNotifications.filter(n => !n.read_at).length`.

2 files modified. Commit a4dc731.

---

**ADMIN.54 ✓** — Remove notifications cap + TipTap click-to-focus
fix.

`lib/data/notifications.ts`: `.limit(20)` default parameter
removed from `getUserNotifications()` — all persistent
notifications now returned without a row cap. `lib/actions/
notifications.ts`: pass-through `limit?: number` parameter
removed (was unused after data layer change). `layout.tsx`:
no change needed — call site already matched the new 2-arg
signature.

`components/crew/messages/DirectMessageComposer.tsx`:
Click-to-focus bug root cause: `minHeight` was applied to
`EditorContent`'s outer wrapper `<div>`, which never reached
the `.ProseMirror` contenteditable child — clicks in empty
space below content landed on the wrapper and never focused
the editor. Fix: added `dm-editor-wrapper` class +
`cursor-text` + `onClick={() => { if (!disabled) editor?.commands.focus() }}`
on the wrapper div; inline `style={{ '--dm-min-height': minHeight } as CSSProperties}`
preserves per-caller configurability (ReplyComposer uses 100px,
ComposeForm uses 140px). Removed the now-ineffective
`style={{ minHeight }}` from `<EditorContent>` itself.

`app/globals.css`: Added plain CSS rule outside `@layer
utilities`:
`.dm-editor-wrapper .ProseMirror { min-height: var(--dm-min-height, 100px); outline: none; }`
CSS custom property approach preserves the two existing
per-caller height values — a hardcoded value would have silently
broken one of the two composer instances.

4 files modified. Commit 32eeebd.

---

**ADMIN.55 ✓** — Hide Beta Feedback sidebar link from Super Admin.

`components/crew/Sidebar.tsx`: `super_admin` role no longer sees
the Beta Feedback nav entry in the Settings group. SA reaches
Beta Feedback via the Settings hub card. Implementation: a
conditional filter on the resolved hrefs array for the settings
group — when `groupKey === 'settings' && admin.role ===
'super_admin'`, `/crew/settings/beta` is filtered from the hrefs
array after `resolveGroupHrefs()` runs and before `getGroupItems()`
converts hrefs to rendered items. `resolveGroupHrefs()` self-
healing behavior is unaffected (filter runs after the merge).
`showInventorySettings` conditional append unaffected (rendered
outside the items array, after the main loop). Only the settings
group key triggers the new branch; all other groups and all
non-SA roles pass through unchanged.

1 file modified. Commit 52a4ae1.

---

**ADMIN.56 ✓** — QR banner font fix + curled-ribbon redesign.

Root cause (banner text not rendering): `@resvg/resvg-js`
`Resvg` constructor was called with no font option.
`loadSystemFonts: true` (the default) silently fails on Vercel's
minimal serverless Linux runtime — no error thrown, zero glyph
rendering. Verified empirically: pixel-count test with
`loadSystemFonts: false` → 0 non-white pixels in banner zone;
real font supplied → thousands of pixels.

Initial font fix: `resolveBannerFontFile()` using
`createRequire(import.meta.url).resolve('next/dist/compiled/@vercel/og/Geist-Regular.ttf')`.
Passed local tests but failed Vercel Turbopack build: Turbopack
statically analyzes `nodeRequire.resolve()` on a literal string
argument and attempted to import the `.ttf` as a module →
"Unknown module type" build error. See ADMIN.56-FIX for the
correct font resolution approach.

Ribbon redesign (shipped in ADMIN.56, font updated in
ADMIN.56-FIX): Replaced plain white rect + text banner with a
7-element curled-edge ribbon SVG: (1) white background rect;
(2) `#EEF2FF` ribbon body; (3–4) `#B8C4E8` curl-shadow triangles
at bottom corners; (5–6) `#D4DCF5` curl-face triangles
overlapping the shadows; (7) centered `#293994` text (semibold,
Arial). `BANNER_HEIGHT_UNITS → 10`, `BANNER_FONT_SIZE → 2.8`.
All geometry (ribbonY, ribbonH, curlDepth, ribbonBottom, cx)
derives from the dynamically-parsed viewBox width N — no
hardcoded coordinates. `escapeXml()` preserved on bannerText.
No CSS in SVG — SVG presentation attributes only (required for
`@resvg/resvg-js` rasterization context).

1 file modified (lib/qr.ts). Commit pushed (see ADMIN.56-FIX
for the corrected commit).

**ADMIN.56-FIX ✓** — Turbopack font resolution fix.

Removed `createRequire`/`node:module` approach entirely. Inter
Regular v4.0 (SIL Open Font License, 398KB, TrueType) downloaded
from `rsms/inter` GitHub release and placed at
`public/fonts/banner-font.ttf`. Font resolution rewritten to
`path.join(process.cwd(), 'public', 'fonts', 'banner-font.ttf')`
+ `existsSync()`. `process.cwd()` is a runtime expression —
Turbopack cannot statically resolve it at build time and never
attempts to import the font file as a module. Font options
(`font: { loadSystemFonts: false, fontFiles: [...], defaultFontFamily: 'Inter', sansSerifFamily: 'Inter' }`)
passed to `Resvg` only when `trimmedBanner` is truthy — no-banner
path unchanged, no font option passed. `npm run build` succeeded
locally (Turbopack, 12.9s, 61 routes, clean). Empirical
verification: 125,144-byte PNG vs 111,068-byte no-font PNG →
glyphs present. `defaultFontFamily` changed from 'Geist' → 'Inter'
(cosmetic only — both are clean geometric sans-serifs).

New pattern established: `public/fonts/` as the convention for
vendored non-Google-Fonts font files; `path.join(process.cwd(),
'public', ...)` for referencing project assets in server-only
files to avoid Turbopack static analysis. See §13.

2 files modified (public/fonts/banner-font.ttf new,
lib/qr.ts updated). Commit f8a66b4.

---

**ADMIN.57 ✓** — Maintenance Mode estimated restoration time field.

`044_maintenance_restoration.sql` (new, repo root): seeds
`maintenance_estimated_restoration → ''` in `app_settings` via
`INSERT ... ON CONFLICT DO NOTHING`. Applied via Supabase MCP.

`lib/actions/setup.ts`: `saveMaintenanceMode()` extended with
4th field `maintenance_estimated_restoration`. The existing
upsert loop iterates a keys/values structure generically —
adding the 4th key required only adding it to those arrays, no
structural change.

`components/crew/settings/SetupPanel.tsx`:
`MaintenanceModeSection` sub-component gains a fourth field
("Estimated Restoration Time", text input, `maxLength={150}`,
placeholder "e.g. Tuesday, August 26 at 6:00 PM", optional
sub-label explaining it displays on the maintenance page when
set). New `useState<string>` + `fd.append()` wired in
`handleSave()`. `SetupPanelInitialValues` type extended with
`maintenance_estimated_restoration: string`. `SaveStatus` type
and `'error' in result` narrowing unchanged.

`app/crew/(app)/settings/setup/page.tsx`: SETUP_KEYS extended
(30 → 31), `maintenance_estimated_restoration` added to
initialValues mapping via `settingsMap.get(...) || ''` (R18 +
Map instance patterns). Type already extended in SetupPanel.tsx
(imported, not locally declared).

`app/crew/maintenance/page.tsx`: fetch extended to include
`maintenance_estimated_restoration`. Conditional amber box
rendered below the body paragraph and above the "Return to
homepage" link when `estimatedRestoration` is non-empty:
`border-amber-300 bg-amber-50 px-5 py-4 rounded-lg` with
"Estimated restoration:" label in `font-semibold`. Light mode
only — zero `dark:` classes added (confirmed via grep).

Task A finding: all four target files matched the governance doc
spec exactly — no surprises. Migration convention confirmed:
files live at repo root, not `supabase/migrations/`.

5 files created/modified. Commit pushed.

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
- Confirm all nine feature flags are configured for launch.
  The original seven operational flags should be enabled:
  `feature_calendar`, `feature_checkin`, `feature_blast`,
  `feature_rehearsals`, `feature_auditions`, `feature_inventory`,
  `feature_forums`. `feature_messages` (Private Messaging — added
  MESSAGES.1) defaults to `'false'` (opt-in only) — enable
  separately when ready to roll out Private Messaging to the crew.
  `feature_beta` (Beta Feedback — added Phase BETA, defaults to
  `'false'` — enable separately when ready to roll out Beta
  Feedback to crew).
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

### Phase INVENTORY — Inventory Management System (pre-launch)

Full forward spec in §8 (Inventory Management section) and §9 (admin_users + app_settings + schema tables). Prompt structure: INVENTORY.A (audit) → INVENTORY.1 (migration + flag + user management toggle + sidebar) → INVENTORY.2 (settings page + item list) → INVENTORY.3 (item detail + photos + notes) → INVENTORY.4 (checkout system) → INVENTORY.5 (QR tags + PDF export + HelpContent). Migration: 034. Feature flag: `feature_inventory`. New `inventory_manager` boolean on `admin_users`. 8 new tables (prompt miscount — Brief §11 said 9, migration created 8): `inventory_categories`, `inventory_locations`, `inventory_items`, `inventory_item_locations`, `inventory_photos`, `inventory_notes`, `inventory_checkouts`, `inventory_checkout_items`. 6th sanctioned XHR file: `InventoryPhotoUploader.tsx`. New route at `/api/inventory/tags` (PDF tag export).

**30BN-INVENTORY.A ✓** Read-only audit. 9 targets audited with exact line numbers. Key findings: `inventory_manager` absent from admin_users (confirmed); `lib/feature-flags.ts` 5 flags, insertion points after lines 8/26/37; `proxy.ts` (184 lines after ADMIN.43): `/crew/:path*` covers inventory, needsFlagCheck insertion after line 50, flag block after line 168; `Sidebar.tsx`: NAV_ITEMS insertion after line 36, FLAG_GATED_HREFS after line 76, HelpTooltip hardcoded `||` ternary at line 140 needs lookup map generalization; `saveFeatureFlags()`: revalidatePath insertion after line 348 (full 5-part pattern required); `SetupPanel.tsx`: SetupPanelInitialValues type after line 34; `setup/page.tsx`: SETUP_KEYS after line 23, initialValues after line 65; `HelpContent.tsx`: 15 live sections, Inventory appends after line 161. F1: proxy.ts missing `/crew/auditions` Production exception → fixed ADMIN.43. F2: Brief claims Auditions section before Getting Help; live file has it after → DOC batch correction. globals.css: 6 CSS custom properties confirmed. layout.tsx main: `bg-gray-50 dark:bg-dark-bg p-6`.

**30BN-INVENTORY.1 ✓** Migration 034 applied (inventory_manager on admin_users + 8 inventory tables + feature_inventory seed). `lib/feature-flags.ts`: inventory flag added (6th). `proxy.ts`: needsFlagCheck + flag block for /crew/inventory (no Production exception, no matcher change). `Sidebar.tsx`: 4-part atomic edit — Package icon imported, NAV_ITEMS Inventory entry, FLAG_GATED_HREFS, TOOLTIP_ANCHOR_MAP lookup map replacing hardcoded `||` ternary (refactor covers rehearsals + auditions + inventory). `lib/actions/setup.ts`: saveFeatureFlags() full 5-part update. `SetupPanel.tsx`: type + 6th toggle row. `setup/page.tsx`: SETUP_KEYS + initialValues (`||` per R18). `lib/actions/users.ts`: `toggleInventoryManager()` added. `lib/audit.ts`: `user.inventory_manager_change` AuditAction added (F1 correction: Brief originally said types/audit.ts — file is lib/audit.ts). `UsersTable.tsx`: inventory_manager toggle on editor rows only. `app/crew/(app)/settings/users/page.tsx`: query updated to fetch inventory_manager (unplanned — F3). `types/admin.ts`: inventory_manager added to AdminUser type (unplanned — F2). `lib/auth.ts`: getAdminUser() SELECT extended to fetch inventory_manager (unplanned — F2; without this all inventory_manager checks silently returned undefined). `app/crew/(app)/inventory/page.tsx`: stub page. `HelpContent.tsx`: 16th ALL_SECTIONS entry (Inventory, no Production). 13 files (+ 2 unplanned). Commit c367288.

**30BN-INVENTORY.2 ✓** `types/inventory.ts` (new — InventoryCategory, InventoryLocation, InventoryItem, InventoryItemWithStatus, CreateItemData, UpdateItemData, plus InventoryItemLocationInput). `lib/audit.ts`: 10 inventory AuditAction types added (inventory_category.*/inventory_location.*/inventory_item.create/update). `lib/actions/inventory-settings.ts` (new — getInventoryCategories, getInventoryLocations, create/update/reorder/toggle for both with assertInventoryWriteAccess guard). `lib/actions/inventory.ts` (new — generateItemNumber internal, getInventoryItems with filters + checkout status, getInventoryItemById, createInventoryItem, updateInventoryItem). `app/crew/(app)/settings/inventory/page.tsx` (new). `components/crew/settings/InventorySettingsClient.tsx` (new — categories + locations dual-section, arrow reorder, inline edit). `app/crew/(app)/settings/page.tsx`: Inventory Management card added (LinkedCard for SA/OA/inventory_manager, LockedCard otherwise). `app/crew/(app)/inventory/page.tsx`: stub replaced with real list page. `components/crew/inventory/InventoryListClient.tsx` (new — item table, filters, CreateItemModal, checkbox column with Print Tags stub). 9 files + 2 unplanned (types/admin.ts + lib/auth.ts — inventory_manager missing from AdminUser type and getAdminUser() SELECT, silently blocking all canWrite checks). Commit 48bc27a.

**30BN-INVENTORY.3 ✓** `types/inventory.ts`: InventoryPhoto + InventoryNote types added; InventoryItem extended with optional photos/notes. `lib/audit.ts`: 7 AuditAction types added (inventory_item.deactivate/reactivate/delete, inventory_photo.upload/delete/reorder, inventory_note.add). `lib/actions/inventory.ts`: 8 new functions (getInventoryPhotoUploadUrl, confirmInventoryPhotoUpload, deleteInventoryPhoto, reorderInventoryPhoto, addInventoryNote, deactivateInventoryItem, reactivateInventoryItem, deleteInventoryItem); getInventoryItemById extended to include photos (with signed URLs) + notes (with author names). Storage API discovery (F1): storage.objects has no RLS policies — all storage calls (createSignedUrl, createSignedUploadUrl, remove) require `getAdminClient()`, not getServerClient(), regardless of session context. Dual-client pattern: storage calls use getAdminClient(), DB row operations in same functions use getServerClient(). `app/crew/(app)/inventory/[id]/page.tsx` (new — Server Component; Next.js 15 params as Promise; notFound(); canWrite/canDelete/canSeeNotes flags; parallel fetch). `components/crew/inventory/InventoryDetailTabs.tsx` (new — 5-tab shell: Overview with inline edit + deactivation flow, Photos gallery, Notes append-only, Checkouts stub, QR stub). `components/crew/inventory/InventoryPhotoUploader.tsx` (new — 6th sanctioned XHR file; sequential per-file; FormData body with cacheControl + '' key; 10MB limit; deviation comment). tsc --noEmit caught and fixed formatCT() missing format-string argument before ship. 6 files. Commit bacd937.

**30BN-INVENTORY.4 ✓** `types/inventory.ts`: InventoryCheckout, CheckoutItem, CreateCheckoutData, CheckoutTargetType alias added. `lib/audit.ts`: inventory_checkout.create + inventory_checkout.return added. `lib/actions/inventory-checkouts.ts` (new — getCheckoutsForItem, getActiveCheckouts, getSearchableShows, getSearchableAdminUsers, createCheckout with double-checkout guard, returnCheckout; enrichCheckouts() internal helper for dual admin_users join — two-fetch-plus-TypeScript approach since Supabase JS client cannot alias dual self-joins). `components/crew/inventory/CheckoutModal.tsx` (new — multi-item selector with chips, three-way target segmented control, debounced show/user search at 300ms, shadcn Dialog pattern). `components/crew/inventory/InventoryDetailTabs.tsx`: Checkouts tab stub replaced (active/overdue banner, "Check Out This Item" button, timeline with inline return flow). `app/crew/(app)/inventory/[id]/page.tsx`: getCheckoutsForItem + getInventoryItems added to parallel fetch; checkouts + availableItems passed to tabs. `app/crew/(app)/inventory/page.tsx`: getActiveCheckouts added to parallel fetch. `components/crew/inventory/InventoryListClient.tsx`: ActiveCheckoutsPanel (collapsible, overdue badge, inline return) + "Check Out Items" button + CheckoutModal. react-hooks/set-state-in-effect violation caught and fixed before ship. 8 files. Commit 35ba6cb.

**30BN-INVENTORY.5 ✓** `components/crew/inventory/InventoryTagsPDF.tsx` (new — @react-pdf/renderer Document; createStyles() factory with StyleSheet.create() strictly inside — THEME.4 compliant; 2-column tag grid per Letter page; PNG QR image via `data:image/png;base64,${pngBase64}`). `app/api/inventory/tags/route.tsx` (new — .tsx not .ts since JSX is embedded directly; auth + flag + Production guards; ids query param max 50; item + category fetch with Array.isArray normalization for FK join; brand_primary from app_settings via getAdminClient(); lightenHex() for brandPrimaryLight; generateQR() per item; renderToBuffer(); fixed filename `inventory-tags.pdf` in Content-Disposition — never interpolated). `app/crew/(app)/inventory/[id]/page.tsx`: generateQR() called server-side; qrSvg + qrPngBase64 passed as props to InventoryDetailTabs. `components/crew/inventory/InventoryDetailTabs.tsx`: QR tab stub replaced (white-container SVG display, PNG + SVG download links, Print Tag link); HelpTooltip added to Checkouts tab (inventory-checkout) and QR tab (inventory-tags). `components/crew/inventory/InventoryListClient.tsx`: Print Tags button wired (window.open to /api/inventory/tags?ids=..., shows count, disabled when empty; stale comment removed). `components/crew/help/HelpContent.tsx`: Inventory section stub replaced with full 4-subsection content (overview, items, checkout, tags); written in live file convention (show() predicates, shared class constants, backtick template literals) not prompt's suggested markup (F3 — prompt's aria-labelledby nested sections didn't match live convention). jsx-a11y/alt-text lint warning on @react-pdf/renderer Image caught and fixed. Phase INVENTORY complete. 6 files. Commit 7f57805.

### Phase FORUMS — Internal Discussion Forums ✓ Complete

Full forward spec in §8 (Internal Forums section) and §9 (Migration 035, 12 forum table schemas, AuditAction types). All 6 prompts shipped.

**30BN-FORUMS.A ✓** Read-only audit. 10 targets audited with exact line numbers. Key findings: `feature_forums` absent from all 5 required file locations; `proxy.ts` 187 lines — no matcher change needed (`/crew/:path*` covers forums), needsFlagCheck insertion after line 53, Production allowlist insertion between lines 136–137, flag block after line 172; `Sidebar.tsx` 201 lines — `MessageSquare` icon not yet imported, 4 atomic edit locations confirmed; `setup/page.tsx` — 21 SETUP_KEYS (including `default_reply_to`), all 6 flag `initialValues` use `||` correctly; `HelpContent.tsx` 1460 lines — 16 live sections, Forums becomes 17th, roles MUST include 'production' (unlike Inventory). F3: Email Templates editors in AuditionDetailTabs use StarterKit+MergeTagExtension only (not Link+Underline — prompt had assumed full extension set). F4: settings/page.tsx User Groups card must use `canAccessAdminSettings` gate (not `isEditorOrAbove`). No code.

**30BN-FORUMS.1 ✓** Migration 035 applied (12 forum tables + feature_forums seed). 5-file flag pattern for `feature_forums`. `proxy.ts` 3 edits (needsFlagCheck, Production allowlist, crew flag block — no matcher change, no public block). `Sidebar.tsx` 5-part atomic edit (MessageSquare icon import + NAV_ITEMS + FLAG_GATED_HREFS + Production allowlist + TOOLTIP_ANCHOR_MAP — `/crew/forums` → `'forums'` added as 4th map entry). `HelpContent.tsx` 17th section stub (roles include 'production'). `types/forums.ts` created. `lib/audit.ts` 5 forum_group.* AuditAction types. `lib/actions/forum-groups.ts` (8 actions, SA/OA-gated). Settings/groups page + `ForumGroupsClient.tsx`. User Groups card added to settings hub before Platform Setup (`canAccessAdminSettings` gate — F4). Forums stub page. 15 files. Commit dde841d.

**30BN-FORUMS.2 ✓** `lib/audit.ts` 19 new forum_* AuditAction types (total 24 forum entries). `types/forums.ts` stubs replaced with full types + 6 new types = 10 total (94 lines). `lib/actions/forum-admin.ts` (21 exported functions: `getForumManageData()` with FK-hint parallel fetch + Array.isArray() normalization, category CRUD×4, forum CRUD×7 including `moveForum()`, access grants×2, moderators×2, admin search×1, thread prefixes×4). Manage page + `ForumManageClient.tsx` (three per-forum sub-panels: access grants with role/group/user segmented control, moderators, thread prefixes). Key: Q2 — 'user'→'individual' mapping at call site (UI label vs DB grant_type value); Q3 — `adminUsers` prop in ForumManageClient unused (server-side search used instead). 5 files. Commit c1c7328.

**30BN-FORUMS.3 ✓** `types/forums.ts` 4 new types (ForumSummary, CategoryWithForumSummary, ThreadSummary, ForumDetail — 133 lines, 14 types total). `lib/data/forums.ts` (new — NO 'use server', accepts supabase as param; private `getAccessibleForumIds()`, `canAccessForum()`, `isForumModerator()`, `getForumIndexData()`, `getThreadListData()` — TypeScript-join approach for three-way OR access check; parallel-fetched grants + group memberships resolved in JS, not in Supabase query). `lib/actions/forums.ts` (`getForumIndex()`, `getThreadList()`, `markThreadRead()` batch upsert, `markAllForumRead()` — all `getServerClient()` only). Real forum index page replacing stub. `ForumIndexClient.tsx`. `/crew/forums/[forumId]/page.tsx`. `ThreadListClient.tsx` (pinned sections, prefix badges, mark-all-read). First-pass lint+tsc clean (no pre-commit fixes). Q2: archived forums excluded from index for all roles including SA/OA (is_archived=false filter is unconditional — correct behavior). 7 files. Commit 5c95810.

**30BN-FORUMS.4 ✓** `types/forums.ts` 3 new types (ForumPostAttachment + signed_url field, ForumPostWithDetails, ThreadViewData — 185 lines, 17 types total). `lib/audit.ts` forum_post.create + forum_post_attachment.upload. `lib/actions/forum-posts.ts` (`FORUM_POST_SANITIZE_OPTIONS` exported constant; `getThreadWithPosts()` — parallel fetch, single-batch signed URL generation, no client-in-loop; `getPostAttachmentUploadUrl()` with mimeType input validation; `createForumPost()` — temp-key move pattern; `toggleThreadSubscription()`). Thread view page (forumId URL mismatch check → notFound(); `markThreadRead()` called on load). `ThreadViewClient.tsx` (breadcrumbs, subscribe toggle, sanitized HTML, attachments, locked notice, composer slot). `ForumPostComposer.tsx` (7th sanctioned XHR file — sequential upload mirroring InventoryPhotoUploader.tsx `uploadWithProgress()` pattern; 11-button toolbar adding H3+Blockquote to BlastComposer's 9). Two real lint warnings caught and fixed pre-commit. Q1: mimeType param given real job (input validation); Q2: forumId prop unused in ForumPostComposer (cleanup candidate — removed FORUMS.5). 6 files. Commit b21b3a4.

**30BN-FORUMS.5 ✓** `lib/audit.ts` 8 new AuditAction types (forum_thread.create/lock/unlock/pin/unpin/move, forum_post.edit/delete). `lib/actions/forum-moderation.ts` (new — 8 actions: createThread, lock/unlock, pin/unpin, moveThread (SA/OA only), editPost, deletePost idempotent soft delete; private `isModeratableBy()` helper). `lib/email.ts` `sendForumNotificationEmail()` added (uses `sendBatchEmails()` per R8 — Q2 fix; `resolveEmailSettings()` required — no hardcoded hex; `escapeHtml()` on posterName + threadTitle; `logEmailSent()` after send; `sentBy: null`; `getAdminClient()` internal; poster excluded from subscriber fetch via `.neq('admin_user_id', post.author_id)`). Non-blocking void IIFE call site added to `createForumPost()` in forum-posts.ts. `getForumsForMove()` added to forum-admin.ts. `ThreadListClient.tsx` — New Thread button + shadcn Dialog modal with prefix selector, title, 11-button TipTap editor (no file attachments on thread creation — Brief spec confirmed). `ThreadViewClient.tsx` — per-post edit (shared editor, async `setContent()` in click handler per AUDITIONS.2c F7 pattern) + delete controls + moderation bar (lock/pin/move). `ForumPostComposer.tsx` — dead `forumId` prop removed (Q2 FORUMS.4 cleanup). `HelpContent.tsx` — full 4-subsection Forums section replacing stub (forums-overview/threads visible to all roles including production; forums-access/moderation SA/OA only). All 17 sections now have full content. Key fixes before commit: Q1 — `buildEmailHtml()` and `logEmailSent()` real signatures read before writing (pseudocode signature was wrong); Q2 — per-subscriber loop replaced with `sendBatchEmails()` per R8; Q3 — `Editor | null` explicit typing required (ReturnType<typeof useEditor> picks wrong overload when immediatelyRender: false). 9 files (1 new, 8 modified). Commit e41f66f. Phase FORUMS complete. Post-build fix: FORUMS.5-FIX (commit 02f4569) — FORUM_POST_SANITIZE_OPTIONS was exported as a plain object from lib/actions/forum-posts.ts, a 'use server' file. Next.js/Turbopack enforces that 'use server' files may only export async functions — plain object exports cause a Vercel build failure that does not surface in npm run lint or npx tsc --noEmit (local tooling does not catch this class of error). Fixed by extracting the constant to lib/actions/forum-post-sanitize.ts (no 'use server') and updating both import sites (forum-posts.ts, forum-moderation.ts). Full audit of all 'use server' files confirmed zero other violations. 3 files.

### Phase CAST — Cast Member Portal (post-launch)

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
All feature flag reads in the codebase must go through `getFeatureFlags()` in `lib/feature-flags.ts`. This helper fetches all `feature_*` keys from `app_settings` in a single query and returns a typed object. Never fetch individual feature flag keys inline with separate `app_settings` queries. This ensures: (1) all flags are fetched in one round trip, (2) the typed return object prevents typos in key names, (3) missing keys are handled consistently. Middleware checks flags for route-level blocking; sidebar conditionally renders links based on flags passed as props from layout; individual pages receive flags as props or re-fetch via the helper. Established Phase SETUP design; built SETUP.1. **Client-agnostic signature (corrected DOC.61):** `getFeatureFlags(supabase: SupabaseClient)` accepts any Supabase client as a parameter and never constructs its own — it does NOT call `getServerClient()` internally. Public-route and cron contexts pass `getAdminClient()`; authenticated admin contexts pass `getServerClient()`. The function works correctly in any calling context; the caller is responsible for supplying the appropriate client. grep exclusion: The inline flag-key-name grep check in Process §10 must exclude `components/crew/settings/SetupPanel.tsx` (in addition to `lib/feature-flags.ts` and `lib/actions/setup.ts`) — the Setup Panel UI uses flag key name strings as FormData keys to build the toggle controls, which is the sanctioned use of those strings in that file and does not constitute an inline flag read.

### R33 — After Phase THEME: CSS Custom Properties for Brand Colors, Not Tailwind Utility Classes
After Phase THEME ships, all components that reference brand-driven colors (`bg-navy`, `text-orange`, `border-navy`, `hover:bg-navy`, etc.) must use CSS custom properties (`var(--brand-primary)`, `var(--brand-accent)`) via inline styles or a small set of CSS utility classes in `globals.css` that reference these variables. Static Tailwind brand color utility classes are no longer permitted in new code after THEME ships — they reference static hex values and cannot respond to `app_settings` color changes. The `@theme` block in `globals.css` is NOT modified (R7 still applies — structural and non-brand colors stay as static hex in `@theme`). Phase THEME.A audits all current usages before any replacements are made. Established Phase THEME design (not yet built — enforced from THEME.1 onward).

**@theme neutral tokens (STYLE.A):** `--color-neutral-surface`
and `--color-neutral-border` are static @theme tokens.
Tailwind v4 auto-generates their utility classes
(`bg-neutral-surface`, `border-neutral-border`,
`dark:bg-neutral-surface`, etc.) — no hand-authoring in
`@layer utilities` needed or appropriate. The `--color-`
prefix is required for this auto-generation; tokens without
it produce inert custom properties only.

### R34 — All Non-Core Features Must Be Built Flag-Ready

Any feature added after Phase SETUP ships that a client might reasonably not want or pay for separately must be built flag-ready at the time of initial build — not retrofitted later. Flag-ready means: (1) a feature_X key exists in app_settings with a default value seeded in the migration; (2) getFeatureFlags() in lib/feature-flags.ts returns the flag in its typed object; (3) proxy.ts blocks the route when the flag is 'false'; (4) the sidebar link renders conditionally based on the flag; (5) any public routes associated with the feature return 404 when the flag is off; (6) any server action that is the exclusive entry point for the feature returns early with an error when the flag is off (defense in depth). Definition of "non-core": features beyond volunteer management, show/slot management, user management, forms, media library, hours & milestones, standing opportunities, and the Call Board. Current flagged features: Calendar (`feature_calendar`), Check-In (`feature_checkin`), Email Blast (`feature_blast`), Rehearsal Management (`feature_rehearsals` — Phase 21), Audition Management (`feature_auditions` — Phase AUDITIONS), Inventory Management (`feature_inventory` — Phase INVENTORY), Internal Forums (`feature_forums` — Phase FORUMS). When in doubt, build flag-ready — adding a flag is cheap, retrofitting guards is expensive. Established this session; enforced from SETUP.4 onward.

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

**Left border accent pattern (STYLE.6):** To apply a
brand-primary left border accent without overriding all
four border sides, use `border-l-4` (Tailwind native —
sets left border width) combined with
`style={{ borderLeftColor: 'var(--brand-primary)' }}`
(inline style — sets color via CSS custom property). Never
use `border-brand-primary` alongside a full `border` class
— `border-brand-primary` sets `border-color` on all four
sides, overriding the neutral border on other sides.

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

**Tailwind purge risk for width and color classes
(STYLE.3/STYLE.6):** Any Tailwind class assembled from
computed values at runtime is invisible to the content
scanner and will be purged from the production bundle.
This applies to progress bar widths (`w-[87.5%]`,
`w-[58.3%]`) and fill colors (`bg-green-500`,
`bg-yellow-400`, `bg-red-500`) — each must appear as a
complete unbroken string literal in JSX. Never construct
class names via template literals or array joins even when
the pieces are all literals. This is the same root cause
as the R36 `@layer utilities` missing-rule gap — both
produce silent CSS failures.

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

### R39 — SQL Policy Naming Convention
Migration policy names use **unquoted snake_case with table prefix** (e.g.
`message_threads_select_participant`, not `"select_participant_threads"`).
`TO authenticated` on every policy. `WITH CHECK` mirrors `USING` on UPDATE
policies. When a prompt specifies a different naming style, the live file's
convention (read in Task A of the migration prompt) takes precedence — confirmed
MESSAGES.1 deviation from prompt draft. Always read the nearest prior migration
before writing a new one.

### R40 — Server Action .bind() Type Assertion for Form Actions
Server Actions bound via `.bind(null, id)` and passed to `<form action>`
require `as unknown as (formData: FormData) => Promise<void>` when the
action's return type is non-void. A single direct cast produces TS2352
("insufficient overlap") — route through `unknown` as TypeScript itself
recommends. This is not a general `@ts-ignore` suppression. It is the only
compliant path when: (a) the action returns a value type (e.g. `{ error?: string }`),
(b) the action is bound with `.bind()`, and (c) the result is passed to a form
action prop. Established MESSAGES.4 F2.

**resolveLayoutSettings() — renamed from resolveBrandColors() (TZ.1):**
`resolveBrandColors()` in `app/layout.tsx` was renamed to `resolveLayoutSettings()`
and extended to also fetch `org_timezone`. Its return type now includes
`timezone: string` alongside the brand color fields. Any reference in future
prompts or documentation to `resolveBrandColors()` should be updated to
`resolveLayoutSettings()`. The function is internal to `app/layout.tsx` and
not exported.

**getOrgTimezone(supabase) — org timezone resolution pattern (TZ.1):**
`getOrgTimezone(supabase: SupabaseClient): Promise<string>` in
`lib/utils/org-timezone.ts`. Accepts any Supabase client as its first parameter
(companion-module pattern — caller constructs the client, the helper never
creates its own). Returns the `org_timezone` value from `app_settings`, or
`'America/Chicago'` as fallback. Used by all server-side entry points that need
the org timezone. Client Components read `document.body.dataset.timezone ||
'America/Chicago'` instead (injected by `resolveLayoutSettings()` at root
layout render time). SSR guard required for Client Components:
`typeof document !== 'undefined' ? document.body.dataset.timezone ||
'America/Chicago' : 'America/Chicago'`

**formatCT() / formatWallClockCT() timezone parameter (TZ.1):**
Both functions now accept an optional final `timezone?: string` parameter
defaulting to `'America/Chicago'`. All 165 existing call sites remain valid
unchanged — they simply continue to use CT by default until explicitly updated
in the Phase TZ sweep prompts. New call sites and updated sweep call sites pass
the resolved `tz` value as the final argument.

**Client-before-usage reordering (Phase TZ recurring pattern):**
Multiple files in the TZ sweep had their Supabase client constructed lazily
(mid-function, after the first CT-dependent computation). Adding `const tz =
await getOrgTimezone(supabase)` before those computations required moving
`getServerClient()` / `getAdminClient()` calls to the top of the function.
This is safe in all cases — `getServerClient()` / `getAdminClient()` have
no ordering dependency on anything preceding them in these functions. Detected
in: `calendar.ts` (3 functions), `app/calendar/page.tsx`,
`app/crew/(app)/calendar/page.tsx`, `lib/actions/checkin.ts` (2 functions).

**`useNowPosition()` hook timezone parameter (TZ.5b):**
`useNowPosition(days, timezone)` in `UnifiedWeekGrid.tsx` is the only custom
hook in this codebase that accepts a `timezone: string` parameter. The hook
uses `timezone` inside a `useEffect` to compute the current-time red-line
indicator position. Key constraints:
- `timezone` must be in the `useEffect` dependency array — it's a genuine dep
  (a timezone change should trigger a re-run of the indicator calculation)
- The existing `// eslint-disable-next-line react-hooks/exhaustive-deps`
  comment is preserved verbatim — it covers the intentional exclusion of
  `days` (not `timezone`). Do NOT add `timezone` to the disable exemption
- At the call site: `useNowPosition(days, tz)` where `tz` is the
  SSR-guarded body attribute read at the top of `UnifiedWeekGrid`

**Module-level helper timezone parameterization (TZ.5b):**
When a module-level pure helper function (outside a component function body)
needs the org timezone, add `timezone: string` as a parameter — do NOT read
`document.body.dataset.timezone` inside a module-level function. Module-level
code may execute at initialization time before the DOM is available. Confirmed
for `eventDateLabel(timezone)` in `PendingQueueClient.tsx` and similar helpers
in `ManualHoursForm.tsx`, `AuditionsListClient.tsx`, `RehearsalsListClient.tsx`,
`ShowList.tsx`. The component function reads `tz` via the SSR-guarded body
attribute at the top of its body, then passes `tz` into module-level helper
calls.

**TZ.5b split-state pattern (established TZ.5b):**
Two calendar Client Components (`CalendarDayPanel.tsx`, `PendingQueueClient.tsx`)
were in a split state after TZ.5a: each had a TZ.5a `const tz = ...` SSR-
guarded read for `formatCT`/`formatWallClockCT` calls, but still had a module-
level `const CT = 'America/Chicago'` for their direct `date-fns-tz` calls
(TZ.5b scope). The correct approach: remove `const CT`, reuse the existing
`tz` variable. Do NOT add a second SSR-guarded `tz` read — exactly one
`document.body.dataset.timezone` read per Client Component, at the top of the
function body.

**Sibling helper asymmetry audit (lesson from TZ.5b):**
`PendingQueueClient.tsx` had two sibling module-level helpers: `eventTimeLabel()`
was parameterized with `timezone` in TZ.5a; `eventDateLabel()` was not,
because TZ.5a fixed `formatCT`/`formatWallClockCT` calls and `eventDateLabel`
used direct `date-fns-tz`. This left the two helpers inconsistent until TZ.5b.
Lesson: when parameterizing any helper function in a file, audit ALL sibling
helpers in the same file for the same pattern. Leaving one parameterized and
one using a hardcoded const creates an inconsistency that produces no error
and is easy to miss.

**Maintenance Mode gate position in proxy.ts (MM.1):**
The maintenance mode check must fire before ALL other
proxy.ts logic — before `needsFlagCheck`, before flag
fetches, before role-based route guards. Its position
immediately after `const { pathname } = request.nextUrl`
and before the `needsFlagCheck` comment/block is
intentional and must be preserved. Any future proxy.ts
edit that adds logic before the maintenance gate would
break the kill-switch guarantee (a maintenance-mode
check that fires after a flag block could be bypassed
when a flag redirects before the maintenance check runs).

**`/crew/maintenance` page location — R20 exception
(MM.1):**
`app/crew/maintenance/page.tsx` is placed directly at
`app/crew/maintenance/` — NOT inside `app/crew/(app)/`
as R20 requires for all crew pages. This is an
intentional, documented exception. The maintenance page
must render WITHOUT the sidebar/topbar crew layout shell
because it is shown to logged-in non-SA users who are
blocked from the crew backend. Placing it inside `(app)`
would render the full admin UI around the maintenance
message, which is incorrect. This is the only `/crew/*`
page that intentionally lives outside the `(app)` route
group.

**`SaveStatus` type in SetupPanel.tsx — 'saved' not
'success' (MM.2 Q1):**
The `SaveStatus` type in `SetupPanel.tsx` is `'idle' |
'saving' | 'saved' | 'error'`. The success state is
`'saved'`, not `'success'`. `SaveFeedback` renders "✓
Saved" only when `status === 'saved'` — passing `'success'`
produces no visible feedback and fails tsc. Any new
sub-component in SetupPanel.tsx must use `useState<
SaveStatus>('idle')` and call `setStatus('saved')` on
success. Do not declare an inline status union type.

**`settingsMap` in setup/page.tsx is a Map instance
(MM.2 Q1):**
`settingsMap` in `app/crew/(app)/settings/setup/page.tsx`
is constructed as a `Map` instance. Access must use
`.get('key')`, not bracket notation `settingsMap['key']`
— bracket access on a Map always returns `undefined`
silently. Any new key added to the initialValues mapping
block must use the `.get()` pattern with a `|| ''`
fallback per R18.

**`ActionResult` discriminated union narrowing (MM.2 Q1):**
`ActionResult` in this codebase is a discriminated union
— the success branch has no `error` field. Narrowing
with `result?.error` compiles but may not type-check
correctly and produces incorrect behavior on the success
branch. Use `'error' in result` to narrow to the error
branch before accessing `result.error`. This is the
correct TypeScript pattern for discriminated unions and
is now the established convention for all Setup Panel
`handleSave()` functions.

**`revalidatePath()` and `revalidateTag()` are prohibited
during component render (FORUMS-FIX):**
These functions may only be called from within a Server
Action invocation or a Route Handler. Calling them in a
Server Component function body that is executing as part
of a page render throws a Next.js runtime error: "Route
used revalidatePath during render which is unsupported."
This error bubbles to `app/error.tsx` and displays as a
generic "Something went wrong" with no diagnostic detail.
It is completely invisible to lint and tsc. The confirmed
failure: `page.tsx` called `await markThreadRead()` in the
render body; `markThreadRead()` internally calls
`revalidatePath()`. Fix: move to a client-side `useEffect`
with the appropriate dependency array. Any server action
that calls `revalidatePath()` must only be invoked from
client-initiated Server Action calls (onClick, form
action, etc.) — never from a Server Component's render
function body. Established FORUMS-FIX.A.

**`app/error.tsx` must log the caught error (FORUMS-FIX.B):**
The error boundary component should include
`useEffect(() => { console.error('Runtime error caught
by error boundary:', error) }, [error])` and must
destructure `error` from the component props (not just
`reset`). Without this, diagnosing runtime errors that
bubble to the error boundary requires extensive static
analysis with no stack trace. The original `app/error.tsx`
had `error` in the function signature type but never
destructured or used it. Established FORUMS-FIX.B.

**`ShowCard` is defined inline inside `ShowList.tsx` —
not a separate file (SHOWDELETE.A/SHOWARCHIVE.A):**
`ShowCard` is a component defined inside `ShowList.tsx`
at `components/crew/shows/ShowList.tsx`. It is NOT a
separate file at `components/crew/shows/ShowCard.tsx`.
Any audit that looks for it as a separate file will not
find it. State for ShowCard mutations (`isToggling`,
`archivingId`, undo state) lives in `ShowList` (parent)
and is passed down as props — same pattern for all.
Established SHOWDELETE.A/SHOWARCHIVE.A.

**`ShowDetail.tsx` SettingsTab state belongs inside
`SettingsTab`, not root `ShowDetail` (SHOWDELETE.1):**
The root `ShowDetail` component does not call
`useRouter()` — each tab component (SettingsTab,
VolunteersTab, NotificationsSection) has its own local
`const router = useRouter()`. State and handlers for
mutations in the Settings tab (e.g., Delete state,
handlers) must be defined inside `SettingsTab` where
`router`, `show`, and `canEdit` are all in scope.
Placing them in the root component leaves them out of
scope for the JSX that uses them. Established SHOWDELETE.1
(Task A6 correction).

**`ShowForm.tsx` vs `ShowDetail.tsx` — two different
pages (SHOWARCHIVE.A):**
These are completely different files serving different
purposes. `ShowForm.tsx` is the show creation/editing
form (reached via "Edit Show" or "New Show"). It had
"Save & Publish" / "Save as Draft" buttons that hardcoded
the status value, ignoring the Status dropdown. Fixed in
SHOWARCHIVE.1. `ShowDetail.tsx` is the tabbed show detail
page (Overview, Dates, Volunteers, Settings tabs). It
already had a correct "Save Status" button calling
`updateShowStatus(show.id, statusValue)`. Never confuse
the two — an audit of `ShowDetail.tsx` for the status
button bug will find nothing wrong. Established
SHOWARCHIVE.A/SHOWARCHIVE.1.

**`attendance` table has NO ACTION FK to `shows.id`
(SHOWDELETE.A F1):**
`attendance` has two separate NO ACTION FKs: one to
`shows.id` directly, and one to `show_dates.id`. The
`slot_claims` check alone is insufficient to prevent a
raw Postgres FK violation — any show with even one
attendance record will throw on `DELETE FROM shows`.
The application must check `attendance.show_id = showId`
and block with a clear error BEFORE the DELETE. CASCADE
chain: `show_dates` CASCADE from `shows`; `slot_claims`
CASCADE from both `show_dates` and `volunteer_roles`;
`attendance` NO ACTION from both `shows` and `show_dates`.
`auditions` and `inventory_checkouts` SET NULL (harmless).
Established SHOWDELETE.A F1.

**`saveFeatureFlags()` requires six wiring points per
new flag, not four (ANNOUNCE.2 A4 correction):**
`saveFeatureFlags()` in `lib/actions/setup.ts` uses a
different internal pattern than other setup actions. It
does NOT use `upsertSetting()` per key. Instead: (1)
each flag is individually extracted from `formData.get()`;
(2) all flags are validated together via
`isValidFlagValue()` (a strict type-guard requiring
exactly `'true'` or `'false'`); (3) a single batched
`.upsert([...array...])` call writes all flags at once;
(4) individual `revalidatePath()` calls for each flag-
gated route; (5) one `logAction()` with explicit before/
after objects listing all flags. Adding a new flag
requires all six wiring points: (1) extract from formData,
(2) add to isValidFlagValue() validation, (3) add to
upsert array, (4) add to logAction() before AND after
diff objects (two locations), (5) add revalidatePath().
Established ANNOUNCE.2 (Task A4 audit correction).

**`AnnouncementSection` is self-loading — no initial
value props needed (ANNOUNCE.2):**
Unlike all other `SetupPanel.tsx` sub-components which
receive their initial values via `SetupPanelInitialValues`
from `settingsMap`, `AnnouncementSection` is a self-
loading component with no props. It loads its own initial
content via a single `useEffect([editor])` that calls
`getAnnouncementContent()` from `lib/actions/announcements.ts`
and uses the result to initialize the TipTap editor via
`editor.commands.setContent()` and `selectedRoles` state.
This is required because `dashboard_announcement_body`
and `dashboard_announcement_roles` are NOT in `SETUP_KEYS`
and not in the `settingsMap`/`initialValues` pattern —
they are managed by `saveAnnouncement()` directly.
Established ANNOUNCE.2.

**Hide-not-lock rule for Settings hub cards (ADMIN.49):**
Cards on `app/crew/(app)/settings/page.tsx` for SA/OA-only
destination pages use `{canAccessAdminSettings && <LinkedCard/>}` —
no `LockedCard` fallback. The `LockedCard` function has been
removed from `settings/page.tsx`. New standing rule: if the
destination page is SA/OA-only or SA-only, the hub card is
completely hidden from other roles. Cards whose destination
page is accessible to Editors (e.g., a future editor-specific
tool) may still render for Editors. The Settings hub page
itself redirects all non-SA/OA roles before JSX renders —
any role-specific card conditions in JSX are only meaningful
for OA vs SA distinctions.

**`resolveGroupHrefs()` — self-healing nav order merge
(ADMIN.49):**
Added to `Sidebar.tsx`. When a saved `sidebar_nav_order` DB
row exists for a group, `resolveGroupHrefs()` merges it with
the current `GROUP_HREF_DEFAULTS` by appending any hrefs
present in defaults but absent from the saved array. This
prevents any future nav link addition from being silently
hidden for an SA who has a saved custom order from before
the new link was added. Applied to all four groups in the
`.map()` render loop. The stale DB row is not modified —
missing hrefs are appended at render time.

**Settings access rule (ADMIN.50):**
`/crew/settings` (hub) and `/crew/settings/audit-log` are
SA/OA only. Hard-blocked at `proxy.ts` (exact match for hub
— `pathname === '/crew/settings'`; prefix match for audit-log
— `pathname.startsWith('/crew/settings/audit-log')`). Both
use the session-scoped client (same pattern as Setup + Style
Sandbox guards). Server-side redirect guard also added to
`settings/page.tsx` (`if (!canAccessAdminSettings) redirect()`).
`audit-log/page.tsx` tightened from Viewer-only-block to
full SA/OA-only guard. Editors, Viewers, and Production
are all redirected to `/crew/dashboard`.

**Conditional Inventory Management sidebar link (ADMIN.50):**
`showInventorySettings?: boolean` prop added to Sidebar
(SidebarProps interface + destructured default `false`).
Computed in `layout.tsx` as `admin.role === 'editor' &&
admin.inventory_manager === true` and threaded to `<Sidebar>`.
Rendered as a special-case conditional append inside the
settings group render block — NOT part of `SETTINGS_HREFS`,
`FLAG_GATED_HREFS`, or `DEFAULT_LINK_ORDER`. Visible only
to Editors with `inventory_manager = true`. SA/OA reach
Inventory Settings via the Settings hub; they do not get
this sidebar link. Icon: Package (same as Utilities-group
Inventory link). `/crew/settings/inventory` →
`'Inventory Management'` added to `HREF_LABELS` in
`types/sidebar.ts`.

**`feature_beta` — opt-in-by-default flag (Phase BETA):**
`feature_beta` is the second flag (after `feature_messages`)
that seeds as `'false'` (opt-in rather than opt-out). The
`!== 'false'` evaluation logic means a missing key evaluates
as enabled — an explicit `'false'` seed is required to
disable at initialization. In `setup/page.tsx`, uses
`|| 'false'` fallback (not `|| 'true'`). In `SetupPanel.tsx`,
state initialized as `initialValues.feature_beta === 'true'`
(not `!== 'false'`). Toggle in Platform Setup → Feature Flags
section as the 10th toggle (9th FeatureFlags-type flag —
`announcements_oa_enabled` is not a FeatureFlags field).

**`SeasonAtAGlance.tsx` is a self-contained Server Component
(ADMIN.52):**
`SeasonAtAGlance.tsx` fetches its own show data internally via
`getServerClient()` — no show data is passed from
`dashboard/page.tsx` as props. The `timezone` prop IS passed
from the page (already resolved via `getOrgTimezone(supabase)`)
to avoid a redundant `app_settings` query. Any future edit to
the dashboard data flow must account for this architecture: the
component is not dependent on the page's data fetch, but it does
depend on the `timezone` prop for its date comparison logic.
`totalShowCount` / `displayedShowCount` are also computed as
local constants inside the component — no new props were needed
to support the truncation note.

**`visibleNotifications` filter pattern for NotificationPanel
(ADMIN.53):**
When a notification type must be excluded from both the rendered
list AND the bell badge count, the correct approach is a single
derived constant:
```typescript
const visibleNotifications = notifications.filter(
  n => n.type !== 'direct_message'
)
```
Drive both the rendered list AND `unreadPersistent` from
`visibleNotifications`. Do NOT maintain a separate server-computed
count for this — it will diverge from the client-filtered array
after any optimistic update (mark-read removes items from local
state, so the server count becomes stale immediately). The bell
badge must be `totalEphemeral + unreadPersistent` where
`unreadPersistent = visibleNotifications.filter(n => !n.read_at).length`.
Established ADMIN.53.

**TipTap click-to-focus — CSS custom property + wrapper onClick
(ADMIN.54):**
When a TipTap editor must fill its container so that clicking
anywhere in the editor area (including empty space below content)
focuses the editor, the fix requires TWO things applied together:
(1) A `min-height` applied to `.ProseMirror` via a wrapper class
in globals.css — NOT to `<EditorContent>` or its outer `<div>`
(which never reach the contenteditable element). Use a CSS custom
property to preserve per-caller configurability:
```css
.dm-editor-wrapper .ProseMirror {
  min-height: var(--dm-min-height, 100px);
  outline: none;
}
```
Inject the value via inline `style={{ '--dm-min-height': minHeight } as CSSProperties}`.
(2) `onClick={() => { if (!disabled) editor?.commands.focus() }}`
on the wrapper div — forwards clicks in empty space to the
editor. Both parts are required: the CSS ensures the clickable
area is tall enough, the onClick ensures clicks in that area
actually focus the editor. The globals.css rule is added as a
plain rule outside `@layer utilities` — it targets a
TipTap-rendered element that cannot be addressed via Tailwind
directly. Established ADMIN.54.

**`public/fonts/` convention for vendored font files (ADMIN.56-FIX):**
When a server-only file (e.g., `lib/qr.ts`) needs to use a
font file for SVG rasterization via `@resvg/resvg-js`, bundle
the font at `public/fonts/[font-name].ttf` in the repo. Reference
it at runtime via:
```typescript
import path from 'path'
import { existsSync } from 'node:fs'

const fontPath = path.join(process.cwd(), 'public', 'fonts', 'banner-font.ttf')
const fontFileExists = existsSync(fontPath)
```
`process.cwd()` is a runtime expression — Turbopack cannot
statically resolve it at build time and will NOT attempt to
import the `.ttf` as a module. Files in `public/` are included
in Vercel deployments and are readable at runtime via
`process.cwd()`. Use TTF or OTF format — `@resvg/resvg-js`
does not support WOFF or WOFF2 (web-compressed formats). Only
pass font options to `Resvg` when the font is actually needed
(e.g., only when `trimmedBanner` is truthy) — the no-banner
path should omit font options entirely. Established ADMIN.56-FIX.
First instance: `public/fonts/banner-font.ttf` (Inter Regular
v4.0, SIL Open Font License, 398KB).

**Turbopack `createRequire().resolve()` on literal strings causes
build failures (ADMIN.56-FIX):**
`createRequire(import.meta.url).resolve('some/path/file.ttf')`
with a literal string argument is statically analyzed by
Turbopack at build time. Turbopack follows the literal path,
finds the target file, and attempts to import it as a module. If
the file has no registered module type (e.g., `.ttf`), the build
fails with "Unknown module type." This class of build failure
passes `npm run lint` and `npx tsc --noEmit` cleanly — it only
surfaces as a Vercel deployment failure. The fix: any path that
must be resolved at RUNTIME rather than build time must use a
runtime expression (e.g., `process.cwd()`, a variable, template
literal with a variable) rather than a literal string in
`require().resolve()` or `import.meta.resolve()`. Established
ADMIN.56-FIX.

**`@resvg/resvg-js` silent font failure on serverless Linux
(ADMIN.56):**
`@resvg/resvg-js` defaults to `font: { loadSystemFonts: true }`.
On a developer machine, this works silently. On Vercel's minimal
serverless Linux runtime, there are no system fonts — the flag
silently succeeds (no error thrown) but discovers zero fonts,
resulting in zero glyph rendering. SVG text elements render as
empty space. The failure is invisible at the SVG level (the
`<text>` element is present) and invisible in the rasterized
PNG (non-white pixels exist from the decorative shapes around
the text, but the glyphs produce no pixels). Diagnosis requires
a pixel-count comparison test. The fix: always supply an
explicit font file via `font: { loadSystemFonts: false, fontFiles: [fontPath] }`
when text rendering is required. See `public/fonts/` pattern
above. Established ADMIN.56/ADMIN.56-FIX.

**Migration files live at the repo root (confirmed ADMIN.57):**
All migration SQL files in this project are stored at the repo
root (e.g., `039_maintenance_mode.sql`, `043_beta_feedback.sql`,
`044_maintenance_restoration.sql`) — NOT under
`supabase/migrations/` as Supabase's default CLI convention
suggests. Any prompt that specifies a migration file path of
`supabase/migrations/[name].sql` is incorrect for this project.
Always place migration files at the repo root and follow the
naming convention of existing files (e.g., `044_...sql`).
Confirmed when ADMIN.57's prompt specified `supabase/migrations/`
and Claude Code correctly adapted to the actual project
convention. Established ADMIN.57 F1.

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

*v4.8 (August 2026 — DOC.61 correction: §13 R32 updated — getFeatureFlags(supabase) client-agnostic signature documented; false getServerClient() association corrected; Brief header bumped to v4.8; DOC.61 logged)*

*v4.9 (August 2026 — DOC.63: Phase INVENTORY + Phase FORUMS added as confirmed pre-launch builds: §1 current phase updated; §2 inventory_manager terminology row added; §8 Inventory Management section added (full forward spec: access model, item records, categories/locations, checkout system, QR tags, prompt structure, key files); §8 Forums section added (full forward spec: access grants, user groups, thread/post structure, TipTap rich editor, file attachments, subscriptions, unread tracking, moderation, prompt structure, key files); §8 Setup Panel Section 6 updated (5 → 7 toggles, feature_inventory + feature_forums added); §9 admin_users: inventory_manager boolean column + NOTE added (Migration 034); §9 app_settings: feature_inventory + feature_forums seed blocks added (SETUP keys 19 → 21, fetch count 20 → 22); §9 next migration pointer updated (033 required, then 034 + 035 pending); §11 Phase INVENTORY + Phase FORUMS sections added (prompt structures, migration numbers, new table counts, sanctioned XHR files); §11 Phase CAST updated from "post-Phase 21" to "post-launch"; §11 Phase 17.1 flag count updated (5 → 7); §13 R34 flagged features list updated (feature_inventory + feature_forums added); DOC.63 logged)*

*v5.0 (August 2026 — DOC.64: §1 current phase updated (033 applied, INVENTORY.1 complete, INVENTORY.2–5 pending); §7 Phase AUDITIONS proxy block corrected — /crew/auditions Production exception attribution changed from AUDITIONS.2a to ADMIN.43 (the fix was missing from the AUDITIONS.2a commit and applied separately); §7 Phase INVENTORY proxy.ts additions block added (needsFlagCheck + crew flag block, no Production exception); §8 User Management: inventory_manager toggle documented (INVENTORY.1 — Editor rows only, toggleInventoryManager(), logged as user.inventory_manager_change in types/audit.ts); §8 HelpContent NOTE: TOOLTIP_ANCHOR_MAP pattern documented (replaces hardcoded || ternary — INVENTORY.1 refactor); §8 Help System: 15 → 16 sections, Inventory anchors added, Production exclusion noted; §9 Migration 033 status block added (applied DB-VERIFY.5); §9 Migration 034 status block added (applied INVENTORY.1 — 8 tables + inventory_manager column); §9 next-migration pointer updated (035 next); §9 Migration 032 inline fix NOTE updated (five fixes now captured in 033, drift resolved); §11 Phase INVENTORY: 8 tables (not 9 — prompt miscount corrected); INVENTORY.A + INVENTORY.1 build summaries added; §11 prompt log: DB-VERIFY.5/033 + ADMIN.43 + INVENTORY.A + ADMIN.44 + INVENTORY.1 all logged; §13 version history ordering corrected (v4.9 was inserted before v4.8/v4.7 in DOC.63 — reordered to chronological ascending); DOC.64 logged)*

*v5.1 (August 2026 — DOC.66: Phase INVENTORY complete — §1 current phase updated (INVENTORY complete, FORUMS next); §8 User Management inventory_manager toggle: types/audit.ts corrected to lib/audit.ts (inaccuracy introduced DOC.64); §8 Settings hub table: Inventory Management card added (INVENTORY.2); §8 Inventory Management: prompt structure updated (all 6 prompts ✓); key files list replaced (pending → built, 17 files total; route.ts corrected to route.tsx — F1 INVENTORY.5; lib/audit.ts corrected from types/audit.ts — F1 INVENTORY.2; types/inventory.ts, InventoryTagsPDF.tsx, CheckoutModal.tsx added; types/admin.ts + lib/auth.ts unplanned additions documented); §8 Help System: Inventory stub note removed; HelpTooltip count 40 → 42 (inventory-checkout + inventory-tags added INVENTORY.5); §9 lib/audit.ts AuditAction location note added (admin_users schema block); §9 media bucket: inventory/ path namespace added + storage dual-client pattern noted (Edit 10 adapted to the live prose-paragraph format at line 148 — the prompt's bulleted-list old_str did not exist in the Brief; it matched the Process document's format instead); §11 Phase INVENTORY: INVENTORY.1 summary corrected (lib/audit.ts not types/audit.ts); INVENTORY.2–5 full build summaries added; §11 prompt log: INVENTORY.2–5 logged; DOC.66 logged)*

*v5.2 (August 2026 — DOC.68/DOC.69: Phase FORUMS complete — §1 header + current phase updated (FORUMS complete, Phase 17 next); §2 Production row updated (forums access added); §3 TipTap useEditor overload caveat added (Editor | null explicit typing required — FORUMS.5 Q3); §5 media bucket forums path namespace added; §7 Production roles table updated (/crew/forums added), Phase FORUMS proxy.ts additions block added (needsFlagCheck, Production exception, crew flag block — no matcher, no public block); §8 Internal Forums section: pending → complete, prompt structure all ✓, key files list replaced (17 files total); §8 Settings hub User Groups card added (FORUMS.1, canAccessAdminSettings gate); §8 Help System: 16 → 17 sections, 42 → 43 HelpTooltips, forum anchors added, TOOLTIP_ANCHOR_MAP /crew/forums → 'forums' entry added, Production sidebar: Forums link + partial HelpContent visibility noted; §8 About System Emails: 15 → 16 triggers (forum_notification added); §8 Setup Panel setup/page.tsx key count corrected (18 → 22); §9 Migration 035 status block added; §9 12 forum table schema blocks added; §9 next migration pointer updated (036 — no pending migrations); §9 AuditAction types: 34 new forum_* types across FORUMS.1–5; §11 Phase FORUMS: forward spec → completed 6-prompt build summary (FORUMS.A–FORUMS.5 with commits and key findings); §11 header updated; §11 prompt log: FORUMS.A–FORUMS.5 + DOC.68 + DOC.69 added; DOC.69 logged)*

*v5.3 (August 2026 — DOC.71: FORUMS.5-FIX documented — §11 FORUMS.5 build summary extended with post-build fix note (FORUM_POST_SANITIZE_OPTIONS plain-object export from 'use server' file — Vercel build failure, not caught by local lint/tsc; fixed by extracting to lib/actions/forum-post-sanitize.ts, 3 files, commit 02f4569; full 'use server' audit confirmed zero other violations); §11 prompt log: FORUMS.5-FIX + DOC.71 added; DOC.71 logged)*

*v5.4 (August 2026 — DOC.72: Phase STYLE complete — §1
header + current phase updated (STYLE.A–STYLE.8, 9 prompts,
Phase 17 next); §3 Tech Stack: color.ts darkenHex() addition
noted; §6 Brand System: new CSS Custom Properties subsection
(9 derived tokens, 2 static @theme tokens, resolveBrandColors()
return shape, --color- prefix rule, :where() dark variant
pattern); §8 Settings hub table: Style Sandbox card added
(SA-only LinkedCard, no sidebar link); §8 new Phase STYLE
section (sandbox spec: access model, two sections, primitive
gallery 8 groups, 15 page mockups with full inventory, Option
A design patterns reference, named badge export pattern,
key files including 15 mockup components); §11 header
updated (Phase STYLE complete, Phase 17 next); §11 Phase
STYLE build summaries added (STYLE.A–STYLE.8, all 9 prompts
with commits and key findings); §11 prompt log: STYLE.A–
STYLE.8 + DOC.72 added; §13 R33 note added (--color- prefix
rule for @theme tokens, no @layer utilities hand-authoring
needed); §13 R35 note added (left border accent pattern:
border-l-4 + style={{ borderLeftColor }}); §13 R36 note
added (Tailwind purge risk for computed class strings,
progress bar width + color literals); DOC.72 logged)*
*v5.5 (August 2026 — DOC.73: Phase NOTIFY complete — §1
header + current phase updated (NOTIFY.A–NOTIFY.4-CLEANUP,
Phase 17 next); §8 User Management: pending registrations
badge note updated (count now in TopBar NotificationPanel
"Needs Action" section for SA/OA); §8 Settings hub:
Platform Setup row removed (card removed from hub, link
moved to sidebar bottom section SA-only — NOTIFY.1); §8
Help System: TOOLTIP_ANCHOR_MAP note updated (const removed
NOTIFY.4-CLEANUP — sidebar is now three-part atomic edit,
no HelpTooltips on sidebar nav links); §8 Forums: thread
subscriptions updated (sendForumNotificationEmail() returns
{ notifiedUserIds: string[] }, in-app notification created
per subscriber independently of email deliverability —
NOTIFY.3/NOTIFY.3-FIX); §8 new Notification System section
(full spec: two-track architecture, ephemeral items, 6
persistent types, NotificationPanel, forum unread badge,
key new/modified files, 6-prompt structure); §9 Migration
036 status block added (notifications table — 9 columns,
2 RLS policies, 3 indexes); §9 next migration pointer
updated (036 applied → 037 next); §9 consent_form_
submissions: reviewed_at pre-existence confirmed + note
added; §11 header updated (Phase NOTIFY complete, Phase 17
next); §11 Phase NOTIFY build summary added (NOTIFY.A–
NOTIFY.4-CLEANUP all ✓ with commits and key findings);
§11 prompt log: NOTIFY.A–NOTIFY.4-CLEANUP + DOC.73 added;
§13 TOOLTIP_ANCHOR_MAP removal note (if applicable);
DOC.73 logged)*

*v5.6 (August 2026 — DOC.74: Phase MESSAGES.A–4 documented — §1 current
phase updated (Phase MESSAGES in progress, MESSAGES.A–4 complete); §2
Production role updated (/crew/messages + /crew/users added); §8 Setup Panel
Section 6 updated (7 → 8 toggles, feature_messages added as first opt-in-
default flag defaulting to 'false'); §8 Notification System updated
(direct_message as 7th type, MessagesIcon documented, messageUnread in
NotificationCounts); §8 new Private Messaging section added (full architecture,
archive semantics, thread_reads asymmetric RLS note, prompt structure
MESSAGES.A–4 ✓ / MESSAGES.5–8 pending, key files); §9 4 new table schema
blocks (message_threads, thread_replies, thread_reads,
thread_reply_attachments); §9 notifications type CHECK updated
(direct_message added); §9 Migration 037 status block added (commit 8a86d10);
§9 next migration pointer updated (037 → 038); §9 feature_messages seed
paragraph added; §9 SETUP key counts updated (21 → 22, 22 → 23 total);
§11 Phase MESSAGES in-progress section added (MESSAGES.A–4 build summaries,
MESSAGES.5–8 pending listed); §11 header updated; §11 prompt log updated
(MESSAGES.A–4 + DOC.74); §13 R39 (SQL policy naming) + R40 (Server Action
.bind() assertion) added; DOC.74 logged)*

*v5.7 (August 2026 — DOC.75: Phase MESSAGES complete — §1 current phase
updated (Phase MESSAGES complete, MESSAGES.A–7 all ✓); §5 media bucket
messages/ path namespaces added (temp + final); §8 Private Messaging section
fully updated: thread view attachment reference corrected (MESSAGES.6),
context placements marked ✓ complete with latent bug note (AuditionDetailTabs
+ ShowDetail adminId destructuring fix), sanitize-at-write-time sub-section
added (DM_SANITIZE_OPTIONS, @tailwindcss/typography absent note), file
attachments sub-section added (DirectMessageComposer 8th sanctioned XHR,
upload route, storage paths, AttachmentInput/ThreadReplyAttachmentWithUrl
types, forwardRef+useImperativeHandle pattern), prompt structure updated
(9 → 8 prompts, MESSAGES.5–7 ✓ with build summaries), key files updated
(MESSAGES.1–7, 9 types in types/messages.ts, all new/modified files listed);
§11 Phase MESSAGES ✓ Complete, build summaries for MESSAGES.5–7 added,
prompt log updated (MESSAGES.5–7 + DOC.75); §11 Phase 17.1 flag count
updated (7 → 8, feature_messages noted as new opt-in defaulting to 'false');
§13 version history v5.7; DOC.75 logged)*

*v5.8 (August 2026 — DOC.76: ADMIN.45 + ADMIN.46 + Phase TZ TZ.A–TZ.4b
documented — §1 version + current phase (Phase TZ in active execution, TZ.5a/
5b/TZ.6 remaining); §8 Setup Panel Section 1 (org_timezone select field, SETUP_KEYS
23→24, lib/utils/org-timezone.ts key file); §8 QuickStats "CT" → org-timezone;
§8 ShowDetail Settings tab defaultHours display (ADMIN.46); §8 Private Messaging
onEmptyChange/isComposerEmpty pattern (ADMIN.46); §8 Check-In Dashboard CT →
org-timezone; §8 Audit Log CT → org-timezone; §9 Migration 038 status block;
§9 org_timezone key in app_settings; §9 SETUP_KEYS count corrected to 24; §11
Phase TZ section added (TZ.A–TZ.4b ✓ with commits + TZ.5a/5b/TZ.6 pending;
ADMIN.45 + ADMIN.46 build summaries); §11 prompt log through DOC.76; §13
resolveLayoutSettings rename + getOrgTimezone pattern + formatCT timezone param
+ client-before-usage reordering pattern; DOC.76 logged)*

*v5.9 (August 2026 — DOC.78: Phase TZ complete — §1 version + current phase
(Phase TZ ✓ Complete); §8 Public Calendar CT→org-timezone language; §8
calendar-availability.ts getAvailableWindows() + calendar-layout.ts
computeEventPosition() timezone parameter notes; §9 Migration 038 applied,
next migration 039; §11 Phase TZ ✓ Complete (TZ.5a-AUDIT + TZ.5a + TZ.5b
build summaries, TZ.6 ✓); §11 prompt log through DOC.78; §13 useNowPosition()
hook pattern, module-level helper parameterization, TZ.5b split-state pattern,
sibling helper asymmetry audit lesson; DOC.78 logged)*

*v6.0 (August 2026 — DOC.80/DOC.81: Phase MM complete +
Beta phases planned — §1 version header updated (v5.9 →
v6.0), current phase updated (Phase MM ✓ Complete,
platform in active Beta, Phase 17 deferred, 8 Beta
phases planned); §7 Phase MM proxy.ts maintenance gate
documented; §8 Platform Setup: section count 8 → 9,
new Maintenance Mode Section 1 documented (three
app_settings keys, amber banner, saveMaintenanceMode(),
Migration 039), existing sections renumbered 2–9 in
prose, SETUP_KEYS count 24 → 27, setup.ts action count
nine → ten, setup/page.tsx fetch count 24 → 27 keys,
SetupPanel.tsx section count eight → nine; §8 new
/crew/maintenance page section added (R20 exception
documented, getAdminClient(), noindex, light mode,
resolveOrgIdentity()); §8 Dashboard: planned ANNOUNCE
widget noted above Quick Stats; §8 Show Management:
planned SHOWDELETE noted in Settings tab; §8 QR
Generator: planned QRBANNER and QRANALYTICS noted; §8
Style Sandbox: planned SIDEBAR mockups noted (Sidebar
mockup + Top Nav mockup); §8 Internal Forums:
discoverability note added (expand chevron opens access
grants sub-panel); §9 Migration 039 status block added
(applied, 3 new app_settings keys), next migration
updated 039 → 040, SETUP_KEYS count updated to 27 in §9
notes; §11 header updated (Phase MM ✓ Complete, Beta
active, Phase 17 deferred); §11 Phase MM ✓ Complete
section added (MM.A, MM.1, MM.2 build summaries); §11
Planned Beta Phases section added (FORUMS-FIX, ANNOUNCE,
FORUMS-UX, SHOWDELETE, QRBANNER, QRANALYTICS, SIDEBAR,
NAVORDER, DOC-BETA1 — all forward specs); §11 prompt log
updated (MM.A, MM.1, MM.2, DOC.80, DOC.81); §13 five new
pattern notes added (maintenance gate position, /crew/
maintenance R20 exception, SaveStatus 'saved' not
'success', settingsMap Map instance, ActionResult
discriminated union narrowing); §13 v6.0 version history
entry added; DOC.80 + DOC.81 logged)*

*v6.1 (August 2026 — DOC.83/DOC.84: Beta phases
FORUMS-FIX/UX/ANNOUNCE/SHOWDELETE/SHOWARCHIVE complete
— §1 version + current phase updated (6 Beta phases ✓,
remaining: QRBANNER/QRANALYTICS/SIDEBAR/NAVORDER); §7
revalidatePath-during-render prohibition documented
(FORUMS-FIX root cause); §8 Dashboard: ANNOUNCE widget
spec (replaced Planned note with complete implementation:
AnnouncementWidget, AnnouncementWidgetClient,
AnnouncementSection self-loading, getActiveAnnouncements,
dismissAnnouncement, getAnnouncementContent, OA mirror
page, dashboard_announcement_* keys, dismissal via
announcement_dismissed_at); §8 Internal Forums: FORUMS-FIX
complete block (markThreadRead render-path fix, FORUMS-FIX.B
signed-URL try/catch + error.tsx logging), FORUMS-UX
complete ("Manage Access" label); §8 Show Management:
SHOWDELETE complete (deleteShow with 3 guards including
attendance NO ACTION FK, AlertDialog in SettingsTab,
show.delete AuditAction, ShowEditorActionResult); SHOWARCHIVE
complete (ShowForm.tsx Save button fix, Archive button on
draft/live ShowCards with undo banner, Archived Shows
accordion after groups conditional); §8 Platform Setup:
SETUP_KEYS 27→28 (announcements_oa_enabled), saveAnnouncement
documented (SA+OA-when-enabled, R31, server-side timestamp,
6-point FeatureFlagsSection wiring), setup.ts ten→eleven
actions; §8 Settings hub: Dashboard Announcements card
added; §9 Migration 040 status block (announcement_
dismissed_at + 4 new app_settings keys), admin_users column
added, SETUP_KEYS count 27→28, next migration 040→041;
§11 FORUMS-FIX/FORUMS-UX/ANNOUNCE/SHOWDELETE/SHOWARCHIVE
complete blocks added; Planned Beta Phases section updated
(completed phases removed, SHOWARCHIVE noted); prompt log
updated (FORUMS-FIX.A/B, FORUMS-UX.1, ANNOUNCE.A/1/2,
SHOWDELETE.A/1, SHOWARCHIVE.A/1, DOC.83, DOC.84); §13
eight new pattern notes (revalidatePath during render,
error.tsx logging, ShowCard inline in ShowList, SettingsTab
state scope, ShowForm vs ShowDetail distinction, attendance
NO ACTION FK, saveFeatureFlags 6-point wiring,
AnnouncementSection self-loading); v6.1 version history)*

*v6.2 (August 2026 — DOC.85/DOC.86: Beta phases
QRBANNER/QRANALYTICS/SIDEBAR/NAVORDER complete — see
§1 current phase update, §8 QR Generator, §8 Style
Sandbox, §8 Sidebar + TopBar, §8 Platform Setup, §9
Migrations 041+042, §11 complete blocks, §13 new
patterns. DOC.85 + DOC.86 logged.)*

*v6.4 (August 2026 — DOC.88/DOC.89: ADMIN.52–57 complete —
§1 current phase updated (ADMIN.47–57 all ✓); §8 Dashboard:
SeasonAtAGlance 31-day cap + chronological sort + "View all
shows" link + empty/truncation states + "Upcoming Shows (Next
31 Days)" fallback label (ADMIN.52–53); AnnouncementWidget
visual redesign (orange card, accent border, Megaphone icon —
ADMIN.52); §8 Notification System: NotificationPanel mark-read
removes items, mark-all → empty state, direct_message filtered
from panel + badge, 20-row cap removed, unreadPersistent
client-derived from visibleNotifications (ADMIN.53–54); §8
Platform Setup Section 1: maintenance_estimated_restoration
4th field added, saveMaintenanceMode() extended, SETUP_KEYS
30→31; §8 Maintenance Page: estimated restoration fetch +
amber conditional box; §8 QR Generator: banner font fix
(Inter bundled at public/fonts/, process.cwd() pattern,
Turbopack createRequire fix), ribbon redesign (7-element
curled-edge SVG, BANNER_HEIGHT_UNITS=10, BANNER_FONT_SIZE=2.8)
(ADMIN.56/56-FIX); §8 Sidebar: Beta Feedback SA exclusion
(ADMIN.55); §9 Migration 044 status block + next migration
045; §11 ADMIN.52–57 + ADMIN.56-FIX build summaries + DOC.88
+ DOC.89 prompt log entries; §13 seven new pattern notes
(SeasonAtAGlance self-contained Server Component,
visibleNotifications filter pattern, TipTap click-to-focus
CSS custom property pattern, public/fonts/ convention,
Turbopack createRequire literal string failure, @resvg/resvg-js
silent font failure, migration files at repo root);
DOC.88 + DOC.89 logged)*
