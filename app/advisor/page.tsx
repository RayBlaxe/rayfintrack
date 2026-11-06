'use client'

import Link from 'next/link'
import { Bot, ArrowLeft } from 'lucide-react'
import { AdvisorChat } from '@/components/advisor/AdvisorChat'

export default function AdvisorPage() {
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50 dark:bg-[#090D16]">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-1 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title="Kembali ke Dashboard"
            aria-label="Kembali ke Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center flex-shrink-0">
            <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-slate-900 dark:text-slate-50 font-bold text-base leading-tight truncate">
              RayFin AI Advisor
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 text-xs truncate">Online • Data real-time</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Component takes remaining viewport */}
      <AdvisorChat />
    </div>
  )
}
