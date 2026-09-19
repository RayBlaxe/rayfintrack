import { AccountName } from '@/types'

export const ACCOUNT_LABELS: Record<string, string> = {
  BCA:           'BCA',
  CIMB_NIAGA:    'CIMB Niaga',
  CIMB_OCTO_PAY: 'CIMB OCTO Pay',
  SEABANK:       'SeaBank',
  SHOPEEPAY:     'ShopeePay',
  GOPAY:         'GoPay',
  DANA:          'DANA',
  CASH:          'Tunai',
  MEGA_SYARIAH:  'KK Mega Syariah',
  OTHER:         'Lainnya',
}

export const ACCOUNT_LOGOS: Record<string, string> = {
  BCA:           '🏦',
  CIMB_NIAGA:    '🏦',
  CIMB_OCTO_PAY: '💳',
  SEABANK:       '🌊',
  SHOPEEPAY:     '🛍️',
  GOPAY:         '🟢',
  DANA:          '💙',
  CASH:          '💵',
  MEGA_SYARIAH:  '💜',
  OTHER:         '🏛️',
}

export const ACCOUNT_COLORS: Record<string, string> = {
  BCA:           '#005BAA',
  CIMB_NIAGA:    '#CC0000',
  CIMB_OCTO_PAY: '#CC0000',
  SEABANK:       '#00A0E3',
  SHOPEEPAY:     '#EE4D2D',
  GOPAY:         '#00AA5B',
  DANA:          '#108EE9',
  CASH:          '#6B7280',
  MEGA_SYARIAH:  '#9333EA',
  OTHER:         '#94A3B8',
}

export const CREDIT_CARD_ACCOUNTS: AccountName[] = ['MEGA_SYARIAH']

// 50/30/20 rule categorization
export const NEEDS_CATEGORIES = [
  'Makanan & Minuman', 'Kesehatan', 'Operasional', 'Rumah Tangga',
  'Cicilan', 'Komitmen Keluarga', 'Pendidikan',
]
export const WANTS_CATEGORIES = [
  'Hiburan', 'Lifestyle & Dating', 'Belanja Online', 'Lainnya',
]

export const CATEGORY_EMOJI: Record<string, string> = {
  'Makanan & Minuman':  '🍔',
  'Belanja Online':     '🛒',
  'Hiburan':            '🎮',
  'Kesehatan':          '💊',
  'Pendidikan':         '📚',
  'Rumah Tangga':       '🏠',
  'Operasional':        '🚗',
  'Cicilan':            '💳',
  'Komitmen Keluarga':  '👨👩👧',
  'Lifestyle & Dating': '🫶',
  'Transfer Internal':  '💸',
  'Gaji':               '💰',
  'Freelance':          '💻',
  'Investasi':          '📈',
  'Lainnya':            '📦',
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Makanan & Minuman':  '#f97316',
  'Belanja Online':     '#ec4899',
  'Hiburan':            '#8b5cf6',
  'Kesehatan':          '#10b981',
  'Pendidikan':         '#3b82f6',
  'Rumah Tangga':       '#64748b',
  'Operasional':        '#f59e0b',
  'Cicilan':            '#ef4444',
  'Komitmen Keluarga':  '#06b6d4',
  'Lifestyle & Dating': '#e879f9',
  'Gaji':               '#22c55e',
  'Freelance':          '#14b8a6',
  'Transfer Internal':  '#94a3b8',
  'Lainnya':            '#94a3b8',
}

export const GOAL_CATEGORY_EMOJI: Record<string, string> = {
  EMERGENCY:  '🛡️',
  ASSET:      '🏠',
  DREAM:      '✨',
  EDUCATION:  '🎓',
  TRAVEL:     '✈️',
  OTHER:      '🎯',
}

export const GOAL_CATEGORY_LABELS: Record<string, string> = {
  EMERGENCY:  'Dana Darurat',
  ASSET:      'Aset',
  DREAM:      'Impian',
  EDUCATION:  'Pendidikan',
  TRAVEL:     'Liburan',
  OTHER:      'Lainnya',
}

export const ASSET_TYPE_LABELS: Record<string, string> = {
  LIKUID:    'Aset Likuid',
  TETAP:     'Aset Tetap',
  INVESTASI: 'Investasi',
}

export const ASSET_TYPE_COLORS: Record<string, string> = {
  LIKUID:    '#CCFF00',
  TETAP:     '#06b6d4',
  INVESTASI: '#8b5cf6',
}

export const FLOW_TYPE_LABELS: Record<string, string> = {
  EXPENSE:           'Pengeluaran',
  INCOME:            'Pemasukan',
  TRANSFER_INTERNAL: 'Transfer',
}

export const MENU_ITEMS = [
  { label: 'Budget',      icon: '📊', href: '/budgets' },
  { label: 'Scanner',     icon: '📷', href: '/scanner' },
  { label: 'Goals',       icon: '🎯', href: '/goals' },
  { label: 'Aset',        icon: '🏦', href: '/wallets' },
  { label: 'Utang',       icon: '💳', href: '/wallets?tab=debt' },
  { label: 'Investasi',   icon: '📈', href: '/wallets?tab=invest' },
  { label: 'AI Advisor',  icon: '🤖', href: '/advisor' },
  { label: 'Laporan',     icon: '📄', href: '/transactions' },
] as const
