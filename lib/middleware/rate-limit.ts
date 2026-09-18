import { supabaseAdmin } from '@/lib/supabase/admin'

export interface RateLimitResult {
  allowed: boolean
  remaining?: number
  limit?: number
  resetInSeconds?: number
}

/**
 * Checks and increments the daily AI rate limit for a user.
 * Free tier: 25 calls/day, Pro tier: 150 calls/day.
 * Resets automatically after 24 hours.
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('daily_ai_calls, plan, last_call_reset')
      .eq('id', userId)
      .maybeSingle()

    if (error || !profile) {
      // Allow if profile lookup fails
      return { allowed: true }
    }

    const plan = profile.plan || 'free'
    const limit = plan === 'pro' ? 150 : 25
    const now = new Date()
    const lastReset = profile.last_call_reset ? new Date(profile.last_call_reset) : new Date(0)
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)

    let currentCalls = profile.daily_ai_calls || 0

    if (hoursSinceReset >= 24) {
      // Reset daily counter
      currentCalls = 1
      await supabaseAdmin
        .from('profiles')
        .update({
          daily_ai_calls: currentCalls,
          last_call_reset: now.toISOString(),
        })
        .eq('id', userId)

      return { allowed: true, remaining: limit - 1, limit }
    }

    if (currentCalls >= limit) {
      const resetInSeconds = Math.ceil((24 - hoursSinceReset) * 3600)
      return {
        allowed: false,
        remaining: 0,
        limit,
        resetInSeconds,
      }
    }

    // Increment counter
    await supabaseAdmin
      .from('profiles')
      .update({
        daily_ai_calls: currentCalls + 1,
      })
      .eq('id', userId)

    return { allowed: true, remaining: limit - (currentCalls + 1), limit }
  } catch (err) {
    console.error('[RateLimit] Error checking rate limit:', err)
    return { allowed: true }
  }
}
