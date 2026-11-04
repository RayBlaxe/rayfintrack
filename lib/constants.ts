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