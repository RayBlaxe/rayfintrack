'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  Target,
  Camera,
  Bot,
  User,
  Lightbulb,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallets', label: 'Dompet & Aset', icon: Wallet },
  { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budget', icon: PieChart },
  { href: '/insights', label: 'Financial Insights', icon: Lightbulb },
  { href: '/goals', label: 'Target Finansial', icon: Target },
  { href: '/scanner', label: 'Scan Struk', icon: Camera },
  { href: '/advisor', label: 'AI Advisor', icon: Bot },
  { href: '/profile', label: 'Profil Saya', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 fixed left-0 top-0 z-40 transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-500 shadow-sm shadow-emerald-500/20">
          <Wallet className="h-5 w-5 text-white dark:text-slate-950" />
        </div>
        <div>
          <span className="font-bold text-lg text-slate-900 dark:text-slate-50 tracking-tight">RayFin</span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1">Wealth & Expense</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500')} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer with Theme Switcher */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tampilan</span>
          <ThemeToggle size="sm" showLabel />
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
          RayFin Personal Finance v2.0
        </p>
      </div>
    </aside>
  )
}
