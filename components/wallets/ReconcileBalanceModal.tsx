'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, SlidersHorizontal } from 'lucide-react'
import { Account } from '@/types'
import { ACCOUNT_LABELS } from '@/lib/constants'
import { formatRupiah } from '@/lib/formatters'
import { reconcileAccountBalance } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'

interface Props {
  account: Account | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function ReconcileBalanceModal({ account, open, onClose, onSaved }: Props) {
  const [newBalance, setNewBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (account) {
      setNewBalance(String(account.current_balance || 0))
      setError('')
    }
  }, [account])

  if (!open || !account) return null

  const label = ACCOUNT_LABELS[account.account_name] ?? account.account_name

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(newBalance)
    if (isNaN(num)) {
      setError('Masukkan angka saldo yang valid')
      return
    }

    setLoading(true)
    setError('')
    try {
      await reconcileAccountBalance(account!.account_name, num)
      triggerRefresh()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal mengkalibrasi saldo akun')
    } finally {
      setLoading(false)
    }
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
          className="relative w-full max-w-sm bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-slate-900 dark:text-slate-100 font-bold text-base">Kalibrasi Saldo</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{label}</p>
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

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Saldo Tercatat Saat Ini</span>
              <p className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                {formatRupiah(account.current_balance)}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Saldo Riil Baru (Penyesuaian Langsung)
              </label>
              <input
                type="number"
                required
                value={newBalance}
                onChange={e => setNewBalance(e.target.value)}
                placeholder="6494"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gunakan ini jika terdapat selisih fisik kas/bank dengan catatan tanpa membuat transaksi baru.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>{loading ? 'Menyimpan...' : 'Set Saldo'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
