import Link from 'next/link'
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react'
import { LandingBackground } from '@/components/ui/landing-background'

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-screen bg-[#000000] flex items-center justify-center p-6 relative overflow-hidden">
      <LandingBackground />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="led-pulse h-2 w-2 rounded-full bg-[#6366f1]" />
            <span className="font-mono text-[14px] font-bold text-[#ffffff] uppercase tracking-[0.1em]">
              InterviewAI
            </span>
          </Link>
          <p className="font-mono text-[10px] text-[#22c55e] uppercase tracking-[0.2em] mb-2.5 font-semibold">
            // VERIFICATION DISPATCHED
          </p>
          <h1 className="font-display text-[28px] sm:text-[30px] font-bold text-[#ffffff] tracking-[-0.025em]">
            Check Your Inbox
          </h1>
          <p className="font-body text-[14px] text-[#9ca3af] mt-2">
            We sent a verification link to confirm your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#09090e] border border-[#1e1e2f] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-7 space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#0d2818] border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] shadow-[0_0_25px_rgba(34,197,94,0.25)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="bg-[#0c0d18] border border-[#1e2030] rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#818cf8]">
              <Mail className="h-4 w-4" />
              <span className="font-semibold uppercase tracking-wider">Next Steps:</span>
            </div>
            <ol className="text-xs font-mono text-[#9ca3af] space-y-2 pl-4 list-decimal">
              <li>Open the confirmation email in your inbox</li>
              <li>Click the activation link</li>
              <li>Launch your AI mock interview cockpit!</li>
            </ol>
          </div>

          <div className="space-y-3 pt-1">
            <Link
              href="/auth/login"
              className="btn-neo-violet w-full font-mono text-[12px] font-bold uppercase tracking-[0.06em] py-3 rounded-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[11px] text-center font-mono text-[#64748b]">
              {"Didn't receive the email? Check spam or"}{' '}
              <Link href="/auth/sign-up" className="text-[#818cf8] hover:text-white transition-colors">
                try another address
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
