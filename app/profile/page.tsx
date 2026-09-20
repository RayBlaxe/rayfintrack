'use client'

import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/context/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { useBudgets } from '@/hooks/useBudgets'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { formatRupiahCompact } from '@/lib/formatters'
import { LogOut, User, Sparkles, ShieldCheck } from 'lucide-react'

export default function ProfilePage() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { accounts } = useAccounts()
  const { transactions } = useTransactions({ date: new Date(), limit: 100 })
  const { budgets } = useBudgets(new Date())
  const metrics = useDashboardMetrics(accounts, budgets as any, transactions, new Date())

  const displayName = user?.username || process.env.NEXT_PUBLIC_USER_NAME || 'Ray'
  const initials = displayName.slice(0, 2).toUpperCase()

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
  const scoreColor = score >= 80 ? '#CCFF00' : score >= 60 ? '#86efac' : score >= 40 ? '#FFB547' : '#FF85A1'
  const scoreLabel = score >= 80 ? 'SANGAT BAGUS' : score >= 60 ? 'CUKUP BAIK' : score >= 40 ? 'WASPADA' : 'PERLU PERBAIKAN'

  return (
    <RealtimeProvider>
      <div className="flex flex-col gap-5 pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-white text-2xl font-black">Profil</h1>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center px-5 pb-2">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#1b3a4b] to-[#0b525b] border border-white/10 flex items-center justify-center mb-3 shadow-xl">
            <span className="text-3xl font-black text-[#CCFF00]">{initials}</span>
          </div>
          <h2 className="text-white text-xl font-bold">{displayName}</h2>
          <div className="flex items-center gap-1.5 mt-1 text-white/40 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-[#CCFF00]" />
            <span>Sesi Aktif di Perangkat Ini</span>
          </div>
        </div>

        {/* Health Score */}
        <div className="mx-5 bg-[#161B22] rounded-3xl p-5 border border-white/8 flex items-center gap-5">
          {/* Gauge */}
          <div className="relative flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" strokeDasharray="150 201" />
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
              <span className="text-white text-lg font-black">{score}</span>
            </div>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-1">Financial Health Score</p>
            <div
              className="inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-2"
              style={{ color: scoreColor, backgroundColor: `${scoreColor}18` }}
            >
              {scoreLabel}
            </div>
            <p className="text-white/50 text-xs">
              Savings rate {savingsRate.toFixed(0)}% • Runway {runway.toFixed(1)} bln
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 grid grid-cols-2 gap-3">
          <div className="bg-[#161B22] rounded-2xl p-4 border border-white/8">
            <p className="text-white/40 text-xs">Transaksi Bulan Ini</p>
            <p className="text-white font-black text-2xl">{totalTxn}</p>
          </div>
          <div className="bg-[#161B22] rounded-2xl p-4 border border-white/8">
            <p className="text-white/40 text-xs">Tabungan Bulan Ini</p>
            <p className="text-[#CCFF00] font-black text-xl">
              {formatRupiahCompact(Math.max(metrics.totalIncomeThisMonth - metrics.totalExpenseThisMonth, 0))}
            </p>
          </div>
          <div className="bg-[#161B22] rounded-2xl p-4 border border-white/8">
            <p className="text-white/40 text-xs">Net Worth</p>
            <p className="text-white font-black text-lg">{formatRupiahCompact(metrics.netWorth)}</p>
          </div>
          <div className="bg-[#161B22] rounded-2xl p-4 border border-white/8">
            <p className="text-white/40 text-xs">Runway</p>
            <p className="text-white font-black text-xl">{runway.toFixed(1)} bln</p>
          </div>
        </div>

        {/* Settings */}
        <div className="mx-5 bg-[#161B22] rounded-3xl border border-white/8 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-white font-bold text-sm">Pengaturan</h3>
          </div>
          <div className="px-5">
            {/* Dark mode toggle */}
            <div className="flex items-center justify-between py-4 border-b border-white/5">
              <div>
                <p className="text-white text-sm font-medium">Mode Gelap</p>
                <p className="text-white/40 text-xs">Tampilan dark premium</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')}
              />
            </div>

            {/* Logout / Switch Account */}
            <div className="flex items-center justify-between py-4 border-b border-white/5">
              <div>
                <p className="text-white text-sm font-medium">Akun Pengguna</p>
                <p className="text-white/40 text-xs">Login sebagai <span className="text-[#CCFF00] font-semibold">{displayName}</span></p>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF85A1]/10 hover:bg-[#FF85A1]/20 text-[#FF85A1] border border-[#FF85A1]/30 text-xs font-bold transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Ganti Akun</span>
              </button>
            </div>

            {/* About */}
            <div className="py-4">
              <p className="text-white text-sm font-medium">Tentang RayFin</p>
              <p className="text-white/40 text-xs mt-1">
                Personal Finance Tracker • v2.0 Budggt Edition<br />
                Powered by Supabase + Gemini AI
              </p>
            </div>
          </div>
        </div>
      </div>
    </RealtimeProvider>
  )
}
