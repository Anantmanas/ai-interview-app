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
            <div
              key={interview.id}
              className="rounded-xl border border-[#1e2030] bg-[#09090f] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#3730a3] transition-all overflow-hidden"
            >
              {/* Apple Terminal Titlebar */}
              <div className="flex items-center justify-between px-4 h-9 border-b border-[#1e2030] bg-[#11121b]/90 select-none">
                <div className="flex items-center gap-2.5">
                  <MacTrafficLights size="sm" />
                  <span className="font-mono text-[10px] text-[#9ca3af] font-medium">
                    session-{String(interviews.length - index).padStart(2, '0')}.sh — bash
                  </span>
                </div>
                <div>
                  {interview.status === 'completed' ? (
                    <span className="font-mono text-[9px] text-[#818cf8] bg-[#14142b] border border-[#3730a3] rounded px-2 py-0.5 uppercase tracking-[0.05em]">
                      [COMPLETED]
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] text-[#9ca3af] bg-[#09090e] border border-[#1e1e2f] rounded px-2 py-0.5 uppercase tracking-[0.05em]">
                      [IN_PROGRESS]
                    </span>
                  )}
                </div>
              </div>

              {/* Terminal Content Body */}
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[12px] font-bold text-[#64748b]">
                        {String(interviews.length - index).padStart(2, '0')}
                      </span>
                      <h3 className="font-display font-semibold text-[16px] text-white hover:text-[#818cf8] transition-colors">
                        {interview.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[12px] font-mono text-[#9ca3af]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#64748b]" />
                        {new Date(interview.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#64748b]" />
                        {formatDuration(interview.duration_seconds)}
                      </span>
                      <span>•</span>
                      <span className="bg-[#14142b] border border-[#1e1e2f] rounded px-2 py-0.5 uppercase text-[10px] text-[#818cf8]">
                        {interview.type.replace('_', ' ')}
                      </span>
                      <span className="bg-[#14142b] border border-[#1e1e2f] rounded px-2 py-0.5 uppercase text-[10px] text-[#9ca3af]">
                        {interview.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {interview.overall_score !== null && interview.overall_score > 0 ? (
                        <>
                          <div className="font-display text-[26px] font-bold bg-gradient-to-r from-[#6366f1] to-[#818cf8] bg-clip-text text-transparent leading-none">
                            {interview.overall_score}%
                          </div>
                          <div className="font-mono text-[10px] text-[#64748b] uppercase mt-0.5">Score</div>
                        </>
                      ) : interview.status === 'completed' ? (
                        <span className="font-mono text-[11px] text-[#64748b] bg-[#0f0f18] border border-[#1e1e2f] rounded-[2px] px-2 py-0.5">
                          — PENDING
                        </span>
                      ) : null}
                    </div>
                    <Link 
                      href={interview.status === 'completed' ? `/dashboard/history/${interview.id}` : `/interview/${interview.id}`}
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-[#818cf8] hover:text-white transition-colors bg-[#14142b] border border-[#3730a3]/60 hover:border-[#4f46e5] px-4 py-2.5 rounded-lg"
                    >
                      {interview.status === 'completed' ? 'View Results' : 'Resume Session'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
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
