'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Save } from 'lucide-react'
import { Transaction, AccountName, FlowType } from '@/types'
import { ACCOUNT_LABELS } from '@/lib/constants'
import { updateTransaction } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'
import { useCategories } from '@/hooks/useCategories'

interface Props {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const ACCOUNTS = Object.keys(ACCOUNT_LABELS) as AccountName[]

export function EditTransactionModal({ transaction, open, onClose, onSaved }: Props) {
  const { categories, emojiMap } = useCategories()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Makanan & Minuman')
  const [subcategory, setSubcategory] = useState('')
  const [sourceAccount, setSourceAccount] = useState<AccountName>('BCA')
  const [destinationAccount, setDestinationAccount] = useState<AccountName | ''>('')
  const [flowType, setFlowType] = useState<FlowType>('EXPENSE')
  const [transactionDate, setTransactionDate] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description || '')
      setAmount(String(transaction.amount || 0))
      setCategory(transaction.category || 'Makanan & Minuman')
      setSubcategory(transaction.subcategory || '')
      setSourceAccount(transaction.source_account || 'BCA')
      setDestinationAccount(transaction.destination_account || '')
      setFlowType(transaction.flow_type || 'EXPENSE')
      setTransactionDate(transaction.transaction_date ? transaction.transaction_date.slice(0, 10) : new Date().toISOString().slice(0, 10))
      setMerchantName(transaction.merchant_name || '')
      setError('')
    }
  }, [transaction])

  if (!open || !transaction) return null

  // Find subcategories belonging to current category
  const availableSubcategories = categories.filter(c => c.parent_category === category)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal harus berupa angka lebih dari 0')
      return
    }

    setLoading(true)
    setError('')
    try {
      await updateTransaction(transaction!.id, {
        description: description.trim(),
        amount: numAmount,
        category,
        subcategory: subcategory.trim() || null,
        source_account: sourceAccount,
        destination_account: flowType === 'TRANSFER_INTERNAL' && destinationAccount ? destinationAccount : null,
        flow_type: flowType,
        transaction_date: transactionDate,
        merchant_name: merchantName.trim() || null,
      })
      triggerRefresh()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal memperbarui transaksi')
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
          className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Edit Transaksi</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{transaction.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Flow Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tipe Aliran Dana</label>
              <div className="grid grid-cols-3 gap-2">
                {(['EXPENSE', 'INCOME', 'TRANSFER_INTERNAL'] as FlowType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFlowType(type)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      flowType === type
                        ? type === 'EXPENSE'
                          ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                          : type === 'INCOME'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {type === 'EXPENSE' ? 'Pengeluaran' : type === 'INCOME' ? 'Pemasukan' : 'Transfer'}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nominal (Rp)</label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="50000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Deskripsi Transaksi</label>
              <input
                type="text"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Makan siang bersama tim..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Merchant */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Merchant / Toko (Opsional)</label>
              <input
                type="text"
                value={merchantName}
                onChange={e => setMerchantName(e.target.value)}
                placeholder="Kopi Kenangan, Tokopedia..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Kategori</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {categories.filter(c => !c.parent_category).map(c => (
                    <option key={c.name} value={c.name}>
                      {c.emoji} {c.name} {c.is_custom ? '(Kustom)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tanggal</label>
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={e => setTransactionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Subcategory */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Subkategori (Opsional)
              </label>
              {availableSubcategories.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={subcategory}
                    onChange={e => setSubcategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Pilih Subkategori</option>
                    {availableSubcategories.map(s => (
                      <option key={s.name} value={s.name}>{s.emoji} {s.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={e => setSubcategory(e.target.value)}
                    placeholder="Atau ketik sendiri..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={subcategory}
                  onChange={e => setSubcategory(e.target.value)}
                  placeholder="Contoh: Servis Supra, Ganti Oli, dll"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              )}
            </div>

            {/* Source Account & Destination Account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Sumber Akun</label>
                <select
                  value={sourceAccount}
                  onChange={e => setSourceAccount(e.target.value as AccountName)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {ACCOUNTS.map(acc => (
                    <option key={acc} value={acc}>
                      {ACCOUNT_LABELS[acc] ?? acc}
                    </option>
                  ))}
                </select>
              </div>

              {flowType === 'TRANSFER_INTERNAL' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tujuan Akun</label>
                  <select
                    value={destinationAccount}
                    onChange={e => setDestinationAccount(e.target.value as AccountName)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Pilih Akun Tujuan</option>
                    {ACCOUNTS.map(acc => (
                      <option key={acc} value={acc}>
                        {ACCOUNT_LABELS[acc] ?? acc}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Submit buttons */}
            {error && (
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
