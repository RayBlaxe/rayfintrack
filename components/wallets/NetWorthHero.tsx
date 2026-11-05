'use client'

import { motion } from 'framer-motion'
import { Account, Asset } from '@/types'
import { CREDIT_CARD_ACCOUNTS } from '@/lib/constants'
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters'
import { Clock } from 'lucide-react'

interface Props {
  accounts: Account[]
  assets: Asset[]
  avgMonthlyExpense: number
}

function getRunwayLevel(months: number): { label: string; color: string } {
  if (months >= 12) return { label: 'EXCELLENT', color: '#10B981' }
  if (months >= 6)  return { label: 'AMAN',       color: '#34D399' }
  if (months >= 3)  return { label: 'CUKUP',      color: '#FBBF24' }
  return                    { label: 'WASPADA',    color: '#F87171' }
}

export function NetWorthHero({ accounts, assets, avgMonthlyExpense }: Props) {
  const liquidAssets = accounts
    .filter(a => !CREDIT_CARD_ACCOUNTS.includes(a.account_name))
    .reduce((s, a) => s + a.current_balance, 0)

  const ccDebt = accounts
    .filter(a => CREDIT_CARD_ACCOUNTS.includes(a.account_name))
    .reduce((s, a) => s + Math.abs(Math.min(a.current_balance, 0)), 0)

  const assetValue = assets.reduce((s, a) => s + a.value, 0)
  const netWorth = liquidAssets + assetValue - ccDebt
  const runway = avgMonthlyExpense > 0 ? liquidAssets / avgMonthlyExpense : 0
  const { label, color } = getRunwayLevel(runway)

  return (
    <div className="mx-5 rounded-3xl p-6 hero-gradient relative overflow-hidden shadow-lg transition-all">
      <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5 pointer-events-none" />

      <p className="text-emerald-200/90 text-xs uppercase tracking-widest font-bold mb-1">Total Kekayaan Bersih</p>
      <motion.p
        className="text-white text-3xl sm:text-4xl font-black font-mono tracking-tight mb-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {formatRupiah(netWorth)}
      </motion.p>

      {/* Runway */}
      <div className="flex items-center gap-2 mb-5">
        <Clock className="h-3.5 w-3.5 text-white/60" />
        <span className="text-white/80 text-xs font-medium">
          Ketahanan Dana:{' '}
          <span className="font-bold font-mono" style={{ color }}>
            {runway.toFixed(1)} Bulan
          </span>
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color, backgroundColor: `${color}25` }}
        >
          {label}
        </span>
      </div>

      {/* 3 metrics */}
      <div className="flex gap-2.5">
        <div className="flex-1 bg-black/25 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
          <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider mb-1">Kas Likuid</p>
          <p className="text-emerald-300 text-sm font-bold font-mono">{formatRupiahCompact(liquidAssets)}</p>
        </div>
        <div className="flex-1 bg-black/25 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
          <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider mb-1">Aset Tetap/Inv</p>
          <p className="text-white text-sm font-bold font-mono">{formatRupiahCompact(assetValue)}</p>
        </div>
        <div className="flex-1 bg-black/25 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
          <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider mb-1">Utang CC</p>
          <p className="text-rose-300 text-sm font-bold font-mono">{formatRupiahCompact(ccDebt)}</p>
        </div>
      </div>
    </div>
  )
}
