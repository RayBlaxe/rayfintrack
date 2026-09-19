'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AssetType } from '@/types'
import { ASSET_TYPE_LABELS } from '@/lib/constants'
import { insertAsset } from '@/lib/queries'
import { triggerRefresh } from '@/lib/realtimeEvents'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

const ASSET_TYPES: { type: AssetType; label: string; icon: string }[] = [
  { type: 'LIKUID', label: 'Likuid (Kas/Rekening)', icon: '💵' },
  { type: 'INVESTASI', label: 'Investasi (Saham/Reksadana/Kripto/Emas)', icon: '📈' },
  { type: 'TETAP', label: 'Aset Tetap (Kendaraan/Properti/Elektronik)', icon: '🏠' },
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Aset Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-white/50 text-xs mb-2">Tipe Aset</p>
            <div className="grid grid-cols-1 gap-2">
              {ASSET_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setAssetType(t.type)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left text-xs font-medium transition-all ${
                    assetType === t.type
                      ? 'bg-[#CCFF00] text-black font-semibold'
                      : 'bg-white/5 text-white/70 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white/50 text-xs mb-1.5">Nama Aset</p>
            <Input
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="Contoh: RDN Bibit, Emas Antam 10g, Motor Honda"
            />
          </div>

          <div>
            <p className="text-white/50 text-xs mb-1.5">Nilai / Estimasi Harga (Rp)</p>
            <Input
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Contoh: 15000000"
            />
          </div>

          <div>
            <p className="text-white/50 text-xs mb-1.5">Catatan (opsional)</p>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Beli tahun 2024, di simpan di brankas"
            />
          </div>

          {error && <p className="text-[#FF85A1] text-xs">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-[#CCFF00] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Aset 🏦'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
