import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { LandingBackground } from '@/components/ui/landing-background'

interface ReferralPageProps {
  params: Promise<{ code: string }>
}

export default async function ReferralPage({ params }: ReferralPageProps) {
  const { code } = await params

  // Set referral cookie for 30 days
  const cookieStore = await cookies()
  cookieStore.set('referral_code', code, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  })

  // Quick redirect after a brief landing (the page renders, cookie is set server-side)
  // Show a short splash then redirect
  return (
    <main className="min-h-screen bg-[#000000] flex items-center justify-center p-6 relative overflow-hidden">
      <LandingBackground />
      <div className="relative z-10 max-w-[460px] text-center">
        <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] mb-4">// REFERRAL INVITE</p>
        <h1 className="font-display text-[36px] font-bold text-white leading-[1.05] tracking-[-0.025em] mb-4">
          You've been invited to InterviewAI
        </h1>
        <p className="font-body text-[16px] text-[#9ca3af] mb-8">
          Practice technical interviews with AI. Get real-time feedback and ace your next round.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center gap-2 bg-[#4f46e5] text-white font-mono text-[13px] font-bold uppercase tracking-[0.06em] px-8 py-3.5 rounded-[6px] border border-[#3730a3] hover:bg-[#5865f2] transition-colors shadow-[0_0_25px_rgba(79,70,229,0.4)]"
          >
            Create Free Account →
          </Link>
          <Link
            href="/auth/login"
            className="font-mono text-[11px] text-[#64748b] hover:text-white uppercase tracking-[0.06em] transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
        <p className="font-mono text-[10px] text-[#64748b] mt-6">Referral: {code}</p>
      </div>
    </main>
  )
}
