'use client'

import { Download } from 'lucide-react'

export function QRGeneratorMockup() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        QR Generator — Option A Mockup
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Code Generator</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generate QR codes for any URL.</p>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
            <div className="border border-neutral-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-white w-full">
              https://30byninetyvolunteers.com
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label (optional)
            </label>
            <div className="border border-neutral-border rounded-md px-3 py-2 bg-white dark:bg-dark-surface text-sm text-gray-900 dark:text-white w-full">
              Main Website
            </div>
          </div>
        </div>

        <button
          type="button"
          className="bg-brand-primary text-white rounded-md px-6 py-2.5 text-sm font-medium hover:bg-brand-primary-dark w-full sm:w-auto"
        >
          Generate QR Code
        </button>
      </div>

      <div className="flex justify-center mt-2">
        <div className="bg-white border border-neutral-border rounded-lg p-6 inline-block">
          <div className="grid grid-cols-10 gap-0.5 w-48 h-48">
            {/* Row 1 */}
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            {/* Row 2 */}
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            {/* Row 3 */}
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            {/* Row 4 */}
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            {/* Row 5 */}
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            {/* Row 6 */}
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            {/* Row 7 */}
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            {/* Row 8 */}
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            {/* Row 9 */}
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            {/* Row 10 */}
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-white" />
            <div className="w-full aspect-square rounded-[1px] bg-gray-900" />
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center mt-3">
        <span className="text-sm text-brand-primary hover:text-brand-primary-dark cursor-pointer flex items-center gap-1.5">
          <Download className="w-4 h-4" />
          Download PNG
        </span>
        <span className="text-sm text-brand-primary hover:text-brand-primary-dark cursor-pointer flex items-center gap-1.5">
          <Download className="w-4 h-4" />
          Download SVG
        </span>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Recent QR Codes</h2>
        <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden">
          <div className="flex items-start justify-between gap-4 px-4 py-3.5 border-b border-neutral-border last:border-b-0">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Main Website</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                https://30byninetyvolunteers.com
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Generated by Jonathan S. · Oct 14
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
                PNG
              </span>
              <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
                SVG
              </span>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4 px-4 py-3.5 border-b border-neutral-border last:border-b-0">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Volunteer Signup</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                https://30byninetyvolunteers.com/signup
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Generated by Sarah M. · Oct 10
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
                PNG
              </span>
              <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
                SVG
              </span>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4 px-4 py-3.5 border-b border-neutral-border last:border-b-0">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Into the Woods — Show Page
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                https://30byninetyvolunteers.com/shows/abc123
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Generated by Jonathan S. · Sep 28
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
                PNG
              </span>
              <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
                SVG
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
