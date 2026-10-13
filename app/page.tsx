'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ResizableNavbar from '@/components/resizable-navbar'
import DalaBrainCanvas from '@/components/landing/dala-brain-canvas'
import { HeroInterviewPreview } from '@/components/landing/hero-interview-preview'
import {
  Code,
  Network,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react'

// Engineering Tracks Data
const INTERVIEW_TRACKS = [
  {
    id: 'technical',
    title: 'Algorithms & Data Structures',
    level: 'Senior • L5',
    desc: 'Algorithmic reasoning, time/space complexity analysis, edge case exploration, and real-time Monaco IDE compilation.',
    icon: Code,
    color: '#8052ff',
    badge: 'TECHNICAL CODE REHEARSAL',
  },
  {
    id: 'system_design',
    title: 'Distributed System Architecture',
    level: 'Staff • L6',
    desc: 'High-throughput scalability, idempotency, caching strategies, failure modes, and database trade-offs.',
    icon: Network,
    color: '#15846e',
    badge: 'ARCHITECTURE & SCALE',
  },
  {
    id: 'behavioral',
    title: 'Engineering Leadership & STAR',
    level: 'Senior / Staff',
    desc: 'Conflict resolution, technical debt prioritization, cross-functional persuasion, and architectural trade-offs.',
    icon: Users,
    color: '#ffb829',
    badge: 'BEHAVIORAL & IMPACT',
  },
]

// Workflow Steps
const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Resume & Role Calibration',
    desc: 'Upload your resume or specify target seniority. InterviewAI calibrates questions to your real background and target expectations.',
  },
  {
    step: '02',
    title: 'Adaptive AI Mock Rehearsal',
    desc: 'Experience dynamic AI interviewers that listen to your reasoning, follow up on assumptions, and challenge architectural gaps.',
  },
  {
    step: '03',
    title: 'Live Code & Audio Stream',
    desc: 'Speak naturally and write code simultaneously. Practice thinking out loud while writing production-ready implementations.',
  },
  {
    step: '04',
    title: 'Objective Score & Study Roadmap',
    desc: 'Receive an instant granular scorecard, identify exact gaps, and get personalized study modules to fix weaknesses before the real interview.',
  },
]

