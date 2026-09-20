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
          <DialogTitle className="flex items-center gap-2 text-white">
            <span>Target Budget Harian</span>
            <span className="text-base">🎯</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Food Daily Limit */}
          <div className="space-y-2 p-3.5 bg-white/5 rounded-2xl border border-white/8">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Utensils className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Batas Harian Makanan & Minuman</p>
                <p className="text-[10px] text-white/40">Maksimal belanja makanan per hari</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-xs text-white/40 font-bold">Rp</span>
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
                  className="px-2 py-0.5 rounded-lg bg-white/8 hover:bg-[#CCFF00]/20 text-[10px] text-white/70 hover:text-[#CCFF00] transition-colors"
                >
                  {(amt / 1000)}rb
                </button>
              ))}
            </div>
          </div>

          {/* General Daily Limit */}
          <div className="space-y-2.5 p-3.5 bg-white/5 rounded-2xl border border-white/8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Wallet className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Target Harian Total</p>
                  <p className="text-[10px] text-white/40">Otomatis vs Custom Nominal</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/50">{useAuto ? 'Otomatis' : 'Custom'}</span>
                <Switch checked={useAuto} onCheckedChange={setUseAuto} />
              </div>
            </div>

            {useAuto ? (
              <div className="p-2.5 bg-[#006466]/20 border border-[#006466]/40 rounded-xl flex items-center gap-2 text-xs text-white/80">
                <Sparkles className="h-4 w-4 text-[#CCFF00] flex-shrink-0" />
                <span>Otomatis dihitung dari sisa budget bulanan dibagi sisa hari (Safe to Spend).</span>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs text-white/40 font-bold">Rp</span>
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
            className="w-full py-3 rounded-2xl bg-[#CCFF00] text-black font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Simpan Target Harian ✨
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
