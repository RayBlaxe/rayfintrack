'use client'
import { Bot } from 'lucide-react'
import { AdvisorChat } from '@/components/advisor/AdvisorChat'

export default function AdvisorPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
            <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-slate-50 font-bold text-base">RayFin AI Advisor</h1>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-500 dark:text-slate-400 text-xs">Online • Data real-time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <AdvisorChat />
    </div>
  )
}
