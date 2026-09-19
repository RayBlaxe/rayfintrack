'use client'
import { useCallback, useEffect, useState } from 'react'
import { DailyExpenseMap } from '@/types'
import { fetchDailyExpenses } from '@/lib/queries'
import { subscribeToRefresh } from '@/lib/realtimeEvents'

export function useDailyExpenses(date: Date) {
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpenseMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchDailyExpenses(date.getFullYear(), date.getMonth() + 1)
      setDailyExpenses(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    load()
    const unsub = subscribeToRefresh(load)
    return unsub
  }, [load])

  return { dailyExpenses, loading, error, refetch: load }
}
