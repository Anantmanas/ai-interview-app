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
    return (
      <div className="rounded-3xl border border-[#8052ff]/40 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(128,82,255,0.15)] overflow-hidden">
        <div className="flex items-center justify-between px-6 sm:px-7 h-12 border-b border-white/10 bg-white/[0.02] select-none">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff] animate-pulse shadow-[0_0_8px_#8052ff]" />
            <span className="font-mono text-[11px] text-zinc-400 font-semibold tracking-wider uppercase truncate max-w-[280px]">
              {uploadingFileName || 'resume.pdf'} — PROCESSING
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#8052ff] bg-[#8052ff]/15 border border-[#8052ff]/30 px-3 py-0.5 rounded-full uppercase tracking-wider font-semibold animate-pulse">
            ANALYZING & STORING
          </span>
        </div>
        <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-3">
          <Spinner className="h-6 w-6 text-[#8052ff]" />
          <p className="font-mono text-xs text-[#8052ff] tracking-wide font-medium">
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
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all overflow-hidden font-sans">
      {/* Titlebar */}
      <div className="flex items-center justify-between px-6 sm:px-7 h-12 border-b border-white/10 bg-white/[0.02] select-none">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
          <span className="font-mono text-[11px] text-zinc-400 font-semibold tracking-wider uppercase">
            RESUME GROUNDING SOURCE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#15846e] bg-[#15846e]/20 border border-[#15846e]/40 px-3 py-0.5 rounded-full uppercase tracking-wider font-semibold">
            {storedResumes.length > 0 ? `${storedResumes.length} PROFILES STORED` : 'READY FOR UPLOAD'}
          </span>
        </div>
      </div>

      <div className="p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-4">
        {extractionError && (
          <p className="text-[#f43f5e] text-[11px] flex items-center gap-1.5 font-mono bg-[#f43f5e]/10 border border-[#f43f5e]/25 px-4 py-2 rounded-xl max-w-lg">
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

        <div className="p-4 rounded-2xl bg-[#8052ff]/10 border border-[#8052ff]/30 text-[#8052ff]">
          <Upload className="w-6 h-6" />
        </div>

        <div className="space-y-1.5 max-w-md">
          <h3 className="font-display text-xl sm:text-2xl font-normal text-white tracking-[-0.02em]">
            Upload Engineering Resume
          </h3>
          <p className="font-sans text-xs sm:text-sm text-zinc-400 font-light">
            Upload any resume to parse skills, system scale, and calibrate AI interview simulation vectors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-dala-primary inline-flex items-center gap-2 px-6 py-2.5 cursor-pointer hover:scale-[1.02] transition-all"
        >
          <Sparkles className="w-4 h-4 text-[#ffb829]" />
          <span>Select Document (PDF / DOCX / TXT)</span>
        </button>

        <p className="font-mono text-[10px] text-zinc-500 tracking-wider">
          Powered by UploadThing Storage • Up to 10MB • AES-256 Encrypted
        </p>
      </div>
    </div>
  )
}

