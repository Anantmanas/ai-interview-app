'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ResumeDropzone } from '@/components/resume/resume-dropzone'
import { useResume } from '@/components/resume/resume-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function QuestionsPage() {
  const router = useRouter()
  const { isResumeReady } = useResume()
  const [targetRole, setTargetRole] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFinish = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({ target_role: targetRole || null }).eq('id', user.id)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 border rounded-xl p-6">
        <h1 className="text-xl font-semibold">Onboarding</h1>
        <ResumeDropzone source="onboarding" />
        <p className="text-sm text-muted-foreground">Resume status: {isResumeReady ? 'Ready' : 'Not uploaded'}</p>
        <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Target role" />
        <div className="flex justify-end">
          <Button onClick={handleFinish} disabled={loading}>{loading ? 'Saving...' : 'Complete Setup'}</Button>
        </div>
      </div>
    </div>
  )
}
