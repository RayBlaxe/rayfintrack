'use client'

import { useState } from 'react'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { BudgetProgressList } from '@/components/dashboard/BudgetProgressList'
import { DailyBudgetModal } from '@/components/dashboard/DailyBudgetModal'
import { MonthPicker } from '@/components/shared/MonthPicker'
import { useBudgets } from '@/hooks/useBudgets'
import { useDailyBudgetSettings } from '@/hooks/useDailyBudgetSettings'
import { formatRupiahCompact } from '@/lib/formatters'
import { Utensils, Wallet, Settings2, Sparkles } from 'lucide-react'

export default function BudgetsPage() {
  const [date, setDate] = useState(new Date())
  const [dailyModalOpen, setDailyModalOpen] = useState(false)
  const { budgets, loading } = useBudgets(date)
  const { settings: dailySettings, updateSettings: updateDailySettings } = useDailyBudgetSettings()

  const totalLimit = budgets.reduce((s, b) => s + b.limit_amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const overBudget = budgets.filter((b) => b.pct >= 100).length

  return (
    <RealtimeProvider>
      <div className="flex flex-col gap-5 pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-slate-50 text-2xl font-black tracking-tight">Anggaran & Limit</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Kontrol pengeluaran bulanan &amp; harian</p>
          </div>
          <MonthPicker date={date} onChange={setDate} />
        </div>

        {/* Monthly Summary Cards */}
        <div className="px-5 grid grid-cols-3 gap-2.5">
          <div className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Total Pagu</p>
            <p className="text-sm font-black font-mono text-slate-900 dark:text-slate-50">{formatRupiahCompact(totalLimit)}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Terpakai</p>
            <p className="text-sm font-black font-mono text-rose-600 dark:text-rose-400">{formatRupiahCompact(totalSpent)}</p>
          </div>
          <div className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Overbudget</p>
            <p className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">{overBudget} Kat</p>
          </div>
        </div>

        {/* Daily Limits Section */}
        <div className="px-5">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <div>
                  <h2 className="text-slate-900 dark:text-slate-50 font-bold text-sm tracking-tight">Target Limit Harian</h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Cegah kebocoran harian (makanan &amp; umum)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDailyModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>Ubah</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Food Limit Card */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                  <Utensils className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold">Makanan &amp; Minum</span>
                </div>
                <p className="text-base font-black font-mono text-slate-900 dark:text-slate-100">
                  {formatRupiahCompact(dailySettings.foodDailyLimit)}
                  <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/hari</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Max per hari untuk makan</p>
              </div>

              {/* General Limit Card */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                  <Wallet className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-bold">Total Harian</span>
                </div>
                <p className="text-base font-black font-mono text-slate-900 dark:text-slate-100">
                  {dailySettings.useAutoGeneral ? (
                    <span className="text-emerald-700 dark:text-emerald-400">Otomatis</span>
                  ) : (
                    <>
                      {formatRupiahCompact(dailySettings.generalDailyLimit)}
                      <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/hari</span>
                    </>
                  )}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {dailySettings.useAutoGeneral ? 'Safe-to-spend dinamis' : 'Target custom harian'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Category Budgets */}
        <div className="px-5">
          <BudgetProgressList budgets={budgets} loading={loading} />
        </div>

        {/* Telegram Shortcut Info */}
        <div className="mx-5 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold">Atur Cepat via Bot Telegram</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Kamu juga bisa set budget langsung lewat bot Telegram RayFin:
          </p>
          <div className="bg-white dark:bg-black/40 rounded-2xl p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200 space-y-1 border border-slate-200 dark:border-slate-800">
            <p className="text-emerald-700 dark:text-emerald-400 font-semibold">/budget set Makanan &amp; Minuman 1200000</p>
            <p className="text-emerald-700 dark:text-emerald-400 font-semibold">/budget set Operasional 600000</p>
            <p className="text-slate-500 dark:text-slate-400">/budget — lihat ringkasan saldo &amp; limit</p>
          </div>
        </div>
      </div>

      <DailyBudgetModal
        open={dailyModalOpen}
        onClose={() => setDailyModalOpen(false)}
        settings={dailySettings}
        onSave={updateDailySettings}
      />
    </RealtimeProvider>
  )
}
