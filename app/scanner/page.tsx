'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react'
import { ScanResult } from '@/types'
import { ACCOUNT_LABELS, CATEGORY_EMOJI } from '@/lib/constants'
import { formatRupiah } from '@/lib/formatters'
import { insertClientTransaction } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'
import Image from 'next/image'

export default function ScannerPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setResult(null)
    setSaved(false)
    setError('')
    scanFile(file)
  }

  async function scanFile(file: File) {
    setScanning(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/scan-receipt', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return
      }
      setResult(data as ScanResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memproses gambar')
    } finally {
      setScanning(false)
    }
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    try {
      await insertClientTransaction({
        description: result.description || result.merchant_name || 'Transaksi dari scan',
        amount: result.amount,
        category: result.category,
        source_account: result.source_account,
        flow_type: 'EXPENSE',
        transaction_date: result.transaction_date,
        merchant_name: result.merchant_name,
      })
      triggerRefresh()
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setPreview(null)
    setResult(null)
    setSaved(false)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const confidenceColor = result?.confidence === 'HIGH' ? '#CCFF00'
    : result?.confidence === 'MEDIUM' ? '#FFB547' : '#FF85A1'

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div className="px-5 pt-8 pb-2">
        <h1 className="text-white text-2xl font-black">Scan Struk</h1>
        <p className="text-white/40 text-sm mt-1">Foto struk → AI ekstrak otomatis</p>
      </div>

      {/* Camera input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview + scan area */}
      <div className="px-5">
        {!preview ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => inputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-4 hover:border-[#CCFF00]/40 transition-colors"
          >
            <div className="h-16 w-16 rounded-2xl bg-[#1b3a4b] flex items-center justify-center">
              <Camera className="h-8 w-8 text-[#CCFF00]" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">Foto Struk</p>
              <p className="text-white/40 text-sm mt-1">Tap untuk buka kamera atau pilih foto</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#CCFF00] rounded-xl">
              <Upload className="h-4 w-4 text-black" />
              <span className="text-black text-sm font-bold">Pilih Foto</span>
            </div>
          </motion.button>
        ) : (
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={reset}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 text-white" />
            </button>
            {scanning && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 text-[#CCFF00] animate-spin" />
                <p className="text-white font-semibold">Menganalisis struk...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 bg-[#FF85A1]/10 border border-[#FF85A1]/20 rounded-2xl p-4">
          <p className="text-[#FF85A1] text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-5 bg-[#161B22] rounded-3xl border border-white/8 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <h2 className="text-white font-bold">Hasil Scan</h2>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ color: confidenceColor, backgroundColor: `${confidenceColor}20` }}
              >
                {result.confidence}
              </span>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Total</span>
                <span className="text-[#FF85A1] text-xl font-black">{formatRupiah(result.amount)}</span>
              </div>
              {result.merchant_name && (
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">Merchant</span>
                  <span className="text-white font-medium text-sm">{result.merchant_name}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Kategori</span>
                <span className="text-white text-sm">
                  {CATEGORY_EMOJI[result.category] ?? '📦'} {result.category}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Akun</span>
                <span className="text-white text-sm">{ACCOUNT_LABELS[result.source_account] ?? result.source_account}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Tanggal</span>
                <span className="text-white text-sm">{result.transaction_date}</span>
              </div>
            </div>

            <div className="px-5 pb-5">
              {saved ? (
                <div className="flex items-center justify-center gap-2 py-3 bg-[#CCFF00]/10 rounded-2xl border border-[#CCFF00]/20">
                  <CheckCircle2 className="h-5 w-5 text-[#CCFF00]" />
                  <span className="text-[#CCFF00] font-bold">Tersimpan!</span>
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3.5 rounded-2xl bg-[#CCFF00] text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? 'Menyimpan...' : '✅ Simpan Transaksi'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
