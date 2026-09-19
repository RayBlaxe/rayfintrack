import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
      <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800">
        <CardContent className="p-6">
          <div className="h-4 w-36 bg-indigo-400/50 rounded mb-2 animate-pulse" />
          <div className="h-10 w-52 bg-indigo-400/50 rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-0 shadow-lg shadow-indigo-200">
      <CardContent className="p-6">
        <p className="text-sm text-indigo-200 font-medium">Total Kekayaan Bersih</p>
        <p className="text-4xl font-bold mt-1 tracking-tight">
          {formatRupiah(netWorth)}
        </p>
        <div className="flex gap-6 mt-4">
          <div>
            <div className="flex items-center gap-1 text-indigo-200 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>Aset Likuid</span>
            </div>
            <p className="font-semibold mt-0.5">{formatRupiah(liquidAssets)}</p>
          </div>
          {ccDebt > 0 && (
            <div>
              <div className="flex items-center gap-1 text-indigo-200 text-xs">
                <TrendingDown className="h-3 w-3" />
                <span>Tagihan CC</span>
              </div>
              <p className="font-semibold text-rose-300 mt-0.5">-{formatRupiah(ccDebt)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
