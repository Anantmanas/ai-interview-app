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
    uploadingFileName,
    extractionError,
    handleResumeUpload,
    storedResumes,
  } = useResume()

  const onPickFile = async (file?: File) => {
    if (!file) return
    const success = await handleResumeUpload(file, source)
    if (success) {
      onSuccess?.()
    }
  }

  if (isExtracting) {
    const accentColor = source === 'onboarding' ? '#2447FF' : '#8052ff'
    return (
      <div
        className="rounded-2xl border bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ borderColor: `${accentColor}40` }}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 h-10 border-b border-white/10 bg-white/[0.02] select-none">
          <div className="flex items-center gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            <span className="font-mono text-[11px] text-zinc-400 font-semibold tracking-wider uppercase truncate max-w-[280px]">
              {uploadingFileName || 'resume.pdf'} — PROCESSING
            </span>
          </div>
          <span
            className="font-mono text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold animate-pulse"
            style={{
              color: accentColor,
              backgroundColor: `${accentColor}18`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            ANALYZING & STORING
          </span>
        </div>
        <div className="p-6 sm:p-7 flex flex-col items-center justify-center text-center space-y-2.5">
          <Spinner className="h-5 w-5" style={{ color: accentColor }} />
          <p className="font-mono text-xs tracking-wide font-medium" style={{ color: accentColor }}>
            Ingesting to Cloud Storage & extracting technical skills...
          </p>
          <p className="font-sans text-xs text-zinc-400 max-w-md font-light">
            Analyzing {uploadingFileName ? `"${uploadingFileName}"` : 'resume'} structure, engineering experience, and technical vectors.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all overflow-hidden font-sans">
      {/* Titlebar */}
      <div className="flex items-center justify-between px-5 sm:px-6 h-10 border-b border-white/10 bg-white/[0.02] select-none">
        <div className="flex items-center gap-2.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: source === 'onboarding' ? '#2447FF' : '#8052ff' }}
          />
          <span className="font-mono text-[11px] text-zinc-400 font-semibold tracking-wider uppercase">
            RESUME GROUNDING SOURCE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
              source === 'onboarding'
                ? 'text-[#2447FF] bg-[#2447FF]/10 border border-[#2447FF]/25'
                : 'text-[#15846e] bg-[#15846e]/20 border border-[#15846e]/40'
            }`}
          >
            {storedResumes.length > 0 ? `${storedResumes.length} PROFILES STORED` : 'READY FOR UPLOAD'}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 text-center flex flex-col items-center justify-center space-y-2.5">
        {extractionError && (
          <p className="text-[#f43f5e] text-[11px] flex items-center gap-1.5 font-mono bg-[#f43f5e]/10 border border-[#f43f5e]/25 px-3.5 py-1.5 rounded-xl max-w-lg">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
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

        <div
          className={`p-2.5 rounded-xl ${
            source === 'onboarding'
              ? 'bg-[#2447FF]/10 border border-[#2447FF]/30 text-[#2447FF]'
              : 'bg-[#8052ff]/10 border border-[#8052ff]/30 text-[#8052ff]'
          }`}
        >
          <Upload className="w-4 h-4" />
        </div>

        <div className="space-y-0.5 max-w-md">
          <h3 className="font-display text-base sm:text-lg font-normal text-white tracking-[-0.02em]">
            Upload Engineering Resume
          </h3>
          <p className="font-sans text-[11px] sm:text-xs text-zinc-400 font-light">
            Upload any resume to parse skills, system scale, and calibrate AI interview simulation vectors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={
            source === 'onboarding'
              ? 'inline-flex items-center gap-2 px-5 py-2 bg-[#2447FF] hover:bg-[#1d3ad4] text-white font-mono text-[11px] font-semibold uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-none'
              : 'btn-dala-primary inline-flex items-center gap-2 px-5 py-2 cursor-pointer hover:scale-[1.02] transition-all text-xs'
          }
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ffb829]" />
          <span>Select Document (PDF / DOCX / TXT)</span>
        </button>

        <p className="font-mono text-[9px] text-zinc-500 tracking-wider">
          Powered by UploadThing Storage • Up to 10MB • AES-256 Encrypted
        </p>
      </div>
    </div>
  )
}

