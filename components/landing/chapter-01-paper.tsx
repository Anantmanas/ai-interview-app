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
    id: 'frontend',
    name: 'React, Next.js & Modern Frontend',
    category: 'Frontend',
    confidence: 96,
    targetCalibrations: ['Component Architecture', 'Re-render Optimization', 'Custom Hooks & State'],
    evidenceSnippet: 'Led migration of customer dashboard to Next.js and TypeScript, cutting initial page load times by 40%.',
  },
  {
    id: 'backend',
    name: 'Node.js, APIs & Database Design',
    category: 'Backend',
    confidence: 94,
    targetCalibrations: ['REST & GraphQL Design', 'PostgreSQL Queries', 'JWT Auth & Security'],
    evidenceSnippet: 'Built backend REST services serving 50k daily active users with Node.js and PostgreSQL connection pooling.',
  },
  {
    id: 'caching',
    name: 'System Design & Redis Caching',
    category: 'Architecture',
    confidence: 92,
    targetCalibrations: ['Cache Invalidation', 'Database Indexing', 'Rate Limiting'],
    evidenceSnippet: 'Implemented two-tier Redis caching and message queues, keeping API response times under 50ms during peak sales.',
  },
  {
    id: 'leadership',
    name: 'Technical Trade-offs & Code Quality',
    category: 'Best Practices',
    confidence: 90,
    targetCalibrations: ['PR Code Reviews', 'Testing Strategy', 'Refactoring Legacy Code'],
    evidenceSnippet: 'Mentored junior developers, established automated end-to-end testing, and led weekly architecture review meetings.',
  },
]

export function Chapter01Paper() {
  const [activeSkillId, setActiveSkillId] = useState<string>(EXTRACTED_SKILLS[0].id)
  const [hoverPosition, setHoverPosition] = useState<number>(0)

  const activeSkill = EXTRACTED_SKILLS.find((s) => s.id === activeSkillId) || EXTRACTED_SKILLS[0]

  return (
    <section className="section-paper py-28 sm:py-36 px-6 md:px-12 lg:px-20 border-t border-[#0A0A0A]/10 relative overflow-hidden select-text">
      {/* Chapter Marker Header */}
      <div className="max-w-[1400px] mx-auto mb-16 md:mb-20 flex flex-col md:flex-row md:items-baseline justify-between gap-6 border-b border-[#0A0A0A]/10 pb-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#0A0A0A]">
            01 / SMART ONBOARDING
          </span>
          <span className="text-[#5C5953]">•</span>
          <span className="font-mono text-xs text-[#5C5953] tracking-wide uppercase">
            TAILORED TO YOUR BACKGROUND
          </span>
        </div>
        <div className="font-mono text-xs text-[#5C5953] uppercase tracking-wider">
          QUESTIONS MATCH YOUR ACTUAL TECH STACK
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Editorial Statement */}
        <div className="mb-16 md:mb-24 max-w-4xl">
          <h2 className="display-giant text-[#0A0A0A] font-bold">
            Interviews tailored to your real experience.
          </h2>
          <p className="font-body text-xl md:text-2xl text-[#5C5953] mt-6 leading-relaxed font-normal">
            Generic interview prep tests random textbook trivia you never use at work. In 30 seconds, upload your resume or pick your target role. InterviewAI creates mock interviews calibrated to your exact tools, past projects, and seniority.
          </p>
        </div>

        {/* Asymmetric Architectural Specimen Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start border-t border-[#0A0A0A]/10 pt-12">
          {/* Left Column: Tabular Specimen Dossier */}
          <div className="lg:col-span-7 bg-[#EAE7DF]/70 border border-[#0A0A0A]/15 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#0A0A0A]/15 mb-6">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#0A0A0A]" />
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#0A0A0A]">
                  YOUR RESUME HIGHLIGHTS
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#5C5953] uppercase tracking-wider">
                [ 4 DETECTED SKILL AREAS ]
              </span>
            </div>

            <div className="divide-y divide-[#0A0A0A]/10">
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
                    className={`py-4 px-3 transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-[#F4F2EC] border-l-2 border-[#2447FF] pl-4 -ml-1'
                        : 'hover:bg-[#F4F2EC]/60 hover:pl-4 transition-all'
                    }`}
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-[#5C5953] font-medium">
                        0{index + 1}
                      </span>
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#2447FF] block font-semibold mb-0.5">
                          [{skill.category}]
                        </span>
                        <h4 className="font-display text-base sm:text-lg font-bold text-[#0A0A0A]">
                          {skill.name}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-[#0A0A0A] block">
                        {skill.confidence}%
                      </span>
                      <span className="font-mono text-[9px] text-[#5C5953] uppercase tracking-wider">
                        RELEVANCE
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-[#0A0A0A]/15 flex items-center justify-between text-[11px] font-mono text-[#5C5953]">
              <span className="uppercase tracking-wider">STATUS: READY TO INTERVIEW</span>
              <span className="text-[#0A0A0A] font-semibold">Click a skill to preview custom questions →</span>
            </div>
          </div>

          {/* Right Column: Dynamic Neural Projection readout */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
            <div className="border-b border-[#0A0A0A]/15 pb-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#2447FF] font-semibold block mb-1">
                AI QUESTION PREVIEW
              </span>
              <h3 className="display-statement text-[#0A0A0A] font-bold text-2xl sm:text-3xl">
                Questions written for your actual work.
              </h3>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSkill.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#5C5953] block mb-2">
                    FROM YOUR RESUME:
                  </span>
                  <blockquote className="font-display text-base sm:text-lg text-[#0A0A0A] leading-relaxed border-l-2 border-[#2447FF] pl-4 italic bg-[#EAE7DF]/40 py-2 pr-3">
                    "{activeSkill.evidenceSnippet}"
                  </blockquote>
                </div>

                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#5C5953] block mb-3">
                    TOPICS THE AI WILL INTERROGATE YOU ON:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeSkill.targetCalibrations.map((cal, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4F2EC] border border-[#0A0A0A]/20 text-xs font-mono text-[#0A0A0A] font-medium"
                      >
                        <span className="w-1.5 h-1.5 bg-[#2447FF]" />
                        {cal}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/dashboard/resume"
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase font-semibold text-[#0A0A0A] hover:text-[#2447FF] transition-colors border-b border-[#0A0A0A] hover:border-[#2447FF] pb-1"
                  >
                    <span>Upload your resume for free to start</span>
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
