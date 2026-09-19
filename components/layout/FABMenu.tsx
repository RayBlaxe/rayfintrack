'use client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MessageSquare, PenLine, Plus } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

const ACTIONS = [
  { icon: PenLine,       label: 'Catat Transaksi', sublabel: 'Input manual', href: '/advisor' },
  { icon: Camera,        label: 'Scan Struk',       sublabel: 'Foto nota/struk', href: '/scanner' },
  { icon: MessageSquare, label: 'Tanya AI Advisor', sublabel: 'Konsultasi keuangan', href: '/advisor' },
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
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
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
                    className="flex items-center gap-4 bg-[#1b3a4b] border border-white/10 rounded-2xl px-5 py-4 text-left active:scale-95 transition-transform"
                  >
                    <div className="h-11 w-11 rounded-xl bg-[#CCFF00] flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-black" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{action.label}</p>
                      <p className="text-white/50 text-xs mt-0.5">{action.sublabel}</p>
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
