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

/* ── Typewriter hook ─────────────────────────────────────────── */

function useTypewriter(words: string[], speed = 80, pause = 2000) {
  const [displayed, setDisplayed] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
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
  const roles = useTypewriter(typewriterRoles)

  return (
    <main className="relative min-h-screen bg-[#04040b] overflow-x-hidden">
      <LandingBackground />

      <div className="relative z-10">
        {/* ── Navigation bar ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-3.5 bg-[#04040b]/75 backdrop-blur-xl border-b border-[#2b292d]/60">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="led-pulse h-2 w-2 rounded-full bg-[#71d083]" />
            <span className="font-mono text-[13px] font-bold text-[#e5e5e5] uppercase tracking-[0.1em]">InterviewAI</span>
            <span className="font-mono text-[9px] text-[#366740] border border-[#2d5736] rounded-[2px] px-1.5 py-0.5 tracking-[0.08em]">v2.0</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              href="#features"
              className="font-mono text-[11px] text-[#7c7a85] uppercase tracking-[0.06em] hover:text-[#eeeef0] transition-colors duration-150"
            >
              Capabilities
            </Link>
            <Link
              href="#how-it-works"
              className="font-mono text-[11px] text-[#7c7a85] uppercase tracking-[0.06em] hover:text-[#eeeef0] transition-colors duration-150"
            >
              Workflow
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="font-mono text-[11px] text-[#7c7a85] uppercase tracking-[0.06em] hover:text-[#eeeef0] transition-colors duration-150 px-3 py-1.5"
            >
              Sign In
            </Link>
            <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }}>
              <Link
                href="/auth/sign-up"
                className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] bg-[#71d083] text-[#04040b] px-4 py-2 rounded-[6px] border border-[#366740] hover:bg-[#82dba2] transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] inline-block"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* ── Hero Section ── */}
        <section className="pt-36 pb-24 px-6 text-center">
          <div className="max-w-[860px] mx-auto">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 border border-[#2b292d] bg-[#121113]/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8"
            >
              <span className="led-pulse h-1.5 w-1.5 rounded-full bg-[#71d083]" />
              <span className="font-mono text-[11px] text-[#71d083] uppercase tracking-[0.12em]">AI-Powered Technical Interview Simulator</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="font-display text-[48px] md:text-[68px] lg:text-[80px] font-bold leading-[1.04] tracking-[-0.03em] text-[#e5e5e5] mb-6 max-w-[860px] mx-auto"
            >
              Master Technical Interviews{' '}
              <span className="text-[#71d083]">with AI-Powered Practice</span>
            </motion.h1>

            {/* Typewriter rotating roles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <span className="font-mono text-[13px] text-[#49474e]">Practicing:</span>
              <span className="font-mono text-[13px] text-[#71d083] min-w-[220px] text-left">
                {roles}
                <span className="inline-block w-[2px] h-[14px] bg-[#71d083] ml-0.5 animate-led-pulse align-middle" />
              </span>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="font-body text-[17px] md:text-[19px] text-[#7c7a85] leading-[1.7] max-w-[540px] mx-auto mb-10"
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
                  className="inline-flex items-center gap-2 bg-[#71d083] text-[#04040b] font-mono text-[13px] font-bold uppercase tracking-[0.06em] px-7 py-3.5 rounded-[6px] border border-[#366740] hover:bg-[#82dba2] transition-colors duration-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
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
                  className="inline-flex items-center gap-2 bg-[#121113] text-[#b5b2bc] font-mono text-[13px] uppercase tracking-[0.06em] px-7 py-3.5 rounded-[6px] border border-[#2b292d] hover:bg-[#1a191b] hover:text-[#eeeef0] hover:border-[#3c393f] transition-all duration-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
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
                    <circle cx="7" cy="7" r="6" stroke="#2d5736"/>
                    <path d="M4.5 7l2 2 3-3" stroke="#71d083" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-mono text-[11px] text-[#7c7a85] tracking-[0.02em]">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Features / Capabilities Grid ── */}
        <section id="features" className="px-6 py-28 max-w-[1200px] mx-auto">
          {/* Section eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-14 text-center"
          >
            <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.2em] mb-3">// CAPABILITIES</p>
            <h2 className="font-display text-[40px] font-bold text-[#e5e5e5] leading-[1.08] tracking-[-0.025em]">
              Everything You Need to Succeed
            </h2>
            <p className="font-body text-[15px] text-[#7c7a85] mt-3 max-w-[460px] mx-auto">
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
                className={`p-5 group cursor-default transition-colors duration-200 ${
                  idx === 0
                    ? 'bg-[#121113] border border-[#2d5736] rounded-[6px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] bg-[#1d3a24]/30 hover:border-[#2d5736] hover:bg-[#1d3a24]/40'
                    : 'bg-[#121113] border border-[#2b292d] rounded-[6px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-[#2d5736] hover:bg-[#1d3a24]/20'
                }`}
              >
                <div className="w-9 h-9 rounded-[4px] bg-[#1a191b] border border-[#2b292d] flex items-center justify-center mb-5 group-hover:border-[#2d5736] group-hover:bg-[#1d3a24] transition-all duration-200">
                  <feature.icon className="h-4 w-4 text-[#71d083]" />
                </div>
                <h3 className="font-display text-[15px] font-semibold text-[#e5e5e5] mb-2">{feature.title}</h3>
                <p className="font-body text-[13px] text-[#7c7a85] leading-[1.65]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="px-6 py-24 max-w-[1200px] mx-auto border-t border-[#2b292d]/40">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-14 text-center sm:text-left"
          >
            <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.2em] mb-3">// WORKFLOW</p>
            <h2 className="font-display text-[38px] font-bold text-[#e5e5e5] leading-[1.1] tracking-[-0.025em]">
              How It Works
            </h2>
            <p className="font-body text-[15px] text-[#7c7a85] mt-3 max-w-[500px]">
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
                className="bg-[#121113] border border-[#2b292d] rounded-[6px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-7 hover:border-[#2d5736] transition-all"
              >
                <div className="font-mono text-[28px] font-bold text-[#71d083] mb-4 tracking-tight">
                  {item.step}
                </div>
                <h3 className="font-display text-[18px] font-semibold text-[#e5e5e5] mb-2.5">{item.title}</h3>
                <p className="font-body text-[14px] text-[#7c7a85] leading-[1.6]">{item.description}</p>
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
          className="mx-4 md:mx-8 lg:mx-16 my-20 relative overflow-hidden rounded-[6px] border border-[#2d5736] bg-[#1d3a24]/30 p-14 text-center shadow-[inset_0_1px_0_rgba(113,208,131,0.1)]"
        >
          {/* Inner glow */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[200px] w-[500px] rounded-full bg-[#71d083] opacity-[0.05] blur-[80px]" />
          </div>
          <div className="relative z-10">
            <p className="font-mono text-[10px] text-[#71d083] uppercase tracking-[0.2em] mb-4">// READY TO BEGIN</p>
            <h2 className="font-display text-[40px] font-bold text-[#e5e5e5] leading-[1.08] tracking-[-0.025em] mb-4">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="font-body text-[16px] text-[#7c7a85] mb-9 max-w-[420px] mx-auto">
              Join engineers who transformed their interview performance with AI-powered practice.
            </p>
            <motion.div whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} className="inline-block">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 bg-[#71d083] text-[#04040b] font-mono text-[13px] font-bold uppercase tracking-[0.06em] px-8 py-3.5 rounded-[6px] border border-[#366740] hover:bg-[#82dba2] transition-colors duration-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
              >
                Start for Free
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* ── Footer ── */}
        <footer className="relative z-10 py-10 border-t border-[#2b292d]/40 bg-[#04040b]">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="led-pulse h-2 w-2 rounded-full bg-[#71d083]" />
              <span className="font-mono text-[13px] font-bold text-[#e5e5e5] tracking-[0.08em] uppercase">InterviewAI</span>
            </div>
            <p className="font-mono text-[11px] text-[#7c7a85]">
              AI-Powered Interview Simulator • Master your technical engineering interviews
            </p>
            <div className="flex items-center gap-5">
              <Link
                href="/privacy"
                className="font-mono text-[10px] text-[#49474e] hover:text-[#7c7a85] uppercase tracking-[0.06em] transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="font-mono text-[10px] text-[#49474e] hover:text-[#7c7a85] uppercase tracking-[0.06em] transition-colors"
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
