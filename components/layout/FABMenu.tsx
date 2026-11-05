'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MessageSquare, PenLine } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

const ACTIONS = [
  { icon: PenLine,       label: 'Catat Transaksi', sublabel: 'Input manual via AI', href: '/advisor' },
  { icon: Camera,        label: 'Scan Struk',       sublabel: 'Foto nota atau struk belanja', href: '/scanner' },
  { icon: MessageSquare, label: 'Tanya AI Advisor', sublabel: 'Konsultasi & tips keuangan', href: '/advisor' },
]

export function FABMenu({ open, onClose }: Props) {
  const router = useRouter()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed bottom-28 left-0 right-0 z-40 flex justify-center px-6">
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {ACTIONS.map((action, i) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, y: 30, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ delay: i * 0.07, type: 'spring', stiffness: 400, damping: 28 }}
                    onClick={() => { router.push(action.href); onClose() }}
                    className="flex items-center gap-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl rounded-2xl px-5 py-4 text-left active:scale-95 transition-all hover:border-emerald-500/50"
                  >
                    <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" strokeWidth={2.25} />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">{action.label}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{action.sublabel}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
