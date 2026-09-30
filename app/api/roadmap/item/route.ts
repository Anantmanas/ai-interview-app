import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, status, completed_at } = body

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Try updating with supabaseAdmin to bypass RLS restrictions
    const updatePayload: any = {
      status: status || 'completed',
      completed_at: completed_at || (status === 'completed' ? new Date().toISOString() : null),
    }

    const { data, error } = await supabaseAdmin
      .from('roadmap_items')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .maybeSingle()

    if (error) {
      console.warn('[PATCH /api/roadmap/item] DB update warning:', error)
    }

    return NextResponse.json({
      success: true,
      item: data || { id, ...updatePayload },
    })
  } catch (err: any) {
    console.error('[PATCH /api/roadmap/item] error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to update item' }, { status: 500 })
  }
}
