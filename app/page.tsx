'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import ResizableNavbar from '@/components/resizable-navbar'
import AntigravityBackground from '@/components/lightswind-pro/antigravity-background'
import { Chapter01Paper } from '@/components/landing/chapter-01-paper'
import { Chapter02Void } from '@/components/landing/chapter-02-void'
import { Chapter03Blue } from '@/components/landing/chapter-03-blue'
import { Chapter04Paper } from '@/components/landing/chapter-04-paper'
import { Chapter05Void } from '@/components/landing/chapter-05-void'
import { Chapter06Blue } from '@/components/landing/chapter-06-blue'

/* ── Typewriter hook for rotating target domain ──────────────── */

function useTypewriter(words: string[], speed = 70, pause = 2200, initialValue = '') {
  const [displayed, setDisplayed] = useState(initialValue || (words[0] ?? ''))
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(initialValue ? words[0]?.length ?? 0 : 0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((i) => i + 1), speed)
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((i) => i - 1), speed / 2)
    } else if (deleting && charIndex === 0) {
      setDeleting(false)
      setWordIndex((i) => (i + 1) % words.length)
    }

    setDisplayed(current.slice(0, charIndex))
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, wordIndex, words, speed, pause])

  return displayed
}

const typewriterRoles = [
  'Distributed Systems & Raft Consensus',
  'Monaco Code AST & Algorithmic Bounds',
  'Staff Engineering Trade-offs & STAR',
  'High-Throughput Low-Latency Pipelines',
  'FAANG Bar-Raiser Calibration',
]

export default function LandingPage() {
  const currentRole = useTypewriter(typewriterRoles, 65, 2000, 'Distributed Systems & Raft Consensus')

  return (
    <main className="relative min-h-screen bg-[#050505] text-[#F4F2EC] overflow-x-hidden selection:bg-[#2447FF]/30 selection:text-white">
      {/* Scroll sentinel for resizable navbar */}
      <div id="scroll-sentinel" className="absolute top-20 h-px w-full pointer-events-none" aria-hidden="true" />

      <div className="relative z-10">
        {/* ── Resizable Editorial Navigation bar ── */}
        <ResizableNavbar />

        {/* ── HERO CHAPTER (BLACK / VOID) with LOCKED AntigravityBackground ── */}
        <AntigravityBackground
          className="pt-40 sm:pt-48 pb-32 sm:pb-40 px-6 md:px-12 text-center relative overflow-hidden"
          ringSpacing={20}
          dotSpacing={14}
        >
          <div className="max-w-[1200px] mx-auto relative z-10">
            {/* Minimalist Exhibition Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-flex items-center gap-3 border border-white/10 bg-white/[0.04] backdrop-blur-md rounded-full px-4 py-1.5 mb-10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2447FF]" />
              <span className="font-mono text-[11px] text-[#F4F2EC] uppercase tracking-[0.16em] font-semibold">
                AN INTERACTIVE EXHIBITION IN TECHNICAL COMPETENCE
              </span>
            </motion.div>

            {/* Enormous Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
              className="display-giant text-[#F4F2EC] font-bold max-w-5xl mx-auto mb-8 leading-[0.92]"
            >
              The shape of technical competence.
            </motion.h1>

            {/* Active Calibration Target */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2.5 mb-8"
            >
              <span className="font-mono text-xs text-[#8C8C88] uppercase tracking-wider">
                CALIBRATING FOR:
              </span>
              <span className="font-mono text-xs sm:text-sm text-[#F4F2EC] font-semibold min-w-[280px] text-left">
                {currentRole}
                <span className="inline-block w-[2px] h-[14px] bg-[#2447FF] ml-1 animate-pulse align-middle" />
              </span>
            </motion.div>

            {/* Minimalist Supporting Statement */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
              className="font-body text-lg sm:text-xl md:text-2xl text-[#8C8C88] leading-[1.4] max-w-2xl mx-auto mb-12 font-light"
            >
              InterviewAI is an intelligent rehearsal instrument. Conversational voice interrogation, live Monaco code AST compilation, and multi-dimensional radar scoring.
            </motion.p>

            {/* Restrained Action Controls */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
              className="flex items-center justify-center gap-4 flex-wrap mb-16"
            >
              <Link
                href="/auth/sign-up"
                className="bg-[#2447FF] hover:bg-[#1A3AE8] text-white font-mono text-xs uppercase tracking-[0.1em] font-semibold px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2.5"
              >
                <span>Commence Simulation</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="btn-ghost-dark font-mono text-xs uppercase tracking-[0.1em] px-7 py-4 rounded-xl transition-all"
              >
                Inspect Chapters ↓
              </Link>
            </motion.div>

            {/* Minimalist Metadata Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap pt-4 border-t border-white/[0.08]"
            >
              <span className="font-mono text-xs text-[#8C8C88]">
                01 RESUME GROUNDING
              </span>
              <span className="text-white/20">•</span>
              <span className="font-mono text-xs text-[#8C8C88]">
                02 MONACO AST RUNTIME
              </span>
              <span className="text-white/20">•</span>
              <span className="font-mono text-xs text-[#8C8C88]">
                03 SUB-50MS VOICE STT
              </span>
            </motion.div>
          </div>
        </AntigravityBackground>

        {/* ── CHAPTER 01: WHITE / PAPER (#F4F2EC) ── */}
        <div id="features">
          <Chapter01Paper />
        </div>

        {/* ── CHAPTER 02: BLACK / VOID (#050505) ── */}
        <div id="architecture">
          <Chapter02Void />
        </div>

        {/* ── CHAPTER 03: ELECTRIC BLUE (#2447FF) — Major Visual Field ── */}
        <Chapter03Blue />

        {/* ── CHAPTER 04: WHITE / PAPER (#F4F2EC) ── */}
        <div id="how-it-works">
          <Chapter04Paper />
        </div>

        {/* ── CHAPTER 05: BLACK / VOID (#050505) ── */}
        <Chapter05Void />

        {/* ── CHAPTER 06: ELECTRIC BLUE (#2447FF) — Strong Final Statement ── */}
        <Chapter06Blue />

        {/* ── Editorial Footer (VOID #050505) ── */}
        <footer className="py-16 px-6 md:px-12 border-t border-white/10 bg-[#050505]">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-baseline justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
                <span className="font-display text-base font-bold text-[#F4F2EC]">
                  InterviewAI
                </span>
                <span className="font-mono text-[10px] text-[#8C8C88] border border-white/10 px-2 py-0.5 rounded">
                  v2.4 EXHIBITION
                </span>
              </div>
              <p className="font-mono text-xs text-[#8C8C88] max-w-md">
                An intelligent technical interview instrument. Contextual grounding, real-time code AST evaluation, and adaptive curriculum generation.
              </p>
            </div>

            <div className="flex items-center gap-8 font-mono text-xs text-[#8C8C88]">
              <Link href="/privacy" className="hover:text-[#F4F2EC] uppercase tracking-wider transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[#F4F2EC] uppercase tracking-wider transition-colors">
                Terms
              </Link>
              <Link href="/dashboard" className="text-[#2447FF] hover:underline uppercase tracking-wider">
                Console →
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
