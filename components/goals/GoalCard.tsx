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
        transition={{ delay: index * 0.07 }}
        className={cn(
          'bg-[#161B22] rounded-3xl p-5 border border-white/8',
          goal.is_achieved && 'border-[#CCFF00]/30'
        )}
      >
        <div className="flex items-start gap-4">
          {/* Circular progress */}
          <div className="relative flex-shrink-0">
            <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
              <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
              <motion.circle
                cx="36" cy="36" r={r}
                fill="none"
                stroke={goal.is_achieved ? '#CCFF00' : '#CCFF00'}
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
                <p className="text-white font-bold text-sm leading-tight">{goal.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{GOAL_CATEGORY_LABELS[goal.category] ?? goal.category}</p>
              </div>
              <div className="flex items-center gap-1">
                {goal.is_achieved && (
                  <CheckCircle2 className="h-5 w-5 text-[#CCFF00] flex-shrink-0" />
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(goal.id, goal.title)}
                    className="text-white/20 hover:text-[#FF85A1] transition-colors p-1"
                    title="Hapus goal"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress text */}
            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[#CCFF00] font-black text-lg">{formatRupiahCompact(goal.current_amount)}</span>
                <span className="text-white/40 text-xs">/ {formatRupiahCompact(goal.target_amount)}</span>
                <span className="ml-auto text-white/60 text-sm font-bold">{pct.toFixed(0)}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-white/8 rounded-full mt-2 overflow-hidden">
                <motion.div
                  className="h-full bg-[#CCFF00] rounded-full"
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
                    <Clock className="h-3 w-3 text-white/30" />
                    <span className={cn(
                      'text-xs',
                      daysLeft < 30 ? 'text-[#FF85A1]' : 'text-white/40'
                    )}>
                      {daysLeft > 0 ? `${daysLeft} hari` : 'Lewat'}
                    </span>
                  </div>
                )}
                {!goal.is_achieved && (
                  <span className="text-white/30 text-xs">
                    Sisa {formatRupiahCompact(remaining)}
                  </span>
                )}
              </div>

              {!goal.is_achieved && (
                <button
                  onClick={() => setTopUpOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/8 hover:bg-[#CCFF00] text-white/80 hover:text-black text-xs font-semibold transition-all border border-white/10"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setor Tabungan: {goal.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTopUp} className="space-y-4">
            <div>
              <p className="text-white/50 text-xs mb-1">Terkumpul saat ini: {formatRupiah(goal.current_amount)}</p>
              <p className="text-white/40 text-xs mb-3">Target: {formatRupiah(goal.target_amount)}</p>
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
              className="w-full py-3 rounded-2xl bg-[#CCFF00] text-black font-bold text-sm hover:opacity-90"
            >
              Simpan Tabungan ✨
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
