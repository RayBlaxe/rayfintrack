'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sliders, CheckCircle2, Info } from 'lucide-react'
import { formatRupiah } from '@/lib/formatters'
import { setStoredEstimatedIncome } from '@/lib/financialEngine'
import { triggerRefresh } from '@/lib/realtimeEvents'

interface Props {
  currentBaseline: number
  totalBudgetLimit: number
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function NeedsWantsSavingsModal({
  currentBaseline,
  totalBudgetLimit,
  open,
  onClose,
  onSaved,
}: Props) {
  const [estimatedIncome, setEstimatedIncome] = useState(String(currentBaseline || totalBudgetLimit || 5000000))
  const [error, setError] = useState('')

  if (!open) return null

  const numericBaseline = Number(estimatedIncome) || 0
  const needs50 = numericBaseline * 0.5
  const wants30 = numericBaseline * 0.3
  const savings20 = numericBaseline * 0.2

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (isNaN(numericBaseline) || numericBaseline <= 0) {
      setError('Masukkan angka estimasi pemasukan / target anggaran yang valid')
      return
    }

    setStoredEstimatedIncome(numericBaseline)
    triggerRefresh()
    onSaved()
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-slate-900 dark:text-slate-100 font-bold text-base">Atur Target Anggaran 50/30/20</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Penyebut alokasi bulanan (Baseline Income)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                <Info className="h-3.5 w-3.5" />
                <span>Kenapa Perlu Target Baseline?</span>
              </div>
              <p>
                Di awal bulan sebelum gajian cair, pengeluaran awal (makan, servis, tagihan) akan dihitung terhadap <strong>Target Baseline Bulanan</strong> ini, sehingga rasio tidak melonjak aneh (misal 365%) dan skor finansial tetap adil.
              </p>
            </div>

            {/* Input Target Income */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Estimasi Pemasukan / Target Anggaran (Rp)
                </label>
                {totalBudgetLimit > 0 && (
                  <button
                    type="button"
                    onClick={() => setEstimatedIncome(String(totalBudgetLimit))}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Gunakan Total Limit Budget ({formatRupiah(totalBudgetLimit)})
                  </button>
                )}
              </div>
              <input
                type="number"
                required
                min="100000"
                value={estimatedIncome}
                onChange={e => setEstimatedIncome(e.target.value)}
                placeholder="5000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Preview 50/30/20 Breakdown */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Simulasi Alokasi 50 / 30 / 20
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 font-medium">Needs (50%)</p>
                  <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatRupiah(needs50)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 font-medium">Wants (30%)</p>
                  <p className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                    {formatRupiah(wants30)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] text-slate-500 font-medium">Savings (20%)</p>
                  <p className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {formatRupiah(savings20)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Simpan Target</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
