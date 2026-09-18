import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createChatCompletion, EVALUATION_MODEL } from '@/lib/ai/client'
import { updateWeaknessScores } from '@/lib/ai/weakness-tracker'
import { checkRateLimit } from '@/lib/middleware/rate-limit'

const EVALUATION_SYSTEM_PROMPT = `
You are a senior technical interviewer and engineering leader.
Evaluate the candidate's answer with precise, objective feedback.
Always respond in valid JSON format only with the following keys:
{
  "score": number (0 to 100, where 70+ is passing, 85+ is strong),
  "feedback": "Concise analysis of what was good and what was missing",
  "technicalAccuracy": "Assessment of technical correctness and depth",
  "improvements": "Specific actionable points to improve this answer",
  "topic": "The core topic or skill tested (e.g. System Design, React, Algorithms, Concurrency)"
}
`

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

    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Daily AI limit reached. Please upgrade or try again tomorrow.' },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))

    // 1. Fetch interview to verify ownership
    const { data: interview, error: interviewErr } = await supabaseAdmin
      .from('interviews')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (interviewErr || !interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    // Check if this is a single question evaluation call from interview room
    const isSingleQuestion = !!body.question || !!body.currentQuestion

    if (isSingleQuestion) {
      const q = body.currentQuestion || body.question
      const questionText = q?.text || q?.question_text || ''
      const questionType = q?.type || q?.question_type || interview.type || 'technical'
      const topic = q?.topic || q?.topicTag || 'General'
      const difficulty = q?.difficulty || interview.difficulty || 'medium'
      const userAnswer = body.userAnswer || body.textAnswer || (body.codeAnswer ? `Code Answer:\n${body.codeAnswer}` : '') || ''
      const elapsedSeconds = Number(body.elapsedSeconds || body.time_taken_seconds || 0)
      const sequenceOrder = Number(body.sequence_order ?? body.sequenceOrder ?? body.questionIndex ?? 0)

      const userContent = `
Question: ${questionText}
Type: ${questionType}
Topic: ${topic}
Difficulty: ${difficulty}
Candidate Answer: ${userAnswer || '(No answer provided)'}
`

      const rawContent = await createChatCompletion({
        system: EVALUATION_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
        model: EVALUATION_MODEL,
        responseFormat: { type: 'json_object' },
      })
      let evalData: any = {}
      try {
        evalData = JSON.parse(rawContent)
      } catch {
        const match = rawContent.match(/\{[\s\S]*\}/)?.[0]
        evalData = match ? JSON.parse(match) : { score: 70, feedback: 'Evaluated', improvements: '' }
      }

      const score = Math.max(0, Math.min(100, Number(evalData.score) || 70))
      const evaluationResult = {
        score,
        feedback: evalData.feedback || 'Answer recorded.',
        technicalAccuracy: evalData.technicalAccuracy || evalData.technical_accuracy || '',
        improvements: evalData.improvements || evalData.improvement || '',
        topic: evalData.topic || topic,
      }

      // Persist to interview_questions table using supabaseAdmin
      const { data: insertedQuestion, error: insertError } = await supabaseAdmin
        .from('interview_questions')
        .insert({
          interview_id: id,
          question_text: questionText,
          question_type: questionType,
          topic: evaluationResult.topic,
          difficulty: difficulty,
          user_answer: userAnswer,
          ai_evaluation: evaluationResult,
          time_taken_seconds: elapsedSeconds,
          sequence_order: sequenceOrder,
        })
        .select()
        .single()

      if (insertError) {
        console.error('[evaluate] Error inserting into interview_questions:', insertError)
      }

      // Update weakness scores immediately
      await updateWeaknessScores(user.id, [
        {
          topic: evaluationResult.topic,
          score: evaluationResult.score,
          feedback: evaluationResult.feedback,
        },
      ])

      return NextResponse.json({
        success: true,
        evaluation: evaluationResult,
        question: insertedQuestion,
      })
    }

    // Fallback: Full interview session evaluation
    const { data: existingQuestions } = await supabaseAdmin
      .from('interview_questions')
      .select('*')
      .eq('interview_id', id)
      .order('sequence_order', { ascending: true })

    const questions = (existingQuestions || []).filter((q) => (q.user_answer || '').trim().length > 0)

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No answered questions to evaluate' }, { status: 400 })
    }

    const interviewContext = `
Interview Type: ${interview.type}
Difficulty: ${interview.difficulty}
Target Role: ${interview.target_role || 'Software Engineer'}

Questions and Answers:
${questions.map((q, i) => `Q${i + 1} (${q.topic}): ${q.question_text}\nA${i + 1}: ${q.user_answer}`).join('\n\n')}
`

    const batchPrompt = `
Evaluate this full technical interview session.
Return valid JSON with:
{
  "overall_score": number (0-100),
  "strengths": string[],
  "weaknesses": [{ "topic": string, "subtopic": string, "score": number (0-100, higher=weaker), "feedback": string }],
  "summary": string
}
`

    const rawEvaluation = await createChatCompletion({
      system: 'You are an expert technical interviewer.',
      messages: [{ role: 'user', content: batchPrompt + '\n\n' + interviewContext }],
      model: EVALUATION_MODEL,
      responseFormat: { type: 'json_object' },
    })
    let evaluation: any = {}
    try {
      evaluation = JSON.parse(rawEvaluation)
    } catch {
      evaluation = { overall_score: 75, strengths: [], weaknesses: [], summary: '' }
    }

    const overallScore = Math.max(0, Math.min(100, Number(evaluation.overall_score) || 75))
    const strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : []
    const weaknesses = Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : []

    // Update interview record
    await supabaseAdmin
      .from('interviews')
      .update({
        overall_score: overallScore,
        feedback_summary: evaluation.summary || null,
        strengths,
        weaknesses,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Update weakness tracking
    const weaknessEvaluations = weaknesses.map((w: any) => ({
      topic: w.topic || 'General',
      subtopic: w.subtopic || undefined,
      score: 100 - (Number(w.score) || 50),
      feedback: w.feedback || '',
    }))

    if (weaknessEvaluations.length > 0) {
      await updateWeaknessScores(user.id, weaknessEvaluations)
    }

    return NextResponse.json({ success: true, evaluation })
  } catch (error: any) {
    console.error('[POST /api/interviews/[id]/evaluate] Error:', error)
    return NextResponse.json({ error: error.message || 'Evaluation failed' }, { status: 500 })
  }
}
