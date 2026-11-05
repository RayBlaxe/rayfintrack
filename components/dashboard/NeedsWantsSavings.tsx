'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sliders, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'
import { formatRupiahCompact, formatRupiah } from '@/lib/formatters'
import { NeedsWantsSavingsModal } from '@/components/dashboard/NeedsWantsSavingsModal'

interface Props {
  needsAmount: number
  wantsAmount: number
  savingsAmount: number
  totalIncome: number
  daysInMonth: number
  currentDay: number
  totalBudgetLimit?: number
  effectiveBaseline?: number
  baselineSource?: 'USER_TARGET' | 'BUDGET_SUM' | 'REALIZED_INCOME' | 'DEFAULT'
  needsPacingStatus?: 'ON_TRACK' | 'SLIGHTLY_AHEAD' | 'OVERPACING'
  onRefresh?: () => void
}

interface BarItemProps {
  label: string
  sublabel: string
  amount: number
  actual: number   // actual % of baseline
  target: number   // target %
  color: string
  delay: number
  statusNote?: string
  isOver?: boolean
}

function BarItem({ label, sublabel, amount, actual, target, color, delay, statusNote, isOver }: BarItemProps) {
  const pct = Math.min(Math.max(actual, 0), 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-slate-900 dark:text-slate-100 text-sm font-bold">{label}</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs ml-2 font-medium">({sublabel})</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold font-mono ${isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
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

      <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span>Target: {target}%</span>
        {statusNote && (
          <span className={isOver ? 'text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1' : 'text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1'}>
            {statusNote}
          </span>
        )}
      </div>
    </div>
  )
}

export function NeedsWantsSavings({
  needsAmount,
  wantsAmount,
  savingsAmount,
  totalIncome,
  daysInMonth,
  currentDay,
  totalBudgetLimit = 0,
  effectiveBaseline: propBaseline,
  baselineSource = 'BUDGET_SUM',
  needsPacingStatus = 'ON_TRACK',
  onRefresh,
}: Props) {
  const [showModal, setShowModal] = useState(false)

  // Determine baseline: priority propBaseline -> totalBudgetLimit -> totalIncome -> 5.000.000
  const baseline = propBaseline && propBaseline > 0
    ? propBaseline
    : (totalBudgetLimit > 0 ? totalBudgetLimit : (totalIncome > 0 ? totalIncome : 5000000))

  const needsPct = (needsAmount / baseline) * 100
  const wantsPct = (wantsAmount / baseline) * 100
  const savingsPct = (savingsAmount / baseline) * 100

  // Pacing notes
  const needsIsOver = needsPct > 50
  let needsNote = ''
  if (needsIsOver) {
    needsNote = `${(needsPct - 50).toFixed(0)}% di atas batas alokasi`
  } else if (needsPacingStatus === 'ON_TRACK') {
    needsNote = `Aman · Hari ke-${currentDay}`
  } else {
    needsNote = `Mendekati limit harian`
  }

  const wantsIsOver = wantsPct > 30
  const wantsNote = wantsIsOver
    ? `${(wantsPct - 30).toFixed(0)}% di atas target`
    : `Terkendali (${wantsPct.toFixed(0)}% / 30%)`

  const sourceLabel = baselineSource === 'USER_TARGET'
    ? 'Target Custom'
    : baselineSource === 'BUDGET_SUM'
    ? 'Total Limit Anggaran'
    : 'Pemasukan Terkini'

  return (
    <>
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">Aturan 50 / 30 / 20</h2>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded-md">
                Pacing Aktif
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Alokasi terhadap kapasitas bulanan: <strong className="text-slate-700 dark:text-slate-300">{formatRupiahCompact(baseline)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200/80 dark:border-slate-700"
              title="Atur target baseline pemasukan"
            >
              <Sliders className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Atur</span>
            </button>
            <span className="text-slate-600 dark:text-slate-400 text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              Hari {currentDay} / {daysInMonth}
            </span>
          </div>
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
            statusNote={needsNote}
            isOver={needsIsOver}
          />
          <BarItem
            label="Keinginan & Lifestyle"
            sublabel="Wants"
            amount={wantsAmount}
            actual={wantsPct}
            target={30}
            color="#F59E0B"
            delay={0.25}
            statusNote={wantsNote}
            isOver={wantsIsOver}
          />
          <BarItem
            label="Tabungan & Investasi"
            sublabel="Savings"
            amount={savingsAmount}
            actual={savingsPct}
            target={20}
            color="#3B82F6"
            delay={0.35}
            statusNote={savingsPct >= 20 ? 'Optimal' : `Tersedia: ${formatRupiahCompact(savingsAmount)}`}
            isOver={false}
          />
        </div>

        {/* Informative Footer explaining baseline */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Acuan: <strong className="text-slate-700 dark:text-slate-300">{sourceLabel}</strong> ({formatRupiah(baseline)})</span>
          <button
            onClick={() => setShowModal(true)}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Ubah Acuan &rarr;
          </button>
        </div>
      </div>

      <NeedsWantsSavingsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        currentBaseline={baseline}
        totalBudgetLimit={totalBudgetLimit}
        onSaved={() => {
          onRefresh?.()
        }}
      />
    </>
  )
}
