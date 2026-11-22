'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Plus, Wallet, CreditCard, Landmark, Coins } from 'lucide-react'
import { BankLogo } from '@/components/shared/BankLogo'
import { getBankTheme, BANK_PRESETS } from '@/lib/bankThemes'
import { insertAccount } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'
import { formatRupiah } from '@/lib/formatters'

interface Props {
  open: boolean
  onClose: () => void
  existingAccountNames: string[]
  onCreated: () => void
}

const PRESET_OPTIONS = [
  { key: 'BCA', label: 'BCA', category: 'BANK' },
  { key: 'MANDIRI', label: 'Mandiri', category: 'BANK' },
  { key: 'BNI', label: 'BNI', category: 'BANK' },
  { key: 'BRI', label: 'BRI', category: 'BANK' },
  { key: 'SEABANK', label: 'SeaBank', category: 'BANK' },
  { key: 'JAGO', label: 'Bank Jago', category: 'BANK' },
  { key: 'CIMB_NIAGA', label: 'CIMB Niaga', category: 'BANK' },
  { key: 'BSI', label: 'BSI Syariah', category: 'BANK' },
  { key: 'GOPAY', label: 'GoPay', category: 'E_WALLET' },
  { key: 'SHOPEEPAY', label: 'ShopeePay', category: 'E_WALLET' },
  { key: 'DANA', label: 'DANA', category: 'E_WALLET' },
  { key: 'OVO', label: 'OVO', category: 'E_WALLET' },
  { key: 'CASH', label: 'Tunai (Cash)', category: 'CASH' },
  { key: 'KARTU_KREDIT', label: 'Kartu Kredit', category: 'CREDIT_CARD' },
]

export function AddAccountModal({
  open,
  onClose,
  existingAccountNames,
  onCreated,
}: Props) {
  const [selectedPreset, setSelectedPreset] = useState('BCA')
  const [customName, setCustomName] = useState('')
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const isCustom = selectedPreset === 'CUSTOM'
  const effectiveName = isCustom ? customName.trim().toUpperCase() : selectedPreset
  const theme = getBankTheme(effectiveName || 'BCA')

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key)
    setError('')
    if (key === 'KARTU_KREDIT') {
      setCustomName('KARTU KREDIT')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!effectiveName) {
      setError('Nama akun atau bank wajib diisi')
      return
    }

    if (existingAccountNames.map(n => n.toUpperCase()).includes(effectiveName)) {
      setError(`Akun dengan nama "${effectiveName}" sudah ada di dompet kamu`)
      return
    }

    const numBalance = Number(balance) || 0

    setLoading(true)
    setError('')
    try {
      await insertAccount({
        account_name: effectiveName,
        current_balance: numBalance,
      })
      triggerRefresh()
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal menambahkan dompet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 z-10 space-y-5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Tambah Rekening / Dompet
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pilih bank, e-wallet, atau kartu kredit
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Live Card Preview */}
          <div className={`p-4 rounded-2xl border transition-all ${theme.bgClass} ${theme.borderClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BankLogo name={effectiveName || 'BCA'} size="md" />
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText}`}>
                    {theme.type === 'CREDIT_CARD' ? 'KARTU KREDIT' : theme.type === 'E_WALLET' ? 'E-WALLET' : theme.type === 'CASH' ? 'KAS TUNAI' : 'REKENING BANK'}
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {theme.label || effectiveName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-medium">Saldo Awal</p>
                <p className="text-sm font-mono font-black text-slate-900 dark:text-slate-100">
                  {formatRupiah(Number(balance) || 0)}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Pilih Bank / Layanan
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {PRESET_OPTIONS.map((p) => {
                  const active = selectedPreset === p.key
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handleSelectPreset(p.key)}
                      className={`p-2 rounded-xl flex flex-col items-center gap-1.5 text-center transition-all border ${
                        active
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <BankLogo name={p.key} size="sm" />
                      <span className="text-[11px] truncate w-full text-slate-800 dark:text-slate-200">
                        {p.label}
                      </span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setSelectedPreset('CUSTOM')}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all border ${
                    selectedPreset === 'CUSTOM'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
                  }`}
                >
                  <div className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                    +
                  </div>
                  <span className="text-[11px] text-slate-800 dark:text-slate-200">Lainnya</span>
                </button>
              </div>
            </div>

            {/* Custom Name input if 'CUSTOM' or 'KARTU_KREDIT' */}
            {(selectedPreset === 'CUSTOM' || selectedPreset === 'KARTU_KREDIT') && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Dompet / Bank Kustom
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Contoh: BANK BTN, PERMATA, LINKAJA, DLL"
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 uppercase"
                  required
                />
              </div>
            )}

            {/* Initial Balance */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {selectedPreset === 'KARTU_KREDIT' ? 'Saldo Terutang Saat Ini (Rp, 0 jika lunas)' : 'Saldo Awal (Rp)'}
              </label>
              <input
                type="number"
                step="1"
                placeholder="0"
                value={balance}
                onChange={(e) => {
                  setBalance(e.target.value)
                  if (error) setError('')
                }}
                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 font-bold"
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Tambahkan ke Dompet</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
