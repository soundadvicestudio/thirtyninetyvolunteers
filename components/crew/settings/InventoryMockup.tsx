'use client'

import { Search, Plus, Printer, ChevronDown, Package } from 'lucide-react'

export function ConditionBadge({ condition }: { condition: 'excellent' | 'good' | 'fair' | 'poor' }) {
  if (condition === 'excellent') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Excellent
      </span>
    )
  }
  if (condition === 'good') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        Good
      </span>
    )
  }
  if (condition === 'fair') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-700">
        Fair
      </span>
    )
  }
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Poor
    </span>
  )
}

export function AvailabilityBadge({ status }: { status: 'available' | 'checked_out' | 'overdue' }) {
  if (status === 'available') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Available
      </span>
    )
  }
  if (status === 'checked_out') {
    return (
      <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-brand-primary-light text-brand-primary">
        Checked Out
      </span>
    )
  }
  return (
    <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Overdue
    </span>
  )
}

function ItemIdPill({ id }: { id: string }) {
  return (
    <span className="font-mono text-xs bg-neutral-surface border border-neutral-border rounded px-1.5 py-0.5 text-gray-600 dark:bg-dark-nav dark:text-gray-400 dark:border-neutral-border">
      {id}
    </span>
  )
}

export function InventoryMockup() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Inventory — Option A Mockup (List View)
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track props, costumes, and equipment.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 border border-neutral-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Search items...</span>
          </div>
          <button
            type="button"
            className="bg-brand-primary text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-primary-dark flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Item
          </button>
          <button
            type="button"
            className="border border-neutral-border bg-neutral-surface text-gray-700 dark:text-gray-300 rounded-md px-3 py-2 text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Tags
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="bg-brand-primary text-white rounded-md px-3 py-1.5 text-sm font-medium">
            Active Only
          </span>
          <span className="flex items-center gap-1.5 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Category: All
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </span>
          <span className="flex items-center gap-1.5 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Availability: All
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </span>
          <span className="flex items-center gap-1.5 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Condition: All
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </span>
          <span className="flex items-center gap-1.5 border border-neutral-border rounded-md px-3 py-1.5 bg-white dark:bg-dark-surface text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            Location: All
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </span>
        </div>
      </div>

      <div className="bg-brand-primary-light border border-brand-primary rounded-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-primary" />
          <span className="text-sm text-brand-primary font-medium">3 items currently checked out</span>
          <span className="text-brand-primary-mid">·</span>
          <span className="text-sm text-red-600 font-medium">1 overdue</span>
        </div>
        <span className="text-sm text-brand-primary hover:text-brand-primary-dark cursor-pointer">
          View All
        </span>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border">
              <th className="text-left pl-4 pr-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Item ID
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Name
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Category
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Condition
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Location
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Availability
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="pl-4 pr-3 py-3">
                <ItemIdPill id="PROP-0042" />
              </td>
              <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">Pocket Watch (Gold)</td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Props</td>
              <td className="px-3 py-3">
                <ConditionBadge condition="excellent" />
              </td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Props Storage — Shelf B</td>
              <td className="px-3 py-3">
                <AvailabilityBadge status="available" />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="pl-4 pr-3 py-3">
                <ItemIdPill id="COST-0017" />
              </td>
              <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">Victorian Waistcoat (M)</td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Costumes</td>
              <td className="px-3 py-3">
                <ConditionBadge condition="good" />
              </td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Costume Loft — Rack 3</td>
              <td className="px-3 py-3">
                <AvailabilityBadge status="checked_out" />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="pl-4 pr-3 py-3">
                <ItemIdPill id="PROP-0031" />
              </td>
              <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">Candelabra (Large)</td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Props</td>
              <td className="px-3 py-3">
                <ConditionBadge condition="good" />
              </td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Props Storage — Shelf A</td>
              <td className="px-3 py-3">
                <AvailabilityBadge status="available" />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="pl-4 pr-3 py-3">
                <ItemIdPill id="ELEC-0008" />
              </td>
              <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">Fresnel Spotlight (500W)</td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Electrics</td>
              <td className="px-3 py-3">
                <ConditionBadge condition="fair" />
              </td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Lighting Booth</td>
              <td className="px-3 py-3">
                <AvailabilityBadge status="overdue" />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="pl-4 pr-3 py-3">
                <ItemIdPill id="COST-0029" />
              </td>
              <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">Top Hat (Black, L)</td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Costumes</td>
              <td className="px-3 py-3">
                <ConditionBadge condition="excellent" />
              </td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Costume Loft — Rack 1</td>
              <td className="px-3 py-3">
                <AvailabilityBadge status="available" />
              </td>
            </tr>
            <tr className="hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
              <td className="pl-4 pr-3 py-3">
                <ItemIdPill id="SET-0005" />
              </td>
              <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">Park Bench (Folding)</td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Set Pieces</td>
              <td className="px-3 py-3">
                <ConditionBadge condition="poor" />
              </td>
              <td className="px-3 py-3 text-gray-600 dark:text-gray-400 text-sm">Scene Shop</td>
              <td className="px-3 py-3">
                <AvailabilityBadge status="available" />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-neutral-border bg-neutral-surface dark:bg-dark-nav text-xs text-gray-500 dark:text-gray-400">
          Showing 6 items — 5 active, 3 available, 1 checked out, 1 overdue
        </div>
      </div>
    </div>
  )
}
