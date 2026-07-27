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
} from '@/lib/actions/setup'
import BrandImageUploader from '@/components/crew/settings/BrandImageUploader'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type SetupPanelInitialValues = {
  org_name: string
  org_tagline: string
  org_contact_email: string
  org_website_url: string
  org_location: string
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
  instance_label: string
  not_found_heading: string
  not_found_body: string
}

const cardClasses = 'bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-6 space-y-4'
const headingClasses = 'text-lg font-semibold text-dark dark:text-dark-text'
const descriptionClasses = 'text-sm text-mid-gray dark:text-dark-muted mb-4'
const labelClasses = 'block text-sm font-medium text-dark dark:text-dark-text mb-1'
const inputClasses =
  'w-full border border-divider dark:border-dark-border rounded-md px-3 py-2 text-sm text-dark dark:text-dark-text bg-white dark:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-navy'
const saveButtonClasses =
  'bg-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-steel transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

function SaveFeedback({ status, errorMessage }: { status: SaveStatus; errorMessage: string }) {
  if (status === 'saved') return <span className="text-sm text-green-600">✓ Saved</span>
  if (status === 'error') return <span className="text-sm text-red-600">{errorMessage}</span>
  return null
}

function OrgIdentitySection({ initialValues }: { initialValues: SetupPanelInitialValues }) {
  const [orgName, setOrgName] = useState(initialValues.org_name)
  const [orgTagline, setOrgTagline] = useState(initialValues.org_tagline)
  const [orgContactEmail, setOrgContactEmail] = useState(initialValues.org_contact_email)
  const [orgWebsiteUrl, setOrgWebsiteUrl] = useState(initialValues.org_website_url)
  const [orgLocation, setOrgLocation] = useState(initialValues.org_location)
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
          className="text-sm text-navy dark:text-steel hover:underline"
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
          enabled ? 'bg-navy' : 'bg-gray-300'
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
  const [flagSaveStatus, setFlagSaveStatus] = useState<SaveStatus>('idle')
  const [flagErrorMessage, setFlagErrorMessage] = useState('')

  async function handleSave() {
    setFlagSaveStatus('saving')
    const fd = new FormData()
    fd.append('feature_calendar', calendarEnabled ? 'true' : 'false')
    fd.append('feature_checkin', checkinEnabled ? 'true' : 'false')
    fd.append('feature_blast', blastEnabled ? 'true' : 'false')

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
    </div>
  )
}
