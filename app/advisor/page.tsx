'use client'
import { Bot } from 'lucide-react'
import { AdvisorChat } from '@/components/advisor/AdvisorChat'

export default function AdvisorPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#1b3a4b] border border-white/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-[#CCFF00]" />
          </div>
          <div>
            <h1 className="text-white font-bold">RayFin AI Advisor</h1>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00] pulse-dot" />
              <span className="text-white/40 text-xs">Online • Data real-time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <AdvisorChat />
    </div>
  )
}
