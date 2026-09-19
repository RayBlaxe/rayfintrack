import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ACCOUNT_ENUM = ['BCA','CIMB_NIAGA','CIMB_OCTO_PAY','SEABANK','SHOPEEPAY','GOPAY','DANA','CASH','MEGA_SYARIAH','OTHER']
const CATEGORY_ENUM = ['Makanan & Minuman','Belanja Online','Hiburan','Kesehatan','Pendidikan','Rumah Tangga','Operasional','Cicilan','Komitmen Keluarga','Lifestyle & Dating','Lainnya']

const PROMPT = `Analisis struk/nota ini dan ekstrak informasi transaksi.
Kembalikan HANYA JSON dengan struktur:
{
  "merchant_name": string or null,
  "amount": number (total yang dibayar, tanpa simbol mata uang),
  "category": string (pilih dari: ${CATEGORY_ENUM.join(', ')}),
  "transaction_date": string (format YYYY-MM-DD, default hari ini jika tidak terlihat),
  "description": string (deskripsi singkat transaksi),
  "source_account": string (tebak metode bayar: ${ACCOUNT_ENUM.join(', ')}, default OTHER),
  "confidence": string (HIGH jika semua jelas, MEDIUM jika ada tebakan, LOW jika tidak yakin)
}
Jika bukan struk/nota, kembalikan { "error": "Bukan struk yang valid" }.`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: PROMPT },
        ],
      }],
      config: { responseMimeType: 'application/json' },
    })

    const text = result.text ?? '{}'
    const data = JSON.parse(text)

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 422 })
    }

    // Add today's date if missing
    if (!data.transaction_date) {
      data.transaction_date = new Date().toISOString().split('T')[0]
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[scan-receipt]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
