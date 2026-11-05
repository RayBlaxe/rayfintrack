'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Bell, Volume2 } from 'lucide-react'
import { formatRupiah } from '@/lib/formatters'
import { BudgetWithSpending, Account, Goal } from '@/types'
import { CREDIT_CARD_ACCOUNTS } from '@/lib/constants'

export interface FinancialNotification {
  id: string
  type: 'DANGER' | 'WARNING' | 'SUCCESS' | 'INFO'
  title: string
  message: string
  timestamp: string
  icon: string
}

interface Props {
  open: boolean
  onClose: () => void
  budgets: BudgetWithSpending[]
  accounts: Account[]
  goals: Goal[]
  todayFoodExpense: number
  foodDailyLimit: number
  safeToSpendDaily: number
  onUnreadCountChange?: (count: number) => void
}

const READ_KEY = 'rayfin_read_notifications'

export function NotificationModal({
  open,
  onClose,
  budgets,
  accounts,
  goals,
  todayFoodExpense,
  foodDailyLimit,
  safeToSpendDaily,
  onUnreadCountChange,
}: Props) {
  const [readIds, setReadIds] = useState<string[]>([])
  const [notifications, setNotifications] = useState<FinancialNotification[]>([])
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default')

  // Check browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  // Load read notification IDs
  useEffect(() => {
    try {
      const stored = localStorage.getItem(READ_KEY)
      if (stored) {
        setReadIds(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Generate dynamic alerts based on live data
  useEffect(() => {
    const list: FinancialNotification[] = []
    const now = new Date()
    const timeStr = 'Hari ini'

    // 1. Food Daily Limit Alert
    if (foodDailyLimit > 0 && todayFoodExpense > 0) {
      if (todayFoodExpense > foodDailyLimit) {
        list.push({
          id: `food-over-${now.toISOString().split('T')[0]}`,
          type: 'DANGER',
          title: 'Limit Harian Makanan Terlampaui!',
          message: `Pengeluaran makan hari ini ${formatRupiah(todayFoodExpense)}, melewati target ${formatRupiah(foodDailyLimit)}/hari (lebih ${formatRupiah(todayFoodExpense - foodDailyLimit)}).`,
          timestamp: timeStr,
          icon: '🍔',
        })
      } else if (todayFoodExpense / foodDailyLimit >= 0.8) {
        list.push({
          id: `food-warn-${now.toISOString().split('T')[0]}`,
          type: 'WARNING',
          title: 'Mendekati Limit Makan Hari Ini',
          message: `Sudah terpakai ${formatRupiah(todayFoodExpense)} dari limit harian ${formatRupiah(foodDailyLimit)}. Sisa alokasi ${formatRupiah(foodDailyLimit - todayFoodExpense)}.`,
          timestamp: timeStr,
          icon: '⚠️',
        })
      }
    }

    // 2. Overbudget Categories (Monthly)
    budgets.forEach((b) => {
      if (b.pct >= 100) {
        list.push({
          id: `budget-over-${b.category}`,
          type: 'DANGER',
          title: `Overbudget: ${b.category}`,
          message: `Pengeluaran sudah mencapai ${formatRupiah(b.spent)} dari pagu ${formatRupiah(b.limit_amount)}. Melebihi pagu sebesar ${formatRupiah(b.spent - b.limit_amount)}.`,
          timestamp: 'Bulan ini',
          icon: '🚨',
        })
      } else if (b.pct >= 85) {
        list.push({
          id: `budget-warn-${b.category}`,
          type: 'WARNING',
          title: `Mendekati Limit: ${b.category}`,
          message: `Sudah terpakai ${b.pct.toFixed(0)}% (${formatRupiah(b.spent)} dari ${formatRupiah(b.limit_amount)}). Sisa ${formatRupiah(b.remaining)}.`,
          timestamp: 'Bulan ini',
          icon: '⚠️',
        })
      }
    })

    // 3. Safe to Spend Warning
    if (safeToSpendDaily < 0) {
      list.push({
        id: 'safe-to-spend-negative',
        type: 'DANGER',
        title: 'Anggaran Bulanan Sudah Habis',
        message: 'Pengeluaran bulan ini telah melampaui seluruh pagu anggaran belanja. Disarankan rem pengeluaran non-primer.',
        timestamp: timeStr,
        icon: '🛑',
      })
    }

    // 4. CC Debt
    const ccTotal = accounts
      .filter((a) => CREDIT_CARD_ACCOUNTS.includes(a.account_name))
      .reduce((sum, a) => sum + Math.abs(Math.min(a.current_balance, 0)), 0)

    if (ccTotal > 0) {
      list.push({
        id: 'cc-debt-reminder',
        type: 'INFO',
        title: 'Pengingat Tagihan Kartu Kredit',
        message: `Total saldo terutang kartu kredit aktif saat ini: ${formatRupiah(ccTotal)}. Pastikan bayar sebelum tanggal jatuh tempo.`,
        timestamp: timeStr,
        icon: '💳',
      })
    }

    setNotifications(list)

    const unread = list.filter((n) => !readIds.includes(n.id)).length
    onUnreadCountChange?.(unread)
  }, [budgets, accounts, goals, todayFoodExpense, foodDailyLimit, safeToSpendDaily, readIds, onUnreadCountChange])

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id)
    setReadIds(allIds)
    localStorage.setItem(READ_KEY, JSON.stringify(allIds))
    onUnreadCountChange?.(0)
  }

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission()
      setBrowserPermission(perm)
      if (perm === 'granted') {
        new Notification('RayFin Notifications Aktif! ✨', {
          body: 'Kamu akan menerima peringatan keuangan langsung di perangkat ini.',
          icon: '/icons/icon-192x192.png',
        })
      }
    }
  }

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm max-h-[85vh] flex flex-col p-5">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50 font-bold">
              <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Notifikasi & Insight</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 text-[10px] font-extrabold">
                  {unreadCount}
                </span>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
              >
                Tandai dibaca
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Browser notification prompt */}
        {browserPermission !== 'granted' && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-800 dark:text-slate-200 my-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[11px] font-medium">Aktifkan notifikasi browser</span>
            </div>
            <button
              type="button"
              onClick={handleRequestPermission}
              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-[10px] font-bold shadow-xs flex-shrink-0 transition-colors"
            >
              Izinkan
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1 scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-3xl">✨</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Semua Terkendali!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada peringatan finansial hari ini.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = readIds.includes(n.id)

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isRead
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-600 dark:border-l-emerald-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                        {!isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 pt-0.5">{n.timestamp}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
