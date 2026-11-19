import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

// GET: Ambil riwayat chat pengguna dari cloud
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = getAdmin()
    // 1. Coba dari tabel chat_messages
    const { data, error } = await admin
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      return NextResponse.json({ messages: data })
    }

    // 2. Fallback jika tabel belum dibuat di Supabase
    const fallbackMessages = user.user_metadata?.chat_history || []
    return NextResponse.json({ messages: fallbackMessages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Simpan satu pesan atau migrasi banyak pesan
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const admin = getAdmin()

    // Mode migrasi bulk pesan dari localStorage
    if (body.bulk && Array.isArray(body.messages)) {
      const rows = body.messages.map((m: any) => ({
        user_id: user.id,
        role: m.role,
        type: m.type || 'TEXT',
        content: m.content || '',
        draft: m.draft || null,
        saved: m.saved || false,
        created_at: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString()
      }))

      const { error } = await admin.from('chat_messages').insert(rows)
      if (error) {
        // Fallback simpan di user_metadata
        await admin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            chat_history: body.messages
          }
        })
      }
      return NextResponse.json({ success: true, count: rows.length })
    }

    // Simpan single message
    const { message } = body
    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    const row = {
      user_id: user.id,
      role: message.role,
      type: message.type || 'TEXT',
      content: message.content || '',
      draft: message.draft || null,
      saved: message.saved || false,
      created_at: message.timestamp ? new Date(message.timestamp).toISOString() : new Date().toISOString()
    }

    const { data, error } = await admin.from('chat_messages').insert(row).select().single()
    if (error) {
      // Fallback update user_metadata
      const currentHistory = user.user_metadata?.chat_history || []
      const updatedHistory = [...currentHistory.slice(-50), message]
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          chat_history: updatedHistory
        }
      })
      return NextResponse.json({ message, fallback: true })
    }

    return NextResponse.json({ message: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Hapus seluruh riwayat chat untuk pengguna aktif
export async function DELETE() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = getAdmin()
    await admin.from('chat_messages').delete().eq('user_id', user.id)

    // Bersihkan fallback di metadata jika ada
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        chat_history: []
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
