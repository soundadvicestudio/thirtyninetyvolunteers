import Link from 'next/link'
import { HelpCircle } from 'lucide-react'

interface HelpTooltipProps {
  anchor: string
  label?: string
}

export function HelpTooltip({ anchor, label = 'Help' }: HelpTooltipProps) {
  return (
    <Link
      href={`/crew/help#${anchor}`}
      aria-label={`Learn more: ${label}`}
      title={`Learn more about ${label}`}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 text-mid-gray hover:text-navy dark:text-dark-muted dark:hover:text-steel transition-colors"
    >
      <HelpCircle size={14} />
    </Link>
  )
}
