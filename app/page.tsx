'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BrainCircuit,
  Mic,
  FileText,
  Target,
  TrendingUp,
  Map,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import { LandingBackground } from '@/components/ui/landing-background'
import ResizableNavbar from '@/components/resizable-navbar'
import { DottedGlowBackground } from '@/components/ui/dotted-glow-background'

/* ── Typewriter hook ─────────────────────────────────────────── */

function useTypewriter(words: string[], speed = 80, pause = 2000, initialValue = '') {
  const [displayed, setDisplayed] = useState(initialValue || (words[0] ?? ''))
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(initialValue ? words[0]?.length ?? 0 : 0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex(i => i + 1), speed)
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(i => i - 1), speed / 2)
    } else if (deleting && charIndex === 0) {
      setDeleting(false)
      setWordIndex(i => (i + 1) % words.length)
    }

    setDisplayed(current.slice(0, charIndex))
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, wordIndex, words, speed, pause])

  return displayed
}


/* ── Feature data ─────────────────────────────────────────────── */

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Interviewer',
    description: 'Practice with an AI that adapts to your skill level and provides realistic interview scenarios in real-time.',
  },
  {
    icon: Mic,
    title: 'Voice + Monaco Code',
    description: 'Speak naturally or write algorithms with real-time compilation and automated syntax analysis.',
  },
  {
    icon: FileText,
    title: 'Resume Grounding',
    description: 'Upload your resume to generate hyper-personalized questions tailored to your background and target role.',
  },
  {
    icon: Target,
    title: 'Adaptive Questions',
    description: 'Questions dynamically calibrate difficulty based on the depth and accuracy of your responses.',
  },
  {
    icon: TrendingUp,
    title: 'Weakness Detection',
    description: 'AI pinpoints knowledge gaps and architectural blindspots across your practice sessions.',
  },
  {
    icon: BarChart3,
    title: 'Radar AI Scoring',
    description: 'Receive multi-dimensional scores across Technical Accuracy, Communication, and Problem Solving.',
  },
  {
    icon: Sparkles,
    title: 'Session Memory',
    description: 'Your interviewer preserves context across conversational turns for authentic mock debriefs.',
  },
  {
    icon: Map,
    title: 'Dynamic Roadmap',
    description: 'Get an actionable study roadmap with curated technical resources to conquer identified weaknesses.',
  },
]

const trustBadges = [
  'Practice anytime, anywhere',
  'Real-time speech & code evaluation',
  'Unlimited mock interview sessions',
]

const typewriterRoles = [
  'System Design Rounds',
  'DSA & Coding Interviews',
  'Behavioral Questions',
  'React & Frontend Rounds',
  'FAANG Interview Prep',
]

/* ── Page ─────────────────────────────────────────────────────── */

