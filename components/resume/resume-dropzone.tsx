'use client'

import { useRef } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useResume } from './resume-provider'
import type { ResumeMeta } from './resume-provider'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import { FileText, Upload, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react'

interface ResumeDropzoneProps {
  source: ResumeMeta['source']
  onSuccess?: () => void
}

export function ResumeDropzone({ source, onSuccess }: ResumeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const {
    isExtracting,
    extractionError,
    handleResumeUpload,
    isLimitReached,
    storedResumes,
    setLimitModalOpen,
  } = useResume()

  const onPickFile = async (file?: File) => {
    if (!file) return
    if (isLimitReached) {
      setLimitModalOpen(true)
      return
    }
    const success = await handleResumeUpload(file, source)
    if (success) {
      onSuccess?.()
    }
  }

  if (isExtracting) {
    return (
      <div className="rounded-xl border border-[#3730a3]/60 bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
          <div className="flex items-center gap-3">
            <MacTrafficLights size="sm" />
            <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
              parsing-resume.bin — active
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            ANALYZING
          </span>
        </div>
        <div className="p-6 flex items-center gap-3 font-mono text-xs text-[#818cf8]">
          <Spinner className="h-4 w-4 shrink-0" />
          <span>Analyzing resume structure, extracting technical skills, experience and projects...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0D0D0D] shadow-xl overflow-hidden">
      {/* Editorial Header */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-[#2447FF]" />
          <span className="font-mono text-xs text-[#8C8C88] font-medium tracking-wide">
            RESUME GROUNDING SOURCE
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLimitReached ? (
            <span className="font-mono text-[10px] text-[#f43f5e] bg-[#f43f5e]/10 border border-[#f43f5e]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 inline" /> 2/2 SLOTS USED
            </span>
          ) : (
            <span className="font-mono text-[10px] text-[#34d399] bg-[#34d399]/10 border border-[#34d399]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {Math.max(0, 2 - storedResumes.length)}/2 SLOTS AVAILABLE
            </span>
          )}
        </div>
      </div>

      <div className="p-7 sm:p-8 text-center flex flex-col items-center justify-center space-y-4">
        {extractionError && (
          <p className="text-[#f87171] text-[11px] flex items-center gap-1.5 font-mono bg-[#2a0e15] border border-[#5c1d28] px-3 py-1.5 rounded-md max-w-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{extractionError}</span>
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            void onPickFile(f)
          }}
        />

        <div className="p-3 rounded-xl bg-[#14142b] border border-[#3730a3] text-[#818cf8] shadow-[0_0_20px_rgba(79,70,229,0.3)]">
          <Upload className="w-6 h-6" />
        </div>

        <div className="space-y-1 max-w-md">
          <h3 className="font-display text-base font-semibold text-white">
            {isLimitReached ? 'Storage Slots Full (2 of 2)' : 'Upload a Resume Document'}
          </h3>
          <p className="font-body text-xs text-[#9ca3af]">
            {isLimitReached
              ? 'You have reached the maximum 2 stored resumes. Please remove at least 1 previous resume to upload a new one.'
              : 'Select a PDF or text document to extract skills, experience and target roles for AI interviews.'}
          </p>
        </div>

        {isLimitReached ? (
          <button
            type="button"
            onClick={() => setLimitModalOpen(true)}
            className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-2.5 rounded-md cursor-pointer inline-flex items-center gap-2 bg-[#2a1a10] hover:bg-[#3d2415] text-[#f59e0b] border border-[#f59e0b]/40 shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Slot Limit Reached (2/2) — Manage List</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-2.5 rounded-md cursor-pointer inline-flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Select Document</span>
          </button>
        )}
      </div>
    </div>
  )
}

