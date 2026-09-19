'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { MonthPicker } from '@/components/shared/MonthPicker'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { useTransactions } from '@/hooks/useTransactions'
import { Card, CardContent } from '@/components/ui/card'
import { formatRupiah } from '@/lib/formatters'

export default function TransactionsPage() {
  const [date, setDate] = useState(new Date())
  const { transactions, loading } = useTransactions({ date, limit: 100 })

  const totalExpense = transactions
    .filter((t) => t.flow_type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)
  const totalIncome = transactions
    .filter((t) => t.flow_type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <RealtimeProvider>
      <Header date={date} onDateChange={setDate} title="Transaksi" />

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
        <div className="hidden md:flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Transaksi</h1>
          <MonthPicker date={date} onChange={setDate} />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">Total Pengeluaran</p>
              <p className="text-xl font-bold text-rose-600">{formatRupiah(totalExpense)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">Total Pemasukan</p>
              <p className="text-xl font-bold text-emerald-600">{formatRupiah(totalIncome)}</p>
            </CardContent>
          </Card>
        </div>

        <RecentTransactions transactions={transactions} />
      </div>
    </RealtimeProvider>
  )
}
