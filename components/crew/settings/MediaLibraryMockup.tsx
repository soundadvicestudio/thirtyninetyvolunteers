'use client'

import { Folder } from 'lucide-react'

export function PDFBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      PDF
    </span>
  )
}

export function VideoBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
      Video
    </span>
  )
}

export function LinkBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
      Link
    </span>
  )
}

export function ImageBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
      Image
    </span>
  )
}

export function PublicBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
      Public
    </span>
  )
}

export function LinkOnlyBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-700">
      Link Only
    </span>
  )
}

export function BackendBadge() {
  return (
    <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      Backend
    </span>
  )
}

function FolderRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={
        active
          ? 'px-3 py-2.5 flex items-center gap-2 cursor-pointer text-sm border-b border-neutral-border last:border-b-0 bg-brand-primary-light text-brand-primary font-medium'
          : 'px-3 py-2.5 flex items-center gap-2 cursor-pointer text-sm border-b border-neutral-border last:border-b-0 text-gray-700 dark:text-gray-300 hover:bg-neutral-surface transition-colors'
      }
    >
      <Folder className={active ? 'w-4 h-4 flex-shrink-0' : 'w-4 h-4 text-gray-400 flex-shrink-0'} />
      {label}
    </div>
  )
}

function DocumentRow({
  title,
  typeBadge,
  tierBadge,
  action,
}: {
  title: string
  typeBadge: React.ReactNode
  tierBadge: React.ReactNode
  action: string
}) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3 hover:bg-neutral-surface dark:hover:bg-dark-nav transition-colors">
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{title}</span>
        {typeBadge}
        {tierBadge}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer">
          Copy Link
        </span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="text-xs text-brand-primary hover:text-brand-primary-dark cursor-pointer">
          {action}
        </span>
      </div>
    </div>
  )
}

export function MediaLibraryMockup() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <p className="text-xs font-medium text-brand-primary uppercase tracking-widest mb-6">
        Media Library — Option A Mockup
      </p>

      <div className="pb-4 border-b border-neutral-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Files and links shared across the organization.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-neutral-border rounded-lg overflow-hidden flex min-h-[400px]">
        <div className="w-52 flex-shrink-0 border-r border-neutral-border flex flex-col">
          <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Folders
          </div>
          <FolderRow label="All Files" active={false} />
          <FolderRow label="Production Materials" active />
          <FolderRow label="Marketing Assets" active={false} />
          <FolderRow label="Cast & Crew Resources" active={false} />
          <FolderRow label="Season Archives" active={false} />
          <FolderRow label="General" active={false} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="bg-neutral-surface dark:bg-dark-nav border-b border-neutral-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Production Materials
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">5 files</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-brand-primary text-white rounded-md px-3 py-1.5 text-xs font-medium hover:bg-brand-primary-dark"
              >
                Upload File
              </button>
              <button
                type="button"
                className="border border-neutral-border bg-neutral-surface text-gray-700 dark:text-gray-300 rounded-md px-3 py-1.5 text-xs"
              >
                Add Link
              </button>
            </div>
          </div>

          <div className="divide-y divide-neutral-border">
            <DocumentRow
              title="Into the Woods — Director's Notes"
              typeBadge={<PDFBadge />}
              tierBadge={<BackendBadge />}
              action="View"
            />
            <DocumentRow
              title="Rehearsal Schedule — Oct 2025"
              typeBadge={<PDFBadge />}
              tierBadge={<LinkOnlyBadge />}
              action="View"
            />
            <DocumentRow
              title="Production Promo Video"
              typeBadge={<VideoBadge />}
              tierBadge={<PublicBadge />}
              action="Play"
            />
            <DocumentRow
              title="Audition Materials — 2025 Season"
              typeBadge={<LinkBadge />}
              tierBadge={<LinkOnlyBadge />}
              action="View"
            />
            <DocumentRow
              title="Volunteer Handbook Cover"
              typeBadge={<ImageBadge />}
              tierBadge={<PublicBadge />}
              action="View"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
