'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Sliders, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'

export function Chapter03Blue() {
  // Slider value from 0 (Raw Candidate Response) to 100 (Deep Multi-Vector Evaluation)
  const [sliderVal, setSliderVal] = useState<number>(65)

  return (
    <section className="section-electric py-32 sm:py-44 px-6 md:px-12 lg:px-20 relative overflow-hidden select-text">
      {/* Chapter Marker Header */}
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-20 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-white/20 pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white">
            03 / INSTANT FEEDBACK
          </span>
          <span className="text-white/60">•</span>
          <span className="font-mono text-xs text-white/80 tracking-wide uppercase">
            FIND YOUR KNOWLEDGE GAPS
          </span>
        </div>
        <div className="font-mono text-xs text-white/80 uppercase tracking-wider">
          SEE WHY CANDIDATES GET REJECTED & HOW TO FIX IT
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Typographic Statement */}
        <div className="mb-16 md:mb-24 max-w-4xl">
          <h2 className="display-giant text-white font-bold">
            Spot your weak spots before real interviewers do.
          </h2>
          <p className="font-body text-xl md:text-2xl text-white/85 mt-6 leading-relaxed font-light">
            Most candidates walk out of interviews wondering what went wrong. InterviewAI breaks down your answers right away: what you got right, the knowledge gaps that hold you back, and how top candidates answer.
          </p>
        </div>

        {/* Interactive Drag / Scrub Controller (Precision Hairline Interface) */}
        <div className="border border-white/25 bg-[#1A3AE8]/80 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-white/90 font-semibold">
              INTERACTIVE FEEDBACK INSPECTOR:
            </span>
            <div className="flex items-center gap-4 text-xs font-mono text-white">
              <span className={sliderVal < 40 ? 'font-bold underline' : 'opacity-60'}>
                01 YOUR ANSWER
              </span>
              <span className="opacity-40">→</span>
              <span className={sliderVal >= 40 && sliderVal <= 70 ? 'font-bold underline' : 'opacity-60'}>
                02 THE KNOWLEDGE GAP
              </span>
              <span className="opacity-40">→</span>
              <span className={sliderVal > 70 ? 'font-bold underline' : 'opacity-60'}>
                03 EXACT FIX & SCORE
              </span>
            </div>
          </div>

          <div className="relative py-2">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-none appearance-none cursor-ew-resize accent-white"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/70 mt-2">
              <span>0% (Your Raw Answer)</span>
              <span>50% (The Hidden Flaw)</span>
              <span>100% (How To Fix It + Score)</span>
            </div>
          </div>
        </div>

        {/* Asymmetric Comparative Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/25 bg-[#0A1A78]/30">
          {/* Left Column: Candidate Answer Layer */}
          <div className="lg:col-span-5 p-7 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/20 mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-white/80">
                  SAMPLE QUESTION FROM MOCK INTERVIEW
                </span>
                <span className="font-mono text-[10px] text-white/90 uppercase tracking-widest border border-white/30 px-2 py-0.5">
                  SYSTEM DESIGN
                </span>
              </div>

              <h4 className="font-display text-lg sm:text-xl font-bold text-white mb-5 leading-snug">
                "How would you prevent a cache stampede during a sudden spike in traffic?"
              </h4>

              <div className="p-5 bg-black/30 border-l-2 border-white/40 text-sm font-body leading-relaxed text-white/90">
                <p className="italic">
                  "We would add an in-memory Redis cluster. If CPU goes over 80%, we automatically spawn more replicas and invalidate cache keys after 5 minutes."
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/20 text-xs font-mono text-white/70">
              Submitted during mock session · Scored in 2 seconds
            </div>
          </div>

          {/* Right Column: Diagnostic Dimensions Revealed by Slider */}
          <div className="lg:col-span-7 p-7 sm:p-10 bg-[#050508] text-[#F4F2EC] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#2447FF]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#F4F2EC]">
                    AI FEEDBACK (SCRUB LEVEL: {sliderVal}%)
                  </span>
                </div>
                <span className="font-mono text-xs text-[#2447FF] font-bold">
                  {sliderVal < 50 ? 'SUMMARY' : 'DETAILED LESSON'}
                </span>
              </div>

              {/* Dynamic Reveal according to Slider Position */}
              {sliderVal < 40 ? (
                <div className="py-8 text-center space-y-3">
                  <span className="font-mono text-xs uppercase text-[#8C8C88] tracking-widest block">
                    WHAT YOU ANSWERED
                  </span>
                  <p className="font-display text-lg text-[#F4F2EC]">
                    You correctly suggested Redis and read-replicas, but completely missed what happens when keys expire simultaneously.
                  </p>
                  <p className="font-mono text-xs text-[#8C8C88]">
                    Drag the slider right to see your knowledge gap and the exact fix →
                  </p>
                </div>
              ) : sliderVal <= 70 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#141414] border-l-2 border-[#f43f5e] text-xs font-mono">
                    <span className="text-[#f43f5e] font-bold uppercase block mb-1">
                      [ THE KNOWLEDGE GAP ]
                    </span>
                    <p className="text-[#F4F2EC] leading-relaxed">
                      More replicas won't help when a popular key expires. Thousands of requests will bypass the cache at the exact same moment and crash your database.
                    </p>
                  </div>
                  <div className="p-4 bg-[#141414] border-l-2 border-[#2447FF] text-xs font-mono">
                    <span className="text-[#6B85FF] font-bold uppercase block mb-1">
                      [ HOW TO ANSWER LIKE A SENIOR DEV ]
                    </span>
                    <p className="text-[#F4F2EC] leading-relaxed">
                      Explain that you'd use a mutex lock (singleflight pattern) so only 1 request queries the database while others wait, or use early probabilistic refresh.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 border border-white/10 p-3 bg-[#0A0A0E]">
                    <div className="border-r border-white/10 pr-2">
                      <span className="font-mono text-[10px] text-[#8C8C88] uppercase block">Concurrency</span>
                      <span className="font-mono text-lg font-bold text-[#f43f5e]">45 / 100</span>
                    </div>
                    <div className="border-r border-white/10 pr-2">
                      <span className="font-mono text-[10px] text-[#8C8C88] uppercase block">Architecture</span>
                      <span className="font-mono text-lg font-bold text-[#fbbf24]">72 / 100</span>
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-[#8C8C88] uppercase block">Communication</span>
                      <span className="font-mono text-lg font-bold text-[#34d399]">92 / 100</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#141414] border-l-2 border-[#2447FF] text-xs font-mono space-y-1">
                    <span className="text-[#6B85FF] font-bold uppercase block">
                      ADDED TO YOUR LEARNING ROADMAP:
                    </span>
                    <p className="text-[#F4F2EC] leading-relaxed">
                      "Cache Stampedes & Mutex Patterns" automatically added with a quick 10-minute video explanation and follow-up practice question.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#8C8C88]">
              <span>FEEDBACK TIME: 2 SECONDS</span>
              <span className="text-[#F4F2EC]">
                {sliderVal < 40
                  ? 'Overview loaded'
                  : sliderVal <= 70
                  ? 'Knowledge gap revealed'
                  : 'Roadmap action queued'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
