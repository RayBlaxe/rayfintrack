'use client'

import { motion } from 'framer-motion'
import { BudgetWithSpending } from '@/types'
import { CATEGORY_EMOJI } from '@/lib/constants'
import { formatRupiahCompact } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Props {
  budget: BudgetWithSpending
}

export function BudgetProgressItem({ budget }: Props) {
  const { category, spent, limit_amount: limit, remaining, pct } = budget
  const emoji = CATEGORY_EMOJI[category] ?? '📁'
  const isOver = pct >= 100
  const isWarning = pct >= 80 && pct < 100
  const clampedPct = Math.min(pct, 100)

  return (
    <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none">{emoji}</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">{category}</span>
          {isOver && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-bold">
              Over!
            </span>
          )}
          {isWarning && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
              80%+
            </span>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <span
            className={cn(
              'font-bold font-mono text-xs',
              isOver ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
            )}
          >
            {formatRupiahCompact(spent)}
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-mono text-xs"> / {formatRupiahCompact(limit)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            isOver
              ? 'bg-red-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-emerald-600 dark:bg-emerald-500'
          )}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] font-medium">
        <span className="text-slate-500 dark:text-slate-400">{pct.toFixed(0)}% terpakai</span>
        <span
          className={cn(
            'font-semibold',
            remaining >= 0 ? 'text-slate-600 dark:text-slate-300' : 'text-red-600 dark:text-red-400'
          )}
        >
          {remaining >= 0
            ? `Sisa ${formatRupiahCompact(remaining)}`
            : `Over ${formatRupiahCompact(-remaining)}`}
        </span>
      </div>
    </div>
  )
}
