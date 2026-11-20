import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/config'

async function getAuthUser() {
  const cookieStore = await cookies()
  const sb = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
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
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = getAdmin()
    const userId = user.id

    // 1. Delete all associated user data across all tables
    await Promise.allSettled([
      admin.from('personal_liabilities').delete().eq('user_id', userId),
      admin.from('chat_messages').delete().eq('user_id', userId),
      admin.from('user_ai_rules').delete().eq('user_id', userId),
      admin.from('user_categories').delete().eq('user_id', userId),
      admin.from('transactions').delete().eq('user_id', userId),
      admin.from('budgets').delete().eq('user_id', userId),
      admin.from('goals').delete().eq('user_id', userId),
      admin.from('assets').delete().eq('user_id', userId),
      admin.from('accounts').delete().eq('user_id', userId),
      admin.from('profiles').delete().eq('id', userId),
    ])

    // 2. Delete user from auth.users via Supabase Admin API
    const { error: authErr } = await admin.auth.admin.deleteUser(userId)
    if (authErr) {
      console.error('Failed to delete auth user:', authErr.message)
      return NextResponse.json({ error: authErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Akun dan seluruh data berhasil dihapus permanen' })
  } catch (error: any) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: error?.message || 'Gagal menghapus akun' }, { status: 500 })
  }
}
