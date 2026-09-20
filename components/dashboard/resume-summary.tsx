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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2b292d] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#71d083] led-pulse" />
          <p className="font-mono text-[11px] text-[#71d083] uppercase tracking-[0.1em] font-semibold">
            RESUME GROUNDING ACTIVE
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#7c7a85]">
          <FileText className="w-3.5 h-3.5 text-[#71d083]" />
          <span>{resumeMeta?.fileName ? `Source: ${resumeMeta.fileName}` : 'Source: Linked Resume'}</span>
        </div>
      </div>

      {resumeData.name && (
        <div className="text-xs text-[#b5b2bc]">
          Candidate: <strong className="text-[#eeeef0] font-medium">{resumeData.name}</strong> • Target: <span className="text-[#71d083]">{resumeData.targetRole || 'Software Engineer'}</span>
        </div>
      )}

      {/* Skills with Original Official Brand SVGs */}
      <div>
        <p className="font-mono text-[10px] uppercase text-[#7c7a85] tracking-[0.1em] mb-2 font-semibold">
          EXTRACTED TECHNICAL STACK
        </p>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 16).map((skill) => (
            <div
              key={skill}
              className="group inline-flex items-center gap-2 bg-[#1a191b] hover:bg-[#232225] border border-[#2b292d] hover:border-[#366740] rounded-[6px] px-3 py-1.5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            >
              <SkillIcon skill={skill} className="w-4 h-4 shrink-0" size={16} />
              <span className="font-mono text-[11px] font-medium text-[#eeeef0] group-hover:text-[#71d083] transition-colors">
                {skill}
              </span>
            </div>
          ))}
          {skills.length > 16 && (
            <span className="font-mono text-[11px] text-[#948bb0] self-center px-2 py-1 bg-[#140e24] border border-[#291a45] rounded-[4px]">
              +{skills.length - 16} more
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#948bb0]">
        <div className="flex items-center gap-1.5 text-[#c084fc]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Calibrated in AI Mock Questions</span>
        </div>
      </div>
    </div>
  )
}
