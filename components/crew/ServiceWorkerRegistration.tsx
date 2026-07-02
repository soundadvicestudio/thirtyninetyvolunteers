'use client'
import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/crew/' })
        .then(reg => {
          console.log('[SW] Registered:', reg.scope)
          // Check for updates on every load
          reg.update()
        })
        .catch(err =>
          console.error('[SW] Registration failed:', err)
        )
    }
  }, [])

  return null
}
