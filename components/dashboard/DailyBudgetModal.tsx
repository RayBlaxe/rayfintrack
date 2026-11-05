'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { DailyBudgetSettings } from '@/hooks/useDailyBudgetSettings'
import { Utensils, Wallet, Sparkles } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  settings: DailyBudgetSettings
  onSave: (newSettings: Partial<DailyBudgetSettings>) => void
}

export function DailyBudgetModal({ open, onClose, settings, onSave }: Props) {
  const [foodLimit, setFoodLimit] = useState(settings.foodDailyLimit.toString())
  const [generalLimit, setGeneralLimit] = useState(settings.generalDailyLimit.toString())
  const [useAuto, setUseAuto] = useState(settings.useAutoGeneral)

  useEffect(() => {
    if (open) {
      setFoodLimit(settings.foodDailyLimit.toString())
      setGeneralLimit(settings.generalDailyLimit.toString())
      setUseAuto(settings.useAutoGeneral)
    }
  }, [open, settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const foodNum = parseFloat(foodLimit.replace(/[^0-9.]/g, '')) || 50000
    const generalNum = parseFloat(generalLimit.replace(/[^0-9.]/g, '')) || 150000

    onSave({
      foodDailyLimit: foodNum,
      generalDailyLimit: generalNum,
      useAutoGeneral: useAuto,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
            <span>Target Budget Harian</span>
            <span className="text-base">🎯</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Food Daily Limit */}
          <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Utensils className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Batas Harian Makanan & Minuman</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Maksimal belanja makanan per hari</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-xs text-slate-400 dark:text-slate-500 font-bold">Rp</span>
              <Input
                type="number"
                min="0"
                step="5000"
                value={foodLimit}
                onChange={(e) => setFoodLimit(e.target.value)}
                className="pl-9 text-sm"
                placeholder="50000"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap pt-1">
              {[35000, 50000, 75000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFoodLimit(amt.toString())}
                  className="px-2 py-0.5 rounded-lg bg-slate-200/80 hover:bg-emerald-500/10 text-[10px] text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors"
                >
                  {(amt / 1000)}rb
                </button>
              ))}
            </div>
          </div>

          {/* General Daily Limit */}
          <div className="space-y-2.5 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Wallet className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Target Harian Total</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Otomatis vs Custom Nominal</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{useAuto ? 'Otomatis' : 'Custom'}</span>
                <Switch checked={useAuto} onCheckedChange={setUseAuto} />
              </div>
            </div>

            {useAuto ? (
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 dark:border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Otomatis dihitung dari sisa budget bulanan dibagi sisa hari (Safe to Spend).</span>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs text-slate-400 dark:text-slate-500 font-bold">Rp</span>
                <Input
                  type="number"
                  min="0"
                  step="10000"
                  value={generalLimit}
                  onChange={(e) => setGeneralLimit(e.target.value)}
                  className="pl-9 text-sm"
                  placeholder="150000"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.99]"
          >
            Simpan Target Harian ✨
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
