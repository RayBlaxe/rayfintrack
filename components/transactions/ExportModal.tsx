'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, Table, FileSpreadsheet, Loader2, Calendar } from 'lucide-react'
import { Transaction } from '@/types'
import { exportCSV, exportExcel, exportPDF } from '@/lib/export'

interface Props {
  open: boolean
  onClose: () => void
  transactions: Transaction[]
}

type PeriodType = 'monthly' | 'weekly' | 'yearly' | 'custom'

export function ExportModal({ open, onClose, transactions }: Props) {
  const [period, setPeriod] = useState<PeriodType>('monthly')
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('excel')
  const [isExporting, setIsExporting] = useState(false)

  const today = useMemo(() => new Date(), [])
  const todayStr = useMemo(() => today.toISOString().slice(0, 10), [today])
  
  // Default 30 days ago for custom
  const thirtyDaysAgoStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().slice(0, 10)
  }, [])

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr)
  const [endDate, setEndDate] = useState(todayStr)

  // Filter transactions according to selected period
  const { filteredList, periodLabel } = useMemo(() => {
    const now = new Date()

    if (period === 'weekly') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const minDate = sevenDaysAgo.toISOString().slice(0, 10)
      const list = transactions.filter(t => t.transaction_date >= minDate && t.transaction_date <= todayStr)
      return { filteredList: list, periodLabel: `7 Hari Terakhir (${minDate} s/d ${todayStr})` }
    }

    if (period === 'monthly') {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const list = transactions.filter(t => t.transaction_date.startsWith(monthPrefix))
      const monthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      return { filteredList: list, periodLabel: `Bulan ${monthName}` }
    }

    if (period === 'yearly') {
      const yearPrefix = `${now.getFullYear()}-`
      const list = transactions.filter(t => t.transaction_date.startsWith(yearPrefix))
      return { filteredList: list, periodLabel: `Tahun ${now.getFullYear()}` }
    }

    // Custom
    const list = transactions.filter(t => t.transaction_date >= startDate && t.transaction_date <= endDate)
    return { filteredList: list, periodLabel: `${startDate} s/d ${endDate}` }
  }, [transactions, period, startDate, endDate, todayStr])

  if (!open) return null

  const handleExport = async () => {
    setIsExporting(true)
    const baseName = `transaksi-${period}-${todayStr}`

    try {
      if (format === 'csv') {
        exportCSV(filteredList, `${baseName}.csv`)
      } else if (format === 'excel') {
        await exportExcel(filteredList, `${baseName}.xlsx`)
      } else if (format === 'pdf') {
        await exportPDF(filteredList, `${baseName}.pdf`, periodLabel)
      }
      onClose()
    } catch (e: any) {
      alert(e.message || 'Gagal mengekspor data')
    } finally {
      setIsExporting(false)
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
          className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 space-y-4"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <Download className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Ekspor Data Transaksi</h2>
                <p className="text-xs text-slate-400">Download laporan pembukuan finansial</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 space-y-4">
            {/* Period Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Periode Waktu</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'monthly', label: 'Bulanan (Bulan Ini)' },
                  { id: 'weekly', label: 'Mingguan (7 Hari)' },
                  { id: 'yearly', label: 'Tahunan (Tahun Ini)' },
                  { id: 'custom', label: 'Rentang Kustom' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPeriod(item.id as PeriodType)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                      period === item.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range Inputs */}
            {period === 'custom' && (
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dari Tanggal</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-9 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Format Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Format File Ekspor</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('excel')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    format === 'excel'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="h-5 w-5 mb-1 text-emerald-600" />
                  <span className="text-xs font-bold">Excel</span>
                  <span className="text-[10px] text-slate-400">.xlsx</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    format === 'pdf'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="h-5 w-5 mb-1 text-rose-600" />
                  <span className="text-xs font-bold">PDF</span>
                  <span className="text-[10px] text-slate-400">.pdf</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    format === 'csv'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Table className="h-5 w-5 mb-1 text-blue-600" />
                  <span className="text-xs font-bold">CSV</span>
                  <span className="text-[10px] text-slate-400">.csv</span>
                </button>
              </div>
            </div>

            {/* Filter Summary Banner */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Total data terpilih:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {filteredList.length} transaksi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {periodLabel}
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 px-6 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || filteredList.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>{isExporting ? 'Membuat File...' : `Download ${format.toUpperCase()}`}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
