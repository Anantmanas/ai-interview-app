import { NextRequest, NextResponse } from 'next/server'
import { createChatCompletion, GENERATION_MODEL, EVALUATION_MODEL } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/middleware/rate-limit'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const rateLimit = await checkRateLimit(user.id)
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Daily AI limit reached. Please upgrade or try again tomorrow.' },
          { status: 429 }
        )
      }
    }

    const body = await req.json()
    const {
      mode,
      messages = [],
      resumeContext = '',
      sessionHistory = [],
      interviewType = 'technical',
      difficulty = 'medium',
      answerType,
      prompt,
      question,
      textAnswer = '',
      codeAnswer = '',
    } = body

    if (mode === 'generate') {
      const generationPrompt =
        prompt ||
        `Generate 5 interview questions for a ${interviewType} interview at ${difficulty} difficulty level. Resume context: ${resumeContext || 'Software Engineer'}.
Return ONLY a valid JSON object with key "questions" containing an array of 5 objects with the following structure:
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text here?",
      "type": "${interviewType}",
      "topic": "Topic name (e.g. React, System Design, Algorithms, Database)",
      "difficulty": "${difficulty}",
      "requiresCode": false
    }
  ]
}`

      const raw = await createChatCompletion({
        system: 'You are a senior technical interviewer at a top tier tech company. You generate structured interview questions as a JSON object with a "questions" array.',
        messages: [{ role: 'user', content: generationPrompt }],
        model: GENERATION_MODEL,
        responseFormat: { type: 'json_object' },
      })

      let questionsList: any[] = []
      try {
        const parsed = JSON.parse(raw)
        questionsList = Array.isArray(parsed) ? parsed : (parsed.questions || [])
      } catch {
        const match = raw.match(/\{[\s\S]*\}/)?.[0]
        if (match) {
          const parsed = JSON.parse(match)
          questionsList = Array.isArray(parsed) ? parsed : (parsed.questions || [])
        }
      }

      return NextResponse.json({ questions: questionsList, mode: 'generate' })
    }

    if (mode === 'evaluate') {
      const { language = 'javascript' } = body
      const evalPrompt = `Question: ${question?.text || ''}
Topic: ${question?.topic || question?.topicTag || 'General'}
Difficulty: ${question?.difficulty || difficulty}
AnswerType: ${answerType || 'text'}
Language: ${language}
TextAnswer: ${textAnswer}
CodeAnswer:\n${codeAnswer}

Return ONLY valid JSON:
{
  "score": number (0 to 100),
  "feedback": "Concise feedback on answer strengths and gaps",
  "improvement": "Actionable ways to improve",
  "technicalAccuracy": "Accuracy evaluation",
  "topic": "Topic tested"
}`

      const raw = await createChatCompletion({
        system: 'You are a strict and helpful technical interviewer evaluating candidate answers.',
        messages: [{ role: 'user', content: evalPrompt }],
        model: EVALUATION_MODEL,
        responseFormat: { type: 'json_object' },
      })

      let parsed = { score: 75, feedback: 'Evaluated', improvement: '' }
      try {
        parsed = JSON.parse(raw)
      } catch {
        const match = raw.match(/\{[\s\S]*\}/)?.[0]
        if (match) parsed = JSON.parse(match)
      }

      return NextResponse.json({ evaluation: parsed, mode: 'evaluate' })
    }

    if (mode === 'report') {
      const reportPrompt = `Resume context:\n${resumeContext || 'none'}\n\nSession:\n${JSON.stringify(sessionHistory)}\n\nReturn valid JSON:
{
  "overallScore": number (0-100),
  "strongTopics": [{ "topic": string, "reason": string }],
  "weakTopics": [{ "topic": string, "reason": string }],
  "improvementPlan": [{ "topic": string, "action": string, "resources": string }],
  "summary": string
}`

      const raw = await createChatCompletion({
        system: 'Generate an interview performance report in valid JSON only.',
        messages: [{ role: 'user', content: reportPrompt }],
        model: GENERATION_MODEL,
        responseFormat: { type: 'json_object' },
      })

      let parsed = {}
      try {
        parsed = JSON.parse(raw)
      } catch {
        const match = raw.match(/\{[\s\S]*\}/)?.[0]
        if (match) parsed = JSON.parse(match)
      }

      return NextResponse.json({ report: parsed, mode: 'report' })
    }

    if (mode === 'chat') {
      const chatMessages: ChatMessage[] = Array.isArray(messages) ? messages : []
      const formattedMessages = chatMessages.map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.content,
      }))

      const content = await createChatCompletion({
        system: `You are Alex, a supportive and insightful interview coach. Keep responses short, practical, and encouraging. Resume context: ${resumeContext || 'none'}`,
        messages: formattedMessages.length > 0 ? formattedMessages : [{ role: 'user', content: 'Hello' }],
        model: GENERATION_MODEL,
      })

      return NextResponse.json({ content: content || 'I am here to help you practice!', mode: 'chat' })
    }

    // Default conversational interview stream or response
    const content = await createChatCompletion({
      system: `You are a technical interviewer. Resume context: ${resumeContext || 'none'}`,
      messages: Array.isArray(messages) && messages.length > 0
        ? messages.map((m: ChatMessage) => ({
            role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
            content: m.content,
          }))
        : [{ role: 'user' as const, content: 'Hello' }],
      model: GENERATION_MODEL,
    })

    return NextResponse.json({ content, mode: 'interview' })
  } catch (err: any) {
    console.error('[api/interview/chat] Error:', err)
    return NextResponse.json(
      { error: 'Interview AI request failed', detail: err?.message },
      { status: 500 }
    )
  }
}
