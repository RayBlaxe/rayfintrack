'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { GoalCategory } from '@/types'
import { GOAL_CATEGORY_EMOJI, GOAL_CATEGORY_LABELS } from '@/lib/constants'
import { insertGoal } from '@/lib/queries'

const CATEGORIES: GoalCategory[] = ['EMERGENCY', 'ASSET', 'DREAM', 'EDUCATION', 'TRAVEL', 'OTHER']

const DEFAULT_ICONS: Record<GoalCategory, string> = {
  EMERGENCY: '🛡️', ASSET: '🏠', DREAM: '✨', EDUCATION: '🎓', TRAVEL: '✈️', OTHER: '🎯',
}

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function AddGoalModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState<GoalCategory>('DREAM')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(target.replace(/[^0-9.]/g, ''))
    if (!title.trim() || !amt || amt <= 0) {
      setError('Isi nama dan nominal target.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await insertGoal({
        title: title.trim(),
        target_amount: amt,
        current_amount: 0,
        deadline: deadline || undefined,
        category,
        icon: DEFAULT_ICONS[category],
      })
      setTitle(''); setTarget(''); setDeadline(''); setCategory('DREAM')
      onCreated()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan goal.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-50 font-bold">Tambah Target Tabungan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs mb-2">Kategori Target</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => {
                const selected = category === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
                      selected
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-2 border-emerald-600 dark:border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {GOAL_CATEGORY_EMOJI[c]} {GOAL_CATEGORY_LABELS[c]}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1.5">Nama Target</p>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Rumah impian, Dana darurat..."
            />
          </div>

          <div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1.5">Target Nominal (Rp)</p>
            <Input
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="Contoh: 30000000"
              type="number"
              min="1"
            />
          </div>

          <div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1.5">Deadline (opsional)</p>
            <Input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600 dark:text-red-400 text-xs font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Target 🎯'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
