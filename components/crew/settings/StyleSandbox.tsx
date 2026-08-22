'use client'

import { Palette, Square } from 'lucide-react'
import { DashboardMockup } from './DashboardMockup'
import { CalendarMockup } from './CalendarMockup'
import { RehearsalsMockup } from './RehearsalsMockup'
import { AuditionsMockup } from './AuditionsMockup'
import { InventoryMockup } from './InventoryMockup'
import { VolunteersMockup } from './VolunteersMockup'
import { ForumsMockup } from './ForumsMockup'
import { ShowsMockup } from './ShowsMockup'
import { OpportunitiesMockup } from './OpportunitiesMockup'
import { FormsMockup } from './FormsMockup'
import { QRGeneratorMockup } from './QRGeneratorMockup'
import { CheckInMockup } from './CheckInMockup'
import { CommunicationMockup } from './CommunicationMockup'
import { MediaLibraryMockup } from './MediaLibraryMockup'
import { SetupPanelMockup } from './SetupPanelMockup'

const TOKEN_SWATCHES = [
  { name: '--brand-primary', style: { background: 'var(--brand-primary)' } },
  { name: '--brand-accent', style: { background: 'var(--brand-accent)' } },
  { name: '--brand-primary-mid', style: { background: 'var(--brand-primary-mid)' } },
  { name: '--brand-primary-tint', style: { background: 'var(--brand-primary-tint)' } },
  { name: '--brand-primary-light', style: { background: 'var(--brand-primary-light)' } },
  { name: '--brand-accent-light', style: { background: 'var(--brand-accent-light)' } },
  { name: '--brand-primary-dark', style: { background: 'var(--brand-primary-dark)' } },
  { name: '--brand-accent-dark', style: { background: 'var(--brand-accent-dark)' } },
  { name: '--brand-primary-subtle', style: { background: 'var(--brand-primary-subtle)' } },
  { name: '--color-neutral-surface', style: { background: 'var(--color-neutral-surface)' } },
  { name: '--color-neutral-border', style: { background: 'var(--color-neutral-border)' } },
]

const STAT_CARDS = [
  { value: '142', label: 'Volunteers' },
  { value: '8', label: 'Active Shows' },
  { value: '1,204', label: 'Hours' },
  { value: '23', label: 'This Season' },
]

function GroupCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-neutral-border dark:border-dark-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-dark dark:text-dark-text mb-4">{label}</h3>
      {children}
    </div>
  )
}

