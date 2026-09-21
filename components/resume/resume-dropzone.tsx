'use client'

import { useRef } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useResume } from './resume-provider'
import type { ResumeMeta } from './resume-provider'
import { MacTrafficLights } from '@/components/ui/terminal-card'
import { FileText, RefreshCw, Upload, AlertCircle } from 'lucide-react'

interface ResumeDropzoneProps {
  source: ResumeMeta['source']
  onSuccess?: () => void
}

export function ResumeDropzone({ source, onSuccess }: ResumeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const {
    resumeData,
    resumeMeta,
    isResumeReady,
    isExtracting,
    extractionError,
    handleResumeUpload,
    replaceResume,
  } = useResume()

  const onPickFile = async (file?: File) => {
    if (!file) return
    await handleResumeUpload(file, source)
    onSuccess?.()
  }

  if (isResumeReady && resumeMeta) {
    return (
      <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
        {/* macOS Titlebar */}
        <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
          <div className="flex items-center gap-3">
            <MacTrafficLights size="sm" />
            <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
              stored-resume.manifest — zsh
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22c55e] led-pulse" />
            <span className="font-mono text-[10px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              GROUNDED
            </span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#14142b] border border-[#3730a3]/60 text-[#818cf8] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono text-sm font-semibold text-white">{resumeMeta.fileName}</p>
              <p className="font-mono text-xs text-[#9ca3af] mt-0.5">
                Uploaded {new Date(resumeMeta.uploadedAt).toLocaleDateString()} • <span className="text-[#818cf8]">{resumeData?.skills?.length ?? 0} skills detected</span>
              </p>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#9ca3af] hover:text-white bg-[#14142b]/60 hover:bg-[#1a1b35] border border-[#1e2030] hover:border-[#3730a3] px-3.5 py-1.5 rounded-md transition-all cursor-pointer self-start sm:self-auto"
            onClick={replaceResume}
            type="button"
          >
            <RefreshCw className="w-3 h-3 text-[#818cf8]" />
            <span>Replace File</span>
          </button>
        </div>
      </div>
    )
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
          <span>Analyzing resume structure, extracting technical skills and experience levels...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
      {/* macOS Titlebar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
        <div className="flex items-center gap-3">
          <MacTrafficLights size="sm" />
          <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
            upload-resume.sh — bash
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
          READY
        </span>
      </div>

      {/* Terminal Command Cue */}
      <div className="px-5 py-2.5 border-b border-[#1e2030]/40 bg-[#0c0d15]/50 flex items-center gap-2 font-mono text-[12px]">
        <span className="text-[#38bdf8] font-semibold">engineer@interviewai</span>
        <span className="text-[#94a3b8]">:</span>
        <span className="text-[#818cf8]">~/resume</span>
        <span className="text-[#f8fafc]">$</span>
        <span className="text-[#22c55e]">upload --extract-skills</span>
      </div>

      <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
        {extractionError && (
          <p className="text-[#f87171] text-[11px] flex items-center gap-1.5 font-mono bg-[#2a0e15] border border-[#5c1d28] px-3 py-1.5 rounded-md">
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
          <h3 className="font-display text-base font-semibold text-white">Upload Your Resume</h3>
          <p className="font-body text-xs text-[#9ca3af]">
            Select a PDF or text document to ground mock interviews in your real technical achievements.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-2.5 rounded-md cursor-pointer inline-flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02]"
        >
          <Upload className="w-4 h-4" />
          <span>Select Document</span>
        </button>
      </div>
    </div>
  )
}
