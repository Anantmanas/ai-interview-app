'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, InterviewType, Difficulty } from '@/lib/types'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { useResume } from '@/components/resume/resume-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'

interface InterviewSetupProps {
  profile: Profile | null
}

export function InterviewSetup({ profile }: InterviewSetupProps) {
  const router = useRouter()
  const { isResumeReady } = useResume()
  const [type, setType] = useState<InterviewType>('technical')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStartInterview = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: interview, error } = await supabase
        .from('interviews')
        .insert({
          user_id: profile?.id,
          title: title || 'Interview Session',
          type,
          difficulty,
          status: 'in_progress',
        })
        .select()
        .single()

      if (error) throw error
      router.push(`/interview/${interview.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!isResumeReady && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume (Recommended)</CardTitle>
            <CardDescription>Interview uses this for personalization.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResumeDropzone source="interview-setup" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Session Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Interview title" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={type} onValueChange={(v) => setType(v as InterviewType)}>
            <Label className="flex items-center gap-2"><RadioGroupItem value="technical" id="technical" />Technical</Label>
            <Label className="flex items-center gap-2"><RadioGroupItem value="behavioral" id="behavioral" />Behavioral</Label>
            <Label className="flex items-center gap-2"><RadioGroupItem value="system_design" id="system_design" />System Design</Label>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Difficulty</CardTitle></CardHeader>
        <CardContent>
          <RadioGroup value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
            <Label className="flex items-center gap-2"><RadioGroupItem value="easy" id="easy" />Easy</Label>
            <Label className="flex items-center gap-2"><RadioGroupItem value="medium" id="medium" />Medium</Label>
            <Label className="flex items-center gap-2"><RadioGroupItem value="hard" id="hard" />Hard</Label>
          </RadioGroup>
        </CardContent>
      </Card>

      <Button onClick={handleStartInterview} disabled={loading} className="w-full">
        {loading ? 'Starting...' : 'Start Interview'}
      </Button>
    </div>
  )
}
