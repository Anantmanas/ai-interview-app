'use client'

import { useRef } from 'react'
import { useResume } from '@/components/resume/resume-provider'
import { ResumeSummary } from './resume-summary'
import { Upload, RefreshCw, AlertCircle, Sparkles } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

import { TerminalCard, TerminalHeader, TerminalPrompt, MacTrafficLights } from '@/components/ui/terminal-card'

export function ResumeUploadCard() {
  const { isResumeReady, isExtracting, handleResumeUpload, extractionError } = useResume()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const onPickFile = async (file?: File) => {
    if (!file) return
    await handleResumeUpload(file, 'dashboard')
  }

  return (
    <div className="mb-6">
      {isResumeReady ? (
        <div className="space-y-3">
          <ResumeSummary />
          {extractionError && (
            <p className="text-[#f87171] text-[11px] flex items-center gap-1.5 font-mono bg-[#2a0e15] border border-[#5c1d28] px-3 py-1.5 rounded-md">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{extractionError}</span>
            </p>
          )}
          <div className="flex items-center justify-end px-1">
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
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isExtracting}
              className="inline-flex items-center gap-2 font-mono text-[11px] text-[#9ca3af] hover:text-[#818cf8] transition-colors py-1.5 px-3 rounded-md hover:bg-[#14142b] border border-[#1e2030] hover:border-[#3730a3]/50 cursor-pointer"
            >
              {isExtracting ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 text-[#818cf8]" />
              )}
              {isExtracting ? 'Analyzing Resume...' : 'Re-upload Resume'}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-200 hover:border-[#2b2d42]">
          {/* Apple Terminal Titlebar */}
          <div className="flex items-center justify-between px-4 h-10 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
            <div className="flex items-center gap-3">
              <MacTrafficLights size="sm" />
              <span className="font-mono text-[11px] text-[#9ca3af] font-medium tracking-wide">
                interviewai-terminal — bash
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                READY
              </span>
            </div>
          </div>

          {/* Terminal Command Line Cue */}
          <div className="px-6 pt-5 pb-2 border-b border-[#1e2030]/40 bg-[#0c0d15]/50">
            <div className="flex items-center gap-2 font-mono text-[12px]">
              <span className="text-[#38bdf8] font-semibold">engineer@interviewai</span>
              <span className="text-[#94a3b8]">:</span>
              <span className="text-[#818cf8]">~/resume</span>
              <span className="text-[#f8fafc]">$</span>
              <span className="text-[#22c55e] font-semibold">upload --extract-grounding --ai</span>
              <span className="inline-block w-2 h-4 bg-[#f8fafc] animate-pulse ml-1" />
            </div>
          </div>

          {/* Terminal Box Body */}
          <div className="p-7 sm:p-8 text-center bg-gradient-to-b from-transparent to-[#050508]/60">
            <div className="mx-auto p-3.5 rounded-xl bg-[#14142b] border border-[#3730a3] w-fit mb-4 text-[#818cf8] shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              <Upload className="h-5 w-5" />
            </div>
            <h3 className="font-display text-[18px] sm:text-[20px] font-semibold text-[#ffffff] mb-2 tracking-[-0.01em]">
              Enhance Your Mock Interviews with Resume Grounding
            </h3>
            <p className="font-body text-[13px] sm:text-[14px] text-[#9ca3af] max-w-lg mx-auto mb-6 leading-relaxed">
              Upload your resume to extract your tech stack and generate personalized, real-world questions tailored to your experience.
            </p>
            
            <div className="flex flex-col items-center">
              {extractionError && (
                <p className="text-[#f87171] text-[11px] mb-3.5 flex items-center gap-1.5 font-mono bg-[#2a0e15] border border-[#5c1d28] px-3 py-1.5 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  {extractionError}
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
              <button
                onClick={() => inputRef.current?.click()}
                disabled={isExtracting}
                className="btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-8 py-3.5 rounded-lg inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.02]"
              >
                {isExtracting ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    <span>Analyzing Resume Stack...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Upload Resume</span>
                  </>
                )}
              </button>
              <p className="font-mono text-[10px] text-[#64748b] mt-3 tracking-wider">
                Supports PDF, DOCX, TXT (Max 5MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
