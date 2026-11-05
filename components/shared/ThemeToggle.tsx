'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function ThemeToggle({ className, size = 'md', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn(
          'inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors',
          size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-10 w-10' : 'h-9 w-9',
          className
        )}
      >
        <span className="h-4 w-4 opacity-0" />
      </button>
    )
  }

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm transition-all active:scale-95',
        size === 'sm' ? 'h-8 px-2' : size === 'lg' ? 'h-10 px-3' : 'h-9 px-2.5',
        !showLabel && (size === 'sm' ? 'w-8' : size === 'lg' ? 'w-10' : 'w-9'),
        className
      )}
    >
      {isDark ? (
        <Sun className={cn('text-amber-400 transition-transform hover:rotate-45', size === 'sm' ? 'h-4 w-4' : 'h-4 w-4')} />
      ) : (
        <Moon className={cn('text-slate-700 transition-transform hover:-rotate-12', size === 'sm' ? 'h-4 w-4' : 'h-4 w-4')} />
      )}
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? 'Mode Terang' : 'Mode Gelap'}
        </span>
      )}
    </button>
  )
}
