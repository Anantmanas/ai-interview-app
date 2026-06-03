import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ResumeUploadService } from '@/lib/resume/upload-service'

export async function POST(req: Request) {
  try {
    const { resumeUrl, force } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!resumeUrl) {
      return NextResponse.json({ error: 'Resume URL is required' }, { status: 400 })
    }

    const uploadService = new ResumeUploadService(supabase)
    const resume = await uploadService.processUploadedResume(user.id, { url: resumeUrl }, { force })

    return NextResponse.json({ success: true, resume, analysis: resume?.structuredData })
  } catch (error: any) {
    console.error('Resume analysis error:', error)
    return NextResponse.json({ error: error.message || 'Failed to analyze resume' }, { status: 500 })
  }
}
