import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Score over time (last 30 interviews)
  const { data: scoreOverTime } = await supabase
    .from('interviews')
    .select('overall_score, created_at, type')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: true })
    .limit(30)

  // Interview type breakdown
  const { data: allInterviews } = await supabase
    .from('interviews')
    .select('type')
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const typeBreakdown: Record<string, number> = {}
  for (const i of allInterviews ?? []) {
    typeBreakdown[i.type] = (typeBreakdown[i.type] ?? 0) + 1
  }

  // Topic weakness heatmap
  const { data: weaknesses } = await supabase
    .from('user_weaknesses')
    .select('topic, weakness_score, occurrence_count')
    .eq('user_id', user.id)
    .order('weakness_score', { ascending: true })
    .limit(10)

  // Time per question (average per interview)
  const { data: questionTimes } = await supabase
    .from('interview_questions')
    .select('time_taken_seconds, interview_id, interviews!inner(user_id, created_at)')
    .eq('interviews.user_id', user.id)
    .limit(200)

  // Rolling improvement (7-session average)
  const scores = (scoreOverTime ?? []).map(i => i.overall_score ?? 0)
  const rollingAvg: number[] = []
  for (let i = 0; i < scores.length; i++) {
    const window = scores.slice(Math.max(0, i - 6), i + 1)
    rollingAvg.push(Math.round(window.reduce((a, b) => a + b, 0) / window.length))
  }

  return NextResponse.json({
    scoreOverTime: (scoreOverTime ?? []).map((i, idx) => ({
      date: new Date(i.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      score: i.overall_score ?? 0,
      rollingAvg: rollingAvg[idx],
      type: i.type,
    })),
    typeBreakdown: Object.entries(typeBreakdown).map(([name, value]) => ({ name, value })),
    weaknesses: (weaknesses ?? []).map(w => ({
      topic: w.topic,
      score: w.weakness_score,
      count: w.occurrence_count,
    })),
    totalInterviews: allInterviews?.length ?? 0,
    avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
  })
}
