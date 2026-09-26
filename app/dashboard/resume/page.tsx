'use client'

import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import { CheckCircle2 } from 'lucide-react'

export default function ResumePage() {
  const { resumeData, resumeMeta, isResumeReady } = useResume()

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">// GROUNDING ASSETS</p>
        <h1 className="font-display text-[28px] sm:text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">Resume Management</h1>
        <p className="font-body text-[13px] sm:text-[14px] text-[#9ca3af] mt-1">Manage your stored resume to ground personalized mock interviews.</p>
      </div>

      <ResumeDropzone source="dashboard" />

      {isResumeReady && (
        <div className="rounded-xl border border-[#3730a3] bg-[#09090f] shadow-[0_0_30px_rgba(79,70,229,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
          {/* macOS Titlebar */}
          <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
            <div className="flex items-center gap-3">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                grounding-assets.json — zsh
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#6366f1] led-pulse" />
              <span className="font-mono text-[10px] text-[#818cf8] uppercase tracking-wider font-semibold">
                ACTIVE GROUNDING
              </span>
            </div>
          </div>

          {/* Terminal Command Line Cue */}
          <div className="px-5 py-2.5 border-b border-[#1e2030]/40 bg-[#0c0d15]/50 flex items-center gap-2 font-mono text-[12px]">
            <span className="text-[#38bdf8] font-semibold">sys@interviewai</span>
            <span className="text-[#94a3b8]">:</span>
            <span className="text-[#818cf8]">~/grounding</span>
            <span className="text-[#f8fafc]">$</span>
            <span className="text-[#22c55e]">cat skills.manifest</span>
          </div>

          <div className="p-6 space-y-5">
            {/* Meta details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-[#0c0d15] border border-[#1e2030] p-3.5 rounded-lg">
              <div>
                <span className="text-[#64748b] uppercase block text-[10px] mb-0.5">SOURCE FILE</span>
                <span className="text-white font-medium">{resumeMeta?.fileName || 'resume.pdf'}</span>
              </div>
              <div>
                <span className="text-[#64748b] uppercase block text-[10px] mb-0.5">CANDIDATE</span>
                <span className="text-[#818cf8] font-medium">{resumeData?.name || 'Candidate'}</span>
              </div>
              {resumeData?.targetRole && (
                <div className="sm:col-span-2 pt-2 border-t border-[#1e2030]/60">
                  <span className="text-[#64748b] uppercase block text-[10px] mb-0.5">TARGET ROLE</span>
                  <span className="text-white">{resumeData.targetRole}</span>
                </div>
              )}
            </div>

            {/* Extracted Skills with Brand SVGs */}
            <div>
              <p className="font-mono text-[10px] uppercase text-[#64748b] tracking-[0.1em] mb-2.5 font-semibold">
                EXTRACTED TECHNICAL STACK ({resumeData?.skills?.length ?? 0})
              </p>
              <div className="flex flex-wrap gap-2">
                {resumeData?.skills?.map((skill: string) => (
                  <div
                    key={skill}
                    className="group inline-flex items-center gap-2 bg-[#0c0d15] hover:bg-[#14142b] border border-[#1e2030] hover:border-[#3730a3] rounded-md px-3 py-1.5 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  >
                    <SkillIcon skill={skill} className="w-4 h-4 shrink-0" size={16} />
                    <span className="font-mono text-[11px] font-medium text-[#f8fafc] group-hover:text-[#818cf8] transition-colors">
                      {skill}
                    </span>
                  </div>
                )) || <span className="font-mono text-[11px] text-[#64748b]">No skills extracted yet</span>}
              </div>
            </div>

            <div className="pt-2 border-t border-[#1e2030]/60 flex items-center justify-between text-[11px] font-mono text-[#64748b]">
              <div className="flex items-center gap-1.5 text-[#22c55e]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Calibrated in Gemini AI Mock Questions</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
