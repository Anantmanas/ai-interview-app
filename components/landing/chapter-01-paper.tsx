'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FileText, Cpu, CheckCircle2, ArrowRight, Layers, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface GroundedSkill {
  id: string
  name: string
  category: string
  confidence: number
  targetCalibrations: string[]
  evidenceSnippet: string
}

const EXTRACTED_SKILLS: GroundedSkill[] = [
  {
    id: 'dist-sys',
    name: 'Distributed Systems & Raft Consensus',
    category: 'Architecture',
    confidence: 96,
    targetCalibrations: ['Leader Election', 'Log Replication', 'Split-Brain Mitigation'],
    evidenceSnippet: 'Architected multi-region transactional consensus layer processing 45k RPS with 99.99% consistency guarantees.',
  },
  {
    id: 'k8s-mesh',
    name: 'Kubernetes & Service Mesh Topology',
    category: 'Infrastructure',
    confidence: 92,
    targetCalibrations: ['Istio Traffic Shifting', 'Envoy Sidecars', 'Zero-Trust mTLS'],
    evidenceSnippet: 'Managed 120-node Kubernetes clusters with Envoy-based zero-trust mTLS encryption across hybrid clouds.',
  },
  {
    id: 'low-latency',
    name: 'High-Throughput In-Memory Caching',
    category: 'Performance',
    confidence: 98,
    targetCalibrations: ['Redis Cluster Sharding', 'Cache-Aside Invalidation', 'Thundering Herd Defense'],
    evidenceSnippet: 'Engineered two-tier caching topology reducing P99 latency from 180ms to 9ms under peak load.',
  },
  {
    id: 'staff-lead',
    name: 'Cross-Functional Engineering Strategy',
    category: 'Leadership',
    confidence: 89,
    targetCalibrations: ['RFC Review Cycles', 'Incident Blameless Post-Mortems', 'Technical Debt Valuation'],
    evidenceSnippet: 'Mentored 14 senior engineers and spearheaded bi-weekly company-wide architecture steering committee.',
  },
]

export function Chapter01Paper() {
  const [activeSkillId, setActiveSkillId] = useState<string>(EXTRACTED_SKILLS[0].id)
  const [hoverPosition, setHoverPosition] = useState<number>(0)

  const activeSkill = EXTRACTED_SKILLS.find((s) => s.id === activeSkillId) || EXTRACTED_SKILLS[0]

  return (
    <section className="section-paper py-32 sm:py-44 px-6 md:px-12 lg:px-20 border-t border-[#0A0A0A]/10 relative overflow-hidden select-text">
      {/* Chapter Marker Header */}
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-24 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-[#0A0A0A]/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#0A0A0A]">
            01 / RESUME GROUNDING
          </span>
          <span className="text-[#5C5953]">•</span>
          <span className="font-mono text-xs text-[#5C5953] tracking-wide uppercase">
            CANDIDATE INTELLIGENCE
          </span>
        </div>
        <div className="font-mono text-xs text-[#5C5953] uppercase tracking-wider">
          THE ENGINE DOES NOT TEST BLIND MEMORIZATION
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Enormous Editorial Display Statement */}
        <div className="mb-20 md:mb-28 max-w-5xl">
          <h2 className="display-giant text-[#0A0A0A] font-bold">
            Preparation is not memorization.
          </h2>
          <p className="font-body text-xl md:text-2xl lg:text-3xl text-[#5C5953] mt-8 leading-[1.35] max-w-3xl font-light">
            Generic interview prep fails because it interrogates candidates in a vacuum. InterviewAI ingests your background to dynamically formulate questions calibrated to your actual engineering tenure.
          </p>
        </div>

        {/* Asymmetric Interactive Layout: Resume Representation & Neural Extraction */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Simulated Resume Artifact (Interactive hover/drag surface) */}
          <div className="lg:col-span-6 bg-[#EAE7DF] border border-[#0A0A0A]/15 rounded-2xl p-8 sm:p-10 relative">
            <div className="flex items-center justify-between pb-6 border-b border-[#0A0A0A]/12 mb-8">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#0A0A0A]" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0A0A0A]">
                  SOURCE ARTIFACT: RESUME.PDF
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#5C5953] uppercase">
                4 EXTRACTED SIGNALS
              </span>
            </div>

            <div className="space-y-4">
              <div className="text-xs font-mono uppercase text-[#5C5953] tracking-wider mb-2">
                HOVER OVER A VERIFIED DOMAIN TO INSPECT GROUNDING:
              </div>

              {EXTRACTED_SKILLS.map((skill, index) => {
                const isActive = skill.id === activeSkillId
                return (
                  <div
                    key={skill.id}
                    onMouseEnter={() => {
                      setActiveSkillId(skill.id)
                      setHoverPosition(index)
                    }}
                    onClick={() => setActiveSkillId(skill.id)}
                    className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#F4F2EC] border-[#0A0A0A] shadow-[0_4px_20px_rgba(10,10,10,0.08)] translate-x-1'
                        : 'bg-transparent border-[#0A0A0A]/10 hover:border-[#0A0A0A]/30 hover:bg-[#F4F2EC]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-[10px] text-[#5C5953] uppercase">
                            0{index + 1}
                          </span>
                          <span className="font-mono text-[11px] text-[#0A0A0A] font-semibold uppercase tracking-wider">
                            {skill.category}
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-bold text-[#0A0A0A]">
                          {skill.name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-[#2447FF]">
                          {skill.confidence}%
                        </span>
                        <span className="block font-mono text-[10px] text-[#5C5953] uppercase">
                          MATCH
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-[#0A0A0A]/10 flex items-center justify-between text-xs font-mono text-[#5C5953]">
              <span>Grounding status: ACTIVE</span>
              <span className="text-[#0A0A0A] font-semibold">Ready for custom question synthesis →</span>
            </div>
          </div>

          {/* Right Column: Dynamic Calibration Preview */}
          <div className="lg:col-span-6 space-y-8 lg:sticky lg:top-28">
            <div className="border-b border-[#0A0A0A]/15 pb-6">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#2447FF] font-semibold">
                NEURAL SYNTHESIS PROJECTION
              </span>
              <h3 className="display-statement text-[#0A0A0A] font-bold mt-2">
                Questions crafted specifically for this profile.
              </h3>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSkill.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#5C5953] block mb-2">
                    EXTRACTED CANDIDATE EVIDENCE:
                  </span>
                  <blockquote className="font-display text-lg sm:text-xl text-[#0A0A0A] leading-relaxed border-l-2 border-[#2447FF] pl-5 italic">
                    "{activeSkill.evidenceSnippet}"
                  </blockquote>
                </div>

                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#5C5953] block mb-3">
                    TARGET EVALUATION CALIBRATIONS:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeSkill.targetCalibrations.map((cal, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAE7DF] border border-[#0A0A0A]/15 text-xs font-mono text-[#0A0A0A] font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2447FF]" />
                        {cal}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/dashboard/resume"
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase font-semibold text-[#0A0A0A] hover:text-[#2447FF] transition-colors border-b border-[#0A0A0A] hover:border-[#2447FF] pb-1"
                  >
                    <span>Upload your resume for instant grounding</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
