'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { CATEGORY_EMOJI, CATEGORY_COLORS, NEEDS_CATEGORIES, WANTS_CATEGORIES } from '@/lib/constants'
import { triggerRefresh } from '@/lib/realtimeEvents'

export interface AppCategory {
  id?: string
  name: string
  emoji: string
  color: string
  parent_category: string | null
  budget_bucket: 'needs' | 'wants' | 'savings'
  is_custom: boolean
}

export function useCategories() {
  const [customCategories, setCustomCategories] = useState<AppCategory[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/user/categories')
      const data = await res.json()
      if (data.categories && Array.isArray(data.categories)) {
        setCustomCategories(data.categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          emoji: c.emoji || '📦',
          color: c.color || '#6B7280',
          parent_category: c.parent_category || null,
          budget_bucket: c.budget_bucket || 'needs',
          is_custom: true
        })))
      }
    } catch (e) {
      console.warn('Failed to fetch custom categories:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const categories = useMemo<AppCategory[]>(() => {
    // 1. Build default categories from constants
    const defaultList: AppCategory[] = Object.entries(CATEGORY_EMOJI).map(([name, emoji]) => ({
      name,
      emoji,
      color: CATEGORY_COLORS[name] || '#6B7280',
      parent_category: null,
      budget_bucket: NEEDS_CATEGORIES.includes(name) ? 'needs' : WANTS_CATEGORIES.includes(name) ? 'wants' : 'savings',
      is_custom: false
    }))

    // 2. Merge with custom categories (custom categories can override defaults or add new ones)
    const customNames = new Set(customCategories.map(c => c.name))
    const filteredDefaults = defaultList.filter(d => !customNames.has(d.name))

    return [...filteredDefaults, ...customCategories]
  }, [customCategories])

  const categoryNames = useMemo(() => categories.map(c => c.name), [categories])

  const emojiMap = useMemo(() => {
    const map: Record<string, string> = { ...CATEGORY_EMOJI }
    for (const c of customCategories) {
      map[c.name] = c.emoji
    }
    return map
  }, [customCategories])

  const colorMap = useMemo(() => {
    const map: Record<string, string> = { ...CATEGORY_COLORS }
    for (const c of customCategories) {
      map[c.name] = c.color
    }
    return map
  }, [customCategories])

  const addOrUpdateCategory = async (cat: {
    name: string
    emoji: string
    color: string
    parent_category?: string | null
    budget_bucket?: 'needs' | 'wants' | 'savings'
  }) => {
    const res = await fetch('/api/user/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan kategori')
    await fetchCategories()
    triggerRefresh()
    return data.category
  }

  const deleteCategory = async (name: string, id?: string) => {
    const url = id ? `/api/user/categories?id=${encodeURIComponent(id)}` : `/api/user/categories?name=${encodeURIComponent(name)}`
    const res = await fetch(url, { method: 'DELETE' })
    if (!res.ok) throw new Error('Gagal menghapus kategori')
    await fetchCategories()
    triggerRefresh()
  }

  return {
    categories,
    categoryNames,
    customCategories,
    emojiMap,
    colorMap,
    loading,
    addOrUpdateCategory,
    deleteCategory,
    refetchCategories: fetchCategories,
  }
}
