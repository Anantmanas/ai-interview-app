import Link from 'next/link'
import { LandingBackground } from '@/components/ui/landing-background'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#04040b] relative overflow-hidden">
      <LandingBackground />

      {/* Nav */}
      <nav className="relative z-10 border-b border-[#2b292d]/60 bg-[#04040b]/80 backdrop-blur-sm">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="led-pulse h-2 w-2 rounded-full bg-[#71d083]" />
            <span className="font-mono text-[13px] font-bold text-[#e5e5e5] uppercase tracking-[0.1em]">
              InterviewAI
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="font-mono text-[11px] text-[#7c7a85] hover:text-[#e5e5e5] uppercase tracking-[0.08em] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-mono text-[11px] text-[#7c7a85] hover:text-[#e5e5e5] uppercase tracking-[0.08em] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/auth/login"
              className="font-mono text-[11px] text-[#71d083] hover:text-[#82dba2] uppercase tracking-[0.08em] transition-colors"
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
      <footer className="relative z-10 border-t border-[#2b292d]/40 py-8 mt-16">
        <div className="max-w-[900px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="led-pulse h-2 w-2 rounded-full bg-[#71d083]" />
            <span className="font-mono text-[12px] font-bold text-[#e5e5e5] uppercase tracking-[0.08em]">
              InterviewAI
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="font-mono text-[10px] text-[#49474e] hover:text-[#7c7a85] uppercase tracking-[0.06em] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-mono text-[10px] text-[#49474e] hover:text-[#7c7a85] uppercase tracking-[0.06em] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
          <p className="font-mono text-[10px] text-[#49474e]">
            © {new Date().getFullYear()} InterviewAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
