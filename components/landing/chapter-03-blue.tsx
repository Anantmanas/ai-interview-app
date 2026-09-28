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
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-24 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-white/20 pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-white">
            03 / DIAGNOSTIC ARCHITECTURE
          </span>
          <span className="text-white/60">•</span>
          <span className="font-mono text-xs text-white/80 tracking-wide uppercase">
            MULTI-DIMENSIONAL DECONSTRUCTION
          </span>
        </div>
        <div className="font-mono text-xs text-white/80 uppercase tracking-wider">
          DRAG TO REVEAL HOW THE ENGINE AUDITS ANSWERS
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Giant Typographic Statement */}
        <div className="mb-20 md:mb-28 max-w-5xl">
          <h2 className="display-giant text-white font-bold">
            Diagnosis is not a pass/fail grade.
          </h2>
          <p className="font-body text-xl md:text-2xl lg:text-3xl text-white/85 mt-8 leading-[1.35] max-w-3xl font-light">
            Top tier interviewers look for systemic intuition, boundary defenses, and architectural maturity. Drag the inspection slider to reveal the diagnostic dimensions underneath.
          </p>
        </div>

        {/* Interactive Drag / Scrub Controller */}
        <div className="bg-[#1A3AE8] border border-white/25 rounded-2xl p-6 sm:p-10 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <span className="font-mono text-xs uppercase tracking-widest text-white/80 font-semibold">
              DIAGNOSTIC INSPECTION SLIDER:
            </span>
            <div className="flex items-center gap-4 text-xs font-mono text-white">
              <span className={sliderVal < 40 ? 'font-bold underline' : 'opacity-70'}>
                01 RAW ANSWER
              </span>
              <span>→</span>
              <span className={sliderVal >= 40 && sliderVal <= 70 ? 'font-bold underline' : 'opacity-70'}>
                02 VULNERABILITY AUDIT
              </span>
              <span>→</span>
              <span className={sliderVal > 70 ? 'font-bold underline' : 'opacity-70'}>
                03 DIMENSION RADAR
              </span>
            </div>
          </div>

          <div className="relative py-4">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-ew-resize accent-white"
            />
            <div className="flex justify-between text-[11px] font-mono text-white/70 mt-2">
              <span>0% (Raw Transcript)</span>
              <span>50% (Spectral Telemetry)</span>
              <span>100% (Full Radar Audit)</span>
            </div>
          </div>
        </div>

        {/* Asymmetric Split: Raw Answer vs. AI Diagnostic Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Candidate Answer Layer */}
          <div className="lg:col-span-5 p-8 rounded-2xl bg-white/10 border border-white/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/20 mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-white/80">
                  INTERVIEW STAGE: QUESTION 03
                </span>
                <span className="font-mono text-[11px] text-white/90 bg-white/20 px-2 py-0.5 rounded">
                  SYSTEM DESIGN
                </span>
              </div>

              <h4 className="font-display text-lg font-semibold text-white mb-4">
                "How would you prevent a cache stampede during a sudden flash sale?"
              </h4>

              <div className="p-5 rounded-xl bg-black/20 border border-white/15 text-sm sm:text-base font-body leading-relaxed text-white/90">
                <p className="italic">
                  "We would introduce an in-memory Redis cluster with read-replicas. If the CPU load on the cache goes over 80%, we automatically spawn more replicas and invalidate keys after 5 minutes."
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/20 text-xs font-mono text-white/70">
              Candidate status: Answer submitted · Awaiting multi-vector evaluation
            </div>
          </div>

          {/* Right Column: Diagnostic Dimensions Revealed by Slider */}
          <div className="lg:col-span-7 p-8 rounded-2xl bg-[#050505] text-[#F4F2EC] border border-white/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2447FF]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#F4F2EC]">
                    EVALUATION ARTIFACT (DEPTH: {sliderVal}%)
                  </span>
                </div>
                <span className="font-mono text-xs text-[#2447FF] font-bold">
                  {sliderVal < 50 ? 'SURFACE REVIEW' : 'DEEP RADAR AUDIT'}
                </span>
              </div>

              {/* Dynamic Reveal according to Slider Position */}
              {sliderVal < 40 ? (
                <div className="py-8 text-center space-y-3">
                  <span className="font-mono text-xs uppercase text-[#8C8C88] tracking-widest block">
                    SURFACE EVALUATION ONLY
                  </span>
                  <p className="font-display text-lg text-[#F4F2EC]">
                    Candidate correctly identified Redis and replicas, but failed to address concurrent TTL expiration.
                  </p>
                  <p className="font-mono text-xs text-[#8C8C88]">
                    Drag the slider to 50%+ to reveal deep systemic blindspots →
                  </p>
                </div>
              ) : sliderVal <= 70 ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#141414] border border-[#f43f5e]/40 text-xs font-mono">
                    <span className="text-[#f43f5e] font-bold uppercase block mb-1">
                      CRITICAL BLINDSPOT DETECTED:
                    </span>
                    <p className="text-[#F4F2EC] leading-relaxed">
                      Spawning replicas does NOT mitigate a cache stampede when a hot key expires. All concurrent requests will still bypass cache and hammer database shards simultaneously.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#141414] border border-white/10 text-xs font-mono">
                    <span className="text-[#6B85FF] font-bold uppercase block mb-1">
                      RECOMMENDED ARCHITECTURAL PRIMITIVE:
                    </span>
                    <p className="text-[#F4F2EC] leading-relaxed">
                      Implement probabilistic early expiration (XFetch algorithm) or a singleflight distributed mutex lock.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/10">
                      <span className="font-mono text-[10px] text-[#8C8C88] uppercase block">Concurrency</span>
                      <span className="font-mono text-lg font-bold text-[#f43f5e]">42 / 100</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/10">
                      <span className="font-mono text-[10px] text-[#8C8C88] uppercase block">Architecture</span>
                      <span className="font-mono text-lg font-bold text-[#fbbf24]">68 / 100</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#141414] border border-white/10">
                      <span className="font-mono text-[10px] text-[#8C8C88] uppercase block">Communication</span>
                      <span className="font-mono text-lg font-bold text-[#34d399]">90 / 100</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#141414] border border-[#2447FF]/40 text-xs font-mono space-y-1.5">
                    <span className="text-[#6B85FF] font-bold uppercase block">
                      SYNTHESIZED ROADMAP DIRECTIVE:
                    </span>
                    <p className="text-[#F4F2EC] leading-relaxed">
                      Topic "Cache Stampede & Singleflight Pattern" flagged for automated video tutorial remediation and follow-up targeted re-testing.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#8C8C88]">
              <span>Latency to diagnosis: 240ms</span>
              <span className="text-[#F4F2EC]">Full radar matrix synthesized</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
