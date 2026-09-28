'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Terminal, Mic, Cpu, Activity, CheckCircle, Code2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Stage {
  num: string
  title: string
  label: string
  evaluationFocus: string
  metrics: { label: string; value: string }[]
  previewCode: string
}

const STAGES: Stage[] = [
  {
    num: '01',
    title: 'Adaptive Interrogation Synthesis',
    label: 'GENERATION',
    evaluationFocus: 'The AI constructs high-variance scenarios targeting edge-case handling rather than textbook boilerplate.',
    metrics: [
      { label: 'Prompt Latency', value: '42ms' },
      { label: 'Grounding Weight', value: '0.94' },
      { label: 'Variance Entropy', value: 'High' },
    ],
    previewCode: `// Calibrating dynamic scenario for candidate
const scenario = engine.synthesize({
  targetLevel: "L6 / Staff",
  domain: "Distributed Transactions",
  failureMode: "Asymmetric Partitioning",
  requireASTVerification: true
});`,
  },
  {
    num: '02',
    title: 'Sub-50ms Speech STT & Monaco AST Ingestion',
    label: 'STREAMING BUFFER',
    evaluationFocus: 'Spoken cadence, pause analysis, and real-time syntax tree generation as the engineer articulates the solution.',
    metrics: [
      { label: 'Audio Ingestion', value: '48kHz / PCM' },
      { label: 'AST Token Count', value: '184 tokens' },
      { label: 'Hesitation Marker', value: '0.12s' },
    ],
    previewCode: `// Streaming AST Tokenizer
function parseAST(stream: CandidateStream) {
  const ast = typescript.createSourceFile(stream.code);
  const complexity = computeCyclomaticBounds(ast);
  return { timeComplexity: 'O(N log N)', spaceBounds: 'O(1)' };
}`,
  },
  {
    num: '03',
    title: 'Multi-Vector Latency & Complexity Audit',
    label: 'DEEP DIAGNOSIS',
    evaluationFocus: 'Algorithmic correctness, memory leaks, concurrency locks, and trade-off justification evaluated simultaneously.',
    metrics: [
      { label: 'Correctness', value: '98%' },
      { label: 'Space Optimality', value: 'O(1)' },
      { label: 'Trade-off Depth', value: 'Exceptional' },
    ],
    previewCode: `// Multi-Vector Diagnostic Vector
const vector = evaluateResponse({
  algorithmicCorrectness: 0.98,
  systemScalability: 0.88,
  communicationClarity: 0.92,
  cavemanFix: "Solid concurrency. Minor lock contention on writes."
});`,
  },
  {
    num: '04',
    title: 'Precision Remediation & Bar-Raiser Delta',
    label: 'REMEDIATION',
    evaluationFocus: 'Instantaneous synthesis of actionable feedback and automated ingestion into the mastery roadmap.',
    metrics: [
      { label: 'Signal Score', value: '84 / 100' },
      { label: 'Weakness Tag', value: 'Write Contention' },
      { label: 'Roadmap Status', value: 'Module Queued' },
    ],
    previewCode: `// Ingest into adaptive curriculum
curriculum.queueRemediation({
  topic: "High-Contention Mutex Primitives",
  recommendedVideo: "Distributed Mutex Optimization (LMAX)",
  practiceProblemId: "dist-lock-094"
});`,
  },
]

