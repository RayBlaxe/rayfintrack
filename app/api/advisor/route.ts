import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ACCOUNT_ENUM = [
  'BCA', 'CIMB_NIAGA', 'CIMB_OCTO_PAY', 'SEABANK', 'SHOPEEPAY',
  'GOPAY', 'DANA', 'CASH', 'MEGA_SYARIAH', 'HONEST_CARD', 'STOCKBIT', 'E-WALLET', 'OTHER'
]
const CATEGORY_ENUM = [
  'Makanan & Minuman', 'Belanja Online', 'Hiburan', 'Kesehatan', 'Pendidikan',
  'Rumah Tangga', 'Operasional', 'Cicilan', 'Komitmen Keluarga', 'Lifestyle & Dating',
  'Transfer Internal', 'Gaji', 'Freelance', 'Investasi', 'Lainnya'
]
const FLOW_ENUM = ['EXPENSE', 'INCOME', 'TRANSFER_INTERNAL']

async function getFinancialSnapshot() {
  try {
    const cookieStore = await cookies()
    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => { }
        }
      }
    )
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const startDate = `${monthYear}-01`
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const endDate = `${monthYear}-${String(lastDay).padStart(2, '0')}`

    const [{ data: accounts }, { data: txns }, { data: budgets }] = await Promise.all([
      sb.from('accounts').select('account_name, current_balance'),
      sb.from('transactions').select('flow_type, amount, category').gte('transaction_date', startDate).lte('transaction_date', endDate),
      sb.from('budgets').select('category, limit_amount').eq('month_year', monthYear),
    ])

    const balances = (accounts ?? []).map((a: any) => `${a.account_name}: Rp ${a.current_balance.toLocaleString('id-ID')}`).join(', ')
    const totalExpense = (txns ?? []).filter((t: any) => t.flow_type === 'EXPENSE').reduce((s: number, t: any) => s + Number(t.amount), 0)
    const totalIncome = (txns ?? []).filter((t: any) => t.flow_type === 'INCOME').reduce((s: number, t: any) => s + Number(t.amount), 0)
    const budgetSummary = (budgets ?? []).map((b: any) => `${b.category}: limit Rp ${b.limit_amount.toLocaleString('id-ID')}`).join(', ')

    return `Saldo akun: ${balances}. Bulan ini: pemasukan Rp ${totalIncome.toLocaleString('id-ID')}, pengeluaran Rp ${totalExpense.toLocaleString('id-ID')}. Budget: ${budgetSummary || 'belum diset'}.`
  } catch {
    return 'Snapshot keuangan tidak tersedia.'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const now = new Date()
    const todayStr = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' }) // format YYYY-MM-DD
    const dayName = now.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long' })
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayStr = yesterdayDate.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' })

    const snapshot = await getFinancialSnapshot()

    const systemPrompt = `Kamu adalah RayFin AI Advisor — asisten keuangan pribadi cerdas dan akuntan pribadi.
Hari ini: ${dayName}, ${todayStr} (kemarin: ${yesterdayStr}).
Snapshot keuangan pengguna saat ini: ${snapshot}

ATURAN UTAMA & EKSTRAKSI TRANSAKSI (SANGAT KRITIKAL):
1. Riwayat percakapan (history) HANYA digunakan sebagai referensi konteks untuk tanya-jawab keuangan (Q&A) dan kelanjutan percakapan.
2. JANGAN PERNAH mengekstrak atau membuat ulang draft transaksi dari pesan di dalam riwayat percakapan (history), terutama pesan yang sudah dijawab atau berlabel [SISTEM]. Seluruh transaksi terdahulu sudah selesai dibukukan.
3. Ekstraksi draft transaksi BARU HANYA boleh diambil secara EKSKLUSIF dari PESAN TERAKHIR yang diawali dengan [LATEST_USER_INPUT_TO_PROCESS]!
4. Jika PESAN TERAKHIR pengguna berisi deskripsi transaksi baru (misal: "kemarin malem aku beli bensin untuk supra 30k pake uang cash"):
   - Buat draft HANYA untuk transaksi baru tersebut (misal: nominal 30000, description "Bensin Supra", category "Operasional", source_account "CASH", flow_type "EXPENSE", transaction_date "${yesterdayStr}").
   - JANGAN PERNAH menyertakan, menggabungkan, atau memunculkan ulang transaksi dari pesan-pesan sebelumnya (seperti freelance ISEF Family Run Rp 585rb, dsb).
5. FORMAT RESPONSE:
   - Jika pesan [LATEST_USER_INPUT_TO_PROCESS] mendeskripsikan transaksi keuangan baru (pembelian, pengeluaran, pemasukan, transfer, atau bayar tagihan CC), kembalikan JSON:
     { "type": "TRANSACTION", "content": "konfirmasi singkat ramah", "draft": { "description": string, "amount": number, "category": string (pilih salah satu: ${CATEGORY_ENUM.join(', ')}), "source_account": string (pilih salah satu: ${ACCOUNT_ENUM.join(', ')}), "destination_account": string or null (pilih salah satu: ${ACCOUNT_ENUM.join(', ')}), "flow_type": string (pilih salah satu: ${FLOW_ENUM.join(', ')}), "transaction_date": "YYYY-MM-DD", "merchant_name": string or null } }
   - Jika pesan adalah pertanyaan keuangan biasa atau obrolan, kembalikan JSON:
     { "type": "TEXT", "content": "jawaban analisis keuangan kamu yang solutif dan ramah" }
6. Selalu kembalikan HANYA JSON yang valid, tanpa pembungkus markdown codeblock (\`\`\`json) atau teks tambahan di luar JSON.
7. ATURAN TRANSFER & BAYAR KARTU KREDIT (ANTI DOUBLE-COUNTING):
   - Jika user memindahkan saldo antar rekening/e-wallet, menarik dana dari RDN STOCKBIT ke BCA, atau membayar tagihan kartu kredit (MEGA_SYARIAH / HONEST_CARD): WAJIB gunakan flow_type = "TRANSFER_INTERNAL", category = "Transfer Internal", source_account = akun pengirim, dan destination_account = akun tujuan.
   - JANGAN PERNAH gunakan flow_type "EXPENSE" atau "INCOME" untuk pembayaran tagihan CC atau transfer antar rekening.
8. ATURAN TANGGAL:
   - Jika user menyebut "kemarin" atau "tadi malam", gunakan "${yesterdayStr}".
   - Jika user tidak menyebut tanggal spesifik, default transaction_date ke hari ini "${todayStr}".`

    // Build normalized alternating turns for Gemini
    const historyList = (history || []).map((h: any) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(h.content || '') }]
    }))

    const contents: any[] = []
    for (const item of historyList) {
      if (!item.parts[0].text.trim()) continue
      if (contents.length > 0 && contents[contents.length - 1].role === item.role) {
        // Merge consecutive messages with same role
        contents[contents.length - 1].parts[0].text += `\n${item.parts[0].text}`
      } else {
        contents.push(item)
      }
    }

    const currentPromptText = `[LATEST_USER_INPUT_TO_PROCESS]: ${message}`
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n${currentPromptText}`
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: currentPromptText }]
      })
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    })

    const text = result.text ?? '{}'
    const data = JSON.parse(text)

    if (!data.type || !['TRANSACTION', 'TEXT'].includes(data.type)) {
      return NextResponse.json({
        type: 'TEXT',
        content: text || 'Maaf, ada masalah memproses permintaan.'
      })
    }

    // Ensure transaction_date is valid and not a hallucinated old year
    if (data.type === 'TRANSACTION' && data.draft) {
      const draftDate = data.draft.transaction_date
      if (!draftDate || !/^\d{4}-\d{2}-\d{2}$/.test(draftDate) || draftDate.startsWith('2023') || draftDate.startsWith('2024') || draftDate.startsWith('2025')) {
        // Fallback to today's date if date is missing or looks like a hallucinated past year
        data.draft.transaction_date = todayStr
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[advisor]', error)
    return NextResponse.json(
      { type: 'TEXT', content: 'Maaf, ada masalah teknis. Coba lagi ya! 🙏' },
      { status: 200 } // Always 200 so UI can show the error message
    )
  }
}
