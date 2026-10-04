'use client'

import { motion } from 'motion/react'
import { ArrowRight, CheckCircle2, TrendingUp, AlertTriangle, Sparkles, BookOpen } from 'lucide-react'
import Link from 'next/link'

export function Chapter05Void() {
  return (
    <section className="section-void py-32 sm:py-44 px-6 md:px-12 lg:px-20 border-t border-white/[0.1] relative overflow-hidden select-text">
      {/* Chapter Marker Header */}
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-20 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-white/[0.1] pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#F4F2EC]">
            05 / YOUR SCORECARD
          </span>
          <span className="text-[#8C8C88]">•</span>
          <span className="font-mono text-xs text-[#8C8C88] tracking-wide uppercase">
            ACTIONABLE FEEDBACK
          </span>
        </div>
        <div className="font-mono text-xs text-[#8C8C88] uppercase tracking-wider">
          NO MORE VAGUE REJECTION EMAILS — EXACTLY WHAT TO FIX
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Giant Number + Editorial Statement Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-baseline mb-16 md:mb-24 border-b border-white/[0.1] pb-14">
          <div className="lg:col-span-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#2447FF] font-semibold block mb-2">
              SESSION SCORE
            </span>
            <div className="display-giant text-[#F4F2EC] font-bold leading-none">
              78
            </div>
            <span className="font-mono text-sm uppercase tracking-[0.16em] text-[#8C8C88] mt-2 block">
              OUT OF 100 POINTS
            </span>
          </div>

          <div className="lg:col-span-8">
            <h2 className="display-statement text-[#F4F2EC] font-semibold text-2xl sm:text-3xl">
              "Great coding fundamentals. Weak on API rate limiting & database indexing."
            </h2>
            <p className="font-body text-lg sm:text-xl text-[#8C8C88] mt-4 leading-relaxed font-light">
              Instead of waiting weeks for a generic rejection email with zero explanation, you get a clean breakdown within 5 seconds: where you earned points, where you lost ground, and the exact topic to study.
            </p>
          </div>
        </div>

        {/* Forensic Dossier: Diagnosis → Weakness → Recommendation → Next Action */}
        <div className="border border-white/[0.1] bg-[#07070A] divide-y divide-white/[0.08]">
          <div className="p-4 sm:p-6 bg-white/[0.02] flex items-center justify-between text-[11px] font-mono text-[#8C8C88] uppercase tracking-wider">
            <span>SAMPLE SCORECARD BREAKDOWN</span>
            <span className="text-[#fbbf24] font-semibold">[ 1 KNOWLEDGE GAP QUEUED FOR PRACTICE ]</span>
          </div>

          {/* Step 1: What went well */}
          <div className="p-6 sm:p-8 space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#10b981] font-semibold block">
              [ 01 // WHAT YOU DID WELL ]
            </span>
            <h4 className="font-display text-lg sm:text-xl font-bold text-[#F4F2EC]">
              Clean code structure and optimal O(N) runtime in the editor.
            </h4>
            <p className="font-body text-sm sm:text-base text-[#9E9B93] leading-relaxed max-w-3xl">
              You wrote clean, bug-free code in the Monaco editor and explained your variable choices and algorithmic trade-offs clearly without getting stuck.
            </p>
          </div>

          {/* Step 2: Critical Weakness */}
          <div className="p-6 sm:p-8 space-y-2 bg-[#f43f5e]/[0.02]">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#f43f5e] font-semibold block">
              [ 02 // THE KNOWLEDGE GAP ]
            </span>
            <h4 className="font-display text-lg sm:text-xl font-bold text-[#F4F2EC]">
              Overlooked database connection limits and indexing under load.
            </h4>
            <p className="font-body text-sm sm:text-base text-[#9E9B93] leading-relaxed max-w-3xl">
              When the interviewer asked how your backend handles 50,000 requests per minute, you didn't mention database connection pooling or composite indexing to keep queries fast.
            </p>
          </div>

          {/* Step 3: Exact Architectural Fix */}
          <div className="p-6 sm:p-8 space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#fbbf24] font-semibold block">
              [ 03 // THE EXACT FIX & HOW TO ANSWER ]
            </span>
            <h4 className="font-display text-lg sm:text-xl font-bold text-[#F4F2EC]">
              Explain connection pooling and adding composite B-tree indexes.
            </h4>
            <p className="font-body text-sm sm:text-base text-[#9E9B93] leading-relaxed max-w-3xl">
              Fix: Tell the interviewer you'd add connection pooling (like PgBouncer) to avoid exhausting memory, and add a composite index on frequently searched columns to speed up query lookups.
            </p>
          </div>

          {/* Step 4: Next Action */}
          <div className="p-6 sm:p-8 space-y-2 bg-[#2447FF]/[0.04]">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#2447FF] font-semibold block">
              [ 04 // ADDED TO YOUR ROADMAP ]
            </span>
            <h4 className="font-display text-lg sm:text-xl font-bold text-[#F4F2EC]">
              Study Unit: "Database Indexing & Query Optimization"
            </h4>
            <p className="font-body text-sm sm:text-base text-[#9E9B93] leading-relaxed max-w-3xl">
              Includes a curated 12-minute video breakdown and a targeted 5-question follow-up quiz to confirm you've mastered the concept before your real interview.
            </p>
          </div>
        </div>

        {/* Link to Dashboard */}
        <div className="mt-16 pt-8 border-t border-white/[0.1] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="text-xs font-mono text-[#8C8C88]">
            <span className="text-[#F4F2EC] font-semibold">Ready in:</span> 5 seconds after each interview
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#F4F2EC] hover:text-[#2447FF] transition-colors border-b border-white/[0.2] hover:border-[#2447FF] pb-1"
          >
            <span>View sample interview scorecards in Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
