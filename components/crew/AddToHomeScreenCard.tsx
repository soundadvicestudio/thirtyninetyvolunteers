'use client'

import { useEffect, useRef, useState } from 'react'
import { Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type PromptState = 'hidden' | 'android' | 'ios'

const DISMISSED_KEY = 'pwa_prompt_dismissed'

export default function AddToHomeScreenCard() {
  const [state, setState] = useState<PromptState>('hidden')
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    if (localStorage.getItem(DISMISSED_KEY) === 'true') {
      return
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      deferredPrompt.current = event as BeforeInstallPromptEvent
      setState('android')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIOS) {
      // Reads navigator.userAgent (client-only) after mount to avoid SSR hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState('ios')
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setState('hidden')
  }

  async function handleInstall() {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    deferredPrompt.current = null
    setState('hidden')
  }

  if (state === 'hidden') return null

  return (
    <div className="md:hidden mb-6">
      <div className="relative bg-light-navy dark:bg-dark-surface border border-divider dark:border-dark-border rounded-lg p-4">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 text-mid-gray hover:text-dark dark:text-dark-muted dark:hover:text-dark-text text-lg leading-none cursor-pointer"
        >
          ×
        </button>

        <h2 className="text-dark dark:text-dark-text font-bold mb-1 pr-6">Add to your Home Screen</h2>

        {state === 'android' && (
          <>
            <p className="text-mid-gray dark:text-dark-muted text-sm mb-3">
              Install Production Crew as an app for quick access from your home screen.
            </p>
            <button
              type="button"
              onClick={handleInstall}
              className="bg-navy text-white hover:bg-steel transition-colors text-sm px-4 py-2 rounded-md font-medium cursor-pointer"
            >
              Install App
            </button>
          </>
        )}

        {state === 'ios' && (
          <>
            <p className="text-mid-gray dark:text-dark-muted text-sm mb-3">
              Install Production Crew for quick access:
            </p>
            <ol className="space-y-1.5 text-sm text-dark dark:text-dark-text list-decimal list-inside">
              <li>
                Tap the Share button (<Share className="inline w-4 h-4 -mt-0.5" aria-hidden="true" />) at
                the bottom of Safari
              </li>
              <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
              <li>Tap &quot;Add&quot; to confirm</li>
            </ol>
          </>
        )}
      </div>
    </div>
  )
}
