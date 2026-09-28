'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, ChevronRight, Compass, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface PipelineStep {
  number: string
  title: string
  subtitle: string
  body: string
  takeaway: string
  tag: string
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    number: '01',
    title: 'Grounding',
    subtitle: 'Contextual calibration from actual engineering tenure',
    body: 'Upload your resume or specify target staff specialties. The model anchors its interrogation tree in your concrete distributed architecture, language familiarity, and past deliveries.',
    takeaway: 'No generic LeetCode trivia out of context.',
    tag: 'INPUT INGESTION',
  },
  {
    number: '02',
    title: 'Simulation',
    subtitle: 'Conversational interrogation with AST verification',
    body: 'Engage via ultra-low latency voice STT or inside the Monaco IDE. The AI behaves like a principal engineer: probing assumptions, challenging edge cases, and testing Big-O intuition.',
    takeaway: 'Sub-50ms conversational cadence.',
    tag: 'ACTIVE DIALOGUE',
  },
  {
    number: '03',
    title: 'Audit',
    subtitle: 'Dual-layer actionable telemetry',
    body: 'Instant evaluation delivers both Caveman feedback (brutally concise takeaways: what worked, what broke, exact fix) and deep multi-vector radar telemetry across system trade-offs.',
    takeaway: 'Zero polite fluff. Exact delta.',
    tag: 'DIAGNOSTIC MATRIX',
  },
  {
    number: '04',
    title: 'Remediation',
    subtitle: 'Curated curriculum with targeted re-tests',
    body: 'Diagnosed blindspots are automatically mapped into YouTube masterclasses, engineering documentation, and focused single-topic practice sessions to close the gap before real interviews.',
    takeaway: 'Direct path to senior mastery.',
    tag: 'CONTINUOUS LOOP',
  },
]

export function Chapter04Paper() {
  const [activeStep, setActiveStep] = useState<number>(0)

  return (
    <section className="section-paper py-32 sm:py-44 px-6 md:px-12 lg:px-20 border-t border-[#0A0A0A]/10 relative overflow-hidden select-text">
      {/* Chapter Marker Header */}
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-24 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-[#0A0A0A]/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#0A0A0A]">
            04 / THE CONTINUOUS PIPELINE
          </span>
          <span className="text-[#5C5953]">•</span>
          <span className="font-mono text-xs text-[#5C5953] tracking-wide uppercase">
            EDITORIAL WORKFLOW
          </span>
        </div>
        <div className="font-mono text-xs text-[#5C5953] uppercase tracking-wider">
          NOT ISOLATED PRACTICE ROUNDS — A CLOSED LEARNING SYSTEM
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Giant Editorial Heading */}
        <div className="mb-20 md:mb-28 max-w-5xl">
          <h2 className="display-giant text-[#0A0A0A] font-bold">
            A closed-loop engineering curriculum.
          </h2>
          <p className="font-body text-xl md:text-2xl lg:text-3xl text-[#5C5953] mt-8 leading-[1.35] max-w-3xl font-light">
            Every answer you submit recalibrates your mastery roadmap. Weaknesses become targeted practice units, transforming subjective anxiety into verifiable competence.
          </p>
        </div>

        {/* Asymmetric Editorial Columns (Non-Card Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 border-t border-[#0A0A0A]/10 pt-12">
          {PIPELINE_STEPS.map((step, idx) => {
            const isHovered = activeStep === idx
            return (
              <div
                key={step.number}
                onMouseEnter={() => setActiveStep(idx)}
                className={`flex flex-col justify-between transition-all duration-300 ${
                  idx % 2 === 1 ? 'lg:translate-y-8' : ''
                }`}
              >
                <div>
                  <div className="flex items-baseline justify-between border-b border-[#0A0A0A]/10 pb-4 mb-6">
                    <span className="font-mono text-3xl font-bold text-[#0A0A0A]">
                      {step.number}
                    </span>
                    <span className="font-mono text-[10px] uppercase text-[#5C5953] tracking-widest">
                      {step.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-[#0A0A0A] mb-2">
                    {step.title}
                  </h3>

                  <p className="font-mono text-xs text-[#2447FF] uppercase tracking-wider mb-5">
                    {step.subtitle}
                  </p>

                  <p className="font-body text-base text-[#5C5953] leading-relaxed mb-6 font-normal">
                    {step.body}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#0A0A0A]/10 mt-6">
                  <span className="font-mono text-xs text-[#0A0A0A] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2447FF]" />
                    {step.takeaway}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Editorial Callout */}
        <div className="mt-24 md:mt-32 pt-12 border-t border-[#0A0A0A]/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#5C5953] block mb-2">
              AUTOMATIC SYNCHRONIZATION
            </span>
            <p className="font-display text-xl text-[#0A0A0A] font-semibold">
              Ready to experience an intelligent rehearsal calibrated to top tech bars?
            </p>
          </div>

          <Link
            href="/auth/sign-up"
            className="btn-paper-primary inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] px-8 py-4 rounded-xl shadow-lg shrink-0 self-start md:self-auto"
          >
            <span>Begin Guided Setup</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
