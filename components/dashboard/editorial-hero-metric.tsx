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
      ? 'text-[#8C8C88] border-white/20'
      : averageScore >= 80
      ? 'text-[#34d399] border-[#34d399]/40 bg-[#34d399]/10'
      : averageScore >= 65
      ? 'text-[#6B85FF] border-[#2447FF]/40 bg-[#2447FF]/10'
      : 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border border-white/10 rounded-2xl bg-[#0D0D0D] p-6 sm:p-10 shadow-xl">
      {/* Left Dominant Metric: Large Visual Score Representation (~58% width) */}
      <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#8C8C88]">
              SYNTHESIZED READINESS SIGNAL
            </span>
            <span className={`font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full border ${categoryColor}`}>
              {readinessCategory}
            </span>
          </div>

          <div className="flex items-baseline gap-4 my-2">
            <span className="font-display text-7xl sm:text-8xl font-bold tracking-tight text-[#F4F2EC]">
              {completedCount > 0 ? averageScore : '—'}
            </span>
            <span className="font-mono text-sm text-[#8C8C88] uppercase tracking-wider">
              / 100 COMPOSITE
            </span>
          </div>

          <p className="font-body text-base text-[#8C8C88] leading-relaxed max-w-lg mt-3">
            {completedCount === 0
              ? 'No evaluations recorded yet. Launch your first mock interview to calibrate your score against senior engineering bars.'
              : averageScore >= 80
              ? 'Candidate demonstrates high architectural maturity, solid concurrency primitives, and minimal hesitation.'
              : 'Consistent fundamentals with identifiable blindspots in distributed systems trade-offs and edge-case handling.'}
          </p>
        </div>

        <div className="pt-6 mt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#8C8C88]">
          <span>Evaluated across {completedCount} rounds</span>
          <Link
            href="/dashboard/history"
            className="text-[#2447FF] hover:text-white transition-colors uppercase tracking-wider inline-flex items-center gap-1 font-semibold"
          >
            <span>Inspect signal history</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Right Telemetry Triad: Secondary Metrics Asymmetrically Positioned (~42% width) */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:pl-4">
        {/* Metric 1: Practice Runtime */}
        <div className="border-b border-white/[0.08] pb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[#8C8C88] tracking-wider">
              PRACTICE RUNTIME
            </span>
            <Clock className="w-4 h-4 text-[#8C8C88]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#F4F2EC] mt-1">
            {practiceHours} <span className="text-base text-[#8C8C88] font-normal">hours</span>
          </div>
          <span className="font-mono text-[11px] text-[#8C8C88]">
            Total deliberate simulation time
          </span>
        </div>

        {/* Metric 2: Completed Simulations */}
        <div className="border-b border-white/[0.08] pb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[#8C8C88] tracking-wider">
              SIMULATIONS
            </span>
            <Calendar className="w-4 h-4 text-[#8C8C88]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#F4F2EC] mt-1">
            {completedCount}{' '}
            <span className="text-base text-[#8C8C88] font-normal">of {totalInterviews} rounds</span>
          </div>
          <span className="font-mono text-[11px] text-[#8C8C88]">
            Full multi-vector audits completed
          </span>
        </div>

        {/* Metric 3: Active Blindspots */}
        <div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase text-[#8C8C88] tracking-wider">
              ACTIVE BLINDSPOTS
            </span>
            <Target className="w-4 h-4 text-[#8C8C88]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#F4F2EC] mt-1">
            {weaknessCount}{' '}
            <span className="text-base text-[#8C8C88] font-normal">topics</span>
          </div>
          <span className="font-mono text-[11px] text-[#8C8C88]">
            {weaknessCount === 0
              ? 'No critical gaps diagnosed'
              : 'Queued for automated remediation'}
          </span>
        </div>
      </div>
    </div>
  )
}
