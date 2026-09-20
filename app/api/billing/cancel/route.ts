import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { razorpay } from '@/lib/razorpay'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('razorpay_subscription_id')
      .eq('id', user.id)
      .single()

    if (!profile?.razorpay_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Cancel at period end (cancel_at_cycle_end: 1)
    await razorpay.subscriptions.cancel(profile.razorpay_subscription_id, true)

    // Update DB status
    await supabase
      .from('profiles')
      .update({ subscription_status: 'canceling' })
      .eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Razorpay cancel error:', err)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
