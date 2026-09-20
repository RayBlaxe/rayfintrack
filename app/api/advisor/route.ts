import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const ACCOUNT_ENUM = ['BCA','CIMB_NIAGA','CIMB_OCTO_PAY','SEABANK','SHOPEEPAY','GOPAY','DANA','CASH','MEGA_SYARIAH','E-WALLET','OTHER']
const CATEGORY_ENUM = ['Makanan & Minuman','Belanja Online','Hiburan','Kesehatan','Pendidikan','Rumah Tangga','Operasional','Cicilan','Komitmen Keluarga','Lifestyle & Dating','Gaji','Freelance','Investasi','Lainnya']
const FLOW_ENUM = ['EXPENSE','INCOME','TRANSFER_INTERNAL']

async function getFinancialSnapshot() {
  try {
    const cookieStore = await cookies()
    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { 
        cookies: { 
          getAll: () => cookieStore.getAll(),
          setAll: () => {} 
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
    const totalIncome  = (txns ?? []).filter((t: any) => t.flow_type === 'INCOME').reduce((s: number, t: any) => s + Number(t.amount), 0)
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

    const snapshot = await getFinancialSnapshot()

    const systemPrompt = `Kamu adalah RayFin AI — asisten keuangan pribadi yang cerdas, jujur, dan supel.
Data keuangan real-time pengguna: ${snapshot}

Instruksi penting:
1. Jika pesan mendeskripsikan transaksi keuangan (pembelian, pengeluaran, pemasukan, transfer), kembalikan JSON:
   { "type": "TRANSACTION", "content": "konfirmasi singkat", "draft": { "description": string, "amount": number, "category": string (dari: ${CATEGORY_ENUM.join(',')}), "source_account": string (dari: ${ACCOUNT_ENUM.join(',')}), "flow_type": string (dari: ${FLOW_ENUM.join(',')}), "transaction_date": "YYYY-MM-DD", "merchant_name": string or null } }
2. Jika pertanyaan konsultasi/umum, kembalikan JSON:
   { "type": "TEXT", "content": "jawaban helpful dalam bahasa Indonesia, friendly tapi profesional, max 3 paragraf" }
3. Selalu gunakan data keuangan real-time dalam jawaban.
4. Untuk transfer: source_account = sumber dana, flow_type = TRANSFER_INTERNAL.
5. Format amount sebagai angka murni (tanpa simbol, tanpa koma ribuan).
Kembalikan HANYA JSON valid, tidak ada teks lain.`

    const contents = [
      ...history.map((h: any) => ({ role: h.role, parts: [{ text: h.content }] })),
      { role: 'user', parts: [{ text: message }] },
    ]

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
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

    // Add today's date to draft if missing
    if (data.type === 'TRANSACTION' && data.draft && !data.draft.transaction_date) {
      data.draft.transaction_date = new Date().toISOString().split('T')[0]
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
