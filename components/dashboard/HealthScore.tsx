'use client'
import { motion } from 'framer-motion'
import { formatRupiahCompact } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Props {
  netWorth: number
  savingsRate: number      // 0–100
  budgetDiscipline: number // 0–100 (100 = fully within budget)
  liquidAssets: number
  avgMonthlyExpense: number
}

function calcScore(savingsRate: number, budgetDiscipline: number, runway: number): number {
  const s = Math.min(savingsRate / 20 * 40, 40)    // max 40 pts at 20% savings
  const b = Math.min(budgetDiscipline / 100 * 35, 35) // max 35 pts
  const r = Math.min(runway / 6 * 25, 25)           // max 25 pts at 6-month runway
  return Math.max(Math.round(s + b + r), 0)
}

function getStatus(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: 'SANGAT BAGUS',    color: '#CCFF00', bg: 'rgba(204,255,0,0.1)' }
  if (score >= 60) return { label: 'CUKUP BAIK',      color: '#86efac', bg: 'rgba(134,239,172,0.1)' }
  if (score >= 40) return { label: 'WASPADA',         color: '#FFB547', bg: 'rgba(255,181,71,0.1)' }
  return                    { label: 'PERLU PERBAIKAN', color: '#FF85A1', bg: 'rgba(255,133,161,0.1)' }
}

interface MetricRowProps { label: string; value: string; sub: string; color: string }
function MetricRow({ label, value, sub, color }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/70 text-sm">{label}</p>
        <p className="text-white/40 text-xs">{sub}</p>
      </div>
      <span className="font-bold text-sm" style={{ color }}>{value}</span>
    </div>
  )
}

export function HealthScore({ netWorth, savingsRate, budgetDiscipline, liquidAssets, avgMonthlyExpense }: Props) {
  const runway = avgMonthlyExpense > 0 ? liquidAssets / avgMonthlyExpense : 0
  const score = calcScore(savingsRate, budgetDiscipline, runway)
  const { label, color, bg } = getStatus(score)

  return (
    <div className="bg-[#161B22] rounded-3xl p-5 border border-white/8">
      <h2 className="text-white font-bold mb-5">Financial Health Score</h2>

      {/* Score gauge */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative h-24 w-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="rotate-[-135deg] h-24 w-24">
            {/* Track */}
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" strokeDasharray="178 240" />
            {/* Progress */}
            <motion.circle
              cx="50" cy="50" r="38"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="240"
              initial={{ strokeDashoffset: 240 }}
              animate={{ strokeDashoffset: 240 - (score / 100) * 178 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-2xl font-black text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-white/40 text-[9px]">/100</span>
          </div>
        </div>

        <div>
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
            style={{ color, backgroundColor: bg }}
          >
            {label}
          </div>
          <p className="text-white/50 text-xs leading-relaxed">
            {score >= 80
              ? 'Keuanganmu sangat sehat! Pertahankan.'
              : score >= 60
              ? 'Lumayan baik, masih bisa ditingkatkan.'
              : score >= 40
              ? 'Ada beberapa area yang perlu perhatian.'
              : 'Segera perbaiki kebiasaan keuangan.'}
          </p>
        </div>
      </div>

      {/* Sub metrics */}
      <div className="space-y-3 pt-4 border-t border-white/8">
        <MetricRow
          label="Rasio Tabungan"
          sub="Savings Rate"
          value={`${savingsRate.toFixed(0)}%`}
          color={savingsRate >= 20 ? '#CCFF00' : savingsRate >= 10 ? '#FFB547' : '#FF85A1'}
        />
        <MetricRow
          label="Disiplin Anggaran"
          sub="Budget Discipline"
          value={`${Math.round(budgetDiscipline)}%`}
          color={budgetDiscipline >= 80 ? '#CCFF00' : budgetDiscipline >= 60 ? '#FFB547' : '#FF85A1'}
        />
        <MetricRow
          label="Runway Darurat"
          sub="Likuid / Avg Expense"
          value={`${runway.toFixed(1)} bln`}
          color={runway >= 6 ? '#CCFF00' : runway >= 3 ? '#FFB547' : '#FF85A1'}
        />
      </div>
    </div>
  )
}
