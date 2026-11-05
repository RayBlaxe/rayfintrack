'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Transaction } from '@/types'
import { CATEGORY_EMOJI, ACCOUNT_LABELS } from '@/lib/constants'
import { formatRupiah, formatDateShort } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Pencil, Trash2, RotateCcw } from 'lucide-react'
import { deleteTransactionWithSnapshot, restoreTransaction } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal'

interface Props {
  transactions: Transaction[]
  title?: string
  onRefresh?: () => void
  showActions?: boolean
}

function FlowIcon({ type }: { type: string }) {
  if (type === 'INCOME') return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
  if (type === 'TRANSFER_INTERNAL') return <ArrowLeftRight className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
  return <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
}

function amountColor(type: string) {
  if (type === 'INCOME') return 'text-emerald-700 dark:text-emerald-400'
  if (type === 'TRANSFER_INTERNAL') return 'text-teal-700 dark:text-teal-400'
  return 'text-slate-900 dark:text-slate-100'
}

function amountSign(type: string) {
  if (type === 'INCOME') return '+'
  if (type === 'TRANSFER_INTERNAL') return ''
  return '-'
}

export function RecentTransactions({ transactions, title = 'Aktivitas Terkini', onRefresh, showActions = true }: Props) {
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [undoSnapshot, setUndoSnapshot] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(txn: Transaction) {
    if (!confirm(`Hapus transaksi "${txn.description || txn.category}" sebesar ${formatRupiah(txn.amount)}?`)) {
      return
    }

    try {
      setDeletingId(txn.id)
      const snapshot = await deleteTransactionWithSnapshot(txn.id)
      setUndoSnapshot(snapshot)
      triggerRefresh()
      onRefresh?.()

      // Automatically hide undo toast after 6 seconds
      setTimeout(() => {
        setUndoSnapshot((prev) => (prev?.id === snapshot.id ? null : prev))
      }, 6000)
    } catch (err: any) {
      alert(`Gagal menghapus transaksi: ${err?.message || err}`)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleUndo() {
    if (!undoSnapshot) return
    try {
      await restoreTransaction(undoSnapshot)
      setUndoSnapshot(null)
      triggerRefresh()
      onRefresh?.()
    } catch (err: any) {
      alert(`Gagal memulihkan transaksi: ${err?.message || err}`)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
        <p className="text-3xl mb-3">🧾</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada transaksi</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">{title}</h2>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{transactions.length} transaksi</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((txn, i) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.015, 0.3) }}
              className={cn(
                'flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors group',
                deletingId === txn.id && 'opacity-40 pointer-events-none'
              )}
            >
              {/* Icon */}
              <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg flex-shrink-0 shadow-2xs">
                {CATEGORY_EMOJI[txn.category] ?? '📦'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-slate-100 text-sm font-bold truncate">
                  {txn.merchant_name || txn.description || txn.category}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <FlowIcon type={txn.flow_type} />
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate">
                    {ACCOUNT_LABELS[txn.source_account] ?? txn.source_account}
                    {txn.destination_account && ` ➔ ${ACCOUNT_LABELS[txn.destination_account] ?? txn.destination_account}`}
                    {' · '}
                    {formatDateShort(txn.transaction_date)}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <p className={cn('text-sm font-bold font-mono flex-shrink-0', amountColor(txn.flow_type))}>
                {amountSign(txn.flow_type)}{formatRupiah(txn.amount)}
              </p>

              {/* Edit / Delete Action Buttons */}
              {showActions && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditingTx(txn)}
                    title="Edit Transaksi"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(txn)}
                    title="Hapus Transaksi"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <EditTransactionModal
        transaction={editingTx}
        open={!!editingTx}
        onClose={() => setEditingTx(null)}
        onSaved={() => {
          onRefresh?.()
          triggerRefresh()
        }}
      />

      {/* Undo Floating Toast */}
      <AnimatePresence>
        {undoSnapshot && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 bg-slate-900 dark:bg-slate-800 text-white border border-slate-700/80 px-4 py-3 rounded-2xl shadow-2xl max-w-[92vw]"
          >
            <div className="text-xs">
              <p className="font-semibold truncate max-w-[180px] sm:max-w-[260px]">
                Dihapus: {undoSnapshot.description || undoSnapshot.category}
              </p>
              <p className="text-slate-400 font-mono text-[11px]">{formatRupiah(undoSnapshot.amount)}</p>
            </div>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Urungkan</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
