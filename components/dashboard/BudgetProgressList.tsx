import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BudgetProgressItem } from './BudgetProgressItem'
import { BudgetProgressSkeleton } from '@/components/shared/LoadingSkeleton'
import { BudgetWithSpending } from '@/types'
import { PieChart } from 'lucide-react'

interface Props {
  budgets: BudgetWithSpending[]
  loading?: boolean
}

export function BudgetProgressList({ budgets, loading }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChart className="h-4 w-4 text-indigo-500" />
          Anggaran Bulan Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <BudgetProgressSkeleton />
        ) : budgets.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            <p>Belum ada budget yang diset.</p>
            <p className="mt-1">
              Gunakan{' '}
              <code className="bg-slate-100 px-1 rounded text-xs">/budget set</code>{' '}
              di Telegram.
            </p>
          </div>
        ) : (
          budgets.map((b) => <BudgetProgressItem key={b.id} budget={b} />)
        )}
      </CardContent>
    </Card>
  )
}
