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

    const basePayload = {
      user_id: user.id,
      title: sessionTitle,
      type,
      difficulty,
      status: 'in_progress',
    }

    const payload = {
      ...basePayload,
      target_role: target_role || null,
    }

    // Primary: Insert via supabaseAdmin for guaranteed delivery without RLS / schema role mismatches
    let adminResult = await supabaseAdmin
      .from('interviews')
      .insert(payload)
      .select()
      .single()

    // If target_role column does not exist in schema cache, retry without target_role
    if (adminResult.error && (adminResult.error.message?.includes('target_role') || adminResult.error.code === 'PGRST204')) {
      adminResult = await supabaseAdmin
        .from('interviews')
        .insert(basePayload)
        .select()
        .single()
    }

    if (adminResult.data && !adminResult.error) {
      return NextResponse.json({ success: true, interview: adminResult.data })
    }

    if (adminResult.error) {
      console.warn('[POST /api/interviews/create] Admin insert failed, trying client insert:', adminResult.error)
    }

    // Fallback: Insert via user-authenticated supabase client
    let clientResult = await supabase
      .from('interviews')
      .insert(payload)
      .select()
      .single()

    // If target_role column does not exist in schema cache, retry without target_role
    if (clientResult.error && (clientResult.error.message?.includes('target_role') || clientResult.error.code === 'PGRST204')) {
      clientResult = await supabase
        .from('interviews')
        .insert(basePayload)
        .select()
        .single()
    }

    if (clientResult.error) {
      throw clientResult.error
    }

    return NextResponse.json({ success: true, interview: clientResult.data })
  } catch (error: any) {
    console.error('[POST /api/interviews/create] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create interview session' },
      { status: 500 }
    )
  }
}
