import { getSupabaseClient } from '@/lib/supabase/client'
import { Account, Budget, Transaction, Goal, Asset, DailyExpenseMap, TransactionDraft } from '@/types'
import { getStartOfMonth, getEndOfMonth } from '@/lib/formatters'

export async function fetchAccounts(): Promise<Account[]> {
  const sb = getSupabaseClient()
  const { data, error } = await sb.from('accounts').select('*').order('account_name')
  if (error) throw error
  return data ?? []
}

export async function fetchBudgets(monthYear: string): Promise<Budget[]> {
  const sb = getSupabaseClient()
  const { data, error } = await sb
    .from('budgets').select('*').eq('month_year', monthYear).order('category')
  if (error) throw error
  return data ?? []
}

export async function fetchTransactions(
  startDate: string,
  endDate: string,
  options?: { category?: string; flowType?: string; limit?: number; offset?: number }
): Promise<Transaction[]> {
  const sb = getSupabaseClient()
  let query = sb
    .from('transactions').select('*')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
  if (options?.category)  query = query.eq('category', options.category)
  if (options?.flowType)  query = query.eq('flow_type', options.flowType)
  if (options?.limit)     query = query.limit(options.limit)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchRecentTransactions(limit = 20): Promise<Transaction[]> {
  const sb = getSupabaseClient()
  const { data, error } = await sb
    .from('transactions').select('*')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function fetchCategorySpending(
  startDate: string,
  endDate: string
): Promise<Record<string, number>> {
  const sb = getSupabaseClient()
  const { data, error } = await sb
    .from('transactions').select('category, amount')
    .eq('flow_type', 'EXPENSE')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
  if (error) throw error
  const spending: Record<string, number> = {}
  for (const row of data ?? []) {
    spending[row.category] = (spending[row.category] ?? 0) + Number(row.amount)
  }
  return spending
}

export async function fetchDailyExpenses(
  year: number,
  month: number
): Promise<DailyExpenseMap> {
  const sb = getSupabaseClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  const { data, error } = await sb
    .from('transactions').select('transaction_date, amount')
    .eq('flow_type', 'EXPENSE')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
  if (error) throw error
  const byDay: DailyExpenseMap = {}
  for (const row of data ?? []) {
    byDay[row.transaction_date] = (byDay[row.transaction_date] ?? 0) + Number(row.amount)
  }
  return byDay
}

export async function fetchGoals(): Promise<Goal[]> {
  const sb = getSupabaseClient()
  const { data, error } = await sb
    .from('goals').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchAssets(): Promise<Asset[]> {
  const sb = getSupabaseClient()
  const { data, error } = await sb
    .from('assets').select('*').order('asset_type')
  if (error) throw error
  return data ?? []
}

export async function insertClientTransaction(
  draft: TransactionDraft
): Promise<Transaction> {
  const sb = getSupabaseClient()
  const payload = {
    ...draft,
    source_account: draft.source_account || 'OTHER',
    raw_prompt: '[AI Advisor]',
  }
  const { data, error } = await sb
    .from('transactions').insert(payload).select().single()
  if (error) throw error

  // NOTE: Balance mutation is handled by the PostgreSQL trigger
  // `trg_sync_account_balance`. Manual RPC calls removed to prevent
  // double-counting when the trigger is active.

  return data
}

export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>
): Promise<Transaction> {
  const sb = getSupabaseClient()
  const { data, error } = await sb
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTransactionWithSnapshot(
  id: string
): Promise<Transaction> {
  const sb = getSupabaseClient()
  // 1. Get snapshot first for potential undo
  const { data: snapshot, error: fetchErr } = await sb
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchErr || !snapshot) throw new Error('Transaksi tidak ditemukan')

  // 2. Delete transaction (trigger trg_sync_account_balance will automatically rollback balance in accounts)
  const { error: delErr } = await sb.from('transactions').delete().eq('id', id)
  if (delErr) throw delErr

  return snapshot as Transaction
}

export async function restoreTransaction(
  snapshot: Transaction
): Promise<Transaction> {
  const sb = getSupabaseClient()
  // Re-inserting the snapshot triggers trg_sync_account_balance to apply balance back
  const { data, error } = await sb
    .from('transactions')
    .insert(snapshot)
    .select()
    .single()
  if (error) throw error
  return data as Transaction
}

export async function reconcileAccountBalance(
  accountName: string,
  newBalance: number
): Promise<void> {
  const sb = getSupabaseClient()
  const { error } = await sb
    .from('accounts')
    .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
    .eq('account_name', accountName)
  if (error) throw error
}

export async function insertGoal(goal: {
  title: string
  target_amount: number
  current_amount?: number
  deadline?: string
  category?: string
  icon?: string
}): Promise<Goal> {
  const sb = getSupabaseClient()
  const { data, error } = await sb
    .from('goals').insert(goal).select().single()
  if (error) throw error
  return data
}

export async function updateGoalAmount(id: string, current_amount: number): Promise<void> {
  const sb = getSupabaseClient()
  const { error } = await sb
    .from('goals')
    .update({ current_amount, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteGoal(id: string): Promise<void> {
  const sb = getSupabaseClient()
  const { error } = await sb.from('goals').delete().eq('id', id)
  if (error) throw error
}

export async function insertAsset(asset: {
  asset_name: string
  asset_type: 'LIKUID' | 'TETAP' | 'INVESTASI'
  value: number
  account_id?: string | null
  notes?: string | null
}): Promise<Asset> {
  const sb = getSupabaseClient()
  const { data, error } = await sb
    .from('assets')
    .insert(asset)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAsset(
  id: string,
  updates: Partial<Asset>
): Promise<Asset> {
  const sb = getSupabaseClient()
  const { data, error } = await sb
    .from('assets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAsset(id: string): Promise<void> {
  const sb = getSupabaseClient()
  const { error } = await sb.from('assets').delete().eq('id', id)
  if (error) throw error
}
