'use client'
import {
  createContext, useContext, useEffect, useState
} from 'react'

type Theme = 'light' | 'dark'
const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
}>({ theme: 'light', toggle: () => {} })

export function ThemeProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Read saved preference, fall back to system
    const saved = localStorage.getItem('crew-theme') as Theme | null
    if (saved) {
      setTheme(saved)
    } else if (
      window.matchMedia('(prefers-color-scheme: dark)')
        .matches
    ) {
      setTheme('dark')
    }
    setMounted(true)
  }, [])

  // Keep document.body in sync with theme state on every change — this is
  // the same element the pre-hydration inline script (in the crew layout)
  // sets on first paint, so toggling never leaves a stale attribute on an
  // ancestor the dark: variant still matches.
  useEffect(() => {
    if (!mounted) return
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark')
    } else {
      document.body.removeAttribute('data-theme')
    }
  }, [theme, mounted])

  const toggle = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('crew-theme', next)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
