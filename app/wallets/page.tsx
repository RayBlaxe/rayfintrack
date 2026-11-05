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
import { formatRupiahCompact } from '@/lib/formatters'

import { Plus, Trash2 } from 'lucide-react'
import { AddAssetModal } from '@/components/wallets/AddAssetModal'
import { deleteAsset } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'

type Tab = 'all' | 'liquid' | 'asset' | 'debt'

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',    label: 'Semua' },
  { key: 'liquid', label: 'Dompet' },
  { key: 'asset',  label: 'Aset' },
  { key: 'debt',   label: 'Utang/CC' },
]

export default function WalletsPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [assetModalOpen, setAssetModalOpen] = useState(false)
  const { accounts, loading: accLoading } = useAccounts()
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
            />
          )}

          {(tab === 'all' || tab === 'debt') && (
            <AccountGroup
              title="💳 Kartu Kredit & Cicilan"
              accounts={accounts}
              showCC={true}
            />
          )}

          {/* Assets */}
          {(tab === 'all' || tab === 'asset') && Object.entries(assetsByType).map(([type, items]) => (
            <div key={type} className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ASSET_TYPE_COLORS[type] }} />
                <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm">{ASSET_TYPE_LABELS[type] ?? type}</h3>
              </div>
              <div className="px-5 divide-y divide-slate-100 dark:divide-slate-800/60">
                {items.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold">{a.asset_name}</p>
                      {a.notes && <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{a.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-slate-900 dark:text-slate-100 font-bold font-mono text-sm">{formatRupiahCompact(a.value)}</p>
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

      <AddAssetModal
        open={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        onCreated={refetchAssets}
      />
    </RealtimeProvider>
  )
}
