import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { title, type = 'technical', difficulty = 'medium', target_role } = body

    let sessionTitle = title?.trim() || `Mock_Test ${Date.now().toString().slice(-4)}`
    if (target_role && !sessionTitle.toLowerCase().includes(target_role.toLowerCase())) {
      sessionTitle = `Targeted: ${target_role} — ${sessionTitle}`
    }

    const payload = {
      user_id: user.id,
      title: sessionTitle,
      type,
      difficulty,
      status: 'in_progress',
    }

    // Primary: Insert via supabaseAdmin for guaranteed delivery without RLS / schema role mismatches
    const { data: adminData, error: adminErr } = await supabaseAdmin
      .from('interviews')
      .insert(payload)
      .select()
      .single()

    if (adminData && !adminErr) {
      return NextResponse.json({ success: true, interview: adminData })
    }

    if (adminErr) {
      console.warn('[POST /api/interviews/create] Admin insert failed, trying client insert:', adminErr)
    }

    // Fallback: Insert via user-authenticated supabase client
    const { data: clientData, error: clientErr } = await supabase
      .from('interviews')
      .insert(payload)
      .select()
      .single()

    if (clientErr) {
      throw clientErr
    }

    return NextResponse.json({ success: true, interview: clientData })
  } catch (error: any) {
    console.error('[POST /api/interviews/create] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create interview session' },
      { status: 500 }
    )
  }
}
