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

  // Mutate account balance atomically via RPC
  try {
    const amount = Number(draft.amount)
    if (draft.flow_type === 'EXPENSE') {
      await sb.rpc('mutate_balance', { p_account_name: draft.source_account, p_delta: -amount })
    } else if (draft.flow_type === 'INCOME') {
      await sb.rpc('mutate_balance', { p_account_name: draft.source_account, p_delta: amount })
    } else if (draft.flow_type === 'TRANSFER_INTERNAL') {
      await sb.rpc('mutate_balance', { p_account_name: draft.source_account, p_delta: -amount })
      if (draft.destination_account) {
        await sb.rpc('mutate_balance', { p_account_name: draft.destination_account, p_delta: amount })
      }
    }
  } catch (e) {
    console.warn('Balance mutation failed:', e)
  }

  return data
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

export async function deleteAsset(id: string): Promise<void> {
  const sb = getSupabaseClient()
  const { error } = await sb.from('assets').delete().eq('id', id)
  if (error) throw error
}
