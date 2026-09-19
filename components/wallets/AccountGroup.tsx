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
  const color = ACCOUNT_COLORS[account.account_name] ?? '#94a3b8'
  const logo = ACCOUNT_LOGOS[account.account_name] ?? '🏦'
  const label = ACCOUNT_LABELS[account.account_name] ?? account.account_name

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0"
    >
      {/* Logo circle */}
      <div
        className="h-11 w-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
      >
        {logo}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{label}</p>
        {isCC && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">Kartu Kredit</span>}
      </div>

      <div className="text-right">
        <p className={cn(
          'text-sm font-bold',
          isNegative || isCC ? 'text-[#FF85A1]' : 'text-white'
        )}>
          {formatRupiah(account.current_balance)}
        </p>
        {isCC && isNegative && (
          <p className="text-[10px] text-white/40">tagihan</p>
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
    <div className="bg-[#161B22] rounded-3xl border border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="text-white font-bold text-sm">{title}</h3>
      </div>
      <div className="px-5">
        {filtered.map((a, i) => <AccountRow key={a.id} account={a} index={i} />)}
      </div>
    </div>
  )
}
