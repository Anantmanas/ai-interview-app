import Link from 'next/link'
import { LandingBackground } from '@/components/ui/landing-background'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000000] relative overflow-hidden">
      <LandingBackground />

      {/* Nav */}
      <nav className="relative z-10 border-b border-[#1e1e2f] bg-[#000000]/80 backdrop-blur-sm">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="led-pulse h-2 w-2 rounded-full bg-[#6366f1]" />
            <span className="font-mono text-[13px] font-bold text-white uppercase tracking-[0.1em]">
              InterviewAI
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="font-mono text-[11px] text-[#9ca3af] hover:text-white uppercase tracking-[0.08em] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-mono text-[11px] text-[#9ca3af] hover:text-white uppercase tracking-[0.08em] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/auth/login"
              className="font-mono text-[11px] text-[#818cf8] hover:text-white uppercase tracking-[0.08em] transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1e1e2f]/60 py-8 mt-16">
        <div className="max-w-[900px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="led-pulse h-2 w-2 rounded-full bg-[#6366f1]" />
            <span className="font-mono text-[12px] font-bold text-white uppercase tracking-[0.08em]">
              InterviewAI
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="font-mono text-[10px] text-[#64748b] hover:text-[#9ca3af] uppercase tracking-[0.06em] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-mono text-[10px] text-[#64748b] hover:text-[#9ca3af] uppercase tracking-[0.06em] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
          <p className="font-mono text-[10px] text-[#64748b]">
            © {new Date().getFullYear()} InterviewAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