export default function StyleSandbox() {
  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Palette size={20} className="text-brand-primary" />
          <h2 className="text-xl font-bold text-dark dark:text-dark-text">Primitive Gallery</h2>
        </div>
        <p className="text-sm text-mid-gray dark:text-dark-muted mb-6">
          Live renders using the current token system. Adjust tokens in globals.css or layout.tsx
          to see changes reflected here immediately.
        </p>

        <div className="space-y-6">
          <GroupCard label="Buttons">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors"
              >
                Primary
              </button>
              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-medium bg-neutral-surface border border-neutral-border text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Secondary
              </button>
              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Destructive
              </button>
            </div>
          </GroupCard>

          <GroupCard label="Form Input">
            <div className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volunteer Name</label>
                <input
                  type="text"
                  readOnly
                  value="Jordan Lee"
                  className="border border-neutral-border rounded-md px-3 py-2 text-sm w-full"
                />
              </div>
              <div>
                <input
                  type="text"
                  readOnly
                  value="Jordan Lee"
                  className="ring-2 ring-brand-primary border-brand-primary rounded-md px-3 py-2 text-sm w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Focused state</p>
              </div>
              <div>
                <input
                  type="text"
                  readOnly
                  value=""
                  className="border border-neutral-border ring-2 ring-red-500 rounded-md px-3 py-2 text-sm w-full"
                />
                <p className="text-xs text-red-600 mt-1">This field is required.</p>
              </div>
            </div>
          </GroupCard>

          <GroupCard label="Card">
            <div className="bg-neutral-surface border border-neutral-border rounded-lg p-4 max-w-sm">
              <h4 className="font-semibold text-gray-900">Spring Fundraiser Gala</h4>
              <p className="text-sm text-gray-500 mb-2">March 14 · Main Stage</p>
              <p className="text-sm text-gray-700 mb-4">
                A benefit performance supporting the education outreach program. Volunteers are
                needed for ushering, concessions, and check-in.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 text-xs font-medium bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors"
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 text-xs font-medium bg-white border border-neutral-border text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          </GroupCard>

          <GroupCard label="Data Table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-surface text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Role</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-3 py-2 text-gray-700">Jordan Lee</td>
                    <td className="px-3 py-2 text-gray-700">Volunteer</td>
                    <td className="px-3 py-2">
                      <span className="bg-green-100 text-green-800 text-xs rounded-full px-2 py-0.5">
                        Active
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">42</td>
                  </tr>
                  <tr className="bg-neutral-surface">
                    <td className="px-3 py-2 text-gray-700">Casey Rivera</td>
                    <td className="px-3 py-2">
                      <span className="bg-brand-primary text-white text-xs rounded-full px-2 py-0.5">
                        Super Admin
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="bg-green-100 text-green-800 text-xs rounded-full px-2 py-0.5">
                        Active
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">118</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-3 py-2 text-gray-700">Morgan Blake</td>
                    <td className="px-3 py-2 text-gray-700">Volunteer</td>
                    <td className="px-3 py-2">
                      <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5">
                        Archived
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">6</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GroupCard>

          <GroupCard label="Navigation Item">
            <div className="space-y-2 max-w-xs">
              <div className="flex items-center gap-3 bg-brand-primary-light text-brand-primary font-medium rounded-md px-3 py-2 border-l-2 border-brand-primary">
                <Square size={16} />
                Active Page
              </div>
              <div className="flex items-center gap-3 text-gray-600 hover:bg-gray-100 rounded-md px-3 py-2">
                <Square size={16} />
                Inactive Page
              </div>
            </div>
          </GroupCard>

          <GroupCard label="Stat Card">
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {STAT_CARDS.map((stat) => (
                <div key={stat.label} className="bg-white border border-neutral-border rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </GroupCard>

          <GroupCard label="Badges">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs rounded-full px-2 py-0.5 bg-navy text-white">Super Admin</span>
              <span className="text-xs rounded-full px-2 py-0.5 bg-steel text-white">Editor</span>
              <span className="text-xs rounded-full px-2 py-0.5 bg-gray-500 text-white">Viewer</span>
              <span className="text-xs rounded-full px-2 py-0.5 bg-brand-primary text-white">Primary</span>
              <span className="text-xs rounded-full px-2 py-0.5 bg-brand-accent text-white">Accent</span>
              <span className="text-xs rounded-full px-2 py-0.5 bg-brand-primary-light text-brand-primary">
                Light
              </span>
            </div>
          </GroupCard>

          <GroupCard label="Token Reference">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOKEN_SWATCHES.map((token) => (
                <div key={token.name} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded border border-neutral-border shrink-0"
                    style={token.style}
                  />
                  <span className="text-xs text-gray-600 font-mono">{token.name}</span>
                </div>
              ))}
            </div>
          </GroupCard>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-dark dark:text-dark-text mb-1">Page Mockups</h2>
        <p className="text-sm text-mid-gray dark:text-dark-muted mb-6">
          Full-fidelity page reproductions using upgraded design patterns. Added in STYLE.2+.
        </p>
        <DashboardMockup />
        <div className="border-t border-neutral-border my-8" />
        <CalendarMockup />
        <div className="border-t border-neutral-border my-8" />
        <RehearsalsMockup />
        <div className="border-t border-neutral-border my-8" />
        <AuditionsMockup />
        <div className="border-t border-neutral-border my-8" />
        <InventoryMockup />
        <div className="border-t border-neutral-border my-8" />
        <VolunteersMockup />
        <div className="border-t border-neutral-border my-8" />
        <ForumsMockup />
        <div className="border-t border-neutral-border my-8" />
        <ShowsMockup />
        <div className="border-t border-neutral-border my-8" />
        <OpportunitiesMockup />
        <div className="border-t border-neutral-border my-8" />
        <FormsMockup />
        <div className="border-t border-neutral-border my-8" />
        <QRGeneratorMockup />
        <div className="border-t border-neutral-border my-8" />
        <CheckInMockup />
        <div className="border-t border-neutral-border my-8" />
        <CommunicationMockup />
        <div className="border-t border-neutral-border my-8" />
        <MediaLibraryMockup />
        <div className="border-t border-neutral-border my-8" />
        <SetupPanelMockup />
      </div>
    </div>
  )
}
