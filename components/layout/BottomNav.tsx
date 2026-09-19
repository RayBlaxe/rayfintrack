'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budget', icon: PieChart },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 md:hidden safe-bottom">
      <div className="flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center py-3 gap-0.5 text-xs font-medium transition-colors',
                active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'text-indigo-600')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
