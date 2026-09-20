import type { Metadata } from 'next'
import { LandingBackground } from '@/components/ui/landing-background'
import { HelpAccordion } from './help-accordion'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Help Center — InterviewAI',
  description: 'Find answers to common questions about InterviewAI.',
}

const faqs = [
  {
    category: 'Getting Started',
    items: [
      { q: 'How do I start my first interview?', a: 'Click "Start Interview" in the sidebar or go to /interview/new. You can choose the type (DSA, System Design, Behavioral, etc.), difficulty, and optionally select your target role.' },
      { q: 'Do I need to upload a resume?', a: 'No — you can start practicing without a resume. However, uploading one allows InterviewAI to generate personalised questions based on your actual experience and tech stack.' },
      { q: 'What interview types are supported?', a: 'DSA/Algorithms, System Design, Behavioral (STAR format), Frontend (HTML/CSS/JS/React), and Backend (APIs, databases, architecture). More types are being added.' },
    ],
  },
  {
    category: 'Interview Types & Features',
    items: [
      { q: 'How does the AI evaluate my answers?', a: 'The AI scores each answer on correctness, clarity, depth, and communication. For coding questions, it also checks algorithmic efficiency. You receive a score out of 100, specific strengths, and areas to improve.' },
      { q: 'Can I speak my answers out loud?', a: 'Yes — click the microphone button to enable voice input. Your speech is transcribed in real-time and used as your answer.' },
      { q: 'Is there a coding editor?', a: 'Yes — the Monaco editor (same as VS Code) is available for coding questions. It supports syntax highlighting for 20+ languages.' },
    ],
  },
  {
    category: 'Billing & Plans',
    items: [
      { q: 'What does the Free plan include?', a: '3 AI practice interviews per month, 1 resume upload, basic feedback, and performance history. No credit card required.' },
      { q: 'What does Pro include?', a: 'Unlimited interviews, 5 resume uploads, deep AI feedback with follow-up questions, full analytics dashboard, API access, and referral rewards. ₹299/month or ₹2,990/year.' },
      { q: 'How do I upgrade?', a: 'Go to Dashboard → Billing and click "Upgrade to Pro". Payment is processed securely via Razorpay.' },
      { q: 'Can I cancel anytime?', a: 'Yes. Cancel from Billing settings — your Pro access continues until the end of your billing period. No penalties.' },
    ],
  },
  {
    category: 'Technical Issues',
    items: [
      { q: 'The microphone is not working.', a: 'Make sure you have granted microphone permissions to your browser. In Chrome/Edge: click the lock icon in the address bar → Microphone → Allow.' },
      { q: 'My session disconnected mid-interview.', a: 'All progress up to your last answer is automatically saved. Go to Interview History to resume or review the session.' },
      { q: 'The page is loading slowly.', a: 'InterviewAI uses AI models that may take 3-8 seconds to generate questions and feedback. This is expected. If loading exceeds 30 seconds, try refreshing the page.' },
    ],
  },
]

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#04040b] relative overflow-hidden">
      <LandingBackground />

      {/* Nav */}
      <nav className="relative z-10 border-b border-[#2b292d]/60 bg-[#04040b]/80 backdrop-blur-sm">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="led-pulse h-2 w-2 rounded-full bg-[#71d083]" />
            <span className="font-mono text-[13px] font-bold text-[#e5e5e5] uppercase tracking-[0.1em]">InterviewAI</span>
          </Link>
          <Link href="/dashboard" className="font-mono text-[11px] text-[#71d083] hover:text-[#82dba2] uppercase tracking-[0.08em] transition-colors">
            Dashboard →
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-[900px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.2em] mb-3">// HELP CENTER</p>
          <h1 className="font-display text-[44px] font-bold text-[#e5e5e5] tracking-[-0.025em] mb-4">
            How can we help?
          </h1>
          <p className="font-body text-[16px] text-[#7c7a85] max-w-[500px] mx-auto">
            Answers to the most common questions about InterviewAI.
          </p>
        </div>

        {/* FAQ sections */}
        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="font-mono text-[12px] text-[#71d083] uppercase tracking-[0.15em] mb-4 pb-3 border-b border-[#2b292d]/60">
                {section.category}
              </h2>
              <HelpAccordion items={section.items} />
            </div>
          ))}
        </div>

        {/* Contact card */}
        <div className="mt-16 p-7 border border-[#2b292d] rounded-[8px] bg-[#0c0c10]/40 text-center">
          <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.15em] mb-2">// STILL STUCK?</p>
          <h2 className="font-display text-[24px] font-bold text-[#e5e5e5] mb-2">Contact Support</h2>
          <p className="font-body text-[14px] text-[#7c7a85] mb-5">
            Our team responds within 24 hours on business days.
          </p>
          <a
            href="mailto:support@interviewai.app"
            className="inline-flex items-center gap-2 bg-[#71d083] text-[#04040b] font-mono text-[12px] font-bold uppercase tracking-[0.06em] px-6 py-2.5 rounded-[6px] border border-[#366740] hover:bg-[#82dba2] transition-colors"
          >
            support@interviewai.app →
          </a>
        </div>
      </div>
    </main>
  )
}
