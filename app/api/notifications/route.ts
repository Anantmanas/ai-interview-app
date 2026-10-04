import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

interface NotificationItem {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  read: boolean
  action_url: string | null
  created_at: string
}

function getDefaultNotifications(userId: string): NotificationItem[] {
  const now = Date.now()
  return [
    {
      id: `notif-journey-${userId.slice(0, 8)}`,
      user_id: userId,
      type: 'start_journey',
      title: '🚀 Start Your Technical Interview Journey',
      body: 'Kick off your baseline 15-minute voice & code mock interview to pinpoint your strengths and identify hidden gaps.',
      action_url: '/interview/new',
      read: false,
      created_at: new Date(now - 15 * 60 * 1000).toISOString(), // 15 mins ago
    },
    {
      id: `notif-promo-${userId.slice(0, 8)}`,
      user_id: userId,
      type: 'marketing',
      title: '⚡ 50% Off Pro: Unlimited Mock Interviews',
      body: 'Ace upcoming tech rounds with unlimited live voice sessions, deep ATS resume scoring, and custom roadmaps.',
      action_url: '/dashboard/billing',
      read: false,
      created_at: new Date(now - 2 * 3600 * 1000).toISOString(), // 2 hrs ago
    },
    {
      id: `notif-resume-${userId.slice(0, 8)}`,
      user_id: userId,
      type: 'resume_grounding',
      title: '📄 Ground Your AI with Your Resume',
      body: 'Upload your latest PDF resume to automatically calibrate question difficulty and role-specific architecture challenges.',
      action_url: '/dashboard/resume',
      read: false,
      created_at: new Date(now - 5 * 3600 * 1000).toISOString(), // 5 hrs ago
    },
    {
      id: `notif-roadmap-${userId.slice(0, 8)}`,
      user_id: userId,
      type: 'roadmap_ready',
      title: '🗺️ Adaptive Study Roadmap Active',
      body: 'Your personalized curriculum is ready. Explore targeted study modules and curated video prep before your real day.',
      action_url: '/dashboard/roadmap',
      read: false,
      created_at: new Date(now - 9 * 3600 * 1000).toISOString(), // 9 hrs ago
    },
    {
      id: `notif-challenge-${userId.slice(0, 8)}`,
      user_id: userId,
      type: 'daily_challenge',
      title: '🔥 Daily Technical Warmup: Distributed Caching',
      body: 'High-frequency question: "How would you design a distributed cache with LRU eviction and replication?" Test yourself out loud.',
      action_url: '/interview/new',
      read: true,
      created_at: new Date(now - 16 * 3600 * 1000).toISOString(), // 16 hrs ago
    },
  ]
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cookieStore = await cookies()
  const readCookieVal = cookieStore.get('read_notifications')?.value || ''
  const readIds = new Set(readCookieVal.split(',').filter(Boolean))

  let notifications: NotificationItem[] = []

  try {
    const { data: dbNotifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && dbNotifications && dbNotifications.length > 0) {
      notifications = dbNotifications as NotificationItem[]
    }
  } catch {
    // Database table might not be migrated yet; fallback smoothly to defaults
  }

  // If no DB notifications exist yet, generate the sample marketing & journey notifications
  if (notifications.length === 0) {
    notifications = getDefaultNotifications(user.id)
  }

  // Apply cookie-based read state
  notifications = notifications.map((n) => ({
    ...n,
    read: n.read || readIds.has(n.id),
  }))

  const unreadCount = notifications.filter((n) => !n.read).length

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, markAllRead } = await request.json()
  const cookieStore = await cookies()
  const readCookieVal = cookieStore.get('read_notifications')?.value || ''
  const readIds = new Set(readCookieVal.split(',').filter(Boolean))

  if (markAllRead) {
    const defaults = getDefaultNotifications(user.id)
    defaults.forEach((d) => readIds.add(d.id))

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
    } catch {
      // Ignore if table not present
    }
  } else if (id) {
    readIds.add(id)
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id)
    } catch {
      // Ignore if table not present
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('read_notifications', Array.from(readIds).join(','), {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  })

  return response
}
