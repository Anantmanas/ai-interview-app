'use client'

import { motion } from 'motion/react'
import { ArrowRight, Mic, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export function Chapter06Blue() {
  return (
    <section className="section-electric py-36 sm:py-48 px-6 md:px-12 lg:px-20 relative overflow-hidden select-text">
      {/* Chapter Marker Header */}
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-20 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-white/20 pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white">
            06 / GET INTERVIEW READY
          </span>
          <span className="text-white/60">•</span>
          <span className="font-mono text-xs text-white/80 tracking-wide uppercase">
            START PRACTICING TODAY
          </span>
        </div>
        <div className="font-mono text-xs text-white/80 uppercase tracking-wider">
          100% FREE TO START — NO CREDIT CARD REQUIRED
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-4xl mb-14">
          <h2 className="display-giant text-white font-bold leading-[0.92]">
            Ready to ace your upcoming interview?
          </h2>
          <p className="font-body text-xl sm:text-2xl text-white/90 mt-6 font-light max-w-3xl leading-relaxed">
            Stop spending months grinding random problems. Practice with a realistic AI interviewer, discover your exact knowledge gaps, and follow a custom roadmap to land your offer.
          </p>
        </div>

        {/* Action Cluster */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 mb-16">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center gap-3 bg-white text-[#0A0A0A] hover:bg-[#F4F2EC] px-9 py-5 rounded-md font-mono text-xs uppercase tracking-[0.14em] font-bold shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99] group"
          >
            <Mic className="w-4 h-4 text-[#2447FF]" />
            <span>Start Free Mock Interview</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border border-white/40 hover:border-white text-white hover:bg-white/10 px-8 py-5 rounded-md font-mono text-xs uppercase tracking-[0.12em] font-semibold transition-all"
          >
            <span>Go to Dashboard</span>
          </Link>
        </div>

        {/* Guarantees */}
        <div className="pt-10 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono text-white/80">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>NO CREDIT CARD REQUIRED</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>VOICE & MONACO CODE EDITOR</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>PERSONALIZED ROADMAP INCLUDED</span>
          </div>
        </div>
      </div>
    </section>
  )
}
