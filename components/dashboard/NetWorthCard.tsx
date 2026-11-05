import { TrendingUp, TrendingDown } from 'lucide-react'
import { Account } from '@/types'
import { CREDIT_CARD_ACCOUNTS } from '@/lib/constants'
import { formatRupiah } from '@/lib/formatters'

interface Props {
  accounts: Account[]
  loading?: boolean
}

export function NetWorthCard({ accounts, loading }: Props) {
  const liquidAssets = accounts
    .filter((a) => !CREDIT_CARD_ACCOUNTS.includes(a.account_name))
    .reduce((sum, a) => sum + a.current_balance, 0)

  const ccDebt = accounts
    .filter((a) => CREDIT_CARD_ACCOUNTS.includes(a.account_name))
    .reduce((sum, a) => sum + Math.abs(Math.min(a.current_balance, 0)), 0)

  const netWorth = liquidAssets - ccDebt

  if (loading) {
    return (
      <div className="rounded-3xl bg-slate-900 dark:bg-[#111827] border border-slate-800 p-6 animate-pulse">
        <div className="h-4 w-36 bg-slate-800 rounded mb-3" />
        <div className="h-10 w-52 bg-slate-800 rounded" />
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-slate-900 dark:bg-emerald-950/40 text-white border border-slate-800 dark:border-emerald-800/60 shadow-md p-6 relative overflow-hidden transition-colors">
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-wider text-emerald-300/80 font-bold">Total Kekayaan Bersih (Net Worth)</p>
        <p className="text-3xl sm:text-4xl font-black mt-1 tracking-tight font-mono text-white">
          {formatRupiah(netWorth)}
        </p>
        <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Aset Kas Likuid</span>
            </div>
            <p className="font-bold font-mono text-sm mt-0.5 text-white">{formatRupiah(liquidAssets)}</p>
          </div>
          {ccDebt > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-rose-300 text-xs font-semibold">
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Kewajiban Tagihan CC</span>
              </div>
              <p className="font-bold font-mono text-sm mt-0.5 text-rose-300">-{formatRupiah(ccDebt)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
