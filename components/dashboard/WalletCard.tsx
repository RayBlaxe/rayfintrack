import { CreditCard, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Account } from '@/types'
import { ACCOUNT_LABELS, ACCOUNT_COLORS, CREDIT_CARD_ACCOUNTS } from '@/lib/constants'
import { formatRupiah } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Props {
  account: Account
}

export function WalletCard({ account }: Props) {
  const isCC = CREDIT_CARD_ACCOUNTS.includes(account.account_name)
  const color = ACCOUNT_COLORS[account.account_name] ?? '#6B7280'
  const label = ACCOUNT_LABELS[account.account_name] ?? account.account_name
  const isNegative = account.current_balance < 0

  return (
    <Card className="min-w-[160px] flex-shrink-0 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1" style={{ backgroundColor: color }} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 font-medium truncate max-w-[100px]">{label}</span>
          {isCC ? (
            <CreditCard className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
          ) : (
            <Wallet className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
          )}
        </div>
        <p
          className={cn(
            'text-lg font-bold leading-none',
            isNegative ? 'text-rose-600' : 'text-slate-800'
          )}
        >
          {formatRupiah(account.current_balance)}
        </p>
        {isCC && isNegative && (
          <Badge variant="outline" className="mt-2 text-xs text-rose-500 border-rose-200 bg-rose-50">
            Tagihan
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
