import OpenAI from 'openai'

const rawKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || ''
const apiKey = rawKey.trim().replace(/^[\"']|[\"']$/g, '')

// Detect provider from key prefix
const isOpenRouter = apiKey.startsWith('sk-or-')
const isGemini = apiKey.startsWith('AIza')
const isOpenAI = apiKey.startsWith('sk-') && !isOpenRouter

// OpenRouter: uses OpenAI-compatible API at openrouter.ai/api/v1
// Gemini: uses Google's OpenAI-compatible endpoint
// OpenAI: uses default endpoint
const baseURL = isOpenRouter
  ? 'https://openrouter.ai/api/v1'
  : isGemini
    ? 'https://generativelanguage.googleapis.com/v1beta/openai/'
    : undefined

export const openai = new OpenAI({
  apiKey,
  baseURL,
  defaultHeaders: isOpenRouter
    ? {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'InterviewAI',
    }
    : undefined,
})

// Model names per provider
// OpenRouter uses namespaced model IDs: google/gemini-*
export const GENERATION_MODEL = isOpenRouter
  ? (process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash')
  : isGemini
    ? 'gemini-3.6-flash'
    : 'gpt-4o-mini'

export const EVALUATION_MODEL = isOpenRouter
  ? (process.env.OPENROUTER_EVAL_MODEL || 'google/gemini-2.5-flash')
  : isGemini
    ? 'gemini-3.6-flash'
    : 'gpt-4o'

console.log(`[AI Client] Provider: ${isOpenRouter ? 'OpenRouter' : isGemini ? 'Gemini' : 'OpenAI'} | Model: ${GENERATION_MODEL}`)

/**
 * Universal completion helper.
 * Tries the configured provider first; falls back to direct Gemini REST only for Gemini keys.
 */
export async function createChatCompletion({
  messages,
  system,
  model,
  responseFormat,
  maxTokens = 1000,
}: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  system?: string
  model?: string
  responseFormat?: { type: 'json_object' }
  maxTokens?: number
}): Promise<string> {
  const chosenModel = model || (responseFormat ? EVALUATION_MODEL : GENERATION_MODEL)

  const allMessages = system
    ? [{ role: 'system' as const, content: system }, ...messages]
    : messages

  // Primary: use the configured client (OpenRouter / Gemini compat / OpenAI)
  try {
    const res = await openai.chat.completions.create({
      model: chosenModel,
      messages: allMessages,
      response_format: responseFormat,
      max_tokens: maxTokens,
    })
    return res.choices[0]?.message?.content || ''
  } catch (err: any) {
    // Only attempt Gemini direct REST fallback for native Gemini keys
    if (!isGemini) throw err

    console.warn('[AI Client] OpenAI-compat Gemini endpoint failed, trying direct REST:', err?.message)

    const geminiModel = chosenModel.startsWith('gemini') ? chosenModel : 'gemini-3.6-flash'
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`

    const systemInstruction = allMessages.find((m) => m.role === 'system')?.content
    const nonSystemMessages = allMessages.filter((m) => m.role !== 'system')

    const contents = nonSystemMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const body: Record<string, any> = { contents }
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] }
    }
    const generationConfig: Record<string, any> = { maxOutputTokens: maxTokens }
    if (responseFormat?.type === 'json_object') {
      generationConfig.responseMimeType = 'application/json'
    }
    body.generationConfig = generationConfig

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error ${response.status}: ${errText}`)
    }

    const data = await response.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }
}
