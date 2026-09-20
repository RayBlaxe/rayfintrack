'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Utensils, Wallet, Settings2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters'
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
        className="bg-[#161B22] rounded-3xl p-5 border border-white/8 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <h2 className="text-white font-bold text-sm">Budget Harian Hari Ini</h2>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-colors border border-white/5"
            title="Atur target harian"
          >
            <Settings2 className="h-3 w-3" />
            <span>Atur</span>
          </button>
        </div>

        {/* Food Section */}
        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                <Utensils className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Makanan & Minuman</p>
                <p className="text-[10px] text-white/40">
                  Target: {formatRupiahCompact(foodLimit)}/hari
                </p>
              </div>
            </div>

            <div className="text-right">
              <p
                className={cn(
                  'text-xs font-bold',
                  isFoodOver ? 'text-[#FF85A1]' : 'text-white'
                )}
              >
                {formatRupiahCompact(todayFoodExpense)}
              </p>
              <p className="text-[10px] text-white/40">
                {isFoodOver ? (
                  <span className="text-[#FF85A1] font-semibold flex items-center gap-0.5 justify-end">
                    <AlertTriangle className="h-2.5 w-2.5 inline" /> Over {formatRupiahCompact(Math.abs(foodRemaining))}
                  </span>
                ) : (
                  <span>Sisa {formatRupiahCompact(foodRemaining)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(foodPct, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                isFoodOver
                  ? 'bg-[#FF85A1]'
                  : foodPct > 80
                  ? 'bg-amber-400'
                  : 'bg-[#CCFF00]'
              )}
            />
          </div>
        </div>

        {/* General Expense Section */}
        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Wallet className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Total Pengeluaran Hari Ini</p>
                <p className="text-[10px] text-white/40">
                  {settings.useAutoGeneral ? 'Safe to Spend' : 'Target'}: {formatRupiahCompact(generalLimit)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p
                className={cn(
                  'text-xs font-bold',
                  isGeneralOver ? 'text-[#FF85A1]' : 'text-white'
                )}
              >
                {formatRupiahCompact(todayTotalExpense)}
              </p>
              <p className="text-[10px] text-white/40">
                {isGeneralOver ? (
                  <span className="text-[#FF85A1] font-semibold">
                    Over {formatRupiahCompact(Math.abs(generalRemaining))}
                  </span>
                ) : (
                  <span>Sisa {formatRupiahCompact(generalRemaining)}</span>
                )}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(generalPct, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                isGeneralOver
                  ? 'bg-[#FF85A1]'
                  : generalPct > 80
                  ? 'bg-amber-400'
                  : 'bg-[#CCFF00]'
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
