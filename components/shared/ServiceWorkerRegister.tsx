'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          if (process.env.NODE_ENV !== 'production') {
            console.log('[PWA] Service Worker registered with scope:', reg.scope)
          }
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration warning:', err)
        })
    }
  }, [])

  return null
}
