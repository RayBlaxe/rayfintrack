'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Utensils, Wallet, Settings2, AlertTriangle } from 'lucide-react'
import { formatRupiahCompact } from '@/lib/formatters'
import { useDailyBudgetSettings } from '@/hooks/useDailyBudgetSettings'
import { DailyBudgetModal } from './DailyBudgetModal'
import { cn } from '@/lib/utils'

interface Props {
  todayFoodExpense: number
  todayTotalExpense: number
  safeToSpendDaily: number
}

export function DailyBudgetCard({
  todayFoodExpense,
  todayTotalExpense,
  safeToSpendDaily,
}: Props) {
  const { settings, updateSettings } = useDailyBudgetSettings()
  const [modalOpen, setModalOpen] = useState(false)

  // Food limit calculations
  const foodLimit = settings.foodDailyLimit
  const foodPct = foodLimit > 0 ? (todayFoodExpense / foodLimit) * 100 : 0
  const foodRemaining = foodLimit - todayFoodExpense
  const isFoodOver = foodRemaining < 0

  // General limit calculations
  const generalLimit = settings.useAutoGeneral
    ? (safeToSpendDaily > 0 ? safeToSpendDaily : 0)
    : settings.generalDailyLimit
  const generalPct = generalLimit > 0 ? (todayTotalExpense / generalLimit) * 100 : 0
  const generalRemaining = generalLimit - todayTotalExpense
  const isGeneralOver = generalRemaining < 0

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <h2 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">Budget Harian Hari Ini</h2>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors border border-slate-300 dark:border-slate-700"
            title="Atur target harian"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Atur</span>
          </button>
        </div>

        {/* Food Section */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Utensils className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 text-xs font-bold">Makanan & Minuman</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Target: {formatRupiahCompact(foodLimit)}/hari
                </p>
              </div>
            </div>

            <div className="text-right">
              <p
                className={cn(
                  'text-xs font-bold',
                  isFoodOver ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                )}
              >
                {formatRupiahCompact(todayFoodExpense)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isFoodOver ? (
                  <span className="text-red-600 dark:text-red-400 font-semibold flex items-center gap-0.5 justify-end">
                    <AlertTriangle className="h-2.5 w-2.5 inline" /> Over {formatRupiahCompact(Math.abs(foodRemaining))}
                  </span>
                ) : (
                  <span>Sisa {formatRupiahCompact(foodRemaining)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(foodPct, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                isFoodOver
                  ? 'bg-red-500'
                  : foodPct > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-600 dark:bg-emerald-500'
              )}
            />
          </div>
        </div>

        {/* General Expense Section */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 text-xs font-bold">Total Pengeluaran Hari Ini</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {settings.useAutoGeneral ? 'Safe to Spend' : 'Target'}: {formatRupiahCompact(generalLimit)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p
                className={cn(
                  'text-xs font-bold',
                  isGeneralOver ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'
                )}
              >
                {formatRupiahCompact(todayTotalExpense)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isGeneralOver ? (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    Over {formatRupiahCompact(Math.abs(generalRemaining))}
                  </span>
                ) : (
                  <span>Sisa {formatRupiahCompact(generalRemaining)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(generalPct, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                isGeneralOver
                  ? 'bg-red-500'
                  : generalPct > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-600 dark:bg-emerald-500'
              )}
            />
          </div>
        </div>
      </motion.div>

      <DailyBudgetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        settings={settings}
        onSave={updateSettings}
      />
    </>
  )
}
