import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const VALID_TYPES = ['technical', 'behavioral', 'system_design', 'coding'] as const
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { title, type = 'technical', difficulty = 'medium', target_role } = body

    const targetRoleValue = (typeof target_role === 'string' ? target_role.trim() : '') || 'Software Engineer'

    let sessionTitle = title?.trim() || `Mock_Session ${Date.now().toString().slice(-4)}`
    if (targetRoleValue && !sessionTitle.toLowerCase().includes(targetRoleValue.toLowerCase())) {
      sessionTitle = `Targeted: ${targetRoleValue} — ${sessionTitle}`
    }

    const dbType = VALID_TYPES.includes(type as any) ? type : 'technical'
    const dbDifficulty = VALID_DIFFICULTIES.includes(difficulty as any) ? difficulty : 'medium'

    const basePayload = {
      user_id: user.id,
      title: sessionTitle,
      type: dbType,
      difficulty: dbDifficulty,
      status: 'in_progress',
    }

    let createdInterview: any = null

    // 1. Primary: Insert via supabaseAdmin for guaranteed delivery without RLS / schema role mismatches
    const adminResult = await supabaseAdmin
      .from('interviews')
      .insert(basePayload)
      .select()
      .single()

    if (adminResult.data && !adminResult.error) {
      createdInterview = adminResult.data
    } else {
      if (adminResult.error) {
        console.warn('[POST /api/interviews/create] Admin insert failed, trying client insert:', adminResult.error)
      }

      // 2. Fallback: Insert via user-authenticated supabase client
      const clientResult = await supabase
        .from('interviews')
        .insert(basePayload)
        .select()
        .single()

      if (clientResult.error) {
        throw clientResult.error
      }
      createdInterview = clientResult.data
    }

    if (!createdInterview) {
      throw new Error('Failed to create interview record')
    }

    // Best-effort: sync target_role to user profile
    if (targetRoleValue) {
      Promise.resolve(
        supabaseAdmin
          .from('profiles')
          .update({ target_role: targetRoleValue })
          .eq('id', user.id)
      ).catch(() => {})

      // Best-effort: update target_role column on interviews if it exists in DB schema
      Promise.resolve(
        supabaseAdmin
          .from('interviews')
          .update({ target_role: targetRoleValue })
          .eq('id', createdInterview.id)
      ).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      interview: {
        ...createdInterview,
        type: type, // preserve requested simulation type ('mixed', etc.) for the client
        target_role: targetRoleValue,
      },
    })
  } catch (error: any) {
    console.error('[POST /api/interviews/create] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create interview session' },
      { status: 500 }
    )
  }
}
