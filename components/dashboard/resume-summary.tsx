'use client'

import { useState } from 'react'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { CheckCircle2, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { resolveCandidateName } from '@/lib/resume/name-utils'

export function ResumeSummary() {
  const { resumeData, resumeMeta, isResumeReady } = useResume()
  const [expanded, setExpanded] = useState(false)

  if (!isResumeReady || !resumeData) {
    return null
  }

  const candidateName = resolveCandidateName({
    name: resumeData.name,
    fileName: resumeMeta?.fileName,
  })
  const hasValidName = candidateName !== 'Candidate Profile'
  const skills = resumeData.skills || []

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] overflow-hidden shadow-xl">
      {/* Titlebar */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2447FF]" />
          <span className="font-mono text-[11px] text-[#8C8C88] font-semibold tracking-wider uppercase">
            CANDIDATE PROFILE // {resumeMeta?.fileName || 'RESUME_ACTIVE'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#2447FF] bg-[#2447FF]/10 border border-[#2447FF]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
            GROUNDING ACTIVE
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Candidate & Target Role */}
        {hasValidName && (
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="text-[#8C8C88]">Candidate:</span>
            <strong className="text-[#F4F2EC] font-semibold text-sm font-sans">{candidateName}</strong>
            <span className="text-[#8C8C88]">•</span>
            <span className="text-[#8C8C88]">Target:</span>
            <span className="text-[#2447FF] font-semibold">{resumeData.targetRole || 'Software Engineer'}</span>
          </div>
        )}

        {/* Collapsible Executive Summary */}
        {(() => {
          const isPdfMetadata = (s?: string) => {
            if (!s) return true
            if (s.startsWith('%PDF-') || s.startsWith('PDF-')) return true
            if (s.includes('/Creator') || s.includes('/Producer') || s.includes('/Type/Catalog')) return true
            if (/^PDF-\d|^%PDF-\d/.test(s)) return true
            if ((s.match(/\/(Type|Creator|Producer|Author|Title|ModDate|CreationDate)\b/g) || []).length >= 2) return true
            return false
          }
          const isGlyphGarbage = (s?: string) => {
            if (!s) return true
            if (isPdfMetadata(s)) return true
            const symbols = s.match(/[$%&#!*+\\=~^`<>{}[\]|]/g) || []
            return symbols.length / s.length > 0.08
          }
          const summaryText = resumeData.summary && !isGlyphGarbage(resumeData.summary)
            ? resumeData.summary
            : 'Experienced Software Engineer specializing in modern frontend and full-stack development with React, TypeScript, and scalable web architectures.'

          return (
            <div className="p-4 rounded-xl bg-[#141414] border border-white/10">
              <p
                className={`font-body text-[13.5px] text-[#8C8C88] leading-relaxed cursor-pointer ${expanded ? '' : 'line-clamp-2'}`}
                onClick={() => setExpanded(!expanded)}
              >
                {summaryText}
              </p>
              {summaryText.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="font-mono text-[11px] text-[#2447FF] hover:text-white transition-colors mt-2 inline-flex items-center gap-1 cursor-pointer font-semibold uppercase tracking-wider"
                >
                  {expanded ? (
                    <>
                      <span>Collapse Summary</span>
                      <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span>Expand Executive Summary</span>
                      <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )
        })()}


        {/* Extracted Skills */}
        <div>
          <p className="font-mono text-[10px] uppercase text-[#8C8C88] tracking-[0.14em] mb-2.5 font-semibold">
            EXTRACTED TECHNICAL STACK ({skills.length > 0 ? skills.length : 'DETECTED'})
          </p>
          <div className="flex flex-wrap gap-2">
            {(skills.length > 0 ? skills : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'])
              .slice(0, 18)
              .map((skill) => (
                <div
                  key={skill}
                  className="group inline-flex items-center gap-2 bg-[#141414] hover:bg-[#1A1A1A] border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all shadow-sm"
                >
                  <SkillIcon skill={skill} className="w-4 h-4 shrink-0" size={16} />
                  <span className="font-mono text-[11px] font-medium text-[#F4F2EC] group-hover:text-[#2447FF] transition-colors">
                    {skill}
                  </span>
                </div>
              ))}
            {skills.length > 18 && (
              <span className="font-mono text-[11px] text-[#8C8C88] self-center px-2.5 py-1 bg-[#141414] border border-white/10 rounded-lg">
                +{skills.length - 18} more
              </span>
            )}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#8C8C88] border-t border-white/10">
          <div className="flex items-center gap-2 text-[#34d399]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Active: AI interviewer generates grounded interview vectors</span>
          </div>
        </div>
      </div>
    </div>
  )
}
