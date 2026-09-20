'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { BudgetProgressList } from '@/components/dashboard/BudgetProgressList'
import { DailyBudgetModal } from '@/components/dashboard/DailyBudgetModal'
import { useBudgets } from '@/hooks/useBudgets'
import { useDailyBudgetSettings } from '@/hooks/useDailyBudgetSettings'
import { formatRupiahCompact } from '@/lib/formatters'
import { Utensils, Wallet, Settings2, Sparkles, AlertTriangle } from 'lucide-react'

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
        <div className="px-5 pt-8 pb-2">
          <h1 className="text-white text-2xl font-black">Anggaran & Limit</h1>
          <p className="text-white/40 text-sm mt-1">Kontrol pengeluaran bulanan &amp; harian</p>
        </div>

        {/* Monthly Summary Cards */}
        <div className="px-5 grid grid-cols-3 gap-2.5">
          <div className="bg-[#161B22] p-3.5 rounded-2xl border border-white/8">
            <p className="text-[10px] text-white/40 font-semibold mb-1">Total Anggaran</p>
            <p className="text-sm font-bold text-white">{formatRupiahCompact(totalLimit)}</p>
          </div>
          <div className="bg-[#161B22] p-3.5 rounded-2xl border border-white/8">
            <p className="text-[10px] text-white/40 font-semibold mb-1">Terpakai</p>
            <p className="text-sm font-bold text-[#FF85A1]">{formatRupiahCompact(totalSpent)}</p>
          </div>
          <div className="bg-[#161B22] p-3.5 rounded-2xl border border-white/8">
            <p className="text-[10px] text-white/40 font-semibold mb-1">Overbudget</p>
            <p className="text-sm font-bold text-amber-400">{overBudget} Kat</p>
          </div>
        </div>

        {/* Daily Limits Section */}
        <div className="px-5">
          <div className="bg-[#161B22] rounded-3xl p-5 border border-white/8 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <div>
                  <h2 className="text-white font-bold text-sm">Target Limit Harian</h2>
                  <p className="text-[10px] text-white/40">Cegah kebocoran harian (makanan &amp; umum)</p>
                </div>
              </div>
              <button
                onClick={() => setDailyModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#CCFF00] text-black text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>Ubah</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Food Limit Card */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Utensils className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">Makanan &amp; Minum</span>
                </div>
                <p className="text-base font-black text-white">
                  {formatRupiahCompact(dailySettings.foodDailyLimit)}
                  <span className="text-[10px] font-normal text-white/40">/hari</span>
                </p>
                <p className="text-[10px] text-white/40">Max per hari untuk makan</p>
              </div>

              {/* General Limit Card */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Wallet className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold">Total Harian</span>
                </div>
                <p className="text-base font-black text-white">
                  {dailySettings.useAutoGeneral ? (
                    <span className="text-[#CCFF00]">Otomatis</span>
                  ) : (
                    <>
                      {formatRupiahCompact(dailySettings.generalDailyLimit)}
                      <span className="text-[10px] font-normal text-white/40">/hari</span>
                    </>
                  )}
                </p>
                <p className="text-[10px] text-white/40">
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
        <div className="mx-5 bg-[#1b3a4b]/40 border border-white/8 rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#CCFF00]">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold">Atur Cepat via Telegram Bot</span>
          </div>
          <p className="text-xs text-white/60">
            Kamu juga bisa set budget langsung lewat chat bot Telegram:
          </p>
          <div className="bg-black/30 rounded-2xl p-3 font-mono text-[11px] text-white/80 space-y-1 border border-white/5">
            <p className="text-[#CCFF00]">/budget set Makanan &amp; Minuman 1500000</p>
            <p className="text-[#CCFF00]">/budget set Operasional 500000</p>
            <p className="text-white/40">/budget — lihat ringkasan saldo &amp; limit</p>
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
