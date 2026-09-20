'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, User, ShieldCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (name: string) => {
    if (!name.trim()) {
      setError('Masukkan username terlebih dahulu')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    const formattedUsername = name.trim().toLowerCase()
    const email = `${formattedUsername}@rayfin.local`
    const password = `RayFin!${formattedUsername}2026`

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // If login fails, redirect to register to create it
        if (signInError.message.includes('Invalid login credentials')) {
          router.push(`/register?username=${encodeURIComponent(name.trim())}`)
          return
        }
        throw signInError
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Gagal login')
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleLogin(username)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#006466]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-br from-[#1b3a4b] to-[#0b525b] border border-white/10 shadow-xl shadow-[#006466]/20">
            <span className="text-3xl font-black text-[#CCFF00]">R</span>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              RayFin <span className="text-[#CCFF00]">2.0</span>
            </h1>
            <p className="text-xs text-white/50 mt-1">Multi-Tenant Financial Dashboard</p>
          </div>
        </div>

        <div className="bg-[#161B22] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Selamat Datang 👋</h2>
            <p className="text-xs text-white/40">Masuk dengan username untuk mengakses data kamu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60">Username</label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-white/30 pointer-events-none">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Contoh: Ray"
                  className="w-full h-12 pl-10 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] transition-all"
                  autoFocus
                />
              </div>
              {error && <p className="text-[11px] text-[#FF85A1]">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#CCFF00]/20"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Masuk / Daftar</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
            <ShieldCheck className="h-3.5 w-3.5 text-[#CCFF00]" />
            <span>Multi-tenant Isolation (RLS) Aktif</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
