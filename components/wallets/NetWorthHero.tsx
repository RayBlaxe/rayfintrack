'use client'
import { motion } from 'framer-motion'
import { Account, Asset } from '@/types'
import { CREDIT_CARD_ACCOUNTS } from '@/lib/constants'
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters'
import { TrendingUp, Shield, Clock } from 'lucide-react'

interface Props {
  accounts: Account[]
  assets: Asset[]
  avgMonthlyExpense: number
}

function getRunwayLevel(months: number): { label: string; color: string } {
  if (months >= 12) return { label: 'EXCELLENT', color: '#CCFF00' }
  if (months >= 6)  return { label: 'AMAN',       color: '#86efac' }
  if (months >= 3)  return { label: 'CUKUP',      color: '#FFB547' }
  return                    { label: 'WASPADA',    color: '#FF85A1' }
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
    <div className="mx-5 rounded-3xl p-6 hero-gradient relative overflow-hidden">
      <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/5" />
      <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />

      <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-1">Total Kekayaan Bersih</p>
      <motion.p
        className="text-white text-4xl font-black tracking-tight mb-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {formatRupiah(netWorth)}
      </motion.p>

      {/* Runway */}
      <div className="flex items-center gap-2 mb-5">
        <Clock className="h-3.5 w-3.5 text-white/40" />
        <span className="text-white/50 text-sm">
          Runway{' '}
          <span className="font-bold" style={{ color }}>
            {runway.toFixed(1)} Bulan
          </span>
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color, backgroundColor: `${color}20` }}
        >
          {label}
        </span>
      </div>

      {/* 3 metrics */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white/8 rounded-2xl p-3">
          <p className="text-white/40 text-[10px] mb-1">Likuid</p>
          <p className="text-[#CCFF00] text-sm font-bold">{formatRupiahCompact(liquidAssets)}</p>
        </div>
        <div className="flex-1 bg-white/8 rounded-2xl p-3">
          <p className="text-white/40 text-[10px] mb-1">Aset</p>
          <p className="text-white text-sm font-bold">{formatRupiahCompact(assetValue)}</p>
        </div>
        <div className="flex-1 bg-white/8 rounded-2xl p-3">
          <p className="text-white/40 text-[10px] mb-1">Utang CC</p>
          <p className="text-[#FF85A1] text-sm font-bold">{formatRupiahCompact(ccDebt)}</p>
        </div>
      </div>
    </div>
  )
}