export function Chapter02Void() {
  const [selectedStageIndex, setSelectedStageIndex] = useState(1)
  const activeStage = STAGES[selectedStageIndex]

  return (
    <section className="section-void py-32 sm:py-44 px-6 md:px-12 lg:px-20 border-t border-white/[0.1] relative overflow-hidden select-text">
      {/* Chapter Marker Header */}
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-24 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-white/[0.1] pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#F4F2EC]">
            02 / SIMULATION INSTRUMENT
          </span>
          <span className="text-[#8C8C88]">•</span>
          <span className="font-mono text-xs text-[#8C8C88] tracking-wide uppercase">
            REAL-TIME EVALUATION
          </span>
        </div>
        <div className="font-mono text-xs text-[#8C8C88] uppercase tracking-wider">
          CONTINUOUS AUDIT THROUGH EVERY INTERACTION STAGE
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Giant Editorial Heading */}
        <div className="mb-20 md:mb-28 max-w-5xl">
          <h2 className="display-giant text-[#F4F2EC] font-bold">
            The simulation is an instrument.
          </h2>
          <p className="font-body text-xl md:text-2xl lg:text-3xl text-[#8C8C88] mt-8 leading-[1.35] max-w-3xl font-light">
            InterviewAI doesn't just listen to your answers. It parses your code AST in Monaco, analyzes spoken latency, and evaluates multi-dimensional trade-offs in sub-second cycles.
          </p>
        </div>

        {/* Stage Timeline Navigation (Horizontal Asymmetric Control) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 border-b border-white/[0.1] pb-8">
          {STAGES.map((stage, idx) => {
            const isSelected = idx === selectedStageIndex
            return (
              <button
                key={stage.num}
                onClick={() => setSelectedStageIndex(idx)}
                className={`text-left p-4 sm:p-6 transition-all duration-200 border-l-2 cursor-pointer ${
                  isSelected
                    ? 'border-[#2447FF] bg-white/[0.04]'
                    : 'border-white/[0.1] hover:border-white/[0.3] bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-[#8C8C88]">STAGE {stage.num}</span>
                  <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded ${
                    isSelected ? 'bg-[#2447FF] text-white' : 'text-[#8C8C88]'
                  }`}>
                    {stage.label}
                  </span>
                </div>
                <h4 className={`font-display text-base sm:text-lg font-semibold transition-colors ${
                  isSelected ? 'text-[#F4F2EC]' : 'text-[#8C8C88]'
                }`}>
                  {stage.title}
                </h4>
              </button>
            )
          })}
        </div>

        {/* Live Stage Inspection Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: What the AI Evaluates */}
          <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-10 rounded-2xl border border-white/[0.1] bg-[#0D0D0D]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#8C8C88]">
                  STAGE {activeStage.num} EVALUATION FOCUS
                </span>
              </div>
              <h3 className="display-statement text-[#F4F2EC] font-bold mb-6">
                {activeStage.title}
              </h3>
              <p className="font-body text-base sm:text-lg text-[#8C8C88] leading-relaxed mb-8">
                {activeStage.evaluationFocus}
              </p>
            </div>

            <div className="border-t border-white/[0.1] pt-6 grid grid-cols-3 gap-4">
              {activeStage.metrics.map((m, i) => (
                <div key={i}>
                  <span className="font-mono text-[10px] text-[#8C8C88] uppercase block">
                    {m.label}
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-[#F4F2EC] mt-1 block">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Code & AST Stream Simulator */}
          <div className="lg:col-span-7 rounded-2xl border border-white/[0.1] bg-[#0A0A0A] p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div className="flex items-center gap-3">
                <Code2 className="w-4 h-4 text-[#2447FF]" />
                <span className="font-mono text-xs text-[#8C8C88] uppercase">
                  SIMULATION TELEMETRY STREAM
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#2447FF]">
                LIVE MONACO RUNTIME
              </span>
            </div>

            <pre className="font-mono text-xs sm:text-sm text-[#F4F2EC]/90 leading-relaxed overflow-x-auto p-4 rounded-xl bg-[#050505] border border-white/[0.06] mb-6">
              <code>{activeStage.previewCode}</code>
            </pre>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs font-mono text-[#8C8C88]">
              <span>Latency target: &lt; 50ms</span>
              <Link
                href="/interview/new"
                className="text-[#F4F2EC] hover:text-[#2447FF] transition-colors inline-flex items-center gap-1 font-semibold"
              >
                <span>Initiate live mock session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
