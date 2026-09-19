'use client'

import { useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { triggerRefresh } from '@/lib/realtimeEvents'

/**
 * Subscribe to Supabase Realtime postgres_changes events.
 * When the Telegram bot inserts a new transaction or updates an account balance,
 * this component calls triggerRefresh() which notifies all hooks to refetch.
 *
 * NOTE: Supabase Realtime must be enabled for the 'transactions' and 'accounts' tables.
 * Run in Supabase SQL Editor:
 *   ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
 *   ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseClient>['channel']> | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          triggerRefresh()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'accounts' },
        () => {
          triggerRefresh()
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Connected to dashboard channel')
        }
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <>{children}</>
}
