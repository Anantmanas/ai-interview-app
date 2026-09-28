'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  FileCheck2,
  TerminalSquare,
  BarChart2,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Cpu,
} from 'lucide-react'

interface WorkflowStep {
  step: string
  title: string
  subtitle: string
  description: string
  icon: any
  details: {
    title: string
    items: string[]
  }
  tag: string
  highlightMetric: string
}

const steps: WorkflowStep[] = [
  {
    step: '01',
    title: 'Resume Grounding',
    subtitle: 'Extracting Architectural DNA',
    description: 'Our extraction engine ingests your PDF resume, parsing languages, frameworks, system scales, and past accomplishments to eliminate generic questions.',
    icon: FileCheck2,
    details: {
      title: 'Grounding Pipeline Operations',
      items: [
        'ATS-grade PDF semantic tokenization',
        'Seniority & years of experience calibration (L3 to L7)',
        'Stack footprint mapping (e.g. Distributed Systems, Frontend Core)',
        'Synthesizes personalized inquiry vectors based on your real career',
      ],
    },
    tag: 'STAGE: INGESTION',
    highlightMetric: '100% Resume-Tailored Questions',
  },
  {
    step: '02',
    title: 'Live Cockpit Practice',
    subtitle: 'Adaptive Voice & Monaco Execution',
    description: 'Enter the distraction-free interview cockpit. Converse naturally via speech synthesis or solve complex data structures with Monaco IDE compilation.',
    icon: TerminalSquare,
    details: {
      title: 'Cockpit Runtime Engine',
      items: [
        'Speech-to-text with conversational turn management',
        'In-browser Monaco editor with multi-language AST syntax checking',
        'Adaptive difficulty calibration based on candidate reasoning speed',
        'Real-time anti-cheat and full focus telemetry environment',
      ],
    },
    tag: 'STAGE: EXECUTION',
    highlightMetric: 'Sub-50ms Speech Feedback',
  },
  {
    step: '03',
    title: 'Multi-Vector Evaluation',
    subtitle: 'Objective FAANG Rubric Scoring',
    description: 'Receive instant, non-judgmental analysis. The scoring engine evaluates technical correctness, code efficiency, edge-case coverage, and communication.',
    icon: BarChart2,
    details: {
      title: 'Diagnostic Rubric Vectors',
      items: [
        'Big-O time & space complexity verification against optimal solutions',
        'System trade-off assessment (CAP theorem, caching, partitioning)',
        'Behavioral STAR response clarity and impact quantification',
        'Actionable caveman feedback: direct, no fluff, immediately fixable',
      ],
    },
    tag: 'STAGE: DIAGNOSTICS',
    highlightMetric: '5-Axis Deep Rubric Matrix',
  },
  {
    step: '04',
    title: 'Mastery Roadmap',
    subtitle: 'Dynamic Gap Conquest Plan',
    description: 'Turn mistakes into structured mastery. The engine synthesizes identified weak spots into a step-by-step study schedule with curated engineering resources.',
    icon: Compass,
    details: {
      title: 'Targeted Curriculum Generation',
      items: [
        'Maps diagnosed algorithmic blindspots to specific challenge sets',
        'Links to official documentation, engineering whitepapers, and blogs',
        'Automated progress tracking that syncs with future interview sessions',
        'Targeted mock retry loops until identified weaknesses are conquered',
      ],
    },
    tag: 'STAGE: MASTERY',
    highlightMetric: 'Custom Step-by-Step Curriculum',
  },
]

