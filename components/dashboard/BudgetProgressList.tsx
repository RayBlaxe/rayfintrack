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
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h2 className="flex items-center gap-2 text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">
          <PieChart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Kategori Anggaran Bulan Ini</span>
        </h2>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{budgets.length} Kategori</span>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs space-y-2">
            <p className="text-2xl">📊</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">Belum ada target anggaran bulan ini.</p>
            <p className="text-[11px]">
              Tambahkan budget via menu Budget atau Telegram bot.
            </p>
          </div>
        ) : (
          budgets.map((b) => <BudgetProgressItem key={b.id} budget={b} />)
        )}
      </div>
    </div>
  )
}
