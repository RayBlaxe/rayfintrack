import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config'

let _client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!_client) {
    _client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _client
}
