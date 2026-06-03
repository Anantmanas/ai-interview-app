'use client'

import { useRef } from 'react'
import { useResume } from '@/components/resume/resume-provider'
import { ResumeSummary } from './resume-summary'
import { Button } from '@/components/ui/button'
import { Upload, RefreshCw, AlertCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ResumeUploadCard() {
  const { isResumeReady, isExtracting, handleResumeUpload, extractionError } = useResume()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const onPickFile = async (file?: File) => {
    if (!file) return
    await handleResumeUpload(file, 'dashboard')
  }

  return (
    <div className="space-y-4">
      {isResumeReady ? (
        <div className="space-y-4">
          <ResumeSummary />
          <div className="flex items-center justify-end px-1">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={(e) => void onPickFile(e.target.files?.[0])}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs gap-2"
              onClick={() => inputRef.current?.click()}
              disabled={isExtracting}
            >
              {isExtracting ? (
                <Spinner className="h-3 w-3" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              {isExtracting ? 'Analyzing...' : 'Re-upload Resume'}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-primary/40 bg-primary/5">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <CardTitle>Enhance Your Experience</CardTitle>
            <CardDescription>
              Upload your resume to get personalized interview questions and roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            {extractionError && (
              <p className="text-destructive text-sm mb-4 flex items-center gap-2">
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
            <Button 
              onClick={() => inputRef.current?.click()}
              disabled={isExtracting}
              className="px-8"
            >
              {isExtracting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume
                </>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground mt-3">
              Supports PDF, DOCX, TXT (Max 5MB)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
