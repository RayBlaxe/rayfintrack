'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, X, Pencil } from 'lucide-react'
import { TransactionDraft, AccountName, FlowType } from '@/types'
import { ACCOUNT_LABELS, CATEGORY_EMOJI } from '@/lib/constants'
import { formatRupiah } from '@/lib/formatters'
import { insertClientTransaction } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'
import { useCategories } from '@/hooks/useCategories'

interface Props {
  draft: TransactionDraft
  onSaved: () => void
  saved?: boolean
  onDiscard?: () => void
}

const ACCOUNTS = Object.keys(ACCOUNT_LABELS) as AccountName[]

export function TransactionDraftCard({ draft, onSaved, saved: initialSaved, onDiscard }: Props) {
  const { categories, emojiMap } = useCategories()
  const [currentDraft, setCurrentDraft] = useState<TransactionDraft>(draft)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(initialSaved ?? false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const FLOW_LABELS: Record<string, string> = {
    EXPENSE: '💸 Pengeluaran',
    INCOME: '💰 Pemasukan',
    TRANSFER_INTERNAL: '🔄 Transfer',
  }

  // Filter top-level categories
  const topCategories = categories.filter((c) => !c.parent_category)

  async function handleSave() {
    if (!currentDraft.amount || currentDraft.amount <= 0) {
      setError('Nominal harus lebih dari 0')
      return
    }

    setSaving(true)
    setError('')
    try {
      await insertClientTransaction(currentDraft)
      triggerRefresh()
      setSaved(true)
      setIsEditing(false)
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan transaksi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2.5 bg-amber-50/60 dark:bg-slate-900/90 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/50 overflow-hidden shadow-xs"
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-amber-200/60 dark:border-amber-500/30 flex items-center justify-between bg-amber-100/40 dark:bg-amber-950/20">
        <span className="text-amber-900 dark:text-amber-200 text-xs font-bold uppercase tracking-wider">
          Konfirmasi Draft Transaksi
        </span>
        {!saved && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-200/60 dark:bg-amber-900/40 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              <span>{isEditing ? 'Selesai Edit' : 'Edit Draft'}</span>
            </button>
            {onDiscard && (
              <button
                type="button"
                onClick={onDiscard}
                className="text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-4 py-3 space-y-2 text-xs">
        {/* Flow Type & Amount */}
        <div className="flex items-center justify-between gap-2">
          {isEditing && !saved ? (
            <select
              value={currentDraft.flow_type}
              onChange={(e) => setCurrentDraft((prev) => ({ ...prev, flow_type: e.target.value as FlowType }))}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none"
            >
              <option value="EXPENSE">💸 Pengeluaran</option>
              <option value="INCOME">💰 Pemasukan</option>
              <option value="TRANSFER_INTERNAL">🔄 Transfer</option>
            </select>
          ) : (
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {FLOW_LABELS[currentDraft.flow_type] ?? currentDraft.flow_type}
            </span>
          )}

          {isEditing && !saved ? (
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-500">Rp</span>
              <input
                type="number"
                value={currentDraft.amount || ''}
                onChange={(e) => setCurrentDraft((prev) => ({ ...prev, amount: Number(e.target.value) || 0 }))}
                className="w-28 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-100 font-mono text-xs font-bold text-right focus:outline-none focus:border-emerald-600"
              />
            </div>
          ) : (
            <span
              className={`text-sm font-bold font-mono ${
                currentDraft.flow_type === 'INCOME'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {currentDraft.flow_type === 'INCOME' ? '+' : '-'}
              {formatRupiah(currentDraft.amount)}
            </span>
          )}
        </div>

        {/* Keterangan */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Keterangan</span>
          {isEditing && !saved ? (
            <input
              type="text"
              value={currentDraft.description}
              onChange={(e) => setCurrentDraft((prev) => ({ ...prev, description: e.target.value }))}
              className="flex-1 max-w-[200px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-100 text-xs text-right focus:outline-none focus:border-emerald-600"
            />
          ) : (
            <span className="text-slate-900 dark:text-slate-100 font-bold truncate max-w-[180px]">
              {currentDraft.description}
            </span>
          )}
        </div>

        {/* Kategori */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Kategori</span>
          {isEditing && !saved ? (
            <select
              value={currentDraft.category}
              onChange={(e) => setCurrentDraft((prev) => ({ ...prev, category: e.target.value }))}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-600"
            >
              {topCategories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.emoji || emojiMap[c.name] || '📦'} {c.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              {CATEGORY_EMOJI[currentDraft.category] ?? emojiMap[currentDraft.category] ?? '📦'} {currentDraft.category}
            </span>
          )}
        </div>

        {/* Sumber Akun */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Sumber Akun</span>
          {isEditing && !saved ? (
            <select
              value={currentDraft.source_account}
              onChange={(e) => setCurrentDraft((prev) => ({ ...prev, source_account: e.target.value as AccountName }))}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:border-emerald-600"
            >
              {ACCOUNTS.map((acc) => (
                <option key={acc} value={acc}>
                  {ACCOUNT_LABELS[acc] ?? acc}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-slate-900 dark:text-slate-100 font-bold">
              {ACCOUNT_LABELS[currentDraft.source_account] ?? currentDraft.source_account}
            </span>
          )}
        </div>

        {/* Tanggal */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Tanggal</span>
          {saved ? (
            <span className="text-slate-900 dark:text-slate-100 font-mono font-bold">
              {currentDraft.transaction_date}
            </span>
          ) : (
            <input
              type="date"
              value={currentDraft.transaction_date}
              onChange={(e) => setCurrentDraft((prev) => ({ ...prev, transaction_date: e.target.value }))}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-600"
            />
          )}
        </div>
      </div>

      {/* Action */}
      {error && <p className="px-4 pb-2 text-red-600 dark:text-red-400 text-xs font-semibold">{error}</p>}
      <div className="px-4 pb-3 pt-1">
        {saved ? (
          <div className="flex items-center justify-center gap-2 py-2 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-bold">Transaksi Berhasil Dicatat!</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? 'Menyimpan ke Ledger...' : '✅ Simpan ke Buku Kas'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
