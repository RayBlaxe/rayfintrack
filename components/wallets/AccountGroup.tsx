'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Account } from '@/types'
import { BankLogo } from '@/components/shared/BankLogo'
import { getBankTheme } from '@/lib/bankThemes'
import { formatRupiah } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { SlidersHorizontal, ChevronRight } from 'lucide-react'

interface Props {
  title: string
  accounts: Account[]
  showCC?: boolean
  onSelectAccount?: (account: Account) => void
  onAddAccount?: () => void
}

function AccountCard({
  account,
  index,
  onSelect,
}: {
  account: Account
  index: number
  onSelect?: (account: Account) => void
}) {
  const theme = getBankTheme(account.account_name)
  const isCC = theme.type === 'CREDIT_CARD'
  const isNegative = account.current_balance < 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onSelect?.(account)}
      className={cn(
        'group relative p-4 rounded-2xl border transition-all cursor-pointer',
        theme.bgClass,
        theme.borderClass,
        'hover:shadow-md hover:scale-[1.005] active:scale-[0.99]'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand SVG Logo + Names */}
        <div className="flex items-center gap-3 min-w-0">
          <BankLogo name={account.account_name} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight truncate">
                {theme.label || account.account_name}
              </span>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', theme.badgeBg, theme.badgeText)}>
                {isCC ? 'Kartu Kredit' : theme.type === 'E_WALLET' ? 'E-Wallet' : theme.type === 'CASH' ? 'Kas Tunai' : 'Bank'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
              ID: {account.account_name}
            </p>
          </div>
        </div>

        {/* Right: Balance + Action */}
        <div className="flex items-center gap-2 flex-shrink-0 text-right">
          <div>
            <p
              className={cn(
                'text-sm sm:text-base font-black font-mono tracking-tight',
                isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-50'
              )}
            >
              {formatRupiah(account.current_balance)}
            </p>
            {isCC && isNegative && (
              <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400">Tagihan Terutang</p>
            )}
          </div>

          <div className="p-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function AccountGroup({
  title,
  accounts,
  showCC = false,
  onSelectAccount,
  onAddAccount,
}: Props) {
  const filtered = showCC
    ? accounts.filter((a) => getBankTheme(a.account_name).type === 'CREDIT_CARD')
    : accounts.filter((a) => getBankTheme(a.account_name).type !== 'CREDIT_CARD')

  if (filtered.length === 0) return null

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">{title}</h3>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{filtered.length} Akun</span>
      </div>
      <div className="p-4 space-y-2.5">
        {filtered.map((a, i) => (
          <AccountCard key={a.id} account={a} index={i} onSelect={onSelectAccount} />
        ))}
      </div>
    </div>
  )
}
