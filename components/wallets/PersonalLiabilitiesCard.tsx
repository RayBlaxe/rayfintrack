'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Handshake, Plus, CheckCircle2, CreditCard, Trash2 } from 'lucide-react'
import { PersonalLiability, Account } from '@/types'
import { formatRupiah } from '@/lib/formatters'
import { getPersonalLiabilities, deletePersonalLiability } from '@/lib/liabilities'
import { PayLiabilityModal } from './PayLiabilityModal'
import { AddLiabilityModal } from './AddLiabilityModal'
import { subscribeToRefresh } from '@/lib/realtimeEvents'

interface Props {
  accounts: Account[]
  onRefreshAccounts?: () => void
}

export function PersonalLiabilitiesCard({ accounts, onRefreshAccounts }: Props) {
  const [liabilities, setLiabilities] = useState<PersonalLiability[]>([])
  const [payingLiability, setPayingLiability] = useState<PersonalLiability | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const reload = () => {
    setLiabilities(getPersonalLiabilities())
  }

  useEffect(() => {
    reload()
    const unsub = subscribeToRefresh(reload)
    return unsub
  }, [])

  const activeList = liabilities.filter(l => l.status === 'ACTIVE' && l.remaining_amount > 0)
  const paidList = liabilities.filter(l => l.status === 'PAID' || l.remaining_amount === 0)
  const totalActiveDebt = activeList.reduce((s, l) => s + l.remaining_amount, 0)

  return (
    <>
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Handshake className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight">
                Utang & Pinjaman Personal
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Total Terutang: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatRupiah(totalActiveDebt)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Pinjaman Baru</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3">
          {activeList.length === 0 && paidList.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Tidak ada catatan utang personal aktif.
            </div>
          ) : (
            <>
              {/* Active Debts */}
              {activeList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {item.creditor_name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                          {item.due_date_label || 'Jatuh Tempo'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {item.notes || item.title}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black font-mono text-amber-700 dark:text-amber-400">
                        {formatRupiah(item.remaining_amount)}
                      </p>
                      {item.principal_amount !== item.remaining_amount && (
                        <p className="text-[10px] text-slate-400 line-through">
                          Awal: {formatRupiah(item.principal_amount)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Rekening Rekomendasi: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.source_account || 'BCA'}</span>
                    </span>
                    <button
                      onClick={() => setPayingLiability(item)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Bayar / Lunasi</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Paid Debts */}
              {paidList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between opacity-75"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-through">
                        {item.creditor_name} - {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Lunas ({formatRupiah(item.principal_amount)})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      LUNAS
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus riwayat pinjaman ${item.creditor_name}?`)) {
                          deletePersonalLiability(item.id)
                          reload()
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Hapus riwayat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Pay Liability Modal */}
      <PayLiabilityModal
        liability={payingLiability}
        accounts={accounts}
        open={!!payingLiability}
        onClose={() => setPayingLiability(null)}
        onSuccess={() => {
          reload()
          onRefreshAccounts?.()
        }}
      />

      {/* Add Liability Modal */}
      <AddLiabilityModal
        accounts={accounts}
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={() => {
          reload()
          onRefreshAccounts?.()
        }}
      />
    </>
  )
}
