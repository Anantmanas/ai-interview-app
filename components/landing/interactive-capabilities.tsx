'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  BrainCircuit,
  Mic,
  FileText,
  Target,
  TrendingUp,
  BarChart3,
  Sparkles,
  Map,
  Code2,
  Terminal,
  Activity,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react'

export interface CapabilityItem {
  id: string
  icon: any
  title: string
  tag: string
  shortDesc: string
  fullDesc: string
  metrics: { label: string; value: string }[]
  previewType: 'code' | 'waveform' | 'resume' | 'radar' | 'weakness' | 'roadmap' | 'memory' | 'adaptive'
}

const capabilities: CapabilityItem[] = [
  {
    id: 'ai-interviewer',
    icon: BrainCircuit,
    title: 'Adaptive AI Interviewer',
    tag: 'NEURAL CONVERSATION',
    shortDesc: 'Dynamic interview agent with context preservation and conversational calibration.',
    fullDesc: 'Simulates top-tier engineering interviewers from Google, Meta, and Stripe. Calibrates question depth based on response nuance.',
    metrics: [
      { label: 'Latency', value: '42ms' },
      { label: 'Context Horizon', value: '32k tokens' },
      { label: 'Persona Calibration', value: 'L3 — L7' },
    ],
    previewType: 'adaptive',
  },
  {
    id: 'voice-monaco',
    icon: Mic,
    title: 'Voice STT + Monaco IDE',
    tag: 'DUAL-MODAL PRACTICE',
    shortDesc: 'Speak solutions verbally or write algorithms with syntax checking and live run.',
    fullDesc: 'Seamlessly shift between natural voice communication and algorithmic code execution inside a full-fidelity Monaco IDE.',
    metrics: [
      { label: 'STT Accuracy', value: '99.2%' },
      { label: 'Languages', value: 'Python, TS, Java, Go' },
      { label: 'Compilation', value: 'Real-time AST' },
    ],
    previewType: 'code',
  },
  {
    id: 'resume-grounding',
    icon: FileText,
    title: 'Deep Resume Grounding',
    tag: 'HYPER-PERSONALIZED',
    shortDesc: 'Extracts real project architecture, tech stack, and impact metrics to drill deep.',
    fullDesc: 'No generic textbook questions. The system inspects your uploaded resume and questions decisions made in your actual past roles.',
    metrics: [
      { label: 'Parsing Engine', value: 'PDF / DOCX' },
      { label: 'Entity Extraction', value: 'Stack + Years + Roles' },
      { label: 'Tailored Match', value: '100% Custom' },
    ],
    previewType: 'resume',
  },
  {
    id: 'radar-scoring',
    icon: BarChart3,
    title: 'Multi-Vector Radar Scoring',
    tag: 'QUANTITATIVE EVAL',
    shortDesc: 'Instant scoring across Technical Accuracy, Communication, and Problem Solving.',
    fullDesc: 'Receive a diagnostic score across 5 essential competencies with objective reasoning and actionable sub-rubrics.',
    metrics: [
      { label: 'Evaluation Dimensions', value: '5 Axes' },
      { label: 'Rubric Grounding', value: 'FAANG Standards' },
      { label: 'Feedback Time', value: 'Sub-second' },
    ],
    previewType: 'radar',
  },
  {
    id: 'weakness-detection',
    icon: TrendingUp,
    title: 'Algorithmic Blindspot Detection',
    tag: 'DIAGNOSTIC ENGINE',
    shortDesc: 'Pinpoints specific concepts where you stumbled—from concurrency to time complexity.',
    fullDesc: 'Identifies recurring failure modes across your practice runs, classifying issues into critical, moderate, and mild gaps.',
    metrics: [
      { label: 'Diagnostic Depth', value: 'Micro-topic level' },
      { label: 'Severity Classification', value: '3 Tiers' },
      { label: 'Detection Accuracy', value: '96.8%' },
    ],
    previewType: 'weakness',
  },
  {
    id: 'dynamic-roadmap',
    icon: Map,
    title: 'Dynamic Mastery Roadmap',
    tag: 'CONTINUOUS LEARNING',
    shortDesc: 'Auto-generates a targeted curriculum with technical resources for diagnosed gaps.',
    fullDesc: 'Turns interview mistakes into a structured study syllabus with curated technical documentation, leetcode mappings, and design papers.',
    metrics: [
      { label: 'Curriculum Generation', value: 'Automated' },
      { label: 'Resource Integration', value: 'Official Docs & Papers' },
      { label: 'Track Progress', value: 'Syncs to Profile' },
    ],
    previewType: 'roadmap',
  },
]

