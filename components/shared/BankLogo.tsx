'use client'

import React from 'react'

interface BankLogoProps {
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function BankLogo({ name, className = '', size = 'md' }: BankLogoProps) {
  const norm = (name || '').toUpperCase().trim()

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  }[size]

  // 1. BCA
  if (norm.includes('BCA')) {
    return (
      <div className={`rounded-2xl bg-[#005BAA] flex items-center justify-center p-1.5 shadow-sm text-white font-black tracking-tighter ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <rect width="100" height="100" rx="20" fill="#005BAA" />
          <path d="M22 30h24c9 0 15 5 15 11 0 4-2 7-6 9 5 2 8 6 8 11 0 7-6 13-16 13H22V30zm13 16h10c4 0 6-2 6-5s-2-5-6-5H35v10zm0 18h11c4 0 7-2 7-6s-3-6-7-6H35v12z" fill="#FFF" />
          <path d="M72 74a18 18 0 0 1-18-18 18 18 0 0 1 18-18 18 18 0 0 1 12 5l-5 6a10 10 0 0 0-7-3 10 10 0 0 0-10 10 10 10 0 0 0 10 10c3 0 5-1 7-3l5 6a18 18 0 0 1-12 4z" fill="#FFF" opacity="0.9" />
        </svg>
      </div>
    )
  }

  // 2. SEABANK
  if (norm.includes('SEABANK') || norm.includes('SEA')) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br from-[#FF5B00] to-[#E64A00] flex items-center justify-center p-1.5 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <circle cx="50" cy="50" r="44" fill="#FF5B00" />
          <path d="M30 65c0-10 10-14 20-17 12-4 18-7 18-13 0-5-4-9-11-9-8 0-14 4-18 10l-9-7c7-9 16-14 27-14 14 0 23 9 23 20 0 11-10 16-20 19-12 4-18 7-18 13 0 6 5 10 12 10 8 0 16-5 20-11l8 8c-7 9-17 14-28 14-15 0-24-9-24-20z" fill="#FFF" />
        </svg>
      </div>
    )
  }

  // 3. MANDIRI
  if (norm.includes('MANDIRI')) {
    return (
      <div className={`rounded-2xl bg-[#003D79] flex items-center justify-center p-1.5 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="20" fill="#003D79" />
          <path d="M22 68V32l16 20 16-20v36H42V48l-10 12-10-12v20H22z" fill="#FFF" />
          <path d="M60 40c0-6 10-10 20-6l-2 8c-6-3-10-1-10 3 0 8 16 6 16 16 0 6-6 11-14 11-8 0-14-4-17-9l7-6c2 4 6 6 10 6 3 0 6-2 6-4 0-7-16-6-16-17z" fill="#FDB813" />
        </svg>
      </div>
    )
  }

  // 4. BNI
  if (norm.includes('BNI')) {
    return (
      <div className={`rounded-2xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shadow-sm ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="20" fill="#FFF" />
          <path d="M20 70V30h16c8 0 14 4 14 11 0 4-2 7-6 9 5 2 8 6 8 11 0 7-6 13-16 13H20zm12-24h6c3 0 5-1 5-4s-2-4-5-4h-6v8zm0 14h6c4 0 6-2 6-5s-2-5-6-5h-6v10z" fill="#005E54" />
          <path d="M56 30h10l14 24V30h10v40H80L66 46v24H56V30z" fill="#F15A24" />
        </svg>
      </div>
    )
  }

  // 5. BRI
  if (norm.includes('BRI')) {
    return (
      <div className={`rounded-2xl bg-[#00529C] flex items-center justify-center p-1.5 shadow-sm text-white font-black ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <rect width="100" height="100" rx="20" fill="#00529C" />
          <text x="50" y="62" fontSize="32" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" fill="#FFF">BRI</text>
        </svg>
      </div>
    )
  }

  // 6. BANK JAGO
  if (norm.includes('JAGO')) {
    return (
      <div className={`rounded-2xl bg-[#FF8400] flex items-center justify-center p-1 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="20" fill="#FF8400" />
          <text x="50" y="65" fontSize="38" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" textAnchor="middle" fill="#FFF">jago</text>
        </svg>
      </div>
    )
  }

  // 7. CIMB NIAGA / OCTO
  if (norm.includes('CIMB') || norm.includes('OCTO')) {
    return (
      <div className={`rounded-2xl bg-[#ED1B24] flex items-center justify-center p-1.5 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <rect width="100" height="100" rx="20" fill="#ED1B24" />
          <polygon points="25,50 50,25 75,50 50,75" fill="#FFF" />
          <polygon points="38,50 50,38 62,50 50,62" fill="#ED1B24" />
        </svg>
      </div>
    )
  }

  // 8. BSI
  if (norm.includes('BSI') || norm.includes('SYARIAH INDONESIA')) {
    return (
      <div className={`rounded-2xl bg-[#00A39D] flex items-center justify-center p-1.5 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="20" fill="#00A39D" />
          <circle cx="50" cy="50" r="28" fill="#FFF" />
          <circle cx="56" cy="46" r="24" fill="#00A39D" />
          <polygon points="50,30 54,42 66,42 56,50 60,62 50,54 40,62 44,50 34,42 46,42" fill="#F37021" />
        </svg>
      </div>
    )
  }

  // 9. GOPAY
  if (norm.includes('GOPAY') || norm.includes('GO-PAY')) {
    return (
      <div className={`rounded-2xl bg-[#00AA5B] flex items-center justify-center p-1.5 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <circle cx="50" cy="50" r="44" fill="#00AA5B" />
          <circle cx="50" cy="50" r="26" fill="#FFF" />
          <circle cx="50" cy="50" r="14" fill="#00AA5B" />
        </svg>
      </div>
    )
  }

  // 10. SHOPEEPAY
  if (norm.includes('SHOPEEPAY') || norm.includes('SHOPEE')) {
    return (
      <div className={`rounded-2xl bg-[#EE4D2D] flex items-center justify-center p-1.5 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <rect width="100" height="100" rx="20" fill="#EE4D2D" />
          <path d="M50 20c-14 0-25 11-25 25v30h50V45c0-14-11-25-25-25zm0 10c8 0 15 7 15 15H35c0-8 7-15 15-15z" fill="#FFF" opacity="0.3" />
          <path d="M48 38c-8 0-14 4-14 11 0 9 12 11 16 13 4 1 6 3 6 5 0 3-3 5-7 5-5 0-9-3-11-7l-7 5c4 7 10 10 18 10 8 0 15-4 15-12 0-9-12-11-17-13-4-1-6-3-6-5s3-4 6-4c4 0 8 2 10 6l7-5c-3-6-9-9-16-9z" fill="#FFF" />
        </svg>
      </div>
    )
  }

  // 11. DANA
  if (norm.includes('DANA')) {
    return (
      <div className={`rounded-2xl bg-[#118EEA] flex items-center justify-center p-1.5 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <rect width="100" height="100" rx="20" fill="#118EEA" />
          <path d="M30 30h22c14 0 24 9 24 20s-10 20-24 20H30V30zm14 28h8c7 0 12-4 12-8s-5-8-12-8h-8v16z" fill="#FFF" />
        </svg>
      </div>
    )
  }

  // 12. OVO
  if (norm.includes('OVO')) {
    return (
      <div className={`rounded-2xl bg-[#4C2A86] flex items-center justify-center p-1.5 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <rect width="100" height="100" rx="20" fill="#4C2A86" />
          <text x="50" y="64" fontSize="34" fontFamily="sans-serif" fontWeight="900" textAnchor="middle" fill="#FFF">ovo</text>
        </svg>
      </div>
    )
  }

  // 13. TUNAI / CASH
  if (norm.includes('CASH') || norm.includes('TUNAI') || norm.includes('DOMPET')) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center p-1.5 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
          <rect x="2" y="6" width="20" height="12" rx="3" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      </div>
    )
  }

  // 14. KARTU KREDIT / CC (MEGA, HONEST, VISA, MASTER, ETC.)
  if (norm.includes('CARD') || norm.includes('CREDIT') || norm.includes('KARTU') || norm.includes('MEGA') || norm.includes('HONEST')) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 border border-purple-500/30 flex items-center justify-center p-1.5 shadow-sm text-amber-300 ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
          <rect x="2" y="5" width="20" height="14" rx="3" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <rect x="5" y="14" width="4" height="2" rx="0.5" fill="currentColor" />
        </svg>
      </div>
    )
  }

  // 15. STOCKBIT / RDN / INVESTASI
  if (norm.includes('STOCKBIT') || norm.includes('RDN') || norm.includes('INVESTASI') || norm.includes('BIBIT')) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center p-1.5 shadow-sm text-white ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      </div>
    )
  }

  // Default Bank / Wallet
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center p-1.5 shadow-sm text-slate-200 ${sizeClasses} ${className}`}>
      <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-current fill-none stroke-[2] stroke-linecap-round stroke-linejoin-round">
        <path d="M3 21h18" />
        <path d="M3 10h18" />
        <path d="M5 6l7-3 7 3" />
        <path d="M4 10v11" />
        <path d="M20 10v11" />
        <path d="M8 14v4" />
        <path d="M12 14v4" />
        <path d="M16 14v4" />
      </svg>
    </div>
  )
}
