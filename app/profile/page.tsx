'use client'

import { useState, useMemo } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { useBudgets } from '@/hooks/useBudgets'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { computeFinancialHealthScore, compute503020 } from '@/lib/financialEngine'
import { getPersonalLiabilities } from '@/lib/liabilities'
import { NEEDS_CATEGORIES, WANTS_CATEGORIES } from '@/lib/constants'
import { formatRupiahCompact } from '@/lib/formatters'
import {
  LogOut,
  ShieldCheck,
  Lock,
  Loader2,
  FolderTree,
  Brain,
  HelpCircle,
  X,
  CheckCircle2,
  ChevronRight,
  Activity
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { accounts } = useAccounts()
  const date = useMemo(() => new Date(), [])
  const { transactions } = useTransactions({ date, limit: 200 })
  const { budgets } = useBudgets(date)
  const metrics = useDashboardMetrics(accounts, budgets as any, transactions, date)

  // Password state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [showFormulaModal, setShowFormulaModal] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const displayName = user?.username || process.env.NEXT_PUBLIC_USER_NAME || 'Ray'
  const initials = displayName.slice(0, 2).toUpperCase()
  const email = user?.email || `${displayName.toLowerCase()}@rayfin.local`

  // 1. Calculate 50/30/20 Breakdown identical to Dashboard
  const expenseOnly = useMemo(() => transactions.filter(t => t.flow_type === 'EXPENSE'), [transactions])
  const needsTotal  = useMemo(() => expenseOnly.filter(t => NEEDS_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0), [expenseOnly])
  const wantsTotal  = useMemo(() => expenseOnly.filter(t => WANTS_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0), [expenseOnly])
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const budget503020 = useMemo(() => {
    return compute503020(
      needsTotal,
      wantsTotal,
      metrics.totalBudgetThisMonth,
      metrics.totalIncomeThisMonth,
      date.getDate(),
      daysInMonth
    )
  }, [needsTotal, wantsTotal, metrics.totalBudgetThisMonth, metrics.totalIncomeThisMonth, date, daysInMonth])

  const personalDebts = useMemo(() => {
    if (typeof window === 'undefined') return 100000
    const list = getPersonalLiabilities()
    return list.filter(l => l.status === 'ACTIVE').reduce((s, l) => s + l.remaining_amount, 0)
  }, [])

  // 2. 4-Pillar Composite Score identical to Dashboard
  const healthResult = useMemo(() => {
    return computeFinancialHealthScore(
      needsTotal,
      wantsTotal,
      metrics.totalExpenseThisMonth,
      budget503020.effectiveBaseline,
      metrics.liquidAssets,
      metrics.ccDebt,
      personalDebts,
      14779200
    )
  }, [
    needsTotal,
    wantsTotal,
    metrics.totalExpenseThisMonth,
    budget503020.effectiveBaseline,
    metrics.liquidAssets,
    metrics.ccDebt,
    personalDebts,
  ])

  const score = healthResult.score
  const scoreColor = healthResult.color
  const scoreLabel = healthResult.label
  const scoreBg = healthResult.bg

  const totalTxn = transactions.length
  const runway = metrics.totalExpenseThisMonth > 0 ? metrics.liquidAssets / metrics.totalExpenseThisMonth : 0

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')

    if (!newPassword || newPassword.length < 6) {
      setPwdError('Password baru minimal 6 karakter')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPwdError('Konfirmasi password baru tidak cocok')
      return
    }

    setPwdLoading(true)
    try {
      // Supabase update user password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setPwdSuccess('Password berhasil diperbarui! Gunakan password baru saat login berikutnya.')
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setPwdError(err.message || 'Gagal mengubah password')
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <RealtimeProvider>
      <div className="flex flex-col gap-5 pb-12">
        {/* Header */}
        <div className="px-5 pt-8 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-slate-50 text-2xl font-black tracking-tight">Profil & Akun</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Kelola kredensial dan preferensi sistem</p>
          </div>
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
            <span>Akun Aktif • {email}</span>
          </div>
        </div>

        {/* Health Score Gauge (Unified with Dashboard) */}
        <div className="mx-5 bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <svg width="76" height="76" viewBox="0 0 80 80" className="-rotate-90">
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
              <div className="flex items-center gap-1.5">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Financial Health Score</p>
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(true)}
                  className="text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </div>
              <div
                className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-1 mb-1"
                style={{ color: scoreColor, backgroundColor: scoreBg }}
              >
                {scoreLabel}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Disiplin {healthResult.breakdown.budgetAdherenceScore}/35 pt • Runway {healthResult.breakdown.liquidityScore}/30 pt
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFormulaModal(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Lihat rincian 4 pilar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="px-5 grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Transaksi Bulan Ini</p>
            <p className="text-slate-900 dark:text-slate-50 font-black text-2xl mt-0.5">{totalTxn}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Sisa Tabungan</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-black text-xl mt-0.5">
              {formatRupiahCompact(Math.max(metrics.totalIncomeThisMonth - metrics.totalExpenseThisMonth, 0))}
            </p>
          </div>
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Net Worth</p>
            <p className="text-slate-900 dark:text-slate-50 font-black text-lg mt-0.5">{formatRupiahCompact(metrics.netWorth)}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Runway Likuid</p>
            <p className="text-slate-900 dark:text-slate-50 font-black text-xl mt-0.5">{runway.toFixed(1)} bln</p>
          </div>
        </div>

        {/* Feature Management Links */}
        <div className="mx-5 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          <Link
            href="/settings/categories"
            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">Kelola Kategori & Subkategori</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Tambah, ubah nama, emoji, dan kategori kustom</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/settings/ai-rules"
            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">Aturan AI Advisor (Motor Supra, dll)</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Atur preferensi AI (Supra → Transportasi bukan Operasional)</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        </div>

        {/* Change Password Card */}
        <div className="mx-5 bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-slate-900 dark:text-slate-50 font-bold text-sm">Keamanan & Ubah Password</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 font-medium"
                required
              />
            </div>

            {pwdError && <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{pwdError}</p>}
            {pwdSuccess && <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{pwdSuccess}</p>}

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {pwdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
              <span>{pwdLoading ? 'Menyimpan Password...' : 'Simpan Password Baru'}</span>
            </button>
          </form>
        </div>

        {/* Settings & Logout */}
        <div className="mx-5 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-slate-900 dark:text-slate-50 text-sm font-semibold">Tema Tampilan</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Pilih mode Terang atau Gelap (WCAG AAA)</p>
            </div>
            <ThemeToggle size="md" showLabel />
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-slate-900 dark:text-slate-50 text-sm font-semibold">Sesi Pengguna</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Login sebagai <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{displayName}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 text-xs font-bold transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Formula Modal */}
        {showFormulaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#0E1524] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-50">Formula Financial Health</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                  Skor Anda: {score} / 100 ({scoreLabel})
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Nilai di dashboard dan profil sinkron 100% menggunakan 4 pilar perhitungan objektif.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <span>1. Disiplin Anggaran (50/30/20)</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{healthResult.breakdown.budgetAdherenceScore} / 35 Poin</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Menilai alokasi pengeluaran bulanan: Needs (kebutuhan) ≤50% dan Wants (keinginan) ≤30% dari baseline.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <span>2. Likuiditas & Runway Kas</span>
                    <span className="text-teal-600 dark:text-teal-400">{healthResult.breakdown.liquidityScore} / 30 Poin</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Mengukur ketahanan kas likuid: ≥6 bulan (30 pt), ≥3 bulan (24 pt), ≥1 bulan (18 pt).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <span>3. Rasio Beban Utang</span>
                    <span className="text-amber-600 dark:text-amber-400">{healthResult.breakdown.liabilityScore} / 20 Poin</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Rasio liabilitas kartu kredit & utang perorangan terhadap kapasitas finansial.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                    <span>4. Aset & Tabungan</span>
                    <span className="text-blue-600 dark:text-blue-400">{healthResult.breakdown.savingsScore} / 15 Poin</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Rasio total aset produktif terhadap pengeluaran bulanan.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RealtimeProvider>
  )
}
