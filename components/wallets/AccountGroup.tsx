'use client'

import { motion } from 'framer-motion'
import { Account } from '@/types'
import { ACCOUNT_LABELS, ACCOUNT_LOGOS, ACCOUNT_COLORS, CREDIT_CARD_ACCOUNTS } from '@/lib/constants'
import { formatRupiah } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  accounts: Account[]
  showCC?: boolean
}

function AccountRow({ account, index }: { account: Account; index: number }) {
  const isCC = CREDIT_CARD_ACCOUNTS.includes(account.account_name)
  const isNegative = account.current_balance < 0
  const color = ACCOUNT_COLORS[account.account_name] ?? '#10B981'
  const logo = ACCOUNT_LOGOS[account.account_name] ?? '🏦'
  const label = ACCOUNT_LABELS[account.account_name] ?? account.account_name

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 last:border-0"
    >
      {/* Logo circle */}
      <div
        className="h-11 w-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-2xs"
        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}35` }}
      >
        {logo}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-slate-900 dark:text-slate-100 text-sm font-bold truncate">{label}</p>
        {isCC && (
          <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full inline-block mt-0.5">
            Kartu Kredit
          </span>
        )}
      </div>

      <div className="text-right">
        <p className={cn(
          'text-sm font-bold font-mono tracking-tight',
          isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-50'
        )}>
          {formatRupiah(account.current_balance)}
        </p>
        {isCC && isNegative && (
          <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400">Tagihan Terutang</p>
        )}
      </div>
    </motion.div>
  )
}

export function AccountGroup({ title, accounts, showCC = false }: Props) {
  const filtered = showCC
    ? accounts.filter(a => CREDIT_CARD_ACCOUNTS.includes(a.account_name))
    : accounts.filter(a => !CREDIT_CARD_ACCOUNTS.includes(a.account_name))

  if (filtered.length === 0) return null

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">{title}</h3>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{filtered.length} Akun</span>
      </div>
      <div className="px-5">
        {filtered.map((a, i) => <AccountRow key={a.id} account={a} index={i} />)}
      </div>
    </div>
  )
}
