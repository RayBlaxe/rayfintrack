import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { CATEGORY_EMOJI, DEFAULT_AI_RULES } from '@/lib/constants'
import { SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY } from '@/lib/supabase/config'

const ACCOUNT_ENUM = [
  'BCA', 'CIMB_NIAGA', 'CIMB_OCTO_PAY', 'SEABANK', 'SHOPEEPAY',
  'GOPAY', 'DANA', 'CASH', 'MEGA_SYARIAH', 'HONEST_CARD', 'STOCKBIT', 'E-WALLET', 'OTHER'
]

const FLOW_ENUM = ['EXPENSE', 'INCOME', 'TRANSFER_INTERNAL']

async function getFinancialSnapshotAndUserRules() {
  try {
    const cookieStore = await cookies()
    const sb = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => { }
        }
      }
    )

    const { data: { user } } = await sb.auth.getUser()

    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const startDate = `${monthYear}-01`
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const endDate = `${monthYear}-${String(lastDay).padStart(2, '0')}`

    const [{ data: accounts }, { data: txns }, { data: budgets }, { data: rulesData }, { data: customCats }] = await Promise.all([
      sb.from('accounts').select('account_name, current_balance'),
      sb.from('transactions').select('flow_type, amount, category').gte('transaction_date', startDate).lte('transaction_date', endDate),
      sb.from('budgets').select('category, limit_amount').eq('month_year', monthYear),
      user?.id ? sb.from('user_ai_rules').select('rules_text').eq('user_id', user.id).single() : Promise.resolve({ data: null }),
      user?.id ? sb.from('user_categories').select('name').eq('user_id', user.id) : Promise.resolve({ data: null }),
    ])

    const balances = (accounts ?? []).map((a: any) => `${a.account_name}: Rp ${a.current_balance.toLocaleString('id-ID')}`).join(', ')
    const totalExpense = (txns ?? []).filter((t: any) => t.flow_type === 'EXPENSE').reduce((s: number, t: any) => s + Number(t.amount), 0)
    const totalIncome = (txns ?? []).filter((t: any) => t.flow_type === 'INCOME').reduce((s: number, t: any) => s + Number(t.amount), 0)
    const budgetSummary = (budgets ?? []).map((b: any) => `${b.category}: limit Rp ${b.limit_amount.toLocaleString('id-ID')}`).join(', ')

    // Build category list combining default categories with custom categories
    const defaultCategories = Object.keys(CATEGORY_EMOJI)
    const userCategories = (customCats ?? []).map((c: any) => c.name).filter(Boolean)
    const combinedCategories = Array.from(new Set([...defaultCategories, ...userCategories]))

    // Get custom user AI rules
    let userRulesText = rulesData?.rules_text
    if (!userRulesText && user?.user_metadata?.ai_rules) {
      userRulesText = user.user_metadata.ai_rules
    }
    if (!userRulesText) {
      userRulesText = DEFAULT_AI_RULES
    }

    const snapshot = `Saldo akun: ${balances}. Bulan ini: pemasukan Rp ${totalIncome.toLocaleString('id-ID')}, pengeluaran Rp ${totalExpense.toLocaleString('id-ID')}. Budget: ${budgetSummary || 'belum diset'}.`

    return {
      snapshot,
      userRulesText,
      categories: combinedCategories,
    }
  } catch {
    return {
      snapshot: 'Snapshot keuangan tidak tersedia.',
      userRulesText: DEFAULT_AI_RULES,
      categories: Object.keys(CATEGORY_EMOJI),
    }
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

    const { snapshot, userRulesText, categories } = await getFinancialSnapshotAndUserRules()

    const systemPrompt = `Kamu adalah RayFin AI Advisor — asisten keuangan pribadi cerdas dan akuntan pribadi.
Hari ini: ${dayName}, ${todayStr} (kemarin: ${yesterdayStr}).
Snapshot keuangan pengguna saat ini: ${snapshot}

DAFTAR KATEGORI VALID:
[${categories.join(', ')}]

ATURAN KHUSUS PENGGUNA (PRIORITAS TERTINGGI — WAJIB DIPATUHI):
${userRulesText}

ATURAN KATEGORISASI TRANSPORTASI & KENDARAAN:
- Setiap pengeluaran terkait kendaraan pengguna (bensin, pertalite, pertamax, servis berkala, ganti oli, cuci kendaraan, ban, sparepart, parkir, tol) WAJIB dimasukkan ke kategori "Transportasi", BUKAN "Operasional".
- Jika pengguna meminta kategori spesifik secara eksplisit (contoh: "masukin ke kategori operasional"), kamu WAJIB mengikuti kategori yang diminta pengguna!

ATURAN UTAMA & EKSTRAKSI TRANSAKSI:
1. Riwayat percakapan (history) HANYA digunakan sebagai referensi konteks untuk tanya-jawab keuangan (Q&A) dan kelanjutan percakapan.
2. JANGAN PERNAH mengekstrak atau membuat ulang draft transaksi dari pesan di dalam riwayat percakapan (history), terutama pesan yang sudah dijawab atau berlabel [SISTEM].
3. Ekstraksi draft transaksi BARU HANYA boleh diambil secara EKSKLUSIF dari PESAN TERAKHIR yang diawali dengan [LATEST_USER_INPUT_TO_PROCESS]!
4. Jika PESAN TERAKHIR pengguna berisi deskripsi transaksi baru:
   - Buat draft HANYA untuk transaksi baru tersebut.
   - Contoh: "beli bensin 30rb cash" → category: "Transportasi", description: "Bensin", amount: 30000, source_account: "CASH", flow_type: "EXPENSE".
   - Contoh: "servis motor ganti oli 85rb pake bca" → category: "Transportasi", description: "Servis Motor & Ganti Oli", amount: 85000, source_account: "BCA", flow_type: "EXPENSE".
5. FORMAT RESPONSE:
   - Jika pesan [LATEST_USER_INPUT_TO_PROCESS] mendeskripsikan transaksi keuangan baru (pengeluaran, pemasukan, transfer, atau bayar tagihan CC), kembalikan JSON:
     { "type": "TRANSACTION", "content": "konfirmasi singkat ramah", "draft": { "description": string, "amount": number, "category": string (pilih dari DAFTAR KATEGORI VALID), "source_account": string (pilih salah satu: ${ACCOUNT_ENUM.join(', ')}), "destination_account": string or null (pilih salah satu: ${ACCOUNT_ENUM.join(', ')}), "flow_type": string (pilih salah satu: ${FLOW_ENUM.join(', ')}), "transaction_date": "YYYY-MM-DD", "merchant_name": string or null } }
   - Jika pesan adalah pertanyaan keuangan biasa atau konsultasi, kembalikan JSON:
     { "type": "TEXT", "content": "jawaban analisis keuangan kamu yang solutif dan ramah" }
6. Selalu kembalikan HANYA JSON yang valid, tanpa pembungkus markdown codeblock (\`\`\`json) atau teks tambahan di luar JSON.
7. ATURAN TRANSFER & BAYAR KARTU KREDIT:
   - Jika user memindahkan saldo antar rekening/e-wallet, menarik dana dari RDN STOCKBIT ke BCA, atau membayar tagihan kartu kredit (MEGA_SYARIAH / HONEST_CARD): WAJIB gunakan flow_type = "TRANSFER_INTERNAL", category = "Transfer Internal", source_account = akun pengirim, dan destination_account = akun tujuan.
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

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
    let result: any
    try {
      result = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      })
    } catch (modelErr) {
      console.warn('Fallback to gemini-3.5-flash-lite:', modelErr)
      result = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      })
    }

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
        data.draft.transaction_date = todayStr
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[advisor]', error)
    return NextResponse.json(
      { type: 'TEXT', content: 'Maaf, ada masalah teknis dengan AI Advisor. Coba lagi ya! 🙏' },
      { status: 200 }
    )
  }
}
