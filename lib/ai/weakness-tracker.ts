import { supabaseAdmin } from '@/lib/supabase/admin'

export interface QuestionEvaluation {
  topic: string
  score: number
  subtopic?: string
  feedback?: string
}

/**
 * Updates user weakness scores after interview answer evaluation.
 * Calculates weakness = (100 - score) and applies exponential decay
 * weighting recent performance (70%) vs historical (30%).
 */
export async function updateWeaknessScores(userId: string, evaluations: QuestionEvaluation[]) {
  for (const ev of evaluations) {
    if (!ev.topic) continue
    const weaknessScore = Math.max(0, Math.min(100, 100 - ev.score)) // higher score = weaker

    const { data: existing } = await supabaseAdmin
      .from('user_weaknesses')
      .select('*')
      .eq('user_id', userId)
      .eq('topic', ev.topic)
      .maybeSingle()

    if (existing) {
      // Exponential decay: recent performance weighted 70%, historical 30%
      const newScore = Math.round(existing.weakness_score * 0.3 + weaknessScore * 0.7)
      await supabaseAdmin.from('user_weaknesses').update({
        weakness_score: newScore,
        occurrence_count: (existing.occurrence_count || 1) + 1,
        last_tested_at: new Date().toISOString(),
        improvement_trend: (existing.weakness_score || 0) - newScore, // positive = improving
      }).eq('id', existing.id)
    } else {
      await supabaseAdmin.from('user_weaknesses').insert({
        user_id: userId,
        topic: ev.topic,
        subtopic: ev.subtopic || null,
        weakness_score: weaknessScore,
        occurrence_count: 1,
        last_tested_at: new Date().toISOString(),
        improvement_trend: 0,
      })
    }
  }
}
