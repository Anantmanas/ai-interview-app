import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error: any) {
    console.error('TTS error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate speech' }, { status: 500 })
  }
}
