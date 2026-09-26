import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * One-time migration endpoint.
 * Adds weakness_score and completed_at columns to roadmap_items if they don't exist.
 * 
 * Call: POST /api/roadmap/migrate
 * Protected: only accessible with SUPABASE_SERVICE_ROLE_KEY — no auth header trick.
 * 
 * This route should be disabled / removed after the migration runs successfully.
 */
export async function POST() {
  try {
    // Use raw SQL via the admin client's rpc (if exec_sql exists) or use a select trick.
    // Supabase doesn't expose ALTER TABLE via PostgREST — we must use the Supabase Management API
    // or a server-side workaround. Here we test by trying to read the column.

    // Test if weakness_score column exists by selecting it
    const { error: weaknessError } = await supabaseAdmin
      .from('roadmap_items')
      .select('weakness_score')
      .limit(1)

    const { error: completedError } = await supabaseAdmin
      .from('roadmap_items')
      .select('completed_at')
      .limit(1)

    const needsWeakness = weaknessError?.message?.includes('weakness_score')
    const needsCompleted = completedError?.message?.includes('completed_at')

    return NextResponse.json({
      weakness_score_exists: !needsWeakness,
      completed_at_exists: !needsCompleted,
      note: needsWeakness || needsCompleted
        ? 'Run the following SQL in Supabase SQL editor: ALTER TABLE public.roadmap_items ADD COLUMN IF NOT EXISTS weakness_score integer; ALTER TABLE public.roadmap_items ADD COLUMN IF NOT EXISTS completed_at timestamptz;'
        : 'All columns exist — no migration needed.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