export function InteractiveCapabilities() {
  const [activeId, setActiveId] = useState<string>(capabilities[0].id)
  const activeItem = capabilities.find((c) => c.id === activeId) || capabilities[0]

  return (
    <section id="features" className="px-6 py-28 max-w-[1300px] mx-auto relative z-10">
      {/* Section Header */}
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] led-pulse" />
          <span className="font-mono text-[11px] text-[#60a5fa] uppercase tracking-[0.2em] font-semibold">
            [ SYSTEM CAPABILITIES ]
          </span>
        </div>
        <h2 className="font-display text-[38px] md:text-[50px] font-bold text-[#f8fafc] leading-[1.08] tracking-[-0.03em]">
          Engineered for Engineering Excellence
        </h2>
        <p className="font-body text-[15px] md:text-[16px] text-[#94a3b8] mt-4 leading-relaxed">
          Hover or select any capability to inspect the underlying real-time telemetry and execution environment.
        </p>
      </div>

      {/* Interactive Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Interactive Capability Nodes (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {capabilities.map((item) => {
            const isSelected = item.id === activeId
            const Icon = item.icon
            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveId(item.id)}
                onClick={() => setActiveId(item.id)}
                className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#060b18] border-[#2563eb] shadow-[0_0_30px_rgba(37,99,235,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]'
                    : 'bg-[#030714] border-[#142347] hover:border-[#1e3a8a] hover:bg-[#060b18]/70'
                }`}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <motion.div
                    layoutId="active-indicator-bar"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#60a5fa] to-[#2563eb]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="flex items-start gap-3.5 pl-1">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isSelected
                        ? 'bg-[#0a1226] border-[#2563eb] text-[#60a5fa] shadow-[0_0_12px_rgba(37,99,235,0.3)]'
                        : 'bg-[#060b18] border-[#142347] text-[#64748b] group-hover:text-[#cbd5e1]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3
                        className={`font-display text-[15px] font-bold tracking-tight truncate transition-colors ${
                          isSelected ? 'text-[#f8fafc]' : 'text-[#cbd5e1] group-hover:text-[#f8fafc]'
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#0a1226] border border-[#142347] text-[#60a5fa] shrink-0">
                        {item.tag}
                      </span>
                    </div>
                    <p className="font-body text-[12.5px] text-[#94a3b8] leading-snug line-clamp-2">
                      {item.shortDesc}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Column: Live Contextual Simulation Cockpit (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#142347] bg-[#060b18] shadow-[0_12px_45px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Light in top right */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#2563eb]/10 blur-[100px] pointer-events-none" />

          {/* Top Inspector Status Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-[#142347] z-10">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#10b981] led-pulse" />
              <span className="font-mono text-[11px] text-[#cbd5e1] tracking-wider uppercase font-semibold">
                TELEMETRY INSPECTION // {activeItem.id.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#60a5fa] bg-[#0a1226] border border-[#1e3a8a] px-2.5 py-1 rounded">
                LIVE STATE: ACTIVE
              </span>
            </div>
          </div>

          {/* Dynamic Content View */}
          <div className="py-6 flex-1 flex flex-col justify-center z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <div className="inline-block font-mono text-[10px] text-[#38bdf8] uppercase tracking-widest mb-1.5 font-semibold">
                    // ARCHITECTURAL CAPABILITY
                  </div>
                  <h4 className="font-display text-[24px] sm:text-[28px] font-bold text-[#f8fafc] tracking-tight">
                    {activeItem.title}
                  </h4>
                  <p className="font-body text-[14px] sm:text-[15px] text-[#cbd5e1] mt-2 leading-relaxed max-w-xl">
                    {activeItem.fullDesc}
                  </p>
                </div>

                {/* Simulated Telemetry Visualization Box */}
                <div className="rounded-xl border border-[#142347] bg-[#02040a] p-5 shadow-inner">
                  {activeItem.previewType === 'code' && (
                    <div className="font-mono text-[12px] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#64748b] border-b border-[#142347] pb-2">
                        <span className="text-[#60a5fa]">editor.py — Python 3.12</span>
                        <span className="text-[#10b981]">AST Verified ✓</span>
                      </div>
                      <p className="text-[#38bdf8]"><span className="text-[#f43f5e]">def</span> <span className="text-[#60a5fa]">findOptimalPartition</span>(nodes: List[int], target: int):</p>
                      <p className="pl-4 text-[#cbd5e1]">heap = [(-w, i) <span className="text-[#f43f5e]">for</span> i, w <span className="text-[#f43f5e]">in</span> enumerate(nodes)]</p>
                      <p className="pl-4 text-[#cbd5e1]">heapq.heapify(heap)</p>
                      <p className="pl-4 text-[#94a3b8]">// AI analyzes Time: O(N log K), Space: O(N)</p>
                      <div className="mt-3 pt-2 border-t border-[#142347] flex items-center justify-between text-[11px]">
                        <span className="text-[#cbd5e1]">Execution: <span className="text-[#10b981] font-semibold">Passed (12/12 test cases)</span></span>
                        <span className="text-[#60a5fa]">Memory: 14.2 MB</span>
                      </div>
                    </div>
                  )}

                  {activeItem.previewType === 'adaptive' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#64748b]">
                        <span className="text-[#60a5fa]">INTERVIEWER AGENT: L6 STAFF ARCHITECT</span>
                        <span className="text-[#10b981]">ADAPTING IN REAL-TIME</span>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#060b18] border border-[#1e3a8a] text-[13px] text-[#f8fafc] font-sans">
                        "You chose a distributed hash ring for partitioning. How would you handle hot-spotting when a single celebrity partition receives 100x average traffic?"
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#2563eb] led-pulse" />
                        <span className="font-mono text-[11px] text-[#94a3b8]">Analyzing verbal candidate response depth...</span>
                      </div>
                    </div>
                  )}

                  {activeItem.previewType === 'resume' && (
                    <div className="space-y-3 font-mono text-[12px]">
                      <div className="text-[11px] text-[#60a5fa] border-b border-[#142347] pb-2 flex justify-between">
                        <span>RESUME ENTITY EXTRACTION ENGINE</span>
                        <span className="text-[#10b981]">98.7% MATCH</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-[#060b18] border border-[#142347]">
                          <span className="text-[#64748b] block">Target Role:</span>
                          <span className="text-[#f8fafc] font-bold">Staff Backend Engineer</span>
                        </div>
                        <div className="p-2 rounded bg-[#060b18] border border-[#142347]">
                          <span className="text-[#64748b] block">Detected Stack:</span>
                          <span className="text-[#60a5fa]">Go, Kafka, Kubernetes, Redis</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#94a3b8] italic">
                        Generating customized questions targeting distributed queue design & consensus.
                      </p>
                    </div>
                  )}

                  {activeItem.previewType === 'radar' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#60a5fa] border-b border-[#142347] pb-2">
                        <span>MULTI-DIMENSIONAL SCORECARD</span>
                        <span className="text-[#f8fafc] font-bold">OVERALL: 92/100</span>
                      </div>
                      <div className="space-y-2 font-mono text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-[#cbd5e1]">Technical Correctness</span>
                          <span className="text-[#10b981] font-semibold">95%</span>
                        </div>
                        <div className="w-full bg-[#0a1226] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#2563eb] h-full rounded-full" style={{ width: '95%' }} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#cbd5e1]">Architectural Scalability</span>
                          <span className="text-[#60a5fa] font-semibold">90%</span>
                        </div>
                        <div className="w-full bg-[#0a1226] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#38bdf8] h-full rounded-full" style={{ width: '90%' }} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#cbd5e1]">Communication & Structure</span>
                          <span className="text-[#818cf8] font-semibold">91%</span>
                        </div>
                        <div className="w-full bg-[#0a1226] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#818cf8] h-full rounded-full" style={{ width: '91%' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeItem.previewType === 'weakness' && (
                    <div className="space-y-3 font-mono text-[12px]">
                      <div className="flex justify-between text-[11px] text-[#f43f5e] border-b border-[#142347] pb-2">
                        <span>CRITICAL BLINDSPOT DETECTED</span>
                        <span>CONFIDENCE 94%</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#2a0e15]/50 border border-[#5c1d28] text-[12px]">
                        <p className="text-[#f87171] font-semibold">Distributed Consensus & Split-Brain Scenarios</p>
                        <p className="text-[#94a3b8] text-[11px] mt-1 font-sans">
                          Candidate skipped heartbeat quorum discussion during leader election under network partitions.
                        </p>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#60a5fa]">
                        <span>Remediation mapped to Raft & Paxos study modules.</span>
                      </div>
                    </div>
                  )}

                  {activeItem.previewType === 'roadmap' && (
                    <div className="space-y-3 font-mono text-[12px]">
                      <div className="flex justify-between text-[11px] text-[#10b981] border-b border-[#142347] pb-2">
                        <span>DYNAMIC STUDY PLAN // ACTIVE</span>
                        <span>MODULE 2 OF 5</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[#f8fafc] text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
                          <span className="line-through text-[#64748b]">LSM Trees vs B-Trees indexing deep dive</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#60a5fa] text-[11px] font-semibold">
                          <Zap className="h-3.5 w-3.5 text-[#2563eb]" />
                          <span>Distributed Locking with Redis (Redlock algorithm)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#94a3b8] text-[11px]">
                          <div className="h-3.5 w-3.5 rounded-full border border-[#142347]" />
                          <span>Consistent Hashing & Virtual Nodes practice mock</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantitative Metric Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {activeItem.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#0a1226]/80 border border-[#142347]">
                      <span className="font-mono text-[10px] text-[#64748b] uppercase tracking-wider block">
                        {m.label}
                      </span>
                      <span className="font-mono text-[14px] sm:text-[15px] font-bold text-[#f8fafc] mt-0.5 block">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
