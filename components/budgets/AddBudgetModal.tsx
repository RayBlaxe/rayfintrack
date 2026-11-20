'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Plus, Sparkles } from 'lucide-react'
import { CATEGORY_EMOJI } from '@/lib/constants'
import { insertBudget } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'
import { useCategories } from '@/hooks/useCategories'

interface Props {
  open: boolean
  onClose: () => void
  monthYear: string
  existingCategories: string[]
  onCreated: () => void
}

export function AddBudgetModal({
  open,
  onClose,
  monthYear,
  existingCategories,
  onCreated,
}: Props) {
  const { categories, emojiMap } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Filter top-level categories that aren't already budgeted this month
  const availableCategories = categories.filter(
    (c) => !c.parent_category && !existingCategories.includes(c.name)
  )

  React.useEffect(() => {
    if (open) {
      if (availableCategories.length > 0) {
        setSelectedCategory(availableCategories[0].name)
      } else {
        setSelectedCategory('')
      }
      setLimitAmount('')
      setError('')
    }
  }, [open, existingCategories.length])

  if (!open) return null

  const handleQuickAmount = (val: number) => {
    setLimitAmount(String(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numLimit = Number(limitAmount)
    if (!selectedCategory) {
      setError('Pilih kategori yang akan dianggarkan')
      return
    }
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Nominal pagu anggaran harus lebih dari 0')
      return
    }

    setLoading(true)
    setError('')
    try {
      await insertBudget({
        month_year: monthYear,
        category: selectedCategory,
        limit_amount: numLimit,
      })
      triggerRefresh()
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal menambahkan anggaran kategori')
    } finally {
      setLoading(false)
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
                Tambah Target Anggaran
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bulan: <span className="font-mono font-semibold">{monthYear}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pilih Kategori
              </label>
              {availableCategories.length === 0 ? (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                  Semua kategori utama sudah memiliki anggaran di bulan ini.
                </p>
              ) : (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                >
                  {availableCategories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.emoji || emojiMap[c.name] || '📦'} {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Limit amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pagu / Limit Anggaran (Rp)
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                placeholder="Contoh: 1000000"
                value={limitAmount}
                onChange={(e) => {
                  setLimitAmount(e.target.value)
                  if (error) setError('')
                }}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 font-bold"
                required
              />

              {/* Quick pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[300000, 500000, 1000000, 2000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors font-mono"
                  >
                    Rp {(amt / 1000).toLocaleString('id-ID')}k
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || availableCategories.length === 0}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Simpan Target Anggaran</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
