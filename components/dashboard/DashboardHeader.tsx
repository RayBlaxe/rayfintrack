'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { NotificationModal } from './NotificationModal'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { BudgetWithSpending, Account, Goal } from '@/types'

interface Props {
  budgets?: BudgetWithSpending[]
  accounts?: Account[]
  goals?: Goal[]
  todayFoodExpense?: number
  foodDailyLimit?: number
  safeToSpendDaily?: number
}

function getGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours()
  if (h < 5)  return { text: 'Selamat malam',  emoji: '🌙' }
  if (h < 11) return { text: 'Selamat pagi',   emoji: '☀️' }
  if (h < 15) return { text: 'Selamat siang',  emoji: '🌤️' }
  if (h < 19) return { text: 'Selamat sore',   emoji: '🌅' }
  return       { text: 'Selamat malam',  emoji: '🌙' }
}

export function DashboardHeader({
  budgets = [],
  accounts = [],
  goals = [],
  todayFoodExpense = 0,
  foodDailyLimit = 50000,
  safeToSpendDaily = 0,
}: Props) {
  const { text, emoji } = getGreeting()
  const { user } = useAuth()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const displayName = user?.username || process.env.NEXT_PUBLIC_USER_NAME || 'Ray'

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-8 pb-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            {text} {emoji}
          </p>
          <h1 className="text-slate-900 dark:text-slate-50 text-xl font-bold mt-0.5 tracking-tight">Halo, {displayName}!</h1>
        </motion.div>

        <div className="flex items-center gap-2">
          {/* Dark/light toggle */}
          <ThemeToggle size="md" />

          {/* Notification bell */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setNotificationOpen(true)}
            aria-label="Lihat notifikasi"
            className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-xs transition-colors relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 pulse-dot" />
            )}
          </motion.button>
        </div>
      </header>

      <NotificationModal
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        budgets={budgets}
        accounts={accounts}
        goals={goals}
        todayFoodExpense={todayFoodExpense}
        foodDailyLimit={foodDailyLimit}
        safeToSpendDaily={safeToSpendDaily}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  )
}
