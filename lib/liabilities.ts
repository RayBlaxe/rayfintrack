/**
 * lib/liabilities.ts
 * Personal Liabilities & Debt Management:
 * - Tracks personal loans / debts (e.g., Pinjaman Josep Rp 100.000)
 * - Atomic repayment via insertClientTransaction (triggers trg_sync_account_balance to deduct source account balance)
 * - Marks status as PAID with settlement date and transaction link
 */

import { PersonalLiability } from '@/types'
import { insertClientTransaction } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'

const STORAGE_KEY = 'rayfin_personal_liabilities_v1'

const INITIAL_JOSEP_LOAN: PersonalLiability = {
  id: 'liab-josep-100k',
  creditor_name: 'Josep',
  title: 'Pinjaman Dana Masuk BCA',
  principal_amount: 100000,
  remaining_amount: 100000,
  due_date_label: 'Jatuh Tempo: Saat Gajian / PDDN Cair',
  status: 'ACTIVE',
  source_account: 'BCA',
  created_at: '2026-03-27T10:00:00.000Z',
  notes: 'Dana pinjaman masuk ke rekening BCA pada 27 Maret 2026 (RAYFIN-2026-0327). Wajib dilunasi ke Josep saat payroll masuk.',
}

export function getPersonalLiabilities(): PersonalLiability[] {
  if (typeof window === 'undefined') return [INITIAL_JOSEP_LOAN]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // Seed with initial Josep loan
      localStorage.setItem(STORAGE_KEY, JSON.stringify([INITIAL_JOSEP_LOAN]))
      return [INITIAL_JOSEP_LOAN]
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch (e) {
    console.warn('Failed to load personal liabilities:', e)
  }
  return [INITIAL_JOSEP_LOAN]
}

export function savePersonalLiabilities(list: PersonalLiability[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('Failed to save personal liabilities:', e)
  }
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
  const updatedLiability: PersonalLiability = {
    ...liability,
    remaining_amount: newRemaining,
    status: newRemaining === 0 ? 'PAID' : 'ACTIVE',
    settled_at: newRemaining === 0 ? new Date().toISOString() : liability.settled_at,
    notes: `${liability.notes || ''} [Dibayar Rp ${amount.toLocaleString('id-ID')} via ${sourceAccount} pada ${paymentDate}]`.trim(),
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
): PersonalLiability {
  const list = getPersonalLiabilities()
  const newLiability: PersonalLiability = {
    id: `liab-${Date.now()}`,
    creditor_name: creditorName.trim(),
    title: title.trim(),
    principal_amount: amount,
    remaining_amount: amount,
    due_date_label: dueDateLabel?.trim() || 'Fleksibel',
    status: 'ACTIVE',
    source_account: sourceAccount || 'BCA',
    created_at: new Date().toISOString(),
    notes: notes?.trim() || null as any,
  }

  list.unshift(newLiability)
  savePersonalLiabilities(list)
  triggerRefresh()
  return newLiability
}

export function deletePersonalLiability(id: string): void {
  const list = getPersonalLiabilities()
  const filtered = list.filter(l => l.id !== id)
  savePersonalLiabilities(filtered)
  triggerRefresh()
}
