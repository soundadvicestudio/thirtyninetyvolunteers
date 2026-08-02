'use client'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={theme === 'dark'
        ? 'Switch to light mode'
        : 'Switch to dark mode'}
      className="
        flex items-center justify-center
        w-8 h-8 rounded-md
        text-mid-gray hover:text-brand-primary
        hover:bg-gray-100
        dark:text-dark-muted
        dark:hover:text-dark-text
        dark:hover:bg-dark-surface
        transition-colors duration-150
        cursor-pointer
      "
    >
      {theme === 'dark'
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />}
    </button>
  )
}
