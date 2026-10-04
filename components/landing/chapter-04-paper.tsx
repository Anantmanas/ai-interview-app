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
    title: 'Smart Onboarding',
    subtitle: 'Upload your resume or pick your target role',
    body: 'Takes just 30 seconds. The AI reads your tech stack, past projects, and experience level so every mock interview matches what companies actually ask you.',
    takeaway: 'Tailored to your real tools.',
    tag: 'STEP 1: ONBOARD',
  },
  {
    number: '02',
    title: 'AI Mock Interview',
    subtitle: 'Practice speaking and coding in real time',
    body: 'Talk through your microphone and write real code in our built-in editor. The AI asks smart questions, gives hints when you get stuck, and behaves like a real interviewer.',
    takeaway: 'Realistic, low-stress practice.',
    tag: 'STEP 2: PRACTICE',
  },
  {
    number: '03',
    title: 'Find Knowledge Gaps',
    subtitle: 'Instant scores and brutally honest feedback',
    body: 'Within seconds, see what you answered well, what you missed, and an overall score out of 100 across coding, system design, and communication.',
    takeaway: 'Never wonder why you got rejected.',
    tag: 'STEP 3: FEEDBACK',
  },
  {
    number: '04',
    title: 'Personalized Roadmap',
    subtitle: 'Custom study plan to ace your upcoming interview',
    body: 'Your weak spots automatically turn into a personalized study plan with curated video masterclasses, cheat sheets, and targeted follow-up re-tests.',
    takeaway: 'Walk into your interview confident.',
    tag: 'STEP 4: ROADMAP',
  },
]

export function Chapter04Paper() {
  const [activeStep, setActiveStep] = useState<number>(0)

  return (
    <section className="section-paper py-28 sm:py-36 px-6 md:px-12 lg:px-20 border-t border-[#0A0A0A]/10 relative overflow-hidden select-text">
      {/* Chapter Marker Header */}
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-20 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-[#0A0A0A]/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#0A0A0A]">
            04 / HOW IT WORKS
          </span>
          <span className="text-[#5C5953]">•</span>
          <span className="font-mono text-xs text-[#5C5953] tracking-wide uppercase">
            FROM ONBOARDING TO OFFER
          </span>
        </div>
        <div className="font-mono text-xs text-[#5C5953] uppercase tracking-wider">
          A PROVEN 4-STEP SYSTEM TO ACE TECHNICAL INTERVIEWS
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Editorial Heading */}
        <div className="mb-16 md:mb-24 max-w-4xl">
          <h2 className="display-giant text-[#0A0A0A] font-bold">
            From your first mock to your dream offer.
          </h2>
          <p className="font-body text-xl md:text-2xl text-[#5C5953] mt-6 leading-relaxed font-normal">
            You never have to guess what to study next. After every interview session, InterviewAI automatically creates a step-by-step roadmap with targeted videos and practice problems to close your knowledge gaps fast.
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
            className="bg-[#0A0A0A] hover:bg-[#2447FF] text-[#F4F2EC] inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] font-bold px-8 py-4 rounded-md shadow-md transition-all shrink-0 self-start md:self-auto group"
          >
            <span>Begin Guided Setup</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
