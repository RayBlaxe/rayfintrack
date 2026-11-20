'use client'

import { BudgetProgressItem } from './BudgetProgressItem'
import { BudgetWithSpending } from '@/types'
import { PieChart, Plus } from 'lucide-react'

interface Props {
  budgets: BudgetWithSpending[]
  loading?: boolean
  onAddBudget?: () => void
  onSelectBudget?: (budget: BudgetWithSpending) => void
}

export function BudgetProgressList({
  budgets,
  loading,
  onAddBudget,
  onSelectBudget,
}: Props) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <h2 className="flex items-center gap-2 text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">
          <PieChart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Kategori Anggaran Bulan Ini</span>
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{budgets.length} Kategori</span>
          {onAddBudget && (
            <button
              type="button"
              onClick={onAddBudget}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs space-y-3">
            <p className="text-3xl">📊</p>
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Belum ada target anggaran bulan ini.</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tentukan batas belanja kategori untuk mengontrol keuanganmu.
              </p>
            </div>
            {onAddBudget && (
              <button
                type="button"
                onClick={onAddBudget}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Buat Anggaran Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          budgets.map((b) => (
            <BudgetProgressItem
              key={b.id}
              budget={b}
              onClick={onSelectBudget ? () => onSelectBudget(b) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}
