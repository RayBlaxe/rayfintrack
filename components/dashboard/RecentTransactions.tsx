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
  if (type === 'INCOME') return <ArrowUpRight className="h-3.5 w-3.5 text-[#CCFF00]" />
  if (type === 'TRANSFER_INTERNAL') return <ArrowLeftRight className="h-3.5 w-3.5 text-white/50" />
  return <ArrowDownRight className="h-3.5 w-3.5 text-[#FF85A1]" />
}

function amountColor(type: string) {
  if (type === 'INCOME') return 'text-[#CCFF00]'
  if (type === 'TRANSFER_INTERNAL') return 'text-white/60'
  return 'text-[#FF85A1]'
}

function amountSign(type: string) {
  if (type === 'INCOME') return '+'
  if (type === 'TRANSFER_INTERNAL') return ''
  return '-'
}

export function RecentTransactions({ transactions, title = 'Aktivitas Terkini' }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="bg-[#161B22] rounded-3xl border border-white/8 p-8 text-center">
        <p className="text-3xl mb-3">🧾</p>
        <p className="text-white/50 text-sm">Belum ada transaksi</p>
      </div>
    )
  }

  return (
    <div className="bg-[#161B22] rounded-3xl border border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h2 className="text-white font-bold">{title}</h2>
      </div>
      <div className="divide-y divide-white/5">
        {transactions.map((txn, i) => (
          <motion.div
            key={txn.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 px-5 py-4"
          >
            {/* Icon */}
            <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-lg flex-shrink-0">
              {CATEGORY_EMOJI[txn.category] ?? '📦'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {txn.merchant_name || txn.description || txn.category}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <FlowIcon type={txn.flow_type} />
                <span className="text-white/40 text-xs truncate">
                  {ACCOUNT_LABELS[txn.source_account] ?? txn.source_account}
                  {' · '}
                  {formatDateShort(txn.transaction_date)}
                </span>
              </div>
            </div>

            {/* Amount */}
            <p className={cn('text-sm font-bold flex-shrink-0', amountColor(txn.flow_type))}>
              {amountSign(txn.flow_type)}{formatRupiah(txn.amount)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
