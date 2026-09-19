import { Wallet, Clock, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Props {
  totalBudget: number
  totalExpense: number
  daysRemaining: number
  loading?: boolean
}

export function SafeToSpendWidget({ totalBudget, totalExpense, daysRemaining, loading }: Props) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="h-4 w-32 bg-slate-200 rounded mb-2 animate-pulse" />
          <div className="h-8 w-44 bg-slate-200 rounded mb-1 animate-pulse" />
          <div className="h-3 w-52 bg-slate-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (totalBudget === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-5 text-center">
          <Wallet className="h-6 w-6 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">
            Set anggaran via Telegram{' '}
            <code className="bg-slate-100 px-1 rounded text-xs">/budget set</code>
          </p>
        </CardContent>
      </Card>
    )
  }

  const remaining = totalBudget - totalExpense
  const dailyBudget = remaining / Math.max(daysRemaining, 1)
  const pct = Math.min((totalExpense / totalBudget) * 100, 100)

  const status =
    dailyBudget <= 0 ? 'danger' : daysRemaining <= 3 ? 'warning' : 'safe'

  return (
    <Card
      className={cn(
        'border-l-4',
        status === 'safe' && 'border-l-emerald-500',
        status === 'warning' && 'border-l-amber-500',
        status === 'danger' && 'border-l-rose-500'
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-500 font-medium">Safe-to-Spend</span>
          </div>
          <Badge variant="outline" className="text-xs gap-1">
            <Clock className="h-3 w-3" />
            {daysRemaining} hari lagi
          </Badge>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <p
            className={cn(
              'text-3xl font-bold tracking-tight',
              status === 'safe' && 'text-emerald-600',
              status === 'warning' && 'text-amber-600',
              status === 'danger' && 'text-rose-600'
            )}
          >
            {dailyBudget > 0 ? formatRupiah(dailyBudget) : 'Overbudget!'}
          </p>
          {dailyBudget > 0 && (
            <span className="text-sm text-slate-400">/hari</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <TrendingDown className="h-3.5 w-3.5" />
          <span>
            Terpakai {formatRupiahCompact(totalExpense)} dari{' '}
            {formatRupiahCompact(totalBudget)}{' '}
            <span className="font-medium">({pct.toFixed(0)}%)</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
