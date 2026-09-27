import OpenAI from 'openai'

const rawKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || ''
const apiKey = rawKey.trim().replace(/^["']|["']$/g, '')

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
  apiKey: apiKey || 'dummy-key',
  baseURL,
  defaultHeaders: isOpenRouter
    ? {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'InterviewAI',
    }
    : undefined,
})

// Model names per provider
// OpenRouter falls back to free Llama model — avoid invalid 'openrouter/free' or 'openrouter/auto' IDs
export const GENERATION_MODEL = isOpenRouter
  ? (process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct')
  : isGemini
    ? (process.env.GEMINI_MODEL || 'gemini-1.5-flash')
    : (process.env.OPENAI_MODEL || 'gpt-4o-mini')

export const EVALUATION_MODEL = isOpenRouter
  ? (process.env.OPENROUTER_EVAL_MODEL || 'meta-llama/llama-3.3-70b-instruct')
  : isGemini
    ? (process.env.GEMINI_MODEL || 'gemini-1.5-flash')
    : (process.env.OPENAI_EVAL_MODEL || 'gpt-4o')

console.log(`[AI Client] Provider: ${isOpenRouter ? 'OpenRouter' : isGemini ? 'Gemini' : 'OpenAI'} | Model: ${GENERATION_MODEL}`)

/**
 * Universal completion helper with automatic model fallback.
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
  if (!apiKey) {
    throw new Error('AI API key is missing. Please configure GEMINI_API_KEY or OPENAI_API_KEY in your environment variables.')
  }

  const chosenModel = model || (responseFormat ? EVALUATION_MODEL : GENERATION_MODEL)

  const allMessages = system
    ? [{ role: 'system' as const, content: system }, ...messages]
    : messages

  // Primary: use the configured client
  try {
    const res = await openai.chat.completions.create({
      model: chosenModel,
      messages: allMessages,
      response_format: responseFormat,
      max_tokens: maxTokens,
    })
    return res.choices[0]?.message?.content || ''
  } catch (err: any) {
    // If OpenRouter error (e.g. 404 slug deprecated, 402 out of credits or 400 unsupported format), fallback through free models
    if (isOpenRouter) {
      console.warn(`[AI Client] OpenRouter model ${chosenModel} error (${err?.status || err?.message}):`, err?.message)

      // 1. Check if OpenRouter suggested a replacement slug in the error message
      const suggestedMatch = (err?.message || '').match(/use this slug instead:\s*([^\s,']+)/i)
      const suggestedSlug = suggestedMatch?.[1]?.trim()

      const freeModels = [
        ...(suggestedSlug ? [suggestedSlug] : []),
        'meta-llama/llama-3.3-70b-instruct:free',
        'meta-llama/llama-3.3-70b-instruct',
        'qwen/qwen-2.5-coder-32b-instruct:free',
        'qwen/qwen-2.5-coder-32b-instruct',
        'meta-llama/llama-3.1-8b-instruct:free',
        'mistralai/mistral-7b-instruct:free',
        'microsoft/phi-3-mini-128k-instruct:free',
      ]

      const tried = new Set<string>([chosenModel])

      for (const fallbackModel of freeModels) {
        if (tried.has(fallbackModel)) continue
        tried.add(fallbackModel)

        // Try with responseFormat first, then fallback without responseFormat
        for (const format of [responseFormat, undefined]) {
          try {
            console.log(`[AI Client] Retrying with OpenRouter fallback model: ${fallbackModel}${format ? ' (with json_object)' : ''}`)
            const fallbackRes = await openai.chat.completions.create({
              model: fallbackModel,
              messages: allMessages,
              response_format: format,
              max_tokens: maxTokens,
            })
            const content = fallbackRes.choices[0]?.message?.content || ''
            if (content) return content
          } catch (fbErr: any) {
            console.warn(`[AI Client] Fallback ${fallbackModel} failed:`, fbErr?.message)
          }
        }
      }
    }

    // Only attempt Gemini direct REST fallback for native Gemini keys
    if (!isGemini) throw err

    console.warn('[AI Client] OpenAI-compat Gemini endpoint failed, trying direct REST fallback:', err?.message)

    const geminiModel = chosenModel.startsWith('gemini') ? chosenModel : 'gemini-1.5-flash'
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
      if (geminiModel !== 'gemini-1.5-flash') {
        const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
        const fallbackRes = await fetch(fallbackEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(body),
        })
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json()
          return fallbackData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        }
      }
      throw new Error(`Gemini API error ${response.status}: ${errText}`)
    }

    const data = await response.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }
}

/**
 * Universal streaming completion helper using SSE / async generator.
 */
export async function* streamChatCompletion({
  messages,
  system,
  model,
  maxTokens = 1000,
}: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  system?: string
  model?: string
  maxTokens?: number
}): AsyncGenerator<string, void, unknown> {
  if (!apiKey) {
    throw new Error('AI API key is missing.')
  }

  const chosenModel = model || EVALUATION_MODEL
  const allMessages = system
    ? [{ role: 'system' as const, content: system }, ...messages]
    : messages

  try {
    const stream = await openai.chat.completions.create({
      model: chosenModel,
      messages: allMessages,
      max_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || ''
      if (token) yield token
    }
  } catch (err: any) {
    console.warn(`[AI Client] Streaming error with ${chosenModel}:`, err?.message)
    // Fallback to non-streaming createChatCompletion if stream fails
    const fullText = await createChatCompletion({
      messages,
      system,
      model: chosenModel,
      maxTokens,
    })
    yield fullText
  }
}

