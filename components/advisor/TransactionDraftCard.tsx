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
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(initialSaved ?? false)
  const [error, setError] = useState('')

  const FLOW_LABELS: Record<string, string> = {
    EXPENSE: '💸 Pengeluaran',
    INCOME: '💰 Pemasukan',
    TRANSFER_INTERNAL: '💸 Transfer',
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await insertClientTransaction(draft)
      triggerRefresh()
      setSaved(true)
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-2 bg-[#21262D] rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">Draft Transaksi</span>
        {!saved && onDiscard && (
          <button onClick={onDiscard} className="text-white/30 hover:text-white/60">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Details */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs">{FLOW_LABELS[draft.flow_type] ?? draft.flow_type}</span>
          <span className={`text-sm font-bold ${
            draft.flow_type === 'INCOME' ? 'text-[#CCFF00]' : 'text-[#FF85A1]'
          }`}>
            {draft.flow_type === 'INCOME' ? '+' : '-'}{formatRupiah(draft.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs">Deskripsi</span>
          <span className="text-white text-sm font-medium truncate max-w-[180px]">{draft.description}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs">Kategori</span>
          <span className="text-white text-xs">
            {CATEGORY_EMOJI[draft.category] ?? '📦'} {draft.category}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs">Dari Akun</span>
          <span className="text-white text-xs">{ACCOUNT_LABELS[draft.source_account] ?? draft.source_account}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs">Tanggal</span>
          <span className="text-white text-xs">{draft.transaction_date}</span>
        </div>
      </div>

      {/* Action */}
      {error && <p className="px-4 pb-2 text-[#FF85A1] text-xs">{error}</p>}
      <div className="px-4 pb-4">
        {saved ? (
          <div className="flex items-center justify-center gap-2 py-2.5 bg-[#CCFF00]/10 rounded-xl border border-[#CCFF00]/20">
            <CheckCircle2 className="h-4 w-4 text-[#CCFF00]" />
            <span className="text-[#CCFF00] text-sm font-semibold">Tersimpan!</span>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-[#CCFF00] text-black font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Menyimpan...' : '✅ Simpan Transaksi'}
          </button>
        )}
      </div>
    </motion.div>
  )
}
