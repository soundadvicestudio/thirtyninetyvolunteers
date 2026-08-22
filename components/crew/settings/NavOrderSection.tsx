'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  GroupKey,
  SidebarNavOrder,
  DEFAULT_GROUP_ORDER,
  DEFAULT_LINK_ORDER,
  GROUP_LABELS,
  HREF_LABELS,
} from '@/types/sidebar'
import { saveSidebarNavOrder } from '@/lib/actions/setup'
import type { SetupPanelInitialValues } from '@/components/crew/settings/SetupPanel'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const ALL_GROUP_KEYS: GroupKey[] = ['events', 'people', 'utilities', 'settings']

// Self-healing merge — identical in behavior to resolveGroupHrefs() in
// Sidebar.tsx. A saved linkOrder[group] array that predates a newly added
// link (e.g. Beta Testing) would otherwise hide that link from the reorder
// UI entirely. Any href present in DEFAULT_LINK_ORDER but missing from the
// saved array is appended to the end.
function mergeLinkOrder(saved: Partial<Record<GroupKey, string[]>> | undefined): Record<GroupKey, string[]> {
  const merged = {} as Record<GroupKey, string[]>
  for (const key of ALL_GROUP_KEYS) {
    const savedArr = saved?.[key] ?? DEFAULT_LINK_ORDER[key]
    const missing = DEFAULT_LINK_ORDER[key].filter((href) => !savedArr.includes(href))
    merged[key] = [...savedArr, ...missing]
  }
  return merged
}

function parseNavOrder(raw: string): SidebarNavOrder {
  try {
    if (!raw) throw new Error('empty')
    const parsed = JSON.parse(raw) as unknown
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray((parsed as SidebarNavOrder).groupOrder) ||
      !(parsed as SidebarNavOrder).linkOrder
    ) {
      throw new Error('invalid shape')
    }
    const result = parsed as SidebarNavOrder
    return {
      groupOrder: result.groupOrder,
      linkOrder: mergeLinkOrder(result.linkOrder),
    }
  } catch {
    return {
      groupOrder: [...DEFAULT_GROUP_ORDER],
      linkOrder: mergeLinkOrder(undefined),
    }
  }
}

function moveItem<T>(arr: T[], index: number, direction: 'up' | 'down'): T[] {
  const newArr = [...arr]
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= newArr.length) return newArr
  ;[newArr[index], newArr[target]] = [newArr[target], newArr[index]]
  return newArr
}

// Matches SetupPanel.tsx's cardClasses, minus the padding — the padding
// here is supplied per-zone by the header/body/footer divs below.
const cardClasses =
  'bg-white dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg overflow-hidden'
const saveButtonClasses =
  'bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-primary-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

export default function NavOrderSection({
  initialValues,
}: {
  initialValues: SetupPanelInitialValues
}) {
  const [navOrder, setNavOrder] = useState<SidebarNavOrder>(() =>
    parseNavOrder(initialValues.sidebar_nav_order)
  )
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleGroupMove = (index: number, direction: 'up' | 'down') => {
    setNavOrder((prev) => ({
      ...prev,
      groupOrder: moveItem(prev.groupOrder, index, direction),
    }))
  }

  const handleLinkMove = (group: GroupKey, index: number, direction: 'up' | 'down') => {
    setNavOrder((prev) => ({
      ...prev,
      linkOrder: {
        ...prev.linkOrder,
        [group]: moveItem(prev.linkOrder[group], index, direction),
      },
    }))
  }

  const handleReset = () => {
    setNavOrder({
      groupOrder: [...DEFAULT_GROUP_ORDER],
      linkOrder: {
        events: [...DEFAULT_LINK_ORDER.events],
        people: [...DEFAULT_LINK_ORDER.people],
        utilities: [...DEFAULT_LINK_ORDER.utilities],
        settings: [...DEFAULT_LINK_ORDER.settings],
      },
    })
  }

  const handleSave = async () => {
    setStatus('saving')
    const result = await saveSidebarNavOrder(navOrder)
    if ('error' in result) {
      setStatus('error')
      setErrorMessage(result.error)
    } else {
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <div className={cardClasses}>
      {/* Header */}
      <div className="p-6 border-b border-neutral-border">
        <h2 className="text-lg font-semibold text-dark dark:text-dark-text">
          Sidebar Navigation Order
        </h2>
        <p className="text-sm text-mid-gray dark:text-dark-muted mt-1">
          Customize the order of navigation groups and the links within each group. Changes
          apply immediately to all users after saving.
        </p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-8">
        {/* Group Order */}
        <div>
          <h3 className="text-sm font-semibold text-dark dark:text-dark-text mb-3">
            Group Order
          </h3>
          <div className="space-y-1">
            {navOrder.groupOrder.map((groupKey, index) => (
              <div
                key={groupKey}
                className="flex items-center justify-between py-2 px-3 rounded bg-neutral-surface dark:bg-dark-nav"
              >
                <span className="text-sm text-dark dark:text-dark-text font-medium">
                  {GROUP_LABELS[groupKey]}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleGroupMove(index, 'up')}
                    disabled={index === 0}
                    aria-label={`Move ${GROUP_LABELS[groupKey]} up`}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-surface disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGroupMove(index, 'down')}
                    disabled={index === navOrder.groupOrder.length - 1}
                    aria-label={`Move ${GROUP_LABELS[groupKey]} down`}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-surface disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-group link order */}
        {navOrder.groupOrder.map((groupKey) => (
          <div key={groupKey}>
            <h3 className="text-sm font-semibold text-dark dark:text-dark-text mb-3">
              {GROUP_LABELS[groupKey]} Links
            </h3>
            <div className="space-y-1">
              {navOrder.linkOrder[groupKey].map((href, index) => (
                <div
                  key={href}
                  className="flex items-center justify-between py-2 px-3 rounded bg-neutral-surface dark:bg-dark-nav"
                >
                  <span className="text-sm text-dark dark:text-dark-text">
                    {HREF_LABELS[href] ?? href}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleLinkMove(groupKey, index, 'up')}
                      disabled={index === 0}
                      aria-label={`Move ${HREF_LABELS[href] ?? href} up`}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-surface disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLinkMove(groupKey, index, 'down')}
                      disabled={index === navOrder.linkOrder[groupKey].length - 1}
                      aria-label={`Move ${HREF_LABELS[href] ?? href} down`}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-surface disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-neutral-border flex items-center justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-mid-gray dark:text-dark-muted hover:text-dark dark:hover:text-dark-text transition-colors"
        >
          Reset to defaults
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'saving'}
            className={saveButtonClasses}
          >
            {status === 'saving' ? 'Saving…' : 'Save Order'}
          </button>
          {status === 'saved' && (
            <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-600 dark:text-red-400">{errorMessage}</span>
          )}
        </div>
      </div>
    </div>
  )
}
