'use client'

import React, { useMemo } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { Transaction, FlowType, AccountName } from '@/types'
import { ACCOUNT_LABELS, CATEGORY_EMOJI } from '@/lib/constants'

interface Props {
  transactions: Transaction[]
  query: string
  onQueryChange: (q: string) => void
  selectedAccount: string
  onAccountChange: (acc: string) => void
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  selectedFlow: string
  onFlowChange: (flow: string) => void
  sortBy: 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC'
  onSortChange: (sort: 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC') => void
  onReset: () => void
}

export function TransactionFilterBar({
  transactions,
  query,
  onQueryChange,
  selectedAccount,
  onAccountChange,
  selectedCategory,
  onCategoryChange,
  selectedFlow,
  onFlowChange,
  sortBy,
  onSortChange,
  onReset,
}: Props) {
  const isFiltered =
    query.trim() !== '' ||
    selectedAccount !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedFlow !== 'ALL' ||
    sortBy !== 'DATE_DESC'

  // Extract unique accounts & categories present in dataset
  const availableAccounts = useMemo(() => {
    const set = new Set<string>()
    for (const t of transactions) {
      if (t.source_account) set.add(t.source_account)
      if (t.destination_account) set.add(t.destination_account)
    }
    return Array.from(set).sort()
  }, [transactions])

  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    for (const t of transactions) {
      if (t.category) set.add(t.category)
    }
    return Array.from(set).sort()
  }, [transactions])

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Cari transaksi, merchant, deskripsi..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Flow Type */}
        <select
          value={selectedFlow}
          onChange={(e) => onFlowChange(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">Semua Arus Kas</option>
          <option value="EXPENSE">💸 Pengeluaran</option>
          <option value="INCOME">💰 Pemasukan</option>
          <option value="TRANSFER_INTERNAL">🔄 Transfer Internal</option>
        </select>

        {/* Account */}
        <select
          value={selectedAccount}
          onChange={(e) => onAccountChange(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">Semua Akun / Dompet</option>
          {availableAccounts.map((acc) => (
            <option key={acc} value={acc}>
              {ACCOUNT_LABELS[acc] ?? acc}
            </option>
          ))}
        </select>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">Semua Kategori</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_EMOJI[cat] ?? '📦'} {cat}
            </option>
          ))}
        </select>

        {/* Sorting */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC')}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="DATE_DESC">Terbaru</option>
          <option value="DATE_ASC">Terlama</option>
          <option value="AMOUNT_DESC">Nominal Terbesar</option>
        </select>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  )
}