export function ConnectedWorkflow() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const currentStep = steps[activeStepIndex]

  return (
    <section id="how-it-works" className="px-6 py-28 max-w-[1300px] mx-auto relative z-10 border-t border-[#142347]/60">
      {/* Section Header */}
      <div className="mb-20 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] led-pulse" />
          <span className="font-mono text-[11px] text-[#60a5fa] uppercase tracking-[0.2em] font-semibold">
            [ SYSTEM WORKFLOW ]
          </span>
        </div>
        <h2 className="font-display text-[38px] md:text-[50px] font-bold text-[#f8fafc] leading-[1.08] tracking-[-0.03em]">
          The Intelligent Interview Journey
        </h2>
        <p className="font-body text-[15px] md:text-[16px] text-[#94a3b8] mt-4 leading-relaxed">
          From cold resume to senior-level interview mastery through a continuous neural feedback loop.
        </p>
      </div>

      {/* Connected Sequential Pipeline Bar */}
      <div className="relative mb-12">
        {/* Continuous Connecting Electric Conduit Line */}
        <div className="hidden md:block absolute top-1/2 left-[5%] right-[5%] -translate-y-1/2 h-[2px] bg-[#142347] z-0">
          {/* Animated active energy beam */}
          <motion.div
            className="h-full bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#2563eb] shadow-[0_0_12px_rgba(37,99,235,0.8)]"
            animate={{
              width: `${((activeStepIndex) / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* 4 Interactive Node Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {steps.map((item, index) => {
            const isActive = index === activeStepIndex
            const isCompleted = index < activeStepIndex
            const Icon = item.icon

            return (
              <button
                key={item.step}
                onClick={() => setActiveStepIndex(index)}
                className={`p-5 rounded-xl border text-left transition-all duration-300 relative group cursor-pointer ${
                  isActive
                    ? 'bg-[#060b18] border-[#2563eb] shadow-[0_0_30px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : isCompleted
                    ? 'bg-[#040714] border-[#1e3a8a]/70 hover:border-[#2563eb]/60'
                    : 'bg-[#030714] border-[#142347] hover:border-[#1e3a8a]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`font-mono text-[22px] font-bold tracking-tight transition-colors ${
                      isActive ? 'text-[#60a5fa]' : isCompleted ? 'text-[#3b82f6]' : 'text-[#64748b]'
                    }`}
                  >
                    {item.step}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                      isActive
                        ? 'bg-[#0a1226] border-[#2563eb] text-[#60a5fa] shadow-[0_0_10px_rgba(37,99,235,0.3)]'
                        : 'bg-[#060b18] border-[#142347] text-[#64748b] group-hover:text-[#cbd5e1]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <h3
                  className={`font-display text-[16px] font-bold tracking-tight mb-1 transition-colors ${
                    isActive ? 'text-[#f8fafc]' : 'text-[#cbd5e1] group-hover:text-[#f8fafc]'
                  }`}
                >
                  {item.title}
                </h3>
                <p className="font-mono text-[11px] text-[#64748b] truncate">
                  {item.subtitle}
                </p>

                {/* Sub-status Indicator */}
                <div className="mt-4 pt-3 border-t border-[#142347] flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#94a3b8]">
                    {isActive ? 'CURRENT PHASE' : isCompleted ? 'VERIFIED ✓' : 'STANDBY'}
                  </span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] led-pulse" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Connected Detail Console for Active Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-[#142347] bg-[#060b18] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] text-[#60a5fa] uppercase tracking-widest bg-[#0a1226] border border-[#1e3a8a] px-3 py-1 rounded">
                <span>{currentStep.tag}</span>
                <span>•</span>
                <span>STEP {currentStep.step} OF 04</span>
              </div>

              <h3 className="font-display text-[28px] sm:text-[36px] font-bold text-[#f8fafc] leading-tight tracking-tight">
                {currentStep.title} — <span className="text-[#3b82f6]">{currentStep.subtitle}</span>
              </h3>

              <p className="font-body text-[15px] sm:text-[16px] text-[#cbd5e1] leading-relaxed max-w-2xl">
                {currentStep.description}
              </p>

              {/* Progress metric badge */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-[#02040a] border border-[#142347] text-[13px] font-mono text-[#60a5fa]">
                  <Sparkles className="h-4 w-4 text-[#3b82f6]" />
                  <span>Key Output: <strong className="text-[#f8fafc]">{currentStep.highlightMetric}</strong></span>
                </div>
              </div>
            </div>

            {/* Right Sub-system Telemetry Checklist (5 cols) */}
            <div className="lg:col-span-5 rounded-xl border border-[#142347] bg-[#02040a] p-6 shadow-inner space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#142347] font-mono text-[11px]">
                <span className="text-[#60a5fa] font-semibold">{currentStep.details.title}</span>
                <span className="text-[#10b981]">ONLINE</span>
              </div>

              <div className="space-y-3">
                {currentStep.details.items.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-[#2563eb] shrink-0 mt-0.5" />
                    <span className="font-body text-[13px] text-[#cbd5e1] leading-snug">
                      {detail}
                    </span>
                  </div>
                ))}
              </div>

              {/* Navigation buttons to step through */}
              <div className="pt-4 border-t border-[#142347] flex items-center justify-between">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="font-mono text-[11px] text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-30 disabled:pointer-events-none uppercase tracking-wider"
                >
                  ← PREVIOUS PHASE
                </button>
                <button
                  disabled={activeStepIndex === steps.length - 1}
                  onClick={() => setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#60a5fa] hover:text-[#f8fafc] disabled:opacity-30 disabled:pointer-events-none uppercase tracking-wider font-semibold"
                >
                  NEXT PHASE →
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
