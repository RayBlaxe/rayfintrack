'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Wallet, Plus, Receipt, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FABMenu } from './FABMenu'

const NAV_ITEMS = [
  { href: '/',             label: 'Home',    icon: LayoutDashboard },
  { href: '/wallets',      label: 'Dompet',  icon: Wallet },
  null, // FAB slot
  { href: '/transactions', label: 'Riwayat', icon: Receipt },
  { href: '/profile',      label: 'Profil',  icon: UserCircle },
] as const

export function FloatingDock() {
  const pathname = usePathname()
  const router = useRouter()
  const [fabOpen, setFabOpen] = useState(false)

  return (
    <>
      <FABMenu open={fabOpen} onClose={() => setFabOpen(false)} />

      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm">
          <div className="flex items-center justify-around bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-[2rem] px-2 py-2 shadow-xl dark:shadow-2xl shadow-slate-300/40 dark:shadow-black/60 transition-colors">
            {NAV_ITEMS.map((item, i) => {
              if (!item) {
                return (
                  <motion.button
                    key="fab"
                    onClick={() => setFabOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="Tambah Transaksi atau Scan"
                    className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 flex items-center justify-center shadow-lg -mt-6 transition-all"
                    style={{ boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}
                  >
                    <Plus className="h-7 w-7 text-white dark:text-slate-950 font-bold" strokeWidth={2.75} />
                  </motion.button>
                )
              }
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all',
                    active
                      ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  <Icon className={cn('h-5 w-5', active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400')} />
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="h-1 w-1 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
