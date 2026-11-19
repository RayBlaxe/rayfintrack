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

// GET: Ambil kategori kustom milik pengguna aktif
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ categories: [] })
    }

    const admin = getAdmin()
    const { data, error } = await admin
      .from('user_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (!error && data) {
      return NextResponse.json({ categories: data })
    }

    const fallbackCategories = user.user_metadata?.custom_categories || []
    return NextResponse.json({ categories: fallbackCategories })
  } catch {
    return NextResponse.json({ categories: [] })
  }
}

// POST: Tambah atau update kategori kustom
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, emoji = '📦', color = '#6B7280', parent_category = null, budget_bucket = 'needs' } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })
    }

    const admin = getAdmin()
    const newCategory = {
      id: body.id || undefined,
      user_id: user.id,
      name: name.trim(),
      emoji: emoji.trim() || '📦',
      color: color.trim() || '#6B7280',
      parent_category: parent_category ? parent_category.trim() : null,
      budget_bucket: ['needs', 'wants', 'savings'].includes(budget_bucket) ? budget_bucket : 'needs',
      updated_at: new Date().toISOString()
    }

    const { data, error } = await admin
      .from('user_categories')
      .upsert(newCategory, { onConflict: 'user_id, name' })
      .select()
      .single()

    // Backup di user_metadata
    const currentCats = user.user_metadata?.custom_categories || []
    const updatedCats = [...currentCats.filter((c: any) => c.name !== newCategory.name), data || newCategory]
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        custom_categories: updatedCats
      }
    })

    return NextResponse.json({ category: data || newCategory })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Hapus kategori kustom
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const id = searchParams.get('id')

    if (!name && !id) {
      return NextResponse.json({ error: 'Name or id is required' }, { status: 400 })
    }

    const admin = getAdmin()
    if (id) {
      await admin.from('user_categories').delete().eq('user_id', user.id).eq('id', id)
    } else if (name) {
      await admin.from('user_categories').delete().eq('user_id', user.id).eq('name', name)
    }

    // Bersihkan di metadata
    const currentCats = user.user_metadata?.custom_categories || []
    const updatedCats = currentCats.filter((c: any) => (id ? c.id !== id : c.name !== name))
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        custom_categories: updatedCats
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
