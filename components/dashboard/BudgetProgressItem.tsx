import { Progress } from '@/components/ui/progress'
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
  const status = pct >= 100 ? 'over' : pct >= 80 ? 'warning' : 'safe'
  const clampedPct = Math.min(pct, 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base leading-none">{emoji}</span>
          <span className="font-medium text-slate-700 truncate">{category}</span>
          {status === 'over' && (
            <span className="text-xs text-rose-500 flex-shrink-0">🚨</span>
          )}
          {status === 'warning' && (
            <span className="text-xs text-amber-500 flex-shrink-0">⚠️</span>
          )}
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <span
            className={cn(
              'font-semibold',
              status === 'over' ? 'text-rose-600' : 'text-slate-700'
            )}
          >
            {formatRupiahCompact(spent)}
          </span>
          <span className="text-slate-400"> / {formatRupiahCompact(limit)}</span>
        </div>
      </div>

      <Progress
        value={clampedPct}
        className={cn(
          'h-2',
          status === 'over' && '[&>div]:bg-rose-500',
          status === 'warning' && '[&>div]:bg-amber-500',
          status === 'safe' && '[&>div]:bg-emerald-500'
        )}
      />

      <p className="text-xs text-slate-400 text-right">
        {remaining >= 0
          ? `Sisa ${formatRupiahCompact(remaining)}`
          : `🚨 Melebihi ${formatRupiahCompact(-remaining)}`}
      </p>
    </div>
  )
}
