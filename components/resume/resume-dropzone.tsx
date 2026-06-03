'use client'

import { useRef } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { useResume } from './resume-provider'
import type { ResumeMeta } from './resume-provider'

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
      <div className="rounded-lg border p-3">
        <div className="flex items-center gap-3">
          <span>Resume</span>
          <div>
            <p className="font-medium text-sm">{resumeMeta.fileName}</p>
            <p className="text-xs text-muted-foreground">
              Uploaded {new Date(resumeMeta.uploadedAt).toLocaleDateString()} {' - '}
              {resumeData?.skills?.length ?? 0} skills detected
            </p>
          </div>
          <button
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            onClick={replaceResume}
            type="button"
          >
            Replace
          </button>
        </div>
      </div>
    )
  }

  if (isExtracting) {
    return (
      <div className="flex items-center gap-2 p-4 border rounded-lg">
        <Spinner className="h-4 w-4" />
        <span className="text-sm">Analyzing your resume with AI...</span>
      </div>
    )
  }

  return (
    <div className="space-y-2 rounded-lg border border-dashed p-4">
      {extractionError && <p className="text-destructive text-sm">{extractionError}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        className="hidden"
        onChange={(e) => void onPickFile(e.target.files?.[0])}
      />
      <Button type="button" onClick={() => inputRef.current?.click()}>
        Upload Resume
      </Button>
    </div>
  )
}
