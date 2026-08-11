'use client'

import { RefreshCw, ChevronRight } from 'lucide-react'

export function CheckedInQRBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      ✓ Checked In (QR)
    </span>
  )
}

export function CheckedInAdminBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      ✓ Checked In (Admin)
    </span>
  )
}

export function AwaitingBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      — Awaiting
    </span>
  )
}

export function NoShowBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      ✗ No-Show
    </span>
  )
}

export function ExcusedBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-700">
      Excused
    </span>
  )
}

function RoleGroupHeader({ role, count }: { role: string; count: string }) {
  return (
    <div className="bg-neutral-surface dark:bg-dark-nav border-b border-t border-neutral-border px-4 py-2.5 flex items-center justify-between">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {role}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{count}</span>
    </div>
  )
}

function VolunteerRow({ name, badge }: { name: string; badge: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-border last:border-b-0">
      <span className="text-sm font-medium text-gray-900 dark:text-white">{name}</span>
      {badge}
    </div>
  )
}

export function CheckInMockup() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Check-In Dashboard — Option A Mockup
      </p>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Check-In Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {"Live volunteer roster for tonight's show."}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Auto-refreshing · Last updated 8s ago
          </span>
          <RefreshCw className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
        <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-4 py-3.5 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">
              Into the Woods — Performance
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Tonight · Oct 14, 2025 · 7:30 PM
            </div>
          </div>
          <span className="bg-brand-primary-light text-brand-primary text-sm font-medium rounded-lg px-3 py-1.5">
            19 / 32 Checked In
          </span>
        </div>

        <RoleGroupHeader role="Ushers" count="12 / 12 checked in" />
        <VolunteerRow name="Sarah Mitchell" badge={<CheckedInQRBadge />} />
        <VolunteerRow name="James Thibodaux" badge={<CheckedInQRBadge />} />
        <VolunteerRow name="Marcus Dupree" badge={<CheckedInAdminBadge />} />
        <VolunteerRow name="Celeste Fontenot" badge={<CheckedInQRBadge />} />

        <RoleGroupHeader role="Box Office" count="5 / 8 checked in" />
        <VolunteerRow name="Robert Broussard" badge={<AwaitingBadge />} />
        <VolunteerRow name="Diane Arceneaux" badge={<CheckedInQRBadge />} />
        <VolunteerRow name="Pierre Fontenot" badge={<AwaitingBadge />} />
        <VolunteerRow name="Monique Richard" badge={<CheckedInAdminBadge />} />

        <RoleGroupHeader role="Backstage" count="2 / 12 checked in" />
        <VolunteerRow name="Antoine Boudreaux" badge={<NoShowBadge />} />
        <VolunteerRow name="Simone Trosclair" badge={<CheckedInQRBadge />} />
        <VolunteerRow name="Claude Hebert" badge={<ExcusedBadge />} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Other Upcoming Shows</h2>
        <div className="space-y-2">
          <div className="bg-neutral-surface dark:bg-dark-nav border border-neutral-border rounded-lg px-4 py-3.5 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">A Christmas Carol</span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Nov 22, 2025</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">0 / 24 checked in</span>
          </div>
          <div className="bg-neutral-surface dark:bg-dark-nav border border-neutral-border rounded-lg px-4 py-3.5 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">The Wizard of Oz</span>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Mar 6, 2026</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">0 / 20 checked in</span>
          </div>
        </div>
      </div>
    </div>
  )
}
