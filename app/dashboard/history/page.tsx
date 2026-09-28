import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Clock, 
  Calendar, 
  ArrowRight, 
  Mic, 
  History as HistoryIcon,
  ChevronLeft
} from 'lucide-react'
import { HistorySessionCard } from '@/components/history/history-session-card'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: interviews } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1300px] mx-auto space-y-8 pb-32 sm:pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-[#2447FF] uppercase tracking-widest font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2447FF]" />
            <span>[ARCHIVE // 06] SESSION TIMELINE</span>
          </div>
          <h1 className="font-display text-[32px] sm:text-[40px] font-bold text-[#F4F2EC] leading-[1.05] tracking-[-0.03em]">
            Interview History
          </h1>
          <p className="font-body text-[14px] sm:text-[15px] text-[#8C8C88] mt-2">
            Chronological log of diagnostic scores, weaknesses, and performance evaluations.
          </p>
        </div>
        <Link 
          href="/interview/new" 
          className="bg-[#2447FF] hover:bg-[#1f3ce0] text-white inline-flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-wider px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Mic className="h-4 w-4" />
          <span>Launch Simulation</span>
        </Link>
      </div>

      {interviews && interviews.length > 0 ? (
        <div className="grid gap-4">
          {interviews.map((interview, index) => (
            <HistorySessionCard
              key={interview.id}
              interview={interview}
              index={index}
              totalCount={interviews.length}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-16 text-center shadow-xl">
          <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-[#8C8C88]" />
          <span className="font-mono text-[11px] text-[#8C8C88] uppercase tracking-widest block mb-2">// NO SESSIONS LOGGED</span>
          <p className="font-body text-[15px] text-[#8C8C88] mt-2 mb-6 max-w-md mx-auto">
            You haven&apos;t completed any mock interview runs yet. Start your first session to calibrate your readiness score.
          </p>
          <Link 
            href="/interview/new" 
            className="bg-[#2447FF] hover:bg-[#1f3ce0] text-white inline-flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md cursor-pointer"
          >
            Start Your First Interview
          </Link>
        </div>
      )}
    </div>
  )
}
