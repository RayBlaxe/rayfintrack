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
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => router.push(item.href)}
            className="flex flex-col items-center gap-2 py-3"
          >
            <div className="h-14 w-14 rounded-2xl bg-[#21262D] border border-white/8 flex items-center justify-center text-2xl hover:border-white/20 transition-colors">
              {item.icon}
            </div>
            <span className="text-white/60 text-[10px] font-medium text-center leading-tight">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
