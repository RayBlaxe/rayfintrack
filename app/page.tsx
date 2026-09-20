'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { RealtimeProvider } from '@/components/dashboard/RealtimeProvider'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { HeroCard } from '@/components/dashboard/HeroCard'
import { DailyBudgetCard } from '@/components/dashboard/DailyBudgetCard'
import { MenuGrid } from '@/components/dashboard/MenuGrid'
import { NeedsWantsSavings } from '@/components/dashboard/NeedsWantsSavings'
import { CalendarHeatmap } from '@/components/dashboard/CalendarHeatmap'
import { HealthScore } from '@/components/dashboard/HealthScore'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { useBudgets } from '@/hooks/useBudgets'
import { useGoals } from '@/hooks/useGoals'
import { useTransactions } from '@/hooks/useTransactions'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { useDailyExpenses } from '@/hooks/useDailyExpenses'
import { useDailyBudgetSettings } from '@/hooks/useDailyBudgetSettings'
import { NEEDS_CATEGORIES, WANTS_CATEGORIES } from '@/lib/constants'

export default function DashboardPage() {
  const [date] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { accounts } = useAccounts()
  const { budgets } = useBudgets(date)
  const { goals } = useGoals()
  const { transactions } = useTransactions({ date, limit: 200 })
  const { dailyExpenses } = useDailyExpenses(date)
  const { settings: dailySettings } = useDailyBudgetSettings()
  const metrics = useDashboardMetrics(accounts, budgets as any, transactions, date)

  // Today's figures
  const todayStr = new Date().toISOString().split('T')[0]
  const todayExpense = useMemo(() =>
    transactions
      .filter(t => t.transaction_date === todayStr && t.flow_type === 'EXPENSE')
      .reduce((s, t) => s + t.amount, 0)
  , [transactions, todayStr])

  const todayIncome = useMemo(() =>
    transactions
      .filter(t => t.transaction_date === todayStr && t.flow_type === 'INCOME')
      .reduce((s, t) => s + t.amount, 0)
  , [transactions, todayStr])

  // Food spending today
  const todayFoodExpense = useMemo(() =>
    transactions
      .filter(t => t.transaction_date === todayStr && t.flow_type === 'EXPENSE' && t.category === 'Makanan & Minuman')
      .reduce((s, t) => s + t.amount, 0)
  , [transactions, todayStr])

  // 50/30/20 split
  const expenseOnly = useMemo(() => transactions.filter(t => t.flow_type === 'EXPENSE'), [transactions])
  const needsTotal  = useMemo(() => expenseOnly.filter(t => NEEDS_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0), [expenseOnly])
  const wantsTotal  = useMemo(() => expenseOnly.filter(t => WANTS_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0), [expenseOnly])
  const savingsTotal = useMemo(() => Math.max(metrics.totalIncomeThisMonth - metrics.totalExpenseThisMonth, 0), [metrics])

  // Budget discipline score (0–100)
  const budgetDiscipline = useMemo(() =>
    metrics.totalBudgetThisMonth > 0
      ? Math.max(100 - Math.max((metrics.totalExpenseThisMonth / metrics.totalBudgetThisMonth) * 100 - 100, 0), 0)
      : 50
  , [metrics])

  const savingsRate = useMemo(() =>
    metrics.totalIncomeThisMonth > 0
      ? ((metrics.totalIncomeThisMonth - metrics.totalExpenseThisMonth) / metrics.totalIncomeThisMonth) * 100
      : 0
  , [metrics])

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  // Filtered transactions by calendar click
  const filteredTransactions = useMemo(() =>
    selectedDate
      ? transactions.filter(t => t.transaction_date === selectedDate)
      : transactions.slice(0, 10)
  , [transactions, selectedDate])

  return (
    <RealtimeProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-5 pb-8"
      >
        <DashboardHeader
          budgets={budgets}
          accounts={accounts}
          goals={goals}
          todayFoodExpense={todayFoodExpense}
          foodDailyLimit={dailySettings.foodDailyLimit}
          safeToSpendDaily={metrics.safeToSpendDaily ?? 0}
        />

        <HeroCard
          safeToSpendDaily={metrics.safeToSpendDaily ?? 0}
          todayExpense={todayExpense}
          todayIncome={todayIncome}
          monthExpense={metrics.totalExpenseThisMonth}
          monthIncome={metrics.totalIncomeThisMonth}
        />

        {/* Daily Budget Tracker Widget */}
        <div className="px-5">
          <DailyBudgetCard
            todayFoodExpense={todayFoodExpense}
            todayTotalExpense={todayExpense}
            safeToSpendDaily={metrics.safeToSpendDaily ?? 0}
          />
        </div>

        <MenuGrid />

        <div className="px-5">
          <NeedsWantsSavings
            needsAmount={needsTotal}
            wantsAmount={wantsTotal}
            savingsAmount={savingsTotal}
            totalIncome={metrics.totalIncomeThisMonth}
            daysInMonth={daysInMonth}
            currentDay={date.getDate()}
          />
        </div>

        <div className="px-5">
          <CalendarHeatmap
            year={date.getFullYear()}
            month={date.getMonth() + 1}
            dailyExpenses={dailyExpenses}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        <div className="px-5">
          <HealthScore
            netWorth={metrics.netWorth}
            savingsRate={savingsRate}
            budgetDiscipline={budgetDiscipline}
            liquidAssets={metrics.liquidAssets}
            avgMonthlyExpense={metrics.totalExpenseThisMonth || 1}
          />
        </div>

        <div className="px-5">
          <RecentTransactions
            transactions={filteredTransactions}
          />
        </div>
      </motion.div>
    </RealtimeProvider>
  )
}
