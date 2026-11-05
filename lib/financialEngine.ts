/**
 * lib/financialEngine.ts
 * Quantitative Financial Engine for RayFin:
 * - Hybrid Baseline Denominator (B_eff) for 50/30/20 to prevent naive early-month cashflow timing mismatches
 * - Time-pacing analysis (Day of month vs budget consumption)
 * - 4-Pillar Composite Financial Health Score (0-100)
 */

export interface Budget503020Result {
  effectiveBaseline: number
  baselineSource: 'USER_TARGET' | 'BUDGET_SUM' | 'REALIZED_INCOME' | 'DEFAULT'
  needsAmount: number
  wantsAmount: number
  savingsAmount: number
  needsTarget: number
  wantsTarget: number
  savingsTarget: number
  needsPctOfBaseline: number
  wantsPctOfBaseline: number
  savingsPctOfBaseline: number
  timeElapsedPct: number
  needsPacingStatus: 'ON_TRACK' | 'SLIGHTLY_AHEAD' | 'OVERPACING'
  savingsRate: number
  projectedRemainingBudget: number
}

export interface HealthScoreResult {
  score: number
  label: string
  color: string
  bg: string
  breakdown: {
    budgetAdherenceScore: number // max 35
    liquidityScore: number       // max 30
    liabilityScore: number       // max 20
    savingsScore: number         // max 15
  }
}

const SETTINGS_KEY = 'rayfin_financial_settings_v1'

export function getStoredEstimatedIncome(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const val = localStorage.getItem(SETTINGS_KEY)
    if (val) {
      const parsed = JSON.parse(val)
      if (parsed.estimatedMonthlyIncome && !isNaN(Number(parsed.estimatedMonthlyIncome))) {
        return Number(parsed.estimatedMonthlyIncome)
      }
    }
  } catch (e) {
    console.warn('Error reading stored income setting:', e)
  }
  return null
}

export function setStoredEstimatedIncome(amount: number): void {
  if (typeof window === 'undefined') return
  try {
    const payload = {
      estimatedMonthlyIncome: amount,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload))
  } catch (e) {
    console.warn('Error saving income setting:', e)
  }
}

/**
 * Calculates Effective Baseline Denominator (B_eff)
 * Avoids dividing early-month expenses by sparse pre-salary income.
 */
export function getEffectiveBaseline(
  totalBudgetLimit: number,
  realizedIncome: number,
  userEstimatedIncome?: number | null
): { baseline: number; source: 'USER_TARGET' | 'BUDGET_SUM' | 'REALIZED_INCOME' | 'DEFAULT' } {
  const userSetting = userEstimatedIncome ?? getStoredEstimatedIncome()

  if (userSetting && userSetting > 0) {
    const baseline = Math.max(userSetting, realizedIncome)
    return { baseline, source: 'USER_TARGET' }
  }

  if (totalBudgetLimit && totalBudgetLimit > 0) {
    const baseline = Math.max(totalBudgetLimit, realizedIncome)
    return { baseline, source: 'BUDGET_SUM' }
  }

  if (realizedIncome && realizedIncome > 0) {
    return { baseline: realizedIncome, source: 'REALIZED_INCOME' }
  }

  return { baseline: 5000000, source: 'DEFAULT' }
}

/**
 * Evaluates the 50/30/20 Rule against the Effective Baseline
 */
export function compute503020(
  needsAmount: number,
  wantsAmount: number,
  totalBudgetLimit: number,
  realizedIncome: number,
  currentDay: number,
  daysInMonth: number,
  customBaseline?: number
): Budget503020Result {
  const { baseline, source } = customBaseline
    ? { baseline: customBaseline, source: 'USER_TARGET' as const }
    : getEffectiveBaseline(totalBudgetLimit, realizedIncome)

  const effectiveBaseline = baseline > 0 ? baseline : 5000000

  const needsTarget = effectiveBaseline * 0.5
  const wantsTarget = effectiveBaseline * 0.3
  const savingsTarget = effectiveBaseline * 0.2

  const needsPctOfBaseline = (needsAmount / effectiveBaseline) * 100
  const wantsPctOfBaseline = (wantsAmount / effectiveBaseline) * 100

  const totalExpense = needsAmount + wantsAmount
  const projectedRemainingBudget = Math.max(effectiveBaseline - totalExpense, 0)
  const savingsAmount = Math.max(realizedIncome - totalExpense, 0)
  const savingsPctOfBaseline = (savingsAmount / effectiveBaseline) * 100

  // Time-pacing
  const timeElapsedPct = (currentDay / Math.max(daysInMonth, 1)) * 100
  // In the first 10 days, front-loaded bills (kos, listrik, servis) get an extra 20% allowance
  const frontLoadBuffer = currentDay <= 10 ? 20 : 5
  const expectedPaceNeedsPct = (timeElapsedPct * 0.5) + frontLoadBuffer

  let needsPacingStatus: 'ON_TRACK' | 'SLIGHTLY_AHEAD' | 'OVERPACING' = 'ON_TRACK'
  if (needsPctOfBaseline > 50) {
    needsPacingStatus = 'OVERPACING'
  } else if (needsPctOfBaseline > expectedPaceNeedsPct) {
    needsPacingStatus = 'SLIGHTLY_AHEAD'
  }

  // Normalized savings rate (bounded to -100% to +100%)
  const savingsRate = realizedIncome > 0
    ? Math.max(Math.min(((realizedIncome - totalExpense) / realizedIncome) * 100, 100), -100)
    : 0

  return {
    effectiveBaseline,
    baselineSource: source,
    needsAmount,
    wantsAmount,
    savingsAmount,
    needsTarget,
    wantsTarget,
    savingsTarget,
    needsPctOfBaseline,
    wantsPctOfBaseline,
    savingsPctOfBaseline,
    timeElapsedPct,
    needsPacingStatus,
    savingsRate,
    projectedRemainingBudget,
  }
}

