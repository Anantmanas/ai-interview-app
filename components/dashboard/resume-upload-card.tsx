'use client'

import { useRef } from 'react'
import { useResume } from '@/components/resume/resume-provider'
import { ResumeSummary } from './resume-summary'
import { Upload, RefreshCw, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

// ─── Skeleton shimmer ────────────────────────────────────────────────────────

function SkeletonLine({ width = 'w-full', height = 'h-3' }: { width?: string; height?: string }) {
  return (
    <div className={`${height} ${width} bg-white/[0.07] rounded-full animate-pulse`} />
  )
}

function ResumeSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] overflow-hidden shadow-xl">
      {/* Fake titlebar */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2447FF] animate-pulse" />
          <SkeletonLine width="w-44" height="h-2.5" />
        </div>
        <SkeletonLine width="w-24" height="h-5" />
      </div>

      <div className="p-6 space-y-5">
        {/* Candidate name + role */}
        <div className="flex items-center gap-3">
          <SkeletonLine width="w-10" height="h-2.5" />
          <SkeletonLine width="w-28" height="h-4" />
          <SkeletonLine width="w-8" height="h-2.5" />
          <SkeletonLine width="w-36" height="h-3" />
        </div>

        {/* Summary block */}
        <div className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-2.5">
          <SkeletonLine width="w-full" height="h-3" />
          <SkeletonLine width="w-5/6" height="h-3" />
          <SkeletonLine width="w-3/4" height="h-3" />
        </div>

        {/* Skills label */}
        <SkeletonLine width="w-56" height="h-2.5" />

        {/* Skill chips */}
        <div className="flex flex-wrap gap-2">
          {[80, 100, 72, 90, 64, 88].map((w, i) => (
            <div
              key={i}
              className="h-8 rounded-lg bg-white/[0.06] animate-pulse"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        {/* Footer status */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-2">
          <Spinner className="h-4 w-4 text-[#2447FF]" />
          <span className="font-mono text-[11px] text-[#2447FF] uppercase tracking-wider animate-pulse">
            Analyzing resume with AI...
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ResumeUploadCard() {
  const { isResumeReady, isExtracting, handleResumeUpload, extractionError } = useResume()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const onPickFile = async (file?: File) => {
    if (!file) return
    await handleResumeUpload(file, 'dashboard')
  }

  // While processing a re-upload, show skeleton
  if (isExtracting) {
    return (
      <div className="mb-6">
        <ResumeSkeleton />
      </div>
    )
  }

  return (
    <div className="mb-6">
      {isResumeReady ? (
        <div className="space-y-3">
          <ResumeSummary />
          {extractionError && (
            <p className="text-[#f43f5e] text-[11px] flex items-center gap-1.5 font-mono bg-[#2a0e15] border border-[#5c1d28] px-3.5 py-2 rounded-lg">
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
              className="inline-flex items-center gap-2 font-mono text-[11px] text-[#94a3b8] hover:text-[#60a5fa] transition-colors py-1.5 px-3 rounded-lg hover:bg-[#0a1226] border border-[#142347] hover:border-[#1e3a8a] cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#3b82f6]" />
              Re-upload Resume
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] overflow-hidden transition-all duration-200 shadow-xl">
          {/* Header Row */}
          <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/[0.02] select-none">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2447FF]" />
              <span className="font-mono text-[11px] text-[#8C8C88] font-semibold tracking-wider uppercase">
                RESUME GROUNDING
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#8C8C88] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                STANDBY
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 sm:p-10 text-center">
            <div className="mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 w-fit mb-5 text-[#2447FF]">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-display text-[22px] sm:text-[24px] font-bold text-[#F4F2EC] mb-2 tracking-tight">
              Calibrate with Resume Grounding
            </h3>
            <p className="font-body text-[14px] text-[#8C8C88] max-w-lg mx-auto mb-6 leading-relaxed">
              Upload your engineering resume to extract your tech stack, system scale, and projects.
              The AI interviewer will adapt questions directly to your career experience.
            </p>

            <div className="flex flex-col items-center">
              {extractionError && (
                <p className="text-[#f43f5e] text-[11px] mb-4 flex items-center gap-1.5 font-mono bg-[#f43f5e]/10 border border-[#f43f5e]/20 px-3.5 py-2 rounded-lg">
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
                className="bg-[#2447FF] hover:bg-[#1f3ce0] text-white font-mono text-[12px] font-semibold uppercase tracking-wider px-8 py-3.5 rounded-xl inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md"
              >
                <Sparkles className="h-4 w-4" />
                <span>Upload Resume PDF / DOCX</span>
              </button>
              <p className="font-mono text-[10px] text-[#8C8C88] mt-3 tracking-wider">
                Supports PDF, DOCX, TXT (Maximum 5MB) • Encrypted & Isolated
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

