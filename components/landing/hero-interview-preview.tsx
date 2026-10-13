'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react'
import {
  AlertTriangle,
  CheckCircle2,
  Terminal,
} from 'lucide-react'

export interface TrackData {
  id: string
  role: string
  level: string
  questionNum: string
  topic: string
  question: string
  candidateAnswer: string
  overallScore: number
  metrics: {
    name: string
    score: number
  }[]
  weaknessTitle: string
  weaknessDetail: string
  roadmapAction: string
}

const TRACKS: TrackData[] = [
  {
    id: 'frontend',
    role: 'Frontend Engineer',
    level: 'Senior • L5',
    questionNum: '02 / 05',
    topic: 'React 19 & Performance Profiling',
    question:
      'What are the most common React performance bottlenecks, and how do you prevent cascading re-renders in complex dashboards?',
    candidateAnswer:
      '"Passing unstable object literals across Context, missing memoization on deep callback trees, and cascading state in ancestor components. In production, we profile with the React DevTools flamegraph and monitor INP..."',
    overallScore: 82,
    metrics: [
      { name: 'Technical Depth', score: 86 },
      { name: 'Architecture & State', score: 80 },
      { name: 'Edge Case Handling', score: 78 },
    ],
    weaknessTitle: 'Unstable Context Object References',
    weaknessDetail: 'Passing un-memoized object literals triggers avoidable child renders.',
    roadmapAction: 'Added to Roadmap: Split State & Dispatch Contexts module',
  },
  {
    id: 'backend',
    role: 'Backend Engineer',
    level: 'Staff • L6',
    questionNum: '03 / 05',
    topic: 'Distributed Systems & Idempotency',
    question:
      'How would you design an idempotent payment processing endpoint to guarantee exactly-once processing under network retries?',
    candidateAnswer:
      '"We require a client-generated UUID idempotency key, acquire a short distributed lock in Redis, verify transaction state in PostgreSQL, and record processed keys in a dedicated deduplication table..."',
    overallScore: 86,
    metrics: [
      { name: 'Technical Depth', score: 90 },
      { name: 'Concurrency & Locks', score: 84 },
      { name: 'Edge Case Handling', score: 85 },
    ],
    weaknessTitle: 'Downstream HTTP 504 Timeout Retries',
    weaknessDetail: 'Missing jittered exponential backoff for third-party payment gateway timeouts.',
    roadmapAction: 'Added to Roadmap: Distributed Lock & Jitter Retries module',
  },
  {
    id: 'system-design',
    role: 'System Design',
    level: 'Senior • L5',
    questionNum: '01 / 04',
    topic: 'High-Throughput Caching Strategy',
    question:
      'How do you handle cache stampede (thundering herd) when high-traffic Redis keys expire simultaneously during flash sales?',
    candidateAnswer:
      '"We implement probabilistic early expiration (XFetch algorithm), mutual exclusion locks via Redis SETNX for single worker cache recomputation, and serve stale data during background re-population..."',
    overallScore: 84,
    metrics: [
      { name: 'Technical Depth', score: 88 },
      { name: 'Failure Modes', score: 82 },
      { name: 'Trade-off Articulation', score: 83 },
    ],
    weaknessTitle: 'Lock Contention under Extreme Traffic',
    weaknessDetail: 'Mutex acquisition timeout threshold needs dynamic backoff to prevent redis queue backlog.',
    roadmapAction: 'Added to Roadmap: Redis Cache Stampede Mitigation module',
  },
]

interface HeroInterviewPreviewProps {
  activeTrackId?: string
  onTrackChange?: (trackId: string) => void
}

