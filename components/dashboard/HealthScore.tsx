'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, TrendingUp, AlertCircle, Wallet } from 'lucide-react'

interface Props {
  netWorth: number
  savingsRate: number      // 0–100
  budgetDiscipline: number // 0–100 (100 = fully within budget)
  liquidAssets: number
  avgMonthlyExpense: number
  compositeScore?: number
  compositeLabel?: string
  compositeColor?: string
  compositeBg?: string
  scoreBreakdown?: {
    budgetAdherenceScore: number
    liquidityScore: number
    liabilityScore: number
    savingsScore: number
  }
}

function calcScoreFallback(savingsRate: number, budgetDiscipline: number, runway: number): number {
  const boundedSavings = Math.max(savingsRate, 0)
  const s = Math.min(boundedSavings / 20 * 40, 40)
  const b = Math.min(budgetDiscipline / 100 * 35, 35)
  const r = Math.min(runway / 6 * 25, 25)
  return Math.max(Math.round(s + b + r), 0)
}

function getStatusFallback(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: 'SANGAT BAGUS',    color: '#10B981', bg: 'rgba(16,185,129,0.12)' }
  if (score >= 60) return { label: 'CUKUP BAIK',      color: '#0D9488', bg: 'rgba(13,148,136,0.12)' }
  if (score >= 40) return { label: 'WASPADA',         color: '#D97706', bg: 'rgba(217,119,6,0.12)' }
  return                    { label: 'PERLU PERBAIKAN', color: '#DC2626', bg: 'rgba(220,38,38,0.12)' }
}

interface MetricRowProps {
  label: string
  value: string
  sub: string
  color: string
}

function MetricRow({ label, value, sub, color }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold">{label}</p>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{sub}</p>
      </div>
      <span className="font-bold font-mono text-sm" style={{ color }}>{value}</span>
    </div>
  )
}

export function HealthScore({
  savingsRate,
  budgetDiscipline,
  liquidAssets,
  avgMonthlyExpense,
  compositeScore,
  compositeLabel,
  compositeColor,
  compositeBg,
  scoreBreakdown,
}: Props) {
  const runway = avgMonthlyExpense > 0 ? liquidAssets / avgMonthlyExpense : 0

  const fallbackScore = calcScoreFallback(savingsRate, budgetDiscipline, runway)
  const fallbackStatus = getStatusFallback(fallbackScore)

  const score = compositeScore !== undefined ? compositeScore : fallbackScore
  const label = compositeLabel || fallbackStatus.label
  const color = compositeColor || fallbackStatus.color
  const bg = compositeBg || fallbackStatus.bg

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="mb-4">
        <h2 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">Financial Health Score</h2>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">Skor kesehatan finansial pribadi multi-faktor</p>
      </div>

      {/* Score gauge */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative h-24 w-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="rotate-[-135deg] h-24 w-24">
            {/* Track */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="178 240"
            />
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
              className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold">/100</span>
          </div>
        </div>

        <div>
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-xs"
            style={{ color, backgroundColor: bg }}
          >
            {label}
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
            {score >= 80
              ? 'Keuanganmu sangat sehat! Pertahankan disiplin alokasi ini.'
              : score >= 60
              ? 'Kondisi cukup stabil. Sisa anggaran aman dan aset investasi terjaga.'
              : score >= 40
              ? 'Waspadai pengeluaran tidak terduga dan prioritaskan pelunasan utang.'
              : 'Segera sesuaikan alokasi anggaran dan lunasi kewajiban mendesak.'}
          </p>
        </div>
      </div>

      {/* Sub metrics / Breakdown */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <MetricRow
          label="Disiplin Anggaran"
          sub="Kepatuhan terhadap batas limit bulan ini"
          value={`${Math.round(budgetDiscipline)}%`}
          color={budgetDiscipline >= 80 ? '#10B981' : budgetDiscipline >= 60 ? '#D97706' : '#DC2626'}
        />
        <MetricRow
          label="Runway Kas Likuid"
          sub="Ketahanan dana darurat tunai & bank"
          value={`${runway.toFixed(1)} bln`}
          color={runway >= 3 ? '#10B981' : runway >= 1 ? '#D97706' : '#DC2626'}
        />
        <MetricRow
          label="Tingkat Tabungan"
          sub="Rasio sisa dana terhadap kapasitas bulanan"
          value={`${Math.max(savingsRate, 0).toFixed(0)}%`}
          color={savingsRate >= 20 ? '#10B981' : savingsRate > 0 ? '#D97706' : '#64748B'}
        />
      </div>
    </div>
  )
}
