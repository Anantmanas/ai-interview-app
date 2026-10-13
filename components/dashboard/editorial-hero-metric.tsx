'use client'

import { motion } from 'motion/react'
import { TrendingUp, Clock, Target, Calendar, ArrowRight, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface EditorialHeroMetricProps {
  averageScore: number
  totalInterviews: number
  completedCount: number
  practiceHours: number
  weaknessCount: number
}

export function EditorialHeroMetric({
  averageScore,
  totalInterviews,
  completedCount,
  practiceHours,
  weaknessCount,
}: EditorialHeroMetricProps) {
  const readinessCategory =
    completedCount === 0
      ? 'CALIBRATING'
      : averageScore >= 80
      ? 'BAR-RAISER READY'
      : averageScore >= 65
      ? 'COMPETITIVE CANDIDACY'
      : 'DEVELOPING FOUNDATION'

  const categoryColor =
    completedCount === 0
      ? 'text-[#9a9a9a] border-white/20'
      : averageScore >= 80
      ? 'text-[#15846e] border-[#15846e]/40 bg-[#15846e]/10'
      : averageScore >= 65
      ? 'text-[#8052ff] border-[#8052ff]/40 bg-[#8052ff]/10'
      : 'text-[#ffb829] border-[#ffb829]/40 bg-[#ffb829]/10'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.04] border border-white/10 hover:border-white/15 transition-all duration-300 rounded-3xl p-6 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.5)] relative overflow-hidden">
      {/* Subtle Ambient Radial Aura */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 bg-[#8052ff]/10 blur-[100px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      {/* Left Dominant Metric: Large Visual Score Representation (~58% width) */}
      <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.08] pb-8 lg:pb-0 lg:pr-10 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-400">
              SYNTHESIZED READINESS SIGNAL
            </span>
            <span className={`font-mono text-[10px] uppercase px-3 py-0.5 rounded-full border ${categoryColor}`}>
              {readinessCategory}
            </span>
          </div>

          <div className="flex items-baseline gap-4 my-2">
            <span className="font-display text-7xl sm:text-8xl font-normal tracking-tight text-white">
              {completedCount > 0 ? averageScore : '—'}
            </span>
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
              / 100 COMPOSITE
            </span>
          </div>

          <p className="font-sans text-base text-zinc-400 leading-relaxed max-w-lg mt-3 font-light">
            {completedCount === 0
              ? 'No evaluations recorded yet. Launch your first mock interview to calibrate your score against senior engineering bars.'
              : averageScore >= 80
              ? 'Candidate demonstrates high architectural maturity, solid concurrency primitives, and minimal hesitation.'
              : 'Consistent fundamentals with identifiable blindspots in distributed systems trade-offs and edge-case handling.'}
          </p>
        </div>

        <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Evaluated across {completedCount} rounds</span>
          <Link
            href="/dashboard/history"
            className="text-[#8052ff] hover:text-[#9a75ff] transition-colors uppercase tracking-wider inline-flex items-center gap-1 font-medium"
          >
            <span>Inspect signal history</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Right Telemetry Triad: Secondary Metrics Asymmetrically Positioned (~42% width) */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:pl-4 relative z-10">
        {/* Metric 1: Practice Runtime */}
        <div className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-zinc-400 tracking-[0.16em]">
              PRACTICE RUNTIME
            </span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-normal text-white mt-1">
            {practiceHours} <span className="text-base text-zinc-500 font-normal">hours</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            Total deliberate simulation time
          </span>
        </div>

        {/* Metric 2: Completed Simulations */}
        <div className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-zinc-400 tracking-[0.16em]">
              SIMULATIONS
            </span>
            <Calendar className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-normal text-white mt-1">
            {completedCount}{' '}
            <span className="text-base text-zinc-500 font-normal">of {totalInterviews} rounds</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            Full multi-vector audits completed
          </span>
        </div>

        {/* Metric 3: Active Blindspots */}
        <div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-zinc-400 tracking-[0.16em]">
              ACTIVE BLINDSPOTS
            </span>
            <Target className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-normal text-white mt-1">
            {weaknessCount}{' '}
            <span className="text-base text-zinc-500 font-normal">topics</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500">
            {weaknessCount === 0
              ? 'No critical gaps diagnosed'
              : 'Queued for automated remediation'}
          </span>
        </div>
      </div>
    </div>
  )
}
