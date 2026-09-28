'use client'

import { motion } from 'motion/react'
import { ArrowRight, CheckCircle2, TrendingUp, AlertTriangle, Sparkles, BookOpen } from 'lucide-react'
import Link from 'next/link'

export function Chapter05Void() {
  return (
    <section className="section-void py-32 sm:py-44 px-6 md:px-12 lg:px-20 border-t border-white/[0.1] relative overflow-hidden select-text">
      {/* Chapter Marker Header */}
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-24 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-white/[0.1] pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#F4F2EC]">
            05 / THE EVALUATION ARTIFACT
          </span>
          <span className="text-[#8C8C88]">•</span>
          <span className="font-mono text-xs text-[#8C8C88] tracking-wide uppercase">
            NARRATIVE REASONING
          </span>
        </div>
        <div className="font-mono text-xs text-[#8C8C88] uppercase tracking-wider">
          SCORES ARE USELESS WITHOUT ACTIONABLE CAUSALITY
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Giant Number + Editorial Statement Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-baseline mb-20 md:mb-28 border-b border-white/[0.1] pb-16">
          <div className="lg:col-span-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#2447FF] font-semibold block mb-2">
              COMPOSITE TELEMETRY
            </span>
            <div className="display-giant text-[#F4F2EC] font-bold leading-none">
              72
            </div>
            <span className="font-mono text-sm uppercase tracking-[0.16em] text-[#8C8C88] mt-2 block">
              INTERVIEW SIGNAL / 100
            </span>
          </div>

          <div className="lg:col-span-8">
            <h2 className="display-statement text-[#F4F2EC] font-semibold">
              "Strong algorithmic fundamentals. Critical weakness in multi-region distributed consensus."
            </h2>
            <p className="font-body text-lg sm:text-xl text-[#8C8C88] mt-6 leading-relaxed font-light">
              This is the exact synthesis generated after a 30-minute simulation. Instead of arbitrary percentages, InterviewAI constructs a causal narrative explaining where you lost ground and the exact technical pattern needed to resolve it.
            </p>
          </div>
        </div>

        {/* Narrative Flow: Diagnosis → Weakness → Recommendation → Next Action */}
        <div className="space-y-12 max-w-4xl">
          {/* Step 1: Diagnosis */}
          <div className="border-l-2 border-[#2447FF] pl-6 sm:pl-8 space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#2447FF] font-semibold">
              01 // THE DIAGNOSIS
            </span>
            <h4 className="font-display text-xl sm:text-2xl font-bold text-[#F4F2EC]">
              Single-node execution is pristine; cross-datacenter failure modes are neglected.
            </h4>
            <p className="font-body text-base text-[#8C8C88] leading-relaxed">
              Candidate solved the LRU eviction challenge with optimal O(1) time and space complexity in Monaco IDE. However, during the distributed scaling follow-up question, the candidate assumed instantaneous network propagation and ignored split-brain consensus edge cases.
            </p>
          </div>

          {/* Step 2: Critical Weakness */}
          <div className="border-l-2 border-[#f43f5e] pl-6 sm:pl-8 space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#f43f5e] font-semibold">
              02 // CRITICAL BLINDSPOT
            </span>
            <h4 className="font-display text-xl sm:text-2xl font-bold text-[#F4F2EC]">
              Unaddressed Split-Brain Partitioning in Raft Quorums.
            </h4>
            <p className="font-body text-base text-[#8C8C88] leading-relaxed">
              When asked how the leader responds if a network partition isolates it from majority nodes, candidate proposed continued write-acceptance with background reconciliation — directly violating linearizability guarantees.
            </p>
          </div>

          {/* Step 3: Exact Architectural Fix */}
          <div className="border-l-2 border-[#fbbf24] pl-6 sm:pl-8 space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#fbbf24] font-semibold">
              03 // CAVEMAN DIRECTIVE & RECOMMENDATION
            </span>
            <h4 className="font-display text-xl sm:text-2xl font-bold text-[#F4F2EC]">
              Enforce leader lease expiration and quorum acknowledgments.
            </h4>
            <p className="font-body text-base text-[#8C8C88] leading-relaxed">
              Fix: Isolated leader must step down if heartbeat roundtrips fail within election timeout. Writes must fail immediately until majority quorum is re-established.
            </p>
          </div>

          {/* Step 4: Next Action */}
          <div className="border-l-2 border-[#34d399] pl-6 sm:pl-8 space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#34d399] font-semibold">
              04 // AUTOMATED REMEDIATION NEXT ACTION
            </span>
            <h4 className="font-display text-xl sm:text-2xl font-bold text-[#F4F2EC]">
              Ingested into Mastery Roadmap: "Distributed Consensus & Raft Invariants"
            </h4>
            <p className="font-body text-base text-[#8C8C88] leading-relaxed">
              Curated masterclass tutorial by Diego Ongaro and 1 targeted 15-minute follow-up simulation scheduled to re-verify linearizability reasoning.
            </p>
          </div>
        </div>

        {/* Narrative Proof: Direct Link to Practice */}
        <div className="mt-20 pt-10 border-t border-white/[0.1] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="text-xs font-mono text-[#8C8C88]">
            <span className="text-[#F4F2EC] font-semibold">Artifact generation time:</span> 480ms post-submission
          </div>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#F4F2EC] hover:text-[#2447FF] transition-colors border-b border-white/[0.2] hover:border-[#2447FF] pb-1"
          >
            <span>Explore full telemetry archives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
