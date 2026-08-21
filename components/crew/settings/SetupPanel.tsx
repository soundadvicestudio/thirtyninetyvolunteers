'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  saveOrgIdentity,
  saveBrandColors,
  saveEmailConfig,
  saveFeatureFlags,
  saveInstanceLabel,
  saveNotFoundPage,
  saveMaintenanceMode,
} from '@/lib/actions/setup'
import BrandImageUploader from '@/components/crew/settings/BrandImageUploader'
import AnnouncementSection from '@/components/crew/settings/AnnouncementSection'
import NavOrderSection from './NavOrderSection'
import { TIMEZONE_OPTIONS } from '@/lib/utils/org-timezone'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type SetupPanelInitialValues = {
  org_name: string
  org_tagline: string
  org_contact_email: string
  org_website_url: string
  org_location: string
  org_timezone: string
  brand_primary: string
  brand_accent: string
  org_logo_url: string
  favicon_url: string
  email_from_address: string
  email_from_name: string
  default_reply_to: string
  feature_calendar: string
  feature_checkin: string
  feature_blast: string
  feature_rehearsals: string
  feature_auditions: string
  feature_inventory: string
  feature_forums: string
  feature_messages: string
  feature_beta: string
  instance_label: string
  not_found_heading: string
  not_found_body: string
  maintenance_mode: string
  maintenance_heading: string
  maintenance_body: string
  maintenance_estimated_restoration: string
  announcements_oa_enabled: string
  sidebar_nav_order: string
}

const cardClasses = 'bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 space-y-4'
const headingClasses = 'text-lg font-semibold text-dark dark:text-dark-text'
const descriptionClasses = 'text-sm text-mid-gray dark:text-dark-muted mb-4'
const labelClasses = 'block text-sm font-medium text-dark dark:text-dark-text mb-1'
const inputClasses =
  'w-full border border-divider dark:border-dark-border rounded-md px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-brand-primary'
const saveButtonClasses =
  'bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-primary-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

function SaveFeedback({ status, errorMessage }: { status: SaveStatus; errorMessage: string }) {
  if (status === 'saved') return <span className="text-sm text-green-600">✓ Saved</span>
  if (status === 'error') return <span className="text-sm text-red-600">{errorMessage}</span>
  return null
}

function MaintenanceModeSection({
  initialValues,
}: {
  initialValues: SetupPanelInitialValues
}) {
  const [maintenanceEnabled, setMaintenanceEnabled] =
    useState(initialValues.maintenance_mode === 'true')
  const [maintenanceHeading, setMaintenanceHeading] = useState(
    initialValues.maintenance_heading || 'System Maintenance'
  )
  const [maintenanceBody, setMaintenanceBody] = useState(
    initialValues.maintenance_body ||
      'The crew portal is temporarily unavailable while system updates and performance improvements are in progress. Please check back soon.'
  )
  const [maintenanceEstimatedRestoration, setMaintenanceEstimatedRestoration] = useState(
    initialValues.maintenance_estimated_restoration
  )
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSave() {
    setStatus('saving')
    setErrorMessage('')
    const fd = new FormData()
    fd.append('maintenance_mode', maintenanceEnabled ? 'true' : 'false')
    fd.append('maintenance_heading', maintenanceHeading)
    fd.append('maintenance_body', maintenanceBody)
    fd.append('maintenance_estimated_restoration', maintenanceEstimatedRestoration)
    const result = await saveMaintenanceMode(fd)
    if ('error' in result) {
      setErrorMessage(result.error)
      setStatus('error')
    } else {
      setStatus('saved')
    }
  }

  return (
    <div className={cardClasses}>
      <div>
        <h2 className={headingClasses}>Maintenance Mode</h2>
        <p className={descriptionClasses}>
          {"Control crew portal access during updates and maintenance windows."}
        </p>
      </div>
      <div className="space-y-4">
        <ToggleRow
          label={
            maintenanceEnabled
              ? '⚠ Maintenance Mode — ON'
              : 'Maintenance Mode'
          }
          description={
            'When ON, all non-Super Admin roles are redirected to the maintenance page and cannot access the crew portal.'
          }
          enabled={maintenanceEnabled}
          onToggle={() => setMaintenanceEnabled((v) => !v)}
        />
        <div>
          <label className={labelClasses}>
            Maintenance Page Heading
          </label>
          <input
            type="text"
            value={maintenanceHeading}
            onChange={(e) => setMaintenanceHeading(e.target.value)}
            maxLength={100}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>
            Maintenance Page Message
          </label>
          <textarea
            value={maintenanceBody}
            onChange={(e) => setMaintenanceBody(e.target.value)}
            maxLength={300}
            rows={3}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>
            Estimated Restoration Time
          </label>
          <input
            type="text"
            value={maintenanceEstimatedRestoration}
            onChange={(e) => setMaintenanceEstimatedRestoration(e.target.value)}
            placeholder="e.g. Tuesday, August 26 at 6:00 PM"
            maxLength={150}
            className={inputClasses}
          />
          <p className="text-xs text-mid-gray dark:text-dark-muted mt-1">
            Optional — displays on the maintenance page when set
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          className={saveButtonClasses}
        >
          {status === 'saving' ? 'Saving...' : 'Save'}
        </button>
        <SaveFeedback status={status} errorMessage={errorMessage} />
      </div>
    </div>
  )
}

