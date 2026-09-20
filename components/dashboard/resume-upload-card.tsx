'use client'

import { useRef } from 'react'
import { useResume } from '@/components/resume/resume-provider'
import { ResumeSummary } from './resume-summary'
import { Upload, RefreshCw, AlertCircle, Sparkles } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

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
          <div className="flex items-center justify-end px-1">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={(e) => void onPickFile(e.target.files?.[0])}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isExtracting}
              className="inline-flex items-center gap-2 font-mono text-[11px] text-[#7c7a85] hover:text-[#71d083] transition-colors py-1.5 px-3 rounded-[6px] hover:bg-[#1a191b] border border-transparent hover:border-[#2b292d] cursor-pointer"
            >
              {isExtracting ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 text-[#71d083]" />
              )}
              {isExtracting ? 'Analyzing Resume...' : 'Re-upload Resume'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card-console p-7 text-center border-dashed border-[#2d5736] hover:border-[#71d083] transition-all bg-gradient-to-b from-[#1a191b]/40 to-[#121113]">
          <div className="mx-auto p-3 rounded-[8px] bg-[#1a191b] border border-[#2d5736] w-fit mb-3.5 text-[#71d083] shadow-[0_0_15px_rgba(113,208,131,0.2)]">
            <Upload className="h-5 w-5" />
          </div>
          <h3 className="font-display text-[17px] font-semibold text-[#fdfcff] mb-1.5">
            Enhance Your Mock Interviews with Resume Grounding
          </h3>
          <p className="font-body text-[13px] text-[#948bb0] max-w-md mx-auto mb-6 leading-relaxed">
            Upload your resume to extract your tech stack and generate personalized questions tailored to your experience.
          </p>
          
          <div className="flex flex-col items-center">
            {extractionError && (
              <p className="text-[#f87171] text-[11px] mb-3.5 flex items-center gap-1.5 font-mono">
                <AlertCircle className="h-4 w-4" />
                {extractionError}
              </p>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={(e) => void onPickFile(e.target.files?.[0])}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isExtracting}
              className="btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-7 py-3 rounded-[6px] inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
            <p className="font-mono text-[10px] text-[#50446b] mt-3">
              Supports PDF, DOCX, TXT (Max 5MB)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
