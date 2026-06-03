'use client'

import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { useResume } from '@/components/resume/resume-provider'

export default function ResumePage() {
  const { resumeData, resumeMeta, isResumeReady } = useResume()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Resume Management</h1>
        <p className="text-muted-foreground">Manage your stored resume.</p>
      </div>

      <ResumeDropzone source="dashboard" />

      {isResumeReady && (
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm"><strong>File:</strong> {resumeMeta?.fileName}</p>
          <p className="text-sm"><strong>Name:</strong> {resumeData?.name || 'N/A'}</p>
          <p className="text-sm"><strong>Skills:</strong> {resumeData?.skills?.join(', ') || 'N/A'}</p>
        </div>
      )}
    </div>
  )
}
