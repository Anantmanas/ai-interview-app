import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BillingClient } from './billing-client'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status, interviews_used_this_month, interviews_limit, plan_expires_at, razorpay_subscription_id')
    .eq('id', user.id)
    .single()

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <BillingClient
      profile={profile}
      subscriptions={subscriptions ?? []}
    />
  )
}
