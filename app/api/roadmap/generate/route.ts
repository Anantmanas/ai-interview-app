import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createChatCompletion, GENERATION_MODEL } from '@/lib/ai/client'
import { checkRateLimit } from '@/lib/middleware/rate-limit'
import { searchYouTubeMulti } from '@/lib/roadmap/youtube'
import { getStaticResources } from '@/lib/roadmap/static-resources'

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

    const body = await req.json().catch(() => ({}))
    const customTopics: string[] = Array.isArray(body.topics) ? body.topics.filter(Boolean) : []

    let promptContext = ''

    if (customTopics.length > 0) {
      promptContext = `
        The candidate wants a targeted learning roadmap focused specifically on these custom weak skills and topics:
        ${customTopics.map((t) => `- ${t}`).join('\n')}
        Generate a structured mastery roadmap for each of these specific skills.
      `
    } else {
      // 1. Fetch user's weaknesses (weakness_score > 40)
      const { data: weaknesses } = await supabaseAdmin
        .from('user_weaknesses')
        .select('*')
        .eq('user_id', user.id)
        .gt('weakness_score', 40)
        .order('weakness_score', { ascending: false })

      if (!weaknesses || weaknesses.length === 0) {
        // Fetch user profile for role-specific starter roadmap
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('target_role, experience_level, target_companies')
          .eq('id', user.id)
          .single()

        const role = profile?.target_role || 'Software Engineer'
        const level = profile?.experience_level || 'mid'

        promptContext = `
          The user has no recorded weaknesses yet. Generate a starter learning roadmap for a 
          ${level}-level ${role} candidate covering the most important technical topics they should master.
          Focus on: DSA fundamentals, system design basics, and 2-3 role-specific topics.
          Use weakness_score values between 60-80 (these are estimated starter gaps, not measured).
        `
      } else {
        promptContext = `
          Based on the following measured weaknesses from technical interviews:
          ${weaknesses.map((w) => `- ${w.topic} (${w.subtopic || 'General'}): Score ${w.weakness_score}/100`).join('\n')}
        `
      }
    }

    // Build AI prompt using the context from above
    const prompt = [
      promptContext,
      '',
      'Generate a JSON array of roadmap items. Each item must have:',
      '- "topic": string - the exact topic name (e.g. "JavaScript Data Types", "Dynamic Programming", "System Design")',
      '- "title": string - a short action-oriented learning title (e.g. "Master JavaScript Data Types & Type Coercion")',
      '- "description": string - 2 sentences: why this matters in interviews + what concepts to focus on',
      '- "priority": number 1-5 where 1 = most urgent',
      '- "estimated_hours": number - realistic hours to improve',
      '- "youtube_search_query": string - best YouTube search query for full tutorials',
      '- "weakness_score": number between 40-100 indicating how weak the area is',
      '',
      'Return as {"items": [...]}',
    ].join('\n')

    let aiItems: any[] = []

    try {
      const rawContent = await createChatCompletion({
        system: 'You are a senior technical career coach and curriculum designer. Return valid JSON only.',
        messages: [{ role: 'user', content: prompt }],
        model: GENERATION_MODEL,
        responseFormat: { type: 'json_object' },
        maxTokens: 1500,
      })

      // Clean markdown code blocks if model wrapped output in ```json
      const cleaned = (rawContent || '')
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()
      const match = cleaned.match(/\{[\s\S]*\}/)?.[0] || cleaned
      const roadmapData = JSON.parse(match || '{}')
      aiItems = roadmapData.items || roadmapData.roadmap_items || []
    } catch (aiErr) {
      console.warn('[Roadmap Generator] AI completion error, falling back to deterministic curriculum generator:', aiErr)
    }

    // Fallback: If AI fails or returns empty, construct targeted roadmap items directly from focus topics
    if (!Array.isArray(aiItems) || aiItems.length === 0) {
      const fallbackTopics = customTopics.length > 0
        ? customTopics
        : ['JavaScript Data Types', 'React Hooks & State Management', 'Dynamic Programming', 'System Design & Microservices']

      aiItems = fallbackTopics.map((topic, idx) => ({
        topic,
        title: `Master ${topic}`,
        description: `Comprehensive mastery module for ${topic}. Deep dive into core algorithmic trade-offs, system architecture, and frequent interview patterns.`,
        priority: idx + 1,
        estimated_hours: 4 + idx,
        weakness_score: Math.max(50, 85 - (idx * 8)),
        youtube_search_query: `${topic} tutorial course`,
      }))
    }

    // Clear old roadmap items for this user before inserting new ones
    await supabaseAdmin
      .from('roadmap_items')
      .delete()
      .eq('user_id', user.id)

    // For each item: fetch 2-4 YouTube videos + layer in static resources & courses
    const insertedItems: string[] = []

    for (const item of aiItems) {
      const resources: any[] = []

      // a) Fetch 2-3 YouTube tutorial videos for this specific topic
      const ytQuery = item.youtube_search_query || `${item.topic} tutorial course`
      let ytVideos = await searchYouTubeMulti(ytQuery, 3)

      // If specific query returned 0, retry with a clean simplified topic query
      if (!ytVideos || ytVideos.length === 0) {
        ytVideos = await searchYouTubeMulti(`${item.topic} tutorial`, 3)
      }

      if (Array.isArray(ytVideos) && ytVideos.length > 0) {
        resources.push(...ytVideos)
      }

      // b) Add static curated resources (courses + docs + practice links)
      const staticResources = getStaticResources(item.topic)

      for (const sr of staticResources) {
        if (sr.type === 'video' && ytVideos.length > 0) continue
        resources.push(sr)
      }

      // c) Fallback if no videos found at all
      const hasVideo = resources.some((r) => r.type === 'video')
      if (!hasVideo) {
        resources.push({
          type: 'video',
          title: `Search YouTube: ${item.topic} crash course`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`,
          thumbnail: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80`,
          channel: 'YouTube Technical Video',
          duration: '15:00',
        })
      }

      // Store in database
      const baseRecord = {
        user_id: user.id,
        topic: item.topic || 'General',
        title: item.title || `Master ${item.topic}`,
        description: item.description || '',
        resources,
        priority: item.priority || 3,
        estimated_hours: item.estimated_hours || 4,
        status: 'pending',
      }

      let inserted: any = null

      try {
        const r1 = await supabaseAdmin
          .from('roadmap_items')
          .insert({ ...baseRecord, weakness_score: item.weakness_score })
          .select('*')
          .maybeSingle()

        if (r1.data && !r1.error) {
          inserted = r1.data
        } else {
          // Retry without weakness_score if schema doesn't have it
          const r2 = await supabaseAdmin
            .from('roadmap_items')
            .insert(baseRecord)
            .select('*')
            .maybeSingle()

          if (r2.data && !r2.error) {
            inserted = r2.data
          } else {
            // Try via authenticated client
            const r3 = await supabase
              .from('roadmap_items')
              .insert({ ...baseRecord, weakness_score: item.weakness_score })
              .select('*')
              .maybeSingle()

            inserted = r3.data || null
          }
        }
      } catch (dbErr) {
        console.warn('[Roadmap Generator] DB insert attempt error:', dbErr)
      }

      const finalRecord = inserted || {
        id: `rm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...baseRecord,
        weakness_score: item.weakness_score,
      }

      insertedItems.push(finalRecord)
    }

    return NextResponse.json({
      success: true,
      count: insertedItems.length,
      items: insertedItems,
    })
  } catch (error: any) {
    console.error('[POST /api/roadmap/generate] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate roadmap' }, { status: 500 })
  }
}
