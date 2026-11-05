'use client'

import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { useBudgets } from '@/hooks/useBudgets'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { formatRupiahCompact } from '@/lib/formatters'
import { LogOut, ShieldCheck, Sun, Moon } from 'lucide-react'

export default function ProfilePage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { user, logout } = useAuth()
  const { accounts } = useAccounts()
  const { transactions } = useTransactions({ date: new Date(), limit: 100 })
  const { budgets } = useBudgets(new Date())
  const metrics = useDashboardMetrics(accounts, budgets as any, transactions, new Date())

  const displayName = user?.username || process.env.NEXT_PUBLIC_USER_NAME || 'Ray'
  const initials = displayName.slice(0, 2).toUpperCase()

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark'

  const totalTxn = transactions.length
  const savingsRate = metrics.totalIncomeThisMonth > 0
    ? ((metrics.totalIncomeThisMonth - metrics.totalExpenseThisMonth) / metrics.totalIncomeThisMonth) * 100
    : 0
  const budgetDiscipline = metrics.totalBudgetThisMonth > 0
    ? Math.max(100 - Math.max((metrics.totalExpenseThisMonth / metrics.totalBudgetThisMonth) * 100 - 100, 0), 0)
    : 50
  const runway = metrics.liquidAssets / (metrics.totalExpenseThisMonth || 1)

  function calcScore(s: number, b: number, r: number) {
    return Math.max(Math.round(Math.min(s/20*40,40) + Math.min(b/100*35,35) + Math.min(r/6*25,25)), 0)
  }
  const score = calcScore(savingsRate, budgetDiscipline, runway)
  const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#059669' : score >= 40 ? '#F59E0B' : '#EF4444'
  const scoreLabel = score >= 80 ? 'SANGAT BAGUS' : score >= 60 ? 'CUKUP BAIK' : score >= 40 ? 'WASPADA' : 'PERLU PERBAIKAN'

  return (
    <RealtimeProvider>
      <div className="flex flex-col gap-5 pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-2 flex items-center justify-between">
          <h1 className="text-slate-900 dark:text-slate-50 text-2xl font-black tracking-tight">Profil Pengguna</h1>
          <ThemeToggle size="md" />
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center px-5 pb-2">
          <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/25 flex items-center justify-center mb-3 shadow-md">
            <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{initials}</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-50 text-xl font-bold tracking-tight">{displayName}</h2>
          <div className="flex items-center gap-1.5 mt-1 text-slate-500 dark:text-slate-400 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Akun Utama • ray@rayfin.local</span>
          </div>
        </div>

        {/* Health Score */}
        <div className="mx-5 bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
          {/* Gauge */}
          <div className="relative flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="7"
                strokeDasharray="150 201"
              />
              <circle
                cx="40" cy="40" r="32"
                fill="none"
                stroke={scoreColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="201"
                strokeDashoffset={201 - (score / 100) * 150}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-slate-900 dark:text-slate-50 text-lg font-black">{score}</span>
            </div>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-1 font-medium">Financial Health Score</p>
            <div
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-1.5"
              style={{ color: scoreColor, backgroundColor: `${scoreColor}18` }}
            >
              {scoreLabel}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Savings rate {savingsRate.toFixed(0)}% • Runway {runway.toFixed(1)} bln
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Transaksi Bulan Ini</p>
            <p className="text-slate-900 dark:text-slate-50 font-black text-2xl mt-0.5">{totalTxn}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Tabungan Bulan Ini</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-black text-xl mt-0.5">
              {formatRupiahCompact(Math.max(metrics.totalIncomeThisMonth - metrics.totalExpenseThisMonth, 0))}
            </p>
          </div>
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Net Worth</p>
            <p className="text-slate-900 dark:text-slate-50 font-black text-lg mt-0.5">{formatRupiahCompact(metrics.netWorth)}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Runway</p>
            <p className="text-slate-900 dark:text-slate-50 font-black text-xl mt-0.5">{runway.toFixed(1)} bln</p>
          </div>
        </div>

        {/* Settings */}
        <div className="mx-5 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-slate-900 dark:text-slate-50 font-bold text-sm">Pengaturan Aplikasi</h3>
          </div>
          <div className="px-5">
            {/* Dark mode toggle */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-slate-900 dark:text-slate-50 text-sm font-semibold">Tema Tampilan</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Pilih mode Terang atau Gelap (WCAG AAA)</p>
              </div>
              <ThemeToggle size="md" showLabel />
            </div>

            {/* Logout / Switch Account */}
            <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-slate-900 dark:text-slate-50 text-sm font-semibold">Sesi Pengguna</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Login sebagai <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{displayName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 text-xs font-bold transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>

            {/* About */}
            <div className="py-4">
              <p className="text-slate-900 dark:text-slate-50 text-sm font-semibold">Tentang RayFin</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                Personal Finance & Budget Tracker v2.0<br />
                Tailwind CSS v4 • Next.js 16 Turbopack • PWA Certified
              </p>
            </div>
          </div>
        </div>
      </div>
    </RealtimeProvider>
  )
}
