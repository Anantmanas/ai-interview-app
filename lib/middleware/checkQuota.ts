import { createClient } from '@/lib/supabase/server'

export interface QuotaResult {
  allowed: boolean
  reason?: string
  used: number
  limit: number
  plan: string
}

/**
 * Server-side quota check before starting an interview.
 * Call this at the top of any API route that creates an interview.
 */
export async function checkInterviewQuota(userId: string): Promise<QuotaResult> {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('plan, interviews_used_this_month, interviews_limit, last_call_reset')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return { allowed: false, reason: 'Profile not found', used: 0, limit: 0, plan: 'free' }
  }

  // Reset monthly counter if needed (belt-and-suspenders alongside DB cron)
  const lastReset = new Date(profile.last_call_reset ?? 0)
  const now = new Date()
  const sameMonth =
    lastReset.getMonth() === now.getMonth() &&
    lastReset.getFullYear() === now.getFullYear()

  let used = profile.interviews_used_this_month ?? 0

  if (!sameMonth) {
    // Reset counter
    await supabase
      .from('profiles')
      .update({ interviews_used_this_month: 0, last_call_reset: now.toISOString() })
      .eq('id', userId)
    used = 0
  }

  const limit: number = profile.interviews_limit ?? 3

  if (used >= limit) {
    return {
      allowed: false,
      reason: `You have used all ${limit} interviews for this month. Upgrade to Pro for unlimited access.`,
      used,
      limit,
      plan: profile.plan ?? 'free',
    }
  }

  return { allowed: true, used, limit, plan: profile.plan ?? 'free' }
}

/**
 * Increment the interview counter after a session starts.
 */
export async function incrementInterviewCount(userId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc('increment_interview_count', { uid: userId })
}
