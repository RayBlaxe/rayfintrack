'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

export interface DailyBudgetSettings {
  foodDailyLimit: number
  generalDailyLimit: number
  useAutoGeneral: boolean
}

const STORAGE_KEY_PREFIX = 'rayfin_daily_budget_settings_'

const DEFAULT_SETTINGS: DailyBudgetSettings = {
  foodDailyLimit: 50000, // Rp 50.000 default for food
  generalDailyLimit: 150000, // Rp 150.000 default total per day
  useAutoGeneral: true, // Default to auto safe-to-spend
}

export function useDailyBudgetSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<DailyBudgetSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  const storageKey = user ? `${STORAGE_KEY_PREFIX}${user.id}` : null

  const loadSettings = useCallback(() => {
    if (!storageKey) {
      setSettings(DEFAULT_SETTINGS)
      setIsLoaded(true)
      return
    }
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
      } else {
        setSettings(DEFAULT_SETTINGS)
      }
    } catch (e) {
      console.error('Error loading daily budget settings', e)
    } finally {
      setIsLoaded(true)
    }
  }, [storageKey])

  useEffect(() => {
    loadSettings()
    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadSettings()
      }
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('rayfin_daily_budget_updated', loadSettings)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('rayfin_daily_budget_updated', loadSettings)
    }
  }, [loadSettings, storageKey])

  const updateSettings = (newSettings: Partial<DailyBudgetSettings>) => {
    if (!storageKey) return
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
      window.dispatchEvent(new Event('rayfin_daily_budget_updated'))
    } catch (e) {
      console.error('Error saving daily budget settings', e)
    }
  }

  return {
    settings,
    isLoaded,
    updateSettings,
  }
}
