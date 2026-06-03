import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InterviewSetup } from '@/components/interview/interview-setup'

export default async function NewInterviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Start New Interview</h1>
        <p className="text-muted-foreground">
          Configure your practice session and begin your AI-powered interview.
        </p>
      </div>
      <InterviewSetup profile={profile} />
    </div>
  )
}
