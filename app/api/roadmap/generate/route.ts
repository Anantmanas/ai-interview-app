import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch user's weaknesses
    const { data: weaknesses } = await supabase
      .from('user_weaknesses')
      .select('*')
      .eq('user_id', user.id)
      .gt('weakness_score', 40) // Only focus on significant weaknesses
      .order('weakness_score', { ascending: false })

    if (!weaknesses || weaknesses.length === 0) {
      return NextResponse.json({ message: 'No significant weaknesses found to generate a roadmap.' })
    }

    // 2. Generate roadmap with OpenAI
    const prompt = `
      Based on the following user weaknesses from technical interviews, generate a personalized learning roadmap.
      Weaknesses:
      ${weaknesses.map(w => `- ${w.topic} (${w.subtopic}): Score ${w.weakness_score}/100`).join('\n')}
      
      Generate a list of roadmap items in JSON format.
      Each item should include:
      - topic (string)
      - title (string)
      - description (string)
      - resources (array of { type: 'video' | 'article' | 'practice', title, url })
      - priority (1-5, 1 is highest)
      - estimated_hours (number)
    `

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a technical career coach and curriculum designer.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })

    const roadmapData = JSON.parse(completion.choices[0].message.content || '{}')
    const items = roadmapData.items || roadmapData.roadmap_items || []

    // 3. Store in database
    // Clear old pending items? Or just add new ones? 
    // Let's add new ones and avoid duplicates for now.
    for (const item of items) {
      await supabase
        .from('roadmap_items')
        .insert({
          user_id: user.id,
          topic: item.topic,
          title: item.title,
          description: item.description,
          resources: item.resources,
          priority: item.priority,
          estimated_hours: item.estimated_hours,
          status: 'pending'
        })
    }

    return NextResponse.json({ success: true, count: items.length })
  } catch (error: any) {
    console.error('Roadmap generation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate roadmap' }, { status: 500 })
  }
}
