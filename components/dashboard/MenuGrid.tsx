'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MENU_ITEMS } from '@/lib/constants'

export function MenuGrid() {
  const router = useRouter()

  return (
    <div className="px-5">
      <div className="grid grid-cols-4 gap-3">
        {MENU_ITEMS.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.04 * i, duration: 0.25 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push(item.href)}
            className="flex flex-col items-center gap-2 py-2 group"
          >
            <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center text-2xl group-hover:border-emerald-500/50 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-950/30 transition-all">
              {item.icon}
            </div>
            <span className="text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 text-[11px] font-semibold text-center leading-tight transition-colors">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
