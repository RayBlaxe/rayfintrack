// lib/constants.ts
import { AccountName } from '@/types'

export const ACCOUNT_LABELS: Record<string, string> = {
  BCA: 'BCA',
  CIMB_NIAGA: 'CIMB Niaga',
  CIMB_OCTO_PAY: 'CIMB OCTO Pay',
  SEABANK: 'SeaBank',
  SHOPEEPAY: 'ShopeePay',
  GOPAY: 'GoPay',
  DANA: 'DANA',
  CASH: 'Tunai',
  MEGA_SYARIAH: 'KK Mega Syariah',
  HONEST_CARD: 'KK Honest Card (MacBook)',
  STOCKBIT: 'RDN Stockbit',
  'E-WALLET': 'E-Wallet (Other)',
  OTHER: 'Lainnya',
}

export const ACCOUNT_LOGOS: Record<string, string> = {
  BCA: '🏦',
  CIMB_NIAGA: '🏦',
  CIMB_OCTO_PAY: '💳',
  SEABANK: '🌊',
  SHOPEEPAY: '🛍️',
  GOPAY: '🟢',
  DANA: '💙',
  CASH: '💵',
  MEGA_SYARIAH: '💜',
  HONEST_CARD: '🍎',
  STOCKBIT: '📈',
  'E-WALLET': '📱',
  OTHER: '🏛️',
}

export const ACCOUNT_COLORS: Record<string, string> = {
  BCA: '#005BAA',
  CIMB_NIAGA: '#CC0000',
  CIMB_OCTO_PAY: '#CC0000',
  SEABANK: '#00A0E3',
  SHOPEEPAY: '#EE4D2D',
  GOPAY: '#00AA5B',
  DANA: '#108EE9',
  CASH: '#6B7280',
  MEGA_SYARIAH: '#9333EA',
  HONEST_CARD: '#E11D48',
  STOCKBIT: '#10B981',
  'E-WALLET': '#f59e0b',
  OTHER: '#94A3B8',
}

// PENTING: Kedua kartu kredit wajib masuk ke sini agar ccDebt & Net Worth akurat!
export const CREDIT_CARD_ACCOUNTS: AccountName[] = ['MEGA_SYARIAH', 'HONEST_CARD']

// ── Category emojis ───────────────────────────────────────────────────────────
export const CATEGORY_EMOJI: Record<string, string> = {
  'Makanan & Minuman': '🍜',
  'Transportasi': '🚗',
  'Belanja': '🛍️',
  'Hiburan': '🎮',
  'Kesehatan': '💊',
  'Pendidikan': '📚',
  'Tagihan & Utilitas': '💡',
  'Investasi': '📈',
  'Tabungan': '🏦',
  'Pemasukan': '💰',
  'Transfer': '↔️',
  'Gaji': '💼',
  'Bisnis': '🏢',
  'Asuransi': '🛡️',
  'Olahraga': '🏋️',
  'Perawatan Diri': '💆',
  'Rumah Tangga': '🏠',
  'Elektronik': '📱',
  'Pakaian': '👕',
  'Hadiah & Donasi': '🎁',
  'Perjalanan': '✈️',
  'Cicilan': '💳',
  'Lainnya': '📦',
}

// ── Category colors (for charts) ─────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  'Makanan & Minuman': '#FF6B6B',
  'Transportasi': '#4ECDC4',
  'Belanja': '#45B7D1',
  'Hiburan': '#96CEB4',
  'Kesehatan': '#FFEAA7',
  'Pendidikan': '#DDA0DD',
  'Tagihan & Utilitas': '#98D8C8',
  'Investasi': '#CCFF00',
  'Tabungan': '#98FB98',
  'Pemasukan': '#87CEEB',
  'Transfer': '#D3D3D3',
  'Gaji': '#7BC8A4',
  'Bisnis': '#F4A460',
  'Asuransi': '#B0C4DE',
  'Olahraga': '#FF8C00',
  'Perawatan Diri': '#FFB6C1',
  'Rumah Tangga': '#DEB887',
  'Elektronik': '#778899',
  'Pakaian': '#20B2AA',
  'Hadiah & Donasi': '#FF69B4',
  'Perjalanan': '#00CED1',
  'Cicilan': '#FF4500',
  'Lainnya': '#94A3B8',
}

// ── 50/30/20 rule category buckets ───────────────────────────────────────────
export const NEEDS_CATEGORIES: string[] = [
  'Makanan & Minuman',
  'Transportasi',
  'Tagihan & Utilitas',
  'Kesehatan',
  'Asuransi',
  'Rumah Tangga',
  'Pendidikan',
  'Cicilan',
]

export const WANTS_CATEGORIES: string[] = [
  'Belanja',
  'Hiburan',
  'Olahraga',
  'Perawatan Diri',
  'Elektronik',
  'Pakaian',
  'Perjalanan',
  'Hadiah & Donasi',
  'Lainnya',
]

// ── Goal categories ───────────────────────────────────────────────────────────
export const GOAL_CATEGORY_EMOJI: Record<string, string> = {
  EMERGENCY: '🛡️',
  ASSET: '🏠',
  DREAM: '✨',
  EDUCATION: '🎓',
  TRAVEL: '✈️',
  OTHER: '🎯',
}

export const GOAL_CATEGORY_LABELS: Record<string, string> = {
  EMERGENCY: 'Dana Darurat',
  ASSET: 'Aset / Properti',
  DREAM: 'Impian',
  EDUCATION: 'Pendidikan',
  TRAVEL: 'Perjalanan',
  OTHER: 'Lainnya',
}

// ── Asset types ───────────────────────────────────────────────────────────────
export const ASSET_TYPE_LABELS: Record<string, string> = {
  LIKUID: '💵 Likuid (Kas / Rekening)',
  INVESTASI: '📈 Investasi (Saham / Reksadana / Kripto / Emas)',
  TETAP: '🏠 Aset Tetap (Kendaraan / Properti / Elektronik)',
}

export const ASSET_TYPE_COLORS: Record<string, string> = {
  LIKUID: '#4ECDC4',
  INVESTASI: '#CCFF00',
  TETAP: '#FF8C00',
}

// ── Dashboard menu grid items ─────────────────────────────────────────────────
export const MENU_ITEMS: { icon: string; label: string; href: string }[] = [
  { icon: '📊', label: 'Transaksi', href: '/transactions' },
  { icon: '💰', label: 'Budget', href: '/budgets' },
  { icon: '🏦', label: 'Dompet', href: '/wallets' },
  { icon: '🎯', label: 'Goals', href: '/goals' },
  { icon: '📷', label: 'Scan Struk', href: '/scanner' },
  { icon: '🤖', label: 'AI Advisor', href: '/advisor' },
  { icon: '👤', label: 'Profil', href: '/profile' },
  { icon: '💡', label: 'Insights', href: '/reports' },
]