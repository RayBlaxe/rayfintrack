'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            if (process.env.NODE_ENV !== 'production') {
              console.log('[PWA] Service Worker registered:', reg.scope)
            }
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err)
          })
      }
    }
  }, [])

  return null
}