export function HeroInterviewPreview({
  activeTrackId: controlledTrackId,
  onTrackChange,
}: HeroInterviewPreviewProps) {
  const [internalTrackId, setInternalTrackId] = useState<string>('frontend')
  const currentTrackId = controlledTrackId ?? internalTrackId

  const activeTrack = TRACKS.find((t) => t.id === currentTrackId) || TRACKS[0]

  const handleSelectTrack = (id: string) => {
    setInternalTrackId(id)
    onTrackChange?.(id)
  }

  // 3D Pointer Tilt Effect (Subtle & Restrained)
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 180 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top

    mouseX.set(clientX / width - 0.5)
    mouseY.set(clientY / height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div className="w-full relative [perspective:1200px]">
      {/* Track Selector Tabs: Hairline Border Segment Buttons */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 mr-2 hidden sm:inline">
          LIVE DEMO:
        </span>
        {TRACKS.map((track) => {
          const isActive = track.id === currentTrackId
          return (
            <button
              key={track.id}
              data-active={isActive}
              onClick={() => handleSelectTrack(track.id)}
              className="border border-white/[0.1] px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider rounded-full text-zinc-400 hover:text-white data-[active=true]:bg-[#8052ff] data-[active=true]:text-white data-[active=true]:border-[#8052ff] transition-all cursor-pointer whitespace-nowrap shadow-none data-[active=true]:shadow-[0_0_16px_rgba(128,82,255,0.4)]"
            >
              {track.role}
            </button>
          )
        })}
      </div>

      {/* Main Interactive Product Proof Cockpit: Sculptural Rounded Chassis */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative rounded-3xl border border-white/[0.08] bg-black/50 backdrop-blur-2xl overflow-hidden transition-all duration-300 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)]"
      >
        {/* Top Window Chrome */}
        <div className="flex items-center justify-between px-5 py-3 bg-black/40 border-b border-white/[0.08] text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
            <span className="text-zinc-500 ml-1">session_mock_live.tsx</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-white/[0.04] border border-white/[0.1] text-zinc-300 text-[10px] font-mono tracking-wider uppercase font-medium">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
              <span>LIVE MOCK REHEARSAL</span>
            </span>
          </div>
        </div>

        {/* Dynamic Track Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTrack.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="p-5 sm:p-6 flex flex-col gap-4 text-left"
          >
            {/* Header: Role Calibration & Progress */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium tracking-wider uppercase text-[11px]">
                  {activeTrack.role}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-zinc-400 text-[10px] uppercase tracking-wider">{activeTrack.level}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-[10px] uppercase tracking-wider">
                <span className="text-zinc-300 font-medium">QUESTION {activeTrack.questionNum}</span>
              </div>
            </div>

            {/* Step 1 & 2: The Question */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 font-medium flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-zinc-400" />
                  AI INTERVIEWER QUESTION
                </span>
                <span className="text-[9px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {activeTrack.topic}
                </span>
              </div>
              <p className="font-sans text-[13px] sm:text-sm text-white font-normal leading-relaxed">
                {activeTrack.question}
              </p>
            </div>

            {/* Step 3: Candidate Audio / Transcribed Answer Stream */}
            <div className="bg-black/40 border border-white/[0.08] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-white/60 rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-white/80 rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-1 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:300ms]" />
                    <span className="w-1 h-5 bg-white rounded-full animate-pulse [animation-delay:75ms]" />
                    <span className="w-1 h-3 bg-white/70 rounded-full animate-pulse [animation-delay:200ms]" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-300 font-medium">
                    CANDIDATE ANSWER TRANSCRIBED
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ANALYZING REASONING
                </span>
              </div>
              <p className="font-mono text-[11px] text-zinc-400 leading-relaxed italic line-clamp-2">
                {activeTrack.candidateAnswer}
              </p>
            </div>

            {/* Step 4: Real-Time Score Telemetry & Breakdown */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-normal text-white">
                    {activeTrack.overallScore}
                  </span>
                  <span className="font-mono text-xs text-zinc-500">/ 100</span>
                  <span className="ml-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PASSING BAR
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                  INSTANT SCORECARD
                </span>
              </div>

              {/* 3 Metric Meters: Clean bone/white progress bar fill with subtle monochrome tones */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2 border-t border-white/[0.08]">
                {activeTrack.metrics.map((metric, i) => (
                  <div key={metric.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-mono text-[9px]">
                      <span className="text-zinc-400 truncate uppercase tracking-wider">{metric.name}</span>
                      <span className="text-white font-medium">{metric.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.score}%` }}
                        transition={{ duration: 0.6, delay: 0.1 * i }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 5: Identified Weakness & Roadmap Action — Clean Terminal Alert Box */}
            <div className="flex items-start gap-3 p-4 border border-white/[0.08] bg-white/[0.02] rounded-2xl font-mono text-xs text-left">
              <AlertTriangle className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-white font-medium">
                    WEAK SPOT: {activeTrack.weaknessTitle}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400 border border-white/[0.1] bg-white/[0.03] px-2 py-0.5 rounded-none uppercase tracking-wider shrink-0">
                    FIX IDENTIFIED
                  </span>
                </div>
                <p className="font-mono text-xs text-zinc-400 mt-1 leading-relaxed">
                  {activeTrack.weaknessDetail}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-mono text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{activeTrack.roadmapAction}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Workflow Step Bar (Proves the 4-step loop) */}
        <div className="grid grid-cols-4 border-t border-white/[0.08] bg-black/60 text-center font-mono text-[10px] uppercase tracking-wider divide-x divide-white/[0.08]">
          <div className="py-2.5 px-1 text-zinc-400 bg-white/[0.02]">
            <span className="text-white font-medium mr-1">01</span> RESUME/ROLE
          </div>
          <div className="py-2.5 px-1 text-zinc-400 bg-white/[0.02]">
            <span className="text-white font-medium mr-1">02</span> AI QUESTION
          </div>
          <div className="py-2.5 px-1 text-zinc-400 bg-white/[0.02]">
            <span className="text-white font-medium mr-1">03</span> VOICE ANSWER
          </div>
          <div className="py-2.5 px-1 text-white bg-white/[0.06] font-medium">
            <span className="text-white mr-1">04</span> SCORE & GAPS
          </div>
        </div>
      </motion.div>
    </div>
  )
}
