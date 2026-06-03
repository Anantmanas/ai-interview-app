import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!
const GEMINI_URL = process.env.GEMINI_URL || 'https://google-gemini-pro.p.rapidapi.com/api/generate'
const GEMINI_HOST = process.env.GEMINI_HOST || 'google-gemini-pro.p.rapidapi.com'

const GPT4_URL = process.env.GPT4_URL || 'https://chatgpt-4o.p.rapidapi.com/api/v1/chat/completions'
const GPT4_HOST = process.env.GPT4_HOST || 'chatgpt-4o.p.rapidapi.com'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function parseJsonOrThrow(raw: string) {
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

async function callGemini(systemPrompt: string, userContent: string, retries = 3): Promise<string> {
  let lastError: any
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': GEMINI_HOST,
        },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: 'user', content: userContent }],
          max_tokens: 1000,
        }),
      })

      if (response.status === 429) {
        const delay = Math.pow(2, i) * 1000
        console.warn(`[api/interview/chat] Gemini 429, retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`RapidAPI Gemini error ${response.status}: ${err}`)
      }

      const data = await response.json()
      return (
        data?.content?.[0]?.text ||
        data?.choices?.[0]?.message?.content ||
        data?.result ||
        data?.text ||
        JSON.stringify(data)
      )
    } catch (err: any) {
      lastError = err
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 500
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }
    }
  }
  throw lastError || new Error('Call Gemini failed after retries')
}

async function callGPT4(systemPrompt: string, userContent: string): Promise<string> {
  const response = await fetch(GPT4_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': GPT4_HOST,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`RapidAPI GPT4 error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content || JSON.stringify(data)
}

async function callDeepSeek(systemPrompt: string, userContent: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.DEEPSEAK_API_KEY, // Note: Typo in env var name preserved for compatibility
    baseURL: process.env.DEEPSEAK_API_URL || 'https://integrate.api.nvidia.com/v1',
  })
  const completion = await openai.chat.completions.create({
    model: 'deepseek-ai/deepseek-v4-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    max_tokens: 1000,
  })
  return completion.choices[0].message.content || ''
}

async function callAI(systemPrompt: string, userContent: string): Promise<string> {
  try {
    return await callGemini(systemPrompt, userContent)
  } catch (geminiErr) {
    console.error('[api/interview/chat] Gemini failed, falling back to GPT4:', geminiErr)
    try {
      return await callGPT4(systemPrompt, userContent)
    } catch (gptErr) {
      console.error('[api/interview/chat] GPT4 failed, falling back to DeepSeek:', gptErr)
      return await callDeepSeek(systemPrompt, userContent)
    }
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      mode,
      messages = [],
      resumeContext = '',
      sessionHistory = [],
      answerType,
      prompt,
      question,
      textAnswer = '',
      codeAnswer = '',
    } = body

    if (mode === 'generate') {
      const generationPrompt =
        prompt || `Generate 5 interview questions. Resume context: ${resumeContext || 'none'}`
      const content = await callAI(
        'You are a senior technical interviewer. Return ONLY JSON array: [{id,text,type,difficulty,requiresCode,topicTag}]',
        generationPrompt
      )
      const parsed = parseJsonOrThrow(content)
      return NextResponse.json({ questions: parsed, mode: 'generate' })
    }

    if (mode === 'evaluate') {
      const { language = 'javascript' } = body
      const evalPrompt = `Question: ${question?.text || ''}\nTopic: ${question?.topicTag || ''}\nDifficulty: ${question?.difficulty || ''}\nAnswerType: ${answerType || 'text'}\nLanguage: ${language}\nTextAnswer: ${textAnswer}\nCodeAnswer:\n${codeAnswer}\n\nReturn ONLY JSON: { score: number, feedback: string, improvement: string, topicTag: string, isStrong: boolean }`
      const content = await callAI(
        'You are strict technical interviewer. Evaluate answers with concise, specific feedback.',
        evalPrompt
      )
      const parsed = parseJsonOrThrow(content)
      return NextResponse.json({ evaluation: parsed, mode: 'evaluate' })
    }

    if (mode === 'report') {
      const reportPrompt = `Resume context:\n${resumeContext || 'none'}\n\nSession:\n${JSON.stringify(sessionHistory)}\n\nReturn ONLY JSON: { overallScore:number, strongTopics:[{topic,reason}], weakTopics:[{topic,reason}], improvementPlan:[{topic,action,resources}], summary:string }`
      const content = await callAI(
        'Generate an interview performance report in valid JSON only.',
        reportPrompt
      )
      const parsed = parseJsonOrThrow(content)
      return NextResponse.json({ report: parsed, mode: 'report' })
    }

    if (mode === 'chat') {
      const chatMessages: ChatMessage[] = Array.isArray(messages) ? messages : []
      const userContent = chatMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n') || 'Hello'
      // Chat already uses DeepSeek in original code, but let's use the unified callAI if we want fallback or just keep it as is.
      // The original code used callDeepSeek directly for chat.
      const content = await callDeepSeek(
        `You are Alex, friendly interview coach. Keep short practical responses. Resume context: ${resumeContext || 'none'}`,
        userContent
      )
      return NextResponse.json({ content, mode: 'chat' })
    }

    // Default to interview mode
    const defaultContent = (Array.isArray(messages) ? messages : [])
      .map((m: ChatMessage) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n') || 'Start interview'

    const content = await callAI(
      `You are technical interviewer. Resume context: ${resumeContext || 'none'}`,
      defaultContent
    )
    return NextResponse.json({ content, mode: 'interview' })
  } catch (err: any) {
    console.error('[api/interview/chat] Error:', err)
    return NextResponse.json({ error: 'Interview chat failed', detail: err?.message }, { status: 500 })
  }
}

