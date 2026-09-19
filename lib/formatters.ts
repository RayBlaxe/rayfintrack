export function formatRupiah(amount: number): string {
  const abs = Math.abs(amount)
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs)
  return amount < 0 ? `-${formatted}` : formatted
}

export function formatRupiahCompact(amount: number): string {
  const abs = Math.abs(amount)
  let s: string
  if (abs >= 1_000_000_000) s = `Rp ${(abs / 1_000_000_000).toFixed(1)}M`
  else if (abs >= 1_000_000)  s = `Rp ${(abs / 1_000_000).toFixed(1)}jt`
  else if (abs >= 1_000)      s = `Rp ${Math.round(abs / 1_000)}rb`
  else                        s = `Rp ${abs}`
  return amount < 0 ? `-${s}` : s
}

export function formatRupiahUltraCompact(amount: number): string {
  const abs = Math.abs(amount)
  let s: string
  if (abs >= 1_000_000_000) s = `${(abs / 1_000_000_000).toFixed(1)}M`
  else if (abs >= 1_000_000)  s = `${(abs / 1_000_000).toFixed(1)}JT`
  else if (abs >= 1_000)      s = `${Math.round(abs / 1_000)}RB`
  else                        s = `${abs}`
  return amount < 0 ? `-${s}` : s
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short',
    timeZone: 'Asia/Jakarta',
  })
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    month: 'long', year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

export function getMonthYearKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function getStartOfMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

export function getEndOfMonth(date: Date): string {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

export function getDaysRemainingInMonth(date: Date = new Date()): number {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  return Math.max(lastDay - date.getDate() + 1, 1)
}

export function parseMonthYear(key: string): Date {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1)
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** Returns the first day-of-week (Monday=0, Sunday=6) for a given month */
export function getFirstDayOfWeek(year: number, month: number): number {
  const dow = new Date(year, month - 1, 1).getDay() // 0=Sun
  return dow === 0 ? 6 : dow - 1 // Monday-first
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0]
}

export function deadlineDaysLeft(deadline: string | null): number | null {
  if (!deadline) return null
  const diff = new Date(deadline).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