export default function LandingPage() {
  const roles = useTypewriter(typewriterRoles, 80, 2000, 'DSA & Coding Interviews')

  return (
    <main className="relative min-h-screen bg-[#000000] overflow-x-hidden">
      {/* Scroll sentinel for IntersectionObserver-based navbar — zero scroll listener overhead */}
      <div id="scroll-sentinel" className="absolute top-20 h-px w-full pointer-events-none" aria-hidden="true" />
      <LandingBackground />

      <div className="relative z-10">
        {/* ── Resizable Navigation bar ── */}
        <ResizableNavbar />

        {/* ── Hero Section with DottedGlowBackground ── */}
        <DottedGlowBackground
          className="pt-36 pb-24 px-6 text-center"
          gap={22}
          radius={1.6}
          speedScale={1.1}
        >
          <div className="max-w-[860px] mx-auto">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 border border-[#1e1e2f] bg-[#09090e]/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8"
            >
              <span className="led-pulse h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
              <span className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.12em]">AI-Powered Technical Interview Simulator</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="font-display text-[48px] md:text-[68px] lg:text-[80px] font-bold leading-[1.04] tracking-[-0.03em] text-[#ffffff] mb-6 max-w-[860px] mx-auto"
            >
              Master Technical Interviews{' '}
              <span className="text-[#6366f1]">with AI-Powered Practice</span>
            </motion.h1>

            {/* Typewriter rotating roles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <span className="font-mono text-[13px] text-[#64748b]">Practicing:</span>
              <span className="font-mono text-[13px] text-[#818cf8] min-w-[220px] text-left">
                {roles}
                <span className="inline-block w-[2px] h-[14px] bg-[#6366f1] ml-0.5 animate-led-pulse align-middle" />
              </span>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="font-body text-[17px] md:text-[19px] text-[#9ca3af] leading-[1.7] max-w-[540px] mx-auto mb-10"
            >
              Experience ultra-realistic mock interviews that adapt in real-time to your skill level.
              Get instant scoring, deep weakness diagnosis, and a custom mastery roadmap.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
              className="flex items-center justify-center gap-3 flex-wrap mb-14"
            >
              <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }}>
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-2 bg-[#4f46e5] text-white font-medium text-[13px] tracking-[0.02em] px-7 py-3.5 rounded-md border border-[#6366f1]/40 hover:bg-[#5865f2] transition-colors duration-150 shadow-[0_0_24px_rgba(79,70,229,0.35)]"
                >
                  Start Practicing Free
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  href="#features"
                  className="inline-flex items-center gap-2 bg-[#000000] text-white font-medium text-[13px] tracking-[0.02em] px-7 py-3.5 rounded-md border border-[#27272a] hover:bg-[#121216] hover:border-[#3f3f46] transition-all duration-150 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                >
                  Explore Features
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center justify-center gap-6 flex-wrap"
            >
              {trustBadges.map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="6" stroke="#3730a3"/>
                    <path d="M4.5 7l2 2 3-3" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-mono text-[11px] text-[#9ca3af] tracking-[0.02em]">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </DottedGlowBackground>

        {/* ── Features / Capabilities Grid ── */}
        <section id="features" className="px-6 py-28 max-w-[1200px] mx-auto">
          {/* Section eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
            className="mb-14 text-center"
          >
            <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] mb-3">// CAPABILITIES</p>
            <h2 className="font-display text-[40px] font-bold text-[#ffffff] leading-[1.08] tracking-[-0.025em]">
              Everything You Need to Succeed
            </h2>
            <p className="font-body text-[15px] text-[#9ca3af] mt-3 max-w-[460px] mx-auto">
              Comprehensive tools for engineers preparing for top-tier technical interviews.
            </p>
          </motion.div>

          {/* Cards grid — staggered on scroll */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                style={{ willChange: 'transform, opacity' }}
                className={`p-5 group cursor-default transition-colors duration-200 ${
                  idx === 0
                    ? 'bg-[#09090e] border border-[#3730a3] rounded-lg shadow-[0_4px_24px_rgba(79,70,229,0.12)] hover:border-[#4f46e5] hover:bg-[#0f0f18]'
                    : 'bg-[#09090e] border border-[#1e1e2f] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-[#3730a3] hover:bg-[#0f0f18]'
                }`}
              >
                <div className="w-9 h-9 rounded-md bg-[#14142b] border border-[#3730a3]/50 flex items-center justify-center mb-5 group-hover:border-[#6366f1] group-hover:bg-[#1c1c38] transition-all duration-200">
                  <feature.icon className="h-4 w-4 text-[#818cf8]" />
                </div>
                <h3 className="font-display text-[15px] font-semibold text-[#ffffff] mb-2">{feature.title}</h3>
                <p className="font-body text-[13px] text-[#9ca3af] leading-[1.65]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="px-6 py-24 max-w-[1200px] mx-auto border-t border-[#1e1e2f]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
            className="mb-14 text-center sm:text-left"
          >
            <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] mb-3">// WORKFLOW</p>
            <h2 className="font-display text-[38px] font-bold text-[#ffffff] leading-[1.1] tracking-[-0.025em]">
              How It Works
            </h2>
            <p className="font-body text-[15px] text-[#9ca3af] mt-3 max-w-[500px]">
              From resume parsing to realistic mock execution and personalized study roadmaps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                title: 'Upload Your Resume',
                description: 'Our AI extracts your tech stack, years of experience, and highlighted projects to generate laser-targeted questions.',
              },
              {
                step: '02',
                title: 'Live Practice Cockpit',
                description: 'Switch between Speech STT, Monaco Code Editor, or Text to solve algorithmic, architectural, and behavioral challenges.',
              },
              {
                step: '03',
                title: 'Scoring & Study Roadmap',
                description: 'Receive multi-dimensional feedback with weakness detection and a generated step-by-step learning roadmap.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
                style={{ willChange: 'transform, opacity' }}
                className="bg-[#09090e] border border-[#1e1e2f] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-7 hover:border-[#3730a3] transition-all"
              >
                <div className="font-mono text-[28px] font-bold text-[#6366f1] mb-4 tracking-tight">
                  {item.step}
                </div>
                <h3 className="font-display text-[18px] font-semibold text-[#ffffff] mb-2.5">{item.title}</h3>
                <p className="font-body text-[14px] text-[#9ca3af] leading-[1.6]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mx-4 md:mx-8 lg:mx-16 my-20 relative overflow-hidden rounded-xl border border-[#3730a3] bg-[#090914] p-14 text-center shadow-[0_0_50px_rgba(79,70,229,0.15)]"
        >
          {/* Inner glow */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[200px] w-[500px] rounded-full bg-[#4f46e5] opacity-[0.12] blur-[80px]" />
          </div>
          <div className="relative z-10">
            <p className="font-mono text-[10px] text-[#818cf8] uppercase tracking-[0.2em] mb-4">// READY TO BEGIN</p>
            <h2 className="font-display text-[40px] font-bold text-[#ffffff] leading-[1.08] tracking-[-0.025em] mb-4">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="font-body text-[16px] text-[#9ca3af] mb-9 max-w-[420px] mx-auto">
              Join engineers who transformed their interview performance with AI-powered practice.
            </p>
            <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} className="inline-block">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 bg-[#4f46e5] text-white font-medium text-[13px] tracking-[0.02em] px-8 py-3.5 rounded-md border border-[#6366f1]/40 hover:bg-[#5865f2] transition-colors duration-150 shadow-[0_0_24px_rgba(79,70,229,0.35)]"
              >
                Start for Free
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* ── Footer ── */}
        <footer className="relative z-10 py-10 border-t border-[#1e1e2f] bg-[#000000]">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="led-pulse h-2 w-2 rounded-full bg-[#6366f1]" />
              <span className="font-mono text-[13px] font-bold text-[#ffffff] tracking-[0.08em] uppercase">InterviewAI</span>
            </div>
            <p className="font-mono text-[11px] text-[#64748b]">
              AI-Powered Interview Simulator • Master your technical engineering interviews
            </p>
            <div className="flex items-center gap-5">
              <Link
                href="/privacy"
                className="font-mono text-[10px] text-[#64748b] hover:text-[#9ca3af] uppercase tracking-[0.06em] transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="font-mono text-[10px] text-[#64748b] hover:text-[#9ca3af] uppercase tracking-[0.06em] transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
