'use client'

import { Download } from 'lucide-react'
import { buildVolunteersCsv, csvExportFilename, downloadCsv } from '@/lib/utils/csv'
import type { VolunteerListRow } from '@/types/volunteer'

export default function ExportAllButton({ volunteers }: { volunteers: VolunteerListRow[] }) {
  function handleExport() {
    downloadCsv(csvExportFilename(), buildVolunteersCsv(volunteers))
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center gap-1.5 text-sm bg-white border border-navy text-navy font-semibold px-3 py-1.5 rounded hover:bg-light-navy transition-colors"
    >
      <Download size={14} />
      Export Matching (CSV)
    </button>
  )
}
