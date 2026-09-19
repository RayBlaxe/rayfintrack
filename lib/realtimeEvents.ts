/**
 * Simple pub/sub for cross-component realtime refresh.
 * RealtimeProvider calls triggerRefresh() on Supabase events.
 * Hooks subscribe with subscribeToRefresh().
 */
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribeToRefresh(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function triggerRefresh(): void {
  listeners.forEach((fn) => fn())
}
