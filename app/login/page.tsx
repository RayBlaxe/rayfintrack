'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, User, Lock, ShieldCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const supabase = getSupabaseClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Masukkan username terlebih dahulu')
      return
    }

    setIsLoading(true)
    setError('')

    const formattedUsername = username.trim().toLowerCase()
    const email = `${formattedUsername}@rayfin.local`
    
    // If password provided, use it; otherwise fallback to legacy default password
    const enteredPassword = password || `RayFin!${formattedUsername}2026`

    try {
      let { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: enteredPassword,
      })

      // If failed and password was entered, also try legacy default in case user hasn't migrated yet
      if (signInError && password && enteredPassword !== `RayFin!${formattedUsername}2026`) {
        const legacyAttempt = await supabase.auth.signInWithPassword({
          email,
          password: `RayFin!${formattedUsername}2026`,
        })
        if (!legacyAttempt.error) {
          signInError = null
        }
      }

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Username atau password salah. Jika belum punya akun, silakan daftar.')
        } else {
          setError(signInError.message || 'Gagal login')
        }
        setIsLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Gagal login')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 relative overflow-hidden bg-slate-50 dark:bg-[#06090E] transition-colors">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto space-y-8 relative z-10"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/25 shadow-md">
            <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">R</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center justify-center gap-2">
              RayFin <span className="text-emerald-600 dark:text-emerald-400">2.0</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Personal Finance & Ledger Dashboard</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F17] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 transition-colors">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Selamat Datang 👋</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Masuk dengan username dan password kamu.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Username Akun</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Contoh: ray, alex, atau nama kamu"
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Masukkan password"
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-400">Akun lama default: RayFin!&#123;username&#125;2026</p>
            </div>

            {error && <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 text-white dark:text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              Belum punya akun?{' '}
              <Link href="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Daftar Akun Baru
              </Link>
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Multi-tenant Data Isolation (RLS) Aktif</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
