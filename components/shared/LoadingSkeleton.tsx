import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function NetWorthSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800">
      <CardContent className="p-6">
        <Skeleton className="h-4 w-36 bg-indigo-400/50 mb-2" />
        <Skeleton className="h-10 w-48 bg-indigo-400/50" />
      </CardContent>
    </Card>
  )
}

export function WalletCardSkeleton() {
  return (
    <Card className="min-w-[160px] flex-shrink-0">
      <CardContent className="p-4">
        <Skeleton className="h-3 w-20 mb-3" />
        <Skeleton className="h-6 w-28" />
      </CardContent>
    </Card>
  )
}

export function BudgetProgressSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  )
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export function SafeToSpendSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-8 w-44 mb-1" />
        <Skeleton className="h-3 w-52" />
      </CardContent>
    </Card>
  )
}
