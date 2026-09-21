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
    <div className="h-screen bg-[#000000] text-[#f8fafc] flex flex-col font-sans relative overflow-hidden">
      {/* ── Ambient Glow Atmosphere ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-[#4f46e5] opacity-[0.09] blur-[140px]" />
        <div className="absolute top-1/2 -right-40 h-[500px] w-[500px] rounded-full bg-[#6366f1] opacity-[0.06] blur-[120px]" />
        <div className="dot-grid absolute inset-0 opacity-[0.3]" />
      </div>

      {/* Cockpit Top Header */}
      <header className="h-12 shrink-0 border-b border-[#1e1e2f] bg-[#000000]/90 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6366f1] led-pulse" />
            <span className="font-mono text-xs font-bold tracking-wider text-[#ffffff]">
              INTERVIEW_AI
            </span>
          </div>
          <div className="h-3.5 w-[1px] bg-[#1e1e2f]" />
          <span className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-wider">
            SESSION_CONFIGURATION
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-[#818cf8] bg-[#14142b] border border-[#3730a3] rounded-full px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] led-pulse" />
          <span>COCKPIT READY</span>
        </div>
      </header>

      {/* Electric Indigo Terminal Accent Line */}
      <div className="h-[2px] w-full bg-[#000000] shrink-0">
        <div className="h-full bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#818cf8] w-full opacity-70" />
      </div>

      {/* Main Configuration Content - Smooth vertical scroll with ample bottom padding */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:py-12 pb-24 flex justify-center items-start relative z-10">
        <div className="w-full max-w-3xl">
          <InterviewSetup profile={profile} existingCount={existingCount ?? 0} />
        </div>
      </main>
    </div>
  )
}
