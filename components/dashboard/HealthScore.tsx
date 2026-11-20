'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X, CheckCircle, ShieldAlert, Award, Activity } from 'lucide-react'

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
  const [showFormula, setShowFormula] = useState(false)
  const runway = avgMonthlyExpense > 0 ? liquidAssets / avgMonthlyExpense : 0

  const fallbackScore = calcScoreFallback(savingsRate, budgetDiscipline, runway)
  const fallbackStatus = getStatusFallback(fallbackScore)

  const score = compositeScore !== undefined ? compositeScore : fallbackScore
  const label = compositeLabel || fallbackStatus.label
  const color = compositeColor || fallbackStatus.color
  const bg = compositeBg || fallbackStatus.bg

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight flex items-center gap-1.5">
            Financial Health Score
            <button
              type="button"
              onClick={() => setShowFormula(true)}
              className="text-slate-400 hover:text-emerald-500 transition-colors p-0.5"
              title="Lihat formula & rincian perhitungan skor"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Skor kesehatan finansial pribadi 4 pilar standar</p>
        </div>

        <button
          type="button"
          onClick={() => setShowFormula(true)}
          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <span>Formula</span>
        </button>
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
            {score === 0 && label === 'BELUM ADA DATA'
              ? 'Catat transaksi atau anggaran pertamamu untuk mulai menghitung Financial Health Score!'
              : score >= 80
              ? 'Keuanganmu sangat sehat! Pertahankan disiplin alokasi ini.'
              : score >= 60
              ? 'Kondisi cukup stabil. Sisa anggaran aman dan aset terjaga.'
              : score >= 40
              ? 'Waspadai pengeluaran tidak terduga dan prioritaskan pelunasan utang.'
              : 'Segera sesuaikan alokasi anggaran dan lunasi kewajiban mendesak.'}
          </p>
        </div>
      </div>

      {/* Sub metrics / Breakdown */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Disiplin Budget</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {scoreBreakdown ? `${scoreBreakdown.budgetAdherenceScore}/35 pt` : `${Math.round(budgetDiscipline)}%`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${scoreBreakdown ? (scoreBreakdown.budgetAdherenceScore / 35) * 100 : budgetDiscipline}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Runway Kas</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {scoreBreakdown ? `${scoreBreakdown.liquidityScore}/30 pt` : `${runway.toFixed(1)} bln`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full"
                style={{ width: `${scoreBreakdown ? (scoreBreakdown.liquidityScore / 30) * 100 : Math.min((runway / 6) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Beban Utang</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {scoreBreakdown ? `${scoreBreakdown.liabilityScore}/20 pt` : 'Aman'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${scoreBreakdown ? (scoreBreakdown.liabilityScore / 20) * 100 : 80}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Aset & Tabungan</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {scoreBreakdown ? `${scoreBreakdown.savingsScore}/15 pt` : `${Math.round(savingsRate)}%`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${scoreBreakdown ? (scoreBreakdown.savingsScore / 15) * 100 : Math.min(savingsRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Formula Modal Popover */}
      <AnimatePresence>
        {showFormula && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0E1524] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-50">Formula Financial Health</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormula(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Skor dihitung secara deterministik dan transparan menggunakan **4 Pilar Standar Finansial (Skor Maksimum 100)**:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <span>1. Disiplin Anggaran (50/30/20)</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Maks 35 Poin</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Menilai alokasi pengeluaran bulanan. Alokasi kebutuhan pokok (Needs) maksimal 50% dan keinginan (Wants) maksimal 30% dari baseline pendapatan. Pengeluaran melebihi batas mengurangi poin secara proporsional.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <span>2. Likuiditas & Runway Dana Darurat</span>
                    <span className="text-teal-600 dark:text-teal-400">Maks 30 Poin</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Mengukur ketahanan kas likuid (tabungan & e-wallet) dibagi rata-rata pengeluaran bulanan:
                    <br />• ≥ 6 bulan: 30 poin (Sangat Aman)
                    <br />• ≥ 3 bulan: 24 poin (Cukup Baik)
                    <br />• ≥ 1 bulan: 18 poin (Waspada)
                    <br />• &lt; 1 bulan: 0 - 12 poin (Kritis)
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <span>3. Rasio Beban Utang & Kewajiban</span>
                    <span className="text-amber-600 dark:text-amber-400">Maks 20 Poin</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Mengukur rasio total liabilitas (kartu kredit + utang pribadi) terhadap cadangan penghasilan 3 bulan:
                    <br />• Rasio ≤ 20%: 20 poin (Bebas Utang)
                    <br />• Rasio 21% - 50%: 15 poin
                    <br />• Rasio &gt; 100%: 0 - 5 poin
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <span>4. Akumulasi Aset & Tabungan</span>
                    <span className="text-blue-600 dark:text-blue-400">Maks 15 Poin</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Mengukur rasio total aset produktif/investasi dibanding pengeluaran bulanan:
                    <br />• Nilai aset ≥ 2x pengeluaran: 15 poin
                    <br />• Nilai aset ≥ 1x pengeluaran: 10 poin
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormula(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
