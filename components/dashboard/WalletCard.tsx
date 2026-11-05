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
  const color = ACCOUNT_COLORS[account.account_name] ?? '#10B981'
  const label = ACCOUNT_LABELS[account.account_name] ?? account.account_name
  const isNegative = account.current_balance < 0

  return (
    <Card className="min-w-[160px] flex-shrink-0 overflow-hidden hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
      <div className="h-1.5" style={{ backgroundColor: color }} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold truncate max-w-[105px]">{label}</span>
          {isCC ? (
            <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          ) : (
            <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          )}
        </div>
        <p
          className={cn(
            'text-lg font-bold font-mono tracking-tight leading-none',
            isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-50'
          )}
        >
          {formatRupiah(account.current_balance)}
        </p>
        {isCC && isNegative && (
          <Badge variant="outline" className="mt-2 text-[10px] font-bold text-rose-600 dark:text-rose-300 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40">
            Terutang
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
