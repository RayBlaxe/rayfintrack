'use client'

import { useCallback, useEffect, useState } from 'react'
import { Transaction } from '@/types'
import { fetchTransactions, fetchRecentTransactions } from '@/lib/queries'
import { subscribeToRefresh } from '@/lib/realtimeEvents'
import { getStartOfMonth, getEndOfMonth } from '@/lib/formatters'

interface UseTransactionsOptions {
  date?: Date
  category?: string
  flowType?: string
  limit?: number
  recent?: boolean // if true, fetch most recent across all months
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { date = new Date(), category, flowType, limit = 20, recent = false } = options

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      let data: Transaction[]
      if (recent) {
        data = await fetchRecentTransactions(limit)
      } else {
        data = await fetchTransactions(getStartOfMonth(date), getEndOfMonth(date), {
          category,
          flowType,
          limit,
        })
      }
      setTransactions(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [date, category, flowType, limit, recent])

  useEffect(() => {
    load()
    const unsub = subscribeToRefresh(load)
    return unsub
  }, [load])

  return { transactions, loading, error, refetch: load }
}