/**
 * 4-Pillar Composite Financial Health Score (0–100)
 * 1. Budget & 50/30/20 Adherence: max 35 pts
 * 2. Liquidity & Emergency Runway: max 30 pts
 * 3. Debt & Liability Ratio: max 20 pts
 * 4. Savings & Investment Execution: max 15 pts
 */
export function computeFinancialHealthScore(
  needsAmount: number,
  wantsAmount: number,
  totalExpense: number,
  effectiveBaseline: number,
  liquidAssets: number,
  ccDebt: number,
  totalPersonalDebt: number,
  assetValue: number
): HealthScoreResult {
  // 1. Budget Adherence (35 pts)
  const needsCap = effectiveBaseline * 0.5
  const wantsCap = effectiveBaseline * 0.3
  let budgetScore = 35
  if (needsAmount > needsCap) {
    const overPct = ((needsAmount - needsCap) / needsCap) * 100
    budgetScore -= Math.min(overPct * 0.5, 20)
  }
  if (wantsAmount > wantsCap) {
    const overPct = ((wantsAmount - wantsCap) / wantsCap) * 100
    budgetScore -= Math.min(overPct * 0.4, 15)
  }
  budgetScore = Math.max(Math.round(budgetScore), 5)

  // 2. Liquidity & Runway (30 pts)
  const monthlyExpenseBaseline = Math.max(effectiveBaseline * 0.8, totalExpense, 1)
  const runwayMonths = liquidAssets / monthlyExpenseBaseline
  let liquidityScore = 0
  if (runwayMonths >= 6) liquidityScore = 30
  else if (runwayMonths >= 3) liquidityScore = 24
  else if (runwayMonths >= 1) liquidityScore = 18
  else if (runwayMonths >= 0.5) liquidityScore = 12
  else liquidityScore = Math.max(Math.round(runwayMonths * 20), 4)

  // 3. Debt & Liability Ratio (20 pts)
  const totalDebts = ccDebt + totalPersonalDebt
  const debtRatio = effectiveBaseline > 0 ? totalDebts / (effectiveBaseline * 3) : 1
  let liabilityScore = 20
  if (debtRatio > 0.8) liabilityScore = 6
  else if (debtRatio > 0.5) liabilityScore = 11
  else if (debtRatio > 0.2) liabilityScore = 16
  else liabilityScore = 20

  // 4. Savings & Asset Execution (15 pts)
  let savingsScore = 0
  if (assetValue >= effectiveBaseline * 2) savingsScore = 15
  else if (assetValue >= effectiveBaseline) savingsScore = 12
  else if (assetValue > 0) savingsScore = 8
  else savingsScore = 4

  const totalScore = Math.min(Math.max(budgetScore + liquidityScore + liabilityScore + savingsScore, 0), 100)

  let label = 'PERLU PERBAIKAN'
  let color = '#DC2626'
  let bg = 'rgba(220,38,38,0.12)'

  if (totalScore >= 80) {
    label = 'SANGAT BAGUS'
    color = '#10B981'
    bg = 'rgba(16,185,129,0.12)'
  } else if (totalScore >= 60) {
    label = 'CUKUP BAIK'
    color = '#0D9488'
    bg = 'rgba(13,148,136,0.12)'
  } else if (totalScore >= 40) {
    label = 'WASPADA'
    color = '#D97706'
    bg = 'rgba(217,119,6,0.12)'
  }

  return {
    score: totalScore,
    label,
    color,
    bg,
    breakdown: {
      budgetAdherenceScore: budgetScore,
      liquidityScore,
      liabilityScore,
      savingsScore,
    },
  }
}
