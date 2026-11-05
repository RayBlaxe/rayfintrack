'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AssetType } from '@/types'
import { insertAsset } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const ASSET_TYPES: { type: AssetType; label: string; icon: string }[] = [
  { type: 'LIKUID', label: 'Kas & Rekening Likuid', icon: '💵' },
  { type: 'INVESTASI', label: 'Investasi (Saham / Reksadana / Emas)', icon: '📈' },
  { type: 'TETAP', label: 'Aset Tetap (Elektronik / Kendaraan / Properti)', icon: '💻' },
]

export function AddAssetModal({ open, onClose, onCreated }: Props) {
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState<AssetType>('INVESTASI')
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''))
    if (!assetName.trim() || isNaN(numericValue) || numericValue < 0) {
      setError('Masukkan nama aset dan nilai yang valid.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await insertAsset({
        asset_name: assetName.trim(),
        asset_type: assetType,
        value: numericValue,
        notes: notes.trim() || null,
      })
      triggerRefresh()
      setAssetName('')
      setValue('')
      setNotes('')
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan aset')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-slate-50 font-bold">Tambah Aset Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs mb-2">Tipe Aset</p>
            <div className="grid grid-cols-1 gap-2">
              {ASSET_TYPES.map((t) => {
                const selected = assetType === t.type
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setAssetType(t.type)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs transition-all ${
                      selected
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-2 border-emerald-600 dark:border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1.5">Nama Aset</p>
            <Input
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="Contoh: RDN Stockbit, Emas Antam, MacBook Pro"
            />
          </div>

          <div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1.5">Nilai / Estimasi Harga (Rp)</p>
            <Input
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Contoh: 15000000"
            />
          </div>

          <div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1.5">Catatan (opsional)</p>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Investasi jangka panjang / aset produktif"
            />
          </div>

          {error && <p className="text-red-600 dark:text-red-400 text-xs font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Aset 🏦'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
