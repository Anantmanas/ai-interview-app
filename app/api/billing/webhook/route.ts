import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

// Validate Razorpay webhook signature
function validateSignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('X-Razorpay-Signature') ?? ''
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!

  if (!validateSignature(body, signature, secret)) {
    console.error('Razorpay webhook: invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)
  const supabase = createAdminClient()

  try {
    switch (event.event) {
      case 'subscription.activated': {
        const sub = event.payload.subscription.entity
        const userId = sub.notes?.user_id

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              plan: 'pro',
              subscription_status: 'active',
              razorpay_subscription_id: sub.id,
              interviews_limit: 999,
              plan_expires_at: new Date(sub.current_end * 1000).toISOString(),
            })
            .eq('id', userId)

          // Upsert subscriptions audit table
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            razorpay_subscription_id: sub.id,
            plan: 'pro',
            status: 'active',
            current_period_start: new Date(sub.current_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_end * 1000).toISOString(),
          }, { onConflict: 'razorpay_subscription_id' })
        }
        break
      }

      case 'payment.captured': {
        const payment = event.payload.payment.entity
        const subscriptionId = payment.subscription_id
        if (!subscriptionId) break

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('razorpay_subscription_id', subscriptionId)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'active' })
            .eq('id', profile.id)
        }
        break
      }

      case 'subscription.cancelled': {
        const sub = event.payload.subscription.entity
        const userId = sub.notes?.user_id

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              plan: 'free',
              subscription_status: 'canceled',
              interviews_limit: 3,
            })
            .eq('id', userId)

          await supabase
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('razorpay_subscription_id', sub.id)
        }
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        const subscriptionId = payment.subscription_id
        if (!subscriptionId) break

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('razorpay_subscription_id', subscriptionId)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('id', profile.id)

          // Insert notification for user
          await supabase.from('notifications').insert({
            user_id: profile.id,
            type: 'payment_failed',
            title: 'Payment Failed',
            body: 'Your subscription payment failed. Please update your payment method.',
            action_url: '/dashboard/billing',
          })
        }
        break
      }

      default:
        console.log('Unhandled Razorpay event:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
