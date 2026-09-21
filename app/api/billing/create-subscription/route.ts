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

    // Fetch or create Razorpay customer ID from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('razorpay_customer_id, email, full_name')
      .eq('id', user.id)
      .single()

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PRO_PLAN_ID!,
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months; for monthly billing
      notes: {
        user_id: user.id,
        email: profile?.email ?? user.email ?? '',
      },
    })

    return NextResponse.json({
      subscription_id: subscription.id,
      key_id: process.env.RAZORPAY_KEY_ID,
      customer_name: profile?.full_name ?? '',
      customer_email: profile?.email ?? user.email ?? '',
    })
  } catch (err) {
    console.error('Razorpay create-subscription error:', err)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
