import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: questions, error } = await supabaseAdmin
      .from('interview_questions')
      .select('*')
      .eq('interview_id', id)
      .order('sequence_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ questions })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: interview } = await supabaseAdmin
      .from('interviews')
      .select('id, user_id, type, difficulty')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    const body = await req.json()
    const rawQuestions: any[] = Array.isArray(body.questions) ? body.questions : []

    if (rawQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('interview_questions')
      .select('id, sequence_order')
      .eq('interview_id', id)

    const existingOrders = new Set((existing || []).map((e) => e.sequence_order))

    const toInsert = rawQuestions
      .map((q, idx) => {
        const order = q.sequence_order !== undefined ? q.sequence_order : idx
        if (existingOrders.has(order)) return null
        return {
          interview_id: id,
          question_text: q.text || q.question_text || '',
          question_type: q.type || q.question_type || interview.type || 'technical',
          topic: q.topic || q.topicTag || 'General',
          difficulty: q.difficulty || interview.difficulty || 'medium',
          user_answer: q.user_answer || '',
          ai_evaluation: q.ai_evaluation || null,
          sequence_order: order,
          time_taken_seconds: q.time_taken_seconds || 0,
        }
      })
      .filter(Boolean)

    if (toInsert.length > 0) {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from('interview_questions')
        .insert(toInsert as any)
        .select('*')

      if (insertErr) {
        console.error('[POST /api/interviews/[id]/questions] Error inserting:', insertErr)
        return NextResponse.json({ error: insertErr.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, count: inserted?.length || 0, questions: inserted })
    }

    return NextResponse.json({ success: true, count: 0, message: 'Questions already recorded' })
  } catch (err: any) {
    console.error('[POST /api/interviews/[id]/questions] Exception:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
