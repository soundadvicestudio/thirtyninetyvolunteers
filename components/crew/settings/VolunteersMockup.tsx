'use client'

import { Search, Download, FileText, ChevronDown } from 'lucide-react'

export function VolunteerStatusBadge({ status }: { status: 'active' | 'archived' }) {
  if (status === 'active') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Active
      </span>
    )
  }
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      Archived
    </span>
  )
}

export function ServiceHoursBadge() {
  return (
    <span className="bg-orange-100 text-orange-700 text-xs font-medium rounded px-1.5 py-0.5">SH</span>
  )
}

export function EmailOnlyBadge() {
  return <span className="bg-blue-50 text-blue-600 text-xs rounded px-1.5 py-0.5">Email only</span>
}

export function PhoneOnlyBadge() {
  return <span className="bg-purple-50 text-purple-600 text-xs rounded px-1.5 py-0.5">Phone only</span>
}

function CategoryChip({ label }: { label: string }) {
  return (
    <span className="bg-neutral-surface border border-neutral-border text-xs rounded-full px-2 py-0.5 text-gray-600 dark:bg-dark-nav dark:text-gray-400">
      {label}
    </span>
  )
}

export function VolunteersMockup() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Volunteers — Option A Mockup (List View)
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Volunteers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          142 active volunteers · 3 new this week
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 border border-neutral-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Search by name, email, or phone...</span>
          </div>
          <button
            type="button"
            className="border border-neutral-border bg-neutral-surface text-gray-700 dark:text-gray-300 rounded-md px-3 py-2 text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            type="button"
            className="border border-neutral-border bg-neutral-surface text-gray-700 dark:text-gray-300 rounded-md px-3 py-2 text-sm flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="bg-neutral-surface border border-neutral-border rounded-lg p-1 flex gap-1">
            <span className="bg-brand-primary text-white rounded-md px-3 py-1.5 text-sm font-medium">
              Active
            </span>
            <span className="text-gray-600 dark:text-gray-400 rounded-md px-3 py-1.5 text-sm cursor-pointer">
              All
            </span>
          </div>
          <span className="flex items-center gap-1.5 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Category: All
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </span>
          <span className="flex items-center gap-1.5 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Status: Active
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </span>
          <span className="flex items-center gap-1.5 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Contact Pref: All
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </span>
          <span className="text-sm text-brand-primary hover:text-brand-primary-dark cursor-pointer">
            More filters
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">Showing 142 volunteers · Sorted by name</p>
      </div>

      <div className="overflow-x-auto">
        <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden min-w-[900px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border">
                <th className="text-left pl-4 pr-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Name
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Email
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Phone
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Categories
                </th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Total Hours
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Calls
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-3 pr-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border">
              <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors cursor-pointer">
                <td className="pl-4 pr-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Sarah Mitchell</span>
                    <ServiceHoursBadge />
                  </div>
                </td>
                <td className="text-xs text-gray-600 dark:text-gray-400 px-3 py-3 whitespace-nowrap">
                  sarah.mitchell@email.com
                </td>
                <td className="text-xs text-gray-600 dark:text-gray-400 px-3 py-3 whitespace-nowrap">
                  (985) 555-0142
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CategoryChip label="Ushers" />
                    <CategoryChip label="Box Office" />
                  </div>
                </td>
                <td className="text-sm text-gray-900 dark:text-white px-3 py-3 text-right font-medium">124.5</td>
                <td className="text-sm text-gray-600 dark:text-gray-400 px-3 py-3 text-center">18</td>
                <td className="px-3 py-3">
                  <VolunteerStatusBadge status="active" />
                </td>
                <td className="text-xs text-gray-500 dark:text-gray-400 px-3 pr-4 py-3 whitespace-nowrap">
                  Mar 2022
                </td>
              </tr>
              <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors cursor-pointer">
                <td className="pl-4 pr-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">James Thibodaux</span>
                    <EmailOnlyBadge />
                  </div>
                </td>
                <td className="text-xs text-gray-600 dark:text-gray-400 px-3 py-3 whitespace-nowrap">
                  jthibodaux@gmail.com
                </td>
                <td className="text-xs text-gray-600 dark:text-gray-400 px-3 py-3 whitespace-nowrap">
                  (504) 555-0287
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CategoryChip label="Backstage" />
                    <span className="text-xs text-gray-400 dark:text-gray-500">+2 more</span>
                  </div>
                </td>
                <td className="text-sm text-gray-900 dark:text-white px-3 py-3 text-right font-medium">67.0</td>
                <td className="text-sm text-gray-600 dark:text-gray-400 px-3 py-3 text-center">11</td>
                <td className="px-3 py-3">
                  <VolunteerStatusBadge status="active" />
                </td>
                <td className="text-xs text-gray-500 dark:text-gray-400 px-3 pr-4 py-3 whitespace-nowrap">
                  Aug 2023
                </td>
              </tr>
              <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors cursor-pointer">
                <td className="pl-4 pr-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Marcus Dupree</span>
                  </div>
                </td>
                <td className="text-xs text-gray-600 dark:text-gray-400 px-3 py-3 whitespace-nowrap">
                  marcusd@yahoo.com
                </td>
                <td className="text-xs text-gray-600 dark:text-gray-400 px-3 py-3 whitespace-nowrap">
                  (985) 555-0391
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CategoryChip label="Concessions" />
                  </div>
                </td>
                <td className="text-sm text-gray-900 dark:text-white px-3 py-3 text-right font-medium">12.0</td>
                <td className="text-sm text-gray-600 dark:text-gray-400 px-3 py-3 text-center">3</td>
                <td className="px-3 py-3">
                  <VolunteerStatusBadge status="active" />
                </td>
                <td className="text-xs text-gray-500 dark:text-gray-400 px-3 pr-4 py-3 whitespace-nowrap">
                  Jan 2024
                </td>
              </tr>
              <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors cursor-pointer">
                <td className="pl-4 pr-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Celeste Fontenot</span>
                    <ServiceHoursBadge />
                    <PhoneOnlyBadge />
                  </div>
                </td>
                <td className="text-xs text-gray-600 dark:text-gray-400 px-3 py-3 whitespace-nowrap">
                  cfontenot@outlook.com
                </td>
                <td className="text-xs text-gray-600 dark:text-gray-400 px-3 py-3 whitespace-nowrap">
                  (985) 555-0558
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CategoryChip label="Ushers" />
                  </div>
                </td>
                <td className="text-sm text-gray-900 dark:text-white px-3 py-3 text-right font-medium">203.5</td>
                <td className="text-sm text-gray-600 dark:text-gray-400 px-3 py-3 text-center">31</td>
                <td className="px-3 py-3">
                  <VolunteerStatusBadge status="active" />
                </td>
                <td className="text-xs text-gray-500 dark:text-gray-400 px-3 pr-4 py-3 whitespace-nowrap">
                  Oct 2020
                </td>
              </tr>
              <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors cursor-pointer">
                <td className="pl-4 pr-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">Robert Broussard</span>
                  </div>
                </td>
                <td className="text-xs text-gray-600 dark:text-gray-400 px-3 py-3 whitespace-nowrap">
                  rbroussard@email.com
                </td>
                <td className="text-xs text-gray-600 dark:text-gray-400 px-3 py-3 whitespace-nowrap">
                  (504) 555-0614
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <CategoryChip label="Box Office" />
                    <CategoryChip label="Set Crew" />
                  </div>
                </td>
                <td className="text-sm text-gray-900 dark:text-white px-3 py-3 text-right font-medium">8.0</td>
                <td className="text-sm text-gray-600 dark:text-gray-400 px-3 py-3 text-center">2</td>
                <td className="px-3 py-3">
                  <VolunteerStatusBadge status="archived" />
                </td>
                <td className="text-xs text-gray-500 dark:text-gray-400 px-3 pr-4 py-3 whitespace-nowrap">
                  Nov 2023
                </td>
              </tr>
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-neutral-border bg-neutral-surface dark:bg-dark-nav flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Showing 25 of 142 volunteers</span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-gray-300">{'< Previous'}</span>
              <span>1 of 6</span>
              <span className="text-brand-primary hover:text-brand-primary-dark cursor-pointer">
                {'Next >'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