function OrgIdentitySection({ initialValues }: { initialValues: SetupPanelInitialValues }) {
  const [orgName, setOrgName] = useState(initialValues.org_name)
  const [orgTagline, setOrgTagline] = useState(initialValues.org_tagline)
  const [orgContactEmail, setOrgContactEmail] = useState(initialValues.org_contact_email)
  const [orgWebsiteUrl, setOrgWebsiteUrl] = useState(initialValues.org_website_url)
  const [orgLocation, setOrgLocation] = useState(initialValues.org_location)
  const [orgTimezone, setOrgTimezone] = useState(initialValues.org_timezone || 'America/Chicago')
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSave() {
    setStatus('saving')
    const formData = new FormData()
    formData.append('org_name', orgName)
    formData.append('org_tagline', orgTagline)
    formData.append('org_contact_email', orgContactEmail)
    formData.append('org_website_url', orgWebsiteUrl)
    formData.append('org_location', orgLocation)
    formData.append('org_timezone', orgTimezone)

    const result = await saveOrgIdentity(formData)
    if ('error' in result) {
      setStatus('error')
      setErrorMessage(result.error)
      return
    }
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className={cardClasses}>
      <div>
        <h2 className={headingClasses}>Organization Identity</h2>
        <p className={descriptionClasses}>
          {"Your organization's name and contact information. Used in email templates, the public landing page, and the platform footer."}
        </p>
      </div>
      <div>
        <label className={labelClasses}>Organization Name</label>
        <input
          type="text"
          maxLength={100}
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Tagline</label>
        <input
          type="text"
          maxLength={200}
          value={orgTagline}
          onChange={(e) => setOrgTagline(e.target.value)}
          placeholder="A short tagline for your organization"
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Contact Email</label>
        <input
          type="email"
          value={orgContactEmail}
          onChange={(e) => setOrgContactEmail(e.target.value)}
          placeholder="contact@yourtheater.org"
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Website URL</label>
        <input
          type="url"
          value={orgWebsiteUrl}
          onChange={(e) => setOrgWebsiteUrl(e.target.value)}
          placeholder="https://yourtheater.org"
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>City / State</label>
        <input
          type="text"
          maxLength={100}
          value={orgLocation}
          onChange={(e) => setOrgLocation(e.target.value)}
          placeholder="New Orleans, LA"
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Organization Timezone</label>
        <select value={orgTimezone} onChange={(e) => setOrgTimezone(e.target.value)} className={inputClasses}>
          {TIMEZONE_OPTIONS.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={handleSave} disabled={status === 'saving'} className={saveButtonClasses}>
          {status === 'saving' ? 'Saving...' : 'Save'}
        </button>
        <SaveFeedback status={status} errorMessage={errorMessage} />
      </div>
    </div>
  )
}

function BrandColorsSection({ initialValues }: { initialValues: SetupPanelInitialValues }) {
  const [brandPrimary, setBrandPrimary] = useState(initialValues.brand_primary)
  const [brandAccent, setBrandAccent] = useState(initialValues.brand_accent)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSave() {
    setStatus('saving')
    const formData = new FormData()
    formData.append('brand_primary', brandPrimary)
    formData.append('brand_accent', brandAccent)

    const result = await saveBrandColors(formData)
    if ('error' in result) {
      setStatus('error')
      setErrorMessage(result.error)
      return
    }
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className={cardClasses}>
      <div>
        <h2 className={headingClasses}>Brand Colors</h2>
        <p className={descriptionClasses}>
          Your primary and accent colors. These will be used in email templates. After Phase THEME
          ships, they will also update the admin UI.
        </p>
      </div>
      <div>
        <label className={labelClasses}>Primary Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={brandPrimary}
            onChange={(e) => setBrandPrimary(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-divider"
          />
          <span className="text-sm font-mono text-mid-gray dark:text-dark-muted">{brandPrimary}</span>
        </div>
      </div>
      <div>
        <label className={labelClasses}>Accent Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={brandAccent}
            onChange={(e) => setBrandAccent(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-divider"
          />
          <span className="text-sm font-mono text-mid-gray dark:text-dark-muted">{brandAccent}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={handleSave} disabled={status === 'saving'} className={saveButtonClasses}>
          {status === 'saving' ? 'Saving...' : 'Save'}
        </button>
        <SaveFeedback status={status} errorMessage={errorMessage} />
      </div>
    </div>
  )
}

function EmailConfigSection({ initialValues }: { initialValues: SetupPanelInitialValues }) {
  const [emailFromAddress, setEmailFromAddress] = useState(initialValues.email_from_address)
  const [emailFromName, setEmailFromName] = useState(initialValues.email_from_name)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSave() {
    setStatus('saving')
    const formData = new FormData()
    formData.append('email_from_address', emailFromAddress)
    formData.append('email_from_name', emailFromName)

    const result = await saveEmailConfig(formData)
    if ('error' in result) {
      setStatus('error')
      setErrorMessage(result.error)
      return
    }
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className={cardClasses}>
      <div>
        <h2 className={headingClasses}>Email Configuration</h2>
        <p className={descriptionClasses}>
          The sending address and name that appear on all outgoing emails from this platform.
        </p>
      </div>
      <div>
        <label className={labelClasses}>Sending Address</label>
        <input
          type="email"
          value={emailFromAddress}
          onChange={(e) => setEmailFromAddress(e.target.value)}
          placeholder="volunteers@yourtheater.org"
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Sending Name</label>
        <input
          type="text"
          value={emailFromName}
          onChange={(e) => setEmailFromName(e.target.value)}
          placeholder="Your Theater Name Volunteers"
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Default Reply-To</label>
        <p className="text-sm text-dark dark:text-dark-text">{initialValues.default_reply_to}</p>
        <Link
          href="/crew/settings/general"
          className="text-sm text-brand-primary dark:text-brand-primary-mid hover:underline"
        >
          Edit in General Defaults →
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={handleSave} disabled={status === 'saving'} className={saveButtonClasses}>
          {status === 'saving' ? 'Saving...' : 'Save'}
        </button>
        <SaveFeedback status={status} errorMessage={errorMessage} />
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-dark dark:text-dark-text">{label}</p>
        <p className="text-sm text-mid-gray dark:text-dark-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
          enabled ? 'bg-brand-primary' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

function FeatureFlagsSection({ initialValues }: { initialValues: SetupPanelInitialValues }) {
  const [calendarEnabled, setCalendarEnabled] = useState(initialValues.feature_calendar === 'true')
  const [checkinEnabled, setCheckinEnabled] = useState(initialValues.feature_checkin === 'true')
  const [blastEnabled, setBlastEnabled] = useState(initialValues.feature_blast === 'true')
  const [rehearsalsEnabled, setRehearsalsEnabled] = useState(initialValues.feature_rehearsals === 'true')
  const [auditionsEnabled, setAuditionsEnabled] = useState(initialValues.feature_auditions === 'true')
  const [inventoryEnabled, setInventoryEnabled] = useState(initialValues.feature_inventory === 'true')
  const [forumsEnabled, setForumsEnabled] = useState(initialValues.feature_forums === 'true')
  const [messagesEnabled, setMessagesEnabled] = useState(
    initialValues.feature_messages === 'true'
  )
  const [betaEnabled, setBetaEnabled] = useState(
    initialValues.feature_beta === 'true'
  )
  const [announcementsOaEnabled, setAnnouncementsOaEnabled] = useState(
    initialValues.announcements_oa_enabled === 'true'
  )
  const [flagSaveStatus, setFlagSaveStatus] = useState<SaveStatus>('idle')
  const [flagErrorMessage, setFlagErrorMessage] = useState('')

  async function handleSave() {
    setFlagSaveStatus('saving')
    const fd = new FormData()
    fd.append('feature_calendar', calendarEnabled ? 'true' : 'false')
    fd.append('feature_checkin', checkinEnabled ? 'true' : 'false')
    fd.append('feature_blast', blastEnabled ? 'true' : 'false')
    fd.append('feature_rehearsals', rehearsalsEnabled ? 'true' : 'false')
    fd.append('feature_auditions', auditionsEnabled ? 'true' : 'false')
    fd.append('feature_inventory', inventoryEnabled ? 'true' : 'false')
    fd.append('feature_forums', forumsEnabled ? 'true' : 'false')
    fd.append('feature_messages', messagesEnabled ? 'true' : 'false')
    fd.append('feature_beta', betaEnabled ? 'true' : 'false')
    fd.append('announcements_oa_enabled', announcementsOaEnabled ? 'true' : 'false')

    const result = await saveFeatureFlags(fd)
    if ('error' in result) {
      setFlagSaveStatus('error')
      setFlagErrorMessage(result.error)
      return
    }
    setFlagSaveStatus('saved')
    setTimeout(() => setFlagSaveStatus('idle'), 2000)
  }

  return (
    <div className={cardClasses}>
      <div>
        <h2 className={headingClasses}>Feature Flags</h2>
        <p className={descriptionClasses}>
          Enable or disable optional platform features. Changes take effect immediately for all
          users.
        </p>
      </div>
      <ToggleRow
        label="Calendar & Space Management"
        description="Enables the master calendar, space booking, and public /calendar page. When off, these are hidden from all users."
        enabled={calendarEnabled}
        onToggle={() => setCalendarEnabled((v) => !v)}
      />
      <ToggleRow
        label="Check-In System"
        description="Enables QR check-in and the public self-check-in page. When off, all check-in routes are inaccessible."
        enabled={checkinEnabled}
        onToggle={() => setCheckinEnabled((v) => !v)}
      />
      <ToggleRow
        label="Email Blast Composer"
        description="Enables the email blast composer under Communication. When off, the Communication page is hidden."
        enabled={blastEnabled}
        onToggle={() => setBlastEnabled((v) => !v)}
      />
      <ToggleRow
        label="Rehearsal Management"
        description="Enables the Rehearsals section and the public rehearsal check-in page. When off, /crew/rehearsals and the rehearsal check-in route are inaccessible."
        enabled={rehearsalsEnabled}
        onToggle={() => setRehearsalsEnabled((v) => !v)}
      />
      <ToggleRow
        label="Audition Management"
        description="Enables the Auditions section, the public audition signup page, and the audition check-in page. When off, /crew/auditions and the audition public routes are inaccessible."
        enabled={auditionsEnabled}
        onToggle={() => setAuditionsEnabled((v) => !v)}
      />
      <ToggleRow
        label="Inventory Management"
        description="Enables the Inventory section. When off, /crew/inventory is inaccessible."
        enabled={inventoryEnabled}
        onToggle={() => setInventoryEnabled((v) => !v)}
      />
      <ToggleRow
        label="Internal Forums"
        description="Enables the internal discussion forums. When off, /crew/forums is inaccessible."
        enabled={forumsEnabled}
        onToggle={() => setForumsEnabled((v) => !v)}
      />
      <ToggleRow
        label="Private Messaging"
        description="Enables the internal private messaging system between
          crew members. When off, /crew/messages and /crew/users are
          inaccessible."
        enabled={messagesEnabled}
        onToggle={() => setMessagesEnabled((v) => !v)}
      />
      <ToggleRow
        label="Beta Feedback"
        description="Enable the Beta Feedback page for crew members to submit feature requests and bug reports."
        enabled={betaEnabled}
        onToggle={() => setBetaEnabled((v) => !v)}
      />
      <ToggleRow
        label="Owner Admin Announcements"
        description={
          'When ON, Owner Admins can publish dashboard ' +
          'announcements from their Settings page.'
        }
        enabled={announcementsOaEnabled}
        onToggle={() => setAnnouncementsOaEnabled((v) => !v)}
      />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={flagSaveStatus === 'saving'}
          className={saveButtonClasses}
        >
          {flagSaveStatus === 'saving' ? 'Saving...' : 'Save Feature Flags'}
        </button>
        <SaveFeedback status={flagSaveStatus} errorMessage={flagErrorMessage} />
      </div>
    </div>
  )
}

function InstanceLabelSection({ initialValues }: { initialValues: SetupPanelInitialValues }) {
  const [instanceLabel, setInstanceLabel] = useState(initialValues.instance_label)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSave() {
    setStatus('saving')
    const formData = new FormData()
    formData.append('instance_label', instanceLabel)

    const result = await saveInstanceLabel(formData)
    if ('error' in result) {
      setStatus('error')
      setErrorMessage(result.error)
      return
    }
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className={cardClasses}>
      <div>
        <h2 className={headingClasses}>Platform Identity</h2>
        <p className={descriptionClasses}>
          An internal label for this deployment. Only visible to you on this page — never shown
          to other users.
        </p>
      </div>
      <div>
        <label className={labelClasses}>Instance Label</label>
        <input
          type="text"
          maxLength={100}
          value={instanceLabel}
          onChange={(e) => setInstanceLabel(e.target.value)}
          placeholder="e.g. Pelican Playhouse"
          className={inputClasses}
        />
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={handleSave} disabled={status === 'saving'} className={saveButtonClasses}>
          {status === 'saving' ? 'Saving...' : 'Save Identity Label'}
        </button>
        <SaveFeedback status={status} errorMessage={errorMessage} />
      </div>
    </div>
  )
}

function NotFoundPageSection({ initialValues }: { initialValues: SetupPanelInitialValues }) {
  const [heading, setHeading] = useState(initialValues.not_found_heading)
  const [body, setBody] = useState(initialValues.not_found_body)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSave() {
    setStatus('saving')
    const formData = new FormData()
    formData.append('not_found_heading', heading)
    formData.append('not_found_body', body)

    const result = await saveNotFoundPage(formData)
    if ('error' in result) {
      setStatus('error')
      setErrorMessage(result.error)
      return
    }
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className={cardClasses}>
      <div>
        <h2 className={headingClasses}>404 Page</h2>
        <p className={descriptionClasses}>
          Customize the message shown when a visitor reaches a page that doesn&apos;t exist.
        </p>
      </div>
      <div>
        <label className={labelClasses}>Heading</label>
        <input
          type="text"
          maxLength={100}
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Page Not Found"
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses}>Body Text</label>
        <textarea
          maxLength={300}
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="We couldn't find what you were looking for."
          className={inputClasses}
        />
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={handleSave} disabled={status === 'saving'} className={saveButtonClasses}>
          {status === 'saving' ? 'Saving...' : 'Save'}
        </button>
        <SaveFeedback status={status} errorMessage={errorMessage} />
      </div>
    </div>
  )
}

export default function SetupPanel({ initialValues }: { initialValues: SetupPanelInitialValues }) {
  const [logoUrl, setLogoUrl] = useState(initialValues.org_logo_url)
  const [faviconUrl, setFaviconUrl] = useState(initialValues.favicon_url)

  return (
    <div className="space-y-6">
      <MaintenanceModeSection initialValues={initialValues} />
      <OrgIdentitySection initialValues={initialValues} />
      <BrandColorsSection initialValues={initialValues} />

      <div className={cardClasses}>
        <div>
          <h2 className={headingClasses}>Organization Logo</h2>
          <p className={descriptionClasses}>
            Your logo appears in email templates and on the public landing page. Upload a file or
            paste a URL to a publicly hosted image.
          </p>
        </div>
        <BrandImageUploader
          label="Logo"
          settingsKey="org_logo_url"
          storagePath="logo"
          aspectRatio={undefined}
          currentValue={logoUrl}
          onSave={(url) => setLogoUrl(url)}
        />
      </div>

      <div className={cardClasses}>
        <div>
          <h2 className={headingClasses}>Browser Favicon</h2>
          <p className={descriptionClasses}>
            The small icon that appears in browser tabs and bookmarks. Must be square. Upload a
            file (PNG, JPG, or WebP — cropped to square automatically) or paste a URL to a square
            image.
          </p>
        </div>
        <BrandImageUploader
          label="Favicon"
          settingsKey="favicon_url"
          storagePath="favicon"
          aspectRatio={1}
          currentValue={faviconUrl}
          onSave={(url) => setFaviconUrl(url)}
        />
      </div>

      <EmailConfigSection initialValues={initialValues} />
      <FeatureFlagsSection initialValues={initialValues} />
      <InstanceLabelSection initialValues={initialValues} />
      <NotFoundPageSection initialValues={initialValues} />
      <NavOrderSection initialValues={initialValues} />
      <AnnouncementSection />
    </div>
  )
}
