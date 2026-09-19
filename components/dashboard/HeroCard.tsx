'use client'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters'

interface Props {
  safeToSpendDaily: number
  todayExpense: number
  todayIncome: number
  monthExpense: number
  monthIncome: number
}

export function HeroCard({ safeToSpendDaily, todayExpense, todayIncome, monthExpense, monthIncome }: Props) {
  const hasSpentToday = todayExpense > 0
  const overBudget = safeToSpendDaily < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mx-5 rounded-3xl p-6 hero-gradient overflow-hidden relative"
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />

      {/* Header */}
      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Sekilas Hari Ini</p>

      {/* Safe to spend */}
      <div className="mb-5">
        <p className="text-white/50 text-sm mb-1">Aman dibelanjakan hari ini</p>
        <motion.p
          className={`text-4xl font-bold tracking-tight ${
            overBudget ? 'text-[#FF85A1]' : 'text-[#CCFF00]'
          }`}
          key={safeToSpendDaily}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          {overBudget ? 'Overbudget!' : formatRupiah(safeToSpendDaily)}
        </motion.p>
      </div>

      {/* Income vs Expense */}
      <div className="flex gap-4 mb-5">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="h-8 w-8 rounded-full bg-[#CCFF00]/15 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-[#CCFF00]" />
          </div>
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wide">Pemasukan</p>
            <p className="text-[#CCFF00] text-sm font-bold">{formatRupiahCompact(monthIncome)}</p>
          </div>
        </div>
        <div className="w-px bg-white/10" />
        <div className="flex items-center gap-2.5 flex-1">
          <div className="h-8 w-8 rounded-full bg-[#FF85A1]/15 flex items-center justify-center">
            <TrendingDown className="h-3.5 w-3.5 text-[#FF85A1]" />
          </div>
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-wide">Pengeluaran</p>
            <p className="text-[#FF85A1] text-sm font-bold">{formatRupiahCompact(monthExpense)}</p>
          </div>
        </div>
      </div>

      {/* Status line */}
      <div className="border-t border-white/10 pt-3 flex items-center justify-between">
        <p className="text-white/50 text-xs">
          {!hasSpentToday
            ? '🎉 Belum ada pengeluaran hari ini'
            : `💸 Sudah belanja ${formatRupiahCompact(todayExpense)} hari ini`}
        </p>
        <ArrowRight className="h-3.5 w-3.5 text-white/30" />
      </div>
    </motion.div>
  )
}
