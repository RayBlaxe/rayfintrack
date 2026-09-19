'use client'
import { useState } from 'react'
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

  const maxExpense = Math.max(...Object.values(dailyExpenses), 1)

  function getIntensity(amount: number): number {
    return Math.min(amount / maxExpense, 1)
  }

  return (
    <div className="bg-[#161B22] rounded-3xl p-5 border border-white/8">
      <h2 className="text-white font-bold mb-4">Aktivitas Bulan Ini</h2>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-white/30 py-1">
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
            const intensity = getIntensity(expense)

            return (
              <motion.button
                key={dateStr}
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  if (!currentMonth) return
                  onSelectDate(selected ? null : dateStr)
                }}
                className={cn(
                  'relative flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all min-h-[48px]',
                  currentMonth ? 'cursor-pointer hover:bg-white/5' : 'cursor-default opacity-25',
                  selected && 'bg-[#CCFF00]/10',
                  today && !selected && 'ring-1 ring-[#CCFF00]/60'
                )}
              >
                {/* Date number */}
                <span className={cn(
                  'text-[11px] font-bold leading-none mb-1',
                  today ? 'text-[#CCFF00]' : 'text-white/70',
                  selected && 'text-[#CCFF00]'
                )}>
                  {day}
                </span>

                {/* Expense badge */}
                {expense > 0 && currentMonth && (
                  <span
                    className="text-[8px] font-bold px-1 py-0.5 rounded-md leading-none"
                    style={{
                      backgroundColor: `rgba(255, 133, 161, ${0.15 + intensity * 0.45})`,
                      color: '#FF85A1',
                    }}
                  >
                    -{formatRupiahUltraCompact(expense)}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      ))}

      {selectedDate && (
        <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
          <p className="text-white/50 text-xs">
            {selectedDate}: {dailyExpenses[selectedDate]
              ? formatRupiahUltraCompact(dailyExpenses[selectedDate]) + ' pengeluaran'
              : 'Tidak ada pengeluaran'}
          </p>
          <button
            onClick={() => onSelectDate(null)}
            className="text-[#CCFF00] text-xs font-medium"
          >
            Hapus filter
          </button>
        </div>
      )}
    </div>
  )
}
