'use client'

import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { CheckCircle2, FileText } from 'lucide-react'

export function ResumeSummary() {
  const { resumeData, resumeMeta, isResumeReady } = useResume()

  if (!isResumeReady || !resumeData) {
    return null
  }

  const skills = resumeData.skills || []

  return (
    <div className="card-console-glow p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e1e2f] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#6366f1] led-pulse" />
          <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.1em] font-semibold">
            RESUME GROUNDING ACTIVE
          </p>
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

      {/* Skills with Original Official Brand SVGs */}
      <div>
        <p className="font-mono text-[10px] uppercase text-[#64748b] tracking-[0.1em] mb-2 font-semibold">
          EXTRACTED TECHNICAL STACK
        </p>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 16).map((skill) => (
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
  )
}
