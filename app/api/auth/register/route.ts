import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Data registrasi tidak lengkap' }, { status: 400 })
    }

    const formattedUsername = username.trim().toLowerCase()

    // Gunakan Service Role Key untuk bypass Email Confirmation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Buat user langsung terverifikasi (email_confirm: true)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: formattedUsername }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data?.user) {
      // 2. Insert row ke tabel profiles
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: data.user.id,
          username: formattedUsername,
          email,
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('Failed to create profile row:', profileError.message)
      }
    }

    return NextResponse.json({ user: data.user }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
