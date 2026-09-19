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
          <span className="text-white text-sm font-semibold">{label}</span>
          <span className="text-white/40 text-xs ml-2">{sublabel}</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${overTarget ? 'text-[#FF85A1]' : 'text-white'}`}>
            {formatRupiahCompact(amount)}
          </span>
          <span className="text-white/40 text-xs ml-1">({actual.toFixed(0)}%)</span>
        </div>
      </div>
      <div className="h-2 w-full bg-white/8 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay, duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-white/30">
        <span>Target {target}%</span>
        {overTarget && <span className="text-[#FF85A1]">{(actual - target).toFixed(0)}% di atas target</span>}
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
    <div className="bg-[#161B22] rounded-3xl p-5 border border-white/8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-bold">Alokasi Pengeluaran</h2>
        <span className="text-white/40 text-xs bg-white/8 px-2.5 py-1 rounded-full">
          Hari {currentDay} / {daysInMonth}
        </span>
      </div>

      <div className="space-y-5">
        <BarItem
          label="Kebutuhan"
          sublabel="Needs"
          amount={needsAmount}
          actual={needsPct}
          target={50}
          color="#CCFF00"
          delay={0.2}
        />
        <BarItem
          label="Keinginan"
          sublabel="Wants"
          amount={wantsAmount}
          actual={wantsPct}
          target={30}
          color="#FF85A1"
          delay={0.35}
        />
        <BarItem
          label="Tabungan"
          sublabel="Savings"
          amount={savingsAmount}
          actual={savingsPct}
          target={20}
          color="#8b5cf6"
          delay={0.5}
        />
      </div>
    </div>
  )
}
