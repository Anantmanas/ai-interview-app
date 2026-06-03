import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

type EvaluationMessage = {
  id?: string
  role?: string
  text?: string
  content?: string
  parts?: Array<{ type?: string; text?: string }>
}

type EvaluationQuestion = {
  id?: string
  question_text: string
  user_answer: string | null
  question_type: string
  sequence_order: number
}

const questionStarters = [
  'could you',
  'can you',
  'would you',
  'walk me',
  'tell me',
  'explain',
  'describe',
  'design',
  'implement',
  'solve',
  'how would',
  'what would',
  'why would',
  'let us start',
  "let's start",
]

const normalizeMessageText = (value: string) => {
  let text = value
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .trim()

  text = text.replace(/^(assistant|user|system)\s*:\s*/i, '').trim()

  return text
    .replace(/\[\s*\{|\}\s*\]/g, '')
    .replace(/['"],?\s*['"]type['"]\s*:\s*['"][^'"]+['"],?/g, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const getMessageText = (message: EvaluationMessage) => {
  if (typeof message.text === 'string') {
    return normalizeMessageText(message.text)
  }

  if (typeof message.content === 'string') {
    return normalizeMessageText(message.content)
  }

  if (Array.isArray(message.parts)) {
    return normalizeMessageText(
      message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text || '')
        .join(' '),
    )
  }

  return ''
}

const splitQuestionFromGuidance = (text: string) => {
  const cleanText = normalizeMessageText(text)
  const sentences = cleanText.match(/[^.!?]+[.!?]+(?:["'])?|[^.!?]+$/g) ?? [cleanText]
  const questionIndex = sentences.findLastIndex((sentence) => {
    const normalized = sentence.trim().toLowerCase()
    return normalized.includes('?') || questionStarters.some((starter) => normalized.startsWith(starter))
  })

  if (questionIndex === -1) {
    return cleanText
  }

  return sentences.slice(questionIndex).join(' ').trim()
}

const isPromptMessage = (text: string) => {
  const normalized = text.toLowerCase()
  return (
    normalized.startsWith('start my ') ||
    normalized.startsWith('[[sidebar]]')
  )
}

const buildQuestionsFromMessages = (
  messages: EvaluationMessage[],
  questionType: string,
) => {
  const questions: EvaluationQuestion[] = []
  let pendingQuestion: string | null = null

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    const text = getMessageText(message)
    if (!text) continue

    if (message.role === 'assistant') {
      const prev = messages[i - 1]
      const prevText = prev && prev.role === 'user' ? getMessageText(prev) : ''
      if (prevText.toLowerCase().startsWith('[[sidebar]]')) {
        continue
      }
      pendingQuestion = splitQuestionFromGuidance(text) || text
      continue
    }

    if (message.role === 'user') {
      if (text.toLowerCase().startsWith('[[sidebar]]')) {
        continue
      }

      if (isPromptMessage(text) || !pendingQuestion) continue

      questions.push({
        question_text: pendingQuestion,
        user_answer: text,
        question_type: questionType,
        sequence_order: questions.length,
      })
      pendingQuestion = null
    }
  }

  return questions
}

const asArray = <T,>(value: unknown): T[] => Array.isArray(value) ? value : []

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json().catch(() => ({}))
    const openai = new OpenAI({
      apiKey: process.env.DEEPSEAK_API_KEY,
      baseURL: process.env.DEEPSEAK_API_URL || 'https://integrate.api.nvidia.com/v1',
    })

    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch interview and all questions/answers
    const { data: interview } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    const { data: existingQuestions } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('interview_id', id)
      .order('sequence_order', { ascending: true })

    let questions: EvaluationQuestion[] = existingQuestions || []

    if (!questions || questions.length === 0) {
      const fallbackQuestions = buildQuestionsFromMessages(
        asArray<EvaluationMessage>(body.messages),
        interview.type,
      )

      if (fallbackQuestions.length > 0) {
        questions = fallbackQuestions

        const { data: insertedQuestions } = await supabase
          .from('interview_questions')
          .insert(fallbackQuestions.map((question) => ({
            interview_id: id,
            question_text: question.question_text,
            question_type: question.question_type,
            sequence_order: question.sequence_order,
            user_answer: question.user_answer,
          })))
          .select('*')

        if (insertedQuestions && insertedQuestions.length > 0) {
          questions = insertedQuestions
        }
      }
    }

    questions = (questions || []).filter((q) => (q.user_answer || '').trim().length > 0)

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No answered interview questions found to evaluate' }, { status: 400 })
    }

    // 2. Prepare context for OpenAI evaluation
    const interviewContext = `
      Interview Type: ${interview.type}
      Difficulty: ${interview.difficulty}
      Target Role: ${interview.target_role || 'Not specified'}
      
      Questions and Answers:
      ${questions.map((q, i) => `
        Q${i+1}: ${q.question_text}
        A${i+1}: ${q.user_answer}
      `).join('\n')}
    `

    const prompt = `
      Evaluate this technical interview session. 
      Provide a comprehensive report in JSON format with:
      - overall_score (0-100)
      - strengths (array of strings)
      - weaknesses (array of { topic, subtopic, score (0-100, higher=weaker), feedback })
      - summary (short paragraph)
      - individual_evaluations (array of { question_id, score, technical_accuracy, feedback })
      Return only valid JSON.
    `

    const completion = await openai.chat.completions.create({
      model: 'deepseek-ai/deepseek-v4-flash',
      messages: [
        { role: 'system', content: 'You are an expert technical interviewer.' },
        { role: 'user', content: prompt + '\n\n' + interviewContext }
      ],
      response_format: { type: 'json_object' }
    })

    const rawEvaluation = completion.choices[0].message.content || '{}'
    let evaluation: any = {}
    try {
      evaluation = JSON.parse(rawEvaluation)
    } catch {
      const evaluationJson = rawEvaluation.trim().match(/\{[\s\S]*\}/)?.[0] || '{}'
      evaluation = JSON.parse(evaluationJson)
    }
    const individualEvaluations = asArray<any>(evaluation.individual_evaluations)
    const weaknesses = asArray<any>(evaluation.weaknesses)

    // 3. Update interview with overall results
    await supabase
      .from('interviews')
      .update({
        overall_score: Number(evaluation.overall_score) || 0,
        feedback_summary: evaluation.summary || null,
        strengths: asArray<string>(evaluation.strengths),
        weaknesses,
        status: 'completed',
      })
      .eq('id', id)

    // 4. Update individual question evaluations
    for (const [index, item] of individualEvaluations.entries()) {
      const question = questions[index]
      if (question?.id) {
        await supabase
          .from('interview_questions')
          .update({
            ai_evaluation: {
              score: item.score,
              feedback: item.feedback,
              technical_accuracy: item.technical_accuracy
            }
          })
          .eq('id', question.id)
      }
    }

    // 5. Update user_weaknesses table for tracking trends
    for (const w of weaknesses) {
      // Upsert into user_weaknesses
      const { data: existingWeakness } = await supabase
        .from('user_weaknesses')
        .select('*')
        .eq('user_id', user.id)
        .eq('topic', w.topic)
        .maybeSingle()

      if (existingWeakness) {
        await supabase
          .from('user_weaknesses')
          .update({
            weakness_score: (existingWeakness.weakness_score + w.score) / 2, // Simple moving average
            occurrence_count: existingWeakness.occurrence_count + 1,
            last_tested_at: new Date().toISOString(),
          })
          .eq('id', existingWeakness.id)
      } else {
        await supabase
          .from('user_weaknesses')
          .insert({
            user_id: user.id,
            topic: w.topic,
            subtopic: w.subtopic,
            weakness_score: w.score,
            occurrence_count: 1,
            last_tested_at: new Date().toISOString(),
          })
      }
    }

    return NextResponse.json({ success: true, evaluation })
  } catch (error: any) {
    console.error('Evaluation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to evaluate interview' }, { status: 500 })
  }
}
