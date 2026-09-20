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
    <div className="space-y-2 p-3.5 bg-white/5 rounded-2xl border border-white/5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg leading-none">{emoji}</span>
          <span className="font-semibold text-white truncate text-xs">{category}</span>
          {isOver && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF85A1]/20 text-[#FF85A1] font-bold">
              Over!
            </span>
          )}
          {isWarning && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">
              80%+
            </span>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <span
            className={cn(
              'font-bold text-xs',
              isOver ? 'text-[#FF85A1]' : 'text-white'
            )}
          >
            {formatRupiahCompact(spent)}
          </span>
          <span className="text-white/40 text-xs"> / {formatRupiahCompact(limit)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            isOver
              ? 'bg-[#FF85A1]'
              : isWarning
              ? 'bg-amber-400'
              : 'bg-[#CCFF00]'
          )}
        />
      </div>

      <div className="flex justify-between items-center text-[10px]">
        <span className="text-white/30">{pct.toFixed(0)}% terpakai</span>
        <span
          className={cn(
            'font-medium',
            remaining >= 0 ? 'text-white/50' : 'text-[#FF85A1]'
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
