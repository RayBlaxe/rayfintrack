'use client'

import { BudgetProgressItem } from './BudgetProgressItem'
import { BudgetWithSpending } from '@/types'
import { PieChart } from 'lucide-react'

interface Props {
  budgets: BudgetWithSpending[]
  loading?: boolean
}

export function BudgetProgressList({ budgets, loading }: Props) {
  return (
    <div className="bg-[#161B22] rounded-3xl p-5 border border-white/8 space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <h2 className="flex items-center gap-2 text-white font-bold text-sm">
          <PieChart className="h-4 w-4 text-[#CCFF00]" />
          <span>Kategori Anggaran Bulan Ini</span>
        </h2>
        <span className="text-xs text-white/40">{budgets.length} Kategori</span>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-xs space-y-2">
            <p className="text-2xl">📊</p>
            <p className="font-medium text-white/60">Belum ada budget bulanan.</p>
            <p>
              Set budget via bot Telegram:{' '}
              <code className="bg-white/10 px-1.5 py-0.5 rounded text-[11px] text-[#CCFF00]">
                /budget set Makanan &amp; Minuman 1500000
              </code>
            </p>
          </div>
        ) : (
          budgets.map((b) => <BudgetProgressItem key={b.id} budget={b} />)
        )}
      </div>
    </div>
  )
}
