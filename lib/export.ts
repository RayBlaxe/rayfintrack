import { Transaction } from '@/types'
import { ACCOUNT_LABELS } from '@/lib/constants'

// Format data row for export
function formatRows(transactions: Transaction[]) {
  return transactions.map(t => ({
    Tanggal: t.transaction_date,
    Deskripsi: t.description || '-',
    Kategori: t.category,
    Subkategori: t.subcategory || '-',
    Tipe: t.flow_type === 'EXPENSE' ? 'Pengeluaran' : t.flow_type === 'INCOME' ? 'Pemasukan' : 'Transfer',
    Akun_Sumber: ACCOUNT_LABELS[t.source_account] || t.source_account,
    Akun_Tujuan: t.destination_account ? (ACCOUNT_LABELS[t.destination_account] || t.destination_account) : '-',
    Nominal: t.amount,
    Merchant: t.merchant_name || '-'
  }))
}

// 1. Export CSV
export function exportCSV(transactions: Transaction[], filename = 'transaksi-rayfin.csv') {
  const rows = formatRows(transactions)
  if (rows.length === 0) {
    alert('Tidak ada transaksi untuk diekspor pada periode ini.')
    return
  }

  const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Subkategori', 'Tipe', 'Akun Sumber', 'Akun Tujuan', 'Nominal (Rp)', 'Merchant']
  const csvLines = [
    headers.join(','),
    ...rows.map(r => [
      `"${r.Tanggal}"`,
      `"${r.Deskripsi.replace(/"/g, '""')}"`,
      `"${r.Kategori}"`,
      `"${r.Subkategori}"`,
      `"${r.Tipe}"`,
      `"${r.Akun_Sumber}"`,
      `"${r.Akun_Tujuan}"`,
      r.Nominal,
      `"${r.Merchant.replace(/"/g, '""')}"`
    ].join(','))
  ]

  const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 2. Export Excel (XLSX via SheetJS)
export async function exportExcel(transactions: Transaction[], filename = 'transaksi-rayfin.xlsx') {
  const rows = formatRows(transactions)
  if (rows.length === 0) {
    alert('Tidak ada transaksi untuk diekspor pada periode ini.')
    return
  }

  const XLSX = await import('xlsx')
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi')

  // Auto column width
  const max_width = rows.reduce((w, r) => Math.max(w, (r.Deskripsi || '').length), 10)
  worksheet['!cols'] = [
    { wch: 12 }, // Tanggal
    { wch: Math.min(Math.max(max_width, 15), 35) }, // Deskripsi
    { wch: 18 }, // Kategori
    { wch: 15 }, // Subkategori
    { wch: 12 }, // Tipe
    { wch: 14 }, // Akun Sumber
    { wch: 14 }, // Akun Tujuan
    { wch: 14 }, // Nominal
    { wch: 18 }, // Merchant
  ]

  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

// 3. Export PDF (via jsPDF + jspdf-autotable)
export async function exportPDF(transactions: Transaction[], filename = 'transaksi-rayfin.pdf', periodTitle = 'Laporan Transaksi') {
  if (transactions.length === 0) {
    alert('Tidak ada transaksi untuk diekspor pada periode ini.')
    return
  }

  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  // Title & Metadata
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42) // slate-900
  doc.text('RayFin 2.0 — Buku Kas Personal', 14, 15)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139) // slate-500
  doc.text(`Periode: ${periodTitle} | Total: ${transactions.length} transaksi`, 14, 22)
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`, 14, 28)

  const headers = [['No', 'Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Akun', 'Nominal (Rp)']]
  const body = transactions.map((t, idx) => [
    idx + 1,
    t.transaction_date,
    t.description || '-',
    t.subcategory ? `${t.category} (${t.subcategory})` : t.category,
    t.flow_type === 'EXPENSE' ? 'Pengeluaran' : t.flow_type === 'INCOME' ? 'Pemasukan' : 'Transfer',
    ACCOUNT_LABELS[t.source_account] || t.source_account,
    `Rp ${t.amount.toLocaleString('id-ID')}`
  ])

  const totalExpense = transactions.filter(t => t.flow_type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const totalIncome = transactions.filter(t => t.flow_type === 'INCOME').reduce((s, t) => s + t.amount, 0)

  autoTable(doc, {
    head: headers,
    body: body,
    startY: 34,
    theme: 'striped',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    headStyles: {
      fillColor: [5, 150, 105], // emerald-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 24 },
      2: { cellWidth: 70 },
      3: { cellWidth: 45 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
      6: { cellWidth: 35, halign: 'right' },
    },
    foot: [[
      '',
      '',
      `Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}`,
      `Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}`,
      '',
      'Total Net:',
      `Rp ${(totalIncome - totalExpense).toLocaleString('id-ID')}`
    ]],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
    }
  })

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}
