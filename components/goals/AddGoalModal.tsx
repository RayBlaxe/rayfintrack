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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Target Nabung</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <p className="text-white/50 text-xs mb-2">Kategori</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    category === c
                      ? 'bg-[#CCFF00] text-black'
                      : 'bg-white/8 text-white/60 border border-white/10'
                  }`}
                >
                  {GOAL_CATEGORY_EMOJI[c]} {GOAL_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white/50 text-xs mb-2">Nama Goal</p>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Rumah impian, Dana darurat..."
            />
          </div>

          <div>
            <p className="text-white/50 text-xs mb-2">Target Nominal (Rp)</p>
            <Input
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="30000000"
              type="number"
              min="1"
            />
          </div>

          <div>
            <p className="text-white/50 text-xs mb-2">Deadline (opsional)</p>
            <Input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>

          {error && <p className="text-[#FF85A1] text-xs">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-[#CCFF00] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Goal 🎯'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
