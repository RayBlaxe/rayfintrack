'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Save, RotateCcw, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { DEFAULT_AI_RULES } from '@/lib/constants'

export default function AiRulesPage() {
  const [rules, setRules] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function loadRules() {
      try {
        const res = await fetch('/api/user/ai-rules')
        const data = await res.json()
        if (data.rules_text) {
          setRules(data.rules_text)
        } else {
          setRules(DEFAULT_AI_RULES)
        }
      } catch {
        setRules(DEFAULT_AI_RULES)
      } finally {
        setLoading(false)
      }
    }
    loadRules()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setStatusMsg('')
    setErrorMsg('')
    try {
      const res = await fetch('/api/user/ai-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules_text: rules }),
      })
      if (!res.ok) throw new Error('Gagal menyimpan aturan')
      setStatusMsg('Aturan AI berhasil disimpan dan langsung aktif!')
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefault = () => {
    if (confirm('Kembalikan aturan AI ke format bawaan (Supra → Transportasi)?')) {
      setRules(DEFAULT_AI_RULES)
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-12">
      {/* Header */}
      <div className="px-5 pt-8 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="h-10 w-10 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-slate-900 dark:text-slate-50 text-2xl font-black tracking-tight">Aturan AI Advisor</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Personalisasi pemahaman & kategori AI</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Info Banner */}
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <Brain className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Instruksi Bahasa Alami untuk Gemini AI</span>
          </div>
          <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
            Ketik aturan atau kebiasaan finansialmu di sini. AI Advisor akan membaca instruksi ini setiap kali kamu chatting atau mencatat transaksi.
          </p>
        </div>

        {/* Text Area Card */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
              Instruksi & Kebijakan Kategori Khusus
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Contoh: Motor Supra adalah kendaraan utama komuter, semua biaya servis/bensin/oli harus masuk kategori Transportasi (bukan Operasional).
            </p>

            {loading ? (
              <div className="h-44 rounded-2xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={7}
                placeholder="Tulis aturan kategorisasi di sini..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 leading-relaxed focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-600/20 font-medium transition-all"
              />
            )}
          </div>

          {statusMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Menyimpan...' : 'Simpan Aturan AI'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              disabled={saving || loading}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Reset ke format bawaan"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Default</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
