'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Plus, ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import { AccountName, FlowType } from '@/types'
import { ACCOUNT_LABELS, ACCOUNT_LOGOS } from '@/lib/constants'
import { formatRupiah } from '@/lib/formatters'
import { insertClientTransaction } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'
import { useCategories } from '@/hooks/useCategories'

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: () => void
  defaultFlowType?: FlowType
}

const ACCOUNTS = Object.keys(ACCOUNT_LABELS) as AccountName[]

function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function AddTransactionModal({
  open,
  onClose,
  onSaved,
  defaultFlowType = 'EXPENSE',
}: Props) {
  const { categories } = useCategories()

  const [flowType, setFlowType] = useState<FlowType>(defaultFlowType)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [merchantName, setMerchantName] = useState('')
  const [category, setCategory] = useState('Makanan & Minuman')
  const [subcategory, setSubcategory] = useState('')
  const [sourceAccount, setSourceAccount] = useState<AccountName>('BCA')
  const [destinationAccount, setDestinationAccount] = useState<AccountName | ''>('')
  const [transactionDate, setTransactionDate] = useState(getTodayDateString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Top-level categories
  const topCategories = useMemo(
    () => categories.filter((c) => !c.parent_category),
    [categories]
  )

  // Subcategories belonging to currently selected category
  const availableSubcategories = useMemo(
    () => categories.filter((c) => c.parent_category === category),
    [categories, category]
  )

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      const initialFlow = defaultFlowType || 'EXPENSE'
      setFlowType(initialFlow)
      setAmount('')
      setDescription('')
      setMerchantName('')
      setSubcategory('')
      setSourceAccount('BCA')
      setDestinationAccount(initialFlow === 'TRANSFER_INTERNAL' ? 'GOPAY' : '')
      setTransactionDate(getTodayDateString())
      setError('')

      if (initialFlow === 'TRANSFER_INTERNAL') {
        setCategory('Transfer Internal')
      } else if (initialFlow === 'INCOME') {
        setCategory('Pemasukan')
      } else {
        setCategory('Makanan & Minuman')
      }
    }
  }, [open, defaultFlowType])

  // Handle flow type switch
  const handleFlowTypeChange = (newFlow: FlowType) => {
    setFlowType(newFlow)
    setError('')

    if (newFlow === 'TRANSFER_INTERNAL') {
      setCategory('Transfer Internal')
      if (!destinationAccount || destinationAccount === sourceAccount) {
        const nextDest = ACCOUNTS.find((acc) => acc !== sourceAccount) || 'GOPAY'
        setDestinationAccount(nextDest)
      }
    } else if (newFlow === 'INCOME') {
      if (category === 'Transfer Internal' || category === 'Makanan & Minuman') {
        setCategory('Pemasukan')
      }
    } else {
      if (category === 'Transfer Internal' || category === 'Pemasukan') {
        setCategory('Makanan & Minuman')
      }
    }
  }

  // Quick amount addition
  const handleQuickAdd = (value: number) => {
    const current = Number(amount) || 0
    setAmount(String(current + value))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal harus berupa angka lebih dari 0')
      return
    }

    if (!description.trim()) {
      setError('Deskripsi transaksi wajib diisi')
      return
    }

    if (flowType === 'TRANSFER_INTERNAL') {
      if (!destinationAccount) {
        setError('Akun tujuan transfer wajib dipilih')
        return
      }
      if (destinationAccount === sourceAccount) {
        setError('Akun sumber dan akun tujuan transfer tidak boleh sama')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      await insertClientTransaction({
        flow_type: flowType,
        amount: numAmount,
        category,
        subcategory: subcategory.trim() || null,
        source_account: sourceAccount,
        destination_account:
          flowType === 'TRANSFER_INTERNAL' && destinationAccount
            ? destinationAccount
            : null,
        transaction_date: transactionDate,
        merchant_name: merchantName.trim() || null,
        description: description.trim(),
        raw_prompt: '[Manual Entry]',
      })

      triggerRefresh()
      onSaved?.()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan transaksi')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const numAmount = Number(amount)

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
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Catat Transaksi Manual
                </h2>
                <p className="text-xs text-slate-400">
                  Tambah pengeluaran, pemasukan, atau mutasi internal
                </p>
              </div>
            </div>
            <button
              type="button"
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
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Tipe Aliran Dana
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      type: 'EXPENSE',
                      label: 'Pengeluaran',
                      icon: ArrowDownRight,
                      activeClass:
                        'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400',
                    },
                    {
                      type: 'INCOME',
                      label: 'Pemasukan',
                      icon: ArrowUpRight,
                      activeClass:
                        'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400',
                    },
                    {
                      type: 'TRANSFER_INTERNAL',
                      label: 'Transfer',
                      icon: ArrowLeftRight,
                      activeClass:
                        'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400',
                    },
                  ] as const
                ).map(({ type, label, icon: Icon, activeClass }) => {
                  const isActive = flowType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleFlowTypeChange(type)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                        isActive
                          ? activeClass
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Nominal (Rp) <span className="text-rose-500">*</span>
                </label>
                {!isNaN(numAmount) && numAmount > 0 && (
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(numAmount)}
                  </span>
                )}
              </div>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              {/* Quick shortcut buttons */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                {[10000, 25000, 50000, 100000, 250000, 500000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleQuickAdd(v)}
                    className="px-2.5 py-1 text-[11px] font-semibold font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
                  >
                    +{v >= 1000 ? `${v / 1000}rb` : v}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Deskripsi Transaksi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  flowType === 'TRANSFER_INTERNAL'
                    ? 'Top up saldo, transfer antar rekening...'
                    : flowType === 'INCOME'
                    ? 'Gaji bulanan, bonus project, cashback...'
                    : 'Makan siang, bensin, belanja bulanan...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Merchant / Entity (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Merchant / Toko / Pihak Terkait (Opsional)
              </label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="Indomaret, Tokopedia, Kopi Kenangan, Rekan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setSubcategory('')
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {topCategories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.emoji} {c.name} {c.is_custom ? '(Kustom)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Tanggal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
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
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Pilih Subkategori</option>
                    {availableSubcategories.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.emoji} {s.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Atau ketik kustom..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="Contoh: Servis Kendaraan, Ganti Oli, Snack, dll"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              )}
            </div>

            {/* Source Account & Destination Account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {flowType === 'INCOME' ? 'Masuk ke Rekening' : 'Sumber Rekening'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={sourceAccount}
                  onChange={(e) => {
                    const newSource = e.target.value as AccountName
                    setSourceAccount(newSource)
                    if (destinationAccount === newSource) {
                      const nextDest = ACCOUNTS.find((acc) => acc !== newSource) || ''
                      setDestinationAccount(nextDest)
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {ACCOUNTS.map((acc) => (
                    <option key={acc} value={acc}>
                      {ACCOUNT_LOGOS[acc] || '💳'} {ACCOUNT_LABELS[acc] ?? acc}
                    </option>
                  ))}
                </select>
              </div>

              {flowType === 'TRANSFER_INTERNAL' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Tujuan Rekening <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={destinationAccount}
                    onChange={(e) => setDestinationAccount(e.target.value as AccountName)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Pilih Akun Tujuan</option>
                    {ACCOUNTS.filter((acc) => acc !== sourceAccount).map((acc) => (
                      <option key={acc} value={acc}>
                        {ACCOUNT_LOGOS[acc] || '💳'} {ACCOUNT_LABELS[acc] ?? acc}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
                {error}
              </p>
            )}

            {/* Action Buttons */}
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>Simpan Transaksi</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
