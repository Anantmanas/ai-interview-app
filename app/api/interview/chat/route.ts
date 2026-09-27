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
        const plan = rateLimit.plan || 'free'
        return NextResponse.json(
          {
            error: 'Daily limit reached.',
            message: plan === 'free'
              ? 'You have used your 3 free AI sessions today. Upgrade to Pro for unlimited access.'
              : 'Daily session limit reached. Resets at midnight.',
            upgradeUrl: '/dashboard/billing',
          },
          {
            status: 429,
            headers: {
              'Retry-After': '86400',
              'X-RateLimit-Plan': plan,
            },
          }
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
      topic,
      answerType,
      prompt,
      question,
      textAnswer = '',
      codeAnswer = '',
    } = body

    if (mode === 'generate') {
      const topicFocus = topic ? `focused specifically on ${topic}` : ''
      const generationPrompt =
        prompt ||
        `Generate 5 interview questions ${topicFocus} for a ${interviewType} interview at ${difficulty} difficulty level. Resume context: ${resumeContext || 'Software Engineer'}.
${topic ? `CRITICAL: Every question must directly test ${topic} concepts, implementation, edge cases, or architecture trade-offs.` : ''}
Return ONLY a valid JSON object with key "questions" containing an array of 5 objects with the following structure:
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text here?",
      "type": "${interviewType}",
      "topic": "${topic || 'Topic name'}",
      "difficulty": "${difficulty}",
      "requiresCode": false
    }
  ]
}`

      let questionsList: any[] = []

      try {
        const raw = await createChatCompletion({
          system: 'You are a senior technical interviewer at a top tier tech company. You generate structured interview questions as a JSON object with a "questions" array.',
          messages: [{ role: 'user', content: generationPrompt }],
          model: GENERATION_MODEL,
          responseFormat: { type: 'json_object' },
        })

        const cleaned = (raw || '').replace(/```json/gi, '').replace(/```/g, '').trim()
        const match = cleaned.match(/\{[\s\S]*\}/)?.[0] || cleaned
        const parsed = JSON.parse(match || '{}')
        questionsList = Array.isArray(parsed) ? parsed : (parsed.questions || [])
      } catch (genErr) {
        console.warn('[Interview Chat] Question generation error, using curated questions:', genErr)
      }

      // High-quality fallback if generation returned empty
      if (!Array.isArray(questionsList) || questionsList.length === 0) {
        const fallbackTopic = topic || 'System Architecture'
        questionsList = [
          {
            id: 'q1',
            text: `Explain the fundamental principles of ${fallbackTopic} and walk through how you would apply it in a high-scale production system.`,
            type: interviewType,
            topic: fallbackTopic,
            difficulty,
            requiresCode: false,
          },
          {
            id: 'q2',
            text: `What are the most common performance bottlenecks or edge cases you encounter when working with ${fallbackTopic}, and how do you mitigate them?`,
            type: interviewType,
            topic: fallbackTopic,
            difficulty,
            requiresCode: interviewType === 'technical',
          },
          {
            id: 'q3',
            text: `Compare two alternative architectural approaches or libraries for ${fallbackTopic}. What are the trade-offs in terms of complexity, latency, and maintainability?`,
            type: interviewType,
            topic: fallbackTopic,
            difficulty,
            requiresCode: false,
          },
          {
            id: 'q4',
            text: `How would you write automated tests to verify edge cases and error handling for a component utilizing ${fallbackTopic}?`,
            type: interviewType,
            topic: fallbackTopic,
            difficulty,
            requiresCode: interviewType === 'technical',
          },
          {
            id: 'q5',
            text: `Walk me through a real-world debugging scenario you faced involving ${fallbackTopic}. How did you identify the root cause and resolve it?`,
            type: interviewType,
            topic: fallbackTopic,
            difficulty,
            requiresCode: false,
          },
        ]
      }

      return NextResponse.json({ questions: questionsList, mode: 'generate' })
    }

    if (mode === 'evaluate') {
      const { language = 'javascript' } = body
      const combinedAnswer = (textAnswer || '') + (codeAnswer ? `\n${codeAnswer}` : '')
      const cleaned = combinedAnswer.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
      const isSkipped = !combinedAnswer.trim() || cleaned.length <= 2 || ['na', 'none', 'idk', 'skip', 'pass', 'nil', 'null'].includes(cleaned)

      if (isSkipped) {
        return NextResponse.json({
          evaluation: {
            score: 0,
            feedback: "No substantive answer or solution provided. In a technical interview, submitting 'NA' or skipping automatically results in a score of 0.",
            improvement: "Always state your initial assumptions, walk through a brute-force approach, or ask clarifying questions rather than skipping.",
            technicalAccuracy: "Unanswered.",
            topic: question?.topic || 'General',
          },
          mode: 'evaluate',
        })
      }

      const evalPrompt = `Question: ${question?.text || ''}
Topic: ${question?.topic || question?.topicTag || 'General'}
Difficulty: ${question?.difficulty || difficulty}
AnswerType: ${answerType || 'text'}
Language: ${language}
TextAnswer: ${textAnswer}
CodeAnswer:\n${codeAnswer}

STRICT SCORING RULES:
- 0: Unanswered, "NA", "skip", or irrelevant.
- 1-25: Fundamentally incorrect with major misconceptions.
- 26-50: Poor understanding or critical omissions.
- 51-69: Partially correct but suboptimal.
- 70-84: Good passing solution.
- 85-100: Senior/Staff level mastery with optimal time/space complexity and edge cases.

Return ONLY valid JSON:
{
  "score": number (0 to 100),
  "feedback": "Concise feedback on answer strengths and gaps",
  "improvement": "Actionable ways to improve",
  "technicalAccuracy": "Accuracy evaluation",
  "topic": "Topic tested"
}`

      const raw = await createChatCompletion({
        system: 'You are a strict technical interviewer evaluating candidate answers with rigorous grading standards.',
        messages: [{ role: 'user', content: evalPrompt }],
        model: EVALUATION_MODEL,
        responseFormat: { type: 'json_object' },
      })

      let parsed: any = {}
      try {
        parsed = JSON.parse(raw)
      } catch {
        const match = raw.match(/\{[\s\S]*\}/)?.[0]
        if (match) parsed = JSON.parse(match)
      }

      const parsedScore = Number(parsed?.score)
      const finalScore = Math.max(0, Math.min(100, !isNaN(parsedScore) ? parsedScore : (isSkipped ? 0 : 30)))

      return NextResponse.json({
        evaluation: {
          ...parsed,
          score: finalScore,
          feedback: parsed.feedback || (finalScore === 0 ? 'No substantive answer provided.' : 'Answer evaluated with gaps.'),
          improvement: parsed.improvement || '',
        },
        mode: 'evaluate',
      })
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
