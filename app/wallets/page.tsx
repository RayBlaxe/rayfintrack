'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { NetWorthHero } from '@/components/wallets/NetWorthHero'
import { AccountGroup } from '@/components/wallets/AccountGroup'
import { useAccounts } from '@/hooks/useAccounts'
import { useAssets } from '@/hooks/useAssets'
import { useTransactions } from '@/hooks/useTransactions'
import { ASSET_TYPE_LABELS, ASSET_TYPE_COLORS } from '@/lib/constants'
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters'
import { Plus, Trash2, Pencil, Handshake, AlertCircle } from 'lucide-react'
import { AddAssetModal } from '@/components/wallets/AddAssetModal'
import { EditAssetModal } from '@/components/wallets/EditAssetModal'
import { ReconcileBalanceModal } from '@/components/wallets/ReconcileBalanceModal'
import { PersonalLiabilitiesCard } from '@/components/wallets/PersonalLiabilitiesCard'
import { deleteAsset } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'
import { Asset, Account } from '@/types'

type Tab = 'all' | 'liquid' | 'asset' | 'debt'

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',    label: 'Semua' },
  { key: 'liquid', label: 'Dompet' },
  { key: 'asset',  label: 'Aset' },
  { key: 'debt',   label: 'Utang & Kewajiban' },
]

export default function WalletsPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [assetModalOpen, setAssetModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [reconcilingAccount, setReconcilingAccount] = useState<Account | null>(null)

  const { accounts, loading: accLoading, refetch: refetchAccounts } = useAccounts()
  const { assets, refetch: refetchAssets } = useAssets()
  const { transactions } = useTransactions({ date: new Date(), limit: 60 })

  const avgMonthlyExpense = useMemo(() => {
    const total = transactions.filter(t => t.flow_type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
    return total || 1
  }, [transactions])

  const assetsByType = useMemo(() => {
    const map: Record<string, typeof assets> = {}
    for (const a of assets) {
      if (!map[a.asset_type]) map[a.asset_type] = []
      map[a.asset_type].push(a)
    }
    return map
  }, [assets])

  async function handleDeleteAsset(id: string, name: string) {
    if (confirm(`Hapus aset "${name}"?`)) {
      await deleteAsset(id)
      triggerRefresh()
      refetchAssets()
    }
  }

  return (
    <RealtimeProvider>
      <div className="flex flex-col gap-5 pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-slate-50 text-2xl font-black tracking-tight">Dompet & Aset</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gambaran lengkap kekayaan finansialmu</p>
          </div>
          <button
            onClick={() => setAssetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span>Aset Baru</span>
          </button>
        </div>

        {/* Hero */}
        <NetWorthHero accounts={accounts} assets={assets} avgMonthlyExpense={avgMonthlyExpense} />

        {/* Tab chips */}
        <div className="px-5 flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
                tab === t.key
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Account groups */}
        <div className="px-5 flex flex-col gap-4">
          {(tab === 'all' || tab === 'liquid') && (
            <AccountGroup
              title="💵 Saldo & Tabungan"
              accounts={accounts}
              showCC={false}
              onSelectAccount={setReconcilingAccount}
            />
          )}

          {(tab === 'all' || tab === 'debt') && (
            <>
              {/* Interactive Personal Liabilities Tracker */}
              <PersonalLiabilitiesCard accounts={accounts} onRefreshAccounts={refetchAccounts} />

              <AccountGroup
                title="💳 Kartu Kredit & Cicilan"
                accounts={accounts}
                showCC={true}
                onSelectAccount={setReconcilingAccount}
              />
            </>
          )}

          {/* Assets */}
          {(tab === 'all' || tab === 'asset') && Object.entries(assetsByType).map(([type, items]) => (
            <div key={type} className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ASSET_TYPE_COLORS[type] }} />
                  <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm">{ASSET_TYPE_LABELS[type] ?? type}</h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{items.length} Aset</span>
              </div>
              <div className="px-5 divide-y divide-slate-100 dark:divide-slate-800/60">
                {items.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-3.5 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">{a.asset_name}</p>
                        {a.status && a.status !== 'AKTIF' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            {a.status}
                          </span>
                        )}
                      </div>
                      {a.notes && <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{a.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <p className="text-slate-900 dark:text-slate-100 font-bold font-mono text-sm">{formatRupiahCompact(a.value)}</p>
                      <button
                        onClick={() => setEditingAsset(a)}
                        className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-1"
                        title="Edit aset"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(a.id, a.asset_name)}
                        className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors p-1"
                        title="Hapus aset"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {assets.length === 0 && (tab === 'all' || tab === 'asset') && (
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center shadow-sm dark:shadow-none">
              <p className="text-4xl mb-3">🏦</p>
              <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Belum ada data aset.</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-4">Catat investasi, properti, tabungan emas, dll.</p>
              <button
                onClick={() => setAssetModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 text-xs font-bold shadow transition-all"
              >
                <Plus className="h-4 w-4" />
                Tambah Aset Pertama
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        open={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        onCreated={refetchAssets}
      />

      {/* Edit Asset Modal */}
      <EditAssetModal
        asset={editingAsset}
        open={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        onSaved={refetchAssets}
      />

      {/* Reconcile Account Balance Modal */}
      <ReconcileBalanceModal
        account={reconcilingAccount}
        open={!!reconcilingAccount}
        onClose={() => setReconcilingAccount(null)}
        onSaved={refetchAccounts}
      />
    </RealtimeProvider>
  )
}
