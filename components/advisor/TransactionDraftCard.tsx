'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, X } from 'lucide-react'
import { TransactionDraft } from '@/types'
import { ACCOUNT_LABELS, CATEGORY_EMOJI } from '@/lib/constants'
import { formatRupiah } from '@/lib/formatters'
import { insertClientTransaction } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'

interface Props {
  draft: TransactionDraft
  onSaved: () => void
  saved?: boolean
  onDiscard?: () => void
}

export function TransactionDraftCard({ draft, onSaved, saved: initialSaved, onDiscard }: Props) {
  const [currentDraft, setCurrentDraft] = useState<TransactionDraft>(draft)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(initialSaved ?? false)
  const [error, setError] = useState('')

  const FLOW_LABELS: Record<string, string> = {
    EXPENSE: '💸 Pengeluaran',
    INCOME: '💰 Pemasukan',
    TRANSFER_INTERNAL: '🔄 Transfer',
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await insertClientTransaction(currentDraft)
      triggerRefresh()
      setSaved(true)
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
        <span className="text-amber-900 dark:text-amber-200 text-xs font-bold uppercase tracking-wider">Konfirmasi Draft Transaksi</span>
        {!saved && onDiscard && (
          <button type="button" onClick={onDiscard} className="text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-200">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Details */}
      <div className="px-4 py-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-medium">{FLOW_LABELS[currentDraft.flow_type] ?? currentDraft.flow_type}</span>
          <span className={`text-sm font-bold font-mono ${
            currentDraft.flow_type === 'INCOME' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
          }`}>
            {currentDraft.flow_type === 'INCOME' ? '+' : '-'}{formatRupiah(currentDraft.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Keterangan</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold truncate max-w-[180px]">{currentDraft.description}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Kategori</span>
          <span className="text-slate-900 dark:text-slate-100 font-semibold">
            {CATEGORY_EMOJI[currentDraft.category] ?? '📦'} {currentDraft.category}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Sumber Akun</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">{ACCOUNT_LABELS[currentDraft.source_account] ?? currentDraft.source_account}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Tanggal</span>
          {saved ? (
            <span className="text-slate-900 dark:text-slate-100 font-mono font-bold">{currentDraft.transaction_date}</span>
          ) : (
            <input
              type="date"
              value={currentDraft.transaction_date}
              onChange={e => setCurrentDraft(prev => ({ ...prev, transaction_date: e.target.value }))}
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
