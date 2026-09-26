'use client'

import { useState } from 'react'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import {
  CheckCircle2,
  Trash2,
  Check,
  FileText,
  AlertTriangle,
  X,
  Sparkles,
  Layers,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Calendar
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export default function ResumePage() {
  const {
    storedResumes,
    activeResumeId,
    deleteResume,
    activateResume,
    isLimitReached,
    limitModalOpen,
    setLimitModalOpen,
  } = useResume()

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteResume(id)
      setConfirmDeleteId(null)
      if (limitModalOpen && storedResumes.length <= 2) {
        setLimitModalOpen(false)
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleActivate = async (id: string) => {
    setActivatingId(id)
    try {
      await activateResume(id)
    } finally {
      setActivatingId(null)
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2030] pb-6">
        <div>
          <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">
            // GROUNDING ASSETS & STORAGE
          </p>
          <h1 className="font-display text-[28px] sm:text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">
            Resume Management
          </h1>
          <p className="font-body text-[13px] sm:text-[14px] text-[#9ca3af] mt-1">
            Store up to 2 resumes. Select your active resume to ground AI mock interviews and test questions.
          </p>
        </div>

        {/* Capacity Indicator Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-[#0d0e17] border border-[#1e2030] px-3.5 py-2 rounded-xl">
          <Layers className="w-4 h-4 text-[#818cf8]" />
          <div className="text-xs font-mono">
            <span className="text-[#64748b]">STORAGE SLOTS: </span>
            <span className={storedResumes.length >= 2 ? 'text-[#f59e0b] font-bold' : 'text-[#22c55e] font-bold'}>
              {storedResumes.length} / 2
            </span>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div>
        <ResumeDropzone source="dashboard" />
      </div>

      {/* Resumes List Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-white">Stored Documents</h2>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-[#14142b] border border-[#3730a3]/50 text-[#818cf8]">
              {storedResumes.length} of 2
            </span>
          </div>
          {isLimitReached && (
            <span className="font-mono text-[11px] text-[#f59e0b] flex items-center gap-1.5 bg-[#2a1a10] border border-[#5c3716] px-2.5 py-1 rounded-md">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Limit reached — remove 1 to add new</span>
            </span>
          )}
        </div>

        {storedResumes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#1e2030] bg-[#09090f]/50 p-8 text-center">
            <FileText className="w-8 h-8 text-[#475569] mx-auto mb-3" />
            <p className="font-mono text-sm text-[#94a3b8]">No resumes stored yet</p>
            <p className="font-body text-xs text-[#64748b] mt-1">
              Upload your first resume above to calibrate personalized AI interview questions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {storedResumes.map((resume, idx) => {
              const isActive = resume.isActive || resume.id === activeResumeId
              const data = resume.data
              const isDeleting = deletingId === resume.id || deletingId === resume.versionId
              const isActivating = activatingId === resume.id || activatingId === resume.versionId
              const isConfirmingDelete = confirmDeleteId === resume.id || confirmDeleteId === resume.versionId

              return (
                <div
                  key={resume.id || resume.versionId || idx}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isActive
                      ? 'border-[#4f46e5] bg-[#0a0a14] shadow-[0_0_30px_rgba(79,70,229,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]'
                      : 'border-[#1e2030] bg-[#09090f] hover:border-[#2b2d42]'
                  }`}
                >
                  {/* macOS Titlebar */}
                  <div className="flex items-center justify-between px-4 h-11 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
                    <div className="flex items-center gap-3">
                      <MacTrafficLights size="sm" />
                      <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide truncate max-w-[200px] sm:max-w-xs">
                        {resume.fileName || `resume_${idx + 1}.pdf`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <div className="flex items-center gap-1.5 bg-[#22c55e]/10 border border-[#22c55e]/30 px-2.5 py-0.5 rounded-full">
                          <span className="h-2 w-2 rounded-full bg-[#22c55e] led-pulse" />
                          <span className="font-mono text-[10px] text-[#22c55e] uppercase tracking-wider font-semibold">
                            ACTIVE GROUNDING
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-[#14142b] border border-[#1e2030] px-2.5 py-0.5 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#64748b]" />
                          <span className="font-mono text-[10px] text-[#94a3b8] uppercase tracking-wider font-medium">
                            STANDBY
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terminal Header Bar */}
                  <div className="px-5 py-2.5 border-b border-[#1e2030]/40 bg-[#0c0d15]/50 flex items-center justify-between gap-2 font-mono text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#38bdf8] font-semibold">sys@interviewai</span>
                      <span className="text-[#94a3b8]">:</span>
                      <span className="text-[#818cf8]">~/resumes/slot_{idx + 1}</span>
                      <span className="text-[#f8fafc]">$</span>
                      <span className="text-[#22c55e]">inspect --detailed</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#64748b]">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(resume.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-5">
                    {/* Meta summary grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-[#0c0d15] border border-[#1e2030] p-3.5 rounded-lg">
                      <div>
                        <span className="text-[#64748b] uppercase block text-[10px] mb-0.5 font-semibold">CANDIDATE</span>
                        <span className="text-white font-medium">{data?.name || resume.candidateName || 'Candidate Profile'}</span>
                      </div>
                      <div>
                        <span className="text-[#64748b] uppercase block text-[10px] mb-0.5 font-semibold">TARGET ROLE</span>
                        <span className="text-[#818cf8] font-medium">{data?.targetRole || resume.targetRole || 'Software Engineer'}</span>
                      </div>
                      <div>
                        <span className="text-[#64748b] uppercase block text-[10px] mb-0.5 font-semibold">SKILLS DETECTED</span>
                        <span className="text-[#22c55e] font-medium">{data?.skills?.length ?? 0} technologies</span>
                      </div>
                    </div>

                    {/* Summary (if present) */}
                    {data?.summary && (
                      <div className="text-xs text-[#9ca3af] bg-[#0d0d18] border border-[#1e1e30] p-3 rounded-lg leading-relaxed font-body">
                        <span className="font-mono text-[10px] uppercase text-[#818cf8] block mb-1 font-semibold">// PROFESSIONAL SUMMARY</span>
                        {data.summary}
                      </div>
                    )}

                    {/* Extracted Skills */}
                    <div>
                      <p className="font-mono text-[10px] uppercase text-[#64748b] tracking-[0.1em] mb-2.5 font-semibold">
                        TECHNICAL STACK ({data?.skills?.length ?? 0})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {data?.skills && data.skills.length > 0 ? (
                          data.skills.map((skill: string) => (
                            <div
                              key={skill}
                              className="group inline-flex items-center gap-1.5 bg-[#0c0d15] hover:bg-[#14142b] border border-[#1e2030] hover:border-[#3730a3] rounded-md px-2.5 py-1 transition-all"
                            >
                              <SkillIcon skill={skill} className="w-3.5 h-3.5 shrink-0" size={14} />
                              <span className="font-mono text-[11px] font-medium text-[#f8fafc] group-hover:text-[#818cf8] transition-colors">
                                {skill}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="font-mono text-[11px] text-[#64748b]">No technical skills extracted</span>
                        )}
                      </div>
                    </div>

                    {/* Experience & Education Highlights */}
                    {((data?.experience && data.experience.length > 0) || (data?.education && data.education.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1e2030]/60">
                        {data?.experience && data.experience.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="font-mono text-[10px] text-[#64748b] uppercase font-semibold flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-[#818cf8]" /> EXPERIENCE
                            </span>
                            <div className="space-y-1">
                              {data.experience.slice(0, 2).map((exp, eIdx) => (
                                <p key={eIdx} className="text-xs text-[#cbd5e1] font-mono truncate">
                                  • <strong className="text-white">{exp.role}</strong> at {exp.company}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {data?.education && data.education.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="font-mono text-[10px] text-[#64748b] uppercase font-semibold flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-[#22c55e]" /> EDUCATION
                            </span>
                            <div className="space-y-1">
                              {data.education.slice(0, 2).map((edu, edIdx) => (
                                <p key={edIdx} className="text-xs text-[#cbd5e1] font-mono truncate">
                                  • {edu}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions Toolbar */}
                    <div className="pt-3 border-t border-[#1e2030]/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#22c55e] bg-[#22c55e]/10 px-3 py-1.5 rounded-md border border-[#22c55e]/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Currently Grounding Mock Interviews</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivate(resume.id || resume.versionId || '')}
                            disabled={isActivating || isDeleting}
                            className="btn-neo-violet font-mono text-[11px] font-bold uppercase tracking-[0.05em] px-4 py-1.5 rounded-md cursor-pointer inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(79,70,229,0.25)] transition-all hover:scale-[1.02] disabled:opacity-50"
                          >
                            {isActivating ? <Spinner className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Use This Resume</span>
                          </button>
                        )}
                      </div>

                      {/* Delete / Remove with Confirmation */}
                      <div>
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-2 bg-[#2a0e15] border border-[#5c1d28] p-1.5 rounded-md">
                            <span className="font-mono text-[11px] text-[#f87171] px-1">Purge from DB & Storage?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(resume.id || resume.versionId || '')}
                              disabled={isDeleting}
                              className="font-mono text-[11px] bg-[#dc2626] hover:bg-[#b91c1c] text-white px-2.5 py-1 rounded cursor-pointer transition-colors"
                            >
                              {isDeleting ? <Spinner className="w-3 h-3" /> : 'Yes, Delete'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="font-mono text-[11px] text-[#9ca3af] hover:text-white px-2 py-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(resume.id || resume.versionId || '')}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#ef4444] hover:text-[#f87171] bg-[#1a0f14] hover:bg-[#26131b] border border-[#3f1922] hover:border-[#5c1d28] px-3 py-1.5 rounded-md transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Storage Limit Exceeded Popup Modal */}
      {limitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#f59e0b]/50 bg-[#0c0d17] shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
            {/* Modal Titlebar */}
            <div className="flex items-center justify-between px-5 h-12 border-b border-[#1e2030] bg-[#141524]">
              <div className="flex items-center gap-2.5 text-[#f59e0b]">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-display font-semibold text-sm text-white">Storage Slot Limit Reached (2 of 2)</span>
              </div>
              <button
                type="button"
                onClick={() => setLimitModalOpen(false)}
                className="text-[#9ca3af] hover:text-white p-1 rounded-md hover:bg-[#1f2038] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div className="p-3.5 rounded-xl bg-[#2a1a10] border border-[#5c3716] text-[#fcd34d] text-xs font-body leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#f59e0b] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1">Clean Storage Quota Enforcement</p>
                  To keep your storage footprint optimal and avoid exceeding usage limits, you can store up to <strong>2 resumes</strong>.
                  Please remove at least 1 previous resume to upload a new one.
                </div>
              </div>

              <div>
                <p className="font-mono text-[11px] uppercase text-[#64748b] tracking-wider mb-2.5 font-semibold">
                  CHOOSE A RESUME TO PURGE:
                </p>
                <div className="space-y-2.5">
                  {storedResumes.map((resume, idx) => (
                    <div
                      key={resume.id || idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#111222] border border-[#1e2030] hover:border-[#3730a3]"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-4 h-4 text-[#818cf8] shrink-0" />
                        <div className="truncate">
                          <p className="font-mono text-xs text-white font-medium truncate">{resume.fileName}</p>
                          <p className="font-mono text-[10px] text-[#9ca3af]">
                            {resume.data?.skills?.length ?? 0} skills • {resume.data?.targetRole || 'Software Engineer'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(resume.id || resume.versionId || '')}
                        disabled={deletingId === resume.id}
                        className="font-mono text-xs bg-[#dc2626] hover:bg-[#b91c1c] text-white px-3 py-1.5 rounded-md cursor-pointer inline-flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        {deletingId === resume.id ? <Spinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                        <span>Delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLimitModalOpen(false)}
                  className="font-mono text-xs text-[#9ca3af] hover:text-white bg-[#14142b] border border-[#1e2030] px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Close & Keep Existing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
