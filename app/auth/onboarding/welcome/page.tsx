'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { useResume } from '@/components/resume/resume-provider'

export default function OnboardingWelcomePage() {
  const { isResumeReady } = useResume()
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-xl border p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome to InterviewAI</h1>
          <p className="text-sm text-muted-foreground">Upload resume now or continue.</p>
        </div>

        <ResumeDropzone source="onboarding" />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push('/auth/onboarding/questions')}>Skip</Button>
          <Button onClick={() => router.push('/auth/onboarding/questions')}>
            {isResumeReady ? 'Continue' : 'Continue without resume'}
          </Button>
        </div>
      </div>
    </div>
  )
}

