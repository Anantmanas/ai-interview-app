import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { InterviewRoom } from '@/components/interview/interview-room'

interface InterviewPageProps {
  params: Promise<{ id: string }>
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: interview } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!interview) {
    notFound()
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <InterviewRoom 
      interview={interview} 
      profile={profile}
    />
  )
}