export default function LandingPage() {
  const [activeTrack, setActiveTrack] = useState<string>('technical')

  return (
    <main className="relative min-h-screen bg-[#000000] text-[#ffffff] overflow-x-hidden selection:bg-[#8052ff]/30 selection:text-white">
      {/* ── Persistent 3D WebGL Neural Constellation & Ambient Particle Canvas ── */}
      <DalaBrainCanvas />

      {/* Scroll sentinel for resizable navbar */}
      <div id="scroll-sentinel" className="absolute top-20 h-px w-full pointer-events-none" aria-hidden="true" />

      {/* ── REDESIGNED RESIZABLE NAVBAR (InterviewAI Branding + Dala Fidelity) ── */}
      <div className="relative z-30">
        <ResizableNavbar />
      </div>

      {/* ── DOM CONTENT LAYER: Seamless Full-Width Canvas ── */}
      <div className="relative z-10 w-full min-h-screen">

        {/* ══════════════════════════════════════════════════════════════
            1. HERO SECTION (InterviewAI Core Message + Dala Scale)
        ══════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="relative min-h-[90vh] flex items-center pt-28 sm:pt-36 pb-16 lg:pb-24 px-6 sm:px-10 lg:px-16 w-full overflow-hidden"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center w-full relative z-10">
            {/* Left Column: Monolithic Weight-400 Display Headline & Single CTA */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col items-start max-w-2xl mobile-blur"
            >
              {/* Monolithic Display Headline: 3-Line Solid White Cadence matching Dala Scale */}
              <h1 className="font-display text-5xl sm:text-7xl lg:text-[88px] xl:text-[104px] font-normal leading-[0.93] tracking-[-0.04em] text-white max-w-4xl mb-7 text-left">
                <span className="block">Practice</span>
                <span className="block">the interview</span>
                <span className="block">before the real one.</span>
              </h1>

              {/* Saffron Spark Accent Eyebrow: Dala Micro-Monospace */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                className="dala-tag-amber text-[#ffb829] font-mono text-[11px] sm:text-[12px] tracking-[0.16em] uppercase mb-4 inline-flex items-center gap-2"
              >
                <span>STOP GUESSING INTERVIEW EXPECTATIONS. REHEARSE THEM.</span>
              </motion.div>

              {/* Ultra-Light 200 Body Copy */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28, ease: 'easeOut' }}
                className="dala-body-light text-base sm:text-lg lg:text-xl font-extralight text-zinc-300 max-w-xl text-left leading-relaxed mb-9"
              >
                Plug into real big-tech interview calibrations. Rehearse algorithms, distributed system design, and engineering leadership under live AI pressure with instant rubric scoring and weakness roadmaps.
              </motion.p>

              {/* Primary Action Button: Electric Iris Filled Violet Pill (DESIGN(system).md L86-90) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
                className="flex items-start"
              >
                <Link
                  href="/auth/sign-up"
                  className="btn-dala-primary"
                >
                  Start Free Rehearsal
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Column: Framing Negative Space for the 3D Neural Constellation Brain (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-5 h-[340px] sm:h-[480px] lg:h-[620px] relative pointer-events-none">
              {/* 3D Brain canvas renders prominently on the right half */}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            2. INTRODUCTION SECTION (#features anchor for navbar)
               Two-Column Split: 3D Brain slides to Left, Text on Right
        ══════════════════════════════════════════════════════════════ */}
        <section
          id="features"
          className="py-16 lg:py-24 px-6 sm:px-10 lg:px-16 scroll-mt-24 w-full"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column: Negative space framing 3D brain as it slides to the left (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-6 h-[220px] sm:h-[320px] pointer-events-none" />

            {/* Right Column: Title on two lines + body text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col items-start text-left max-w-lg mobile-blur"
            >
              <div className="font-mono text-[10px] sm:text-[11px] text-zinc-400 tracking-[0.25em] uppercase mb-4 inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15846e]" />
                <span>ADAPTIVE REHEARSAL ENGINE</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-[-0.035em] text-white mb-6">
                <span className="block">Realistic simulations,</span>
                <span className="block text-zinc-400">instant feedback</span>
              </h2>
              <p className="text-base sm:text-lg font-light text-zinc-400 leading-relaxed max-w-xl">
                Adaptive technical interviews that evaluate not just whether your code compiles, but how you reason, articulate trade-offs, and handle edge cases under pressure.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            3. CONTRAST MANIFESTO: Traditional Prep vs Rehearsal (#architecture)
        ══════════════════════════════════════════════════════════════ */}
        <section
          id="architecture"
          className="py-16 lg:py-24 px-6 sm:px-10 lg:px-16 scroll-mt-24 w-full"
        >
          <div className="max-w-7xl mx-auto w-full">
            {/* Pair 1: Memorization vs Live Thinking */}
            <div className="min-h-[38vh] sm:min-h-[44vh] flex flex-col justify-center py-12 sm:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline mobile-blur">
                <div className="lg:col-span-2 font-mono text-[10px] sm:text-[11px] text-[#8052ff] uppercase tracking-[0.25em] font-medium pt-1">
                  01 • LIVE THINKING
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-5"
                >
                  <p className="text-xl sm:text-2xl lg:text-3xl text-white font-normal leading-[1.25] tracking-tight">
                    Traditional prep is memorizing LeetCode answers. In real interviews, you have to think out loud under pressure.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-5"
                >
                  <p className="text-lg sm:text-xl lg:text-2xl text-zinc-400 font-light leading-[1.35] tracking-tight">
                    InterviewAI evaluates your verbal explanation, problem decomposition, and reasoning flow in real time.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Pair 2: Scheduling Friction vs Instant On-Demand */}
            <div className="min-h-[38vh] sm:min-h-[44vh] flex flex-col justify-center py-12 sm:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline mobile-blur">
                <div className="lg:col-span-2 font-mono text-[10px] sm:text-[11px] text-[#8052ff] uppercase tracking-[0.25em] font-medium pt-1">
                  02 • ADAPTIVE SENIORITY
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-5"
                >
                  <p className="text-xl sm:text-2xl lg:text-3xl text-white font-normal leading-[1.25] tracking-tight">
                    Mock interviews with peers are hard to schedule, inconsistent, and often surface vague or subjective feedback.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-5"
                >
                  <p className="text-lg sm:text-xl lg:text-2xl text-zinc-400 font-light leading-[1.35] tracking-tight">
                    Our AI interviewer adapts to your seniority level, probes your weak spots, and gives instant objective scores.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Pair 3: Rejection Mystery vs Concrete Roadmap */}
            <div className="min-h-[38vh] sm:min-h-[44vh] flex flex-col justify-center py-12 sm:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-baseline mobile-blur">
                <div className="lg:col-span-2 font-mono text-[10px] sm:text-[11px] text-[#8052ff] uppercase tracking-[0.25em] font-medium pt-1">
                  03 • OBJECTIVE DIAGNOSTICS
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-5"
                >
                  <p className="text-xl sm:text-2xl lg:text-3xl text-white font-normal leading-[1.25] tracking-tight">
                    You usually only find out what you did wrong after getting rejected by the hiring team.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="lg:col-span-5"
                >
                  <p className="text-lg sm:text-xl lg:text-2xl text-zinc-400 font-light leading-[1.35] tracking-tight">
                    Identify your exact knowledge gaps immediately after every session with an actionable personalized study roadmap.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Interactive Live Rehearsal Proof Cockpit */}
            <div className="pt-16 sm:pt-20 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div>
                  <span className="font-mono text-[10px] sm:text-[11px] text-zinc-400 tracking-[0.25em] uppercase mb-3 block">
                    INTERACTIVE SIMULATION
                  </span>
                  <h2 className="font-display text-3xl sm:text-5xl font-normal tracking-[-0.035em] text-white">
                    Experience the rehearsal cockpit
                  </h2>
                </div>
                <p className="text-zinc-400 text-xs sm:text-sm font-mono tracking-wider max-w-sm">
                  Switch tracks below to see how InterviewAI transcribes answers, monitors INP/scalability, and flags weak spots.
                </p>
              </div>

              <div className="w-full">
                <HeroInterviewPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            4. WORKFLOW / HOW IT WORKS SECTION (#how-it-works anchor)
               Dala Connected Monolithic Matrix
        ══════════════════════════════════════════════════════════════ */}
        <section
          id="how-it-works"
          className="py-16 lg:py-24 px-6 sm:px-10 lg:px-16 scroll-mt-24 w-full"
        >
          <div className="max-w-7xl mx-auto w-full">
            <div className="max-w-2xl mb-12 sm:mb-16">
              <span className="font-mono text-[10px] sm:text-[11px] text-zinc-400 tracking-[0.25em] uppercase mb-4 block">
                4-STEP REHEARSAL LOOP
              </span>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.035em] text-white mb-4">
                How it works
              </h2>
              <p className="text-base sm:text-lg font-light text-zinc-400 leading-relaxed">
                A calibrated end-to-end rehearsal engine engineered to eliminate surprises in real interviews.
              </p>
            </div>

            {/* Connected Monolithic 4-Step Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {WORKFLOW_STEPS.map((ws) => (
                <div
                  key={ws.step}
                  className="bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.05] transition-all duration-300 p-8 sm:p-10 rounded-2xl border border-white/[0.06] hover:border-white/10 flex flex-col justify-between group"
                >
                  <div>
                    <span className="font-mono text-3xl sm:text-4xl font-normal text-[#8052ff] mb-6 block">
                      {ws.step}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-normal text-white mb-3 tracking-tight group-hover:text-white transition-colors">
                      {ws.title}
                    </h3>
                    <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
                      {ws.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            5. ENGINEERING TRACKS GRID (Dala Sculptural Rounded-3XL Cards)
        ══════════════════════════════════════════════════════════════ */}
        <section className="py-16 lg:py-24 px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
              <div>
                <span className="font-mono text-[10px] sm:text-[11px] text-zinc-400 tracking-[0.25em] uppercase mb-4 block">
                  TARGETED CURRICULUM
                </span>
                <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.035em] text-white">
                  Rehearse by discipline
                </h2>
              </div>
              <Link
                href="/interview/new"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8052ff] hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <span>Explore all tracks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Dala Sculptural Rounded-3XL Track Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {INTERVIEW_TRACKS.map((track) => {
                const Icon = track.icon
                return (
                  <div
                    key={track.id}
                    className="bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-300 p-8 sm:p-10 rounded-3xl flex flex-col justify-between group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center border border-white/10"
                          style={{ backgroundColor: `${track.color}15`, borderColor: `${track.color}40` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: track.color }} />
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 border border-white/10 bg-white/[0.03] px-3 py-1 rounded-full">
                          {track.level}
                        </span>
                      </div>

                      <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#ffb829] mb-2 block font-medium">
                        {track.badge}
                      </span>
                      <h3 className="text-2xl font-normal text-white mb-4 tracking-tight">
                        {track.title}
                      </h3>
                      <p className="text-sm text-zinc-400 font-light leading-relaxed mb-8">
                        {track.desc}
                      </p>
                    </div>

                    <Link
                      href={`/interview/new?track=${track.id}`}
                      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300 group-hover:text-[#8052ff] transition-colors pt-6 border-t border-white/[0.06]"
                    >
                      <span>Practice this track</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Dala Dual Circular Pill Navigation Buttons */}
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                type="button"
                aria-label="Previous tracks"
                className="w-11 h-11 rounded-full bg-[#8052ff] hover:bg-[#9a75ff] text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(128,82,255,0.4)] cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                type="button"
                aria-label="Next tracks"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            6. CONCLUDING CTA SECTION (Translucent Dark Glass Card)
        ══════════════════════════════════════════════════════════════ */}
        <section className="py-16 lg:py-24 px-6 sm:px-10 lg:px-16 w-full relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            <div className="w-full bg-white/[0.03] backdrop-blur-2xl hover:bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all duration-300 rounded-3xl sm:rounded-[40px] p-12 sm:p-20 lg:p-24 relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col items-center text-center">
              {/* Subtle Ambient Radial Aura behind Card Content */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#8052ff]/15 blur-[120px] rounded-full pointer-events-none"
                aria-hidden="true"
              />

              {/* Giant Closing Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-white max-w-4xl mb-8 tracking-tight leading-[1.15] relative z-10"
              >
                Land your dream engineering role with confidence.
              </motion.h2>

              {/* Central CTA: Signature Electric Iris Violet Pill Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative z-10"
              >
                <Link
                  href="/auth/sign-up"
                  className="btn-dala-primary inline-flex items-center justify-center px-6 py-2.5 font-mono text-xs uppercase tracking-[0.12em] font-medium"
                >
                  Start Free Mock Interview
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            7. FOOTER SECTION (InterviewAI Branding & Dala Minimalist Links)
        ══════════════════════════════════════════════════════════════ */}
        <footer className="pb-16 pt-4 px-6 sm:px-10 lg:px-16 relative overflow-hidden bg-transparent w-full z-10">
          <div className="max-w-7xl mx-auto w-full flex flex-col items-center text-center">
            {/* Centered Brand Mark with Glow */}
            <div className="flex flex-col items-center gap-3 mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-[#8052ff]/30 blur-lg rounded-full" />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
                  <path d="M12 2L22 20L12 16L12 2Z" fill="#8052ff" />
                  <path d="M12 2L2 20L12 16L12 2Z" fill="#15846e" />
                </svg>
              </div>
              <span className="font-normal text-xl text-white tracking-wide">
                InterviewAI
              </span>
            </div>

            {/* Centered Minimalist Navigation Links (Dala Structure) */}
            <div className="flex items-center flex-wrap justify-center gap-8 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-zinc-400 mb-10">
              <Link href="#hero" className="hover:text-white transition-colors">
                Overview
              </Link>
              <Link href="#features" className="hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#architecture" className="hover:text-white transition-colors">
                Manifesto
              </Link>
              <Link href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="/dashboard" className="text-[#8052ff] hover:text-[#9a75ff] transition-colors">
                Dashboard →
              </Link>
            </div>

            {/* Secondary Legal Links & Copyright */}
            <div className="w-full pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
              <span>
                © 2026 InterviewAI Inc. All rights reserved.
              </span>
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-zinc-300 transition-colors">
                  Terms
                </Link>
                <Link href="/help" className="hover:text-zinc-300 transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
