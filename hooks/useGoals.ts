'use client'
import { useCallback, useEffect, useState } from 'react'
import { Goal } from '@/types'
import { fetchGoals } from '@/lib/queries'
import { subscribeToRefresh } from '@/lib/realtimeEvents'

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchGoals()
      setGoals(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const unsub = subscribeToRefresh(load)
    return unsub
  }, [load])

  return { goals, loading, error, refetch: load }
}
