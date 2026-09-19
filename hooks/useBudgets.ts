'use client'

import { useCallback, useEffect, useState } from 'react'
import { Budget, BudgetWithSpending } from '@/types'
import { fetchBudgets, fetchCategorySpending } from '@/lib/queries'
import { subscribeToRefresh } from '@/lib/realtimeEvents'
import { getMonthYearKey, getStartOfMonth, getEndOfMonth } from '@/lib/formatters'

export function useBudgets(date: Date) {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const monthYear = getMonthYearKey(date)
      const startDate = getStartOfMonth(date)
      const endDate = getEndOfMonth(date)

      const [rawBudgets, spending] = await Promise.all([
        fetchBudgets(monthYear),
        fetchCategorySpending(startDate, endDate),
      ])

      const enriched: BudgetWithSpending[] = rawBudgets.map((b) => {
        const spent = spending[b.category] ?? 0
        const remaining = b.limit_amount - spent
        const pct = b.limit_amount > 0 ? (spent / b.limit_amount) * 100 : 0
        return { ...b, spent, remaining, pct }
      })

      setBudgets(enriched.sort((a, b) => b.pct - a.pct))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    load()
    const unsub = subscribeToRefresh(load)
    return unsub
  }, [load])

  return { budgets, loading, error, refetch: load }
}
