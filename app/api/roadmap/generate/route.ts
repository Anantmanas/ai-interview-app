import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createChatCompletion, GENERATION_MODEL } from '@/lib/ai/client'
import { checkRateLimit } from '@/lib/middleware/rate-limit'
import { searchYouTube } from '@/lib/roadmap/youtube'
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

    // 1. Fetch user's weaknesses (weakness_score > 40)
    const { data: weaknesses } = await supabaseAdmin
      .from('user_weaknesses')
      .select('*')
      .eq('user_id', user.id)
      .gt('weakness_score', 40)
      .order('weakness_score', { ascending: false })

    console.log('[Roadmap Generator] Weaknesses found:', weaknesses?.length || 0)

    // 2a. If no weaknesses, fall back to profile-based starter roadmap
    let promptContext = ''

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

    // 2b. Build AI prompt using the context from above
    const prompt = [
      promptContext,
      '',
      'Generate a JSON array of roadmap items. Each item must have:',
      '- "topic": string - the exact topic name',
      '- "title": string - a short action-oriented learning title (e.g. "Master Dynamic Programming")',
      '- "description": string - 2 sentences: why this matters in interviews + what to focus on',
      '- "priority": number 1-5 where 1 = most urgent',
      '- "estimated_hours": number - realistic hours to improve',
      '- "youtube_search_query": string - best YouTube search query for a tutorial',
      '- "weakness_score": number between 40-100 indicating how weak the area is',
      '',
      'Return as {"items": [...]}',
    ].join('\n')

    const rawContent = await createChatCompletion({
      system: 'You are a technical career coach and curriculum designer. Return valid JSON only.',
      messages: [{ role: 'user', content: prompt }],
      model: GENERATION_MODEL,
      responseFormat: { type: 'json_object' },
      maxTokens: 1500,
    })


    const roadmapData = JSON.parse(rawContent || '{}')
    const aiItems: any[] = roadmapData.items || roadmapData.roadmap_items || []

    if (aiItems.length === 0) {
      return NextResponse.json({ error: 'AI returned no roadmap items' }, { status: 500 })
    }

    // 3. Clear old roadmap items for this user before inserting new ones
    await supabaseAdmin
      .from('roadmap_items')
      .delete()
      .eq('user_id', user.id)

    // 4. For each item: fetch YouTube video + layer in static resources
    const insertedItems: string[] = []

    for (const item of aiItems) {
      // Build resources array
      const resources: any[] = []

      // a) Try YouTube first
      const ytQuery = item.youtube_search_query || `${item.topic} tutorial for coding interviews 2024`
      const ytVideo = await searchYouTube(ytQuery)

      if (ytVideo) {
        resources.push(ytVideo)
      }

      // b) Always add static curated resources (docs + practice links)
      const staticResources = getStaticResources(item.topic)

      for (const sr of staticResources) {
        // If YouTube already gave us a video, skip static video to avoid duplicates
        if (sr.type === 'video' && ytVideo) continue
        resources.push(sr)
      }

      // c) If no YouTube video AND no static video, add a fallback YouTube search link
      const hasVideo = resources.some((r) => r.type === 'video')
      if (!hasVideo) {
        resources.push({
          type: 'video',
          title: `Search YouTube: ${item.topic} tutorial`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`,
          thumbnail: '',
          channel: 'YouTube Search',
        })
      }

      // 5. Store in database — resilient: try with weakness_score, fallback without
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

      let insertError: any = null
      let inserted: any = null

      const r1 = await supabaseAdmin
        .from('roadmap_items')
        .insert({ ...baseRecord, weakness_score: item.weakness_score })
        .select('id')
        .single()

      if (r1.error?.message?.toLowerCase().includes('weakness_score')) {
        // Column doesn't exist yet — insert without it
        const r2 = await supabaseAdmin
          .from('roadmap_items')
          .insert(baseRecord)
          .select('id')
          .single()
        inserted = r2.data
        insertError = r2.error
      } else {
        inserted = r1.data
        insertError = r1.error
      }

      if (insertError) {
        console.error('[Roadmap Generator] Insert error for topic:', item.topic, insertError)
      } else if (inserted) {
        insertedItems.push(inserted.id)
      }
    } // end for

    return NextResponse.json({ success: true, count: insertedItems.length })

  } catch (error: any) {
    console.error('[POST /api/roadmap/generate] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate roadmap' }, { status: 500 })
  }
}
