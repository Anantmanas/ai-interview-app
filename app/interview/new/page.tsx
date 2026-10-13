import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InterviewSetup } from '@/components/interview/interview-setup'
import { MobileDeviceWarning } from '@/components/interview/mobile-device-warning'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

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
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-[#8052ff]/30 selection:text-white">
      <MobileDeviceWarning />

      {/* Subtle Ambient Electric Iris Glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-1/4 h-[550px] w-[550px] rounded-full bg-[#8052ff] opacity-[0.06] blur-[160px]" />
        <div className="cyber-grid absolute inset-0 opacity-[0.08]" />
      </div>

      {/* Editorial Header */}
      <header className="h-14 shrink-0 border-b border-white/10 bg-[#000000]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-3.5 py-1.5 rounded-full"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff] shadow-[0_0_8px_#8052ff]" />
            <span className="font-sans text-sm font-semibold tracking-tight text-white">
              Interview<span className="text-[#8052ff]">AI</span>
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            / CALIBRATION
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-white bg-white/[0.04] border border-white/10 rounded-full px-3.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15846e] shadow-[0_0_8px_#15846e]" />
          <span>SIMULATOR ACTIVE</span>
        </div>
      </header>

      {/* Main Configuration Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12 pb-24 flex justify-center items-start relative z-10 w-full">
        <div className="w-full max-w-[1100px] mx-auto">
          <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-zinc-500">INITIALIZING SIMULATION ENVIRONMENT...</div>}>
            <InterviewSetup profile={profile} existingCount={existingCount ?? 0} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
