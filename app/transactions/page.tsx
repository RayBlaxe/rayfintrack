'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { MonthPicker } from '@/components/shared/MonthPicker'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { useTransactions } from '@/hooks/useTransactions'
import { Card, CardContent } from '@/components/ui/card'
import { formatRupiah } from '@/lib/formatters'
import { TransactionFilterBar } from '@/components/transactions/TransactionFilterBar'
import { FlowType } from '@/types'

export default function TransactionsPage() {
  const [date, setDate] = useState(new Date())
  const { transactions, loading, refetch } = useTransactions({ date, limit: 500 })

  // Filter States
  const [query, setQuery] = useState('')
  const [selectedAccount, setSelectedAccount] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedFlow, setSelectedFlow] = useState('ALL')
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC'>('DATE_DESC')

  const resetFilters = () => {
    setQuery('')
    setSelectedAccount('ALL')
    setSelectedCategory('ALL')
    setSelectedFlow('ALL')
    setSortBy('DATE_DESC')
  }

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase()

    return transactions
      .filter((tx) => {
        const matchesQuery =
          !q ||
          (tx.description && tx.description.toLowerCase().includes(q)) ||
          (tx.merchant_name && tx.merchant_name.toLowerCase().includes(q)) ||
          (tx.category && tx.category.toLowerCase().includes(q))

        const matchesAccount =
          selectedAccount === 'ALL' ||
          tx.source_account === selectedAccount ||
          tx.destination_account === selectedAccount

        const matchesCategory =
          selectedCategory === 'ALL' || tx.category === selectedCategory

        const matchesFlow =
          selectedFlow === 'ALL' || tx.flow_type === selectedFlow

        return matchesQuery && matchesAccount && matchesCategory && matchesFlow
      })
      .sort((a, b) => {
        if (sortBy === 'AMOUNT_DESC') return b.amount - a.amount
        const tA = new Date(a.transaction_date).getTime()
        const tB = new Date(b.transaction_date).getTime()
        return sortBy === 'DATE_DESC' ? tB - tA : tA - tB
      })
  }, [transactions, query, selectedAccount, selectedCategory, selectedFlow, sortBy])

  const totalExpense = filteredTransactions
    .filter((t) => t.flow_type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)
  const totalIncome = filteredTransactions
    .filter((t) => t.flow_type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <RealtimeProvider>
      <Header date={date} onDateChange={setDate} title="Transaksi" />

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Riwayat Transaksi</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Cari, filter, edit, atau batalkan transaksi</p>
          </div>
          <MonthPicker date={date} onChange={setDate} />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Total Pengeluaran</p>
              <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{formatRupiah(totalExpense)}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Total Pemasukan</p>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatRupiah(totalIncome)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <TransactionFilterBar
          transactions={transactions}
          query={query}
          onQueryChange={setQuery}
          selectedAccount={selectedAccount}
          onAccountChange={setSelectedAccount}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedFlow={selectedFlow}
          onFlowChange={setSelectedFlow}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={resetFilters}
        />

        {/* Transactions List */}
        <RecentTransactions
          transactions={filteredTransactions}
          title={query || selectedAccount !== 'ALL' || selectedCategory !== 'ALL' || selectedFlow !== 'ALL' ? 'Hasil Filter Transaksi' : 'Daftar Transaksi Bulan Ini'}
          onRefresh={refetch}
          showActions={true}
        />
      </div>
    </RealtimeProvider>
  )
}
