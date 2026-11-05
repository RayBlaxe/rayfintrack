'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, User, Loader2, Database } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function RegisterForm() {
  const searchParams = useSearchParams()
  const initialUsername = searchParams.get('username') || ''
  
  const [username, setUsername] = useState(initialUsername)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Masukkan username terlebih dahulu')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    const formattedUsername = username.trim().toLowerCase()
    const email = `${formattedUsername}@rayfin.local`
    const password = `RayFin!${formattedUsername}2026`

    try {
      // 1. Sign up user via Server API
      setStep(2)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: username.trim() })
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Gagal membuat akun')

      const userId = data.user?.id
      if (!userId) throw new Error('Gagal mendapatkan ID user baru')

      // 2. Langsung Login agar mendapat sesi di browser
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError

      // 3. Seed Default Accounts
      setStep(3)
      const defaultAccounts = ['BCA', 'CIMB_NIAGA', 'CIMB_OCTO_PAY', 'SEABANK', 'SHOPEEPAY', 'GOPAY', 'DANA', 'CASH', 'MEGA_SYARIAH', 'E-WALLET', 'OTHER']
      const accountsToInsert = defaultAccounts.map(name => ({
        user_id: userId,
        account_name: name,
        current_balance: 0
      }))

      const { error: seedError } = await supabase
        .from('accounts')
        .insert(accountsToInsert)
      
      if (seedError && seedError.code !== '23505') {
        console.error('Seed Error:', seedError)
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar')
      setIsLoading(false)
      setStep(1)
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Username Baru</label>
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
            placeholder="Masukkan username kamu"
            className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium"
            autoFocus
          />
        </div>
        {error && <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 text-white dark:text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">
              {step === 2 ? 'Mendaftarkan User...' : 'Menyiapkan Buku Kas...'}
            </span>
          </div>
        ) : (
          <>
            <span>Buat Akun & Masuk</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}

export default function RegisterPage() {
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
            <Database className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center justify-center gap-2">
              Registrasi <span className="text-emerald-600 dark:text-emerald-400">RayFin</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Buat akun untuk mengelola keuangan pribadi</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B0F17] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 transition-colors">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">Inisialisasi Akun</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Username akan dibuatkan buku kas mandiri dengan data aman terisolasi.</p>
          </div>

          <Suspense fallback={<div className="h-28 flex items-center justify-center"><Loader2 className="h-6 w-6 text-emerald-600 animate-spin" /></div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  )
}
