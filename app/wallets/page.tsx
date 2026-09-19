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
            <h1 className="text-white text-2xl font-black">Dompet & Aset</h1>
            <p className="text-white/40 text-sm mt-1">Gambaran lengkap kekayaanmu</p>
          </div>
          <button
            onClick={() => setAssetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#CCFF00] text-black text-xs font-bold shadow-lg hover:opacity-90 transition-all"
            style={{ boxShadow: '0 4px 16px rgba(204,255,0,0.25)' }}
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
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                tab === t.key
                  ? 'bg-[#CCFF00] text-black'
                  : 'bg-white/8 text-white/60 border border-white/10 hover:border-white/20'
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
            <div key={type} className="bg-[#161B22] rounded-3xl border border-white/8 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ASSET_TYPE_COLORS[type] }} />
                <h3 className="text-white font-bold text-sm">{ASSET_TYPE_LABELS[type] ?? type}</h3>
              </div>
              <div className="px-5">
                {items.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-white text-sm font-semibold">{a.asset_name}</p>
                      {a.notes && <p className="text-white/40 text-xs mt-0.5">{a.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-white font-bold text-sm">{formatRupiahCompact(a.value)}</p>
                      <button
                        onClick={() => handleDeleteAsset(a.id, a.asset_name)}
                        className="text-white/20 hover:text-[#FF85A1] transition-colors p-1"
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
            <div className="bg-[#161B22] rounded-3xl border border-dashed border-white/15 p-8 text-center">
              <p className="text-4xl mb-3">🏦</p>
              <p className="text-white/50 text-sm">Belum ada data aset.</p>
              <p className="text-white/30 text-xs mt-1 mb-4">Catat investasi, properti, tabungan emas, dll.</p>
              <button
                onClick={() => setAssetModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CCFF00] text-black text-xs font-bold"
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
