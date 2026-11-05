'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Save } from 'lucide-react'
import { Asset, AssetType, AssetStatus } from '@/types'
import { updateAsset } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'

interface Props {
  asset: Asset | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function EditAssetModal({ asset, open, onClose, onSaved }: Props) {
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState<AssetType>('INVESTASI')
  const [status, setStatus] = useState<AssetStatus>('AKTIF')
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (asset) {
      setAssetName(asset.asset_name || '')
      setAssetType(asset.asset_type || 'INVESTASI')
      setStatus(asset.status || 'AKTIF')
      setValue(String(asset.value || 0))
      setNotes(asset.notes || '')
      setError('')
    }
  }, [asset])

  if (!open || !asset) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const numVal = Number(value)
    if (isNaN(numVal) || numVal < 0) {
      setError('Nilai aset harus berupa angka valid (>= 0)')
      return
    }

    setLoading(true)
    setError('')
    try {
      await updateAsset(asset!.id, {
        asset_name: assetName.trim(),
        asset_type: assetType,
        status,
        value: numVal,
        notes: notes.trim() || null,
      })
      triggerRefresh()
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Gagal memperbarui data aset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 dark:text-slate-100 font-bold text-lg">Edit & Revaluasi Aset</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Sesuaikan status & nilai pasar terkini</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Nama Aset */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nama Aset / Portofolio</label>
              <input
                type="text"
                required
                value={assetName}
                onChange={e => setAssetName(e.target.value)}
                placeholder="Portofolio Saham BBCA, MacBook Pro..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Tipe & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tipe Aset</label>
                <select
                  value={assetType}
                  onChange={e => setAssetType(e.target.value as AssetType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="INVESTASI">Investasi (Saham/Kripto)</option>
                  <option value="TETAP">Aset Tetap (Gadget/Barang)</option>
                  <option value="LIKUID">Kas / Deposito</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Status Kepemilikan</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as AssetStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="AKTIF">🟢 AKTIF</option>
                  <option value="TERJUAL">🟡 TERJUAL</option>
                  <option value="DILIKUIDASI">🔴 DILIKUIDASI</option>
                </select>
              </div>
            </div>

            {/* Nilai Aset */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Nilai Pasar Terkini / Nilai Buku (Rp)
              </label>
              <input
                type="number"
                required
                min="0"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="779200"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                Ubah nominal ini jika ingin menyesuaikan perubahan harga saham atau memperbaiki salah input.
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Catatan Tambahan (Opsional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Misal: Saldo RDN Rp 0, saham ongoing..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Submit buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
