import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReferralsClient } from './referrals-client'

export default async function ReferralsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code, referral_credits')
    .eq('id', user.id)
    .single()

  // Generate referral code if missing
  let referralCode = profile?.referral_code
  if (!referralCode) {
    referralCode = user.id.replace(/-/g, '').slice(0, 8).toUpperCase()
    await supabase.from('profiles').update({ referral_code: referralCode }).eq('id', user.id)
  }

  const { data: referrals } = await supabase
    .from('referrals')
    .select('id, status, created_at, reward_type')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://interviewai.app'

  return (
    <ReferralsClient
      referralCode={referralCode}
      referralLink={`${appUrl}/ref/${referralCode}`}
      credits={profile?.referral_credits ?? 0}
      referrals={referrals ?? []}
    />
  )
}
