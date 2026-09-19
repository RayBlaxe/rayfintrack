'use client'

import { useMemo } from 'react'
import { Account, BudgetWithSpending, Transaction } from '@/types'
import { CREDIT_CARD_ACCOUNTS } from '@/lib/constants'
import { getDaysRemainingInMonth } from '@/lib/formatters'
import { DashboardMetrics } from '@/types'

export function useDashboardMetrics(
  accounts: Account[],
  budgets: BudgetWithSpending[],
  transactions: Transaction[],
  date: Date = new Date()
): DashboardMetrics {
  return useMemo(() => {
    // Net Worth
    const liquidAssets = accounts
      .filter((a) => !CREDIT_CARD_ACCOUNTS.includes(a.account_name))
      .reduce((sum, a) => sum + a.current_balance, 0)

    const ccDebt = accounts
      .filter((a) => CREDIT_CARD_ACCOUNTS.includes(a.account_name))
      .reduce((sum, a) => sum + Math.abs(Math.min(a.current_balance, 0)), 0)

    const netWorth = liquidAssets - ccDebt

    // Monthly totals from transactions
    let totalExpenseThisMonth = 0
    let totalIncomeThisMonth = 0
    for (const t of transactions) {
      if (t.flow_type === 'EXPENSE') totalExpenseThisMonth += t.amount
      else if (t.flow_type === 'INCOME') totalIncomeThisMonth += t.amount
    }

    // Budget totals
    const totalBudgetThisMonth = budgets.reduce((sum, b) => sum + b.limit_amount, 0)
    const budgetRemaining = Math.max(totalBudgetThisMonth - totalExpenseThisMonth, 0)
    const daysRemainingInMonth = getDaysRemainingInMonth(date)
    const safeToSpendDaily =
      totalBudgetThisMonth > 0
        ? budgetRemaining / Math.max(daysRemainingInMonth, 1)
        : null

    return {
      netWorth,
      liquidAssets,
      ccDebt,
      totalExpenseThisMonth,
      totalIncomeThisMonth,
      totalBudgetThisMonth,
      budgetRemaining,
      daysRemainingInMonth,
      safeToSpendDaily,
    }
  }, [accounts, budgets, transactions, date])
}
