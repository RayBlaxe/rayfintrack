'use client'
import { useCallback, useEffect, useState } from 'react'
import { Asset } from '@/types'
import { fetchAssets } from '@/lib/queries'
import { subscribeToRefresh } from '@/lib/realtimeEvents'

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchAssets()
      setAssets(data)
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

  return { assets, loading, error, refetch: load }
}
