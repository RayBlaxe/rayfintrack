'use client'

import { useCallback, useEffect, useState } from 'react'
import { Account } from '@/types'
import { fetchAccounts } from '@/lib/queries'
import { subscribeToRefresh } from '@/lib/realtimeEvents'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchAccounts()
      setAccounts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const unsub = subscribeToRefresh(load)
    return unsub
  }, [load])

  return { accounts, loading, error, refetch: load }
}
