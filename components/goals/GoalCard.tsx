'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Goal } from '@/types'
import { GOAL_CATEGORY_LABELS } from '@/lib/constants'
import { formatRupiah, formatRupiahCompact, deadlineDaysLeft } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface Props {
  goal: Goal
  index: number
  onUpdateAmount: (id: string, amount: number) => void
  onDelete?: (id: string, title: string) => void
}

export function GoalCard({ goal, index, onUpdateAmount, onDelete }: Props) {
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')

  const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
  const daysLeft = deadlineDaysLeft(goal.deadline)
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0)

  // SVG circle params
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)

  function handleSaveTopUp(e: React.FormEvent) {
    e.preventDefault()
    const addAmt = parseFloat(topUpAmount.replace(/[^0-9.]/g, ''))
    if (isNaN(addAmt) || addAmt <= 0) return
    const newTotal = goal.current_amount + addAmt
    onUpdateAmount(goal.id, newTotal)
    setTopUpAmount('')
    setTopUpOpen(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn(
          'bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors',
          goal.is_achieved && 'border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20'
        )}
      >
        <div className="flex items-start gap-4">
          {/* Circular progress */}
          <div className="relative flex-shrink-0">
            <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
              <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="5" />
              <motion.circle
                cx="36" cy="36" r={r}
                fill="none"
                stroke="#10B981"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, delay: index * 0.1 + 0.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl">{goal.icon}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-slate-900 dark:text-slate-50 font-bold text-sm leading-tight">{goal.title}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{GOAL_CATEGORY_LABELS[goal.category] ?? goal.category}</p>
              </div>
              <div className="flex items-center gap-1">
                {goal.is_achieved && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(goal.id, goal.title)}
                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                    title="Hapus goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress text */}
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-emerald-700 dark:text-emerald-400 font-black font-mono text-lg">{formatRupiahCompact(goal.current_amount)}</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">/ {formatRupiahCompact(goal.target_amount)}</span>
                <span className="ml-auto text-slate-700 dark:text-slate-300 text-xs font-bold font-mono">{pct.toFixed(0)}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Deadline + action button */}
            <div className="flex items-center justify-between gap-3 mt-3 pt-1">
              <div className="flex items-center gap-2">
                {daysLeft !== null && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className={cn(
                      'text-xs font-medium',
                      daysLeft < 30 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
                    )}>
                      {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Jatuh tempo lewat'}
                    </span>
                  </div>
                )}
                {!goal.is_achieved && (
                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                    Sisa {formatRupiahCompact(remaining)}
                  </span>
                )}
              </div>

              {!goal.is_achieved && (
                <button
                  type="button"
                  onClick={() => setTopUpOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-500 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-300 dark:border-slate-700"
                >
                  <Plus className="h-3 w-3" />
                  <span>Tabung</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top up modal */}
      <Dialog open={topUpOpen} onOpenChange={(v) => !v && setTopUpOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-50 font-bold">Setor Tabungan: {goal.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTopUp} className="space-y-4">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">Terkumpul saat ini: <span className="font-bold text-slate-900 dark:text-slate-100">{formatRupiah(goal.current_amount)}</span></p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">Target total: <span className="font-bold text-slate-900 dark:text-slate-100">{formatRupiah(goal.target_amount)}</span></p>
              <Input
                type="number"
                min="1000"
                step="1000"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Nominal tabungan baru (Rp)"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.99]"
            >
              Simpan Tabungan ✨
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
