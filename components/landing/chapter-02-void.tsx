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
    title: 'Warmup & Background',
    label: 'WARMUP',
    evaluationFocus: 'The AI starts by asking about your real projects, tools you love, and how you solve problems on your team.',
    metrics: [
      { label: 'Session Length', value: '3-5 min' },
      { label: 'Voice STT', value: 'Natural' },
      { label: 'Tone', value: 'Friendly' },
    ],
    previewCode: `// AI opens the interview
interviewer.ask({
  question: "Tell me about a challenging project on your resume and how you handled performance bottlenecks."
});`,
  },
  {
    num: '02',
    title: 'Live Coding Practice',
    label: 'CODING',
    evaluationFocus: 'Write code in our built-in Monaco editor while talking through your logic. The AI gives helpful hints if you get stuck.',
    metrics: [
      { label: 'Code Editor', value: 'Monaco (VS Code)' },
      { label: 'Languages', value: 'JS, TS, Python, Go' },
      { label: 'Tests', value: 'Built-in Run' },
    ],
    previewCode: `// Write clean, working code in the browser
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff)!, i];
    map.set(nums[i], i);
  }
  return [];
}`,
  },
  {
    num: '03',
    title: 'System Design & Trade-offs',
    label: 'ARCHITECTURE',
    evaluationFocus: 'The AI asks realistic follow-ups: How would you scale this to 100,000 users? How do you prevent database crashes?',
    metrics: [
      { label: 'Focus', value: 'Scalability' },
      { label: 'Topics', value: 'APIs & Caching' },
      { label: 'Question Type', value: 'Real World' },
    ],
    previewCode: `// AI tests your real-world architecture intuition
interviewer.followUp({
  question: "What happens if all 100k users request this at the same second? How does your cache behave?"
});`,
  },
  {
    num: '04',
    title: 'Instant Score & Knowledge Gaps',
    label: 'FEEDBACK',
    evaluationFocus: 'Within seconds of finishing, see your overall score, what you did right, and the exact gaps added to your roadmap.',
    metrics: [
      { label: 'Overall Score', value: '84 / 100' },
      { label: 'Breakdown', value: 'Code + Voice' },
      { label: 'Study Plan', value: 'Auto-Generated' },
    ],
    previewCode: `// Instant actionable feedback
const result = {
  score: 84,
  strengths: "Clean data structures and clear spoken explanations",
  knowledgeGap: "Forgot to discuss cache expiration under heavy load",
  roadmapStatus: "Targeted 15-min practice video added"
};`,
  },
]

export function Chapter02Void() {
  const [selectedStageIndex, setSelectedStageIndex] = useState(1)
  const activeStage = STAGES[selectedStageIndex]

  return (
    <section className="section-void py-28 sm:py-36 px-6 md:px-12 lg:px-20 border-t border-white/[0.1] relative overflow-hidden select-text">
      {/* Chapter Marker Header */}
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-20 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-white/[0.1] pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#F4F2EC]">
            02 / REAL-TIME PRACTICE
          </span>
          <span className="text-[#8C8C88]">•</span>
          <span className="font-mono text-xs text-[#8C8C88] tracking-wide uppercase">
            SPEAK & CODE WITH AI
          </span>
        </div>
        <div className="font-mono text-xs text-[#8C8C88] uppercase tracking-wider">
          PRACTICE REAL INTERVIEWS WITHOUT THE PRESSURE
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Editorial Heading */}
        <div className="mb-16 md:mb-24 max-w-4xl">
          <h2 className="display-giant text-[#F4F2EC] font-bold">
            Practice speaking and coding in real time.
          </h2>
          <p className="font-body text-xl md:text-2xl text-[#8C8C88] mt-6 leading-relaxed font-normal">
            Talk naturally using your voice and write real code in our built-in editor. The AI interviewer behaves like a friendly senior engineer — asking follow-ups, testing your edge cases, and giving you realistic practice.
          </p>
        </div>

        {/* Stage Timeline Navigation (Precision Hairline Selector) */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-white/[0.1] mb-12">
          {STAGES.map((stage, idx) => {
            const isSelected = idx === selectedStageIndex
            return (
              <button
                key={stage.num}
                onClick={() => setSelectedStageIndex(idx)}
                className={`text-left p-4 sm:p-6 transition-all duration-150 border-r border-white/[0.1] last:border-r-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.06] border-b-2 border-b-[#2447FF]'
                    : 'hover:bg-white/[0.02] bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] text-[#8C8C88] font-semibold">STAGE {stage.num}</span>
                  <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 tracking-wider ${
                    isSelected ? 'bg-[#2447FF] text-white' : 'text-[#8C8C88]'
                  }`}>
                    [{stage.label}]
                  </span>
                </div>
                <h4 className={`font-display text-sm sm:text-base font-bold transition-colors ${
                  isSelected ? 'text-[#F4F2EC]' : 'text-[#8C8C88]'
                }`}>
                  {stage.title}
                </h4>
              </button>
            )
          })}
        </div>

        {/* Dual-Channel Live Instrument Console (No bulbous cards) */}
        <div className="border border-white/[0.12] bg-[#08080C] grid grid-cols-1 lg:grid-cols-12">
          {/* Channel A: Diagnostic Evaluation Focus */}
          <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/[0.1]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 bg-[#2447FF]" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8C8C88]">
                  CHANNEL A // STAGE {activeStage.num} FOCUS
                </span>
              </div>
              <h3 className="display-statement text-[#F4F2EC] font-bold text-2xl sm:text-3xl mb-4">
                {activeStage.title}
              </h3>
              <p className="font-body text-base text-[#9E9B93] leading-relaxed mb-8">
                {activeStage.evaluationFocus}
              </p>
            </div>

            <div className="border-t border-white/[0.1] pt-6 grid grid-cols-3 gap-4">
              {activeStage.metrics.map((m, i) => (
                <div key={i} className="border-l border-white/[0.08] pl-3">
                  <span className="font-mono text-[10px] text-[#8C8C88] uppercase block">
                    {m.label}
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-[#F4F2EC] mt-0.5 block">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Channel B: Live Monaco AST Token Stream */}
          <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between bg-[#050508]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-2.5">
                  <Code2 className="w-4 h-4 text-[#2447FF]" />
                  <span className="font-mono text-xs text-[#8C8C88] uppercase tracking-wider">
                    CHANNEL B // MONACO AST RUNTIME
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#10b981]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span>SYNTAX TREE ACTIVE</span>
                </div>
              </div>

              <pre className="font-mono text-xs sm:text-sm text-[#F4F2EC] leading-relaxed overflow-x-auto p-5 bg-[#020204] border border-white/[0.08] mb-6">
                <code>{activeStage.previewCode}</code>
              </pre>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs font-mono text-[#8C8C88]">
              <span>CALIBRATION LATENCY: &lt;50MS</span>
              <Link
                href="/interview/new"
                className="text-[#F4F2EC] hover:text-[#2447FF] transition-colors inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[11px]"
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
