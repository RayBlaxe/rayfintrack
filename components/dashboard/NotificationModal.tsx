'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Bell, AlertTriangle, CheckCircle2, TrendingDown, Info, ShieldAlert, Sparkles, Volume2 } from 'lucide-react'
import { formatRupiahCompact, formatRupiah } from '@/lib/formatters'
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
          id: `budget-over-${b.id}`,
          type: 'DANGER',
          title: `Overbudget: ${b.category}`,
          message: `Pengeluaran sudah ${formatRupiahCompact(b.spent)} dari batas ${formatRupiahCompact(b.limit_amount)} (${b.pct.toFixed(0)}%).`,
          timestamp: timeStr,
          icon: '🚨',
        })
      } else if (b.pct >= 80) {
        list.push({
          id: `budget-warn-${b.id}`,
          type: 'WARNING',
          title: `Peringatan Anggaran: ${b.category}`,
          message: `Sudah terpakai ${b.pct.toFixed(0)}% dari batas anggaran (${formatRupiahCompact(b.spent)} / ${formatRupiahCompact(b.limit_amount)}).`,
          timestamp: timeStr,
          icon: '⚡',
        })
      }
    })

    // 3. Credit Card Bill
    const ccAccounts = accounts.filter((a) => CREDIT_CARD_ACCOUNTS.includes(a.account_name))
    ccAccounts.forEach((cc) => {
      if (cc.current_balance < 0) {
        list.push({
          id: `cc-bill-${cc.id}`,
          type: 'INFO',
          title: `Tagihan ${cc.account_name}`,
          message: `Total tagihan kartu kredit saat ini: ${formatRupiah(Math.abs(cc.current_balance))}.`,
          timestamp: timeStr,
          icon: '💳',
        })
      }
    })

    // 4. Goals Milestone
    goals.forEach((g) => {
      const pct = (g.current_amount / g.target_amount) * 100
      if (g.is_achieved || pct >= 100) {
        list.push({
          id: `goal-achieved-${g.id}`,
          type: 'SUCCESS',
          title: `Goal Tercapai: ${g.title} 🎉`,
          message: `Selamat! Target tabungan sebesar ${formatRupiahCompact(g.target_amount)} telah sukses terkumpul.`,
          timestamp: timeStr,
          icon: g.icon || '🏆',
        })
      } else if (pct >= 50 && pct < 55) {
        list.push({
          id: `goal-half-${g.id}`,
          type: 'SUCCESS',
          title: `Milestone 50%: ${g.title}`,
          message: `Hebat! Tabungan sudah separuh jalan (${formatRupiahCompact(g.current_amount)} / ${formatRupiahCompact(g.target_amount)}).`,
          timestamp: timeStr,
          icon: g.icon || '🎯',
        })
      }
    })

    // 5. Safe to Spend Recommendation
    if (safeToSpendDaily > 0) {
      list.push({
        id: `safe-to-spend-${now.toISOString().split('T')[0]}`,
        type: 'INFO',
        title: 'Alokasi Aman Belanja Hari Ini',
        message: `Berdasarkan sisa budget bulananmu, kamu aman belanja hingga ${formatRupiah(safeToSpendDaily)} hari ini.`,
        timestamp: timeStr,
        icon: '💡',
      })
    }

    setNotifications(list)

    // Calculate unread
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
            <DialogTitle className="flex items-center gap-2 text-white">
              <Bell className="h-4 w-4 text-[#CCFF00]" />
              <span>Notifikasi & Insight</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#CCFF00] text-black text-[10px] font-extrabold">
                  {unreadCount}
                </span>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-[#CCFF00] hover:underline font-semibold"
              >
                Tandai dibaca
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Browser notification prompt */}
        {browserPermission !== 'granted' && (
          <div className="p-3 bg-white/5 border border-white/8 rounded-2xl flex items-center justify-between gap-3 text-xs text-white/80 my-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-[#CCFF00] flex-shrink-0" />
              <span className="text-[11px]">Aktifkan notifikasi browser</span>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-2.5 py-1 rounded-xl bg-[#CCFF00] text-black text-[10px] font-bold hover:opacity-90 flex-shrink-0"
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
              <p className="text-sm font-semibold text-white">Semua Terkendali!</p>
              <p className="text-xs text-white/40">Belum ada peringatan finansial hari ini.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = readIds.includes(n.id)
              const badgeColors = {
                DANGER: 'bg-[#FF85A1]/15 text-[#FF85A1] border-[#FF85A1]/30',
                WARNING: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
                SUCCESS: 'bg-[#CCFF00]/15 text-[#CCFF00] border-[#CCFF00]/30',
                INFO: 'bg-cyan-400/15 text-cyan-400 border-cyan-400/30',
              }

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isRead
                      ? 'bg-white/3 border-white/5 opacity-70'
                      : 'bg-white/8 border-white/10 shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">{n.title}</p>
                        {!isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-white/70 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-white/30 pt-0.5">{n.timestamp}</p>
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
