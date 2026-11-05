'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, AlertTriangle, PieChart, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { Header } from '@/components/layout/Header'
import { MonthPicker } from '@/components/shared/MonthPicker'
import { useTransactions } from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { useAssets } from '@/hooks/useAssets'
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters'
import { CREDIT_CARD_ACCOUNTS, CATEGORY_EMOJI, CATEGORY_COLORS } from '@/lib/constants'

// Categorization helper for 50/30/20
const NEEDS_CATEGORIES = new Set([
  'Makanan & Minuman',
  'Transportasi',
  'Tagihan & Utilitas',
  'Kesehatan',
  'Pendidikan',
  'Rumah Tangga',
  'Cicilan',
  'Asuransi',
  'Operasional',
  'Komitmen Keluarga',
])

const SAVINGS_CATEGORIES = new Set([
  'Investasi',
  'Tabungan',
])

export default function InsightsPage() {
  const [date, setDate] = useState(new Date())
  const { transactions, loading: txLoading } = useTransactions({ date, limit: 500 })
  const { accounts, loading: accLoading } = useAccounts()
  const { assets } = useAssets()

  // 1. Kas Likuid & Runway
  const totalLiquidCash = useMemo(() => {
    return accounts
      .filter((a) => !CREDIT_CARD_ACCOUNTS.includes(a.account_name))
      .reduce((s, a) => s + Math.max(a.current_balance, 0), 0)
  }, [accounts])

  const totalAssetValue = useMemo(() => {
    return assets.reduce((s, a) => s + a.value, 0)
  }, [assets])

  // 2. Spending per Post / Kategori
  const categorySpendingList = useMemo(() => {
    const map: Record<string, number> = {}
    for (const t of transactions) {
      if (t.flow_type === 'EXPENSE') {
        map[t.category] = (map[t.category] || 0) + t.amount
      }
    }

    const list = Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      color: CATEGORY_COLORS[category] || '#10B981',
      emoji: CATEGORY_EMOJI[category] || '📦',
    }))

    return list.sort((a, b) => b.amount - a.amount)
  }, [transactions])

  const totalExpense = useMemo(() => {
    return categorySpendingList.reduce((s, c) => s + c.amount, 0)
  }, [categorySpendingList])

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.flow_type === 'INCOME')
      .reduce((s, t) => s + t.amount, 0)
  }, [transactions])

  const maxCategoryAmount = useMemo(() => {
    return Math.max(...categorySpendingList.map((c) => c.amount), 1)
  }, [categorySpendingList])

  // 3. 50/30/20 Rule Breakdown
  const ratios = useMemo(() => {
    let needs = 0
    let wants = 0
    let savings = 0

    for (const item of categorySpendingList) {
      if (NEEDS_CATEGORIES.has(item.category)) {
        needs += item.amount
      } else if (SAVINGS_CATEGORIES.has(item.category)) {
        savings += item.amount
      } else {
        wants += item.amount
      }
    }

    // Baseline: total income or total expense if income is 0
    const base = totalIncome > 0 ? totalIncome : totalExpense || 1
    return {
      needsAmount: needs,
      wantsAmount: wants,
      savingsAmount: savings,
      needsPct: Math.round((needs / base) * 100),
      wantsPct: Math.round((wants / base) * 100),
      savingsPct: Math.round((savings / base) * 100),
    }
  }, [categorySpendingList, totalIncome, totalExpense])

  // 4. Emergency Runway
  const runwayMonths = totalExpense > 0 ? (totalLiquidCash / totalExpense).toFixed(1) : '∞'
  const runwayNum = Number(runwayMonths) || 0
  const runwayStatus =
    runwayMonths === '∞' || runwayNum >= 6
      ? { label: 'SANGAT AMAN', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' }
      : runwayNum >= 3
      ? { label: 'CUKUP', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' }
      : { label: 'WASPADA', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' }

  // 5. Top category & anomaly
  const topCategory = categorySpendingList[0]

  return (
    <RealtimeProvider>
      <Header date={date} onDateChange={setDate} title="Financial Insights" />

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 pb-24">
        {/* Header Desktop */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Financial Insights</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Analisis pos pengeluaran, rasio 50/30/20, & ketahanan dana</p>
          </div>
          <MonthPicker date={date} onChange={setDate} />
        </div>

        {/* Top Metric Cards (Runway & Anomali) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Runway */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Emergency Runway</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${runwayStatus.color}`}>
                  {runwayStatus.label}
                </span>
              </div>
              <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {runwayMonths} Bulan
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Berdasarkan kas likuid {formatRupiah(totalLiquidCash)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Top Expense Category */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pos Pengeluaran Terbesar</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                {topCategory ? (
                  <>
                    <span>{topCategory.emoji}</span>
                    <span>{topCategory.category}</span>
                  </>
                ) : (
                  <span>Belum ada belanja</span>
                )}
              </div>
              <p className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 mt-1">
                {topCategory ? `${formatRupiah(topCategory.amount)} (${Math.round((topCategory.amount / (totalExpense || 1)) * 100)}% dari total)` : 'Rp 0'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>

        {/* Grafik Batang Pos Pengeluaran (Post Graph) */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Distribusi Pos Pengeluaran (Post Graph)</span>
            </h2>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              Total: {formatRupiah(totalExpense)}
            </span>
          </div>

          {categorySpendingList.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              Belum ada catatan pengeluaran pada periode ini.
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {categorySpendingList.map((item, idx) => {
                const widthPct = Math.max(Math.round((item.amount / maxCategoryAmount) * 100), 4)
                const sharePct = Math.round((item.amount / (totalExpense || 1)) * 100)

                return (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
                        <span>{item.emoji}</span>
                        <span>{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2.5 font-mono">
                        <span className="text-slate-400 text-[11px]">({sharePct}%)</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{formatRupiah(item.amount)}</span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* Evaluasi Aturan 50/30/20 */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Evaluasi Alokasi 50 / 30 / 20
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Arus Masuk: {formatRupiah(totalIncome || totalExpense)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            {/* Needs */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kebutuhan Pokok (Needs)</p>
              <p className="text-xs text-slate-400 mt-0.5">Target: 50%</p>
              <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {ratios.needsPct}%
              </p>
              <p className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 mt-1">
                {formatRupiahCompact(ratios.needsAmount)}
              </p>
            </div>

            {/* Wants */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gaya Hidup & Keinginan (Wants)</p>
              <p className="text-xs text-slate-400 mt-0.5">Target: 30%</p>
              <p className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                {ratios.wantsPct}%
              </p>
              <p className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 mt-1">
                {formatRupiahCompact(ratios.wantsAmount)}
              </p>
            </div>

            {/* Savings */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tabungan & Investasi (Savings)</p>
              <p className="text-xs text-slate-400 mt-0.5">Target: 20%</p>
              <p className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {ratios.savingsPct}%
              </p>
              <p className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 mt-1">
                {formatRupiahCompact(ratios.savingsAmount)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </RealtimeProvider>
  )
}
