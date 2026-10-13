'use client'

import { useState } from 'react'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { useResume } from '@/components/resume/resume-provider'
import { SkillIcon } from '@/components/resume/skill-icon'
import { ATSMatcherCard } from '@/components/resume/ats-matcher-card'
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
import { resolveCandidateName } from '@/lib/resume/name-utils'

export default function ResumePage() {
  const {
    storedResumes,
    activeResumeId,
    deleteResume,
    activateResume,
  } = useResume()

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteResume(id)
      setConfirmDeleteId(null)
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
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-8 pb-32 sm:pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="font-mono text-[11px] text-[#8052ff] uppercase tracking-[0.18em] mb-1 font-semibold">
            // GROUNDING ASSETS & STORAGE
          </p>
          <h1 className="font-display text-[28px] sm:text-[34px] font-normal text-white leading-[1.1] tracking-[-0.03em]">
            Resume Management
          </h1>
          <p className="font-sans text-[13px] sm:text-[14px] text-zinc-400 mt-1 font-light">
            Store and manage your engineering resumes. Select your active resume to ground AI mock interviews and test questions.
          </p>
        </div>

        {/* Profiles Count Indicator Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-white/[0.03] border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-xl">
          <Layers className="w-4 h-4 text-[#8052ff]" />
          <div className="text-xs font-mono">
            <span className="text-zinc-500 uppercase">STORED PROFILES: </span>
            <span className="text-[#8052ff] font-bold">
              {storedResumes.length}
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
            <h2 className="font-display text-lg font-normal text-white">Stored Documents</h2>
            <span className="font-mono text-xs px-3 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-semibold">
              {storedResumes.length} {storedResumes.length === 1 ? 'profile' : 'profiles'}
            </span>
          </div>
        </div>

        {storedResumes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <FileText className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
            <p className="font-mono text-sm text-zinc-300">No resumes stored yet</p>
            <p className="font-sans text-xs text-zinc-500 mt-1 font-light">
              Upload your engineering resume above to calibrate personalized AI interview questions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {storedResumes.map((resume, idx) => {
              const isActive = resume.isActive || resume.id === activeResumeId
              const data = resume.data
              const isDeleting = deletingId === resume.id || deletingId === resume.versionId
              const isActivating = activatingId === resume.id || activatingId === resume.versionId
              const isConfirmingDelete = confirmDeleteId === resume.id || confirmDeleteId === resume.versionId
              const candidateDisplayName = resolveCandidateName({
                name: data?.name || resume.candidateName,
                fileName: resume.fileName,
              })

              return (
                <div
                  key={resume.id || resume.versionId || idx}
                  className={`rounded-3xl border transition-all overflow-hidden font-sans ${
                    isActive
                      ? 'border-[#8052ff]/50 bg-white/[0.04] backdrop-blur-2xl shadow-[0_20px_60px_rgba(128,82,255,0.12)]'
                      : 'border-white/10 bg-white/[0.03] backdrop-blur-2xl hover:border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {/* Titlebar */}
                  <div className="flex items-center justify-between px-6 sm:px-7 h-12 border-b border-white/10 bg-white/[0.02] select-none">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#8052ff] shadow-[0_0_8px_#8052ff]' : 'bg-zinc-500'}`} />
                      <span className="font-mono text-[11px] text-zinc-300 font-medium tracking-wide truncate max-w-[200px] sm:max-w-xs">
                        {resume.fileName || `resume_${idx + 1}.pdf`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <div className="flex items-center gap-1.5 bg-[#15846e]/20 border border-[#15846e]/40 px-3 py-0.5 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#15846e] shadow-[0_0_6px_#15846e]" />
                          <span className="font-mono text-[10px] text-[#15846e] uppercase tracking-wider font-semibold">
                            ACTIVE GROUNDING
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-0.5 rounded-full">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                            STANDBY
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Header Sub-bar */}
                  <div className="px-6 sm:px-7 py-2.5 border-b border-white/10 bg-white/[0.01] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[#8052ff] font-semibold">DOC // #{String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-zinc-400 truncate max-w-[220px]">{resume.fileName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 shrink-0">
                      <Calendar className="w-3 h-3 text-[#8052ff]" />
                      <span>{new Date(resume.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 space-y-5">
                    {/* Meta summary grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-white/[0.02] border border-white/10 p-4 rounded-2xl">
                      <div>
                        <span className="text-white/40 uppercase block text-[10px] mb-1 font-semibold tracking-wider">CANDIDATE</span>
                        <span className="text-white font-medium text-sm font-sans">{candidateDisplayName}</span>
                      </div>
                      <div>
                        <span className="text-white/40 uppercase block text-[10px] mb-1 font-semibold tracking-wider">TARGET ROLE</span>
                        <span className="text-[#8052ff] font-medium">{data?.targetRole || resume.targetRole || 'Software Engineer'}</span>
                      </div>
                      <div>
                        <span className="text-white/40 uppercase block text-[10px] mb-1 font-semibold tracking-wider">SKILLS DETECTED</span>
                        <span className="text-[#15846e] font-medium">{data?.skills?.length ?? 0} technologies</span>
                      </div>
                    </div>

                    {/* Summary (if present) */}
                    {data?.summary && (
                      <div className="text-xs text-zinc-300 bg-white/[0.02] border border-white/10 p-4 rounded-2xl leading-relaxed font-sans">
                        <span className="font-mono text-[10px] uppercase text-[#8052ff] block mb-1.5 font-semibold tracking-wider">// PROFESSIONAL SUMMARY</span>
                        {data.summary}
                      </div>
                    )}

                    {/* Extracted Skills */}
                    <div>
                      <p className="font-mono text-[10px] uppercase text-white/50 tracking-[0.16em] mb-2.5 font-semibold">
                        TECHNICAL STACK ({data?.skills?.length ?? 0})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {data?.skills && data.skills.length > 0 ? (
                          data.skills.map((skill: string) => (
                            <div
                              key={skill}
                              className="group inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#8052ff]/40 rounded-full px-3 py-1.5 transition-all shadow-sm"
                            >
                              <SkillIcon skill={skill} className="w-3.5 h-3.5 shrink-0" size={14} />
                              <span className="font-mono text-[11px] font-medium text-white group-hover:text-[#8052ff] transition-colors">
                                {skill}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="font-mono text-[11px] text-zinc-500">No technical skills extracted</span>
                        )}
                      </div>
                    </div>

                    {/* Experience & Education Highlights */}
                    {((data?.experience && data.experience.length > 0) || (data?.education && data.education.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        {data?.experience && data.experience.length > 0 && (
                          <div className="space-y-2">
                            <span className="font-mono text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1.5 tracking-wider">
                              <Briefcase className="w-3 h-3 text-[#8052ff]" /> EXPERIENCE
                            </span>
                            <div className="space-y-1.5">
                              {data.experience.slice(0, 2).map((exp, eIdx) => (
                                <p key={eIdx} className="text-xs text-zinc-300 font-mono truncate">
                                  • <strong className="text-white">{exp.role}</strong> at {exp.company}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {data?.education && data.education.length > 0 && (
                          <div className="space-y-2">
                            <span className="font-mono text-[10px] text-white/50 uppercase font-semibold flex items-center gap-1.5 tracking-wider">
                              <GraduationCap className="w-3 h-3 text-[#15846e]" /> EDUCATION
                            </span>
                            <div className="space-y-1.5">
                              {data.education.slice(0, 2).map((edu, edIdx) => (
                                <p key={edIdx} className="text-xs text-zinc-300 font-mono truncate">
                                  • {edu}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions Toolbar */}
                    <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#15846e] bg-[#15846e]/15 px-3.5 py-1.5 rounded-full border border-[#15846e]/30 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Currently Grounding Mock Interviews</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivate(resume.id || resume.versionId || '')}
                            disabled={isActivating || isDeleting}
                            className="btn-dala-primary inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider px-5 py-2 rounded-full cursor-pointer shadow-[0_0_20px_rgba(128,82,255,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50"
                          >
                            {isActivating ? <Spinner className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Use This Resume</span>
                          </button>
                        )}
                      </div>

                      {/* Delete / Remove with Confirmation */}
                      <div>
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-2 bg-[#f43f5e]/10 border border-[#f43f5e]/30 p-1.5 rounded-full">
                            <span className="font-mono text-[11px] text-[#f43f5e] px-2">Purge document?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(resume.id || resume.versionId || '')}
                              disabled={isDeleting}
                              className="font-mono text-[11px] bg-[#f43f5e] hover:bg-[#e11d48] text-white px-3 py-1 rounded-full cursor-pointer transition-colors"
                            >
                              {isDeleting ? <Spinner className="w-3 h-3" /> : 'Yes, Delete'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="font-mono text-[11px] text-zinc-400 hover:text-white px-2 py-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(resume.id || resume.versionId || '')}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#f43f5e] hover:text-white bg-[#f43f5e]/10 hover:bg-[#f43f5e]/20 border border-[#f43f5e]/20 hover:border-[#f43f5e]/40 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
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

      {/* Target Job Description ATS Matcher */}
      <ATSMatcherCard />
    </div>
  )
}
