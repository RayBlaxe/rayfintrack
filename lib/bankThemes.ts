/**
 * lib/bankThemes.ts
 * Visual theme styling & brand helpers for Indonesian Banks, E-Wallets, Cash, and Credit Cards
 */

export interface BankTheme {
  name: string
  label: string
  type: 'BANK' | 'E_WALLET' | 'CASH' | 'CREDIT_CARD' | 'INVESTMENT'
  primaryColor: string
  // Subtle atmospheric card background styling
  bgClass: string
  borderClass: string
  badgeBg: string
  badgeText: string
  accentGlow: string
}

export const BANK_PRESETS: Record<string, BankTheme> = {
  BCA: {
    name: 'BCA',
    label: 'Bank Central Asia (BCA)',
    type: 'BANK',
    primaryColor: '#005BAA',
    bgClass: 'bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 dark:from-blue-950/25 dark:via-[#111827] dark:to-blue-900/10',
    borderClass: 'border-blue-200/80 dark:border-blue-800/40 hover:border-blue-400 dark:hover:border-blue-700',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    accentGlow: 'rgba(0, 91, 170, 0.15)',
  },
  SEABANK: {
    name: 'SEABANK',
    label: 'SeaBank Indonesia',
    type: 'BANK',
    primaryColor: '#FF5B00',
    bgClass: 'bg-gradient-to-br from-orange-50/80 via-white to-orange-50/30 dark:from-orange-950/25 dark:via-[#111827] dark:to-orange-900/10',
    borderClass: 'border-orange-200/80 dark:border-orange-800/40 hover:border-orange-400 dark:hover:border-orange-700',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60',
    badgeText: 'text-orange-700 dark:text-orange-300',
    accentGlow: 'rgba(255, 91, 0, 0.15)',
  },
  MANDIRI: {
    name: 'MANDIRI',
    label: 'Bank Mandiri',
    type: 'BANK',
    primaryColor: '#003D79',
    bgClass: 'bg-gradient-to-br from-sky-50/80 via-white to-amber-50/30 dark:from-sky-950/25 dark:via-[#111827] dark:to-amber-950/10',
    borderClass: 'border-sky-200/80 dark:border-sky-800/40 hover:border-sky-400',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/60',
    badgeText: 'text-sky-800 dark:text-sky-300',
    accentGlow: 'rgba(0, 61, 121, 0.15)',
  },
  BNI: {
    name: 'BNI',
    label: 'Bank Negara Indonesia (BNI)',
    type: 'BANK',
    primaryColor: '#005E54',
    bgClass: 'bg-gradient-to-br from-teal-50/80 via-white to-orange-50/30 dark:from-teal-950/25 dark:via-[#111827] dark:to-orange-950/10',
    borderClass: 'border-teal-200/80 dark:border-teal-800/40 hover:border-teal-400',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/60',
    badgeText: 'text-teal-800 dark:text-teal-300',
    accentGlow: 'rgba(0, 94, 84, 0.15)',
  },
  BRI: {
    name: 'BRI',
    label: 'Bank Rakyat Indonesia (BRI)',
    type: 'BANK',
    primaryColor: '#00529C',
    bgClass: 'bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 dark:from-blue-950/25 dark:via-[#111827] dark:to-blue-900/10',
    borderClass: 'border-blue-200/80 dark:border-blue-800/40 hover:border-blue-400',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-800 dark:text-blue-300',
    accentGlow: 'rgba(0, 82, 156, 0.15)',
  },
  JAGO: {
    name: 'JAGO',
    label: 'Bank Jago',
    type: 'BANK',
    primaryColor: '#FF8400',
    bgClass: 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 dark:from-amber-950/25 dark:via-[#111827] dark:to-amber-900/10',
    borderClass: 'border-amber-200/80 dark:border-amber-800/40 hover:border-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    accentGlow: 'rgba(255, 132, 0, 0.15)',
  },
  CIMB_NIAGA: {
    name: 'CIMB_NIAGA',
    label: 'CIMB Niaga',
    type: 'BANK',
    primaryColor: '#ED1B24',
    bgClass: 'bg-gradient-to-br from-red-50/80 via-white to-red-50/30 dark:from-red-950/25 dark:via-[#111827] dark:to-red-900/10',
    borderClass: 'border-red-200/80 dark:border-red-800/40 hover:border-red-400',
    badgeBg: 'bg-red-100 dark:bg-red-950/60',
    badgeText: 'text-red-700 dark:text-red-300',
    accentGlow: 'rgba(237, 27, 36, 0.15)',
  },
  CIMB_OCTO_PAY: {
    name: 'CIMB_OCTO_PAY',
    label: 'CIMB OCTO Pay',
    type: 'BANK',
    primaryColor: '#ED1B24',
    bgClass: 'bg-gradient-to-br from-red-50/80 via-white to-red-50/30 dark:from-red-950/25 dark:via-[#111827] dark:to-red-900/10',
    borderClass: 'border-red-200/80 dark:border-red-800/40 hover:border-red-400',
    badgeBg: 'bg-red-100 dark:bg-red-950/60',
    badgeText: 'text-red-700 dark:text-red-300',
    accentGlow: 'rgba(237, 27, 36, 0.15)',
  },
  BSI: {
    name: 'BSI',
    label: 'Bank Syariah Indonesia (BSI)',
    type: 'BANK',
    primaryColor: '#00A39D',
    bgClass: 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 dark:from-emerald-950/25 dark:via-[#111827] dark:to-teal-900/10',
    borderClass: 'border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    accentGlow: 'rgba(0, 163, 157, 0.15)',
  },
  GOPAY: {
    name: 'GOPAY',
    label: 'GoPay',
    type: 'E_WALLET',
    primaryColor: '#00AA5B',
    bgClass: 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-950/25 dark:via-[#111827] dark:to-emerald-900/10',
    borderClass: 'border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    accentGlow: 'rgba(0, 170, 91, 0.15)',
  },
  SHOPEEPAY: {
    name: 'SHOPEEPAY',
    label: 'ShopeePay',
    type: 'E_WALLET',
    primaryColor: '#EE4D2D',
    bgClass: 'bg-gradient-to-br from-orange-50/80 via-white to-red-50/30 dark:from-orange-950/25 dark:via-[#111827] dark:to-red-950/10',
    borderClass: 'border-orange-200/80 dark:border-orange-800/40 hover:border-orange-400',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60',
    badgeText: 'text-orange-700 dark:text-orange-300',
    accentGlow: 'rgba(238, 77, 45, 0.15)',
  },
  DANA: {
    name: 'DANA',
    label: 'DANA Wallet',
    type: 'E_WALLET',
    primaryColor: '#118EEA',
    bgClass: 'bg-gradient-to-br from-sky-50/80 via-white to-sky-50/30 dark:from-sky-950/25 dark:via-[#111827] dark:to-sky-900/10',
    borderClass: 'border-sky-200/80 dark:border-sky-800/40 hover:border-sky-400',
    badgeBg: 'bg-sky-100 dark:bg-sky-950/60',
    badgeText: 'text-sky-700 dark:text-sky-300',
    accentGlow: 'rgba(17, 142, 234, 0.15)',
  },
  OVO: {
    name: 'OVO',
    label: 'OVO',
    type: 'E_WALLET',
    primaryColor: '#4C2A86',
    bgClass: 'bg-gradient-to-br from-purple-50/80 via-white to-purple-50/30 dark:from-purple-950/25 dark:via-[#111827] dark:to-purple-900/10',
    borderClass: 'border-purple-200/80 dark:border-purple-800/40 hover:border-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    accentGlow: 'rgba(76, 42, 134, 0.15)',
  },
  CASH: {
    name: 'CASH',
    label: 'Uang Tunai (Cash)',
    type: 'CASH',
    primaryColor: '#10B981',
    bgClass: 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-950/25 dark:via-[#111827] dark:to-teal-900/10',
    borderClass: 'border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    accentGlow: 'rgba(16, 185, 129, 0.15)',
  },
  MEGA_SYARIAH: {
    name: 'MEGA_SYARIAH',
    label: 'Kartu Kredit (Mega)',
    type: 'CREDIT_CARD',
    primaryColor: '#9333EA',
    bgClass: 'bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/30 dark:from-purple-950/30 dark:via-[#111827] dark:to-indigo-950/20',
    borderClass: 'border-purple-200/80 dark:border-purple-800/50 hover:border-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    accentGlow: 'rgba(147, 51, 234, 0.15)',
  },
  HONEST_CARD: {
    name: 'HONEST_CARD',
    label: 'Kartu Kredit (Honest)',
    type: 'CREDIT_CARD',
    primaryColor: '#E11D48',
    bgClass: 'bg-gradient-to-br from-rose-50/80 via-white to-pink-50/30 dark:from-rose-950/30 dark:via-[#111827] dark:to-pink-950/20',
    borderClass: 'border-rose-200/80 dark:border-rose-800/50 hover:border-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    accentGlow: 'rgba(225, 29, 72, 0.15)',
  },
  STOCKBIT: {
    name: 'STOCKBIT',
    label: 'RDN Investasi (Stockbit)',
    type: 'INVESTMENT',
    primaryColor: '#10B981',
    bgClass: 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 dark:from-emerald-950/25 dark:via-[#111827] dark:to-teal-900/10',
    borderClass: 'border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    accentGlow: 'rgba(16, 185, 129, 0.15)',
  },
}

export function getBankTheme(accountName: string): BankTheme {
  const norm = (accountName || '').toUpperCase().trim()

  // Match predefined presets
  for (const [key, preset] of Object.entries(BANK_PRESETS)) {
    if (norm === key || norm.includes(key)) {
      return preset
    }
  }

  // Check types based on keywords
  if (norm.includes('CARD') || norm.includes('KREDIT') || norm.includes('CREDIT') || norm.includes('CICILAN')) {
    return {
      name: accountName,
      label: accountName,
      type: 'CREDIT_CARD',
      primaryColor: '#6366F1',
      bgClass: 'bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/30 dark:from-indigo-950/25 dark:via-[#111827] dark:to-purple-950/15',
      borderClass: 'border-indigo-200/80 dark:border-indigo-800/40 hover:border-indigo-400',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
      accentGlow: 'rgba(99, 102, 241, 0.15)',
    }
  }

  if (norm.includes('WALLET') || norm.includes('PAY') || norm.includes('OVO') || norm.includes('DANA') || norm.includes('GOPAY') || norm.includes('SHOPEE') || norm.includes('LINKAJA')) {
    return {
      name: accountName,
      label: accountName,
      type: 'E_WALLET',
      primaryColor: '#0EA5E9',
      bgClass: 'bg-gradient-to-br from-sky-50/80 via-white to-sky-50/30 dark:from-sky-950/25 dark:via-[#111827] dark:to-sky-900/10',
      borderClass: 'border-sky-200/80 dark:border-sky-800/40 hover:border-sky-400',
      badgeBg: 'bg-sky-100 dark:bg-sky-950/60',
      badgeText: 'text-sky-700 dark:text-sky-300',
      accentGlow: 'rgba(14, 165, 233, 0.15)',
    }
  }

  if (norm.includes('CASH') || norm.includes('TUNAI') || norm.includes('DOMPET')) {
    return BANK_PRESETS.CASH
  }

  // Default Bank
  return {
    name: accountName,
    label: accountName,
    type: 'BANK',
    primaryColor: '#64748B',
    bgClass: 'bg-gradient-to-br from-slate-50/80 via-white to-slate-50/30 dark:from-slate-900/40 dark:via-[#111827] dark:to-slate-900/20',
    borderClass: 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    accentGlow: 'rgba(100, 116, 139, 0.15)',
  }
}
