'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, MessageSquare, PenLine, PlusCircle } from 'lucide-react'
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal'

interface Props {
  open: boolean
  onClose: () => void
}

export function FABMenu({ open, onClose }: Props) {
  const router = useRouter()
  const [showManualModal, setShowManualModal] = useState(false)

  const handleActionClick = (action: { type: string; href?: string }) => {
    onClose()
    if (action.type === 'manual') {
      setShowManualModal(true)
    } else if (action.href) {
      router.push(action.href)
    }
  }

  return (
    <>
      <AddTransactionModal
        open={showManualModal}
        onClose={() => setShowManualModal(false)}
      />

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
                <motion.button
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ delay: 0, type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={() => handleActionClick({ type: 'manual' })}
                  className="flex items-center gap-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl rounded-2xl px-5 py-4 text-left active:scale-95 transition-all hover:border-emerald-500/50"
                >
                  <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center flex-shrink-0">
                    <PenLine className="h-5 w-5 text-emerald-700 dark:text-emerald-400" strokeWidth={2.25} />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">Catat Manual</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Input cepat via formulir</p>
                  </div>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ delay: 0.07, type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={() => handleActionClick({ type: 'nav', href: '/scanner' })}
                  className="flex items-center gap-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl rounded-2xl px-5 py-4 text-left active:scale-95 transition-all hover:border-emerald-500/50"
                >
                  <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center flex-shrink-0">
                    <Camera className="h-5 w-5 text-blue-700 dark:text-blue-400" strokeWidth={2.25} />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">Scan Struk</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Ekstrak otomatis nota / invoice</p>
                  </div>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  transition={{ delay: 0.14, type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={() => handleActionClick({ type: 'nav', href: '/advisor' })}
                  className="flex items-center gap-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl rounded-2xl px-5 py-4 text-left active:scale-95 transition-all hover:border-emerald-500/50"
                >
                  <div className="h-11 w-11 rounded-xl bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-purple-700 dark:text-purple-400" strokeWidth={2.25} />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-slate-100 font-bold text-sm">Tanya AI Advisor</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Konsultasi natural & catat via chat</p>
                  </div>
                </motion.button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
