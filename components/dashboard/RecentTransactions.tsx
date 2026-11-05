'use client'

import { motion } from 'framer-motion'
import { Transaction } from '@/types'
import { CATEGORY_EMOJI, ACCOUNT_LABELS } from '@/lib/constants'
import { formatRupiah, formatDateShort } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react'

interface Props {
  transactions: Transaction[]
  title?: string
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

export function RecentTransactions({ transactions, title = 'Aktivitas Terkini' }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
        <p className="text-3xl mb-3">🧾</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada transaksi</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">{title}</h2>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{transactions.length} transaksi</span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {transactions.map((txn, i) => (
          <motion.div
            key={txn.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors"
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
          </motion.div>
        ))}
      </div>
    </div>
  )
}
