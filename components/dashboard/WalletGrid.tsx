'use client'

import { WalletCard } from './WalletCard'
import { WalletCardSkeleton } from '@/components/shared/LoadingSkeleton'
import { Account } from '@/types'

interface Props {
  accounts: Account[]
  loading?: boolean
}

export function WalletGrid({ accounts, loading }: Props) {
  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {[1, 2, 3, 4].map((i) => (
          <WalletCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        Belum ada data akun. Set saldo via Telegram /saldo set BCA 5000000
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:mx-0 md:px-0 lg:grid-cols-4">
      {accounts.map((account) => (
        <WalletCard key={account.id} account={account} />
      ))}
    </div>
  )
}
