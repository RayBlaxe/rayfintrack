import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { DEFAULT_AI_RULES } from '@/lib/constants'

async function getAuthUser() {
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
  const { data: { user } } = await sb.auth.getUser()
  return user
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: Ambil aturan AI pengguna
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ rules_text: DEFAULT_AI_RULES })
    }

    const admin = getAdmin()
    const { data, error } = await admin
      .from('user_ai_rules')
      .select('rules_text')
      .eq('user_id', user.id)
      .single()

    if (!error && data?.rules_text) {
      return NextResponse.json({ rules_text: data.rules_text })
    }

    if (user.user_metadata?.ai_rules) {
      return NextResponse.json({ rules_text: user.user_metadata.ai_rules })
    }

    return NextResponse.json({ rules_text: DEFAULT_AI_RULES })
  } catch {
    return NextResponse.json({ rules_text: DEFAULT_AI_RULES })
  }
}

// POST: Simpan aturan AI kustom
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rules_text } = await request.json()
    const admin = getAdmin()

    // 1. Simpan ke tabel user_ai_rules
    const { error } = await admin
      .from('user_ai_rules')
      .upsert({
        user_id: user.id,
        rules_text: rules_text || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    // 2. Simpan juga ke user_metadata sebagai cadangan
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        ai_rules: rules_text || ''
      }
    })

    return NextResponse.json({ success: true, rules_text })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
