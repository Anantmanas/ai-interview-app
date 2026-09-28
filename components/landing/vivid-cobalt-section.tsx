'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { Cpu, Zap, ShieldCheck, Terminal, ArrowUpRight } from 'lucide-react'

export function VividCobaltSection() {
  const pillars = [
    {
      num: '01',
      title: 'Algorithmic Rigor',
      detail: 'Real-time AST code parsing, edge-case generation, and Big-O computational bounds checking during live execution.',
      metric: 'Sub-15ms',
      metricLabel: 'Compilation AST verification',
    },
    {
      num: '02',
      title: 'Distributed System Depth',
      detail: 'Architectural interrogation covering partition tolerance, replication lags, write-ahead logs, and consensus quorum trade-offs.',
      metric: 'L5 — L7',
      metricLabel: 'Staff calibration levels',
    },
    {
      num: '03',
      title: 'Behavioral Quantification',
      detail: 'Deconstructs responses against the STAR framework, isolating leadership impact, conflict management, and trade-off maturity.',
      metric: '100%',
      metricLabel: 'Objective rubric scoring',
    },
  ]

  return (
    <section id="architecture" className="relative my-24 py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-[#1d4ed8] via-[#1e40af] to-[#0f172a] text-[#ffffff] border-y border-[#3b82f6]/40 shadow-[0_0_80px_rgba(37,99,235,0.3)]">
      {/* Background Architectural Grid & Light Beams */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 cyber-grid" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-white/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#60a5fa]/30 blur-[140px]" />
      </div>

      <div className="max-w-[1300px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/20 pb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-mono text-[11px] uppercase tracking-widest text-[#bfdbfe] mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              <span>THE ARCHITECTURE OF INTELLIGENCE</span>
            </div>
            <h2 className="font-display text-[40px] md:text-[58px] font-bold leading-[1.02] tracking-[-0.03em] text-white">
              An AI Laboratory For Top 1% Engineers
            </h2>
          </div>
          <p className="font-body text-[16px] md:text-[17px] text-[#dbeafe] max-w-md leading-relaxed">
            Crafted like a precision developer tool. No hollow SaaS fluff—only high-fidelity engineering interview simulation.
          </p>
        </div>

        {/* 3 High-Impact Monolithic Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.num}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl bg-[#0b1c44]/60 backdrop-blur-xl border border-white/15 hover:border-white/35 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[13px] text-[#93c5fd] mb-6">
                  <span className="font-bold tracking-wider">// SYSTEM {pillar.num}</span>
                  <div className="h-2 w-2 rounded-full bg-[#60a5fa]" />
                </div>
                <h3 className="font-display text-[24px] font-bold text-white mb-3 tracking-tight">
                  {pillar.title}
                </h3>
                <p className="font-body text-[14.5px] text-[#e0e7ff] leading-relaxed">
                  {pillar.detail}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/15">
                <span className="font-display text-[32px] font-bold text-white tracking-tight block">
                  {pillar.metric}
                </span>
                <span className="font-mono text-[11px] text-[#bfdbfe] uppercase tracking-wider block mt-0.5">
                  {pillar.metricLabel}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Editorial Footnote / Micro CTA bar */}
        <div className="p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-[#93c5fd]" />
            <span className="font-mono text-[13px] text-white tracking-wide">
              Ready to calibrate your engineering level against real production benchmarks?
            </span>
          </div>
          <Link
            href="/interview/new"
            className="inline-flex items-center gap-2 bg-white text-[#1e40af] hover:bg-[#eff6ff] font-mono text-[12px] font-bold uppercase tracking-[0.08em] px-6 py-2.5 rounded-lg shadow-lg transition-colors shrink-0"
          >
            Launch Free Session
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
