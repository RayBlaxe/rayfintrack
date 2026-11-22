import { CreditCard, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Account } from '@/types'
import { formatRupiah } from '@/lib/formatters'
import { BankLogo } from '@/components/shared/BankLogo'
import { getBankTheme } from '@/lib/bankThemes'
import { cn } from '@/lib/utils'

interface Props {
  account: Account
}

export function WalletCard({ account }: Props) {
  const theme = getBankTheme(account.account_name)
  const isCC = theme.type === 'CREDIT_CARD'
  const isNegative = account.current_balance < 0

  return (
    <Card className={cn(
      'min-w-[170px] flex-shrink-0 overflow-hidden hover:shadow-md transition-all border',
      theme.bgClass,
      theme.borderClass
    )}>
      <div className="h-1.5" style={{ backgroundColor: theme.primaryColor }} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <BankLogo name={account.account_name} size="sm" />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-bold truncate max-w-[100px]">
              {theme.label || account.account_name}
            </span>
          </div>
          {isCC ? (
            <CreditCard className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          ) : (
            <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
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
