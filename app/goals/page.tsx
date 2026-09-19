'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { GoalCard } from '@/components/goals/GoalCard'
import { AddGoalModal } from '@/components/goals/AddGoalModal'
import { useGoals } from '@/hooks/useGoals'
import { updateGoalAmount, deleteGoal } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'

export default function GoalsPage() {
  const { goals, loading, refetch } = useGoals()
  const [addOpen, setAddOpen] = useState(false)

  const activeGoals = goals.filter(g => !g.is_achieved)
  const achieved   = goals.filter(g =>  g.is_achieved)

  async function handleUpdateAmount(id: string, amount: number) {
    await updateGoalAmount(id, amount)
    triggerRefresh()
    refetch()
  }

  async function handleDeleteGoal(id: string, title: string) {
    if (confirm(`Hapus goal "${title}"?`)) {
      await deleteGoal(id)
      triggerRefresh()
      refetch()
    }
  }

  return (
    <RealtimeProvider>
      <div className="flex flex-col gap-5 pb-8">
        {/* Header */}
        <div className="px-5 pt-8 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-black">Goals</h1>
            <p className="text-white/40 text-sm mt-1">Target nabungmu</p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="h-10 w-10 rounded-full bg-[#CCFF00] flex items-center justify-center"
          >
            <Plus className="h-5 w-5 text-black" strokeWidth={2.5} />
          </button>
        </div>

        {/* Stats summary */}
        <div className="px-5 flex gap-3">
          <div className="flex-1 bg-[#161B22] rounded-2xl p-4 border border-white/8">
            <p className="text-white/40 text-xs">Aktif</p>
            <p className="text-white font-black text-xl">{activeGoals.length}</p>
          </div>
          <div className="flex-1 bg-[#161B22] rounded-2xl p-4 border border-white/8">
            <p className="text-white/40 text-xs">Tercapai 🎉</p>
            <p className="text-[#CCFF00] font-black text-xl">{achieved.length}</p>
          </div>
        </div>

        {/* Active goals */}
        <div className="px-5 flex flex-col gap-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-[#161B22] rounded-3xl h-32 animate-pulse border border-white/8" />
            ))
          ) : activeGoals.length === 0 ? (
            <div className="bg-[#161B22] rounded-3xl border border-dashed border-white/15 p-10 text-center">
              <p className="text-4xl mb-3">🎯</p>
              <p className="text-white font-semibold">Belum ada goal aktif</p>
              <p className="text-white/40 text-sm mt-1">Tap + untuk menambahkan target nabung</p>
            </div>
          ) : (
            activeGoals.map((g, i) => (
              <GoalCard
                key={g.id}
                goal={g}
                index={i}
                onUpdateAmount={handleUpdateAmount}
                onDelete={handleDeleteGoal}
              />
            ))
          )}
        </div>

        {/* Achieved goals */}
        {achieved.length > 0 && (
          <div className="px-5">
            <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">🏆 Tercapai</p>
            <div className="flex flex-col gap-3">
              {achieved.map((g, i) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  index={i}
                  onUpdateAmount={handleUpdateAmount}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <AddGoalModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={refetch} />
    </RealtimeProvider>
  )
}
