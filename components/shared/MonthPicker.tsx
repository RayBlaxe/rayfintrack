'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthYear } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Props {
  date: Date
  onChange: (date: Date) => void
  className?: string
}

export function MonthPicker({ date, onChange, className }: Props) {
  const prev = () => {
    const d = new Date(date)
    d.setMonth(d.getMonth() - 1)
    onChange(d)
  }
  const next = () => {
    const d = new Date(date)
    d.setMonth(d.getMonth() + 1)
    onChange(d)
  }
  const isCurrentMonth =
    date.getMonth() === new Date().getMonth() &&
    date.getFullYear() === new Date().getFullYear()

  return (
    <div className={cn('flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs', className)}>
      <button
        type="button"
        aria-label="Bulan sebelumnya"
        onClick={prev}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-xs transition-all active:scale-95"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="text-xs font-bold min-w-[95px] text-center text-slate-800 dark:text-slate-100 px-1 select-none">
        {formatMonthYear(date)}
      </span>

      <button
        type="button"
        aria-label="Bulan berikutnya"
        onClick={next}
        disabled={isCurrentMonth}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-xs transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
