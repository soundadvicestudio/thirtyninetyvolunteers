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

  const toggle = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('crew-theme', next)
      return next
    })
  }

  // Prevent flash: render children without theme
  // attribute until mounted (SSR safe)
  return (
    <div
      data-theme={mounted ? theme : undefined}
      className="contents"
    >
      <ThemeContext.Provider value={{ theme, toggle }}>
        {children}
      </ThemeContext.Provider>
    </div>
  )
}

export const useTheme = () => useContext(ThemeContext)
