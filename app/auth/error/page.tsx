import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { LandingBackground } from '@/components/ui/landing-background'

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-[#000000] flex items-center justify-center p-6 relative overflow-hidden">
      <LandingBackground />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="led-pulse h-2 w-2 rounded-full bg-[#ef4444]" />
            <span className="font-mono text-[14px] font-bold text-[#ffffff] uppercase tracking-[0.1em]">
              InterviewAI
            </span>
          </Link>
          <p className="font-mono text-[10px] text-[#ef4444] uppercase tracking-[0.2em] mb-2.5 font-semibold">
            // AUTH PROTOCOL ERROR
          </p>
          <h1 className="font-display text-[28px] sm:text-[30px] font-bold text-[#ffffff] tracking-[-0.025em]">
            Authentication Failed
          </h1>
          <p className="font-body text-[14px] text-[#9ca3af] mt-2">
            The verification link may have expired or was already used
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#09090e] border border-[#1e1e2f] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-7 space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#2a0e15] border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] shadow-[0_0_25px_rgba(239,68,68,0.25)]">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <p className="text-xs font-mono text-[#9ca3af] text-center leading-relaxed bg-[#0c0d18] border border-[#1e2030] p-4 rounded-lg">
            Security tokens expire after 60 minutes for your protection. Please generate a new link or sign in with your credentials.
          </p>

          <div className="space-y-3 pt-1">
            <Link
              href="/auth/login"
              className="btn-neo-violet w-full font-mono text-[12px] font-bold uppercase tracking-[0.06em] py-3 rounded-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Sign In</span>
            </Link>

            <Link
              href="/auth/sign-up"
              className="w-full flex items-center justify-center gap-2 bg-[#000000] border border-[#27272a] hover:bg-[#121216] hover:border-[#3f3f46] text-[#f8fafc] font-mono text-[12px] uppercase tracking-[0.06em] py-2.5 rounded-md transition-colors"
            >
              <span>Create New Account</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
