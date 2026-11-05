'use client'

import { motion } from 'framer-motion'
import { DailyExpenseMap } from '@/types'
import { formatRupiahUltraCompact, isToday } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Props {
  year: number
  month: number
  dailyExpenses: DailyExpenseMap
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

const DAY_LABELS = ['SN', 'SL', 'RB', 'KM', 'JM', 'SB', 'MG']

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  let startDow = firstDay.getDay() // 0=Sun
  startDow = startDow === 0 ? 6 : startDow - 1 // Monday-first (0=Mon, 6=Sun)

  const days: Array<{ dateStr: string; day: number | null; currentMonth: boolean }> = []

  // Prev month padding
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(firstDay)
    d.setDate(-i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({ dateStr, day: d.getDate(), currentMonth: false })
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month - 1, d)
    const dateStr = date.toISOString().split('T')[0]
    days.push({ dateStr, day: d, currentMonth: true })
  }

  // Fill to 6 weeks
  const total = Math.ceil(days.length / 7) * 7
  let nextD = 1
  while (days.length < total) {
    const date = new Date(year, month, nextD++)
    const dateStr = date.toISOString().split('T')[0]
    days.push({ dateStr, day: date.getDate(), currentMonth: false })
  }

  return days
}

export function CalendarHeatmap({ year, month, dailyExpenses, selectedDate, onSelectDate }: Props) {
  const days = getCalendarDays(year, month)
  const weeks = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">Kalender Aktivitas</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Pengeluaran harian bulan ini</p>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
          {week.map(({ dateStr, day, currentMonth }) => {
            const expense = dailyExpenses[dateStr] ?? 0
            const today = isToday(dateStr)
            const selected = selectedDate === dateStr

            return (
              <motion.button
                key={dateStr}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => {
                  if (!currentMonth) return
                  onSelectDate(selected ? null : dateStr)
                }}
                className={cn(
                  'relative flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all min-h-[48px]',
                  currentMonth
                    ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    : 'cursor-default opacity-20',
                  selected && 'bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500',
                  today && !selected && 'ring-2 ring-emerald-600 dark:ring-emerald-400'
                )}
              >
                {/* Date number */}
                <span className={cn(
                  'text-[11px] font-bold leading-none mb-1',
                  today ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200',
                  selected && 'text-emerald-700 dark:text-emerald-400'
                )}>
                  {day}
                </span>

                {/* Expense badge */}
                {expense > 0 && currentMonth && (
                  <span className="text-[9px] font-bold font-mono px-1 py-0.5 rounded-md leading-none bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                    -{formatRupiahUltraCompact(expense)}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      ))}

      {selectedDate && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">
            <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDate}:</span>{' '}
            {dailyExpenses[selectedDate]
              ? formatRupiahUltraCompact(dailyExpenses[selectedDate]) + ' pengeluaran'
              : 'Tidak ada pengeluaran'}
          </p>
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:underline"
          >
            Hapus filter
          </button>
        </div>
      )}
    </div>
  )
}
