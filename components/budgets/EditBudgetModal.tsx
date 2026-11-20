'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Save, Trash2 } from 'lucide-react'
import { BudgetWithSpending } from '@/types'
import { formatRupiah } from '@/lib/formatters'
import { updateBudget, deleteBudget } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'

interface Props {
  budget: BudgetWithSpending | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function EditBudgetModal({ budget, open, onClose, onSaved }: Props) {
  const [limitAmount, setLimitAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (budget) {
      setLimitAmount(String(budget.limit_amount))
      setError('')
    }
  }, [budget])

  if (!open || !budget) return null

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    const numLimit = Number(limitAmount)
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Pagu anggaran harus lebih dari 0')
      return
    }

    setLoading(true)
    setError('')
    try {
      await updateBudget(budget!.id, numLimit)
      triggerRefresh()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal mengubah anggaran')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Hapus anggaran "${budget!.category}" untuk bulan ${budget!.month_year}?`)) {
      return
    }

    setDeleting(true)
    setError('')
    try {
      await deleteBudget(budget!.id)
      triggerRefresh()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus anggaran')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-sm bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Ubah Anggaran
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {budget.category} • <span className="font-mono">{budget.month_year}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/70 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Pengeluaran Saat Ini:</span>
              <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                {formatRupiah(budget.spent)}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pagu / Limit Anggaran Baru (Rp)
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={limitAmount}
                onChange={(e) => {
                  setLimitAmount(e.target.value)
                  if (error) setError('')
                }}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 font-bold"
                required
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || loading}
                className="h-11 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus</span>
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={loading || deleting}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Perbarui Anggaran</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
