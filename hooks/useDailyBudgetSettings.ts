'use client'

import { useState, useEffect, useCallback } from 'react'

export interface DailyBudgetSettings {
  foodDailyLimit: number
  generalDailyLimit: number
  useAutoGeneral: boolean
}

const STORAGE_KEY = 'rayfin_daily_budget_settings'

const DEFAULT_SETTINGS: DailyBudgetSettings = {
  foodDailyLimit: 50000, // Rp 50.000 default for food
  generalDailyLimit: 150000, // Rp 150.000 default total per day
  useAutoGeneral: true, // Default to auto safe-to-spend
}

export function useDailyBudgetSettings() {
  const [settings, setSettings] = useState<DailyBudgetSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
      }
    } catch (e) {
      console.error('Error loading daily budget settings', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    loadSettings()
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadSettings()
      }
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('rayfin_daily_budget_updated', loadSettings)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('rayfin_daily_budget_updated', loadSettings)
    }
  }, [loadSettings])

  const updateSettings = (newSettings: Partial<DailyBudgetSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
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
