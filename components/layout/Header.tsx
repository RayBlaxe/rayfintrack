'use client'

import { Wallet } from 'lucide-react'
import { MonthPicker } from '@/components/shared/MonthPicker'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

interface Props {
  date: Date
  onDateChange: (date: Date) => void
  title?: string
}

export function Header({ date, onDateChange, title = 'Dashboard' }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3.5 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 md:hidden sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 dark:bg-emerald-500 shadow-sm">
          <Wallet className="h-4 w-4 text-white dark:text-slate-950" />
        </div>
        <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">{title}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <MonthPicker date={date} onChange={onDateChange} />
        <ThemeToggle size="sm" />
      </div>
    </header>
  )
}
