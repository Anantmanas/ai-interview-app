import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createChatCompletion, GENERATION_MODEL } from '@/lib/ai/client'
import { checkRateLimit } from '@/lib/middleware/rate-limit'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting check
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

    // 1. Fetch user's weaknesses (weakness_score > 40)
    const { data: weaknesses } = await supabaseAdmin
      .from('user_weaknesses')
      .select('*')
      .eq('user_id', user.id)
      .gt('weakness_score', 40)
      .order('weakness_score', { ascending: false })

    console.log('[Roadmap Generator] Weaknesses found:', weaknesses?.length || 0)

    if (!weaknesses || weaknesses.length === 0) {
      return NextResponse.json({
        message: 'No significant weaknesses found to generate a roadmap. Complete more practice interviews first!',
        count: 0,
      })
    }

    // 2. Generate roadmap with OpenAI
    const prompt = `
      Based on the following user weaknesses from technical interviews, generate a personalized learning roadmap.
      Weaknesses:
      ${weaknesses.map((w) => `- ${w.topic} (${w.subtopic || 'General'}): Score ${w.weakness_score}/100`).join('\n')}
      
      Generate a list of roadmap items in JSON format.
      Each item should include:
      - topic (string)
      - title (string)
      - description (string)
      - resources (array of { "type": "video" | "article" | "practice", "title": string, "url": string })
      - priority (number, 1-5 where 1 is highest)
      - estimated_hours (number)
      
      Return as {"items": [...]}
    `

    const rawContent = await createChatCompletion({
      system: 'You are a technical career coach and curriculum designer. Return valid JSON only.',
      messages: [{ role: 'user', content: prompt }],
      model: GENERATION_MODEL,
      responseFormat: { type: 'json_object' },
      maxTokens: 1000,
    })

    const roadmapData = JSON.parse(rawContent || '{}')
    const items = roadmapData.items || roadmapData.roadmap_items || []

    // 3. Store in database using supabaseAdmin
    for (const item of items) {
      await supabaseAdmin
        .from('roadmap_items')
        .insert({
          user_id: user.id,
          topic: item.topic || 'General',
          title: item.title || 'Learning Objective',
          description: item.description || '',
          resources: item.resources || [],
          priority: item.priority || 1,
          estimated_hours: item.estimated_hours || 2,
          status: 'pending',
        })
    }

    return NextResponse.json({ success: true, count: items.length })
  } catch (error: any) {
    console.error('[POST /api/roadmap/generate] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate roadmap' }, { status: 500 })
  }
}
