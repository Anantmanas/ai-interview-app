'use client'

import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'

export default function ResumePage() {
  const { resumeData, resumeMeta, isResumeReady } = useResume()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">// GROUNDING ASSETS</p>
        <h1 className="font-display text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">Resume Management</h1>
        <p className="font-body text-[14px] text-[#9ca3af] mt-1">Manage your stored resume to ground personalized mock interviews.</p>
      </div>

      <ResumeDropzone source="dashboard" />

      {isResumeReady && (
        <div className="card-console-glow p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-[#6366f1] led-pulse" />
            <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.1em] font-semibold">STORED RESUME GROUNDING</p>
          </div>
          <p className="font-body text-[13px] text-white"><strong className="font-mono text-[11px] text-[#9ca3af] uppercase">File:</strong> {resumeMeta?.fileName}</p>
          <p className="font-body text-[13px] text-white"><strong className="font-mono text-[11px] text-[#9ca3af] uppercase">Candidate:</strong> {resumeData?.name || 'N/A'}</p>
          <div>
            <p className="font-mono text-[11px] text-[#9ca3af] uppercase mb-2 font-semibold">Extracted Skills:</p>
            <div className="flex flex-wrap gap-2">
              {resumeData?.skills?.map((skill: string) => (
                <div
                  key={skill}
                  className="inline-flex items-center gap-2 bg-[#000000] hover:bg-[#09090e] border border-[#1e1e2f] hover:border-[#3730a3] rounded-[6px] px-3 py-1.5 transition-all"
                >
                  <SkillIcon skill={skill} className="w-4 h-4 shrink-0" size={16} />
                  <span className="font-mono text-[11px] text-white">{skill}</span>
                </div>
              )) || <span className="font-mono text-[11px] text-[#64748b]">N/A</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
