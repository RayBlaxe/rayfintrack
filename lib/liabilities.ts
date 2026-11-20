/**
 * lib/liabilities.ts
 * Personal Liabilities & Debt Management:
 * - Queries Supabase `personal_liabilities` table first via client with offline localStorage fallback
 * - Tracks personal loans / debts per user account
 * - Atomic repayment via insertClientTransaction (triggers trg_sync_account_balance to deduct source account balance)
 * - Marks status as PAID with settlement date and transaction link
 */

import { PersonalLiability } from '@/types'
import { insertClientTransaction } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'
import { getSupabaseClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'rayfin_personal_liabilities_v1'

export function getPersonalLiabilities(): PersonalLiability[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      // Filter out any legacy hardcoded demo loan
      const cleaned = parsed.filter(item => item.id !== 'liab-josep-100k')
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
      }
      return cleaned
    }
  } catch (e) {
    console.warn('Failed to load personal liabilities from localStorage:', e)
  }
  return []
}

export function savePersonalLiabilities(list: PersonalLiability[]): void {
  if (typeof window === 'undefined') return
  try {
    const cleaned = list.filter(item => item.id !== 'liab-josep-100k')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
  } catch (e) {
    console.warn('Failed to save personal liabilities to localStorage:', e)
  }
}

export async function fetchPersonalLiabilities(): Promise<PersonalLiability[]> {
  try {
    const sb = getSupabaseClient()
    const { data, error } = await sb
      .from('personal_liabilities')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase personal_liabilities error, falling back to localStorage:', error.message)
      return getPersonalLiabilities()
    }

    if (data && Array.isArray(data)) {
      const cleaned = (data as PersonalLiability[]).filter(item => item.id !== 'liab-josep-100k')
      savePersonalLiabilities(cleaned)
      return cleaned
    }
  } catch (err) {
    console.warn('Failed to fetch personal liabilities from Supabase, fallback to localStorage:', err)
  }
  return getPersonalLiabilities()
}

export async function payPersonalLiability(
  liabilityId: string,
  amount: number,
  sourceAccount: string,
  paymentDate: string = new Date().toISOString().slice(0, 10),
  notes?: string
): Promise<{ success: boolean; newRemaining: number; transactionId?: string }> {
  const list = getPersonalLiabilities()
  const idx = list.findIndex(l => l.id === liabilityId)
  if (idx === -1) {
    throw new Error('Data utang personal tidak ditemukan')
  }

  const liability = list[idx]
  if (amount <= 0 || amount > liability.remaining_amount) {
    throw new Error(`Nominal pelunasan tidak valid. Maksimal Rp ${liability.remaining_amount.toLocaleString('id-ID')}`)
  }

  // 1. Record repayment expense transaction in Supabase
  // The PostgreSQL trigger trg_sync_account_balance will automatically deduct the balance from sourceAccount (e.g. BCA)
  const description = `Pelunasan pinjaman ke ${liability.creditor_name}${notes ? ` - ${notes}` : ''}`
  const tx = await insertClientTransaction({
    description,
    amount,
    category: 'Cicilan',
    source_account: sourceAccount,
    flow_type: 'EXPENSE',
    transaction_date: paymentDate,
    merchant_name: liability.creditor_name,
  })

  // 2. Update remaining liability balance and status
  const newRemaining = liability.remaining_amount - amount
  const updatedData = {
    remaining_amount: newRemaining,
    status: (newRemaining === 0 ? 'PAID' : 'ACTIVE') as 'ACTIVE' | 'PAID',
    settled_at: newRemaining === 0 ? new Date().toISOString() : liability.settled_at,
    notes: `${liability.notes || ''} [Dibayar Rp ${amount.toLocaleString('id-ID')} via ${sourceAccount} pada ${paymentDate}]`.trim(),
    updated_at: new Date().toISOString(),
  }

  try {
    const sb = getSupabaseClient()
    await sb.from('personal_liabilities').update(updatedData).eq('id', liabilityId)
  } catch (e) {
    console.warn('Failed to update personal liability in Supabase:', e)
  }

  const updatedLiability: PersonalLiability = {
    ...liability,
    ...updatedData,
  }

  list[idx] = updatedLiability
  savePersonalLiabilities(list)

  // 3. Trigger realtime UI refresh
  triggerRefresh()

  return {
    success: true,
    newRemaining,
    transactionId: tx?.id,
  }
}

export function addPersonalLiability(
  creditorName: string,
  title: string,
  amount: number,
  dueDateLabel?: string,
  sourceAccount?: string,
  notes?: string
): Promise<PersonalLiability> {
  return addPersonalLiabilityAsync(creditorName, title, amount, dueDateLabel, sourceAccount, notes)
}

export async function addPersonalLiabilityAsync(
  creditorName: string,
  title: string,
  amount: number,
  dueDateLabel?: string,
  sourceAccount?: string,
  notes?: string
): Promise<PersonalLiability> {
  const sb = getSupabaseClient()
  let newLiability: PersonalLiability | null = null

  try {
    const { data: { session } } = await sb.auth.getSession()
    if (session?.user?.id) {
      const payload = {
        user_id: session.user.id,
        creditor_name: creditorName.trim(),
        title: title.trim(),
        principal_amount: amount,
        remaining_amount: amount,
        due_date_label: dueDateLabel?.trim() || 'Fleksibel',
        status: 'ACTIVE',
        source_account: sourceAccount || 'BCA',
        notes: notes?.trim() || null,
      }
      const { data, error } = await sb.from('personal_liabilities').insert(payload).select().single()
      if (!error && data) {
        newLiability = data as PersonalLiability
      }
    }
  } catch (err) {
    console.warn('Error saving personal liability to Supabase, fallback to localStorage:', err)
  }

  if (!newLiability) {
    newLiability = {
      id: `liab-${Date.now()}`,
      creditor_name: creditorName.trim(),
      title: title.trim(),
      principal_amount: amount,
      remaining_amount: amount,
      due_date_label: dueDateLabel?.trim() || 'Fleksibel',
      status: 'ACTIVE',
      source_account: sourceAccount || 'BCA',
      created_at: new Date().toISOString(),
      notes: notes?.trim() || undefined,
    }
  }

  const list = getPersonalLiabilities()
  list.unshift(newLiability)
  savePersonalLiabilities(list)
  triggerRefresh()
  return newLiability
}

export async function deletePersonalLiability(id: string): Promise<void> {
  try {
    const sb = getSupabaseClient()
    await sb.from('personal_liabilities').delete().eq('id', id)
  } catch (e) {
    console.warn('Error deleting personal liability from Supabase:', e)
  }
  const list = getPersonalLiabilities()
  const filtered = list.filter(l => l.id !== id)
  savePersonalLiabilities(filtered)
  triggerRefresh()
}
