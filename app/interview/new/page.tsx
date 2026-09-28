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
    <div className="min-h-screen bg-[#050505] text-[#F4F2EC] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#2447FF]/30 selection:text-white">
      <MobileDeviceWarning />

      {/* Editorial Header */}
      <header className="h-14 shrink-0 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl px-6 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 font-mono text-[11px] text-[#8C8C88] hover:text-white transition-colors bg-white/5 border border-white/10 px-3 py-1 rounded-lg"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2447FF]" />
            <span className="font-display text-sm font-bold tracking-tight text-[#F4F2EC]">
              Interview<span className="text-[#2447FF]">AI</span>
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#8C8C88] uppercase tracking-wider">
            / SIMULATION_CALIBRATION
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-white bg-white/5 border border-white/10 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2447FF]" />
          <span>SIMULATOR ACTIVE</span>
        </div>
      </header>

      {/* Main Configuration Content */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:py-12 pb-24 flex justify-center items-start relative z-10 w-full">
        <div className="w-full px-2 sm:px-6">
          <Suspense fallback={<div className="p-12 text-center font-mono text-xs text-[#8C8C88]">INITIALIZING SIMULATION ENVIRONMENT...</div>}>
            <InterviewSetup profile={profile} existingCount={existingCount ?? 0} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
