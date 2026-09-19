'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { MonthPicker } from '@/components/shared/MonthPicker'
import { BudgetProgressList } from '@/components/dashboard/BudgetProgressList'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { useBudgets } from '@/hooks/useBudgets'
import { Card, CardContent } from '@/components/ui/card'
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters'

export default function BudgetsPage() {
  const [date, setDate] = useState(new Date())
  const { budgets, loading } = useBudgets(date)

  const totalLimit = budgets.reduce((s, b) => s + b.limit_amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const overBudget = budgets.filter((b) => b.pct >= 100).length

  return (
    <RealtimeProvider>
      <Header date={date} onDateChange={setDate} title="Budget" />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
        <div className="hidden md:flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Budget</h1>
          <MonthPicker date={date} onChange={setDate} />
        </div>

        {/* Budget summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">Total Anggaran</p>
              <p className="text-lg font-bold text-slate-800">{formatRupiahCompact(totalLimit)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">Terpakai</p>
              <p className="text-lg font-bold text-rose-600">{formatRupiahCompact(totalSpent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">Overbudget</p>
              <p className="text-lg font-bold text-amber-600">{overBudget} kategori</p>
            </CardContent>
          </Card>
        </div>

        <BudgetProgressList budgets={budgets} loading={loading} />

        <Card className="border-dashed bg-slate-50">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-600 mb-2">💡 Set Budget via Telegram</p>
            <div className="font-mono text-xs space-y-1 text-slate-500">
              <p>/budget set Makanan &amp; Minuman 1500000</p>
              <p>/budget set Operasional 500000</p>
              <p>/budget set Cicilan 800000</p>
              <p>/budget — lihat semua budget</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RealtimeProvider>
  )
}
