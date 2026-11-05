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
import { MonthPicker } from '@/components/shared/MonthPicker'
import { useAccounts } from '@/hooks/useAccounts'
import { useBudgets } from '@/hooks/useBudgets'
import { useGoals } from '@/hooks/useGoals'
import { useTransactions } from '@/hooks/useTransactions'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { useDailyExpenses } from '@/hooks/useDailyExpenses'
import { useDailyBudgetSettings } from '@/hooks/useDailyBudgetSettings'
import { NEEDS_CATEGORIES, WANTS_CATEGORIES } from '@/lib/constants'
import { compute503020, computeFinancialHealthScore } from '@/lib/financialEngine'
import { getPersonalLiabilities } from '@/lib/liabilities'

export default function DashboardPage() {
  const [date, setDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { accounts, refetch: refetchAccounts } = useAccounts()
  const { budgets, refetch: refetchBudgets } = useBudgets(date)
  const { goals } = useGoals()
  const { transactions, refetch: refetchTransactions } = useTransactions({ date, limit: 200 })
  const { dailyExpenses } = useDailyExpenses(date)
  const { settings: dailySettings } = useDailyBudgetSettings()
  const metrics = useDashboardMetrics(accounts, budgets as any, transactions, date)

  // Today's figures (WIB timezone)
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' })
  }, [])
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

  // Categorized expenses
  const expenseOnly = useMemo(() => transactions.filter(t => t.flow_type === 'EXPENSE'), [transactions])
  const needsTotal  = useMemo(() => expenseOnly.filter(t => NEEDS_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0), [expenseOnly])
  const wantsTotal  = useMemo(() => expenseOnly.filter(t => WANTS_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0), [expenseOnly])

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  // 50/30/20 calculation with Hybrid Baseline Denominator (B_eff)
  const budget503020 = useMemo(() => {
    return compute503020(
      needsTotal,
      wantsTotal,
      metrics.totalBudgetThisMonth,
      metrics.totalIncomeThisMonth,
      date.getDate(),
      daysInMonth
    )
  }, [needsTotal, wantsTotal, metrics.totalBudgetThisMonth, metrics.totalIncomeThisMonth, date, daysInMonth])

  // Budget discipline score (0–100)
  const budgetDiscipline = useMemo(() =>
    budget503020.effectiveBaseline > 0
      ? Math.max(100 - Math.max((metrics.totalExpenseThisMonth / budget503020.effectiveBaseline) * 100 - 100, 0), 0)
      : 50
  , [metrics.totalExpenseThisMonth, budget503020.effectiveBaseline])

  // Active Personal Debt (Josep etc.)
  const personalDebts = useMemo(() => {
    if (typeof window === 'undefined') return 100000
    const list = getPersonalLiabilities()
    return list.filter(l => l.status === 'ACTIVE').reduce((s, l) => s + l.remaining_amount, 0)
  }, [])

  // 4-Pillar Composite Financial Health Score
  const healthResult = useMemo(() => {
    return computeFinancialHealthScore(
      needsTotal,
      wantsTotal,
      metrics.totalExpenseThisMonth,
      budget503020.effectiveBaseline,
      metrics.liquidAssets,
      metrics.ccDebt,
      personalDebts,
      14779200 // Total non-liquid assets (MacBook 14jt + Stock equity 779k)
    )
  }, [
    needsTotal,
    wantsTotal,
    metrics.totalExpenseThisMonth,
    budget503020.effectiveBaseline,
    metrics.liquidAssets,
    metrics.ccDebt,
    personalDebts,
  ])

  // Filtered transactions by calendar click
  const filteredTransactions = useMemo(() =>
    selectedDate
      ? transactions.filter(t => t.transaction_date === selectedDate)
      : transactions.slice(0, 10)
  , [transactions, selectedDate])

  function handleRefreshAll() {
    refetchAccounts()
    refetchBudgets()
    refetchTransactions()
  }

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

        {/* Month navigation */}
        <div className="px-5 flex justify-end -mt-2 mb-1">
          <MonthPicker date={date} onChange={setDate} />
        </div>

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
            savingsAmount={budget503020.savingsAmount}
            totalIncome={metrics.totalIncomeThisMonth}
            daysInMonth={daysInMonth}
            currentDay={date.getDate()}
            totalBudgetLimit={metrics.totalBudgetThisMonth}
            effectiveBaseline={budget503020.effectiveBaseline}
            baselineSource={budget503020.baselineSource}
            needsPacingStatus={budget503020.needsPacingStatus}
            onRefresh={handleRefreshAll}
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
            savingsRate={budget503020.savingsPctOfBaseline}
            budgetDiscipline={budgetDiscipline}
            liquidAssets={metrics.liquidAssets}
            avgMonthlyExpense={budget503020.effectiveBaseline}
            compositeScore={healthResult.score}
            compositeLabel={healthResult.label}
            compositeColor={healthResult.color}
            compositeBg={healthResult.bg}
            scoreBreakdown={healthResult.breakdown}
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
