'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { PersonalLiability, Account } from '@/types'
import { ACCOUNT_LABELS } from '@/lib/constants'
import { formatRupiah } from '@/lib/formatters'
import { payPersonalLiability } from '@/lib/liabilities'

interface Props {
  liability: PersonalLiability | null
  accounts: Account[]
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PayLiabilityModal({ liability, accounts, open, onClose, onSuccess }: Props) {
  const [sourceAccount, setSourceAccount] = useState<string>('BCA')
  const [amount, setAmount] = useState<string>('')
  const [paymentDate, setPaymentDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (liability) {
      setAmount(String(liability.remaining_amount))
      setSourceAccount(liability.source_account || 'BCA')
      setPaymentDate(new Date().toISOString().slice(0, 10))
      setNotes('')
      setError('')
    }
  }, [liability])

  if (!open || !liability) return null

  // Liquid accounts with balance
  const payableAccounts = accounts.filter(a => !['MEGA_SYARIAH', 'HONEST_CARD'].includes(a.account_name))
  const selectedAcc = accounts.find(a => a.account_name === sourceAccount)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal pembayaran harus lebih dari 0')
      return
    }

    if (numAmount > liability!.remaining_amount) {
      setError(`Nominal pembayaran melebihi sisa utang (${formatRupiah(liability!.remaining_amount)})`)
      return
    }

    setLoading(true)
    setError('')
    try {
      await payPersonalLiability(liability!.id, numAmount, sourceAccount, paymentDate, notes)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses pelunasan utang')
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
          className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-lg">Pelunasan Utang Personal</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                Kreditur: <span className="font-semibold text-slate-800 dark:text-slate-200">{liability.creditor_name}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handlePay} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Sisa Terutang Card */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">Sisa Utang Belum Lunas</span>
                <p className="text-xl font-black font-mono text-amber-700 dark:text-amber-400 mt-0.5">
                  {formatRupiah(liability.remaining_amount)}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40">
                {liability.due_date_label || 'Jatuh Tempo'}
              </span>
            </div>

            {/* Sumber Dana Akun Pembayar */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Pilih Rekening Sumber Pembayaran
              </label>
              <select
                value={sourceAccount}
                onChange={e => setSourceAccount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              >
                {payableAccounts.map(acc => (
                  <option key={acc.id} value={acc.account_name}>
                    {ACCOUNT_LABELS[acc.account_name] ?? acc.account_name} (Saldo: {formatRupiah(acc.current_balance)})
                  </option>
                ))}
              </select>
              {selectedAcc && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Saldo tersedia saat ini: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatRupiah(selectedAcc.current_balance)}</span>
                </p>
              )}
            </div>

            {/* Nominal Bayar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nominal Pembayaran (Rp)</label>
                <button
                  type="button"
                  onClick={() => setAmount(String(liability.remaining_amount))}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Lunasi Penuh
                </button>
              </div>
              <input
                type="number"
                required
                min="1"
                max={liability.remaining_amount}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="100000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Tanggal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tanggal Pembayaran</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
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
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>{loading ? 'Memproses...' : 'Konfirmasi & Potong Saldo'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
