'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toggleStatus } from '@/lib/actions/volunteers'

export default function StatusToggle({
  volunteerId,
  currentStatus,
  volunteerName,
}: {
  volunteerId: string
  currentStatus: 'active' | 'archived'
  volunteerName: string
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleToggle(newStatus: 'active' | 'archived') {
    setIsSubmitting(true)
    const result = await toggleStatus(volunteerId, newStatus)
    if ('success' in result) {
      router.refresh()
      return
    }
    setIsSubmitting(false)
    alert(result.error)
  }

  if (currentStatus === 'archived') {
    return (
      <button
        type="button"
        onClick={() => handleToggle('active')}
        disabled={isSubmitting}
        className="bg-navy text-white hover:bg-steel transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Reactivate
      </button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="border border-orange text-orange bg-white hover:bg-orange hover:text-white transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
        >
          Archive
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {volunteerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will no longer appear in active volunteer searches. You can reactivate them at
            any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogPrimitive.Cancel className="border border-divider dark:border-dark-border text-dark dark:text-dark-text hover:bg-light-navy dark:hover:bg-dark-surface/50 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
            Cancel
          </AlertDialogPrimitive.Cancel>
          <AlertDialogPrimitive.Action
            onClick={() => handleToggle('archived')}
            disabled={isSubmitting}
            className="bg-orange text-white hover:bg-orange/90 transition-colors px-4 py-2 rounded-md text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Archive
          </AlertDialogPrimitive.Action>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
