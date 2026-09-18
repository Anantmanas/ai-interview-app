import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InterviewSetup } from '@/components/interview/interview-setup'

export default async function NewInterviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [{ data: profile }, { count: existingCount }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('interviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col select-none font-sans">
      {/* Cockpit Top Header */}
      <header className="h-12 shrink-0 border-b border-[#303236] bg-[#0A0A0B] px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34D59A]" />
            <span className="font-mono text-xs font-bold tracking-wider text-[#FFFFFF]">
              INTERVIEW_AI
            </span>
          </div>
          <div className="h-3.5 w-[1px] bg-[#303236]" />
          <span className="text-[11px] font-mono text-[#94979E] uppercase tracking-wider">
            SESSION_CONFIGURATION
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-[#34D59A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D59A]" />
          <span>COCKPIT READY</span>
        </div>
      </header>

      {/* 2px Terminal Accent Line */}
      <div className="h-[2px] w-full bg-[#151617]">
        <div className="h-full bg-[#34D59A] w-full opacity-60" />
      </div>

      {/* Main Configuration Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <InterviewSetup profile={profile} existingCount={existingCount ?? 0} />
        </div>
      </main>
    </div>
  )
}
