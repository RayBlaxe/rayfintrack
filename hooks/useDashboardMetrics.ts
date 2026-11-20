'use client'

import { useMemo } from 'react'
import { Account, Asset, BudgetWithSpending, Transaction, DashboardMetrics } from '@/types'
import { CREDIT_CARD_ACCOUNTS } from '@/lib/constants'
import { getDaysRemainingInMonth } from '@/lib/formatters'

/**
 * useDashboardMetrics
 * Computes dashboard financial indicators.
 * Net Worth formula is consistent with Dompet (NetWorthHero):
 *   Net Worth = Liquid Assets + Non-Liquid Assets - CC Debt
 */
export function useDashboardMetrics(
  accounts: Account[],
  budgets: BudgetWithSpending[],
  transactions: Transaction[],
  date: Date = new Date(),
  assets: Asset[] = []
): DashboardMetrics {
  return useMemo(() => {
    // Net Worth calculation consistent with NetWorthHero:
    // 1. Liquid Assets: all non-credit-card accounts
    const liquidAssets = accounts
      .filter((a) => !CREDIT_CARD_ACCOUNTS.includes(a.account_name))
      .reduce((sum, a) => sum + a.current_balance, 0)

    // 2. CC Debt: absolute negative balance of credit card accounts
    const ccDebt = accounts
      .filter((a) => CREDIT_CARD_ACCOUNTS.includes(a.account_name))
      .reduce((sum, a) => sum + Math.abs(Math.min(a.current_balance, 0)), 0)

    // 3. Asset Value: total value of tracked non-liquid/tangible assets
    const assetValue = (assets || []).reduce((sum, a) => sum + (Number(a.value) || 0), 0)

    // Total Net Worth
    const netWorth = liquidAssets + assetValue - ccDebt

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
      assetValue,
      totalExpenseThisMonth,
      totalIncomeThisMonth,
      totalBudgetThisMonth,
      budgetRemaining,
      daysRemainingInMonth,
      safeToSpendDaily,
    }
  }, [accounts, budgets, transactions, date, assets])
}
