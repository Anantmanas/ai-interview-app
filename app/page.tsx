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
  'Frontend Engineer (React, Next.js, TS)',
  'Full Stack Developer (Node, PostgreSQL, APIs)',
  'Backend Engineer (System Design, DBs)',
  'Software Engineer (Algorithms, DSA)',
  'DevOps & Cloud Engineer (Docker, AWS)',
]

export default function LandingPage() {
  const currentRole = useTypewriter(typewriterRoles, 65, 2000, 'Frontend Engineer (React, Next.js, TS)')

  return (
    <main className="relative min-h-screen bg-[#050505] text-[#F4F2EC] overflow-x-hidden selection:bg-[#2447FF]/30 selection:text-white">
      {/* Scroll sentinel for resizable navbar */}
      <div id="scroll-sentinel" className="absolute top-20 h-px w-full pointer-events-none" aria-hidden="true" />

      <div className="relative z-10">
        {/* ── Resizable Editorial Navigation bar ── */}
        <ResizableNavbar />

        {/* ── HERO CHAPTER (BLACK / VOID) with LOCKED AntigravityBackground ── */}
        <AntigravityBackground
          className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-6 md:px-12 text-center relative overflow-hidden"
          ringSpacing={20}
          dotSpacing={14}
        >
          <div className="max-w-[1280px] mx-auto relative z-10">
            {/* 1. Clear Eyebrow: What it is */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-flex items-center gap-2.5 font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-[#E0DFD8] mb-4 border border-white/20 bg-white/[0.06] backdrop-blur-md px-4 py-1.5 rounded-full"
            >
              <span className="w-2 h-2 rounded-full bg-[#2447FF] shadow-[0_0_8px_#2447FF] animate-pulse" />
              <span>AI Technical Interviewer • Real-Time Voice & Code</span>
            </motion.div>

            {/* 2. Definitive Headline: What it is & Why it matters */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[60px] font-bold text-[#F4F2EC] max-w-4xl mx-auto mb-4 leading-[1.08] tracking-[-0.035em]"
            >
              Practice technical interviews with AI. Spot your blind spots before real interviewers do.
            </motion.h1>

            {/* 3. Subheadline: Who it is for & How it works */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
              className="font-body text-base sm:text-lg md:text-xl text-[#CBC8BF] leading-relaxed max-w-3xl mx-auto mb-4 font-normal"
            >
              Built for <span className="text-[#F4F2EC] font-semibold underline decoration-[#2447FF]/60 underline-offset-4">Frontend, Backend, Full-Stack, and System Design</span> engineers. Speak your reasoning out loud, write code live in your browser, and get instant scored feedback with a personalized study roadmap to close every gap.
            </motion.p>

            {/* 4. Live Practice Track Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5 }}
              className="max-w-xl mx-auto mb-5 p-2 rounded-lg bg-white/[0.04] border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-left font-mono text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shrink-0" />
                <span className="text-[#8C8C88] uppercase tracking-wider text-[10px]">CURRENT TRACK:</span>
                <span className="text-[#F4F2EC] font-semibold text-xs sm:text-sm">
                  {currentRole}
                  <span className="inline-block w-[2px] h-[13px] bg-[#2447FF] ml-1 animate-pulse align-middle" />
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[10px] text-[#A3A39E] uppercase tracking-wider">
                <span className="text-white/80">VOICE + CODE</span>
                <span className="text-white/20">•</span>
                <span>15-MIN MOCK</span>
              </div>
            </motion.div>

            {/* 5. Primary CTA: What to do next */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.35, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3"
            >
              <Link
                href="/auth/sign-up"
                className="w-full sm:w-auto bg-[#2447FF] hover:bg-[#1A3AE8] text-white font-mono text-xs uppercase tracking-[0.14em] font-bold px-8 py-3.5 rounded-md shadow-[0_0_35px_rgba(36,71,255,0.45)] transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-3 group"
              >
                <span>Start Free Mock Interview</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto border border-white/20 hover:border-white/50 text-[#F4F2EC] hover:bg-white/[0.06] font-mono text-xs uppercase tracking-[0.12em] px-6 py-3.5 rounded-md transition-all inline-flex items-center justify-center gap-2"
              >
                <span>See How It Works ↓</span>
              </Link>
            </motion.div>

            {/* Reassurance Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.42 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-[#8C8C88] font-mono mb-5"
            >
              <span className="flex items-center gap-1.5 text-[#CBC8BF]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                Free 15-min session
              </span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 text-[#CBC8BF]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                No credit card required
              </span>
              <span className="text-white/20 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 text-[#CBC8BF]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                Instant scorecard & roadmap
              </span>
            </motion.div>

            {/* 6. Above-the-fold 4-Step Process Strip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.48 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4 border-t border-white/[0.08] text-left font-mono"
            >
              <div className="bg-white/[0.02] border border-white/[0.07] rounded-md p-3 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-xs">01 ONBOARD</span>
                  <span className="text-[#2447FF] text-[10px]">1 MIN</span>
                </div>
                <p className="text-[11px] text-[#8C8C88] leading-tight">Upload resume or choose target role & seniority</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.07] rounded-md p-3 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-xs">02 INTERVIEW</span>
                  <span className="text-[#10B981] text-[10px]">LIVE</span>
                </div>
                <p className="text-[11px] text-[#8C8C88] leading-tight">Spoken AI dialogue & in-browser code editor</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.07] rounded-md p-3 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-xs">03 FIND GAPS</span>
                  <span className="text-[#2447FF] text-[10px]">SCORE</span>
                </div>
                <p className="text-[11px] text-[#8C8C88] leading-tight">Objective scoring on code, architecture & communication</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.07] rounded-md p-3 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-xs">04 ROADMAP</span>
                  <span className="text-[#10B981] text-[10px]">FIX</span>
                </div>
                <p className="text-[11px] text-[#8C8C88] leading-tight">Targeted study roadmap & curated videos before real day</p>
              </div>
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
                  MOCK INTERVIEWS
                </span>
              </div>
              <p className="font-mono text-xs text-[#8C8C88] max-w-md">
                Practice realistic technical mock interviews, identify your exact knowledge gaps, and follow a personalized roadmap to land your dream job.
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
                Dashboard →
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
