export type FlowType = 'EXPENSE' | 'INCOME' | 'TRANSFER_INTERNAL'

export type AccountName =
  | 'BCA' | 'CIMB_NIAGA' | 'CIMB_OCTO_PAY' | 'SEABANK'
  | 'SHOPEEPAY' | 'GOPAY' | 'DANA' | 'CASH' | 'MEGA_SYARIAH' | 'OTHER'

export type GoalCategory = 'EMERGENCY' | 'ASSET' | 'DREAM' | 'EDUCATION' | 'TRAVEL' | 'OTHER'
export type AssetType = 'LIKUID' | 'TETAP' | 'INVESTASI'

export interface Account {
  id: string
  account_name: AccountName
  current_balance: number
  updated_at: string
}

export interface Budget {
  id: string
  month_year: string
  category: string
  limit_amount: number
}

export interface Transaction {
  id: string
  transaction_date: string
  source_account: AccountName
  destination_account: AccountName | null
  flow_type: FlowType
  category: string
  subcategory: string | null
  amount: number
  merchant_name: string | null
  description: string
  created_at?: string
  raw_prompt?: string
}

export interface BudgetWithSpending extends Budget {
  spent: number
  remaining: number
  pct: number
}

export interface DashboardMetrics {
  netWorth: number
  liquidAssets: number
  ccDebt: number
  totalExpenseThisMonth: number
  totalIncomeThisMonth: number
  totalBudgetThisMonth: number
  budgetRemaining: number
  daysRemainingInMonth: number
  safeToSpendDaily: number | null
}

export interface CategorySpending {
  category: string
  amount: number
}

// ── New types ─────────────────────────────────────────────

export interface Goal {
  id: string
  title: string
  target_amount: number
  current_amount: number
  deadline: string | null
  category: GoalCategory
  icon: string
  is_achieved: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  asset_name: string
  asset_type: AssetType
  value: number
  account_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Record<dateString, totalExpense>
export type DailyExpenseMap = Record<string, number>

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  type: 'TEXT' | 'TRANSACTION'
  content: string
  draft?: TransactionDraft
  timestamp: Date
  saved?: boolean
  saving?: boolean
}

export interface TransactionDraft {
  description: string
  amount: number
  category: string
  source_account: string
  flow_type: FlowType
  transaction_date: string
  merchant_name: string | null
}

export interface ScanResult {
  merchant_name: string | null
  amount: number
  category: string
  transaction_date: string
  description: string
  source_account: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}
