'use client'

import { motion } from 'framer-motion'
import { formatRupiahCompact } from '@/lib/formatters'

interface Props {
  needsAmount: number
  wantsAmount: number
  savingsAmount: number
  totalIncome: number
  daysInMonth: number
  currentDay: number
}

interface BarItemProps {
  label: string
  sublabel: string
  amount: number
  actual: number   // actual % of income
  target: number   // target %
  color: string
  delay: number
}

function BarItem({ label, sublabel, amount, actual, target, color, delay }: BarItemProps) {
  const pct = Math.min(actual, 100)
  const overTarget = actual > target

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-slate-900 dark:text-slate-100 text-sm font-bold">{label}</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs ml-2 font-medium">({sublabel})</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold font-mono ${overTarget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {formatRupiahCompact(amount)}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs ml-1 font-mono">({actual.toFixed(0)}%)</span>
        </div>
      </div>

      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span>Target: {target}%</span>
        {overTarget && <span className="text-rose-600 dark:text-rose-400 font-semibold">{(actual - target).toFixed(0)}% di atas target</span>}
      </div>
    </div>
  )
}

export function NeedsWantsSavings({
  needsAmount, wantsAmount, savingsAmount, totalIncome, daysInMonth, currentDay
}: Props) {
  const base = totalIncome || (needsAmount + wantsAmount + savingsAmount) || 1
  const needsPct = (needsAmount / base) * 100
  const wantsPct = (wantsAmount / base) * 100
  const savingsPct = (savingsAmount / base) * 100

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">Aturan 50 / 30 / 20</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Alokasi anggaran bulanan</p>
        </div>
        <span className="text-slate-600 dark:text-slate-400 text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
          Hari {currentDay} / {daysInMonth}
        </span>
      </div>

      <div className="space-y-4">
        <BarItem
          label="Kebutuhan Pokok"
          sublabel="Needs"
          amount={needsAmount}
          actual={needsPct}
          target={50}
          color="#10B981"
          delay={0.15}
        />
        <BarItem
          label="Keinginan & Lifestyle"
          sublabel="Wants"
          amount={wantsAmount}
          actual={wantsPct}
          target={30}
          color="#F59E0B"
          delay={0.25}
        />
        <BarItem
          label="Tabungan & Investasi"
          sublabel="Savings"
          amount={savingsAmount}
          actual={savingsPct}
          target={20}
          color="#3B82F6"
          delay={0.35}
        />
      </div>
    </div>
  )
}
