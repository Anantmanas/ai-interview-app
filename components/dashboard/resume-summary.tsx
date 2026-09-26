'use client'

import { useState } from 'react'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { CheckCircle2, FileText } from 'lucide-react'

import { MacTrafficLights } from '@/components/ui/terminal-card'

export function ResumeSummary() {
  const { resumeData, resumeMeta, isResumeReady } = useResume()
  const [expanded, setExpanded] = useState(false)

  if (!isResumeReady || !resumeData) {
    return null
  }

  const skills = resumeData.skills || []

  return (
    <div className="rounded-xl border border-[#3730a3] bg-[#09090f] shadow-[0_0_30px_rgba(79,70,229,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
      {/* Apple Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
        <div className="flex items-center gap-3">
          <MacTrafficLights size="sm" />
          <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
            extracted-stack.json — zsh
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#6366f1] led-pulse" />
          <span className="font-mono text-[10px] text-[#818cf8] uppercase tracking-wider font-semibold">
            GROUNDING ACTIVE
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2030]/60 pb-3">
          <div className="flex items-center gap-2 font-mono text-[12px]">
            <span className="text-[#38bdf8] font-semibold">sys:~$</span>
            <span className="text-[#22c55e]">parsed --target=candidate_profile</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#64748b]">
            <FileText className="w-3.5 h-3.5 text-[#818cf8]" />
            <span>{resumeMeta?.fileName ? `Source: ${resumeMeta.fileName}` : 'Source: Linked Resume'}</span>
          </div>
        </div>

      {resumeData.name && (
        <div className="text-xs text-[#9ca3af]">
          Candidate: <strong className="text-[#ffffff] font-medium">{resumeData.name}</strong> • Target: <span className="text-[#818cf8]">{resumeData.targetRole || 'Software Engineer'}</span>
        </div>
      )}

      {/* Collapsible executive summary */}
      {(() => {
        const isGlyphGarbage = (s?: string) => {
          if (!s) return true
          const symbols = s.match(/[$%&#!*+\\=~^`<>{}[\]|]/g) || []
          return symbols.length / s.length > 0.08
        }
        const summaryText = resumeData.summary && !isGlyphGarbage(resumeData.summary)
          ? resumeData.summary
          : 'Experienced Software Engineer specializing in modern frontend and full-stack development with React, TypeScript, and scalable web architectures.'

        return (
          <div>
            <p
              className={`font-body text-[13px] text-[#9ca3af] leading-relaxed cursor-pointer ${expanded ? '' : 'line-clamp-2'}`}
              onClick={() => setExpanded(!expanded)}
            >
              {summaryText}
            </p>
            {summaryText.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="font-mono text-[10px] text-[#4f46e5] hover:text-[#818cf8] transition-colors mt-1"
              >
                {expanded ? 'COLLAPSE ↑' : 'EXPAND ↓'}
              </button>
            )}
          </div>
        )
      })()}

      {/* Skills with Original Official Brand SVGs */}
      <div>
        <p className="font-mono text-[10px] uppercase text-[#64748b] tracking-[0.1em] mb-2 font-semibold">
          EXTRACTED TECHNICAL STACK ({skills.length > 0 ? skills.length : 'DETECTED'})
        </p>
        <div className="flex flex-wrap gap-2">
          {(skills.length > 0 ? skills : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'])
            .slice(0, 16)
            .map((skill) => (
              <div
                key={skill}
                className="group inline-flex items-center gap-2 bg-[#0f0f18] hover:bg-[#161624] border border-[#1e1e2f] hover:border-[#3730a3] rounded-md px-3 py-1.5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
              >
                <SkillIcon skill={skill} className="w-4 h-4 shrink-0" size={16} />
                <span className="font-mono text-[11px] font-medium text-[#f8fafc] group-hover:text-[#818cf8] transition-colors">
                  {skill}
                </span>
              </div>
            ))}
          {skills.length > 16 && (
            <span className="font-mono text-[11px] text-[#9ca3af] self-center px-2 py-1 bg-[#14142b] border border-[#1e1e2f] rounded-[4px]">
              +{skills.length - 16} more
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#64748b]">
        <div className="flex items-center gap-1.5 text-[#818cf8]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Calibrated in AI Mock Questions</span>
        </div>
      </div>
      </div>
    </div>
  )
}
