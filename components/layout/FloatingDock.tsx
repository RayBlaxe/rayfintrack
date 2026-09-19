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
          <div className="flex items-center justify-around bg-[#161B22]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-2 py-2 shadow-2xl">
            {NAV_ITEMS.map((item, i) => {
              if (!item) {
                return (
                  <motion.button
                    key="fab"
                    onClick={() => setFabOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    className="h-14 w-14 rounded-full bg-[#CCFF00] flex items-center justify-center shadow-lg -mt-6"
                    style={{ boxShadow: '0 4px 24px rgba(204,255,0,0.35)' }}
                  >
                    <Plus className="h-7 w-7 text-black" strokeWidth={2.5} />
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
                    active ? 'text-[#CCFF00]' : 'text-white/40 hover:text-white/70'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="h-1 w-1 rounded-full bg-[#CCFF00]"
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
