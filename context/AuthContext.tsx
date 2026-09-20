'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  username: string
  loggedInAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'rayfin_auth_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.username) {
          setUser(parsed)
        }
      } else {
        // Check if NEXT_PUBLIC_USER_NAME default is configured, auto-login for seamless experience on first load
        const defaultName = process.env.NEXT_PUBLIC_USER_NAME
        if (defaultName) {
          const defaultUser = { username: defaultName, loggedInAt: new Date().toISOString() }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser))
          setUser(defaultUser)
        }
      }
    } catch (e) {
      console.error('Failed to parse auth user', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      if (!user && pathname !== '/login') {
        router.push('/login')
      } else if (user && pathname === '/login') {
        router.push('/')
      }
    }
  }, [user, isLoading, pathname, router])

  const login = (username: string) => {
    const trimmed = username.trim()
    if (!trimmed) return
    const newUser: User = {
      username: trimmed,
      loggedInAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
    router.push('/')
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
