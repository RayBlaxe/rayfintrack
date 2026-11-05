'use client'

import React, { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // 1. Check if running in standalone PWA mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    setIsIOS(ios)

    // 3. Catch beforeinstallprompt on Chrome / Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  if (isStandalone || dismissed || (!deferredPrompt && !isIOS)) return null

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="mx-4 mt-3 mb-2 p-3 sm:p-3.5 rounded-2xl bg-emerald-950/80 dark:bg-emerald-950/50 border border-emerald-600/40 text-emerald-100 flex items-center justify-between gap-3 shadow-md animate-in fade-in">
      <div className="text-xs flex-1">
        {isIOS ? (
          <p className="flex items-center gap-1.5 flex-wrap">
            <span>Instal RayFin di iOS: ketuk tombol</span>
            <Share className="w-3.5 h-3.5 inline text-emerald-400" />
            <span className="font-bold underline">Bagikan</span>
            <span>lalu pilih</span>
            <span className="font-bold underline">&quot;Tambah ke Layar Utama&quot;</span>.
          </p>
        ) : (
          <p className="font-medium">
            Instal aplikasi RayFin di HP untuk akses offline cepat & pengalaman layar penuh.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instal</span>
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/50 transition-colors"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
