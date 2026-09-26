import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Clock, 
  Calendar, 
  ArrowRight,
  Mic,
  History as HistoryIcon
} from 'lucide-react'

import { MacTrafficLights } from '@/components/ui/terminal-card'
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

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-[#818cf8] uppercase tracking-[0.15em] mb-1 font-semibold">// SESSIONS ARCHIVE</p>
          <h1 className="font-display text-[32px] font-bold text-white leading-[1.1] tracking-[-0.02em]">Interview History</h1>
          <p className="font-body text-[14px] text-[#9ca3af] mt-1">
            Review your past interviews and track your progress over time.
          </p>
        </div>
        <Link 
          href="/interview/new" 
          className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-2.5 rounded-[6px]"
        >
          <Mic className="h-4 w-4" />
          New Interview
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
        <div className="rounded-xl border border-[#1e2030] bg-[#09090f] p-16 text-center">
          <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-[#64748b]" />
          <p className="font-mono text-[12px] text-[#64748b] uppercase tracking-[0.05em]">// NO SESSIONS FOUND</p>
          <p className="font-body text-[14px] text-[#9ca3af] mt-2 mb-6">
            Start your first practice interview to begin tracking your progress.
          </p>
          <Link 
            href="/interview/new" 
            className="inline-flex items-center gap-2 btn-neo-violet font-mono text-[12px] font-bold uppercase tracking-[0.05em] px-6 py-3 rounded-[6px]"
          >
            Start Your First Interview
          </Link>
        </div>
      )}
    </div>
  )
}
